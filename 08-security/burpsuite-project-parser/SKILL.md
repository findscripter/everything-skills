---
name: burpsuite-project-parser
title: Burp Suite 工程文件命令行解析
description: 当需要从命令行检索、提取 Burp Suite 工程文件（.burp）中的审计发现、代理历史、站点地图或 HTTP 流量时使用；做用正则按响应头/响应体搜索、抽取 auditItems、按子组件过滤器分块取数并产出 JSON 结果；不适用于直接解析 .burp（依赖 Burp Pro + 解析扩展）、未授权数据或全量 dump；触发词：.burp、proxyHistory、auditItems、responseHeader 正则、Burp 工程解析
domain: 安全/audit
triggers: [解析 .burp 工程文件, proxyHistory 子组件过滤, auditItems 审计项, responseHeader 正则搜索, responseBody 搜索, siteMap 站点地图, Burp 命令行解析, 代理历史 dump]
tags: [安全, Burp Suite, 工程文件解析, 命令行, 审计项, 代理历史, 正则检索]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Burp Suite Professional, burpsuite-project-file-parser 扩展, Java, jq, bash]
requires: []
related: [burp-suite-testing, api-fuzzing-bug-bounty, false-positive-check, security-audit-toolkit]
combines_with: [penetration-testing-methodology, ffuf-web-fuzzing, red-team-recon]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Burp Suite 工程文件命令行解析

> 仅限授权使用：只能解析你有权访问的 Burp 工程文件（.burp）；其中的请求/响应可能含敏感数据，按数据处理合规要求对待。

## 何时使用

- 在命令行批量检索 `.burp` 工程：用正则搜响应头/响应体、抽取安全审计发现、导出代理历史或站点地图。
- 想把 Burp 抓到的 HTTP 流量喂给脚本/Agent 做分析，而不想在 GUI 里一条条翻。
- 已安装 **Burp Suite Professional** 且加载了 **burpsuite-project-file-parser** 扩展（本技能不直接解析 .burp，而是委托 Burp 完成）。

**不该用的边界：**
- 没有 Burp Pro 或没装解析扩展时不可用——这是硬前置，没有它就解析不了。
- 不要对全量 `proxyHistory` / `siteMap` 直接 dump（可达 GB 级，会撑爆上下文）；务必用子组件过滤器。
- 响应体（response body）正则搜索默认危险，单条可达 MB；不需要正文时只搜 headers。
- 未授权的工程文件、纯 GUI 交互式测试（用 `burp-suite-testing`）、非 Burp 来源的流量，都不在范围内。

## 前置准备

1. 安装 **Burp Suite Professional**（portswigger.net/burp/pro）。
2. 安装 **burpsuite-project-file-parser** 扩展：从 github.com/BuffaloWill/burpsuite-project-file-parser 下载 JAR，在 Burp 中 `Extender > Extensions > Add` 选中该 JAR。
3. 配置两个环境变量供包装脚本定位 Burp 自带的 Java 与 JAR：

```bash
# macOS
export BURP_JAVA="/Applications/Burp Suite Professional.app/Contents/Resources/jre.bundle/Contents/Home/bin/java"
export BURP_JAR="/Applications/Burp Suite Professional.app/Contents/Resources/app/burpsuite_pro.jar"
# Linux
export BURP_JAVA="/opt/BurpSuiteProfessional/jre/bin/java"
export BURP_JAR="/opt/BurpSuiteProfessional/burpsuite_pro.jar"
```
```powershell
# Windows
$env:BURP_JAVA = "C:\Program Files\BurpSuiteProfessional\jre\bin\java.exe"
$env:BURP_JAR  = "C:\Program Files\BurpSuiteProfessional\burpsuite_pro.jar"
```

调用形式：`scripts/burp-search.sh /path/to/project.burp [FLAGS]`。不用包装脚本可直接调：
```bash
"$BURP_JAVA" -jar -Djava.awt.headless=true "$BURP_JAR" --project-file=/path/to/project.burp [FLAGS]
```

## 步骤

1. **先量体积，再取数**（最关键）。任何检索前用 `wc -cl` 同时看字节数与行数，**两者都要过关**才取：
   ```bash
   scripts/burp-search.sh project.burp proxyHistory | wc -cl   # 输出：<字节> <行>
   ```
   判据：安全 < 50 行 / < 50KB；200+ 行或 200KB+ 偏大需收窄；1000+ 行或 1MB+ 必须停手收窄。注意单条 10MB 响应只占 1 行——字节检查专门兜这种。
