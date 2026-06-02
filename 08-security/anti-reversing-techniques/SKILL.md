---
name: anti-reversing-techniques
title: 反逆向技术分析
description: 当在授权范围内做恶意软件分析、加壳/混淆样本逆向、CTF 反调试实现或检测虚拟化环境时使用；做识别保护层（反调试/反VM/混淆/加壳/虚拟化）并产出补丁地址、Hook 点、绕过命令与检测脚本；不适用于盗版破解、未授权访问或任何无书面授权的规避；触发词：反逆向、反调试、anti-debug、反VM、anti-VM、脱壳、unpacking、代码混淆、obfuscation、IsDebuggerPresent、RDTSC、VMProtect
domain: 安全/appsec
triggers: [反逆向, 反调试, anti-debug, 反VM, anti-VM, 脱壳, unpacking, 代码混淆, obfuscation, IsDebuggerPresent, RDTSC, VMProtect, ScyllaHide, ptrace 检测, opaque predicate]
tags: [security, reverse-engineering, anti-debugging, anti-vm, obfuscation, unpacking, malware-analysis, ctf]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [x64dbg, ScyllaHide, TitanHide, Scylla, IDA, IDAPython, Ghidra, GDB, FLOSS, HashDB, angr, Triton, D-810, SATURN, NoVmp, UPX, Detect-It-Easy, ROPgadget]
requires: []
related: [binary-analysis-patterns, firmware-reverse-analyst, yara-rule-authoring, constant-time-analyzer]
combines_with: [binary-analysis-patterns, yara-rule-authoring, gdb-debugging-cli]
license: MIT
source: wshobson/agents
source_license: MIT
---
> **仅限授权使用**：本条含双重用途技术。动手前必须：1) 确认拥有软件所有者书面许可，或处于合法场景（CTF、授权渗透、恶意软件分析、学术研究）；2) 明确并不越出授权范围；3) 知悉未授权规避软件保护可能违反 CFAA / DMCA 反规避条款等法律。**严禁**用于盗版、未授权访问或恶意目的。

# 反逆向技术分析

理解授权分析中遇到的保护机制，并据此绕过它们以完成合法分析。输入：二进制/样本路径、平台（Windows x86/x64、Linux、macOS、ARM——决定哪些检查生效）、目标（动态分析绕过 / 识别保护类型 / 写检测代码 / CTF 实现）。产出：命名的保护技术及其在二进制中的位置、具体补丁地址/Hook 点/工具命令、分层结构化报告、Python/IDAPython 脚本或 GDB 命令序列。

## 何时使用

- 分析恶意软件的反分析/规避逻辑，需绕过其反调试、反 VM 检查。
- 逆向加壳/混淆/虚拟化保护的二进制（UPX、Themida、VMProtect 等）。
- 为 CTF 题目实现反调试保护，或构建需检测虚拟化环境的安全研究工具。

**不该用：**
- 软件盗版、破解授权校验、未授权访问——无书面授权一律不做。
- 纯静态/动态分析流程本身（属基础逆向，不是「反-反逆向」对抗）。
- ARM/嵌入式上照搬 x86 检查（RDTSC/CPUID/PEB 仅 x86/Windows，需换平台 API）。

## 步骤

通用绕过四步法：1) **识别保护**——判定用了哪种技术；2) **定位检查**——在二进制中找到保护代码；3) **打补丁或 Hook**——让检查永远通过；4) **记录**——留存已绕过的保护清单。配合合适工具（ScyllaHide、x64dbg 插件等）。

按类别展开：

1. **反调试（Windows）**：API 检测（`IsDebuggerPresent`/`CheckRemoteDebuggerPresent`/`NtQueryInformationProcess` 的 `ProcessDebugPort=7`、`ProcessDebugFlags=0x1F`）、PEB 检测（`BeingDebugged`、`NtGlobalFlag&0x70`、堆 flags）、时间检测（RDTSC/QPC/GetTickCount）、异常检测（SEH/VEH 吞 INT3）。
2. **反调试（Linux）**：`ptrace(PTRACE_TRACEME)`、`/proc/self/status` 的 `TracerPid`、父进程名检查。
3. **反 VM**：CPUID hypervisor 位（ECX bit31）与 0x40000000 厂商串、MAC 前缀、注册表/驱动文件/进程指纹、CPUID 引发 VM-exit 的时间异常。
4. **混淆**：控制流平坦化、不透明谓词、字符串/API 加密与哈希、指令级替换/花指令。
5. **加壳与虚拟化**（进阶，见 references）：脱壳找 OEP + 修复 IAT；devirtualization 提取 handler 表与字节码语义。

## 指令

**Windows API/PEB 检测（识别特征）：**
```c
if (IsDebuggerPresent()) exit(1);
// NtQueryInformationProcess: ProcessDebugPort(7) 非 0 即被调试
// ProcessDebugFlags(0x1F)==0 即被调试
#ifdef _WIN64
    PPEB peb = (PPEB)__readgsqword(0x60);   // x86: __readfsdword(0x30)
#endif
if (peb->BeingDebugged) exit(1);
if (peb->NtGlobalFlag & 0x70) exit(1);      // 0x70 三标志置位=被调试
```
绕过：x64dbg 用 ScyllaHide 插件自动处理；手动强制 `IsDebuggerPresent` 返回 0、把 `PEB.BeingDebugged`(+2) 置 0、清 `NtGlobalFlag`(x64 +0xBC)、Hook `NtQueryInformationProcess`；IDA：`ida_bytes.patch_byte(check_addr, 0x90)`。

