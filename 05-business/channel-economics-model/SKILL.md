---
name: channel-economics-model
title: 渠道经济性建模
description: 当季度复盘需厘清直销 vs 渠道/合作伙伴谁真正赚钱、要算满载 cost-to-serve、三镜头渠道 ROI 与受约束最优渠道组合时使用；做按渠道的满载成本、ROI 裁决（加码/维持/削减/退出）与敏感度组合建议，产出三份报告；不适用于设计伙伴分层与 revshare、RevOps 漏斗机制、战略 CRO 判断或历史 P&L 报表。触发词：渠道经济性、直销vs渠道、渠道ROI、渠道组合
domain: 商业/finance
triggers: [渠道经济性, 直销vs渠道, 渠道盈利性, 渠道ROI, 渠道组合优化, cost-to-serve, 满载服务成本, MDF回报, 渠道复盘, channel economics, direct vs partner]
tags: [商业, finance, 渠道经济性, cost-to-serve, 渠道roi, 直销与渠道, 渠道组合, 单位经济, revops, 敏感度分析]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [cost_to_serve_calculator.py, channel_roi_analyzer.py, channel_mix_optimizer.py]
requires: []
related: [unit-economics-analyzer, cfo-financial-advisor, pricing-strategy, partnerships-strategy-architect]
combines_with: [startup-financial-modeler, cro-revenue-advisor]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当你要回答「直销和渠道/合作伙伴，到底哪条线在 CAC、支持负载、伙伴折扣、成交周期、留存差异、间接费分摊全部装进去后真正赚钱」时使用本技能。这是一道**前瞻性决策**问题，不是历史报表。典型触发：

- 季度渠道复盘：pipeline 是 60/40 或 50/50 直销 vs 渠道，但没人真知道哪条线盈利。
- 在考虑招渠道经理，需判断该渠道能否跨过满载成本门槛。
- 董事会追问伙伴项目 ROI（「我们花了 $X 做 MDF，换回了什么？」）。
- 某细分市场过度押注单一渠道，怀疑「组合教条」挡住了另一条线。
- 新区域扩张，要决定 direct-first 还是 partner-first。
- 并购尽调：标的声称「partner-led，70% 毛利」，需装载验证。

**不该用于**：设计伙伴分层、联合 GTM、revshare 分成（那是伙伴项目「结构」设计，本技能只消费结构、产出经济裁决）；SDR-AE 路由、线索评分、MQL 定义（RevOps 漏斗机制）；战略 CRO 判断如「该不该招 VP Sales」、薪酬方案（用 `cro-revenue-advisor`）；按 GAAP 的历史渠道 P&L 结账报表（用财务分析类技能）；单笔折扣审批（用 `deal-desk-reviewer`）；定价模型设计（用 `pricing-strategy`）。

**核心红线**：本技能输出裁决与推荐组合，**从不自动调拨资源**；人来拍板，机器只把数字第一次诚实地装载齐全。

## 步骤

1. **录入渠道数据** —— 按渠道填写 `assets/channel_data_template.md`（约 20 分钟）：TTM 成交数、TTM ARR、平均单值、毛利率%、CAC、成交周期天数、留存率、扩容率、伙伴折扣%，以及全部可归因成本（SDR/AE/SE/渠道经理/CS/支持/营销/伙伴 MDF/工具/间接费分摊%）。模板会刻意提示最常被漏掉的成本：伙伴赋能工时、认证投入、渠道冲突协调、渠道经理人头成本。
2. **算满载 cost-to-serve** —— 每个渠道跑一次 `cost_to_serve_calculator.py`，得到**每笔交易**与**每 $ ARR**的满载服务成本，直接成本与分摊间接费分列，并给出装载渠道专属成本后的「真实毛利」行；脚本会标出重复计数和隐藏成本。「真实毛利」是后两个脚本的关键输入。
3. **三镜头算 ROI** —— 跑 `channel_roi_analyzer.py`，每个渠道输出三个 ROI（首年现金、LTV 调整、边际——下一美元投入），加上**收益递减拐点**，并给四档裁决之一：**DOUBLE-DOWN（加码）/ MAINTAIN（维持）/ DEFUND（削减）/ EXIT（退出）**。裁决逻辑确定性且在报告中明示，人可覆盖，技能不替你拍板。
4. **优化渠道组合** —— 跑 `channel_mix_optimizer.py`，在约束下（最低直销%、最高伙伴集中度上限）给出最大化有效 ARR 的推荐组合，附敏感度表（直销 CAC 涨 20% 会怎样？伙伴折扣扩 5 个点会怎样？）。
5. **拍板** —— 把三份报告带进季度渠道复盘。技能推荐，人来承诺。

## 指令

三个脚本均纯标准库，统一支持 `--help`、`--sample`、`--input`、`--output`；两个分析脚本支持 `--profile {saas,api,enterprise-software,marketplace,hardware}` 做行业基准调参（如 SaaS 直销 CAC 回收目标约 12 月、企业级约 18 月），但 profile 只调默认基准，**不覆盖你的真实数字**。

