---
name: marketing-screenshots-playwright
title: 应用营销截图自动生成
description: 当需要为 Product Hunt、社媒、落地页或文档批量生成应用营销级截图时使用；用 Playwright 以 deviceScaleFactor:2 在 1440x900 视口产出 2880x1800 真 Retina PNG，含登录鉴权、按路由遍历页面、元素/整页/暗色模式与 kebab-case 编号命名；不适用于纯可视区随手截图、整页超长拼接（用 full-page-screenshot）、E2E 测试或无前端界面的抓取；触发词：营销截图、Product Hunt 截图、落地页配图、应用商店截图、retina 截图、Playwright 截图
domain: 创意/design
triggers: [营销截图, Product Hunt 截图, 落地页配图, 应用商店截图, 社媒截图, retina 截图, Playwright 截图, 暗色模式截图, 应用截图自动生成]
tags: [screenshot, playwright, marketing, product-hunt, retina, browser-automation, nodejs]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Playwright, Node.js, chromium]
requires: []
related: [playwright-e2e-testing, full-page-screenshot, webapp-testing, browser-automation-builder]
combines_with: [app-store-optimization, landing-page-copywriting, product-launch-strategy]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

为应用产出**营销级截图**时使用：Product Hunt 主图与功能高光、社媒展示图、落地页配图、文档 UI 参考。脚本直接驱动 Playwright，以 `deviceScaleFactor: 2` 在 1440x900 视口截图，产出 2880x1800 像素的真 Retina PNG。

判据：你要的是「面向真实运行的 app、批量、统一规格、可交付给营销/上架」的高质量成品图，且需要登录态、按路由遍历、暗色模式等编排。

不该用的边界：
- 只要随手截可视区一张图 → 普通截屏即可，不必动用本技能。
- 整页超长内容需滚动展开、懒加载、分块拼成一张长图 → 用 `full-page-screenshot`（CDP 整页捕获）。
- 写 E2E 测试 / 断言 / 视觉回归套件 → 用 `webapp-testing`。
- 通用的网页数据抓取、多步表单流程、反检测会话 → 用 `browser-automation-builder`。
- 没有前端界面（纯后端/CLI/脚本）→ 不属于本技能。

## 步骤

1. **环境自检**：确认 Playwright 可用。
   ```bash
   npx playwright --version 2>/dev/null || npm ls playwright 2>/dev/null | grep playwright
   ```
   缺失则提示用户：`npm install -D playwright` 或 `npm install -D @playwright/test`。
2. **确定 app URL**：用户给定则用之；否则读 `package.json` 脚本判断 dev server，并按常见默认询问：Next/CRA/Rails `:3000`、Vite `:5173`、Phoenix `:4000`、通用 `:8080`。
3. **收集需求**：截图数量（3-5 / 5-10 / 10+）、用途（Product Hunt / 社媒 / 落地页 / 文档）、是否需登录（需登录则收集登录页 URL、账号、密码）。
4. **分析代码库定功能点**（不要只判断文件是否存在，要真正读内容）：
   - 先读 `README.md`、`CHANGELOG.md`、`docs/` 弄清 app 干什么、关键功能。
   - 读路由发现页面：Next App Router 看 `app/**/page.tsx`；Next Pages Router 看 `pages/`；Rails 看 `config/routes.rb`；React Router 搜 `createBrowserRouter`/`<Route`；Vue 看 `src/router/index.js`；SvelteKit 看 `src/routes/**/+page.svelte`；Laravel `routes/web.php`；Django `urls.py`；Express 搜 `app.get`/`router.get`。
   - 找可截的组件：仪表盘、特色功能区、表单、图表/表格、模态框、导航/侧栏、设置、个人资料；以及 `components/landing/`、`components/marketing/`、定价表等营销素材。
   - 产出功能清单：功能名 + URL 路径 + 聚焦的 CSS 选择器 + 所需 UI 状态（登录/有数据/模态开/选中某 tab）。
5. **与用户敲定截图清单**（列 3-4 个发现的功能 + "我自己选"）。
6. **建目录**：`mkdir -p screenshots`。
7. **生成并运行脚本**：把下方模板写入临时 `screenshot-script.mjs`，填入 URL/鉴权/截图清单后执行，跑完删除临时脚本。
8. **验证与汇总**：核对每张 PNG 尺寸应为 2880x1800（2x），列出文件路径、分辨率、体积，给后续建议。

## 指令

脚本模板（关键约束：`deviceScaleFactor: 2`、`viewport 1440x900`、`waitForLoadState('networkidle')`）：

