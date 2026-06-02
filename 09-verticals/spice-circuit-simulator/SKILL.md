---
name: spice-circuit-simulator
title: SPICE 电路仿真验证
description: 当需要对 KiCad 原理图分析出的子电路（RC/LC 滤波、分压、运放、晶振等）做 SPICE 仿真验证时使用；自动生成测试平台、调用 ngspice/LTspice/Xyce 批处理仿真、产出 pass/warn/fail/skip 结构化报告并核对计算值与仿真值；不适用于无解析元件值、比较器/开环运放、有源振荡器、控制环路稳定性等无法仿真的场景；触发词：spice 仿真、电路仿真、滤波器截止频率、分压比验证、运放增益带宽、晶振负载电容、simulate circuit、run spice、verify with simulation。
domain: 领域/hardware
triggers: [spice 仿真, 电路仿真, 滤波器截止频率, 分压比验证, 运放增益带宽, 晶振负载电容, simulate circuit, run spice, verify with simulation]
tags: [spice, ngspice, ltspice, xyce, circuit-simulation, kicad, analog, hardware, monte-carlo, verification]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, ngspice, LTspice, Xyce, simulate_subcircuits.py, extract_parasitics.py]
requires: []
related: [kicad-design-reviewer, emc-precompliance-analyzer, datasheet-spec-extractor, hardware-doc-generator]
combines_with: [kicad-design-reviewer, datasheet-spec-extractor]
license: MIT
source: aklofas/kicad-happy
source_license: MIT
---
## 何时使用

当 KiCad 原理图分析器已输出子电路检测 JSON，需要用 SPICE 仿真**反验证**计算值（滤波器截止频率、分压比、运放增益、LC 谐振、晶振负载电容等）时使用。它把传统仿真流程倒置：不要求用户手工搭建激励源和分析配置，而是依据分析器的检测结果自动生成针对性测试平台并批量仿真。

适合：RC/LC 滤波器、电压分压器、反馈网络、运放电路、晶振电路、去耦/PDN 阻抗、电流检测、RF 匹配、缓冲吸收等可仿真子电路；设计评审中作为"验证"环节插入。

**不该用（负边界）**：
- 比较器 / 开环运放——无反馈网络可验证，跳过。
- 有源振荡器——自包含模块，外部无可验证项。
- 稳压器控制环路稳定性——行为模型只覆盖 DC 反馈，不含补偿器模型。
- 电平转换 FET、高边功率开关、保险丝/压敏电阻——需厂商特定模型或完整负载上下文。
- 任何无法解析出 R/C/L 值的检测项——`parse_value()` 取不到值即跳过。
- 未安装任何仿真器时：**优雅跳过并在报告中注明，不视为错误**（仿真是可选增强）。

## 步骤

1. **先跑原理图分析器**，生成检测 JSON（本技能消费其 `findings[]` 数组，按 `detector` 字段分组）。
2. **运行 SPICE 仿真**：对支持的子电路类型自动生成 `.cir` 测试平台并调用仿真器，产出 `sim_report.json`。
3. **解读报告并呈现给用户**：读取 JSON，将 pass/warn/fail/skip 结果并入设计评审报告的"仿真验证"小节。

可选增强：
- **PCB 寄生参数仿真**（`--parasitics`）：原理图与 PCB 并存时，注入走线电阻、过孔电感等寄生量，得到更真实结果。适合高阻反馈网络（>100kΩ）、LC/RF 匹配、长模拟信号线、高频电路；典型低阻数字电源场景用理想仿真即可。
- **蒙特卡洛容差分析**（`--monte-carlo N`）：在容差带内随机化元件值跑 N 次，输出统计分布与灵敏度（哪个元件贡献最大变差）。适合反馈网络、精密分压、临近规格边界的滤波器。

## 指令

```bash
# 第 1 步：原理图分析器输出检测 JSON
python3 <kicad-skill-path>/scripts/analyze_schematic.py design.kicad_sch --output analysis.json

# 第 2 步：仿真所有支持的子电路类型
python3 <skill-path>/scripts/simulate_subcircuits.py analysis.json --output sim_report.json

# 仅仿真指定类型
python3 <skill-path>/scripts/simulate_subcircuits.py analysis.json --types rc_filters,voltage_dividers

# 保留仿真文件用于调试（默认临时目录，跑完清理）
python3 <skill-path>/scripts/simulate_subcircuits.py analysis.json --workdir ./spice_runs

# 复杂电路加大超时（默认每个子电路 5s）
python3 <skill-path>/scripts/simulate_subcircuits.py analysis.json --timeout 10

# 输出省略文件路径（报告更干净）
python3 <skill-path>/scripts/simulate_subcircuits.py analysis.json --compact

# 可选：PCB 寄生参数仿真
python3 <kicad-skill-path>/scripts/analyze_pcb.py design.kicad_pcb --full --output pcb.json
python3 <skill-path>/scripts/extract_parasitics.py pcb.json --output parasitics.json
python3 <skill-path>/scripts/simulate_subcircuits.py analysis.json --parasitics parasitics.json --output sim_report.json

# 可选：蒙特卡洛（100 次/子电路；可改均匀分布、设随机种子）
python3 <skill-path>/scripts/simulate_subcircuits.py analysis.json --monte-carlo 100 --mc-distribution uniform --mc-seed 123
```

