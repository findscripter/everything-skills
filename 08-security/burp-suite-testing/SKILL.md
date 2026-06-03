---
name: burp-suite-testing
title: Burp Suite Web 安全测试
description: 当对已获授权的 Web 应用做安全测试、需要拦截/篡改 HTTP、重放请求、漏洞扫描或参数爆破时使用；做基于代理的拦截改包、Repeater 重放、Intruder 爆破与 Scanner 扫描并产出 PoC 与漏洞报告；不适用于未授权目标、非 Web 协议、纯防御加固或客户端二进制逆向；触发词：Burp、抓包改包、Repeater、Intruder、漏洞扫描
domain: 安全/appsec
triggers: [Burp Suite, 拦截 HTTP 流量, 抓包改包, Repeater 重放请求, Intruder 爆破, 漏洞扫描, 代理拦截, 越权测试, 业务逻辑漏洞, SQL 注入测试]
tags: [安全, 渗透测试, web安全, burp suite, 代理拦截, 漏洞扫描]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Burp Suite Community/Professional, Burp 内置浏览器, Proxy, Repeater, Intruder, Scanner]
requires: []
related: [ffuf-web-fuzzing, api-fuzzing-bug-bounty, idor-vulnerability-testing, path-traversal-testing]
combines_with: [red-team-recon, broken-authentication-testing, idor-vulnerability-testing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> 仅限授权使用：本技能只能用于已获授权的安全评估、防御验证或受控教学环境。任何对未授权目标的测试均属违法。

## 何时使用

- 对**已获书面授权**的 Web 应用做黑/灰盒安全测试，需要拦截并查看/篡改 HTTP(S) 请求与响应。
- 需要把单个请求送入 Repeater 反复改参重放，验证 SQL 注入、越权（IDOR）、业务逻辑等漏洞。
- 需要用 Intruder 对参数做模糊测试或凭据爆破，按响应长度/状态码定位异常。
- 持有 Professional 版，需要自动化漏洞扫描（Scanner）并产出含修复建议的报告。

**不该用的边界：**
- 没有授权的目标——不要碰，先拿授权与测试范围（scope）。
- 非 HTTP/Web 场景（如纯二进制协议、客户端逆向、移动端无代理流量）不适用。
- 仅需防御加固/代码审计/SAST，而非主动发包测试时，不必用本技能。
- Community 版**没有 Scanner**，需要自动扫描请改用 Professional。

## 步骤

1. **环境准备**：安装 Burp（Community/Pro），启动并新建项目；确认 Proxy 监听器在 `127.0.0.1:8080`；安装 Burp CA 证书以拦截 HTTPS（浏览器访问 `http://burp` 下载，加入受信任根证书）。优先使用 Burp 内置浏览器（Proxy > Intercept > Open Browser），避免代理配置问题。
2. **设定范围（Scope）**：`Target > Site map` 右键目标主机 > **Add to scope**；HTTP history 显示过滤器勾选 **Show only in-scope items**，减少第三方噪声、防止误测。**这一步应在大规模测试前先做。**
3. **拦截流量**：`Proxy > Intercept` 打开 **Intercept on**，浏览目标，请求会被挂起；查看 headers/参数/body 后点 **Forward** 放行，逐个放行直到页面加载。关掉拦截时流量直接通过并记入 HTTP history。
4. **改包测试**：拦截到目标请求后，在请求编辑器直接改参数值再 Forward。常见目标：`price`（业务逻辑）、`userId`（越权）、`qty=-1`（输入校验）、`isAdmin=true`（提权）。
5. **Repeater 重放**：在 HTTP history 右键 **Send to Repeater**，在 Repeater 标签反复改参数、点 **Send**，对比右侧响应；用导航箭头回看历史请求。
6. **Intruder 爆破**（可选）：右键 **Send to Intruder**，用 `§` 标记 payload 位置，选攻击类型，配置 payload 集，运行后按响应长度/状态码排序找异常。
7. **Scanner 自动扫描**（仅 Pro）：`Dashboard > New scan` 填目标 URL，选扫描模式，在 **Issues** 标签查看发现并人工复核误报。
8. **取证与报告**：保存触发漏洞的 Request/Response 与 Advisory，整理 PoC 与修复建议；定期保存项目。

## 指令

拦截与放行控制：
```
Proxy > Intercept > Intercept is on/off  切换拦截开关
开启：请求被挂起，可审查/修改
关闭：请求直接通过，记入 HTTP history
```

常用快捷键（Windows/Linux | macOS）：
```
Forward request    Ctrl+F | Cmd+F
Drop request       Ctrl+D | Cmd+D
Send to Repeater   Ctrl+R | Cmd+R
Send to Intruder   Ctrl+I | Cmd+I
Toggle intercept   Ctrl+T | Cmd+T
```

Intruder 攻击类型：
| 类型 | 说明 | 场景 |
|------|------|------|
| Sniper | 单点位逐个替换 payload | 模糊单参数 |
| Battering ram | 所有点位同一 payload | 凭据测试 |
| Pitchfork | 多点位并行迭代 | 用户名:密码 配对 |
| Cluster bomb | 所有 payload 组合 | 全量爆破 |

Intruder 位置/payload 配置示例：
```
Positions：username=§admin§&password=§password§
Set 1: admin, user, test, guest
Set 2: password, 123456, admin, letmein
```

常用测试 payload：
```
# SQL 注入
' OR '1'='1
' OR '1'='1'--
1 UNION SELECT NULL--

# XSS
<script>alert(1)</script>
"><img src=x onerror=alert(1)>

# 路径穿越
../../../etc/passwd
..\..\..\..\windows\win.ini

# 命令注入
; ls -la
| cat /etc/passwd
`whoami`
```

## 示例

**示例 1：业务逻辑（改价）**
```http
POST /cart HTTP/1.1
Host: target.com
Content-Type: application/x-www-form-urlencoded

productId=1&quantity=1&price=100

# 拦截后改为：
productId=1&quantity=1&price=1
```
Forward 后以篡改价格加入购物车并下单。结论：服务端信任了客户端传入的价格。

**示例 2：认证绕过（SQL 注入）**
正常登录请求 Send to Repeater，将 `username` 改为 `admin' OR '1'='1'--`，观察到登录成功响应。结论：登录处存在 SQL 注入。

**示例 3：信息泄露**
产品页 `productId=1` Send to Repeater，改为 `productId=test`，触发详细报错栈，暴露 `Apache Struts 2.5.12` 版本。结论：错误信息泄露框架版本。

响应分析要点：报错栈、框架/版本信息、响应长度差异、时间差异（盲注线索）、异常返回数据。

## 注意事项

- **授权与合规**：只测授权应用；先设 scope 防止误测越界；对扫描限速，避免造成拒绝服务；记录所有发现与操作。
- **版本限制**：Community 版无自动扫描器；Intruder 在 Community 版被限速。
- **拦截/HTTPS 故障**：浏览器不走代理时核对代理指向 `127.0.0.1:8080`、检查防火墙、优先用内置浏览器；HTTPS 拦截失败时安装 Burp CA 证书并重启浏览器。HSTS/证书绑定可能需额外配置，重度扫描可能触发 WAF 拦截。
- **性能**：缩小 scope、关闭无用扩展、增大 Java 堆、关闭闲置标签可提速。
- **最佳实践**：大规模测试前先设 scope；定期保存项目；扫描结果人工复核误报；善用 Decoder 编解码、Comparer 对比请求。

## 互见

- 配合 Web 漏洞利用类技能（SQLi / XSS / 越权）做手工验证与 PoC 构造。
- 自动化爬取与目录扫描类技能可在 Scanner 之外补充资产面。

---
采编自 sickn33/antigravity-awesome-skills（原作者 zebbern，MIT 许可）。
