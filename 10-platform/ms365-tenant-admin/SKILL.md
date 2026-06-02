---
name: ms365-tenant-admin
title: Microsoft 365 租户管理
description: 当以全局管理员身份配置或运维 Microsoft 365 / Office 365 租户、批量管理 Entra ID(Azure AD) 用户、条件访问与安全基线时使用；用 Microsoft Graph PowerShell 生成租户初始化、批量发证、CSV 批量建号、MFA/条件访问策略、安全审计与离职处置脚本；不适用于个人版账户、纯本地 AD、非 M365 的 IAM 平台或无脚本的纯点击操作；触发词：ms365 租户、m365 tenant、office 365 admin、entra id、azure ad 用户、global administrator 全局管理员、conditional access 条件访问、mfa、exchange online、powershell graph 自动化
domain: 平台/cloud
triggers: [ms365 租户, m365 tenant, office 365 admin, entra id, azure ad 用户, global administrator 全局管理员, conditional access 条件访问, mfa, exchange online, powershell graph 自动化]
tags: [ms365, office365, entra-id, azure-ad, conditional-access, mfa, exchange-online, powershell, microsoft-graph, security-baseline]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [PowerShell, Microsoft.Graph, ExchangeOnlineManagement, MicrosoftTeams, Microsoft Graph API]
requires: []
related: [google-workspace-cli-admin, azure-cloud-architect, atlassian-admin, active-directory-attacks]
combines_with: [google-workspace-cli-admin, azure-cloud-architect]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 以**全局管理员（Global Administrator）**身份初始化或运维 Microsoft 365 / Office 365 租户：建号、发证、域名验证、安全基线。
- 需要**批量**操作：从 CSV 批量创建用户、批量分配/回收许可证、批量退组。
- 需要落地**安全策略**：条件访问（Conditional Access）、强制 MFA、阻断旧版认证、查无 MFA 用户、检查 Secure Score。
- 需要**用户离职处置（offboarding）**：封禁登录、吊销会话、转共享邮箱、清理组与许可证。

不该用的边界：
- 个人版 Microsoft 账户、Microsoft 365 家庭/个人订阅（无租户管理面）。
- 纯本地 Active Directory（无 Entra ID 同步）或第三方 IAM 平台（Okta、Google Workspace 等）。
- 仅需在管理中心点鼠标、不涉及脚本/批量/可审计自动化的一次性小操作。

## 步骤

按场景选一条工作流，全程遵循「先 report-only / -WhatIf，后强制执行」。

**A. 新租户初始化**
1. 核对前置条件：全局管理员账户已开 MFA；自定义域名已购、可改 DNS；许可证 SKU 已确认（E3 / E5 差异已记录）。
2. 验证 DNS：在管理中心添加域名后，确认 MX / SPF(TXT) 传播（最长等 48 小时）再批量建号。
3. 套用安全基线：阻断旧版认证 + 开启统一审计日志。
4. 批量发证建号：从 CSV 导入，逐条 `try/catch`，强制下次登录改密。
5. 验证：在管理门户抽查 3-5 个账户，确认许可证显示 Active。

**B. 安全加固**
1. 跑安全审计：导出条件访问清单、导出未注册 MFA 用户清单。
2. 建 MFA 策略，先 `enabledForReportingButNotEnforced`（仅报告）。
3. 观察 48 小时登录日志，确认命中预期用户后再改 `State = "enabled"`。
4. 复核 Secure Score 与改进项。

**C. 用户离职**
1. 立即封禁登录 + 吊销所有刷新令牌。
2. 用 `-WhatIf` / 干跑打印将被移除的许可证。
3. 执行：回收许可证 → 邮箱转共享 → 退出所有组。
4. 验证门户中账户为 Blocked、无活跃许可证、邮箱类型为 Shared。

## 指令

前置安装模块（仅当前用户）：

```powershell
Install-Module Microsoft.Graph -Scope CurrentUser
Install-Module ExchangeOnlineManagement -Scope CurrentUser
Install-Module MicrosoftTeams -Scope CurrentUser
```

连接并跑安全审计（按需申请最小 Scope）：

```powershell
Connect-MgGraph -Scopes "Directory.Read.All","Policy.Read.All","AuditLog.Read.All","Reports.Read.All"
Get-MgSubscribedSku | Select-Object SkuPartNumber, ConsumedUnits, @{N="Total";E={$_.PrepaidUnits.Enabled}}
Get-MgIdentityConditionalAccessPolicy | Select-Object DisplayName, State | Export-Csv .\ca_policies.csv -NoTypeInformation
Get-MgReportAuthenticationMethodUserRegistrationDetail |
    Where-Object { -not $_.IsMfaRegistered } |
    Select-Object UserPrincipalName, IsMfaRegistered | Export-Csv .\no_mfa_users.csv -NoTypeInformation
```

