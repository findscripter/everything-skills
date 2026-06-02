---
name: browser-automation-builder
title: 浏览器自动化与抓取
description: 当需要用 Playwright 抓取网页数据、自动填表登录、截图存档、提取结构化数据或搭建可重复浏览器工作流时使用；产出含选择器策略、分页/会话/反检测/重试模式的 Python 自动化脚本与 JSON/CSV/JSONL 数据；不适用于写 E2E 测试（用 playwright-pro）、纯 API 测试或性能压测；触发词：网页抓取、自动填表、截图存PDF、反爬反检测、SPA动态内容、会话复用
domain: 平台/browser
triggers: [网页抓取, 爬虫, scrape, 自动填表, 表单自动化, Playwright, 浏览器自动化, 截图, 网页转PDF, 结构化数据提取, 分页抓取, 反检测, 反爬, 会话复用, cookie保存, SPA动态内容, 登录自动化, 下载报表]
tags: [浏览器自动化, Playwright, 网页抓取, 数据提取, 表单自动化, 反检测, 会话管理, Python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Playwright, Python async/await, scraping_toolkit.py, form_automation_builder.py, anti_detection_checker.py]
requires: []
related: [firecrawl-web-scraper, apify-ecommerce-scraper, full-page-screenshot, defuddle-web-extract]
combines_with: [full-page-screenshot, csv-data-cleaner, computer-use-agents]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
基于 Playwright 构建生产级浏览器自动化：数据抓取、表单填写、截图/PDF、会话管理与反检测，可在规模化场景下稳定运行。

## 何时使用

适用：
- 抓取网页中的结构化数据（表格、列表、搜索结果）。
- 自动化多步浏览器流程（登录、填表、下载文件）。
- 对网页截图或导出 PDF。
- 从 SPA、重 JavaScript 站点提取数据。
- 搭建可重复运行的浏览器数据管道。

不该用（负边界）：
- 写浏览器测试 / E2E 测试套件 —— 改用 **playwright-pro**。
- 纯测 API 端点 —— 改用 **api-test-suite-builder**。
- 负载 / 性能压测 —— 改用 **performance-profiler**。
- 站点已有公开 API 时，直接打 API 比抓取渲染页更快、更稳、更不易被检测。

为什么选 Playwright（而非 Selenium/Puppeteer）：内置自动等待，多数操作无需手写 `sleep()`；单一 API 跨 Chromium/Firefox/WebKit；原生网络拦截；浏览器 context 提供隔离会话；`playwright codegen` 可录制动作生成脚本；async-first 适合高吞吐抓取。

## 步骤

工作流一 · 单页数据提取（JS 渲染内容）：
1. 开发期用有头模式（`headless=False`）调试，生产切换为 `headless=True`。
2. 导航到 URL 并等待内容选择器（而非仅等 load 事件）。
3. 用 `query_selector_all` + 字段映射提取数据。
4. 校验结果（空值、类型）。
5. 输出 JSON。

工作流二 · 分页多页抓取（50+ 页）：
1. 带反检测配置启动浏览器。
2. 打开首页并提取当前页数据。
3. 判断「下一页」按钮是否存在且可用。
4. 点击后等待新内容加载（不是只等导航）。
5. 循环直到无下一页或达上限。
6. 按唯一键去重。
7. 增量写出，避免全量驻留内存。

工作流三 · 带鉴权流程自动化（登录→多步表单→下载报表）：
1. 检查是否已有会话状态文件。
2. 无会话则登录并保存状态。
3. 用已保存会话打开目标页。
4. 按步填写多步表单。
5. 等待下载触发。
6. 把下载文件保存到目标目录。

## 指令

选择器优先级（从稳到脆）：① `data-testid`/`data-id` 等自定义 data 属性；② `#id`；③ 语义标签 `article`/`nav`/`main`/`section`；④ 类名 `.product-card`（生成式类名易碎）；⑤ 位置型 `nth-child()`（最后手段）。仅当 CSS 无法表达关系（祖先遍历、按文本选取）时才用 XPath。

截图 / PDF：
- 整页：`await page.screenshot(path="full.png", full_page=True)`
- 元素：`await page.locator("div.chart").screenshot(path="chart.png")`
- PDF（仅 Chromium）：`await page.pdf(path="out.pdf", format="A4", print_background=True)`
- 视觉回归：固定状态截图，命名 `{page}_{viewport}_{state}.png` 入库做基线。

会话管理：`context.storage_state(path="state.json")` 保存 cookies+localStorage，`browser.new_context(storage_state="state.json")` 恢复。登录后存状态、跨任务复用；长任务前先用轻量请求访问受保护页验证未被重定向到登录页。

