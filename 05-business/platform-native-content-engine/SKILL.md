---
name: platform-native-content-engine
title: 平台原生内容引擎（多平台复用矩阵）
description: 当需要把一份源素材（文章/播客/Demo/changelog/内部备忘）改写成 X、LinkedIn、短视频、YouTube、Newsletter 等平台原生内容，或搭建一条围绕产品与叙事的发布序列时使用；做源优先的拆解、按平台适配重写与质量门校验，产出多平台原生草稿矩阵；不适用于纯付费广告创意、视觉设计与从零定义品牌音色（先走 brand-voice）；触发词：发帖、X thread、LinkedIn、短视频脚本、二次分发、内容复用、launch 序列
domain: 商业/marketing
triggers: [平台原生内容, X thread, 推特长文, LinkedIn 帖, 短视频脚本, YouTube 脚本, Newsletter, 简讯, 二次分发, 内容复用, repurpose, 多平台改写, launch 序列, 发帖, 内容矩阵]
tags: [商业, marketing, 内容运营, 社媒, 内容复用, 文案, 增长]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Grep, Glob]
requires: []
related: [content-engine-strategist, content-marketing-strategist, social-media-content-creator, content-strategy-planner]
combines_with: [social-media-multi-publisher, social-media-content-creator, content-engine-strategist]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

把一份真实素材改写成多个平台的原生内容，而**不是**用通用套路把作者真实的声音碾成「平台味儿」的注水文。

适用：
- 写 X 单帖或 thread
- 写 LinkedIn 帖或上线/launch 更新
- 写短视频或 YouTube 讲解的脚本
- 把文章、播客、Demo、文档/changelog、转录稿、截图、旧帖等二次分发成公开内容
- 围绕一个产品 / 洞察 / 叙事，搭建 launch 序列或长期内容体系

不该用（负边界）：
- 纯付费广告创意 → 交给投放/广告创意类技能
- 视觉设计 → 不在本技能范围
- 从零定义/锁定品牌音色 → 先走 `brand-voice` 产出音色画像，本技能复用其结果，不重建第二套音色模型

## 步骤

### 五条不可妥协（贯穿全程）
1. 从源素材出发，而非通用发帖公式。
2. 为平台适配的是**格式**，不是作者人设。
3. 一帖只承载一个真实主张。
4. 用具体事实压倒形容词。
5. 不做钓互动的 engagement bait——除非用户明确要求。

### 源优先工作流
动笔前先盘点源素材集：已发文章 / 笔记备忘 / 产品 Demo / 文档与 changelog / 转录稿 / 截图 / 同一作者的旧帖。
若用户在意某种特定声音，且下游有多个产出或内容涉及 launch、外联、声誉敏感场景，**先跑 `brand-voice`** 建音色画像，本技能直接复用其 `VOICE PROFILE`。

### 复用流程（Repurposing Flow）
1. 选定锚点资产（anchor asset）。
2. 抽出 3~7 个原子主张或画面（atomic claims/scenes）。
3. 按「锐度 / 新意 / 证据」三维排序。
4. 一个强观点配一个产出，不一稿多投同一观点。
5. 按平台适配结构。
6. 剥掉平台塑形的注水。
7. 过质量门（见下）。

## 指令

### 平台适配规则
- **X**：开头甩出最强主张/产物/张力；源声音是压缩的就保留压缩；写 thread 则每一帖都要推进论证；不补受众不需要的上下文。
- **LinkedIn**：只为圈外人能跟上而适度展开；源材料本身不是反思性的，就别强行写成「人生感悟课」；拒绝企业鸡汤腔、拒绝堆赞和「我的旅程」式填充。
- **短视频**：围绕视觉序列与证据点写脚本；开头几秒先抛结果/问题/爆点；不写那种「写在纸上比念出来好听」的旁白。
- **YouTube**：尽早亮出结果或张力；按论证或递进组织，而非填充式分段；分章节只在有助于清晰度时用。
- **Newsletter**：开头直奔要点/冲突/产物；不要用第一段热身；每个小节都要带来新东西。

### 硬禁词（命中即删并重写）
- "In today's rapidly evolving landscape" / 「在当今飞速变化的时代」
- "game-changer"、"revolutionary"、"cutting-edge" 及其中文等价（颠覆性、革命性、前沿黑科技）
- "here's why this matters"——除非紧跟一个具体事实
- 结尾甩一个 LinkedIn 式提问只为骗回复
- LinkedIn 上强行装随意
- 源素材里本就没有的假互动填充

### 交付物
被要求做一个 campaign 时，返回：
- 一份简短音色画像（若需要音色匹配）
- 核心 angle（角度）
- 各平台原生草稿矩阵
- 仅在有助于执行时给出发布顺序
- 发布前必须补齐的缺口（gaps）

## 示例

场景：把一篇产品复盘文章铺成一周多平台内容。
1. 锚点 = 这篇文章；抽出 5 个原子主张（如「指标 X 提升 3 倍」「踩了 Y 这个坑」「架构选型 Z 的取舍」）。
2. 按锐度/新意/证据排序，取前 4 个，一观点配一产出。
3. X：用「指标 X 提升 3 倍」开 thread，每帖推进一步。
4. LinkedIn：把「Y 这个坑」展开到圈外人能懂，不写感悟课。
5. 短视频：脚本先 3 秒亮「3 倍」结果画面，再讲怎么做到。
6. Newsletter：开头直接给取舍结论，每节加新料。
7. 过质量门后交付，并标注「缺一张架构图截图」这类发布前缺口。

## 注意事项

### 质量门（交付前逐条核对）
- 每篇都像目标作者写的，不像平台刻板印象。
- 每篇都含一个真实主张 / 证据点 / 具体观察。
- 没有残留的通用吹捧语。
- 没有假 engagement bait。
- 跨平台无重复复制粘贴——除非用户要求。
- 任何 CTA 都是「赚来的」且经用户确认。

其他：音色一致性跨多个产出时，`brand-voice` 是唯一事实源；要特定作者（如 Affaan/ECC）声音时，仍把 `brand-voice` 当事实源，喂它最佳的实时或源派生素材。

## 互见

- requires：`brand-voice` —— 多产出/声誉敏感场景的音色事实源，应先于本技能产出 `VOICE PROFILE`
- related：`content-engine-strategist`（内容增长体系/主题集群）、`social-media-content-creator`、`content-strategy-planner`
- combines_with：`social-media-multi-publisher` —— 把审定稿分发到各平台；`ad-creative-generator` —— 衍生付费创意

---

采编自 affaan-m/everything-claude-code（MIT 许可证）。
