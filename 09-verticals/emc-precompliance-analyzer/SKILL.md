---
name: emc-precompliance-analyzer
title: EMC 电磁兼容预合规分析
description: 当对 KiCad PCB 设计做流片/送测前的 EMC/EMI 风险排查时使用；做静态规则检查（18 类 44 条规则）+ 解析式辐射估算（可选 SPICE），产出按严重度排序的风险报告与预合规测试计划，覆盖 FCC Part 15、CISPR 32/25、MIL-STD-461G；不适用于替代认证实验室测量或保证合规、整机外壳/线缆辐射建模、复杂结构全波仿真；触发词：EMC、EMI、电磁兼容、辐射发射、传导发射、FCC、CE、CISPR、地平面、去耦、时钟布线、开关噪声、差分对偏斜、emissions、ground plane、decoupling、EMC test plan
domain: 领域/hardware
triggers: [EMC, EMI, 电磁兼容, 辐射发射, 传导发射, FCC, CE, CISPR, 地平面, 去耦, 时钟布线, 开关噪声, 差分对偏斜, emissions, ground plane, decoupling, EMC test plan, 预合规, 能否通过 FCC, MIL-STD-461]
tags: [emc, emi, hardware, pcb, kicad, precompliance, fcc, cispr, ground-plane, decoupling, signal-integrity]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python 3.8+, analyze_emc.py, analyze_schematic.py, analyze_pcb.py, KiCad, ngspice/LTspice/Xyce（可选）]
requires: []
related: [kicad-design-reviewer, spice-circuit-simulator, hardware-doc-generator, pcb-fab-assembly]
combines_with: [kicad-design-reviewer, hardware-doc-generator, spice-circuit-simulator]
license: MIT
source: aklofas/kicad-happy
source_license: MIT
---
## 何时使用

- 在 KiCad PCB **流片或送 EMC 实验室前**，做一轮自动化的 EMC/EMI 风险排查，提前发现地平面割裂、去耦不足、时钟布线、开关噪声、差分对偏斜等常见失败成因。
- 用户问「这板子能不能过 FCC / CE」「帮我检查地平面 / 去耦」「生成一份 EMC 测试计划」。
- 需要一份按严重度排序、带规则 ID 和整改建议的风险报告，用于设计评审。

**这是风险分析器，不是合规预测器。** 它能捕获约 70% 的常见 EMC 设计错误，把首版失败率从约 50% 降到约 20–30%，每避免一次改版可省 5K–50K 美元。但**不能**保证通过 FCC/CISPR——只有认证实验室的校准测量能下结论。

**不该用于：** 替代认证实验室测量；为合规背书；外壳屏蔽/孔缝效应建模；未知线缆走向下的线缆辐射预测；复杂结构的全波仿真替代。

## 步骤

1. **跑前置分析器**（来自 `kicad` 技能），产出本工具消费的 JSON。PCB 分析务必加 `--full`，以启用逐条走线坐标，支撑地平面跨越、边缘邻近、回流路径检查。
2. **跑 EMC 分析**：把 `--schematic`/`--pcb` 指向本次运行的 JSON，加 `--analysis-dir analysis/` 让 `emc.json` 与之同目录并进入清单（manifest）。可选 `--spice-enhanced` 提升 PDN 与滤波器精度（自动探测 ngspice/LTspice/Xyce，无则退回解析模型）。
3. **解读结果**：每条 finding 含严重度、规则 ID、描述、可执行建议；同时输出预合规测试计划与法规覆盖矩阵。按下方「严重度」与「注意事项」分级整改。

## 指令

环境要求：Python 3.8+（仅标准库，无 pip 依赖）；理理图 JSON 来自 `analyze_schematic.py --output`；PCB JSON 来自 `analyze_pcb.py --full --output`。

