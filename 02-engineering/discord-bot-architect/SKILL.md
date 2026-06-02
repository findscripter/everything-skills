---
name: discord-bot-architect
title: 生产级 Discord 机器人架构
description: 当用 Discord.js(JS/TS) 或 Pycord(Python) 搭建生产级 Discord 机器人时使用；做斜杠命令/交互组件/限流/分片的架构搭建并产出可运行骨架；不适用于 Slack 等其他平台或纯 LLM 对话逻辑。触发词：Discord 机器人、斜杠命令、Discord.js、Pycord、gateway intents、分片
domain: 研发/backend
triggers: [Discord 机器人, Discord bot, 斜杠命令 slash command, Discord.js, Pycord / discord.py, gateway intents 网关意图, 交互组件 按钮 下拉 模态框, 机器人分片 sharding, interaction failed 交互超时, deferReply / defer]
tags: [discord, discord.js, pycord, chatbot, slash-commands, sharding, rate-limit, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Discord.js v14, Pycord, Node.js, Python, dotenv]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

需要从零搭建或重构**生产级 Discord 机器人**，涉及：网关意图(intents)取舍、斜杠命令注册、交互组件(按钮/下拉/模态框)、3 秒响应窗口、限流退避、2500+ 服务器分片时使用。两套技术栈：Discord.js v14(JS/TS) 与 Pycord(Python)。

核心原则：
- 用**斜杠命令**而非消息解析(Message Content 意图已不推荐)。
- 交互必须在 **3 秒内确认**(reply/defer/showModal)。
- 只申请**必需的意图**，尽量避开三个特权意图。
- 限流用指数退避优雅处理；2500+ 服务器起规划分片。
- 开发期先用 guild 命令(即时)，就绪后再发 global 命令。

**不该用**：搭建 Slack/Telegram 等其它平台机器人(→ 其它技能)；只想做 LLM 对话逻辑而非机器人架构；做语音频道功能、支付订阅、数据库持久化等本技能不覆盖的子领域(见“互见”委派)。本技能产物不替代环境内的实测与专家评审。

## 步骤

1. **初始化客户端**，只声明最小意图(默认 `Guilds`)。
2. **拆分目录**：`commands/`(命令) + `events/`(事件) + 独立的 `deploy-commands.js` 注册脚本(JS)；或 `main.py` + `cogs/`(Python)。
3. **写斜杠命令**：`SlashCommandBuilder`(JS) / `@bot.slash_command`(Py)。
4. **注册命令**：开发用 guild 命令(秒级生效)，生产用 global 命令(最长 1 小时传播)。**绝不在 on_ready/启动时同步**。
5. **慢操作先 defer**：超过 3 秒的逻辑前先 `deferReply()`/`ctx.defer()`，拿到 15 分钟窗口后 `editReply`/`followup`。
6. **加交互组件**：按钮、下拉、模态框；模态框必须是首个响应。
7. **限流与分片**：批量操作走限流队列；接近 2500 服务器接入分片。

## 指令

- 启动机器人(JS)：`node src/index.js`
- 注册命令(JS，手动单独跑)：`node src/deploy-commands.js`
- 启动机器人(Py)：`python main.py`；显式同步：`python main.py --sync`
- 正确的邀请 scope(否则斜杠命令不显示)：`scope=bot%20applications.commands`
- `.gitignore` 必含 `.env`，令牌只从 `process.env.DISCORD_TOKEN` / `os.environ["DISCORD_TOKEN"]` 读取，**绝不硬编码**。

## 示例

斜杠命令 + 慢操作 defer(Discord.js v14)：

```javascript
// src/index.js —— 最小意图
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_TOKEN);
```

```javascript
// 命令：慢操作必须先 defer（3 秒内）
async execute(interaction) {
  await interaction.deferReply();          // 立即确认，换 15 分钟窗口
  const result = await slowDatabaseQuery();
  await interaction.editReply(`结果: ${result}`);
}
```

```javascript
// deploy-commands.js —— 手动跑，开发用 guild(即时)，生产用 global
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
await rest.put(  // 开发: applicationGuildCommands(CLIENT_ID, GUILD_ID)
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
);
```

Pycord 等价写法：

```python
intents = discord.Intents.default()       # 仅默认意图，按需开特权意图
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.slash_command(name="slow-task")
async def slow_task(ctx: discord.ApplicationContext):
    await ctx.defer()                      # 立即确认
    result = await slow_database_query()
    await ctx.followup.send(f"结果: {result}")

bot.run(os.environ["DISCORD_TOKEN"])
```

模态框必须是首个响应(不能先 defer/reply)：

```javascript
async execute(interaction) {
  // 正确：直接 showModal；错误：deferReply() 后再 showModal 会报“已确认”
  await interaction.showModal(modal);
}
```

## 注意事项

- **3 秒铁律(致命)**：斜杠命令/按钮/下拉/模态框都须 3 秒内确认，否则用户看到“This interaction failed”。慢操作一律先 `defer`(组件用 `deferUpdate`)；确认后有 15 分钟跟进。
- **模态框(showModal)必须是首个响应**：不能先 `defer()`/`reply()`；如需校验只能做 <3 秒的同步检查。
- **令牌泄露(致命)**：令牌=机器人完全控制权，Discord 会扫描 GitHub 并自动失效；泄露后立即在开发者门户重新生成、更新部署、清理 git 历史。
- **特权意图**：`GUILD_MEMBERS`/`GUILD_PRESENCES`/`MESSAGE_CONTENT` 需在开发者门户开启**并**在代码申请；100+ 服务器需 Discord 认证。优先用斜杠命令/组件，避开 Message Content。
- **缺 `applications.commands` scope**：机器人在服务器里但 `/` 不出命令，多因仅用 `bot` scope 邀请，需用双 scope 重新邀请(不会踢出)。
- **命令注册限流**：每天 200 次/服务器创建；**别在每次启动时注册**；global 命令最长 1 小时传播；开发用 guild 命令调试。
- **关键上限**：每条消息/模态框 5 个 ActionRow；每行 5 按钮或 1 下拉；下拉 25 选项；每消息最多 10 embed、合计 6000 字符。
- **限流额度**：全局 50 请求/秒；网关 120 请求/60 秒；批量操作走队列(建议留余量 ~40/秒)。
- **不要阻塞事件循环**：用 `fs.promises.readFile` 而非同步读；阻塞会导致心跳丢失、网关频繁掉线。
- **分片**：1–2500 服务器无需分片；2500+ 由 Discord 强制要求；建议每分片 ~1000 服务器，每分片独立进程。

## 互见

按需委派到其它技能：AI 对话机器人 → llm-architect；Slack 跨平台 → slack-bot-builder；语音频道 → voice-agents；数据持久化(用户/配置/审核日志) → postgres-wizard；事件触发工作流 → workflow-automation；大规模高可用/监控 → devops；付费订阅功能 → stripe-specialist。

---
采编自 sickn33/antigravity-awesome-skills(原条目源 vibeship-spawner-skills，Apache 2.0；本仓库 MIT)。
