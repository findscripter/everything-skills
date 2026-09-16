---
name: hardware-doc-generator
title: 硬件工程文档生成
description: 当需要从 KiCad 工程自动生成硬件设计文档（HDD/CE技术文件/ICD/设计评审/制造移交包等）时使用；做的事：自动跑原理图/PCB/EMC/热分析，渲染原理图与 PCB SVG、生成框图，产出 Markdown 脚手架并导出 PDF/HTML/DOCX/ODT；不适用于非 KiCad6+ 工程、纯电路仿真本身或叙述性工程文字代写（需 Agent/人工撰写）。触发词：硬件文档生成、生成报告、HDD、CE技术文件、ICD、设计评审包、制造移交包、渲染原理图、渲染PCB、框图、generate documentation、HDD、CE technical file、ICD、design review、render schematic、block diagram。
domain: 领域/hardware
triggers: [硬件文档生成, 生成报告, HDD, CE技术文件, ICD, 设计评审包, 制造移交包, 渲染原理图, 渲染PCB, 框图, generate documentation, CE technical file, design review package, render schematic, block diagram]
tags: [hardware, kicad, documentation, pcb, schematic, pdf, emc, report-generation]
level: 进阶
status: deprecated
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, kicad, svglib, python3-venv]
requires: []
related: [kicad-design-reviewer, emc-precompliance-analyzer, pcb-bom-manager, spice-circuit-simulator]
combines_with: [kicad-design-reviewer, emc-precompliance-analyzer, markdown-to-docx]
license: MIT
source: aklofas/kicad-happy
source_license: MIT
supersedes: []
---
> **Upstream status:** The original upstream skill ID for this encyclopedia entry was not found in the current upstream repository tree after a thorough name/alias search (2026-09-16 cleanup). Entry kept for graph stability; `status: deprecated`.
## 何时使用

当你有一个 **KiCad 6+ 工程**（`.kicad_sch` / `.kicad_pcb`），需要产出专业硬件工程文档时使用。

**不该用的边界：**
- 渲染器仅支持 KiCad 6+ 格式。
- 不负责跑 SPICE 仿真本身。
- 叙述性工程正文需 Agent 或人工撰写。

## 步骤

1. 生成脚手架：`kidoc_scaffold.py`
2. 填写叙述：为每个 `<!-- NARRATIVE -->` 占位写工程正文
3. 重新生成时保留用户叙述、刷新 GENERATED 段
4. 导出：`kidoc_generate.py` 产出 PDF / HTML / DOCX / ODT

## 指令

```bash
python3 skills/kidoc/scripts/kidoc_scaffold.py --project-dir /path/to/kicad/project --type hdd --output reports/HDD.md
python3 skills/kidoc/scripts/kidoc_generate.py --project-dir /path/to/kicad/project --doc reports/HDD.md --format pdf
```

## 示例

为一块电源板生成 HDD 并导出 PDF：跑脚手架 → 填叙述 → 导出。

## 注意事项

- Python 3.9+ 且需 `python3-venv`（PDF/DOCX/ODT）。
- 写叙述要讲“为什么”而非“是什么”。

## 互见

- related：`kicad-design-reviewer`、`emc-precompliance-analyzer`、`pcb-bom-manager`

---

本条采编自 aklofas/kicad-happy（MIT）。
