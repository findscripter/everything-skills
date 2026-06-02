---
name: semgrep-rule-creator
title: Semgrep 自定义规则编写
description: 当需要为特定漏洞或代码模式编写并测试 Semgrep 自定义规则时使用；产出含规则 YAML 与测试用例（ruleid/ok 注解）的成对文件并跑通 semgrep --test；不适用于运行现成规则集或无需自定义规则的通用静态分析；触发词：semgrep、自定义规则、taint mode、污点分析、静态分析规则、SAST、custom semgrep rule
domain: 安全/appsec
triggers: [semgrep, 自定义规则, taint mode, 污点分析, 静态分析规则, SAST, custom semgrep rule, semgrep rule]
tags: [security, appsec, semgrep, sast, static-analysis, taint-analysis, code-pattern]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [semgrep, WebFetch, Bash, Read, Write, Edit, Glob, Grep]
requires: []
related: [sast-configurator, codeql-scanner, vulnerability-variant-analysis, security-antipattern-hook]
combines_with: [sast-configurator, vulnerability-variant-analysis, false-positive-check]
license: CC-BY-SA-4.0
source: trailofbits/skills
source_license: CC-BY-SA-4.0
---
## 何时使用

适合：为具体 bug 模式编写 Semgrep 规则；检测代码库中的安全漏洞；为数据流类漏洞（注入、XSS、命令执行等）编写污点（taint）规则；用规则强制编码规范。

不该用（负边界）：
- 只是运行现成的 Semgrep 规则集 —— 不需要本技能。
- 不写自定义规则的通用静态分析 —— 改用通用静态分析工具/技能。

本工作流是「严格」流程，不可跳步：先读文档、测试先行、必须 100% 测试通过、最后才做优化。

## 步骤

固定 7 步，逐步推进并勾选：

1. 分析问题：先用 WebFetch 读完下方「指令」中的 7 份官方文档；用「讲给初级开发」的方式说清要检测的漏洞/模式；确定目标语言；选定方法。
2. 先写测试：在以 rule-id 命名的目录下创建测试文件，只用 `# ruleid:`（必须命中）和 `# ok:`（必须不命中）两种注解。
3. 分析 AST：`semgrep --dump-ast --lang <language> <rule-id>.<ext>`，看清 Semgrep 实际如何解析代码，避免因树结构差异导致模式失效。
4. 编写规则：选择合适的 pattern 算子写规则；先 `semgrep --validate --config <rule-id>.yaml` 校验 YAML。
5. 迭代到全绿：每次改动后跑 `semgrep --test --config <rule-id>.yaml <rule-id>.<ext>`，直到输出 "All tests passed"，既无漏报也无误报。污点规则用 `--dataflow-traces` 调试。
6. 优化规则：测试全通过后再去冗余（引号变体、被 `...` 覆盖的子集、可用 metavariable-regex 合并的重复项），每次优化后必须重跑测试，失败就回退该优化。
7. 最终运行：`semgrep --config <rule-id>.yaml <rule-id>.<ext>`，确认 message 简洁达意、不残留未插值的元变量（如 $VAR）。

方法选择：
- 优先污点模式（mode: taint）：不可信输入流向危险 sink 的数据流问题。它跟踪数据流而非仅匹配语法，能显著降低注入类误报。
- 模式匹配（pattern）：无数据流需求的简单语法模式。

二者可互相切换试验：taint 不传播/误报多就退回 pattern；pattern 在安全用例上误报多就改试 taint。目标是规则可用，而非死守一种方法。

输出结构 —— 目录以 rule-id 命名，恰好两个文件：
```
<rule-id>/
├── <rule-id>.yaml     # Semgrep 规则
└── <rule-id>.<ext>    # 带 ruleid/ok 注解的测试文件
```

## 指令

编写前必须用 WebFetch 读完以下 7 份文档（raw 链接）：
1. Rule Syntax：https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/rule-syntax.md
2. Pattern Syntax：https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/pattern-syntax.mdx
3. Testing Rules：https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/testing-rules.md
4. Taint analysis：https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/data-flow/taint-mode/overview.md
5. Advanced taint：https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/data-flow/taint-mode/advanced.md
6. Constant propagation：https://raw.githubusercontent.com/semgrep/semgrep-docs/refs/heads/main/docs/writing-rules/data-flow/constant-propagation.md
7. Trail of Bits Testing Handbook（Semgrep 章）：https://raw.githubusercontent.com/trailofbits/testing-handbook/refs/heads/main/content/docs/static-analysis/semgrep/10-advanced.md

