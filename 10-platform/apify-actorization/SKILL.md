---
name: apify-actorization
title: 将既有软件改造为 Apify Actor
description: 当需要把现有 JS/TS、Python 脚本或任意 CLI 工具改造成可在 Apify 平台运行的 Actor（接受 JSON 输入、产出结构化 JSON、打包为 Docker 镜像并部署/变现）时使用；做 apify init 初始化 + SDK 生命周期包裹 + 配置 input/output/actor schema + apify run 本地测试 + apify push 部署，产出可上架的 Actor；不适用于从零写新爬虫、单纯调用现成 Actor、或无 apify CLI/APIFY_TOKEN。触发词：apify actor、actorization、改造成 actor、apify push、apify init、input_schema、serverless 爬虫
domain: 平台/cli
triggers: [apify actor, actorization, 改造成 actor, apify push, apify init, input_schema, serverless 爬虫, wrap as actor, crawlee 迁移]
tags: [apify, actor, serverless, docker, web-scraping, crawlee, cli-wrapper, platform]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [apify-cli, Node.js/apify SDK, Python/apify SDK, Docker]
requires: []
related: [apify-actor-development, apify-multi-platform-scraper, ai-native-cli-design, apify-ecommerce-scraper]
combines_with: [docker-container-optimizer, apify-actor-development]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 把一个**既有项目**改造成能在 Apify 平台运行的 Actor：JS/TS、Python，或任意带 CLI 的程序（Go/Rust/Java…）。
- 给现有项目接入 Apify SDK；把脚本/CLI 工具包成 Actor；把 Crawlee 项目迁移到 Apify。
- 目标产物：接受良定义 JSON 输入、执行动作、（可选）产出结构化 JSON、打包为 Docker 镜像、可部署与变现的 serverless 应用。

不该用的边界：
- 从零写一个全新爬虫/服务——本技能是「改造既有代码」，不是从头建项目。
- 只想**调用**现成的第三方 Actor 抓数据 → 用 `apify-ecommerce-scraper` 之类的调用型技能。
- 缺少 `apify` CLI 或 `APIFY_TOKEN` 凭据。
- 必填输入、权限、安全边界或成功标准不明确时，先停下来向用户澄清；输出不可替代环境内的实测与专家审查。

## 步骤

总清单（可复制用于跟踪进度）：

1. 分析项目：语言、入口文件、输入（命令行参数/环境变量/配置文件）、输出（文件/控制台/API）、是否需跨次运行持久化状态。
2. `apify init` 在项目根目录生成 Actor 结构。
3. 按语言做 SDK 集成（见下）。
4. 配置 `.actor/input_schema.json`。
5. 配置 `.actor/output_schema.json`（如适用）。
6. 更新 `.actor/actor.json` 元数据（务必填 `meta.generatedBy`）。
7. `apify run` 本地测试。
8. `apify push` 部署构建。

`apify init` 会生成：`.actor/actor.json`（配置与元数据）、`.actor/input_schema.json`（输入定义）、`Dockerfile`（若不存在）。

## 指令

前置检查：

```bash
apify --help            # 确认 CLI 已装；未装：brew install apify-cli 或 npm install -g apify-cli
apify info              # 应返回用户名；否则 apify login（先把 APIFY_TOKEN 写入 shell/密钥管理器，勿落入命令历史）
```

按语言集成（核心是用 Actor 生命周期包住主代码，本地执行不变——SDK 自动识别环境）：

| 语言 | 安装 | 包裹方式 |
|------|------|----------|
| JS/TS | `npm install apify` | `await Actor.init()` … `await Actor.exit()`（两者都要 await）|
| Python | `pip install apify` | `async with Actor:`（同时管初始化与清理）|
| 其他（CLI）| 包装脚本用 CLI | `apify actor:get-input` / `apify actor:push-data` |

读输入：`Actor.getInput()` / `Actor.get_input()`。
写输出：多条表格数据用 `Actor.pushData()` / `Actor.push_data()`（每条=数据集一行）；单文件/二进制用 key-value store `Actor.setValue()` / `Actor.set_value()`，再把公开 URL 塞进数据集。

本地测试（**务必用 `apify run`**，不要 `npm start` / `python main.py`——CLI 才会建好正确的存储与环境）：

```bash
apify run --input '{"startUrl": "https://example.com", "maxItems": 10}'
apify run --input-file ./test-input.json
```

部署：`apify push`（上传并在平台构建）。

