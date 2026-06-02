---
name: datasheet-spec-extractor
title: 元器件规格书参数提取
description: 当需要把电子元器件 datasheet PDF 抽取为结构化机读规格（引脚、电气特性、外设、拓扑、推荐应用电路）供下游分析器消费时使用；做的事是选页读取、按版本化 JSON Schema 提取并打分缓存到项目本地；不适用于下载 PDF、跨项目共享库、电路仿真本身；触发词：datasheet 提取、规格书参数提取、引脚定义/pinout、电气特性 extract、MPN 规格、EN 阈值/PG/USB 速度、datasheet extraction verify。
domain: 领域/hardware
triggers: [datasheet 提取, 规格书参数提取, 引脚定义, pinout, 电气特性 extract, MPN 规格, EN 阈值, PG, USB 速度, datasheet extraction verify, verify pin functions]
tags: [datasheet, hardware, spec-extraction, pdf, pinout, electrical-characteristics, kicad, json-schema]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pdftotext, datasheet_page_selector.py, datasheet_extract_cache.py, datasheet_score.py, datasheet_features.py, datasheet_verify.py]
requires: []
related: [component-sourcing-search, kicad-design-reviewer, pcb-bom-manager, spice-circuit-simulator]
combines_with: [component-sourcing-search, kicad-design-reviewer, pdf-processing-toolkit]
license: MIT
source: aklofas/kicad-happy
source_license: MIT
---
面向 AI Agent：把元器件 datasheet PDF 抽取为版本化、机读的结构化规格 JSON，缓存在项目本地，供原理图 / PCB / 仿真 / 热分析等下游分析器查询。提取本身由你（LLM）读取选定页完成，脚本只负责选页、缓存、打分、校验与对外查询。

## 何时使用

- 用户要求「提取 / 读取 / 核对某元器件规格书参数」，或问「MPN X 的规格是什么」「核对 U1 引脚名是否与 datasheet 一致」。
- 下游分析器需要可信 IC 知识（EN 引脚阈值、是否有 PG 输出、USB 外设速度、轨电压）才能跑 IC 感知检查，而 `datasheets/extracted/` 为空。
- 刚下载完 datasheet PDF，或评审提示证据不足、`trust_level: low`，需要补提取把它抬到 `mixed`/`high`。

不该用边界：
- 不负责下载 PDF（由 digikey / mouser / lcsc / element14 等分销商技能负责）。
- 没有跨项目共享库，每个项目的提取只存在本项目 `<project>/datasheets/extracted/`。
- 不做电路仿真、不替代分析器本身的规则判定，只产出它们消费的数据。
- 任何 datasheet 未明确给出的字段一律填 `null`，不猜测、不插值。

## 步骤

1. 定位项目 `datasheets/` 下的目标 PDF（按 MPN）。
2. 查缓存：若 `extracted/<MPN>.json` 已存在且不 stale（版本、PDF 哈希、分数、90 天时效都通过），直接复用。
3. 选页：对该 PDF 跑选页启发式，得到引脚表 / 绝对最大额定 / 推荐工作条件 / 电气特性 / 典型应用电路所在页。
4. 读取选定页，按 Schema（当前 `EXTRACTION_VERSION = 2`）填写结构化 JSON。
5. 打分：分数 `>= MIN_SCORE (6.0)` 才缓存；低分按 `retry_count < MAX_RETRIES (3)` 重试，重试时读 `issues` 定向补读相应章节，保留最高分版本。
6. 缓存写入并由缓存管理器自动补全 `source_pdf_hash`、`extraction_date`、`extraction_version`、`score_breakdown`。
7. 下游通过 `datasheet_features.py` 查询；如需核对原理图用法，跑校验。

## 指令

脚本是 Python 模块 API（import 调用，不是 CLI）。在 `scripts/` 目录下：

```python
# 1. 选页
from datasheet_page_selector import suggest_pages
pages = suggest_pages(pdf_path, mpn="TPS61023DRLR", category="switching_regulator")
# 页预算默认 10 页；MCU/FPGA/SoC 为 15 页；总是含第 1 页与最后一页

# 2. 打分（expected_pin_count 用 package 的引脚数，驱动引脚覆盖率扣分）
from datasheet_score import score_extraction
res = score_extraction(extraction, expected_pin_count=6)
# res: {"total":8.2,"pin_coverage":..,"voltage_ratings":..,"issues":[...],"sufficient":True}

# 3. 缓存
from datasheet_extract_cache import (
    resolve_extract_dir, get_cached_extraction, cache_extraction,
    is_extraction_stale, EXTRACTION_VERSION, MIN_SCORE)
extract_dir = resolve_extract_dir(project_dir="/path/to/project")
stale, reason = is_extraction_stale(extract_dir, mpn)   # reason: not_cached/schema_upgrade/pdf_changed/low_score/age
if res["sufficient"]:
    cache_extraction(extract_dir, mpn, extraction, source_pdf="TPS61023DRLR.pdf")

# 4. 下游消费
from datasheet_features import (
    get_regulator_features, get_mcu_features, get_pin_function, is_extraction_available)
feat = get_regulator_features("TPS61023DRLR")  # None 表示无可用提取 → 检测器发 INFO 并跳过
fn = get_pin_function("TPS61023DRLR", "EN")    # 'VIN'/'VOUT'/'EN'/'PG'/'SW'/'FB'/'GND'/... 或 None

# 5. 校验提取 vs 原理图用法
from datasheet_verify import run_datasheet_verification
report = run_datasheet_verification(analysis, project_dir="/path/to/project")
```

