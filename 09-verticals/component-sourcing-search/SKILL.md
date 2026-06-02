---
name: component-sourcing-search
title: 电子元器件选型采购搜索
description: 当为生产制造（JLCPCB/PCBWay 贴片）做元器件选型、查库存价格、下载数据手册或为 BOM 匹配 LCSC 编号时使用；用免鉴权的 jlcsearch 社区 API 按 MPN 或 Cxxxxx 检索立创/嘉立创零件、抓取规格与各仓库存、下载 PDF 手册并维护本地 datasheets 目录；不适用于打样级单买（应用 DigiKey/Mouser）、PCB 制板下单或原理图设计本身；触发词：LCSC、立创商城、嘉立创、JLCPCB、Cxxxxx、元器件选型、生产采购、BOM 选型、数据手册下载、datasheet、component sourcing
domain: 领域/hardware
triggers: [LCSC, 立创商城, 嘉立创, JLCPCB, Cxxxxx, 元器件选型, 生产采购, BOM 选型, 数据手册下载, datasheet, component sourcing]
tags: [hardware, lcsc, jlcpcb, bom, datasheet, component-sourcing, kicad, pcba]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [jlcsearch API, wmsc.lcsc.com CDN, python3, requests, urllib, playwright, sync_datasheets_lcsc.py, fetch_datasheet_lcsc.py]
requires: []
related: [pcb-bom-manager, datasheet-spec-extractor, pcb-fab-assembly, kicad-design-reviewer]
combines_with: [pcb-bom-manager, datasheet-spec-extractor, pcb-fab-assembly]
license: MIT
source: aklofas/kicad-happy
source_license: MIT
---
## 何时使用

适用：
- 为**量产/贴片**（JLCPCB、PCBWay 等代工厂组装）做元器件选型与采购，需要 LCSC/嘉立创编号（`Cxxxxx`）。
- 按 MPN（厂商料号）或 `Cxxxxx` 查询库存、阶梯价、各仓库存、MOQ、是否基础库（basic）。
- 下载元器件数据手册（PDF），或为某个 KiCad 工程批量维护 `datasheets/` 目录。
- 为已有 BOM 反查 LCSC 等价料，或用关键参数找国产替代料。

不该用（负边界）：
- **打样级、单片少量采购**——优先用 DigiKey/Mouser，元器件多、文档全、无 MOQ 限制。
- **PCB 制板/下单**本身、或**原理图/PCB 设计**——本条只管选型与手册，不管出图与下单。
- 需要 LCSC 官方带签名鉴权 API 的高级场景（绝大多数需求 jlcsearch 已覆盖，无需走官方 API）。

要点：LCSC（立创国际站）与 JLCPCB（嘉立创）是姊妹站，**共用同一套零件库与 `Cxxxxx` 编号**，该编号在选型、JLCPCB 贴片 BOM 匹配、跨平台交叉引用中通用。

## 步骤

1. **定位标识**：拿到 MPN 或 `Cxxxxx`。有 `Cxxxxx` 时优先用它（精确匹配），否则用 MPN 关键词搜。
2. **检索零件**：调 jlcsearch API（免鉴权），带 `full=true` 取全字段。
3. **核对关键字段**：库存（`extra.quantity` 及各仓 `whs-*`）、阶梯价（`price`/`extra.prices`）、`basic`（1=基础库免上机费，0=扩展库每种约 $3）、`moq`、`order_multiple`、`rohs`。
4. **取手册**：用 `extra.datasheet.pdf`（wmsc.lcsc.com CDN，无反爬、无需特殊头）直接下载。
5. **批量同步**（可选）：对 KiCad 工程或纯 MPN 清单运行 `sync_datasheets_lcsc.py`，生成/更新 `manifest.json`。
6. **无精确匹配时**：按关键参数（如「100nF 0402 X7R 16V」）搜替代料，校验规格与封装焊盘后再用。

## 指令

jlcsearch API（Base URL：`https://jlcsearch.tscircuit.com`，无需鉴权）：

```
# 通用搜索：q 匹配 MPN/LCSC 码/描述关键词；package 可选封装过滤；full=true 取全字段
GET /api/search?q=<query>&limit=20&full=true&package=0402

# 分类搜索
GET /resistors/list.json?search=10k+0402
GET /capacitors/list.json?search=100nF+0402
GET /microcontrollers/list.json?search=STM32
GET /voltage_regulators/list.json?search=3.3V
```

