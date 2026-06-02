---
name: c-cpp-security-review
title: C/C++ 内存安全审查
description: 当审计原生 C/C++ 应用（守护进程/服务/解析器）的内存安全与漏洞时使用；做一次性 sink 清单 + 按 bug class 聚焦分析，产出含数据流/可达性/缓解措施验证的发现项与去重分级报告；不适用于内核驱动/模块、托管语言（Java/C#/Python/Go/Rust）、无 libc 的裸机代码；触发词：C/C++ 安全审查、内存安全、缓冲区溢出、buffer overflow、整数溢出、use-after-free、UAF、释放后使用、竞态条件、race condition、格式化字符串、memory corruption、appsec、daemon 审计
domain: 安全/appsec
triggers: [C/C++ 安全审查, 内存安全, 缓冲区溢出, buffer overflow, 整数溢出, use-after-free, UAF, 释放后使用, 竞态条件, race condition, 格式化字符串, memory corruption, appsec, daemon 审计]
tags: [security, appsec, c, cpp, memory-safety, code-review, vulnerability, static-analysis]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Grep, Read, Glob, Bash, Write]
requires: []
related: [zeroize-audit, constant-time-analyzer, binary-analysis-patterns, codeql-scanner]
combines_with: [codeql-scanner, vulnerability-variant-analysis, false-positive-check]
license: CC-BY-SA-4.0
source: trailofbits/skills
source_license: CC-BY-SA-4.0
---
## 何时使用

适用于对原生 C/C++ 代码做安全导向的人工审查，目标是内存破坏类与平台相关漏洞：缓冲区溢出、整数溢出/回绕、use-after-free、未初始化数据、空指针解引用、竞态条件、类型混淆、格式化字符串，以及 Linux/macOS 守护进程与 Windows 用户态服务的特有问题。典型场景：审计网络服务/解析器/IPC 端点，或在一个代码子树内系统性排查上述 bug class。

不该用的边界（命中任一就停下，换别的方法）：
- 内核驱动/模块（Linux、Windows、macOS）——攻击面与原语不同。
- 托管语言（Java、C#、Python、Go、Rust）——内存安全模型不同。
- 无 libc 的嵌入式/裸机代码。

## 步骤

先固定两个独立的范围，全程不要混淆：
- finding_scope_root：用户要求审计的子树。发现项的漏洞位置必须落在此子树内。
- context_roots：只读上下文（默认 `.`），可读它来核对调用者、包装函数、构建标志、缓解措施与威胁模型，但不得在其外提交发现项。

1. 定威胁模型与参数。威胁模型取 `REMOTE` / `LOCAL_UNPRIVILEGED` / `BOTH`，它决定哪些 pass 在范围内（如 privilege-drop、envvar 在 `REMOTE` 下跳过；`LOCAL_UNPRIVILEGED` 下环境变量视为攻击者可控）。确定严重度过滤档（all/medium/high）——注意：**过滤档只影响最终报告呈现，不决定是否记录发现项；先记录所有已确认 bug，分级留到最后**。
2. 探测语言/平台标志（在 finding_scope_root 内）：是否含 C++ 源（`*.cpp/*.cxx/*.cc/*.hpp/*.hh`）→ `is_cpp`；是否 include `pthread/signal/sys/socket/unistd` 等 → `is_posix`；是否 include `windows/winsock/ntdef` 等 → `is_windows`。据此启用对应 bug class 集合。
3. 写一份上下文摘要：用途、范围、入口点（不可信数据从何进入：网络/文件/CLI/IPC）、信任边界（沙箱 vs 可信对端 vs 任意远端）、已有加固（fuzzing 语料、sanitizer、特权分离）。这是后续判定可达性与影响的基线。
4. 建立 sink 清单（每次审查只建一次）。跑下面的 Grep，把命中合并成一个工作集，记录 `path:line`、被调函数名与一行上下文。**不要在后续每个 pass 里重复 grep**。
5. 按 bug class 跑聚焦 pass。每个 pass 从 sink 清单里筛出它关心的被调函数，`Read` 包围函数，追踪该 pass 特有的不变量（见下方各类要点）。
6. 对每个确认的 bug 写一份发现项文件（模板见示例），必须含数据流（源/汇/校验）、可达性调用链、影响、已检查的缓解措施、修复建议。
7. 去重与定级。同一 `(path, line)` 被多 pass 命中时按优先级取最具体的一类；最后对每个主发现项给出误报判定与（存活项的）严重度。

