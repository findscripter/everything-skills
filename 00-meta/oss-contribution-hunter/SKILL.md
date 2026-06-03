---
name: oss-contribution-hunter
title: 开源贡献机会挖掘（oss-contribution-hunter）
description: 当你想在热门开源仓库挖「易合并、有影响力」的 issue 来贡献、或捞 help-wanted/good-first-issue 任务时使用；做发现仓库→提取标签 issue→可行性评分→产出含根因/修复策略/置信分的贡献档案；不适用于已锁定 issue 直接写代码、无 gh/搜索的离线环境、或刷 PR 数灌水。触发词：找开源 issue、good first issue、help wanted、给某仓库提 PR、贡献档案
domain: 通用/research
triggers: [找几个能上手的开源 issue, good first issue, help wanted 任务, 想给 langchain 提个 PR, 哪些热门仓库适合贡献, 帮我挖开源贡献机会, 生成贡献档案 dossier, 哪个 issue 容易被合并]
tags: [开源贡献, GitHub, issue 挖掘, 可行性评分, PR 机会, gh-cli, 贡献档案, mergeability]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gh, WebSearch, Bash, Read]
requires: []
related: [entity-research-dossier, multi-source-knowledge-synthesis, codebase-structure-protocol]
combines_with: [github-pr-comment-resolver, codebase-onboarding-doc, oss-license-compliance]
license: CC-BY-4.0
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当用户想**主动发现**值得投入的开源贡献机会，而不是已经盯着某个具体 issue 时使用。典型请求：

> 「在热门 AI 仓库里帮我找几个 help-wanted 的 issue。」
> 「在 langchain-ai/langchain 里找适合快速 PR 的 bug 修复。」
> 「给最近 GitHub trending 的项目生成一份贡献档案。」

核心价值是把「海量 issue」筛成「易合并 × 有影响力 × 当前工具能搞定」的少数高价值目标，并附上可直接执行的修复策略与置信分。

**不该用于：**
- 用户已锁定单个 issue、只想直接动手写代码——直接进编码流程，别再走发现/评分。
- 没有 `gh` CLI 也没有联网搜索的离线环境——本技能的发现与提取依赖它们，缺失时如实说明而非编造仓库/issue。
- 为「刷 PR 数量」而非真实价值地批量灌水——评分阶段就应淘汰低价值/纯水改动。
- 想要保证 PR 一定被合并——能否合并是维护者裁量，本技能只提升命中率，不做承诺。

## 步骤

四阶段协议，逐阶段收敛：

**阶段 1 — 仓库发现**
用 `WebSearch` 或 `gh api` 找热门仓库，筛选条件：
- Stars > 1000；
- 近期活跃（24 小时内有 push）；
- 主题相关（AI / Agentic / Web3 / Tooling，或用户指定方向）。

**阶段 2 — issue 提取**
按标签拉取候选 issue，优先标签：`help wanted` / `good first issue` / `bug` / `v1` / `roadmap`。

```bash
gh issue list --repo owner/repo --label "help wanted" --limit 10
```

**阶段 3 — 可行性分析**（这是「贡献档案」区别于盲目挑活的关键）
对每个候选 issue 评四个维度：
1. **可复现性**：是否有复现代码片段 / 最小复现？无复现的 bug 优先级降低。
2. **影响力**：影响多少用户？是核心路径还是边缘场景？
3. **可合并性**：看近期 PR 历史——维护者是否会**快速合并社区 PR**？长期无人 review 的仓库谨慎投入。
4. **复杂度**：当前工具/上下文窗口能否独立解决？避开需要大量领域上下文或私有环境的 issue。

**阶段 4 — 产出贡献档案（Dossier）**
为人类生成结构化报告，每个目标含：
- **项目名 & Stars**；
- **issue 链接 & 描述**；
- **根因分析**（基于实际读码，而非臆测）；
- **建议修复策略**；
- **置信分（1-10）**——综合上面四维的总评。

## 指令

