---
name: backlink-profile-analyzer
title: 外链画像与有毒链接分析
description: 当需要评估反向链接（外链）画像质量、识别有毒/垃圾链接、对比竞品链接差距或挖掘外链建设机会时使用；按"画像概览→链接质量→有毒链接→竞品对比→建设机会→变动追踪→报告"七步产出含健康分·有毒比例·拒绝(disavow)建议·链接交集机会的外链审计报告；不适用于站内技术SEO诊断、内容创作或结构化数据实现；触发词：外链分析、反向链接、有毒链接、链接建设、谁链接到我、backlink audit、disavow、referring domains
domain: 商业/seo
triggers: [外链分析, 反向链接, 有毒链接, 链接建设, 外链建设, 谁链接到我, 友链互换, backlink audit, analyze backlinks, toxic links, disavow links, referring domains, link building opportunities]
tags: [seo, backlinks, off-page-seo, link-building, toxic-links, disavow, referring-domains, link-audit]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Ahrefs/Semrush/Moz, Google Search Console, backlink CSV, Google Disavow Tool]
requires: []
related: [seo-audit, internal-linking-optimizer, technical-seo-checker, seo-traffic-drop-forensics]
combines_with: [competitive-analysis, seo-performance-reporter]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
## 何时使用

- 需要体检一个域名的反向链接（外链）画像：引用域数量、链接速度、权威分布、整体健康分。
- 怀疑站点有垃圾/有毒外链、收到链接相关的人工处罚或算法影响，需要识别并产出 disavow（拒绝链接）建议时。
- 想对比竞品外链、找链接差距（link gap），或系统挖掘外链建设机会（资源页、断链重建、未链接提及、客座投稿）。
- 用户只给模糊诉求（"我的外链很差""帮我看看 backlink""怎么涨外链"）时，也先从画像分析入手。

不该用的边界：
- 站内技术/页面 SEO 诊断（收录、CWV、canonical、hreflang）→ `seo-audit`，本技能只看站外链接，不做站内体检。
- 写文章/落地页文案 → `seo-content-writer`；规模化批量建页 → `programmatic-seo-builder`。
- 网站信息架构与内链规划 → `seo-site-architecture`。
- 给出权威/有毒的正式打分模型（CITE 评分）不在此范围——本技能产出数据，交由权威评分技能消费（见下方 CITE 映射；本库暂无该技能时仅输出原始指标）。

## 步骤

数据来源：有第三方工具（Ahrefs/Semrush/Moz/GSC）时直接拉取外链与竞品数据；没有时，向用户索要外链 CSV、引用域列表、竞品域名、近期链接变动。务必遵守目标站 `robots.txt` 与各工具 TOS，不抓取受限数据。

1. 画像概览（Profile Overview）——核心指标、链接速度（velocity）、权威分布（DA/DR 分段）、画像健康分。
2. 链接质量（Link Quality）——Top 外链、链接类型构成（dofollow/nofollow、文本/图片）、锚文本分布、地理来源分布。
3. 有毒链接（Toxic Links）——风险指标、待复核链接清单、disavow 建议。
4. 竞品对比（Competitor Comparison）——画像对比、链接交集（哪些域同时链向多个竞品但没链向你）、竞品被链最多的内容。
5. 建设机会（Link Building Opportunities）——交集机会、断链重建、未链接提及、资源页、客座投稿，并按"投入 vs 影响"排优先级。
6. 变动追踪（Track Changes）——新增/丢失链接、净变化、需优先抢救的高价值丢失链接。
7. 生成报告（Backlink Report）——执行摘要、优势、隐患、机会、竞争位次、推荐行动、KPI。

## 指令

健康与质量判据：
- 锚文本：自然画像应以品牌词/裸 URL 为主，精确匹配关键词锚文本占比过高（堆砌）是过度优化的风险信号。
- 链接类型：健康画像 dofollow/nofollow 比例自然、混合多样；全 dofollow 或锚文本高度雷同往往是垃圾链接特征。
- 权威分布：引用域应跨越多个权威档位且来源多样（地理、行业、平台），而非集中在一批低质域。

