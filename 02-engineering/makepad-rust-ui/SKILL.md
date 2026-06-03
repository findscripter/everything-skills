---
name: makepad-rust-ui
title: Makepad Rust UI 开发
description: 当用 Rust + Makepad 框架搭建跨平台 GUI（桌面/移动/Web）时使用；做工程脚手架、live_design! DSL 布局、事件处理、MPSL 着色器与 cargo-makepad 多端打包的实现产物；不适用于 egui/Tauri/Slint 等非 Makepad 栈、纯后端逻辑或无 GUI 的 Rust 项目。触发词：Makepad、live_design、MPSL、cargo makepad
domain: 研发/frontend
triggers: [Makepad, live_design, MPSL, cargo makepad, Rust GUI, makepad-widgets, Rust 跨平台界面, 热重载 UI]
tags: [rust, makepad, gui, frontend, ui-framework, shader, cross-platform, live-design]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [cargo, cargo-makepad, rustup]
requires: []
related: [rust-pro, avalonia-zafiro-desktop, electron-desktop-development, bevy-ecs-rust]
combines_with: [rust-pro, ui-design-system-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 **Rust + Makepad** 框架从零搭建或扩展跨平台 GUI（macOS / Windows / Linux / iOS / Android / Web-WASM）。
- 需要用 `live_design!` DSL 描述界面、用 MPSL 写自定义着色器、用实时（live）重载迭代视觉效果。
- 需要把 Makepad 应用打包到桌面、移动端或 WebAssembly。
- 排查 Makepad 特有的构建/渲染/live DSL 报错。

**不该用边界：**
- 非 Makepad 的 Rust GUI 栈（egui、iced、Slint、Tauri、Dioxus）——本技能 API 不通用。
- 纯后端 / CLI / 库类 Rust 项目，无图形界面需求。
- 通用 Rust 语法或 Cargo 基础问题——那属于一般 Rust 知识，不必走本技能。

## 步骤 / 指令

1. **环境准备**：安装 Rust（`rustup`），再装打包工具链：
   ```bash
   cargo install cargo-makepad
   cargo makepad install-toolchain   # 按需拉取 wasm / android / apple 目标
   ```
2. **建工程并加依赖**：在 `Cargo.toml` 引入 widgets crate（按需锁定 git/版本）：
   ```toml
   [dependencies]
   makepad-widgets = "0.6"   # 或 git = "https://github.com/makepad/makepad"
   ```
3. **写 `app.rs` 主结构**：用 `live_design!` 声明 UI 树，用 `#[derive(Live, LiveHook)]` + `MatchEvent` 驱动逻辑（见示例）。`live_design!` 内是 Makepad 的 DSL，不是 Rust——大小写敏感、用 `<Button>` 引用内置 widget、`{}` 写实例属性。
4. **运行（带 live 重载）**：
   ```bash
   cargo run            # 桌面，debug
   cargo run --release  # 发布性能基准
   ```
   运行中修改 `live_design!` DSL 文本即热更新视觉，无需重编译 Rust。
5. **写着色器（MPSL）**：在 widget 的 `draw_*` 块里用 `fn pixel(self) -> vec4 { ... }` 写片元逻辑，用 `sdf` 工具画矢量图形，`self.rect_size` / `self.pos` 取几何量。
6. **多端打包**：
   ```bash
   cargo makepad wasm run    -p <crate>   # Web 本地预览
   cargo makepad wasm build  -p <crate>   # 产出 wasm + js 胶水
   cargo makepad android run -p <crate>   # 连真机/模拟器
   cargo makepad apple ios run -p <crate>
   ```

## 示例

最小可运行 App 骨架（桌面）：

```rust
use makepad_widgets::*;

live_design! {
    use link::theme::*;
    use link::widgets::*;

    App = {{App}} {
        ui: <Root> {
            main_window = <Window> {
                body = <View> {
                    flow: Down, spacing: 12, align: { x: 0.5, y: 0.5 },
                    btn = <Button> { text: "Click me" }
                    label = <Label> { text: "0" }
                }
            }
        }
    }
}

#[derive(Live, LiveHook)]
pub struct App {
    #[live] ui: WidgetRef,
    #[rust] count: usize,
}

impl LiveRegister for App {
    fn live_register(cx: &mut Cx) { makepad_widgets::live_design(cx); }
}

impl MatchEvent for App {
    fn handle_actions(&mut self, cx: &mut Cx, actions: &Actions) {
        if self.ui.button(id!(btn)).clicked(actions) {
            self.count += 1;
            let label = self.ui.label(id!(label));
            label.set_text(cx, &format!("{}", self.count));
        }
    }
}

impl AppMain for App {
    fn handle_event(&mut self, cx: &mut Cx, event: &Event) {
        self.match_event(cx, event);
        self.ui.handle_event(cx, event, &mut Scope::empty());
    }
}

app_main!(App);
```

自定义 MPSL 着色器（圆角发光按钮片段）：

```rust
draw_bg: {
    fn pixel(self) -> vec4 {
        let sdf = Sdf2d::viewport(self.pos * self.rect_size);
        sdf.box(1.0, 1.0, self.rect_size.x - 2.0, self.rect_size.y - 2.0, 4.0);
        sdf.fill(mix(#3a7bd5, #00d2ff, self.pos.x));
        return sdf.result;
    }
}
```

## 注意事项

- **DSL ≠ Rust**：`live_design!` 块是声明式 DSL，类型名、`id!()` 路径必须与 Rust 侧 `#[live]` 字段一致，否则运行时 panic 而非编译报错。
- **id! 路径**：`self.ui.button(id!(btn))` 的路径要逐级匹配 UI 树嵌套，写错只会拿到空 widget 句柄（静默无效）。
- **set_text 需传 cx**：新版 API 多数 setter（`set_text(cx, ...)`）要求传 `cx`，旧示例的无 `cx` 写法会编译失败。
- **版本漂移**：Makepad 仍在快速迭代，git 主线与 crates.io 版本 API 常有差异；锁定一个版本，遇到符号缺失先核对当前版本文档。
- **WASM 体积**：release + `wasm-opt` 后体积仍偏大，Web 端注意首屏加载；移动打包需先 `install-toolchain` 配好目标 SDK/NDK。
- 本技能不替代针对目标平台的真机测试与性能验证；着色器在不同 GPU/驱动上可能有差异。

## 互见

- 同卷（研发/frontend）的其他 GUI / 前端构建技能：跨平台桌面打包、WebAssembly 交付。
- Rust 工程与 Cargo 工具链相关技能。
- 着色器 / 图形渲染（GLSL/WGSL/SDF）相关技能可与 MPSL 部分互参。

---

采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT，上游内容源自 ZhangHanDong/makepad-skills）。本条为适配重写，按 Makepad 现行公开 API 重构示例，使用前请以目标 Makepad 版本官方文档为准校验。
