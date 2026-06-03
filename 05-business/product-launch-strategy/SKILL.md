---
name: product-launch-strategy
title: 产品发布策略规划
description: 当需要规划产品/功能/版本发布、Product Hunt 上线、灰度内测、候补名单或 GTM 上市时使用；产出分阶段发布计划、ORB 渠道图、发布日清单、Product Hunt 简报与发布后造势计划；不适用于纯文案撰写、定价方案设计或单一渠道执行。触发词：产品发布、Product Hunt、GTM 上市、候补名单、内测、发布清单、版本公告
domain: 商业/marketing
triggers: [规划产品发布, 功能上线/版本发布公告, Product Hunt 上线准备, GTM/上市策略, 候补名单/早鸟/灰度内测, 做发布清单/造势计划, 定价变更当作发布造势, 工程交付日期已定但无发布计划]
tags: [marketing, 商业, 产品发布, gtm, product hunt, 增长, 渠道策略]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write]
requires: []
related: [product-marketing-gtm-strategy, social-media-content-creator, app-store-optimization, cmo-marketing-advisor]
combines_with: [product-marketing-gtm-strategy, social-media-content-creator, paid-ads-strategist]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 规划新产品、重大功能或版本的发布与上市（GTM），希望"持续造势、聚拢注意力、把兴趣转化为用户"。
- 准备 Product Hunt / BetaList / Hacker News 上线，需要预热关系、Listing 物料与当天作战手册。
- 设计候补名单（waitlist）、早鸟（early access）、灰度内测的完整分阶段漏斗，而非只做一个落地页。
- 工程交付日期已确定但尚无营销发布计划；或刚发布完却缺少后续造势内容。
- 定价变更/新增套餐——把它当作一次产品更新来做发布造势。

不该用边界：
- 只需撰写发布邮件/社媒帖文/广告文案的具体内容 → 交给文案类技能，本技能负责策略与编排。
- 只涉及定价方案本身的设计 → 用定价策略技能。
- 只需单一渠道单日执行、不需要跨渠道与发布后规划 → 无需本技能的完整流程。

## 步骤

开始前先读上下文：若存在 `.claude/product-marketing-context.md`，先读取并复用其中的 ICP、定位与品牌语气，只补问未覆盖的信息。

1. 厘清基本盘（先问清再动手）：
   - 发布什么？（新产品 / 重大功能 / 小更新）
   - 当前受众规模与活跃度？
   - 自有渠道有哪些？（邮件列表规模、博客流量、社群）
   - 发布时间线？是否上 Product Hunt，准备到哪一步？
   - 历史发布经验，哪些有效/无效？

2. 用 **ORB 渠道框架** 编排，所有渠道最终都要把流量导回自有渠道：
   - **Owned（自有）**：邮件列表、博客、播客、品牌社群、官网/产品。无算法、无 pay-to-play，随时间复利。按受众选 1-2 个起步（行业缺优质内容→博客；要直达更新→邮件；重互动→社群）。
   - **Rented（租用）**：社媒（X/LinkedIn/Instagram）、应用商店/市场、YouTube、Reddit。选 1-2 个受众活跃平台，只用来把流量导向自有渠道，给的是速度不是稳定。
   - **Borrowed（借用）**：客座内容、联合营销/网络研讨会、演讲、达人合作、联盟/推荐激励。主动出击：列出受众关注的行业领袖，用 SparkToro / Listen Notes 找受众重叠，提双赢合作。借来的注意力必须转化为自有关系。

3. 套用 **五阶段发布法**（造势是过程而非单日事件）：
   - 阶段1 内部发布：一对一招募早期用户免费试用，原型能演示即可，验证核心功能。
   - 阶段2 Alpha：做带早鸟报名表的落地页，宣布产品存在，逐个邀请；MVP 已在生产可用。
   - 阶段3 Beta：消化早鸟名单（部分免费/部分付费），用"解决什么问题"做预告，拉朋友/投资人/达人试用分享；可加"Beta"角标与早鸟开关。
   - 阶段4 早期访问：放出截图/功能 GIF/Demo，收集定量使用数据与定性反馈，做用户调研（积分激励）；扩张二选一——按批 5-10% 节流邀请，或一次性以"early access"框架放开。
   - 阶段5 全量发布：开放自助注册、开始收费、全渠道宣布 GA。触点：客户邮件、应用内弹窗/产品导览、官网横幅、"New"角标、博客公告、社媒、Product Hunt/BetaList/HN。

