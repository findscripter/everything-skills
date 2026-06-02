---
name: cloudflare-workers-edge
title: Cloudflare Workers KV D1 R2 边缘平台
description: 当用 Cloudflare Workers 把逻辑部署到边缘、接入 KV/D1/R2/Durable Objects 存储、做边缘缓存与请求改写、降低延迟时使用；产出 wrangler.toml 配置、绑定接入与 fetch 处理器代码；不适用于传统 Node/Express、AWS Lambda、GCP Functions 或不用边缘特性的纯前端。触发词：Cloudflare Workers、Wrangler、KV/D1/R2、边缘
domain: 平台/cloud
triggers: [Cloudflare Workers, Wrangler, wrangler.toml, KV, D1, R2, Durable Objects, 边缘计算, edge computing, Cloudflare Pages, waitUntil, 边缘缓存, wrangler dev, wrangler tail]
tags: [平台, misc, cloudflare, workers, 边缘计算, serverless, KV, D1, R2, wrangler]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [wrangler, npx, Cloudflare Workers, KV, D1, R2, Durable Objects]
requires: []
related: [cloudflare-workers-expert, gcp-cloud-run, aws-serverless-builder, hono-edge-api]
combines_with: [hono-edge-api, firebase-backend, rest-api-endpoint-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 把无服务器函数部署到 Cloudflare 边缘网络，靠近用户降低延迟。
- 接入边缘存储：KV（键值/读多写少）、D1（边缘 SQLite）、R2（对象存储）、Durable Objects（有状态协调、高并发）。
- 在边缘改写请求/响应、注入安全头、做边缘缓存与重定向。
- 用 Cloudflare Pages + Workers 搭建全栈应用。

不该用（负边界）：
- 任务面向传统 Node.js/Express 服务器应用。
- 目标平台是 AWS Lambda 或 Google Cloud Functions（请用对应技能）。
- 不涉及边缘特性的纯前端开发。

## 步骤 / 指令

1. Wrangler 生态：用 `wrangler.toml` 做配置，本地测试用 `npx wrangler dev`。
2. Fetch API：Workers 运行在 Web 标准 Fetch API 之上，不存在 Node.js 全局对象；用到 `fs`/`path` 等需开启 Node.js 兼容模式（compatibility flags）。
3. 绑定（Bindings）：所有 KV、D1、密钥等绑定都在 `wrangler.toml` 中声明，并通过 `fetch` 处理器的 `env` 参数访问，如 `env.MY_KV_NAMESPACE`。
4. 冷启动：Workers 是 0ms 冷启动，但要控制打包体积，免费版上限 1MB，不要引入大型库。
5. Durable Objects：需要有状态协调、强一致或高并发时使用。
6. 非阻塞任务：响应发出后才需执行的日志、分析等异步任务，用 `ctx.waitUntil()` 包裹，避免阻塞响应。

## 示例

示例 1：带 KV 绑定的基础 Worker（TypeScript）

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

示例 2：在边缘改写响应、注入安全头（JavaScript）

```javascript
export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);

    // 在边缘添加安全头
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
- 用 `env.VAR_NAME` 读取密钥与环境变量。
- 用 `Response.redirect()` 做干净的边缘重定向。
- 用 `wrangler tail` 实时调试生产环境。
- 不要引入大型库；Workers 的内存与 CPU 时间有限。
- 不要直接用 `fs`、`path` 等 Node.js 专属库，除非开启 Node.js 兼容模式。

排错：
- 问题：请求超出 CPU 时间限制。
- 解决：优化循环、减少 `await` 调用数量、把同步重计算移出请求/响应路径；不阻塞响应的任务交给 `ctx.waitUntil()`。

约束提醒：
- 仅在任务明确落在上述边缘计算范围内时使用本技能。
- 输出不能替代针对具体环境的验证、测试或专家评审。
- 缺少必要输入、权限、安全边界或验收标准时，先停下并询问澄清。

## 互见

- AWS Lambda / Google Cloud Functions：换用各自平台的 Serverless 技能。
- 传统 Node.js/Express 服务端：换用对应后端技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
