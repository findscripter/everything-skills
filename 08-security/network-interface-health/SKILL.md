---
name: network-interface-health
title: 网络接口健康诊断（错误/丢包/双工失配）
description: 当怀疑丢包、时延抖动、间歇不可达由物理链路/交换端口/线缆光模块/双工或拥塞引起时使用；做接口计数器取基线-等间隔-复测对比、CRC/runts/giants/drops/resets 归因、双工速率失配排查，产出方向定位与处置清单；不适用于纯路由/防火墙策略、应用层与 BGP/OSPF 控制面、DNS 解析故障；触发词：接口错误、丢包、CRC、双工失配、链路抖动、ifInErrors
domain: 安全/ops
triggers: [接口错误, 丢包, CRC, 双工失配, 链路抖动, 端口 flapping, ifInErrors, ifOutDiscards, runts, giants, 速率协商, 计数器趋势, ethtool, show interfaces]
tags: [网络, ops, 接口诊断, crc, 丢包, 双工, 交换机, 路由器, linux, 物理层]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [show interfaces, ethtool, "ip -s link", python]
requires: []
related: [devops-troubleshooter, sre-incident-responder, observability-strategy-designer, wireshark-traffic-analysis]
combines_with: [wireshark-traffic-analysis, devops-troubleshooter, sre-incident-responder]
license: CC-BY-4.0
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

当网络症状可能源于**物理链路、交换端口、线缆、光模块、双工设置或拥塞接口**时使用：

- 主机或 VLAN 出现丢包、时延尖峰、间歇性不可达。
- 交换机/路由器接口出现 CRC、runts、giants、drops、resets 或端口 flapping。
- 换硬件前需要对比链路两端，判断信号问题落在哪一侧。
- 变更窗口里需要接口计数器的「变更前/后」证据。
- 监控报告 `ifInErrors`、`ifOutErrors` 或 `ifOutDiscards` 在增长。

**不该用边界**：

- 纯路由/防火墙策略、ACL、NAT 问题（接口物理层正常时不在此范围）。
- BGP/OSPF 等控制面邻接故障、DNS 解析故障、应用层问题。
- 需要逐包还原会话内容时，改用抓包分析（见 `wireshark-traffic-analysis`）。

## 步骤

核心原则：**计数器是证据，但趋势比绝对值更重要**。取基线 → 等一个测量间隔 → 复测 → 比增量。历史累计的 CRC 不等于当前活跃故障。

通用诊断流程：

1. **取基线**：先抓一次计数器，记录时间戳。**先记基线再清零**，绝不先清后记。
2. **等间隔复测**：等一个固定间隔后再抓一次，比较增量；只对「正在增长」的计数器下结论。
3. **按计数器归因**（见下表），分清是接收侧（CRC/input）还是发送侧（output drops）、是物理层还是拥塞。
4. **对比链路两端**：接收侧错误通常指向到达**该侧**的信号，而非报错端口本身。
5. **核对双工/速率**：确认两端速率与双工一致，并查同一时间戳前后的 flap 日志。

设备侧（Cisco 风格）命令：

```text
show interfaces <interface>
show interfaces <interface> status
show logging | include <interface>|changed state|line protocol
```

Linux 主机侧命令：

```text
ip -s link show <interface>
ethtool <interface>
ethtool -S <interface>
```

## 指令

### 计数器参考表

| 计数器 | 含义 | 常见原因 |
| --- | --- | --- |
| CRC | 收帧校验和失败 | 坏线缆、脏光纤、坏光模块、双工失配 |
| input errors | 接收侧错误汇总 | 下结论前先看子计数器拆分 |
| runts | 小于以太网最小帧 | 双工失配、冲突域、坏 NIC |
| giants | 大于预期 MTU 的帧 | MTU 失配或巨帧边界 |
| input drops | 设备无法接收入向包 | 突发、超额订阅、走 CPU 路径、队列压力 |
| output drops | 发送队列丢包 | 拥塞、QoS 策略、上行带宽不足 |
| resets | 接口硬件复位 | flapping、keepalive、驱动、光模块、供电 |
| collisions | 以太网冲突 | 半双工或协商失配 |

