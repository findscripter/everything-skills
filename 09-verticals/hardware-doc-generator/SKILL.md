---
name: hardware-doc-generator
title: 硬件工程文档生成
description: 当需要从 KiCad 工程自动生成硬件设计文档（HDD/CE技术文件/ICD/设计评审/制造移交包等）时使用；做的事：自动跑原理图/PCB/EMC/热分析，渲染原理图与 PCB SVG、生成框图，产出 Markdown 脚手架并导出 PDF/HTML/DOCX/ODT；不适用于非 KiCad6+ 工程、纯电路仿真本身或叙述性工程文字代写（需 Agent/人工撰写）。触发词：硬件文档生成、生成报告、HDD、CE技术文件、ICD、设计评审包、制造移交包、渲染原理图、渲染PCB、框图、generate documentation、HDD、CE technical file、ICD、design review、render schematic、block diagram。
domain: 领域/hardware
triggers: [硬件文档生成, 生成报告, HDD, CE技术文件, ICD, 设计评审包, 制造移交包, 渲染原理图, 渲染PCB, 框图, generate documentation, CE technical file, design review package, render schematic, block diagram]
tags: [hardware, kicad, documentation, pcb, schematic, pdf, emc, report-generation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, kicad, svglib, python3-venv]
requires: []
related: [kicad-design-reviewer, emc-precompliance-analyzer, pcb-bom-manager, spice-circuit-simulator]
combines_with: [kicad-design-reviewer, emc-precompliance-analyzer, markdown-to-docx]
license: MIT
source: aklofas/kicad-happy
source_license: MIT
---
## 何时使用

当你有一个 **KiCad 6+ 工程**（`.kicad_sch` / `.kicad_pcb`），需要产出专业硬件工程文档时使用：

- **HDD**（硬件设计说明）、**CE 技术文件**、**ICD**（接口控制文档）、**设计评审包**、**制造移交包**，以及原理图评审报告、电源分析报告、EMC 预兼容报告。
- 需要渲染原理图/PCB 的 SVG（含子系统裁剪、聚焦淡化、网络高亮、引脚级网络标注）。
- 需要生成电源树、总线拓扑、架构框图。
- 需要把 Markdown 文档源导出为带封面、目录、矢量图的 PDF（或 HTML/DOCX/ODT）。

**不该用的边界：**
- 渲染器仅支持 KiCad 6+ 格式（`.kicad_sch` / `.kicad_pcb`），更早版本不支持。
- 不负责跑 SPICE 仿真本身——仿真需手动搭建，本工具只在结果可用时引用。
- 叙述性工程正文（每个 `<!-- NARRATIVE -->` 占位）需 Agent 或人工撰写，脚手架只给结构和数据，不代写文字。

## 步骤

1. **生成脚手架**：`kidoc_scaffold.py` 自动探测源文件、跑全部可用分析、渲染原理图、生成框图，写出带预填数据表和叙述占位符的 Markdown。
2. **填写叙述**：Agent 读取脚手架，为每个 `<!-- NARRATIVE: 段名 -->` 占位写工程正文；工程师复核修订。
3. **重新生成**：再次运行时，`<!-- GENERATED: 段id -->` 之间的数据段会用最新分析刷新，用户写的叙述内容被保留。
4. **导出**：`kidoc_generate.py` 产出 PDF / HTML / DOCX / ODT。

## 指令

一条命令生成完整脚手架（分析、框图、渲染、Markdown 全自动）：

```bash
python3 skills/kidoc/scripts/kidoc_scaffold.py \
  --project-dir /path/to/kicad/project \
  --type hdd \
  --output reports/HDD.md
```

导出 PDF（首次运行自动创建 `reports/.venv/`，仅 PDF/DOCX/ODT 需要 venv，HTML 零依赖）：

```bash
python3 skills/kidoc/scripts/kidoc_generate.py \
  --project-dir /path/to/kicad/project \
  --doc reports/HDD.md \
  --format pdf
```

