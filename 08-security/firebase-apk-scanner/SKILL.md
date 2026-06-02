---
name: firebase-apk-scanner
title: Android APK Firebase 配置扫描
description: 当需要审计 Android APK 的 Firebase 后端安全配置时使用；反编译 APK、提取 Firebase 配置并测试 Auth/数据库/存储/云函数/Remote Config 端点，产出漏洞与修复清单；不适用于无授权目标、iOS/Web 应用或仅提取配置不测试的场景；触发词：firebase apk 扫描、apk firebase 漏洞、firebase 安全审计、firebaseio 数据库、firestore 越权、storage bucket、cloud functions、mobile security audit
domain: 安全/ops
triggers: [firebase apk 扫描, apk firebase 漏洞, firebase 安全审计, firebaseio 数据库, firestore 越权, storage bucket, cloud functions, mobile security audit]
tags: [security, firebase, apk, android, mobile, pentest, ops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [apktool, curl, scanner.sh, Bash, Grep, Glob, Read]
requires: []
related: [cloud-misconfig-auditor, api-fuzzing-bug-bounty, firmware-reverse-analyst, insecure-defaults-detector]
combines_with: [firebase-backend, cloud-misconfig-auditor, api-fuzzing-bug-bounty]
license: CC-BY-SA-4.0
source: trailofbits/skills
source_license: CC-BY-SA-4.0
---
## 何时使用

适用于在**已获授权**的前提下，审计 Android 应用的 Firebase 后端安全配置：

- 反编译 APK，提取 Firebase 配置并测试 Realtime Database、Firestore、Storage 端点
- 检查认证安全：开放注册（open signup）、匿名认证、邮箱枚举
- 枚举 Cloud Functions 并测试未授权访问
- 检查 Remote Config 是否公开暴露

**不该用的边界（务必遵守）：**

- 没有明确书面授权的目标——禁止扫描
- 未经许可的生产 Firebase 项目——禁止测试
- 仅需提取配置而不测试端点——改用手动 `grep`/`strings` 即可
- iOS、Web 等非 Android 目标——本技能仅针对 APK
- 目标应用根本不使用 Firebase

**拒绝以下导致漏报/降级的借口：** "数据库只读所以没事"（PII/密钥仍可能泄露）；"只是匿名认证"（匿名 token 仍能绕过 `auth != null` 规则）；"API Key 本就公开"（公开 Key 不能为开放规则开脱）；"里面没敏感数据"（未来会存，规则不安全本身就是漏洞）；"是内网 App"（APK 可从任意设备提取）；"上线前会修"（务必记录，预发漏洞常带到生产）。

## 步骤

1. **校验输入**：确认目标 APK 文件或目录存在；若未提供路径，向用户索要。
2. **运行扫描器**：执行随附的 `scanner.sh`，它会自动完成反编译、提取配置、测试各端点并生成文本/JSON 报告。
3. **呈现结果**：读取 `firebase_scan_*/scan_report.txt`，按"扫描概要 / 提取的配置 / 发现的漏洞（含严重级别与证据）/ 修复建议"汇总。
4. **扫描器不可用时**：按下方"指令"手动反编译、提取配置、逐端点测试。

## 指令

校验与扫描：

```bash
ls -la $ARGUMENTS
{baseDir}/scanner.sh $ARGUMENTS
cat firebase_scan_*/scan_report.txt
```

手动反编译与配置提取（PROJECT_ID、API_KEY 等）：

```bash
apktool d -f -o ./decompiled $ARGUMENTS
find ./decompiled -name "google-services.json"
grep -r "firebaseio.com\|appspot.com\|AIza" ./decompiled/res/
grep -r "firebaseio.com\|AIza" ./decompiled/assets/
```

API Key 格式：`AIza[A-Za-z0-9_-]{35}`；提取位置含 `google-services.json`（client[].api_key[].current_key）、`res/values/strings.xml`、`assets/*.json`、smali `const-string`、DEX strings。

端点测试（拿到 PROJECT_ID / API_KEY 后）：

```bash
# 认证：开放注册
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","returnSecureToken":true}' \
  "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=API_KEY"

# 认证：匿名认证
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"returnSecureToken":true}' \
  "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=API_KEY"

# 认证：邮箱枚举（registered 字段会泄露注册状态）
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"identifier":"victim@company.com","continueUri":"https://localhost"}' \
  "https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=API_KEY"

# Realtime Database 读（.json / shallow 探结构）
curl -s "https://PROJECT_ID.firebaseio.com/.json"
curl -s "https://PROJECT_ID.firebaseio.com/.json?shallow=true"
# Realtime Database 写（测试后务必清理）
curl -s -X PUT -H "Content-Type: application/json" \
  -d '{"attacker":"was_here"}' "https://PROJECT_ID.firebaseio.com/_security_test.json"

# Firestore 文档
curl -s "https://firestore.googleapis.com/v1/projects/PROJECT_ID/databases/(default)/documents"

# Storage：列桶（.appspot.com 与裸桶名都试）
curl -s "https://firebasestorage.googleapis.com/v0/b/PROJECT_ID.appspot.com/o"

# Cloud Functions（多 region：us-central1/europe-west1/asia-east1 等）
curl -s "https://us-central1-PROJECT_ID.cloudfunctions.net/functionName"

# Remote Config
curl -s -H "x-goog-api-key: API_KEY" \
  "https://firebaseremoteconfig.googleapis.com/v1/projects/PROJECT_ID/remoteConfig"
```

Cloud Functions 响应码判定：404=不存在，401/403=存在且受保护，200=可访问。

## 示例

某 APK 中提取到 `projectId=demo-app`、`AIzaSy...`。运行扫描器后报告显示：

- **CRITICAL**：`curl https://demo-app.firebaseio.com/.json` 返回完整 `users` 节点（含 email/phone）——Realtime Database 未授权读。
- **HIGH**：匿名注册返回 `idToken`——匿名认证开启，可用该 token 绕过 `auth != null` 规则访问"仅登录"资源。
- **MEDIUM**：`createAuthUri` 对已知邮箱回 `registered:true`——邮箱枚举。

修复方向：数据库规则改为默认 `false` 并按 `$uid === auth.uid` 授权；关闭注册或限制为 Admin SDK；开启 User enumeration protection；Storage/Firestore 默认拒绝、按用户目录授权。

## 注意事项

1. **必须授权**：仅扫描你有权限测试的 APK。
2. **清理测试数据**：扫描器会自动删除其写入的测试条目；手动测试写入后也要手动清除。
3. **保存 token**：匿名认证成功后，用返回的 token 做认证绕过测试。
4. **测试所有 region**：Cloud Functions 可能部署在 us-central1、europe-west1、asia-east1 等。
5. **多实例**：部分应用使用多个 Firebase 项目，测试所有发现的配置。
6. **严重级别**：CRITICAL=未授权数据库读写/存储写/私有应用开放注册；HIGH=匿名认证/桶列举/集合枚举；MEDIUM=邮箱枚举/可访问云函数/Remote Config 暴露；LOW=无敏感数据的信息泄露。

## 互见

详细漏洞模式、利用手法与安全规则范例参见源仓库 references/vulnerabilities.md（涵盖 12 类问题与安全规则写法）。

---

本条采编自 trailofbits/skills（CC-BY-SA-4.0）。