```bash
# Step 1：前置分析器
python3 <kicad-skill-path>/scripts/analyze_schematic.py design.kicad_sch --analysis-dir analysis/
python3 <kicad-skill-path>/scripts/analyze_pcb.py design.kicad_pcb --full --analysis-dir analysis/

# Step 2：集成进本次运行（推荐）
python3 <skill-path>/scripts/analyze_emc.py \
    --schematic analysis/<run_id>/schematic.json \
    --pcb analysis/<run_id>/pcb.json \
    --analysis-dir analysis/

# 常用变体
--output emc.json        # 一次性 JSON（绕过缓存）
--spice-enhanced         # SPICE 增强（PDN/滤波器精度更高）
--standard cispr-class-b # 指定目标标准
--market eu              # 指定市场，自动套用全部适用标准
--severity high          # 按严重度过滤
--text                   # 人类可读文本输出
```

**目标标准 / 市场：** `fcc-class-b`（美国住宅，默认）、`fcc-class-a`（美国商用/工业）、`cispr-class-b`（国际/EU CE）、`cispr-class-a`、`cispr-25`（车规，最严）、`mil-std-461`（军工 RE102）。`--market` 取值：`us`、`eu`、`automotive`、`medical`、`military`。

## 示例

输出 JSON 关键结构（节选）：

```json
{
  "summary": { "critical": 2, "high": 5, "medium": 8, "emc_risk_score": 73 },
  "target_standard": "fcc-class-b",
  "findings": [{
    "category": "ground_plane", "severity": "CRITICAL", "rule_id": "GP-001",
    "title": "Signal crosses ground plane void",
    "description": "Net SPI_CLK crosses a 3.2mm gap in GND on In1.Cu",
    "components": ["U3", "U7"], "nets": ["SPI_CLK"],
    "recommendation": "Route around the gap, or fill the void"
  }],
  "per_net_scores": [{ "net": "SPI_CLK", "score": 67, "rules": ["GP-001","CK-001","BE-001"] }],
  "test_plan": {
    "frequency_bands": [{ "band": "30-88 MHz", "risk_level": "high" }],
    "probe_points": [{ "ref": "L1", "x": 45.2, "y": 32.1, "reason": "switching inductor" }]
  }
}
```

**风险评分：** 每个规则 ID 至多贡献 3 条 finding（先取最严，避免 GP-001 这类逐网络规则在 2 层板上刷爆分数；所有 finding 仍全量上报，仅评分封顶）。`penalty = Σ(每规则最严 3 条 × 严重度权重)`，`score = max(0, 100 − penalty)`。**分数低于 50 表示存在显著 EMC 风险。**

## 注意事项

**严重度分级：** CRITICAL=几乎必然导致 EMC 失败，流片前必须修；HIGH=极可能出问题，强烈建议修；MEDIUM=视具体情况，需评估；LOW=轻微/良好实践，方便就修；INFO=频率/估算等信息，供实验室准备用。

**按类解读：**
- **地平面**：任何 CRITICAL（信号跨越割缝）几乎都是真问题，无条件修复。
- **去耦**：基于距离的判定有中等误报率——6mm 的电容对低速 IC 可能没事，但对 100MHz 时钟缓冲器就是问题，按频率上下文排优先级。
- **I/O 滤波**：对带线缆引出的产品高度相关；机箱内板对板连接风险较低。
- **差分对**：协议偏斜上限明确（USB HS 25ps、PCIe 5ps、以太网 50ps），超限即真问题。
- **PDN**：反谐振峰真实存在并造成电压跌落，SPICE 验证比解析更准；命中后在峰值频率附近补一颗 SRF 匹配的电容。
- **辐射估算**：数量级精度（±10–20 dB），仅用于排测试频段优先级，不预测过/不过。

**局限：** 不能预测绝对辐射电平优于 ±10–20 dB；不考虑外壳（屏蔽/孔缝/接缝）效应；不知外部线缆走向时无法预测线缆辐射；复杂几何不能替代全波仿真；不能保证合规——只有认证实验室测量能下结论。

## 互见

- `kicad` 技能：理理图/PCB 分析，产出本技能消费的 JSON（先跑它，PCB 务必 `--full`）。
- `spice` 技能：SPICE 仿真后端，支撑 `--spice-enhanced` 的 PDN/滤波器检查。
- 完整规则细节（阈值、依据、引用）见源仓库 `references/pcb-emc-rules.md`。

---
本条采编自 aklofas/kicad-happy（MIT）。
