---
name: humanize-chinese-text
title: 中文 AI 味检测与降痕改写
description: 当需要给中文文本去 AI 味、降 AIGC、去除 AI 痕迹、论文降重或转换写作风格时使用；先检测 AI 标记再做最小必要改写并产出更自然的中文及改写说明；不适用于英文文本、内容真伪核验或凭空编造引用数据；触发词：去AI味、降AIGC、去除AI痕迹、论文降重、知网/维普检测、改成人话。
domain: 文书/writing
triggers: [去AI味, 降AIGC, 去除AI痕迹, 让文字更自然, 改成人话, 降低AI率, 论文降重, 知网检测, 维普检测, 万方检测, 改成小红书风格, 改成知乎风格]
tags: [中文写作, ai味检测, aigc降痕, 论文降重, 文风转换, 文本改写]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Write, Bash]
requires: []
related: [content-humanizer, avoid-ai-writing-patterns, beautiful-prose-stylist, professional-proofreader]
combines_with: [xiaohongshu-content-strategy, wechat-official-account-growth]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用户要求「去AI味 / 降AIGC / 去除AI痕迹 / 让文字更自然 / 改成人话 / 降低AI率」。
- 需要排查某段中文是否存在 AI 写作痕迹或可疑措辞。
- 论文、报告、毕业论文等学术文本需面向知网（CNKI）、维普（VIP）、万方（Wanfang）做 AIGC 降痕。
- 需要把中文改写成特定风格：知乎、小红书、公众号、微博、文学、口语、学术。

不该用（负边界）：
- 英文或其他非中文文本。
- 把本技能当成事实真伪、数据正确性的核验工具。
- 任何需要凭空捏造引用、证据、数据的场景（严禁伪造）。
- 输入、权限、安全边界或成功标准缺失时——先停下来问清楚，不要硬改。

## 步骤

1. 先检测，后改写。不要盲改，先标出最明显的 AI 标记：
   - 僵硬的「首先/其次/最后」镜像结构；
   - 机械连接词，如「综上所述」「值得注意的是」「由此可见」；
   - 高大空、信息密度低的抽象表述；
   - 句子节奏、段落长度高度雷同；
   - 学术文字过于完整、过于确定、过于模板化。
   若用户给的是短样本，先直接点出可疑短语，再动手改。

2. 用最小有效改动重写。优先定点改，而非整段重生成：
   - 删冗余连接词，而不是逐句换皮；
   - 打散句长与段落节奏；
   - 替换重复出现的动词和名词短语；
   - 把抽象总结换成具体观察；
   - 保留原有论点、事实、引用和术语不变。

3. 校验结果。改完确认文本：
   - 含义不变；
   - 模板感下降；
   - 节奏更自然；
   - 未引入事实漂移；
   - 语域贴合目标读者。学术文本须保留学术腔，不要过度口语化。

4.（学术专项）AIGC 降痕：保留学科术语；把 AI 学术套话换成更落地的表达；适度加入审慎措辞，降低绝对化口吻；让各小节不再是同一套模板；若结论显得「不自然地圆满」，补充局限或不确定性。安全方向示例：
   - 「本文旨在」→「本文尝试」或「本研究关注」
   - 「具有重要意义」→「值得关注」或「有一定参考价值」
   - 「研究表明」→「前人研究发现」或「已有文献显示」

5.（可选）风格转换：仅在底稿已通顺自然后再做。换风格时只动语气、结构和表层措辞，保持原意稳定。

## 指令

若用户本地有源工具包克隆，可走 CLI：

```bash
python3 scripts/detect_cn.py text.txt -v
python3 scripts/compare_cn.py text.txt -a -o clean.txt
python3 scripts/academic_cn.py paper.txt -o clean.txt --compare
python3 scripts/style_cn.py text.txt --style xiaohongshu -o out.txt
```

可用时的 CLI 顺序：1) 检测并审视可疑句；2) 改写或对比；3) 对清洗后的文件重跑检测；4) 按需转换目标风格。

支持的风格方向：`casual`、`zhihu`、`xiaohongshu`、`wechat`、`academic`、`literary`、`weibo`。

脚本不可用时，走手动改写套路：
- 先删无意义的弱转折；
- 把重复短语合并成一句更有力的话；
- 在自然转折处断句，而非硬凑长平衡句；
- 把生硬机械的碎句适当合并；
- 用具体措辞替换泛泛抽象；
- 让节奏轻微起伏，避免全文匀速「行军」。

## 示例

输入（AI 味明显）：
> 综上所述，本文旨在系统性地研究该问题。首先，我们分析了背景；其次，我们提出了方法；最后，我们得出了具有重要意义的结论。研究表明，该方法效果显著。

改写思路（1-3 条）：
- 删机械连接词「综上所述」「首先/其次/最后」镜像结构；
- 「本文旨在/具有重要意义/研究表明」换成审慎落地表达；
- 打散匀速句长。

输出：
> 本文尝试拆解这个问题。先看背景，再给出方法，最后落到结论。已有文献显示，该方法在测试场景下有一定改善，仍受样本规模所限。

## 注意事项

- 输出规则：先列出发现的主要 AI 痕迹；用 1-3 条短 bullet 说明改写策略；返回改写后的中文；必要时补一句尚存的薄弱处。
- 不要伪造引用、证据或数据。
- 学术文本保留学术语域，不要过度口语化。
- 本技能不替代环境相关的验证、测试或专家评审。
- 任务超出上述范围时不要硬套；缺输入/权限/安全边界/成功标准时先问清。

## 互见

- resume-builder：中文简历生成，同属中文文书产出场景。
- code-review / simplify：若改写对象是代码注释或文档，可配合质量复核。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可），其上游为 `voidborne-d/humanize-chinese` 项目及其检测/改写 CLI 工作流。