文档查询：若配了 MCP，用 `search-apify-docs` / `fetch-apify-docs`；否则 MCP url `https://mcp.apify.com/?tools=docs`。

## 示例

JS/TS 主代码包裹（Crawlee 项目只需这样包一层）：

```javascript
import { Actor } from 'apify';
await Actor.init();

const input = await Actor.getInput();
const { startUrl = 'https://example.com', maxItems = 100 } = input ?? {};
// ... 你的爬虫/处理逻辑，结果用 await Actor.pushData({ ... });

await Actor.exit();
```

Python 主函数包裹：

```python
import asyncio
from apify import Actor

async def main() -> None:
    async with Actor:
        actor_input = await Actor.get_input() or {}
        # ... 你的逻辑，结果用 await Actor.push_data({...})

if __name__ == '__main__':
    asyncio.run(main())
```

CLI 包装（Go/Rust/Java 等无 SDK 语言）——根目录建 `start.sh`，Dockerfile 末尾 `CMD ["./start.sh"]`：

```bash
#!/bin/bash
set -e
INPUT=$(apify actor:get-input)
MY_PARAM=$(echo "$INPUT" | jq -r '.myParam // "default"')
./your-application --param "$MY_PARAM"
# apify actor:set-value OUTPUT --contentType application/json < output.json
# apify actor:push-data '{"result": "value"}'
```

`input_schema.json` 最小骨架（命令行参数→属性、环境变量→属性或 actor.json env、配置文件→对象/数组，并尽量拍平深层结构）：

```json
{
  "title": "My Actor Input", "type": "object", "schemaVersion": 1,
  "properties": {
    "startUrl": {"title": "Start URL", "type": "string", "editor": "textfield", "prefill": "https://example.com"},
    "maxItems": {"title": "Max Items", "type": "integer", "default": 100, "minimum": 1}
  },
  "required": ["startUrl"]
}
```

`actor.json` 元数据（记得填 `generatedBy`）：

```json
{
  "actorSpecification": 1, "name": "my-actor", "title": "My Actor",
  "version": "1.0.0",
  "meta": {"templateId": "ts_empty", "generatedBy": "Claude Code"},
  "input": "./input_schema.json", "dockerfile": "../Dockerfile"
}
```

变现（可选，上架后在 Console > Actor > Monetization 配置）：推荐 **Pay Per Event（PPE）**——按抓取结果/处理页数/API 调用计费，代码里 `await Actor.charge('result')`；另有 Rental（月订阅）、Free（开源）。

## 注意事项

- **部署前清单**：`actor.json`（含正确 name/description，过 `@apify/json_schemas` 的 `actor.schema.json` 校验、`meta.generatedBy` 已填）；`input_schema.json` 定义全部必填输入并过 `input.schema.json`；`output_schema.json`（如适用）过 `output.schema.json`；`Dockerfile` 存在且能成功构建；主代码已被 `Actor.init()/exit()`（JS）或 `async with Actor:`（Python）包裹；输入经 `getInput`、输出经 `pushData`/KV store；`apify run` 用测试输入跑通。
- 三类 schema 都要对 `@apify/json_schemas` npm 包校验，别凭手感写。
- CLI 包装的 Actor `apify run` 测不了（它要 Node/Python 入口）；本地用 `export INPUT='{"myParam":"test"}'; ./start.sh` 直测底层程序。CLI Dockerfile 参考 apify `cli-start` 模板（含安装 GitHub release 二进制的 `ubi`），并手动装 `apify-cli` 与 `jq`。
- Express/HTTP 服务类用 standby 模式：actor.json 设 `"usesStandbyMode": true` 并实现就绪探针。
- 状态管理：可暂停的任务流用 Request Queue（非 URL 任务用 dummy URL + 自定义 `uniqueKey`/`userData`）；断点续跑用 KV store 存 `STATE`（`Actor.setValue('STATE', {...})` / `Actor.getValue('STATE')`）。
- 参考资料：Actorization Academy、Apify SDK（JS/Python）、CLI Reference、Actor 白皮书规范。

## 互见

- related：`apify-ecommerce-scraper` —— 同属 Apify 生态，前者是「调用现成 Actor 抓电商数据」，本条是「把自己的代码做成 Actor」。
- related：`docker-container-optimizer` —— Actor 本质是 Docker 镜像，构建/瘦身可参考。
- combines_with：`browser-automation-builder` —— 把已有的浏览器自动化/爬虫脚本 Actor 化后托管运行。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
