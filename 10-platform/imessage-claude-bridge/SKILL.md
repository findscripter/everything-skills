---
name: imessage-claude-bridge
title: iMessage 短信驱动 Claude 会话桥接
description: 当想用手机 iMessage/短信远程驱动笔记本上的 Claude Code 会话（发文字/语音/图片、跑代码、cd 切目录）时使用；做部署 njerschow/textme 本地守护进程、配置 Sendblue 凭证与手机号白名单、验证非白名单拦截后再持久化，产出可远控的「手机→Claude」入站通道；不适用于仅需「任务完成后发短信通知我」的纯出站场景（那是 sendblue-notify，无需守护进程）。触发词：text claude、手机控制 claude、远程驱动 claude、imessage 控制电脑、textme、sendblue 入站
domain: 平台/integration
triggers: [text claude, 手机控制 claude, 远程驱动 claude, imessage 驱动 claude, imessage 控制电脑, 从手机敲代码, textme, sendblue 入站, 短信遥控笔记本]
tags: [imessage, sms, sendblue, claude-code, daemon, remote-control, automation, integration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [nodejs, claude-code, sendblue, pm2, launchd, whisper, openai-api]
requires: []
related: [twilio-communications, agentmail-email-infra, tmux-session-management]
combines_with: [twilio-communications, tmux-session-management]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# iMessage 短信驱动 Claude 会话桥接

## 何时使用

- 用户说「text Claude」「用手机控制笔记本上的 Claude」「远程驱动 Claude」「想从手机敲代码」「给 Claude 发 iMessage」时。
- 人不在工位、想用短信/iMessage 启动、监督或打断一个长跑的 Claude 会话时。
- 搭一台常驻无头工作站，出差或离开键盘时仍要遥控时。
- 本质是 `njerschow/textme` 守护进程，桥接「手机 iMessage（经 Sendblue）→ 本机 Claude Code 会话」，是入站方向。

不该用：

- 纯出站「任务跑完发短信通知我」——那是 sendblue-notify，靠 Stop 钩子即可，不需要守护进程。
- 想让 Claude 会话中途能主动发短信、但不需要入站遥控——用 Sendblue MCP（见示例 4）更轻。
- 共享机器或带敏感数据的目录——入站短信等于一个由手机号网守的远程命令执行面，慎之。

## 步骤

1. 前置：macOS/Linux 常驻在线主机（守护进程持续轮询 Sendblue）、Node.js 18+、已装并登录的 Claude Code（`npm install -g @anthropic-ai/claude-code`）、可用的 Sendblue 账号与已开通的 iMessage 号码（经 sendblue-cli `sendblue setup` / `sendblue show-keys` 拿到 API key/secret）；语音转写可选 OpenAI API key。
2. 安装守护进程（git clone + build）。
3. 写 `~/.config/claude-imessage/config.json`，填凭证并把白名单设为「仅本人手机号」。
4. 先 `npm start` 试运行，从手机发 `?` 确认有响应。
5. 跑完验证清单（尤其确认非白名单号码被忽略），再用 pm2/launchd 持久化。

## 指令

安装：
```bash
git clone https://github.com/njerschow/textme.git
cd textme/daemon
npm install
npm run build
mkdir -p ~/.config/claude-imessage
```

配置 `~/.config/claude-imessage/config.json`：
```json
{
  "sendblue": {
    "apiKey": "YOUR_SENDBLUE_API_KEY",
    "apiSecret": "YOUR_SENDBLUE_API_SECRET",
    "phoneNumber": "+1SENDBLUE_NUMBER"
  },
  "whitelist": ["+1YOUR_PHONE"],
  "pollIntervalMs": 5000,
  "conversationWindowSize": 20
}
```
`whitelist` 是入站短信与本机命令执行之间「唯一」的授权闸门，按安全边界对待，绝不为「以防万一」加入共享/工作/家人号码。`apiKey`/`apiSecret` 取自 `sendblue show-keys`，与 CLI 本地的 bearer token（`~/.sendblue/credentials.json`）不是一回事。

语音转写（可选）在 daemon 目录 `.env`：
```bash
OPENAI_API_KEY=sk-...
```

运行（试跑）：
```bash
cd textme/daemon && npm start
```

持久化（验证通过后再做）：
```bash
pm2 start dist/index.js --name textme && pm2 save && pm2 startup
# 或 macOS：./scripts/install-launchd.sh
```

内置短信指令（白名单号码发给 Sendblue 号码）：

| 指令 | 作用 |
|---|---|
| `?` | 列出可用指令 |
| `status` | 当前守护进程状态与工作目录 |
| `queue` | 待处理消息队列 |
| `history` | 近期消息历史 |
| `home` | cd 回 home 目录 |
| `reset` | 回 home 并清空会话历史 |
| `cd /path` | 切换工作目录 |
| `stop` | 取消当前 Claude 任务 |
| `yes` / `no` | 批准 / 拒绝待确认的操作 |

其余任何内容都当作 Claude 提示词路由到活动会话。

启用前必须验证（任一失败就别开 launchd/pm2 自启）：
1. 白名单手机发 `status` → 应回目录 + 状态。
2. 发 `pwd`/`ls` → 确认输出送达。
3. 用「非白名单」号码发消息 → 确认被「忽略」而非回显。
4. 杀掉守护进程 → 确认消息停止被处理，无僵尸进程。

## 示例

初次搭建走查：
```bash
sendblue whoami            # 1. 确认 sendblue CLI 凭证可用
sendblue show-keys         # 2. 取 API key/secret（非 CLI bearer token）
git clone https://github.com/njerschow/textme.git
cd textme/daemon && npm install && npm run build   # 3. 编译
# 4. 用 step2 的值填 config.json，白名单只放本人手机号
npm start                  # 5. 启动，从手机发 "?" 确认响应
```

与 sendblue-notify 组双向闭环（共用同一 Sendblue 账号，解决相反问题）：
- Claude 跑完长任务 → 经 sendblue-notify（Stop 钩子）发短信给用户。
- 用户回「看下 diff」→ textme 路由进 Claude → Claude 经 Sendblue 回信。

看守护进程日志：
```bash
pm2 logs textme                          # pm2
tail -f ~/.local/log/claude-imessage.log # 独立运行
```

MCP-only 替代（不要轮询守护进程，只想让 Claude 会话里有 Sendblue 出站工具）：
```bash
claude mcp add sendblue_api \
  --env SENDBLUE_API_API_KEY=your-api-key \
  --env SENDBLUE_API_API_SECRET=your-api-secret \
  -- npx -y sendblue-api-mcp --client=claude-code --tools=all
```
MCP 只给 Claude 出站发送能力，不开入站「手机控制 Claude」通道。目标是「从任何地方 text Claude」选 textme；只是「Claude 会话中能发条短信」选 MCP。

## 注意事项

- 这是一个「仅靠手机号白名单网守的远程代码执行面」，按此对待。能冒用/劫持白名单号码者即可在主机上驱动 Claude；号码不再需要时及时移除，定期审计白名单漂移。
- 起步只放一个本人号码；以普通用户身份运行，绝不 root/sudo；首测在沙箱目录（`cd ~/textme-sandbox`），别在 `~` 或真实仓库里跑——启动时的工作目录会被入站短信的 `ls`/`cat` 等暴露。
- `config.json` 含 API key/secret 与手机号：`chmod 600`，绝不入 dotfiles 仓库/云同步/日志/截图。
- `pollIntervalMs` 保持 ≥ 5000，除非清楚 Sendblue 速率限制与费用；不要公开 Sendblue 号码（即便有白名单，未知发送方的洪水仍耗轮询周期与成本）。
- 入站消息是不可信输入，按公网用户输入处理，别管道进 `eval`/shell 替换或绕过 Claude Code 审查的脚本。Claude Code 权限模型仍生效——破坏性操作仍弹确认，textme 把 `yes`/`no` 暴露给手机号，意味着「该号码」在批准破坏性操作，白名单信任级别必须与之匹配。
- 回信会未脱敏落在锁屏预览，别让 Claude 经短信回吐密钥/令牌/客户数据，改为链接到本地日志或 PR。
- 守护进程是轮询而非推送，消息到 Claude 响应有个位数秒级延迟；一机一会话，两个守护进程共用同一 Sendblue 号会都去处理每条入站消息。
- Sendblue 免费计划：用户手机须先给 Sendblue 号码发过一次短信，Claude 的出站回信才送达；可用 `sendblue contacts` 核验，否则静默发送失败。
- 改白名单/轮换凭证/重启进不可信状态前，记得先停掉自启的 pm2/launchd 守护进程。

## 互见

- requires：`sendblue-cli` —— 账号搭建、凭证管理与 `show-keys`（取 textme 所需的 API key/secret）。
- related：`sendblue-api` —— HTTP API 参考，供想自建入站处理器而非用 textme 守护进程者。
- combines_with：`sendblue-notify` —— 出站对位（Claude → 手机），与 textme 组成双向闭环；`update-config` —— 配 Claude Code 的 Stop 钩子等 settings.json 改动。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