返回 `{"components": [...]}`。关键字段：
- `lcsc`：数字 ID（不含 C 前缀）；`extra.number`：完整码（如 `C71629`）
- `extra.mpn` / `extra.manufacturer.name`：厂商料号 / 厂商
- `extra.datasheet.pdf`：**可直连下载的 PDF URL**
- `extra.attributes`：参数规格；`extra.quantity` 总库存，`extra.whs-js/zh/hk` 分仓库存
- `basic`：1=JLCPCB 基础库，0=扩展库；`extra.moq` / `extra.order_multiple` / `extra.rohs`

批量同步手册 `sync_datasheets_lcsc.py`：

```bash
python3 <skill-path>/scripts/sync_datasheets_lcsc.py <file.kicad_sch>            # 按工程同步
python3 <skill-path>/scripts/sync_datasheets_lcsc.py <file.kicad_sch> --dry-run  # 预览
python3 <skill-path>/scripts/sync_datasheets_lcsc.py <file.kicad_sch> --force    # 重试失败项
python3 <skill-path>/scripts/sync_datasheets_lcsc.py <file.kicad_sch> -o ./my-datasheets --parallel 3
# 批量模式：仅有 MPN 清单、无 KiCad 工程（一行一个 MPN；空行与 # 注释跳过；自动去重/过滤通用值）
python3 <skill-path>/scripts/sync_datasheets_lcsc.py --mpn-list mpns.txt --output ./datasheets
```

单个手册下载 `fetch_datasheet_lcsc.py`（OS 无关，`requests`→`urllib`→`playwright` 回退链；校验 PDF 头拒绝 HTML 错误页；退出码 0=成功/1=下载失败/2=搜索或 API 错误）：

```bash
python3 <skill-path>/scripts/fetch_datasheet_lcsc.py --search "GRM155R71C104KA88D" -o datasheet.pdf
python3 <skill-path>/scripts/fetch_datasheet_lcsc.py --search "C14663" -o datasheet.pdf --json
python3 <skill-path>/scripts/fetch_datasheet_lcsc.py "https://wmsc.lcsc.com/..." -o datasheet.pdf
```

Web 回退（API 不可用时）：`https://www.lcsc.com/search?q=<query>`。

## 示例

为「100nF 0402」陶瓷电容选型并下载手册：

1. 检索：`GET https://jlcsearch.tscircuit.com/capacitors/list.json?search=100nF+0402`，或 `GET /api/search?q=100nF&package=0402&full=true&limit=20`。
2. 命中 `GRM155R71C104KA88D`（`extra.number=C71629`）：`basic=0`、`extra.quantity≈275 万`、`extra.attributes` 含 `Voltage Rated=16V / Temperature Coefficient=X7R / Tolerance=±10%`、阶梯价 `qFrom 1–9 ≈ $0.0069`。
3. 下载：取 `extra.datasheet.pdf`（wmsc.lcsc.com）→ `fetch_datasheet_lcsc.py --search "C14663" -o cap.pdf`。
4. 该料 `basic=0` 属扩展库，若上 JLCPCB 贴片会有上机费，若有等价基础库料可优先换用。

## 注意事项

- **速率**：jlcsearch 社区接口无明文限频但需克制，调用间隔约 0.5s（脚本 `--delay` 可调）。
- **basic 字段很关键**：JLCPCB 基础库免上机费；扩展库每种约 $3 上机费，选型时优先基础库。
- **分仓库存**：深圳(JS)、珠海(ZH)、香港(HK) 库存各异，按 `whs-js/zh/hk` 核对可用量。
- **MOQ 与倍数**：很多料有最小起订量或需按 `order_multiple` 整数倍下单。
- **找替代料**：先按关键参数搜，再核对规格与**焊盘尺寸**——同名封装的焊盘也可能不同；实在没有就标 "consigned" 单独采购。
- **国产料手册质量参差**：必要时用 `extra.mpn` 到 DigiKey/Mouser 交叉核对更完整文档。
- LCSC 官方带签名鉴权 API（`https://ips.lcsc.com`，需申请 `support@lcsc.com`）极少需要。

## 互见

- `dependency-auditor`：审计依赖清单/物料清单的思路与本条 BOM 选型可互相参照。

本条采编自 aklofas/kicad-happy（MIT）。
