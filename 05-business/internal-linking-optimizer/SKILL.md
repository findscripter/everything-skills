---
name: internal-linking-optimizer
title: 内部链接结构与锚文本优化
description: 当需优化站内内链结构、锚文本分布、孤儿页、抓取深度或权重流动时使用；产出结构计分、孤儿页修复清单、内容簇(中枢-辐条)链路、上下文链接机会表与分阶段落地计划；不适用于决定写什么内容(用内容策略)、整站信息架构/URL重设计(用网站结构技能)或结构化数据标记(用schema标记)。触发词：内链优化、锚文本优化、孤儿页、权重传递、站内链接、网站结构乱、内容簇
domain: 商业/seo
triggers: [内链优化/内部链接, 锚文本优化/anchor text, 孤儿页/orphan pages, 权重传递/link equity, 站内链接, 抓取深度/click depth, 内容簇/主题集群, 中枢-辐条/pillar-cluster, 网站结构乱, 内链策略]
tags: [seo, 内链策略, 锚文本, 孤儿页修复, 主题权威, 权重流动, 内容簇, 站内架构]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write]
requires: []
related: [seo-site-architecture, seo-content-gap-analysis, programmatic-seo-builder, schema-markup-builder]
combines_with: [seo-site-architecture, seo-content-writer, technical-seo-checker]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
## 何时使用

当问题根因在**站内链接的连通性与权重流动**时使用：分析现有内链结构、权重流动、孤儿页、锚文本与主题集群，产出按优先级排序的内链方案(谁链向谁 + 锚文本 + 优先级)。典型触发：

- 「为这篇新文章/这个 URL 找内链机会」。
- 「找出站点的孤儿页并修复」。
- 「为某主题集群规划中枢-辐条内链」。
- 「整站锚文本过度优化，需多样化」。

**不该用边界：**
- 决定「写什么内容」——用内容策略技能(`content-strategy-planner`)。本技能只决定既有内容如何互链。
- 整站信息架构 / URL 层级重设计——用 `seo-site-architecture`(它定 URL 与导航骨架，本技能在既定骨架上优化链接与锚文本)。
- 添加 BreadcrumbList 等结构化数据标记——用 `schema-markup-builder`。
- 综合性 SEO 审计(技术/页面/站外都查)——用 `seo-audit`。

数据源：有爬虫/分析连接器时用之；否则向用户索取 sitemap、关键页 URL、内容分类。

## 步骤

按需执行以下七步，保留关键阈值不变(孤儿页目标 **0**、过度优化锚文本 **<10%**、精确匹配锚文本保持 **10–20%**)。

1. **分析现有结构** —— 采集域名、分析页数、内链总数、每页均链数、链接分布、入链最多的页、重要但欠链的页，给出结构计分；标记抓取深度与权重流动问题。
2. **识别孤儿页** —— 列出无任何内部入链的页，分三档：高价值(有流量/排名)→立即补链；中潜力→加分类/标签链；低价值→删除、noindex 或 301。
3. **分析锚文本分布** —— 检查最常用锚文本、按目标页的分布、过度优化、泛锚("learn more")、同锚指向多页的歧义；对照 CORE-EEAT R08 内链图谱。
4. **建内容簇链路** —— 映射 中枢页(pillar)↔辐条页(cluster) 链接，列出要新增的具体链接。
5. **找上下文链接机会** —— 逐页找主题相关的 来源段落/目标页/锚文本，按影响排序。
6. **优化导航与页脚链接** —— 复核主导航/页脚/侧边栏/面包屑，建议页面的增/降/删。
7. **生成落地计划** —— 含执行摘要、现状指标、分阶段优先行动、实施指引与追踪清单。

## 指令

**先选架构模型(决定阈值与必需链路)：**

