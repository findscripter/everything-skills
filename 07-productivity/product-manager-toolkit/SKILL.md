---
name: product-manager-toolkit
title: 产品经理工具箱（RICE/PRD）
description: 当需要做特性优先级排序、用户访谈综合或撰写 PRD 时使用；用 RICE 打分脚本与访谈分析脚本产出优先级清单/季度路线图/洞察报告，并套用 PRD 模板与发现框架；不适用于纯工程实现、UI 视觉设计或营销投放执行。触发词：RICE、优先级、PRD、用户访谈、路线图
domain: 协作/pm
triggers: [RICE 打分, 特性优先级排序, 写 PRD / 需求文档, 用户访谈分析与综合, 季度路线图规划, MoSCoW/ICE/Kano 取舍, Jobs to Be Done 拆解, North Star/HEART 指标设计]
tags: [产品管理, 优先级排序, RICE, PRD, 用户访谈, 产品发现, GTM, 协作]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, rice_prioritizer.py, customer_interview_analyzer.py, CSV, JSON]
requires: []
related: [agile-product-owner, cpo-product-advisor, codebase-to-prd, enterprise-project-manager]
combines_with: [agile-product-owner, jira-expert, customer-research-synthesizer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用于产品经理从「发现」到「交付」的核心决策场景：

- 需要在多个候选特性间做客观优先级排序（跨团队、跨产品线对比）。
- 做完用户访谈后，需要从转录文本中批量抽取痛点、需求、JTBD 模式与情绪信号。
- 要撰写或评审 PRD（标准版 / 一页版 / 特性简报 / 敏捷 Epic）。
- 规划季度路线图、设计成功指标（North Star、HEART）、或准备 GTM 上线清单。

不该用的边界：

- 纯工程实现 / 架构设计 / 写代码 —— 本技能只产出需求与优先级，不落地实现。
- UI 视觉与交互稿设计 —— 用 Figma 等工具，本技能仅产出线框需求描述。
- 营销投放、广告素材生产、销售执行 —— 不在范围内。
- 数据本身的采集与清洗 —— 本技能消费指标结论，不负责埋点与数仓。
- 估算「极不可靠」时不要硬套 RICE：垃圾进垃圾出，先补足证据再打分。

## 步骤

### A. 特性优先级排序（Gather → Score → Analyze → Plan → Validate → Execute）

1. 汇集需求来源：客服工单/访谈、销售管道阻塞项、技术债、战略目标。
2. 用 RICE 脚本打分（CSV 输入，见下方指令）。
3. 分析组合平衡：速赢 vs 大赌注分布、避免全是 XL 项目、检查战略对齐缺口。
4. 生成路线图：按季度产能分配、识别依赖、制定干系人沟通计划。
5. 定稿前校验（务必逐项）：Top 优先级是否对齐战略；做 2x 估算误差的敏感性分析；找关键干系人查盲区；补齐特性间依赖；与工程复核工作量估算。
6. 执行迭代：跟踪实际 vs 估算工作量，每季度重估并据学习更新 RICE 输入。

### B. 用户发现（Plan → Recruit → Interview → Analyze → Synthesize → Validate）

1. 定义研究问题、目标分群，准备访谈脚本（结构 35 分钟：背景 5 / 问题探索 15 / 方案验证 10 / 收尾 5）。
2. 每个分群招募 5-8 人，混合重度用户与流失用户。
3. 半结构化访谈：聚焦问题而非方案，问「上次……是什么时候」而非「你会用吗」，拥抱沉默（默数到 7 再补话），全程少记录、经许可录音。
4. 用访谈分析脚本抽取：痛点+严重度、需求+优先级、JTBD 模式、分段情绪、主题与金句、竞品提及。
5. 综合：跨访谈聚合同类痛点，3+ 次提及视为「模式」，用机会-方案树映射机会区，按频次×严重度排序。
6. 验证：写假设（We believe… For… Will… 右/错判定标准），低保真原型测真实行为，迭代并沉淀学习。

### C. PRD 开发（Scope → Draft → Review → Refine → Approve → Track）

1. 选模板：复杂跨团队=标准 PRD(6-8 周)；简单单团队=一页 PRD(2-4 周)；探索期=特性简报(1 周)；迭代交付=敏捷 Epic。
2. 起草：先写问题陈述，前置成功指标，显式列出「不做什么(out-of-scope)」，附线框/原型。
3. 评审：工程(可行性/工作量)、设计(体验缺口)、销售(市场验证)、支持(运营影响)。
4. 据反馈精炼并记录权衡决策；审批后接入 Sprint 规划。
5. 上线后跟踪：实际指标 vs 目标、收集反馈、复盘得失、更新估算准确度数据。

## 指令

RICE 优先级脚本（CSV 列：`name,reach,impact,confidence,effort,description`）：

```bash
# 生成样例数据
python scripts/rice_prioritizer.py sample

# 默认产能（10 人月）打分
python scripts/rice_prioritizer.py features.csv

# 自定义团队产能（人月）
python scripts/rice_prioritizer.py features.csv --capacity 20

# JSON 输出（供 Jira 等集成）
python scripts/rice_prioritizer.py features.csv --output json > priorities.json

# CSV 输出（供电子表格）
python scripts/rice_prioritizer.py features.csv --output csv
```

访谈分析脚本：

```bash
# 分析转录文本
python scripts/customer_interview_analyzer.py interview.txt

# JSON 输出（供聚合/看板）
python scripts/customer_interview_analyzer.py interview.txt json > insights.json
```

**RICE 公式与取值约束（务必保留）：**

```
RICE 分 = (Reach × Impact × Confidence) / Effort
```

- Reach：每季度受影响用户数（数值，如 5000）。
- Impact：massive=3 / high=2 / medium=1 / low=0.5 / minimal=0.25。
- Confidence：high=100% / medium=80% / low=50%。
- Effort：xl=13 / l=8 / m=5 / s=3 / xs=1（人月）。

解读阈值：≥1000 高优（下季度强候选）；500-999 中优；100-499 低优（待办池）；<100 暂缓（需新数据）。

PRD 模板见 `references/prd_templates.md`；RICE/MoSCoW/Kano/ICE/JTBD/HEART 等完整框架见 `references/frameworks.md`。

## 示例

RICE 计算（Mobile Push Notifications）：

```
Reach=10,000，Impact=massive(3)，Confidence=medium(0.8)，Effort=medium(5)
RICE = (10,000 × 3 × 0.8) / 5 = 4,800  → ≥1000，列为下季度高优
```

CSV 输入片段：

```csv
name,reach,impact,confidence,effort,description
User Dashboard Redesign,5000,high,high,l,Complete redesign
Mobile Push Notifications,10000,massive,medium,m,Add push support
Dark Mode,8000,medium,high,s,Dark theme option
```

假设模板：

```
We believe that 增加「保存支付方式」
For 回访客户
Will 提升结账完成率
判对：结账完成率提升 15%
判错：2 周后完成率持平，或保存支付方式采用率 < 20%
```

## 注意事项

- 组合理想配比参考：40% 速赢 / 30% 大赌注 / 20% 填充 / 10% 缓冲；每季度复审。预留约 20% 产能给技术债与意外。
- RICE 局限：不处理依赖、可能低估平台投入、Reach 估算易被操纵；必要时配合「价值×工作量」矩阵与敏感性分析。
- 六大常见陷阱：方案先行（先理解问题再写 PRD）、分析瘫痪（给研究阶段设时间盒）、特性工厂（先定成功指标再开发）、忽视技术债（留 20% 产能）、干系人惊吓（周度异步更新+月度演示）、指标剧场（指标绑定用户价值而非虚荣数）。
- 访谈红线：绝不问「你会用吗」（人会对未来行为撒谎）、不问诱导性问题、关注过去行为与情绪反应（痛=机会）、定性需用定量校验。
- 框架选型：季度路线图=RICE+组合矩阵；Sprint 级=MoSCoW；快速对比=ICE；满意度归类=Kano；研究综合=JTBD+机会树；指标度量=HEART+特性指标。

## 互见

- `references/frameworks.md` —— RICE/MoSCoW/Kano/ICE/JTBD/机会解决树/North Star/HEART/漏斗/GTM 等完整框架。
- `references/prd_templates.md` —— 各场景 PRD 模板。
- `references/input-output-examples.md` —— 脚本输入输出示例。
- `assets/rice_input_template.csv`、`assets/prd_template.md` —— 可直接套用的输入模板。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
