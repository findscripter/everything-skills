---
name: skill-router-interviewer
title: 技能路由顾问：访谈式定位最合适的技能
description: 当用户不知从何下手、不确定该用哪个技能、目标模糊只有大方向时使用；做一轮结构化访谈（漏斗式提问）后推荐 1 个主技能+至多 2 个辅技能，产出推荐理由、@调用语法与可直接粘贴的成品提示词；不适用于已明确技能后的实际执行（本条只做选型与推荐，不替代被推荐技能干活），也不替你安装未装技能。触发词：不知道用哪个技能、从哪开始、该用什么、which skill
domain: 通用/thinking
triggers: [不知道用哪个技能, 从哪开始, 该用什么, 我不确定怎么做, 新手该用哪个, 帮我选技能, which skill should I use, where to start, what should I use for]
tags: [技能路由, 访谈式, 推荐, 选型, 漏斗提问, 新手引导, 通用, 学习]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [claude-command-selector, decision-navigator, cross-tool-skill-manager, skill-ecosystem-auditor]
combines_with: [objective-to-build-blueprint, query-decomposition-search]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用户说「我不知道从哪开始」「该用哪个技能」「这事该怎么入手」。
- 目标模糊、只有大方向、没有清晰方法或具体规格。
- 用户问「做……该用什么」「我不确定该怎么处理」。
- 新用户面对技能库不知所措，需要引导。

不该用的边界：

- 本条只负责「选哪个 + 何时用」，**不替代被推荐技能的实际执行**。选定后切到对应技能干活。
- 只能推荐**已安装**的技能；未装的技能即使推荐也跑不起来，必要时提示用户先安装。
- 高度含糊的目标可能需要追问澄清；不要在信息不足时硬推。

## 步骤

1. **开场**：温和回应，告诉用户「我先问几个快速问题，帮你精准定位技能」。**此时先不要推荐任何技能。**
2. **漏斗提问**（一次一题、按序问，前一答让后一题无意义就跳过）：
   - Q1 任务大类（编号选项见下）。
   - Q2 任务清晰度（清晰规格 / 粗略想法 / 完全从零）。
   - Q3 技术栈或领域（仅相关时问；答「随便/不确定」即跳过）。
   - Q4 自主 vs 协作（全自主直接干 / 协作要审批每步 / 还不确定）。
3. **推荐**：基于回答给 1 个主技能 + 至多 2 个辅技能，附理由与调用语法。
4. **送提示词**：问是否需要写一段可直接粘贴的成品提示词；用户同意就用访谈所得信息整合一段完整提示词。

## 指令

Q1 任务大类（以编号选项呈现）：

```
1. 构建/编码（应用、功能、组件、脚本）
2. 修复或调试出错的东西
3. 安全 / 渗透测试 / 漏洞评估
4. AI 智能体 / LLM / 自动化流水线
5. 营销 / SEO / 内容 / 增长
6. DevOps / 基础设施 / 部署 / git
7. 设计 / UI/UX / 创意产出
8. 规划 / 战略 / 文档
9. 其他（请描述）
```

推荐输出格式（严格照此结构）：

```
✅ 主技能：@skill-name
理由：（1–2 句，说明为何最契合用户所述）
这样调用：
    @skill-name 在此粘贴你的目标

🔁 也可考虑：
- @skill-name-2 —— 一句话说明何时叠加它
- @skill-name-3 —— 一句话说明何时叠加它
```

常见路由参考（按 Q1 大类）：

| 场景 | 主技能 → 进阶链 |
|------|------|
| 从零做完整产品/应用 | `@app-builder`；要先规划：`@brainstorming → @plan-writing → @app-builder`；要全自主：`@loki-mode` |
| 前端功能/UI | `@senior-fullstack` 或 `@frontend-design`；栈相关 `@react-patterns`/`@nextjs-best-practices`/`@tailwind-patterns` |
| 后端 API/服务 | `@backend-dev-guidelines`；API 设计 `@api-patterns`；数据库 `@database-design` |
| 调试出错 | `@systematic-debugging`；测试挂了 `@test-fixing`；代码质量 `@clean-code` |
| 写测试/TDD | `@tdd`；浏览器测试 `@playwright-skill` |
| 第三方集成 | 支付 `@stripe-integration`；鉴权 `@clerk-auth`；机器人 `@slack-bot-builder` 等 |
| AI/LLM/智能体 | 架构 `@ai-agents-architect`；RAG `@rag-engineer`；提示词 `@prompt-engineer`；多智能体 `@langgraph`/`@crewai` |
| 安全/渗透 | 起步 `@ethical-hacking-methodology` + `@pentest-checklist`；Web `@burp-suite-testing`/`@sql-injection-testing` |
| DevOps/部署 | `@docker-expert`；云 `@aws-serverless`/`@vercel-deployment`；git `@git-pushing`/`@using-git-worktrees` |
| 营销/增长/SEO | 文案 `@copywriting`；落地页 `@page-cro`；SEO `@seo-fundamentals` + `@seo-audit` |
| 规划/架构/战略 | 快速 `@concise-planning`；完整 `@plan-writing → @executing-plans`；架构 `@software-architecture` |
| 创意/视觉 | UI `@frontend-design`；数据可视化 `@claude-d3js-skill`；演示 `@pptx-official` |
| 全自主/并行 | `@loki-mode`；并行任务 `@dispatching-parallel-agents`；先计划后执行 `@subagent-driven-development` |
| 文档产出 | Word `@docx-official`；PDF `@pdf-official`；表格 `@xlsx-official`；演示 `@pptx-official` |

## 示例

```
用户：@skill-router 我想做点东西但不知从哪开始

顾问：没问题——先问几个快速问题。
      任务大类是？(1)构建 (2)调试 (3)安全 (4)AI/LLM
                  (5)营销 (6)DevOps (7)设计 (8)规划

用户：1 - 构建

顾问：任务有多清晰？(1)清晰规格 (2)粗略想法 (3)完全从零

用户：2 - 粗略想法

顾问：技术栈？(React、Node、Python… 或「不确定」)

用户：Next.js

顾问：✅ 主技能：@brainstorming
      理由：你只有粗略想法、需要先成型再开建。Brainstorming 用结构化提问帮你产出清晰规格。
      这样调用：
          @brainstorming 帮我用 Next.js 设计 [你的应用点子]

      🔁 也可考虑：
      - @plan-writing —— brainstorming 出规格后，拆成任务
      - @senior-fullstack —— 准备开建时上

      要我把完整提示词写好让你直接粘贴吗？
```

## 注意事项

- **每次最多 1 个主技能 + 2 个辅技能**，绝不一次甩一长串，避免淹没用户。
- 推荐务必带**精确的 @调用语法**，让用户可直接复制粘贴。
- 目标跨多个类目时，选**最上游**的技能（如先 `@brainstorming` 再 `@senior-fullstack`）。
- 用户完全没头绪时的兜底：开放式目标默认 `@brainstorming`；凡涉及「构建」默认 `@app-builder`。
- 路由基于自然语言匹配，参考表只覆盖常见技能、不含库内全部；推荐前用 `/help` 或库索引核实本机实际可用项。
- 推荐完，**始终主动提议**帮用户写一段成品提示词。

## 互见

- related：`claude-command-selector` —— 同为「选型/路由」类，前者面向斜杠命令与 Agent，本条面向技能库访谈推荐。
- related：`decision-navigator` —— 更通用的决策导航。
- combines_with：`brainstorming` / `plan-writing` —— 本条定位到上游技能后，由它们把模糊目标转成规格与任务。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
