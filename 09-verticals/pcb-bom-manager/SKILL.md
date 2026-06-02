---
name: pcb-bom-manager
title: 电子物料清单(BOM)管理
description: 当为 KiCad 电子项目做元器件选型、采购、报价、备料或可制造性准备时使用；以原理图符号属性为单一事实源，分析原理图、查询分销商、校验封装规格、回写属性、导出 BOM 跟踪 CSV 并生成下单文件；不适用于非 KiCad 工程、纯软件 BOM 或机械零件清单。触发词：BOM、物料清单、bill of materials、元器件选型、采购下单、分销商搜索、distributor、报价、cost estimate、查库存、check stock、JLCPCB、LCSC、DigiKey、Mouser、立创、嘉立创、PCB 备料、可制造性
domain: 领域/hardware
triggers: [BOM, 物料清单, bill of materials, 元器件选型, 采购下单, 分销商搜索, distributor, 报价, cost estimate, 查库存, check stock, JLCPCB, LCSC, DigiKey, Mouser, 立创, 嘉立创, PCB备料, 可制造性]
tags: [bom, kicad, hardware, pcb, electronics, procurement, distributor, jlcpcb, lcsc, digikey, mouser, manufacturing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, bom_manager.py, edit_properties.py, sync_datasheet_urls.py, KiCad, InteractiveHtmlBom]
requires: []
related: [component-sourcing-search, pcb-fab-assembly, kicad-design-reviewer, datasheet-spec-extractor]
combines_with: [component-sourcing-search, pcb-fab-assembly, kicad-design-reviewer]
license: MIT
source: aklofas/kicad-happy
source_license: MIT
---
## 何时使用

适用：为 KiCad 电子工程做元器件选型、采购、报价、备料、可制造性（DFM/下单）准备。本技能是 BOM 全生命周期的编排者——分析原理图、搜索分销商、校验零件、回写属性、导出跟踪 CSV、生成下单文件。即使用户只点名某家分销商或工厂（如「在 DigiKey 搜…」「生成 JLCPCB BOM」「从 Mouser 下单」），也由本技能决定调用哪些分销商/工厂子技能及顺序。

核心原则：**BOM 数据存在 KiCad 原理图符号属性里，是唯一事实源**；CSV 仅作导出与跟踪。

不该用：
- 非 KiCad 工程（无 `.kicad_sch`）、纯软件依赖清单（用 dependency-auditor）。
- 机械/结构件清单、纯 Excel 报价表无原理图来源。
- 仅需读原理图/PCB/封装而不涉及采购——那属于 `kicad` 子技能。

## 步骤

1. **分析工程**：跑 `analyze` 得到字段命名约定、已填/缺失分销商、首选分销商；同时找已存在的 `bom/bom.csv`。字段约定异常时直接读原理图核对。
2. **同步数据手册（立即做）**：手册是选型与校验的关键上下文。优先级 DigiKey（直链 PDF，最佳）> element14（无反爬，可靠）> LCSC（仅 LCSC 件）> Mouser（常被拦，最后手段）。脚本幂等、共享 `datasheets/` 目录、跳过已下载件。告诉用户手册存放位置。
3. **收集零件信息**：按可用字段定策略——有 MPN→按 MPN 搜各分销商拿 PN 与库存；有分销商 PN 无 MPN→先搜该商拿 MPN 再搜其他；只有 Value+Footprint→按描述搜（如「100nF 0402 X7R 16V」）。**注意逗号分隔的多 MPN**（如电池座+卡扣），须拆开各自搜，整串搜会命中错件。原型优先 DigiKey/Mouser，量产用 LCSC。
4. **校验匹配**：勿默认现有 PN 正确（会停产/改号）；404 即标记替换。逐项核对：封装匹配原理图 Footprint（见交叉参照表）、规格匹配（容值/阻值/耐压/容差）、描述合理、生命周期未 EOL、数据手册是直链 PDF。有歧义先问用户——错件比缺件更糟。
5. **回写原理图**：用 `edit_properties.py`，先 `--dry-run` 再正式。**尊重工程已有字段名**（已是 `Digi-Key_PN` 就别写 `DigiKey`，规范名仅用于新工程）；**写 MPN 时永远同时写 Manufacturer**（API 都返回，免费数据）。
6. **导出 BOM 跟踪 CSV**：`export` 重新导出会**保留用户管理列**（stock、Chosen_Distributor、Validated、Notes），只更新原理图派生列。
7. **查库存**：逐个分销商 PN 查实时库存，更新 CSV 库存列并记日期；首选商缺货则标记并建议替代。
8. **定首选分销商**（Chosen_Distributor）：综合库存、目标量价格、起订量/倍数、货期、合并发货。原型合并到 1–2 家（DigiKey+Mouser），量产 LCSC/JLCPCB 最省。
9. **重同步手册/URL**：补 3–5 步新增件（已下载件自动跳过）。
10. **依手册校验设计**：读手册核对功能是否符合电路（耐压 vs 轨压、温漂、功耗；稳压器 Vin/Vout/电流；MOSFET Vds/Rds(on)/阈值等）。大 BOM（50+）聚焦电源/关键信号路径，普通贴片无需深查。
11. **生成下单文件**：先问板数（设 `--boards`）；预检无缺口、CSV 最新、Chosen_Distributor 已设、库存新鲜。逗号 PN 自动拆行、DNP 件排除，每家分销商出一份上传格式文件。先给用户审阅再下单，并查价给出每家总额。

## 指令

