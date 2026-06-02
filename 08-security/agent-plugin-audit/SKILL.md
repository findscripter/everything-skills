---
name: agent-plugin-audit
title: Agent 插件安全审计
description: 当要把一个技能/插件/Agent/命令合入或发布前做一次性全量闸门时使用；做结构+质量+脚本+安全+市场合规+生态集成+代码评审的 8 阶段审计并产出 PASS/带警告 PASS/FAIL 的闸门报告（自动修非关键项）；不适用于运行时沙箱、单纯安全扫描（用 agent-skill-security-scanner）、CVE 实时联网核验；触发词：审计这个插件、发布前闸门、plugin audit、技能合规检查、上架前检查、8 阶段审计、quality gate
domain: 安全/appsec
triggers: [审计这个插件, 发布前闸门, 上架前检查, 技能合规检查, 8 阶段审计, plugin audit, quality gate, pre-publish check]
tags: [security, appsec, plugin-audit, publish-gate, quality-gate, marketplace-compliance, ci-gate, skill-validation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, skill_validator.py, quality_scorer.py, script_tester.py, skill_security_auditor.py, git]
requires: []
related: [agent-skill-security-scanner, agentic-actions-auditor, dependency-auditor, adversarial-code-reviewer]
combines_with: [skill-creator, supply-chain-risk-auditor]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
# Agent 插件安全审计

## 何时使用

- 在把一个技能 / 插件 / Agent / 命令合入主干或上架插件市场前，要跑一次**端到端发布闸门**，一次覆盖结构、质量、脚本、安全、市场合规、生态集成、代码评审。
- 想要可重复、可进 CI 的「准入/拒绝」判定，并自动修掉非关键问题、只在关键决策（破坏性变更、引入新依赖）上停下来问人。

不该用的边界：
- 只想做**纯安全静态扫描**（危险模式、提示注入、供应链）时，用更聚焦的 `agent-skill-security-scanner`，不必跑全 8 阶段。
- 不做运行时沙箱 / 动态执行，也不联网实时核验 CVE；安全阶段用的是内置静态规则。
- 强依赖本仓自带的校验脚本（`skill_validator.py` / `quality_scorer.py` / `script_tester.py` / `skill_security_auditor.py`）；脱离该工具链时按下方「指令」中的等价判据手工执行。

## 步骤

按顺序跑 8 个阶段，遇关键失败即停，非关键问题自动修复，最后出报告。

1. **发现（Discovery）**：确认 `{skill_path}` 存在且含 `SKILL.md`；读 frontmatter 取 `name/description/Category/Tier`；探测子目录（`scripts/`→有脚本、`references/`→有参考、`assets/`→有模板、`agents/`→内嵌 Agent、`skills/`→复合技能、`.claude-plugin/plugin.json`→独立插件）；从路径推断 domain；在 `commands/` 找同名命令。先打印发现摘要再继续。
2. **结构校验（Structure）**：跑 `skill_validator.py`，取总分与合规级、失败检查项。**闸门：分数 ≥ 75**。低于则自动补全（缺字段→从正文补、缺小节→补桩标题、缺目录→建空目录加说明），重跑；仍 < 75 记 FAIL 但继续收集后续结果。
3. **质量评分（Quality）**：跑 `quality_scorer.py`，取总分/等级、四维分（文档/代码质量/完整度/可用性）、改进路线项。**闸门：分数 ≥ 60**；低于则把路线项列为行动项。
4. **脚本测试（Scripts）**：有 `scripts/*.py` 才跑 `script_tester.py`。**闸门：所有脚本必须 PASS**，任何 FAIL 即阻断，PARTIAL 触发警告。自动修：`--help` 失败查是否缺 `argparse`；若 stdlib-only 失败，标出该 import 并**询问用户**是否接受该依赖（关键决策）。
5. **安全审计（Security）**：跑 `skill_security_auditor.py --strict`，取裁决（PASS/WARN/FAIL）、CRITICAL/HIGH/INFO 发现。**闸门：CRITICAL 与 HIGH 均须为 0**，任一即阻断（报出文件、行号、模式、修复建议）。**安全问题不自动修**，报告后交用户决定。
6. **市场与插件合规（Marketplace）**：校验 `plugin.json`（仅允许 `name/description/version/author/homepage/repository/license/skills` 字段、版本须与仓库版本一致、`skills` 取约定值、`name` 与目录名一致）；校验 `settings.json` 中 `commands` 是否都有对应文件；核对 `marketplace.json` 条目与父域 `plugin.json` 的技能计数。自动修：更新陈旧计数、修版本不一致、删多余字段。
7. **生态集成（Ecosystem）**：核对跨平台索引（如 `.codex/` `.gemini/` 索引）含本技能，缺则重跑同步脚本；校验关联命令的 YAML frontmatter、引用路径与文档导航；校验内嵌 Agent 的 frontmatter 与相对路径；核对 SKILL.md 中对其他技能的引用是否真实存在。自动修：补缺的导航/索引条目。
8. **领域化代码评审（Code Review）**：按 domain 选对应 Agent 视角（如 `engineering/`→cs-senior-engineer、`product-team/`→cs-product-manager、其它→cs-senior-engineer），用其评审标准检查工作流可执行性、脚本正确性、参考准确性、模板可用性、无死链、署名齐全。这是**借用 Agent 的书面视角组织评审，并非派生子 Agent**。

