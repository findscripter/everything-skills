---
name: constant-time-analyzer
title: 密码学常量时间侧信道分析
description: 当编写或审计密码学代码（签名/加解密/密钥派生）、对秘密值做除法或秘密相关分支、或排查常量时间/时序侧信道问题时使用；用 ct_analyzer 反汇编分析多语言源码并定位泄密指令（DIV/分支/早退比较），产出问题清单与修复建议；不适用于非密码学/纯公开数据/不涉密的业务代码。触发词：常量时间、时序攻击、侧信道、constant-time、timing attack、side-channel、KyberSlash
domain: 安全/audit
triggers: [常量时间, 时序攻击, 侧信道, constant-time, timing attack, side-channel, KyberSlash, 秘密相关分支, 签名验证审计, 密钥派生]
tags: [security, audit, cryptography, constant-time, side-channel, timing-attack, static-analysis]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [ct_analyzer/analyzer.py, uv, gcc/clang, go, rustc, swiftc, javac/javap, kotlinc, ilspycmd, node, python, ruby]
requires: []
related: [zeroize-audit, c-cpp-security-review, binary-analysis-patterns, vulnerability-variant-analysis]
combines_with: [zeroize-audit, c-cpp-security-review, false-positive-check]
license: CC-BY-SA-4.0
source: trailofbits/skills
source_license: CC-BY-SA-4.0
---
## 何时使用

实现或审计密码学代码、且执行时间可能依赖秘密数据时使用。典型信号：

- 实现/审查 `sign`、`verify`、`encrypt`、`decrypt`、`derive_key` 等函数。
- 代码对私钥/明文/口令等秘密派生值使用 `/` 或 `%`（除法/取模有早退优化，时间随操作数变化）。
- 对秘密做分支判断、按秘密索引查表、用早退式 `memcmp` 比较秘密。
- 用户提到「常量时间 / 时序攻击 / 侧信道 / KyberSlash」。

**不该用边界（满足任一即跳过）：**

- 非密码学代码（业务逻辑、UI 等）。
- 处理纯公开数据，时序泄漏无意义。
- 不涉及秘密、密钥、认证令牌。
- 高层 API 调用，常量时间由底层库保证。

支持语言：C、C++、Go、Rust、Swift、Java、Kotlin、C#、PHP、JavaScript、TypeScript、Python、Ruby（按文件扩展名自动选择分析后端）。

## 步骤

1. 按源文件类型直接运行分析器，它会编译/反汇编到汇编或字节码并扫描危险指令。
2. 对原生编译语言（C/C++/Go/Rust/Swift）做跨架构与多优化级别测试，因为编译器可能在某档优化下才引入变量时间指令。
3. 逐条核对告警：**该指令的输入是否依赖秘密数据**——这是区分真/假阳性的唯一标准（工具无数据流分析，会标记一切潜在危险操作）。
4. 对每条真阳性按「快速参考」表选择修复手段，并记录你的判定理由。

## 指令

```bash
# 分析任意受支持文件类型
uv run {baseDir}/ct_analyzer/analyzer.py <source_file>

# 包含条件分支告警
uv run {baseDir}/ct_analyzer/analyzer.py --warnings <source_file>

# 仅过滤特定函数
uv run {baseDir}/ct_analyzer/analyzer.py --func 'sign|verify' <source_file>

# CI 用 JSON 输出
uv run {baseDir}/ct_analyzer/analyzer.py --json <source_file>

# 原生编译语言（C/C++/Go/Rust/Swift）：跨架构（推荐）
uv run {baseDir}/ct_analyzer/analyzer.py --arch x86_64 crypto.c
uv run {baseDir}/ct_analyzer/analyzer.py --arch arm64 crypto.c

# 多优化级别
uv run {baseDir}/ct_analyzer/analyzer.py --opt-level O0 crypto.c
uv run {baseDir}/ct_analyzer/analyzer.py --opt-level O3 crypto.c
```

VM 字节码语言（Java/Kotlin/C#）直接传源文件即可，分析的是 JVM/CIL 字节码而非 JIT 后的本机码，`--arch`、`--opt-level` 对其无效。Swift 编译为本机码，走汇编级分析并支持架构/优化级别开关。

**前置依赖（需在 PATH）：** C/C++/Go/Rust 需对应编译器；Swift 需 `swiftc`；Java 需 `javac`+`javap`；Kotlin 需 `kotlinc`+`javap`；C# 需 .NET SDK + `ilspycmd`（`dotnet tool install -g ilspycmd`）；PHP 需 VLD 扩展或 OPcache；JS/TS 需 Node.js；Python 需 Python 3.x；Ruby 需支持 `--dump=insns`。macOS 上 Homebrew 的 Java/.NET 为 keg-only，需手动加入 PATH。

**快速参考（问题→检测→修复）：**

| 问题 | 检测到的指令 | 修复 |
| --- | --- | --- |
| 对秘密做除法 | DIV、IDIV、SDIV、UDIV | Barrett 约简或乘以逆元 |
| 对秘密分支 | JE、JNE、BEQ、BNE | 常量时间选择（cmov、位掩码） |
| 秘密比较 | 早退式 memcmp | 用 `crypto/subtle` 或常量时间比较 |
| 弱随机数 | rand()、mt_rand、Math.random | 改用密码学安全 RNG |
| 按秘密索引查表 | 秘密索引的数组下标 | 位切片（bit-sliced）查表 |

## 示例

结果解读：`PASSED` 表示未检出变量时间操作；`FAILED` 给出危险指令，例如：

```text
[ERROR] SDIV
  Function: decompose_vulnerable
  Reason: SDIV has early termination optimization; execution time depends on operand values
```

假阳性 vs 真阳性判定：

```c
// 假阳性：除数是公开常量，非秘密
int num_blocks = data_len / 16;     // data_len 是长度而非内容

// 真阳性：除法涉及秘密派生值
int32_t q = secret_coef / GAMMA2;   // secret_coef 来自私钥
```

快速分诊表：操作数是编译期常量？→很可能假阳性。是公开参数（长度/计数）？→很可能假阳性。来自密钥/明文/秘密，或攻击者可影响其值？→**真阳性**。

## 注意事项

- **仅静态分析**：分析汇编/字节码，不观察运行时；无法检测缓存时序或微架构侧信道。
- **无数据流分析**：会标记所有危险操作而不论是否处理秘密，**必须人工复核**，否则误报率高。
- **编译器/运行时差异**：不同编译器、优化级别、运行时版本输出可能不同，故建议跨架构、跨优化级别多跑。
- 真实危害佐证：KyberSlash（2023，ML-KEM 除法指令导致密钥恢复）、Lucky Thirteen（2013，CBC 填充校验时序差异恢复明文）、RSA 早期实现因除法时序泄漏私钥比特。

## 互见

- 参考资料：Cryptocoding Guidelines（github.com/veorq/cryptocoding）、KyberSlash（kyberslash.cr.yp.to）、BearSSL Constant-Time（bearssl.org/constanttime.html）。
- 相关技能：code-reviewer（代码审计联动）、dependency-auditor（依赖侧安全审计）。

---
本条采编自 trailofbits/skills（CC-BY-SA-4.0）。
