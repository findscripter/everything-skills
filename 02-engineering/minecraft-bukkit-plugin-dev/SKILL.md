---
name: minecraft-bukkit-plugin-dev
title: Minecraft 服务端插件开发
description: 当为 Bukkit / Spigot / Paper 服务端开发或重构插件时使用；产出事件监听、命令、GUI、数据持久化与性能优化的可运行代码及构建配置；不适用于客户端 Mod（Forge/Fabric）、原版指令包或服务器运维。触发词：Bukkit、Spigot、Paper 插件、PlaceholderAPI、NMS、plugin.yml
domain: 研发/backend
triggers: [Bukkit 插件, Spigot 插件, Paper 插件, plugin.yml, PlayerMoveEvent 优化, NMS 跨版本兼容, Brigadier 命令, MiniMessage, MockBukkit 测试, PlaceholderAPI 集成]
tags: [minecraft, bukkit, spigot, paper, java, 插件开发, backend, 游戏服务端]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Maven, Gradle, Paper API, Spigot API, MockBukkit, Spark, PlaceholderAPI, Vault, ProtocolLib, HikariCP, Adventure / MiniMessage, paperweight-userdev]
requires: []
related: [java-modern-pro, kotlin-coroutines-flow, unity-game-developer, bevy-ecs-rust]
combines_with: [java-modern-pro, error-handling-patterns, performance-profiler]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于：
- 为 Bukkit / Spigot / Paper 服务端编写或重构插件：事件监听、命令、Inventory GUI、世界生成、实体 AI。
- 需要处理跨版本兼容（NMS / 反射 / Mojang mappings）、数据持久化（YAML / MySQL / Redis）或生态集成（Vault、PlaceholderAPI、ProtocolLib）。
- 热点事件（PlayerMoveEvent、BlockPhysicsEvent）性能优化与异步化改造。

不该用：
- 客户端 Mod（Forge / Fabric / NeoForge）开发——API 与生命周期完全不同。
- 原版数据包（datapack）/ 指令方块逻辑，不涉及 Java 插件。
- 纯服务器运维（开服、网络代理 BungeeCord 配置）而不写代码。
- 信息不足（目标服务端类型、MC 版本、已有构建配置未知）时，先澄清再动手。

## 步骤 指令

1. 探明环境。确定服务端类型与目标 MC 版本：读 `build.gradle(.kts)` / `pom.xml` 的依赖与 `api-version`，读 `plugin.yml` / `paper-plugin.yml`。Paper 优先用现代 API（Adventure、Brigadier、Lifecycle），Bukkit/Spigot 走 legacy 路径并保留 fallback。
2. 最小可用切入。先实现核心功能闭环（注册监听器/命令 → 跑通），再分层加特性，保持关注点分离（service 层放业务、repository 层放数据访问）。
3. 事件与命令。监听器用合适的 `EventPriority`；命令优先 Brigadier（Paper Lifecycle API 注册）并补 Tab 补全。热点事件务必早返回、避免每 tick 重算。
4. 数据与并发。I/O、数据库查询一律异步（`Bukkit.getScheduler().runTaskAsynchronously`），DB 用 HikariCP 连接池；回到主线程才动 Bukkit API（线程不安全）。简单状态用 PersistentDataContainer，结构化数据用 MySQL/Redis。
5. 性能验证。先 profile 再优化：生产环境用 Spark（`/spark profiler`）定位热点，关注 tick 耗时与 GC。
6. 构建与隔离。Maven `shade` / Gradle `shadow` 重定位第三方依赖避免冲突；语义化版本号。
7. 测试。单元测试用 MockBukkit，关键路径在真实服务端做集成验证。

## 示例

plugin.yml（Spigot/Bukkit 经典加载方式）：
```yaml
name: MyPlugin
version: 1.0.0
main: com.example.MyPlugin
api-version: '1.20'
commands:
  hello:
    description: Say hello
depend: [Vault]
softdepend: [PlaceholderAPI]
```

异步查库 + 主线程回写（避免阻塞主线程）：
```java
Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
    int coins = repository.loadCoins(uuid);        // 异步 I/O
    Bukkit.getScheduler().runTask(plugin, () ->     // 回主线程动 API
        player.sendMessage(Component.text("金币: " + coins)));
});
```

Paper 现代文本（Adventure + MiniMessage，替代 legacy `§` 颜色码）：
```java
Component msg = MiniMessage.miniMessage()
    .deserialize("<gradient:#ff0000:#00ff00>欢迎回来</gradient>");
player.sendMessage(msg);
```

## 注意事项

- 线程安全：除调度器与少数标注 thread-safe 的接口外，Bukkit API 只能在主线程调用，跨线程操作实体/世界会触发崩溃或数据损坏。
- 版本差异：NMS 包名随版本变化，跨版本走反射或 paperweight-userdev（去混淆开发），不要硬编码版本包路径。
- 热点事件是 TPS 杀手：PlayerMoveEvent 每次移动都触发，先用 `from.getBlockX() == to.getBlockX()` 等粗筛短路，避免每次都做重计算或同步 I/O。
- 文本格式随服务端选择：Paper 用 MiniMessage / Adventure，Bukkit/Spigot 退回 legacy 格式，配置文件提供迁移路径。
- 配置用带注释的 YAML，容器部署支持环境变量；实验特性用 feature flag 控制。
- 优化前先测量，不要凭感觉改；防御式编程，对外部输入做校验。

## 互见

- 性能/并发调优可结合 JVM GC 调参与 Spark 报告解读。
- 数据层可联动 MySQL / Redis / HikariCP 连接池配置类技能。
- 生态插件 API（Vault 经济、PlaceholderAPI 占位符、ProtocolLib 封包）按需深入各自文档。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可），已按本仓库 SCHEMA 适配重写。
