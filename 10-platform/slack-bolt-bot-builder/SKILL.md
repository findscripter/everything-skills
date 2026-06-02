---
name: slack-bolt-bot-builder
title: Slack Bolt 机器人开发
description: 当用 Bolt 框架构建生产级 Slack App（斜杠命令、Block Kit 交互、模态框、事件、OAuth 安装、Workflow Builder 步骤）时使用；做一套含「3 秒内 ack 后台处理、Block Kit 富 UI 与限额校验、OAuth state 防 CSRF + token 加密、Socket Mode 开发/HTTP 生产、自定义工作流步骤」的可落地骨架（Python 为主，JS/Java 通用）；不适用于无代码 Workflow Builder 纯配置、Discord/Teams 等非 Slack 平台、或仅发 Incoming Webhook 通知；触发词：slack bot、slack app、bolt、block kit、slash command、slack oauth、slack webhook、socket mode、workflow builder、ack 超时。
domain: 平台/integration
triggers: [slack bot, slack app, bolt, block kit, slash command, slack oauth, slack webhook, socket mode, workflow builder, ack 超时, slack 机器人, slack 交互, modal 模态框]
tags: [slack, bolt, block-kit, slash-command, oauth, socket-mode, webhook, chatbot, workflow-builder, integration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, slack_bolt, slack_sdk, Flask, Socket Mode, Block Kit Builder]
requires: []
related: [discord-bot-architect, whatsapp-cloud-api, twilio-communications, slack-gif-creator]
combines_with: [agent-tool-builder, mcp-builder, rest-api-endpoint-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用官方 Bolt 框架新建或迁移 Slack App：斜杠命令、按钮/菜单交互、模态框（modal）、Home tab、事件订阅。
- 需要 Block Kit 搭富文本/交互式消息，且要避开 50 块、3000 字符等隐性限额。
- 多工作区分发，要做 OAuth 2.0 安装流（state 防 CSRF、token 持久化加密）。
- 本地/内网开发用 Socket Mode，生产切 HTTP webhook。
- 给 Slack Workflow Builder 提供自定义步骤（edit/save/execute）。

不该用：
- 仅需单向通知：用 Incoming Webhook 一行 POST 即可，无需 Bolt。
- 纯无代码 Workflow Builder 配置（不写自定义步骤）。
- 非 Slack 平台（Discord、Teams、企业微信）——命令与 payload 结构不通用，见互见 `discord-bot-architect`。

核心铁律：所有交互请求（斜杠命令、按钮、菜单、模态提交、快捷指令）**必须 3 秒内 `ack()`**，慢操作一律丢后台；token/signing secret 永不硬编码或入日志。

## 步骤

1. 初始化 App：从环境变量读 `SLACK_BOT_TOKEN` + `SLACK_SIGNING_SECRET` 建 `App`。提供 signing_secret 后 Bolt 自动验签（X-Slack-Signature），无需手写。
2. 注册监听器：`@app.message` / `@app.command` / `@app.action` / `@app.view` / `@app.event` 分别接消息、斜杠命令、交互组件、模态提交、事件。
3. 守住 3 秒：每个交互处理器**先 `ack()`** 再干活；慢逻辑用线程或 Bolt lazy listener 放后台，用 `respond()` 回结果。
4. 搭 UI：用 Block Kit 组装 blocks，发送前用 `validate_blocks` 校限额（见示例）；交互后 `chat_update` 移除已点按钮防重复点击。
5. 选运行模式：开发用 Socket Mode（需 `xapp-` app-level token + `connections:write` scope，无需公网 URL）；生产用 HTTP（Flask/FastAPI 适配器）。
6. 要分发就上 OAuth：配 `OAuthSettings`，只申请最小 scope；callback 必校 `state`（一次性 consume）；token 落库前加密。
7. 接 Workflow Builder：定义 `edit/save/execute` 三函数，`WorkflowStep` 注册，`execute` 内**必须**调用 `complete()` 或 `fail()`。

## 指令

ack-then-process（最高频且最易错）——慢操作丢后台：

```python
@app.command("/slow-task")
def handle_slow_task(ack, command, respond):
    ack("Processing...")          # 必须先 ack，3 秒内
    def do_work():
        result = call_slow_api(command["text"])   # 可耗时 10s+
        respond(f"Done! {result}")
    threading.Thread(target=do_work).start()

# 或用 Bolt lazy listener（自动并发）
@app.command("/slow-task")
def ack_only(ack): ack()
@ack_only.lazy
def process(command, respond):
    respond(slow_operation(command["text"]))   # ack 后跑，不限时
```

模态：开窗 `client.views_open(trigger_id=body["trigger_id"], view={...})`；提交处理器 `@app.view("callback_id")` 里从 `view["state"]["values"][block_id][action_id]["value"]` 取值，可 `ack(response_action="clear"/"update")`。

OAuth 防 CSRF（CRITICAL）——签发并校验 state：

```python
state = state_store.issue()              # 加密随机 state
# callback:
if request.args.get("state") != stored or not state_store.consume(state):
    return "Invalid state - possible CSRF", 403
```

最小 scope 速查（申请越少装机率越高，约 70% 用户因权限过多放弃安装）：

| 用途 | 所需 scope |
|---|---|
| 发消息 | `chat:write` |
| 斜杠命令 | `commands` |
| 响应 @提及 | `app_mentions:read`, `chat:write` |
| 读公开频道历史 | `channels:history`（私有 `groups:history`） |
| 加 reaction | `reactions:write` |
| 上传文件 | `files:write` |

Socket Mode（开发）vs HTTP（生产）：

```python
# 开发
from slack_bolt.adapter.socket_mode import SocketModeHandler
SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"]).start()   # xapp- token

# 生产（Flask）
from slack_bolt.adapter.flask import SlackRequestHandler
handler = SlackRequestHandler(app)
@flask_app.route("/slack/events", methods=["POST"])
def events(): return handler.handle(request)
```

## 示例

Block Kit 富消息 + 限额校验 + 幂等更新：

```python
def build_incident_blocks(inc: dict) -> list:
    return [
        {"type": "header", "text": {"type": "plain_text", "text": "🚨 Incident Alert"}},
        {"type": "section", "fields": [
            {"type": "mrkdwn", "text": f"*Incident:*\n{inc['title']}"},
            {"type": "mrkdwn", "text": f"*Severity:*\n{inc['severity'].upper()}"},
        ]},
        {"type": "actions", "block_id": f"incident_actions_{inc['id']}", "elements": [
            {"type": "button", "text": {"type": "plain_text", "text": "Acknowledge"},
             "style": "primary", "action_id": "acknowledge_incident", "value": inc["id"]},
            {"type": "button", "text": {"type": "plain_text", "text": "Resolve"},
             "style": "danger", "action_id": "resolve_incident", "value": inc["id"],
             "confirm": {"title": {"type": "plain_text", "text": "Resolve?"},
                         "text": {"type": "mrkdwn", "text": "确定已解决？"},
                         "confirm": {"type": "plain_text", "text": "Yes"},
                         "deny": {"type": "plain_text", "text": "Cancel"}}},
        ]},
    ]

BLOCK_KIT_LIMITS = {"blocks_per_message": 50, "text_block_chars": 3000, "elements_per_actions": 10}
def validate_blocks(blocks: list) -> tuple[bool, str]:
    if len(blocks) > BLOCK_KIT_LIMITS["blocks_per_message"]:
        return False, f"Too many blocks: {len(blocks)} > 50"
    for b in blocks:
        if b.get("type") == "section" and len(b.get("text", {}).get("text", "")) > 3000:
            return False, "Text > 3000 chars"
        if b.get("type") == "actions" and len(b.get("elements", [])) > 10:
            return False, "actions > 10 elements"
    return True, "OK"

@app.action("acknowledge_incident")
def on_ack(ack, body, client):
    ack()                                      # 先 ack
    blocks = body["message"]["blocks"]
    action_block = next(b for b in blocks if b.get("block_id","").startswith("incident_actions"))
    # 移除已点按钮，防重复点击（幂等）
    action_block["elements"] = [e for e in action_block["elements"] if e["action_id"] != "acknowledge_incident"]
    client.chat_update(channel=body["channel"]["id"], ts=body["message"]["ts"], blocks=blocks)
```

Workflow Builder 自定义步骤（execute 必须收尾）：

```python
def execute(step, complete, fail):
    try:
        ticket = create_ticket(title=step["inputs"]["title"]["value"])
        complete(outputs={"ticket_id": ticket["id"], "ticket_url": ticket["url"]})
    except Exception as e:
        fail(error={"message": str(e)})       # 不调 complete/fail 会让工作流卡死
app.step(WorkflowStep(callback_id="create_ticket_step", edit=edit, save=save, execute=execute))
```

token 加密落库（Fernet）：

```python
from cryptography.fernet import Fernet
cipher = Fernet(os.environ["TOKEN_ENC_KEY"])
enc = cipher.encrypt(bot_token.encode())      # 入库前加密
tok = cipher.decrypt(row).decode()            # 用时解密
```

## 注意事项

- 3 秒 ack（CRITICAL）：斜杠命令/按钮/模态/快捷指令未在 3 秒内 ack，用户见「This command timed out」，即使后台跑成功也算失败；ack 里也不能放慢操作。
- 验签（CRITICAL）：Slack 用 signing secret 签每个请求；提供 `signing_secret` 时 Bolt 自动验，自建 webhook 必须手动校 `X-Slack-Signature` 且拒绝 5 分钟外的时间戳（防重放）。
- OAuth state（CRITICAL）：callback 不校验 state 即有 CSRF 风险；用 state_store 签发 + 一次性 consume。
- token 泄露（CRITICAL）：`xoxb-`/`xoxp-`/`xapp-` 一律环境变量注入，绝不硬编码、不入日志、不下发前端、入库须加密；泄露后立即在 OAuth & Permissions 里 Rotate 并查审计日志。
- Block Kit 限额：单消息/模态 50 块、Home tab 100 块、单文本块 3000 字符、actions 块 10 元素、select 100 选项、模态总体 24KB；超限报 `invalid_blocks` 或静默失败，发送前先校验、长内容分页。
- 最小 scope：避免 `admin` 等大权限，按用途只申请所需；过度申请压低安装率，可能被 App Directory 拒。
- Socket Mode 不上生产：单 WebSocket 连接、不能水平扩展、会断线，仅适合开发/内网；生产用 HTTP webhook（必须时给 Socket Mode 加重连退避）。
- 幂等：交互处理器要可重复执行——更新消息移除已点按钮，避免重复副作用。
- fallback 文本：发 blocks 时务必同时给 `text=` 作为通知与无障碍回退。

## 互见

- related：`discord-bot-architect` —— 需要跨 Discord/Slack 多平台机器人架构时对照。
- related：`auth-implementation-patterns` —— OAuth 2.0、state/CSRF、企业 SSO 等通用认证模式的深入实现。
- combines_with：`production-llm-app-builder` —— 把 LLM 接入做成对话式 / AI 驱动的 Slack 机器人。

—— 本条采编自 sickn33/antigravity-awesome-skills（MIT 许可；原技能 SKILL.md frontmatter 标注上游为 vibeship-spawner-skills，Apache-2.0）。
