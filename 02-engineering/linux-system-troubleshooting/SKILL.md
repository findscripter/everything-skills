---
name: linux-system-troubleshooting
title: Linux 系统排障
description: 当 Linux 主机/服务出现性能劣化、服务故障、磁盘耗尽或网络异常需系统化定位时使用；按七步流程从系统画像→资源→进程→日志→网络→服务依次取证，用 top/free/df、ps/lsof/strace、journalctl、ss/dig、systemctl 定位根因并产出修复与防复发清单；不适用于 Windows/macOS、纯应用代码 bug 或缺访问权限时的臆测；触发词：服务器卡、CPU 飙高、磁盘满、OOM、服务挂了、网络不通。
domain: 研发/devops
triggers: [服务器变慢/负载高排查, CPU 或内存占用飙高定位, 磁盘空间耗尽 df 100%, systemd 服务启动失败或反复重启, 网络不通/DNS 解析异常, 进程僵死或资源占用过高 strace, 翻查 journalctl/syslog 找错误, 线上故障止血与根因分析]
tags: [Linux, 排障, 运维, DevOps, 性能分析, systemd, 网络诊断, 日志分析]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [top/htop, free/df/iostat, ps/pstree/lsof/strace, journalctl/dmesg, ss/ip/dig/curl, systemctl]
requires: []
related: [linux-sysadmin-shell-scripts, devops-troubleshooter, network-interface-health, error-log-detective]
combines_with: [sre-incident-responder, performance-profiler]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Linux 系统排障

## 何时使用

适用：Linux 主机或其上的服务出现异常，需要系统化、按序取证地定位根因，包括——

- 系统变慢、负载高、响应抖动等性能问题；
- systemd 服务启动失败、反复重启、依赖未就绪；
- 磁盘空间耗尽、inode 用尽、I/O 阻塞；
- 进程吃满 CPU/内存、僵死、句柄泄漏；
- 网络不通、端口不监听、DNS 解析失败、连通性异常。

不该用（负边界）：

- 非 Linux 平台（Windows/macOS）——本技能命令与 systemd/journal 假设不成立。
- 纯应用代码逻辑 bug、本地单机业务调试——属应用开发域。
- 缺少 SSH 访问、sudo 权限或环境信息时——先停下索要输入，不要凭空臆测；缺成功判据/安全边界也先问清。

## 步骤

纪律：**先全面取证，再形成并验证假设**；止血与根因分开推进，每步留痕以便复盘。按下列七阶段顺序排查，命中即下钻：

1. 系统画像：确认主机身份、发行版、内核与近期变更，抓最近内核报错。
2. 资源分析：看 CPU、内存、磁盘容量、I/O、网络，定位资源瓶颈维度。
3. 进程调查：找资源占用大户，看进程树/打开文件/系统调用。
4. 日志分析：查系统日志与目标服务日志，按时间线关联事件、搜 error。
5. 网络诊断：查接口/路由、监听端口、连通性、防火墙规则、DNS 解析。
6. 服务排障：查 systemd 服务状态与日志，验证依赖与配置，必要时受控重启。
7. 处置收尾：以最小扰动落地修复→验证恢复→观察稳定性→补监控告警→沉淀 runbook。

## 指令

各阶段对应命令（保留源中关键命令）：

```bash
# 1. 系统画像
uptime
hostnamectl
cat /etc/os-release
dmesg | tail -50

# 2. 资源分析
top -bn1 | head -20
free -h
df -h                 # 磁盘满优先看；再 df -i 查 inode
iostat -x 1 5

# 3. 进程调查
ps aux --sort=-%cpu | head -10
pstree -p
lsof -p <PID>
strace -p <PID>       # 高开销，仅对可疑进程短时跟踪

# 4. 日志分析
journalctl -xe
tail -f /var/log/syslog
grep -i error /var/log/*

# 5. 网络诊断
ip addr show
ss -tulpn
curl -v http://<target>
dig <domain>

# 6. 服务排障
systemctl status <service>
journalctl -u <service> -f
systemctl restart <service>
```

收尾质量门（逐项确认）：根因已定位、修复已在目标环境实测验证、监控告警已就位、解决方案已文档化。

## 示例

- **磁盘满**：`df -h` 见某分区 100% → `df -i` 排除 inode 耗尽 → `du -xh / 2>/dev/null | sort -rh | head` 定位大目录 → 清理日志/临时文件或扩容，并对该分区加容量告警。
- **CPU 飙高**：`top` 锁定进程 → `ps aux --sort=-%cpu` 确认 → `strace -p <PID>` 看其卡在何处（如忙等、频繁系统调用），据此回滚或限流。
- **服务起不来**：`systemctl status nginx` 见 failed → `journalctl -u nginx -n50` 读真实报错（如端口占用、配置语法）→ 修配置后 `systemctl restart` 并确认 active。
- **网络不通**：`ss -tulpn` 确认端口是否在监听 → `curl -v` 看握手在哪步失败 → `dig` 排除 DNS → 核对防火墙/安全组规则。

## 注意事项

- **先取证后假设**：未拿到日志/指标前不下结论，避免误导性操作。
- `strace`/`tcpdump` 等开销高、可能影响线上进程，仅短时定向使用。
- 重启服务是止血手段而非根因修复——重启前尽量先抓现场（日志、堆栈、core），否则证据随进程消失。
- 磁盘满时先确认是容量还是 inode 耗尽，二者处置不同。
- 一切修复须在目标环境内实测验证；本技能产出不替代环境特定的测试与专家评审。

## 互见

- related：`devops-troubleshooter` —— 分布式/K8s 视角的可观测排障，单机定位后向上关联。
- related：`posix-shell-scripting` —— 把重复排查动作固化为脚本。
- combines_with：`sre-incident-responder` —— 故障升级为事故时接入响应/复盘流程。
- combines_with：`prometheus-configuration` —— 排障后补齐主动监控与告警以防复发。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
