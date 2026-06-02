---
name: initiating-coverage-report
title: 首次覆盖研究报告
description: 当对一家公司做首次覆盖、需要产出 30-50 页机构级（JPM/GS/MS 风格）卖方深度研究报告时使用；分 5 个独立任务（公司研究→财务建模→估值→出图→成稿），逐任务产出 .md 研究稿、.xlsx 模型、25-35 张图与最终 DOCX；不适用于已覆盖公司的季度财报点评、flash 快评、或要求一次性自动跑完全流程；触发词：首次覆盖、initiating coverage、深度研究报告、价格目标、DCF 估值
domain: 商业/finance
triggers: [首次覆盖, initiating coverage, 深度研究报告, 卖方深度报告, 价格目标, DCF 估值, 可比公司, 股票研究报告, equity research, initiation report, 建仓覆盖]
tags: [finance, equity-research, initiation, valuation, DCF, financial-model, DOCX, 卖方研究]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, matplotlib, pandas, openpyxl, docx]
requires: []
related: [equity-earnings-update-report, sector-landscape-report, company-tear-sheet, earnings-preview-model]
combines_with: [financial-model-updater, research-catalyst-calendar]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

为一家公司做**首次覆盖（initiation）**，产出机构级（JPMorgan/Goldman Sachs/Morgan Stanley 格式）卖方深度报告。核心特征：

- **篇幅**：30-50 页、10000-15000 字；表 12-20 张（含全量三表）；图 25-35 张。
- **范围**：公司全貌——业务/管理层/行业/竞争/TAM/风险 + 完整财务模型 + 多法估值 + 价格目标与评级。
- **读者**：尚未了解该公司的投资人，需要一份能独立支撑投资决策的完整底稿。
- **字体**：默认全文 Times New Roman（除非用户另行指定）。

**不该用的边界：**

- 已覆盖公司的季度业绩点评（8-12 页）→ 用 `equity-earnings-update-report`。
- flash note / quick take 快评 → 格式不同，篇幅小得多。
- 用户要求「一次跑完 5 个任务 / 端到端自动出报告」→ **本技能不支持自动串联**，必须逐任务执行（见下）。

## 步骤

**铁律：一次只做一个任务（SINGLE-TASK MODE）。** 不自动串联、不擅自假设从哪一步开始、不在前置任务产物缺失时硬上占位内容。用户说「给某公司写一份覆盖报告 / 跑完 5 个任务」时，先回问要从哪个任务开始，并说明逐任务模式的原因。

任务清单与依赖：

| 任务 | 名称 | 前置 | 产物 |
|---|---|---|---|
| 1 | 公司研究 | 公司名/ticker | 6000-8000 字 `.md` 研究稿 |
| 2 | 财务建模 | 10-K 或财报数据 | `.xlsx` 模型（6 个 tab） |
| 3 | 估值分析 | 任务 2 模型 | 估值 `.md` + 4 个 Excel tab + 价格目标 |
| 4 | 图表生成 | 任务 1+2+3 + 外部行情 | 25-35 张 PNG/JPG，打包 zip |
| 5 | 报告成稿 | 任务 1-4 全部 | 30-50 页 DOCX |

任务 1、2 互不依赖可任意先后；3 依赖 2；4 依赖 2、3（实操还需任务 1 的定性内容出图）；5 依赖 1-4 全部。

**每个任务的纪律：**
- 开工前先**核验前置产物真实存在且可打开**；缺失就停下，告知用户先补哪个任务，不要造占位内容/占位图。
- 每个任务**只交付规定产物，不附赠任何额外文档**（不要「完成总结」「executive summary」「快速参考」「next steps」之类——浪费上下文、非专业流程）。
- 交付产物、确认完成，然后**等用户显式发起下一个任务**。

**任务 1 公司研究（独立）：** 业务与沿革、3-4 位高管 each 300-400 字小传、产品与服务、行业概览、5-10 家竞品分析、TAM 测算、4 类共 8-12 项风险。写满 6000-8000 字，不要缩写任何小节。文件名 `[Company]_Research_Document_[Date].md`。

**任务 2 财务建模：** 先确认能拿到财报数据（上市公司取 SEC EDGAR 最新 10-K；或用户提供 3-5 年历史三表）。抽取 3-5 年历史 + 投影 5 年，建 6 个必备 tab：① Revenue Model（产品 20-30 行 + 地区 15-20 行）② Income Statement（40-50 科目）③ Cash Flow ④ Balance Sheet ⑤ Scenarios（Bull/Base/Bear）⑥ DCF Inputs。文件名 `[Company]_Financial_Model_[Date].xlsx`。

**任务 3 估值分析（须先有任务 2，否则立即停）：** DCF（含敏感性矩阵：多档 WACC × 终值增长率）+ 可比公司（5-10 家，带 max/75th/median/25th/min 统计行）+ 先例交易（如适用）+ 估值 football field。产出价格目标 $XX.XX、评级 BUY/HOLD/SELL、上行空间 XX%、3-5 个催化剂。交付：`[Company]_Valuation_Analysis_[Date].md` + 向任务 2 的 .xlsx **追加** 4 个 tab（DCF / 敏感性 / 可比 / 估值汇总）。

