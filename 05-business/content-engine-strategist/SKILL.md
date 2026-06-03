---
name: content-engine-strategist
title: 内容引擎与主题集群策略
description: 当需要从零搭建内容增长体系、或有流量却无转化、或面对上百篇旧博文不知取舍时使用；做内容审计、主题集群设计、内容简报、发布日历、二次分发与SEO优化，产出可执行的内容引擎方案；不适用于付费广告文案、产品UI文案与视觉设计；触发词：内容策略、主题集群、SEO、编辑日历、内容审计
domain: 商业/marketing
triggers: [内容策略, 主题集群, topic cluster, 内容审计, 编辑日历, 内容简报, SEO优化, pillar page, 内容增长, 二次分发, 内容引擎, 搜索意图]
tags: [商业, marketing, 内容运营, seo, 增长, 内容策略]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Bash, Grep, Glob]
requires: []
related: [content-strategy-planner, content-marketing-strategist, seo-content-writer, customer-research-synthesizer]
combines_with: [seo-content-writer, content-strategy-planner, ai-search-seo]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

把内容当成一个有路线图、有指标、有迭代周期、有下线策略的「产品」，而非零散文章。一篇博文不是终点，而是主题集群里的一个节点——它喂养邮件漏斗，最终驱动注册转化。

适用：
- 需要从零搭建内容策略与增长体系
- 有自然流量但几乎不产生转化
- 博客已有上百篇文章，不知道哪些值得保留
- 想把一篇文章扩展成一周的多平台内容
- 正在筹备一次内容驱动的产品/功能上线

不该用（负边界）：
- 需要付费广告文案 → 交给增长/投放角色
- 需要产品界面 UI 文案 → 直接用 copywriting 类技能
- 需要视觉设计 → 不在本技能范围

## 步骤

核心心法：结构胜于天赋（好简报 + 平庸写手 > 无方向的高手）；分发是一半的工作；每篇内容都要能用数据自证存在价值，否则就删。

1. 先审计与定位，再动笔：任何一篇内容都必须先锁定目标关键词与搜索意图匹配，禁止「我们应该写篇 X」这种无 why 的选题。
2. 用集群而非单篇思考：从主关键词出发，绘制 SERP，找竞品遗漏的缺口，规划 1 个支柱页（pillar）+ 8~15 篇集群文章，并设计内部链接。
3. 为每篇写可直接执行的简报（人或 AI 都能照做不靠猜）。
4. 排出 30/60/90 天发布日历，每条目都自带分发计划与跨平台复用路径。
5. 发布后持续度量，按保留/更新/合并/删除四档处理；流量超 90 天未度量视为失控。

## 指令

以下为六个核心命令，对应六类产出：

### /content:audit（内容审计）
盘点现有内容，从流量、排名、转化、新鲜度四维打分。产出：keep / update / merge / kill 清单，按「投入产出比」排序。

### /content:cluster（主题集群设计）
从主关键词起，绘制 SERP，找竞品缺口，架构「支柱页 + 8~15 篇集群文章 + 内部链接」。产出：含优先级的完整集群方案。

### /content:brief（内容简报）
写一份写手无需猜测即可执行的简报。包含：SERP 分析、标题候选、详细大纲、目标字数、内链、CTA，以及要超越的具体竞品内容。

### /content:calendar（发布日历）
搭建 30/60/90 天日历，平衡高投入支柱页与轻量集群文。每条目带分发计划，含复用链路：博客 → 邮件 → 社媒 → 视频脚本。

### /content:repurpose（二次分发）
把 1 篇内容裂变成 8~10 个衍生资产：博客 → 简讯版 → Twitter thread → LinkedIn 帖 → Reddit 价值贴 → 轮播切片 → 邮件滴灌。按平台特性适配，而非简单换格式。

### /content:seo（SEO 优化）
优化既有内容：修 title tag、为精选摘要（featured snippet）重组标题层级、补内链、在竞品覆盖更深处加深内容、加 schema 标注。附前后对比。

## 示例

场景：博客有 200 篇文章但不知哪些有用。
- 跑 `/content:audit`，四维打分得到 kill/merge 清单。
- 对高潜力主题跑 `/content:cluster` 重组为支柱页 + 集群。
- 对「有流量无转化」页面跑 `/content:seo`，修标题、补内链、加 CTA。
- 用 `/content:repurpose` 把支柱页扩成一周多平台内容。

## 注意事项

绝不做（硬约束）：
- 不带目标关键词与搜索意图匹配就发布
- 写言之无物的「终极指南」
- 忽视关键词自食（cannibalization，两页争同一词）
- 内容超 90 天不度量
- 因「我们该有篇关于 X 的文章」而创作——每篇都要有 why

做得好的标准：
- 自然流量月环比增长 20%+
- 内容页转化率 2~5%（看真实注册，而非仅流量）
- 30%+ 目标关键词 6 个月内进首页
- 每篇内容都有可度量的下一步动作
- 日历自运转——写手清楚写什么、为什么写

## 互见

- copywriting / copy-editing：单篇文案撰写与精修
- seo-audit：更细粒度的 SEO 审计
- email-sequence：邮件漏斗与滴灌序列
- competitor-alternatives：竞品对比内容
- analytics-tracking：内容度量与埋点

---

采编自 alirezarezvani/claude-skills（MIT 许可证）。
