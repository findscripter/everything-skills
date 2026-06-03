---
name: hybrid-cloud-networking
title: 混合云网络连接
description: 当需要打通本地数据中心与公有云（AWS/Azure/GCP）的网络时使用；做选型 VPN/专线、用 Terraform 配置网关与 BGP 路由、设计 Hub-Spoke/多云拓扑并落实高可用与安全基线；不适用于纯云内网络、应用层组网或与混合云互联无关的任务；触发词：本地连云、VPN、专线、ExpressRoute、Direct Connect、BGP、混合云
domain: 研发/devops
triggers: [本地数据中心连云, Site-to-Site VPN, Direct Connect 专线, Azure ExpressRoute, GCP Cloud Interconnect, BGP 动态路由, Hub-and-Spoke 拓扑, 多云互联, VPN 隧道高可用, 混合云迁移]
tags: [混合云, 网络, vpn, 专线, bgp, terraform, aws, azure, gcp, 高可用, devops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Terraform, AWS CLI, Azure CLI]
requires: []
related: [cloud-network-engineer, multi-cloud-architecture, service-mesh-architect, mtls-zero-trust-config]
combines_with: [terraform-specialist, terraform-module-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

需要在本地数据中心与公有云之间建立安全、稳定、可预期的网络连通时使用，典型场景：

- 把本地机房延伸到云，或逐步上云迁移。
- 实现混合 active-active、跨区域/多云容灾。
- 满足合规要求，流量需走私有链路而非公网。

不该用的边界：

- 任务与混合云互联无关（如纯云内 VPC 子网划分、应用层网关、CDN）。
- 只需单云内部组网，不涉及本地侧或跨云。
- 缺少必需输入（本地侧公网 IP、ASN、CIDR、权限、SLA 目标）时，先停下来追问，不要臆造。
- 产出不能替代针对具体环境的验证、测试与专家评审。

## 步骤

1. **澄清目标与约束**：带宽需求、延迟/SLA、预算、合规、是否需要冗余；收集本地侧公网 IP、BGP ASN、待通告网段。
2. **选连接方式**：低带宽/成本敏感选 VPN；高带宽/低延迟/稳定选专线（Direct Connect / ExpressRoute / Cloud Interconnect）。见下方选型表。
3. **设计拓扑**：单 VPC 直连、Hub-and-Spoke（Transit Gateway / vWAN）、多区域或多云。
4. **用 IaC 落地**：以 Terraform 创建网关、客户网关与连接资源。
5. **配置路由**：优先 BGP 动态路由，开启路由传播与过滤。
6. **加固安全**：加密、私有链路、ACL/安全组、Flow Logs。
7. **做高可用**：双隧道 + BGP 自动切换 + ECMP。
8. **验证与监控**：检查隧道状态、BGP 会话、丢包与延迟。

## 指令

**连接方式选型（关键约束）：**

| 云 | VPN | 专线 |
|---|---|---|
| AWS | Site-to-Site VPN，IPSec over internet，单隧道 ≤1.25 Gbps | Direct Connect，1–100 Gbps，专用、低延迟 |
| Azure | Site-to-Site VPN，RouteBased，SKU 如 VpnGw1 | ExpressRoute，≤100 Gbps，经运营商私有接入 |
| GCP | Cloud VPN（Classic/HA），HA VPN 99.99% SLA，单隧道 ≤3 Gbps | Cloud Interconnect：专用 10/100 Gbps，合作伙伴 50 Mbps–50 Gbps |

**AWS VPN（Terraform）：**

```hcl
resource "aws_vpn_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "main-vpn-gateway" }
}
resource "aws_customer_gateway" "main" {
  bgp_asn    = 65000
  ip_address = "203.0.113.1"
  type       = "ipsec.1"
}
resource "aws_vpn_connection" "main" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.main.id
  type                = "ipsec.1"
  static_routes_only  = false   # false=用 BGP 动态路由
}
```

**Azure VPN 网关（Terraform）：**

```hcl
resource "azurerm_virtual_network_gateway" "vpn" {
  name                = "vpn-gateway"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  type     = "Vpn"
  vpn_type = "RouteBased"
  sku      = "VpnGw1"
  ip_configuration {
    name                          = "vnetGatewayConfig"
    public_ip_address_id          = azurerm_public_ip.vpn.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.gateway.id
  }
}
```

**BGP 路由约定：**

```
本地路由器：ASN 65000，通告 10.0.0.0/8
云端路由器：ASN 64512(AWS) / 65515(Azure)，通告云侧 VPC/VNet CIDR
路由表开启 propagation；用 BGP 动态路由 + 路由过滤；持续监控路由通告。
```

**高可用：双 VPN 隧道（Terraform）：**

```hcl
resource "aws_vpn_connection" "primary" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.primary.id
  type                = "ipsec.1"
}
resource "aws_vpn_connection" "secondary" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.secondary.id
  type                = "ipsec.1"
}
```

Active-Active：来自不同位置的多连接 + BGP 自动故障切换 + ECMP 等价多路径 + 全链路健康监控。

**监控与排障：**

```bash
# AWS VPN
aws ec2 describe-vpn-connections
aws ec2 get-vpn-connection-telemetry

# Azure VPN
az network vpn-connection show
az network vpn-connection show-device-config-script
```

关键指标：隧道 up/down、入出字节数、丢包、延迟、BGP 会话状态。

## 示例

**Hub-and-Spoke（推荐默认拓扑）：**

```
本地数据中心
   ↓ VPN / Direct Connect
Transit Gateway (AWS) / vWAN (Azure)
   ├─ 生产 VPC/VNet
   ├─ 预发 VPC/VNet
   └─ 开发 VPC/VNet
```

**多区域混合：**

```
本地
 ├─ Direct Connect → us-east-1
 └─ Direct Connect → us-west-2
        ↓ 跨区域 Peering
```

**多云混合：**

```
本地数据中心
 ├─ Direct Connect → AWS
 ├─ ExpressRoute   → Azure
 └─ Interconnect   → GCP
```

## 注意事项

安全基线（务必落实）：

1. 优先私有链路（Direct Connect/ExpressRoute），避免走公网。
2. VPN 隧道启用加密。
3. 用 VPC Endpoint / PrivateLink / Private Endpoint，避开公网路由。
4. 配置网络 ACL 与安全组。
5. 开启 VPC Flow Logs 做监控，用 CloudWatch/Azure Monitor 观测连接。
6. 启用 DDoS 防护，实施冗余（双隧道），定期安全审计。

成本优化：按实际流量 right-size 连接；低带宽用 VPN、高带宽用专线；合并流量减少连接数；降低跨网/出云数据传输量；必要时加缓存减少回源。

通用约束：仅在任务明确落在本范围内时使用；缺少必需输入、权限、安全边界或成功标准时先追问；任何配置上线前都需在目标环境实测验证。

## 互见

- 多云架构（multi-cloud-architecture）：用于做架构选型与决策。
- Terraform 模块库（terraform-module-library）：用于 IaC 落地实现。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
