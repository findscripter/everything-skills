---
name: cim-builder
title: 保密信息备忘录（CIM）撰写
description: 当为卖方并购流程（sell-side）准备募售材料、起草保密信息备忘录、把公司资料整理成投资人可读文档时使用；产出含执行摘要/公司/行业/增长/客户/运营/财务/附录的 40-60 页 .docx 及 Excel 财务附录；不适用于买方材料、法律文书起草或正式估值建模。触发词：CIM、保密信息备忘录、募售材料、卖方材料、info memo、offering memorandum
domain: 商业/finance
triggers: [CIM, 保密信息备忘录, confidential information memorandum, offering memorandum, 募售备忘录, 募售材料, 卖方材料, sell-side, info memo, info memorandum, 投资备忘录, draft CIM]
tags: [finance, investment-banking, ma, sell-side, cim, deal-materials, DOCX, 投行]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [docx, excel]
requires: []
related: [ib-pitch-deck-builder, ma-deal-teaser, ma-buyer-list, company-tear-sheet]
combines_with: [ma-process-letter, financial-model-updater]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

为**卖方并购流程**（sell-side M&A）撰写保密信息备忘录（CIM，又称 offering memorandum / info memo），把公司零散资料整理成一份投资人可读、叙事连贯、格式专业的募售文档。典型场景：

- 公司即将出售，需向潜在买方分发标准化材料以征集首轮报价（first-round bids）。
- 把管理层 PPT、历史财务、客户与组织数据归集为一份统一文档。

不该用的边界：

- **买方视角材料**（投资委员会备忘、收购评估）→ 用 `ma-playbook`，本技能只面向卖方募售。
- **法律文书**（NDA、SPA、LOI、term sheet）→ 交外部法务，本技能只在末页放保密免责声明。
- **正式估值建模 / QoE 报告**→ 交财务团队，本技能只把已有财务整理成图表叙事。
- 首轮报价前的**敏感客户数据**默认匿名化，除非卖方明确批准披露。

判据一句话：**CIM 是销售文档——先讲优势、用数据支撑、但不藏重大问题（买方尽调一定会查出）。**

## 步骤

四步流水线：归集资料 → 搭结构 → 撰写 → 输出。

**Step 1 归集源材料** —— 向卖方/管理层索要：

- 管理层演示文稿（management presentations）
- 历史财务（3-5 年）+ 预算/预测
- 公司官网与营销材料
- 客户数据（按需匿名化）
- 组织架构图（org chart）
- 既往董事会/路演 deck
- 盈利质量报告（QoE，若有）

**Step 2 按标准目录搭结构**（见「指令」目录与页数）。

**Step 3 撰写** —— 遵循撰写准则（见「指令」）。

**Step 4 输出**：

- `.docx`，专业排版，图表与附件嵌入正文。
- 独立 Excel 财务附录（明细三表）。
- 全部图表/exhibit 内嵌于文档。

## 指令

**标准 CIM 目录（共 40-60 页）：**

| 章节 | 篇幅 | 要点 |
|------|------|------|
| I. 执行摘要 Executive Summary | 2-3 页 | 公司概览（做什么、为何胜出）；投资亮点（5-7 条核心卖点）；财务摘要（营收/EBITDA/增长/利润率）；交易概览（卖什么、指示性时间表） |
| II. 公司概览 | 3-5 页 | 历史与创始故事；使命与价值主张；产品与服务；商业模式与收入构成；关键差异化与竞争优势 |
| III. 行业概览 | 3-5 页 | 市场规模与增长（TAM/SAM/SOM）；行业趋势与顺风；竞争格局；监管环境；进入壁垒 |
| IV. 增长机会 | 2-3 页 | 有机增长杠杆（新品/新市场/定价）；并购/加盟机会；运营改进；技术投入；white space 分析 |
| V. 客户与销售 | 3-5 页 | 客户概览（数量/分群/地区）；Top 客户分析（LOI 前匿名）；客户集中度与留存；销售流程与 GTM；管线与 backlog |
| VI. 运营 | 2-3 页 | 组织结构；关键人员；设施与地理布局；技术与系统；供应链/供应商关系 |
| VII. 财务概览 | 5-8 页 | 历史利润表（3-5 年）；营收拆解（分部/地区/客户类型）；EBITDA bridge 与利润率分析；资产负债表概览；现金流摘要；资本开支历史；营运资本分析；管理层预测/预算（若纳入） |
| VIII. 附录 Appendix | — | 详细财务报表；客户清单（匿名）；产品目录；管理层简介 |

**撰写准则：**

- **语气（Tone）**：专业、客观、有说服力但不夸张（compelling but not hyperbolic）。
- **叙事（Narrative）**：讲一个故事——为何这门生意有吸引力、有护城河、有增长定位。
- **数据驱动**：每个论断都要有数据支撑。「强劲增长」→「营收 2021-2024 年 CAGR 15%」。
- **可视化**：财务趋势、市场规模、竞争定位用图表呈现。
- **长度**：40-60 页——足够支撑首轮报价，又不至于长到买方不读。
- **保密性**：含免责声明页；敏感客户数据未经卖方批准须匿名化。

## 示例

把模糊表述改写为数据驱动论断（撰写准则核心）：

```
弱  →  "Strong revenue growth"
强  →  "Revenue grew at a 15% CAGR from 2021-2024"

弱  →  "Diversified customer base"
强  →  "No single customer >8% of revenue; top 10 = 31% (FY24)"
```

投资亮点须回答每个买方都关心的三件事：

```
1. 增长潜力 (growth potential)  —— 营收/客户/市场的可持续增长来源
2. 利润率结构 (margin profile)  —— EBITDA 利润率水平与扩张路径
3. 防御性 (defensibility)       —— 护城河、转换成本、进入壁垒
```

## 注意事项

- **CIM 是销售文档**：先讲优势，但别藏重大问题——买方尽调一定查得出，藏了反伤信任。
- 投资亮点须命中三要素：增长潜力、利润率结构、防御性。
- 财务正常化 / 备考调整（normalization / pro forma adjustments）须**清晰标注并解释**，不可悄悄塞进数字。
- 保密免责声明与任何监管披露须**与法务协同**。
- 分发前请**管理层复核事实准确性**。
- CIM 为估值设定预期——确保叙事**撑得起报价**（asking price）。

## 互见

- related：`ma-playbook` —— 买方侧的尽调/估值/整合视角，与本卖方募售文档互为交易两端。
- related：`board-deck-builder` —— 把 CIM 核心结论压缩成董事会/股东决策页。
- related：`market-sizing-analyst` —— 测算第 III 章 TAM/SAM/SOM 与行业增长动态。
- related：`competitive-analysis` —— 支撑「竞争格局」与「关键差异化」章节。
- combines_with：`startup-financial-modeler` —— 产出第 VII 章财务与 Excel 附录所需的三表与预测模型。
- combines_with：`data-storyteller` —— 把财务趋势与投资亮点转为有说服力的图文叙事。

---
采编自 anthropics/financial-services（Apache-2.0）。
