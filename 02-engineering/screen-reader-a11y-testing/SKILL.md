---
name: screen-reader-a11y-testing
title: 屏幕阅读器无障碍测试
description: 当需要用真实屏幕阅读器验证 Web 应用无障碍、排查读屏/ARIA/动态播报/表单可访问性问题时使用；做按 NVDA/VoiceOver/JAWS/TalkBack 的浏览-焦点双模走查并产出测试脚本、缺陷清单与 ARIA 修复；不适用于纯自动化扫描或与读屏无关的通用 UI 评审。触发词：屏幕阅读器、读屏、NVDA、VoiceOver、JAWS、ARIA、aria-live
domain: 研发/testing
triggers: [屏幕阅读器测试, 读屏走查, NVDA 测试, VoiceOver 测试, JAWS 测试, TalkBack 测试, ARIA 验证, aria-live 播报, 焦点管理, 表单可访问性]
tags: [accessibility, a11y, screen-reader, nvda, voiceover, jaws, talkback, aria, testing, frontend]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [NVDA, VoiceOver, JAWS, TalkBack, Narrator, Chrome DevTools]
requires: []
related: [accessibility-wcag-audit, wcag-22-audit-patterns, webapp-testing, playwright-e2e-testing]
combines_with: [accessibility-wcag-audit, wcag-22-audit-patterns, frontend-design]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 屏幕阅读器无障碍测试

## 何时使用

适用：
- 用真实屏幕阅读器验证页面对辅助技术的兼容性（不止自动化扫描）。
- 验证 ARIA 实现：对话框、标签页、动态区（live region）等自定义控件。
- 排查辅助技术问题：元素无播报、播报内容错误、模式切换异常。
- 验证表单可访问性：标签、必填、错误播报、焦点转移。
- 验证动态内容播报与导航（标题、地标、跳转链接）可达性。

不该用（负边界）：
- 任务与屏幕阅读器/读屏体验无关，或只需通用 UI/视觉评审。
- 只想跑自动化合规扫描（axe/pa11y）并产出 WCAG 报告 —— 用 `accessibility-wcag-audit`。
- 无法访问页面/构建，无法实际运行读屏（缺输入则先停下要权限）。

## 步骤

1. 先用纯键盘走查（Tab/Shift+Tab/Enter/Space/Esc/方向键）—— 这是读屏测试的地基，键盘不通读屏必不通。
2. 选覆盖矩阵（见下「测试优先级」），至少 NVDA+Firefox 与 VoiceOver+Safari。
3. 启动读屏，整页 say-all 读一遍：确认页面标题、main 地标、跳转链接是否被识别。
4. 按元素类型导航：地标、标题层级、链接、表单字段、表格，逐项核对**角色+名称+状态**是否正确播报。
5. 同时测**浏览模式与焦点模式**两种体验（NVDA 进表单自动切焦点模式，注意切换提示音/播报）。
6. 走错误路径：填非法数据提交，确认错误被播报且焦点移到错误处；触发动态更新/模态框，确认播报与焦点陷阱/归还。
7. 产出：测试脚本、缺陷清单（角色/名称/状态/影响）、ARIA 修复片段。

## 指令

测试优先级（最小覆盖 → 全面覆盖）：

```
最小覆盖：
1. NVDA + Firefox (Windows)        ~31% 使用率
2. VoiceOver + Safari (macOS)      ~15%
3. VoiceOver + Safari (iOS)
全面覆盖再加：
+ JAWS + Chrome (Windows)          ~40%（占比最高）
+ TalkBack + Chrome (Android)      ~10%
+ Narrator + Edge (Windows)        ~4%
```

NVDA（Windows，nvaccess.org；启动 Ctrl+Alt+N，退出 Insert+Q，Insert 为修饰键）：
```
Insert+↓  整页朗读      H/Shift+H  下/上一标题   1-6 指定级别标题
F 表单字段  B 按钮  E 编辑框  X 复选  C 下拉    K 链接  D 地标  T 表格
Insert+F7  元素列表（链接/标题/表单/地标）      Insert+Space 手动切浏览/焦点模式
```

