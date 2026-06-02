---
name: pdf-form-filler
title: PDF 表单填写
description: 当需要以编程方式填写、读取或勾选 PDF 表单字段（AcroForm/XFA）、批量套打时使用；触发词：填表、PDF 表单、表单字段、批量盖章、AcroForm。
domain: 文书/office
tags: [pdf, forms, documents]
level: 进阶
status: stable
version: 0.1.0
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pypdf]
requires: []
related: [pdf-processing-toolkit, kyc-document-parser, markdown-to-docx]
combines_with: [pdf-processing-toolkit]
license: CC-BY-SA-4.0
---
当需要以编程方式读取、填写、勾选或导出 PDF 表单字段，或用一份模板批量套打多份文件时使用本技能。

## 何时使用

- 读取 PDF 中已有表单字段（字段名、类型、当前值、可选项）。
- 按「字段名 → 值」映射写入文本框、勾选框、单选组、下拉/列表。
- 用一个模板 + 一份数据表（CSV/JSON）批量生成多份已填好的 PDF（套打）。
- 填写后需要锁定字段（flatten）防止二次修改，或保留可编辑表单。

不该用的边界：

- PDF 里没有真正的表单字段（只是扫描图/纯文本排版）——那是「在指定坐标叠加文字/图章」，属于 PDF 内容绘制，不属于本技能；需先确认存在 AcroForm/XFA 字段。
- 纯 XFA（动态 XFA、无 AcroForm 兜底）的表单，pypdf/pdf-lib 多数无法可靠写入；遇到先探测，命中纯 XFA 时报告并改用 Adobe/iText 等专用方案，不要硬填。
- 生成全新版式文档（非填表）→ 用 `markdown-to-docx` 等排版技能。
- 从 PDF 抽取正文做问答/总结，不涉及字段写入——不属于本技能。

## 步骤 / 指令

1. 探测字段：先列出所有字段，确认是 AcroForm 还是 XFA；纯 XFA 直接走边界处理。
2. 建立映射：构造 `{字段名: 值}`；勾选框的值用其「导出值（on 状态名）」而非字面 "true"，导出值从探测结果取。
3. 校验数据：检查必填字段是否齐全、单选/下拉值是否在可选项内、字段名是否存在（拼写/大小写敏感）。
4. 写入：按映射更新字段值；写文本框设 `NeedAppearances` 以保证查看器渲染外观。
5. 处理外观与锁定：需要锁定时 flatten（合并字段为静态内容），否则保留可编辑。
6. 保存为新文件（不覆盖模板），并复读校验关键字段已生效。
7. 批量场景：对数据表每行重复 2–6，输出文件名带行内唯一键。

伪代码（pypdf）：

```
reader = PdfReader("template.pdf")
fields = reader.get_fields()            # 1. 探测：名/类型/可选项/导出值
assert fields, "无 AcroForm 字段"        # 命中即继续，否则按边界处理

data = {"name": "张三", "agree": "/Yes"} # 2. 映射，勾选用导出值
# 3. 校验
for k in data:
    assert k in fields, f"字段不存在: {k}"

writer = PdfWriter(clone_from=reader)
for page in writer.pages:
    writer.update_page_form_field_values(
        page, data, auto_regenerate=False)
# 4. 外观
writer.set_need_appearances_writer(True)
with open("out.pdf", "wb") as f:
    writer.write(f)
```

## 示例

最小可用——探测字段（命令行）：

```
python -c "from pypdf import PdfReader; import json; print(json.dumps({k:{'type':v.get('/FT'),'states':v.get('/_States_')} for k,v in (PdfReader('template.pdf').get_fields() or {}).items()}, ensure_ascii=False, indent=2))"
```

批量套打（模板 + CSV → 多份 PDF）：

```python
import csv
from pypdf import PdfReader, PdfWriter

rows = list(csv.DictReader(open("data.csv", encoding="utf-8")))
tmpl = PdfReader("template.pdf")
for row in rows:
    w = PdfWriter(clone_from=tmpl)
    for p in w.pages:
        w.update_page_form_field_values(p, row, auto_regenerate=False)
    w.set_need_appearances_writer(True)
    with open(f"out_{row['id']}.pdf", "wb") as f:
        w.write(f)
```

给 Agent 的提示词模板：

```
读取 template.pdf 的全部表单字段并列出字段名/类型/勾选框导出值；
然后用以下映射填写并另存为 out.pdf（不覆盖模板），完成后复读确认 name、agree 已写入：
{ name: "张三", agree: <勾选框的导出值> }
```

## 注意事项

- 勾选/单选必须用字段定义里的导出值（如 `/Yes`、`/On`、`/Off` 或自定义状态名），写 "true"/"1" 多半无效。
- 写文本后查看器显示空白，多为缺外观流：设 `NeedAppearances` 或在能生成外观的库里 flatten。
- flatten 后字段不可再编辑，是单向操作——务必另存新文件，保留原始模板。
- 字段名大小写敏感且可能含点号层级（如 `topmostSubform[0].Page1[0].name[0]`），以探测结果为准，勿臆造。
- 中文/非 ASCII 值需字体支持；某些库 flatten 后中文丢失，先小样验证再批量。
- 始终输出到新文件，批量时确保文件名唯一，避免互相覆盖。
- 处理外部来源 PDF 前先确认无加密/权限限制；加密文档需先解密授权。

## 互见

- requires：无。
- related：`markdown-to-docx`（生成全新版式文书而非填字段时改用它）。
- combines_with：`csv-data-cleaner`（批量套打前，用它清洗/规范数据源 CSV，再喂入本技能的字段映射）。