**自定义报告**——用 `--spec` 指定任意段顺序（JSON 中 `type` 必须匹配已知段类型，`id` 为该段实例唯一键）：

```bash
python3 skills/kidoc/scripts/kidoc_scaffold.py \
  --project-dir . --spec my-report.json --output reports/custom.md
# 查看内置类型的默认 spec / 列出全部类型
python3 skills/kidoc/scripts/kidoc_spec.py --expand hdd
python3 skills/kidoc/scripts/kidoc_spec.py --list
```

**框图与渲染**（集成在图形引擎里，脚手架会自动调用）：

```bash
# 从分析 JSON 生成全部图（框图 + 原理图/PCB 渲染）
python3 skills/kidoc/scripts/kidoc_diagrams.py --analysis schematic.json --output reports/figures/
# 仅电源树 / 总线拓扑 / 架构图
python3 skills/kidoc/scripts/kidoc_diagrams.py --analysis schematic.json --power-tree --output diagrams/
```

PCB 层预设：`assembly-front/back`、`routing-front/back/all`、`power`。附加选项：`--highlight-nets`、`--crop-refs`、`--crop x,y,w,h`、`--mirror`、`--overlay annotations.json`。

直接编程访问：

```python
from figures.renderers import render_schematic, render_pcb
render_schematic('design.kicad_sch', 'output/', crop_refs=['R1', 'R2'], highlight_nets=['VCC'])
render_pcb('board.kicad_pcb', 'output/', preset_name='assembly-front')
```

## 示例

为一块电源板生成 HDD 并导出 PDF + DOCX：

1. 配置 `.kicad-happy.json`（`reports` 键下声明文档与品牌信息，用户级 `~/.kicad-happy.json` 与项目级级联合并）：

```jsonc
{
  "project": {"name": "Widget Board", "number": "HW-2024-042", "revision": "1.2", "company": "Acme Electronics", "market": "eu"},
  "reports": {
    "classification": "Company Confidential",
    "documents": [{"type": "hdd", "output": "HDD-{project}-{rev}", "formats": ["pdf", "docx"]}]
  }
}
```

2. 跑脚手架 → 读 `reports/HDD.md`，为每个 `*[...]*` 占位写正文（用上下文构建器取分段数据）：

```bash
python3 skills/kidoc/scripts/kidoc_narrative.py --analysis analysis/schematic.json --section power_design
```

3. 导出：`kidoc_generate.py --format pdf`，得到带封面、目录、矢量 SVG 的 PDF。

## 注意事项

- **环境**：Python 3.9+ 且需 `python3-venv`（PDF/DOCX/ODT）。原理图 SVG 渲染需 `.kicad_sch`（KiCad 6+）。
- **分析 JSON** 从源文件自动生成；若 `analysis/`（或配置路径）下已有预生成 JSON 则优先使用。生成的图放在 `reports/figures/` 便于 git 跟踪。
- **写叙述要讲“为什么”而非“是什么”**：交代工程权衡，引用具体元件值/料号，用定量语言（如“2.3ms 维持时间”而非“电容足够”），标注偏离 datasheet 之处，有 SPICE 结果时引用。文风按资深 EE 对同行讲解：先抛关键结论，再用分析数据支撑，段落 3-5 句，不重复表里已有数据。
- **SVG 嵌入 PDF**：优先用 svglib 矢量嵌入；个别 SVG 解析失败时回退到栅格。DOCX/ODT 一律栅格化到 300 DPI PNG。
- **先跑上游分析**：先运行 `kicad` 分析器，再视情况跑 `emc`/`spice`。脚手架在源文件存在时自动跑 `kicad` 和 `emc`，故通常只需手动预跑 SPICE。

## 互见

- 上游 `kicad` 分析产出原理图/PCB/热分析 JSON，被本技能脚手架消费；`emc` 产出 EMC 段 JSON；`spice` 仿真结果进入模拟设计段；`bom` 数据进入 BOM 汇总段。

---

本条采编自 aklofas/kicad-happy（MIT）。
