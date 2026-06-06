---
name: cisco-ios-review-patterns
title: Cisco IOSパターン
description: showコマンド、コンフィグ階層、ワイルドカードマスク、ACL配置、インターフェースハイジーン、安全な変更ウィンドウ検証のためのCisco IOSおよびIOS-XEレビューパターン。
domain: 安全/ops
triggers: []
tags: [cisco, ios, acl, ops]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [network-interface-health, wireshark-traffic-analysis, cloud-misconfig-auditor, k8s-security-policies]
combines_with: [change-management-request, security-incident-response]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Cisco IOS Patterns

Use this skill when you need to review Cisco IOS or IOS-XE snippets, build a change-window checklist, or collect evidence from a router or switch in a way that does not make an incident worse.

## When to use

- Reviewing an IOS or IOS-XE configuration before a planned change.
- Choosing read-only `show` commands for troubleshooting.
- Checking ACL wildcard masks and interface direction.
- Explaining global, interface, routing-process, and line configuration modes.
- Confirming that a change ran against the running configuration and was deliberately saved.

## Operating rules

Treat the IOS examples as patterns, not as production-ready changes. Before making any change on a real device, confirm the platform, interface names, current configuration, rollback path, and out-of-band access.

Prefer this workflow:

1. Capture the current state with read-only commands.
2. Review the exact candidate configuration.
3. Confirm that management access will not be locked out.
4. Apply the smallest change within a maintenance window.
5. Read the state again, compare it against the baseline, and save only after verification.

## Mode reference

```text
Router> enable
Router# show running-config
Router# configure terminal
Router(config)# interface GigabitEthernet0/1
Router(config-if)# description UPLINK-TO-CORE
Router(config-if)# no shutdown
Router(config-if)# exit
Router(config)# end
Router# show running-config interface GigabitEthernet0/1
```

The `running-config` is active memory. The `startup-config` survives a reload.
Do not save a change just because the command was accepted. Verify the behavior first, and use `copy running-config startup-config` only once the change is approved.

## Read-only collection

```text
show version
show inventory
show processes cpu sorted
show memory statistics
show logging
show running-config | section line vty
show running-config | section interface
show running-config | section router bgp
show ip interface brief
show interfaces
show interfaces status
show vlan brief
show mac address-table
show spanning-tree
show ip route
show ip protocols
show ip access-lists
show route-map
show ip prefix-list
```

Because a configuration may contain secrets, customer names, or private topology, collect only the specific sections you need rather than dumping the full configuration into a ticket.

## Wildcard masks

IOS ACLs and many routing statements use wildcard masks, not subnet masks.

```text
Subnet mask       Wildcard mask
255.255.255.255   0.0.0.0
255.255.255.252   0.0.0.3
255.255.255.0     0.0.0.255
255.255.0.0       0.0.255.255
```

Review wildcard masks before deployment. If a subnet mask is mistakenly used in place of a wildcard mask, the rule can match more traffic than intended.

```text
ip access-list extended WEB-IN
  10 permit tcp 192.0.2.0 0.0.0.255 any eq 443
  999 deny ip any any log
```
