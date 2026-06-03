---
name: fp-ts-pragmatic-guide
title: fp-ts 实用函数式编程
description: 当用 TypeScript 处理可空值/错误/异步并想用 fp-ts 写更清晰函数式代码、或把命令式重构为函数式时使用；产出 pipe/Option/Either/map/flatMap 的 80/20 实用模式与前后对照重构方案；不适用于简单可选链(?.)、热点性能路径或团队不熟 FP 的场景。触发词：fp-ts、函数式编程、pipe、Option、Either、TaskEither
domain: 研发/backend
triggers: [fp-ts, 函数式编程, functional programming, pipe, Option, Either, TaskEither, tryCatch, flatMap, 可空值处理, 错误即值, 命令式重构函数式]
tags: [研发, fp-ts, TypeScript, 函数式编程, Option, Either, TaskEither, 重构]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [typescript, fp-ts]
requires: []
related: [fp-ts-refactor, typescript-advanced-types, javascript-modern-pro, error-handling-patterns]
combines_with: [fp-ts-refactor, zod-schema-validation, typescript-advanced-types]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# fp-ts 实用函数式编程

> 黄金法则：**如果函数式让代码更难读，就别用。** FP 是工具不是信仰——有帮助才用。

## 何时使用

适用：
- 刚上手 fp-ts，需要可落地的最小模式集，而非范畴论
- 用 TypeScript 处理可空值、可预期错误、可失败的异步操作
- 想把嵌套调用 / 中间变量 / try-catch / 回调地狱重构成线性可读的链式流程

不该用（负边界）：
- **简单可空取值**：用语言内置的可选链就够——`user?.address?.city ?? 'Unknown'`，别套四层 `O.fromNullable`。
- **简单循环 / 需要提前 return 的查找**：普通 `for` 更直白。
- **热点性能路径**：fp-ts 会产生中间结构，求和/大数组遍历用命令式 `for` 更快。
- **团队不熟 FP**：只有你看得懂的代码不是好代码。已有的 `async/await + try-catch` 团队读得懂就别强推 `TaskEither`。

## 步骤

决策流程（自上而下问自己）：
1. 同一份数据上有 **3+ 步变换**，或在给一次性中间变量起名 → 用 `pipe` 串成阅读顺序。
2. 值可能 null/undefined 且需链式深取 → 用 `Option`（`O.fromNullable` → `O.flatMap` → `O.getOrElse`）。
3. 操作有**可预期失败**（解析、校验）→ 返回 `Either` 把错误编进类型，别 `throw`。
4. 容器内的值要变换但不想先拆出来 → `map`（`O.map` / `E.map` / `A.map` 同一概念）。
5. 多步骤**逐步可能失败、一步失败则整体失败** → `flatMap` 串联。
6. 异步且可失败 → 升级到 `TaskEither`（替代 `Promise + try/catch`）。
7. 写完回头问：**「初级工程师能看懂吗？」** 看不懂就退回更直白的写法。

## 指令

口语对照（记住语义即可，不必背 API）：
- `O.fromNullable(x)` = 「包一下，null/undefined 视为『没有』」
- `O.flatMap(fn)` = 「有东西就接着做」；`O.getOrElse(() => d)` = 「拆出来，没有就用默认值」
- `E.right(v)` = 「成功，值是 v」；`E.left(e)` = 「失败，原因是 e」
- `E.tryCatch(fn, onErr)` = 「试着跑 fn，出错走 onErr」；`E.fold(onLeft, onRight)` = 「错走这边，对走那边」
- `pipe(x, f1, f2, f3)` = 「先 f1 再 f2 再 f3」

升级路线（先吃透上面再碰）：`TaskEither`（可失败异步）→ `Validation`（收集**全部**错误而非首个即停）→ `Reader`（无类依赖注入）→ `Do` 记法（多绑定更干净）。基础模式能覆盖 80% 真实场景，别急。

## 示例

