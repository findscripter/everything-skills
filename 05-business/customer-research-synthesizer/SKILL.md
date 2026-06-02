---
name: customer-research-synthesizer
title: 客户调研与洞察综合
description: 当需要对客户访谈/问卷/评论/工单等素材做调研分析，或从线上社区挖掘真实用户语言，进而提炼洞察、构建画像时使用；做的事是抽取痛点-触发-目标-原话并按主题聚类、标注置信度、产出调研综合报告/VOC语料库/用户画像/JTBD地图；不适用于据洞察写文案或优化落地页（仅做调研，不做下游创作）。触发词：客户调研、customer research、ICP、用户访谈、transcript分析、问卷分析、survey、工单分析、VOC、voice of customer、用户画像、persona、JTBD、jobs to be done、评论挖掘、G2评论、Reddit挖掘、流失原因、churn。
domain: 商业/marketing
triggers: [客户调研, customer research, ICP, 用户访谈, transcript分析, 问卷分析, survey, 工单分析, VOC, voice of customer, 用户画像, persona, JTBD, jobs to be done, 评论挖掘, G2评论, Reddit挖掘, 流失原因, churn]
tags: [customer-research, marketing, voc, persona, jtbd, review-mining, churn, icp]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [WebSearch, WebFetch]
requires: []
related: [competitive-analysis, content-strategy-planner, product-marketing-gtm-strategy, conversion-rate-optimizer]
combines_with: [conversion-copywriter, content-strategy-planner, product-marketing-gtm-strategy]
license: MIT
source: coreyhaines31/marketingskills
source_license: MIT
---
## 何时使用

需要弄清客户真实的想法、感受、说法与痛点，并将其转化为可消费的结构化洞察时使用。覆盖两种模式：

- **模式一·分析已有素材**：手里有访谈/销售通话记录、问卷、评论、支持工单、赢单/输单/流失访谈、NPS 回复，要从中抽取信号。
- **模式二·线上社区挖掘（数字水源地）**：没有现成素材，需从 Reddit、G2/Capterra、Hacker News、应用商店评论、论坛社群等抓取未经修饰的真实语言。

多数任务两种模式混用。**动手前先确认属于哪种模式。**

**不该用本技能的边界**：
- 要据洞察撰写文案/邮件/标题 → 交给文案/冷邮件类技能（本技能只做调研，不做创作）。
- 要据洞察优化落地页/做 A·B 实验 → 交给 CRO/页面优化类技能。
- 仅做事实核查、与客户无关的通用资料检索 → 不属于本技能。

## 步骤

