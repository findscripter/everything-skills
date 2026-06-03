---
name: skill-ecosystem-auditor
title: 技能生态审计：质量、安全、成本与重复检测
description: 当要对整个技能/插件生态（多条技能）做体检、跑趋势对比或补缺口时使用；做代码质量/安全/性能/治理/文档/依赖/跨技能 7 维加权评分 + 成本优化 + 重复检测 + 缺口分析，产出分级 findings、健康报告与新技能建议；不适用于单条技能安装前安全扫描（用 agent-skill-security-scanner）、单条发布闸门（用 agent-plugin-audit）、运行时沙箱与 CVE 实时联网核验；触发词：审计技能生态、技能健康度、技能质量评分、重复技能检测、技能缺口分析、优化技能成本、audit skills ecosystem、skill health report
domain: 安全/audit
triggers: [审计技能生态, 技能健康度, 技能质量评分, 重复技能检测, 技能缺口分析, 优化技能成本, audit skills ecosystem, skill health report]
tags: [security, misc, governance, audit, skill-health, quality-scoring, cost-optimization, duplication-detection, gap-analysis]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, scanner.py, run_audit.py, analyzers/, cost_optimizer.py, recommender.py, report_generator.py, sqlite3]
requires: []
related: [agent-skill-security-scanner-v2, agent-plugin-audit, skill-optimizer, agent-readiness-aeo-check]
combines_with: [skill-optimizer, skill-creator, agent-skill-security-scanner-v2]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 技能生态审计：质量、安全、成本与重复检测

## 何时使用

- 你有**一整片技能/插件生态**（一个目录下几十上百条 SKILL.md + 脚本），想做一次**端到端体检**：按 7 个维度打加权分、列出按严重级分组的问题、给出健康报告与可执行整改清单。
- 想**追踪生态随时间的演进**：把本次评分与上次对比，看哪些技能在变好/变差（趋势）。
- 想做**跨技能全局分析**：找出重复模块、不一致的治理水位、可抽取的公共能力。
- 想做**缺口分析**：对照能力分类法找出生态缺什么，并直接生成新技能的 SKILL.md 模板。
- 想做**成本优化**：定位吃 token 的大 SKILL.md、无索引的大参考文件、啰嗦的脚本输出。

不该用的边界：

- 只想审**单条**第三方技能**安装前是否安全** → 用 `agent-skill-security-scanner`（纯安全静态扫描）。
- 只想对**单条**技能跑**发布准入闸门**（结构/质量/脚本/安全/市场合规 8 阶段，出 PASS/FAIL）→ 用 `agent-plugin-audit`。
- 不做运行时沙箱 / 动态执行，也**不联网实时核验 CVE**；安全维度用的是内置静态规则。
- 本条是**生态级元审计**，强调横向铺开（多技能 + 趋势 + 重复 + 缺口），不是逐条深挖。

## 步骤

把生态当作被审对象，跑「发现 → 7 维评分 → 成本 → 缺口 → 报告」的流水线，结果落库以支持趋势对比。

1. **发现（Discovery）**：扫描根目录，自动发现所有技能（定位每个 `SKILL.md` 及其 `scripts/`、`references/`）。先打印发现清单（技能数、各自路径与类型）再继续。
2. **逐技能 7 维评分**：对每条技能跑 7 个分析器，按下方权重汇总成单技能总分。
3. **跨技能全局分析（Cross-Skill）**：比较所有技能，找重复模块、共享的 DB 写法、治理水位不一致、可抽取的公共能力。
4. **成本优化（Cost）**：评估每条技能的激活成本（SKILL.md token 量、无索引的大参考、脚本啰嗦输出、缺结构化 JSON 输出）。
5. **缺口分析与推荐（Recommend）**：对照 20 类能力分类法找缺失项，为建议的新技能生成现成 SKILL.md 模板。
6. **报告与落库（Report）**：生成结构化 Markdown 报告存入 `data/reports/`；评分写入 `score_history`、操作写入 `action_log`，供下次 `--compare` 出趋势 delta。

### 7 维评分权重与判据

