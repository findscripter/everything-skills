---
name: app-store-optimization
title: 应用商店优化ASO
description: 当为 iOS/Android App 提升商店搜索排名与下载转化时使用；做关键词研究打分、元数据优化、竞品差距分析、A/B 测试与上线清单，产出可落地的标题/副标题/描述/关键词域改写及测试方案；不适用于 Web 应用（用网页 SEO）、企业内部应用、TestFlight 测试版或纯付费投放策略。触发词：ASO、应用商店优化、应用排名、关键词、元数据
domain: 商业/growth
triggers: [ASO, 应用商店优化, App Store优化, 应用商店排名, App关键词, 应用元数据, Play商店优化, 商店详情页, 提升应用排名, 应用曝光, 应用商店SEO, App转化率, 应用上架]
tags: [ASO, 商业, growth, 增长, 应用商店, 关键词研究, 元数据优化, 竞品分析, A/B测试, 移动营销, iOS, Android]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [keyword_analyzer.py, metadata_optimizer.py, competitor_analyzer.py, aso_scorer.py, ab_test_planner.py, review_analyzer.py, launch_checklist.py, localization_helper.py]
requires: []
related: [seo-audit, seo-content-writer, conversion-rate-optimizer, product-launch-strategy]
combines_with: [product-launch-strategy, conversion-rate-optimizer, paid-ads-strategist]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

为 Apple App Store / Google Play 上的移动 App 提升「搜索可见度」与「下载转化率」时使用。典型场景：做关键词研究与打分、优化商店详情页元数据、分析竞品 ASO 策略、规划上线、跑 A/B 测试改进转化、追踪排名变化。

不该用的边界：
- Web 应用 -> 用网页 SEO，而非 ASO。
- 企业 / 内部分发应用、TestFlight 仅测试版 -> 不进公开商店搜索，ASO 收益极低。
- 纯付费投放（ASA / UAC 等广告竞价策略）-> 属于买量范畴，不在本技能内。

## 步骤

ASO 包含五条可独立运行的工作流，按需取用。

### 1. 关键词研究
1. 明确目标人群与核心功能：主要使用场景（解决什么问题）、用户画像、竞争品类。
2. 产出种子词：来自功能/收益、用户口语（非开发者术语）、商店自动补全建议。
3. 扩展词表：修饰词（free/best/simple）+ 动作词（create/track/organize）+ 人群词（for students/for teams）。
4. 逐词评估：搜索量、竞争度、相关性。
5. 打分并分级放置：核心词进标题与关键词域（iOS）；次级词进副标题/简短描述；长尾词仅进完整描述。
6. 把关键词映射到对应元数据位置，并归档成可追踪的策略文档。
7. 校验：已打分；位置已映射；不含竞品品牌词；iOS 关键词域不放复数。

打分权重：相关性 35%（描述核心功能）、搜索量 25%（月搜 1 万+）、竞争度 25%（Top10 均分 <4.5）、转化意图 15%（"best X app" 类交易意图词）。
放置权重从高到低：App 标题 > iOS 副标题 / iOS 关键词域 / 安卓简短描述 > 完整描述。

### 2. 元数据优化
1. 按平台字符上限审计现状（标题字数与含词、副标题/简短描述利用率、iOS 关键词域效率、描述关键词密度）。
2. 标题套用公式：`[品牌名] - [核心关键词] [次级关键词]`。
3. 写副标题（iOS）/简短描述（安卓）：突出首要收益 + 含次级词 + 用动作动词。
4. 优化 iOS 关键词域：去除标题里已有的词、去复数（Apple 两种形式都索引）、逗号后不加空格、按分值排序。
5. 重写完整描述：钩子段（价值主张）-> 功能要点（含词）-> 社会证明 -> 行动号召。
6. 校验各字段字符数；核心词密度目标 2-3%。
7. 校验：均在字符上限内；核心词在标题里；无堆砌（>5%）；保留自然语言。

### 3. 竞品分析
锁定 Top10 竞品（直接/间接/品类头部）-> 从标题副标题、描述前 100 词提取关键词 -> 建竞品关键词矩阵算每词覆盖率 -> 找缺口（竞品覆盖 <40%、高量被漏、长尾机会）-> 审视图标/截图/视频等视觉资产 -> 对比评分与好评差评主题 -> 归档定位机会。校验：分析 10+ 竞品、矩阵完整、缺口带量级估计、视觉审计成文。

### 4. 上线
提前 4 周定稿元数据与视觉资产、接好分析（Firebase/Mixpanel）、备好媒体物料 -> 提前 2 周提审与合规检查 -> 配好评价监控与回复模板 -> 上线日确认双商店上架并全渠道宣发 -> 1-7 天按小时追下载速度、24 小时内回复评价 -> 7 天复盘并安排上线后 2 周的首次更新。

