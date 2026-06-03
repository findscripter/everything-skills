---
name: bevy-ecs-rust
title: Bevy 实体组件系统 Rust 游戏开发
description: 当用 Rust + Bevy 引擎开发游戏、需要把面向对象逻辑重构为数据导向 ECS 并设计可并行系统时使用；做组件/系统/资源/查询的建模与调度产出可运行的 ECS 代码与性能优化方案；不适用于非 Bevy 引擎、非 Rust 或纯渲染/美术管线问题；触发词：Bevy、ECS、Query、System、Resource、并行调度
domain: 研发/backend
triggers: [Bevy, ECS, 实体组件系统, Rust 游戏开发, Query 查询, System 系统, Resource 资源, 并行调度, 数据导向, Component 组件]
tags: [bevy, rust, ecs, 游戏开发, 并行调度, 性能优化, 数据导向设计]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Write, Bash]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 Rust + Bevy 引擎开发游戏，需要组织游戏逻辑（Systems / Queries / Resources）。
- 设计需要并行执行的游戏系统，希望借助 Bevy 调度器自动并行。
- 通过减少缓存未命中、缩小迭代集合来优化游戏性能。
- 把面向对象（继承/方法挂载）逻辑重构为数据导向的 ECS 模式。

不该用的边界：
- 非 Bevy 引擎（如 Unity、Godot、Unreal）或非 Rust 项目，本技能的 API 不适用。
- 纯渲染管线、Shader、美术资源/动画制作等不属于 ECS 数据建模的问题。
- 输出代码不能替代针对具体 Bevy 版本的编译验证与测试（Bevy API 跨版本变动较大，注意 `time.delta_seconds()` 等在新版本可能改名）。
- 缺少目标 Bevy 版本、构建环境或成功标准时，先澄清再动手。

## 步骤

### 1. 定义组件（Component）
组件就是纯数据的简单 struct，派生 `Component`；需要编辑器/序列化反射时再加 `Reflect`。

```rust
#[derive(Component, Reflect, Default)]
#[reflect(Component)]
struct Velocity {
    x: f32,
    y: f32,
}

#[derive(Component)]
struct Player; // 标记组件（marker），无数据
```

### 2. 编写系统（System）
系统是普通 Rust 函数，通过参数声明要访问的数据：`Query` 取组件，`Res`/`ResMut` 取资源。

```rust
fn movement_system(
    time: Res<Time>,
    mut query: Query<(&mut Transform, &Velocity), With<Player>>,
) {
    for (mut transform, velocity) in &mut query {
        transform.translation.x += velocity.x * time.delta_seconds();
        transform.translation.y += velocity.y * time.delta_seconds();
    }
}
```

### 3. 管理资源（Resource）
全局唯一的数据（分数、游戏状态等）用 `Resource`，读写分别用 `Res` / `ResMut`。

```rust
#[derive(Resource)]
struct GameState {
    score: u32,
}

fn score_system(mut game_state: ResMut<GameState>) {
    game_state.score += 10;
}
```

### 4. 注册与调度系统
在 `App` 构建器上注册系统；需要固定执行顺序时用 `.chain()`。

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_resource::<GameState>()
        .add_systems(Update, (movement_system, score_system).chain())
        .run();
}
```

## 指令

- 建模时先问：哪些是「数据」（Component）、哪些是「全局单例」（Resource）、哪些是「行为」（System）。把行为从数据中剥离。
- 查询尽量加过滤器 `With` / `Without` / `Changed` 缩小迭代集合，降低缓存未命中。
- 只读访问优先用 `Res` 而非 `ResMut`、用 `&T` 而非 `&mut T`，让调度器能并行更多系统。
- 生成实体用 `Bundle` 或 `#[require(...)]` 保证一组组件原子性地一起出现。
- 遇到 "Conflict" panic：两个并行系统对同一组件做了可变访问，用 `.chain()` 排序或拆分逻辑。

## 示例

### 示例 1：用 require 约束生成实体
`#[require(...)]` 声明某组件必须伴随的其他组件，spawn 时自动补齐缺省值。

```rust
use bevy::prelude::*;

#[derive(Component, Reflect, Default)]
#[require(Velocity, Sprite)]
struct Player;

#[derive(Component, Default)]
struct Velocity {
    x: f32,
    y: f32,
}

fn setup(mut commands: Commands, asset_server: Res<AssetServer>) {
    commands.spawn((
        Player,
        Velocity { x: 10.0, y: 0.0 },
        Sprite::from_image(asset_server.load("player.png")),
    ));
}
```

### 示例 2：用查询过滤器精确筛选
`With` / `Without` 在不取出组件数据的前提下按「是否拥有某组件」过滤实体。

```rust
fn enemy_behavior(
    query: Query<&Transform, (With<Enemy>, Without<Dead>)>,
) {
    for transform in &query {
        // 这里只会处理「活着的敌人」
    }
}
```

## 注意事项

- 组件保持纯数据：不要把重逻辑塞进 Component，也不要在组件里用 `RefCell` 等内部可变性，借用交给 ECS 管理。
- 善用过滤器：`With` / `Without` / `Changed` 能显著减少每帧迭代量。
- 并行优先：能用 `Res` 就别用 `ResMut`，给调度器更多并行空间。
- 原子生成：复杂实体用 `Bundle` 一次性生成，避免半成品实体被其他系统看到。
- 常见报错 —— 系统 panic 提示 "Conflict"：通常是两个并行系统可变访问了同一组件，用 `.chain()` 排序或拆分逻辑解决。
- 版本兼容：Bevy 各大版本 API 改动频繁（系统调度、时间 API、Sprite 构造等），落地前以目标版本文档为准并 `cargo build` 验证。

## 互见

- 研发/misc 下其他 Rust 工程与性能优化类技能。
- 涉及数据导向设计（DoD）、缓存友好布局的通用优化方法。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
