---
name: saas-subscription-agreement-review
title: SaaS 订阅协议审查
description: 当审查 SaaS/订阅协议、需对自动续约、涨价、数据可携出、SLA、子处理者、AI 训练权与责任上限做专项把关并准备红线时使用；产出含双重严重度（法律风险×业务摩擦）的 SaaS 专项发现、续约登记字段移交与红线建议；不适用于通用合同评审（用 contract-playbook-review）、NDA 速审（nda-triage-reviewer）、DPA 专项（dpa-clause-reviewer）、出具正式法律意见；触发词：SaaS 审查、订阅协议、自动续约、auto-renewal、涨价条款、SLA、子处理者、数据可携出、AI 训练权
domain: 领域/legal
triggers: [SaaS 审查, 订阅协议, 自动续约, auto-renewal, 涨价条款, SLA, uptime, 子处理者, subprocessor, 数据可携出, data portability, AI 训练权]
tags: [legal, saas, subscription, contract-review, auto-renewal, sla, data-portability, ai-training-rights, redline]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pdf-form-filler, markdown-to-docx]
requires: []
related: [contract-playbook-review, ip-clause-review, dpa-playbook-review, vendor-agreement-redline-review]
combines_with: [contract-playbook-review, dpa-playbook-review, contract-renewal-tracker]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 在送签或谈判前审查 SaaS / 订阅类协议（供应商卖你平台，或你作为供应商卖给客户），需在通用合同评审之上，对 SaaS 特有「会咬人」的条款做专项把关。
- 关注点：钱随续约滚雪球、数据逐月沉淀、迁移成本逐月升高——审查须以「将来一定要离开这家供应商」为前提。

**先定本方立场**：对方是卖平台给你 → 你是采购方（their paper）；你是供应商、对方是客户 → 你是销售方（our paper）。立场决定每个 playbook 立场（责任上限方向、赔偿方向、续约/终止权）。reseller / 白标不明确时必须先问。

**不该用边界（命中即停或转更合适技能）：**
- 通用条款（责任、赔偿、终止、管辖）的对照评审 → 先跑 `contract-playbook-review`，本条只做 SaaS 叠加层。
- 单纯 NDA 速审 → `nda-triage-reviewer`；DPA 专项 → `dpa-clause-reviewer`。
- 不起草合同、不出具正式法律意见；所有结论须经合格律师复核。
- 无经律师审定的团队 playbook 立场时，**不得判可签**，应标注「仅按通用商业标准」或转人工。

## 步骤

1. **接收合同**：PDF/DOCX / CLM 链接 / 粘贴文本。PDF 扫描件可先用 `pdf-form-filler` 提取。
2. **定本方立场**（销售/采购），并加载团队 playbook 的 `SaaS positions`；本条不内置阈值，数字随交易规模、供应商话语权、风险偏好而变。playbook 未覆盖某项时，问用户立场并记录后再进行。
3. **辖区核查**：SaaS 条款（自动续约通知、涨价上限、数据可携出、子处理者）对辖区敏感，CA/NY/EU 规则分歧大，部分州有自动续约成文法可覆盖私约。合同选了别的准据法或跨辖区（EU 用户、CA 消费者）→ 必须标记 `[jurisdiction — verify]`，分析可能不可直接套用。
4. **逐项跑 SaaS 叠加层**（见「指令」六类 + AI/ML 七维 + 责任上限四维）。
5. **双重严重度**给每条发现打分，**续约日期与通知窗口无论是否触发都要抽取并记录**，移交续约登记。
6. **生成红线**：默认最小粒度编辑（改词 > 改短语 > 重构子句 > 换句 > 整条替换），整条替换须在交接信里说明。

## 指令

**SaaS 专项六类（逐项写出合同实际写法，再对照 playbook，不套用本条硬阈值）：**

| 类别 | 关键审查点 |
|---|---|
| 1 自动续约 | 续约期长度；取消通知窗口（提前 N 天）；通知方式（邮件/书面致法务/仅门户/挂号）；续约价格（同价/CPI 封顶/then-current list/不封顶自由裁量）。**抽取确切续约日期+通知窗口喂给续约登记** |
| 2 涨价 | 年度涨幅（固定%/CPI/不封顶）；超量计费（公示费率/溢价/未定）；「fees」范围（仅订阅 vs 宽泛「附加服务」） |
| 3 数据可携出与退出 | 导出格式（开放标准/有文档专有/「商业合理」）；可用性（自助随时/期内按请求/仅终止时）；终止后访问天数；导出成本（免费/T&M/按 GB-record）；删除证明。**供应商保留「匿名/聚合」衍生数据是实质立场，两个方向都要标记** |
| 4 SLA/可用性 | 仅当业务真依赖该服务才查，否则跳过、不为可有可无的工具耗谈判筹码。Uptime 承诺；测量周期；补救（service credit 如何算/是否封顶/是否唯一救济）；维护排除窗口；credit-唯一救济与责任上限的交互 |
| 5 子处理者 | 当前清单（公示/按请求/无）；变更通知期；异议权（阻断/通知即终止/仅通知/无）。SaaS 特殊在清单会随订阅周期变化 |
| 6 服务变更与下线 | 实质不利变更的终止权；所依赖功能的下线通知期；替代功能的价位与功能对等 |