有毒链接识别（高风险信号，命中越多越毒）：
- 来自链接农场、PBN、垃圾目录、明显操纵性站点。
- 锚文本过度优化（精确匹配关键词扎堆）、与本站主题无关。
- 来源域低权威 + 高外链密度 + 无真实流量；隐藏链接、付费链接特征。

disavow（拒绝链接）准则：
- 谨慎使用——disavow 是"核选项"，能恢复也能误伤。只对确属操纵性、且无法人工联系移除的链接做 disavow。
- 优先尝试联系站长移除；保留证据（截图/导出）；按 Google Disavow Tool 的 domain/URL 格式产出清单。

关键阈值与下游：
- **有毒链接占比 > 15%** → 升级建议：交由权威评分/域名权威审计技能做正式 CITE 打分；本库暂无该技能时，在报告中标红并建议系统性清理 + disavow。

CITE 映射（供下游权威评分消费，原样保留）：

| 外链指标 | CITE 项 | 维度 |
|---|---|---|
| 引用域数量 | C01 引用域规模 | Citation |
| 权威分布（DA 分段） | C02 引用域质量 | Citation |
| 链接速度 | C04 Link Velocity | Citation |
| 地理分布 | C10 来源多样性 | Citation |
| Dofollow/Nofollow 比例 | T02 Dofollow 比例正常性 | Trust |
| 有毒链接分析 | T01 画像自然度、T03 链接-流量一致性 | Trust |
| 竞品链接交集 | T05 画像独特性 | Trust |

## 示例

触发：
```
分析 [域名] 的外链画像
```
```
对比 [竞品域名列表] 找外链建设机会
```

链接交集表（竞品对比核心产出）：

| 引用域 | 链向竞品数 | 链向你 | 域权威 | 获取难度 | 优先级 |
|---|---|---|---|---|---|
| example-resource.com | 3/3 | 否 | 72 | 中（资源页投递） | 高 |
| industry-blog.com | 2/3 | 否 | 58 | 低（未链接提及补链） | 高 |

输出还应包含：Top 即时机会清单 + 影响估算模型（预计新增引用域 → 权威/排名预期增量）。

外联触达：挖到机会后，给客座投稿/断链重建/资源页的外联邮件，交由 `cold-email-writer` 起草。

保存结果：完成后问"是否保存这些结果？"。若是，写入 `memory/monitoring/YYYY-MM-DD-<主题>.md`，含头条发现、行动项、未决事项（open loops）。

## 注意事项

- 合规第一：尊重目标站 `robots.txt` 与各工具 TOS，不抓取受限/付费墙数据；缺工具时改向用户索要 CSV 导出。
- disavow 谨慎用：误伤合规链接会掉排名；能联系移除就别 disavow，且只针对确属操纵性的链接。
- 单次工具快照不等于全貌：不同外链库（Ahrefs/Semrush/Moz）覆盖差异大，重要结论尽量交叉验证。
- 锚文本/类型分布看趋势而非单点：自然画像随时间渐变，速度（velocity）骤增骤减本身就是风险信号。
- 定期复测、持续监控，比一次性审计更有价值；锚文本与链接类型要主动多样化。
- 有毒比例 > 15% 是升级线，不是清理完就万事大吉——清理后需观察 1-2 个收录/排名周期确认恢复。

## 互见

- related：`seo-audit` —— 站内技术/页面体检，与本技能的站外画像互补，常一起做完整 SEO 诊断。
- related：`competitive-analysis` —— 链接交集来自竞品对比，可借其拆解竞品整体策略。
- related：`seo-site-architecture` —— 拿到外链权威后规划内链分发，把权重导向重点页。
- combines_with：`cold-email-writer` —— 把外链建设机会（资源页/断链/未链接提及）转成外联邮件序列。
- combines_with：`seo-content-writer` —— 为"可被链接的内容资产"（linkable asset）产出内容，支撑外链建设。

本条采编自 aaron-he-zhu/seo-geo-claude-skills（Apache-2.0）。
