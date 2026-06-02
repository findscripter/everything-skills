---
name: cisco-ios-review-patterns
title: Cisco IOS/IOS-XE 配置审查模式
description: 当审查 Cisco IOS/IOS-XE 配置片段、规划变更窗口或从路由器/交换机取证时使用；做只读取证清单、配置模式定位、通配符掩码与 ACL 方向核对，产出可执行的变更检查清单；不适用于直接在生产设备下发变更或非 Cisco 平台。触发词：Cisco IOS、show running-config、ACL 通配符掩码、变更窗口
domain: 安全/ops
triggers: [审查 Cisco IOS/IOS-XE 配置, 选择只读 show 命令排障, 核对 ACL 通配符掩码与接口方向, 规划网络变更窗口与回滚, 从路由器/交换机收集取证证据]
tags: [cisco, ios, 网络, acl, 安全, ops, 变更管理, 取证]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [show running-config, configure terminal, copy running-config startup-config, show ip access-lists]
requires: []
related: [network-interface-health, wireshark-traffic-analysis, cloud-misconfig-auditor, k8s-security-policies]
combines_with: [change-management-request, security-incident-response]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

在以下场景使用本技能：

- 计划性变更前审查 IOS / IOS-XE 配置片段。
- 排障时挑选只读 `show` 命令，避免误伤在线业务。
- 核对 ACL 通配符掩码（wildcard mask）与接口应用方向（in/out）。
- 解释全局、接口、路由进程、line 等配置模式的层级。
- 确认变更已在 running-config 生效，并在验证后才有意识地保存到 startup-config。

**不该用边界**：本技能只提供「模式」与「审查清单」，IOS 示例不是可直接套用到生产的成品配置。真正在设备上动手前，必须自行确认平台型号、接口命名、当前配置、回滚路径与带外（OOB）访问。非 Cisco 平台（如 Juniper、Arista）不适用。

## 步骤

推荐如下安全工作流，宁慢勿错：

1. 用只读命令抓取当前状态（基线）。
2. 审查精确的候选配置，逐行核对掩码与方向。
3. 确认管理通道不会被自己锁死（vty / ACL / 默认路由）。
4. 仅在维护窗口内下发最小变更。
5. 再次读取状态，与基线对比；**只有验证通过后**才保存配置。

## 指令

### 配置模式参照

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

关键约束：`running-config` 是当前生效的活动内存；`startup-config` 才能在重启后留存。**不要因为命令被接受就立刻保存**——先验证行为，确认变更获批后再执行 `copy running-config startup-config`。

### 只读取证集合

完整配置可能含密钥、客户名或私有拓扑，**不要把整份配置贴进工单**，只收集需要的特定 section：

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

### 通配符掩码核对

IOS ACL 及许多路由语句用的是**通配符掩码**而非子网掩码，二者按位取反：

```text
Subnet mask       Wildcard mask
255.255.255.255   0.0.0.0
255.255.255.252   0.0.0.3
255.255.255.0     0.0.0.255
255.255.0.0       0.0.255.255
```

部署前务必复核掩码：若误把子网掩码当作通配符掩码使用，可能匹配到远超预期的流量，造成放行或丢弃失控。

## 示例

一个带显式拒绝兜底的扩展 ACL（注意末行 `log` 便于审计命中）：

```text
ip access-list extended WEB-IN
  10 permit tcp 192.0.2.0 0.0.0.255 any eq 443
  999 deny ip any any log
```

审查要点：
- `0.0.0.255` 表示匹配 `192.0.2.0/24` 整段，确认这正是意图范围。
- 末行 `deny ip any any log` 显式收口，便于在 `show ip access-lists` 中观察命中计数。
- 应用到接口时要核对方向：入向流量用 `ip access-group WEB-IN in`。

## 注意事项

- 把 IOS 示例当模式，不当成品；下发前确认平台、接口名、回滚路径、带外访问。
- 先验证、后保存：`running-config` 变更生效不等于已持久化，验证通过才 `copy ... startup-config`。
- 取证最小化：按 section 收集，避免泄露密钥 / 客户名 / 私有拓扑。
- 通配符掩码 ≠ 子网掩码，按位取反，部署前逐条复核。
- 改 vty / 管理 ACL / 默认路由前，先确保不会把自己锁在门外。

## 互见

- ACL 与防火墙策略审查类技能（通配符掩码、方向、显式拒绝兜底的通用思路可复用）。
- 变更管理 / 维护窗口与回滚类技能。

---

采编自 affaan-m/everything-claude-code（MIT）。