**AI/ML 数据权决策（别只查「有无训练条款」，逐维过）**：①是否显式授予用客户数据/内容/使用数据做训练、模型改进；②是否经引用隐私政策/ToS 隐式授予（「依供应商不时更新的隐私政策」=埋雷；警惕「service improvement」「analytics」兜底与把日志/遥测从 Customer Data 定义中切出的「usage data」定义）；③匿名标准（无定义即弱，是否达 GDPR Recital 26 / HIPAA Safe Harbor，可逆否）；④竞争污染（供应商是否服务你的竞品，有无竞争隔离承诺）；⑤opt-out 范围与存续（是否覆盖全部 AI 用途、是否扛续约与 ToS 更新、按用户还是按组织）；⑥输出归属与第三方 LLM 子处理者（OpenAI/Anthropic/Google）；⑦下游监管链（EU AI Act 部署者义务、FTC §5）。七项全静默也是一条发现：「请求显式禁止或针对七维的明确 carve-out」。

**责任上限决策（金额是最不重要的部分，逐维过）**：①直接 vs 间接/后果性（12 个月直接损害封顶 + 间接不封顶，与 12 个月累计封顶是两码事，两者都要写明）；②cap base 逐字引用（「12 个月」可指索赔前 12 个月已付/当期应付/当前订单/历来全部，差一个数量级，含糊就标记）；③cap 与 carveout 交互（$100K 上限 + 数据泄露/IP/保密不封顶 = 对真正会发生的纠纷形同不封顶，列清上限之上/之下各是什么，评估被封顶的面是否有意义）；④对每一维写出 playbook 立场。

## 示例

单条红线（最小粒度，改词优先）：
```
Clause: §8.2 Auto-Renewal
Current: "...auto-renew for successive twelve (12) month terms unless..."
Redline: "twelve (12)" → "twelve (12)"（保留），通知窗口 "thirty (30)" → "sixty (60) days"
Rationale: 给财务足够的取消窗口，对齐 playbook（1-2 句，可外发对方律师）
Priority: Must-have
Fallback: 退而求其次接受 45 天 + 续约自动邮件提醒
```

SaaS 专项发现骨架（双重严重度：法律风险 🔴🟠🟡🟢 × 业务摩擦 🔴 阻断/🟠 拖慢/🟡 困惑/🟢 不可见；register 取两者较高者）：
```markdown
### Bottom line
[可签 / 先争 X / 走人 — 一句话]

## SaaS 专项发现
### 自动续约   [法律 🟢 / 业务 🔴]
续约日期: [date] | 取消截止: [date]（提前 N 天）
续约价机制: [原文] | Playbook 契合: [区间内/偏离/未覆盖]
喂续约登记: [yes — 续约登记所需记录]

### 涨价 / 数据退出 / SLA / 子处理者 / 服务变更
[逐项对照 playbook；数据退出这条是业务负责人最该读的]
```
> 数据退出、自动续约、涨价类发现常是 🟢 法律 / 🔴 业务——条款合法，但正是客户离不开、续约惊吓财务的原因。按业务摩擦严重度浮起，别只按法律风险。

**移交续约登记**（字段不可确定则留空并注明，便于人工补）：
```yaml
counterparty: [name]
agreement: [title]
initial_term_end: [ISO date]
renewal_mechanism: [如 "auto-renew annual"]
notice_period_days: [int]
cancel_by_effective: [ISO date = initial_term_end − notice_period_days]
price_on_renewal: [原文机制]
status: active
```

## 注意事项

- **不提供法律意见**：始终提醒结论须经合格律师复核后方可依据。
- **无声补充禁令**：辖区成文法（自动续约法、数据可携出强制、消费者保护）研究工具返回稀少时，报告所得即停，不得用网搜/模型知识默默填坑——给用户选项后由律师决定是否接受低置信来源。
- **来源标注**：引用法条/判例须带 `[Westlaw]`/`[statute/regulator site]`/`[web search — verify]`/`[model knowledge — verify]`/`[user provided]`，带 `verify` 的优先核验，勿删标签。
- **打哪些仗**：大供应商谈判意愿低（像航司谈票规则），按 playbook 区分「永远推/仅大额推/可让」，按合同金额与迁移成本校准——$5K/年易替代的工具轻审，$500K/年要在其上搭建的平台重审。
- **超长合同/非英文**：先聚焦续约、终止、责任、数据、子处理者等关键章节并在 reviewer note 记录覆盖范围；非英文标注语言、问是否需翻译。
- 最终报告需转 Word 交付时用 `markdown-to-docx`。

## 互见

- requires：`contract-playbook-review` —— 通用条款评审是底座，本条是 SaaS 叠加层
- related：`nda-triage-reviewer`、`dpa-clause-reviewer` —— 更轻的 NDA 速审 / 数据保护专项
- related：`legal-risk-classifier`、`general-counsel-advisor` —— 风险分级与升级、整体法务判断
- related：`eu-ai-act-compliance`、`gdpr-data-handler` —— AI/ML 训练权下游监管、跨境与子处理者数据流
- combines_with：`esignature-routing` —— 审定后路由签署
- combines_with：`legal-risk-classifier` —— 把 SaaS 发现汇入风险分级与升级路由

---
本条采编自 anthropics/claude-for-legal（Apache-2.0）。