| 模型 | 适用 | 站点规模 | 核心规则 | 度量目标 |
|----|----|----|----|----|
| 中枢-辐条 Hub-and-Spoke | 内容营销、SaaS、出版、主题集群 | 50–500 内容页 | 3–7 个支柱，800–2000 字辐条，支柱↔辐条双向链，相关辐条互链 | 每辐条 3–5 内链；点击深度 ≤3 |
| 筒仓 Silo | 电商、目录、独立业务线 | 100+ 分类 | 5–15 顶层分类，父子垂直链，面包屑，谨慎跨筒仓链 | 均深 ≤4；孤儿页 0；每页 3–7 链 |
| 扁平 Flat | 小站、浅层 URL | <50 理想，>500 不推荐 | 关键页由首页直链，浅 URL，自由互链 | 均深 ≤2；孤儿页 0；每页 8–15 链 |
| 金字塔 Pyramid | 新闻/媒体、大型博客、政企 | 500+ 帖或清晰层级 | 最多 3–4 层(首页→分类→子类→页)，面包屑 | 均深 ≤4；孤儿页 0；每页 3–5 链 |
| 网状 Mesh | 知识库、wiki、FAQ/帮助中心 | 密集主题网络 | 仅在主题相关时链，描述性锚，每 1000 字 5–15 上下文链 | 均深 ≤3；孤儿页 0；每页 8–15 链 |

**锚文本分布配比(单个目标页)：** 精确匹配 10–20%、部分匹配 30–40%、品牌锚 10–20%、自然锚("这份清单"/"完整指南") 20–30%。精确匹配每页 1–2 次即可；避免泛锚；内链绝不用裸 URL；同一锚别指向多个页(造成歧义)。

**内链优先级(由强到弱)：** 正文上下文链 > 中枢页链接 > 导航链接 > 页脚链接 > 侧边栏链接。

**找并修孤儿页：** 导出全部已收录 URL(GSC / Screaming Frog / sitemap 分析) → 导出全部内链 → 在前者却不在后者者即孤儿。修法：从相关页加上下文链 + 加入相关中枢页；实在无归属则反思该页是否该存在。

**月度监测(失败即修)：** 孤儿页=0(否则立即补链或重定向/删除)；均深=模型目标(否则给深页加首页/分类捷径)；每页链数=模型目标；锚文本=自然多样；内部死链=0；新内容 48 小时内被链。

**迁移安全检查单(切模型时)：** 审计现状→设计目标架构(每个重要页定位)→列出逐条链接的增/留/移/删→分阶段实施(从最高优先集群开始，勿整站翻转)→保留既有权重(不删无替代的有价值链)→监测排名/抓取/流量/收录 4–8 周/阶段→见效后再迭代。

## 示例

**用户：** "为我关于『邮件营销最佳实践』的博文找内链机会"

**输出(节选)：** 页面 `/blog/email-marketing-best-practices/`，现有内链 2 条。

新增出链(5 条)：

| 位置 | 文本 | 目标页 | 锚文本 | 优先级 |
|----|----|----|----|----|
| 第 2 段 | building your email list | /blog/grow-email-list/ | "building your email list" | 高 |
| 第 5 段 | subject lines | /blog/email-subject-lines/ | "write compelling subject lines" | 高 |
| 分段章节 | audience segments | /blog/email-segmentation-guide/ | "segment your audience" | 中 |
| CTA 区 | marketing automation | /services/email-automation/ | "email automation services" | 中 |
| 结论 | email marketing tools | /blog/best-email-tools/ | "top email marketing tools" | 低 |

应链向本文的来源页(请求入链)：`/blog/digital-marketing-guide/`(邮件章节)、`/services/marketing-services/`(相关内容)、`/blog/lead-generation-tips/`(邮件提及)。

行动：① 加 5 条出链；② 求 3 条入链；③ 加入「营销」分类页。

## 注意事项

- **相关性优先于链接数量**：为用户导航与主题相关而链，别为链而链；网状模型每 1000 字超过 15 条上下文链即过密。
- **阈值是硬线**：孤儿页 0、过度优化锚文本 <10%、精确匹配锚 10–20%——出报告时逐项对照目标值。
- **先有内容后建链**：主题集群无内容时链接不产生价值；支柱/分类页内容稀薄则不会排名。
- **改 URL 必做 301**：删除有价值链前先准备替代，否则损失权重。
- 可询问是否保存结果；如保存，写日期化摘要到 `memory/audits/internal-linking-optimizer/YYYY-MM-DD-<topic>.md`。

## 互见

- requires：`seo-site-architecture` —— 先有 URL 层级与导航骨架，本技能在其上优化链接连通性与锚文本。
- related：`seo-audit`、`seo-content-writer`、`programmatic-seo-builder`
- combines_with：`content-strategy-planner` —— 内容策略定写什么，本技能定既有内容如何互链；`schema-markup-builder` —— 内链结构定稿后加 BreadcrumbList 等标记。

---
采编自 aaron-he-zhu/seo-geo-claude-skills（Apache-2.0 许可）。