### 5. A/B 测试
按影响力选测试元素（图标 > 截图1 > 标题 > 简短描述）-> 写假设 -> 控制组 vs 单变量实验组 -> 算样本量（基线转化、最小可检出效应通常 5%、显著性 95%）-> iOS 用 Product Page Optimization，安卓用 Store Listing Experiments -> 至少跑 7 天到统计显著 -> 分析并落地胜出版本。

## 指令

辅助脚本（均为 Python，按需调用）：

| 脚本 | 用途 | 用法 |
|------|------|------|
| keyword_analyzer.py | 分析关键词的量与竞争 | `python keyword_analyzer.py --keywords "todo,task,planner"` |
| metadata_optimizer.py | 校验字符上限与密度 | `python metadata_optimizer.py --platform ios --title "App Title"` |
| competitor_analyzer.py | 提取对比竞品关键词 | `python competitor_analyzer.py --competitors "App1,App2,App3"` |
| aso_scorer.py | 计算 ASO 健康总分 | `python aso_scorer.py --app-id com.example.app` |
| ab_test_planner.py | 规划测试与样本量 | `python ab_test_planner.py --cvr 0.05 --lift 0.10` |
| review_analyzer.py | 评价情感与主题分析 | `python review_analyzer.py --app-id com.example.app` |
| launch_checklist.py | 生成平台上线清单 | `python launch_checklist.py --platform ios` |
| localization_helper.py | 管理多语言元数据 | `python localization_helper.py --locales "en,es,de,ja"` |

平台字符上限（核心约束，务必遵守）：

| 字段 | Apple App Store | Google Play |
|------|-----------------|-------------|
| 标题 Title | 30 | 50 |
| 副标题 Subtitle | 30 | 无 |
| 简短描述 | 无 | 80 |
| 关键词域 Keywords | 100 | 无 |
| 推广文本 Promotional Text | 170 | 无 |
| 完整描述 | 4000 | 4000 |
| 更新说明 What's New | 4000 | 500 |

A/B 样本量速查（每个变体所需曝光）：基线转化 1% 需 31000；2% 需 15500；5% 需 6200；10% 需 3100。

## 示例

iOS 关键词域优化（核心改写手法）：

优化前（低效，89 字符，8 词）：
```
task manager, todo list, productivity app, daily planner, reminder app
```
优化后（高效，97 字符，14 词）：
```
task,todo,checklist,reminder,organize,daily,planner,schedule,deadline,goals,habit,widget,sync,team
```
改进点：逗号后去空格（+8 字符）、去重（task manager -> task）、去复数（reminders -> reminder）、移除标题已有词、补充更多相关词。

标题优化：`MyTasks`（仅品牌，8 字符）-> `MyTasks - Todo List & Planner`（核心+次级词，29 字符）。

描述开头：把「MyTasks is a comprehensive task management solution...」这类自夸式开场，改成「Forget missed deadlines. MyTasks keeps every task, reminder, and project in one place—Trusted by 500,000+ professionals.」——先点用户痛点、给具体收益、带社会证明、关键词自然不堆砌。

截图文案演进：`Task List Feature`（功能、被动）-> `Create Task Lists`（动作动词）-> `Never Miss a Deadline`（收益导向、有情绪）= 最佳。

## 注意事项

平台行为差异：
- iOS 关键词变更需重新提审；但 iOS 推广文本可不更新 App 直接改。
- 安卓元数据变更 1-2 小时内重建索引；安卓无独立关键词域，靠描述承载关键词。
- 搜索量数据均为估算，无官方来源；竞品数据仅取自公开详情页。

主动提醒（发现即纠正）：
- 标题未含关键词 -> 标题是第一排名因子，必须放最核心词。
- 截图只展示 UI -> 截图要讲价值故事，而非堆界面。
- 无评分策略 -> 低于 4.0 星严重压制转化，接入应用内评分弹窗。
- 描述关键词堆砌 -> 自然语言含词胜过堆砌（密度别超 5%）。

输出要求：每条结论标注置信度（🟢 已验证 / 🟡 中等 / 🔴 假设），按「结论 -> 是什么（带置信度）-> 为什么 -> 如何执行」组织。

## 互见

- content-creator：App 描述文案撰写。
- marketing-demand-acquisition：上线推广与买量活动。
- marketing-strategy-pmm：GTM / 上市策略规划。

---
采编自 alirezarezvani/claude-skills（MIT 许可证）。
