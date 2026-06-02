---
name: agent-session-trace-audit
title: AI 编码代理会话审计（成本/失败/延迟）
description: 当需要复盘本地 AI 编码代理（Claude Code/Cursor/Gemini/Codex CLI 等）的会话为何慢、贵、浅、不稳，或为团队搭轻量 CI 健康门禁时使用；用 agenttrace 读取本地会话日志，产出成本/工具失败/延迟/异常/健康分的人读报告或 JSON 门禁结果，并支持两次尝试 diff 排查语义漂移；不适用于审计远端托管会话或上传私有日志到外部服务。触发词：会话审计、成本飙升、工具失败率、CI 健康门禁
domain: 智能/eval
triggers: [AI 编码会话为何慢/贵/浅/不稳, 复盘本地 agent 日志再重试, 搭 CI 会话健康门禁, 对比两次尝试找语义漂移, token/成本飙升排查, 工具失败与重试循环分析]
tags: [AI 编码, 可观测性, 成本追踪, 会话分析, CI 门禁, agenttrace]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [agenttrace, Claude Code, Cursor, Gemini CLI, Codex CLI]
requires: []
related: [coding-agent-headtohead-eval, llm-agent-benchmarking, langfuse-llm-observability, ai-engineering-toolkit]
combines_with: [cost-aware-llm-pipeline, autonomous-coding-agent-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用户问某次 AI 编码运行为何慢、贵、结果浅或不可靠，需要定位过程问题（token/成本飙升、工具失败、重试循环、延迟空档、异常、低健康分）。
- 重试一个失败或可疑任务前，先复盘本地 agent 日志。
- 为团队搭轻量 CI 健康门禁，守住 AI 辅助编码会话的底线。
- 对比两次尝试，排查改动路径、重试、成本模式的差异（语义漂移）。

不该用（负边界）：
- 不审计远端托管/生产 LLM 应用的链路追踪（那类需求转 langfuse / 通用可观测性）。
- 不上传私有会话日志到外部服务。
- 健康的 trace 指标不能证明最终代码正确——仍需跑测试、审 diff。

agenttrace 是 local-first 工具，读取本地会话日志，支持 Claude Code、Codex CLI、Gemini CLI、Aider、Cursor 导出、OpenCode、Qwen Code、Kimi，以及通用 JSON/JSONL trace。

## 步骤 / 指令

### 步骤 1：发现可用会话
优先用 PATH 上已安装的 `agenttrace`；若当前仓库就是 `luoyuctl/agenttrace`，改用 `go run ./cmd/agenttrace`。

```bash
agenttrace --doctor
agenttrace --overview
```

若未检测到会话：报告 `--doctor` 检查过的目录，并请用户提供导出的会话文件或日志目录。

### 步骤 2：产出人读审计报告
用户想要可阅读/可分享的简报时，输出 Markdown。

```bash
agenttrace --overview -f markdown -o agenttrace-overview.md
```

报告先列最高风险会话并说明为何重要：严重异常、反复工具失败、token/成本浪费、长延迟空档、低健康分、可疑的浅会话。

### 步骤 3：检查单个会话或目录
快速检查用最近一次会话；用户给了导出路径就传显式路径。

```bash
agenttrace --latest
agenttrace --latest -f json
agenttrace path/to/session-or-export.json
agenttrace --overview -d path/to/session-dir
```

### 步骤 4：语义敏感时对比尝试
token 与延迟看着健康，agent 也可能自信地走错实现路径。怀疑语义漂移时，把 trace 审计与「对上一次 / 已知良好尝试的 diff」配对看。

关注：
- 偏离目标任务的改动文件或命令
- 相比参照尝试缺失的测试或验证步骤
- 同一批文件无明确理由地反复编辑
- 因跳过必要探索而来的「更低成本」

### 步骤 5：加自动化门禁
CI 或可复用团队流程中，用 JSON 输出或健康阈值。

```bash
agenttrace --overview -f json -o agenttrace-overview.json
agenttrace --overview --fail-under-health 80 --fail-on-critical --max-tool-fail-rate 15
```

阈值按项目调：关键流程用严格门禁；团队还在摸基线时，仅报告（不卡门）更合适。

## 示例

### 本地快速复盘
```bash
agenttrace --overview
agenttrace --latest
```
长时间 agent 运行后，用它决定下一个 prompt 该拆分任务、绕开失败的工具路径、补缺失测试，还是重置上下文。

### CI 健康检查
```bash
agenttrace --overview --fail-under-health 80 --fail-on-critical
```
CI 中已有 agent 会话日志、团队想要一道防严重异常/不健康运行的简单守卫时用。

## 注意事项

最佳实践：
- 会话发现不确定时，先 `--doctor`。
- 缺字段就如实报告，不要编造成本、模型、延迟、健康数据。
- 把 prompt、代码、会话内容当作私有本地数据。
- 自动化优先 JSON，人读优先 Markdown。
- 过程失败看 trace 指标，语义漂移靠 diff / 参照审查。

局限：
- 只能分析本地存在或作为导出提供的日志。
- 部分 agent 暴露字段不足，无法推断成本、模型、缓存使用或延迟。
- trace 指标健康 ≠ 代码正确，仍需测试 + 审 diff。
- CI 门禁初期应设为「建议性」，团队理解正常基线后再收紧。

安全：
- 未经用户明确同意，不要把私有会话日志上传到外部服务。
- 非用户指定的精确输出路径，不要覆盖其报告文件。
- 不要打印 prompt、工具输出、环境变量或日志中发现的密钥。

常见坑：
- 找不到会话 → 跑 `agenttrace --doctor`，再把 agenttrace 指向导出文件或日志目录。
- 运行看着又快又便宜，却产出了错误的重构 → 对比上一次尝试或已知良好 diff；仅看成本指标会漏掉语义漂移。
- 加了健康门禁后 CI 频繁失败 → 先用 JSON/Markdown 仅报告，观察正常基线，再逐步收紧阈值。

## 互见
- langfuse：生产级 LLM 应用链路追踪与评估。
- 可观测性工程（observability-engineer）：更广的服务监控、SLO 与事件响应流程。

---
采编自 sickn33/antigravity-awesome-skills（上游工具 luoyuctl/agenttrace，MIT 许可）。
