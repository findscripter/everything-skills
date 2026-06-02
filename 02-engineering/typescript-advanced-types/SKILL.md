---
name: typescript-advanced-types
title: TypeScript 高级类型系统
description: 当用 TypeScript 设计类型安全的库/API 客户端/状态机/表单校验，或需要泛型、条件类型、映射类型、模板字面量类型、infer 推断时使用；做可复用类型工具与强类型 API 的设计与落地；不适用于纯运行时逻辑、非 TS 项目、基础语法入门；触发词：TypeScript、泛型、条件类型、映射类型、infer、类型体操、type-safe
domain: 研发/frontend
triggers: [TypeScript, 泛型, 条件类型, 映射类型, 模板字面量类型, infer, 类型体操, type-safe, 类型推断, utility types]
tags: [typescript, type-system, generics, frontend, engineering]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [typescript]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 构建类型安全的库/框架、可复用泛型组件，或需要复杂类型推断逻辑时。
- 设计强类型 API 客户端、表单校验、配置对象、状态机/状态管理时。
- JS 代码库迁移到 TS、想用类型在编译期消灭一类运行时错误时。
- 触发词：TypeScript、泛型、条件类型、映射类型、infer、类型体操、type-safe。

不该用的边界：
- 纯运行时逻辑、算法实现、与类型系统无关的需求 → 直接写业务代码。
- 非 TypeScript 项目，或只问基础语法/入门概念 → 不属于本技能范围。
- 类型已过度复杂拖慢编译时 → 应简化而非继续叠加（见注意事项）。

## 步骤 / 指令

```
1. 明确目标与约束：要保证的不变量是什么？输入/输出类型契约是什么？
2. 选对工具（按场景匹配，勿过度设计）：
   - 复用 + 类型灵活    → 泛型 <T>，必要时加约束 <T extends ...>
   - 按类型分支         → 条件类型 T extends U ? X : Y
   - 从类型中"取出"子类型 → infer（提取返回值/元素/参数/Promise 解包）
   - 批量改写属性       → 映射类型 { [K in keyof T]: ... }，可用 as 重映射键
   - 字符串模式类型     → 模板字面量 `on${Capitalize<T>}`
   - 现成变换           → 内置 Utility Types（见下）
3. 优先让 TS 自动推断；只在推断不出或要约束时显式标注。
4. 用判别联合（discriminated union）+ switch 做类型收窄，替代手写类型断言。
5. 写类型测试验证行为（AssertEqual），把类型当代码一样回归。
6. 开 strict 模式，用 unknown 而非 any，跑 tsc --noEmit 校验。
```

关键约束 / 最佳实践：
- 用 `unknown` 取代 `any`，强制收窄；避免类型断言，改用类型守卫 `value is T`。
- 对象形状优先 `interface`（报错更友好）；联合/复杂类型用 `type`。
- 用 `as const` 保留字面量类型；为复杂类型加 JSDoc 注释。
- 递归类型限制深度；避免深层嵌套条件类型拖慢编译。

## 示例

infer 提取（返回值 / 数组元素 / Promise 解包）：
```typescript
type ReturnOf<T> = T extends (...a: any[]) => infer R ? R : never;
type ElementOf<T> = T extends (infer U)[] ? U : never;
type Awaited1<T> = T extends Promise<infer U> ? U : never;
```

映射类型 + 键重映射（生成 getter）：
```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};
// Getters<{ name: string }> => { getName: () => string }
```

类型守卫做收窄（替代断言）：
```typescript
function isString(v: unknown): v is string {
  return typeof v === "string";
}
```

类型安全事件发射器（映射类型 + 泛型约束）：
```typescript
class TypedEmitter<T extends Record<string, any>> {
  private ls: { [K in keyof T]?: Array<(d: T[K]) => void> } = {};
  on<K extends keyof T>(e: K, cb: (d: T[K]) => void) {
    (this.ls[e] ??= []).push(cb);
  }
  emit<K extends keyof T>(e: K, d: T[K]) {
    this.ls[e]?.forEach(cb => cb(d));
  }
}
```

判别联合 + 收窄：
```typescript
type AsyncState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function handle<T>(s: AsyncState<T>) {
  switch (s.status) {
    case "success": return s.data;   // 收窄为 T
    case "error":   return s.error;  // 收窄为 string
    case "loading": return null;
  }
}
```

类型测试（把类型当回归用例）：
```typescript
type AssertEqual<T, U> =
  [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type _t1 = AssertEqual<ReturnOf<() => number>, number>; // true
```

常用内置 Utility Types 速查：
```
Partial<T> Required<T> Readonly<T> Pick<T,K> Omit<T,K>
Exclude<T,U> Extract<T,U> NonNullable<T> Record<K,T> ReturnType<T> Parameters<T>
```

## 注意事项

- 滥用 `any` 等于放弃类型系统；忽略 strict null 检查会埋运行时雷。
- 类型过于复杂会显著拖慢编译——优先用简单类型，缓存中间类型，限制递归深度。
- 忘记 `readonly` 会放任意外修改；漏用判别联合会错失收窄机会。
- 警惕循环类型引用导致的编译器报错；处理空数组、null 等边界。
- 本技能只覆盖编译期类型设计，不替代运行时校验/测试/真机验证。
- 进阶资料：TypeScript Handbook、type-challenges、TypeScript Deep Dive。

## 互见

- requires：无。
- related：`code-reviewer`（审查 TS 改动时，类型契约与收窄正确性是审查维度之一）。
- combines_with：无。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
