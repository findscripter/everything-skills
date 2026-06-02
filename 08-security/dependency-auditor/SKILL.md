---
name: dependency-auditor
title: 依赖与供应链审计
description: 当需要审计第三方依赖的已知漏洞、许可证风险、可疑/废弃包与供应链风险时使用；触发词：依赖审计、CVE、漏洞扫描、供应链、SCA、license 合规。
domain: 安全/audit
tags: [security, audit, dependencies, sca]
level: 进阶
status: stable
version: 0.1.0
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [supply-chain-risk-auditor, agent-skill-security-scanner, sast-configurator, oss-license-compliance]
combines_with: [supply-chain-risk-auditor, container-security-hardening, false-positive-check]
license: CC-BY-SA-4.0
---
# 依赖与供应链审计

## 何时使用
需要对第三方依赖做安全/合规体检时使用：扫描已知漏洞（CVE）、检查许可证合规、识别废弃/可疑/被劫持包、评估供应链风险（typosquat、恶意 postinstall、未锁定版本）。触发词：依赖审计、CVE、漏洞扫描、供应链、SCA、license 合规。

**不该用**：
- 审计自有代码逻辑漏洞（注入、鉴权缺陷）→ 用 `code-reviewer`，本技能只看依赖。
- 仅想升级依赖/修依赖冲突而无安全诉求 → 用包管理器原生命令即可。
- 运行时入侵检测、密钥泄露扫描 → 超出范围。

## 步骤 / 指令
1. **识别生态**：定位锁文件确定包管理器与工具链。
   - `package-lock.json`/`yarn.lock`/`pnpm-lock.yaml` → npm；`requirements.txt`/`poetry.lock`/`uv.lock` → pip；`go.sum` → go；`Cargo.lock` → cargo；`pom.xml`/`build.gradle` → maven/gradle。
2. **要求锁文件存在**：无锁文件先停。提示用户生成（`npm install`/`pip freeze`/`go mod tidy`），否则版本不可复现，审计结论无效。
3. **跑漏洞扫描**：用生态原生命令（见示例）。优先 `--json` 输出便于解析。
4. **分级**：按 severity（critical/high/medium/low）排序。仅 critical/high 默认要求处置；medium/low 列为待办。区分 direct vs transitive 依赖。
5. **过滤可达性**：剔除 devDependencies-only、无可达调用路径或已有 vendor patch 的告警，避免噪声。
6. **许可证合规**：列出每个依赖 license，标红 copyleft（GPL/AGPL/LGPL）与未知/无许可证项；对照项目许可策略判断冲突。
7. **可疑/废弃包**：检查 deprecated 标记、长期未维护（>1~2 年无发布）、维护者突变、安装脚本（`postinstall`/`preinstall`）、与知名包高度相似命名（typosquat）。
8. **给修复**：每条 critical/high 输出「升级到的最低安全版本」或「替代包」或「移除」；指出是否破坏性升级（major）。
9. **输出报告**：结构为 摘要计数 → critical/high 明细（含 CVE 号、受影响版本、修复版本、依赖路径）→ 许可证风险 → 可疑包 → 建议执行命令。不要把 low 噪声塞进摘要。

## 示例
扫描命令（按生态二选一）：
```bash
# npm / yarn / pnpm
npm audit --json
pnpm audit --json
# python（任选其一）
pip-audit -r requirements.txt -f json
osv-scanner --lockfile=poetry.lock --format=json
# go
govulncheck ./...
osv-scanner --lockfile=go.sum
# rust
cargo audit --json
# 跨生态通用（推荐统一入口）
osv-scanner scan -r . --format=json
```

许可证盘点：
```bash
npx license-checker --json --summary      # node
pip-licenses --format=json                # python
go-licenses report ./...                  # go
```

报告片段（最小格式）：
```
摘要：critical 1 | high 2 | medium 4（仅列前两类）
[CRITICAL] CVE-2024-XXXX  lodash@4.17.19  → 升级 4.17.21
  路径: app > a-lib > lodash（transitive）
[HIGH] ... 修复: npm i pkg@2.3.1（破坏性，需测试）
许可证风险：some-pkg@1.2.0 = GPL-3.0（与项目 MIT 冲突，建议替换）
可疑包：colour-string@0.0.1（疑似 typosquat of color-string；含 postinstall）
```

## 注意事项
- **离线限制**：漏洞库需联网拉取最新数据。无网络时结论可能漏报，须在报告中声明数据库时效。
- **不要自动升级**：本技能只给建议，执行 `npm audit fix --force` 类破坏性修复前必须经人确认，major 升级易引入回归。
- **transitive 漏洞**：修复点常在间接依赖，靠 `overrides`/`resolutions`/`replace` 强制版本，而非改 direct 依赖。
- **CVE ≠ 可利用**：结合可达性与运行上下文降噪，避免对不可达漏洞过度告警；但不得擅自忽略 critical。
- **不执行可疑包脚本**：审计中绝不运行未知包的安装脚本；分析 typosquat/恶意包用静态查看，不 `install`。
- **多锁文件/monorepo**：逐 workspace 扫描，勿只扫根目录。
- 漏洞与修复版本以**扫描工具实时输出**为准，不要凭记忆填 CVE 号或版本。

## 互见
- related：`code-reviewer` —— 依赖审计看第三方包风险，code-reviewer 看自有代码缺陷，二者覆盖面互补。
