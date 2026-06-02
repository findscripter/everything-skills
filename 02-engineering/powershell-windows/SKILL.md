---
name: powershell-windows
title: PowerShell Windows 实战
description: 当在 Windows 上编写或调试 PowerShell 脚本（含 Agent 生成的自动化脚本）时使用；做规避运算符/Unicode/空值/JSON 等高频陷阱，产出健壮可执行的 .ps1 脚本与命令；不适用于 Bash/Linux shell 脚本或 pwsh 跨平台高级特性教学；触发词：PowerShell、Windows 脚本、.ps1、cmdlet、Test-Path、ConvertTo-Json、ErrorActionPreference
domain: 研发/devops
triggers: [PowerShell, Windows 脚本, .ps1, cmdlet, Test-Path, ConvertTo-Json, ErrorActionPreference, Join-Path, PowerShell 报错, Unexpected token]
tags: [powershell, windows, 脚本, shell, automation, error-handling, cmdlet]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [powershell, pwsh]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

在 **Windows + PowerShell** 环境下编写、生成或调试脚本时，用本技能逐项规避 PowerShell 特有的语法与运行期陷阱，让脚本一次跑通而非反复报「Unexpected token / parameter 'or' / Cannot find property」。尤其适合 Agent 自动生成 `.ps1` 时做产出前自检。

不该用：

- 写 **Bash / sh / zsh** 等 POSIX shell 脚本 —— 语法规则完全不同。
- 需要 pwsh 跨平台远程、DSC、模块开发等深度专题 —— 本技能只覆盖高频通用陷阱。
- 任务本身与脚本无关（仅是在 Windows 上跑某个程序）。

## 步骤 / 指令

按以下清单逐条核对生成的脚本：

1. **运算符必须加括号**：逻辑运算符两侧的 cmdlet 调用各自用 `()` 包起来。
2. **脚本内只用 ASCII**：日志/输出禁用 emoji 与 Unicode 符号，改用 `[OK] [X] [WARN] [INFO] [...]` 标记（Unicode 会触发 `Unexpected token`）。
3. **先判空再访问**：访问 `.Count` / `.Length` / 属性前先确认对象非 `$null`。
4. **复杂插值先落变量**：深层属性 `$obj.prop.sub` 先赋给变量再插值。
5. **显式错误策略 + try/catch**：开发用 `Stop` 快速失败，生产脚本用 `Continue`；`catch` 收口、`finally` 清理，不要在 `try` 内 `return`。
6. **路径用 `Join-Path`**：除非字面常量路径，否则拼接路径一律 `Join-Path`。
7. **JSON 永远带 `-Depth`**：`ConvertTo-Json` 默认深度仅 2，嵌套对象必加 `-Depth 10`。
8. **数组/集合用正确写法**：见示例。
9. **收尾**：用文末脚本模板包裹（StrictMode + 错误策略 + try/catch + exit code）。

## 示例

运算符（每个 cmdlet 调用都要括号）：

```powershell
# 错误：if (Test-Path "a" -or Test-Path "b")
if ((Test-Path "a") -or (Test-Path "b")) { }
if ((Get-Item $x) -and ($y -eq 5)) { }
```

空值检查与复杂插值：

```powershell
# 判空再取 .Count / .Length
if ($array -and $array.Count -gt 0) { }
if ($text) { $text.Length }

# 深层属性先落变量再插值
$value = $obj.prop.sub
Write-Output "Value: $value"
```

数组与 JSON：

```powershell
$array = @()                       # 空数组
$array += $item                    # 追加
$list.Add($item) | Out-Null        # ArrayList 追加（吞返回值）

# 读：Get-Content "file.json" -Raw | ConvertFrom-Json
$data | ConvertTo-Json -Depth 10 | Out-File "file.json" -Encoding UTF8
```

脚本模板（直接套用）：

```powershell
Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

try {
    # 业务逻辑
    Write-Output "[OK] Done"
    exit 0
}
catch {
    Write-Warning "Error: $_"
    exit 1
}
```

常见报错速查：

| 报错 | 成因 | 修复 |
|---|---|---|
| parameter 'or' | 逻辑运算符旁的 cmdlet 没加括号 | 把 cmdlet 调用包进 `()` |
| Unexpected token | 脚本含 Unicode/emoji | 全程改 ASCII |
| Cannot find property | 访问了 `$null` 对象 | 先判空 |
| Cannot convert | 类型不匹配 | 显式 `.ToString()` |

## 注意事项

- **括号、ASCII-only、判空** 三条是硬约束，不可省。
- `ConvertTo-Json` 漏写 `-Depth` 会静默截断嵌套数据，排查极费时。
- `Out-File` 写 JSON 给其它工具读时显式 `-Encoding UTF8`，避免 BOM/UTF-16 乱码。
- StrictMode 下未定义变量会抛错，这是好事；但要确保所有变量先初始化。
- 本技能针对 Windows PowerShell 5.1 与 pwsh 通用陷阱；版本差异行为请以目标环境实测为准，勿把输出当作免测依据。

## 互见

- related：`busybox-on-windows` —— 当 Windows 上更想直接用 `ls/grep/sed` 等 UNIX 命令而非 PowerShell 时
- related：`systematic-debugger` —— 脚本报错根因定位的通用方法论
- combines_with：`github-actions-author` —— CI 中编写 Windows runner 的 PowerShell step

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