Schema 顶层字段：`mpn / manufacturer / category / package / description / topology / pins[] / features / peripherals / absolute_maximum_ratings / recommended_operating_conditions / electrical_characteristics / application_circuit / spice_specs / extraction_metadata`。详见 `references/extraction-schema.md`。

## 示例

提取 TI TPS61023DRLR（升压转换器，SOT-23-6）：

```json
{
  "mpn": "TPS61023DRLR",
  "manufacturer": "Texas Instruments",
  "category": "switching_regulator",
  "package": "SOT-23-6 (6-pin)",
  "topology": "boost",
  "pins": [
    {"number":"1","name":"EN","function":"EN","type":"digital","direction":"input",
     "threshold_high_v":1.2,"threshold_low_v":0.4,
     "required_external":"Connect to VIN for always-on, or logic control. Do not float."},
    {"number":"4","name":"SW","function":"SW","type":"power","voltage_abs_max":6.0,
     "required_external":"Connect to inductor (0.47-2.2uH recommended)"}
  ],
  "features": {"has_pg": false, "has_soft_start": true, "iss_time_us": 12.5},
  "recommended_operating_conditions": {"vin_min_v":0.5,"vin_max_v":5.5,"temp_min_c":-40,"temp_max_c":85},
  "electrical_characteristics": {"vref_v":0.595,"switching_frequency_khz":1200},
  "application_circuit": {"topology":"boost","inductor_recommended":"1uH, Isat > 3.6A",
     "vout_formula":"Vout = 0.595 * (1 + R1/R2)"},
  "spice_specs": {"vref": 0.595},
  "extraction_metadata": {"source_pdf":"TPS61023DRLR.pdf","extracted_from_pages":[1,5,6,9]}
}
```

打分：引脚覆盖 35% + 电压额定 25% + 应用信息 20% + 电气特性 10% + SPICE 10%，加权求和到 0–10；该例 `total ≈ 9.1`，`>= 6.0` 故缓存。

## 注意事项

- 选不同值：`vref_v / switching_frequency_khz` 取 Typ；阈值电压、静态电流、传播延迟取 Max；`dropout_mv` 取最坏（Min 余量）；SPICE 参数取 Typ。
- 绝对最大额定 ≠ 工作条件，二者勿混；逐引脚电压限值进 `pins[].voltage_abs_max`，供电/温度进顶层 `absolute_maximum_ratings`。
- `category` 必须用 Schema 列出的精确字符串（如 `switching_regulator`），它决定打分规则与下游分类。
- `required_external` 是设计审查自动化最关键字段，尽量用 datasheet 原文，带数值与布局约束。
- MPN 不可截断（`TPS61023` 与 `TPS61023DRLR` 规格可能不同）；族系 datasheet 注意只取对应型号那一行。
- `None` 契约：整个返回为 `None` = 无提取（检测器发 INFO 跳过）；字段为 `None` = datasheet 未给（未知）；`False` = 明确没有该特性；`0` = 数值零。四者不可混淆。
- `category`、`features`、`peripherals.usb`、`pins[].function` 为 v2 新增；旧版本提取被视为不可用，需重提。
- 阈值若以 VDD 分数给出（如 0.7×VDD），description 记原式，字段存按额定电压算出的绝对值。

## 互见

- `references/field-extraction-guide.md`：各厂商（TI / ST / NXP / Microchip / Espressif / ADI）章节命名与逐字段定位、常见陷阱。
- `references/quality-scoring.md`：五维扣分细则、阈值、staleness 判定。
- `references/consumer-api.md`：下游 `datasheet_features.py` 与直连缓存访问、INFO 跳过模式、质量门。
- `references/extraction-schema.md`：完整字段、`category` 取值、版本历史。

---
本条采编自 aklofas/kicad-happy（MIT），为面向 AI Agent 消费的中文适配重写，非逐字翻译。
