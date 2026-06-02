---
name: zoom-integration-planner
title: Zoom 集成方案规划（架构/认证/里程碑）
description: 当要把一个 Zoom 集成/应用想法落成可执行的实施方案时使用；做的是定用户流程与成功判据、选最小正确的 Zoom 接口面、列认证与 scope 清单、拆分阶段交付并产出风险/下一步与「最小可验证架构的交付物」；不适用于已确定接口面只差编码、非 Zoom 平台集成、或只问单一 OAuth/SDK 用法的场景。触发词：Zoom 集成、Zoom 应用、Zoom 方案、接口面选型、里程碑拆分、Meeting SDK、Marketplace 上架
domain: 平台/integration
triggers: [Zoom 集成方案, 规划 Zoom 应用, Zoom 集成怎么做, 选哪个 Zoom 接口面, Zoom 架构选型, Zoom 交付里程碑, Zoom OAuth 与 scope 规划, Zoom Marketplace 上架, plan zoom integration, zoom app build plan]
tags: [Zoom, 集成规划, 架构选型, OAuth, scope 清单, 里程碑拆分, Webhook, Meeting SDK, Marketplace 评审, MCP]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [zoom-product-surface-selector, zoom-oauth-setup, zoom-mcp-connectors, zoom-meeting-app-builder]
combines_with: [zoom-product-surface-selector, zoom-oauth-setup]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当你手上有一个**Zoom 集成或应用的想法**，需要把它变成一份可执行的实施方案——包含架构概览、所需 Zoom 产品/API、认证与 scope 清单、分阶段交付计划、风险清单和「下一步立刻做什么」时使用。本技能是**先想清楚再动手**的规划层，不替代具体编码。

典型触发：
- 「我想做一个能 X 的 Zoom 应用/集成，怎么落地？」
- 需要一份带阶段、风险、最小验证交付物的 build plan。
- 还没定接口面（REST / Webhook / 各类 SDK / MCP），需要先做架构决策。

**不该用于：**
- 接口面与认证都已敲定、只差写代码 —— 直接进对应实现。
- 非 Zoom 的平台集成 —— 本技能的接口面/scope 知识是 Zoom 专属的。
- 只想问单一 OAuth grant 或某个 SDK 的具体用法 —— 那是认证/SDK 子技能的职责，不必走整套规划。

## 步骤

固定 6 步，从「想法」推导到「最小可验证架构」：

1. **抓住目标用户流程与成功判据** —— 先写清「谁、在哪、要完成什么」，以及怎样算成功。流程不清就别往下选型。
2. **选最小正确的 Zoom 接口面 + 必要支撑服务** —— 只选刚好够用的主接口面，再叠加真正必需的配件，不要超配。
3. **定义认证要求：app 类型、OAuth grant、最小 scope、账户假设** —— 先确认「谁授权谁、哪个租户模型」，再选 grant，再按精确流程取最小 scope。
4. **把实现拆成阶段**：原型 → 核心集成 → 可靠性 → 上线。每阶段有明确出口。
5. **尽早点名硬风险**：OAuth 配置、Webhook 验签、SDK 运行环境限制、Marketplace 评审、MCP 客户端约束。
6. **以「能证明架构成立的最小交付物」收尾** —— 给出那个最小可验证切片，而不是一上来就铺全功能。

## 指令

**接口面决策框架（选最小正确的那个，再叠配件）：**

| 问题类型 | 主选 Zoom 接口面 |
|---|---|
| 后端确定性自动化、账户管理、报表、定时任务 | REST API |
| 事件投递到你的后端 | Webhooks 或 WebSockets |
| 把 Zoom 会议嵌入你的应用 | Meeting SDK |
| 做完全自定义的视频体验 | Video SDK |
| 在 Zoom 客户端内构建 | Zoom Apps SDK |
| AI Agent 对 Zoom 数据做工具化工作流 | Zoom MCP |
| 实时媒体提取 / 会议 bot | RTMS（必要时叠 Meeting SDK）|
| 电话场景 | Phone |
| 联络中心 / 虚拟坐席 | Contact Center / Virtual Agent |

