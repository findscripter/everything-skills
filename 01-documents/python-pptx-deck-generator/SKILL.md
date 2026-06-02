---
name: python-pptx-deck-generator
title: python-pptx 幻灯片生成
description: 当用户要一份能直接跑、用 python-pptx 自动生成 .pptx 演示文稿的 Python 脚本时使用；做的事是把主题简报转成含真实标题与要点、结构合理并自带保存步骤的完整可运行脚本；不适用于编辑/读取已有 pptx、纯排版美化或非幻灯片文档产出；触发词：python-pptx、生成PPT、幻灯片脚本、PowerPoint、演示文稿、slide deck
domain: 文书/office
triggers: [python-pptx, 生成PPT, 幻灯片脚本, PowerPoint, 演示文稿, slide deck, pptx生成, 做PPT脚本]
tags: [python, python-pptx, powerpoint, presentation, slide-deck, code-generation]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, python-pptx]
requires: []
related: [pptx-document-processing, theme-factory]
combines_with: [pptx-document-processing, board-deck-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# python-pptx 幻灯片生成

## 何时使用

用户想要一段**直接可运行**的 Python 脚本，用 `python-pptx` 自动生成 `.pptx` 演示文稿（标题、目录、要点、总结俱全），常见于 demo、教学、内部简报场景。

不该用的边界：
- 要**读取/编辑已有** `.pptx`（解析、改样式、抽内容）—— 不是本技能职责。
- 只要**精细排版/视觉设计**（自定义坐标、母版、动画）—— python-pptx 能力有限，别硬凑不存在的 API。
- 产物不是幻灯片而是 Word/文档 —— 改用文档类技能（见互见）。

## 步骤 / 指令

1. **收集简报**：确认主题、受众、语气、目标页数。缺失项就取保守默认值（如 5～6 页），并在脚本注释里写明所选默认。
2. **先列叙事骨架，再写代码**。标准弧：① 标题页 → ② 目录/背景 → ③ 核心论点（教学或业务）→ ④ 总结/下一步。页数贴合受众，**砍掉凑数页**，通常压到 4～8 页。
3. **生成完整脚本**，必须做到：
   - `from pptx import Presentation`（注意包名导入是 `pptx`，pip 装的是 `python-pptx`）；
   - 创建 deck、选用内置版式（layout）；
   - 写**真实**标题与要点，不留占位符；
   - 用清晰文件名显式 `prs.save("output.pptx")`；
   - 保存后 `print` 一句成功提示。
4. **保证可运行**：输出一个完整 Python 代码块，装好 `python-pptx` 即可跑。**禁止**伪代码、占位符、缺失 import 或需要用户自行补全的残片。

## 示例

安装：`pip install python-pptx`

最小可运行骨架：

```python
from pptx import Presentation
from pptx.util import Pt

prs = Presentation()

# 1. 标题页（layout 0 = Title Slide）
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "机器学习入门"
slide.placeholders[1].text = "面向高中课堂 · 5 页速览"

# 2. 内容页（layout 1 = Title and Content）
def add_bullets(title, bullets):
    s = prs.slides.add_slide(prs.slide_layouts[1])
    s.shapes.title.text = title
    body = s.placeholders[1].text_frame
    body.text = bullets[0]
    for b in bullets[1:]:
        p = body.add_paragraph()
        p.text = b

add_bullets("什么是机器学习", ["从数据中学习规律", "无需逐条硬编码规则", "预测 / 分类 / 聚类"])
add_bullets("核心概念", ["特征与标签", "训练集与测试集", "过拟合与泛化"])
add_bullets("常见例子", ["垃圾邮件识别", "图片分类", "推荐系统"])
add_bullets("小结", ["数据驱动 ≠ 魔法", "好数据胜过复杂模型", "下一步：动手跑一个小例子"])

prs.save("ml_intro.pptx")
print("已生成 ml_intro.pptx")
```

需求示例：
- 「5 页机器学习基础，面向高中课堂」→ 标题页 / 概览 / 核心概念 / 例子 / 回顾。
- 「7 页给销售管理层讲 Q2 管道风险与缓解」→ 高管口吻标题 + 精炼要点 + 末页建议。

## 注意事项

- **优先用内置 layout**（`slide_layouts[0]`/`[1]`…），除非用户明确要自定义定位。
- **写受众适配的真实要点**，不要占位文字；标题简短，层级清晰。
- **别堆页数**：超出受众需要的就压缩到最重要的 4～8 页（除非用户明确要长版）。
- **必收尾**：每个脚本都要以 `prs.save(...)` + 成功 print 结束，别忘存盘。
- 安全：只在你掌控的环境（如本地 venv）装 `python-pptx`；在共享机上选安全输出路径，避免无确认覆盖已有文件；含敏感/专有内容时不要写进公开示例和示例文件名。
- 不要臆造 python-pptx 不支持的样式 API；拿不准就先核实其能力边界。

## 互见

- related：`markdown-to-docx` —— 当产物应是 Word 文档而非幻灯片时改用它。
- combines_with：`docs-architect` —— 先用它规划内容/叙事结构，再交本技能生成 deck。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
