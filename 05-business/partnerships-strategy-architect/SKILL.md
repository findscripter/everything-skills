---
name: partnerships-strategy-architect
title: 战略合作伙伴架构
description: 当合作方上门索要分销/OEM/"战略联盟"条款、或要新建伙伴分层、或要决定重构·解约低效伙伴时使用；做伙伴分层判定（推荐/经销/OEM/SI/战略）、90天联合GTM计划、分润测算与解约触发条件，产出"分层＋GTM计划＋分润区间＋解约红线"建议包；不适用于技术售前POC、已签伙伴逐笔折扣审批、渠道ROI核算或改用收购替代合作。触发词：合作伙伴、分销商、OEM、战略联盟、分润、渠道冲突
domain: 商业/sales
triggers: [合作伙伴, 伙伴分层, 分销商, 经销商, OEM, 白标, 战略联盟, 分润, revshare, 联合GTM, 渠道冲突, 解约触发条件, MDF, partner tier, 推荐返佣, 转售商]
tags: [商业, sales, 合作伙伴, 渠道, 联合GTM, 分润, OEM, 经销, 战略联盟, 渠道冲突, 伙伴分层]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [partner_tier_classifier.py, joint_gtm_planner.py, revshare_modeler.py]
requires: []
related: [deal-desk-reviewer, cro-revenue-advisor, ma-playbook, sales-enablement, pricing-strategy]
combines_with: [deal-desk-reviewer, cro-revenue-advisor, sales-enablement]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当一个潜在合作方出现、有人必须拍板「要不要签、签在哪一层、给什么联合 GTM 承诺、按什么分润」时使用本技能。它产出分层结论＋GTM 计划＋分润区间＋解约红线，但**从不替你签约**——跑完之后由人决定。典型触发：

- 有合作方上门索要经销 / OEM / "战略" 条款。
- 在设计一套新的伙伴分层（partner program）。
- 某条现有合作正在低效运转，需决定：重新分层、重构 GTM，还是解约。
- 大 Logo 想要"战略联盟"，你得验证它是真合作还是供应商锁定式作秀。
- 咨询公司 / SI 想就你的产品拿服务分润。
- 平台厂商提出 OEM / 白标，你需要把账算清楚。
- 你怀疑"伙伴贡献"的单子其实是自家管线被薅去赚差价。

**不该用于**：技术演示与 POC（用 sales-enablement 等技术售前类技能）；已签渠道的成本与 ROI 核算（用渠道经济类技能）；全公司营收策略与何时招 VP Channel（用 cro-revenue-advisor）；答案是"收购它"而非"与它合作"（用 ma-playbook）；已签伙伴合同的逐笔折扣审批（用 deal-desk-reviewer）。

**核心判据**：拿不出独立需求证据（具名成交客户、终端客户关系、自有销售团队）的合作方，是在猎取优惠条款，不是合作伙伴——这类只签 REFERRAL 层或干脆不签。

## 步骤

1. **录入（≈20 分钟）** —— 填 `assets/partnership_intake_template.md`：partner_name、partner_type、独立需求证据（其已成交的具名客户、终端客户关系、销售团队规模）、战略价值（地域/产品/品牌/渠道经济）、对方承诺（联合营销投入、专职人力、认证、销售目标）。若模板诚实地填不满，说明对方还不够实，**停下，退回去**。
2. **分层判定** —— 跑 `partner_tier_classifier.py`，把伙伴排进 5 档之一：REFERRAL / RESELLER / OEM / SI-CONSULTING / STRATEGIC，各档有确定性地板线。**STRATEGIC 要求 named_accounts ≥ 5 且 多年期承诺 且 专职资源**。输出附理由与解约红线。
3. **联合 GTM 计划** —— 跑 `joint_gtm_planner.py`，得 90 天计划：发布前里程碑（培训、认证、物料）、上线动作（目标客户、销售打法、MDF 分配）、季中检查点、90 天成功标准。校验会拦截：不能给 REFERRAL 层规划渠道主导 GTM，不能给非 OEM 层规划白标。
4. **分润测算** —— 跑 `revshare_modeler.py`，算每单直销 vs 经伙伴的毛利、基于贡献深度（sourced > influenced > delivered）的推荐分润区间、伙伴 ROI 盈亏平衡点，以及在投射规模下伙伴经济是否真能跑赢直销。
5. **决策** —— 把分层＋GTM 计划＋分润区间带进合作委员会。**本技能不签约，你签。** 把解约红线写进合同，触发时解约才是机械的、不扯皮。

## 指令

三个确定性脚本，纯标准库实现，`--help` 与 `--sample` 均可用：

```bash
# 1. 伙伴分层判定（profile: saas | api | enterprise-software | marketplace | services | hardware）
python3 scripts/partner_tier_classifier.py --sample
python3 scripts/partner_tier_classifier.py --input intake.json --profile saas --output markdown

# 2. 90 天联合 GTM 计划
python3 scripts/joint_gtm_planner.py --input gtm.json --profile saas --output markdown

# 3. 分润区间 + 盈亏平衡 ROI + 长期经济
python3 scripts/revshare_modeler.py --input revshare.json --output markdown
```