pipe 串联可读流程：
```typescript
import { pipe } from 'fp-ts/function'
// 内向外难读：format(validate(parse(input)))  ❌
const result = pipe(input, parse, validate, format)   // ✅ 线性
```

Option 链式深取（替代多层 null 判断）：
```typescript
import * as O from 'fp-ts/Option'
const getUserCity = (user: User | null): string =>
  pipe(
    O.fromNullable(user),
    O.flatMap(u => O.fromNullable(u.address)),
    O.flatMap(a => O.fromNullable(a.city)),
    O.getOrElse(() => 'Unknown'),
  )
```

Either 把错误变成值（替代 throw）：
```typescript
import * as E from 'fp-ts/Either'
function parseAge(input: string): E.Either<string, number> {
  const age = parseInt(input, 10)
  if (isNaN(age)) return E.left('Invalid age')
  if (age < 0)    return E.left('Age cannot be negative')
  return E.right(age)
}
const r = parseAge(userInput)
E.isRight(r) ? console.log(`Age is ${r.right}`) : console.log(`Error: ${r.left}`)
```

flatMap 串联可失败步骤（任一步失败则整体失败）：
```typescript
const getValidEmail = (input: string): E.Either<string, string> =>
  pipe(
    parseJSON(input),            // E.tryCatch(() => JSON.parse(input), () => 'Invalid JSON')
    E.flatMap(extractEmail),     // 缺字段 → E.left('No email field')
    E.flatMap(validateEmail),    // 不含 @ → E.left('Invalid email format')
  )
```

即得快赢（今天就能改）：
```typescript
// try-catch 一行化
const config = pipe(E.tryCatch(() => JSON.parse(raw), () => 'parse error'), E.getOrElse(() => def))
// undefined 返回 → Option，强制调用方处理缺失
const findUser = (id: string): O.Option<User> => O.fromNullable(users.find(u => u.id === id))
// 用 _tag 联合做无类的结构化错误，可 switch 模式匹配
const NotFound = (id: string) => ({ _tag: 'NotFound' as const, id })
```

回调地狱 → TaskEither：
```typescript
import * as TE from 'fp-ts/TaskEither'
const loadData = (id: string) =>
  pipe(
    fetchUser(id),
    TE.flatMap(user => pipe(fetchPosts(user.id), TE.map(posts => ({ user, posts })))),
    TE.flatMap(({ user, posts }) =>
      pipe(fetchComments(posts[0].id), TE.map(comments => ({ user, posts, comments })))),
  )
const result = await loadData('123')()                 // TaskEither 要 () 触发执行
pipe(result, E.fold(handleError, render))
```

## 注意事项

- **可读性优先于「聪明」**：`flow(prop('status'), equals('active'))` 这类点自由风格常常过度。中间地带最好——`pipe` 保留链式，但回调写成显式箭头函数 `item => item.status === 'active'`。
- **`TaskEither` 是惰性的**：`loadData(id)` 只是构造 task，必须再调 `()` 才执行。
- **Either 默认首错即停**；要收集全部校验错误得用 `Validation`，别用普通 `E.flatMap` 硬凑。
- **别为了 FP 而 FP**：可选链、`for` 早退、热点循环用原生语言特性，性能与可读性都更好。
- 速查表：包可空 `O.fromNullable` / 缺省 `O.getOrElse` / 有则变 `O.map` / 链式可空 `O.flatMap` / 成功 `E.right` / 失败 `E.left` / 包裹抛错 `E.tryCatch` / 分支处理 `E.fold` / 串联 `pipe`。

## 互见

- related：`typescript-strict-typing-patterns` —— 类型层面把错误与缺失显式化
- related：`api-design-principles` —— 用 Either/Result 设计可失败接口
- combines_with：`adversarial-code-reviewer` —— 重构后对可读性与边界做对抗式评审

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可证），原技能 `fp-ts-pragmatic`（源 whatiskadudoing/fp-ts-skills），适配重写为中文「技能大典」条目。domain：研发/misc。
