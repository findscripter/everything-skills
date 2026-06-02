---
name: webapp-testing
title: Web 应用测试（Playwright）
description: 当需要驱动浏览器测试/调试本地 Web 应用、验证前端功能、截图或抓取浏览器日志时使用；用原生 Python Playwright 脚本配合 with_server.py 自动管理服务进程，产出截图、控制台日志与交互验证结果；不适用于单元/接口测试、生产站点压测或纯视觉评审；触发词：webapp testing、playwright、浏览器自动化、前端测试、UI 调试、网页截图、控制台日志、e2e、headless、本地起服务测试。
domain: 研发/testing
triggers: [webapp testing, playwright, 浏览器自动化, 前端测试, UI 调试, 网页截图, 控制台日志, e2e, headless, 本地起服务测试]
tags: [webapp-testing, playwright, browser-automation, frontend, e2e, testing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [playwright, python, with_server.py, chromium]
requires: []
related: [frontend-design, web-artifacts-builder]
combines_with: [code-reviewer]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
## 何时使用

- 需要真实驱动浏览器与**本地** Web 应用交互：验证前端功能、调试 UI 行为、点击/填表/导航、截图、抓取浏览器控制台日志。
- 应用是动态前端（React/Vue/Vite 等需 JS 渲染）或静态 HTML，都适用；可一条命令拉起前后端多个服务再跑测试。
- 触发词：webapp testing、playwright、浏览器自动化、前端测试、UI 调试、网页截图、控制台日志、e2e、headless、本地起服务测试。

不该用的边界：
- 单元测试 / 接口（HTTP API）测试 / 后端逻辑断言 —— 用对应测试框架直接断言，无需开浏览器。
- 对生产线上站点做压测、爬取、负载测试 —— 本技能面向本地开发态验证。
- 纯静态视觉/设计评审、不需要真实渲染 —— 直接读 HTML 即可。
- 远程 CI 已有 e2e 流水线、只想看结果 —— 不在此范围。

## 步骤 / 指令

先决策再动手（决策树）：

```
任务 → 是静态 HTML 吗？
  ├─ 是 → 直接读 HTML 文件，定位选择器
  │        ├─ 能定位 → 用 file:// URL 写 Playwright 脚本
  │        └─ 读不全/含动态 JS → 按动态应用处理（见下）
  └─ 否（动态应用）→ 服务是否已在跑？
      ├─ 否 → 先 `python scripts/with_server.py --help`，用它托管服务 + 写精简脚本
      └─ 是 → 侦察后行动：
              1) 导航并等 networkidle
              2) 截图 / 抓 DOM
              3) 从渲染后状态识别选择器
              4) 用选出的选择器执行操作
```

核心规则：
1. **脚本当黑盒用**：`scripts/with_server.py` 等先跑 `--help` 看用法再直接调用；不要把脚本源码读进上下文（很长，会污染上下文窗口），仅当确需定制时才读。
2. **服务交给 with_server.py 托管**：它会拉起一个或多个服务、轮询端口直到就绪、运行你的命令、结束后清理。你的自动化脚本里只写 Playwright 逻辑，不要自己起服务。
3. **chromium 一律 headless 启动**，用完**务必 `browser.close()`**。
4. **动态应用先等 `networkidle` 再检查 DOM**（关键约束，见注意事项）。
5. 选择器优先用语义化的：`text=`、`role=`、CSS、`#id`；必要时加等待 `wait_for_selector()` / `wait_for_timeout()`。

## 示例

用 with_server.py 托管服务再跑自动化（先看 `--help`）：

```bash
# 单服务
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py

# 多服务（后端 + 前端）
python scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python your_automation.py
```

自动化脚本只含 Playwright 逻辑（服务已由上面托管并就绪）：

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)   # 始终 headless
    page = browser.new_page()
    page.goto('http://localhost:5173')           # 服务已就绪
    page.wait_for_load_state('networkidle')       # 关键：等 JS 执行完
    # ...交互逻辑
    browser.close()                               # 用完务必关闭
```

侦察后行动（识别选择器）：

```python
page.screenshot(path='/tmp/inspect.png', full_page=True)
content = page.content()
buttons = page.locator('button').all()
```

抓控制台日志：

```python
page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
```

静态 HTML 用 file:// 直接测：

```python
import os
file_url = f"file://{os.path.abspath('path/to/file.html')}"
page.goto(file_url)               # 静态文件无需起服务，也无需等 networkidle
page.fill('#email', 'a@b.com')
page.click('button[type="submit"]')
```

## 注意事项

- **动态应用必须先 `page.wait_for_load_state('networkidle')` 再检查 DOM/截图**；过早检查会拿到未渲染的空壳，是最常见的坑。静态 file:// 页面通常不需要。
- chromium 始终 headless，脚本结束务必关闭浏览器，避免残留进程占端口。
- `with_server.py` 的 `--server` 与 `--port` 数量必须一一对应；默认每个服务就绪超时 30 秒，可用 `--timeout` 调整；命令分隔符 `--` 之后才是要运行的命令。
- 截图/日志输出路径用绝对路径；示例里的 `/tmp`、`/mnt/user-data/outputs` 按你的环境替换为可写目录（Windows 用 `C:\...` 或临时目录）。
- 选择器要稳定且具描述性，避免依赖易变的下标顺序；交互后用显式等待而非裸 `sleep`。
- 源技能为 Apache-2.0，本条目为适配重写；脚本（如 with_server.py、examples/）随源仓库分发，按需调用。

## 互见

- requires：无。
- related：`frontend-design`（产出前端界面，本技能负责对其做浏览器层面的功能验证与调试）、`web-artifacts-builder`（构建 Web 工件后可用本技能跑交互验证）。
- combines_with：`code-reviewer`（前端改动先静态审查、再用本技能起浏览器实测，形成"审查 + 运行验证"闭环）。
