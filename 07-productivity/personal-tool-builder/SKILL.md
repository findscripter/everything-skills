---
name: personal-tool-builder
title: 自用工具构建方法论
description: 当你想把自己反复手动操作的痛点做成工具（脚本/CLI/本地应用）时使用；做从"挠自己的痒处"出发的快速原型→可靠脚本→可分享工具的演进，产出可执行的方案、技术栈选型与可移植/安全清单；不适用于无真实自身痛点的市场臆想、企业级多人协作系统或纯前端 UI 设计。触发词：自用工具、挠自己痒处、CLI 工具、本地应用、自动化我的重复任务
domain: 协作/automation
triggers: [做个工具, 自用工具, 挠自己的痒处, 解决我自己的问题, 写个 CLI, 本地小应用, 自动化我的, 给自己用的脚本]
tags: [协作-自动化, CLI, 本地优先, 快速原型, 脚本化, 工具演进, 可移植性, 凭据安全]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Write, Edit, Read]
requires: []
related: [developer-experience-optimizer, ai-native-cli-design, zapier-make-automation, micro-saas-launcher]
combines_with: [file-organizer, agent-tool-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你有一个**自己反复遭遇的真实痛点**，想用最小成本做成工具来解决它时。最好的产品常常起步于个人工具：先给自己挠痒处，做到自己每天都用，再发现别人也有同样的痒处。

适用：把每天手动操作 10 次的事自动化、做 CLI、做本地优先的小应用、把脚本逐步养成产品、为自己 dogfood。

**不该用（负边界）**：
- 没有真实自身痛点，只是"觉得别人会想要""这会很酷""市场上有空白"——这类多半是坏痒处，先别建。
- 一上来就要企业级、多人协作、跨团队的复杂系统。
- 纯 UI/视觉设计需求。
- 需要环境特定的真实测试与专家评审才能定论的场景——本方法论不替代实测。

## 步骤

1. **识别真痒处**：用一句话能描述问题；每周都会遇到；已经手动解决过；理想情况下每天会用。任一不满足就要警惕。
2. **从丑陋起步（Day 1）**：写一个只解决"你自己问题"的脚本——没有 UI、硬编码路径和你的数据、零错误处理、你看得懂每一行。
3. **跑稳（Week 1）**：处理你自己的边界情况，加上你真正需要的功能；仍然丑，但可靠。
4. **可能帮到别人（Month 1）**：给未来的你写最简文档、用配置替代硬编码、再考虑分享。
5. **选型**：CLI 用 Node(commander/chalk) 或 Python(click)；存储按复杂度选 JSON 文件 / better-sqlite3 / IndexedDB / Electron/Tauri+SQLite。
6. **判断是否产品化**：见下方信号表，命中"别人主动要""每天在用""解决 $100+ 问题""别人愿付费"再投入。
7. **分享前过安全与可移植清单**（见注意事项）。

## 指令

**Node CLI 起手（commander）**：
```javascript
#!/usr/bin/env node
import { Command } from 'commander';
const program = new Command();
program.name('mytool').description('一句话说明').version('1.0.0');
program.command('do-thing')
  .option('-v, --verbose', '详细输出')
  .action(async (opts) => { /* 你的逻辑 */ });
program.parse();
```
package.json 关键：`"bin": { "mytool": "./bin/cli.js" }`，依赖按需取 commander/chalk/ora/inquirer/conf。

**Python CLI 起手（click，推荐）**：
```python
import click
@click.group()
def cli(): """工具说明"""; pass
@cli.command()
@click.option('--name', '-n', required=True)
def process(name): click.echo(f'Processing {name}')
if __name__ == '__main__': cli()
```

**本地存储——简单用 JSON，复杂用 SQLite**：
```javascript
import { homedir } from 'os'; import { join } from 'path';
const DATA_DIR = join(homedir(), '.mytool');   // 可移植路径
// JSON：loadData/saveData 读写 join(DATA_DIR,'data.json')
// SQLite：new Database(join(DATA_DIR,'data.db'))，建表用 CREATE TABLE IF NOT EXISTS
```

**演进四阶段**：① 个人脚本（只你用、硬编码，数小时~数天）→ ② 可分享工具（README + 基本错误信息 + 配置文件，数天）→ ③ 公开工具（安装说明、跨平台、版本号、基本测试，一两周）→ ④ 产品（落地页、文档站、支持渠道、隐私友好埋点、收款，数周~数月）。

## 示例

**场景：把每天手动转码的操作做成 CLI。**

1. 识别：每天手动跑 ffmpeg 10 次 → 真痒处。
2. Day 1 丑脚本：硬编码输入目录，直接调 ffmpeg，跑通即可。
3. 加依赖检查，避免"在我机器上能跑"：
```javascript
import { execSync } from 'child_process';
function checkDep(cmd, hint) {
  try { execSync(`which ${cmd}`, { stdio: 'ignore' }); }
  catch { console.error(`Missing: ${cmd}\nInstall: ${hint}`); process.exit(1); }
}
checkDep('ffmpeg', 'brew install ffmpeg');
```
4. 路径改可移植（`join(homedir(), '.mytool', ...)` 而非 `'~/data.json'`）。
5. 加自文档化头注释（WHAT/WHY/WHERE/DEPS + 最后可用日期），方便半年后的你。
6. 朋友开始要 → 对照产品化信号，考虑加 web UI 并 `npm publish`。

## 注意事项

- **凭据绝不入码**（CRITICAL）：`const KEY='sk-xxx'` 是错的；用 `process.env.MY_API_KEY` 或 gitignore 的 config.json。提交前审查 git 历史是否泄密。
- **服务只绑 localhost**（HIGH）：个人工具的 web UI 必须 `app.listen(3000, '127.0.0.1')`，绝不用 `'0.0.0.0'` 暴露到网络。
- **可移植性**：硬编码绝对路径→用 `homedir()`/env；shell 写进 shebang；缺依赖要检测并提示安装；OS 差异用 `platform()`/`sep` 处理。脚本顶部加 `#!/usr/bin/env node`（或 python3）。
- **驯服配置**：优先级 智能默认 > 单一配置文件 > 环境变量 > 命令行 flag > 交互提问。"我会想改吗"才暴露选项，而非"有人可能想改吗"。每个边界都加 flag 会让配置比工具还大。
- **为遗忘而设计**：假设未来的你不记得为何/如何/数据在哪/依赖干嘛。README 写 WHY 而非只写 WHAT；架构简单、依赖最少、数据用标准格式。出错时友好降级，打印数据位置让用户手动取数据。
- **别忘的小项**：CLI 要有 `.description()` 与 `--help`（否则未来的你忘了怎么用）；保留版本号与 `--version`；移除调试 console.log；同步操作包 try/catch。
- **何时放手**：6 个月没用、问题已不存在、有更好工具、会推倒重来——就归档（注明原因、导出标准格式数据、别删，可能以后还要）。

## 互见

- 想把工具变现/做成 SaaS → micro-saas-launcher
- 浏览器扩展/Chrome 扩展 → browser-extension-builder
- 自动化/工作流/cron/触发器 → workflow-automation
- 后端/API/数据库 → backend
- AI/GPT/Claude/LLM 包装 → ai-wrapper-product
- Telegram bot → telegram-bot-builder

---
采编自 sickn33/antigravity-awesome-skills（MIT）。原条目上游源为 vibeship-spawner-skills（Apache 2.0）。