安全基线（阻断旧版认证 + 开统一审计）：

```powershell
$policy = @{
    DisplayName   = "Block Legacy Authentication"
    State         = "enabled"
    Conditions    = @{ ClientAppTypes = @("exchangeActiveSync","other") }
    GrantControls = @{ Operator = "OR"; BuiltInControls = @("block") }
}
New-MgIdentityConditionalAccessPolicy -BodyParameter $policy
Set-AdminAuditLogConfig -UnifiedAuditLogIngestionEnabled $true
```

MFA 条件访问策略（**务必先 report-only**）：

```powershell
$policy = @{
    DisplayName   = "Require MFA All Users"
    State         = "enabledForReportingButNotEnforced"   # 观察 48h 后再改 enabled
    Conditions    = @{ Users = @{ IncludeUsers = @("All") } }
    GrantControls = @{ Operator = "OR"; BuiltInControls = @("mfa") }
}
New-MgIdentityConditionalAccessPolicy -BodyParameter $policy
```

## 示例

**从 CSV 批量发证建号**（CSV 列：DisplayName, UserPrincipalName, Department, LicenseSku）：

```powershell
$licenseSku = (Get-MgSubscribedSku | Where-Object { $_.SkuPartNumber -eq "ENTERPRISEPACK" }).SkuId
Import-Csv .\employees.csv | ForEach-Object {
    try {
        $pwd  = @{ Password = (New-Guid).ToString().Substring(0,12)+"!"; ForceChangePasswordNextSignIn = $true }
        $user = New-MgUser -DisplayName $_.DisplayName -UserPrincipalName $_.UserPrincipalName `
                           -AccountEnabled -PasswordProfile $pwd
        Set-MgUserLicense -UserId $user.Id -AddLicenses @(@{ SkuId = $licenseSku }) -RemoveLicenses @()
        Write-Host "Provisioned: $($_.UserPrincipalName)"
    } catch { Write-Warning "Failed $($_.UserPrincipalName): $_" }
}
```

**离职处置（封禁 → 吊销 → 干跑 → 执行）**：

```powershell
$upn  = "departing.user@company.com"
$user = Get-MgUser -Filter "userPrincipalName eq '$upn'"
Update-MgUser -UserId $user.Id -AccountEnabled:$false          # 立即封禁登录
Invoke-MgInvalidateAllUserRefreshToken -UserId $user.Id        # 吊销全部会话

$licenses = (Get-MgUserLicenseDetail -UserId $user.Id).SkuId
$licenses | ForEach-Object { Write-Host "[WhatIf] Would remove SKU: $_" }   # 干跑预览

Set-MgUserLicense -UserId $user.Id -AddLicenses @() -RemoveLicenses $licenses
Set-Mailbox -Identity $upn -Type Shared                        # 需 ExchangeOnlineManagement
Get-MgUserMemberOf -UserId $user.Id | ForEach-Object {
    try { Remove-MgGroupMemberByRef -GroupId $_.Id -DirectoryObjectId $user.Id } catch {}
}
```

## 注意事项

- **永不硬编码凭据**：用 Azure Key Vault 或 `Get-Credential`；按最小权限申请 Graph Scope。
- **条件访问先报告后强制**：新策略一律 `enabledForReportingButNotEnforced`，观察 48 小时登录日志再切 `enabled`，否则可能把管理员锁在门外。
- **破坏性批量操作前先 `-WhatIf` 或干跑打印**；批量逻辑包 `try/catch`，用 `Write-Host` / `Write-Warning` 留审计痕迹。
- **优先 Microsoft Graph**（`Microsoft.Graph` 模块），勿用已弃用的 MSOnline / AzureAD。
- **DNS 传播最长 48 小时**，未验证完成勿批量建号。
- **先在非生产租户测试**；季度做一次安全复核与 Secure Score 检查。
- 约束：完整租户初始化需全局管理员；批量调用可能触发 API 限流；E3/E5 决定高级功能可用性；混合环境（本地 AD）需额外配置。

## 互见

- code-reviewer：在合入这些 PowerShell 自动化脚本前复核逻辑与错误处理。
- csv-data-cleaner：批量建号 / 发证前清洗与校验 CSV 输入（UPN、部门、SKU 列）。

---
本条采编自 alirezarezvani/claude-skills（MIT）。
