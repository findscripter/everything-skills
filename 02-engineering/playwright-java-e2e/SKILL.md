---
name: playwright-java-e2e
title: Playwright Java 端到端测试
description: 当用 Java 写浏览器端到端（E2E）测试、需要并行/跨浏览器/可追溯报告时使用；做基于页面对象模型（POM）+JUnit 5+Allure 的可落地测试脚手架与页面类/用例代码；不适用于纯 API 测试（用 REST Assured）或单元测试。触发词：Playwright Java、POM、JUnit5、Allure、跨浏览器、ThreadLocal、trace、并行测试
domain: 研发/testing
triggers: [Playwright Java, 用 Java 写 E2E, 页面对象模型 POM, JUnit5 UI 测试, Allure 报告, 跨浏览器并行测试, ThreadLocal Page, BrowserContext, Playwright trace, 替换 Thread.sleep 消除 flaky, CI 里跑 Playwright, API+UI 混合测试]
tags: [playwright, java, e2e-testing, junit5, page-object-model, allure, parallel, 测试自动化]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude, cursor, antigravity]
requires: []
related: [playwright-e2e-testing, lambdatest-cross-framework-testing, webapp-testing, java-modern-pro]
combines_with: [api-test-suite-builder, ci-cd-pipeline-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 从零搭建 Playwright Java 项目脚手架（Java 17+ / Playwright 1.44+）。
- 编写页面对象（Page Object）类或 JUnit 5 用例类。
- 跨浏览器测试、并行执行、Allure 报告、trace/视频取证。
- 修复 flaky 测试：把 `Thread.sleep()` 换成显式等待。
- 在 CI/CD（GitHub Actions、Jenkins、Docker）中接入 Playwright。
- 单个用例内混合 API 调用与 UI 断言（hybrid 测试）。
- 用户提到「POM」「BrowserContext」「Playwright fixtures」「traces」。

不该用（负边界）：
- 纯 API 测试套件、无任何 UI 交互 —— 用 REST Assured。
- 普通单元测试 / 组件测试 —— 用 JUnit + Mockito，无需启动浏览器。
- 需求、权限、成功标准不清时，先停下来澄清，别硬写。

## 步骤 / 指令

1. 先选方案，再写代码。按下表对号入座：

| 用户诉求 | 方案 |
|---|---|
| 从零新项目 | 完整脚手架（pom.xml + 目录结构）|
| 单个功能测试 | 一个 POM 页面类 + 一个 JUnit5 用例类 |
| API+UI 混合 | `APIRequestContext` 与 `Page` 并用 |
| 跨浏览器 | `@MethodSource` 参数化浏览器名 |
| 修 flaky | `sleep` 换成 `waitFor` / `waitForResponse` |
| CI 接入 | 流水线里跑 `install --with-deps` |
| 并行执行 | `junit-platform.properties` + `ThreadLocal` |
| 富报告 | Allure + trace + 录屏 |

2. 固定目录结构（新项目一律照此布局）：

```
src/test/java/com/company/tests/
├── base/   BaseTest.java, BasePage.java
├── pages/  LoginPage.java
├── tests/  LoginTest.java
├── utils/  TestDataFactory.java, WaitUtils.java
└── config/ ConfigReader.java
src/test/resources/
├── test.properties
├── junit-platform.properties
└── testdata/users.json
pom.xml
```

3. 搭线程安全的 `BaseTest`：用 `ThreadLocal` 持有 `Playwright → Browser → BrowserContext → Page` 整条链；`@BeforeEach` 建链 + 开 tracing，`@AfterEach` 停 tracing 落盘后逐层关闭。浏览器由 `-Dbrowser` 系统属性切换：

```java
public class BaseTest {
    protected static ThreadLocal<Playwright>     playwrightTL = new ThreadLocal<>();
    protected static ThreadLocal<Browser>        browserTL    = new ThreadLocal<>();
    protected static ThreadLocal<BrowserContext> contextTL    = new ThreadLocal<>();
    protected static ThreadLocal<Page>           pageTL       = new ThreadLocal<>();
    protected Page page() { return pageTL.get(); }

    @BeforeEach
    void setUp() {
        Playwright pw = Playwright.create();
        playwrightTL.set(pw);
        Browser browser = resolveBrowser(pw).launch(
            new BrowserType.LaunchOptions().setHeadless(ConfigReader.isHeadless()));
        browserTL.set(browser);
        BrowserContext ctx = browser.newContext(new Browser.NewContextOptions()
            .setViewportSize(1920, 1080)
            .setRecordVideoDir(Paths.get("target/videos/"))
            .setLocale("en-US"));
        ctx.tracing().start(new Tracing.StartOptions().setScreenshots(true).setSnapshots(true));
        contextTL.set(ctx);
        pageTL.set(ctx.newPage());
    }

    @AfterEach
    void tearDown(TestInfo info) {
        String name = info.getDisplayName().replaceAll("[^a-zA-Z0-9]", "_");
        contextTL.get().tracing().stop(new Tracing.StopOptions()
            .setPath(Paths.get("target/traces/" + name + ".zip")));
        pageTL.get().close(); contextTL.get().close();
        browserTL.get().close(); playwrightTL.get().close();
    }

    private BrowserType resolveBrowser(Playwright pw) {
        return switch (System.getProperty("browser", "chromium").toLowerCase()) {
            case "firefox" -> pw.firefox();
            case "webkit"  -> pw.webkit();
            default        -> pw.chromium();
        };
    }
}
```

4. 写页面对象类：所有 `Locator` 声明为字段（不在动作方法里内联），优先 `getByRole / getByLabel / getByTestId`；导航方法返回下一个页面对象以支持链式调用：

```java
public class LoginPage extends BasePage {
    private final Locator emailInput, passwordInput, loginButton, errorMessage;
    public LoginPage(Page page) {
        super(page);
        emailInput    = page.getByLabel("Email address");
        passwordInput = page.getByLabel("Password");
        loginButton   = page.getByRole(AriaRole.BUTTON,
                            new Page.GetByRoleOptions().setName("Sign in"));
        errorMessage  = page.getByTestId("login-error");
    }
    @Override protected String getUrl() { return "/login"; }

    public DashboardPage loginAs(String email, String password) {
        fill(emailInput, email); fill(passwordInput, password);
        clickAndWaitForNav(loginButton);
        return new DashboardPage(page);
    }
    public LoginPage loginExpectingError(String email, String password) {
        fill(emailInput, email); fill(passwordInput, password);
        loginButton.click(); errorMessage.waitFor();
        return this;
    }
    public String getErrorMessage() { return errorMessage.textContent(); }
}
```

5. 写带 Allure 注解的用例：`@ExtendWith(AllureJunit5.class)`，用 `@Severity / @DisplayName` 标注，多字段校验用 `SoftAssertions`，多场景用 `@ParameterizedTest + @MethodSource`：

```java
@ExtendWith(AllureJunit5.class)
class LoginTest extends BaseTest {
    private LoginPage loginPage;
    @BeforeEach void open() { loginPage = new LoginPage(page()); loginPage.navigate(); }

    @Test @Severity(SeverityLevel.BLOCKER)
    @DisplayName("有效凭据应跳转到 dashboard")
    void shouldLoginWithValidCredentials() {
        User u = TestDataFactory.getDefaultUser();
        DashboardPage dash = loginPage.loginAs(u.email(), u.password());
        assertThat(page()).hasURL(Pattern.compile(".*/dashboard"));
        assertThat(dash.getWelcomeBanner()).containsText("Welcome, " + u.firstName());
    }
}
```

6. 并行执行配置 `src/test/resources/junit-platform.properties`：

```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=4
```

## 示例

示例一 · API+UI 混合（用 API 准备数据，比走 UI 快）：

```java
APIRequestContext api = page().context().request();
APIResponse resp = api.post("/api/orders", RequestOptions.create()
    .setHeader("Authorization", "Bearer " + authToken)
    .setData(Map.of("productId", "SKU-001", "quantity", 2)));
assertThat(resp).isOK();
String orderId = new JsonParser().parse(resp.text())
    .getAsJsonObject().get("id").getAsString();
OrdersPage orders = new OrdersPage(page()); orders.navigate();
assertThat(orders.getOrderRowById(orderId)).isVisible();
```

示例二 · 网络打桩（mock 后端故障）：

```java
page().route("**/api/products", route -> route.fulfill(new Route.FulfillOptions()
    .setStatus(503).setBody("{\"error\":\"Service Unavailable\"}")
    .setContentType("application/json")));
new ProductsPage(page()).navigate();
assertThat(products.getErrorBanner())
    .hasText("We're having trouble loading products. Please try again.");
```

示例三 · 跨浏览器并行：

```java
@ParameterizedTest @MethodSource("browsers")
void shouldRenderCheckoutOnAllBrowsers(String browserName) {
    System.setProperty("browser", browserName);
    new CheckoutPage(page()).navigate();
    assertThat(page().locator(".checkout-form")).isVisible();
}
static Stream<String> browsers() { return Stream.of("chromium", "firefox", "webkit"); }
```

示例四 · GitHub Actions 流水线关键步骤：

```yaml
- name: Install Playwright browsers
  run: mvn exec:java -e -Dexec.mainClass=com.microsoft.playwright.CLI -Dexec.args="install --with-deps"
- name: Run tests
  run: mvn test -Dbrowser=${{ matrix.browser }} -Dheadless=true
- name: Upload traces on failure
  uses: actions/upload-artifact@v4
  if: failure()
  with: { name: playwright-traces, path: target/traces/ }
- name: Upload Allure results
  uses: actions/upload-artifact@v4
  if: always()
  with: { name: allure-results, path: target/allure-results/ }
```

## 注意事项

要做（✅）：
- 并行套件每个用例都用 `ThreadLocal<Page>`，绝不跨线程共享 `Page`。
- `Locator` 字段全部声明在页面类顶部。
- 导航方法返回下一个页面对象（链式调用）。
- 用 `assertThat(locator)` —— 它会自动重试直到超时。
- 优先 `getByRole / getByLabel / getByTestId` 定位。
- tracing 在 `@BeforeEach` 开、`@AfterEach` 停并落盘（不是 `@AfterAll`）。
- 同页多字段校验用 `SoftAssertions`。
- 跨类复用登录态：保存 `storageState` 跳过重复登录。

不要做（❌）：
- 不用 `Thread.sleep()`，换 `waitFor()` / `waitForResponse()`。
- 不硬编码 baseURL，统一 `ConfigReader.getBaseUrl()`。
- 不在页面对象内部 `Playwright.create()`。
- 动态/频繁变更的元素不用 XPath。

常见坑：
- 并行随机失败 → 检查是否每个用例独立建 `Playwright→Browser→Context→Page` 链。
- `isVisible()` 超时 → `.setTimeout(10_000)` 或在 `BaseTest` 抬 `context.setDefaultTimeout()`。
- 加了 `sleep` 仍 flaky → 换 `waitForResponse("**/api/endpoint", () -> action())` 或断言自动轮询。
- trace zip 为空 → 确认 `start()` 在动作前、`stop()` 在 `@AfterEach`。
- Allure 报告空白/缺步骤 → 在 `maven-surefire-plugin` 的 `<argLine>` 里加 AspectJ agent。
- `storageState` 过期跳登录页 → 重跑 `AuthSetup` 重生成 `target/auth/user-state.json`。

## 互见

- REST Assured（Java）—— 纯 API 测试套件，无 UI 交互时用。
- Selenium（Java）—— 旧方案；新项目一律优先 Playwright。
- Allure 报告 —— 注解、分类、历史趋势深入。
- Testcontainers（Java）—— 测试需要真实数据库/服务时配合本技能。
- GitHub Actions CI —— 构建多浏览器矩阵流水线。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可），原作者 amalsam18，已按本仓库 SCHEMA 适配重写。
