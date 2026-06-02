---
name: chaos-engineering-runner
title: 混沌工程实验设计
description: 当需要设计、评审或复盘混沌工程实验（注入故障验证系统韧性）时使用；产出含稳态指标、爆炸半径、中止条件的实验计划、风险评分与无追责复盘；不适用于事故响应、红队攻防、性能压测、生产事后排障。触发词：混沌实验、故障注入、爆炸半径、中止条件、Chaos Mesh
domain: 研发/observability
triggers: [混沌实验, 故障注入, 爆炸半径, 中止条件, 稳态, Game Day, 韧性测试, Chaos Toolkit, Chaos Mesh, Litmus, Gremlin, AWS FIS, chaos experiment, fault injection, blast radius, abort criteria, gameday, resilience test]
tags: [chaos-engineering, resilience, fault-injection, gameday, sre, reliability, observability, chaos-mesh, litmus, aws-fis]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [experiment_designer.py, blast_radius_calculator.py, experiment_postmortem.py, Chaos Toolkit, Chaos Mesh, Litmus, Gremlin, AWS FIS]
requires: []
related: [sre-incident-responder, incident-commander-framework, devops-troubleshooter, slo-sli-implementation]
combines_with: [k6-load-testing, observability-strategy-designer, postmortem-writer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

在生产系统中主动注入故障、提前暴露真实弱点而又不演变成事故时使用本技能。多数「混沌工程」尝试失败在于：跳过稳态测量、没有中止条件、没有爆炸半径上限。本技能强制这三项纪律。

适用：
- 设计混沌实验（破坏什么、在哪、何时、如何中止）
- 实验前计算爆炸半径
- 评审已有实验计划的安全性
- 选型混沌工具（Chaos Toolkit / Chaos Mesh / Litmus / Gremlin / AWS FIS）
- 撰写混沌实验复盘
- 组织 Game Day 演练

不该用（负边界）：
- 通用事故响应 → 用 incident-response 类技能
- 威胁狩猎 / 红队攻防 → 用安全类技能
- 性能 / 容量压测 → 目标不同，混沌关注故障模式而非容量
- 生产事后排障 → 混沌是提前发现弱点，不是事后救火

核心原则：**没有中止条件的混沌就是一次事故。** 在 Netflix 混沌工程四原则（2016）之上，本技能强制加上第五条——预先定义中止条件（abort criteria）。

混沌工程四原则：1) 围绕稳态行为建立假设（不是「什么会坏」，而是「X 成立；在故障 Y 下还成立吗」）；2) 注入贴近真实的事件（杀节点、降网速、丢缓存、限流依赖）；3) 在生产环境运行（预发永远没有相同的故障模式，从小开始）；4) 自动化持续运行（一次性混沌只是新闻稿，持续混沌才是工程）。

## 步骤

### 工作流一：设计并运行单次实验
1. 陈述假设：「当发生 [故障] 时，稳态指标 X 保持在 Y 内」。
2. 确定稳态指标——必须在实验**之前**可测量。
3. 跑 blast_radius_calculator.py，确认风险评分为 GREEN 才继续。
4. 跑 experiment_designer.py 产出计划。
5. 请同行评审计划，确认中止条件是具体可判定的。
6. 在值班 / 事故频道通知 on-call 团队。
7. 打开监控大盘后运行实验。
8. 一旦触发中止条件，立即中止并记录现象。
9. 跑 experiment_postmortem.py 沉淀经验。
10. 登记后续行动项，链接到下一个实验。

### 工作流二：Game Day 演练
选定场景（如「主库故障切换」）→ 梳理所有应继续工作的依赖服务 → 构建覆盖各层的多实验计划 → 与干系人排期且必须有 on-call 覆盖 → 由主持人管理场景推进 → 在共享文档实时记录观察 → 单份合并复盘 → 在看板按责任人跟踪行动项。

### 工作流三：持续混沌（从 Game Day 到日常）
预发周度 Game Day → 生产限爆炸半径周度 Game Day → 调度化持续混沌（Litmus 调度、Gremlin 场景）→ 接入发布流水线（每次生产发布触发基线混沌扫描）→ 跟踪指标：每周实验数、发现的弱点数、MTTR 趋势。

## 指令

三个工具均为纯标准库 Python，均支持 `--help`。

设置路径：
```bash
SKILL=engineering/chaos-engineering/skills/chaos-engineering
```

