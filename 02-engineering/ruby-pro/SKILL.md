---
name: ruby-pro
title: Ruby 进阶开发
description: 当用 Ruby/Rails 写惯用代码、做元编程 DSL、开发 gem、写测试或做性能优化时使用；产出符合社区惯例的 Ruby 代码、Rails MVC 应用、RSpec/Minitest 测试、gem 规范与 benchmark-ips 基准；不适用于其他语言运行时、仅需基础语法解释、或无法改动 Gemfile 与工具链的场景；触发词：Rails、ActiveRecord、元编程、RSpec、RuboCop、gem 开发
domain: 研发/backend
triggers: [Ruby 惯用代码, Rails 模式, ActiveRecord, 元编程, mixin 模块, DSL 设计, RSpec 测试, Minitest, RuboCop, gem 开发, benchmark-ips 性能, 遗留 Ruby 重构]
tags: [ruby, rails, 元编程, gem, 测试, 性能优化, 研发]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [ruby, rails, rspec, minitest, rubocop, benchmark-ips, bundler, ruby-prof]
requires: []
related: [php-pro, golang-pro, java-modern-pro, rust-pro]
combines_with: [rest-api-endpoint-builder, error-handling-patterns, code-reviewer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 Ruby/Rails 写惯用、可维护的代码，或对既有 Ruby 工程做架构与代码质量评审。
- 设计元编程能力（模块/mixin、DSL），用块与枚举器抽象复杂逻辑。
- 开发 gem 并管理依赖与版本；用 RSpec/Minitest 补测试；做性能剖析与优化。

不该用（负边界）：
- 需要其他语言或运行时。
- 只需基础 Ruby 语法解释。
- 无法改动 Gemfile、`.rubocop.yml` 或工具链（代码生成与优化无从落地）。

## 步骤

1. 对齐前提：确认 Ruby/Rails 版本、目标（功能/重构/调优）、约束与必需输入。
2. 选型：依据场景选惯用法——元编程做 DSL、块与枚举器做迭代、组合优先于继承。
3. 实现：遵循 Ruby/Rails 惯例与命名，异常用 `rescue/ensure` 显式处理，配套 RSpec/Minitest。
4. 优化：先测量后优化——用 benchmark-ips / ruby-prof 定位热点再调；可读性优先于性能。
5. 验收：跑 RuboCop 静态检查与测试套件，输出重构建议；相关时附 Gemfile 与 `.rubocop.yml`。

## 指令

- 拥抱 Ruby 表达力：善用块、`Enumerable`、关键字参数；元编程（`define_method`、`method_missing`、`Module#included`）服务于清晰的 DSL，而非炫技。
- 异常处理显式化：`begin/rescue/ensure` 收尾资源，按具体异常类捕获，不裸 `rescue`。
- 可读性优先、性能其次：只在有 benchmark 数据时调优，禁止凭直觉。
- 测试用 RSpec 或 Minitest，配 fixtures/mocks；Rails 走 MVC，胖模型瘦控制器。
- 关键命令：
  - 运行测试：`bundle exec rspec` / `bundle exec rake test`
  - 静态检查与自动修复：`bundle exec rubocop` / `rubocop -a`
  - 性能基准：`require "benchmark/ips"` → `Benchmark.ips { |x| x.report(...) ; x.compare! }`
  - 剖析热点：`ruby-prof` / `stackprof`
  - gem 脚手架与发布：`bundle gem <name>` → 在 `.gemspec` 用语义化版本 → `gem build` / `gem push`

## 示例

用 `Benchmark.ips` 对比两种实现：

```ruby
require "benchmark/ips"

Benchmark.ips do |x|
  x.report("map")     { (1..1000).map { |i| i * 2 } }
  x.report("each_with_object") do
    (1..1000).each_with_object([]) { |i, a| a << i * 2 }
  end
  x.compare!
end
```

典型请求：
- "把这段遗留 Ruby 重构成惯用写法并补 RSpec"
- "为这个配置层设计一个简洁的 DSL"
- "用 benchmark-ips 定位并优化这段循环的瓶颈"
- "搭一个带语义化版本和测试的 gem 骨架"

## 注意事项

- 输出不能替代环境内的实测、测试与专家评审；落地前务必跑通测试套件与 RuboCop。
- 元编程会牺牲可读性与调试性，仅在收益明确时使用；优先简单方案。
- 输入、权限、安全边界或验收标准缺失时，先停下来澄清再动手。
- 仅在任务确实落在上述范围内时使用本技能。

## 互见

- Rails 后端架构、ActiveRecord 查询优化相关技能。
- 通用性能剖析与遗留代码现代化方法论。
- 测试策略与覆盖率（RSpec/Minitest）相关技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
