---
name: full-page-screenshot
title: 整页网页截图捕获
description: 当需要把整张网页（含需滚动、懒加载、超长内容）抓成单张 PNG 时使用；通过 Chrome DevTools Protocol（CDP）零外部依赖地展开滚动容器、触发懒加载、测量并截图，超高页面分块拼接，产出完整长截图；不适用于纯可视区截图、PDF 导出、需复杂交互后再截的场景或无远程调试的浏览器；触发词：整页截图、长截图、full-page screenshot、long screenshot、网页长图、完整页面捕获、滚动截图
domain: 平台/browser
triggers: [整页截图, 长截图, full-page screenshot, long screenshot, 网页长图, 完整页面捕获, 滚动截图]
tags: [screenshot, browser, chrome, cdp, automation, nodejs]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Node.js 22+, Chrome DevTools Protocol, WebSocket, Python PIL/Pillow]
requires: []
related: [browser-automation-builder, firecrawl-web-scraper, demo-video-generator]
combines_with: [browser-automation-builder, webapp-testing]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

需要把**整张网页**（包括需要滚动、懒加载、SPA 动态渲染、甚至上万像素超长的内容）抓成**单张 PNG** 时使用。脚本基于 Chrome DevTools Protocol（CDP），除 Node.js 22+ 与开启远程调试的 Chrome 外零外部依赖，能自动展开滚动容器、触发懒加载、测量真实内容高度并完成截图与拼接。

不该用边界：
- 只要可视区截图（普通截屏即可，无需本技能）。
- 需要 PDF 矢量导出，而非位图。
- 截图前需大量交互（多步表单、登录流程编排），本技能只做「打开/定位 → 等待 → 截图」。
- 浏览器未开启远程调试，且无法引导用户开启时。

## 步骤

1. **环境自检**：确认 Node.js 22+ 与 Chrome 远程调试可用。失败时引导用户打开 `chrome://inspect/#remote-debugging` 并勾选「Allow remote debugging for this browser instance」。
2. **选择模式**：
   - 方案 A（推荐，尤其登录态/SSO 页面）：对**已打开的标签页**截图，先 `--list` 列出标签，再用 `targetId` 截图。
   - 方案 B：对 **URL** 截图，脚本开后台标签 → 等待 → 截图 → 关闭；不适合需鉴权的页面。
3. **设置参数**：按页面类型选 `--width`（文章 1200，仪表盘/宽表 1440-1920）、`--dpr`、`--wait`。
4. **执行截图**并指定输出路径。
5. **验证产物**：检查输出 PNG 的实际尺寸，确认未截断、非空白。

## 指令

```bash
# 1) 环境自检（务必先做）
node "${SKILL_DIR}/scripts/full-page-screenshot.mjs" --check

# 2A) 列出已打开标签页
node "${SKILL_DIR}/scripts/full-page-screenshot.mjs" --list

# 2B) 对已打开标签截图（登录态首选）
node "${SKILL_DIR}/scripts/full-page-screenshot.mjs" <targetId> /tmp/screenshot.png --width 1200 --dpr 1

# 3) 对 URL 截图（后台开标签，不适合鉴权页）
node "${SKILL_DIR}/scripts/full-page-screenshot.mjs" --url "https://example.com" /tmp/screenshot.png --width 1200 --dpr 1 --wait 15000
```

参数表：

| 参数 | 说明 | 默认 |
|------|------|------|
| `output` | 输出 PNG 路径 | `/tmp/screenshot.png` |
| `--width` | 视口宽度（CSS 像素，文章 1200，仪表盘 1440-1920） | 1200 |
| `--dpr` | 设备像素比（2=Retina，但文件体积约 4 倍） | 1 |
| `--wait` | 页面加载超时 ms（仅 `--url` 模式） | 15000 |
| `--css` | 截图前注入的自定义 CSS（如隐藏元素） | — |

验证输出：

```bash
sips -g pixelWidth -g pixelHeight /tmp/screenshot.png   # macOS
file /tmp/screenshot.png                                 # Linux
```

## 示例

对仪表盘类宽页面（已登录）截图：

```bash
node "${SKILL_DIR}/scripts/full-page-screenshot.mjs" --list
# 从 JSON 中按 title/URL 找到目标，取其 targetId
node "${SKILL_DIR}/scripts/full-page-screenshot.mjs" <targetId> /tmp/dash.png --width 1600 --dpr 1
sips -g pixelWidth -g pixelHeight /tmp/dash.png
```

## 注意事项

工作原理（关键能力）：
- **SPA 滚动容器展开**：检测 `overflow-y: auto/scroll` 容器并滚动触发懒加载，再移除 overflow 约束（含 Tailwind `h-[calc(...)]`），使全部内容在一次截图中渲染。
- **DOM 稳定检测**：`readyState=complete` 后持续监测 DOM 元素数直到稳定，确保 SPA 渲染完成。
- **懒加载触发**：逐步滚动视口触发 `IntersectionObserver`，并等待所有 `<img>` 加载完成。
- **超高页面分块拼接**：高度超过 **16,000px** 时按 **8,000px** 分块截图，用 Python PIL（Pillow）自动拼接；无 PIL 时退化为分别保存各分块。
- **Chrome 自动发现**：读取 `DevToolsActivePort` 文件取调试端口，失败则探测 9222、9229、9333。
- **CDP 代理回退**：当代理占用浏览器 WebSocket 时，回退到代理 API 端点（`/eval`、`/screenshot`、`/scroll`）。

反模式（务必避免）：
- 不要对 > 10,000px 的页面用 `--dpr 2`，会触发 Chrome 内存问题；用 `--dpr 1`。
- 不要对需鉴权/SSO 的页面用 `--url`；改用 `--list` + targetId 在已登录标签上截。
- SPA 不要把 `--wait` 设到 5000 以下；用 10000-15000。
- 不要跳过 `--check` 就截图；先确认调试可用。
- 不要对所有页面硬编码视口宽度；文章 1200、仪表盘/宽表 1440+。
- 不要跳过产物验证；务必用 `sips`/`file` 核对尺寸。

常见故障：
- 「找不到 Chrome 调试端口」→ 未开远程调试，按自检提示开启。
- 「WebSocket 连接超时」→ CDP 代理占用连接，脚本会自动回退代理 API。
- 空白/纯白截图 → 页面未加载完，调大 `--wait`。
- 底部被截断 → 滚动容器未展开（脚本本应自动处理，持续出现则反馈 issue）。
- 内存溢出 → 超长页面叠加高 DPR，降 `--dpr` 至 1 并/或降 `--width`。
- 「PIL not available for stitching」→ 未装 Pillow，`pip3 install Pillow` 或接受分块文件。

## 互见

- `平台/browser` 域下的浏览器自动化技能（CDP/Playwright 通用模式）可与本技能配合，用于截图前的页面交互与定位。
- 性能分析类技能可与可视化截图互补。

---

本条采编自 alirezarezvani/claude-skills（MIT）。
