---
name: network-interface-health
title: ネットワークインターフェースヘルス
description: ルーター、スイッチ、Linuxホスト上のインターフェースエラー、ドロップ、CRC、デュプレックス不一致、フラッピング、速度ネゴシエーション問題、カウンタートレンドを診断する。
domain: 安全/ops
triggers: [CRC, ifInErrors, ifOutDiscards, runts, giants, ethtool, show interfaces]
tags: [ops, crc, linux]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [devops-troubleshooter, sre-incident-responder, observability-strategy-designer, wireshark-traffic-analysis]
combines_with: [wireshark-traffic-analysis, devops-troubleshooter, sre-incident-responder]
license: CC-BY-4.0
source: affaan-m/everything-claude-code
source_license: MIT
---
# Network Interface Health

Use this skill when network symptoms may be caused by the physical link, switch ports, cabling, transceivers, duplex settings, or a congested interface.

## When to Use

- A host or VLAN has packet loss, latency spikes, or intermittent unreachability.
- A switch or router interface shows CRCs, runts, giants, drops, resets, or flaps.
- You need to compare both ends of a link before replacing hardware.
- A change window requires before-and-after evidence from interface counters.
- Monitoring reports rising `ifInErrors`, `ifOutErrors`, or `ifOutDiscards`.

## How It Works

Interface counters are evidence, but the trend matters more than the absolute value. Capture a baseline, wait a measurement interval, capture again, then compare the deltas.

```text
show interfaces <interface>
show interfaces <interface> status
show logging | include <interface>|changed state|line protocol
```

For Linux hosts:

```text
ip -s link show <interface>
ethtool <interface>
ethtool -S <interface>
```

## Counter Reference

| Counter | Meaning | Common Causes |
| --- | --- | --- |
| CRC | Received frame failed its checksum | Bad cable, dirty fiber, bad optic, duplex mismatch |
| input errors | Aggregate of receive-side errors | Check the sub-counters before drawing conclusions |
| runts | Frames smaller than the minimum Ethernet size | Duplex mismatch, collision domain, bad NIC |
| giants | Frames larger than the expected MTU | MTU mismatch or jumbo-frame boundary |
| input drops | The device could not accept inbound packets | Bursts, oversubscription, CPU path, queue pressure |
| output drops | The transmit queue discarded packets | Congestion, QoS policy, undersized uplink |
| resets | Interface hardware reset | Flapping, keepalives, driver, optic, power |
| collisions | Ethernet collision counter | Half-duplex or negotiation mismatch |

## Diagnostic Flow

### CRC or Input Errors

1. Confirm the counter is increasing (not just historical).
2. Check both ends of the link. Receive-side errors usually point to the signal arriving at that side, not at the port reporting the errors.
3. Replace the patch cable, or clean/replace the fiber and optics.
4. Confirm the speed/duplex settings match on both sides.
5. Check the logs for flap events around the same timestamp.

### Drops

1. Separate input drops from output drops.
2. Compare the interface rate against capacity.
3. Check the QoS policy, queue counters, and whether the link is an oversubscribed uplink.
4. Treat queue tuning as a secondary measure. First prove whether the link is congested.

### Duplex and Speed

Prefer auto-negotiation on modern Ethernet links when both sides support it. If you must hard-set one side, configure both sides explicitly and document the reason. Never set one side to a fixed speed/duplex and leave the other on auto.

```text
show interfaces <interface> | include duplex|speed
```

## Safe Parser Example

Slice each interface block from one header to the next. Do not use arbitrary character windows. With large interface blocks, counters can go missing or be attributed to the wrong port.

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

## Examples

### CRC on a Single Switch Port

1. Capture the counters for the local port.
2. Capture the counters for the connected remote port.
3. Replace the cable or optics before changing routing or firewall rules.
4. Clear the counters only after recording a baseline.
5. Recheck after a fixed interval.

### Internet Is Slow but the LAN Is Fine

1. Check the WAN interface for drops/errors.
2. Check the LAN uplink utilization and output drops.
3. If the WAN link is clean but throughput is low, check the gateway CPU.
4. Compare wired and wireless tests before blaming upstream services.

## Anti-Patterns

- Clearing counters before saving a baseline.
- Checking only one side of the link.
- Assuming every past CRC is an active problem when there is no time window.
- Using auto-negotiation on one side and a fixed speed/duplex on the other.
- Treating output drops as a cable problem before checking for congestion.

## Related Information

- Agent: `network-troubleshooter`
- Skill: `network-config-validation`
- Skill: `homelab-network-setup`