4. 若上 Product Hunt，分三段执行：
   - 发布前：提前建立与有影响力支持者/社群的关系；优化 Listing（有力 tagline、精致视觉、短 Demo 视频）；研究成功案例；先在社群提供价值再推销；团队备好全天投入。
   - 发布当天：当成全天活动，实时回复每条评论，激活既有受众参与，把流量导回官网捕获注册。
   - 发布后：跟进每个互动者，把 PH 流量转为自有关系（邮件订阅），用内容延续势能。

5. 规划发布后造势（公告上线 ≠ 结束）：自动化 onboarding 邮件序列、在周报/月报里复述公告、发布对比页、官网增设新功能专区、做无代码交互式 Demo（如 Navattic）。

6. 建立持续发布节奏：用更新分级矩阵决定营销力度——重大更新走全渠道战役；中等更新做定向公告（分群邮件+应用内横幅）；小更新进 changelog/release notes。错峰发布、复用高效战术、持续用邮件/社媒/应用内强化，哪怕小 changelog 也在传递"产品在持续演进"。

## 产出物

| 产出 | 形式 | 说明 |
|------|------|------|
| 发布计划 | Markdown | 逐阶段计划，含负责人、日期、渠道、成功指标 |
| ORB 渠道图 | 表格 | Owned/Rented/Borrowed 三类渠道及每渠道战术 |
| 发布日清单 | Checklist | 当天执行清单，含时间盒动作 |
| Product Hunt 简报 | Markdown | Listing 文案、物料规格、预热时间线、互动手册 |
| 发布后造势计划 | 要点列表 | 发布后 30 天的持续与复利动作 |

## 示例

- Superhuman：邀请制候补名单 + 一对一 30 分钟真人 onboarding，制造稀缺与 FOMO，全靠自有关系驱动口碑。
- Notion：在 X/YouTube/Reddit 引爆病毒传播，但把所有可见度导回自有资产——每个爆款帖都通向注册与定向邮件 onboarding。
- TRMNL：免费寄电子墨水屏给 YouTuber Snazzy Labs（非付费赞助），深度测评 50 万+ 播放、带来 50 万+ 美元销售，并配套联盟计划。
- SavvyCal：提前优化落地页与 onboarding、预建达人关系、当天回复每条评论 → 当月产品榜第 2。
- Reform：研究成功案例、打磨 tagline/视觉/Demo、先在社群提供价值、当天全程互动 → 当日产品第 1。

## 注意事项

- 发布计划必须具体、有时间节点、落到具体渠道——禁止"发个社媒"这类含糊建议；每项产出都要写清谁在何时做什么。
- 起草任何文案前，先对齐 marketing-context 的 ICP 语言与定位，确保发布叙事一致。
- 质量门槛：一份发布计划只有覆盖全部三类 ORB 渠道、且同时包含发布日与发布后动作，才算完整。
- 租用渠道给速度不给稳定，借用渠道给信誉但需转化为自有关系——所有外部注意力都要回流自有生态。

## 互见

- email-sequence：构建发布公告与发布后 onboarding 邮件序列时用；不替代完整渠道策略。
- social-content：起草发布日具体社媒帖文/长推时用；不用于渠道选择策略。
- paid-ads：发布含付费放大成分时用；不用于纯自然流量发布。
- content-strategy：发布后数周需要持续内容计划（博客、案例）时用；不用于单日发布执行。
- pricing-strategy：发布涉及定价变更或新增套餐时用；不用于纯功能发布。
- marketing-context：作为对齐 ICP 与品牌语气的基础，始终最先加载。

---
采编自 alirezarezvani/claude-skills（MIT 许可）。
