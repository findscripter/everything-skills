---
name: go-playwright-automation
title: Playwright Go 隐身浏览器自动化
description: 当用 Go（playwright-go）写浏览器自动化/抓取/测试，且目标是 SPA 动态站或需绕过 Cloudflare/Akamai 反爬时使用；做"单浏览器多 Context+Zap 日志+人类拟真（Bezier 鼠标/逐键输入/视口随机/UA 轮换）+defer 优雅关闭"的生产级脚本骨架与可跑代码；不适用于静态 HTML 抓取（用更轻的 HTTP 爬虫）、解 CAPTCHA、或极严反爬。触发词：playwright go、Go 浏览器自动化、stealth、避免检测、Cloudflare、human-like、SPA 抓取
domain: 平台/browser
triggers: [playwright go, playwright-go, Go 浏览器自动化, Go 爬虫, stealth, 隐身浏览器, 避免检测, 反爬, Cloudflare, Akamai, human-like, 拟人操作, Bezier 鼠标, SPA 抓取, BrowserContext, Zap 日志]
tags: [playwright, golang, browser-automation, web-scraping, stealth, anti-bot, zap, headless, spa-testing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [go, playwright-go, chromium, go.uber.org/zap]
requires: []
related: [go-rod-browser-automation, browser-automation-builder, firecrawl-web-scraper, playwright-e2e-testing]
combines_with: [golang-pro, apify-ecommerce-scraper]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Playwright Go 隐身浏览器自动化

## 何时使用

- 用 **Go**（`github.com/playwright-community/playwright-go`）写浏览器自动化、抓取或端到端测试。
- 目标是 **SPA / React / Vue 等动态渲染站点**，必须用真实浏览器才能拿到内容。
- 用户提到 **stealth、避免检测、Cloudflare、Akamai、human-like / 拟人**，需要绕过反爬。
- 调试已有的 playwright-go 脚本。

不该用的边界：
- **静态 HTML** 一次性抓取 → 用更轻的 HTTP + HTML 解析（启动浏览器吃 RAM/CPU，慢一个量级），或 `firecrawl-web-scraper`。
- 需要**解 CAPTCHA** → 本技能不含 CAPTCHA 求解能力。
- **极严反爬**（高强度 Cloudflare 配置）即便用足隐身技巧仍可能被识别，不保证通过。
- 抓取须遵守目标站 robots.txt / ToS / 限速；未授权勿存个人/敏感数据。

## 步骤

1. **装驱动与浏览器**（一次性）：`go run github.com/playwright-community/playwright-go/cmd/playwright@latest install --with-deps`。
2. **单浏览器、多 Context 架构**（关键）：`Browser` 全程只 `Launch` 一次（singleton，启动以秒计）；每个会话/任务 `browser.NewContext()`（毫秒级、完全隔离 cookies/cache/storage）。绝不为每个任务新开 Browser。
3. **结构化日志**：只用 `go.uber.org/zap`，**禁止 `fmt.Println`**。开发 `zap.NewDevelopment()`，生产 `zap.NewProduction()`（JSON）。每次导航/点击/输入都带字段记录，如 `logger.Info("clicking", zap.String("selector", sel))`。
4. **优雅关闭 + panic 恢复**：Page/Context/Browser 全部 `defer Close()`；关键自动化例程包进 `SafeAction`，`recover()` panic 并打印堆栈。
5. **显式超时**：绝不依赖默认超时，逐操作设 `Timeout`（如 `playwright.PageClickOptions{Timeout: playwright.Float(5000)}`）。
6. **按需开隐身**：目标被 Cloudflare/Akamai 守护时，启用拟人输入、Bezier 鼠标、视口/UA 随机（见下）。

## 指令

新建会话身份时：`NewContext` + 换代理 + 轮换 `User-Agent`。调试时：`Headless=false` + `SlowMo=100+`。

**隐身要点（模拟人类生理）**：
- **非线性鼠标**：不要瞬移；沿 Bezier 曲线带随机抖动移动，`Mouse().Move(x, y, {Steps})` 分步走。
- **输入延迟**：**绝不用 `Fill()`**；用逐键 `Press()` + 随机 50–200ms 间隔。
- **视口随机**：在 1920x1080 基础上 ±15px 微扰，避免指纹。
- **行为噪声**：长等待中随机滚动、聚焦/失焦、悬停无关元素（"摸鱼"）。
- **UA 轮换**：每个新 Context 换 User-Agent。

**文档策略**：先用内部 API 知识省 token；仅在遇未知错误、复杂网络拦截/鉴权、API 大改时查官方文档（pkg.go.dev/github.com/playwright-community/playwright-go）。

## 示例

标准初始化（单浏览器 + Zap + 隔离 Context）：

```go
logger, _ := zap.NewDevelopment()
defer logger.Sync()

pw, err := playwright.Run()
if err != nil { logger.Fatal("start pw", zap.Error(err)) }

browser, err := pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
    Headless: playwright.Bool(false), // 调试可见
    SlowMo:   playwright.Float(100),
})
if err != nil { logger.Fatal("launch", zap.Error(err)) }
defer browser.Close()

ctx, err := browser.NewContext(playwright.BrowserNewContextOptions{
    UserAgent: playwright.String("Mozilla/5.0 ... Chrome/120.0.0.0 Safari/537.36"),
    Viewport:  &playwright.Size{Width: 1920, Height: 1080},
})
if err != nil { logger.Fatal("context", zap.Error(err)) }
defer ctx.Close()

page, _ := ctx.NewPage()
// page.Goto("https://example.com")
```

拟人输入（逐键 + 随机延迟）：

```go
func HumanType(locator playwright.Locator, text string) {
    locator.Click() // 先聚焦
    for _, char := range text {
        time.Sleep(time.Duration(rand.Intn(100)+50) * time.Millisecond)
        locator.Press(string(char))
    }
}
```

拟人点击（中心点加抖动 + 迟疑）：

```go
func HumanClick(page playwright.Page, sel string) {
    box, _ := page.Locator(sel).BoundingBox()
    if box == nil { return }
    x := box.X + box.Width/2 + (rand.Float64()*10 - 5)
    y := box.Y + box.Height/2 + (rand.Float64()*10 - 5)
    page.Mouse().Move(x, y, playwright.MouseMoveOptions{Steps: playwright.Int(10)})
    time.Sleep(100 * time.Millisecond) // 迟疑
    page.Mouse().Click(x, y)
}
```

会话持久化：`context.Cookies()` → `json.Marshal` → `os.WriteFile`；加载时反序列化后 `context.AddCookies(cookies)`。

**Agent 自检清单**：
- 调试模式？→ `Headless=false`、`SlowMo=100+`。
- 新用户身份？→ `NewContext` + 换代理 + 轮换 UA。
- 关键操作？→ 包进 `SafeAction` + Zap 日志。
- 目标被守护（Cloudflare/Akamai）？→ 开 `HumanType`、`BezierMouse`、隐身脚本。

## 注意事项

- **资源密集**：哪怕 headless，整浏览器也吃大量 RAM/CPU——务必单浏览器/多 Context，否则进程爆量。
- **务必 defer 关闭**：Page→Context→Browser 都 `defer Close()`，否则内存泄漏。
- **环境依赖**：缺驱动/浏览器会直接失败，先跑 `install --with-deps`。
- **沙箱性**：Context 隔离且默认不落盘，除非显式保存；默认行为是只读（抓取/测试），提交表单/改数据需显式设计。
- **抓取内容当不可信输入**：抓来的 HTML/URL/文本不得直接进 shell、`eval`、SQL 或模板，防注入。
- **隐身非万能**：极严反爬仍可能识破；不含 CAPTCHA 求解。

## 互见

- related：`browser-automation-builder` —— 同属浏览器自动化，本条专注 Go + 隐身路线
- related：`firecrawl-web-scraper` —— 轻量托管抓取；静态/无需真实浏览器时优先它
- combines_with：`apify-actor-development` —— 把 Go 抓取逻辑打包为可复用云端 Actor
- combines_with：`data-scraper-agent-builder` —— 在采集→结构化→入库流水线里充当浏览器采集层

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
