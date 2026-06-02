---
name: accessibility-wcag-audit
title: 无障碍 WCAG 合规审计
description: 当需要对 Web/移动端做无障碍（a11y）WCAG 合规审计、定位障碍并给出修复方案时使用；做自动化扫描+键盘/读屏/对比度手动核查、映射到 WCAG 准则并产出违规清单与修复指引；不适用于不涉及无障碍的通用 UI 评审或无法访问页面/设计稿的场景。触发词：无障碍、WCAG、a11y、axe、读屏、对比度
domain: 研发/frontend
triggers: [无障碍审计, WCAG 合规, a11y 测试, axe 扫描, 键盘可访问性, 屏幕阅读器, 色彩对比度, ARIA 修复, 焦点顺序, 无障碍整改]
tags: [accessibility, a11y, wcag, frontend, audit, axe-core, aria, testing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [axe-core, puppeteer, jest-axe, pa11y, @testing-library/react, GitHub Actions]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 对 Web 或移动端体验做 WCAG（默认 AA 级）合规审计。
- 定位无障碍障碍、排出整改优先级。
- 建立持续的无障碍测试实践（CI 卡口、组件级断言）。
- 为干系人准备合规证据（评分、违规报告）。

不该用（负边界）：
- 只需通用 UI/视觉评审，不涉及无障碍范围。
- 请求与用户体验或合规无关。
- 无法访问页面、设计稿或内容（无法验证则先停下要权限/输入）。

## 步骤

1. 确认范围：平台、目标 WCAG 级别（A/AA/AAA）、待测页面、关键用户旅程。
2. 自动化扫描：用 axe-core 跑基线，收集违规与覆盖缺口。
3. 人工核查：键盘可达性、屏幕阅读器、焦点顺序、色彩对比度（自动化只能覆盖约 30%-50%，人工不可省）。
4. 映射归因：把每条发现对应到具体 WCAG 准则、严重级别（critical/serious/moderate/minor）与用户影响。
5. 给出修复：逐项整改步骤；修复后回归复测。
6. 产出：无障碍评分、违规报告、测试结果、整改指南、可访问组件示例。

## 指令

- 自动化（axe-core + Puppeteer）：扫描时挂上 WCAG 标签 `wcag2a, wcag2aa, wcag21a, wcag21aa`，用 `.exclude('.no-a11y-check')` 排除豁免区域。评分采用加权扣分：`critical=10, serious=5, moderate=2, minor=1`，`score = max(0, 100 - 总权重)`。
- 组件级断言（jest-axe）：

```js
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

it("should have no violations", async () => {
  const { container } = render(<MyComponent />);
  expect(await axe(container)).toHaveNoViolations();
});
```

- 对比度阈值（AA）：正文 ≥ 4.5:1、大字号 ≥ 3:1；AAA 为 7:1 / 4.5:1。对比度公式 `(L1+0.05)/(L2+0.05)`，相对亮度按 sRGB 线性化（分量 `≤0.03928 ? v/12.92 : ((v+0.055)/1.055)^2.4`，再 `0.2126R+0.7152G+0.0722B`）。颜色不得作为传达信息的唯一手段。
- 键盘核查：所有可交互元素 Tab 可达，Enter/Space 可激活，Esc 关闭弹窗，焦点指示器始终可见，无键盘陷阱，Tab 顺序符合逻辑。非语义可点击元素需补 `tabindex="0"`、`role="button"` 并监听 Enter/Space。
- 读屏核查：页面有唯一 `h1`，标题层级不跳级；图片有 `alt`（装饰图 `alt=""`）；表单字段有 `<label for>` 或 `aria-label`；错误用 `role="alert" aria-live="polite"` 播报。
- 常用 ARIA 模式：对话框 `role="dialog" aria-modal="true" aria-labelledby`；标签页 `role="tablist/tab/tabpanel" + aria-selected/aria-controls`；动态区 `aria-live`。
- CI 卡口（pa11y）：`npx pa11y http://localhost:3000 --standard WCAG2AA --threshold 0`。

## 示例

CI 集成（GitHub Actions 关键步骤）：

```yaml
name: Accessibility Tests
on: [push, pull_request]
jobs:
  a11y-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: "18" }
      - run: npm ci && npm run build
      - run: npm start & npx wait-on http://localhost:3000
      - run: npm run test:a11y
      - run: npx pa11y http://localhost:3000 --standard WCAG2AA --threshold 0
```

常见整改片段：

```js
// 补缺失 alt（装饰图置空）
document.querySelectorAll("img:not([alt])").forEach((img) => {
  const decorative = img.role === "presentation" || img.closest('[role="presentation"]');
  img.setAttribute("alt", decorative ? "" : img.title || "Image");
});
// 用 placeholder 兜底补 aria-label
document.querySelectorAll("input:not([aria-label]):not([id])").forEach((i) => {
  if (i.placeholder) i.setAttribute("aria-label", i.placeholder);
});
```

## 注意事项

- 自动化不能替代人工：键盘、读屏、认知（清晰提示、无强制时限、操作可撤销）必须人工走查。
- 文本放大到 200% 不丢内容，内容在 320px 宽下可重排，动画可暂停。
- `prefers-contrast: high` 媒体查询下提供高对比主题（链接加下划线、控件加可见边框）。
- 输出不可替代环境特定的验证与专家复核；缺少必需输入/权限/成功标准时先停下澄清。

## 互见

- 性能与渲染审计可结合 Lighthouse / Chrome DevTools 的无障碍评分。
- 设计阶段的对比度与组件规范应前置到设计系统/组件库评审。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原技能 `accessibility-compliance-accessibility-audit`，已适配重写。
