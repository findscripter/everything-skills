---
name: nestjs-expert
title: NestJS 企业架构
description: 当用 NestJS 构建或排障企业级 Node.js 后端时使用；做模块/依赖注入设计、守卫拦截器管道、TypeORM/Mongoose 集成、Passport+JWT 鉴权、Jest/Supertest 测试与常见报错诊断并产出生产级代码；不适用于纯 TS 类型、纯 SQL 调优、前端或非 NestJS 框架。触发词：NestJS、依赖注入、forwardRef、Guard、Interceptor、TypeORM、Passport JWT
domain: 研发/backend
triggers: [NestJS, Nest.js, 依赖注入, DI, forwardRef, 循环依赖, Module, Guard, Interceptor, Pipe, Exception Filter, TypeORM, Mongoose, Passport, JWT, @nestjs/testing, Nest can't resolve dependencies, Unknown authentication strategy]
tags: [nestjs, nodejs, typescript, dependency-injection, typeorm, mongoose, jwt, passport, testing, 后端, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob, Bash, Edit, Write]
requires: []
related: [fastapi-async-api, trpc-typesafe-api, rest-api-endpoint-builder, graphql-architect]
combines_with: [prisma-orm-expert, zod-schema-validation, bullmq-job-queue]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 用 NestJS 设计企业级架构：模块边界、依赖注入、Provider 作用域、动态/全局模块、自定义注入 Token。
- 排查 NestJS 经典报错：`Nest can't resolve dependencies`、循环依赖、`Unknown authentication strategy 'jwt'`、`secretOrPrivateKey must have a value`、TypeORM `Unable to connect`。
- 实现请求生命周期组件：中间件、守卫（Guard）、拦截器（Interceptor）、管道（Pipe）、异常过滤器（Exception Filter）。
- 集成数据库：TypeORM（仓储模式、实体、迁移、多连接）或 Mongoose（Schema、Model 注入）。
- 实现鉴权：Passport 策略 + `@nestjs/jwt`，守卫保护路由，角色/对象级授权。
- 写测试：`@nestjs/testing` + Jest（单测、Mock Provider）+ Supertest（e2e）。

不该用（负边界）：

- 纯 TypeScript 类型系统问题 → 切到 TS 类型专家。
- 纯数据库查询优化（与 NestJS 无关）→ 切到数据库专家。
- Node.js 运行时本身问题、前端 React 问题 → 切到对应专家。
- 目标框架非 NestJS（Express 裸用、Fastify 裸用、Koa 等）。

## 步骤

1. 若有更专精的领域更合适，先建议切换并停止（见上「负边界」）。
2. 先用内部工具探测项目（Read / Grep / Glob）：确认 NestJS 版本、模块结构、ORM、鉴权与测试栈。
3. 识别既有架构模式与命名约定，匹配项目风格而非另起一套。
4. 按 NestJS 最佳实践给出方案。
5. 按顺序验证：类型检查 → 单元测试 → 集成测试 → e2e 测试。

探测命令（一次性诊断，避免 watch/serve 长驻进程）：

```bash
test -f nest-cli.json && echo "Nest CLI 项目"
grep -q "@nestjs/core" package.json && echo "已装 NestJS"
grep "@nestjs/core" package.json    # 看版本
grep -q "@nestjs/typeorm" package.json && echo "TypeORM"
grep -q "@nestjs/mongoose" package.json && echo "Mongoose"
grep -q "@prisma/client" package.json && echo "Prisma"
grep -q "@nestjs/passport" package.json && echo "Passport 鉴权"
find src -name "*.module.ts" -type f | head -5
```

验证命令：

```bash
nest info               # 模块依赖概览
npm run build           # 1. 先类型检查
npm run test            # 2. 单元测试
npm run test:e2e        # 3. e2e（按需）
```

## 指令

- 依赖解析失败（`Nest can't resolve dependencies of the X (?)`，最高频）：① Provider 是否在所在模块 `providers` 数组；② 跨模块用时源模块是否 `exports`；③ Provider 名是否拼错（报错有误导性）；④ barrel 导出的 import 顺序。`(?)` 位置即缺失的构造参数，数参数定位。
- 循环依赖：① 在依赖两端都用 `forwardRef(() => X)`；② 更推荐——把共享逻辑抽到第三个模块；③ 循环依赖常是设计信号，`forwardRef` 会掩盖更深问题。
- 模块导出陷阱：`exports` 数组导出的是 **Service 不是 Module**（`exports: [ActorModule]` → `exports: [ActorService]`），用 `nest info` 校验。
- 执行顺序固定：中间件 → 守卫 → 拦截器(前) → 管道 → 路由处理器 → 拦截器(后)；顺序错乱按此排查。拦截器内的异步要正确 `await`。
- DTO 校验：用 `class-validator` + `class-transformer`，全局或路由挂 `ValidationPipe`。
- TypeORM 报错往往误导：`Unable to connect` 常因实体语法错（用 `@Column()` 而非 `@Column('description')`）或缺装饰器；多库用具名连接 + `@InjectRepository(Entity, 'conn')`；在 `useFactory` 里 try-catch + `retryAttempts`/`retryDelay` 防整个应用崩溃。
- JWT 鉴权：Strategy 从 `'passport-jwt'` 导入（非 `'passport-local'`）；`JwtModule` 的 secret 必须与 `JwtStrategy.secretOrKey` 完全一致；请求头格式 `Authorization: Bearer <token>`；`JWT_SECRET` 走环境变量，确保 `ConfigModule` 先于 `JwtModule` 加载（否则 `secretOrPrivateKey must have a value`）。
- 测试：单测用最小化 Mock Provider；TypeORM 仓储用 `getRepositoryToken(Entity)` 提供 Mock，不连真库；`JwtService` 等外部依赖一律 Mock；e2e 在 `Test.createTestingModule()` 中导入全部所需模块。
- 配置与日志：`@nestjs/config` + Joi 校验环境变量；用内置 Logger 与自定义异常过滤器统一错误。

## 示例

特性模块（Feature Module）模式：

```typescript
@Module({
  imports: [CommonModule, DatabaseModule],
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository],
  exports: [FeatureService], // 导出 Service，供其他模块用
})
export class FeatureModule {}
```

组合装饰器（鉴权 + 角色）：

```typescript
export const Auth = (...roles: Role[]) =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
  );
```

单测骨架（Mock 依赖）：

```typescript
beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [
      ServiceUnderTest,
      { provide: DependencyService, useValue: mockDependency },
    ],
  }).compile();
  service = module.get<ServiceUnderTest>(ServiceUnderTest);
});
```

异常过滤器：

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // 自定义错误处理
  }
}
```

动态模块 `forRoot` 模式：

```typescript
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [{ provide: 'CONFIG_OPTIONS', useValue: options }],
    };
  }
}
```

选型速查：

- ORM：要迁移→TypeORM/Prisma；NoSQL→Mongoose；类型安全优先→Prisma；复杂关系/旧库→TypeORM。
- 鉴权：无状态 API→JWT + refresh token；会话→Express session + Redis；OAuth/社交登录→Passport 各 Strategy；微服务间→mTLS。
- 测试：业务逻辑→带 Mock 单测；API 契约→连测试库的集成测试；用户流程→Supertest e2e。

## 注意事项

- 一次性诊断优先，避免 watch/serve 长驻进程。
- NestJS 的 DI 报错刻意泛化（出于安全），开发期开 verbose 日志、在 Provider 加自定义错误信息辅助定位。
- 性能：避免 N+1（DataLoader）、配置连接池、生产开压缩中间件与限流、在 `onModuleDestroy()` 里清理事件监听防内存泄漏。
- 所有 Service 须 `@Injectable()`；自定义 Provider 优先用 Symbol/Token 而非字符串 Token。
- 输出代码不能替代环境内验证、测试与专家评审；上线前务必跑通 类型检查→单测→e2e。
- 仅当任务确实落在 NestJS 生态时使用本技能，否则切换到合适的域。

## 互见

- related：`rest-api-endpoint-builder` —— 控制器层的 REST 端点设计可参考。
- related：`api-design-principles` —— 接口契约与版本化设计。
- related：`graphql-architect` —— 用 Strawberry/Apollo 在 Nest 里做 GraphQL 时。
- combines_with：`database-design-advisor` —— TypeORM/Mongoose 实体与关系建模可与数据库设计技能搭配。
- combines_with：`docker-expert` —— 容器化与部署 NestJS 应用时组合使用。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
