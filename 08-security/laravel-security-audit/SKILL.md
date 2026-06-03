---
name: laravel-security-audit
title: Laravel 安全审计
description: 当需要对 Laravel 10/11+ 应用做安全审计、排查漏洞与配置风险时使用；以攻击者视角逐项审查输入校验、鉴权、认证、数据库、文件上传、API、XSS、部署配置，按 Critical/High/Medium/Low/Informational 分级，产出含漏洞清单、利用场景与 Laravel 原生修复方案的报告；不适用于非 Laravel 项目、纯功能实现或纯架构（非安全）问题。触发词：Laravel 安全审计、漏洞排查、OWASP
domain: 安全/audit
triggers: [Laravel 安全审计, Laravel 漏洞排查, 审查鉴权/授权逻辑, 检查文件上传安全, API 限流与越权, IDOR / 批量赋值, APP_DEBUG / .env 暴露, OWASP Laravel]
tags: [安全, laravel, php, 代码审计, owasp, 漏洞, 鉴权, web 安全]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob]
requires: []
related: [backend-security-coder, api-security-best-practices, codeql-scanner, broken-authentication-testing]
combines_with: [php-pro, codeql-scanner, false-positive-check]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于对 **Laravel 10/11+** 应用做安全审计的场景：

- 审查代码中的漏洞、错误配置与不安全写法
- 审计认证 / 授权流程、API 安全、文件上传逻辑、请求处理、限流
- 评估 `.env` 暴露风险与部署安全姿态

**不该用（负边界）：**

- 项目不是 Laravel
- 用户只要功能实现，而非安全审查
- 纯架构问题（与安全无关）
- 与后端安全无关的请求

**心态：** 像攻击者一样思考，像安全工程师一样回应。不夸大严重性、不无中生有，按真实风险分级。

## 步骤

1. **建立威胁模型**：考虑未认证攻击者、低权限用户、提权、批量赋值、IDOR、CSRF/XSS、SQL 注入、文件上传滥用、API 滥用与限流绕过、会话劫持、中间件错配、调试信息泄露。
2. **逐项审查 8 大领域**（见下方指令清单）。
3. **风险分级**：每个问题标注 `Critical / High / Medium / Low / Informational`，不夸张。
4. **输出报告**：按固定结构组织（摘要 → 漏洞 → 风险等级 → 利用场景 → 修复建议 → 安全重构示例）。

## 指令

### 核心审查清单（8 大领域）

1. **输入校验**：是否全部校验？是否用 FormRequest？是否危险地用了 `request()->all()`？数组 / 嵌套输入是否校验、净化？
2. **授权**：是否用 Policy / Gate？控制器内是否检查授权？是否存在 IDOR（能访问他人资源）？admin 路由与中间件是否一致保护？
3. **认证**：密码哈希是否安全？API 响应是否泄露敏感字段？Sanctum/JWT 配置是否安全？token 存储是否安全？登出是否正确失效 token？
4. **数据库安全**：批量赋值是否防护？`$fillable`/`$guarded` 是否正确配置？是否存在不安全的原生查询、用户输入直拼？关键操作是否用事务？
5. **文件上传**：MIME 与扩展名校验？存储路径是否安全？是否误用 public disk？可执行文件上传风险？是否限制大小？
6. **API 安全**：是否启用限流、按用户 throttle？HTTP 状态码是否正确？敏感字段是否隐藏？分页上限是否强制？
7. **XSS 与输出转义**：Blade 是否用 `{{ }}` 而非 `{!! !!}`？API 响应是否净化？用户生成 HTML 是否过滤？
8. **配置与部署**：生产是否关闭 `APP_DEBUG`？`.env` 是否可经 Web 访问？storage 软链是否安全？CORS、可信代理（trusted proxies）是否配置？是否强制 HTTPS？

### 报告结构

```
1. 摘要 (Summary)
2. 已识别漏洞 (Identified Vulnerabilities)
3. 风险等级（每个问题）
4. 利用场景（如适用）
5. 修复建议
6. 安全重构示例（如需要）
```

### 行为约束

- 不臆造漏洞；未说明时不假设处于生产环境
- 不为小问题滥推重型外部安全包，优先 **Laravel 原生**缓解手段
- 务实、精确；不羞辱代码作者

## 示例

**Issue：缺少授权检查**
**Risk：High**

问题：控制器仅凭 ID 取模型，未校验归属。

利用：已认证用户改 ID 即可访问他人资源（IDOR）。

修复：使用 Policy 检查或带作用域的查询。

重构示例：

```php
$post = Post::where('user_id', auth()->id())
    ->findOrFail($id);
```

## 注意事项

- 仅当任务明确落在上述范围内时使用本技能。
- 审计结论不能替代针对具体环境的验证、测试与专家评审。
- 若缺少必要输入、权限、安全边界或成功标准，先停下并向用户澄清。
- 切勿一律标为 Critical；分级要贴合真实可利用性。

## 互见

- 同域其他安全审计 / OWASP 类技能
- Laravel 框架相关后端开发技能（功能实现场景请改用对应技能）

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
