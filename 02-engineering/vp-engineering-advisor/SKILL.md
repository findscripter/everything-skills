---
name: vp-engineering-advisor
title: 工程副总裁顾问（DORA 交付效能）
description: 当 sprint 速度下滑、研发招聘漏斗失灵、团队结构不清或纠结何时增设技术负责人/工程经理时使用；产出 DORA 四指标诊断+瓶颈定位、招聘漏斗各级转化与缺口、squad/chapter/tribe 结构与扩编触发阈值、生产纪律审计的可执行整改计划；不适用于架构/技术选型决策（属 CTO 职责）与日常值班事故协调（属工程负责人）。触发词：DORA、交付效能、招聘漏斗
domain: 研发/architecture
triggers: [DORA 四指标, 部署频率/变更前置时间/MTTR/变更失败率, sprint 速度下滑、交付变慢, 研发招聘漏斗、time-to-fill、流水线缺口, squad/chapter/tribe 团队结构、Spotify 模型, 何时增设技术负责人/工程经理（manager-trigger）, on-call 值班、部署节奏、无责复盘文化, 周期时间与交付瓶颈定位]
tags: [研发管理, 交付效能, dora, 工程招聘, 团队结构, 生产纪律, 工程副总裁]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [delivery_throughput_analyzer.py, eng_hiring_funnel_calculator.py, eng_team_structure_designer.py]
requires: []
related: [coo-operations-advisor, cpo-product-advisor, org-health-diagnostic, developer-experience-optimizer]
combines_with: [deployment-engineer, enterprise-project-manager, developer-experience-optimizer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

面向创业公司的工程副总裁（VPE），或尚无 VPE、需要自己拍板交付运营的创始人/CTO。聚焦四个决策，而非泛泛的工程体检：

1. 交付吞吐是否健康？——DORA 四指标 + 瓶颈定位（活儿卡在哪里等）
2. 如何扩大研发招聘漏斗？——漏斗算术 + 流水线缺口 + time-to-fill 纪律
3. 团队怎么组织、何时增设技术负责人/工程经理？——squad/chapter/tribe 设计 + 扩编触发阈值
4. 生产纪律是否到位？——值班轮转、部署节奏、无责复盘文化

不该用的边界：
- 不是 CTO 技能。CTO 负责「造什么」（架构、扩展悬崖、自研 vs 采购）；VPE 负责「如何可靠地交付」（交付、招聘、团队结构、生产运营）。早期常是同一人，规模化后是两个角色。
- 不替代「工程负责人/engineering-lead」。后者负责日常事故与值班协调；VPE 负责其执行的那套运营模型。

## 步骤

### 决策 A：交付吞吐健康度复盘（约 4 小时）
1. 拉取 sprint 指标：部署频率、变更前置时间、MTTR、变更失败率。
2. 运行分析器得出每项 DORA 评级，并定位最长等待段（瓶颈）。
3. 与 CTO 顾问交叉核对架构层面的成因。
4. 产出 90 天整改计划：单一瓶颈、单一负责人。

### 决策 B：招聘漏斗诊断（约 1 天）
1. 从 ATS 拉取近 90 天漏斗数据。
2. 运行计算器，得出每级转化率、time-to-fill 与流水线缺口。
3. 找出转化最差的一级（漏点就是答案）。
4. 计算下季度招聘目标所需的漏斗顶部候选人量。
5. 与 CHRO（薪酬/职级竞争力）、CFO（单位招聘成本上限）交叉核对。
6. 产出 top-3 整改项 + 渠道多元化计划。

### 决策 C：团队结构审计（约 1 天）
1. 构建 team.json：人数、工作流、经理数、IC 分布。
2. 运行设计器得出结构建议 + 扩编触发判断。
3. 核对 manager-trigger 阈值（5-7 IC 规则）与 squad 规模（5-9 人区间）。
4. 与 CTO 交叉核对 Conway 定律对齐。
5. 产出结构建议 + 经理招聘计划。

### 决策 D：生产纪律审计（约 1 周）
1. 盘点值班覆盖、各严重级别事故频率、MTTR 趋势。
2. 确认每个面向客户的服务都有 SLO 与错误预算。
3. 复查最近 5 份复盘：是否无责？行动项是否闭环？
4. 将部署节奏与 DORA 评级对照。
5. 产出生产纪律成熟度评分 + 90 天改进计划。

## 指令

三个分析脚本，均可零参数跑内置样本，或传入自有 JSON：

```bash
# 决策 A：DORA 四指标 + 瓶颈定位
python scripts/delivery_throughput_analyzer.py                      # 内置 sprint 样本
python scripts/delivery_throughput_analyzer.py path/to/sprint_metrics.json

# 决策 B：招聘漏斗健康度 + 流水线缺口
python scripts/eng_hiring_funnel_calculator.py                     # 内置 3 季度样本
python scripts/eng_hiring_funnel_calculator.py path/to/funnel.json

# 决策 C：团队结构建议 + 扩编触发
python scripts/eng_team_structure_designer.py                      # 内置 25 人样本
python scripts/eng_team_structure_designer.py path/to/team.json
```

先问的关键问题（开场即问）：
- 周期时间是多少？活儿主要卡在哪一段等待？（不知道就无法改进。）
- 从 commit 到生产多久？（DORA「变更前置时间」，团队整体健康度最佳预测指标。）
- 逃逸率多少？（生产中发现的 bug vs CI/预发拦截。>15% 说明质量纪律已破。）
- 工程经理上次写代码是什么时候？（经理完全无法 review 代码，则经理-IC 配比已失衡。）
- 漏斗各级转化率多少？（投递→筛选→onsite→offer→接受，漏点即答案。）
- 值班怎么排、谁在排？（总是同 3 个人被 page，说明运营模型坏了。）

### DORA 四指标评级表

| 指标 | 衡量 | Elite | High | Medium | Low |
|---|---|---|---|---|---|
| 部署频率 | 代码多久进一次生产 | 每天多次 | 每天-每周 | 每周-每月 | <每月 |
| 变更前置时间 | commit→生产 | <1 小时 | 1 天-1 周 | 1 周-1 月 | >1 月 |
| 平均恢复时间 MTTR | 事故发现→解决 | <1 小时 | <1 天 | 1-7 天 | >7 天 |
| 变更失败率 | 引发事故的部署占比 | 0-15% | 16-30% | 16-45% | 46-60% |

瓶颈定位：周期时间 =（PR 创建→首次 review）+（review→批准）+（批准→合并）+（合并→部署），最长那段就是瓶颈。常见瓶颈与对策：PR review 排队→评审轮转 + SLA；测试不稳定（flaky）→ flaky 预算 + 隔离；部署门禁（人工审批/变更委员会）→渐进式发布 + 特性开关；数据库迁移（锁、维护窗口）→零停机迁移模式。

### 招聘漏斗与算术
标准 7 级转化基准：投递→Sourcer 30-50%；Sourcer→Recruiter 50-70%；Recruiter→招聘经理 60-80%；招聘经理→技术面 70-85%；技术面→onsite 全场 30-50%；onsite→offer 25-40%；offer→接受 70-90%。漏斗算术：要招 N 人，漏斗顶部需 N /（各级转化率连乘）个候选人。示例：端到端约 0.7% 时，招 4 人需顶部约 570 名候选人。「招不到好工程师」通常意味着顶部体量过低或筛选标准有误。

### 团队结构与扩编阈值
三轴模型（源自 Spotify，按现实修正）：Squad = 5-9 人自治小队，端到端拥有某服务/产品域；Chapter = 横跨 squad 的职能条线（后端/前端等），用于技能发展而非归属；Tribe = 朝共同目标协作的一组相关 squad。

| 阶段 | 结构 |
|---|---|
| 1-5 人 | 一个团队，无结构 |
| 6-15 人 | 2-3 个非正式 pod，创始 CTO 仍能认识每个人 |
| 16-40 人 | 4-6 个 squad，首位工程经理入职，chapter 显现 |
| 41-100 人 | 2-3 个 tribe，引入工程总监层，chapter 正式化 |
| 100+ 人 | 多 tribe + 每 tribe 设 group EM/总监；VPE + 总监 + EM + 技术负责人 |

manager-trigger 阈值：5-7 名 IC 无经理 = 首位 EM（招或内部晋升）；3+ EM 无总监 = 招总监；单 tribe 内 8+ 团队 = 拆分 tribe。

### 生产纪律四支柱
值班轮转（每轮≥6 人，主 + 备，避免倦怠）；事故响应（runbook、严重级别定义、无责复盘）；部署节奏（持续部署或定期发布皆可，「突袭式发布」不行）；SLO 纪律（每个面向客户的服务都有书面 SLO + 错误预算）。

## 示例

输出格式遵循以下五段式：

```
结论：[一句话——决策与依据]
决策类型：[吞吐 | 招聘 | 结构 | 生产 之一]
证据：[来自工具的数字，而非形容词]
如何行动：[3 个具体下一步]
你的拍板：[只有创始人/CTO 能做的那个决定]
```

## 注意事项

- 用数字说话，不用形容词。每条结论都应能追溯到工具输出的具体指标。
- 「变更前置时间」是团队整体健康度的最佳单一预测指标，优先盯它。
- 逃逸率 >15% 说明质量纪律已破，先修质量而非堆速度。
- 90 天整改计划务必「单一瓶颈、单一负责人」，避免战线铺开导致无人负责。
- 招聘漏斗先修最漏的那一级，别同时动所有环节。
- squad 规模锚定 5-9 人，超出区间即为结构信号；不要为了组织图好看而切分。
- 工作流中提及的 `/cs:decide`、ATS 等为原技能上下游约定，落地时按本团队工具替换。

## 互见

- CTO 顾问 — 架构、扩展悬崖、技术债策略（CTO 定造什么，VPE 定怎么交付）。
- CHRO 顾问 — 全公司招聘体系（职级阶梯、薪酬带、leveling 量规）；VPE 负责研发专属漏斗执行。
- COO 顾问 — 全公司运营节奏；VPE 负责研发专属节奏。
- SLO 架构师 — SLO 设计（战术层）；VPE 负责「必须有 SLO」这条政策。
- 混沌工程 / 特性开关架构师 / K8s Operator — 战术层韧性、渐进式发布、基础设施。
- 工程负责人 — 日常事故与值班协调（VPE 负责其执行的运营模型）。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