| 维度 | 权重 | 关键判据 |
|---|---|---|
| 1. 代码质量 | 20% | 圈复杂度（阈值 10）、函数行数（阈值 50）、文件行数（阈值 500）、docstring 覆盖、错误处理反模式（bare/broad except） |
| 2. 安全 | 20% | 硬编码 secrets（token/密码/API key）、SQL 注入（query 用 f-string）、HTTP 明文 URL、token 进日志、输入校验缺失 |
| 3. 性能 | 15% | API 重试 + 退避、超时配置、HTTP 连接复用、N+1 查询、异步/并发 |
| 4. 治理 | 15% | 分级 L0~L4：L0 无 → L1 操作日志 → L2 +限流 → L3 +两步确认 → L4 +告警与趋势 |
| 5. 文档 | 15% | frontmatter（name/description/version）、触发词（中英双语）、必备/推荐小节、参考文件 |
| 6. 依赖 | 15% | `requirements.txt` 存在、版本钉死、导入↔列出 双向一致 |
| 7. 跨技能 | 全局 | 重复模块、共享 DB 模式、治理不一致、抽取机会 |

## 指令

```bash
# 安装依赖
pip install -r scripts/requirements.txt

# 全生态完整审计（评分 + findings + 推荐 → 报告落 data/reports/）
python scripts/run_audit.py

# 只审一条技能（部署前聚焦校验）
python scripts/run_audit.py --skill <skill-name>

# 只跑新技能缺口分析与推荐
python scripts/run_audit.py --recommend

# 与上次审计对比，输出评分 delta（趋势）
python scripts/run_audit.py --compare

# JSON 输出（供下游处理 / 进 CI）
python scripts/run_audit.py --format json

# 查看历史审计记录
python scripts/run_audit.py --history

# 单独发现可用技能 / 查看 sentinel 自身审计日志 / 检查数据库
python scripts/scanner.py
python scripts/governance.py
python scripts/db.py
```

无该工具链时，按上表 7 维判据 + 成本/重复/缺口要点**手工执行等价检查**：逐文件读 SKILL.md 与脚本，按阈值打分，跨技能比对重复，对照分类法找缺口。

## 示例

报告结构（落在 `data/reports/`）：

```
1. 执行摘要（各技能评分表）
2. 趋势（若有上次审计，逐项 score delta）
3. 按严重级分组的 findings（critical / high / medium / low / info）
4. 逐技能详细分析
5. 新技能推荐（含现成 SKILL.md 模板）
6. 按优先级排序的行动计划
```

常用工作流：

```bash
python scripts/run_audit.py              # 首次体检：全量评分 + findings + 推荐
python scripts/run_audit.py --compare    # 监测演进：看评分随时间的 delta
python scripts/run_audit.py --skill foo  # 部署前：单技能聚焦校验
python scripts/run_audit.py --recommend  # 规划：下一个该建的技能 + 模板
```

## 注意事项

- 7 维是**加权**汇总（质量 20% / 安全 20% / 性能 15% / 治理 15% / 文档 15% / 依赖 15%），不要只看单维。
- 安全维度是**静态规则**：能抓硬编码 secrets、f-string SQL、HTTP 明文、token 进日志，但**不联网核验 CVE、不做动态执行**；判定为提示而非终审，关键发现需人工复核与环境验证。
- 本条**自身实践它所倡导的治理**：所有审计写 `action_log`，评分写 `score_history`，报告存 `data/reports/`——这也是趋势对比（`--compare`）的数据底座。
- 缺口分析对照的是一份 **20 类能力分类法**；推荐结果是**起点模板**而非成品，落地前需补具体内容并复核。
- 成本维度关注**激活开销**：过大的 SKILL.md、无索引的大参考、啰嗦/无 JSON 的脚本输出都会推高每次激活的 token，应优先瘦身高频技能。
- 输出仅供参考，**不替代**针对具体环境的验证、测试与专家评审；缺输入/权限/成功标准时先停下问清。

## 互见

- related：`agent-skill-security-scanner` —— 单条技能安装前的纯安全静态扫描，本条第 2 维安全分的聚焦深化版。
- related：`agent-plugin-audit` —— 单条技能/插件发布前的 8 阶段准入闸门，与本条「生态级元审计」分工互补。
- related：`dependency-auditor` —— 依赖供应链与已知漏洞深度核验，承接本条第 6 维依赖发现。
- combines_with：`skill-creator` —— 把本条缺口分析产出的新技能模板落地成完整 SKILL.md。
- combines_with：`supply-chain-risk-auditor` —— 对生态中各技能的第三方依赖做供应链风险深扫，补强依赖维度。

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
