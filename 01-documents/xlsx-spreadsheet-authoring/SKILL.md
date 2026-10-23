---
name: xlsx-spreadsheet-authoring
title: XLSX 表格制作：Excel 文件创建与格式化
description: 当需要创建、编辑或检查 .xlsx 工作簿的数据、公式和格式时使用；用 openpyxl 编写工作簿、独立核算关键数据，并在有可用电子表格引擎时重算和核验公式；不适用于纯文本问答、未验证兼容性的复杂宏工作簿或代替正式财务审计；触发词：做Excel、生成xlsx、写公式、套格式、建财务模型、改表格
domain: 文书/office
triggers: [帮我做/生成一个 Excel/xlsx 表格, 给单元格写公式或做条件格式, 搭建/更新财务模型并保证无公式错误, 用 pandas 读取分析 Excel 数据, 编辑现有 xlsx 的工作表与单元格]
tags: [文书, xlsx, excel, openpyxl, pandas, 财务模型, 公式]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pandas, openpyxl, libreoffice]
requires: []
related: [spreadsheet-formula-auditor, python-pptx-deck-generator, pdf-form-filler, markdown-to-docx]
combines_with: [spreadsheet-formula-auditor, csv-data-cleaner, startup-financial-modeler]
license: CC-BY-4.0
---
# XLSX 工作簿创建与编辑

## 何时使用

为结构化数据创建或修改 `.xlsx`，设置公式、数字格式和打印布局，并核验结果。涉及复杂宏、数据连接或受保护模板时，先明确必须保留的功能与可用的 Excel/LibreOffice 环境。

## 步骤 / 指令

1. **明确交付**：确认数据来源、列含义、单位、币种、日期口径、工作表结构与输出路径。保留输入副本，不直接覆盖原件。
2. **检查依赖**：确认 Python 与 `openpyxl` 已预装；分析大表可选 `pandas`。需要重新计算公式时必须另有 Excel 或经确认兼容的 LibreOffice。本条不提供或调用 `recalc.py` 等隐藏 helper，缺依赖时报告可完成范围。
3. **读取与建模**：编辑现有文件用 `load_workbook(..., data_only=False)` 保留公式；检查工作表、名称、合并区和外部链接。将输入、计算和汇总分开，保留可追溯的数据来源与假设。
4. **写入**：以明确的数据类型写值；金额、日期和百分比设置正确数字格式。公式使用库所需的英文函数名与分隔符；跨表引用核对工作表名和绝对/相对坐标。用户数据若以 `=` 开头且不是获准的公式，应作为文字处理。
5. **排版**：统一表头、对齐与适量颜色，冻结表头、设置筛选与列宽；合并单元格只用于标题区。按实际纸张设置打印范围和方向，避免把数据表整体压缩到难以阅读。
6. **验证结构和计算**：保存到新文件后重新打开，检查表名、行列数、公式字符串、数字格式与关键数据。用独立计算核对总数、边界情况和业务约束。
7. **公式重算**：`openpyxl` 写入公式但不计算结果。使用获准且适配该工作簿的 Excel/LibreOffice 在输出副本上重算并保存，然后分别按公式模式和 `data_only=True` 读取；检查关键公式值及错误单元格。没有重算引擎或缓存值时明确写“公式未完成重算”，不能宣称已验证数值正确。
8. **交付检查**：在实际应用中查看重要工作表与打印预览，核对截断、分页、图表和条件格式。提交最终文件、核验结果以及尚未完成的检查。

## 示例

下面独立创建一个采购明细示例。数字为教学输入；公式等待实际电子表格引擎计算，Python 的总额用于后续独立核对。

```python
from pathlib import Path
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill

records = [("Notebook", 12, 3.50), ("Cable", 8, 9.00), ("Labels", 4, 2.25)]
destination = Path("purchase-summary.xlsx")
workbook = Workbook()
sheet = workbook.active
sheet.title = "Purchases"
sheet.append(["Item", "Quantity", "Unit price", "Amount"])
for row_number, (item, quantity, price) in enumerate(records, start=2):
    sheet.append([item, quantity, price, f"=B{row_number}*C{row_number}"])
total_row = len(records) + 2
sheet.cell(total_row, 1, "Total")
sheet.cell(total_row, 4, f"=SUM(D2:D{total_row - 1})")
for cell in sheet[1]:
    cell.font = Font(bold=True, color="FFFFFF")
    cell.fill = PatternFill(fill_type="solid", fgColor="24527A")
for row in sheet.iter_rows(min_row=2, min_col=3, max_col=4, max_row=total_row):
    for cell in row:
        cell.number_format = '#,##0.00'
sheet.freeze_panes = "A2"
sheet.auto_filter.ref = f"A1:D{total_row - 1}"
for column, width in {"A": 24, "B": 14, "C": 16, "D": 16}.items():
    sheet.column_dimensions[column].width = width
sheet.print_area = f"A1:D{total_row}"
with destination.open("xb") as stream:
    workbook.save(stream)
check = load_workbook(destination, data_only=False)
assert check["Purchases"][f"D{total_row}"].value == f"=SUM(D2:D{total_row - 1})"
check.close()
print("重算后总额应为：", sum(quantity * price for _, quantity, price in records))  # 123.0
```

重算后对**重算副本**做缓存值检查（只有确认引擎已完成重算才能执行此验收）：

```python
from openpyxl import load_workbook

calculated = load_workbook("purchase-summary-recalculated.xlsx", data_only=True)
actual = calculated["Purchases"]["D5"].value
assert isinstance(actual, (int, float)), "缺少公式计算结果，不能当作零"
assert abs(actual - 123.0) < 0.000001
errors = [(sheet.title, cell.coordinate, cell.value)
          for sheet in calculated for row in sheet for cell in row if cell.data_type == "e"]
assert not errors, errors
calculated.close()
```

## 注意事项

- `data_only=True` 读取的是上次计算缓存；`None` 可能表示没有缓存，不能据此覆盖公式或报告为零。
- 编辑带宏的 `.xlsm` 需明确采用支持其保留要求的路线；普通 `.xlsx` 示例不适用于宏保真承诺。复杂图表、签名、外链和第三方扩展也需额外往返验证。
- Excel 与 LibreOffice 的函数、动态数组和格式支持可能不同；使用重算引擎前先选代表性工作表验证兼容性。
- 业务数字不得为凑平而硬编码修改。记录精度和舍入规则，外部数据保留时间与来源。
- 所有外部链接、查询刷新、宏执行都应与本次任务权限一致；读取工作簿内容不意味着允许运行其中代码。
- 官方接口参考：[openpyxl 教程](https://openpyxl.readthedocs.io/en/stable/tutorial.html)、[openpyxl 公式说明](https://openpyxl.readthedocs.io/en/stable/simple_formulae.html)、[pandas](https://pandas.pydata.org/docs/)。

## 互见

关系以 frontmatter 为准。`spreadsheet-formula-auditor` 负责进一步公式审计；`csv-data-cleaner` 提供清洁输入数据。

---
本条为本仓独立编写的通用流程与示例，以 CC-BY-4.0 提供；不含第三方专有技能的 helper、模板或提示词，也不承诺未实际执行的公式重算。