```bash
# 1. 每个渠道算满载 cost-to-serve（每笔 + 每 $ARR），跑一次每渠道
python3 scripts/cost_to_serve_calculator.py --input channel.json --output markdown

# 2. 三镜头 ROI（现金/LTV/边际）+ 收益递减拐点 + 四档裁决
python3 scripts/channel_roi_analyzer.py --input roi.json --profile saas --output markdown

# 3. 受约束的渠道组合优化 + 敏感度场景
python3 scripts/channel_mix_optimizer.py --input mix.json --profile saas --output markdown
```

**逼问清单（跑脚本前逐题问、深度优先、不打包；锁定 1-3 再开 4-7）**：

1. 你按渠道的满载 cost-to-serve 是多少——含渠道经理人头、MDF、伙伴赋能工时、间接费分摊？（多数团队装了伙伴折扣却漏了渠道经理人头和赋能工时，虚增伙伴毛利 8-15 个点。Kaplan & Cooper 的 ABC 作业成本法正是为此而生。）
2. 直销来源 vs 伙伴来源客户的**留存差**是多少？（先按渠道埋点留存再算 ROI；5 个点的留存差能撬动 LTV 30-50%。Skok：LTV =（ARPA × 毛利）/ 流失率。）
3. 你所谓「渠道来源」的 pipeline，真正由伙伴**原创**的占多少？（AE 本就握有的账户是 channel-influenced 而非 channel-sourced；混淆 source 与 influence 是伙伴 ROI 全行业虚高的头号原因。）
4. 投入伙伴项目 vs 直销的**下一美元边际 ROI** 是多少？（在两条线上都画收益递减曲线；平均 ROIなど虚荣指标，可能均值 2.1x 而下一美元仅 0.3x。）
5. 近 4 个季度 MDF-to-可归因 pipeline 比率多少？（建议 < 5:1，即每 $1 MDF 应在两季内带来 ≥ $5 可归因 pipeline，更松就是伙伴折扣戏法。）
6. 你的渠道组合教条（「我们 partner-first」「SMB 不做直销」）是否挡住了一个盈利细分？（显式摆出教条，组合应跟随细分市场的算术。）
7. 你用什么**间接费分摊口径**，直销与伙伴是否一致？（同方法、同分母、两条线一致；不一致分摊是渠道经济分析的隐形杀手——每个结论都会被污染。）

7 题答完后按 `cost_to_serve_calculator.py → channel_roi_analyzer.py → channel_mix_optimizer.py` 顺序执行。

## 示例

季度复盘中 pipeline 为 60% 直销 + 40% 伙伴，伙伴线宣称「70% 毛利」。装载后发现：伙伴线漏算了 $200k 渠道经理（管 $4M 伙伴 ARR ⇒ 每 $1k ARR 含 $50 渠道经理成本）和 AE 共同销售工时，且伙伴来源客户留存比直销低 5 个点，使伙伴 LTV 被高估约 30%。`channel_roi_analyzer.py` 据此给伙伴线 **DEFUND**、直销线 **DOUBLE-DOWN**，`channel_mix_optimizer.py` 在「最低直销 40%」约束下推荐把伙伴占比从 40% 收到 25%，并提示当直销 CAC 涨 20% 时拐点位置左移。

## 注意事项

- **绝不自动调拨资源**：产出是裁决 + 推荐组合，人来承诺。
- **别把「influenced」当「sourced」**：伙伴只是碰过 AE 已握有的交易，不是渠道来源收入；这样装载会同时虚增伙伴 ROI 和直销 CAC。
- **间接费分摊必须一致**：给直销分摊 25%、给伙伴只分 5%（理由是「伙伴自己扛间接费」）是错的——渠道经理、伙伴项目、MDF、认证、冲突协调全在你的 P&L 里。这是头号反模式。
- **赋能工时是成本**：AE 与伙伴共同销售的每一小时都是计入伙伴渠道的直接成本，最常被漏。
- **MDF 必须带 ROI 追踪**：没有可归因 pipeline 的 MDF 只是伙伴折扣的延伸，脚本会标出无回报的 MDF。
- **算渠道 ROI 必须带留存差**：伙伴客户若多流失 5 个点而忽略它，会高估伙伴 LTV 30-50%；按渠道留存是强制输入。
- **别把本技能当伙伴项目设计**：那是 partnerships-architect 类技能的事（分层、联合 GTM、revshare）；本技能告诉你这个项目是否自负盈亏。
- profile 只调基准，不覆盖你的数字；LTV 输入（留存、扩容）须按渠道而非合并取值——这通常是最大却最被忽视的经济变量。

## 互见

- requires：`cost-to-serve` 不是独立技能；本技能假设你已能区分渠道（一致的 GTM 动作，而非营销来源），并掌握按渠道的 CAC/留存/扩容数据。
- related：`cro-revenue-advisor` —— 战略 CRO 判断（何时招 VP Sales、薪酬、地盘设计），它把渠道经济产出当作众多输入之一。
- related：`deal-desk-reviewer` —— 单笔折扣审批，按日运作；本技能按季运作。
- related：`market-sizing-analyst` —— 新区域扩张时的市场规模输入。
- combines_with：`pricing-strategy` —— 定价是输入；渠道经济性是「该定价在各渠道上跑出来的结果」。
- combines_with：`cfo-financial-advisor` —— 把渠道裁决并入单位经济、烧钱率与融资模型的全局财务视图。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
