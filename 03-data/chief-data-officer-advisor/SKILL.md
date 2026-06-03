---
name: chief-data-officer-advisor
title: 首席数据官顾问（数据产品与治理）
description: 当为创业公司做四类数据战略决策（训练数据权利、数据架构选型、客户数据资产估值/并购、数据团队序列）时使用；输出 GO/缓解/NO-GO 判定、架构与自建外购方案、风险调整估值与招聘路线图；不适用于 schema 设计、可观测性、查询优化、RAG/ML 平台等战术工程实现。触发词：CDO、数据战略、数据网格/湖仓、训练数据权利、数据资产估值
domain: 数据/analysis
triggers: [CDO, 首席数据官, 数据战略, 训练数据权利, 同意来源/consent provenance, 数据网格 data mesh, 湖仓 lakehouse, 奖牌架构 medallion, 数据产品, 数据变现/productization, 客户数据资产, 并购数据尽调 M&A, 自建还是外购 build-vs-buy, 数据团队招聘序列, 集中还是嵌入 centralize-vs-embed, k-匿名/差分隐私, GDPR 第6条 合法性基础, EU AI Act 高风险]
tags: [数据战略, 数据治理, 数据架构, 数据产品, 训练数据合规, 并购尽调, 团队组织, c级顾问, strategy]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [ai_training_data_audit.py, data_product_strategy_picker.py, data_asset_valuator.py]
requires: []
related: [data-strategy-review, chief-ai-officer-advisor, data-pipeline-engineer]
combines_with: [data-strategy-review, data-quality-frameworks, kpi-dashboard-design]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

为创业公司 CDO（或没有 CDO 的创始人）提供战略级数据领导力，只解决**四类决策、不做调研问卷**：

1. **能否用这份数据训练我们的模型？** —— 来源 × 同意 × 用例 三维矩阵，逐项产出 GO / 缓解 / NO-GO。
2. **仓库、湖仓还是网格，哪些自建哪些外购？** —— 由阶段驱动的架构选型 + 分层 build-vs-buy。
3. **我们的客户数据值多少钱？** —— 战略价值评分 + 并购倍数 + 产品化路径 + 风险调整估值。
4. **下一个数据岗位招谁？** —— 阶段到角色映射 + 集中/嵌入触发点。

**不该用的边界**：本技能**不覆盖战术数据工程**。schema 设计、可观测性、查询优化、RAG、ML 平台落地，请转 `database-designer` / `observability-designer` / `data-quality-auditor` / `sql-database-assistant` / `rag-architect` / `llm-cost-optimizer`。本技能只做战略决策与权衡呈现，不替代法律审查。

## 步骤

**先问这几个关键问题**（答不上来就别急着上工具）：
- 这份数据驱动的是哪个决策？（如果没有，为什么还在收集？）
- 每个想训练的数据源，其**同意来源（consent provenance）**是什么？（仅凭 TOS ≠ 明确 opt-in。）
- 内部数据消费者是谁、跨多少个不同业务域？（决定集中/嵌入与仓库/网格。）
- 在并购情景下，我们的数据是护城河还是负债？（MSA 里的客户排除条款会直接翻转答案。）
- 下一个招分析工程师还是数据科学家？（解决的问题完全不同，创始人常混淆。）
- 对外共享前是否跑过匿名化审计？（k-匿名 ≥ 5 是底线不是上限。）

**四个工作流**（择需执行，结尾统一用 `/cs:decide` 记录决策）：

- **工作流 1 · AI 训练决策（约 1 小时）**：构建 `sources.json`（每个数据源一条）→ 跑审计 → 每个「缓解」指派负责人+整改项 → 每个 NO-GO 记录 kill 理由入法务日志 → 与 `general-counsel-advisor` 复核 Top-3 缓解项。
- **工作流 2 · 架构决策（约 1 天）**：跑 `data_product_strategy_picker.py profile.json` → 与 `cto-advisor` 复核工程产能、与 `cfo-advisor` 复核 3 年 TCO → 签多年 SaaS 合同前可 `/cs:freeze 90`。
- **工作流 3 · 并购数据资产估值（约 3 天）**：盘点语料（规模/新鲜度/独占性/客户重叠/合同限制）→ 跑估值器 → 走 M&A 尽调清单 → 把合同排除条款交法务做重签计划 → 选定产品化路径（行业基准报告 / 嵌入端点 / 直接授权）。
- **工作流 4 · 数据团队路线图（约 1 周）**：列出今天因缺数据/分析而无法做的 Top 5 决策 → 每个决策映射到解锁它的角色 → 按一次一个、ramp 后再招的节奏排序 → 与 `chro-advisor` 复核 comp band 与 leveling → 标出集中/嵌入触发日期。

## 指令

