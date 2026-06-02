---
name: insecure-defaults-detector
title: 不安全默认配置检测
description: 当审计安全、审查配置管理或排查环境变量处理时使用；做静态扫描定位「失败即放行」的不安全默认值（回退密钥、硬编码凭据、默认禁用鉴权、弱加密、过宽权限、调试外泄）并产出带证据的发现清单；不适用于测试夹具、示例模板、纯文档与缺配即崩溃的失败即安全代码；触发词：不安全默认、insecure defaults、回退密钥、fallback secret、硬编码凭据、hardcoded credentials、fail-open、弱加密、weak crypto、CORS 通配、appsec 审计
domain: 安全/appsec
triggers: [不安全默认, insecure defaults, 回退密钥, fallback secret, 硬编码凭据, hardcoded credentials, fail-open, 弱加密, weak crypto, CORS 通配, appsec 审计]
tags: [security, appsec, secrets, code-audit, static-analysis, configuration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob, Bash]
requires: []
related: [security-antipattern-hook, backend-security-coder, env-secrets-hygiene, sast-configurator]
combines_with: [codeql-scanner, false-positive-check, vulnerability-variant-analysis]
license: CC-BY-SA-4.0
source: trailofbits/skills
source_license: CC-BY-SA-4.0
---
## 何时使用

定位「失败即放行（fail-open）」类漏洞：当配置缺失时，应用不崩溃反而以不安全状态继续运行。核心是区分两种形态：

- 失败即放行（严重）：`SECRET = env.get('KEY') or 'default'` → 缺 env 时用弱密钥继续跑。
- 失败即安全（安全，跳过）：`SECRET = env['KEY']` → 缺 env 时直接崩溃，不会带病上线。

适用场景：

- 生产应用的安全审计（鉴权、加密、API 安全）。
- 配置审查：部署文件、IaC 模板、Docker 配置。
- 代码审查：环境变量处理与密钥管理。
- 上线前检查：硬编码凭据或弱默认值。

不该用（负边界，遇到直接跳过，勿报）：

- 明确限定测试环境的夹具：`test/`、`spec/`、`__tests__/` 下文件。
- 示例/模板文件：`.example`、`.template`、`.sample` 后缀。
- 仅开发期的工具：本地 dev 用 Docker Compose、调试脚本。
- README.md 或 docs/ 里的文档示例。
- 构建期占位、部署时会被替换的配置。
- 缺配即崩溃（fail-secure）：没有正确配置就启动不了。

拿不准时：追踪代码路径，判断到底是「用默认值跑下去」还是「崩溃」。

## 步骤

固定四步流水线，逐个候选过一遍：

1. SEARCH 搜索发现。先判定语言、框架与工程约定，据此定位密钥存放点、密钥使用模式、带凭据的第三方集成、加密调用等。重点扫 `**/config/`、`**/auth/`、`**/database/` 与 env 文件，聚焦生产可达代码，排除测试与示例。
2. VERIFY 验证真实行为。对每个命中，追踪代码路径回答：何时执行（启动期 vs 运行期）？配置变量缺失会怎样？是否有强制安全配置的校验？
3. CONFIRM 确认生产影响。生产配置已提供该变量 → 降级（但代码层漏洞仍在）；生产配置缺失或仍走默认值 → CRITICAL。
4. REPORT 带证据报告。给出位置、模式、验证过程、生产影响与可利用性。

## 指令

第 1 步可用如下正则配合 Grep/Bash 搜索（按发现结果裁剪）：

- 回退密钥：`getenv.*\) or ['"]`、`process\.env\.[A-Z_]+ \|\| ['"]`、`ENV\.fetch.*default:`
- 硬编码凭据：`password.*=.*['"][^'"]{8,}['"]`、`api[_-]?key.*=.*['"][^'"]+['"]`
- 弱默认开关：`DEBUG.*=.*true`、`AUTH.*=.*false`、`CORS.*=.*\*`
- 弱加密算法（仅安全上下文）：`MD5|SHA1|DES|RC4|ECB`

速查清单（命中后这样判，✗=报告 / ✓=跳过）：

- 回退密钥 `SECRET = env.get(X) or Y`：✗ 缺 env 仍启动且用于加密/鉴权；✓ 测试夹具、示例文件。
- 默认凭据：硬编码 `username`/`password`：✗ 部署配置生效且无运行期覆盖；✓ 已禁用账户、文档示例。
- 失败即放行 `AUTH_REQUIRED = env.get(X, 'false')`：✗ 默认值不安全（false/disabled/通配）；✓ 崩溃或默认安全（true/enabled/受限）。
- 弱加密 MD5/SHA1/DES/RC4/ECB：✗ 用于口令、加密或令牌；✓ 校验和、非安全哈希。
- 过宽访问：CORS `*`、权限 `0777`、默认公开：✗ 默认即允许未授权访问；✓ 有说明的显式放宽。
- 调试外泄：堆栈、内省、详细错误：✗ 默认开启且出现在响应里；✓ 仅日志、不面向用户。

要拒绝的自我开脱：「只是开发默认值」（进了生产代码就是发现）；「生产配置会覆盖」（须证实 prod 配置存在，否则代码层漏洞仍在）；「没正确配置根本跑不起来」（用代码追踪证明，很多应用会静默失败）；「反正有鉴权挡着」（纵深防御，会话被劫后弱默认仍可利用）；「发布前会修」（先记录，「以后」往往不来）。

## 示例

漏洞（应报告）—— Python 回退密钥：

```python
# src/auth/jwt.py
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-123')
def create_token(user_id):
    return jwt.encode({'user_id': user_id}, SECRET_KEY, algorithm='HS256')
```

为何危险：缺 `SECRET_KEY` 时用已知密钥继续跑，攻击者可伪造令牌。

安全（应跳过）—— 失败即安全：

```python
SECRET_KEY = os.environ['SECRET_KEY']  # 缺则抛 KeyError，应用无法启动
```

报告范例：

```
Finding: Hardcoded JWT Secret Fallback
Location: src/auth/jwt.ts:15
Pattern: const secret = process.env.JWT_SECRET || 'default';
Verification: 无 JWT_SECRET 也能启动；该 secret 在第 42 行 jwt.sign() 中使用
Production Impact: Dockerfile 未设置 JWT_SECRET
Exploitation: 攻击者用 'default' 伪造 JWT，获得未授权访问
```

更多正反例（弱加密 MD5→bcrypt/Argon2、DES/ECB→AES/GCM、CORS、S3 `public-read`、`0o666`→`0o600`、GraphQL introspection、堆栈外泄等）见源仓库 references/examples.md 的整理。

## 注意事项

- 务必区分「用于安全」与「非安全」：缓存键用 MD5 可接受，口令哈希用 MD5 必报。
- 默认开关只看默认分支：`env.get('DEBUG','false')` 安全，`env.get('DEBUG','true')` 危险。
- CORS `*` 叠加 `Access-Control-Allow-Credentials: true` 危害放大，可被任意站点窃取凭据。
- 降级不等于不报：生产配置覆盖了默认值，代码层漏洞依然存在，应记录。

## 互见

- code-reviewer：通用代码审查中并行排查此类安全默认值。
- dependency-auditor：与依赖/供应链审计互补，覆盖第三方引入的弱默认。

本条采编自 trailofbits/skills（CC-BY-SA-4.0）。
