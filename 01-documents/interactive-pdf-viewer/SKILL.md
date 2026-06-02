---
name: interactive-pdf-viewer
title: 交互式 PDF 阅览
description: 当用户想打开/展示 PDF 并在可视化阅览器中协作（标注、高亮、盖章、填表单、放置签名/缩写）时使用；做实时渲染 PDF 并批量执行标注/填表/签名并截图复核的交互工作流；不适用于纯文本摘要或抽取（改用 Read）、生成新 PDF、出具有法律效力的数字签名；触发词：打开PDF、标注合同、填表单、签字盖章、高亮审阅
domain: 文书/office
triggers: [打开PDF, 查看PDF, 标注合同, 高亮关键条款, 填写表单, 签字, 盖章, 审阅文档]
tags: [pdf, annotation, form-filling, signature, viewer, 文书]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [mcp-pdf-server, display_pdf, interact, list_pdfs]
requires: []
related: [pdf-form-filler, pdf-processing-toolkit, professional-proofreader]
combines_with: [pdf-form-filler, esignature-routing]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
采编自 anthropics/knowledge-work-plugins（Apache-2.0），适配重写为中文执行版。

# 交互式 PDF 阅览

通过本地 PDF 服务在实时阅览器中渲染文档，并以可视反馈做标注、填表单、放置签名。核心价值是「把文档展示给用户并协作改标记」，而非把文本回流给你做摘要。

## 何时使用

适用（用户要交互、要看到结果）：
- 打开/展示文档：「打开这份合同」「给我看看这篇论文」
- 协作标注：「高亮关键条款让我审阅」「逐段标出重点」
- 填表单：「帮我填这张表」（带实时可视反馈，能处理字段名晦涩的表单）
- 签字/盖章：「在第 3 页签名」「每页加我的缩写」「盖 CONFIDENTIAL / APPROVED」

不该用（纯文本摄取，直接用原生 Read）：
- 「总结这份 PDF」「第 5 页讲了什么」「抽取第 3 节的表格」
- 生成新 PDF（仅处理已有文件）；出具认证/密码学数字签名（仅放置可视签名图）。

## 步骤 / 指令

工具三件套：`list_pdfs`（列本地 PDF 与允许目录，无参）、`display_pdf`（打开，每文档只调一次，返回 `viewUUID` 和 `formFields`）、`interact`（后续全部动作，带 `viewUUID` + `commands` 数组批量执行，结尾用 `get_screenshot` 复核）。

关键约束：
- `display_pdf` 每份文档只调一次。再次调用会创建独立阅览器，旧 UUID 的 interact 到不了用户正在看的那个。
- `interact` 把多个命令塞进 `commands` 数组顺序执行，省往返；批次末尾必接 `get_screenshot` 做视觉验证。
- 坐标系：PDF 点（1/72 英寸），原点左上角，Y 向下增大；US Letter = 612×792pt。所有标注需 `id`（唯一串）、`type`、`page`（从 1 计）。

`interact` 命令分类：
- 标注：`add_annotations` / `update_annotations`（需 id+type）/ `remove_annotations`（按 id 数组删）/ `highlight_text`（按 query 自动找文本高亮，优于手画矩形）。
- 导航：`navigate`(page)、`search`(query)、`find`(query, 静默)、`search_navigate`(matchIndex)、`zoom`(0.5–3.0)。
- 抽取：`get_text`（按页范围抽，≤20 页，仅用于判断标什么，不用于摘要）、`get_screenshot`。
- 表单：`fill_form`，`fields: [{name, value}, ...]`。

标注类型（key 属性 / 用途）：
- `highlight` rects,color?,content? — 标重点文本
- `underline` rects,color? — 强调术语；`strikethrough` rects,color? — 标删除
- `note` x,y,content,color? — 便签批注；`freetext` x,y,content,fontSize? — 页面可见文字
- `rectangle` / `circle` x,y,width,height,color?,fillColor? — 框/圈区域
- `line` x1,y1,x2,y2,color? — 画线/箭头
- `stamp` x,y,label,color?,rotation? — APPROVED / DRAFT / CONFIDENTIAL 等印章
- `image` imageUrl,x?,y?,width?,height? — 签名、缩写、Logo（本地路径或 HTTPS URL，禁 data: URI，尺寸缺省自动探测）

三类工作流：
1. 协作标注：display_pdf → interact get_text 读相关页 → 向用户描述将标的内容征求同意 → add_annotations + get_screenshot → 展示并迭代 → 完成后提醒可在阅览器工具栏下载带标注的 PDF。
2. 填表单：display_pdf 看 `formFields`（name/type/page/包围盒）→ 字段名晦涩（如 Text1、Field_7）时 get_screenshot 把包围盒对到页面可见标签 → 用可视标签向用户问值或按上下文推断 → fill_form → get_screenshot 让用户确认/直接改。简单规整表单可在 display_pdf 时传 `elicit_form_inputs: true` 预先弹窗收值。
3. 签名：问签名/缩写图片路径 → display_pdf 查 `formFields` 找签名字段或问位置 → add_annotations 用 `type:"image"` 放到目标坐标 → get_screenshot 确认。

支持来源：本地文件（client MCP roots 下路径）、arXiv（`/abs/` 自动转 PDF）、任意直链 HTTPS PDF（bioRxiv/Zenodo/OSF 等，用直链不用落地页）。

## 示例

打开合同并高亮「赔偿」相关条款后复核：
```
display_pdf(url="/files/contract.pdf")        # → 拿到 viewUUID
interact(viewUUID, commands=[
  {action:"highlight_text", query:"indemnification", color:"yellow"},
  {action:"navigate", page:3},
  {action:"add_annotations", annotations:[
     {id:"a1", type:"stamp", page:3, x:420, y:60, label:"CONFIDENTIAL", color:"red"}
  ]},
  {action:"get_screenshot", page:3}
])
```

在第 3 页放置签名图：
```
interact(viewUUID, commands=[
  {action:"add_annotations", annotations:[
     {id:"sig", type:"image", page:3, imageUrl:"/files/signature.png", x:120, y:680}
  ]},
  {action:"get_screenshot", page:3}
])
```

## 注意事项

- 仅可视签名：放的是签名图片，不是认证/密码学数字签名，需向用户声明。
- `get_text` 是为「决定标什么」服务的，别拿它做摘要——摘要/抽取请直接用原生 Read，省 token 也更准。
- 标注前先向用户描述方案、获批再批量落，避免来回返工。
- 同一文档别重复 `display_pdf`；要换文档才新开。
- 坐标弄错时先 get_screenshot 比对，再用 update_annotations 微调，而非反复加删。

## 互见
- related：`pdf-form-filler` —— 无界面/编程式填表的对照方案（本技能强调可视反馈）
- related：`pdf-text-extract` —— 纯文本抽取/摘要的正确去处
- combines_with：`document-review-workflow` —— 把可视标注接入更大的评审/签批流程