**选型护栏：**
- 用户要的是 Zoom 会议语义时，不要推 Video SDK。
- 用户要的是完全自定义会话产品时，不要推 Meeting SDK。
- 不要用「纯 MCP」替代后端确定性自动化。
- 既要稳定系统动作又要 AI 驱动发现时，优先 `REST API + Zoom MCP` 混合。

**认证决策顺序（顺序错了会返工）：**
1. 先定 app 模型与「谁授权谁、哪个租户」，再选 grant —— 不要先选 grant 再补 actor。
2. 按精确用户流程取**最小 scope**，不要在确认流程前申请大范围 scope。
3. 明确 token 存储与刷新行为；**刷新成功后必须存新返回的 refresh token，不可复用旧的**。
4. 上述都清楚后，再钻进最深的参考文档。

**产出物清单（方案的固定骨架）：**
- 架构概览
- 所需 Zoom 产品与 API
- 认证与 scope 检查清单
- 分阶段交付计划
- 风险、待解问题、立刻可做的下一步

## 示例

输入：`/plan-zoom-integration 一个内部工具，会议结束后自动把录制和参会名单同步到我们的数据库`

输出（方案骨架）：
```
架构概览：事件驱动后端。Zoom Webhook（meeting.ended / recording.completed）
  → 你的接收端验签 → 调 REST API 拉录制与参会者 → 落库。无需任何 SDK。
所需 Zoom 产品/API：Webhooks（事件）+ REST API（recordings、past meeting participants）。
认证与 scope：Server-to-Server OAuth（无终端用户授权，账户级）；
  最小 scope：cloud_recording:read:admin、meeting:read:admin（按精确接口收敛）。
  S2S token 短期有效，按需取，不复用过期 token。
交付阶段：
  1) 原型：手动触发，跑通「拉一场会议录制并落库」。
  2) 核心集成：接 Webhook，端到端验签 → 拉取 → 入库。
  3) 可靠性：重试、幂等、Webhook 重放与签名校验、失败告警。
  4) 上线：权限收敛、监控、（如需对外分发）走 Marketplace 评审。
风险：Webhook 验签实现易错；录制可能延迟产出需重试；S2S scope 配置需在
  Marketplace app 后台精确开通。
下一步（最小可验证交付物）：手动调一次 REST「列出某会议录制」并成功落一条库，
  以此证明数据链路与认证成立，再接 Webhook。
```

## 注意事项

- **接口面宁少勿多**：先选最小正确面，再叠真正必需的配件；超配会拖慢交付、扩大攻击面与 scope 范围。
- **认证顺序不可颠倒**：actor/租户 → grant → scope → token 生命周期。颠倒（先选 grant、先要大 scope）是最常见返工源。
- **refresh token 一次性语义**：刷新成功后用新返回的 token 覆盖旧的；复用旧 refresh token 会导致认证失败，且别把它误判成 API 故障——先查 app 配置。
- **Webhook 必须验签**：事件接收端要校验来源签名，并处理重放/重复投递（配合幂等）。
- **对外分发要预留 Marketplace 评审**：上架有审核周期与合规要求，放进上线阶段而非临门一脚。
- **以最小可验证架构收尾**：方案的价值在于先用一个小切片证明架构成立，而不是先把全功能画满。

## 互见

- requires：无（本技能是其它 Zoom 实现技能的上游规划层）。
- related：`zoom-approach-selector` —— 接口面选型的专用决策技能，规划中第 2 步可下钻；`zoom-oauth-setup` —— 认证与 scope 的深入实现。
- combines_with：`zoom-meeting-app-builder`、`zoom-bot-builder` —— 方案敲定后按选定接口面进入具体构建；`webhook-receiver-hardening` —— 落实事件验签与幂等。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0 许可证），原技能 `plan-zoom-integration`（zoom-plugin）。本条为适配中文「技能大典」的重写版，保留其 6 步规划工作流、接口面决策框架与选型护栏（取自 choose-zoom-approach）、认证决策顺序与「刷新后存新 refresh token」等约束（取自 setup-zoom-oauth）、四阶段交付（原型/核心/可靠性/上线）、硬风险清单（OAuth/Webhook 验签/SDK 环境/Marketplace 评审/MCP）及「以最小可验证架构收尾」的核心理念。
