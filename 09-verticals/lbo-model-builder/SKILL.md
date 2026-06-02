---
name: lbo-model-builder
title: LBO 杠杆收购模型构建
description: 当为私募股权交易/投委会材料在 Excel 模板中填充并校验 LBO 模型时使用；做：按 Sources&Uses→运营模型→债务计划→回报(IRR/MOIC)→敏感性表分段填公式、套蓝黑紫绿配色与数字格式、跑校验产出可联动的专业模型；不适用于无模板的从零搭建、DCF/三表估值或纯数据分析；触发词：LBO、杠杆收购、leveraged buyout、Sources and Uses、债务计划 debt schedule、IRR、MOIC、敏感性表 sensitivity
domain: 领域/fintech
triggers: [LBO, 杠杆收购, leveraged buyout, Sources and Uses, 债务计划, debt schedule, IRR, MOIC, 敏感性表, sensitivity table, 私募股权, 回报分析]
tags: [lbo, finance, private-equity, excel, modeling, irr, moic, fintech]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Excel, openpyxl, Office JS, recalc.py, Python]
requires: []
related: [pe-returns-sensitivity, merger-accretion-dilution-model, dcf-valuation-model, three-statement-model]
combines_with: [pe-returns-sensitivity, three-statement-model, unit-economics-analyzer]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

- 为私募股权交易、并购材料或投委会演示，在既有 Excel 模板中**填充 LBO（杠杆收购）模型**：写公式、校验计算、套用专业排版。
- 已有模板（如 `LBO_Model.xlsx`）需要被严格沿用并填入用户假设，而非自行设计布局。
- 需要构建 Sources & Uses、运营模型、债务计划、回报（IRR/MOIC）、敏感性表等标准 LBO 模块。

**不该用边界：**
- 没有任何模板且用户也不要标准模板时——应先询问而不是凭空从零搭建。
- 这是 DCF、可比公司、三大报表估值等其它金融模型（本条只针对 LBO 模板填充）。
- 纯数据清洗/统计分析，不涉及财务建模。

## 步骤

1. **确认模板（最先做）**：若附带模板文件，**必须**严格沿用其结构，禁止从零另建——哪怕模板看起来过于复杂。若无模板，询问用户：是否有指定 LBO 模板？否则用标准模板（含 Sources & Uses / 运营模型 / 债务计划 / 回报分析）。使用标准模板时复制 `examples/LBO_Model.xlsx` 作为起点。
2. **分析模板结构**：定位各 section 及其上下游依赖；厘清时间轴（哪些列是哪些期间、是否有 Closing/Pro Forma 列、投影期从何处开始）；区分输入单元格 vs 公式单元格（看模板的配色/边框/底纹约定）；逐字读行标签确定期望的计算；检查是否已有公式（不要覆盖正确的既有公式）；记录符号约定、小计结构、是否分多个 tab。
3. **选择运行环境**：在 Excel 内（Office Add-in / Office JS）用 `Excel.run(async (context)=>{...})`，公式写 `range.formulas`，颜色用 `range.format.font.color` / `fill.color`，无需单独重算。生成独立 .xlsx 文件则用 Python/openpyxl，公式写成字符串后跑 `recalc.py`。
4. **逐 section 填公式并与用户对账**：每完成一个 section 就展示成果、跑该段校验、获得确认后再做下一个——**不要**端到端建完再统一展示（后段依赖前段，事后改 Sources & Uses 会牵连全局）。
5. **完工后跑校验清单**：先运行公式校验，再逐项核对平衡、投影、债务、回报、敏感性、配色与逻辑合理性。

## 指令

**核心原则：**
- **每个计算都必须是 Excel 公式**，绝不在 Python 里算好再硬编码结果。openpyxl 写 `cell.value = "=B5*B6"`（公式串），而非 `cell.value = 1250`。模型必须随输入联动。
- 所有公式用正确的单元格引用；该来自其它单元格的数字不要手敲。
- **符号约定全程一致**（流出用负还是用正，跟随模板）。
- 沿用模板布局，不要自创结构。

