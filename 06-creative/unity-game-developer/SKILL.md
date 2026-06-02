---
name: unity-game-developer
title: Unity 游戏开发
description: 当用 Unity 6 LTS 开发/优化跨平台游戏，需要选渲染管线、写高性能 C#、Profiler 调优、Addressables 资源管理或多平台打包时使用；做出可落地的架构与优化方案；不适用于纯美术/关卡设计、非 Unity 引擎（UE/Godot/Cocos）、或后端服务开发；触发词：Unity、URP、HDRP、Shader Graph、DOTS、Addressables、卡顿优化、跨平台打包。
domain: 创意/av
triggers: [Unity, URP, HDRP, Shader Graph, DOTS, ECS, Addressables, Unity 卡顿优化, 跨平台打包, Netcode]
tags: [unity, game-dev, csharp, performance, av, creative]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [unity-6-lts, csharp, urp, hdrp, burst, addressables]
requires: []
related: [unreal-engine-cpp, glsl-shader-programming, bevy-ecs-rust]
combines_with: [glsl-shader-programming]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 **Unity 6 LTS** 做或优化游戏，需要工程级决策：渲染管线选型、性能调优、可扩展架构、跨平台打包时使用。
- 典型任务：选 URP/HDRP/Built-in；用 Profiler 定位 CPU/GPU/内存瓶颈；写零/低 GC 的 C#；Job System + Burst / DOTS-ECS 提升吞吐；Addressables 做动态资源加载；Netcode for GameObjects 做联机；iOS/Android/主机/PC/WebGL/XR 适配打包。
- 触发词：Unity、URP、HDRP、Shader Graph、DOTS、ECS、Addressables、卡顿优化、跨平台打包、Netcode。

不该用的边界：
- 非 Unity 引擎（Unreal、Godot、Cocos、自研引擎）→ 本技能不通用。
- 纯美术/关卡/数值设计、无代码与性能诉求 → 交给设计类技能。
- 通用 C#/.NET 后端、纯算法题 → 用研发卷对应技能；本技能聚焦 Unity 运行时与编辑器特性。
- 不替代真机实测：任何结论都需在目标硬件上验证，不臆断帧率。

## 步骤 / 指令

```
1. 厘清目标与约束（先问后做）
   - 目标平台（移动/主机/PC/WebGL/XR）、目标帧率与机型档位、画面档次、是否联机。
   - 这些直接决定管线、资源预算与架构，缺失则先澄清。

2. 选渲染管线
   - URP：移动/中端/跨平台默认首选，可扩展、性能可控。
   - HDRP：仅 PC/主机高画质（实时光追、体积光），移动端禁用。
   - Built-in：仅遗留项目维护；新项目不选，必要时规划迁移。
   - 自定义效果走 Shader Graph（可视化原型）或 HLSL（精细控制）；重计算用 Compute Shader / VFX Graph。

3. 架构落地（按规模选型，勿过度设计）
   - 数据驱动用 ScriptableObject；状态用状态机；解耦用事件/观察者。
   - 高频实例化（子弹、特效、敌人）用对象池，杜绝运行时频繁 new/Destroy。
   - 海量同质实体（大规模战斗/集群）才上 DOTS-ECS + Job System + Burst；小项目别滥用。

4. 性能优化（Profiler 驱动，先测后改）
   - 用 Unity Profiler 定位是 CPU / GPU / 内存 哪一类瓶颈，再针对性优化。
   - 渲染：Frame Debugger 查 DrawCall/SetPass；开启遮挡剔除、LOD、合批、纹理压缩与流式加载。
   - 内存：Memory Profiler 查堆与原生内存；消除每帧 GC 分配（缓存数组、避免 LINQ/装箱/字符串拼接、复用集合）。
   - 物理：减小 FixedTimestep 负担、用层级碰撞矩阵裁剪、简化碰撞体。

5. 资源管理
   - 用 Addressables 做动态加载与远程内容，替代散乱 Resources/手搓 AssetBundle。
   - 纹理选对压缩格式（移动端 ASTC）、音频按场景选压缩与加载方式、网格做 LOD。
   - 大资源用 Git LFS；规划资源目录与依赖，防循环引用。

6. 联机（如需要）
   - 优先 Netcode for GameObjects；做客户端-服务器同步与延迟补偿；按需接 Relay/Lobby/专用服务器。

7. 测试与打包
   - 用 Unity Test Framework 写 EditMode/PlayMode 测试；做内存泄漏与性能回归基线。
   - 各平台单独配置 Player Settings 与签名；Unity Cloud Build / CI 自动出包。
   - 上线前在目标真机 Profiler 实测，按平台认证要求过审。
```

规则：
- 性能从工程伊始就纳入设计，而非后期补救；但优化必须 Profiler 先行，不靠猜。
- 给生产级 C#：含错误处理与日志，遵循 Unity 命名/编码规范。
- 每个方案显式标注目标平台限制与取舍。

## 示例

最小提示词（让 Agent 产出方案）：
```
目标：[平台/帧率/画面档/是否联机]。
基于 Unity 6 LTS 给出：1) 渲染管线选型及理由；2) 关键架构（含对象池/数据驱动/是否上 DOTS）；
3) 三条最可能的性能瓶颈与 Profiler 验证方法；4) 资源加载方案；5) 打包与真机验证清单。
不臆断帧率，凡结论标注需真机实测。
```

避免每帧 GC 分配（高频踩坑）：
```csharp
// 反例：Update 中每帧分配，触发 GC 卡顿
void Update() {
    var hits = Physics.OverlapSphere(pos, r);          // 每帧 new 数组
    var names = enemies.Where(e => e.alive).ToList();  // LINQ + ToList 分配
}

// 正例：预分配 + 非分配 API，复用缓冲
readonly Collider[] _buf = new Collider[32];
void Update() {
    int n = Physics.OverlapSphereNonAlloc(pos, r, _buf); // 复用 _buf，零分配
    for (int i = 0; i < n; i++) { /* 用 _buf[i] */ }
}
```

对象池替代频繁实例化：
```csharp
// 用 UnityEngine.Pool.ObjectPool<T> 复用，避免 Instantiate/Destroy 引发 GC 与卡顿
var pool = new ObjectPool<Bullet>(
    createFunc: () => Instantiate(prefab),
    actionOnGet: b => b.gameObject.SetActive(true),
    actionOnRelease: b => b.gameObject.SetActive(false));
```

## 注意事项

- 管线选型不可逆性强：URP/HDRP 项目中途互转代价高，开工前定死。
- HDRP 不要用于移动端；WebGL 不支持多线程，Job System/部分特性受限，需降级方案。
- DOTS-ECS 学习与重构成本高，仅在确有大规模实体性能需求时引入，否则徒增复杂度。
- 优化禁忌「凭感觉」：必须 Profiler/Frame Debugger/Memory Profiler 量化前后对比，且在目标机型实测。
- 字符串拼接、`Find`/`GetComponent` 放在热路径、未缓存的 `Camera.main`、装箱、闭包捕获都是常见 GC 来源，逐一排查。
- 跨平台输入统一用新版 Input System，勿混用旧 Input Manager。
- 大资源进 Git 前配好 Git LFS，否则仓库迅速膨胀且难回退。

## 互见

- requires：无（建议先具备基础 C# 与 Unity 编辑器操作能力）。
- related：`code-reviewer`（审查产出的 C# 脚本正确性与可读性）。
- combines_with：无。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）；适配重写而非逐字翻译，聚焦 Unity 6 LTS 可执行实践。
