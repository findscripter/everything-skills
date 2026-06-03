---
name: memory-forensics
title: 内存取证分析
description: 当对内存镜像（RAM dump）做事件响应或恶意软件分析、需追查注入/隐藏进程/凭据/Rootkit 时使用；做内存采集→Volatility 3 分析→提取进程、网络、注册表、文件、YARA 命中等取证产物；不适用于纯磁盘/网络流量取证、活体系统在线排查或非内存证据；触发词：内存取证、memory dump、Volatility、malfind、内存镜像
domain: 安全/ops
triggers: [内存取证, 内存镜像分析, memory dump, RAM dump, Volatility, vol -f, malfind, 进程注入检测, WinPmem, LiME, 内存中提取凭据, Rootkit 检测, yarascan, 蓝队应急, 事件响应取证]
tags: [安全, ops, 数字取证, 事件响应, 恶意软件分析, DFIR, Volatility3, 内存取证, 蓝队, YARA]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Volatility3, WinPmem, DumpIt, LiME, osxpmem, vmware/virtualbox/qemu/virsh, YARA, FLOSS, strings]
requires: []
related: [defensive-malware-analyst, threat-detection-hunting, yara-rule-authoring, binary-analysis-patterns]
combines_with: [security-incident-response, wireshark-traffic-analysis]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 拿到一份内存镜像（Windows/Linux/macOS 或虚拟机 .vmem/.elf），需要做事件响应或恶意软件分析。
- 要追查可疑/隐藏进程、进程注入、网络外连、持久化、Rootkit、凭据外泄等内存侧证据。
- 需要从内存中导出进程/模块/文件、提取字符串、跑 YARA 命中。

不该用（负边界）：
- 任务与内存取证无关，或需要纯磁盘镜像取证、网络流量（PCAP）分析、日志分析。
- 在线活体系统的实时排查、EDR 告警分诊（本技能聚焦离线镜像分析）。
- 缺少有效内存镜像或对应符号表时，先去采集/补齐，再回到分析步骤。

前置：先明确目标、约束与可用输入（镜像路径、OS 版本、是否已有符号表），再动手。

## 步骤

1. 采集内存（若尚无镜像）。采集前后立即对镜像做哈希，记录时间/工具/哈希以保全证据链。
2. 安装 Volatility 3 与对应 OS 符号表，确认 `vol -f memory.raw windows.info` 能正常解析。
3. 由粗到细：先 pstree/pslist 建立进程全貌，再 netscan 看外连，再 malfind 找注入。
4. 锁定可疑 PID 后深挖：dlllist / handles / vadinfo，并 dump 可疑可执行体。
5. 对 dump 出的样本做 strings / FLOSS / YARA，提取 IOC 并与磁盘、网络证据交叉验证。
6. 按需走应急专项：timeliner 时间线、持久化（Run 键/服务/计划任务）、Rootkit 与凭据提取。
7. 记录每一步命令、输出与结论，多插件交叉印证后再下定论。

## 指令

采集（按平台任选其一，采集后立即哈希）：

```powershell
# Windows，推荐 WinPmem
winpmem_mini_x64.exe memory.raw
# 或 DumpIt.exe（Belkasoft / Magnet RAM Capture 为 GUI，输出 raw）
```

```bash
# Linux
sudo insmod lime.ko "path=/tmp/memory.lime format=lime"   # LiME，推荐
sudo cp /proc/kcore memory.elf                            # /proc/kcore (ELF)

# macOS
sudo ./osxpmem -o memory.raw

# 虚拟机
cp vm.vmem memory.raw                                      # VMware：.vmem 即裸内存
vboxmanage debugvm "VMName" dumpvmcore --filename memory.elf
virsh dump <domain> memory.raw --memory-only              # QEMU/KVM
```

Volatility 3 安装与基本用法：

```bash
pip install volatility3
# 符号表下载：https://downloads.volatilityfoundation.org/volatility3/symbols/
vol -f memory.raw <plugin>
vol -f memory.raw -s /path/to/symbols windows.pslist
```

核心插件（Windows）：

```bash
# 进程
vol -f memory.raw windows.pstree      # 父子关系
vol -f memory.raw windows.psscan      # 扫描隐藏进程
vol -f memory.raw windows.cmdline     # 命令行
# 网络
vol -f memory.raw windows.netscan
# 注入检测
vol -f memory.raw windows.malfind                       # 重点：PAGE_EXECUTE_READWRITE + 非映像 VAD 中的 MZ 头
vol -f memory.raw windows.vadinfo --pid <PID>
# DLL/模块
vol -f memory.raw windows.dlllist --pid <PID>
vol -f memory.raw windows.ldrmodules                    # 隐藏/注入 DLL
# 注册表 / 文件
vol -f memory.raw windows.registry.printkey --key "Software\Microsoft\Windows\CurrentVersion\Run"
vol -f memory.raw windows.filescan
vol -f memory.raw windows.dumpfiles --pid <PID>
```

