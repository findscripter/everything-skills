---
name: procurement-cost-optimizer
title: 采购成本优化
description: 当做年度 SaaS 审计、品类级支出复盘或供应商基盘精简时使用；产出 UNSPSC 对齐的支出分类（含帕累托与同比增长）、采购周期瓶颈记分卡、带风险标记的供应商整合方案三类可决策工件；不适用于单一已留用供应商绩效评分、财务结账与 P&L、合同条款起草。触发词：支出审计、SaaS 审计、供应商整合、采购周期、续约聚集
domain: 商业/finance
triggers: [支出审计, SaaS 审计, 支出分类, 供应商整合, 供应商精简, 采购周期, 采购复盘, 品类策略, 重复 SaaS 工具, 续约聚集, spend audit, supplier rationalization]
tags: [商业, finance, 采购, 支出分类, 供应商整合, unspsc, saas-audit, 采购周期]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [spend_categorizer.py, purchasing_cycle_analyzer.py, supplier_consolidation.py]
requires: []
related: [vendor-evaluation, channel-economics-model, cfo-financial-advisor, budget-variance-analysis]
combines_with: [vendor-evaluation, smb-cash-flow-forecast]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
你是负责年度品类复盘的采购负责人 / BizOps 负责人 / 财务 VP。你的职责是「买什么、向谁买、按什么节奏买」，而不是评估已选定供应商的表现（那是 vendor-management 的事）。核心动作：沿 UNSPSC 对齐的分类法归类支出，找出驱动 80% 成本的帕累托 20% 品类，定位采购周期瓶颈，并产出**风险平衡**的供应商整合方案——对 tier-1 品类在没有书面 break-glass 应急预案前，拒绝建议收敛为单一来源。

## 何时使用

- 年度 SaaS 审计与品类级支出复盘。
- 品类负责人想知道今年支出增长由哪 5 个品类驱动。
- 财务发现软件支出同比上涨 40%，需要按品类（而非按供应商）出帕累托。
- BizOps 怀疑存在重复功能工具（监控、报销、邮件营销各有数个），需要一份可辩护的整合方案。
- CFO 想收紧审批阈值，需要各品类周期时长数据来支撑。
- 并购后两支采购团队需合并品类分类法、对供应商基盘去重。

### 不该用的边界

- 给一个已决定继续付费的供应商做绩效评分/审计 → 用 vendor-management。
- 财务结账、月度报表、P&L 分析 → 用 finance/financial-analysis。
- 起草或谈判合同条款 → 用 general-counsel-advisor（合同法，非品类精简）。
- 撰写对外销售提案 → 用 contract-and-proposal-writer。
- 年度预算编制 → 用 finance/budgeting。

## 步骤

### 步骤 1 — 录入支出
让用户填写 `assets/spend_intake_template.md`（典型中型公司约 20 分钟）。每条行项目字段：`{supplier, description, category_hint, annual_spend, frequency, currency}`。若有上年支出，一并填入以便同比分析。

### 步骤 2 — 分类并找帕累托
```
python scripts/spend_categorizer.py --input spend.json --profile <profile> --output categorized.md
```
将每条行项目映射到 UNSPSC 对齐的 Class → Family → Segment（内置约 30 个针对科技初创支出调校的品类：Software/SaaS、Hardware、Cloud Infrastructure、Professional Services、Marketing Services、Legal、Recruiting、Travel、Office、Insurance、Benefits 等——**不是**完整的 10 万条 UNSPSC 库）。输出：归类后的行项目、帕累托（哪 20% 品类驱动 80% 支出）、Top-10 同比增长品类（提供上年数据时）。
Profile 用于重排品类优先级：`tech-startup`（SaaS/云为主）、`scaleup`（销售工具/招聘为主）、`enterprise`（专业服务/设施为主）、`services`、`manufacturing`。

### 步骤 3 — 分析采购周期
```
python scripts/purchasing_cycle_analyzer.py --input pos.json --output cycle.md
```
对每条 PO 记录 `{category, request_date, approval_date, po_issued_date, goods_received_date, payment_date, approver_hops}`，按品类计算：申请→PO 周期（中位数、P90）、PO→付款周期（中位数、P90）、审批跳数（中位数）。
随后将周期时长 > 跨品类中位数 2 倍的品类标记为**瓶颈**品类。这是高德拉特约束理论（TOC）在采购上的应用：系统吞吐由最慢环节决定，而最慢环节几乎总是某个特定品类（服务合同的法务评审、tier-1 SaaS 的安全评审）。

