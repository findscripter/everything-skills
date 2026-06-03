---
name: ffuf-web-fuzzing
title: ffuf Web 模糊测试
description: 当在授权渗透测试中用 ffuf 做 Web 模糊测试（目录/文件发现、子域枚举、参数/POST/请求头模糊、带认证原始请求 IDOR）时使用；做命令构造、自动校准降噪、过滤匹配与结果分析，产出可执行命令与 JSON/HTML/CSV 结果。不适用于未授权目标或非 Web/二进制模糊。触发词：ffuf、Web 模糊测试、目录爆破
domain: 安全/appsec
triggers: [ffuf, Web 模糊测试, 目录爆破, 内容发现, 子域枚举, 参数 fuzzing, 认证模糊测试, IDOR 测试, FUZZ 关键字, 自动校准 -ac]
tags: [安全, misc, 渗透测试, ffuf, web 模糊测试, 内容发现, 子域枚举, idor]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [ffuf, Bash, SecLists, Burp Suite]
requires: []
related: [burp-suite-testing, api-fuzzing-bug-bounty, red-team-recon, path-traversal-testing]
combines_with: [red-team-recon, burp-suite-testing, penetration-testing-methodology]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 在**已获授权**的渗透测试 / 安全评估中，用 `ffuf` 对 Web 目标做模糊测试。
- 任务涉及：目录与文件发现、子域（虚拟主机）枚举、参数名/参数值模糊、POST/JSON 数据模糊、请求头模糊、带认证的原始请求模糊（典型如 IDOR：遍历用户/文档 ID）。
- 需要词表选型、过滤/匹配、自动校准降噪与结果解读的指导。

**不该用边界：**
- 未获书面授权的目标——不要扫描，先停下确认授权与范围。
- 非 Web 场景（二进制/协议 fuzzing、源码审计）不适用。
- 不要把 ffuf 输出当作漏洞确认的最终结论，需结合人工与环境验证。
- 缺少目标 URL、词表、授权范围或成功标准时，先问清再动手。

## 步骤

1. 确认授权范围，准备 SecLists 词表（见「指令」）。
2. 先发一次基线请求，观察默认响应的状态码/大小/行数，作为过滤依据。
3. 把 `FUZZ`（区分大小写）放到要模糊的位置：URL 路径、请求头、POST body 或子域。
4. **默认加 `-ac` 自动校准**降噪；按基线用 `-fs`/`-fc`/`-fr` 进一步过滤。
5. 生产目标加限速隐身：`-rate`、`-t`、`-p`。
6. 输出存盘（`-o results.json`）便于后续分析；关注异常项（不同状态码/大小/耗时、admin/api/backup/.git 等敏感端点）。
7. 带认证场景改用原始请求文件 `--request req.txt`（见示例）。

## 指令

**安装：**
```bash
go install github.com/ffuf/ffuf/v2@latest   # Go
brew install ffuf                            # macOS
# 或下载 https://github.com/ffuf/ffuf/releases/latest
```

**FUZZ 关键字**可放任意位置；多词表用 `-w 表.txt:关键字` 自定义关键字。多词表模式：`clusterbomb`（笛卡尔积，默认）/`pitchfork`（并行 1:1）/`sniper`（单点逐位）。

**匹配（保留）：** `-mc` 状态码 `-ms` 大小 `-ml` 行数 `-mw` 词数 `-mr` 正则 `-mt` 耗时
**过滤（剔除）：** `-fc` 状态码 `-fs` 大小 `-fl` 行数 `-fw` 词数 `-fr` 正则 `-ft` 耗时

**自动校准（默认必加）：** `-ac` 自动识别并过滤重复假阳性；多主机用 `-ach`；自定义模式 `-acc "404NotFound"`。无 `-ac` 时结果会被成千上万的 404/403 噪声淹没，分析极困难。

**限速与时限：** `-rate 2`（每秒请求数）`-t 10`（线程，默认 40）`-p 0.1-2.0`（随机延迟）`-maxtime 60` `-maxtime-job 60`（配合递归）。

