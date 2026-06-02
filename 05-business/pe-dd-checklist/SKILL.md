---
name: pe-dd-checklist
title: 尽职调查清单生成跟踪
description: 当启动并购尽职调查、组织数据室审阅或跟踪待办尽调事项时使用；按标的行业/交易类型/复杂度生成分领域尽调清单与请求清单，并做状态跟踪、红旗升级与周报输出（默认 Excel 分页工作簿）；不适用于具体法律/税务文书起草、详细财务建模或上市合规申报。触发词：尽调清单、尽职调查、due diligence、数据室审阅、还缺什么、diligence tracker
domain: 商业/finance
triggers: [尽调清单, 尽职调查, 尽调跟踪, due diligence, dd checklist, 数据室审阅, data room, diligence tracker, 请求清单, 还缺什么, red flag, 红旗, QoE, 盈利质量]
tags: [due-diligence, checklist, data-room, private-equity, deal-tracking, red-flag, finance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Excel, QoE, Due Diligence Checklist, Status Tracker, Red Flag Log]
requires: []
related: [ma-playbook, deal-closing-checklist, pe-portfolio-monitoring, diligence-issue-extractor]
combines_with: [ic-investment-memo, ma-buyer-list, ib-deal-tracker]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

当一笔并购/PE 交易进入尽调阶段，需要把「该查什么、查到哪、还缺什么、踩了哪些红旗」结构化成一份可跟踪的活清单时使用，典型场景：

- 启动尽调（kick-off）：按标的行业、交易类型、复杂度一次性生成全领域尽调清单与卖方请求清单（request list）。
- 组织数据室（data room）审阅：用清单逐项核对数据室内容，定位缺口。
- 过程跟踪：回答「我们还缺什么」「哪些 P0 卡着 LOI/交割」，并维护红旗清单与给交易团队的周报。

不该用的边界：

- 不起草 SPA/LOI/term sheet 等法律文书，也不做税务筹划落地或上市公司合规披露 —— 本清单只标问题与请求项，正式条款交专业法务/税务。
- 不替代详细财务建模与估值 —— QoE 等只列为待办项，建模交财务团队（见 `startup-financial-modeler`）。
- 不是交易决策框架 —— 「买 vs 自建」「估值区间」「整合计划」走 `ma-playbook`。

判据一句话：**先 Scope（标的+交易类型+复杂度+已知顾虑+时间线），否则别急着拉清单。**

## 步骤

1. **Scope 尽调**：向用户确认五项 —— 标的（名称/行业/商业模式）、交易类型（平台型收购/加购 add-on/成长股权/资本重组 recap/分拆 carve-out）、交易规模与复杂度（决定尽调深度）、已知关键顾虑（客户集中度、监管、环保等，需优先）、时间线（LOI/交割目标日）。
2. **生成分领域清单**：覆盖财务/商业/法务/运营/人力/IT 技术/环境 ESG 七大领域（见「指令」），并按行业追加专项项。
3. **状态跟踪**：每项打上 领域 / 优先级 / 状态 / 负责人 / 备注，用统一状态机推进（见「指令」表）。
4. **红旗汇总**：维护一份持续更新的红旗清单，每条记录 发现内容 / 所属领域 / 严重度（deal-breaker 致命 / significant 重大 / manageable 可控）/ 缓解或解决路径 / 对估值与交易条款的影响。
5. **输出**：默认生成 Excel 工作簿（每领域一个分页 tab）+ 汇总看板（各领域完成度 %、未决事项、红旗）+ 给交易团队的周更状态格式。

## 指令

七大领域尽调清单（按需勾选，按行业增删）：

