---
name: bevy-ecs-rust
title: Bevy ECS Rust Game Development
description: Use when building games in Rust with the Bevy engine: model Components/Systems/Resources/Queries, refactor OO logic into data-oriented ECS, and exploit parallel scheduling; not for non-Bevy engines, non-Rust, or pure rendering/art pipelines. Triggers: Bevy, ECS, Query, System, Re
domain: 研发/backend
triggers: [Bevy, ECS, Entity Component System, Rust game development, Query, System, Resource, parallel scheduling, data-oriented design, Component]
tags: [bevy, rust, ecs, game-development, parallel-scheduling, performance-optimization, data-oriented-design]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

A guide to building high-performance game logic using Bevy's data-oriented ECS architecture: how to structure systems, optimize queries, manage resources, and leverage parallel execution.

- Use when developing games with the Bevy engine in Rust and organizing game logic (Systems / Queries / Resources).
- Use when designing game systems that need to run in parallel, letting the Bevy scheduler parallelize automatically.
- Use when optimizing game performance by minimizing cache misses and shrinking iteration sets.
- Use when refactoring object-oriented logic (inheritance / methods bolted onto data) into data-oriented ECS patterns.

Out of scope:

- Non-Bevy engines (Unity, Godot, Unreal) or non-Rust projects — these APIs do not apply.
- Pure rendering pipelines, shaders, and art/animation assets are not ECS data-modeling problems.
- Output is not a substitute for version-specific compilation and testing. Bevy APIs change a lot across versions (e.g. `time.delta_seconds()` may be renamed in newer releases).
- Stop and ask for clarification if the target Bevy version, build environment, or success criteria are missing.

## Steps

### 1. Defining Components

Use simple structs for data. Derive `Component`; add `Reflect` when you need editor/serialization reflection.

```rust
#[derive(Component, Reflect, Default)]
#[reflect(Component)]
struct Velocity {
    x: f32,
    y: f32,
}

#[derive(Component)]
struct Player; // marker component, no data
```

### 2. Writing Systems

Systems are regular Rust functions that declare the data they touch via parameters: `Query` for components, `Res`/`ResMut` for resources.

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

### 3. Managing Resources

Use `Resource` for globally unique data (score, game state). Read with `Res`, write with `ResMut`.

```rust
#[derive(Resource)]
struct GameState {
    score: u32,
}

fn score_system(mut game_state: ResMut<GameState>) {
    game_state.score += 10;
}
```

### 4. Scheduling Systems

Add systems to the `App` builder; use `.chain()` when a fixed execution order is required.

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_resource::<GameState>()
        .add_systems(Update, (movement_system, score_system).chain())
        .run();
}
```

When modeling, first ask: which things are **data** (Component), which are **global singletons** (Resource), and which are **behavior** (System)? Separate behavior out of data.

## Example

### Example 1: Spawning Entities with Require Component

`#[require(...)]` declares the other components a component must travel with; they are filled in with defaults on spawn.

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

### Example 2: Query Filters

Use `With` and `Without` to filter entities by component presence without pulling out the component data.

```rust
fn enemy_behavior(
    query: Query<&Transform, (With<Enemy>, Without<Dead>)>,
) {
    for transform in &query {
        // Only active enemies processed here
    }
}
```

## Notes

Best practices:

- **Do:** Use `Query` filters (`With`, `Without`, `Changed`) to reduce per-frame iteration count and cache misses.
- **Do:** Prefer `Res` over `ResMut`, and `&T` over `&mut T`, when read-only access is enough — this lets the scheduler run more systems in parallel.
- **Do:** Use `Bundle` (or `#[require(...)]`) to spawn complex entities atomically, so half-built entities are never observed by other systems.
- **Don't:** Store heavy logic inside Components; keep them as pure data.
- **Don't:** Use `RefCell` or interior mutability inside components; let the ECS handle borrowing.

Troubleshooting:

- **Problem:** System panic with a "Conflict" error.
- **Solution:** Two parallel systems are accessing the same component mutably. Use `.chain()` to order them, or split the logic.

Version compatibility: Bevy APIs (system scheduling, time API, `Sprite` construction, etc.) change frequently across major versions. Defer to the docs for your target version and verify with `cargo build` before shipping.

## See also

- Other Rust engineering and performance-optimization skills.
- General data-oriented design (DoD) and cache-friendly layout optimization methods.

---
Adapted from sickn33/antigravity-awesome-skills (MIT).