**输出：** `-o results.json`；`-of html|csv|all`；`-s` 静默；`-c -v` 彩色详细。

**代理/认证/编码：** `-x http://127.0.0.1:8080`（Burp）`-replay-proxy`；`-b "sessionid=abc"` Cookie；`-cc client.crt -ck client.key` 客户端证书；`-enc 'FUZZ:urlencode'`。

**推荐词表（SecLists，https://github.com/danielmiessler/SecLists）：**
- 目录：`raft-large-directories.txt`、`directory-list-2.3-medium.txt`
- 子域：`subdomains-top1million-5000.txt`
- 参数：`burp-parameter-names.txt`
- 用户名/密码：SecLists Usernames / Passwords

## 示例

```bash
# 目录与文件发现（带扩展名 + 自动校准）
ffuf -w wordlist.txt -u https://target.com/FUZZ -e .php,.html,.txt,.bak -ac -c -v -o results.json

# 子域 / 虚拟主机枚举（先看默认大小再用 -fs 过滤）
ffuf -w subdomains.txt -u https://target.com -H "Host: FUZZ.target.com" -fs 4242 -ac

# 参数名 / 参数值模糊
ffuf -w params.txt -u "https://target.com/script.php?FUZZ=test" -fs 4242
ffuf -w values.txt -u "https://target.com/script.php?id=FUZZ" -fc 401

# POST 登录爆破（限速隐身）
ffuf -w passwords.txt -X POST -d "username=admin&password=FUZZ" -u https://target.com/login -fc 401 -rate 5 -ac

# 递归发现嵌套目录
ffuf -w wordlist.txt -u https://target.com/FUZZ -recursion -recursion-depth 2 -maxtime-job 120 -ac
```

**带认证原始请求（IDOR 利器）：** 从 Burp/DevTools 抓完整请求存 `req.txt`，把要模糊的值替换为 `FUZZ`：
```http
POST /api/v1/users/FUZZ HTTP/1.1
Host: target.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: session=abc123xyz; csrftoken=def456
Content-Type: application/json

{"action":"view","id":"1"}
```
```bash
# 遍历 ID 测 IDOR；FUZZ 可同时出现在 路径/头/body
ffuf --request req.txt -w user_ids.txt -ac -mc 200 -o results.json
# 多 FUZZ 位置 + pitchfork 并行
ffuf --request req.txt -w endpoints.txt:ENDPOINT -w ids.txt:ID -mode pitchfork -ac
```

## 注意事项

- **`-ac` 几乎是强制项**：每次扫描默认带上，尤其要把结果交给 AI 分析时，否则假阳性会淹没真正的异常。
- 带复杂认证（JWT/CSRF/Cookie/自定义头）时，**别硬拼命令行参数**，直接用 `--request req.txt` 最稳。
- 过滤前先看基线响应；组合过滤如 `-fc 403,404 -fs 1234` 更精准；漏结果时用 `-mc all` 或临时关掉 `-ac` 排查。
- 隐身/避免触发 WAF/IDS：`-rate 2 -t 10 -p 0.5-1.5`、随机 UA、代理轮换。
- 太慢：加线程 `-t 100`、缩小词表、`-ignore-body`。
- 执行中按 ENTER 进入交互模式，可动态调过滤、存结果、重启或管理队列。
- 可在 `~/.config/ffuf/ffufrc` 设默认头、线程、超时、匹配状态码。
- 给客户出报告时用 `-of html`/`-of csv`。
- 分析结果时聚焦异常：不同状态码/大小/耗时，留意 admin、api、backup、config、.git；标记报错堆栈、版本信息等潜在风险，并对有价值发现做二次模糊。

## 互见

- 练习靶场：http://ffuf.me ｜ 官方 Wiki：https://github.com/ffuf/ffuf/wiki ｜ Codingo 指南：https://codingo.io/tools/ffuf/bounty/
- 配合 Burp Suite 抓包构造 `req.txt`；词表来源 SecLists。
- 同域（安全/misc）下的其他内容发现、子域枚举与认证测试类技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
