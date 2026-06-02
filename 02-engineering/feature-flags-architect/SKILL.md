---
name: feature-flags-architect
title: 功能开关架构与治理
description: 当新增、灰度、审计或下线功能开关（feature flag）时使用；做开关分类、渐进发布规划、熔断/kill-switch 审计与开关债务清理，产出发布计划表、债务清单与合并前门禁；不适用于纯视觉/文案改动（应走部署而非开关）。触发词：feature flag、灰度发布、kill switch、开关债务、LaunchDarkly
domain: 研发/devops
triggers: [新增功能开关, ship behind a flag / 开关后发布, 灰度发布 / rollout 计划, kill switch / 熔断开关, 陈旧开关 / 开关债务清理, 选型：LaunchDarkly/GrowthBook/Statsig/Unleash/Flipt, 渐进式交付 / progressive delivery]
tags: [feature-flags, 渐进式交付, 灰度发布, kill-switch, 开关债务, 发布工程, devops, LaunchDarkly, GrowthBook, Unleash]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [flag_debt_scanner.py, rollout_planner.py, kill_switch_audit.py, git, python]
requires: []
related: [ab-test-setup-gates, release-manager, deployment-engineer, ci-cd-pipeline-builder]
combines_with: [release-manager, ab-test-designer, deployment-engineer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

把功能开关当作一条**有度量的生命周期**（请求 → 设计 → 上线 → 放量 → 清理 → 归档），而非随手写的 `if` 语句。适用场景：

- 新增开关，需要一份渐进放量计划。
- 审计仓库，找出陈旧、无主或孤儿开关。
- 开关选型：LaunchDarkly / GrowthBook / Statsig / Unleash / Flipt / 自建（DIY）之间取舍。
- 为高风险发布设计 kill-switch（熔断）路径。
- 发布冻结前清理开关债务。
- 评判某个功能是否真该放在开关后面。

**不该用的边界**：纯外观/文案类改动不要用开关，直接走部署；长期存在的权限位（按用户/套餐授权）属于 Permission 类，应做成运行时配置而非 Release 开关，不要纳入债务扫描清单。

### 开关四分类（决定生命周期与归属）

| 类型 | 用途 | 典型存活期 | 负责人 | 清理触发条件 |
|---|---|---|---|---|
| **Release 发布** | 在生产隐藏未完成功能 | 天–周 | 研发 | 放量到 100% |
| **Experiment 实验** | A/B 测试变体 | 周 | 产品/增长 | 实验结束、选定赢家 |
| **Operational 运维** | 熔断、性能开关、kill switch | 月–年 | 研发/SRE | 被自动扩缩或功能退役取代 |
| **Permission 权限** | 按用户/账号/套餐的授权位 | 年（长期） | 产品 | 套餐/角色移除 |

只有 Release 与 Experiment 应进入债务扫描观察名单；Operational 与 Permission 按设计就是长寿的。

## 步骤 / 指令

三个工具均为纯标准库 Python，可加 `--help` 查看参数。

**新功能放到开关后上线（Workflow 1）**
1. 先分类：属于四类中的哪一类？（研发工作多为 Release）
2. 用 `rollout_planner.py` 设计放量节奏。
3. **写代码前**先在 `docs/feature-flags.md` 登记：名称、负责人、类型、kill-switch 触发条件、监控面板 URL。
4. 带着开关写代码。
5. 跑 `kill_switch_audit.py`，合并前必须通过。
6. 以 0% 部署，先验证 kill switch 真能关掉。
7. 执行放量计划，命中中止条件就回滚。
8. 维持 100% 满 7 天后：移除开关、删掉死分支、归档文档条目。

**季度开关清理（Workflow 2）**
1. `flag_debt_scanner.py --repo . --max-age-days 90 > debt.md`
2. 逐条：确认已到 100%（或已被熔断）→ 找到引入它的 issue/PR、与负责人确认可删 → 删死分支、移除开关配置 → 重跑审计应少一个开关。
3. 更新 CHANGELOG：「移除 N 个陈旧开关」。

**选型（Workflow 3）**：估算开关数量（当前 + 未来 12 个月）→ 梳理必需能力（定向规则、A/B+统计、审计日志/SOC2、自托管/数据驻留）→ 估预算（MAU × 单价）→ 签约前先做 30 天 PoC。

**设计 kill switch（Workflow 4）**：识别失败模式（延迟尖峰/错误率尖峰/业务指标回退，各自阈值）→ 每种接一个中止动作（手动：面板链接 + 值班手册；自动：告警阈值把开关翻回 0%）→ 上线前先在预发验证熔断 → 写进文档并通过审计。

## 示例

```bash
# 1. 审计仓库的开关债务（90 天以上、低使用率为清理候选）
python scripts/flag_debt_scanner.py --repo . --max-age-days 90 --format text
python scripts/flag_debt_scanner.py --repo . --max-age-days 60 --format json > debt.json

# 2. 为新开关规划渐进放量
python scripts/rollout_planner.py --population 100000 --target-percent 100 --duration-days 14 --strategy ring
python scripts/rollout_planner.py --population 50000 --target-percent 25 --duration-days 7 --strategy linear

# 3. 校验每个开关都有书面 kill switch
python scripts/kill_switch_audit.py --repo . --flag-doc docs/feature-flags.md
```

**债务扫描启发式**：遍历仓库匹配常见调用模式（`flag("...")`、`isFlagEnabled("...")`、`featureFlag("...")`、`getFlag("...")`、`client.variation("...", ...)`、`unleash.isEnabled("...")`、`growthbook.feature("...")`）；对每个开关用 `git log --diff-filter=A -S <name>` 找到最早引入的提交；引入超过 `--max-age-days` 且使用处 ≤ `--min-uses` 即标记为 DEBT。

**放量策略**：`ring`（1%→5%→25%→50%→100%，高风险默认）/ `linear`（每日恒速，中风险）/ `log`（前快后慢，有把握的低风险）/ `cohort`（内部→Beta→免费→付费→全量）。

**审计校验项**：每个代码里发现的开关都有文档条目；每条声明负责人、类型、kill-switch 触发条件、监控面板；缺文档为 FAIL，缺字段为 WARN。把它作为新开关上线前的合并门禁。

**选型速查**：<50 个开关且无定向 → DIY（配置文件/环境变量）；要分析+实验 → Statsig 或 GrowthBook；要 SOC2 审计日志 → LaunchDarkly；要自托管（数据驻留/隔离网） → Unleash 或 Flipt。

## 注意事项

反模式，遇到即整改：

- **永久开关却 `if (FLAG_FOO)` 散落 50 处**——应是 Permission 类的运行时配置，而非 Release 开关。
- **开关无负责人**——原作者离职后没人清理。
- **没有书面 kill switch**——功能出问题时没人知道怎么关。
- **A/B 实验跑了半年**——尽快选赢家，无限期运行就是债务。
- **拿开关做外观改动的开关**——走部署，别用开关。

可验证目标：新开关合并时 100% 通过 `kill_switch_audit.py`；`flag_debt_scanner.py --max-age-days 90` 全仓返回 ≤5 个陈旧开关；每个开关都有负责人、类型、kill switch；Release 开关从 100% 放量到退役的平均时长 <60 天。

## 互见

- 源技能随附 4 篇参考与脚手架，可在 vendor 目录查阅：`references/flag_taxonomy.md`（四类与决策树）、`references/provider_comparison.md`（六种供应商取舍）、`references/rollout_strategies.md`（ring/linear/log/cohort/geo 与中止条件）、`references/flag_lifecycle.md`（全生命周期）。
- 模板 `assets/flag_request_template.md`：新开关申请表（名称、负责人、类型、kill switch、放量计划）。
- 斜杠命令 `/flag-cleanup`：对当前仓库一键跑完清理流程（扫债务、生成移除计划、审计 kill switch）。

---
采编自 alirezarezvani/claude-skills（MIT 许可证）。
