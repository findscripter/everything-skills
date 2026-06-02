---
name: supply-chain-risk-auditor
title: 供应链依赖风险评估
description: 当需要在安全审计前评估项目第三方依赖的"被接管/被投毒"风险、梳理供应链攻击面或做接单前定级时使用；逐个核查直接依赖的维护者、活跃度、流行度、高危特性、历史 CVE 与安全联系人，产出高风险依赖清单与替代建议报告；不适用于运行时漏洞扫描、License 合规或主动 CVE 扫描（用 npm audit / pip-audit）。触发词：审计依赖、供应链风险、依赖风险评估、依赖健康度、攻击面、supply chain audit、dependency risk、audit this project's dependencies。
domain: 安全/audit
triggers: [审计依赖, 供应链风险, 依赖风险评估, 依赖健康度, 攻击面, supply chain audit, dependency risk, audit this project's dependencies]
tags: [security, supply-chain, dependency, audit, risk-assessment, github]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gh, Read, Write, Bash, Glob, Grep]
requires: []
related: [dependency-auditor, agent-skill-security-scanner, oss-license-compliance, sast-configurator]
combines_with: [dependency-auditor, agent-skill-security-scanner, container-security-hardening]
license: CC-BY-SA-4.0
source: trailofbits/skills
source_license: CC-BY-SA-4.0
---
## 何时使用

适用：
- 在正式安全审计前评估依赖风险、为接单做攻击面定级（pre-engagement scoping）
- 梳理项目供应链攻击面，识别无人维护或高危的依赖
- 判断哪些依赖最可能被投毒、接管或长期失修

不该用（负边界）：
- 主动漏洞/CVE 扫描——用 `npm audit`、`pip-audit` 等专用工具
- 运行时依赖行为分析
- License 合规审计

本技能是定性的"风险面评估"，回答"哪些依赖值得警惕"，不替代自动化漏洞扫描器。

## 步骤

整体流程：初始化 → 逐个评估 → 汇总成报告。

1. 初始化
   - 建工作目录 `.supply-chain-risk-auditor/`，在其中基于模板新建 `results.md`。
   - 找出所有直接依赖对应的 git 仓库。
   - 把仓库标识统一规范成完整 URL（若只有 `owner/repo` 形式，补全为 `https://github.com/owner/repo`）。
2. 逐依赖审计：对每个依赖按下方"风险判据"逐条核查；任意命中一条即记入 `results.md` 的高风险表，并写明命中原因。低风险依赖直接跳过——不在报告里列"组织背书/低风险"这类反向条目，"不在报告中"本身即代表低风险。
3. 审计后收尾：
   - 为每条高风险依赖填"建议替代项"（功能相同/相近、更流行、维护更好，优先直接后继或可平替），附一句理由。
   - 在"按风险因素统计"表里汇总各类计数，在"执行摘要"里概述整体安全态势。
   - 在"建议"小节给出处置建议。不要新增模板之外的小节。

## 指令

前置：确认 `gh` 可用，不可用则请用户先安装 GitHub CLI。

风险判据（命中任意一条即为高风险）：
- 单一维护者/小团队：项目主要由个人或极少数人维护，非 Linux 基金会、微软等组织/公司托管。知名高产作者（如 sindresorhus、Drew Devault）风险降低但不消除；维护者身份匿名（GitHub 身份无法对应真实身份）则风险显著升高。理由：维护者一旦被贿赂或钓鱼即可单方面推恶意代码（参考 left-pad 事件）。
- 无人维护：长期无更新，或显式 deprecated/archived；README 或 issue 中声明项目停滞、缺人、求接手；大量报 bug/安全问题的 issue 长期无响应（功能请求类 issue 不计入）。理由：漏洞难以被及时修复。
- 流行度低：相比目标项目用到的其它依赖，star/下载量明显偏低。理由：用的人少，恶意代码不易被及时发现。
- 高危特性：天然易被利用的能力，如 FFI、反序列化、执行第三方代码。理由：这类依赖对目标安全态势至关重要，需更高审查标准。
- 历史高危 CVE：存在 high/critical 级 CVE，尤其相对其流行度与复杂度数量偏多。理由：但极流行项目因受更多审查而 CVE 偏多，未必代表更危险，需结合判断。
- 缺安全联系人：`.github/SECURITY.md`、`CONTRIBUTING.md`、`README.md` 或官网均无安全上报渠道。理由：漏洞发现者难以安全、及时地上报。

数据准确性（关键约束）：凡涉及计数（star 数、open issue 数等），必须用 `gh` 查询真实数据，不得臆测。可用 `~` 近似表示，如 "~4000 stars"。

## 示例

用 `gh` 拉取仓库元数据用于核查流行度与维护状态：

```bash
gh repo view owner/repo --json stargazerCount,pushedAt,isArchived,licenseInfo
```

统计未关闭 issue（核查"无人维护"判据）：

```bash
gh issue list -R owner/repo --state open --limit 1 --json number | jq length
# 或直接看总数
gh api repos/owner/repo --jq '.open_issues_count'
```

高风险表行示例（写入 `results.md`）：

| Dependency | Risk Factors | Notes | Suggested Alternative |
|---|---|---|---|
| left-pad | 单一维护者, 流行度低 | 单人维护、匿名背景、可被单方面发布 | **String.prototype.padStart** - 标准库内置，无需第三方依赖 |

## 注意事项

- 只记命中风险的依赖，保持报告精简；不要列反向（低风险）条目。
- 不要新增 `results-template.md` 之外的小节。
- 引用的所有数字必须来自 `gh` 实测，可用 `~` 近似但不可编造。
- 高产/知名维护者只降低风险、不清零；匿名维护者风险更高。
- CVE 数量需结合流行度解读，避免对热门项目误判。

## 互见

- dependency-auditor：偏向已知漏洞/版本层面的依赖审计，可与本技能的定性风险面评估互补。
- code-reviewer：审到具体依赖的高危特性（FFI、反序列化等）时，可下钻做代码层审查。

---

本条采编自 trailofbits/skills（CC-BY-SA-4.0）。
