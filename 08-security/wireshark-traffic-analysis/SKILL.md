---
name: wireshark-traffic-analysis
title: Wireshark 流量分析
description: 当需要捕获、过滤并分析网络数据包以排障、做安全调查或性能优化时使用；用 Wireshark/tshark 抓包、写显示过滤器、追踪 TCP/HTTP 流、跑统计与专家信息、导出对象与证据；不适用于无授权抓取他人流量、无密钥还原 TLS 明文、纯应用层日志分析；触发词：Wireshark、tshark、抓包、PCAP、显示过滤器、display filter、follow stream、流量分析、packet capture、网络排障
domain: 安全/ops
triggers: [Wireshark, tshark, 抓包, PCAP, 显示过滤器, display filter, follow stream, 流量分析, packet capture, 网络排障]
tags: [wireshark, tshark, pcap, network-analysis, packet-capture, security, troubleshooting, ops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Wireshark, tshark, dumpcap, editcap]
requires: []
related: [threat-detection-hunting, security-incident-response, shodan-reconnaissance, firmware-reverse-analyst]
combines_with: [threat-detection-hunting, security-incident-response, penetration-testing-methodology]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 网络排障：连接超时、丢包、重传、慢应用，需要从数据包层面定位。
- 安全调查：可疑流量、端口扫描、ARP 欺骗、恶意软件 C2 信标、明文凭据外泄取证。
- 协议分析：还原 TCP/HTTP/DNS 会话，提取传输的文件与内容。
- 性能分析：协议分布、会话/端点排行、随时间的吞吐曲线。

**不该用边界**：
- 未获授权抓取他人网络流量（违法/违规），必须先确认授权与隐私合规。
- 想看 TLS/HTTPS 明文但无服务端私钥或浏览器 `SSLKEYLOGFILE`：现代 ECDHE 密码套件无法被动解密，本技能不覆盖。
- 纯应用层日志/指标分析（用 APM、日志系统），不需要包级抓取。

Agent 优先用命令行 `tshark`/`dumpcap` 实现自动化与可复现；GUI Wireshark 用于交互式深挖与可视化。

## 步骤

1. **抓包**：实时抓包用 `dumpcap`/`tshark`（需管理员/root 权限），离线分析直接读 PCAP/PCAPNG。抓包阶段用**捕获过滤器**（BPF 语法）限制数据量。
2. **过滤**：用**显示过滤器**（Wireshark 语法，与捕获过滤器不同）按 IP、端口、协议、TCP 标志、内容、分析标记逐步收窄。
3. **追踪流**：对可疑包 Follow TCP/UDP/HTTP/TLS Stream，还原完整会话与请求/响应配对。
4. **统计**：看协议分层（Protocol Hierarchy）、会话（Conversations）、端点（Endpoints）、流图、I/O 图，定位异常通信对与时间规律。
5. **安全研判**：检测端口扫描、ARP 欺骗、异常 DNS、大流量外传；用专家信息（Expert Information）看自动诊断。
6. **导出证据**：导出过滤子集、HTTP 对象（文件）、文本/CSV 分析结果，记录方法与发现。

## 指令

捕获过滤器（BPF，抓包前生效，限制采集）：
```
host 192.168.1.100              # 仅某主机
port 80                          # 仅某端口
net 192.168.1.0/24               # 仅某网段
not arp                          # 排除 ARP
host 192.168.1.100 and port 443  # 组合
```

显示过滤器（抓后分析，语法不同于上）：
```
# 地址 / 端口
ip.addr == 192.168.1.1     ip.src == ...     ip.dst == ...
tcp.port == 80    udp.port == 53    tcp.dstport == 443    tcp.srcport == 22

# 协议
http      dns      ftp      ssh      icmp      arp      dhcp      smb || smb2
tls || ssl                                   # 加密 web

# TCP 标志
tcp.flags.syn == 1                           # 连接尝试
tcp.flags.reset == 1                          # RST 复位
tcp.flags.syn == 1 && tcp.flags.ack == 0      # 仅 SYN（初始/扫描特征）

# 内容
frame contains "password"     http.request.uri contains "login"

# 分析标记（排障关键）
tcp.analysis.retransmission   tcp.analysis.duplicate_ack
tcp.analysis.zero_window      dns.flags.rcode != 0

# 逻辑组合：&&  ||  !  ()
(ip.src == 192.168.1.1 || ip.src == 192.168.1.2) && tcp.port == 443
```

