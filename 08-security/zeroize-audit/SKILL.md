---
name: zeroize-audit
title: 敏感数据内存清零审计（zeroize-audit）
description: 当审计 C/C++/Rust 代码中密钥、密码、令牌等敏感数据的内存清零（zeroize）是否缺失、或被编译器优化（死存储消除/DSE）删除时使用；做基于源码+LLVM IR/汇编证据的清零审计并产出 JSON+Markdown 报告与可验证 PoC；不适用于无安全焦点的常规代码评审、性能优化或不含可识别密钥的代码。触发词：zeroize、内存清零、敏感数据擦除、explicit_bzero、memset 被优化掉、dead-store elimination、secret wipe、密钥清零审计。
domain: 安全/audit
triggers: [zeroize, 内存清零, 敏感数据擦除, explicit_bzero, memset 被优化掉, dead-store elimination, secret wipe, 密钥清零审计]
tags: [security, audit, zeroize, cryptography, c, cpp, rust, llvm-ir, memory-safety, dead-store-elimination]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [clang, uvx/uv, Serena MCP, cargo +nightly, LLVM IR/MIR, Read, Grep, Glob, Bash]
requires: []
related: [constant-time-analyzer, c-cpp-security-review, binary-analysis-patterns, vulnerability-variant-analysis]
combines_with: [constant-time-analyzer, c-cpp-security-review, false-positive-check]
license: CC-BY-SA-4.0
source: trailofbits/skills
source_license: CC-BY-SA-4.0
---
## 何时使用

适用：
- 审计加密实现（密钥、种子、nonce、密文中间态）的内存清零；
- 审查认证系统（密码、令牌、会话数据）与处理 PII/敏感凭据的代码；
- 验证安全关键代码库的「擦除是否落到所有控制流路径」「擦除是否被编译器优化删除」；
- 排查敏感数据在栈/寄存器中的残留（内存安全角度）。

不该用（负边界）：
- 无安全焦点的常规代码评审；
- 与安全擦除无关的性能优化或重构；
- 代码中不存在可识别的密钥/敏感值。

核心约束：对目标代码库**只读**（不修改被审代码，仅向临时工作目录写分析产物）；`OPTIMIZED_AWAY_ZEROIZE` 等「被优化掉」结论**必须**有编译器 IR/asm 证据，禁止仅凭源码下结论。

## 步骤

整体两阶段（详见源 `references/detection-strategy.md`，由 8 阶段 11 个 agent 编排）：

阶段一（源码，步骤 1–6，需源码 + compile DB）产出：`MISSING_SOURCE_ZEROIZE`（源码无清零）、`PARTIAL_WIPE`（size 错误/擦除不完整）、`NOT_ON_ALL_PATHS`（部分路径漏擦，启发式）、`SECRET_COPY`（密钥被复制却未跟踪清零，建议配 MCP）、`INSECURE_HEAP_ALLOC`（密钥用了 malloc 而非 secure_malloc）。

阶段二（编译器，步骤 7–12，需 clang + IR/ASM 工具）产出：`OPTIMIZED_AWAY_ZEROIZE`（清零被编译器删除，必须 IR diff）、`STACK_RETENTION`*、`REGISTER_SPILL`*、`LOOP_UNROLLED_INCOMPLETE`†、`MISSING_ON_ERROR_PATH`‡、`NOT_DOMINATING_EXITS`‡。
\* 需 `enable_asm=true`（默认开）；† 需 `enable_semantic_ir=true`；‡ 需 `enable_cfg=true`。

关键输入：`path`（仓库根，必填）；C/C++ 需 `compile_commands.json`（`compile_db`），Rust 需 `Cargo.toml`（`cargo_manifest`），二者至少一个；`opt_levels` 默认 `["O0","O1","O2"]`（O1 是诊断级——清零若在 O1 消失即简单 DSE，O2 抓更激进的消除）；`mcp_mode` 取 `off|prefer|require`。

前置（缺失即 fail fast）：C/C++ 需 `clang` 在 PATH、`compile_commands.json` 可用；Rust 需 `cargo check` 通过、`cargo +nightly`（出 MIR/LLVM IR）、`uv` 在 PATH。Serena MCP（`uvx`）在 `mcp_mode=prefer` 时可缺，缺失时按下文降级；`mcp_mode=require` 且 MCP 不可达则**停止运行**，不输出部分结论。

