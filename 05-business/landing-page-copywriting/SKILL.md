---
name: landing-page-copywriting
title: 落地页营销文案撰写
description: 当为落地页/首页/定价页/功能页/关于页撰写、改写或优化转化型营销文案时使用；产出按区块组织的标题/副标题/CTA/正文及备选方案与转化标注；不适用于邮件序列文案（见 email-sequence）、弹窗文案（见 popup-cro）或纯逐行润色（见 copy-editing）；触发词：写文案、落地页文案、标题、CTA、改写这一页
domain: 商业/copy
triggers: [写文案, 改写这一页, 落地页文案, 首页文案, 定价页文案, 标题怎么写, CTA 文案, headline, marketing copy, rewrite this page]
tags: [营销, 文案, 落地页, 转化优化, cro, 标题公式, cta]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [headline_scorer.py, Read, Write]
requires: []
related: [conversion-copywriter, conversion-rate-optimizer, marketing-copy-editor, ad-creative-generator]
combines_with: [conversion-rate-optimizer, conversion-copywriter, ab-test-designer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

需要为某个页面撰写、改写或优化转化型营销文案时使用，包括：首页、落地页、定价页、功能页、关于页、产品页。当用户说"帮我写……文案""改写这一页""标题怎么写""CTA 怎么写"时触发。

**不该用的边界（互见对应技能）：**
- 邮件序列文案 → email-sequence
- 弹窗/CRO 弹层文案 → popup-cro
- 已有草稿的逐行润色、去 AI 腔 → copy-editing / content-humanizer
- 决定"该做哪些页面/选题"而非动笔写 → content-strategy
- 把成稿改编到社交平台 → social-content

本技能负责"写新文案"，不负责系统性逐行精修。

## 步骤

1. **先取上下文，再动笔。** 若存在 `.claude/product-marketing-context.md`，先读它，只追问其中未覆盖的信息。需要明确四类上下文：
   - 页面目标：什么类型的页？希望访客采取的**唯一**主行动是什么？
   - 受众：理想客户是谁？要解决什么问题？有哪些顾虑/异议？他们用什么词描述自己的问题（voice-of-customer）？
   - 产品/卖点：卖什么？与替代方案的差异？核心转化结果？有哪些证据（数字、证言、案例）？
   - 流量上下文：访客从哪来（广告/自然/邮件）？到达前已知道什么？

2. **写标题（最重要的一句）。** 从下列公式中选 3-5 个生成变体，必含"结果型、痛点型、提问型、强主张型、品类型"等不同角度：
   - `{达成结果} without {痛点}`、`The {品类} for {受众}`、`Never {不愉快事件} again`
   - `Turn {输入} into {结果}`、`{结果} in {时间框}`、`Stop {痛}. Start {爽}.`
   - `[数字] [人群] use [产品] to [结果]`、`What if you could {结果}?`

3. **搭页面结构（讲一个故事，而非罗列功能）。** 强结构示例：Hero（标题+副标题+主 CTA）→ 社会证明条 → 痛点 → 工作原理（3-4 步）→ 核心收益（3-5 个，别堆 10 个）→ 证言 → 用例/人群 → 对比 → 案例片段 → FAQ → 终极 CTA（含风险逆转）。广告落地页用紧凑版即可。

4. **写 CTA。** 用公式 `[动作动词] + [他能得到什么] + [限定词]`。避免 Submit / Sign Up / Learn More / Get Started；改用 "Start My Free Trial""Get the Complete Checklist""See Pricing for My Team"。

5. **打分自检（可选脚本）。** 用 `headline_scorer.py` 给标题 0-100 打分，覆盖力量词、情绪触发、数字、长度、具体度、清晰度 6 维：

   ```bash
   python3 headline_scorer.py "你的标题"
   python3 headline_scorer.py --file headlines.txt --json
   ```
   长度最优区间为 6-12 词（中文按语义自行折算），含 jargon（synergy/leverage/utilize 等）会扣分。

6. **按输出格式交付**：按区块组织的文案 + 关键元素标注（为何这么写、用了什么原则）+ 标题/CTA 各 2-3 个备选 + 必要时的 SEO 标题与 meta 描述。

## 指令

- **先给结论再解释**：先交付文案，再说明取舍。
- **标注是强制项**：绝不交付无解释的文案；高风险元素（标题、CTA）必须给备选，禁止"只给一个就完事"。
- **信心标签**：🟢 强烈推荐 / 🟡 建议 A/B 测试 / 🔴 需补证据才能成立。
- **主动预警**（无需被问就指出）：文案以"我们/公司名"开头 → 改为先讲客户结果；价值主张含糊（"最好的团队平台"）→ 逼出"谁、什么结果、多久"；只列功能不讲收益 → 补"这意味着……"桥接句；无社会证明 → 标为转化风险并索取证言/数字；CTA 用弱动词 → 给动作+结果替代。

## 示例

弱 → 强（直给价值，别埋在限定语里）：

- ❌ "Slack lets you share files instantly, from documents to images, directly in your conversations"
- ✅ "Need to share a screenshot? Send as many documents, images, and audio files as your heart desires."

具体压倒含糊：

- 含糊："Save time on your workflow"
- 具体："Cut your weekly reporting from 4 hours to 15 minutes"

工作原理区块（编号 + 简单动词 + 结果导向）：

1. Connect your tools (takes 2 minutes)
2. Set your preferences
3. Get automated reports every Monday

## 注意事项

- **清晰 > 聪明**：要在清晰和创意间二选一，选清晰。
- **写作铁律**：简单词替复杂词（use 不 utilize、help 不 facilitate）；具体 > 含糊（避开 streamline/optimize/innovative）；主动语态；去掉 almost/very/really 等软化词；去掉所有感叹号；绝不编造统计数据或证言。
- **每区块一个论点**，沿页面向下构成逻辑流。
- **用客户的语言**，镜像评论/访谈/工单里的真实措辞。
- **过渡自然、避免 AI 腔**：少用 moreover/furthermore；避开 "That being said""It's worth noting that""Let's delve into""In today's digital landscape" 等 AI 套话；段首勿用 "In conclusion"。
- 不同页型侧重不同：首页服务多受众但别泛化；落地页单一信息单一 CTA 且标题需匹配广告来源；定价页消除"哪个适合我"焦虑并突出推荐档；功能页打通"功能→收益→结果"；关于页讲"为何存在"但仍要带 CTA。

## 互见

- **marketing-context**：动笔前的基础，加载品牌声音、ICP、定位。
- **copy-editing**：首稿完成后做系统性逐行精修。
- **content-humanizer**：草稿读起来机械/模板化时去 AI 腔。
- **content-strategy**：决定写哪些页/选题（非动笔本身）。
- **social-content**：把成稿改编到社交平台。
- **ab-test-setup**：为文案变体设计实验。
- **email-sequence**：邮件文案专用。
- **popup-cro**：弹窗文案专用。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
