---
name: android-ui-verification
title: Android 模拟器 UI 端到端验证
description: 当需要在 Android 模拟器上自主验证 RN/原生 App 的 UI 变更、复现交互或布局 Bug、为 PR 留存截图时使用；做基于 ADB 的设备校准、UI dump 取坐标、点击/滑动/输入交互、截图与 logcat 双重验证，产出 artifacts/ 下的截图与视图快照；不适用于真机集群测试、iOS、纯单元/E2E 框架（Espresso/Detox）。触发词：adb、uiautomator、模拟器 UI 验证
domain: 研发/testing
triggers: [adb, uiautomator dump, Android 模拟器, input tap, screencap 截图验证, ReactNativeJS logcat, UI 端到端验证, 模拟器点击坐标]
tags: [android, adb, ui-testing, e2e, react-native, emulator, testing, automation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [adb, uiautomator, logcat, Bash]
requires: []
related: [webapp-testing, playwright-e2e-testing, browserstack-cross-browser-test, react-native-architecture]
combines_with: [react-native-architecture, jetpack-compose-expert, test-coverage-gap-finder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 验证 React Native 或原生 Android App 的 UI 变更是否生效。
- 自主排查布局错位、交互失效等 Bug，无需人工反复点。
- 手动测试太慢、希望脚本化跑通某条功能路径。
- 为 PR/文档自动抓取截图作为证据。

前置条件：
- Android 模拟器已启动；`adb` 已安装并在 PATH 中。
- App 以 debug 模式运行（否则 logcat 拿不到 JS 日志）。

不该用（负边界）：
- 真机/设备农场的大规模兼容性测试。
- iOS 端验证。
- 已有成熟 E2E 框架（Espresso、Detox、Maestro）的项目——优先用框架而非裸 ADB。
- 缺少必要输入、权限、安全边界或成功判据时，先停下问清楚，不要盲点。

## 步骤

### 1. 设备校准（取真实分辨率）
交互前先确认屏幕尺寸，保证点击坐标准确。布局常被缩放，以返回的物理尺寸为坐标计算基准。
```bash
adb shell wm size
```

### 2. UI 探查（发现状态）
dump 当前界面树，定位按钮/输入框的精确边界：
```bash
adb shell uiautomator dump /sdcard/view.xml && adb pull /sdcard/view.xml ./artifacts/view.xml
```
在 `view.xml` 中按 `text`、`content-desc` 或 `resource-id` 搜索元素；`bounds="[x1,y1][x2,y2]"` 即可点击区域。

### 3. 交互指令
- 点击：`adb shell input tap <x> <y>`（取元素 bounds 的中心点）。
- 滑动/滚动：`adb shell input swipe <x1> <y1> <x2> <y2> <duration_ms>`。
- 文本输入：`adb shell input text "<message>"`（特殊字符支持有限）。
- 按键事件：`adb shell input keyevent <code_id>`（如 66 = Enter）。

### 4. 验证与报告
视觉验证——交互后截图确认 UI 变化：
```bash
adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png ./artifacts/test_result.png
```
分析验证——实时查 JS 控制台日志，捕获报错或成功标记：
```bash
adb logcat -d | grep "ReactNativeJS" | tail -n 20
```
清理：所有生成文件统一放进 `artifacts/` 目录，满足项目组织规范。

## 指令

- 中心点坐标：对 `[x1,y1][x2,y2]` 取算术平均，`cx=(x1+x2)/2, cy=(y1+y2)/2`，命中最稳。
- 交互与验证之间插入 1-2 秒等待，避免动画未结束就截图/读日志。
- 在代码里打独特日志标记（如 `✅ Action Successful`），方便 `grep` 精确匹配验证结果。

## 示例

验证「点击登录按钮后出现首页」一条路径：
```bash
# 1. 校准
adb shell wm size
# 2. dump 取登录按钮 bounds，例如 [432,1200][648,1320] → 中心 (540,1260)
adb shell uiautomator dump /sdcard/view.xml && adb pull /sdcard/view.xml ./artifacts/view.xml
# 3. 点击并等待动画
adb shell input tap 540 1260
sleep 2
# 4. 截图 + 日志双重验证
adb shell screencap -p /sdcard/screen.png && adb pull /sdcard/screen.png ./artifacts/test_result.png
adb logcat -d | grep "ReactNativeJS" | tail -n 20
```

## 注意事项

- 快速失败：若 `uiautomator dump` 失败或找不到预期文本，立刻停下排查，不要凭猜测盲点坐标。
- 坐标随分辨率/缩放变化，换设备或换 emulator 配置后务必重新校准，不要复用硬编码坐标。
- `input text` 对中文及特殊字符支持有限，必要时改用粘贴或 ADB IME 方案。
- 不要把本技能输出当作环境特定校验、专家评审的替代品。

## 互见

- 研发/testing 域内其他 E2E 与回归验证技能。
- 截图/日志分析类技能可与本技能的 artifacts 产物串联。

---
采编自 sickn33/antigravity-awesome-skills（MIT License）。
