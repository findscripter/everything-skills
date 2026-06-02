---
name: avoid-ai-writing-patterns
title: 识别并重写 AI 写作腔调
description: 当需要审查并重写文稿、去除"AI 味"（机器生成腔调、套话、过度修辞）时使用；做按 21 类模式 + 词替换表逐条标注问题并产出更朴素的改写稿、附二次复检；不适用于检测 AI 生成代码、不替代事实核查；触发词：去 AI 味、AI 腔、AI-ism、像 AI 写的、润色、文稿审查
domain: 文书/writing
triggers: [去 AI 味, AI 腔, AI-ism, 像 AI 写的, AI 写作模式, 润色, 文稿审查, remove AI-isms, make this sound less like AI]
tags: [writing, editing, audit, ai-detection, proofreading]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [humanize-chinese-text, content-humanizer, beautiful-prose-stylist, professional-proofreader]
combines_with: [doc-coauthoring, marketing-copy-editor]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用户说"去掉 AI 味""清理 AI 腔""让它别像 AI 写的""读起来太机械"，或要给 AI 起草的内容做发布前润色。
- 审查文档、博客、营销文案、对内通讯等任何疑似机器生成的散文，找出并改掉"AI 标记"（AI-ism）。
- 已有人写的文稿想朝更朴素、更口语、更具体的方向收敛。

不该用的边界：
- 只处理散文，不检测 AI 生成的**代码**。
- 模式匹配是经验准则、非铁律——同一个词在特定语境里可能是恰当的，不要机械替换。
- 不核实事实、不替你补真实引用与出处；遇到含糊归因／可疑数据，标注后交 `fact-checking`，本技能不担保事实。
- 不是"重写到面目全非"——保留原意与作者声音，只去腔调。

## 步骤 / 指令

按四段式产出，顺序固定：

```
1. 标问题（Issues found）
   - 通读全文，逐条引用每一处 AI-ism 原词/原句，并标其类别。
   - 覆盖 21 类模式（见下），不要只挑词替换那一类。

2. 出改写（Rewritten version）
   - 给出整体重写稿：更短句、更具体、删空话，保留原意与信息密度。
   - 词替换查替换表（见下），但最终选词依语境定，不照搬。

3. 列改动（What changed）
   - 概述改了什么、为什么（哪类腔调→怎么处理）。

4. 二次复检（Second-pass audit）★ 必做
   - 把第 2 步的改写稿当全新输入再审一遍，揪出改写时残留或新引入的 AI 标记。
   - 这一步是质量闸门，跳过即视为未完成。
```

要扫的 **21 类 AI 写作模式**：

- 排版类：滥用破折号（em dash）、加粗泛滥、emoji 当小标题、通篇堆项目符号、行内小标题列表、标题用 Title Case。
- 句法类：模糊对冲（hedging）、空洞强调词（hollow intensifiers）、"三连"修辞（rule of three）、回避系动词（copula avoidance）、同义词来回换（synonym cycling）。
- 内容类：模板腔/套话、过渡套句、意义膨胀（拔高重要性）、含糊归因、填充废话、套路化"挑战/结语"、泛泛而谈的总结、名人/权威堆砌（notability name-dropping）、浮于表面的 "-ing" 式分析、推销腔、假区间（false ranges，如 "ranging from X to Y" 实为虚指）、聊天机器人残留物（如 "Certainly!""As an AI"）、知识截止/免责声明。

**词替换表（关键样例，原 43 条；按语境取舍）**：

```
leverage      → use（用）
utilize       → use（用）
robust        → reliable（可靠）
cutting-edge  → newer / latest（更新的）
streamline    → simplify（简化）
foster        → support / build（促成/建立）
seamless      → smooth / easy（顺畅/省心）
embark on     → start（开始）
pivotal       → key / important（关键）
serves as a testament to → shows（说明）
Moreover / Furthermore → 删去或换 also / and
In today's rapidly evolving … landscape → 直接删，开门见山
delve into    → look at / explore（看看/深入）
```

中文写作的等价"AI 腔"也一并扫除：滥用"赋能/抓手/闭环/生态/打法"，"在当今……的时代""值得注意的是""综上所述"，过度排比与三连，空泛形容词（强大/卓越/全面/无缝），以及"不仅……而且……"的套式堆叠。

## 示例

输入提示词：

```
审查下面这段，去掉 AI 写作模式：

"In today's rapidly evolving AI landscape, developers are embarking on a
pivotal journey to leverage cutting-edge tools that streamline their
workflows. Moreover, these robust solutions serve as a testament to the
industry's commitment to fostering seamless experiences."
```

四段式输出：

```
1. 标问题：In today's rapidly evolving…landscape、embarking、pivotal、journey、
   leverage、cutting-edge、streamline、Moreover、robust、serve as a testament to、
   fostering、seamless —— 套句/意义膨胀/词替换/三连。
2. 改写："Developers are starting to use newer AI tools to simplify their work.
   These tools are reliable, and they're making development less painful."
3. 改动：删开篇套句；leverage→use、cutting-edge→newer、streamline→simplify、
   robust→reliable；拆掉"serves as a testament to"的空洞拔高；去 Moreover。
4. 二次复检：再读改写稿——无残留 AI-ism，句子具体、无对冲、无三连。通过。
```

## 注意事项

- **第 4 步二次复检不可省**：第一遍改写常会引入新腔调，必须把改写稿当新输入再扫一遍。
- 准则非铁律：先看语境再判定，破折号、加粗、列表本身不是错，**滥用**才是；不要为了"去 AI 味"把正常表达也改坏。
- 词替换表是建议项不是查找替换脚本：最优选词随上下文变，留人决定。
- 不核实事实、不补真实引用：含糊归因（"研究表明""专家认为"）只标记，交 `fact-checking` 处理，本技能无法替你找到真实出处或证伪。
- 只管散文，不检测/改写 AI 生成的代码。
- 保留作者声音与信息量：目标是更朴素可读，不是删到失真或丢失关键信息。

## 互见

- related：`internal-comms` —— 对内通讯稿写完后，用本技能扫一遍去掉 AI 腔。
- related：`seo-content-writer` —— SEO/GEO 长文产出后做去 AI 味润色。
- related：`markdown-to-docx` —— 改写定稿后转成可交付 Word 文档。
- requires/配合：`fact-checking` —— 文中含糊归因、可疑数据、需补的引用交其核验，本技能不担保事实。
- combines_with：`internal-comms`、`seo-content-writer` —— 起草→去 AI 味，串成"写作 + 润色"流水线。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT），适配重写为面向 AI Agent 的中文条目，保留其 21 类模式、词替换表与四段式（含二次复检）等关键约束，非逐字翻译。
