---
name: fp-ts-refactor
title: 命令式 TS 重构为 fp-ts
description: 当把命令式 TypeScript 代码（try/catch、null 检查、回调、类 DI、循环、Promise 链）迁移到 fp-ts 函数式范式时使用；产出 Either/Option/Task/Reader 等价改写、组合管线与渐进迁移路径；不适用于简单同步代码、性能热点循环、第三方接口边界与团队不熟悉 fp-ts 的场景。触发词：fp-ts、TaskEither、Either/Option、函数式重构
domain: 研发/backend
triggers: [fp-ts 重构, 命令式转函数式, try/catch 转 Either, null 转 Option, 回调转 Task, 类 DI 转 Reader, Promise 链转 TaskEither, pipe flatMap 组合, TaskEither 迁移]
tags: [fp-ts, typescript, 重构, 函数式编程, either, option, taskeither, reader, 迁移]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Grep, Glob, Bash]
requires: []
related: [fp-ts-pragmatic-guide, typescript-advanced-types, javascript-modern-pro, error-handling-patterns]
combines_with: [typescript-advanced-types, error-handling-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 正在把现有命令式 TypeScript 代码库逐步迁移到 fp-ts 函数式范式。
- 任务核心是把 `try/catch`、null 检查、回调、类式依赖注入（DI）、命令式循环、`Promise` 链转换成函数式等价物。
- 你需要的是迁移策略与权衡取舍，而非孤立的 fp-ts 用法示例。

不该用（保持命令式更好）：

- 简单同步纯函数（如 `formatName`），套 `pipe` 只增加复杂度无收益。
- 性能热点循环：fp-ts 的 `A.map`/`A.filter` 会产生中间数组，处理百万级元素时保留 `for` 循环。
- 第三方库接口边界（Express 中间件等）：只在边界处转换，内部保持库要求的形态。
- 团队不熟悉 fp-ts、或一次性 null 检查（`user?.name ?? 'x'` 已够），或错误类型无所谓（反正要 throw/log）的场景。
- 测试代码：以可读为先，不必函数式。

## 步骤 / 指令

通用迁移流程（以 try/catch → Either 为例，其它范式同构）：

1. 确定错误类型：列出可能发生的错误，定义错误类型（推荐带 `_tag` 的联合类型）。
2. 改返回类型：把 `T` 改为 `Either<E, T>`（异步用 `TaskEither<E, T>`）。
3. 替换 `throw new Error(...)` 为 `E.left(...)`；替换 `return value` 为 `E.right(value)`。
4. 删除 `try/catch` 块。
5. 用 `pipe` + `E.flatMap`（异步 `TE.flatMap`）串联各步，错误自动短路传播。
6. 在系统边界用 `E.match`/`O.match`/`getOrElse`/`toNullable` 与非 fp 代码对接。

null → Option：用 `O.fromNullable` 在边界包裹；返回类型 `T | null` 改 `Option<T>`；用 `O.map`/`O.flatMap`/`O.filter` 取代 if 判空。需要错误信息时 `E.fromOption(() => err)` 升级为 Either。

回调 → Task：优先改用 `fs/promises` 等 Promise API，再用 `TE.tryCatch` 包裹；多任务用 `A.traverse(TE.ApplicativePar)`（并行，遇错即停）或 `TE.ApplicativeSeq`（顺序）。

类 DI → Reader：把依赖收敛为 `AppEnv` 接口，服务函数返回 `ReaderTaskEither<AppEnv, E, A>`，用 `RTE.ask` 取环境、`RTE.flatMapTaskEither` 调依赖；运行时注入真实/测试 env：`updateEmail(id, email)(env)()`。

循环 → 函数式：`for` → `A.map`/`A.filter`/`A.reduce`，单遍聚合可用 `A.foldMap(monoid)`；嵌套循环 → `A.flatMap` + `A.uniq(Eq)`；`while` → 递归辅助函数或 `RA.unfold`。

Promise 链 → TaskEither：`.then` → `TE.map`/`TE.flatMap`，`.catch` → `TE.orElse`/`TE.mapLeft`，条件抛错 → `TE.filterOrElse`，`Promise.all` → `A.traverse(TE.ApplicativePar)`。

渐进采用策略：① 从边界（API/DB/文件/输入校验）起步；② 建桥接函数双向转换；③ 按模块迁移、先内部后公开 API；④ 类型驱动（先改签名让编译器标出所有调用点）；⑤ 用测试当文档。

## 示例

同步 try/catch → Either（错误进类型，组合自动短路）：

```typescript
import * as E from 'fp-ts/Either';
import * as J from 'fp-ts/Json';
import { pipe } from 'fp-ts/function';

const parseJSON = (input: string): E.Either<Error, unknown> =>
  pipe(J.parse(input), E.mapLeft((e) => new Error(`Invalid JSON: ${e}`)));

const validateUser = (data: unknown): E.Either<Error, User> => {
  if (!data || typeof data !== 'object') return E.left(new Error('Data must be an object'));
  const obj = data as Record<string, unknown>;
  if (typeof obj.name !== 'string') return E.left(new Error('Name is required'));
  if (typeof obj.age !== 'number') return E.left(new Error('Age must be a number'));
  return E.right({ name: obj.name, age: obj.age });
};

const processUserInput = (input: string): E.Either<Error, User> =>
  pipe(parseJSON(input), E.flatMap(validateUser));
```

异步编排用 `TE.Do`/`TE.bind` 累积上下文，执行时注意双重调用 `await getUserWithPosts('123')()`：

```typescript
const getUserWithPosts = (id: string): TE.TaskEither<Error, { user: User; posts: Post[] }> =>
  pipe(TE.Do, TE.bind('user', () => fetchUser(id)), TE.bind('posts', () => fetchUserPosts(id)));
```

可复用桥接（命令式 ↔ fp-ts 之间过渡）：

```typescript
const tryCatchSync = <A>(f: () => A): E.Either<Error, A> =>
  E.tryCatch(f, (e) => (e instanceof Error ? e : new Error(String(e))));
const fromPromise = <A>(p: Promise<A>): TE.TaskEither<Error, A> =>
  TE.tryCatch(() => p, (e) => (e instanceof Error ? e : new Error(String(e))));
```

命令式 → fp-ts 速查表（节选）：

| 命令式 | fp-ts 等价 |
|---|---|
| `try/catch` | `E.tryCatch()` / `TE.tryCatch()` |
| `throw` / `return` | `E.left()` / `E.right()`（TE 同理） |
| `if (x === null)` / `x ?? d` | `O.fromNullable()` / `O.getOrElse()` |
| `x?.prop` | `O.map()` / `O.flatMap()` |
| `array.map/filter/reduce/find` | `A.map/filter/reduce(foldMap)/findFirst` |
| `Promise.then/catch` | `TE.map`+`flatMap` / `TE.orElse`+`mapLeft` |
| `Promise.all` | `A.traverse(TE.ApplicativePar)` |
| `new Class(deps)` | `R.asks()` / `RTE.ask()` |
| `for...of` / `while` | `A.map`+`reduce` / 递归、`unfold()` |

## 注意事项

常见坑（源中 Pitfalls，务必规避）：

- 忘记运行 Task：`fetchData()` 仍是 Task，结果需 `await fetchData()()` 双重调用。
- 不要中途逃出 fp-ts 生态：拿到 `Either` 就 `E.isLeft` 判断后 `throw`，应改用 `TE.fromEither` 留在管线内。
- 该用 `flatMap` 却用 `map`：返回 monad 的函数用 `map` 会得到嵌套 `Either<E, Either<E, A>>`，用 `flatMap` 摊平。
- 丢失错误上下文：`TE.tryCatch` 第二参要保留 `reason`（`(reason) => new Error(...${reason})`），更佳用带 `_tag` 的类型化错误。
- 滥用 `fromNullable`：简单取值 `user?.name ?? 'x'` 即可，仅在多步链式时才用 Option。
- 务必处理 Left/None：禁止 `(result as E.Right<User>).right` 之类不安全断言，用 `E.getOrElse`/`E.match`。

迁移是过程而非目的：从小处改起、保持务实（并非一切都要函数式）、类型驱动、充分测试、沉淀团队模式、复核收益。目标是更可维护、类型安全的代码，而非为函数式而函数式。

## 互见

- 研发/misc 下其它 TypeScript / 函数式相关条目。
- fp-ts 官方模块文档：`Either` / `Option` / `Task` / `TaskEither` / `Reader` / `ReaderTaskEither` / `Array` / `Monoid`。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