给 Agent 的执行纪律：
- **顺序调用、礼貌限速**：`gh`/搜索逐个发起，确认上一次返回再发下一次，避免触发速率限制。
- **只引用真实返回**：仓库、issue、PR 历史都必须来自本次工具调用结果；拿不到就标「未取得」，**不要编造**。
- **可合并性靠证据**：用 `gh pr list --repo owner/repo --state merged --limit 20` 看维护者最近的合并节奏与社区 PR 占比，再下判断。
- **根因要读码**：根因分析前用 `gh`/clone 读相关源码与复现，置信分需与「是否真的定位到根因」挂钩，别给无依据的高分。
- **尊重许可与贡献规范**：动手前读目标仓库 LICENSE 与 `CONTRIBUTING.md`/issue 模板；许可不清或贡献门槛高时在档案中标注（可联动 `oss-license-compliance`）。

可用命令速查：

| 目的 | 命令 |
|---|---|
| 列标签 issue | `gh issue list --repo owner/repo --label "good first issue" --limit 10` |
| 看 issue 详情 | `gh issue view <num> --repo owner/repo` |
| 看维护者合并节奏 | `gh pr list --repo owner/repo --state merged --limit 20` |
| 搜热门仓库 | `gh search repos --sort stars --limit 20 "topic:ai pushed:>2026-06-01"` |

## 示例

一条贡献档案条目的样式：

```markdown
## langchain-ai/langchain ⭐ 95k
- Issue: #28110 https://github.com/langchain-ai/langchain/issues/28110
  「ChatOpenAI 在 streaming=True 时丢失 usage_metadata」
- 复现：✅ issue 内附 10 行复现脚本
- 影响：高 — 影响所有用 streaming 统计 token 的用户
- 可合并性：高 — 近 20 个社区 PR 平均 2 天合并
- 复杂度：中 — 定位在 _stream() 的回调聚合
- 根因：流式分块未把最后一个 chunk 的 usage 字段并入 AIMessageChunk
- 修复策略：在 _convert_chunk 聚合处累加 usage_metadata，补一条 streaming 单测
- 置信分：8/10
```

挑选请求示例：
- 「在热门 AI 仓库里找 help-wanted 的 issue」→ 阶段 1 用 `gh search repos`，阶段 2 逐仓库拉 `help wanted`。
- 「为 GitHub trending 项目生成贡献档案」→ 全流程跑完，输出 3-5 条按置信分排序的档案。

## 注意事项

- **依赖外部工具**：准确度取决于 `gh` CLI / 联网搜索是否可用；缺失则降级说明，不臆造。
- **大仓库受上下文限制**：超大代码库无法整库读，根因分析只在可加载的范围内做，超界要标注「未充分核实」。
- **不保证被合并**：是否合并由维护者裁量；档案只提升命中概率。
- **避免低质量灌水**：置信分低 / 纯格式或无意义改动的 issue 应被淘汰，贡献要追求真实价值与社区信任。
- **先看贡献规范**：CLA、issue 认领约定（如评论 `/assign`）、PR 模板等先读清楚，避免无效投入。

## 互见

- related：`entity-research-dossier` —— 同为「先建假设/筛选、再取证产档案」的研究范式，可借鉴其来源分层与审计纪律
- related：`multi-source-knowledge-synthesis` —— 跨多源（issue/PR/讨论/文档）汇总判断时的综合方法
- related：`codebase-structure-protocol` —— 进入陌生仓库快速建立结构认知，支撑根因分析
- combines_with：`github-pr-comment-resolver` —— 挖到 issue 并提 PR 后，处理 reviewer 评审意见直到合并
- combines_with：`codebase-onboarding-doc` —— 对选中的目标仓库快速上手，降低复杂度维度的不确定性
- combines_with：`oss-license-compliance` —— 贡献前核对目标仓库许可与贡献条款，规避合规风险

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证），原技能 `oss-hunter`（OSS Hunter，源自 ClawForge）。本条为适配中文「技能大典」的重写版，保留其四阶段协议（发现 / 提取 / 可行性 / 贡献档案）、标签清单、可行性四维（可复现性·影响力·可合并性·复杂度）、置信分（1-10）与 `gh issue list` 等关键命令，并补充了执行纪律与中文互见。