- **财务尽调**：盈利质量 QoE（收入与 EBITDA 调整项）、营运资本分析（标准化 vs 实际）、债务及类债务项、资本开支（维护性 vs 增长性）、税务结构与敞口、审计历史与会计政策、备考调整（run-rate、协同）。
- **商业尽调**：市场规模与增速（TAM/SAM/SOM）、竞争定位与市占、客户分析（集中度/留存/NPS）、定价权与合同结构、销售管道与在手订单、go-to-market 有效性。
- **法务尽调**：公司结构与组织图、重大合同（客户/供应商/合作）、诉讼历史与未决索赔、IP 组合与保护、监管合规、雇佣协议与竞业禁止。
- **运营尽调**：管理团队评估、组织结构与关键人风险、IT 系统与基础设施、供应链与供应商依赖、设施与不动产、保险覆盖。
- **人力尽调**：组织图与人数趋势、薪酬对标、福利与养老金义务、关键员工留任风险、文化评估、工会/劳工协议。
- **IT 技术尽调**（科技型业务）：技术栈与架构、技术债评估、网络安全态势、数据隐私合规（GDPR/CCPA/SOC2）、产品路线图与研发投入、可扩展性评估。
- **环境/ESG**（适用时）：环境责任、监管合规历史、ESG 风险与机会。

状态机（每项推进路径）：

| Item | Workstream | Priority | Status | Owner | Notes |
|------|-----------|----------|--------|-------|-------|
| QoE 报告 | 财务 | P0 | Pending | | |
| 客户访谈 | 商业 | P0 | In Progress | | 10 个完成 3 个 |

状态选项：`Not Started → Requested → Received → In Review → Complete → Red Flag`

行业专项追加项（按 sector 自动补充）：

- **软件/SaaS**：ARR 质量、cohort 分析、托管成本、SOC2。
- **医疗健康**：监管审批、支付/报销风险、payor mix（付款方结构）。
- **工业**：设备状况、环境修复、安全记录。
- **金融服务**：监管资本、合规历史、信贷质量。
- **消费**：品牌健康度、渠道结构、季节性、库存管理。

## 示例

某 PE 平台型收购一家 SaaS 标的，启动尽调：

1. Scope：交易类型=平台型收购；规模中等、复杂度中；已知顾虑=客户集中度；时间线=8 周内签 LOI。
2. 生成清单：七大领域 + SaaS 专项（ARR 质量、cohort、托管成本、SOC2）。
3. 标优先级：QoE 报告、客户集中度核验、核心 IP 归属 = P0（gating 到 LOI）。
4. 跟踪：客户访谈 10 个完成 3 个，状态置 In Progress；卖方迟迟不给客户合同 → 备注预警（响应慢常预示问题）。
5. 红旗：单一客户占收入 38% → severity=significant，缓解=降价+earnout 保护，影响=估值下调；核心 IP 由创始人个人持有 → severity=deal-breaker，路径=交割前完成 IP 转让。
6. 输出：Excel 每领域一 tab + 汇总看板（财务 60% / 商业 30% 完成、2 条红旗），周一发交易团队周报。

## 注意事项

- **P0 优先**：先推进对 LOI/交割构成 gating 的 P0 项，别被低优先级项淹没。
- **响应速度即信号**：卖方对某项迟迟不响应，往往预示底下有问题，标记预警。
- **数据室对账**：始终把数据室实际内容与清单逐项交叉核对以发现缺口。
- **活文档**：清单随尽调推进持续更新，不是一次性产物。
- 本清单只列问题与请求项；正式法律/税务/合规与详细估值建模交专业团队。

## 互见

- requires：`ma-playbook` —— 先定交易战略理由与整体打法，再用本清单系统化执行尽调
- related：`deal-desk-reviewer` —— 交易审查与定价/条款把关
- related：`startup-financial-modeler` —— QoE 等财务待办项落地为估值模型
- related：`market-sizing-analyst` —— 商业尽调中 TAM/SAM/SOM 测算
- combines_with：`cfo-financial-advisor` —— 财务领域红旗的深挖与影响评估
- combines_with：`board-deck-builder` —— 尽调发现与红旗汇总成投委会/董事会材料

本条采编自 anthropics/financial-services（Apache-2.0）。
