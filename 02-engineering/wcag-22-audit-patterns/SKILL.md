---
name: wcag-22-audit-patterns
title: WCAG 2.2 无障碍审计模式
description: 当需要对网页做 WCAG 2.2 无障碍审计或修复违规时使用；先跑自动化扫描再做键盘/读屏人工核验，逐条映射到 WCAG 准则+严重度并给可执行修复（产出 A/AA 审计报告与整改清单）；不适用于出具法律合规认证、纯自动扫描无人工复核、或无法访问 UI/源码的场景；触发词：WCAG、无障碍、a11y、可访问性、ADA、Section 508、axe、对比度、读屏、键盘导航
domain: 研发/frontend
triggers: [WCAG, 无障碍, a11y, 可访问性, ADA, Section 508, VPAT, axe, Lighthouse, 对比度, 读屏, 键盘导航, 焦点顺序, aria]
tags: [前端, 无障碍, WCAG, 审计, 合规, HTML, ARIA]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [axe-core, lighthouse, pa11y, playwright]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# WCAG 2.2 无障碍审计模式

按 WCAG 2.2（A/AA 为主）审计网页内容，并给出可落地的整改方案。围绕 POUR 四原则：可感知(Perceivable)、可操作(Operable)、可理解(Understandable)、健壮(Robust)。

## 何时使用

- 做无障碍审计、修复 WCAG 违规、实现可访问组件。
- 满足 ADA / Section 508 监管要求或出具 VPAT 自评。

**不该用的边界：**
- 需要法律意见或正式认证 —— 本技能不替代专家/律师审核，禁止据此宣称「已合规」。
- 只想要一次自动扫描而不做人工核验 —— 自动化仅能发现约 30~50% 问题，必须人工补齐。
- 无法访问 UI 或源码做整改 —— 缺少修复入口时先索要权限。

## 步骤 / 指令

1. **自动化扫描**：跑 axe / Lighthouse / pa11y / WAVE 收集初筛问题。
2. **人工核验**：键盘走查（仅 Tab/Shift+Tab/Enter/Space/方向键，无鼠标）、焦点顺序、读屏（NVDA/VoiceOver）流程；自动化测不到的项目（焦点可见性、阅读顺序、链接上下文、动态状态播报）靠人工。
3. **逐条定级**：把每个问题映射到 WCAG 准则号 + 等级(A/AA) + 严重度 + 整改建议。严重度参考：
   - **Critical（阻断）**：功能性图片缺 alt、交互元素无法键盘访问、表单缺 label、媒体自动播放无控制。
   - **Serious**：对比度不足、缺跳转链接、自定义控件不可访问、缺页面标题。
   - **Moderate**：缺 lang 属性、链接文案不清、缺 landmark、标题层级错乱。
4. **复测留痕**：修复后回归，记录残余风险与合规状态，保留测试步骤与结果作为审计证据链。

### 关键准则速查（A/AA）

- 1.1.1 非文本内容：有意义图片给 alt，装饰图 `alt=""`。
- 1.3.1 信息与关系：语义标签(h1-h6/ul/table th)、表单关联 label、ARIA landmark。
- 1.4.3 对比度：正文 4.5:1，大字(18pt+)/UI 组件 3:1。
- 1.4.4/1.4.10 缩放与重排：200% 不丢内容，400% 缩放 / 320px 宽下单向滚动可达。
- 2.1.1/2.1.2 键盘：全部功能可键盘操作、无焦点陷阱、模态正确捕获并归还焦点。
- 2.4.1 跳过区块：提供 skip link + landmark。
- 2.4.7 焦点可见 / 2.4.11 焦点不被遮挡(2.2 新增)：粘性头部勿遮焦点。
- 2.2.2：动效尊重 `prefers-reduced-motion`。
- 3.1.1 页面语言、3.3.1 错误识别（`aria-invalid` + `aria-describedby` 关联 `role="alert"`）。
- 4.1.2 名称/角色/值、4.1.3 状态消息（`aria-live`）。
- 注：4.1.1 Parsing 在 WCAG 2.2 中已废弃，但避免重复 id、标签闭合仍是好习惯。

## 示例

CLI 自动化扫描：

```bash
npx @axe-core/cli https://example.com
npx pa11y https://example.com
lighthouse https://example.com --only-categories=accessibility
```

Playwright 集成 axe-core（CI 门禁）：

```javascript
const results = await page.evaluate(async () =>
  axe.run(document, {
    runOnly: { type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }
  })
);
expect(results.violations).toHaveLength(0);
```

常见整改：

```html
<!-- 表单缺 label -->
<label for="email">邮箱</label>
<input id="email" type="email" />
<!-- 或 aria-label / aria-labelledby -->

<!-- 跳转链接 -->
<a href="#main" class="skip-link">跳到主内容</a><main id="main">...</main>

<!-- 链接文案在上下文外仍可理解 -->
<a href="report.pdf">下载 Q4 销售报告 (PDF)</a> <!-- 不要用「点这里」 -->
```

```css
/* 对比度不足 #767676(2.5:1) → #595959(4.5:1) */
.text { color: #595959; }

/* 焦点可见 */
:focus { outline: 3px solid #005fcc; outline-offset: 2px; }

/* 尊重减动偏好 */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

自定义控件键盘可达（Enter/Space 激活、方向键导航、Esc 关闭），并补 `role`/`tabindex="0"`/`aria-*` 状态。

## 注意事项

- **不要只靠自动化**：键盘与读屏人工测试是必须项。
- **原生优先**：先用语义 HTML，ARIA 是兜底而非首选（错误 ARIA 比没有更糟）。
- **勿移除焦点轮廓、勿禁用缩放、勿以颜色为唯一信息载体**（错误态/链接需多重指示）。
- 不得在无专家复核的情况下声称法律合规；保留测试步骤与结果作为审计追溯。
- 输出不替代针对具体环境的验证、测试或专家评审；缺少必要输入/权限/成功判据时先停下询问。

## 互见

- related：`color-contrast-checker`、`aria-patterns`（如库内存在同类）
- combines_with：端到端测试 / CI 门禁类技能 —— 将 axe 断言纳入回归，防止无障碍回退。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
