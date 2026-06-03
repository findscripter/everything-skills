---
name: lambdatest-cross-framework-testing
title: LambdaTest 多框架测试自动化
description: 当需要为 46 个主流测试框架（Selenium/Playwright/Cypress/Jest/pytest/Appium 等）跨 15+ 语言编写、脚手架、迁移或在 LambdaTest 云端跑自动化测试时使用；做按框架+语言选对工程结构/依赖/Runner 命令，配置本地或云端（RemoteWebDriver capabilities、LT_USERNAME/LT_ACCESS_KEY 走环境变量）并接入 CI/CD，产出生产级测试代码与流水线；不适用于纯手工探索测试、无回归价值的一次性脚本或缺少 LambdaTest 账号的云端场景；触发词：lambdatest、跨框架测试、selenium、playwright、appium、cucumber、框架迁移、云端测试
domain: 研发/testing
triggers: [lambdatest, 跨框架测试, test automation, selenium, playwright, cypress, appium, pytest, jest, cucumber, bdd 测试, 框架迁移, selenium 迁移 playwright, 云端测试, RemoteWebDriver, 测试脚手架, scaffold tests]
tags: [测试, test-automation, LambdaTest, E2E, 单元测试, 移动测试, BDD, selenium, playwright, appium, 框架迁移, CI/CD, 研发, QA]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Selenium, Playwright, Cypress, Appium, pytest, Jest, RemoteWebDriver, LambdaTest / HyperExecute, GitHub Actions / Jenkins / GitLab CI]
requires: []
related: [browserstack-cross-browser-test, playwright-e2e-testing, webapp-testing, javascript-testing-patterns]
combines_with: [ci-cd-pipeline-builder, playwright-e2e-testing, test-coverage-gap-finder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
采编自 sickn33/antigravity-awesome-skills（MIT），源为 LambdaTest/agent-skills 的 46 框架测试自动化注册表。

## 何时使用

当你要写、脚手架、评审、迁移或在云端运行任意主流框架的自动化测试时使用，让 Agent 以「资深 QA 自动化架构师」身份产出符合各框架真实约定的代码，而非通用样板。典型场景：

- 为 Selenium / Playwright / Cypress / Jest / pytest / Appium 等 46 个框架编写或脚手架测试。
- 新建测试工程，需要正确的目录结构、配置文件与依赖版本。
- 把测试接入 CI/CD（GitHub Actions / Jenkins / GitLab CI）。
- 跨框架迁移（如 Selenium→Playwright、Puppeteer→Cypress）。
- 在 LambdaTest / TestMu AI 云端真实浏览器/设备矩阵上跑测试。

**不该用的边界：**

- 纯手工探索测试、无回归价值的一次性点击 → 不值得固化为脚本。
- 缺少目标 URL、测试账号、成功判定标准时：先停下问清楚，别盲目生成。
- 云端执行缺 LambdaTest 账号/凭据时，先引导用户获取，不要硬跑。
- 本技能是「索引 + 触发指南」，各框架的完整实现细节仍以官方文档和源仓库为准，不替代环境搭建与专家评审。
- 移动框架（Appium/Espresso/XCUITest/Flutter/Detox）需另装平台工具链（Android SDK、Xcode）。

## 步骤

1. **识别框架与语言**：确定用户用的测试框架 + 编程语言，匹配到下方注册表中对应的 skill。
2. **加载框架上下文**：每个框架 skill 含——工程结构与依赖、核心代码模式、Page Object / 测试工具、云端执行配置、CI/CD 集成、常见问题排障表、最佳实践清单。
3. **产出生产级代码**：用正确的 import 路径、配置格式、断言库与 Runner 命令，不要写通用样板。
4. **配置本地或云端执行**：本地用本地 Runner 配置；云端用 `RemoteWebDriver` capabilities 或对应 SDK，凭据 `LT_USERNAME` / `LT_ACCESS_KEY` 一律走环境变量，**禁止硬编码**。云端 capabilities 用 LambdaTest Capabilities Generator（https://www.lambdatest.com/capabilities-generator/）生成。
5. **接入 CI/CD**：按需生成并行执行、上传报告、失败抓产物的流水线（GitHub Actions / Jenkins / GitLab CI），secrets 存入 CI 的 Secrets 而非明文 YAML。

## 指令

按类目挑选框架 skill（共 46 个）：

| 类目 | 代表框架（语言） |
|---|---|
| E2E / 浏览器（15） | `selenium`(Java/Py/JS/C#/Ruby)、`playwright`(JS/TS/Py/Java/C#)、`cypress`(JS/TS)、`webdriverio`、`puppeteer`、`testcafe`、`nightwatchjs`、`capybara`(Ruby)、`selenide`(Java)、`protractor`、`codeception`/`laravel-dusk`(PHP)、`robot-framework`(Py) |
| 单元测试（15） | `jest`、`junit-5`(Java)、`pytest`(Py)、`testng`(Java)、`vitest`、`mocha`、`jasmine`、`karma`、`xunit`/`nunit`/`mstest`(C#)、`rspec`/`testunit`(Ruby)、`phpunit`(PHP)、`unittest`(Py) |
| 移动测试（5） | `appium`(多语言)、`espresso`(Java/Kotlin)、`xcuitest`(Swift/ObjC)、`flutter-testing`(Dart)、`detox`(JS/TS) |
| BDD（7） | `cucumber`、`specflow`(C#)、`serenity-bdd`(Java)、`behave`/`lettuce`(Py)、`behat`(PHP)、`gauge`(多语言) |
| 视觉（1） | `smartui`(JS/TS/Java) 视觉回归 |
| 云端编排（1） | `hyperexecute`(YAML) 云端测试编排 |
| 迁移（1） | `test-framework-migration`（Selenium↔Playwright↔Puppeteer↔Cypress） |
| DevOps（1） | `cicd-pipeline`（GitHub Actions / Jenkins / GitLab CI） |

## 示例

提示词驱动的四类常见请求：

```text
# 1. TS 脚手架：生成 playwright.config.ts + 登录页 Page Object + @playwright/test 用例 + GitHub Actions 并行流水线
"用 TypeScript 为登录页写 Playwright 测试，在 Chrome 和 Firefox 上跑"

# 2. 云端执行：配置 RemoteWebDriver + LambdaTest capabilities + 并行 TestNG 套件
"把 Selenium Java 测试在 LambdaTest 的 Windows 11 Chrome/Firefox、macOS Safari 上跑"

# 3. 框架迁移：映射 locator / wait / 断言，保留测试意图、更新语法
"把现有 Selenium Python 测试迁移到 Playwright"

# 4. pytest 套件：生成带共享 fixtures 的 conftest.py + @pytest.mark.parametrize + pytest.ini 覆盖率
"为支付 API 建一个带 fixtures 和参数化用例的 pytest 套件"
```

云端凭据一律走环境变量（绝不硬编码）：

```bash
export LT_USERNAME="<your-username>"
export LT_ACCESS_KEY="<your-access-key>"
```

## 注意事项

- **凭据安全**：`LT_USERNAME` / `LT_ACCESS_KEY`、API token 永不写进代码或明文 YAML，统一走环境变量 / CI Secrets。
- **POM 隔离**：用 Page Object Model 把测试逻辑与 UI 选择器分离。
- **显式等待**：所有框架都禁用固定 `sleep()`，改用 `waitForSelector`(Playwright) / `WebDriverWait`(Selenium) / `cy.get().should()`(Cypress)。
- **并行 + 产物**：框架支持就并行跑；失败时务必抓截图与日志。
- **依赖版本**：按各框架官方推荐版本对齐，别混用大版本。
- **测试纪律**：不依赖执行顺序、不硬编码 URL/凭据/环境值、不写无断言的「假测试」、flaky 用例查根因而非永久加 retry。
- **常见坑**：本地过、CI 挂 → CI 开 headless 且浏览器版本对齐；云端鉴权失败 → 核对环境变量与 LambdaTest 控制台凭据；capabilities 报错 → 用 Capabilities Generator；移动「device not found」→ 本地查 `adb devices`/模拟器，云端核对设备名与 LambdaTest 支持列表完全一致。

## 互见

- related：`playwright-e2e-testing` —— 单框架 Playwright E2E 的深度搭建与配置
- related：`browserstack-cross-browser-test` —— 另一家云端跨浏览器矩阵（BrowserStack）
- related：`python-testing-pytest`、`javascript-testing-patterns`、`android-ui-verification` —— 具体语言/平台的测试深挖
- combines_with：`ci-cd-pipeline-builder` —— 把生成的测试套件接入流水线并行执行
- combines_with：`test-coverage-gap-finder` —— 补齐关键流的覆盖缺口