```bash
# 1. 审计数据源的 AI 训练资格（来源×数据类别×用例 → GO/缓解/NO-GO）
python scripts/ai_training_data_audit.py                 # 用内置样例
python scripts/ai_training_data_audit.py path/to/sources.json

# 2. 选架构 + 分层自建/外购 + 招聘序列
python scripts/data_product_strategy_picker.py           # 用内置 A 轮 SaaS 样例
python scripts/data_product_strategy_picker.py path/to/profile.json

# 3. 评估客户数据语料价值 + 产品化可行性
python scripts/data_asset_valuator.py                    # 用内置 B2B 样例
python scripts/data_asset_valuator.py path/to/corpus.json
```

**被 `cs-cdo-advisor` 调用时的输出格式**：
```
**结论（Bottom Line）：** [一句话——决策与理由]
**这个决策是：** [四类框架之一]
**证据：** [用数字，不用形容词]
**怎么做：** [3 个具体下一步]
**你来拍板的：** [只有创始人能做的那个决定]
```

## 示例

**训练数据权利三维矩阵**（每种组合产出 GO / 缓解 / NO-GO）：

| 维度 | 取值 |
|---|---|
| **来源 Origin** | 1st-party 明确 opt-in / 1st-party 仅 TOS / 伙伴授权 / 抓取 scraped / 合成 synthetic |
| **数据类别** | 匿名聚合 / 行为 / PII / 第三方内容 / 受监管（PHI、PCI、儿童）|
| **用例 Use case** | 产品内个性化 / 微调自有模型 / 训练基础模型 / 对外共享 |

完整矩阵 + GDPR 第 6 条合法性基础决策树 + EU AI Act 高风险触发项见 `references/ai_training_data_rights.md`。

**架构由阶段驱动，而非偏好驱动**：
- **仅仓库**（Snowflake/BigQuery/Postgres）：≤5 个数据消费者、<2TB、无 ML 用例。
- **湖仓 Lakehouse**（仓库 + 对象存储，常用 Databricks 或 Snowflake+Iceberg）：5–25 个消费者、2TB–1PB、1–3 个 ML 用例。
- **数据网格 Mesh**：25+ 消费者跨 4+ 业务域，且已具备联邦化所有权文化。

**分层 build-vs-buy**（关键约束，逐层判定）：

| 层 | 默认外购，除非 | 仅当…才自建 |
|---|---|---|
| 存储/仓库 | 永不自建 | 你就是数据基础设施公司 |
| ELT/接入 | 永不自建 | Fivetran/Airbyte 不支持该源 |
| 建模（dbt）| 永远自建 | 这是你的 IP |
| BI/看板 | <100 消费者时外购 | 给客户的嵌入式分析 |
| 特征存储 | 推迟到 3+ 生产模型 | 届时自建或买 Tecton/Hopsworks |
| ML 平台 | 推迟到 5+ 生产模型 | 届时买 SageMaker/Vertex/Databricks |

**客户数据既是资产也是负债**：B 轮后客户数据可成为护城河、并购倍增器（对战略买家 1.2x–2x ARR 提升）、或直接收入流；但 47/380 客户带 MSA 排除条款会使产品化在法律上不可行，匿名化审计常暴露超阈值的再识别风险，监管暴露随产品化线性上升（GDPR 第 28 条处理者 vs 第 26 条共同控制者）。

**阶段到角色映射**（B2B SaaS 基线）：种子前=创始人当分析师（SQL+表格）→ A 轮=分析师 → 分析工程师(dbt) → B 轮=数据工程师 → GTM 内嵌资深分析师 → 数据 PM（3+ 团队需数据时）→ 增长期=分析经理 → ML 工程师 → 数据负责人 → 晚期=数据负责人/CDO → 按域联邦化所有者（mesh）。**集中/嵌入触发**：当 3+ 职能域（销售、市场、产品、运营、CS）每周都需要定制数据时，中央团队成为瓶颈，应在演变成招聘危机前转向 hub-and-spoke（中央平台 + 内嵌分析师）。

## 注意事项

- 触及训练数据权利、数据产品化、并购数据尽调的决策，应引入合格法律顾问；本技能只呈现决策与权衡，不替代法律审查。
- 仅凭服务条款（TOS）不等于明确 opt-in，训练资格不要默认 GO。
- 匿名化对外共享：k-匿名 ≥ 5 是底线非上限；估值前务必先跑再识别审计。
- 架构与角色都是阶段函数，不要因偏好跳级（如未到 25+ 消费者/4+ 域就上 data mesh）。
- 招聘一次一个角色，ramp 稳定后再招下一个；先定义「解锁哪个决策」再定岗位。

## 互见

- `cto-advisor` —— 架构产能、扩展悬崖
- `ciso-advisor` —— 数据安全、产品化数据的威胁建模
- `general-counsel-advisor` —— 合同约束、DPA、训练数据权利
- `cfo-advisor` —— build-vs-buy TCO、并购估值测算
- `chro-advisor` —— 数据团队招聘、leveling、薪酬
- `database-designer` / `rag-architect` / `llm-cost-optimizer` —— 战术 schema 设计 / AI-RAG 落地 / 模型成本管理

---
采编自 alirezarezvani/claude-skills（MIT 许可）。
