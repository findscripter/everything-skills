---
name: rust-pro
title: Rust 进阶开发
description: 当用 Rust 1.75+ 构建服务/库/系统工具，或攻克所有权、生命周期、async 设计与零成本性能优化时使用；做类型安全 API、Tokio 异步、错误处理与测试基准齐备的可上线 Rust 代码；不适用于一次性脚本、动态运行时、只问基础语法或无法引入 Rust 的场景；触发词：Rust、async、Tokio、所有权、生命周期、unsafe FFI、cargo。
domain: 研发/backend
triggers: [Rust, rust-pro, async, Tokio, 所有权, 生命周期, borrow checker, unsafe, FFI, cargo, trait, 零成本抽象]
tags: [rust, async, systems-programming, performance, engineering]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [cargo, tokio, clippy, rustfmt, criterion]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 Rust 1.75+ 构建服务、库或系统级工具，需要内存安全 + 高性能并存时使用。
- 攻克所有权 / 借用 / 生命周期 / async 设计难题，或要做零成本抽象、并发与性能优化时使用。
- 触发词：Rust、async、Tokio、所有权、生命周期、unsafe、FFI、cargo、trait。

不该用的边界：
- 只要一次性脚本或动态运行时（要快、要热改）→ 选 Python/脚本语言，别上 Rust。
- 只是查基础语法（`for`/`match` 怎么写）→ 直接给语法即可，不必启用本技能的体系化方法。
- 技术栈无法引入 Rust（团队/部署约束）→ 不适用。
- 纯依赖审计 / 纯性能剖析另有专技 → 见「互见」。

## 步骤 / 指令

```
1. 明确约束：性能目标、安全边界（是否允许 unsafe）、运行时（同步/异步/no_std/嵌入）、目标平台。
2. 选型：
   - 异步运行时 → 默认 Tokio；Web 服务用 axum + tower + hyper；gRPC 用 tonic；DB 用 sqlx。
   - 错误处理 → 库用 thiserror 定义类型化错误；二进制入口用 anyhow 聚合上下文。
   - 序列化 → serde。
3. 用类型系统把不变量编译期化：newtype、marker trait、状态机用类型表达；优先 Result 显式错误，杜绝 unwrap 进生产。
4. 实现 + 测试同步推进：单测、集成测、文档测试；属性测试用 proptest，基准用 criterion。
5. 过质量门：cargo fmt、cargo clippy（-D warnings）、cargo test，CI 串起来；依赖体检 cargo audit/deny。
6. 仅在热点处剖析优化：cargo flamegraph / perf 定位，再考虑无锁、SIMD、缓存友好布局；不要凭感觉提前优化。
7. unsafe 与 FFI：用安全封装包住 unsafe，每个 unsafe 块写明 // SAFETY: 不变量；FFI 绑定用 bindgen 生成。
```

核心规则：
- 让类型系统替你做正确性检查——能编译期保证就不要运行时判断。
- 内存安全不让位于性能：靠零成本抽象，避免不必要的 `clone`/`Arc<Mutex<>>` 滥用。
- 错误一律显式 `Result`，不吞、不裸 panic；panic 仅用于不可恢复的程序 bug。
- 每个 unsafe 块必须有 `// SAFETY:` 注释说明为何成立，并尽量缩小其范围。
- 遵循社区惯例（clippy 默认 lint 即风格基线），优先函数式组合子（`map`/`and_then`/`?`）。

## 示例

最小工程骨架与质量门命令：

```bash
cargo new mysvc && cd mysvc
cargo add tokio --features full
cargo add axum thiserror anyhow serde --features serde/derive
# 质量门（建议进 CI）
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
cargo test --all
cargo bench            # 需 criterion
cargo audit            # 依赖漏洞
cargo flamegraph       # 热点剖析
```

类型化错误（库侧 thiserror + 入口 anyhow）：

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StoreError {
    #[error("key not found: {0}")]
    NotFound(String),
    #[error("io failure")]
    Io(#[from] std::io::Error),
}

// 入口处用 anyhow 聚合上下文
use anyhow::Context;
fn load(path: &str) -> anyhow::Result<String> {
    std::fs::read_to_string(path).with_context(|| format!("reading {path}"))
}
```

最小 Tokio + axum 异步服务：

```rust
use axum::{routing::get, Router};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let app = Router::new().route("/health", get(|| async { "ok" }));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
```

unsafe 块的安全注释规范：

```rust
// SAFETY: ptr 来自 Box::into_raw，对齐且非空，且本作用域内独占，无其他别名。
let val = unsafe { &mut *ptr };
```

典型请求样例（可直接当提示词）：
- 「设计一个高性能 async Web 服务，错误处理完备」
- 「实现一个用原子操作的无锁并发数据结构」
- 「为某 C 库用 FFI 写一个安全封装」
- 「修复这段复杂泛型代码里的生命周期报错」

## 注意事项

- 不要拿 unwrap/expect 当错误处理进生产；它们只用于「逻辑上不可能失败」且已注释说明的场景。
- 避免无脑 `Arc<Mutex<T>>`：先考虑消息传递（mpsc/broadcast/watch）、`&`/借用或 `Rc`（单线程）。
- async 里别做阻塞调用（同步 IO、重 CPU），用 `spawn_blocking` 或专用线程池，否则拖垮整个 runtime。
- 优化前先剖析：用 flamegraph/perf 找到真热点再动手；过早优化常牺牲可读性却无收益。
- `clippy -D warnings` 当作硬门禁；GATs、const 泛型等高级特性按需用，别为炫技增加维护成本。
- unsafe 是最后手段：先穷尽安全方案，无法避免时把它锁进最小安全封装并写 SAFETY 不变量。
- 输出不能替代环境内的实测、编译与评审；缺少关键约束（运行时/平台/安全边界）时先发问再动手。

## 互见

- requires：无。
- related：`performance-profiler`（系统化性能剖析与火焰图分析，本技能聚焦写 Rust 本身，深度调优转交它）；`backend-architecture-patterns`（服务分层与架构取舍，先定架构再用本技能落地 Rust 实现）。
- combines_with：`code-reviewer`（Rust 代码写完后做正确性与质量审查）；`dependency-auditor`（对 Cargo 依赖做许可证与已知漏洞专项体检，补足 cargo audit 之外的治理）。

---
采编自 sickn33/antigravity-awesome-skills（源技能 `rust-pro`，MIT 许可）。