```javascript
import { chromium } from 'playwright';

const BASE_URL = '[APP_URL]';
const SCREENSHOTS_DIR = './screenshots';
const AUTH = { needed: false, loginUrl: '[LOGIN_URL]', email: '[EMAIL]', password: '[PASSWORD]' };

const SCREENSHOTS = [
  { name: '01-feature-name', url: '/path', waitFor: '[optional-selector]' },
  { name: '02-another-feature', url: '/another-path' },
];

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // 真 Retina 的关键
  });
  const page = await context.newPage();

  if (AUTH.needed) {
    await page.goto(AUTH.loginUrl);
    // 智能定位：覆盖常见邮箱/用户名字段
    await page.locator([
      'input[type="email"]','input[name="email"]','input[id="email"]',
      'input[placeholder*="email" i]','input[name="username"]','input[id="username"]','input[type="text"]',
    ].join(', ')).first().fill(AUTH.email);
    await page.locator([
      'input[type="password"]','input[name="password"]','input[id="password"]',
    ].join(', ')).first().fill(AUTH.password);
    await page.locator([
      'button[type="submit"]','input[type="submit"]',
      'button:has-text("Sign in")','button:has-text("Log in")','button:has-text("Login")','button:has-text("Submit")',
    ].join(', ')).first().click();
    await page.waitForLoadState('networkidle');
  }

  for (const shot of SCREENSHOTS) {
    await page.goto(`${BASE_URL}${shot.url}`);
    await page.waitForLoadState('networkidle');
    if (shot.waitFor) await page.waitForSelector(shot.waitFor);
    if (shot.actions) for (const a of shot.actions) {
      if (a.click) await page.click(a.click);
      if (a.fill) await page.fill(a.fill.selector, a.fill.value);
      if (a.wait) await page.waitForTimeout(a.wait);
    }
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/${shot.name}.png`, fullPage: shot.fullPage || false });
  }
  await browser.close();
}
main().catch(console.error);
```

运行与清理：

```bash
node screenshot-script.mjs
rm screenshot-script.mjs
```

进阶选项：
- **元素聚焦**：`await page.locator('[CSS_SELECTOR]').screenshot({ path: ... })`。
- **整页**（可滚动内容）：`await page.screenshot({ path: ..., fullPage: true })`。
- **等动画**：`await page.waitForTimeout(500)`。
- **截模态/下拉**：`await page.click('button.open-modal'); await page.waitForSelector('.modal-content');` 再截。
- **暗色模式**：建 context 时加 `colorScheme: 'dark'`。

命名约定：kebab-case + 数字前缀排序，如 `01-dashboard-overview.png`、`02-link-inbox.png`、`03-analytics.png`。

验证产物：

```bash
ls -la screenshots/*.png
sips -g pixelWidth -g pixelHeight screenshots/*.png 2>/dev/null || file screenshots/*.png
```

## 示例

最小启动需求：「为 `http://localhost:3000` 上的 SaaS app 出 5 张 Product Hunt 截图，需登录」。

执行后汇总形如：

```
Generated 5 marketing screenshots:
screenshots/
├── 01-dashboard-overview.png (1.2 MB, 2880x1800 @ 2x)
├── 02-link-inbox.png         (456 KB, 2880x1800 @ 2x)
├── 03-edition-editor.png     (890 KB, 2880x1800 @ 2x)
├── 04-analytics.png          (567 KB, 2880x1800 @ 2x)
└── 05-settings.png           (234 KB, 2880x1800 @ 2x)
```

## 注意事项

- **真 Retina 三要素**：`deviceScaleFactor: 2` + 固定 `viewport 1440x900` + 全部截图统一视口，缺一则尺寸/清晰度不一致。
- **等内容再截**：始终 `waitForLoadState('networkidle')`，避免截到加载中的半成品；有动画再加 `waitForTimeout`。
- **干净的 UI 状态**：用 demo/种子数据让内容真实饱满；关掉浏览器扩展、dev 浮层，别让调试 UI 入镜。
- **登录可能失败**：智能选择器覆盖常见表单，但遇到非常规登录页会失配——届时读登录页 HTML 找到正确选择器手改脚本。
- **元素找不到**：核对 CSS 选择器；找不到时退化为整页截图。
- **暗色变体**：app 支持暗色时考虑同时出明/暗两套。
- **常见故障**：Playwright 缺失 → 装依赖；页面打不开 → 确认 dev server 已起；截图失败 → 查磁盘空间与 `screenshots/` 写权限。
- **平台差异**：`sips` 为 macOS 命令，Linux 用 `file`；Windows 下改用 Playwright 自身或 Node 读取尺寸。
- 仅当任务确实匹配上述范围时使用；本技能产物不替代环境内的人工核验与专家评审；必填输入/凭据/边界缺失时先停下来问清。

## 互见

- requires：无（具备 Playwright 与 Node.js 即可）。
- related：`full-page-screenshot`（需要滚动展开、懒加载、超长内容拼成单张长图时改用它，本技能只截可视区/元素/常规整页）、`browser-automation-builder`（更复杂的多步交互、反检测、会话复用、数据抓取归它）、`frontend-design`（被截的前端界面本身的构建/美化）、`app-store-optimization`（这些营销截图最终用于应用商店上架与转化优化）。
- combines_with：`browser-automation-builder`（截图前需要复杂登录/导航编排时，先用它把页面带到目标状态再截）、`app-store-optimization`（截图 → 上架素材闭环）。

---

本条目采编自 sickn33/antigravity-awesome-skills（MIT 许可），适配重写而非逐字翻译。