1. **读上下文**：若存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`、旧版 `product-marketing-context.md`），先读它，跳过已回答的问题。
2. **确认目标与素材**：先问「目标是什么（改信息/建画像/找产品缺口/搞懂流失）」和「现有什么素材」，按需再追问目标人群、产品、交付物。不要一次抛五个问题。
3. **按模式抽取**：模式一逐份素材抽取，模式二逐条内容抓取（见下方「指令」）。
4. **综合（synthesis）**：
   - 按主题聚类，跨素材归并相似的痛点/目标/触发；
   - 频次 × 强度 评分（出现多频繁、情绪多强烈）；
   - 按客户画像分段（公司规模/角色/用例/客龄），看模式是否因段而异；
   - 每个主题挑 5-10 条「money quotes」原话；
   - 标注矛盾点（说一套做一套）。
5. **标注置信度**（见护栏表），逐条洞察先打标再呈现。
6. **按需产出交付物**（先问用户要哪个）：调研综合报告 / VOC 原话语料库 / 用户画像（1-3 个）/ JTBD 地图 / 竞品情报摘要 / 调研缺口分析。

## 指令

**抽取框架（每份素材抽取这 6 项）**：

1. **Jobs to Be Done**：功能性 job（要完成的任务）+ 情绪性 job（想有的感受）+ 社交性 job（想被如何看待）。
2. **痛点**：优先「未经提示就主动提到 + 带情绪用词」的痛点。
3. **触发事件**：什么变化让他开始找方案（团队扩张、新人入职、错失指标、尴尬事故、竞品动作）。
4. **期望结果**：用客户原话描述成功，**抓原话不要转述**。
5. **语言与词汇**：客户的原词原句——这是文案的金矿。"We were drowning in spreadsheets" 优于 "manual process inefficiency"。
6. **考虑过的替代方案**：含什么都不做、招人、自研。

**各类素材要点**：访谈看「决定找方案的那一刻、之前试过什么、成功长啥样」；问卷先按客户层级/用例/客龄分段再下结论，注意开放题与选择题常冲突；工单先分类（区分 bug / 困惑 / 缺功能 / 期望错位），别把所有工单当同等信号；赢单看「什么压垮天平、差点选了哪个竞品」，输单/流失按原因分段（价格/功能/契合/时机），别跨原因取平均；NPS 中被动者和贬损者比推荐者更有改进价值，分数务必配原话。

**模式二·去哪找（按 ICP 选源）**：
- B2B SaaS / 技术买家 → Reddit 角色子版、G2/Capterra、Hacker News、LinkedIn、Indie Hackers、SparkToro
- SMB / 创始人 → Reddit（r/entrepreneur、r/smallbusiness）、Indie Hackers、Product Hunt、Facebook 群、SparkToro
- 开发 / DevOps → r/devops、r/programming、Hacker News、Stack Overflow、Discord
- B2C / 消费者 → 应用商店 1-3 星评论、Reddit 兴趣/生活版、YouTube/TikTok/Instagram 评论
- 企业级 → LinkedIn、行业分析师报告、G2 企业筛选、招聘启事、SparkToro

**快速决策**：有产品品类 → 先看 G2/Capterra（自家 + 竞品）评论；想知道受众在哪 → SparkToro；要原始语言 → Reddit + YouTube 评论；要触发事件 → LinkedIn 帖 / 招聘启事 / "Ask HN"；要竞争情报 → 竞品 G2 四星评论 + Product Hunt 讨论。

**逐条内容抓取字段**：来源（平台/链接/日期）| 原话（不转述）| 上下文（什么引发的）| 情绪（正/负/中/受挫）| 主题标签（痛点/触发/结果/替代/语言）| 客户画像信号（角色/规模/行业线索）。

**调研质量护栏**：

| 置信度 | 判定标准 |
|--------|----------|
| 高 | 主题出现于 3+ 独立来源；未经提示主动提及；跨段一致 |
| 中 | 出现于 2 个来源，或仅经提示，或仅限单一客户段 |
| 低 | 单一来源；可能是离群点；需验证 |

- **时效窗口**：近 12 个月的来源加权更高，市场会变，3 年前的记录可能反映的是另一个产品和买家。
- **样本偏差**：线上评论者偏向重度用户与强观点人群；工单偏向问题而非价值；Reddit 偏技术且更挑剔。下「所有客户」结论时务必校正。
- **最小可用样本**：每段少于 5 个独立数据点，不要构建画像或下信息结论。

## 示例

**调研综合模板**（按 频次 × 强度 排序）：

```
## Top Themes（按 frequency × intensity 排序）

### Theme 1: [名称]
**Summary**: [1-2 句]
**Frequency**: 出现在 Y 个来源中的 X 个
**Intensity**: High / Medium / Low（依情绪用词强度）
**Representative quotes**:
- "[原话]" — [来源, 日期]
- "[原话]" — [来源, 日期]
**Implications**: 对信息/产品/定位意味着什么
```

**用户画像模板**（≥5-10 个同段数据点才建）：

```
## [画像名] — [角色/头衔]

**Profile**：头衔范围 / 公司规模 / 行业 / 汇报对象 / 管理团队规模
**Primary Job to Be Done**：一句话——他在岗位上想达成的结果
**Trigger Events**：什么让他开始找你这类方案
**Top Pains**：1. 2. 3.（尽量用原话）
**Desired Outcomes**：成功长啥样 / 如何衡量 / 如何让他在老板面前好看
**Objections and Fears**：让他犹豫购买或切换的点
**Alternatives They Consider**：竞品 / 自研 / 什么都不做 / 招人
**Key Vocabulary**：他真实使用的原词原句（来自调研）
**How to Reach Them**：渠道 / 消费的内容 / 信任的社群与影响者
```

## 注意事项

- **画像来自调研，不可凭空发明**：缺数据的字段宁可留空，也不要填补。
- **不要跨段取平均**：代表所有人的画像谁也代表不了。
- **不必起萌名**（"Marketing Mary"）除非团队觉得有用，否则常是干扰。
- **季度复盘**：画像会随市场和产品演进而衰减。
- 全程**抓原话、不转述**；原话即资产。

## 互见

- 据调研洞察写文案/邮件，或将客户调研转译为对外触达的 ICP → 交给文案、冷邮件、潜客类技能（本库未收录则留待后续）。
- 需要先把材料事实核查后再分析 → `fact-checking`。
- 需要把调研报告导出为 docx → `markdown-to-docx`。

---

本条采编自 coreyhaines31/marketingskills 的 `customer-research`（MIT 许可），已按中文技能大典做适配重写。
