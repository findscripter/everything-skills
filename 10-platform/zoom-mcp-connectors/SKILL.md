---
name: zoom-mcp-connectors
title: Zoom MCP 连接器规划与排障
description: 当通过 MCP 工具访问 Zoom 会议、录制、会议资产或转录时使用；规划工具面/鉴权并排障 401/-32001/-32602/404，产出可执行调用方案；不适用于会议增删改（走 REST）、白板（走 whiteboard）。触发词：zoom mcp、search_meetings、ai companion transcript
domain: 平台/mcp
triggers: [zoom mcp, zoom mcp server, zoom mcp tools, zoom tools/list, zoom tools/call, ai companion transcript, agentic retrieval, zoom 语义会议搜索, search_meetings, recordings_list, get_meeting_assets, get_recording_resource, zoom 转录 via mcp, zoom docs mcp]
tags: [平台/mcp, zoom, mcp, oauth, 会议转录, 录制检索, 排障]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [search_meetings, recordings_list, get_meeting_assets, get_recording_resource, tools/list, tools/call]
requires: []
related: [zoom-integration-planner, zoom-product-surface-selector, zoom-oauth-setup, mcp-builder]
combines_with: [zoom-rtms-realtime-media]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当你已确定要走 MCP 工具路径访问 Zoom 的会议、录制、会议资产或转录，需要规划工具面、对齐 OAuth 鉴权与作用域，或排查 MCP 特有报错时使用本条目。

适用：
- 用 AI Companion 做语义会议搜索（`search_meetings`），按内容而非元数据过滤。
- 检索会议关联资产、列举/拉取云录制资源与转录。
- 对齐 MCP 专用 OAuth 作用域、排查 401 / -32001 / -32602 / 404。

不该用（负边界）：
- 需要确定性的会议增删改（create/update/delete）：当前 MCP 工具面不暴露这类工具，改走 Zoom REST API。
- 白板相关：走专用的 whiteboard skill / MCP 端点。
- Zoom Docs 的创建与读取：走独立的 `zoom-docs-mcp` 服务器（`mcp.zoom.us`），而非主 `zoom-mcp` 服务器。
- 进入工具调用前，先经 `design-mcp-workflow` 或 `setup-zoom-mcp` 完成路由与初始化，本条目只负责工具面细节、鉴权预期与 MCP 约束。

## 步骤

1. 导出连接器所需的访问令牌。
2. 启用或重启插件，让 Claude 重新加载捆绑的 MCP 服务器定义。
3. 验证工具发现：确认客户端能看到 `recordings_list`、`search_meetings`、`get_meeting_assets`、`get_recording_resource`。若客户端支持原始协议检视，以 `tools/list` 为权威发现来源（部分客户端会给工具加命名空间，如 `zoom-mcp:recordings_list`，但以裸工具名为准）。
4. 跑通第一个有用调用（见示例）。
5. 选定目标后链式检索：先搜索/列举，再按返回的 `meetingId`/UUID 拉资产或录制资源。
6. 命中报错时对照「注意事项」中的错误表定位并修复。

## 指令

导出令牌（bash）：
```bash
export ZOOM_MCP_ACCESS_TOKEN="your_zoom_user_oauth_access_token"
```

服务器端点：

| 服务器 | Transport | URL |
|--------|-----------|-----|
| 主 Zoom MCP | Streamable HTTP（推荐） | `https://mcp-us.zoom.us/mcp/zoom/streamable` |
| 主 Zoom MCP | SSE（回退） | `https://mcp-us.zoom.us/mcp/zoom/sse` |
| Zoom Docs MCP | Streamable HTTP（推荐） | `https://mcp.zoom.us/mcp/docs/streamable` |
| Zoom Docs MCP | SSE（回退） | `https://mcp.zoom.us/mcp/docs/sse` |

工具目录（`*` 为必填参数）：

| 工具 | 关键参数 | 所需作用域 |
|------|---------|-----------|
| `get_meeting_assets` | `meetingId`* | `meeting:read:assets` |
| `search_meetings` | `q`、`from`、`to`、`page_size`、`next_page_token` | `meeting:read:search` |
| `get_recording_resource` | `meetingId`*、`types`、`clip_num`、`play_time`、`raw_passcode`、`encode_passcode` | `cloud_recording:read:content` |
| `recordings_list` | `userId`*、`from`、`to`、`meeting_id`、`trash`、`trash_type`、`page_size`、`next_page_token` | `cloud_recording:read:list_user_recordings` |

Zoom Docs MCP 官方文档化工具：`create_file_with_content`、`get_file_content`。

## 示例

第一个有用调用（列举近一周录制）：
```text
recordings_list
  userId: "me"
  from: "2026-03-01"
  to: "2026-03-06"
  page_size: 10
```

搜索会议内容，再取资产：
```text
search_meetings
  q: "Q4 planning discussion"
  from: "2026-03-01"
  to: "2026-03-06"
→ 选定一个返回的会议
→ get_meeting_assets  meetingId: "MEETING_ID_OR_UUID"
```

列举录制，再取录制资源（含转录能力的资源）：
```text
recordings_list
  userId: "me"
  from: "2026-03-01"
  to: "2026-03-06"
→ 选定一个录制目标
→ get_recording_resource  meetingId: "MEETING_UUID_OR_RECORDING_ID"
```

## 注意事项

- 鉴权路径：使用 General app + 用户级 OAuth 作为本插件 Zoom MCP 工具调用的执行路径；不要把 Server-to-Server OAuth 当作受支持的 MCP 鉴权模型。
- MCP 用的是细粒度专用作用域，与旧的宽 REST 作用域不同。主服务器关键作用域：`ai_companion:read:search`（跨 Meeting/Chat/Doc 语义搜索）、`meeting:read:search`、`meeting:read:assets`、`cloud_recording:read:list_user_recordings`、`cloud_recording:read:content`；Zoom Docs MCP：`docs:write:import`、`docs:read:export`。
- AI Companion 功能是「前置条件」而非作用域替代：语义搜索、会议资产、录制内容检索依赖账号开启 Smart Recording、Meeting Summary 等功能才能有有用结果；这些功能设置不能替代必需的 OAuth 作用域。
- `search_meetings` 走 AI Companion 检索而非纯元数据过滤；以在线 MCP 服务器为响应 schema 与作用域行为的权威。两类结果最重要：复盘类（AI 总结、会议关联文档、录制及相关资产）与录制类（云录制引用、可转录资源）。

错误参考：

| Code | 含义 | 修复 |
|------|------|------|
| `401 Unauthorized` | 端点缺失或拒绝 bearer token | 设置 `ZOOM_MCP_ACCESS_TOKEN`，重启 Claude 或重新启用插件 |
| `-32001 Invalid access token` | 令牌过期/格式错误/缺所需作用域 | 刷新 OAuth 令牌并核对 MCP 专用作用域 |
| `-32602 Can not found tool` | 工具名未被当前 MCP 服务器暴露 | 重跑 `tools/list`，对该端点使用当前工具名 |
| `404` | 下游资源未找到 | 用 `search_meetings` 或 `recordings_list` 重新发现目标 |

## 互见

- 平台/mcp：`design-mcp-workflow`、`setup-zoom-mcp`（先路由/初始化，再到本条目）。
- Zoom REST API：确定性会议 CRUD（创建/更新/删除会议）走 REST。
- Zoom OAuth：OAuth 实现模式与令牌生命周期。
- Zoom Whiteboard MCP：白板专用 MCP skill。
- Zoom Webhooks / RTMS：事件驱动的录制/会议流，及会中实时媒体与转录流。

---
采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
