---
name: context-budget-audit
title: 上下文窗口预算审计（裁剪臃肿组件）
description: 当会话变慢/质量下降、刚加了一批技能/Agent/MCP、想确认还有多少上下文余量或扩容前评估空间时使用；做盘点 Agent/技能/规则/MCP/CLAUDE.md 的 token 占用，分类标记臃肿冗余组件，产出按节省量排序的优化报告与 Top3 建议；不适用于运行期单次任务的对话压缩、或精确逐 token 计费。触发词：上下文预算、context budget、token 占用、裁剪 MCP、瘦身、还有多少空间
domain: 通用/thinking
triggers: [上下文预算, context budget, /context-budget, token 占用, 上下文太满, 裁剪 MCP, 技能瘦身, 还有多少上下文空间, 扩容前评估, 组件臃肿, MCP 太多, context overhead]
tags: [上下文工程, token 优化, MCP 治理, 技能审计, 成本控制, Claude Code 配置, 性能调优]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [wc, grep]
requires: []
related: [context-window-management, context-compression, skill-optimizer, agent-architecture-audit]
combines_with: [skill-optimizer, cost-aware-llm-pipeline, agent-architecture-audit]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

适用：
- 会话明显变慢、输出质量下滑，怀疑是上下文被静态组件吃满
- 刚一次性加了很多技能 / Agent / MCP 服务器后做一次体检
- 想知道当前配置还剩多少上下文余量（headroom）
- 计划再加组件前，先评估「装得下吗」
- 用户说「上下文预算」「token 占用太高」「帮我瘦身配置」「MCP 是不是太多了」，或触发 `/context-budget`

不该用（负边界）：
- 不是用来压缩**单次任务的对话历史**（那是运行期 compaction，另寻方法）
- 不做精确逐 token 计费——这里只给**估算**，用于排序决策而非账单
- 缺少可扫描的配置目录（agents/skills/rules/.mcp.json/CLAUDE.md）时，先确认路径再审计

核心洞见：Agent / 技能 / 规则 / MCP 的开销是**每次会话恒定加载**的静态成本，砍掉冗余组件能直接换回上下文空间。

## 步骤

四阶段流程。token 估算口径：散文用 `单词数 × 1.3`，代码密集文件用 `字符数 / 4`。

**阶段 1 · 盘点（Inventory）** — 扫描各组件目录，估算 token：

| 组件 | 路径 | 计量 | 告警阈值 |
|---|---|---|---|
| Agent | `agents/*.md` | 逐文件行数/token；抽取 `description` frontmatter 长度 | 文件 >200 行（过重）；description >30 词（frontmatter 臃肿） |
| 技能 | `skills/*/SKILL.md` | 逐 SKILL.md token；查 `.agents/skills/` 的重复副本，**同名同内容只算一次** | 文件 >400 行 |
| 规则 | `rules/**/*.md` | 逐文件 token；检测同语言模块内规则间内容重叠 | 文件 >100 行 |
| MCP | `.mcp.json` / 活跃 MCP 配置 | 服务器数 + 工具总数；每工具 schema ≈ **500 token** | 单服务器 >20 工具；包装 `gh`/`git`/`npm`/`supabase`/`vercel` 等简单 CLI 的服务器 |
| CLAUDE.md | 项目级 + 用户级 | CLAUDE.md 链逐文件 token | 合计 >300 行 |

**阶段 2 · 分类（Classify）** — 每个组件归一个桶：

| 桶 | 判据 | 动作 |
|---|---|---|
| 总是需要 | 被 CLAUDE.md 引用 / 支撑活跃命令 / 匹配当前项目类型 | 保留 |
| 偶尔需要 | 领域专用（如某语言模式），CLAUDE.md 未引用 | 改成按需激活 |
| 几乎不需要 | 无命令引用、内容重复、与项目无明显匹配 | 删除或延迟加载 |