**时间检测扫描器（Python，交叉引用偏移到 IDA/Ghidra）：**
```python
PATTERNS = {
    "RDTSC":  rb"\x0f\x31", "RDTSCP": rb"\x0f\x01\xf9",
    "GetTickCount": rb"GetTickCount\x00",
    "QueryPerfCounter": rb"QueryPerformanceCounter\x00",
}
data = open(path, "rb").read()
for name, pat in PATTERNS.items():
    hits = [hex(m.start()) for m in re.finditer(re.escape(pat), data)]
    if hits: print(f"[{name}] {', '.join(hits[:5])}")
```
绕过：用硬件断点（无 INT3 开销）、NOP 比较+条件跳转、Hook 时间 API 返回恒定值。异常检测：x64dbg 在 Options→Exceptions 添加 `0x80000003`（EXCEPTION_BREAKPOINT）设为「Pass exception to program」。

**Linux ptrace 绕过：**
```bash
# hook.c: long ptrace(int request, ...) { return 0; }
gcc -shared -fPIC -o hook.so hook.c
LD_PRELOAD=./hook.so ./target
```
```gdb
catch syscall ptrace
commands
  silent
  set $rax = 0
  continue
end
# 检查后清 ZF：set $eflags = $eflags & ~0x40
set follow-fork-mode child
set detach-on-fork off
```

**反 VM 识别要点：** CPUID(1) ECX bit31=hypervisor；CPUID(0x40000000) 厂商串 `VMwareVMware`/`Microsoft Hv`/`KVMKVMKVM`/`VBoxVBoxVBox`/`XenVMMXenVMM`；MAC 前缀 VMware `00:0C:29`/`00:50:56`、VBox `08:00:27`、Hyper-V `00:15:5D`；驱动文件 `vmmouse.sys`/`VBoxMouse.sys`。绕过：裸机分析，或硬化 VM（删客户机工具、随机 MAC、删伪影文件），或用 FLARE-VM/REMnux。

**混淆分析：** 字符串解密用 `floss malware.exe`；IDAPython XOR 解密：
```python
def decrypt_xor(ea, length, key):
    return "".join(chr(ida_bytes.get_byte(ea+i) ^ key) for i in range(length))
```
不透明谓词用符号执行（angr/Triton）识别恒真/恒假表达式并裁剪；API 哈希用 HashDB 插件还原；控制流平坦化用 D-810/SATURN 重建 CFG。工具速查：反调试绕过 ScyllaHide/TitanHide；脱壳 x64dbg+Scylla；去混淆 D-810/SATURN/miasm；VM 分析 VMAttack/NoVmp；符号执行 angr/Triton。

## 示例

**脱壳（ESP trick，x64dbg）：** 载入加壳样本→运行到入口 stub→`PUSHAD` 后右键 ESP 值「Follow in Dump」→在 `[ESP]` 设硬件访问断点→F9 运行（`POPAD` 后栈恢复即断）→找到跳向 OEP 的远跳→用 Scylla 插件 IAT Autosearch→Get Imports→Dump→Fix。标准 UPX 直接 `upx -d packed.exe -o unpacked.exe`。

**VMProtect devirtualization：** 识别 `.vmp0/.vmp1` 段与典型派发器 `movzx eax, byte ptr [esi]; jmp [eax*4+handler_table]`；x64dbg trace log 记录每次 handler 地址；建立 `vm_opcode→native 语义` 表；用 NoVmp（VMProtect 3 开源去虚拟化）/SATURN/Triton 提升为 IR 后重建 CFG。

## 注意事项

- **仅限授权**：每次动手前核对授权范围，越界即停。绝不用于盗版/未授权访问。
- **跨平台失效**：RDTSC/CPUID 仅 x86；ARM 用 `MRS x0, PMCCNTR_EL0`（需内核 PMU）或 `clock_gettime(CLOCK_MONOTONIC)`；PEB/TEB 在 ARM 不存在，改用 `/proc/self/status`(Linux) 或 `task_info`(macOS)。
- **误报**：ProcMon/AV 会抬高 syscall 延迟触发时间检查——启动时测 3 次取 `mean+3*stddev` 标定阈值；ptrace 检查先核 `/proc/<pid>/comm`，可能只是监控工具非调试器。
- **补丁致崩溃**：NOP 条件跳转前先完整跟踪「被检测」分支，若其初始化/释放后续所需堆状态，跳过会破坏状态——改打比较操作数为「干净」值，或用 x64dbg「Set condition to always false」而非改字节。
- 高熵段(>7.0/7.2)、虚拟大小≫原始大小、导入表近乎空、入口不在 `.text`、EOF 后有 overlay、存在 TLS 回调——均为加壳信号。

## 互见

- related：`yara-rule-authoring` —— 识别出加壳/混淆/字符串特征后编写检测规则。
- related：`wireshark-traffic-analysis` —— 样本动态分析时分析其网络行为。
- combines_with：`security-incident-response` —— 恶意软件分析结论汇入事件响应处置流程。

---
本条采编自 wshobson/agents（MIT）。
