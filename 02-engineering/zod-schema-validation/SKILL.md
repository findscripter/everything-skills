---
name: zod-schema-validation
title: Zod 类型安全数据校验
description: 当用 TypeScript 定义表单/API 入参、环境变量或运行时数据校验时使用；做用 Zod 定义 Schema 并产出经 safeParse 校验后的类型安全数据与可序列化错误；不适用于纯静态类型标注（用 interface）或非 TS 运行时校验；触发词：zod、schema 校验、z.infer、safeParse、表单校验、环境变量校验
domain: 研发/frontend
triggers: [zod, schema 校验, 数据校验, z.infer, safeParse, 表单校验, 环境变量校验, 类型推导, refine 跨字段校验, React Hook Form 校验, Next.js Server Action 校验, coerce 类型转换]
tags: [zod, typescript, 数据校验, schema, 前端, 类型安全, react-hook-form, nextjs, 表单]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [typescript, zod, react-hook-form, nextjs]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适合：
- 为表单或 API 入参定义 TypeScript 运行时校验 Schema。
- 校验环境变量（`process.env`），做到启动即失败（fail-fast）。
- 集成 React Hook Form（`@hookform/resolvers/zod`）。
- 从运行时 Schema 推导静态类型，避免手写重复 `interface`。
- 编写跨字段校验、异步校验等复杂规则。
- 转换输入数据（字符串转 Date / 数字、布尔归一化）。
- 统一错误信息格式以供前端消费。

不该用：
- 纯静态类型标注、无运行时校验需求时，直接写 `interface`/`type` 即可，引入 Zod 是过度设计。
- 非 TypeScript 项目，或运行时校验已由后端框架（如管道、DTO 装饰器）统一处理时。
- 替代环境专属校验、测试或专家评审；缺少输入约束、权限或成功标准时应先澄清。

核心理念：Zod 让你只定义一次 Schema，静态类型由 `z.infer` 自动推导，消除「写 interface 又写校验」的重复。它本质是「解析（parse）而非仅校验」——`parse`/`safeParse` 返回干净且带类型的数据，并默认剥离未知字段。

## 步骤

1. 定义 Schema：用 `z.object` 组合 `z.string()`/`z.number()` 等原语；入参来自 `FormData`/`URLSearchParams` 时用 `z.coerce.*` 自动转型。
2. 推导类型：`export type T = z.infer<typeof Schema>`，全程复用，不再手写 interface。
3. 校验数据：优先 `safeParse`，靠 TS 控制流收窄分支处理成功/失败，避免散落的 try/catch。
4. 定制规则：单字段约束用 `.min/.max/.regex` 带 message；跨字段或自定义逻辑用 `.refine`/`.superRefine`，并务必传 `path` 把错误挂到正确字段。
5. 输出错误：对 `ZodError` 用 `.flatten()` 或 `.format()` 得到可序列化、人类可读的错误，交给前端。

## 指令

- 取数据后立即在边界处校验（API 入口、Server Action、表单 resolver），不要让未校验数据流入业务逻辑。
- `safeParse` 优先于 `parse`；只有在「失败即应崩溃」的场景（如环境变量加载）才用 `parse`。
- 创建与更新需求不同时定义独立 Schema，不要只靠 `.partial()` 复用。
- 递归结构用 `z.lazy(() => NodeSchema)`，并显式声明基础类型，避免「类型实例化过深」报错。

## 示例

原语与类型推导：

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  role: z.enum(["ADMIN", "USER", "GUEST"]).default("USER"),
  age: z.number().min(18).optional(),
  website: z.string().url().nullable(),
  tags: z.array(z.string()).min(1),
});

// 直接从 Schema 推导类型，无需另写 interface User
export type User = z.infer<typeof UserSchema>;
```

safeParse 优于 parse（无需 try/catch，TS 自动收窄）：

```typescript
const schema = z.string().email();
const result = schema.safeParse("user@example.com");

if (!result.success) {
  console.log(result.error.format()); // 失败分支
} else {
  const validEmail = result.data; // 类型为 string
}
```

跨字段校验（注意 `path`）：

```typescript
const formSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"], // 把错误挂到具体字段
});
```

Next.js Server Action（FormData 必须 coerce）：

```typescript
"use server";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().optional(),
  published: z.coerce.boolean().default(false), // checkbox "on" -> true
});

export async function createPost(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validated = createPostSchema.safeParse(rawData);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }
  const { title, content, published } = validated.data;
  return { success: true };
}
```

环境变量 fail-fast：

```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  API_KEY: z.string().min(10),
});
const env = envSchema.parse(process.env); // 缺失或非法立即报错
export default env;
```

React Hook Form：用 `zodResolver(loginSchema)` 接入 `useForm`，表单值类型用 `z.infer<typeof loginSchema>`，错误从 `formState.errors` 读取。

## 注意事项

- `z.coerce.boolean()` 的坑：它会把 `"false"`/`"off"` 等非空字符串转成 `true`，需要时用自定义 preprocess 处理。
- Schema 就近放在使用它的组件或 API 路由旁，保持关注点分离。
- `.optional()` 只允许 `undefined`，不放过空字符串。若空串代表「无值」，用 `.or(z.literal(""))` 或 `z.string().transform(v => v === "" ? undefined : v).optional()`。
- `.transform()` 会改变推导出的类型（如 `string -> number`），先 transform 再 refine 校验结果。
- i18n 可用 `z.setErrorMap` 设置全局自定义错误映射。
- 本技能仅适用于明确匹配上述范围的任务，不替代环境专属测试与专家评审。

## 互见

- React Hook Form 表单管理与提交流程。
- Next.js Server Actions / App Router 数据流。
- TypeScript 类型推导与控制流收窄实践。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
