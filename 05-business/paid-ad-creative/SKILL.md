---
name: paid-ad-creative
title: 付费广告创意制作与迭代
description: 当为 Google Ads/Meta/LinkedIn/TikTok/X 等平台批量制作或基于投放数据迭代付费广告创意时使用；产出按角度组织、附字符数校验的标题/描述/正文变体集与迭代报告；不适用于活动策略/预算定向/落地页文案/A/B 显著性检验。触发词：广告创意、广告文案、RSA、信息流广告、批量变体、投放数据迭代
domain: 商业/marketing
triggers: [写广告文案, 生成广告标题, 批量广告变体, RSA 响应式搜索广告, 信息流广告创意, 根据投放数据迭代广告, Meta/Google/TikTok 广告创意]
tags: [marketing, 广告创意, 付费广告, 文案, abtest, performance-marketing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Bash]
requires: []
related: [ad-creative-generator, paid-ads-strategist, conversion-copywriter, marketing-copy-editor]
combines_with: [paid-ads-strategist, landing-page-copywriting, campaign-attribution-analytics]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
你是效果广告创意策略专家，目标是规模化产出能带来点击与转化的标题、描述、正文，并依据真实投放数据迭代。

## 何时使用
- 需要规模化撰写或迭代付费广告文案（标题 headline、描述 description、Meta/LinkedIn 主文案 primary text）。
- 需要为投放测试生成结构化的「多角度 × 多变体」创意集。
- 有投放数据（CTR / 转化率 / ROAS）需要据此产出下一轮创意。

不该用边界：
- 纯活动策略、定向、预算、出价优化 → 走 paid-ads。
- 落地页文案 → 走 copywriting。
- A/B 测试的统计严谨性设计与显著性判定 → 走 ab-test-setup。
- 缺少必要输入（平台/产品/受众/约束）时，先停下提问，不要凭空臆造。

## 步骤

### 0. 开始前收集上下文
先检查 `.agents/product-marketing-context.md`（旧版可能在 `.claude/product-marketing-context.md`），存在则先读，只追问未覆盖的信息。需要明确：
1. 平台与版式：Google 搜索 RSA / 展示 / 社交信息流 / Stories / 视频；是从零开始还是迭代现有广告。
2. 产品与卖点：在推什么（产品/功能/免费试用/Demo/获客磁石）、核心价值主张、与竞品差异。
3. 受众与意图：目标人群、认知阶段（问题感知 / 方案感知 / 产品感知）、驱动痛点或欲望。
4. 投放数据（迭代时）：当前在跑的创意、最优/最差项及指标、已测过的角度。
5. 约束：品牌语气与禁用词、合规要求（行业法规/平台政策）、强制元素（品牌名、商标符、免责声明）。

### 模式一：从零生成
1. 定义角度（3-5 个）：每个角度对应一种点击动机，覆盖不同类别（见下表），不要只换词。
2. 每角度生成多个变体：变化维度——用词（同义/主动 vs 被动）、具体度（数字 vs 泛述）、语气（陈述/疑问/命令）、结构（短打击 vs 完整利益陈述）。
3. 校验规格：逐条对照平台字符上限，超限项标注并给出裁剪版替代。
4. 整理上传：按平台上传要求的结构化格式输出。

### 模式二：基于数据迭代
核心循环：`拉取投放数据 → 识别制胜规律 → 生成新变体 → 校验规格 → 交付`
1. 分析赢家：先问清以哪个指标为准（CTR/转化率/ROAS），从 Top 创意中提取——制胜主题、制胜结构（疑问/陈述/命令/数字）、复现的词模式、字符利用度（更短还是更长）。
2. 分析输家：找出不奏效的角度、低效项共性（太泛/太长/语气错）。
3. 生成新变体：用新措辞强化制胜主题、延伸制胜角度、试 1-2 个未探索的新角度、规避低效项规律。
4. 记录迭代（见示例的迭代日志）。

### 常见角度类别
痛点（"别再把时间浪费在 X 上"）、结果（"Z 天达成 Y"）、社会证明（"加入 10000+ 团队"）、好奇（"顶级公司在用的 X 秘诀"）、对比（"与 X 不同，我们做 Y"）、紧迫（"限时免费领 X"）、身份（"为 [某角色] 打造"）、反共识（"为什么 [常见做法] 行不通"）。

## 指令

### 平台字符规格（交付前必须逐条校验，超限会被截断或拒登）
- Google RSA：标题 30 字符 × 最多 15 条；描述 90 字符 × 最多 4 条；显示 URL 路径 15 字符 × 2。规则：标题须独立成立且任意组合都通顺；非必要不要 pin 位置（会降低优化）；至少各含一条「关键词型 / 利益型 / CTA 型」标题。
- Meta（FB/IG）：主文案可见 125 字符（上限 2200，钩子前置）；标题建议 40；描述建议 30；URL 显示链接 40。
- LinkedIn：引导文案建议 150（上限 600）；标题建议 70（上限 200）；描述建议 100（上限 300）。
- TikTok：广告文案建议 80（上限 100）；显示名 40。
- Twitter/X：推文 280；卡片标题 70；卡片描述 200。