## 指令

```bash
# 用法
/plugin-audit <skill-path>

# 各阶段核心命令（路径相对仓库根；{skill_path} 为待审目标）
python3 engineering/skill-tester/scripts/skill_validator.py {skill_path} --tier {tier} --json     # 阶段2 结构
python3 engineering/skill-tester/scripts/quality_scorer.py {skill_path} --detailed --json          # 阶段3 质量
python3 engineering/skill-tester/scripts/script_tester.py {skill_path} --json --verbose             # 阶段4 脚本
python3 engineering/skill-security-auditor/scripts/skill_security_auditor.py {skill_path} --strict --json   # 阶段5 安全
```

**裁决逻辑**：

| 条件 | 裁决 |
|---|---|
| 全部阶段通过 | **PASS** —— 可合并/发布 |
| 仅有警告、无阻断 | **带警告 PASS** —— 合并前先看警告 |
| 任一阶段有阻断 | **FAIL** —— 列出阻断点与修复指引 |

**阻断项（任一即 FAIL）**：结构分 < 75；质量分 < 60；任一脚本 FAIL；任一 CRITICAL/HIGH 安全发现；`plugin.json` 无效或含非法字段；版本与仓库不一致。

**非阻断（仅警告）**：质量分在 60–75；脚本 PARTIAL；某平台索引缺失（自动修）；缺导航条目（自动修）；安全 INFO 发现。

## 示例

最终报告（结构示意）：

```
PLUGIN AUDIT REPORT: {skill_name}
  Phase 1 — Discovery     OK  {type}, {domain}
  Phase 2 — Structure     OK  {score}/100 ({level})    # 闸门 ≥75
  Phase 3 — Quality       OK  {score}/100 ({grade})    # 闸门 ≥60
  Phase 4 — Scripts       OK  {n}/{n} PASS
  Phase 5 — Security      OK  PASS (0 critical, 0 high)
  Phase 6 — Marketplace   OK  plugin.json valid
  Phase 7 — Ecosystem     OK  Codex + Gemini synced
  Phase 8 — Code Review   OK  {domain} review passed
  VERDICT: PASS — 可合并/发布
  Auto-fixes: {n}   Warnings: {n}   Action items: {n}
```

## 注意事项

- 阶段顺序固定，但**关键失败即停**：脚本非 stdlib-only 依赖、安全 CRITICAL/HIGH 都属关键决策，必须停下问人或交人裁决，不可静默放行。
- **安全发现绝不自动修**——只报告（文件/行号/模式/建议），由人决定整改方式；其余非关键项（缺字段、陈旧计数、缺索引/导航）可自动修后重校。
- `plugin.json` 的 `version` 必须与当前仓库版本一致，且字段白名单严格；多余字段一律删除。
- 本条是**全量发布闸门**，与纯安全扫描 `agent-skill-security-scanner` 分工：前者覆盖结构/质量/脚本/合规/生态/评审 6 个非安全维度，后者把安全静态扫描做深；两者可串联（先安全扫描排雷，再跑全量闸门定准入）。

## 互见

- related：`agent-skill-security-scanner` —— 安装前纯安全静态扫描，本条第 5 阶段的深化与替代选项。
- related：`agentic-actions-auditor` —— 审计 Agent 实际可执行动作的越权与副作用，补足代码评审视角。
- related：`dependency-auditor` —— 依赖供应链与已知漏洞深度核验，承接脚本/合规阶段的依赖发现。
- combines_with：`false-positive-check` —— 复核安全阶段发现，过滤误报后再给最终裁决。

本条采编自 alirezarezvani/claude-skills（MIT）。