```bash
# 1. 分析原理图（JSON，递归子图）
python3 <skill-path>/scripts/bom_manager.py analyze path/to/x.kicad_sch --json --recursive
# 仅看缺口：追加 --gaps-only

# 2. 导出/合并 BOM 跟踪 CSV
python3 <skill-path>/scripts/bom_manager.py export path/to/x.kicad_sch -o bom/bom.csv --recursive

# 3. 回写符号属性（先 dry-run，再去掉它正式写）
echo '{"R1": {"MPN": "RC0805FR-0710KL", "Manufacturer": "Yageo", "DigiKey": "311-10.0KCRCT-ND"}}' \
  | python3 <skill-path>/scripts/edit_properties.py path/to/x.kicad_sch --dry-run
# 非 git 工程或想留改前副本：追加 --backup（默认不建 .bak，靠 git）

# 4. 把数据手册 URL 从 manifest.json 回填到空 Datasheet 属性（仅填空，冲突仅告警）
python3 <skill-path>/scripts/sync_datasheet_urls.py path/to/x.kicad_sch --recursive --dry-run

# 5. 生成下单文件（5 板 + 每行 2 备件；--boards 乘量，--spares 乘后再加）
python3 <skill-path>/scripts/bom_manager.py order bom/bom.csv -o bom/orders/ --boards 5 --spares 2
# 快速单分销商（绕过 Chosen_Distributor 列）
python3 <skill-path>/scripts/bom_manager.py order bom/bom.csv --distributor digikey
```

CSV 列是动态的——只有工程实际用到的分销商才出列。基础列：Reference、Qty、Value、Footprint、MPN、Manufacturer；每个活跃分销商加 PN 列+库存列；尾列：Chosen_Distributor、Datasheet、Validated、DNP、Notes。Notes 首次导出从符号 `BOM Comments`（及别名 Notes/Remarks/Ordering Notes 等）播种，再导出时用户在 CSV 的编辑优先、不被覆盖。

封装/Footprint 交叉参照（`R_` 换 `C_`/`L_`，前缀 `Resistor_SMD:`/`Capacitor_SMD:` 等）：

| Imperial | Metric | KiCad Footprint |
|---|---|---|
| 0201 | 0603 | `R_0201_0603Metric` |
| 0402 | 1005 | `R_0402_1005Metric` |
| 0603 | 1608 | `R_0603_1608Metric` |
| 0805 | 2012 | `R_0805_2012Metric` |
| 1206 | 3216 | `R_1206_3216Metric` |

## 示例

「为生产准备」工作流：
1. `analyze --gaps-only` 找缺口，确保每件有 LCSC 编号。
2. 逐件查 LCSC 库存、区分 basic/extended 件。
3. `edit_properties.py` 把缺的 LCSC/MPN 回写，Chosen_Distributor 设为 LCSC。
4. `export` 刷新 CSV；过「生产就绪清单」：全部有 MPN+LCSC、无 EOL、库存已验、BOM/CPL/Gerber 格式正确、设计规则达工厂下限、原型已测。
5. 生成 Interactive BOM 供贴装核对：
```bash
pip install InteractiveHtmlBom
generate_interactive_bom board.kicad_pcb --dest-dir bom/ \
  --extra-fields "MPN,Manufacturer,DigiKey,Mouser,LCSC" \
  --group-fields "Value,Footprint,MPN" \
  --checkboxes "Sourced,Placed" --dnp-field "DNP" --no-browser
```

## 注意事项

- **KiCad 并发**：脚本检测到 KiCad 锁文件会告警但继续。KiCad 不感知外部改动，仍用内存副本。若 KiCad 开着，告诉用户：改后「关闭并重新打开原理图（File → Open Recent）才能看到变化，别先从 KiCad 保存」；有未保存内容先 Ctrl+S 再跑脚本再重开。
- **MPN 是万能键**——最先填，启用全链交叉引用；关键件用 `AltMPN` 留二供。
- **主动找 BOM 怪癖**，别等用户说：仅原型/仅量产件、起订量/长货期/指定批次、跨板共享线缆连接器（标「勿重复下单」）、装配注意（手焊、回流后贴）、变体填充规则。这些写进 `BOM Comments`，并在订单摘要里**单独突出列出**，让用户下单前看到。
- **非 BOM 但要一起买**：对插连接器/线缆、钢网（JLCPCB/PCBWay 约 $7）、烧录/调试转接（Tag-Connect、SWD 排线）、天线 pigtail、安装五金、散热件。用 `Reference=--` 加进 CSV 或单列 `bom/non-bom-items.csv`，报价里单独提。
- **库存会过期**：记录查询日期，下单前重查。原型价≠量产价，按目标量查价。
- **可清理/gitignore**：`datasheets/`、`bom/orders/`、`*.bak` 不入 git（可重生）；`bom/bom.csv` 入 git（含用户策划数据，无法从原理图重生）。

## 互见

- `kicad` 子技能：读/分析原理图、PCB、封装，提取文本注释与未识别字段。
- 分销商/工厂子技能：`digikey`、`mouser`、`lcsc`、`element14`、`jlcpcb`、`pcbway`——本技能决定调用哪个及顺序。
- 参考文件（需细查时读）：`references/kicad-fields.md`（字段定义/别名/S-表达式）、`references/ordering-and-fabrication.md`（分销商粘贴格式、Gerber/CPL、成本模板）、`references/part-number-conventions.md`（56+ 真实工程命名约定）。
- dependency-auditor：软件依赖清单审计（与本硬件 BOM 互补，勿混用）。

---
本条采编自 aklofas/kicad-happy（MIT）。