反检测（按优先级）：① 通过 init script 移除 `navigator.webdriver`（关键）；② 轮换真实 User-Agent，禁用默认 headless UA；③ 真实视口 1920x1080（默认 800x600 是红旗）；④ `random.uniform()` 随机延迟节流；⑤ 按浏览器/context 配置代理。

动态内容：SPA 等内容选择器而非 load 事件；`page.expect_response("**/api/data*")` 等指定 AJAX；开放 Shadow DOM 用 `>>`（`page.locator("custom-element >> .inner-class")`）；懒加载图片用 `scroll_into_view_if_needed()` 触发。

错误与重试：指数退避（1s/2s/4s）包裹页面交互；`TimeoutError` 时先尝试备用选择器；失败时 `page.screenshot(path="error-state.png")` 存证；检测 HTTP 429 并遵守 `Retry-After`。

辅助脚本（纯标准库，`python3 <脚本> --help` 看用法）：
- `scraping_toolkit.py` —— 生成抓取脚本骨架（`--url`/`--selectors`/`--paginate`/`--output`）。
- `form_automation_builder.py` —— 据字段规格生成填表脚本（`--fields`/`--url`/`--output`）。
- `anti_detection_checker.py` —— 审计脚本检测向量，输出风险评分（`--file`/`--verbose`）。

## 示例

分页抓取（核心循环）：
```python
async def scrape_paginated(base_url, selectors, max_pages=100):
    all_data = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await (await browser.new_context()).new_page()
        await page.goto(base_url)
        for page_num in range(max_pages):
            items = await extract_listings(page, selectors["container"], selectors["fields"])
            all_data.extend(items)
            next_btn = page.locator(selectors["next_button"])
            if await next_btn.count() == 0 or await next_btn.is_disabled():
                break
            await next_btn.click()
            await page.wait_for_selector(selectors["container"])
            await human_delay(800, 2000)
        await browser.close()
    return all_data
```

带鉴权流程 + 下载：
```python
async def authenticated_workflow(credentials, form_data, download_dir):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        state_file = "session_state.json"
        if os.path.exists(state_file):
            context = await browser.new_context(storage_state=state_file)
        else:
            context = await browser.new_context()
            page = await context.new_page()
            await login(page, credentials["url"], credentials["user"], credentials["pass"])
            await context.storage_state(path=state_file)
        page = await context.new_page()
        await page.goto(form_data["target_url"])
        for step_fn in [fill_step_1, fill_step_2]:
            await step_fn(page, form_data)
        async with page.expect_download() as dl_info:
            await page.click("button:has-text('Download Report')")
        download = await dl_info.value
        await download.save_as(os.path.join(download_dir, download.suggested_filename))
        await browser.close()
```

## 注意事项

反模式与正解：
- 硬编码等待：别 `wait_for_timeout(5000)`，改用 `wait_for_selector`/`wait_for_url`/`expect_response`/`wait_for_load_state`。
- 无错误恢复：别写崩溃即停的线性脚本；每个交互 try/except + 错误截图 + 指数退避重试。
- 无视 robots.txt：抓取前解析并遵守 `Crawl-delay`，跳过禁止路径，规模化时在 UA 注明 bot 名。
- 脚本里硬编码账密：改用环境变量、.env（加 gitignore）或密钥管理，凭据经 CLI 传入。
- 无限速：礼貌抓取加 1-3s 随机延迟，监测 429，指数退避。
- 选择器脆弱：避开生成式类名（`.css-1a2b3c`）和深层嵌套；优先 data 属性、语义 HTML、文本定位，先在 DevTools 验证。
- 不清理浏览器：始终用 `try/finally` 或 async context manager 确保 `browser.close()`，防资源泄漏。
- 生产跑有头：用环境变量切换 `headless = os.environ.get("HEADLESS", "true") == "true"`。

## 互见

- **playwright-pro** —— 浏览器测试；E2E、断言、fixture 归它，本技能只管数据提取与流程自动化。
- **api-test-suite-builder** —— 站点有公开 API 时直接打 API，更快更稳更隐蔽。
- **performance-profiler** —— 脚本慢时先定位瓶颈再上并发。
- **env-secrets-manager** —— 鉴权流程中安全管理凭据。

参考文件（源仓库内）：`references/data_extraction_recipes.md`（分页/滚动/表格转 JSON/价格解析/清洗/JSON·CSV·JSONL 输出）、`references/playwright_browser_api.md`（fill/select_option/set_input_files/截图/等待/网络拦截/Shadow DOM 完整 API）、`references/anti_detection_patterns.md`（隐身栈、指纹规避、行为模拟、代理轮换、退避与限速类）。

---
本条目采编自 alirezarezvani/claude-skills（MIT 许可），适配重写而非逐字翻译。