**字体颜色约定（区分输入/公式/链接）：**
- 蓝 `0000FF`：硬编码输入（手敲、不引用其它单元格的数字）
- 黑 `000000`：含运算的公式（`=B4*B5`、`=SUM()`、`=-MAX(0,B4)`）
- 紫 `800080`：**同 tab** 直接引用、无计算（`=B9`、`=B45`）
- 绿 `008000`：**跨 tab** 引用（`=Assumptions!B5`、`='Operating Model'!C10`）

**填充配色（专业蓝灰，克制为上，仅蓝+灰+白）：**
- Section 标题：深蓝 `#1F4E79` + 白色加粗
- 列标题（Year 1…）：浅蓝 `#D9E1F2` + 黑色加粗
- 输入单元格：浅灰 `#F2F2F2` 或白（蓝字才是信号）
- 公式单元格：白、无填充
- 关键输出（IRR/MOIC/退出权益）：中蓝 `#BDD7EE` + 黑色加粗
- 不要引入绿、黄、红等多余强调色。模板自带配色则跟随模板。

**数字格式：** 货币 `$#,##0;($#,##0);"-"`；百分比 `0.0%`；倍数 `0.0"x"`；MOIC/精细比率 `0.00"x"`；所有数字右对齐。

**校验命令（生成 .xlsx 时，必须零错误）：**
```bash
python /mnt/skills/public/xlsx/recalc.py model.xlsx
```

## 示例

**典型重点区与正确做法：**

- **平衡 section**：两段必须相等时（Sources = Uses），其中一项是 plug（轧差项），用差额算出。
- **利息与循环引用**：利息用**期初余额**（非平均/期末）来打破循环。链路：利息 → 现金流 → 还款 → 期末余额；若利息引用期末余额就会循环。
- **债务还款 / 现金清扫**：多档债务有优先级瀑布；现金清扫按优先级；余额不得为负，用 `MAX`/`MIN` 约束。
- **回报（IRR/MOIC）**：现金流符号——投资为负、回款为正；用 `XIRR` 需配日期，用 `IRR` 需连续期间；`MOIC = 总回款 / 总投资`。
- **敏感性表**：用**奇数维度**（5×5 或 7×7）保证有真正的中心格；**中心格 = 基准情形**，行列轴值围绕模型实际假设对称（如基准入场倍数 10.0x，则轴 = `[8.0x,9.0x,10.0x,11.0x,12.0x]`），**中心格的 IRR/MOIC 必须等于模型实际输出**（这是接线正确的证明）；中心格用中蓝 `#BDD7EE` + 加粗高亮。openpyxl 下 Excel DATA TABLE 可能失效，改写显式公式并用混合引用（`$A5` 行输入、`B$4` 列输入），每格应显示不同值。

**Office JS 合并单元格陷阱：** 不要先 `.merge()` 再对合并区设 `.values`（会抛 `InvalidArgument`）。应先给左上单元格写值 `ws.getRange("A7").values = [["SOURCES & USES"]]`，再合并并格式化整行 `ws.getRange("A7:F7").merge(); ws.getRange("A7:F7").format.fill.color = "#1F4E79";`

## 注意事项

- **分段检查点**（每段完成后停下来与用户对账）：Sources & Uses 后核对平衡与 plug → 运营模型后核对增长率与利润率 → 债务计划后核对期初/期末余额与瀑布逻辑 → 回报后核对现金流符号与区间 → 敏感性表后确认每格变化且基准落点正确。发现错误先修复再继续。
- **常见错误速查**：硬编码计算值（应改公式）；复制后引用错位（用 `$` 锚定核对）；循环引用（用期初余额）；section 不平衡（设一项为 plug）；余额为负（`MAX(0,...)`）；IRR 符号/区间错；敏感性表全相同（缺混合引用）；roll-forward 不衔接（期初 ≠ 上期期末）；符号约定不一致。
- **校验要点**：平衡项精确相等；资产 = 负债 + 权益；期末现金 = 期初 + 净现金流；利息基于期初余额；债务期末不为负；无 `#REF!`/`#DIV/0!`/`#VALUE!`/`#NAME?` 错误值；趋势与量级合理。
- 模板若部分预填，不要覆盖正确的既有公式（除非明确要求）。

## 互见

无（当前技能大典中暂无强相关条目）。

---

本条采编自 anthropics/financial-services（Apache-2.0）。