仿真器自动检测，首个可用者优先；可用 `--simulator ngspice|ltspice|xyce` 或 `SPICE_SIMULATOR` 环境变量覆盖。仅依赖 Python 3.8+ 标准库，无 pip 依赖。

**容差来源**：优先从值字符串解析（"680K 1%"→1%，"22uF/6.3V/20%/X5R"→20%）；未指定时默认 电阻 5% / 电容 10% / 电感 20%。

## 示例

报告输出（节选）：

```json
{
  "summary": {"total": 5, "pass": 3, "warn": 1, "fail": 0, "skip": 1},
  "simulation_results": [{
    "subcircuit_type": "rc_filter",
    "components": ["R5", "C3"],
    "status": "pass",
    "expected": {"fc_hz": 15915, "type": "low-pass"},
    "simulated": {"fc_hz": 15878, "phase_at_fc_deg": -0.78},
    "delta": {"fc_error_pct": 0.23}
  }],
  "simulator": "ngspice"
}
```

呈现给用户的写法：

```
## 仿真验证（4 通过，1 警告，0 失败，1 跳过）
### RC 滤波器 R5/C3（fc=15.9kHz 低通）—— 已确认
仿真 fc=15.9kHz，与计算值偏差 <0.3%，fc 处相位 -45 度符合预期。

### 运放 U4A（反相增益 -10）—— 需结合上下文
仿真增益 20.0dB@1kHz，符合 -10x；带宽 98.8kHz（理想模型）。
注：LM358 GBW≈1MHz，实际带宽约 100kHz——确认信号频率 <85kHz 以保证 <1dB 增益误差。

### RC 滤波器 R12/C8 —— 不匹配
仿真 fc=3.2kHz vs 期望 15.9kHz（偏差 80%）。多半是分析器误判拓扑，
R12 可能用作上拉而非串联滤波元件，需手工核对原理图。
```

## 注意事项

- **状态语义**：pass=仿真在容差内确认检测（无需动作）；warn=有可记录的小偏差/模型局限（带上下文报告）；fail=仿真与分析器矛盾（查 `.cir` 与 `.log`，可能是真实设计问题、拓扑误判或测试平台 bug）；skip=数据缺失/配置不支持/仿真器错误（看 `note` 字段原因）。
- **无源电路用理想模型，数学上精确**：偏差 >1% 必是 bug（拓扑检测、测试平台生成或值解析其一），实测通常 <0.3%。但它**不告诉你真实电路行为**——未含下游负载、PCB 寄生、温度效应。
- **运放模型**：识别出的约 100 个常见型号用每零件行为模型（含真实 GBW/压摆率/失调/输出摆幅）；未识别则回退理想模型（Aol=1e6，GBW≈10MHz）。看 `model_note` 字段判断用了哪种；行为模型下的增益带宽警告是有价值的设计洞察，非仿真错误。
- **晶振仿真**用通用 Butterworth-Van Dyke 等效电路，主要价值是抓"缺失/严重错误的负载电容"，非精确频率预测。
- **已知局限**：分压器按 R_bot/(R_top+R_bot) 不带负载仿真（目的是验证计算而非建模整电路）；LC 滤波器 Q 用估算电感 ESR（默认 Q=100，谐振频率不受 Q 影响）；运放供电轨从网络名推断（无标注默认 ±5V，仅有 VCC 时按单电源处理）；分析器可能给出 `__unnamed_N` 内部网名，仿真正确但可读性差。
- 调试时用 `--workdir` 保留文件；`.cir` 是标准 SPICE 网表可手工 `ngspice -b file.cir` 运行，`.log` 含仿真器输出。

## 互见

设计评审流程：先跑原理图/PCB 分析器产出检测 JSON → 再用本技能仿真验证 → 仿真结果作为报告的"验证"小节。本条采编自 aklofas/kicad-happy（MIT）。
