---
name: zoom-product-surface-selector
title: Zoom 构建面选型与权衡
description: 当你为某个 Zoom 产品想法或集成目标拍板技术路线时使用；做需求归类→主选 Zoom 构建面+最小支撑件→列权衡与落地序列的选型决策；不适用于具体 SDK/API 的逐行实现或鉴权排错。触发词：Zoom 选型、Meeting SDK vs Video SDK、Zoom 集成方案
domain: 平台/integration
triggers: [Zoom 选型, Zoom 集成方案, Meeting SDK 还是 Video SDK, Zoom 用 REST API 还是 Webhook, 嵌入 Zoom 会议, Zoom Apps 客户端内插件, Zoom MCP 工作流, Zoom Phone Contact Center 选哪个]
tags: [zoom, api选型, 架构决策, 集成, meeting-sdk, video-sdk, webhook, mcp]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [zoom-integration-planner, zoom-meeting-app-builder, zoom-meeting-bot-builder, zoom-oauth-setup]
combines_with: [zoom-integration-planner, zoom-meeting-app-builder]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当用户给出一个 **Zoom 产品想法、应用类型或集成目标**，需要先在众多 Zoom 构建面之间拍板「用哪个、配哪些、为什么不用别的」时使用。候选构建面：REST API、Webhooks、WebSockets、Meeting SDK、Video SDK、Zoom Apps SDK、Zoom MCP、Phone、Contact Center、Virtual Agent、RTMS。

不该用的边界：
- 路线已定、需要**逐行实现/鉴权(OAuth)排错/调试某个具体 SDK** —— 那是实现层任务，不在本选型技能内。
- 与 Zoom 无关的通用音视频/通信选型。
- 用户只想要某接口的参数说明 —— 直接查对应参考库即可。

## 步骤

1. **还原真实目标**：剥开「他说要什么」找到「他实际要解决什么」。
2. **归类问题域**：判断它属于——后端自动化 / 嵌入式会议 / 完全自定义视频 / 客户端内应用行为 / 事件投递 / AI 工具编排 / 实时媒体提取 / 电话或联络中心。
3. **歧义则只问一个澄清问题**，再锁定推荐（不要追问到底）。
4. **给出主选构建面 + 最小支撑件**（只加真正必需的支撑组件，不堆料）。
5. **解释被否方案为何更差**（针对本场景）。
6. **以一份可执行的下一步落地序列收尾**。

## 指令

按下表归类，选「能完成任务的最小正确构建面」，再按需叠加支撑件：

| 问题类型 | 主选 Zoom 构建面 |
|---|---|
| 确定性后端自动化、账号管理、报表、定时任务 | REST API |
| 把事件投递到你的后端 | Webhooks 或 WebSockets |
| 把 Zoom 会议**嵌入**你的应用 | Meeting SDK |
| 构建**完全自定义**的视频体验 | Video SDK |
| 在 Zoom 客户端**内部**构建应用 | Zoom Apps SDK |
| 基于 Zoom 数据的 AI Agent 工具编排 | Zoom MCP |
| 实时媒体提取 / 会议机器人 | RTMS（必要时叠加 Meeting SDK） |
| 电话工作流 | Phone |
| 联络中心 / 虚拟坐席 | Contact Center 或 Virtual Agent |

**护栏（硬约束，勿违）：**
- 用户实际需要 Zoom **会议语义**时，**不要**推荐 Video SDK。
- 用户需要**完全自定义会话产品**时，**不要**推荐 Meeting SDK。
- **不要**用「纯 MCP」替代确定性后端自动化。
- 既要稳定系统动作、又要 AI 驱动发现时，优先 **混合方案 `REST API + Zoom MCP`**。

**产出物：** 一条推荐路线 + 最小支撑组件 + 关键权衡与硬约束 + 立即可执行的下一步 + 下一步该转向的相关技能链接。

## 示例

输入：「我想做一个内部排课系统，自动批量创建周期会议并把录制链接同步到我们的工单系统。」

输出（节选）：
- **主选**：REST API（确定性后端自动化：批量建会、拉录制）。
- **支撑件**：Webhooks（`recording.completed` 事件触发同步）—— 不要轮询。
- **被否**：Meeting SDK/Video SDK 都不需要，你不在自己应用里渲染会议；纯 MCP 不适合需要稳定可重放的系统动作。
- **下一步序列**：① 申请 Server-to-Server OAuth 应用与 scope → ② REST 批量建会 → ③ 订阅 recording 完成 Webhook → ④ 回调里取录制资源写工单。

## 注意事项

- **先求最小正确面，再叠加**：每多引入一个构建面都要能说清「为什么非它不可」。
- 区分 **Meeting SDK（嵌入 Zoom 会议语义）** 与 **Video SDK（自建会话产品）**，这是最高频的误选点。
- 事件投递在 **Webhooks（HTTP 回调，需公网入口）** 与 **WebSockets（长连接，无需暴露入口）** 间二选一，按部署形态定。
- 涉及 Zoom 托管 MCP 时需对应 bearer token 环境变量（如 `ZOOM_MCP_ACCESS_TOKEN`、`ZOOM_DOCS_MCP_ACCESS_TOKEN`、`ZOOM_WHITEBOARD_MCP_ACCESS_TOKEN`）；轮换 token 后需重启以重载 MCP 服务。无连接器时退回 standalone，仅用参考文档做选型。

## 互见

- 进一步的 Zoom 架构决策框架与护栏细则（同源 choose-zoom-approach）。
- MCP 工作流设计（同源 design-mcp-workflow）。
- 上述选定构建面对应的实现层技能（REST API / Meeting SDK / Video SDK / Webhooks 等）。

---
采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
