---
name: julia-scientific-pro
title: Julia 科学计算工程
description: 当用 Julia 1.10+ 写科学计算/数值/高性能代码，需要类型稳定、多重派发设计、性能调优或打包上线时使用；做类型稳定的可上线 Julia 代码、@code_warntype 诊断、BenchmarkTools 基准与 BlueStyle 规范化产物；不适用于一次性脚本、纯基础语法问答或无法引入 Julia 的场景；触发词：Julia、多重派发、类型稳定、@code_warntype、BenchmarkTools、Pkg、CUDA.jl、DifferentialEquations。
domain: 研发/backend
triggers: [Julia, julia-pro, 多重派发, multiple dispatch, 类型稳定, type stability, @code_warntype, BenchmarkTools, Pkg, Project.toml, CUDA.jl, DifferentialEquations.jl, JuliaFormatter, BlueStyle, Flux.jl]
tags: [julia, scientific-computing, performance, multiple-dispatch, numerical, engineering]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [julia, Pkg, JuliaFormatter, BenchmarkTools, JET, Aqua, Revise]
requires: []
related: [cpp-modern-pro, rust-pro, python-performance-optimization, c-language-pro]
combines_with: [guided-statistical-analysis, materials-science-toolkit]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 **Julia 1.10+** 构建科学计算、数值方法、高性能或并行/GPU 应用时使用。
- 典型场景：设计**多重派发**与类型层级；攻克**类型稳定**（type stability）与性能瓶颈；用 BenchmarkTools 做基准、用 Profile 找热点；用 DifferentialEquations.jl / JuMP / Optimization.jl / Flux.jl / Turing.jl 做仿真、优化、ML 与贝叶斯推断；用 PkgTemplates.jl 起新包并配齐测试与 CI。
- 触发词：Julia、多重派发、类型稳定、@code_warntype、BenchmarkTools、Pkg、CUDA.jl、DifferentialEquations。

**不该用的边界**：
- 一次性脚本 / 只问基础语法（`for`、`if` 怎么写）—— 直接写即可，无需本技能。
- 项目无法或不打算引入 Julia（团队栈是 Python/R 且无迁移意图）。
- 纯数据可视化或纯统计建模且与性能/派发设计无关 —— 转通用数据技能。

## 步骤

按「需求 → 设计 → 实现 → 测试 → 调优 → 文档 → 规范化」推进，每步可独立验收：

1. **分析需求**：先问清目标、约束、输入输出；判断是否对**类型稳定**与性能敏感（决定后续是否需要 `@code_warntype` / 基准）。
2. **设计类型层级**：用抽象类型 + 多重派发表达问题域；优先**参数化类型**写泛型；默认 `struct`（不可变）而非 `mutable struct`，仅在必须原地修改时才可变。
3. **类型注解实现**：函数参数/返回值按需注解以提升可读性与编译期特化；避免抽象字段类型导致的类型不稳定（用参数化字段而非 `Any`）。
4. **写测试**：用 `Test.jl` 组织 `@testset`，实现前或同步编写；包级质量用 `Aqua.jl`，静态分析用 `JET.jl`。
5. **基准与调优**：`@btime`/`@benchmark`（BenchmarkTools.jl）测时延与分配，`@code_warntype` 查类型不稳定（红色 `Any`/`Union` 即问题点），`Profile`/`@profile` 找热点；按需上 `Threads.@threads`、`@simd`、CUDA.jl。
6. **写文档**：docstring + 示例；包文档用 `Documenter.jl`，文档内代码块可做 doctest。
7. **规范化**：`JuliaFormatter.jl` 按 **BlueStyle** 统一格式（提交前必跑）。

### 指令（给 Agent 的硬性流程）

- **绝不直接编辑 `Project.toml`** —— 增删依赖一律走 Pkg REPL（`]` 模式）或 `Pkg.jl` API。
- 改完性能相关代码后，**必须**用 `@code_warntype` 复核类型稳定，再用 `@btime` 量化前后差异，用数据而非直觉判断优化是否有效。
- 提交前**必须** `JuliaFormatter.format(".")`（BlueStyle）。
- **避免类型盗用（type piracy）**：不要给「自己不拥有的类型」（外部包定义的类型 + 外部定义的函数）新增方法。
- 新建项目遵循 `PkgTemplates.jl` 标准结构（含 `test/`、CI、Project.toml）。
- 性能等价时**优先函数式 / 不可变**写法。

## 示例

**REPL 包管理（不碰 Project.toml）**
```julia
julia> ]                      # 进入 Pkg 模式
(MyPkg) pkg> add BenchmarkTools JET Aqua
(MyPkg) pkg> test
```

**类型稳定诊断 + 基准**
```julia
using BenchmarkTools
f(x) = x > 0 ? x : 0          # 三元保持同类型，稳定
@code_warntype f(1.0)         # 全绿表示类型稳定；出现红色 Any/Union 需修
@btime f(2.0)                 # 测时延与内存分配
```

**多重派发 + 参数化不可变类型**
```julia
abstract type Shape end
struct Circle{T<:Real} <: Shape   # 参数化，字段具体类型，类型稳定
    r::T
end
struct Square{T<:Real} <: Shape
    side::T
end
area(s::Circle) = π * s.r^2       # 按类型派发，零成本抽象
area(s::Square) = s.side^2
```

**起新包 + 格式化**
```julia
using PkgTemplates
Template(; user="me", plugins=[Git(), GitHubActions(), Codecov()])("MyPkg")
using JuliaFormatter; format(".")     # BlueStyle
```

## 注意事项

- **类型稳定是性能第一原则**：函数返回类型应由输入类型唯一确定；字段勿用抽象类型（`Vector{Any}` ≪ `Vector{Float64}`）。改前改后都过 `@code_warntype`。
- **不可变优先**：`struct` 默认不可变，利于栈分配与编译器优化；`mutable struct` 仅在确需原地改写时使用。
- **绝不手改 Project.toml**：手改易破坏 Manifest 一致性与可复现性，全程走 Pkg。
- **拒绝类型盗用**：破坏组合性、引入隐性冲突；需扩展外部行为时用自有包装类型或 trait（Holy Traits）。
- 基准用 `@btime` 而非 `@time`（后者含编译时间、噪声大）；多线程/GPU 改造前先确认热点确实可并行且收益>开销。
- 启动慢/部署可用 `PackageCompiler.jl` 生成系统镜像；交互开发用 `Revise.jl` 热加载。

## 互见

- related：`cpp-modern-pro` —— 同为高性能系统/数值语言，零成本抽象与内存布局思路相通。
- related：`python-performance-optimization` —— 跨语言性能优化方法论可对照（profiling、向量化、并行）。
- related：`performance-profiler` —— 通用剖析方法学，补充 Profile.jl 之外的定位思路。
- combines_with：`scientific-exploratory-data-analysis` —— Julia 算出结果后做探索性数据分析与可视化。
- combines_with：`statsmodels-statistical-modeling` —— 统计建模方法对照与结果交叉验证。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
