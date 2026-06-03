---
name: firmware-reverse-analyst
title: 固件逆向与 IoT 安全
description: 当需要对 IoT/嵌入式设备固件做提取、逆向与安全评估时使用；用 binwalk/Ghidra/QEMU 等完成固件解包、文件系统与二进制分析、漏洞挖掘并产出评估报告；不适用于未授权设备入侵、绕过 DRM 或制作恶意固件。触发词：固件、binwalk、IoT 安全
domain: 安全/appsec
triggers: [固件分析, 固件逆向, 固件提取, binwalk 解包, IoT 安全, 嵌入式安全, SquashFS 提取, 硬编码凭据, QEMU 固件仿真, UART/JTAG, 命令注入, 固件安全评估]
tags: [安全, misc, 固件, iot, 嵌入式, 逆向工程, binwalk, ghidra, qemu, 漏洞挖掘]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [binwalk, Ghidra, radare2, QEMU, Firmadyne, jefferson, ubi_reader, checksec, unsquashfs, strings]
requires: []
related: [binary-analysis-patterns, anti-reversing-techniques, arm-cortex-firmware-expert, yara-rule-authoring]
combines_with: [binary-analysis-patterns, anti-reversing-techniques, wireshark-traffic-analysis]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 对路由器、摄像头、智能家居等 IoT/嵌入式设备的固件做提取、解包与逆向。
- 在固件中搜索硬编码凭据、后门账户、私钥等敏感信息。
- 分析固件内二进制（httpd、cgi 等）的架构与漏洞，做命令注入/内存破坏类挖掘。
- 用 QEMU/Firmadyne 仿真固件并动态测试 Web 服务。
- 产出结构化的固件安全评估报告。

不该用（负边界）：
- 任务与固件/嵌入式安全无关，或属于普通 Web/主机渗透——另选对应技能。
- 未获设备所有者授权的入侵、非法绕过 DRM/授权、制作或植入恶意固件、工业间谍——一律拒绝。
- 缺少授权证明、目标设备信息或成功标准时——先停下来澄清，不要直接动手。

## 步骤

1. 识别：用 `file`/`binwalk` 判别格式，熵分析检测加密/压缩，`strings` 初筛敏感词。
2. 提取：`binwalk -e` 自动解包；嵌套固件用矩阵模式 `-eM`；特定文件系统（SquashFS/JFFS2/UBIFS）用专用工具。
3. 文件系统分析：在 rootfs 中查配置、`passwd/shadow`、私钥、Web 脚本（cgi/php/lua）与可疑二进制。
4. 二进制分析：确认架构（`readelf -h`），用 Ghidra/radare2 反汇编，`checksec` 看保护属性。
5. 仿真验证：QEMU 用户态 chroot 或 Firmadyne 全系统仿真，动态测试网络服务。
6. 报告：按检查清单核对，套用报告模板记录发现、PoC 与修复建议。

## 指令

- 先确认授权与合法研究背景，再进行任何提取与分析。
- 优先 binwalk v3（Rust 重写，更快、误报更少）。
- 命中加密固件（高熵且无可识别文件系统）时，转向硬件提取或寻找解密逻辑，不要硬解。
- 凭据/私钥发现需脱敏处理，报告中标注位置而非明文外泄。
- 需要更细示例时，可在源仓库 `resources/implementation-playbook.md` 查阅。

## 示例

识别与提取：
```bash
file firmware.bin
binwalk firmware.bin
binwalk -E firmware.bin            # 熵分析（检测压缩/加密）
binwalk -e firmware.bin           # 自动解包
binwalk -eM firmware.bin          # 递归矩阵模式（嵌套固件）
unsquashfs filesystem.squashfs    # SquashFS
jefferson filesystem.jffs2 -d output/   # JFFS2
ubireader_extract_images firmware.ubi   # UBIFS
```

文件系统取证：
```bash
find . -name "passwd" -o -name "shadow"
grep -rn "BEGIN RSA PRIVATE KEY" .
strings -a firmware.bin | grep -i "password\|key\|secret"
find . -name "*.cgi" -o -name "*.php" -o -name "*.lua"
checksec --dir=./bin/
```

二进制与仿真：
```bash
readelf -h bin/httpd              # 确认架构（ARM:LE:32:v7 / MIPS:BE:32 等）
# QEMU 用户态仿真
cp /usr/bin/qemu-arm-static ./squashfs-root/usr/bin/
sudo chroot squashfs-root /usr/bin/qemu-arm-static /bin/httpd
# Firmadyne 全系统仿真
./scripts/getArch.sh ./images/1.tar.gz
./scripts/makeImage.sh 1
./scripts/inferNetwork.sh 1
./scratch/1/run.sh
```

常见漏洞模式（命令注入）：
```c
// 危险模式：用户输入直接拼进 system()
char cmd[256];
sprintf(cmd, "ping %s", user_input);
system(cmd);
// 测试载荷： ; id   | cat /etc/passwd   `whoami`   $(id)
```

评估检查清单（节选）：
```
[ ] 固件提取成功      [ ] 架构识别
[ ] 硬编码凭据搜索    [ ] Web 接口分析
[ ] checksec 二进制保护属性
[ ] 调试接口(UART/JTAG)是否禁用
[ ] 更新机制/签名校验  [ ] 已知 CVE 核查
```

## 注意事项

- 合法用途：经授权的安全审计、漏洞赏金、学术研究、CTF、个人设备分析。
- 重点漏洞类别：认证缺陷（硬编码/后门账户、弱哈希、登录绕过）、命令注入、内存破坏（栈/堆溢出、格式化字符串、整数溢出、UAF）、信息泄露（调试接口、详细报错、明文更新）。
- 高熵固件多为加密/压缩，盲目解包会失败；先做熵分析判断。
- 跨架构编译漏洞测试程序：ARM 用 `arm-linux-gnueabi-gcc`，MIPS 用 `mipsel-linux-gnu-gcc`。
- 本技能不替代针对具体环境的验证与专家复核；输出仅作研究参考。

## 互见

- 通用二进制逆向 / Ghidra 脚本化分析技能。
- Web 应用漏洞挖掘技能（固件内 Web 接口可衔接）。
- 漏洞利用开发 / 内存破坏利用编写技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
