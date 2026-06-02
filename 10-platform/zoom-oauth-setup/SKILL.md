---
name: zoom-oauth-setup
title: Zoom 认证与 OAuth 实现
description: 当为 Zoom 集成做认证决策（选应用类型、选授权模式、规划 scope、实现令牌刷新、排查 OAuth 报错）时使用；做一套覆盖账户级 S2S、用户授权码、设备码、Chatbot 四种 grant 的可执行实现，含令牌交换/刷新、PKCE、scope 选型与 4700-4741 错误对照；不适用于 Zoom SDK 嵌入/RTMS/MCP 等非认证问题；触发词：Zoom OAuth、access token、refresh token、account_credentials、PKCE、设备码、4709、4735、scope。
domain: 平台/integration
triggers: [Zoom OAuth, Zoom 认证, access token, refresh token, account_credentials, authorization_code, PKCE, 设备码授权, redirect_uri 不匹配, 4709, 4735, S2S OAuth, Zoom scope]
tags: [zoom, oauth, authentication, access-token, refresh-token, pkce, s2s-oauth, scopes, integration, platform]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Zoom Marketplace 控制台, Zoom OAuth 端点 (zoom.us/oauth/*), Zoom REST API v2 (api.zoom.us), curl/axios, Node.js crypto (PKCE)]
requires: []
related: [zoom-webhooks-setup, zoom-mcp-connectors, zoom-integration-planner, zoom-product-surface-selector]
combines_with: [zoom-meeting-app-builder, zoom-webhooks-setup]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

适用：
- 认证是整个 Zoom 集成的卡点，或授权选型会决定后续架构走向。
- 需要在四种使用场景里选对「应用类型 + grant」：后端自动化、面向他人用户的应用、无浏览器设备、纯 Chatbot。
- 实现令牌交换/刷新、规划最小 scope、设计令牌存储与生命周期。
- 排查 OAuth 失败（redirect_uri 不匹配、code 过期、refresh token 失效等 4700-4741 报错）。

不该用：
- Zoom Meeting SDK / Video SDK 嵌入、RTMS 实时媒体、Zoom MCP 工具编排等非认证问题——那些另有对应技能，本条只管「拿到并维持 access token」。
- JWT 应用（2023-06 已弃用，不能新建）——server-to-server 自动化请改用 S2S OAuth。

核心原则：先把「谁在授权谁（actor + tenant 模型）」定清楚，再选 grant；先确认精确工作流再申请 scope，不要一上来就要宽权限。auth 失败先查应用配置，别当成 API 失败。

## 步骤

1. 定应用模型：判断是「机器对机器（无用户）」还是「有用户参与」，以及作用域是个人级还是账户级（admin）。
2. 选 grant 流程（见下方决策表）。
3. 按精确的用户流确定最小 scope（新应用用 granular 细粒度 scope）。
4. 定义令牌存储与刷新行为（S2S 用 Redis 临时缓存；用户级用加密数据库持久化）。
5. 以上都清楚后，再下钻到具体端点与错误细节实现。

## 指令

四种授权场景对照（决定 grant 的唯一依据）：

| 场景 | 应用类型 | grant_type | 行业叫法 |
|------|---------|-----------|---------|
| 账户级自动化（你自己的账户） | Server-to-Server | `account_credentials` | 客户端凭证 / M2M / 两脚 OAuth |
| 面向他人用户的应用 | General | `authorization_code` | 授权码 / 三脚 OAuth |
| 无浏览器设备（智能电视、Meeting SDK 设备） | General | `urn:ietf:params:oauth:grant-type:device_code` | 设备授权（RFC 8628） |
| 纯 Chatbot（Team Chat） | General | `client_credentials` | 客户端凭证（chatbot 范围） |

选流程口诀：后端自动化→ACCOUNT(S2S)；纯聊天机器人→CLIENT；面向他人用户→看设备有没有浏览器，无→DEVICE，有→USER（公共客户端再叠加 PKCE）。

所有令牌请求都用 `Authorization: Basic Base64(ClientID:ClientSecret)`，授权同意走 `zoom.us/oauth/authorize`，令牌交换走 `zoom.us/oauth/token`。

账户级 S2S（无用户、令牌 1 小时、无 refresh，过期直接重取）：

```bash
POST https://zoom.us/oauth/token?grant_type=account_credentials&account_id={ACCOUNT_ID}
Authorization: Basic {Base64(ClientID:ClientSecret)}
```

用户授权码（三步）：

```bash
# 1. 引导用户同意（可带 state 防 CSRF）
https://zoom.us/oauth/authorize?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}
# 2. 回调拿到 ?code={CODE}
# 3. 换令牌（PKCE 时追加 &code_verifier={VERIFIER}）
POST https://zoom.us/oauth/token?grant_type=authorization_code&code={CODE}&redirect_uri={REDIRECT_URI}
Authorization: Basic {Base64(ClientID:ClientSecret)}
# 刷新
POST https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token={REFRESH_TOKEN}
Authorization: Basic {Base64(ClientID:ClientSecret)}
```

授权码 5 分钟过期，拿到立即换；access token 1 小时；refresh token 寿命会变（部分用户流约 90 天，按运行时报错 + 重新授权兜底，别写死）。

Chatbot：`grant_type=client_credentials`，1 小时过期，无 refresh，重取即可。

调 API 与撤销：

```bash
GET  https://api.zoom.us/v2/users/me        # Authorization: Bearer {ACCESS_TOKEN}；me 指代令牌归属用户
POST https://zoom.us/oauth/revoke?token={ACCESS_TOKEN}   # Basic 认证，所有授权类型通用
```

scope 选型：新应用用 granular 格式 `<service>:<action>:<data_claim>:<access>`（例 `meeting:read:list_meetings:admin`）。无后缀=用户级任意用户可授权；`:admin` 需管理员角色；`:master` 需账户所有者。

## 示例

PKCE（移动端 / SPA / 桌面端等公共客户端必用，无法安全保存 secret）：

```javascript
const crypto = require('crypto');
function generatePKCE() {
  const verifier  = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}
const pkce = generatePKCE();
const authUrl = `https://zoom.us/oauth/authorize?response_type=code` +
  `&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}` +
  `&code_challenge=${pkce.challenge}&code_challenge_method=S256`;
// 把 pkce.verifier 存进 session，回调换令牌时回传
```

设备码轮询（按返回的 interval，通常 5 秒；正确处理各错误码）：

```javascript
async function pollForToken(deviceCode, interval) {
  while (true) {
    await sleep(interval * 1000);
    try {
      const res = await axios.post(
        `https://zoom.us/oauth/token?grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=${deviceCode}`,
        null, { headers: { Authorization: `Basic ${credentials}` } });
      return res.data; // 成功拿到令牌
    } catch (error) {
      const err = error.response?.data?.error;
      if (err === 'authorization_pending') continue;       // 用户还没授权，继续轮询
      if (err === 'slow_down') { interval += 5; continue; } // 太快了，间隔 +5s
      throw error;                                          // expired_token / access_denied，不重试
    }
  }
}
```

设备码 15 分钟过期；先在 Features > Embed 里启用 Meeting SDK 的「Use App on Device」。

## 注意事项

- refresh token 轮换：每次刷新都会返回**新的** refresh token，旧的立即失效；务必存新值，否则触发 4735。刷新后用最新令牌发起下次请求。
- redirect_uri 必须**完全一致**：尾斜杠 `/callback` ≠ `/callback/`、协议 `http` ≠ `https`、端口 `:3000` ≠ `:3001` 都算不匹配（4709，最常见错误）。
- 令牌存储必须加密（至少 AES-256），切勿明文落库。
- 用户级应用用户自己即可授权；账户级（admin/master scope）需相应角色，部分账户还要 Marketplace 管理员预审批。
- 取消授权：公共应用在用户移除后会收到 `app_deauthorized` webhook，必须删除该用户全部数据并验签（用 secret token，verification token 已于 2023-10 弃用）；私有/开发应用不收此 webhook。
- 常见错误码：4700 令牌为空 / 4702·4704 client 无效 / 4705 grant 不支持 / 4709 redirect_uri 不匹配 / 4711 refresh token 与 client scope 不符 / 4733 授权码过期（5 分钟）/ 4735 令牌归属用户不存在（多因没存新 refresh token）/ 4741 令牌已被撤销。

## 互见

- stripe-integration / twilio-communications / whatsapp-cloud-api：同为第三方平台集成，可复用其 webhook 验签与幂等模式来处理 Zoom 的取消授权与事件回调。
- mcp-builder：把 Zoom 能力封装成 MCP 工具时，本条产出的 access token 即工具调用的认证凭据。
- firebase-backend：用户级 OAuth 的加密令牌持久化可落在此类后端。

—— 本条采编自 anthropics/knowledge-work-plugins（Apache-2.0 许可）。