VoiceOver（macOS，Cmd+F5 开关；VO = Ctrl+Option）：
```
VO+→/←   下/上一元素     VO+A  从光标朗读    Ctrl 停止朗读
VO+U     转子（Rotor）：按标题/链接/表单/地标导航
VO+Cmd+H/J/L/T  下一个 标题/表单控件/链接/表格    VO+Space 激活
```

JAWS（Windows，Ctrl+Alt+J）：浏览器内自动虚拟光标；快捷键 `H 标题 / F 表单 / B 按钮 / T 表格 / ; 地标`；`Enter` 进表单模式、`小键盘 +` 退出；`Insert+F7/F6/F5` 链接/标题/表单列表。

TalkBack（Android，设置→无障碍→TalkBack，长按双音量键 3 秒切换）：右滑下一项、左滑上一项、双击激活、双指滑动滚动；上滑再右滑切换朗读粒度（标题/链接/控件/字词/行/段）。

## 示例

常见缺陷与修复：

```html
<!-- 按钮无名称 → 补 aria-label，图标 aria-hidden -->
<button aria-label="关闭对话框"><svg aria-hidden="true">...</svg></button>

<!-- 动态内容不播报 → 用 live region -->
<div id="results" role="status" aria-live="polite">已加载新结果</div>

<!-- 表单错误不读 → 关联 aria-describedby + role=alert -->
<input type="email" aria-invalid="true" aria-describedby="email-error" />
<span id="email-error" role="alert">邮箱格式不正确</span>
```

Live region 三态：`role="status" aria-live="polite"`（排队播报）/ `role="alert" aria-live="assertive"`（打断当前语音）/ `role="log" aria-live="polite" aria-relevant="additions"`（只播新增）。

可访问对话框 + 焦点陷阱（打开存焦点、入框聚焦、Tab 循环、Esc 关闭并归还焦点）：

```html
<div role="dialog" aria-modal="true" aria-labelledby="t" aria-describedby="d">
  <h2 id="t">确认删除</h2><p id="d">此操作不可撤销。</p>
  <button>取消</button><button>删除</button>
</div>
```

```javascript
function trapFocus(e) {
  if (e.key === "Tab") {
    const f = modal.querySelectorAll(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
  if (e.key === "Escape") closeModal(modal); // closeModal 内 lastFocus.focus() 归还焦点
}
```

调试：打印读屏「看到」的可访问名/角色/状态，对照实际播报：

```javascript
function logAccessibleName(el) {
  console.log({
    role: el.getAttribute("role") || el.tagName,
    name: el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.textContent,
    state: { expanded: el.getAttribute("aria-expanded"),
             selected: el.getAttribute("aria-selected"),
             checked: el.getAttribute("aria-checked"), disabled: el.disabled },
  });
}
```

## 注意事项

- 用**真机真读屏**测，不要只信模拟器；自动化只能覆盖约一半问题，读屏走查不可省。
- 语义化 HTML 优先，ARIA 是补充而非替代（错误的 role 比没有更糟）。
- 务必同测浏览模式与焦点模式，二者体验不同；SPA 路由切换尤其要管好焦点。
- 别只测顺路场景：错误态、动态内容、模态框焦点归还是缺陷高发区。
- 别假设测一个读屏就够；移动端读屏用户在增长，不要忽略 TalkBack/iOS VoiceOver。
- 输出不可替代环境特定验证与无障碍专家复核；缺必需输入/权限/成功标准时先停下澄清。

## 互见

- requires：`accessibility-wcag-audit` —— 先做自动化 WCAG 审计定位嫌疑点，本技能再用读屏人工确证
- related：`wcag-22-audit-patterns`、`webapp-testing`
- combines_with：`playwright-e2e-testing` —— E2E 用例覆盖键盘可达性与焦点流，读屏走查补人工不可自动化的播报核查

---
采编自 sickn33/antigravity-awesome-skills（MIT），原技能 `screen-reader-testing`，已适配重写。