experiment_designer.py——从输入生成结构化实验计划，强制要求假设、稳态指标、爆炸半径、中止条件、回滚等小节：
```bash
python "$SKILL/scripts/experiment_designer.py" \
  --target "checkout-svc" \
  --hypothesis "p99 latency stays <500ms when payment-svc is slow" \
  --attack latency \
  --magnitude "+200ms" \
  --duration-min 15 \
  --blast-radius "5% of US traffic" \
  --abort-if "p99 > 1000ms OR error_rate > baseline + 1pp"
```

blast_radius_calculator.py——给定流量占比、用户规模、时长，计算受影响用户、错误预算消耗与风险评分：
```bash
python "$SKILL/scripts/blast_radius_calculator.py" \
  --traffic-share 0.05 \
  --user-pop 1000000 \
  --duration-min 15 \
  --baseline-availability 0.999 \
  --expected-impact-availability 0.95
```
输出含：预期受影响用户数、错误预算消耗（以错误预算分钟计）、风险评分 GREEN/YELLOW/RED、建议 PROCEED/REDUCE/ABORT。判定阈值：**GREEN = <1% 错误预算；YELLOW = 1-10%；RED = >10%。**

experiment_postmortem.py——从计划 + 结果产出结构化复盘，自动拦截常见复盘缺陷（无经验沉淀、无后续行动、含追责措辞）：
```bash
python "$SKILL/scripts/experiment_postmortem.py" --plan experiment.json --result-log results.txt
```

斜杠命令：`/chaos-experiment`——交互式实验设计向导，串起以上三个工具。
资产模板：`assets/experiment_template.md`（计划模板）、`assets/postmortem_template.md`（复盘模板）。

## 示例

7 种攻击类型（taxonomy）——不同攻击暴露不同弱点，按假设选攻击：

| 攻击 | 测试什么 | 工具 |
|---|---|---|
| 延迟 Latency | 超时、重试、熔断器 | tc、Chaos Mesh `NetworkChaos` |
| 错误 Error | 错误处理、降级路径 | Chaos Mesh `HTTPChaos`、Toxiproxy |
| 资源 Resource（CPU/内存/磁盘）| 饱和处理、自动扩容 | Chaos Mesh `StressChaos`、stress-ng |
| 网络分区 Partition | 脑裂、共识、故障切换 | Chaos Mesh `NetworkChaos` partition |
| 依赖失败 Dependency | 优雅降级、回退 | 服务网格故障注入 |
| 时间 Time | 时钟偏移、NTP 问题 | libfaketime、Chaos Mesh `TimeChaos` |
| 基础设施 Infrastructure（杀实例）| 自愈、故障切换 | AWS FIS、Chaos Monkey |

选攻击的判断：「X 慢了会怎样？」→ 延迟；「X 断网会怎样？」→ 分区。

工具选型：
- k8s 单栈 + 开源 → Chaos Mesh 或 Litmus（Litmus 实验库更大）
- 多云 + 开源 → Chaos Toolkit
- 重度 AWS + 需求简单 → AWS FIS
- 企业级 + 审计合规 → Gremlin（付费 SaaS）

## 注意事项

可验证成功标准：
- 100% 的混沌实验都有书面假设、中止条件、爆炸半径计算
- 任一单次实验的爆炸半径不超过错误预算的 10%
- 实验间隔均值 <14 天（持续而非一次性）
- 每个实验至少产出 1 个被落地交付的后续行动项
- 滚动 90 天内无混沌实验升级为影响客户的事故

反模式（务必规避）：
- 无假设——「随便搞坏点东西」是破坏不是工程
- 无稳态指标——没有基线就无法判断 X 是否坏了
- 无爆炸半径上限——无限制的全量生产实验 = 事故
- 无中止条件——强制项，缺失即事故
- 无 on-call 覆盖——无监控的混沌等于无监控的生产
- 只在预发 / 只在 dev 跑——故障模式与生产不同，无意义
- 一次性混沌——单次实验只是新闻稿，学习需要复现
- 含追责的复盘——记录原因而非追责，否则团队会停止做混沌

## 互见

本技能可与以下技能组合：
- 特性开关 / feature-flags-architect：那里定义的 kill switch 正是这里的中止触发器
- kubernetes-operator：Operator 是常见的混沌目标（验证故障下的 reconcile）
- 事故响应 / incident-response：升级了的混沌实验会转为事故

参考资料（源技能附带）：`references/chaos_principles.md`（四原则与起步时机）、`references/experiment_design.md`（假设结构、稳态指标、中止条件）、`references/attack_taxonomy.md`（7 种攻击详例）、`references/tooling_landscape.md`（各工具权衡）。

---
采编自 alirezarezvani/claude-skills（MIT 许可）。