**任务 4 图表生成（须先有任务 1+2+3，否则立即停）：** 25-35 张专业图，300 DPI。4 张**强制图**必须有：chart_03 分产品营收（堆叠面积）、chart_04 分地区营收（堆叠柱）、chart_28 DCF 敏感性（二维热力图）、chart_32 估值 football field（水平条）。命名 `chart_##_description.png`，连同 `chart_index.txt` 打包为 `[Company]_Charts_[Date].zip`。不要只出 10-15 张、不要低清占位图。

**任务 5 报告成稿（须先有任务 1-4 全部，否则立即停）：** 用 Claude 内置 **DOCX / XLSX skill**（不要用 Python 库手搓 Word）：读任务 1 .md → 转 Word 排版并内嵌图；读任务 2 .xlsx → 提取表格写定量分析；读任务 3 .md + Excel tab → 复用估值；把任务 4 所有 PNG 贯穿插入，**每 200-300 字配 1 图**。这是最终交付，全力以赴、不缩写、不用「此处应有…」占位。文件名 `[Company]_Initiation_Report_[Date].docx`。

## 指令

**报告页面结构（30-50 页）：**
- P1 投资摘要（INITIATING COVERAGE 抬头：评级/现价/价格目标/上行空间）。
- P2-5 投资逻辑与风险。
- P6-17 Company 101（直接复用任务 1 的 6-8K 字内容，逐字搬入，不要重写缩水）。
- P18-30 财务分析与投影（投影假设 2000-3000 字、逐产品；场景 1500-2000 字、写清 Bull/Base/Bear 具体参数）。
- P31-40 估值分析。
- P41-50 附录。

**最低硬指标：** ≥30 页、≥10000 字、25-35 张内嵌图、12-20 张表。

**来源与超链接（强制）：** 每图每表带「Source: …」+ 文档名/日期；所有 SEC 文件超链到 EDGAR viewer（形如 `https://www.sec.gov/cgi-bin/viewer?accession=...`），财报稿/transcript/PPT 均为**蓝色下划线可点击**超链接，非纯文本 URL。

**写作风格：** 数字与指标打头，不写「营收强劲」这类空话；具体数据与实例胜过泛泛而谈；全文数字须与财务模型**逐字一致**并交叉核验。

**文件组织建议：**
```
ProjectFolder/
├── Task1_Research/  [Company]_Research_Document.md
├── Task2_Model/     [Company]_Financial_Model.xlsx
├── Task3_Valuation/ [Company]_Valuation_Analysis.md
├── Task4_Charts/    chart_01.png … (25-35)
└── Task5_Report/    [Company]_Initiation_Report.docx
```
跨 session 复用时显式引用既有产物路径：`"用昨天 [path] 的模型跑任务 3"`。

## 示例

任务 2 入参选择（开工前自检）：
```
方案 A 自行抽取（最常见）：[ ] 能拿到 10-K/财报？ [ ] 准备好抽 3-5 年数据？
方案 B 用户已提供：       [ ] 收到历史财报文件？ [ ] 含三表且 3-5 年？
可选：                    [ ] 任务 1 公司研究是否已完成（提供业务背景）？
```

任务 5 开工前核验对话（前置缺失即停）：
```
用户：「用 initiating-coverage 跑任务 5，标的 Tesla」
助手：核验前置——
  任务1 公司研究…❌ 未找到
  任务2 财务模型…❌ 未找到
  任务3 估值…❌ 未找到
  任务4 图表…❌ 未找到
⚠️ 核验失败：任务 5 需 1-4 全部完成。是否先从任务 1 开始？
```

任务 3 估值产出要素：
```
DCF（敏感性矩阵）+ 可比公司（统计行）+ football field
→ 价格目标 $XX.XX | 评级 BUY/HOLD/SELL | 上行 XX% | 催化剂 3-5 个
```

## 注意事项

- **逐任务模式不可破**：不要把多个任务自动串联；每个任务交付后停下等用户。这是质量门，也是本技能与「一键出报告」的根本区别。
- **前置核验优先**：任务 3-5 在前置产物缺失时**立即停止**，绝不造占位估值/占位图/占位章节——会污染最终底稿且需返工。
- **只交付规定产物**：任何清单外的「总结/亮点/参考」文档一律不产出。
- **数字一致性**：报告中所有数字与财务模型逐字对齐，估值/投影算式自检；ticker、公司名、数字零拼写错误。
- **机构级质量**：成稿应与 JPMorgan/Goldman/Morgan Stanley 研究难分伯仲；来源齐全、超链接可点击、引用规范。
- 与季度点评的区别：篇幅 30-50 vs 8-12 页、表 12-20 vs 1-3、图 25-35 vs 8-12、范围「公司全貌」vs「季度新变化」、XLS 模型必需 vs 可选。

## 互见

- related：`equity-earnings-update-report` —— 首次覆盖建立基准后，后续季度用它做 8-12 页点评（old vs new 的 old 即来自本报告）。
- related：`market-sizing-analyst` / `market-sizing-tam-sam-som` —— 支撑任务 1 的 TAM 测算与任务 2 的营收假设。
- related：`competitive-analysis` —— 校准竞品分析与可比公司选择。
- related：`startup-financial-modeler` —— 私有/早期标的缺 10-K 时复用其建模方法搭任务 2。
- combines_with：`board-deck-builder` —— 把覆盖结论压成投委会/董事会决策页。
- combines_with：`data-storyteller` —— 把估值与投影讲成有说服力的图文叙事。

---
采编自 anthropics/financial-services（Apache-2.0）。
