---
name: xlsx-spreadsheet-authoring
title: XLSX 表格制作：Excel 文件创建与格式化
description: 当需要创建、编辑或分析 .xlsx 表格（数据、公式、格式化、财务模型）时使用；做用 pandas 读析、openpyxl 写公式与样式、recalc.py 强制重算并产出零公式错误的工作簿；不适用于 .docx/.pptx、纯文本无表格需求或一次性问答；触发词：做Excel、生成xlsx、写公式、套格式、建财务模型、改表格
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
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当用户要**创建、编辑或分析 `.xlsx` 工作簿**时使用。按任务选库分流：

- **读取/分析数据**：用 **pandas**（`read_excel` 预览、统计、批量导出）。
- **写公式/格式/财务模型**：用 **openpyxl**（单元格、公式字符串、字体、填充、列宽、多工作表）。
- **凡含公式**：openpyxl 只写公式**字符串不计算值**，必须跑 `recalc.py` 用 LibreOffice 重算并扫错。

不该用的边界：

- 目标是 Word（`.docx`）或 PPT（`.pptx`）→ 用对应文档技能，不用本技能。
- 只需纯文本/一句话答复、无表格结构 → 直接回正文。
- 只想审计/排查已有表的公式错误而非生产新表 → 用 `spreadsheet-formula-auditor`。
- 更新既有财务模型的特定结构 → 优先 `financial-model-updater`。

## 步骤 / 指令

通用工作流：

1. **选库**：分析用 pandas，公式/格式用 openpyxl。
2. **创建/加载**：新建 `Workbook()` 或 `load_workbook(path)`。
3. **修改**：写数据、公式、格式。
4. **保存**：`wb.save(path)`。
5. **重算（含公式时必做）**：`python recalc.py output.xlsx [timeout_秒]`。
6. **校验改错**：脚本返回 JSON；`status` 为 `errors_found` 时读 `error_summary` 定位并修复，再重算，直到零错误。

**核心铁律——用公式，不要硬编码计算结果**。让 Excel 保持可重算：

- 错：`sheet['B10'] = df['Sales'].sum()`（写死 5000）
- 对：`sheet['B10'] = '=SUM(B2:B9)'`
- 对：`sheet['C5'] = '=(C4-C2)/C2'`、`sheet['D20'] = '=AVERAGE(D2:D19)'`

所有合计、百分比、比率、差值同理，源数据变了表能自动重算。

**交付硬要求**：

- **零公式错误**：交付前不得残留 `#REF! / #DIV/0! / #VALUE! / #N/A / #NAME?`。
- **保留既有模板**：改他人文件时，精确沿用其原有格式/样式/约定，模板约定永远压过下列默认规则。

**财务模型默认规范**（用户或既有模板另有规定则从之）：

- 颜色：蓝字 `(0,0,255)`=硬输入；黑字=公式计算；绿字 `(0,128,0)`=同簿跨表链接；红字 `(255,0,0)`=外部文件链接；黄底 `(255,255,0)`=需关注的关键假设。
- 数字格式：年份按文本（"2024" 非 "2,024"）；货币 `$#,##0` 且表头标单位（"Revenue ($mm)"）；零显示为 `-`（如 `$#,##0;($#,##0);-`）；百分比默认 `0.0%`；估值倍数 `0.0x`；负数用括号 `(123)`。
- 假设独立成格，公式引用单元格而非写死：用 `=B5*(1+$B$6)` 不用 `=B5*1.05`。
- 硬编码须注明来源（旁注/批注）：`Source: [系统/文档], [日期], [具体引用], [URL]`。

**公式自检清单**：先验 2–3 个引用是否取到正确值再铺开；注意列映射（第 64 列=BL 非 BK）与行偏移（DataFrame 第 5 行=Excel 第 6 行，1 起索引）；用 `pd.notna()` 防 NaN；用 `/` 前查分母防 `#DIV/0!`；跨表引用用 `Sheet1!A1` 格式；先小范围测再批量；含零/负/极大值边界测试；防意外循环引用。

## 示例

读取分析（pandas）：

```python
import pandas as pd
df = pd.read_excel('file.xlsx')                  # 默认首个工作表
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # 全表为 dict
df.head(); df.info(); df.describe()
df.to_excel('output.xlsx', index=False)
```

新建带公式与格式（openpyxl）：

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
wb = Workbook(); sheet = wb.active
sheet['A1'] = 'Hello'; sheet.append(['Row', 'of', 'data'])
sheet['B2'] = '=SUM(A1:A10)'
sheet['A1'].font = Font(bold=True, color='FF0000')
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')
sheet.column_dimensions['A'].width = 20
wb.save('output.xlsx')
```

编辑现有文件（保留公式与格式）：

```python
from openpyxl import load_workbook
wb = load_workbook('existing.xlsx'); sheet = wb.active   # 或 wb['SheetName']
sheet['A1'] = 'New Value'
sheet.insert_rows(2); sheet.delete_cols(3)
new = wb.create_sheet('NewSheet'); new['A1'] = 'Data'
wb.save('modified.xlsx')
```

重算并校验（含公式时必做）：

```bash
python recalc.py output.xlsx 30
```

返回 JSON 形如：

```json
{ "status": "success", "total_errors": 0, "total_formulas": 42,
  "error_summary": { "#REF!": { "count": 2, "locations": ["Sheet1!B5"] } } }
```

## 注意事项

- **含公式必跑 recalc.py**：openpyxl 写的是公式字符串、值为空，不重算交付会让单元格显示空白或旧值。脚本需 LibreOffice（首次运行自动配置）。
- 一律用**绝对路径**；调用间工作目录可能被重置。
- openpyxl 单元格 **1 起索引**（row=1,col=1 即 A1）。
- 读计算值用 `load_workbook(path, data_only=True)`；但**以此打开再保存会用值永久覆盖公式**，切勿误存。
- 大文件：读用 `read_only=True`，写用 `write_only=True`。
- pandas 防类型推断坑：`dtype={'id': str}`；按列读 `usecols=[...]`；日期用 `parse_dates=[...]`。
- 代码风格：Python 代码精简、少注释少 print；但 Excel 单元格内要给复杂公式/关键假设加批注、注明数据源。
- 处理外部来源文件前确认无加密/权限限制；产物不替代环境内的验证与专家复核，缺输入/边界时先问清。

## 互见

- requires：无。
- related：`spreadsheet-formula-auditor`（专做公式错误审计与排查）、`csv-data-cleaner`（导出/读入前清洗 CSV 数据）。
- combines_with：`financial-model-updater`（更新既有财务模型结构）、`financial-statements-generator`（生成三大报表后用本技能落表与格式化）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
