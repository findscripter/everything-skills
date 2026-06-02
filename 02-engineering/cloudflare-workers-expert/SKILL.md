---
name: cloudflare-workers-expert
title: Cloudflare Workers 边缘计算开发
description: 当在 Cloudflare 边缘部署 Serverless 函数、用 KV/D1/Durable Objects/R2 做边缘存储、或在边缘改写请求响应时使用；用 Wrangler 配置绑定、本地调试与部署，产出可上线的 Worker 代码与 wrangler.toml；不适用于传统 Node/Express、AWS Lambda、GCP Functions 或不涉及边缘特性的纯前端。触发词：Cloudflare Workers、Wrangler、Durable Objects
domain: 研发/backend
triggers: [Cloudflare Workers, Wrangler, wrangler.toml, KV, D1, Durable Objects, R2, 边缘计算, edge computing, Cloudflare Pages, waitUntil, wrangler tail]
tags: [cloudflare, workers, edge-computing, serverless, wrangler, kv, d1, durable-objects, r2, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [wrangler, npx, typescript, fetch-api]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：
- 把 Serverless 函数部署到 Cloudflare 边缘网络，靠近用户降低延迟。
- 用 KV、D1（SQLite）、Durable Objects 或 R2 在边缘侧做数据存储与有状态协调。
- 在边缘改写请求/响应：注入安全响应头、做边缘缓存、重定向。
- 用 Cloudflare Pages + Workers 构建全栈应用。

不该用（负边界）：
- 跑在常驻服务器上的传统 Node.js/Express 应用。
- 目标平台是 AWS Lambda 或 Google Cloud Functions（用对应技能）。
- 不涉及边缘特性的普通前端开发。

关键约束：Workers 运行在 Web 标准 Fetch API 之上，没有 Node.js 全局对象（`fs`、`path` 等需开启 Node 兼容模式才可用）；免费版单 Worker 打包体积上限 1MB，CPU 时间和内存受限。

## 步骤

1. 初始化与配置：用 `wrangler.toml` 管理配置，本地用 `npx wrangler dev` 调试。
2. 声明绑定：所有绑定（KV、D1、secrets）在 `wrangler.toml` 中定义，运行时通过 `fetch` 处理器的 `env` 参数访问。
3. 编写处理器：默认导出对象的 `async fetch(request, env, ctx)`，返回标准 `Response`。
4. 选型存储：键值用 KV，关系型用 D1，强一致/高并发协调用 Durable Objects，大文件/对象用 R2。
5. 后置任务：用 `ctx.waitUntil()` 处理响应发出后才需完成的非阻塞异步任务（日志、埋点）。
6. 部署与观测：部署后用 `wrangler tail` 实时查看生产日志。

## 指令

- Wrangler 生态：配置走 `wrangler.toml`，本地测试用 `npx wrangler dev`。
- Fetch API：使用 Web 标准 Fetch，不要依赖 Node 全局对象。
- 绑定：在 `wrangler.toml` 定义后经 `env` 访问，不要硬编码密钥。
- 冷启动：Workers 冷启动为 0ms，但要控制打包体积以满足免费版 1MB 限制。
- Durable Objects：用于有状态协调和高并发场景。
- 错误处理：非阻塞异步任务用 `waitUntil()`，避免阻塞响应。

## 示例

示例 1：带 KV 绑定的基础 Worker

```typescript
export interface Env {
  MY_KV_NAMESPACE: KVNamespace;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const value = await env.MY_KV_NAMESPACE.get("my-key");
    if (!value) {
      return new Response("Not Found", { status: 404 });
    }
    return new Response(`Stored Value: ${value}`);
  },
};
```

示例 2：在边缘改写响应、注入安全头

```javascript
export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);

    // 在边缘添加安全响应头
    newResponse.headers.set("X-Content-Type-Options", "nosniff");
    newResponse.headers.set(
      "Content-Security-Policy",
      "upgrade-insecure-requests",
    );

    return newResponse;
  },
};
```

## 注意事项

最佳实践：
- 用 `env.VAR_NAME` 读取密钥与环境变量，不要把敏感值写进代码。
- 边缘重定向用 `Response.redirect()`。
- 生产实时排障用 `wrangler tail`。
- 不要引入大型库；Workers 内存和 CPU 时间受限。
- 不要使用 Node.js 专属库（如 `fs`、`path`），除非开启 Node 兼容模式。

常见问题：
- 请求超出 CPU 时间限制：优化循环、减少 `await` 调用次数、把同步重计算移出请求/响应路径，并用 `ctx.waitUntil()` 承接不需阻塞响应的任务。

边界提醒：输出不能替代针对具体环境的验证、测试与专家评审；若缺少必要输入、权限、安全边界或成功标准，应先停下来澄清。

## 互见

- 其他 Serverless/边缘平台技能（AWS Lambda、GCP Functions）按目标平台另行选用。
- 前端构建与 Pages 集成可结合通用前端技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
