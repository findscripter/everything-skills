---
name: rest-api-endpoint-builder
title: 生产级 REST API 端点构建
description: 当需要新建或扩展后端 REST API 端点时使用；按「路由→校验→鉴权→业务→错误处理→响应→文档→测试」分层产出生产级端点代码与规范；不适用于前端调用、GraphQL/gRPC 或纯架构选型；触发词：REST API、端点、路由、CRUD、接口
domain: 研发/backend
triggers: [创建 API 端点, 构建 REST API, 新增接口/路由, 实现 CRUD 操作, 给已有 API 加端点, 接口入参校验与鉴权, endpoint, REST route]
tags: [backend, REST API, Node.js, Express, Fastify, 鉴权, 入参校验, 错误处理, 分页, CRUD]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用户要求「创建一个 API 端点 / 写个 REST 接口」。
- 开发新后端功能、给已有 API 增加端点、实现 CRUD。
- 出现「API、端点、路由、route、REST、接口」等词。

不该用（负边界）：
- 仅前端调接口、写客户端 SDK / fetch 封装。
- GraphQL、gRPC、WebSocket、消息队列等非 REST 范式。
- 纯架构/技术选型讨论，不落到具体端点代码。
- 缺少必要输入（数据模型、权限边界、成功标准）时，先停下来问清，不要凭空编。

## 步骤

每个端点按以下分层逐项产出，缺一不可：

1. 路由定义：选对 HTTP 方法，挂上鉴权与校验中间件。
2. 入参校验：处理前先校验 body / params / query，不通过即返回 400。
3. 鉴权与授权：受保护路由要求登录（401），并校验资源归属（403）。
4. 业务逻辑：核心处理，注意幂等与并发冲突（409）。
5. 错误处理：try/catch 局部兜底 + 全局错误中间件，生产环境不泄露细节。
6. 响应格式化：统一 `{ success, data }` / `{ error }` 结构，列表带 `pagination`。
7. API 文档：用 JSDoc 注释标注路由、入参、返回码、示例。
8. 测试（按需）：覆盖正常路径与关键校验失败路径。

## 指令

路由 + 校验 + 处理函数三段式（Express / Fastify 任选其一）：

```javascript
// Express
router.post('/api/users', authenticate, validateUser, createUser);

// Fastify（用 schema 内建校验）
fastify.post('/api/users', { preHandler: [authenticate], schema: userSchema }, createUser);
```

入参校验中间件，处理前先拦截非法输入：

```javascript
const validateUser = (req, res, next) => {
  const { email, name, password } = req.body;
  if (!email || !email.includes('@'))   return res.status(400).json({ error: 'Valid email required' });
  if (!name || name.length < 2)         return res.status(400).json({ error: 'Name must be at least 2 characters' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  next();
};
```

处理函数：查重(409) → 加盐哈希密码 → 落库 → 剔除敏感字段 → 返回 201：

```javascript
const createUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const existing = await db.users.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.users.create({ email, name, password: hashedPassword, createdAt: new Date() });

    const { password: _, ...userWithoutPassword } = user; // 永不回传密码
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

全局错误中间件，生产环境屏蔽内部细节：

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(err.status || 500).json({ error: message });
});
```

HTTP 状态码约定：
- `200` 成功（GET/PUT/PATCH）｜`201` 已创建（POST）｜`204` 无内容（DELETE）
- `400` 校验失败｜`401` 未认证｜`403` 无权限｜`404` 未找到｜`409` 冲突/重复｜`500` 服务端错误

统一响应结构：
```javascript
// 成功
{ "success": true, "data": { } }
// 错误
{ "error": "Error message", "details": { } }
// 列表带分页
{ "success": true, "data": [], "pagination": { "page": 1, "limit": 20, "total": 100 } }
```

安全检查清单（上线前逐项确认）：
- [ ] 受保护路由强制认证；校验资源归属（用户只能动自己的数据）
- [ ] 所有字段入参校验；用参数化查询防 SQL 注入
- [ ] 公开端点加限流；设置请求体大小上限
- [ ] 响应不含敏感数据（密码、token）；CORS 正确配置

## 示例

CRUD 路由约定：
```
POST   /api/resources              创建，Body: { name, description }
GET    /api/resources?page=1&limit=20   列表
GET    /api/resources/:id          查单条
PUT    /api/resources/:id          更新，Body: { name, description }
DELETE /api/resources/:id          删除
```

分页查询（并发取数据与总数）：
```javascript
const getResources = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const [resources, total] = await Promise.all([
    db.resources.find().skip(skip).limit(limit),
    db.resources.countDocuments()
  ]);
  res.json({ success: true, data: resources,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};
```

过滤与排序：
```javascript
const { status, sort = '-createdAt' } = req.query;
const filter = {};
if (status) filter.status = status;
const resources = await db.resources.find(filter).sort(sort).limit(20);
```

测试（覆盖成功 + 校验失败两条路径）：
```javascript
describe('POST /api/users', () => {
  it('creates a user', async () => {
    const res = await request(app).post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.password).toBeUndefined(); // 不回传密码
  });
  it('rejects invalid email', async () => {
    const res = await request(app).post('/api/users')
      .send({ email: 'invalid', name: 'Test User', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('email');
  });
});
```

文档注释模板：
```javascript
/**
 * @route POST /api/users
 * @desc 创建新用户
 * @access Public
 * @body {string} email    用户邮箱（必填）
 * @body {string} name     用户名（必填）
 * @body {string} password 密码，至少 8 位（必填）
 * @returns {201} 创建成功 / {400} 校验失败 / {409} 已存在 / {500} 服务端错误
 */
```

## 注意事项

- 核心原则：处理前先校验入参；用对状态码；优雅处理错误；绝不暴露敏感数据；响应结构统一；该鉴权处必鉴权；端点写文档；关键路径写测试。
- 本技能产出是脚手架，不能替代针对你实际环境的校验、测试与专家评审。
- 仅在任务确实落到「具体 REST 端点实现」时使用；范围不符请勿套用。

## 互见

- `安全审计 / security-auditor`：上线前安全评审。
- `测试驱动开发 / test-driven-development`：补齐测试。
- `数据库设计 / database-design`：数据建模与表结构。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
