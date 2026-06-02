---
name: busybox-on-windows
title: Windows 上运行 BusyBox UNIX 工具
description: 当在 Windows 上需要 ls/grep/sed 等 UNIX 命令行工具时使用；做下载单文件 busybox.exe 并以前缀方式调用 UNIX 命令；不适用于 UNIX/Linux/macOS（系统已自带）；触发词：busybox、Windows UNIX 工具、单文件 Unix 命令
domain: 平台/cli
triggers: [busybox, 在 Windows 上用 UNIX 命令, Windows 缺少 ls grep sed, 单文件 Unix 工具集, busybox.exe, Win32 BusyBox, frippery busybox 下载]
tags: [平台, misc, windows, busybox, unix-tools, 命令行, powershell]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [PowerShell, Bash]
requires: []
related: [powershell-windows, posix-shell-scripting, tmux-session-management, bash-defensive-patterns]
combines_with: [powershell-windows, posix-shell-scripting]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

在 **Windows** 上需要使用 `ls`、`grep`、`sed`、`awk`、`tar` 等标准 UNIX 命令行工具，而系统没有 WSL、Git Bash 或 Cygwin 时，用一个单文件 `busybox.exe` 即可获得几百个常用 Unix 工具。

不该用的情况：
- 在 **UNIX/Linux/macOS** 上——系统已自带这些工具，直接用即可，不要引入 BusyBox。
- 需要某些 BusyBox 未实现或行为与 GNU 版本不完全一致的高级特性时（应改用完整工具链）。
- 不要把 BusyBox 输出当作环境相关验证、测试或专家评审的替代品。
- 若关键输入、权限、安全边界或成功标准缺失，先停下来澄清。

## 步骤

仅当**当前目录（本技能文档所在目录）下找不到 `busybox.exe`** 时，才执行下载步骤。以下为 PowerShell 命令；若用经典 `cmd.exe`，需用 `powershell -Command "..."` 包裹运行。

1. 查看 CPU 类型（判断 x86/ARM）：
   `Get-CimInstance -ClassName Win32_Processor | Select-Object Name, NumberOfCores, MaxClockSpeed`
2. 查看操作系统版本：
   `Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" | Select-Object ProductName, DisplayVersion, CurrentBuild`
3. 按 CPU 架构选择并下载对应构建（统一保存为 `busybox.exe`）。

## 指令

下载（四选一，按架构匹配）：

```powershell
# 32 位 x86 (ANSI)
$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri https://frippery.org/files/busybox/busybox.exe -OutFile busybox.exe

# 64 位 x86 (ANSI)
$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri https://frippery.org/files/busybox/busybox64.exe -OutFile busybox.exe

# 64 位 x86 (Unicode)
$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri https://frippery.org/files/busybox/busybox64u.exe -OutFile busybox.exe

# 64 位 ARM (Unicode)
$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri https://frippery.org/files/busybox/busybox64a.exe -OutFile busybox.exe
```

常用命令：
- 列出所有可用 UNIX 命令（即帮助）：`busybox.exe --list`
- 运行某个 UNIX 命令：在命令前加 `busybox.exe` 前缀，例如 `busybox.exe ls -1`

## 示例

```powershell
# 列出当前目录（单列）
busybox.exe ls -1

# 在文件中搜索
busybox.exe grep "TODO" main.c

# 查看可用工具清单
busybox.exe --list

# 在其他工作目录下运行时，使用 busybox.exe 的绝对路径
C:\tools\busybox.exe sed -n '1,10p' E:\logs\app.log
```

## 注意事项

- **仅限 Windows 使用**；UNIX 系统请直接用原生工具。
- **架构必须匹配**：x86 与 ARM、32 位与 64 位、ANSI 与 Unicode 构建需按上面 CPU 检测结果选择，选错可能无法运行或出现编码问题。
- **需要在不同 CWD 下运行**某个 UNIX 命令时，请使用 `busybox.exe` 的**绝对路径**（如 `C:\tools\busybox.exe ...`），否则可能找不到可执行文件。
- 所有 Unix 命令都通过 `busybox.exe <命令> <参数>` 形式调用，BusyBox 是单二进制多工具集合。

## 互见

- 官方文档：https://frippery.org/busybox/
- 原始 BusyBox 项目：https://busybox.net/

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