`--profile` 行业档只调默认值，**不覆盖你的数据**。"Partner-sourced（伙伴主导）"要求对方既引入交易又拥有主关系；"Partner-influenced（伙伴影响）"按更低区间付——归因（attribution）比 PPT 上的说辞更重要。

**逼问清单（深度优先、逐题问、不打包；先锁 1-3 再开 4-7）**：

1. 列出该伙伴过去 12 个月已成交的 5 个终端客户——且是你自己也会去打的客户。 → 答不出 = 无独立需求，最多签 REFERRAL。（Hessling：无独立需求是死掉伙伴层的头号根因）
2. 这伙伴是在要优惠商业条款，还是在问怎么给你带客户？ → 折扣猎手开口谈条款，真伙伴开口谈客户；听第一次会的前 30 分钟。（Forrester：早期 SaaS 60%+ "伙伴询盘"是折扣猎取）
3. 一句话说出联合价值主张，以及它服务的具名终端客户是谁？ → 若没有区别于双方各自单干的联合价值，那就不是合作，顶多是联合营销。（Geoffrey Moore：整体产品式合作存在于"任一方单独都交付不了客户成果"时）
4. 在多少 % 折扣/分润、什么规模下，这合作能跑赢直销经济？ → 测算盈亏平衡管线量；若伙伴单子须占渠道量 30% 才能赢、而对方现实只能给 5%，你建了个亏本项目。（Chintagunta：无量级地板的渠道合作理论上盈亏平衡、实践中亏钱）
5. 解约的具名红线是什么，是否写进合同？ → 季度最低管线地板、最低认证资源数、最低联合成交数、90 天补救期。无预定红线的解约会变 2 年法务战。（IBM 渠道冲突案例）
6. 若该伙伴卖进了你某个直销客户，谁赢——你的销售还是它？ → 书面 Rules of Engagement，签约前公布；按具名客户/分段/地域划界，冲突由具名人裁决而非委员会。（Jay McBain：渠道冲突是头号伙伴项目杀手）
7. 这到底是合作，还是该收购？ → 若对方有你复制不了的独立护城河 且 需多年独占 且 需类股权对齐，那是在描述收购，转 ma-playbook。（HP 渠道复盘：把合作做成无股权收购，比纯路径更毁价值）

7 题答完后，按 `partner_tier_classifier.py` → `joint_gtm_planner.py` → `revshare_modeler.py` 顺序执行。

## 示例

样例：某大厂提"战略联盟"但拿不出具名成交客户、只承诺联合 PPT。分层器据 STRATEGIC 地板线（named_accounts ≥ 5 + 多年承诺 + 专职资源）判其**不达标，降至 REFERRAL**；GTM 校验拦截"给 REFERRAL 规划渠道主导 GTM"的越级；分润测算显示在对方可交付量级下伙伴经济跑不赢直销。结论：签 REFERRAL 返佣即可，把"季度管线地板未达即解约"写进合同。

## 注意事项

- **伙伴 ≠ 任何来问的人。** 无独立需求者是折扣猎手；REFERRAL 层正是用来吸收他们而不送出经销毛利的。
- **没有足够毛利覆盖支持成本就别给 OEM / 白标。** OEM 意味着你要支持一个不属于你的客户；分润盖不住二线支持成本就是亏本买卖。
- **influenced 的单不要按 sourced 付。** 反正会成交的单，付 influenced 区间。
- **每条低效合作都要有解约红线。** 无日落条款的"战略联盟"在发起高管离职后会变永久负担。
- **渠道冲突别拖到销售离职才管。** 直销与伙伴撞同一客户时，你不是丢销售就是丢伙伴；ROE 要事前定，不是事后定。
- **别把独占地域给弱伙伴**——会锁死那个本来真能拿单的强伙伴。
- **MDF 必须带 ROI 问责**：无具名管线、无 ROL 报告、无季度对账的市场发展基金是补贴不是投资。
- **合作结束要有退出方案**：客户连续性、数据交还、IP 清理、品牌撤除须事前谈定，关系闹僵后无法谈。
- 分润 % 区间是建议；合同谈判、MDF 政策、独占条款是技能之外的人类商业决策。一签约，逐笔商业评审就转给 deal-desk-reviewer。

## 互见

- **deal-desk-reviewer**：已签伙伴合同的逐笔折扣审批与条款红线；本技能是签约**前**决定签不签、签哪层。
- **cro-revenue-advisor**：战略级 CRO 判断（何时招 VP Channel、全公司营收结构）；本技能是逐个合作粒度。
- **ma-playbook**：当答案是"收购它"而非"与它合作"时转入（伙伴有不可复制护城河 / 需多年独占 / 需股权对齐）。
- **sales-enablement**：技术售前与销售物料，在合作决策做完、交易在途后运转。
- **pricing-strategy**：产品定价模型与打包，在策略层；分润是合作层的经济分配。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
