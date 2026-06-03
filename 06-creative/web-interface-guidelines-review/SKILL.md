---
name: web-interface-guidelines-review
title: Web 界面准则审查：网页交互规范合规检查
description: 当需要拿指定文件去对照 Vercel「Web Interface Guidelines」做交互/无障碍/性能合规检查、并产出 file:line 简洁清单时使用；做规则抓取+逐文件审查+缺陷定位；不适用于无文件可审、纯视觉稿评审、或替你改代码；触发词：Web 界面准则、交互规范审查、合规检查、file:line、无障碍审查、Vercel guidelines
domain: 创意/design
triggers: [Web 界面准则, 交互规范审查, 界面合规检查, file:line 审查, 无障碍审查, Vercel web interface guidelines, 网页交互规范, 前端准则体检]
tags: [创意, design, 界面审查, 合规检查, 无障碍, 前端规范, Vercel]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [WebFetch]
requires: []
related: [ux-ui-principles-audit, accessibility-wcag-audit, wcag-22-audit-patterns, design-critique]
combines_with: [frontend-design, web-mock-data-hunter]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 已有可读取的前端文件（组件、页面、样式、模板等），要对照一份**权威、外部托管**的 Web 界面准则做合规体检。
- 目标产出：以**简洁的 `file:line` 格式**逐条列出违规点，可直接定位修复，而非长篇评论。
- 覆盖交互、状态反馈、键盘可达、无障碍、表单、动效、性能等通用网页准则（以抓到的最新规则为准）。

不该用的边界：
- 没有任何可读取的文件、只给截图或口头描述 → 本技能审的是源码文件，先索要文件/路径或改用 `ux-ui-principles-audit`（评界面描述）。
- 纯视觉稿、品牌评审、从零做设计 → 这是创作不是合规审查。
- 要求"顺手帮我改好" → 本技能只定位+给建议，不直接落代码。
- domain 注记：本仓库受控类表（taxonomy.json，06-creative 仅 design/image/av/brand）已无 `misc`，故归 `创意/design`；若强写 `创意/misc` 会被 `build-index.mjs` 判为硬错误。

## 步骤 / 指令

```
1. 抓取最新准则（每次审查前都重新抓，规则会更新）
   WebFetch: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
   抓回的内容本身既含全部规则，也含输出格式说明 —— 以它为准。

2. 确定审查范围
   - 用户给了文件/glob 模式 → 读取这些文件。
   - 没给 → 停下来问"审哪些文件或哪个目录/模式"，不要自行臆测扫全库。

3. 逐文件、逐规则比对
   - 把每个文件内容对照抓回的每一条规则。
   - 命中违规即记录精确位置（文件 + 行号）。

4. 按抓回准则指定的格式输出（默认 file:line 简洁清单）
   path/to/file.tsx:42 — 违反的规则一句话（点名是哪条准则）
   - 同类问题可合并归组；先严重后次要。
   - 无违规则明说"未发现违规"，不要凑数编造。
   - 不确定的标"待确认"并写出假设。
```

规则：
- 单一职责：只做合规审查与定位，不改代码、不出新设计。
- 每条发现必须可定位（精确到 `file:line`）且对应某条具体准则。
- 准则是**外部活文档**，务必每次现抓，不要凭记忆复述旧规则。

## 示例

最小调用：
```
审查 src/components/**/*.tsx 是否符合 Web Interface Guidelines。
先 WebFetch 抓取最新准则，再逐文件比对，用准则指定的 file:line 格式输出。
无违规请明说，勿编造。
```

输出条目样例（file:line 简洁清单）：
```
src/components/Button.tsx:17 — 交互元素无可见 focus 态，键盘用户无法感知焦点
src/components/Modal.tsx:54 — 弹层打开后焦点未陷入（focus trap 缺失），Esc 无法关闭
src/forms/Login.tsx:88 — 输入框仅用 placeholder 当标签，丢失语义 label
app/page.tsx:12 — 图片缺 width/height，触发布局抖动（CLS）
```

## 注意事项

- 必须先 `WebFetch` 抓取准则源再审查；离线/抓取失败时如实告知，不要用记忆里的旧规则硬审。
- 准则源地址：`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`，输出格式以抓回内容为准（本技能默认 `file:line`）。
- 本技能读源码文件做静态比对，**不渲染/不抓取运行中的页面**；要看真实运行表现请配合浏览器/性能审计类技能。
- 区分"确证违反某条准则"与"主观风格偏好"，别把口味标成违规。
- 输出不替代真实可用性测试与专家评审；缺文件、权限或成功标准时先停下问清。

## 互见

- requires：无。
- related：`ux-ui-principles-audit`（对照研究支撑的 UX/UI 原则审界面描述，本技能则对源码文件按外部准则做 file:line 合规检查）；`accessibility-wcag-audit`、`wcag-22-audit-patterns`（无障碍专项，与本技能的无障碍条目互补深挖）；`apple-hig-advisor`（苹果 HIG 平台专项，本技能为通用 Web 准则）。
- combines_with：`ui-design-system-builder`（审查发现的不一致/无障碍违规回流到设计令牌与组件体系修复）；`design-dev-handoff`（交付前用本技能做一遍合规闸门）；`marketing-screenshots-playwright`（需要看真实页面表现时配合截图/运行态验证）。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原始准则来源 vercel-labs/web-interface-guidelines。
