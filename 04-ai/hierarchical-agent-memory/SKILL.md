---
name: hierarchical-agent-memory
title: 分层智能体记忆：目录级上下文与省 Token
description: 当项目有 3+ 目录、智能体每轮都重读整个工程导致输入 token 暴涨时使用；做分层 CLAUDE.md 记忆体系搭建——根级全局上下文(~200 token)+ 子目录作用域上下文(~250 token/个)+ .memory 决策/模式/收件箱层，并配上下文路由与省 token 仪表盘；不适用于跨会话向量记忆/RAG 检索(转 agent-memory-systems)或单文件小项目。触发词：go ham、CLAUDE.md、分层记忆、目录级上下文、省 token、上下文路由、ham dashboard、ham savings
domain: 智能/agents
triggers: [go ham, ham, 分层记忆, hierarchical memory, CLAUDE.md, 目录级上下文, scoped memory, 省 token, reduce token, 上下文路由, context routing, ham dashboard, ham savings, ham audit, ham route, .memory, 智能体记忆分层, directory-scoped context]
tags: [智能体记忆, 上下文工程, CLAUDE.md, token 优化, 分层记忆, 上下文路由, 省成本, HAM, 目录级上下文]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [agent-memory-architecture, agent-memory-systems, self-improving-memory-agent, llm-conversation-memory]
combines_with: [context-compression, agents-md-maintainer, filesystem-context-offload]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 项目有 3+ 目录，智能体每轮都重读相同的大量文件，输入 token 居高不下，想砍掉重复读取成本。
- 想要「目录作用域」上下文，而非一份越堆越大的单体 CLAUDE.md。
- 想用仪表盘可视化 token 节省、会话历史与上下文健康度（缺失/陈旧/路由命中率）。
- 新项目立项，希望从第一天就有结构化的智能体记忆。

不该用：

- 单文件或两三个文件的小项目——分层开销大于收益，直接一份根 CLAUDE.md 即可。
- 需要跨会话语义记忆、向量检索 / RAG → 转 `agent-memory-systems`，HAM 只管「按目录给上下文小抄」，不做语义召回。
- 把它当真实计费器：token 估算是 ~4 字符=1 token 的近似，节省值是基于典型行为的估算，不等于账单。

核心心智：给每个目录一张小抄，让智能体读完根上下文就直接跳到相关子上下文，而不是每次重扫整个工程。

## 步骤

1. 搭骨架（"go ham"）：自动探测项目平台与成熟度，生成分层记忆结构：

   ```
   project/
   ├── CLAUDE.md              # 根上下文（~200 token，含路由表）
   ├── .memory/
   │   ├── decisions.md       # 架构决策记录（ADR）
   │   ├── patterns.md        # 可复用模式
   │   ├── inbox.md           # 待确认的推断项
   │   └── audit-log.md       # 审计历史
   └── src/
       ├── api/CLAUDE.md      # api/ 的作用域上下文
       ├── components/CLAUDE.md
       └── lib/CLAUDE.md
   ```

   同时把基线写入 `.memory/baseline.json`，供后续 savings 对比。

2. 配上下文路由：在根 CLAUDE.md 写一个路由小节，直接告诉智能体每个区域加载哪份子上下文：

   ```markdown
   ## Context Routing

   → api: src/api/CLAUDE.md
   → components: src/components/CLAUDE.md
   → lib: src/lib/CLAUDE.md
   ```

   智能体读完根上下文 → 立刻按路由加载对应子目录上下文，不靠猜。新增目录后用 `ham route` 刷新路由表。

3. 看收益（"ham savings"）：输出 HAM 开/关的每轮 token 与成本对比、按月推算的节省额。

4. 起仪表盘（"ham dashboard"，可选）：在 localhost:7777 起 Web 面板，看 token 节省、每日趋势、按目录的会话拆分、上下文文件健康度、路由命中率、碳/能耗估算。需 Node.js 18+，读 `~/.claude/projects/` 的会话数据。

5. 定期治理：每两周跑 `ham audit` 抓陈旧 / 缺失的上下文文件；周期性 review `.memory/inbox.md`，确认或否决推断项；`ham insights` 从会话数据生成可执行建议。

## 指令

命令速查：

| 触发 | 作用 |
|---|---|
| `go ham` | 搭建 HAM——探测平台、生成各级 CLAUDE.md |
| `ham savings` | 输出 token 与成本节省报告 |
| `ham dashboard` | 起交互式 Web 仪表盘 |
| `ham audit` | 上下文文件健康检查 |
| `ham insights` | 从会话数据生成可执行洞察 |
| `ham route` | 在根 CLAUDE.md 增改 Context Routing |
| `ham carbon` | 能耗与碳效率数据 |

硬约束（落地红线）：

- 根 CLAUDE.md 控制在 60 行 / 250 token 以内。
- 每个子目录 CLAUDE.md 控制在 75 行以内。
- 子目录 CLAUDE.md 内容不会自动更新——靠你手动维护或 `ham audit` 提醒。
- 路由检测依赖会话 JSONL 里 CLAUDE.md 的读取顺序；token 估算是近似而非真实分词器。

## 示例

首次搭建：

```
User: go ham

Agent: HAM setup complete. Created 8 files.
  - CLAUDE.md (root)
  - .memory/decisions.md
  - .memory/patterns.md
  - .memory/inbox.md
  - src/api/CLAUDE.md
  - src/components/CLAUDE.md
  - src/lib/CLAUDE.md
  - src/utils/CLAUDE.md

Baseline captured in .memory/baseline.json
Run "HAM savings" to see your token and cost savings.
```

查看节省：

```
User: ham savings

Agent:
  Before HAM: ~7,500 tokens/prompt
  After HAM:    ~450 tokens/prompt
  Savings:    7,050 tokens (94%)

  Monthly projection (1,500 prompts):
    Sonnet: ~$31.73 saved
    Opus:   ~$158.63 saved
```

## 注意事项

- token 估算用 ~4 字符=1 token 近似，非真实分词器；savings 对比是基于典型行为的估算，别当账单。
- 仪表盘需 Node.js 18+，依赖 `~/.claude/projects/` 的会话数据；无会话历史则面板空。
- 路由命中率依赖会话 JSONL 中 CLAUDE.md 的读取顺序检测，可能有误差。
- 子目录 CLAUDE.md 内容不会自动同步代码变更——目录重构后务必手动或 `ham audit` 更新，否则陈旧上下文会误导智能体。
- 碳估算用区域电网均值而非实时能耗数据。

## 互见

- related：`agent-memory-systems` —— 跨会话语义记忆 / 向量检索，与 HAM 的「目录级上下文小抄」互补；`agent-memory-mcp` —— 基于 MCP 的记忆集成。
- combines_with：上下文工程 / token 预算类技能 —— HAM 负责按目录裁剪上下文，可与提示词精简、上下文窗口管理叠加进一步省 token。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