## 指令

统一 sink 清单 grep（每个目标各跑一次，后续 pass 不再重复）：

```
Grep: pattern="\b(memcpy|memmove|memset|bcopy|bzero)\s*\("
Grep: pattern="\b(strcpy|strncpy|stpcpy|stpncpy|strlcpy|strcat|strncat|strlcat|strdup|strndup)\s*\("
Grep: pattern="\b(sprintf|vsprintf|snprintf|vsnprintf|asprintf|vasprintf|fprintf|dprintf|printf|vprintf|syslog|vsyslog)\s*\("
Grep: pattern="\b(scanf|sscanf|fscanf|vscanf|vsscanf|vfscanf)\s*\("
Grep: pattern="\b(gets|gets_s|fgets|read|pread|recv|recvfrom)\s*\("
Grep: pattern="\b(malloc|calloc|realloc|reallocarray|alloca|aligned_alloc|posix_memalign)\s*\("
Grep: pattern="\b(strtok|strtok_r|mbstowcs|wcstombs|wcsncpy|wcsncat|wcslen|tmpnam|tempnam|mktemp|putenv)\s*\("
```

缓冲区写入类 pass（按此顺序，前面的 pass 先"吃掉"明显案例）：
- BAN 禁用函数：生产代码裸调 `gets/strcpy/strcat/sprintf/vsprintf/tmpnam/mktemp/strtok(非_r)/rand/alloca/putenv` 即为问题，无需数据流；排除注释/字符串/测试中的字面量、被本地安全宏/包装覆盖、`#ifdef` 守护到非审计平台的情况。
- FMT 格式化字符串：非字面量格式串（`printf(user_input)`）、`%n`、类型/宽度不匹配、缺 `__attribute__((format))` 的变参包装；排除编译期字面量、已有 format 注解的情况。
- SNPRINTF 返回值误用：`buf[n]='\0'`（n 为返回值可能≥size）、`ptr += snprintf(...)` 未 clamp、`size - snprintf(...)` 可能为负。
- OVERLAP 缓冲区重叠：源/汇同缓冲区（`sprintf(buf,"%s",buf)`、`memcpy(buf+k,buf,n)`）；`memmove` 安全可跳过。
- MEMCPYSZ 负数/回绕尺寸进 `mem*`：尺寸来自可能为负的有符号运算（`end-start`）或无符号下溢回绕到 `SIZE_MAX`、syscall 返回 `-1` 直接 cast。
- STRLENCPY 分配差一：`malloc(strlen(s))`+`strcpy` 漏掉终止符字节；`+1` 或 `strdup` 则安全。
- STRNCPY 不终止：`strncpy(buf,src,sizeof(buf))` 后无 `buf[sizeof(buf)-1]='\0'`。
- STRNCAT 尺寸误用：第三参用了 `sizeof(buf)` 而非 `sizeof(buf)-strlen(buf)-1`。
- SCANFUNINIT：目标未初始化 + 未检查 `scanf` 返回值 + 后续用于安全决策。
- FLEX 柔性数组：`data[0]`/`data[1]` 末尾成员 + `malloc(sizeof(struct))` 未用 `offsetof`。
- STR 编码/多字节：字节数 vs 字符数混淆、locale 相关大小写映射用于安全比较、信任边界缺 UTF-8/16 校验。
- BOF 兜底空间安全（最后跑）：循环边界差一（`<=`）、无界数组索引、`malloc(n*sizeof(T))` 乘法溢出、跨缓冲区 `memcmp/memcpy`。

去重优先级（同一 `(path,line)` 取更高者）：SNPRINTF > BAN > UNSAFESTD；STRNCPY > STRLENCPY > BOF；STRNCAT > BOF；OVERLAP > MEMCPYSZ > BOF；FMT > BAN；STR > STRNCPY；其余并列时 BOF 兜底。