2. **优先审计项**。`auditItems` 小且无正文，安全检索，是漏洞分诊起点。
3. **代理历史/站点地图必用子组件过滤器**，不要全量 dump（见下表）。默认只取 headers，不取 body。
4. **需要正文时按 URL 定向取并强制截断**正文到 1000 字符。
5. **统一截断输出**：所有结果再过 `head -c 50000`（≤50KB）。
6. **人工复核**：Burp 的发现是线索不是结论，逐条手工验证。

子组件过滤器（务必用这些，别全量 dump）：

| 过滤器 | 返回 | 体积 |
|---|---|---|
| `proxyHistory.request.headers` | 请求行+请求头 | 小（<1KB/条） |
| `proxyHistory.response.headers` | 状态+响应头 | 小（<1KB/条） |
| `proxyHistory.request.body` | 仅请求体 | 不定 |
| `proxyHistory.response.body` | 仅响应体 | **大——避免** |
| `siteMap.*`（同上四种） | 站点地图对应数据 | 同上 |

## 指令

正则检索响应头（输出 `{"url":...,"header":...}`）：
```bash
scripts/burp-search.sh project.burp "responseHeader='.*(nginx|Apache|Servlet).*'" | head -c 50000
```

正则检索响应体——**必须把 .body 截断到 1000 字符**：
```bash
scripts/burp-search.sh project.burp "responseBody='.*password.*'" | \
  head -n 10 | jq -c '.body = (.body[:1000] + "...[TRUNCATED]")'
```

抽取审计发现（含 name/severity/confidence/host/port/protocol/url）：
```bash
scripts/burp-search.sh project.burp auditItems | jq -c 'select(.severity=="High")' | head -n 100
```

**硬规则：**
- 所有输出一律 `head -c 50000`（≤50KB）。
- `.body` 字段一律截断 1000 字符，无例外；需要看完整正文请用户去 Burp GUI 看。
- 绝不在未计数+未截断时跑：`proxyHistory` / `siteMap` 全量、`responseBody='...'`、或 `.*` `.+` 之类宽正则。

## 示例

调查工作流（审计项 → 置信度 → URL → 原始流量 → 人工验证）：
```bash
# 1. 先看高危发现
scripts/burp-search.sh project.burp auditItems | jq 'select(.severity=="High")'
# 2. 只留可行动置信度
... | jq 'select(.confidence=="Certain" or .confidence=="Firm")'
# 3. 抽受影响 URL（攻击面）
... | jq -r '.url' | sort -u
# 4. 定向取响应头里某类内容
scripts/burp-search.sh project.burp proxyHistory.response.headers | \
  jq -c 'select(.url | test("/api/"))' | head -n 50
```

找 CORS 头：
```bash
scripts/burp-search.sh project.burp "responseHeader='.*Access-Control.*'" | head -c 50000
```

## 注意事项

- **严防上下文溢出**：先 `wc -cl` 计数、用子组件过滤器、截断 body 到 1000、总输出 ≤50KB。这是本技能的核心纪律。
- **审计项需双维度分诊**：同时看 severity（High/Medium/Low）与 confidence（Certain/Firm/Tentative）。「High + Tentative」常是误报，不要只凭严重度上报。
- **代理历史可能不完整**：受 scope 过滤、Intercept 丢包、浏览器未走代理影响，只反映 Burp 实际捕获到的流量；缺料时回原工程查 scope/proxy 设置。
- **响应体编码坑**：可能 gzip/分块/非 UTF-8，明文正则会静默失配；结果偏少时先检查是否压缩、改搜 headers，或回 GUI 看原始响应。
- **要拒绝的偷懒理由**：「正则看着没问题」（先在样本上验，转义/编码会静默失败）、「High 就得修」（查置信度）、「Burp 报了就是漏洞」（须人工验证，发现只是线索）。
- 输出均为 JSON、每行一对象，配 `jq` 格式化或 `grep -i` 过滤。

## 互见

- related：`burp-suite-testing` —— GUI 交互式抓包改包/Repeater/Intruder/Scanner 测试；本技能是其工程文件的离线命令行解析补充。
- combines_with：`red-team-recon`、`api-fuzzing-bug-bounty` —— 用解析出的审计项/URL 攻击面驱动后续侦察与接口模糊测试。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