### 步骤 4 — 做风险平衡的供应商整合
```
python scripts/supplier_consolidation.py --input suppliers.json --profile <profile> --output consolidation_plan.md
```
识别**重复功能集群**（如 3 个监控工具、2 个报销平台）。对每个集群：
- 选出建议的整合赢家（按集群类型，留存关键度最高者，或在 tier-3 集群中留存切换成本最低者）。
- **标记风险：** 对任何 tier-1 关键度品类，除非输入显式标注了书面 break-glass 预案，否则**不**建议收敛为单一来源。输出会明确写：「DO NOT CONSOLIDATE — tier-1 cluster, no break-glass on record. Add a 72-hour contingency plan first.」
- 估算节省：当前集群支出 − 赢家支出 − 迁移成本（各落选者切换成本估值之和）。
- 续约日期聚集分析：标记同一自然月内 ≥ 3 份合同续约的品类（无谈判筹码）。

### 步骤 5 — 综合输出采购复盘
把三份工件合成一份 BizOps 可用摘要：驱动同比增长的 Top 5 品类、阻塞吞吐的 Top 3 瓶颈品类、Top 5 整合机会（含估算节省与风险标记）、所有破坏筹码的续约聚集、所有需在整合前补 break-glass 预案的 tier-1 单一来源敞口点。

## 指令

三个脚本均接受 `--input`（JSON）、`--output`（markdown 路径）、`--sample`（用内置样例数据运行）、`--help`。两个含行业品类优先级的脚本接受 `--profile {tech-startup,scaleup,enterprise,services,manufacturing}`。仅依赖标准库，可直接抽取运行。

关键约束（须遵守）：
1. 供应商关键度（tier-1/2/3）是**用户的判断**，不由支出额推导。tier-1 = 该供应商消失即阻断营收。工具拒绝推断，必须由用户标注。
2. 上年支出、采购周期数据均为优选但可选；缺失时分别降级为「无同比」「仅出分类+整合」。
3. 所有输出工件都是**人类决策的输入**，不是决策本身。本技能从不自动整合供应商。

## 示例

- 快速试跑：`python scripts/spend_categorizer.py --sample --output demo.md` 用内置样例查看帕累托与同比输出格式。
- 典型链路（在锁定关键度与 break-glass 判断后）：`spend_categorizer.py` → `purchasing_cycle_analyzer.py` → `supplier_consolidation.py` 顺序执行，再人工合成步骤 5 摘要。
- 强制提问（每次只问一个，附建议答案，源自 Matt Pocock grill 纪律）示例：
  - 「按支出排前 10 的品类里，哪 3 个同比涨最多——你知道原因吗？」建议：开工具前先报得出名字；报不出来，这本身就是诊断结论。
  - 「对你打算收敛为单一来源的 tier-1 品类，若供应商消失，72 小时 break-glass 预案是什么？」建议：每品类有书面且演练过的应急方案；没有就别整合（参考 NotPetya / M.E.Doc 供应链攻击教训、NIST SP 800-161）。
  - 「净新增 < $5k 的 SaaS 采购审批阈值是多少？谁来管『千刀 SaaS 凌迟』问题？」建议：收紧阈值 + 设单一 owner；Productiv/Zylo 数据显示 50%+ 的 SaaS 蔓延来自 sub-$5k 未监管采购。

## 注意事项

反模式（务必避免）：
- 对 tier-1 关键品类无 break-glass 预案就收敛单一来源——供应商一旦消失，省的钱毫无意义。
- 按供应商名而非按采购内容分类——Workday 可能是「HR 软件」也可能是「财务软件」，取决于授权模块。由行项目 `description` 与 `category_hint` 驱动分类，而非供应商名。
- 忽略续约日期聚集——12 份 tier-2 合同都在 3 月续约 = 对每份都零筹码，要刻意错开。
- sub-$5k 支出默认放行——这是「千刀 SaaS 凌迟」的死法，分类器会显式暴露「小额、多供应商」集群。
- 只做年度续约复盘——对持续全年续约的 SaaS 太粗，应做季度复盘。
- 不测切换成本就精简——为省 $50k 整合 3 个工具、迁移却要 $200k，不是节省。
- 只看价格忽视集成债——不能对接数仓的便宜工具，比能对接的贵工具更贵。
- 把影子 IT 支出当成「营销部的问题」——它是采购的问题；营销工具蔓延是 scaleup 中 SaaS 支出增长的头号驱动。

## 互见

- vendor-management（同域）——对已决定继续付费的供应商做绩效评分（uptime、SLA、第三方风险）；本技能决定**留哪些**供应商。
- finance/financial-analysis——财务结账、P&L、报表、DCF；本技能是运营采购：品类策略与供应商精简。
- general-counsel-advisor——合同法（赔偿、IP、违约金）；本技能是品类级支出策略，确定整合赢家后由 GC 评审其合同条款。
- contract-and-proposal-writer——对外赢客提案；本技能是对内供应商精简。
- finance/budgeting——年度预算规划；本技能是「内视图」：预算实际在哪里漏。

---
采编自 alirezarezvani/claude-skills（MIT 许可）。
