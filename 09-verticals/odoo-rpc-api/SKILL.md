---
name: odoo-rpc-api
title: Odoo JSON/XML-RPC 外部接口
description: 当需要让外部应用通过 Odoo 的 JSON-RPC / XML-RPC 外部 API 读写记录、做集成或中间件、排查鉴权与权限报错时使用；做认证(authenticate 取 uid)、调用模型方法(execute_kw / call_kw)、记录增删改查并产出 Python/JavaScript/curl 可复制调用代码；不适用于 OAuth2 或会话 cookie 鉴权、二进制文件上传、Odoo 模块二次开发或本地化税务合规；触发词：odoo、JSON-RPC、XML-RPC、execute_kw、search_read、call_kw、API key、odoo 集成
domain: 领域/erp
triggers: [odoo, JSON-RPC, XML-RPC, execute_kw, search_read, call_kw, API key, odoo 集成, res.partner, sale.order, odoo 接口, odoo 鉴权]
tags: [odoo, erp, rpc, xml-rpc, json-rpc, api, integration, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo, xmlrpc, python, curl, requests]
requires: []
related: [odoo-orm-expert, odoo-module-developer, odoo-security-rules, rest-api-endpoint-builder]
combines_with: [odoo-shopify-integration, n8n-workflow-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于把外部系统接到 Odoo、用其外部 API 增删改查记录的场景：

- 把外部应用（Django、Node.js、移动端等）连到 Odoo 读写数据。
- 跑自动化脚本批量导入/导出 Odoo 数据。
- 在 Odoo 与第三方平台之间搭中间件。
- 排查 API 鉴权或权限报错，给出诊断与修正后的调用。

**不该用边界**：

- 不覆盖 **OAuth2 / 会话 cookie 鉴权**——本技能只用 API key（token）方式。
- 不做**二进制/文件上传**：`/xmlrpc/2/` 端点不支持；二进制走 JSON-RPC 操作 `ir.attachment` 模型。
- 不涉及 Odoo 模块二次开发与数据建模；本地化税务/电子发票合规请走 `odoo-localization-compliance`。
- 缺 URL、数据库名、凭据或 Odoo 版本等关键输入时，先停下来追问，别瞎猜。

## 步骤

1. **备齐前置信息**：`url`、`db`（数据库名）、`username`、`API key`（生产环境用 key，勿用密码）。
2. **认证取 uid**：调 `/xmlrpc/2/common` 的 `authenticate(db, user, password, {})` 拿到 `uid`，失败说明 db/凭据有误。
3. **调用模型**：经 `/xmlrpc/2/object` 的 `execute_kw(db, uid, password, model, method, args, kwargs)` 执行模型方法。
4. **选对方法**：查询优先用 `search_read`（一次往返）而非 `search`+`read`；写入用 `create`/`write`/`unlink`。
5. **传 domain 与 kwargs**：`args` 里放 domain 过滤（如 `[[['state','=','sale']]]`），`kwargs` 放 `fields`/`limit`/`offset`。
6. **生产加固**：凭据进环境变量/密钥管理；加连接重试与指数退避；批量操作而非紧凈循环。

## 指令

端点与签名速查：

| 用途 | 端点 / 调用 |
|---|---|
| 认证 | `common.authenticate(db, user, pwd, {})` → `uid`（`/xmlrpc/2/common`） |
| 模型调用 | `models.execute_kw(db, uid, pwd, model, method, args, kwargs)`（`/xmlrpc/2/object`） |
| JSON-RPC | `POST /web/dataset/call_kw`，body 走 JSON-RPC 2.0（`id` 必填） |
| 常用 method | `search_read` / `create` / `write` / `unlink` / `fields_get` |

## 示例

**示例 1：认证 + 读取记录（Python / XML-RPC）**

```python
import xmlrpc.client

url = 'https://myodoo.example.com'
db = 'my_database'
username = 'admin'
password = 'my_api_key'  # 生产用 API key，勿用密码

# 1) 认证
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})
print(f"Authenticated as UID: {uid}")

# 2) 调用模型：查已确认销售单
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
orders = models.execute_kw(db, uid, password,
    'sale.order', 'search_read',
    [[['state', '=', 'sale']]],
    {'fields': ['name', 'partner_id', 'amount_total'], 'limit': 10}
)
for order in orders:
    print(order)
```

**示例 2：创建记录（Python）**

```python
new_partner_id = models.execute_kw(db, uid, password,
    'res.partner', 'create',
    [{'name': 'Acme Corp', 'email': 'info@acme.com', 'is_company': True}]
)
print(f"Created partner ID: {new_partner_id}")
```

**示例 3：JSON-RPC via curl**

```bash
curl -X POST https://myodoo.example.com/web/dataset/call_kw \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "id": 1,
    "params": {
      "model": "res.partner",
      "method": "search_read",
      "args": [[["is_company", "=", true]]],
      "kwargs": {"fields": ["name", "email"], "limit": 5}
    }
  }'
# 注：JSON-RPC 2.0 规范要求 "id" 用于关联请求与响应。
# 模型方法调用走 /web/dataset/call_kw 端点。
```

## 注意事项

- ✅ 用 **API Key**（Settings → Technical → API Keys，Odoo 14+）而非密码。
- ✅ 用 `search_read` 替代 `search`+`read`，减少网络往返。
- ✅ 生产环境务必处理连接异常并实现带指数退避的重试。
- ✅ 凭据存环境变量或密钥管理器（如 AWS Secrets Manager、`.env`），并定期轮换。
- ❌ 别把密码/API key 硬编码进脚本。
- ❌ 别在紧凈循环里逐条调用——用批量操作显著降低服务端压力。
- ❌ 别用主管理员密码做集成——建专用集成用户，授予最小必要权限。
- ⚠️ 限制：XML-RPC 层无内置限流，需客户端自行节流；`/xmlrpc/2/` 不支持文件上传（二进制走 JSON-RPC + `ir.attachment`）；Odoo.sh（SaaS）部分套餐可能限制外部 API，先确认订阅是否开放。

## 互见

- related：`odoo-localization-compliance` —— 同属 Odoo，覆盖本地化与税务合规配置
- combines_with：`odoo-localization-compliance` —— RPC 接口对接 + 合规建模常组合落地国家级 ERP 集成

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
