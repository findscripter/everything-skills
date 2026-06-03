---
name: opentrons-protocol-api
title: Opentrons 液体处理机器人协议
description: 当用 Opentrons OT-2/Flex 液体处理机器人自动化湿实验（PCR 配液、系列稀释、ELISA、磁珠纯化、平板复制）时使用；用 Python Protocol API v2 编写含 metadata 与 run() 的协议、先 opentrons_simulate 本地仿真再上传机器人；不适用于 Hamilton/Tecan 等非 Opentrons 硬件（改用 pylabrobot）或纯协议检索（用 protocolsio）。触发词：Opentrons、OT-2/Flex、移液机器人
domain: 领域/science
triggers: [Opentrons, OT-2, Flex 移液机器人, 液体处理协议, load_labware/load_instrument, transfer/distribute/consolidate, 热循环仪 thermocycler PCR, 磁力模块磁珠纯化, 系列稀释 ELISA, opentrons_simulate 仿真]
tags: [science, lab-automation, opentrons, liquid-handling, python, pcr, elisa, magnetic-beads]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [opentrons (Python 包), opentrons_simulate (CLI), Opentrons App]
requires: []
related: [snakemake-workflow-engine, cheminformatics-toolkit, research-experiment-designer, nextflow-pipeline-builder]
combines_with: [research-experiment-designer, pubchem-compound-search]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

针对 Opentrons OT-2 或 Flex 移液机器人，把湿实验流程写成 Python 协议并自动执行时使用，典型场景：

- PCR 配液与扩增：从管架分配 master mix 到 PCR 板、加模板 DNA、再用热循环仪跑完整循环程序。
- 系列稀释：多通道移液器逐列做 2 倍或自定义稀释曲线。
- ELISA 板布局：按孔加封闭液/一抗/二抗/底物，试剂间换枪头。
- 磁珠纯化：engage/disengage 磁力模块，吸上清、乙醇洗涤、洗脱的全自动循环。
- 平板复制/重排：一条命令把整块 96 孔板转移到目标板。
- 硬件模块编排：温控、振荡、移液在同一协议中精确定时协同。

**不该用的边界：**
- 协议必须跑在 Hamilton STAR、Tecan Freedom EVO、Beckman 等**非 Opentrons 硬件**上 → 改用 `pylabrobot`（厂商无关 API）。纯 Opentrons 工作流才用本原生 API（模块集成更紧密）。
- 只是想**检索/解析已发表协议**（automation 之前）→ 配合 `protocolsio-integration` 搜索 protocols.io。
- 连接 ELN/样本注册 → 见 `benchling-integration`。

## 步骤

1. **安装与仿真环境**：`pip install opentrons`（需 Python 3.10+），包内自带 `opentrons_simulate` CLI。
2. **写协议骨架**：每个协议是一个 `.py` 文件，必须含 `metadata`（至少 `apiLevel`）字典、可选 `requirements`（指定 robotType），以及 `run(protocol)` 函数。
3. **台面布局**：在 `run()` 内用 `protocol.load_labware(api_name, slot)` 加载枪头架/试剂槽/板/管架，用 `protocol.load_instrument(name, mount, tip_racks=[...])` 加载移液器。
4. **移液操作**：优先用复合方法 `transfer()/distribute()/consolidate()`（自动管理枪头）；需要逐步精控时才用底层 `aspirate/dispense/mix/blow_out/touch_tip`。
5. **硬件模块**（可选）：`protocol.load_module(model, slot)` 加载温控/磁力/热循环/加热振荡模块。
6. **本地仿真**：上传前务必 `opentrons_simulate protocol.py` 验证（抓 labware 名错、枪头不足、超量、槽位冲突）。
7. **上传执行**：通过 Opentrons App 或 HTTP API 上传到实体机器人。

## 指令

```bash
pip install opentrons
opentrons_simulate my_protocol.py    # 本地仿真，无需机器人；错误带行号打印
```

**台面槽位约定（务必区分）：**
- OT-2：数字字符串槽位 `"1"`–`"11"`（3 列 × 4 行）。
- Flex：网格坐标 `"A1"`–`"D3"`。
- 设 `requirements = {"robotType": "Flex"}` 或 `"OT-2"`，仿真期即可捕获槽位命名不匹配。

**常用移液器名：** OT-2 `p20_single_gen2`、`p300_single_gen2`、`p1000_single_gen2`、`p300_multi_gen2`；Flex `p50_single_flex`、`p1000_single_flex`、`p1000_multi_flex`、`flex_96channel_1000`。

**关键参数（复合方法）：**
| 参数 | 默认 | 取值 | 作用 |
|------|------|------|------|
| `new_tip` | `"always"` | `"always"`/`"once"`/`"never"` | 换枪头策略；`"always"` 防交叉污染 |
| `mix_after` / `mix_before` | `None` | `(次数, 体积)` | 分液后在目标孔 / 吸液前在源孔混匀 |
| `blow_out` | `False` | + `blowout_location` | 排残液，可控位置 |
| `air_gap` | `0` | 0–枪头上限 | 吸后加空气隔层防滴漏 |
| `disposal_volume` | `0` | 0–上限 | distribute 多吸的废液量，提精度 |
| `flow_rate.aspirate/dispense` | 因型号 | 1–1000 µL/s | 黏稠样品降速（≥20% 甘油、蛋白>5 mg/mL 用 25–50） |

**孔位访问：** `plate["A1"]`、`plate.wells()`（列优先）、`plate.rows()[0]`、`plate.columns()[0]`；垂直定位 `well.bottom(z=1)` / `well.top(z=-2)` / `well.center()`。

