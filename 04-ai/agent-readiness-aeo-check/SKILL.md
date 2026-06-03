---
name: agent-readiness-aeo-check
title: 工具 Agent 就绪度 AEO 评分
description: 当要把某个 MCP 服务器/API/CLI 工具纳入 Agent 工作流前，需要量化其"Agent 就绪度"、横向比较同类工具或在某品类里挑最优时使用；做接入 Clarvia AEO（Agent Experience Optimization）评分服务，对工具按 API 可达性、数据结构化、Agent 兼容性、信任信号四维打 0-100 分并给出分档解读、排行榜与对比建议，产出选型决策与可选 CI 质量门禁；不适用于工具的功能/安全/性能实测，也不替代环境内真实联调与专家复核。触发词：AEO 评分、Agent 就绪度、MCP 选型、工具对比、Clarvia
domain: 智能/eval
triggers: [给 MCP 服务器/API/CLI 打 Agent 就绪度分, 把工具加进 Agent 工作流前先评估, AEO / Agent Experience Optimization 评分, 同类工具横向对比哪个更适合 Agent, 在某品类里找评分最高的 MCP 服务器, Clarvia / clarvia-mcp-server / aeo_score / get_score_breakdown, CI 里设工具质量门禁 fail-under, 工具选型决策]
tags: [智能, aeo, agent就绪度, mcp选型, 工具质量, 工具评分, clarvia, agent-readiness, tool-quality]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [clarvia-mcp-server (MCP), aeo_score, get_score_breakdown, clarvia-project/clarvia-action (CI)]
requires: []
related: [agent-tool-design, agent-tool-builder, coding-agent-headtohead-eval, agent-architecture-audit]
combines_with: [agent-workflow-pattern-designer, ai-engineering-toolkit]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 准备把某个 MCP 服务器 / API / CLI 接入 Agent 工作流，上线前想量化它的"Agent 就绪度"。
- 同一任务有两三个候选工具，需横向对比谁更适合 Agent 调用。
- 在某品类（数据库、鉴权、抓取等）里想直接捞出评分最高的若干选项。
- 构建会"动态选工具"的 Agent，需要一个可机读的就绪度信号做路由依据。
- 想在 CI 里加一道"工具质量门禁"，低于阈值就拦下。

不该用（负边界）：
- 不做工具的**功能/安全/性能实测**——AEO 是元数据与接口形态评分，不替代真实联调、用例验证或渗透测试。
- 不要把分数当工具"好不好用"的唯一裁决；分高仅代表 Agent 友好度高。
- 缺少待评工具的 URL/名称、或无法接入 Clarvia MCP 时，先补齐再用。

## 步骤

1. 接入 Clarvia MCP 服务器（见「指令」）。
2. 选动作：
   - **单工具打分**：给 URL 或名称，让其返回 0-100 AEO 分 + 四维拆解。
   - **品类检索**：按品类拉排名榜，发现你没考虑过的替代品。
   - **头对头对比**：两个工具并排出分 + 推荐结论。
   - **看排行榜**：取某能力的 Top N。
3. 读分档（见「示例」表）决定是否采用；分偏低时用 `get_score_breakdown` 看是哪一维拖后腿，再判断该维度对你的场景是否要紧。
4. （可选）把评分接进 CI 作质量门禁。

四个 AEO 维度：API 可达性、数据结构化、Agent 兼容性、信任信号。

## 指令

接入 Clarvia MCP 服务器（写入助手的 MCP 配置）：

```json
{
  "mcpServers": {
    "clarvia": {
      "command": "npx",
      "args": ["-y", "clarvia-mcp-server"]
    }
  }
}
```

调用方式（自然语言驱动对应工具）：

```
# 单工具打分（aeo_score）
Score https://github.com/example/my-mcp-server for agent-readiness
# 品类检索排名
Find the top-rated database MCP servers using Clarvia
# 头对头对比
Compare supabase-mcp vs firebase-mcp using Clarvia
# 取排行榜 Top N
Show me the top 10 MCP servers for authentication using Clarvia
# 看弱项维度
get_score_breakdown <工具>
```

CI 质量门禁（GitHub Action，低于阈值则失败）：

```yaml
- uses: clarvia-project/clarvia-action@v1
  with:
    url: https://your-api.com
    fail-under: 70
```

## 示例

**装前先评**：

```
Before I add this MCP server to my config, score it:
https://github.com/example/new-tool
用 clarvia 的 aeo_score 打分，并告诉我它是否 agent-ready。
```

**品类选优**：

```
我需要一个网页抓取的 MCP 服务器。用 Clarvia 找评分最高的几个，并对比前三名。
```

**AEO 分档解读**：

| 分数 | 评级 | 含义 |
|---|---|---|
| 90-100 | Agent Native | 专为 Agent 使用而建 |
| 70-89 | Agent Friendly | 好用，仅有小缺口 |
| 50-69 | Agent Compatible | 能用，但需改进 |
| 30-49 | Agent Partial | 有明显限制 |
| 0-29 | Not Agent Ready | 不建议用于 Agent 工作流 |

## 注意事项

- 别给"知名工具"开绿灯——热门工具同样可能评分很差，照评不误。
- 生产级 Agent 流水线里，分数低于 50 的工具不要直接用，除非已弄清其限制。
- 长跑型工作流里采用前先评分；工具会迭代，**分数要定期复查**。
- 工具返回"not found"时，直接用 `aeo_score` 按 URL 现场打分（Clarvia 会按需评估）。
- 信任你的某工具却评分偏低时，用 `get_score_breakdown` 看弱在哪一维，再判断是否影响你的场景。
- 源中"15,400+ 已索引工具"等数字为 Clarvia 自报，引用前如有疑虑请以实测为准；本评分不替代环境内验证、测试与专家复核。

## 互见

- requires：无硬前置；具备 MCP 接入与工具选型基本概念即可。
- related：`mcp-builder` / `agent-tool-builder`（按 AEO 高分标准去建/改一个工具）、`agent-architecture-audit`（更深的 Agent 全栈诊断，AEO 偏选型前轻量筛查）。
- combines_with：`agent-workflow-pattern-designer` / `multi-agent-system-designer`（选型结论落回工作流设计）、`production-llm-app-builder`（上线前把质量门禁接进 CI）。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原条目 clarvia-aeo-check（author digitamaz）。
