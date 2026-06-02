---
name: php-pro
title: PHP 进阶开发
description: 当用 PHP 8+ 写高性能后端、处理大数据集或重构遗留 OOP 代码时使用；产出用生成器/迭代器/SPL 节省内存、强类型且 PSR 合规、含完善异常处理的惯用实现；不适用于其他语言、仅需基础 PHP 语法解释、或无法改动运行时与依赖配置的场景；触发词：生成器、SPL、PHP 8 枚举、严格类型、性能剖析
domain: 研发/backend
triggers: [PHP 8 开发, 生成器 yield, 迭代器, SPL 数据结构, match 表达式, 枚举 enum, 构造器属性提升, 联合类型, 严格类型 strict_types, 内存优化, PHP 性能剖析, PSR 规范, trait 复用, 魔术方法, 自定义异常]
tags: [php, 性能优化, 内存管理, 面向对象, 类型系统, spl, psr, 研发]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [php, composer, Xdebug, Blackfire, PHPStan, Psalm, PHP_CodeSniffer, PHPUnit, OPcache]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
---
name: php-pro
title: PHP 进阶开发
description: 当用 PHP 8+ 写高性能后端、处理大数据集或重构遗留 OOP 代码时使用；产出用生成器/迭代器/SPL 节省内存、强类型且 PSR 合规、含完善异常处理的惯用实现；不适用于其他语言、仅需基础 PHP 语法解释、或无法改动运行时与依赖配置的场景；触发词：生成器、SPL、PHP 8 枚举、严格类型、性能剖析
domain: 研发/misc
triggers: [PHP 8 开发, 生成器 yield, 迭代器, SPL 数据结构, match 表达式, 枚举 enum, 构造器属性提升, 联合类型, 严格类型 strict_types, 内存优化, PHP 性能剖析, PSR 规范, trait 复用, 魔术方法, 自定义异常]
tags: [php, 性能优化, 内存管理, 面向对象, 类型系统, spl, psr, 研发]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [php, composer, Xdebug, Blackfire, PHPStan, Psalm, PHP_CodeSniffer, PHPUnit, OPcache]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 PHP 8+ 构建高性能后端、API、CLI，或对既有 PHP 工程做架构/生产就绪评审。
- 处理大数据集时需用生成器/迭代器把内存占用压到最低。
- 用现代特性（match、枚举、attribute、构造器属性提升、联合/交集类型）重构遗留 OOP 代码。
- 排查内存、性能瓶颈，或补强类型覆盖与异常体系。

不该用（负边界）：
- 需要其他语言或运行时。
- 只需基础 PHP 语法解释。
- 无法改动 PHP 运行时、依赖或构建配置（优化与代码生成无从落地）。

## 步骤

1. 对齐前提：确认 PHP 版本（8.0/8.1/8.2+）、运行时、扩展（OPcache）与部署约束。
2. 优先内建：先用 PHP 标准库与内建函数，再考虑自己实现或引第三方包。
3. 选型：依据数据规模与访问模式选生成器 vs SPL 结构（`SplQueue`/`SplStack`/`SplHeap`/`ArrayObject`）。
4. 实现：开 `declare(strict_types=1)`，全量类型标注，异常处理显式，命名自解释。
5. 优化：先用 Xdebug/Blackfire 剖析定位热点，再针对性优化——不要凭直觉调。

## 指令

- 强类型先行：每个文件首行 `declare(strict_types=1)`，函数参数/返回值/属性全部标注类型，善用联合类型、`never`、`mixed`。
- 大数据用生成器：用 `yield` 流式处理，避免一次性把全集装进数组撑爆内存。
- 内建优先于第三方：能用标准库就别引依赖；外部依赖按需、克制。
- 错误用异常：抛自定义异常并设置正确的错误级别，不靠返回码兜底。
- 现代 OOP：构造器属性提升、`enum`、`match` 表达式、`readonly`、trait 复用、后期静态绑定，按需用 reflection。
- 遵守 PSR：编码风格 PSR-12，自动加载 PSR-4，命名空间规整。
- 关键工具：
  - 静态分析：`vendor/bin/phpstan analyse` / `vendor/bin/psalm`
  - 风格检查：`vendor/bin/phpcs` / `vendor/bin/phpcbf`（按 PSR-12）
  - 测试：`vendor/bin/phpunit`（覆盖边界与错误分支）
  - 性能剖析：Xdebug profiler 或 Blackfire 定位热点
  - 生产：开启 OPcache，接日志与监控钩子。

## 示例

用生成器流式读大文件，内存占用与文件大小解耦：

```php
<?php
declare(strict_types=1);

/** @return \Generator<int, string> */
function readLines(string $path): \Generator
{
    $fh = fopen($path, 'rb');
    if ($fh === false) {
        throw new \RuntimeException("无法打开文件: {$path}");
    }
    try {
        while (($line = fgets($fh)) !== false) {
            yield rtrim($line, "\r\n");   // 一次只驻留一行
        }
    } finally {
        fclose($fh);
    }
}

foreach (readLines('huge.log') as $line) {
    // 逐行处理，内存恒定
}
```

PHP 8 枚举 + match，替代魔法常量与 if-else 链：

```php
<?php
declare(strict_types=1);

enum Status: string
{
    case Active   = 'active';
    case Disabled = 'disabled';

    public function label(): string
    {
        return match ($this) {
            self::Active   => '已启用',
            self::Disabled => '已停用',
        };
    }
}
```

典型请求：
- "把这段加载全表的代码改成生成器，降低内存"
- "用 SPL 优先队列实现任务调度"
- "把这堆 if-else 状态判断重构成枚举 + match"
- "给这个模块补全类型标注并通过 PHPStan level max"
- "用 Blackfire 定位并优化这个接口的性能瓶颈"

## 注意事项

- 输出不能替代环境内的实测、测试与专家评审；落地前务必跑通 PHPUnit 与静态分析。
- 优化前先剖析（profile）后动手，任何性能改动都应有数据支撑。
- 注重安全：防注入、严格校验输入；专注可运行代码而非长篇解释。
- 输入、权限、安全边界或验收标准缺失时，先停下来澄清再动手。
- 仅在任务确实落在上述范围内时使用本技能。

## 互见

- 其他语言的现代工程实践技能（如 `golang-pro`）。
- 后端架构、API 设计与代码审查相关技能。
- 通用性能剖析与内存优化方法论。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