**模块精确型号串**（仿真过但实跑报 `ModuleNotAttachedError` 时核对）：`"temperature module gen2"`、`"magnetic module gen2"`、`"thermocyclerModuleV2"`、`"heaterShakerModuleV1"`。热循环仪自动占用 OT-2 槽 7–11，**无需传 slot**。

## 示例

最小协议（metadata + labware + instrument + 一次分配）：

```python
from opentrons import protocol_api

metadata = {"protocolName": "Simple Reagent Distribution",
            "author": "Lab Automation Team", "apiLevel": "2.19"}

def run(protocol: protocol_api.ProtocolContext):
    tips   = protocol.load_labware("opentrons_96_tiprack_300ul", "1")
    source = protocol.load_labware("nest_12_reservoir_15ml", "2")
    plate  = protocol.load_labware("corning_96_wellplate_360ul_flat", "3")
    pipette = protocol.load_instrument("p300_single_gen2", "left", tip_racks=[tips])
    # 一个枪头把 50 µL 从 A1 分配到前 12 孔
    pipette.distribute(50, source["A1"], plate.wells()[:12], new_tip="once")
    protocol.comment("Distribution complete")
```

PCR 配液 + 热循环（核心片段）：

```python
def run(protocol):
    tc_mod   = protocol.load_module("thermocyclerModuleV2")        # 自动占槽 7-11
    tc_plate = tc_mod.load_labware("nest_96_wellplate_100ul_pcr_full_skirt")
    # ... 加载 tips/reagents/p300/p20 ...
    tc_mod.open_lid()
    p300.distribute(20, reagents["A1"], tc_plate.wells()[:8],
                    new_tip="once", blow_out=True, blowout_location="source well")
    for i in range(8):                                            # 加模板，每孔换枪头
        p20.transfer(5, reagents.wells()[i+1], tc_plate.wells()[i],
                     new_tip="always", mix_after=(2, 10))
    tc_mod.close_lid(); tc_mod.set_lid_temperature(105)           # 预热盖防冷凝
    tc_mod.set_block_temperature(95, hold_time_seconds=180)       # 初始变性
    profile = [{"temperature": 95, "hold_time_seconds": 15},
               {"temperature": 60, "hold_time_seconds": 30},
               {"temperature": 72, "hold_time_seconds": 30}]
    tc_mod.execute_profile(steps=profile, repetitions=35, block_max_volume=25)
    tc_mod.set_block_temperature(72, hold_time_minutes=5)
    tc_mod.set_block_temperature(4)                               # 4°C 保持
    tc_mod.deactivate_lid(); tc_mod.open_lid()
```

磁珠洗涤循环（核心片段）：

```python
mag_mod.engage(height_from_base=6)                  # 磁铁升 6 mm
protocol.delay(seconds=120, msg="Beads pelleting on magnet")
p300.transfer(90, bead_plate["A1"].bottom(z=0.5), waste["A1"], new_tip="once")
for wash_num in range(2):                            # 2 次洗涤
    mag_mod.disengage()
    p300.transfer(100, reservoir["A1"], bead_plate["A1"], mix_after=(5, 80), new_tip="always")
    mag_mod.engage(height_from_base=6); protocol.delay(seconds=90)
    p300.transfer(100, bead_plate["A1"].bottom(z=0.5), waste["A2"], new_tip="always")
```

加热振荡模块需先 `close_labware_latch()`，结束 `deactivate_shaker()/deactivate_heater()/open_labware_latch()`。

## 注意事项

- **上机前必仿真**：`opentrons_simulate protocol.py` 不消耗耗材即可抓 labware 名错、枪头不足、超量、槽位冲突。
- **优先复合方法**：`transfer/distribute/consolidate` 自动处理枪头、空气隔层、blow-out；底层调用仅留给复合方法不支持的操作。
- **数枪头**：每个 `new_tip="always"` 的 transfer 每对孔耗一枪头；不足时往 `tip_racks=[]` 加架，或耗尽后 `pipette.reset_tipracks()`。
- **labware 名区分大小写**：在 [labware.opentrons.com](https://labware.opentrons.com/) 查精确 API 名，错则报 `LabwareNotFoundError`。
- **超量用 distribute** 自动拆分，或换 `p1000_single_gen2`（达 1000 µL）。
- **pause vs delay**：`protocol.pause(msg=...)` 用于需人工介入的步骤（停机并通知操作员，按需恢复）；`protocol.delay(seconds=/minutes=)` 仅用于无需人工的定时等待（孵育、模块平衡）。
- **黏稠/起泡样品** 调低 `flow_rate`；关键转移前 `mix()` 预润枪头以提精度。
- **仿真分支**：`if protocol.is_simulating():` 可在仿真时跳过长孵育，加速验证。
- 源/目标孔列表做配对 transfer 时**长度必须相等**，否则 `TypeError`；一对多请用单源 + 目标列表。
- 热循环仪占槽 7–11，放其他 labware 会 `DeckConflictError`，用 `protocol.deck` 检查。

## 互见

- `pylabrobot` — 厂商无关 API（Hamilton/Tecan/Beckman），非 Opentrons 硬件时改用。
- `protocolsio-integration` — 检索 protocols.io 已发表协议，改编为 Opentrons 协议。
- `benchling-integration` — 把协议执行接入 Benchling ELN 与样本注册。

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。官方文档：https://docs.opentrons.com/v2/
