---
name: data-strategy-review
title: 数据战略决策审查
description: 当任何计划触及训练数据、数据架构、数据产品化或数据团队招聘时使用；以六个 CDO 拷问对计划做决策导向的压力测试，产出含审查结论（SHIP/SHARPEN/BLOCK）与下一步的结构化审查报告；不适用于纯数据清洗、SQL 取数、ETL 实现等执行层任务；触发词：数据战略审查、CDO 审查、cdo review、data strategy review、训练数据合规、consent provenance、数据架构选型、warehouse lakehouse mesh、数据产品化、data monetization、M&A 数据尽调、数据团队招聘
domain: 数据/analysis
triggers: [数据战略审查, CDO 审查, cdo review, data strategy review, 训练数据合规, consent provenance, 数据架构选型, warehouse lakehouse mesh, 数据产品化, data monetization, M&A 数据尽调, 数据团队招聘]
tags: [data-strategy, analysis, governance, data-architecture, ml-training, compliance, decision-review]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, ai_training_data_audit.py, data_product_strategy_picker.py, data_asset_valuator.py]
requires: []
related: [chief-data-officer-advisor, chief-ai-officer-advisor, data-pipeline-engineer]
combines_with: [chief-data-officer-advisor, data-quality-frameworks, kpi-dashboard-design]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

在对任何触及数据战略的计划「拍板前」运行本审查，扮演决策导向的首席数据官（CDO），用六个强制问题压力测试该计划。典型触发场景：

- 批准使用客户数据的新 ML 模型训练前
- 签订多年期数据基础设施 SaaS 合同（Snowflake、Databricks、Fivetran）前
- 把客户数据产品化（基准报告、embedding 接口、数据授权）前
- 关键数据岗位招聘（数据负责人、CDO、数据 PM、ML 工程师）前
- 启动并购数据尽调（无论买方还是卖方）前
- 当有人把「变现 / monetize」与「数据」放在一起说时

**不该用边界**：本条只做战略级决策拷问与放行判断，不负责落地执行。纯数据清洗、SQL 取数、ETL 管线编写、报表实现等动手任务请改用对应执行类技能（见互见）。

## 步骤

1. **定位决策类型**：先用一句话确认这是四类 CDO 决策中的哪一类——训练（training）/ 架构（architecture）/ 资产（asset）/ 招聘（hire）。决策类型决定后续跑哪些脚本。
2. **逐条回答六个 CDO 问题**（见下「指令」），每条都要落到具体业务结论，拒绝「以后可能用得上」「感觉像护城河」这类非决策答案。
3. **按需运行脚本**：涉及 AI 用例跑训练审计；涉及改技术栈跑架构选型；涉及产品化或并购前跑资产估值。
4. **输出结构化报告**：按下方「输出格式」汇总，给出 SHIP / SHARPEN / BLOCK 裁决与三条具体下一步。

## 指令

六个 CDO 强制问题：

1. **这份数据驱动什么决策？** 若没有任何决策被解锁，就别采集 / 训练 / 产品化它。真正的答案必须指名一个需要此数据的具体业务判断。
2. **每个数据源的同意来源（consent provenance）是什么？** 逐源列出：来源、同意流程、数据分类、预期用途。「仅 1st-party-TOS」弱于「1st-party 显式 opt-in」；打包式 TOS 不覆盖实质性新用途（如用 PII 训练基础模型）。范围内含 AI 用例时运行 `ai_training_data_audit.py`。
3. **内部谁在消费？跨多少个不同职能域？** 这决定「集中 vs 嵌入」「仓库 vs 数据网格」：<5 个消费方→仅 warehouse；5–25→lakehouse；25+ 且联邦式文化→mesh。**过早选架构是数据团队倦怠的头号原因。**
4. **并购尽调影响如何？** 设想收购方明天就来问这套数据语料：是否有书面匿名化流程？多少比例客户有 MSA 例外条款？训练数据来源日志是否最新？建议每季度运行 `data_asset_valuator.py`。
5. **去掉这个数据源，模型 / 决策 / 报告还能重训 / 重跑 / 重发吗？** 能→爆炸半径低，同意姿态以后可改；不能→爆炸半径高，已结构性绑定该源，须更严格审查。
6. **解锁这件事需要什么岗位？是不是正确的下一招？** 该招分析工程师却招了数据科学家＝12 个月生产力损失。把「被解锁的决策」映射到具体岗位，并确认前置岗位已就位（ML 工程师前先有数据工程师，数据科学家前先有分析师）。

按需运行的脚本（路径相对原 skill）：

```bash
# 1. AI 训练审计（任何 ML / AI 用例）
python ../../../skills/chief-data-officer-advisor/scripts/ai_training_data_audit.py sources.json

# 2. 架构决策（改技术栈时）
python ../../../skills/chief-data-officer-advisor/scripts/data_product_strategy_picker.py profile.json

# 3. 数据资产估值（产品化或并购前）
python ../../../skills/chief-data-officer-advisor/scripts/data_asset_valuator.py corpus.json
```

## 示例

输出报告固定格式：

```markdown
# CDO 审查：<计划>
**日期：** YYYY-MM-DD

## 正在做的决策
[一句话——四类之一：训练 | 架构 | 资产 | 招聘]

## 训练审计（如适用）
- NO-GO 源：N    MITIGATE 源：N    GO 源：N
- 首要整改项：<一行>

## 架构（如适用）
- 建议：WAREHOUSE / LAKEHOUSE / MESH
- 自建 vs 采购：<一行>    叫停标准：<何时重新评估>

## 资产价值（如适用）
- 战略价值：X/10 | 护城河：STRONG / MEDIUM / WEAK
- 并购倍数：X.Xx – X.Xx ARR    产品化路径：<名称>

## 组织（如适用）
- 下一招：<岗位>    为何是它而非别的：<一行>    前置岗位到位：是/否

## 裁决
🟢 SHIP | 🟡 SHARPEN | 🔴 BLOCK

## 下一步
[3 条具体行动]
```

## 注意事项

- **决策优先于数据**：任何回答都要落到一个具体业务决策，「可能用得上」「像护城河」一律视为未通过。
- **同意来源逐源核验**：打包 TOS 不等于对新用途（尤其基础模型训练 PII）的合法授权。
- **不要过早选架构**：先数清消费方数量与职能域，再决定 warehouse / lakehouse / mesh。
- **爆炸半径意识**：去掉某源仍能重跑＝低风险；强绑定某源＝高风险，须更严审查。
- **招聘排序**：缺前置岗位时招高阶岗等于浪费一年；按数据工程师→分析师→ML/数据科学家的次序补位。
- 多年期基础设施合同建议触发一次「冷静期 / freeze」，避免被供应商长期锁定。

## 互见

- 涉及把数据导出、清洗、整理为可分析格式：`csv-data-cleaner`
- 涉及取数 / 查询构造以验证「该数据驱动什么决策」：`sql-query-builder`
- 涉及 AI 训练数据合规审计中的事实与来源核验：`fact-checking`
- 涉及对「为何采集 / 训练此数据」做根因质询：`first-principles-thinking`
- 若需用 RAG 而非微调来满足数据用例，先评估 `rag-pipeline-builder`

---

本条采编自 alirezarezvani/claude-skills（MIT 许可）。
