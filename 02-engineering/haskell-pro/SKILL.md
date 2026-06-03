---
name: haskell-pro
title: Haskell 函数式工程
description: 当用 Haskell 构建强类型纯函数式服务/库/系统，或攻克高级类型系统、纯度边界、并发与性能优化时使用；做类型驱动建模、STM/async 并发、解析与属性测试齐备的可编译 Haskell 代码；不适用于一次性脚本、只问基础语法、无法引入 Haskell 或纯运行时性能调优场景；触发词：Haskell、GADT、typeclass、STM、Monad、Aeson、QuickCheck、Cabal。
domain: 研发/backend
triggers: [Haskell, haskell-pro, GADT, type family, typeclass, newtype, STM, async, Monad, Aeson, Megaparsec, QuickCheck, Hspec, Cabal, Stack, 纯函数]
tags: [haskell, functional-programming, type-system, concurrency, engineering]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [ghc, cabal, stack, ghci, hlint]
requires: []
related: [fp-ts-pragmatic-guide, scala-pro, elixir-otp-pro, rust-pro]
combines_with: [backend-architecture-patterns, error-handling-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 Haskell 构建强类型纯函数式的服务、库或高可信系统，需要把领域不变量编译期化时使用。
- 攻克高级类型系统（GADTs、type family、phantom type、newtype）、纯度边界划分、typeclass/代数抽象设计，或要做 STM/async 并发与严格性/融合性能优化时使用。
- 触发词：Haskell、GADT、typeclass、STM、Monad、Aeson、Megaparsec、QuickCheck、Cabal/Stack。

不该用的边界：
- 只要一次性脚本、要热改 / 动态运行时 → 选 Python 等脚本语言，别上 Haskell。
- 只是查基础语法（`case`/`do`/列表推导怎么写）→ 直接给语法即可，不必启用体系化方法。
- 技术栈无法引入 Haskell（团队/部署约束）→ 不适用。
- 纯性能剖析 / 纯依赖审计另有专技 → 见「互见」。

## 步骤 / 指令

```
1. 明确约束：纯度边界（IO 隔离到哪一层）、性能目标、并发模型（STM/async/轻量线程）、目标平台与 GHC 版本。
2. 类型驱动建模：用 newtype + 不变量、phantom type、必要时 GADT/type family 把领域规则编译期化；
   优先 total function，给出 Maybe/Either 而非 head/fromJust 这类 partial function。
3. 隔离副作用：纯逻辑与 effectful 代码分层；IO 收束到显式边界，业务核心保持可纯测。
4. 抽象克制：只在能提升清晰度时引入 typeclass / 代数设计，并尊重其 law；语言扩展按需开、逐条说明用途。
5. 实现 + 测试同步：Hspec 写示例测试，QuickCheck 写属性测试驱动不变量；示例尽量 GHCi 可跑或可直接编译。
6. 并发用 STM 做可组合事务，async 管理并发任务，配 exception-safe 组合子（bracket/finally）防资源泄漏。
7. 仅在热点处优化：先 profiling（-prof / +RTS -p）定位，再上 strictness（BangPatterns/seq）、避免 thunk 堆积、利用 fusion；不要凭感觉提前优化。
8. 过质量门：cabal build / stack build、hlint、测试全绿；模块保持小而显式、依赖卫生（pin 版本）。
```

核心规则：
- 让类型系统替你做正确性检查——能编译期保证就不要运行时判断。
- 纯函数优先，把 IO 推到边界；杜绝 partial function（`head`/`fromJust`/不完整 `case`）进生产，改用 total、安全替代。
- typeclass 与代数抽象只在增加清晰度时用，并遵守其 law（law-driven development）。
- 语言扩展宁少勿滥，每开一个都说明为什么需要它。
- 严格性问题靠 profiling 定位再处理；惰性默认是优势也是 space leak 的来源。

## 示例

最小工程骨架与质量门命令：

```bash
cabal init --non-interactive -p mysvc   # 或 stack new mysvc
cabal build
cabal repl                              # GHCi 交互
cabal test
hlint src/                              # 风格与反模式 lint
cabal build --enable-profiling && cabal run -- +RTS -p   # 热点剖析
```

用类型把不变量编译期化（newtype + phantom type）：

```haskell
{-# LANGUAGE GeneralizedNewtypeDeriving #-}
newtype UserId = UserId Int deriving (Eq, Ord, Show)
newtype Email  = Email Text  deriving (Eq, Show)
-- 构造器不导出，只暴露经校验的 smart constructor，保证「类型存在即合法」
mkEmail :: Text -> Either Text Email
mkEmail t | "@" `T.isInfixOf` t = Right (Email t)
          | otherwise           = Left "invalid email"
```

total function 取代 partial function：

```haskell
-- 不要：head xs（空列表会 panic）
safeHead :: [a] -> Maybe a
safeHead []      = Nothing
safeHead (x:_)   = Just x
```

STM 可组合事务 + async 并发：

```haskell
import Control.Concurrent.STM
import Control.Concurrent.Async (mapConcurrently)

transfer :: TVar Int -> TVar Int -> Int -> STM ()
transfer from to n = do
  modifyTVar' from (subtract n)
  modifyTVar' to   (+ n)
-- atomically (transfer a b 100)  -- 整个事务原子提交
-- mapConcurrently fetchUrl urls  -- 并发抓取并聚合结果
```

Aeson 解析 / QuickCheck 属性测试：

```haskell
import Data.Aeson (FromJSON, decode)
import Test.QuickCheck

prop_reverseTwice :: [Int] -> Bool
prop_reverseTwice xs = reverse (reverse xs) == xs
-- quickCheck prop_reverseTwice
```

典型请求样例（可直接当提示词）：
- 「用 GADT 给一个表达式语言设计类型安全的求值器」
- 「把这段含 partial function 的代码改成 total、可编译」
- 「用 STM 实现一个并发安全的银行转账」
- 「为这个 JSON API 写 Aeson 解析 + QuickCheck 属性测试」

## 注意事项

- 别让 partial function（`head`/`tail`/`fromJust`/不完整模式匹配）进生产；用 `Maybe`/`Either`/NonEmpty 与完整匹配。
- 惰性会埋 space leak：累加器、长链 fold 用严格版本（`foldl'`、`modifyTVar'`、`BangPatterns`），先 profiling 再调严格性。
- 语言扩展不是越多越好——为炫技开 GADTs/TypeFamilies 会抬高维护成本，按需启用并注释原因。
- 并发资源务必 exception-safe：用 `bracket`/`finally`/`withAsync`，别裸 `forkIO` 后失管。
- typeclass 实例要满足其 law，否则会破坏依赖这些 law 的组合子；law 不成立时改用普通函数。
- 输出不能替代环境内的实测、编译与评审；缺关键约束（运行时/平台/并发模型）时先发问再动手。

## 互见

- requires：无。
- related：`performance-profiler`（系统化性能剖析与火焰图，本技能聚焦写 Haskell 与严格性优化本身，深度调优转交它）；`backend-architecture-patterns`（服务分层与架构取舍，先定架构再用本技能落地 Haskell 实现）。
- combines_with：`code-reviewer`（Haskell 代码写完后做正确性与质量审查）；`dependency-auditor`（对 Cabal/Stack 依赖做许可证与已知漏洞专项体检，补足依赖卫生）。

---
采编自 sickn33/antigravity-awesome-skills（源技能 `haskell-pro`，MIT 许可）。
