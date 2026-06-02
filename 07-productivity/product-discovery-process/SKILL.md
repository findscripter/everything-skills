---
name: product-discovery-process
title: 产品探索发现流程
description: 当你要在投入交付资源前验证产品机会、识别假设并测试问题-方案匹配时使用；用机会方案树(OST)+假设映射+问题/方案验证产出可决策的探索冲刺结论（继续/转向/停止）；不适用于已决定要做、只需排期或写需求文档的场景，那用 RICE 优先级或 PRD 技能。触发词：产品探索、机会验证、假设映射、问题验证、探索冲刺
domain: 协作/pm
triggers: [产品探索, 机会验证, 假设映射, 问题验证, 方案验证, 探索冲刺, 机会方案树, OST, discovery sprint, 去风险产品决策]
tags: [协作, pm, 产品发现, 机会方案树, 假设验证, 用户研究, 去风险]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [assumption_mapper.py]
requires: []
related: [product-manager-toolkit, prd-spec-writer, agile-product-owner, customer-research-synthesizer]
combines_with: [prd-spec-writer, product-manager-toolkit]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

在**承诺交付资源之前**，用结构化探索找出高价值机会、给产品下注去风险。典型场景：

- 主持机会方案树（OST）梳理
- 假设映射与测试计划制定
- 问题验证访谈与证据综合
- 用原型/实验做方案验证
- 规划一轮探索冲刺并产出决策

**不该用的边界（先停下）：**

- 机会已确定、只需排优先级或排期 → 用 RICE 优先级技能
- 已决定要做、只是缺需求文档 → 用 PRD / code-to-prd 技能
- 纯交付期 bug 修复、技术重构等无「该不该做」之问的工作
- 没有任何可触达用户/证据来源时——先解决取数，否则 OST 会沦为内部臆测

## 步骤

1. **定义目标结果**：锁定一个可度量、想要改善的结果指标；确立基线与目标时间窗。
2. **构建机会方案树（OST，Teresa Torres）**：结果 → 机会 → 方案设想 → 实验。机会必须扎根于用户证据，而非内部意见。
3. **映射假设**：按可取性（Desirability）、可行性（Viability）、技术可行性（Feasibility）、可用性（Usability）四类拆解，按「风险 × 不确定性」打分。
4. **验证问题**：做问题访谈与行为分析，确认痛点的**频率、严重度、付费/解决意愿**；尽早砍掉弱机会。
5. **验证方案**：先原型后开发，跑概念测试、可用性测试、价值测试；**度量行为，而非仅凭口头偏好**。
6. **规划探索冲刺**：1–2 周一轮，写明假设，每日复盘证据，以一个决策收尾——**继续 / 转向 / 停止**。

## 指令

用脚本对假设做风险/确定性打分并生成优先测试计划：

```bash
python3 scripts/assumption_mapper.py assumptions.csv
# JSON 输出
python3 scripts/assumption_mapper.py assumptions.csv --json
```

脚本从 CSV 读取假设、按「风险 × 不确定性」排序、输出带建议测试类型的优先测试计划。

**OST 质量门槛：** 收敛前至少 3 个不同机会；每个 Top 机会至少 2 个实验；每条分支都挂上证据来源。

**假设优先级规则：** 高风险 + 低确定性的假设**最先测**。

## 示例

**10 天探索冲刺骨架：**

- 第 1–2 天：结果定义 + 机会框定
- 第 3–4 天：假设映射 + 测试设计
- 第 5–7 天：问题与方案测试
- 第 8–9 天：证据综合 + 决策选项
- 第 10 天：干系人决策评审

**问题验证证据阈值示例：** 同一痛点在多个目标用户身上重复出现；可观察到的绕行（workaround）行为；当前痛点有可量化的成本。

**方案验证技法：** 概念测试（价值主张能否被理解）、原型可用性测试（任务成功率/完成时长）、假门或 concierge 测试（需求信号）、小范围 Beta 群组（留存/激活信号）。

## 注意事项

- 机会来自**用户证据**，不是内部观点；每条 OST 分支都要能溯源。
- 验证方案时优先看**真实行为**，口头「我会用」不算数。
- 弱机会尽早 reject，别拖到方案阶段才止损。
- 冲刺务必以明确决策收尾，避免「探索完了不知道做不做」。
- 四类假设（可取/可行/技术/可用）缺一类即留盲区，逐项过一遍。

## 互见

- 框架细节见源仓库 `references/discovery-frameworks.md`
- 下游衔接：RICE 优先级、用户故事/冲刺规划（agile-product-owner）、PRD（code-to-prd）
- 上游/并行：UX 用户研究、产品分析（留存/漏斗）、实验设计（A/B 样本量）

---

*采编自 alirezarezvani/claude-skills（MIT）。机会方案树框架归功于 Teresa Torres。*