**阶段 3 · 问题检测（Detect）** — 标记以下臃肿模式：
- **Agent description 臃肿**：frontmatter 中 >30 词的 description 会在**每次 Task 工具调用**时加载
- **过重 Agent**：>200 行的文件在每次 spawn 时撑大 Task 上下文
- **冗余组件**：复刻 Agent 逻辑的技能、复刻 CLAUDE.md 的规则
- **MCP 过度订阅**：>10 个服务器，或包装免费 CLI 的服务器
- **CLAUDE.md 臃肿**：冗长说明、过期段落、本该写进 rules 的指令

**阶段 4 · 报告（Report）** — 生成预算报告，建议按**节省量降序**排列，并给 Top 3 优化项。详细模式（`--verbose`）追加：逐文件 token 数、最重文件的逐行拆解、冗余组件并排对照的重复行、逐工具 schema 估算的 MCP 工具清单。

## 指令

报告骨架（占位符按实测填充）：

```
Context Budget Report
═══════════════════════════════════════
Total estimated overhead: ~XX,XXX tokens
Context model: Claude Sonnet (200K window)
Effective available context: ~XXX,XXX tokens (XX%)

Component Breakdown:
┌─────────────┬───────┬──────────┐
│ Component   │ Count │ Tokens   │
├─────────────┼───────┼──────────┤
│ Agents      │ N     │ ~X,XXX   │
│ Skills      │ N     │ ~X,XXX   │
│ Rules       │ N     │ ~X,XXX   │
│ MCP tools   │ N     │ ~XX,XXX  │
│ CLAUDE.md   │ N     │ ~X,XXX   │
└─────────────┴───────┴──────────┘

WARNING: Issues Found (N): [按节省 token 排序]

Top 3 Optimizations:
1. [action] → save ~X,XXX tokens
2. [action] → save ~X,XXX tokens
3. [action] → save ~X,XXX tokens

Potential savings: ~XX,XXX tokens (XX% of current overhead)
```

扫描可借工具：`wc -l` 数行、`grep` 抽 frontmatter 的 description、解析 `.mcp.json` 数服务器/工具。普通审计用概览报告，仅在需要定位「到底哪个文件在吃上下文」时才开 `--verbose`。

## 示例

**基础审计**
```
User: /context-budget
→ 扫描配置：16 Agent (12,400 token)、28 技能 (6,200)、87 MCP 工具 (43,500)、2 CLAUDE.md (1,200)
  标记：3 个过重 Agent、14 个 MCP 服务器（其中 3 个可用 CLI 替代）
  最大节省：删 3 个 MCP 服务器 → -27,500 token（开销降 47%）
```

**详细模式**
```
User: /context-budget --verbose
→ 完整报告 + 逐文件拆解：planner.md (213 行, 1,840 token)、
  含逐工具大小的 MCP 工具清单、并排展示的重复规则行
```

**扩容前评估**
```
User: 我想再加 5 个 MCP 服务器，装得下吗？
→ 当前开销 33% → 加 5 服务器（约 50 工具）≈ +25,000 token → 升至 45%
  建议：先删 2 个可用 CLI 替代的服务器，把开销压到 40% 以下再加
```

## 注意事项

- **MCP 是最大杠杆**：每个工具 schema ≈ 500 token，一个 30 工具的服务器比所有技能加起来还重——优先从 MCP 下手。
- **Agent description 永远在场**：即使该 Agent 从未被调用，它的 description 字段也存在于每次 Task 工具的上下文里——所以 description 越短越好。
- **token 估算分口径**：散文 `单词数 × 1.3`，代码密集文件 `字符数 / 4`。
- **详细模式用于排障**：只在需要精确定位某个文件驱动开销时用，常规审计不开。
- **改动后即审计**：每次加完 Agent / 技能 / MCP 后跑一遍，趁早发现蔓延（creep）。
- 报告只是估算，用于**排序优化决策**，不等于精确计费。

## 互见

- related：`caveman-compressed-mode` —— 前者治「静态配置开销」，后者治「运行期输出 token」，互补不重叠。
- related：`claude-command-selector` —— 配置盘点后选对命令/技能减少误加组件。
- combines_with：`caveman-compressed-mode` —— 审计瘦身配置 + 压缩对话输出，双管齐下省 token。

---

采编自 affaan-m/everything-claude-code（MIT 许可证）。
