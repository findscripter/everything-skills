---
name: linux-sysadmin-shell-scripts
title: Linux 运维脚本模板
description: 当需要在 Linux 服务器上快速搭起备份、监控、用户与安全、日志分析、自动化等运维脚本时使用；做生产可用的 Bash 脚本模板套用与改写，产出带时间戳/阈值告警/轮转/加密的 .sh 脚本与 cron 计划；不适用于 Windows（用 PowerShell）、可移植 POSIX sh（用 posix-shell-scripting）或一次性交互命令；触发词：备份脚本、磁盘/CPU 监控、日志分析、用户管理、cron 定时
domain: 研发/devops
triggers: [写备份脚本, tar/rsync 备份, 数据库备份 mysqldump, 备份轮转, 磁盘/CPU 监控告警, 系统健康检查, 用户创建/密码过期, openssl 文件加密, 日志错误提取, access.log 分析, 网络连通性检查, cron 定时任务, 服务重启脚本, 目录同步清理, Git 仓库批量更新]
tags: [shell, bash, 运维, sysadmin, 备份, 监控, cron, 日志分析, devops, 研发]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bash, tar, rsync, mysqldump, openssl, cron, systemctl, awk, find, curl, ssh]
requires: []
related: [bash-defensive-patterns, posix-shell-scripting, linux-system-troubleshooting, shellcheck-linting]
combines_with: [bats-shell-testing, operational-runbook-writer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Linux 运维脚本模板

## 何时使用

- **该用**：在 Linux/Unix（bash）上需要一套即取即用的运维脚本骨架——定时备份（本地/远程/数据库）、资源监控与告警、用户与密码策略、文件加密、日志与访问日志分析、网络探活、cron 调度、目录同步/清理、系统信息采集、Git 仓库批量更新。把模板里的 `/path/to/...`、阈值、主机名替换成自己的即可落地，再用 cron 调度。
- **不该用（负边界）**：
  - 目标是 Windows → 用 `powershell-windows`，本套是 bash。
  - 脚本要在 dash/BusyBox ash/多 Unix 上**可移植** → 用 `posix-shell-scripting`（本套用了数组、`[[`、`&>` 等 bashism）。
  - 只是一次性、不复用的交互命令，无需脚本化。
  - 要的是健壮工程化（`set -euo pipefail`、trap、错误处理范式）→ 先看 `bash-defensive-patterns` 再套本模板。

## 步骤

1. **选模板**：按任务从下方「指令」九类里挑对应骨架。
2. **改参数**：替换路径、阈值、用户名、主机、库名等占位符；变量一律加引号 `"$var"`。
3. **赋权运行**：`chmod +x script.sh && ./script.sh`；后台跑 `nohup ./script.sh &`。
4. **先测后用**：非生产环境跑通，必要时 `bash -x script.sh` 调试。
5. **调度**：交给 cron（见下）或 systemd timer；告警类脚本接邮件/Slack 通知。
6. **加固**（推荐）：补 `set -euo pipefail`、`trap` 清理、绝对路径、输入校验——见 `bash-defensive-patterns`。

## 指令

约定：`${var:-default}` 取默认、`$(date +%Y%m%d_%H%M%S)` 时间戳、`"$@"` 全参数、`$(( ))` 算术。

**① 备份**
- 目录打包：`tar -czf "$backup_dir/backup_$(date +%Y%m%d_%H%M%S).tar.gz" "$source_dir"`
- 远程同步：`rsync -avz --progress "$source_dir" user@host:/path/to/backup`
- 备份轮转（超过 `max_backups` 删最旧）：
  ```bash
  while [ "$(ls -1 "$backup_dir" | wc -l)" -gt "$max_backups" ]; do
      oldest=$(ls -1t "$backup_dir" | tail -n 1)
      rm -r "$backup_dir/$oldest"
  done
  ```
- 数据库：`mysqldump -u "$db_user" -p"$db_pass" "$db" > dump.sql && gzip dump.sql`（密码勿硬编码，见注意事项）。

**② 监控告警**（阈值默认 90）
- CPU：`cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d. -f1); [ "$cpu" -gt "$threshold" ] && echo "ALERT: CPU $cpu%"`
- 磁盘：`disk=$(df -h | grep "$partition" | awk '{print $5}' | cut -d% -f1); [ "$disk" -gt "$threshold" ] && echo "ALERT: disk $disk%"`
- 健康检查：把 `uptime`、`cat /proc/loadavg`、`free -h`、`df -h`、`ps aux --sort=-%cpu | head -10` 用 `{ ...; } > report.txt` 汇总。

**③ 用户管理**
- 建用户（先判存在）：`id "$u" &>/dev/null || { useradd -m -s /bin/bash "$u"; passwd "$u"; }`
- 密码过期巡检：遍历 `grep "/bin/bash" /etc/passwd | cut -d: -f1`，对每个 `chage -l "$user" | grep "Password expires"`。

**④ 安全**
- 随机密码：`openssl rand -base64 48 | tr -dc 'a-zA-Z0-9!@#$%^&*' | head -c "${1:-16}"`
- 文件加解密（AES-256-CBC + PBKDF2）：
  ```bash
  openssl enc -aes-256-cbc -salt -pbkdf2 -in "$f" -out "$f.enc"        # 加密
  openssl enc -aes-256-cbc -d  -pbkdf2 -in "$f" -out "${f%.enc}"       # 解密
  ```

**⑤ 日志分析**
- 错误提取：`grep -i "error\|fail\|critical" "${1:-/var/log/syslog}" > out.txt`
- access.log 三连：Top IP `awk '{print $1}' log | sort | uniq -c | sort -rn | head`；Top URL `$7`；状态码分布 `$9`。

**⑥ 网络**
- 探活：`for h in "${hosts[@]}"; do ping -c 1 -W 2 "$h" &>/dev/null && echo "[UP] $h" || echo "[DOWN] $h"; done`
- 网站可用性：`curl --output /dev/null --silent --head --fail --max-time 10 "$url"`
- 网卡信息：`ip addr show "$iface" || ifconfig "$iface"`；路由 `ip route | grep "$iface"`。

**⑦ 自动化**
- 幂等装包：`dpkg -l | grep -q "^ii  $pkg" || sudo apt-get install -y "$pkg"`
- 加 cron：`(crontab -l 2>/dev/null; echo "0 2 * * * /path/script.sh") | crontab -`
- 服务重启：`systemctl is-active --quiet "$svc" && sudo systemctl restart "$svc" || sudo systemctl start "$svc"`

**⑧ 文件操作**
- 镜像同步（含删除）：`rsync -avz --delete "$src/" "$dst/"`
- 清理旧文件：`find "${1:-/tmp}" -type f -mtime +"${2:-7}" -exec rm -v {} \;`
- 目录占用 Top：`du -sh "$path"/* | sort -rh | head -20`

**⑨ 系统/开发**
- 信息采集：把 `hostname`、`uname -a`、`lscpu`、`free -h`、`df -h`、`ip -br addr`、`who` 汇入报告。
- Git 批量更新：对每个 repo `[ -d "$repo/.git" ] && (cd "$repo"; git fetch --all; git pull origin "$(git branch --show-current)")`
- 远程执行：`ssh "$server" "bash -s" < ./local_script.sh`

**cron 格式**：`分(0-59) 时(0-23) 日(1-31) 月(1-12) 周(0-7，0/7=周日)`。

## 示例

带时间戳的目录备份脚本（最小可用）：

```bash
#!/bin/bash
backup_dir="/data/backups"
source_dir="/var/www"
ts=$(date +%Y%m%d_%H%M%S)
tar -czf "$backup_dir/backup_$ts.tar.gz" "$source_dir"
echo "Backup completed: backup_$ts.tar.gz"
```

磁盘超阈告警 + 邮件（接入通知）：

```bash
#!/bin/bash
threshold=90
disk=$(df -h | grep "/dev/sda1" | awk '{print $5}' | cut -d% -f1)
if [ "$disk" -gt "$threshold" ]; then
    mail -s "Disk Alert" admin@example.com <<< "Disk usage: $disk%"
fi
```

每天凌晨 2 点跑备份：`(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -`

## 注意事项

- **先非生产验证**：备份/删除/轮转类脚本误删风险高，`rm -r`、`--delete`、`find -exec rm` 务必先在测试目录跑通。
- **绝对路径**：cron 环境 PATH/CWD 与登录 shell 不同，脚本内一律用绝对路径，避免相对路径踩空。
- **变量加引号**：`"$var"` 处理含空格/特殊字符的路径；裸 `$var` 会分词出错。
- **权限**：建用户、装包、重启服务、改 cron 多需 root/sudo；按最小权限运行。
- **密码不硬编码**：`mysqldump -p"$db_pass"`、`db_pass="..."` 仅作模板演示；生产用 `~/.my.cnf`（chmod 600）、环境变量或密钥管理，勿提交进仓库。
- **加密口令**：`openssl enc` 会交互或从 stdin 读口令，妥善保管，丢了无法解密。
- **告警去重**：监控脚本直接 cron 高频跑会刷屏告警，建议加状态文件做去抖/静默窗口。
- **bashism 提醒**：本套用了数组 `("${a[@]}")`、`[[`、`&>`、`==`——只在 bash 下可靠；要可移植转 `posix-shell-scripting`。
- **调试**：`bash -x script.sh` 逐行追踪；健壮化加 `set -euo pipefail` + `trap`，详见 `bash-defensive-patterns`。

## 互见

- requires：`bash-defensive-patterns` —— 套模板前先掌握 `set -euo pipefail`/trap/错误处理，避免脚本静默失败。
- related：`posix-shell-scripting` —— 需跨 dash/BusyBox 可移植时改用；`powershell-windows` —— Windows 侧对应能力；`operational-runbook-writer` —— 把这些脚本沉淀成可执行运维手册。
- combines_with：`shellcheck-linting` —— 提交前静态检查脚本质量；`git-hooks-automation` / `ci-cd-pipeline-builder` —— 把校验与脚本纳入门禁与流水线调度。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