Linux / macOS 对应插件：`linux.pslist|pstree|bash|sockstat|lsmod`、`mac.pslist|pstree|netstat|lsmod`。

Rootkit 检测（隐藏进程 / DKOM / 钩子 / 驱动）：

```bash
vol -f memory.raw windows.pslist > pslist.txt
vol -f memory.raw windows.psscan > psscan.txt
diff pslist.txt psscan.txt          # pslist 与 psscan 差异 = 隐藏进程
vol -f memory.raw windows.callbacks # DKOM
vol -f memory.raw windows.ssdt      # SSDT 钩子
vol -f memory.raw windows.driverscan
```

凭据提取（需先 hivelist）：

```bash
vol -f memory.raw windows.hashdump
vol -f memory.raw windows.lsadump
vol -f memory.raw windows.cachedump   # 缓存的域凭据
```

YARA 扫描与字符串：

```bash
vol -f memory.raw windows.yarascan --yara-rules rules.yar [--pid 1234 | --kernel]
strings -a memory.raw > all_strings.txt
strings -el memory.raw >> all_strings.txt        # Unicode
floss pid.1234.dmp                               # 解混淆字符串
```

YARA 规则示例（注入 / Cobalt Strike）：

```yara
rule Suspicious_Injection {
    strings:
        $mz = { 4D 5A }
        $shellcode1 = { 55 8B EC 83 EC }                  // 函数序言
        $api_hash = { 68 ?? ?? ?? ?? 68 ?? ?? ?? ?? E8 }  // push hash; call
    condition: $mz at 0 or any of ($shellcode*)
}
rule Cobalt_Strike_Beacon {
    strings:
        $config = { 00 01 00 01 00 02 }
        $sleep = "sleeptime"
        $beacon = "%s (admin)" wide
    condition: 2 of them
}
```

## 示例

恶意软件分析工作流：

```bash
vol -f memory.raw windows.pstree  > processes.txt   # 1. 进程全貌
vol -f memory.raw windows.netscan > network.txt     # 2. 网络外连
vol -f memory.raw windows.malfind > malfind.txt     # 3. 注入检测
vol -f memory.raw windows.dlllist --pid <PID>       # 4. 深挖可疑进程
vol -f memory.raw windows.handles --pid <PID>
vol -f memory.raw windows.pslist  --pid <PID> --dump # 5. dump 可执行体
strings -a pid.<PID>.exe > strings.txt              # 6. 提取字符串
vol -f memory.raw windows.yarascan --yara-rules malware.yar  # 7. YARA
```

事件响应工作流：

```bash
vol -f memory.raw windows.timeliner > timeline.csv  # 时间线
vol -f memory.raw windows.cmdline; vol -f memory.raw windows.consoles
vol -f memory.raw windows.registry.printkey --key "Software\Microsoft\Windows\CurrentVersion\Run"
vol -f memory.raw windows.svcscan                   # 服务
vol -f memory.raw windows.scheduled_tasks           # 计划任务
```

判读要点：malfind 命中关注 PAGE_EXECUTE_READWRITE 保护、非映像 VAD 区域内的 MZ 头、起始处的 shellcode 模式。常见注入手法对应特征：经典 DLL 注入（VirtualAllocEx+WriteProcessMemory+CreateRemoteThread）、进程镂空（CreateProcess SUSPENDED + NtUnmapViewOfSection + WriteProcessMemory）、APC 注入（QueueUserAPC）、线程劫持（SuspendThread+SetThreadContext+ResumeThread）。

## 注意事项

采集：
- 优先轻量级工具、最小化足迹；采集后立即对镜像做哈希校验完整性；维护证据链与采集记录。

分析：
- 由粗到细，先全貌后深挖；同一数据用多插件交叉印证；与磁盘/网络证据做时间线关联后再下结论。

常见坑：
- 内存易失，尽快分析；核对 dump 大小是否与预期 RAM 一致，避免不完整镜像。
- 符号表必须匹配目标 OS 版本，否则解析失败或结果错误。
- 采集瞬间内存可能变化导致 smear；部分数据在内存中可能已加密。

边界提醒：输出不能替代针对具体环境的验证、测试与专家复核；若缺少有效镜像、符号、权限或成功标准，先停下来确认再继续。

## 互见

- 磁盘/文件系统取证、网络流量（PCAP）分析、日志与时间线分析等同域技能可与本技能交叉关联。
- YARA 规则编写、IOC 管理、恶意样本静态/动态分析可作为本技能下游环节。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
