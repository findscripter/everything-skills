---
name: apple-hig-advisor
title: 苹果人机界面指南专家
description: 当要按 Apple HIG 设计或审计 iOS/macOS/visionOS/watchOS 界面（含 2026 Liquid Glass 与无障碍优先）时使用；做导航与视觉规范落地、HIG 合规打分卡审计、对比度/点击区/无障碍量化检查并产出可执行修复清单；不适用于跨平台 Web/Android 设计、品牌识别系统或纯前端代码实现；触发词：HIG、苹果设计规范、人机界面指南、Liquid Glass、VoiceOver、点击区、对比度、visionOS、SF 字体、Dynamic Type
domain: 创意/design
triggers: [HIG, 苹果设计规范, 人机界面指南, Liquid Glass, VoiceOver, 点击区, 对比度, visionOS, SF 字体, Dynamic Type]
tags: [design, apple, hig, ios, macos, visionos, accessibility, ui]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python]
requires: []
related: [ux-ui-principles-audit, ux-research-design-toolkit, accessibility-wcag-audit, ios-swiftui-developer]
combines_with: [ios-swiftui-developer, swiftui-best-practices, ui-design-system-builder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 为苹果生态（iOS / macOS / watchOS / visionOS）从零设计界面，需要选对导航范式、视觉语言与无障碍基线时。
- 审计已有原型或代码，要按 Apple HIG 系统性查违规、给 0-100 合规打分与优先级修复时。
- 触发词：HIG、苹果设计规范、人机界面指南、Liquid Glass、VoiceOver、点击区、对比度、visionOS、SF 字体、Dynamic Type。

不该用的边界：

- 不做跨平台 Web / Android / 桌面（非 Apple）界面设计——HIG 规则不通用。
- 不做品牌识别系统、配色字体规范的「制定」（交给 `brand-guidelines`），不做前端样式系统落地（交给 `frontend-design`）。
- 不替代真机/模拟器实测；本技能给规范与量化判据，最终需在 Apple 设备上验证。

## 步骤 / 指令

开始前先收集上下文（若工作区有 `product-context.md` / `ios-design-context.md` 先读再问）：

```
1. 目标平台：iOS / macOS / watchOS / visionOS？
2. 当前状态：新建项目 还是 审计已有 mockup/代码？
3. 应用品类：工具 / 效率 / 游戏 / 社交…？
```

两种模式：

- 模式一·从零设计：按苹果三大哲学（清晰 Clarity / 谦让 Deference / 深度 Depth）走原子设计、布局原语与导航范式。
- 模式二·HIG 审计：用打分卡逐项查违规与改进点（见下「示例」的 0-100 评分卡）。

设计三阶段：

```
阶段1 导航与布局：iOS→Tab Bar/底部工具栏；macOS→侧边栏+菜单栏；
                  visionOS→Ornaments 浮动控件；watchOS→Digital Crown 纵向滚动。
阶段2 视觉样式：San Francisco 字体族 + 语义色 + Liquid Glass 材质。
阶段3 终检：跑 hig_checker 量化对比度/点击区。
```

核心规范要点：

- Liquid Glass：用材质分层级（ultra-thin 用于 Tab Bar/小浮动按钮，thin 用于菜单/侧边栏，thick 用于 macOS 窗口背景）；vibrancy 不只是透明，是从背景提取主色让文字更可读。
- 字体/间距：用语义文本样式（Title 1、Body、Caption 1），必须支持 Dynamic Type（300% 仍可用）；遵循 8pt 网格（8/16/24/32），标准边距 16 或 24pt。
- 语义色：用 `systemBlue` / `systemRed` 等语义色，不硬编码 hex，以支持深浅色与高对比模式。
- 无障碍硬指标：点击区最小 44x44pt；正文对比度 ≥ 4.5:1、大字 ≥ 3:1；每个图标都要有 VoiceOver 标签（用「提交订单」而非「按钮1」）；不能仅靠颜色传达信息（图标+色）。

主动预警（不必等用户问，直接指出）：

- 半透明层压低文字可读性（低对比度）。
- 交互元素 < 44pt（点击区过小）。
- 有图标无无障碍标签（缺语义）。
- 布局过密、缺留白（违背 Deference）。

## 指令

输出遵循结构化沟通：

- 结论先行——先给 HIG 合规结论，再展开细节。
- What + Why + How——例：「加大内边距(What)，因点击区过小(Why)，改用 12pt 边距(How)」。
- 置信标注——🟢 已验证 / 🟡 中等 / 🔴 推断。

不同请求对应产物：

| 你提出… | 你得到… |
|---|---|
| 审计我的 iOS 应用 | 详细 HIG 评分卡（0-100）+ 优先级修复 |
| 设计一个 visionOS Ornament | 含深度与注视悬停规则的空间设计规格 |
| 无障碍检查 | VoiceOver / Dynamic Type / 对比度合规报告 |

## 示例

量化检查脚本 `hig_checker.py`（保留源命令）：

```bash
# 对比度（前景/背景 hex，阈值 4.5:1）
python hig_checker.py contrast "#FFFFFF" "#000000"
# 点击区（宽 高，单位 pt，阈值 44x44）
python hig_checker.py target 32 40
# 批量（JSON：{"checks":[{"type":"contrast","fg":"#...","bg":"#...","name":"x"}, ...]}）
python hig_checker.py batch checks.json   # 输出 {score, violations}，每违规 -10 分
```

对比度算法核心（WCAG 相对亮度）：

```python
def adjust(c):  # 线性化
    return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
# L = 0.2126*R + 0.7152*G + 0.0722*B；ratio = (L_max+0.05)/(L_min+0.05)
```

HIG 审计评分卡（满分 100，可直接套用）：

```
1. 视觉设计与美学      /20  Liquid Glass 材质分层 · SF 字体语义样式 · 语义色 · 8pt 网格
2. 导航与布局          /20  平台原生范式 · iOS 主操作靠底部可达 · 安全区(避开灵动岛/Home条) · 留白
3. 无障碍              /30  VoiceOver 标签+提示 · 点击区≥44pt · Dynamic Type 不裁切 · 对比度≥4.5:1
4. 交互与动效          /20  弹簧式流畅动画 · 触觉反馈 · 标准手势(轻扫/捏合)可预期
5. 平台特性            /10  灵动岛/Live Activities/复杂功能 · macOS 键盘快捷键齐全

判级：🟢 85-100 可上架 · 🟡 70-84 需打磨 · 🔴 <70 高风险（易被审核拒）
```

## 注意事项

- 点击区 44x44pt、正文对比度 4.5:1 是硬线，审计先跑脚本量化再下结论，不要凭目测。
- Liquid Glass 例外：背景过于花哨时，为可读性必须降低透明度（vibrancy）；务必在系统「降低透明度」开启下复测。
- 必须支持 Dynamic Type，用 Auto Layout 或 SwiftUI 的 `VStack`/`HStack` 自动换行，确保字体放到最大也不裁切。
- 安全区：iOS 元素避开灵动岛与 Home Indicator；macOS 每个主操作要有 `Cmd` + 键 等价快捷键。
- 灰度/Grayscale 模式下界面仍要可用——别仅靠颜色区分状态。
- 单一职责：本技能给「规范判据 + 量化审计」，不输出可运行的 SwiftUI 工程代码，也不实测真机。

## 互见

- related：`frontend-design`（前端样式系统落地，非 Apple 平台 HIG 规则）、`brand-guidelines`（品牌色/字体规范的制定，非平台规范）、`theme-factory`（主题/配色批量生成）。
- combines_with：`canvas-design`——先按 HIG 定平台规范与版式判据，再用其产出具体画面构图。

---

采编自 alirezarezvani/claude-skills（MIT）。
