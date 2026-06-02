---
name: security-antipattern-hook
title: 编码安全反模式拦截钩子
description: 当 AI Agent 在写代码/改文件（涉及鉴权、支付、用户输入、IaC）时使用；提供一个 PreToolUse 钩子，在 Edit/Write/MultiEdit 落盘前用子串匹配拦截 12 类安全反模式（命令注入、XSS、SQL 注入、不安全反序列化、eval/new Function 代码注入、GitHub Actions 工作流注入）并产出告警；不适用于 AST 级精确扫描或 CI 阶段的 SAST（用 semgrep/CodeQL）。触发词：安全钩子、拦截不安全代码、security hook、block unsafe code、command injection、SQL injection、eval/pickle/os.system
domain: 安全/appsec
triggers: [安全钩子, 拦截不安全代码, security hook, block unsafe code, command injection, SQL injection, eval/pickle/os.system, GitHub Actions 安全]
tags: [security, appsec, hook, static-analysis, command-injection, sql-injection, xss, deserialization]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Claude Code PreToolUse hook, Python stdlib, semgrep, CodeQL]
requires: []
related: [insecure-defaults-detector, backend-security-coder, sast-configurator, agent-skill-security-scanner]
combines_with: [sast-configurator, semgrep-rule-creator, backend-security-coder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 在 Claude Code 会话中编辑安全敏感代码（鉴权、支付、用户输入处理、IaC/工作流文件）时，想要一个"落盘前"的安全网，在 Edit/Write/MultiEdit 完成前拦截已知危险写法。
- 需要跨语言（JS/TS/Python/YAML 等）、零依赖、毫秒级的快速检测，宁可误报（一键忽略）也不漏报。

不该用边界：
- 不替代精确的 AST 级分析——子串匹配会对字符串字面量中的 `eval(` 等误报。需要更严的检测时，在 CI 阶段叠加 SAST（semgrep、CodeQL）。
- 不是 slash 命令；它是自动运行的钩子，不主动调用。
- 不要默认禁用（`ENABLE_SECURITY_REMINDER=0`）；只在已验证安全的特定操作上临时绕过。

## 步骤

1. 安装为 Claude Code 插件（自带 `hooks.json` 接线）：
   - `/plugin marketplace add alirezarezvani/claude-skills`
   - `/plugin install security-guidance@claude-code-skills`
2. 安装后无需配置，钩子在每次 Edit/Write/MultiEdit 前自动触发，把工具入参以 JSON 从 stdin 传给 `security_reminder_hook.py`。
3. 钩子提取 file_path + content，按模式表逐项匹配：路径侧检查 GitHub Actions 工作流的危险 `${{ }}`；内容侧对 11 个反模式做子串匹配。
4. 命中且本会话该 `文件+规则` 未告警过：把警告打到 stderr（Claude 可见）→ 退出码 2 拦截工具调用 → 把 `<file_path>-<rule_name>` 写入 `~/.claude/security_warnings_state_<session>.json`。
5. 命中但本会话已告警过：退出码 0 放行（Claude 已看过一次）。未命中：退出码 0 放行。

## 指令

检测的 12 类反模式（命中即告警/拦截）：

| 模式 | 类别 | 风险 |
|---|---|---|
| GitHub Actions 工作流 `${{ }}` 表达式 | 路径 | 工作流命令注入 |
| `child_process.exec` / `exec(` / `execSync(` | 子串 | Node.js 命令注入 |
| `new Function` | 子串 | JS 代码注入 |
| `eval(` | 子串 | JS 代码注入 |
| `dangerouslySetInnerHTML` | 子串 | React XSS |
| `document.write` | 子串 | DOM XSS |
| `.innerHTML =` | 子串 | DOM XSS |
| `pickle` | 子串 | Python 反序列化 RCE |
| `os.system` / `from os import system` | 子串 | Python 命令注入 |
| `shell=True`（subprocess） | 子串 | Python 命令注入 |
| f-string SQL 或 `.format` SQL | 子串 | SQL 注入 |
| `yaml.load(` / `yaml.unsafe_load` | 子串 | YAML 反序列化 RCE |

按会话临时禁用（慎用）：

```bash
ENABLE_SECURITY_REMINDER=0 claude
```

调试钩子误触发，看日志：

```bash
tail -f ~/.claude/security-warnings-log.txt
```

## 示例

某文件确需 `pickle` 或 `eval`（如沙箱 REPL、给 fuzzer 用的故意不安全解析器），在文件内用注释声明边界，本会话首次编辑仍会告警，确认后同会话后续编辑放行：

```python
# SAFETY: pickle is the required serialization format for this internal tool.
# This file does NOT accept untrusted input. See SECURITY.md for boundary analysis.
import pickle
```

## 注意事项

- 为何用子串而非 AST：更快（不解析文件）、跨语言、保守（误报一键忽略，漏报才危险）；覆盖 90%+ 场景，更严需求交给 SAST。
- 状态文件 `~/.claude/security_warnings_state_*.json` 是会话级缓存，存 `<file_path>-<rule_name>` 列表，约 10%/次调用概率清理 30 天前的文件，可随时手动删除，钩子会重建。
- 不要把"我已忽略过一次"的会话缓存当作长期安全策略——长期豁免请用文件内注释声明边界。
- 改模式表需做安全评审：添加模式人人可做，删除模式需评审（每条模式都对应真实 CVE 类别）。
- 默认禁用钩子等于训练自己忽视安全网，违背初衷。

## 互见

- `code-reviewer`：代码评审，可与本钩子的落盘前拦截互补。
- `dependency-auditor`：依赖安全审计，覆盖供应链侧风险。
- 上游配套（同源仓库）：red-team（对抗渗透）、threat-detection（威胁建模）、ai-security（提示注入等 AI 安全）、ship-gate（上线前审计）、skill-security-auditor（技能包安全扫描）。

---

本条采编自 alirezarezvani/claude-skills（MIT），原实现为 David Dworken 在 `alirezarezvani/aeo-box` 中的 MIT 许可代码。
