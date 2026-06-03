---
name: api-security-best-practices
title: API 安全设计最佳实践
description: 当设计/加固 REST、GraphQL、WebSocket API 或做安全评审与审计时使用；产出认证授权、输入校验、限流防滥用、数据保护与安全头的可落地方案与代码；不适用于纯前端 XSS、网络层 DDoS 清洗或合规法律意见；触发词：API 安全、JWT 鉴权、限流、SQL 注入、OWASP API Top 10
domain: 安全/appsec
triggers: [API 安全, 接口加固, JWT 鉴权, OAuth, RBAC 授权, 输入校验, SQL 注入防护, XSS 过滤, 限流, rate limit, DDoS 防护, OWASP API Top 10, 安全评审, 安全审计, 安全响应头, Helmet]
tags: [安全, appsec, api, 认证授权, 输入校验, 限流, owasp, 后端]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Node.js/Express, jsonwebtoken, bcrypt, Zod, Prisma, express-rate-limit, Redis, Helmet, DOMPurify]
requires: []
related: [auth-implementation-patterns, backend-security-coder, insecure-defaults-detector, api-fuzzing-bug-bounty]
combines_with: [auth-implementation-patterns, backend-security-coder, stride-threat-modeler]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 设计新的 API 端点，或加固已上线的 REST / GraphQL / WebSocket 接口。
- 实现认证与授权（JWT、OAuth 2.0、API Key、RBAC、MFA）。
- 防御注入、XSS、暴力破解、DDoS、越权访问等常见 API 攻击。
- 做 API 安全评审、渗透测试准备、安全审计，或对照 OWASP API Top 10 自查。
- 处理敏感数据、配置限流与配额、设计安全响应头。

不该用（负边界）：
- 纯前端/浏览器侧的 XSS 渲染问题、CSP 调试本身（应交给前端安全方案）。
- 网络层大流量 DDoS 清洗（属 WAF / CDN / 云厂商职责，本技能只覆盖应用层限流）。
- 合规、法律、数据出境等法务判断；以及替代真实渗透测试与专家评审。
- 缺少环境上下文（框架、存储、身份源、成功标准）时，先停下来澄清再动手。

## 步骤

1. 认证与授权：选定认证方式，签发短时效访问令牌 + 可撤销刷新令牌，按请求校验令牌并落实 RBAC 与对象级授权（鉴权 ≠ 授权，二者都要查）。
2. 输入校验与净化：对所有入参做 schema 校验，使用参数化查询 / ORM，净化 HTML 输出，采用允许列表而非阻止列表。
3. 限流与防滥用：按用户/IP 限流，认证端点用更严格阈值，分布式场景用 Redis 共享计数，返回标准限流响应头。
4. 数据保护：全链路 HTTPS/TLS，敏感数据静态加密，统一脱敏错误信息，配置安全响应头与 CORS。
5. 安全测试：覆盖认证授权、输入处理、限流；对照 OWASP API Top 10 与下方清单逐项验证。

## 指令

- 令牌：访问令牌时效 ≤1h，刷新令牌入库（便于吊销），校验 `issuer` / `audience`，不在 JWT 载荷放敏感数据（JWT 不加密）。
- 密钥：`JWT_SECRET` 一律来自环境变量，启动时校验存在；256 位以上随机值，生成命令：
  `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- 口令：bcrypt 哈希，salt rounds ≥ 10；强度要求 ≥12 位含大小写数字与特殊字符，或用 zxcvbn 评分 <3 拒绝。
- 查询：禁止字符串拼接 SQL，统一参数化查询或 ORM；入参先做类型/范围校验（如 ID 仅允许 `/^\d+$/`）。
- 错误：生产环境不回传堆栈与数据库原文，按错误码映射为通用提示（如 Prisma `P2002` → "Email already exists"），完整错误只写日志。
- 限流：通用 API 15 分钟 100 次，登录/注册 15 分钟 5 次且 `skipSuccessfulRequests`，超限返回 429 与 `X-RateLimit-*` / `Retry-After` 头。
- 加固：启用 Helmet（CSP、`frameguard: deny`、`noSniff`、HSTS、隐藏 `X-Powered-By`），CORS 仅放行可信来源，不要整体关闭。

## 示例

JWT 签发（登录端点核心，Express）：
```javascript
const token = jwt.sign(
  { userId: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h', issuer: 'your-app', audience: 'your-app-users' }
);
// 刷新令牌单独密钥 + 入库，便于吊销
```

校验中间件：
```javascript
function authenticateToken(req, res, next) {
  const token = (req.headers['authorization'] || '').split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, process.env.JWT_SECRET,
    { issuer: 'your-app', audience: 'your-app-users' }, (err, user) => {
      if (err) return res.status(err.name === 'TokenExpiredError' ? 401 : 403)
        .json({ error: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
      req.user = user; next();
    });
}
```

参数化查询 + Zod 校验，防注入：
```javascript
// 安全：参数化查询，先校验 ID
if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid user ID' });
const user = await db.query('SELECT id, email, name FROM users WHERE id = $1', [req.params.id]);

// 入参 schema 校验
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  name: z.string().min(2).max(100),
});
```

对象级授权（防越权，对应 OWASP API #1）：
```javascript
const post = await prisma.post.findUnique({ where: { id: req.params.id } });
if (!post) return res.status(404).json({ error: 'Post not found' });
if (post.userId !== req.user.userId && req.user.role !== 'admin')
  return res.status(403).json({ error: 'Not authorized' });
```

Redis 分布式限流（认证端点更严格）：
```javascript
const authLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:auth:' }),
  windowMs: 15 * 60 * 1000, max: 5, skipSuccessfulRequests: true,
});
app.use('/api/auth/login', authLimiter);
```

## 注意事项

- 该做：处处 HTTPS；不信任任何用户输入；参数化查询；哈希口令；短时效令牌；正确配置 CORS；记录安全事件；及时更新依赖；用 Helmet 安全头；脱敏错误信息。
- 不该做：明文存口令；弱密钥；暴露堆栈/数据库错误；SQL 字符串拼接；JWT 放敏感数据；忽略安全更新；使用默认凭据；完全关闭 CORS；日志记录敏感数据。
- 常见坑：密钥硬编码进 Git；密码强度要求过弱；只查认证不查授权（IDOR/越权）；错误信息泄露唯一约束等系统细节。
- 对照 OWASP API Top 10 自查：对象级授权、认证、对象属性级授权、资源消耗（限流）、功能级授权、敏感业务流、SSRF、安全配置、资产清单管理、不安全的第三方 API 消费。
- 安全不是一次性工作：持续审计、保持依赖更新、跟踪新漏洞。本技能输出不替代环境内验证、测试与专家评审。

## 互见

- ethical-hacking-methodology：从攻击者视角做安全测试。
- sql-injection-testing：SQL 注入专项测试。
- xss-html-injection：XSS / HTML 注入测试。
- broken-authentication：认证类漏洞排查。
- backend-dev-guidelines：后端开发规范。
- 参考资料：OWASP API Security Top 10、JWT 最佳实践 RFC 8725、Express 安全实践、Node.js 安全清单。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
