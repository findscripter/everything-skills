---
name: pcb-fab-assembly
title: PCB 制造与贴片下单（JLCPCB）
description: 当用 KiCad 设计完 PCB、要把工程发到 JLCPCB 打样裸板/钢网或下单 SMT 贴片时使用；做出可上传的 BOM/CPL（含 LCSC 编号、贴片旋转校正）并据制造规则与 Basic/Extended 选件约束完成下单流程；不适用于原理图设计、Gerber/钢网导出细节（见 bom）与元件选型搜索（见 lcsc）。触发词：JLCPCB、PCB 打样、PCB 制造、SMT 贴片、PCBA、BOM、CPL、贴片下单、LCSC、basic/extended parts、design rules、嘉立创
domain: 领域/hardware
triggers: [JLCPCB, PCB 打样, PCB 制造, SMT 贴片, PCBA, BOM, CPL, 贴片下单, LCSC, basic parts, extended parts, design rules, 嘉立创, 钢网, stencil]
tags: [pcb, jlcpcb, kicad, pcba, smt, bom, cpl, lcsc, hardware, manufacturing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [KiCad, JLCPCB, LCSC, CSV/XLSX BOM, CPL placement file, JLCPCB API]
requires: []
related: [pcb-bom-manager, component-sourcing-search, kicad-design-reviewer, emc-precompliance-analyzer]
combines_with: [pcb-bom-manager, component-sourcing-search, kicad-design-reviewer]
license: MIT
source: aklofas/kicad-happy
source_license: MIT
---
## 何时使用

- KiCad 工程已完成布局布线，需要把它送到 JLCPCB（嘉立创国际站）打样或量产。
- 打样阶段：下单裸板 + 带框钢网（元件另从 DigiKey/Mouser 采购，手工焊接）。
- 量产阶段（百片量级）：下单整板 SMT 贴片，元件用 LCSC 库（JLCPCB 与 LCSC 同属一家，共用元件库）。
- 需要查 JLCPCB 的制造能力（design rules）、Basic/Extended 选件费用、贴片约束、交期/成本。

不该用边界：
- 原理图/PCB 本身的设计、布线、DFM 评分 -> 用 KiCad 工具本身（源技能体系中的 `kicad`）。
- Gerber 导出设置、CPL 格式细节、钢网导出 -> 属于 BOM/导出环节（源技能 `bom`）。
- 元件选型与库存搜索 -> `lcsc`（量产）/ DigiKey、Mouser（打样）。
- 替代厂商 PCBWay 的下单流程不在本条覆盖。

## 步骤

裸板 + 钢网打样：
1. 从 KiCad 导出 Gerber。
2. 上传到 `https://cart.jlcpcb.com/quote`，配置层数、板厚、颜色、数量。
3. 购物车里加一块带框钢网（复用 Gerber 中的 paste 层）。
4. 下单，板 + 钢网通常约 1 周到货。

量产整板贴片：
1. 导出 Gerber。
2. 导出 BOM（CSV，含 LCSC 编号，格式见下）。
3. 导出 CPL 贴装坐标文件（CSV）。
4. 上传 Gerber 到 `https://cart.jlcpcb.com/quote`，配置层数/板厚/颜色/数量。
5. 勾选 "PCB Assembly"，选 Economic 或 Standard。
6. 上传 BOM 与 CPL。
7. 核对选件匹配（part matching），用 LCSC 编号修正未匹配项。
8. 确认下单。最小起订 5 片。

## 指令

BOM 列要求（接受 CSV/XLS/XLSX）：

| 列 | 必填 | 说明 |
|----|------|------|
| `Comment` / `Value` | 是 | 元件值，如 100nF、10k |
| `Designator` | 是 | 位号，逗号分隔，如 C1,C2,C5 |
| `Footprint` | 是 | 封装名 |
| `LCSC Part #` | 建议 | LCSC 编号（Cxxxxx），保证精确匹配 |

LCSC 列表头必须严格写成 `LCSC Part #` 或 `LCSC Part Number`，写错会导致上传失败。

KiCad 导 BOM 给 JLCPCB：
1. 在原理图给每个符号加 `LCSC` 字段填入编号（Cxxxxx，如 C14663，这是 BOM 匹配的唯一权威标识）。
2. 导出 CSV，列为 Reference、Value、Footprint、LCSC。
3. 重命名列以匹配 JLCPCB：`Reference`->`Designator`，`Value`->`Comment`，`Footprint` 不变，`LCSC`->`LCSC Part #`。

选件分类与费用：
- Basic（约 698 种常用件）：贴片机预装，无额外费用。
- Preferred Extended：常用扩展件，Economic 贴片下无供料器装载费。
- Extended（30 万+ 不常用件）：按需装料，每种唯一扩展件 +$3。

参数查询入口：
- 元件库搜索：`https://jlcpcb.com/parts/componentSearch?searchTxt=<query>`
- 仅 Basic：`https://jlcpcb.com/parts/basic_parts`
- 官方 API（需申请审核）：`https://api.jlcpcb.com`，含 Components / PCB / Stencil / 3D Printing 四类 API。

## 示例

旋转校正（CPL）：JLCPCB 贴片机对部分封装的旋转约定与 KiCad 不同，上传前需在 CPL 的 Rotation 列加偏移：

| 封装族 | 典型偏移 |
|--------|----------|
| SOT-23 / -5 / -6 | +180° |
| SOT-223 | +180° |
| SOIC-8 / SOIC-16 | +90° 或 +270° |
| QFN（所有尺寸） | +90° |
| SMA/SMB/SMC 二极管 | +180° |
| USB-C 连接器 | 视 datasheet 而定 |

排查做法：直接改 CPL 的 Rotation 列；自定义封装核对 pin 1 朝向是否符合 JLCPCB 预期；JLCPCB 评审能拦大错，但对称件（电容、电阻）上细微 180° 旋转可能漏过；首单后记录所需校正，沉淀到后续 CPL 导出。

经济版 vs 标准版贴片：

| 特性 | Economic | Standard |
|------|----------|----------|
| 面 | 仅顶面 | 顶 + 底 |
| 元件类型 | 仅 SMD | SMD + 通孔 |
| 最小元件 | 0201 | 01005 |
| 细间距 BGA/QFP | 至 0.5mm | 至 0.4mm |
| 扩展件费 | $3/唯一件 | $3/唯一件 |

## 注意事项

- 制造规则（标准板 1-2 层）最小值：线宽/间距 0.127mm(5mil)，过孔径 0.45mm、钻孔 0.2mm，环宽 0.125mm，最小孔 0.2mm；板厚 0.4-2.4mm（默认 1.6）；最小板 6x6mm，最大 500x400mm。
- 多层板（4+ 层）：线宽/间距 0.09mm(3.5mil)，过孔径 0.25mm、钻孔 0.15mm，板厚 0.6-2.4mm。
- 有 JLCPCB 的 `.kicad_dru` 文件时，在 KiCad Board Editor > Board Setup > Design Rules > Import Settings 导入。
- 最小起订量：贴片 5 片；唯一选件无硬上限，但每个扩展件 +$3。
- 优先用 Basic 件：无额外费、常备库存、贴片更快；下单前查库存（扩展件可能缺货）。
- 小板让 JLCPCB 拼板（Panel by JLCPCB）通常比自定义拼板便宜。
- 焊料默认有铅 HASL，需要时选无铅 HASL 或 ENIG；阻抗控制仅多层可用，需在订单备注里写明叠层。
- 支持金属化半孔（castellated）、V-cut、邮票孔；丝印最小字高 0.8mm、线宽 0.15mm；铜到板边 >=0.3mm（建议 0.5mm）。

## 互见

- 元件搜索与库存（量产）：`lcsc`；打样采购：`digikey`、`mouser`。
- Gerber/CPL 导出、钢网下单、BOM 管理：`bom`。
- KiCad 工程读取与 DFM 评分：`kicad`。
- 量产前风险检查：`emc`（EMC 预合规）、`spice`（模拟子电路仿真）；替代厂商：`pcbway`。

---

本条采编自 aklofas/kicad-happy（MIT）。
