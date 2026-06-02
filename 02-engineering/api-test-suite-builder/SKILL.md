---
name: api-test-suite-builder
title: API 集成测试套件生成
description: 当需要为 REST API 批量补齐集成/契约测试时使用；扫描 Next.js/Express/FastAPI/Django REST 路由并生成覆盖鉴权、入参校验、错误码、分页、文件上传、限流的可运行测试套件（Vitest+Supertest 或 Pytest+httpx）；不适用于纯前端 UI、单元测试或 GraphQL/gRPC；触发词：生成 API 测试、集成测试套件、契约测试
domain: 研发/testing
triggers: [生成 API 测试, 集成测试套件, 契约测试, 测试 REST 接口, 补齐接口测试, API 回归测试, 鉴权/入参/错误码测试矩阵]
tags: [研发, testing, API测试, 集成测试, 契约测试, Vitest, Supertest, Pytest, httpx, 回归测试]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob, Bash, Write, Edit]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用：

- 新增 API：实现前先生成测试脚手架，走 TDD。
- 遗留无测试的 API：扫描路由，补齐基线覆盖。
- 契约评审：核对现有测试是否与当前路由定义一致。
- 发版前回归：确保每条路由至少有冒烟测试。
- 安全审计准备：生成对抗性入参（注入、越权、超限）测试。

支持的框架：Next.js App Router、Express、FastAPI、Django REST Framework。
产物形态：Node 端 Vitest + Supertest；Python 端 Pytest + httpx。

不该用（负边界）：

- 纯前端 UI / 组件渲染测试（用 E2E 或组件测试工具）。
- 函数级单元测试（本技能聚焦端到端的接口行为）。
- 非 REST 协议：GraphQL、gRPC、WebSocket 不在覆盖范围。
- 性能/压测（限流测试只验证 429 行为，不做吞吐基准）。

## 步骤

1. 扫描路由：用下方命令枚举全部端点及其 HTTP 方法，形成路由清单。
2. 阅读每个 handler，明确：请求体 schema、鉴权要求（中间件/装饰器）、返回类型与状态码、业务规则（归属权、角色校验）。
3. 按路由分组生成测试文件，套用「鉴权矩阵」「入参校验矩阵」。
4. 测试命名描述化：`returns 401 when token is expired`，而非 `auth test 3`。
5. 测试数据一律用工厂/fixture，绝不硬编码 ID。
6. 断言响应结构（字段、形状），而不仅是状态码；并断言敏感字段（password、secret）不出现在响应中。

## 指令

路由探测（按框架选用）：

Next.js App Router：

```bash
find ./app/api -name "route.ts" | while read f; do
  route=$(echo $f | sed 's|./app||' | sed 's|/route.ts||')
  methods=$(grep -oE "export (async )?function (GET|POST|PUT|PATCH|DELETE)" "$f" | \
    grep -oE "(GET|POST|PUT|PATCH|DELETE)")
  echo "$methods $route"
done
```

Express：

```bash
grep -rn "router\.\|app\." src/ --include="*.ts" | \
  grep -oE "\.(get|post|put|delete|patch)\(['\"][^'\"]+['\"]" | \
  sed "s/\.\(.*\)('\(.*\)'/\U\1 \2/"
```

FastAPI：

```bash
grep -rn "@\(app\|router\)\.\(get\|post\|put\|delete\|patch\)" . --include="*.py" | \
  grep -oE "@(app|router)\.(get|post|put|delete|patch)\(['\"][^'\"]*['\"]"
```

Django REST：

```bash
grep -rn "path\|re_path\|url(" . --include="*.py" | grep "urlpatterns" -A 50 | \
  grep -E "path\(['\"]" | grep -oE "['\"][^'\"]+['\"]" | head -40
grep -rn "router\.register\|DefaultRouter\|SimpleRouter" . --include="*.py"
```

鉴权测试矩阵（每个受保护端点逐项生成）：

| 测试用例 | 期望状态 |
|---------|---------|
| 无 Authorization 头 | 401 |
| token 格式非法 | 401 |
| token 有效但角色不符 | 403 |
| JWT 已过期 | 401 |
| token 有效且角色正确 | 2xx |
| token 来自已删除用户 | 401 |

入参校验矩阵（每个带 body 的 POST/PUT/PATCH）：

| 测试用例 | 期望状态 |
|---------|---------|
| 空 body `{}` | 400 / 422 |
| 缺必填字段（逐个） | 400 / 422 |
| 类型错误（应为 int 传 string） | 400 / 422 |
| 边界 min-1 / max+1 | 400 / 422 |
| 边界 min / max | 2xx |
| SQL 注入 / XSS 串 | 400 或 200（已净化） |
| 必填字段传 null | 400 / 422 |

## 示例

Node（Vitest + Supertest，节选鉴权与入参用例）：

```typescript
describe('GET /api/users/:id', () => {
  it('returns 401 with expired token', async () => {
    const expiredToken = generateExpiredJWT({ id: testUserId })
    const res = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${expiredToken}`)
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/expired/i)
  })

  it('returns 200 with valid token for own profile', async () => {
    const res = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${validToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: testUserId })
    expect(res.body).not.toHaveProperty('password')   // 敏感字段不外泄
  })
})
```

文件上传用例（覆盖未鉴权、缺文件、错误 MIME、超限、空文件、MIME 伪造）：

```typescript
it('returns 413 for oversized file (>10MB)', async () => {
  const largeBuf = Buffer.alloc(11 * 1024 * 1024)
  const res = await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${validToken}`)
    .attach('file', largeBuf, { filename: 'large.pdf', contentType: 'application/pdf' })
  expect(res.status).toBe(413)
})
```

Python（Pytest + httpx，FastAPI）—token 工厂、分页与限流：

```python
def make_token(user_id: str, role: str = "user", expired: bool = False) -> str:
    exp = datetime.utcnow() + (timedelta(hours=-1) if expired else timedelta(hours=1))
    return jwt.encode({"sub": user_id, "role": role, "exp": exp}, JWT_SECRET, algorithm="HS256")

class TestRateLimiting:
    def test_rate_limit_after_burst(self, client, valid_token):
        responses = []
        for _ in range(60):  # 超过典型 50/min 限制
            res = client.get("/api/items", headers={"Authorization": f"Bearer {valid_token}"})
            responses.append(res.status_code)
            if res.status_code == 429:
                break
        assert 429 in responses, "Rate limit was not triggered"
```

## 注意事项

- 只测 happy path 是大忌：80% 的 bug 藏在错误分支，优先覆盖错误路径。
- 测试数据用工厂/fixture，别硬编码 ID（跨环境会变）。
- 测试间不共享状态，始终在 `afterEach`/`afterAll` 清理。
- 测行为而非实现：断言 API 返回什么，而不是它怎么实现。
- 别漏边界用例：分页和上限的 off-by-one 极其常见。
- 区分「过期 token」与「非法 token」：两者行为不同，分别覆盖。
- 校验 Content-Type：API 应拒绝错误类型（期望 json 却传 xml）。
- 每个端点一个 describe 块，便于隔离失败。
- 限流测试放最后跑：并行时会干扰其他套件。
- 断言具体错误字段/消息，而非仅状态码；显式验证 password、secret 等绝不出现在响应里。
- JWT 密钥用测试配置，绝不引入生产密钥。

## 互见

- 源参考含三份完整测试样例（Node 鉴权/入参/分页、文件上传、Python FastAPI 全套），可作为生成模板的蓝本。

---

采编自 alirezarezvani/claude-skills（MIT）。
