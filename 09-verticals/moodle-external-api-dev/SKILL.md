---
name: moodle-external-api-dev
title: Moodle 外部 API 开发
description: 当为 Moodle 插件开发自定义 Web 服务（REST/AJAX）以暴露课程、测验、用户数据时使用；按外部 API 框架产出 external_api 三方法类、services.php 注册与权限/事务校验；不适用于前端主题、核心补丁或非 Moodle LMS；触发词：Moodle、external_api、Web 服务、wsfunction
domain: 领域/edu
triggers: [Moodle 外部 API, external_api 三方法, Moodle Web 服务开发, services.php 注册函数, wsfunction REST 调用, execute_parameters/execute/execute_returns, Moodle 插件暴露接口]
tags: [moodle, php, external-api, web-service, lms, edu, rest, ajax]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [php-pro, laravel-app-specialist, rest-api-endpoint-builder, api-design-principles]
combines_with: [api-test-suite-builder, backend-security-coder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 为 Moodle 插件（`local_*` / `mod_*`）开发自定义 Web 服务，暴露课程、测验、用户跟踪或报表能力。
- 为移动 App / 外部系统提供 REST 或 AJAX 后端接口。
- 需要遵循 Moodle 外部 API 框架（external_api 三方法模式）与编码规范。

不该用的边界：
- 不用于前端主题（theme）、JS/CSS 改造、块（block）渲染等纯展示层。
- 不用于修改 Moodle 核心源码或打补丁；自定义能力应走插件而非改核心。
- 不用于非 Moodle 的 LMS；本技能依赖 Moodle 的 DML、capability、context 体系。
- 缺少插件路径、所需 capability、读写类型（read/write）等关键输入时，先澄清再动手。

## 步骤 / 指令

外部 API 类必须实现严格的三方法模式：`execute_parameters()` 定义入参结构、`execute()` 写业务逻辑、`execute_returns()` 定义返回结构。返回结构必须与 `execute()` 实际返回完全匹配。

1. 建类文件 `local/yourplugin/classes/external/your_api_name.php`：`namespace local_yourplugin\external;`，加 `defined('MOODLE_INTERNAL') || die();`，`require_once("$CFG->libdir/externallib.php");`，类 `extends external_api`。命名空间用 `local_pluginname\external` 或 `mod_modname\external`。
2. 写 `execute_parameters()`：用 `external_function_parameters`、`external_value`、`external_single_structure`（命名对象）、`external_multiple_structure`（数组）。常用类型 `PARAM_INT/PARAM_TEXT/PARAM_RAW/PARAM_BOOL/PARAM_FLOAT/PARAM_ALPHANUMEXT`；标志 `VALUE_REQUIRED/VALUE_OPTIONAL/VALUE_DEFAULT,默认值`。
3. 写 `execute()` 五步：①`self::validate_parameters(self::execute_parameters(), [...])` 校验入参；②`$context = \context_course::instance(...)` + `self::validate_context($context)`；③`require_capability('moodle/course:view', $context)`（跨用户访问再加 `viewhiddenactivities` 等）；④全部用占位符参数化 SQL（`:paramname`），优先 `$DB->get_records()/get_field_sql()` 等；⑤组装并返回结构化数据。
4. 写 `execute_returns()`：结构与返回值逐字段对齐，每字段写描述，允许嵌套。
5. 注册服务到 `local/yourplugin/db/services.php`：`$functions` 中键名形如 `local_yourplugin_your_api_name`，填 `classname`（全命名空间类名）、`methodname`（恒为 `'execute'`）、`classpath`、`type`（`read`=SELECT / `write`=增删改）、`ajax => true`、`capabilities`、可选 `services`（如 `MOODLE_OFFICIAL_MOBILE_SERVICE`）；`$services` 定义服务包含的函数集合。
6. 错误处理与日志：`execute()` 包 try-catch，分别捕获 `\invalid_parameter_exception`、`\moodle_exception`、`\Exception`，记录时间戳、消息、最后 SQL（`$DB->get_last_sql()`）、堆栈，记完后重新抛出。日志写 `$CFG->dataroot/local_yourplugin/`。
7. 改完 services.php 后必须清缓存：站点管理 > 开发 > 清除所有缓存（否则报 Function not found）。

进阶：写操作用 `$DB->start_delegated_transaction()` + `allow_commit()`，异常时 `$transaction->rollback($e)`；建课程模块用 `add_course_module()` + `xxx_add_instance()` + `course_add_cm_to_section()`，再回填 `instance`；按 group + availability JSON 做活动可见性限制。

## 示例

最简只读 API（统计某用户某课程测验提交数）核心：

```php
public static function execute($userid, $courseid) {
    global $DB;
    self::validate_parameters(self::execute_parameters(), [
        'userid' => $userid, 'courseid' => $courseid
    ]);
    $sql = "SELECT COUNT(*) AS quiz_attempts
            FROM {quiz_attempts} qa
            JOIN {quiz} q ON qa.quiz = q.id
            WHERE qa.userid = :userid AND q.course = :courseid";
    $attempts = $DB->get_field_sql($sql, ['userid' => $userid, 'courseid' => $courseid]);
    return ['quiz_attempts' => (int)$attempts];
}
public static function execute_returns() {
    return new external_single_structure([
        'quiz_attempts' => new external_value(PARAM_INT, 'Total number of quiz attempts')
    ]);
}
```

curl 测试（先取 token 再调用）：

```bash
curl -X POST "https://yourmoodle.com/login/token.php" \
  -d "username=admin" -d "password=yourpassword" -d "service=moodle_mobile_app"

curl -X POST "https://yourmoodle.com/webservice/rest/server.php" \
  -d "wstoken=YOUR_TOKEN" \
  -d "wsfunction=local_yourplugin_your_api_name" \
  -d "moodlewsrestformat=json" \
  -d "userid=2" -d "courseid=3"
```

AJAX 调用：`require(['core/ajax'], ...)` → `ajax.call([{methodname, args}])`，`.done()/.fail()` 处理。

## 注意事项

- 永远先 `validate_parameters()`、再 `validate_context()`、再 `require_capability()`，顺序不可省。
- 杜绝 SQL 注入：只用占位符，绝不拼接用户输入；改完服务必清缓存。
- 「Invalid parameter value」多因定义与实际类型/必选项/嵌套结构不一致。
- 事务要短，避免嵌套与死锁；写操作务必有提交或回滚。
- 遵循 Moodle 命名规范（小写 + 下划线），每个参数与返回字段都写描述。
- 常用表速查：`{user}` `{course}` `{course_modules}` `{modules}` `{quiz}` `{quiz_attempts}` `{question}` `{question_categories}` `{grade_items}` `{grade_grades}` `{groups}` `{groups_members}` `{logstore_standard_log}`。
- 调试清单：开 debug 模式、查 Web 服务日志（站点管理 > 报告 > 日志）、看自定义日志、`$DB->set_debug(true)`、用 admin 排除权限问题、清浏览器与 Moodle 缓存、查 PHP 错误日志。
- 本技能仅适配 Moodle 外部 API 场景，产出需在目标环境实测，不能替代专家评审与安全验证。

## 互见

- 官方文档：Moodle External API（functions / subsystems）、Database API（DML）、Coding Style — moodledev.io。
- 领域内可配合：插件 `version.php` / `db/access.php`（capability 定义）/ `lang` 语言串 / `tests/external_test.php` 单测。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
