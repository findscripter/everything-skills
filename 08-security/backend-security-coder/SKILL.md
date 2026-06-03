---
name: backend-security-coder
title: 后端安全编码与 API 防护
description: 当编写或评审后端代码与 API、需要防注入/认证授权/安全响应时使用；做输入校验、参数化查询、JWT/会话、CSRF/SSRF 防护、安全响应头与限流的落地实现与加固清单；不适用于纯前端、合规审计/威胁建模/渗透测试规划（交 security-auditor）。触发词：SQL注入、JWT、CSRF、限流、安全响应头
domain: 安全/appsec
triggers: [后端安全编码, 防 SQL/NoSQL/命令注入, JWT 与会话安全, CSRF/SSRF 防护, 安全响应头与 CSP, API 限流与鉴权, 参数化查询, 密钥与敏感数据保护, 安全错误处理与日志]
tags: [安全, misc, 后端, api, 认证授权, 注入防护, owasp]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Write, Grep, Bash]
requires: []
related: [api-security-best-practices, auth-implementation-patterns, insecure-defaults-detector, security-antipattern-hook]
combines_with: [api-security-best-practices, sast-configurator, codeql-scanner]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 编写后端业务/接口代码，需要内建安全防护（输入校验、参数化查询、认证授权、安全响应头）。
- 对已有 API 端点做安全评审与漏洞修复（注入、越权、敏感信息泄露等）。
- 实现 JWT/OAuth、会话、CSRF/SSRF 防护、限流、密钥管理等安全机制。

不该用（负边界）：
- 纯前端/UI 任务，或与后端安全无关的任务。
- 高层安全审计、合规评估、威胁建模、DevSecOps 流水线设计、渗透测试规划 —— 交给 security-auditor（关键区别：本技能写安全代码，security-auditor 评估安全态势）。
- 不要把产出当作环境特定验证、测试或专家评审的替代品。

## 步骤

1. 明确威胁模型、合规要求、约束与必需输入；缺少成功标准/权限边界时先停下来追问。
2. 输入校验与净化：默认采用「白名单（allowlist）」与强类型约束，限制 payload 大小与 content-type。
3. 防注入：数据库一律用参数化查询/预编译语句（prepared statements）；命令/LDAP/NoSQL 同理避免拼接。
4. 认证与会话：密码用 bcrypt/Argon2 加盐哈希；JWT 校验签名与过期、配合 refresh token 轮换；会话防固定、可失效。
5. Web 防护：设置安全响应头与 CSP，对 cookie 加 HttpOnly/Secure/SameSite，开启 CSRF 防护。
6. API 安全：实现 RBAC/ABAC 或 scope 鉴权，加限流（按用户/IP）、突发保护，统一且不泄密的错误响应。
7. 外部请求：目标 URL 白名单、限制协议、防 SSRF 隔离内网，设置超时与响应大小上限，校验证书。
8. 安全日志与监控：记录认证/授权失败与可疑行为，净化日志防注入、排除敏感数据，失败时安全降级。
9. 自动化 + 人工测试验证安全控制，回归核对。

## 指令

- 所有用户输入用白名单方式校验与净化。
- 数据库访问只用参数化查询/预编译语句，禁止字符串拼接 SQL。
- 错误消息与日志中绝不暴露敏感信息（堆栈、密钥、内部路径）。
- 一切访问遵循最小权限；安全默认值，失败时安全失败（fail securely）。
- 多层防御（defense-in-depth），各安全层保持职责分离。
- 密钥用环境变量/Vault/AWS Secrets Manager/Azure Key Vault 管理并支持轮换。

## 示例

- 「用 JWT + refresh token 轮换实现安全的用户认证。」
- 「评审该 API 端点的注入漏洞并补上输入校验。」
- 「为基于 cookie 的认证系统配置 CSRF 防护（anti-CSRF token / 双提交 cookie / SameSite）。」
- 「为公开 API 端点实现限流与防滥用。」
- 「实现不泄露敏感信息的安全错误处理。」
- 「为 Web 应用配置完整安全响应头与 CSP（nonce/hash、report-only 模式）。」

参考关键约束：CSP 支持 nonce/hash 与 report-only；安全头含 HSTS、X-Frame-Options、X-Content-Type-Options、Referrer-Policy；CSRF 方案含 anti-CSRF token、Origin/Referer 校验、双提交 cookie、SameSite；XML 解析禁用外部实体防 XXE；文件下载校验 content-type 并防路径穿越。

## 注意事项

- 当任务明显不匹配本技能范围时，不要套用。
- 不要把输出当作环境验证、测试或专家评审的替代。
- 若缺少必需输入、权限、安全边界或成功标准，应停下来澄清。
- 持续更新依赖并监控漏洞；每个设计决策都评估安全影响。

## 互见

- security-auditor：安全审计、合规评估、威胁建模、渗透测试规划等高层安全态势工作。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