常用命令：
```bash
semgrep --test --config <rule-id>.yaml <rule-id>.<ext>            # 跑测试
semgrep --validate --config <rule-id>.yaml                        # 校验 YAML
semgrep --dataflow-traces --config <rule-id>.yaml <rule-id>.<ext> # 污点数据流追踪
semgrep --dump-ast --lang <language> <rule-id>.<ext>             # 查看 AST
semgrep --lang <language> --pattern <pattern> <rule-id>.<ext>     # 单模式试跑
```

关键约束（必须遵守）：
- 测试先行，绝不写无测试的规则；"大部分通过" 不可接受，必须 100% 通过。
- 模式要具体，避免 `pattern: $X` 之类过宽匹配；禁止用 `languages: generic` 做语言专属规则。
- 一个 YAML 只放一条规则，不要合并多条。
- 测试注解只允许 `ruleid:` 和 `ok:`，且必须独占一行、紧贴目标代码的上一行，行内不得有其他文字；禁止用多行注释（如 `/* ruleid: ... */`）承载注解；禁止 `todook`/`todoruleid`。
- 元变量必须大写（`$X`、`$FUNC`），`$_` 匿名、`$...VAR` 匹配零或多个参数。
- severity 用 LOW/MEDIUM/HIGH/CRITICAL（ERROR/WARNING/INFO 为旧式）。
- 优化放最后，先正确后简化，避免过早优化引入回归。

要拒绝的常见借口：「模式看起来完整了」仍要 `--test`；「命中了漏洞用例」还要确认安全用例不命中；「taint 太重」——只要输入流到危险 sink，taint 精度更高；「一个测试够了」——要覆盖不同写法、已净化输入、安全替代与边界；「AST 太复杂」——AST 正揭示 Semgrep 如何看代码，跳过会漏掉语法变体。

## 示例

反例 vs 正例（模式过宽）：
```yaml
# BAD: 匹配任意函数调用
pattern: $FUNC(...)
# GOOD: 指向危险函数
pattern: eval(...)
```

污点模式规则 + 测试：
```yaml
rules:
  - id: insecure-eval
    languages: [python]
    severity: HIGH
    message: User input passed to eval() allows code execution
    mode: taint
    pattern-sources:
      - pattern: request.args.get(...)
    pattern-sinks:
      - pattern: eval(...)
    pattern-sanitizers:        # 可选
      - pattern: sanitize(...)
```
测试文件 `insecure-eval.py`（注解须紧贴下一行代码）：
```python
# ruleid: insecure-eval
eval(request.args.get('code'))

# ok: insecure-eval
eval("print('safe')")

# ok: insecure-eval
eval(sanitize(request.args.get('code')))
```
跑测试（在规则目录内）：`semgrep --test --config insecure-eval.yaml insecure-eval.py`，期望输出 `1/1: ✓ All tests passed`。

优化示例（用 metavariable-regex 合并）：
```yaml
patterns:
  - pattern: $FUNC($X)
  - metavariable-regex:
      metavariable: $FUNC
      regex: ^(md5|sha1|sha256)$
```

## 注意事项

- 排错思路：漏命中多半模式过细或缺变体，加 `pattern-either`；误命中多半模式过宽，加 `pattern-not`/`pattern-inside` 收窄；命中行不对调 `focus-metavariable`；taint 不传播查 sanitizer 是否过宽并用 `--dataflow-traces` 看路径；taint 误报补 sanitizer。
- 用类型化元变量收紧匹配（如 C/C++ `(int $X)`、Go `($R : *zip.Reader).Open(...)`、TS `($X: DomSanitizer).sanitize(...)`）可显著降误报。
- Semgrep 视若等价：引号风格归一、`func(...)` 覆盖零或多参、尾部 `...` 可省 —— 优化去冗余时据此判断，但去掉后务必重跑测试，某些看似冗余的模式因 AST 差异实为必需。
- 最终 message 要简洁说明命中模式，且不能残留未被模式捕获、无法插值的元变量。

## 互见

- code-reviewer：自定义 Semgrep 规则可作为代码评审中安全检查的自动化补充。
- dependency-auditor：与依赖安全审计配合，覆盖源码层与依赖层两类风险。

---
本条采编自 trailofbits/skills（CC-BY-SA-4.0）。