## 指令

认可的清零 API（其余视为「未清零」）：
- C/C++：`explicit_bzero`、`memset_s`、`SecureZeroMemory`、`OPENSSL_cleanse`、`sodium_memzero`、volatile 擦除循环；IR 层面认 `llvm.memset`（volatile 标志）、volatile store、不可消除的擦除调用。
- Rust：`zeroize::Zeroize` trait 的 `zeroize()`、`Zeroizing<T>` 包装、`ZeroizeOnDrop` derive。

修复优先级（从高到低）：
1. `explicit_bzero` / `SecureZeroMemory` / `sodium_memzero` / `OPENSSL_cleanse` / Rust `zeroize::Zeroize`；
2. `memset_s`（有 C11 时）；
3. volatile 擦除循环 + 编译器屏障 `asm volatile("" ::: "memory")`；
4. 后端强制清零（若工具链提供）。

置信度门槛（confirmed 需 ≥2 个独立信号；1 个为 likely；仅名字匹配为 needs_review）。信号包括：名字/类型匹配、显式注解、IR/ASM/CFG 证据、MCP 交叉引用、PoC 验证。硬性证据要求（不可协商）：
- `OPTIMIZED_AWAY_ZEROIZE` — 必须有 IR diff 证明清零在 O0 存在、O1 或 O2 消失；
- `STACK_RETENTION` — 必须有汇编片段显示 `ret` 处栈上仍有密钥字节；
- `REGISTER_SPILL` — 必须有汇编片段显示 spill 指令。

MCP 降级：`mcp_mode=prefer` 且 MCP 不可用时，`SECRET_COPY`、`MISSING_ON_ERROR_PATH`、`NOT_DOMINATING_EXITS` 降为 `needs_review`（除非有 2+ 个非 MCP 强证据）。

## 示例

最终 `findings.json` 中单条 Finding（节选源 schema）：

```json
{
  "id": "ZA-0001",
  "category": "OPTIMIZED_AWAY_ZEROIZE",
  "severity": "high",
  "confidence": "confirmed",
  "file": "src/crypto.c",
  "line": 42,
  "symbol": "key_buf",
  "evidence": "volatile store count: O0=32, O2=0 — wipe eliminated by DSE",
  "suggested_fix": "Replace memset with explicit_bzero or add compiler_fence(SeqCst) after the wipe",
  "poc": { "file": "generated_pocs/ZA-0001.c", "compile_opt": "-O2", "validated": true, "validation_result": "exploitable" }
}
```

每次运行产出两份：`final-report.md`（人读，含执行摘要、敏感对象清单、按严重度/置信度分组的发现及证据、覆盖率附录）与 `findings.json`（机读，符合源 `schemas/output.json`）。

## 注意事项

- 每条发现都用「定制 PoC」验证：编译+运行+核验该 PoC 确实证明了所声称的缺陷。Exit 0（可利用）且已核验是强信号，可把 likely 升为 confirmed；Exit 1（不可利用）降级为 low（信息性，保留在报告）；核验失败/编译失败不改置信度但记入证据。
- 必须拒绝的合理化借口（出现时保留发现并在 `evidence` 记录被尝试覆盖）：「编译器不会优化掉」（无 IR/ASM 证据不得压制 `OPTIMIZED_AWAY_ZEROIZE`）；「这是热点路径」（先基准测试，勿用安全换性能）；「栈上密钥会自动清理」（栈帧可能残留，需汇编证明）；「memset 就够了」（标准 memset 可被优化掉，须升级为认可的擦除 API）；「只短暂持有」（时长无关，离开作用域前清零）；「这不算真密钥」（命中启发式就审，未经 config 显式排除前按敏感处理）；「以后再修」（照样出发现，不延后/不压制）。
- Rust 的 PoC 仅支持 `MISSING_SOURCE_ZEROIZE`、`SECRET_COPY`、`PARTIAL_WIPE` 三类，其余类别 `poc_supported=false`；AArch64 汇编分析为实验性，结论需人工复核。

## 互见

- code-reviewer：通用代码评审，不含本技能的安全擦除/编译器证据焦点，可作为前置粗筛。
- dependency-auditor：审计依赖供应链安全，与本技能的源码内存清零审计互补。

---
本条采编自 trailofbits/skills（CC-BY-SA-4.0）。
