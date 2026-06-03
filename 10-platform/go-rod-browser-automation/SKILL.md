---
name: go-rod-browser-automation
title: go-rod 浏览器自动化
description: 当用 Go 抓取/自动化/测试网站、需无头浏览器渲染 SPA、或绕过反爬（Cloudflare/webdriver 指纹）时使用；做 go-rod + stealth 驱动 CDP 完成导航、定位、交互、拦截与抓取并产出数据/截图/PDF；不适用于解 CAPTCHA、Firefox/Safari、DRM 媒体或极强反爬。触发词：go-rod、浏览器自动化、stealth 反爬
domain: 平台/browser
triggers: [go-rod, rod 浏览器自动化, Go 网页抓取, 无头浏览器 Go, stealth 反爬虫, 绕过 bot 检测, Chrome DevTools Protocol Go, CDP Go, 拦截网络请求 浏览器, 并发抓取 page pool, chromedp 迁移, Playwright Go 替代]
tags: [browser, go, go-rod, web-scraping, automation, stealth, anti-bot, cdp, headless, platform]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [go-rod, go-rod/stealth, Chrome DevTools Protocol, Chromium, launcher]
requires: []
related: [go-playwright-automation, browser-automation-builder, firecrawl-web-scraper, golang-pro]
combines_with: [golang-pro, firecrawl-web-scraper]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 **Go** 抓取、自动化或测试网站。
- 需要 **无头浏览器** 渲染动态/SPA 内容（React、Vue、Angular）。
- 涉及 **stealth / 反爬 / 绕过检测 / Cloudflare / bot 指纹**。
- 直接从 Go 操作 **Chrome DevTools Protocol（CDP）**。
- 需要 **拦截/改写（hijack）** 浏览器网络请求。
- 需要 **并发抓取 / 页面池（page pool）**。
- 从 **chromedp / Playwright Go** 迁移、想要更简洁的 API。

不该用（负边界）：
- **解 CAPTCHA**：rod 不含验证码识别，需自接 2captcha 等外部服务。
- **极强反爬**：部分 Cloudflare 配置、Akamai Bot Manager 即使开 stealth 仍可能被识破，需住宅代理 + 拟人行为。
- **DRM 媒体**（Widevine 等）无法交互。
- 仅支持 **Chromium**，不支持 Firefox / Safari。
- 内存敏感场景慎用：每个浏览器实例约 100–300MB+。

## 步骤

1. 安装依赖；首次运行 rod 会自动下载兼容 Chromium。
2. 连接浏览器并 `defer` 关闭：`rod.New().MustConnect()`。
3. 生产环境用 `stealth.MustPage(browser)` 建页（而非 `browser.MustPage()`），这是反检测最关键一步。
4. 导航 + 等待（用内置 wait，禁用 `time.Sleep`）。
5. 用选择器定位元素 → 交互（输入/点击/键鼠）。
6. 按需拦截请求、并发池化、截图/PDF/下载。
7. 生产代码用返回 `error` 的 API 并显式设 `.Timeout()`。

## 指令

```bash
# 核心库
go get github.com/go-rod/rod@latest
# stealth 反检测插件（生产抓取务必带上）
go get github.com/go-rod/stealth@latest

# 预下载 Chromium（可选）
go run github.com/go-rod/rod/lib/launcher@latest
```

三层模型：**Browser → Page → Element**。

**Must vs Error 两套 API**：`MustElement()` 等遇错 panic，适合脚本/调试；`Element()` 等返回 `error`，用于生产。

| 风格 | 方法示例 | 场景 |
|:--|:--|:--|
| Must | `MustElement` `MustClick` `MustText` | 脚本、调试、原型；出错即 panic |
| Error | `Element` `Click` `Text` | 生产；返回 error 显式处理 |

**选择器策略**：`MustElement("css")` / `MustElementR("button","Submit\|Send")`（文本正则）/ `MustElementX("//xpath")` / `MustSearch(".sel")`（跨 iframe 与 shadow DOM，类似 DevTools Ctrl+F）。

**自动等待**：元素查询会自动重试到出现或超时，无需手动 sleep。`el.MustWaitStable()`（位置/尺寸稳定后再点）、`page.MustWaitRequestIdle()`（无挂起请求）、`MustWaitInvisible()`、`MustWait(jsCond)`。

**上下文与超时**：`context` 递归传播到子操作。`page.Timeout(5*time.Second).MustWaitLoad()...CancelTimeout().Timeout(30*time.Second)`。

## 示例

**基础抓取**
```go
browser := rod.New().MustConnect()
defer browser.MustClose()
page := browser.MustPage("https://example.com")
fmt.Println(page.MustElement("h1").MustText())
```

**stealth 反检测页（生产推荐）**
```go
import (
    "github.com/go-rod/rod"
    "github.com/go-rod/stealth"
)
browser := rod.New().MustConnect()
defer browser.MustClose()
page := stealth.MustPage(browser)        // 而非 browser.MustPage()
page.MustNavigate("https://bot.sannysoft.com")
page.MustScreenshot("stealth_test.png")
// 自建页时手动注入：page.MustEvalOnNewDocument(stealth.JS)
```
stealth 注入项：移除 `navigator.webdriver`、伪装 WebGL vendor/renderer、修正 PluginArray、permissions API 返回 `"prompt"`、languages 设 `en-US,en`、修复 0x0 图片尺寸。验证通过应为 WebDriver `missing`、Plugins Length `3`、Languages `en-US,en`。