### CRC / input errors 排查

1. 确认计数器在**增长**（而非历史累计）。
2. 检查链路两端：接收侧错误通常指向到达该侧的信号，而非报错端口。
3. 换跳线，或清洁/更换光纤与光模块。
4. 确认两端速率/双工设置一致。
5. 查同一时间戳前后的 flap 事件日志。

### drops 排查

1. 区分 input drops 与 output drops。
2. 把接口速率和容量对比。
3. 检查 QoS 策略、队列计数器、链路是否为超额订阅的上行。
4. 队列调优只作二线手段——**先证明链路是否真的拥塞**。

### 双工与速率

两端都支持时，现代以太网链路**优先自动协商**。必须固定一端时，两端都显式配置并记录原因。**绝不允许一端固定速率/双工、另一端 auto**（这是双工失配的经典根因）。

```text
show interfaces <interface> | include duplex|speed
```

## 示例

### 安全解析器（按接口块切片）

把每个接口块从一个 header 切到下一个 header，**不要用任意字符窗口**——大接口块可能漏掉计数器或把计数器错配到别的端口。

```python
import re
from typing import Any

HEADER_RE = re.compile(
    r"^(?P<name>\S+) is (?P<status>(?:administratively )?down|up), "
    r"line protocol is (?P<protocol>up|down)",
    re.I | re.M,
)
ERROR_RE = re.compile(r"(?P<input>\d+) input errors, (?P<crc>\d+) CRC", re.I)
DROP_RE = re.compile(r"(?P<output>\d+) output errors", re.I)
DUPLEX_RE = re.compile(r"(?P<duplex>Full|Half|Auto)-duplex,\s+(?P<speed>[^,]+)", re.I)

def parse_show_interfaces(raw: str) -> list[dict[str, Any]]:
    headers = list(HEADER_RE.finditer(raw))
    interfaces = []
    for index, header in enumerate(headers):
        end = headers[index + 1].start() if index + 1 < len(headers) else len(raw)
        block = raw[header.start():end]
        errors = ERROR_RE.search(block)
        drops = DROP_RE.search(block)
        duplex = DUPLEX_RE.search(block)
        interfaces.append({
            "name": header.group("name"),
            "status": header.group("status"),
            "protocol": header.group("protocol"),
            "duplex": duplex.group("duplex") if duplex else "unknown",
            "speed": duplex.group("speed").strip() if duplex else "unknown",
            "input_errors": int(errors.group("input")) if errors else 0,
            "crc_errors": int(errors.group("crc")) if errors else 0,
            "output_errors": int(drops.group("output")) if drops else 0,
        })
    return interfaces
```

### 单个交换端口出 CRC

1. 取本地端口计数器。
2. 取对端（远端）端口计数器。
3. 改路由/防火墙规则前，先换线缆或光模块。
4. **记录基线后**才清零计数器。
5. 间隔一段后复查增量。

### 上网慢但局域网正常

1. 查 WAN 接口的 drops/errors。
2. 查 LAN 上行的利用率与 output drops。
3. WAN 链路干净但吞吐仍低 → 查网关 CPU。
4. 怪上游服务前，先对比有线 vs 无线测试。

## 注意事项

反模式（务必避免）：

- 保存基线前就清零计数器（丢掉对比基准）。
- 只检查链路的一侧。
- 没有时间窗就把所有历史 CRC 当成活跃故障。
- 一端用自动协商、另一端固定速率/双工（经典双工失配）。
- 没确认拥塞就把 output drops 当成线缆问题。

## 互见

- related：`wireshark-traffic-analysis` —— 计数器定位到方向后，逐包还原确认丢包/重传根因。
- related：`devops-troubleshooter` —— 接口层故障常是更大生产事故的一环，配合系统级排障。
- related：`sre-incident-responder` —— 把接口证据并入事件时间线与升级流程。
- combines_with：`observability-strategy-designer` —— 将 `ifInErrors`/`ifOutDiscards` 等计数器纳入趋势监控与告警基线。

---
采编自 affaan-m/everything-claude-code（MIT），适配重写为中文 Agent 消费版（源为日文 `network-interface-health`）。
