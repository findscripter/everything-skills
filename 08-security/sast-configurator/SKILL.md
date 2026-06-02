---
name: sast-configurator
title: SAST静态扫描配置
description: 当需要为应用代码搭建自动化漏洞静态扫描（SAST）、落地 DevSecOps 或在 CI/CD 中接入安全门禁时使用；产出 Semgrep/SonarQube/CodeQL 的配置、自定义规则与流水线集成方案；不适用于运行时动态测试（DAST）、依赖组件漏洞审计（用 dependency-auditor）或纯人工代码评审；触发词：SAST、静态应用安全测试、static analysis、Semgrep、SonarQube、CodeQL、代码漏洞扫描、安全门禁、DevSecOps
domain: 安全/appsec
triggers: [SAST, 静态应用安全测试, static analysis, Semgrep, SonarQube, CodeQL, 代码漏洞扫描, 安全门禁, DevSecOps, 自定义安全规则]
tags: [security, appsec, sast, semgrep, sonarqube, codeql, devsecops, ci-cd, vulnerability-scanning]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Semgrep, SonarQube, CodeQL, GitHub Actions, GitLab CI, Jenkins, Docker, pre-commit, SARIF]
requires: []
related: [codeql-scanner, semgrep-rule-creator, dependency-auditor, security-antipattern-hook]
combines_with: [semgrep-rule-creator, ci-cd-pipeline-builder, dependency-auditor]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

适用于：

- 为应用代码搭建自动化静态漏洞扫描（SAST），在 CI/CD 流水线中接入安全门禁。
- 编写贴合自身代码库的自定义安全规则，治理误报。
- 落地 DevSecOps、满足合规扫描（PCI-DSS、SOC 2 等）。
- 组合多款 SAST 工具实现纵深防御。

不该用于（负边界）：

- 运行时/动态安全测试（DAST、渗透测试）——SAST 只看源码不跑程序。
- 第三方依赖与组件的已知漏洞审计——改用 `dependency-auditor`。
- 纯人工代码评审或逻辑缺陷复查——改用 `code-reviewer`。

工具选型速查：

| 工具 | 擅长 | 语言 | 成本 | 集成 |
| --- | --- | --- | --- | --- |
| Semgrep | 自定义规则、快速扫描 | 30+ | 免费/企业版 | 极佳 |
| SonarQube | 代码质量+安全 | 25+ | 免费/商业版 | 良好 |
| CodeQL | 深度分析、安全研究 | 10+ | 免费(OSS) | GitHub 原生 |

## 步骤

1. 盘点代码库主力语言，明确合规要求（PCI-DSS、SOC 2 等），据此选工具。
2. 先跑一次基线扫描，摸清现状，优先处理 critical/high 级别。
3. 安装并最小化接入工具（见下方指令）。
4. 编写组织专属自定义规则，治理误报、建立白名单。
5. 接入 CI/CD 与 pre-commit，仅对 critical 问题设为阻断（blocking）。
6. 输出 SARIF 结果，沉淀整改路线图并培训团队。

## 指令

基础安装与启动：

```bash
# Semgrep
pip install semgrep
semgrep --config=auto --error

# SonarQube（Docker）
docker run -d --name sonarqube -p 9000:9000 sonarqube:10.8-community

# CodeQL CLI
gh extension install github/gh-codeql
codeql database create mydb --language=python
```

合规专项扫描并导出 JSON：

```bash
semgrep --config p/pci-dss --json -o pci-scan-results.json
```

## 示例

GitHub Actions 集成 Semgrep（采用官方规则集）：

```yaml
- name: Run Semgrep
  uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/security-audit
      p/owasp-top-ten
```

pre-commit 钩子（`.pre-commit-config.yaml`）：

```yaml
- repo: https://github.com/returntocorp/semgrep
  rev: v1.45.0
  hooks:
    - id: semgrep
      args: ['--config=auto', '--error']
```

自定义规则示例（禁止硬编码 JWT 密钥）：

```yaml
rules:
  - id: hardcoded-jwt-secret
    pattern: jwt.encode($DATA, "...", ...)
    message: JWT secret should not be hardcoded
    severity: ERROR
```

## 注意事项

- 先建基线再设阻断：增量采纳，安全规则先行、质量规则后补，只对 critical 阻断。
- 误报治理：用 path 过滤排除测试文件/生成代码，给已知安全模式建白名单，对噪声模式用 `nostmt` 元数据，所有抑制都要留文档并定期复审。
- 性能优化：排除测试与生成代码、对大仓启用增量扫描、并行化各模块、在 CI 中缓存依赖与扫描结果。
- 集成排障：校验 API token/凭据、检查代理与网络、确认 SARIF 输出格式兼容、核对 CI runner 权限。

## 互见

- `dependency-auditor`：第三方依赖与组件漏洞审计（SAST 之外的另一道防线）。
- `code-reviewer`：人工逻辑与质量评审，与自动化 SAST 互补。

---

本条采编自 wshobson/agents（MIT 许可证）。