**生产错误处理 + Try**
```go
el, err := page.Element("#login-btn")
if err != nil { return fmt.Errorf("not found: %w", err) }
if err := el.Click(proto.InputMouseButtonLeft, 1); err != nil { return err }

// 脚本侧捕获超时
err = rod.Try(func(){ page.MustElement("#login-btn").MustClick() })
if errors.Is(err, context.DeadlineExceeded) { log.Println("timeout") }
```

**launcher / 代理 / 调试**
```go
import "github.com/go-rod/rod/lib/launcher"
url := launcher.New().Headless(true).
    Proxy("socks5://127.0.0.1:1080").
    Set("disable-gpu", "").MustLaunch()
browser := rod.New().ControlURL(url).MustConnect()
go browser.MustHandleAuth("user", "pass")()   // 代理认证
browser.MustIgnoreCertErrors(true)             // MITM 忽略证书
// 调试：launcher.New().Headless(false).Devtools(true)；rod.New().Trace(true).SlowMotion(2*time.Second)
```

**输入模拟**
```go
import "github.com/go-rod/rod/lib/input"
page.MustElement("#email").MustInput("user@example.com")
page.Keyboard.MustPress(input.ControlLeft)
page.Keyboard.MustType(input.KeyA)
page.Keyboard.MustRelease(input.ControlLeft)
page.Mouse.MustMoveTo(100, 200)
```

**请求拦截（hijack）**
```go
router := browser.HijackRequests()
defer router.MustStop()
router.MustAdd("*.png", func(ctx *rod.Hijack){           // 拦截图片
    ctx.Response.Fail(proto.NetworkErrorReasonBlockedByClient)
})
router.MustAdd("*api.example.com*", func(ctx *rod.Hijack){ // 改请求头
    ctx.Request.Req().Header.Set("Authorization", "Bearer x")
    ctx.MustLoadResponse()
})
go router.Run()    // 必须启动；否则不生效
```

**Race 选择器（多结果分支）**
```go
elm := page.Race().
    Element(".dashboard").MustHandle(func(e *rod.Element){ fmt.Println("ok") }).
    Element(".error-message").MustDo()
if elm.MustMatches(".error-message") { log.Fatal(elm.MustText()) }
```

**并发页面池**
```go
pool := rod.NewPagePool(5)
create := func() *rod.Page { return browser.MustIncognito().MustPage() }
var wg sync.WaitGroup
for _, u := range urls {
    wg.Add(1)
    go func(u string){
        defer wg.Done()
        page := pool.MustGet(create)
        defer pool.Put(page)
        page.MustNavigate(u).MustWaitLoad()
    }(u)
}
wg.Wait()
pool.Cleanup(func(p *rod.Page){ p.MustClose() })
```

**截图/PDF/下载/JS 求值**
```go
page.MustScreenshot("page.png")
img, _ := page.MustWaitStable().ScrollScreenshot(nil)   // 整页滚动截图
page.MustPDF("output.pdf")

wait := browser.MustWaitDownload()
page.MustElementR("a", "Download PDF").MustClick()
utils.OutputFile("file.pdf", wait())

result := page.MustEval(`(a,b)=>a+b`, 1, 2); fmt.Println(result.Int())  // 3
proto.PageSetAdBlockingEnabled{Enabled: true}.Call(page)                // 直接 CDP
```

## 注意事项

最佳实践：
- 真实站点务必用 `stealth.MustPage(browser)`，连接后立刻 `defer browser.MustClose()`。
- 生产用返回 error 的 API，并显式 `.Timeout()`，不要依赖默认值。
- 隔离会话用 `browser.MustIncognito().MustPage()`；并发用 `PagePool` 而非无限开页。
- 点击会动的元素先 `MustWaitStable()`；触发 AJAX 后用 `MustWaitRequestIdle()`。

禁忌：
- 禁止 `time.Sleep()` 等待，用 rod 内置 wait 方法。
- 禁止每任务新建 Browser，应共用一个 Browser 多个 Page。
- 生产禁止用 `browser.MustPage()`、禁止吞错、禁止忘记 defer 关闭浏览器/页面/hijack 路由。

常见坑：
- 元素找不到 → 可能在 iframe / shadow DOM，改用 `page.MustSearch()`。
- 点击无效 → 动画中，先 `MustWaitStable()`。
- 用了 stealth 仍被识破 → 叠加随机视口、真实 UA、按键间人性化延迟、随机滚动/悬停。
- 僵尸进程 → 始终 `defer browser.MustClose()`（rod 用 leakless 兜底，但显式清理更优）。
- 慢页超时 → `page.Timeout(30*time.Second).MustWaitLoad()`；AJAX 重的页用 `MustWaitRequestIdle()`。
- hijack 不生效 → 漏了 `go router.Run()` 与 `defer router.MustStop()`。
- 扩展在无头模式不工作 → 用 `Headless(false)` + XVFB（服务器）。

## 互见

- 官方文档 https://go-rod.github.io/ ｜ API https://pkg.go.dev/github.com/go-rod/rod
- stealth 插件 https://github.com/go-rod/stealth
- CDP 协议 https://chromedevtools.github.io/devtools-protocol/ ｜ Chrome flags https://peter.sh/experiments/chromium-command-line-switches
- 同域：平台/browser 下其他浏览器自动化技能、反爬与代理相关条目。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