其他 bug class 集合（据语言/平台标志启用）：对象生命周期（UNINIT/NULL/UAF/LEAK）、算术与类型（PREC/INT/TYPE/UB）、系统调用返回值（ERR，POSIX 下加 NEGRET/ERRNO/EINTR/socket 类）、并发（RACE/THREAD/SIGNAL/SPINLOCK）、环境状态（FS/ACCESS/TIME/DOS，本地威胁模型下加 PRIVDROP/ENVVAR）；C++ 专项（INIT/VIRT/SPTR/MOVE/ITER/LAMBDA/EXCEPT）；Windows 专项（CreateProcess/DLL planting/named pipe/token 权限等）。

需要拒绝的合理化借口：「路径不可达」→ 用调用链证明，否则照报；「ASLR/DEP 挡住了」→ 缓解措施本身是绕过目标；「只崩溃不可利用」→ 内存破坏通常可控；「别处校验过」→ 去核实校验确实存在；「环境可信」→ `LOCAL_UNPRIVILEGED` 下环境变量攻击者可控。

## 示例

确认 bug 后写发现项文件（建议 `findings/<PREFIX>-<NNN>.md`），固定字段与七个小节：

```markdown
---
id: BOF-001
bug_class: buffer-overflow
title: parse_header 缺少边界检查
location: src/net/parse.c:142
function: parse_header
confidence: High
---

## Description
什么不变量被破坏、攻击者控制什么。

## Code
```c
if (len > 0) {
    memcpy(buf, src, len);   // buf 仅 64 字节，len 来自网络头
}
```

## Data flow
- 源：recv_request() 中 HTTP Content-Length 头（src/net/recv.c:88）
- 汇：memcpy（src/net/parse.c:142）
- 校验：无，len 仅受 uint32_t 类型限制

## Reachability trace
recv_request → dispatch → parse_header → memcpy

## Impact
栈缓冲区溢出，攻击者控制 len 与源字节。

## Mitigations checked
- 栈 canary：有（-fstack-protector-strong），但写入足够多即可绕过
- ASLR：启用，需绕过
- FORTIFY_SOURCE：此处未生效

## Recommendation
memcpy 前校验 len <= sizeof(buf)，或改用有界拷贝原语。
```

格式硬约束（去重依赖）：`location` 只能是一个 `path:line`（仓库相对路径，无 markdown 链接、不列多个）；`function` 只能是一个函数名；同一 bug 模式出现在三个函数就写三份文件，不要合并。

## 注意事项

- sink 清单只建一次，后续 pass 复用，重复 grep 浪费且无新信息。
- 严重度过滤档不用来过滤是否记录发现项——先记录所有已确认 bug，分级与误报判定放到最后统一做，避免"猜它不够高危就丢弃"导致漏报。
- 用 `Glob` 预检文件存在再 `Read`；用 `find`（无匹配不报错）而非裸 `ls` glob 做预检，zsh 下未匹配的 glob 会在 `2>/dev/null` 生效前终止整条复合命令。
- 守住分配的 bug class：同一根因不要硬塞进自己的类——攻击者可控 VLA 栈耗尽可能是 BOF/DOS/UB，但不是 UNINIT（除非确有未初始化数据被使用）。
- 一处漏洞位置一份发现项，宁可少而高信号；"高信号"指对 bug 存在性的把握，不是对严重度的猜测。
- 范围越窄，若禁止读外部上下文，可达性置信度会更低——尽量保留 context_roots 以核对调用者与构建设置。

## 互见

源技能采用"编排器 + 并行 worker + 去重判官 + 误报/严重度判官"的多 agent 架构并生成 SARIF；本条已适配为单 agent 可直接执行的审查流程，保留其威胁模型、bug class 体系、sink 清单方法与去重/定级判据。需要先排查依赖项已知漏洞见 dependency-auditor；需要更通用的正确性/可维护性代码审查（非安全专项）见 code-reviewer。

本条采编自 trailofbits/skills（CC-BY-SA-4.0），方法学基于 Trail of Bits Testing Handbook（appsec.guide）。