命令行（Agent 自动化首选）：
```bash
# 抓包到文件（-i 接口, -c 包数, -a 时长秒, -f 捕获过滤器）
tshark -i eth0 -f "port 443" -a duration:60 -w out.pcapng

# 读 PCAP 并应用显示过滤器(-Y)，自定义字段输出(-T fields)
tshark -r out.pcapng -Y "http.request" -T fields -e ip.src -e http.host -e http.request.uri

# 统计：协议分层 / 会话
tshark -r out.pcapng -q -z io,phs
tshark -r out.pcapng -q -z conv,tcp

# 追踪某条 TCP 流(stream 编号从 0 起)
tshark -r out.pcapng -q -z follow,tcp,ascii,0

# 切分大文件 / 提取时间段
editcap -c 100000 big.pcapng split.pcapng
```

GUI 关键动作：Follow > TCP/HTTP Stream；Statistics > Protocol Hierarchy / Conversations / Endpoints / I/O Graph；Analyze > Expert Information；File > Export Objects > HTTP（提取文件）；File > Export Specified Packets（存过滤子集）。常用快捷键：Ctrl+E 起停抓包、Ctrl+O 打开、Ctrl+F 查找、Ctrl+Shift+X 清除过滤器。

## 示例

**示例 1 · HTTP 明文凭据取证**
```
显示过滤器: http.request.method == "POST"
→ 定位登录表单包 → Follow HTTP Stream → 搜 username/password 参数
结论: 凭据以明文 form-data 传输（高危）。
```

**示例 2 · 恶意软件 C2 信标识别**
```
1. 过滤 dns，找随机域名、异常查询模式
2. 检查高频固定间隔的 beaconing
3. 锁定可疑 IP: ip.dst == 可疑IP，分析流量规律
指标: 规律时间间隔 + 编码/加密载荷 + 异常端口/协议。
```

**示例 3 · Web 应用变慢排障**
```
1. ip.addr == WEB_SERVER 锁定目标
2. Statistics > Service Response Time 看响应时延
3. tcp.analysis.retransmission 看重传
4. I/O Graph 看吞吐随时间形态
结论: 大量 TCP 重传 → 网络拥塞/丢包。
```

**端口扫描检测**
```
ip.src == 可疑IP && tcp.flags.syn == 1   # 单源 SYN 打很多目标端口
→ 配合 Statistics > Conversations 看单源命中大量目的端口。
```

## 注意事项

- **合规第一**：仅抓授权流量；含敏感数据的 PCAP 要妥善加密保存，按隐私政策处理，避免不必要地采集凭据。
- **捕获过滤器 ≠ 显示过滤器**：前者是 BPF（`host`/`port`/`net`），抓包时生效；后者是 Wireshark 语法（`ip.addr`/`tcp.port`），抓后分析。二者语法不可混用。
- **性能**：大流量抓包用捕获过滤器限流；长会话定期保存；抓包时关闭名称解析（`tshark -n`）；用 `editcap` 切分大文件，别靠删包来"过滤"，改用显示过滤器。
- **加密**：无密钥看不到 TLS 明文。需解密时配 Edit > Preferences > Protocols > TLS 导入私钥，或浏览器导出 pre-master secret（`SSLKEYLOGFILE`）；部分现代密码套件无法被动解密。
- **过滤器报错**：输入框变红即语法错；逐步增量构建，用 Expression 按钮选合法字段名。
- **抓不到包**：确认选对接口、有管理员权限、网卡激活；必要时关闭混杂模式。
- **专家信息速查**：重传=丢包，重复 ACK=可能丢失，Zero Window=接收方缓冲满，RST=连接被复位/拦截，Out-of-Order=重排（少量正常，过多有问题）。

## 互见

- code-reviewer：审计涉及网络协议/安全的代码时，可结合本技能的抓包证据交叉验证实际通信行为。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT），适配重写为中文 Agent 消费版。