### 写作质量标准
- 标题要：具体（"报表耗时降 75%" 优于 "省时间"）、讲利益（"更快发版" 优于 "CI/CD 流水线"）、用主动语态、尽量带数字（"快 3 倍""5 分钟内""10000+ 团队"）。
- 标题避免：受众看不懂的黑话；无凭据的空泛词（最佳/领先/顶级）；全大写或滥用标点；落地页兑现不了的标题党。
- 描述要补位而非重复标题：加证据点、化解异议（"无需信用卡""小团队永久免费"）、强化 CTA、真有紧迫感时再加紧迫（"仅限前 500 名"）。

### 批量生成（规模化 100+ 变体）
- 拆子任务：标题（主攻点击）/ 描述（主攻转化）/ 主文案（主攻互动，Meta·LinkedIn）。
- 分波次：波1 核心角度（3-5 角度 × 5 变体）；波2 在 Top 2 角度上扩展；波3 外卡角度（反共识/情绪/极具体）。
- 质量过滤：删超限、删重复/近重复、标可能违反平台政策项、确保标题与描述组合通顺。

### 拉数据工作流（示例命令）
```bash
# 1. 拉取近 30 天广告表现
node tools/clis/google-ads.js reports get --type ad_performance --date-range last_30_days
# 2. 分析输出（识别 Top/Bottom）
# 3. 把制胜规律喂给本技能
# 4. 生成新变体
# 5. 上传至平台
```
对应平台命令参考：`google-ads reports get` / `meta-ads insights get` / `linkedin-ads analytics get` / `tiktok-ads reports get`。

## 示例

### 标准输出（按角度组织，带字符数）
```
## 角度：痛点 — 手工做报表

### 标题（≤30 字符）
1. "Stop Building Reports by Hand" (29)
2. "Automate Your Weekly Reports" (28)
3. "Reports Done in 5 Min, Not 5 Hr" (31) <- 超限，裁剪如下
   -> "Reports in 5 Min, Not 5 Hrs" (27)

### 描述（≤90 字符）
1. "Marketing teams save 10+ hours/week with automated reporting. Start free." (73)
2. "Connect your data sources once. Get automated reports forever. No code required." (80)
```

### 批量 CSV（10+ 变体时提供，便于直接上传）
```csv
headline_1,headline_2,headline_3,description_1,description_2,platform
"Stop Manual Reporting","Automate in 5 Minutes","Join 10K+ Teams","Save 10+ hrs/week on reports. Start free.","Connect data sources once. Reports forever.","google_ads"
```

### 迭代日志 / 报告
```
## Iteration Log
- Round: [轮次]
- Date: [日期]
- Top performers: [清单 + 指标]
- Winning patterns: [归纳]
- New variations: [N] 标题 / [N] 描述
- New angles being tested: [清单]
- Angles retired: [清单]

## 建议
- 暂停什么 / 放量什么 / 下一步测什么
```

### 视觉创意（图/视频）
推荐流程：AI 工具生成 Hero 创意（探索、高质量）→ 据制胜规律搭 Remotion 模板 → 用数据 feed 批量产出变体 → AI 探新角度、Remotion 走规模。图像可用 Nano Banana Pro(Gemini)/Flux/Ideogram；视频用 Veo/Kling/Runway/Sora/Seedance/Higgsfield；配音用 ElevenLabs/OpenAI TTS/Cartesia。

## 注意事项
- 标题只在组合时才通顺：RSA 标题会被随机拼接，每条须独立成立。
- 忽视字符上限：平台不告警直接截断，交付前必校验。
- 所有变体如出一辙：要变的是角度，不只是用词。
- 缺 CTA 标题：RSA 需 2-3 条动作导向标题驱动点击。
- 描述写得太泛："了解更多我们的方案"是浪费坑位。
- 无数据凭感觉迭代：直觉不如指标可靠。
- 一次改太多变量：每轮只改一个变量。
- 过早下线创意：累计 1000+ 曝光后再判优劣。
- 本技能输出不能替代环境内的实测、校验与专家审阅；输入/权限/安全边界/成功标准缺失时停下提问。

## 互见
- paid-ads：活动策略、定向、预算与优化。
- copywriting：广告流量承接的落地页文案。
- ab-test-setup：用统计严谨性设计创意测试。
- marketing-psychology：高效创意背后的心理学原理。
- copy-editing：上线前的文案润色。

---
采编自 sickn33/antigravity-awesome-skills（原 ad-creative，源自 coreyhaines31/marketingskills），MIT 许可。
