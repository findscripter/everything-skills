---
name: dwarf-debug-format-expert
title: DWARF 调试格式专家
description: 当需要解析、校验或回答 DWARF (v3-v5) 调试信息，或编写/审阅解析 DWARF 数据的代码时使用；做 DWARF 标准答疑、用 dwarfdump/readelf/llvm-dwarfdump 提取与校验调试信息、产出可执行命令与解析代码；不适用于 DWARF v1/v2、纯 ELF 解析、运行时调试(gdb/lldb)、二进制逆向(Ghidra/IDA)或编译器生成问题；触发词：DWARF、调试信息、dwarfdump、llvm-dwarfdump、DIE、DW_TAG、libdwarf
domain: 研发/backend
triggers: [DWARF, 调试信息, dwarfdump, llvm-dwarfdump, readelf, DIE, DW_TAG, libdwarf, 调试格式, DWARF v5]
tags: [DWARF, 调试信息, ELF, 编译工具链, 逆向分析, 二进制]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [dwarfdump, llvm-dwarfdump, readelf, libdwarf, pyelftools, gimli]
requires: []
related: [gdb-debugging-cli, binary-analysis-patterns, c-language-pro, cpp-modern-pro]
combines_with: [gdb-debugging-cli, anti-reversing-techniques, c-cpp-security-review]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# DWARF 调试格式专家

为解析 DWARF 调试文件、理解 DWARF 标准（v3-v5）、校验调试信息完整性、以及编写或审阅与 DWARF 数据交互的代码提供专家能力。

## 何时使用

- 从编译产物中理解或解析 DWARF 调试信息。
- 回答 DWARF 标准（v3、v4、v5）相关问题，或给出某个 DWARF 特性的示例。
- 编写、修改或审阅与 DWARF 数据交互的代码。
- 用 `dwarfdump` / `readelf` 提取调试信息，或用 `llvm-dwarfdump --verify` 校验完整性。
- 使用 DWARF 解析库（libdwarf、pyelftools、gimli 等）。

**不该用（负边界）**：

- **DWARF v1/v2**：能力仅覆盖 v3/v4/v5。
- **纯 ELF 解析**：不需要 DWARF 数据时用标准 ELF 工具即可。
- **运行时调试**：调试可执行代码/运行时行为请用 gdb、lldb 等专用调试器。
- **二进制逆向**：除非专门分析 DWARF 段，否则用 Ghidra、IDA 等逆向工具。
- **编译器问题**：DWARF 生成缺陷与具体编译器相关，不在本技能范围。

## 步骤 / 指令

按需求选择路径：

```
┌─ 要校验 DWARF 数据完整性？
│   └─ 用 `llvm-dwarfdump --verify`（见下「校验工作流」）
├─ 要回答 DWARF 标准问题？
│   └─ 搜 dwarfstd.org，或参考 LLVM / libdwarf 源码
├─ 只需简单段转储或一般 ELF 信息？
│   └─ 用 `readelf`
├─ 要解析、搜索或转储 DWARF DIE 节点？
│   └─ 用 `dwarfdump`（比 readelf 更擅长复杂 DWARF，多数解析任务首选）
└─ 要写、改或审阅与 DWARF 交互的代码？
    └─ 参考下「编写代码」与权威源
```

**权威来源**（需要精确标准时查证，不要凭记忆）：

1. **官方 DWARF 标准 dwarfstd.org**：用 web 搜索定位规范具体章节，如查询 `DWARF5 DW_TAG_subprogram attributes site:dwarfstd.org`。
2. **LLVM 实现** `llvm/lib/DebugInfo/DWARF/`，可靠的参考实现，关键文件：
   - `DWARFDie.cpp` —— DIE 处理与属性访问
   - `DWARFUnit.cpp` —— 编译单元解析
   - `DWARFDebugLine.cpp` —— 行号信息
   - `DWARFVerifier.cpp` —— 校验逻辑
3. **libdwarf**：github.com/davea42/libdwarf-code，参考 C 实现，对 DWARF 数据结构处理详尽。

## 示例

**结构校验**（编译单元、DIE 关系、地址范围）：

```bash
# 校验 DWARF 结构
llvm-dwarfdump --verify <binary>

# 带完整错误输出与摘要
llvm-dwarfdump --verify --error-display=full <binary>

# 机读 JSON 错误摘要
llvm-dwarfdump --verify --verify-json=errors.json <binary>
```

**质量指标**（以 JSON 输出调试信息质量，便于跨编译器版本/优化级别对比）：

```bash
llvm-dwarfdump --statistics <binary>
```

**常见校验场景**：

- **编译后**：分发前确认二进制含合法 DWARF。
- **对比构建**：用 `--statistics` 检测调试信息质量回退。
- **排查调试器**：定位导致调试器异常的畸形 DWARF。
- **DWARF 工具开发**：用已知正确的二进制验证解析器输出。

## 注意事项

- 多数 DWARF 专项解析优先 `dwarfdump`，它比 `readelf` 更能处理与展示复杂 DWARF 信息；`readelf` 用于一般 ELF 信息或简单段转储。
- 编写解析代码时，既可从零解析 DWARF 段，也可借助 libdwarf / pyelftools / gimli 等库；涉及具体 tag/attribute 语义时务必回查权威源核对。
- 仅在任务明确落在上述范围内时使用本技能。
- 输出不能替代环境相关的验证、测试或专家评审。
- 若缺少必要输入、权限、安全边界或成功判据，先停下来确认再继续。

## 互见

- related：与 ELF/二进制分析、编译工具链相关技能横向相关。
- combines_with：可与逆向分析、崩溃栈解析类技能组合，用 DWARF 还原源码级符号与行号。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
