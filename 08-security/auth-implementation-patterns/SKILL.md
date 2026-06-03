---
name: auth-implementation-patterns
title: 认证与授权系统实现模式
description: 当实现用户认证、保护 REST/GraphQL API、接入 OAuth2/SSO、设计会话或 RBAC、排查鉴权问题时使用；做认证策略选型、令牌生命周期、授权模型与策略执行点的安全实现并产出可落地代码与清单；不适用于仅做登录页 UI 文案/样式、纯基础设施无身份诉求、或无权改动鉴权策略与凭据存储的场景。触发词：JWT、OAuth2、RBAC、会话管理、令牌刷新、SSO。
domain: 安全/appsec
triggers: [实现用户认证登录系统, 给 REST/GraphQL API 加鉴权, 接入 OAuth2 社交登录或企业 SSO, 设计会话管理或 RBAC 权限模型, 排查认证或授权失败问题, 设计 JWT 访问令牌与刷新令牌流程, 做密码存储与登录限流加固]
tags: [安全, appsec, 认证, 授权, jwt, oauth2, rbac, 会话管理, api安全]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Write, Grep, Bash]
requires: []
related: [api-security-best-practices, backend-security-coder, broken-authentication-testing, secrets-management]
combines_with: [api-security-best-practices, broken-authentication-testing, backend-security-coder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：
- 实现用户认证（登录/注册/登出）系统。
- 保护 REST 或 GraphQL API。
- 接入 OAuth2/社交登录（Google、GitHub）或企业 SSO。
- 设计会话管理、RBAC 角色或细粒度权限模型。
- 排查认证（AuthN）或授权（AuthZ）相关缺陷。

不该用（负边界）：
- 只需登录页 UI 文案或样式调整。
- 纯基础设施任务，不涉及身份与凭据。
- 你无权改动鉴权策略或凭据存储方式。
- 不能替代针对具体环境的验证、测试与专家评审；输入、权限、安全边界或成功标准缺失时，先停下来澄清。

先厘清概念：**认证（AuthN）= 你是谁**（核验身份、签发凭据、管理登录登出）；**授权（AuthZ）= 你能做什么**（权限校验、RBAC、资源归属、策略执行）。两者必须分开设计。

## 步骤

1. **建模与威胁分析**：定义用户、租户、登录流程与威胁模型约束。
2. **选认证策略与令牌生命周期**：在会话（有状态）、JWT（无状态、易水平扩展）、OIDC/OAuth2（委托认证）之间选型；确定访问令牌短时效（15–30 分钟）+ 刷新令牌长时效（如 7 天）。
3. **设计授权模型与执行点**：选择 RBAC（角色层级）、基于权限（permission）或资源归属（ownership）模型，并确定中间件等策略执行点（PEP）。
4. **规划密钥与审计**：密钥存储/轮换、日志与审计要求；刷新令牌入库前先哈希。
5. 需要详细范式与代码时，参阅源仓库 `resources/implementation-playbook.md`（及 references/jwt-best-practices、oauth2-flows、session-security）。

## 指令

- 先建模：用户、租户、流程、威胁约束。
- 选认证策略（session / JWT / OIDC）与令牌生命周期。
- 设计授权模型并明确策略执行点。
- 规划密钥存储、轮换、日志与审计。
- 安全红线：**绝不记录**密钥、令牌或凭据；密钥按最小权限原则安全存储。

## 示例

**JWT 双令牌签发**（访问令牌短时效、刷新令牌长时效）：

```typescript
import jwt from 'jsonwebtoken';

function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role }, process.env.JWT_SECRET!,
    { expiresIn: '15m' });                 // 短时效
  const refreshToken = jwt.sign(
    { userId }, process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' });                  // 长时效
  return { accessToken, refreshToken };
}
```

**认证中间件**（从 `Authorization: Bearer` 头取令牌、校验、挂载 `req.user`）：

```typescript
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(authHeader.substring(7), process.env.JWT_SECRET!);
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}
```

**刷新令牌入库要点**：存库前 `hash(refreshToken)`；刷新时校验签名 + 查库（未过期）+ 用户存在，再签发新访问令牌；登出删除单条、登出全设备删除该用户全部令牌。

**RBAC 角色层级**：

```typescript
enum Role { USER='user', MODERATOR='moderator', ADMIN='admin' }
const roleHierarchy = {
  admin: ['admin','moderator','user'],
  moderator: ['moderator','user'],
  user: ['user'],
};
function requireRole(...roles: Role[]) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.some(r => roleHierarchy[req.user.role].includes(r)))
      return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}
// app.delete('/api/users/:id', authenticate, requireRole(Role.ADMIN), handler)
```

也可用 permission（如 `read:users`/`write:users`）或资源归属（管理员放行、否则比对 `resource.userId === req.user.userId`）实现更细粒度授权。

**会话方案**：用 `express-session` + Redis 存储，Cookie 设 `httpOnly`、`secure`（生产）、`sameSite:'strict'`（防 CSRF）、`maxAge`。

**密码安全**：用 bcrypt（saltRounds=12）哈希；用 zod 校验强度（≥12 位，含大小写/数字/特殊字符）；`bcrypt.compare` 校验。

**限流防爆破**：登录端点 `express-rate-limit`（15 分钟内 5 次），API 端点（1 分钟 100 次），可挂 Redis store。

## 注意事项

最佳实践：
1. 绝不存明文密码，统一 bcrypt/argon2 哈希。
2. 全程 HTTPS 加密传输。
3. 访问令牌短时效（15–30 分钟封顶）。
4. Cookie 必带 httpOnly、secure、sameSite。
5. 校验所有输入（邮箱格式、密码强度）。
6. 对认证端点限流，防暴力破解。
7. 会话方案要做 CSRF 防护。
8. 定期轮换密钥（JWT/会话密钥）。
9. 记录安全事件（登录尝试、鉴权失败）——但绝不记录密钥/令牌本身。
10. 尽可能启用 MFA。

常见陷阱：
- 弱密码策略；JWT 存 localStorage（易受 XSS，应用 httpOnly Cookie）。
- 令牌不过期；只做客户端鉴权（必须服务端校验）。
- 密码重置不安全（应用带过期的安全令牌）；无限流；盲信客户端数据。

## 互见

- 源参考：`resources/implementation-playbook.md`、`references/{jwt-best-practices,oauth2-flows,session-security}.md`、`assets/{auth-security-checklist,password-policy-template}.md`、`scripts/token-validator.ts`。
- 技能大典内相关：API 安全、密钥与凭据管理、威胁建模、输入校验等条目。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
