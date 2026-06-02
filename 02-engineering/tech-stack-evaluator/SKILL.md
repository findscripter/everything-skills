---
name: tech-stack-evaluator
title: 技术栈评估与 TCO 对比
description: 当为新项目选型、对比框架/云厂商或评估迁移路径时使用；做加权打分、5 年 TCO、生态健康、安全合规与迁移成本的数据化评估并产出带置信度的对比报告与建议；不适用于同类工具的琐碎二选一、已拍板的强制选型或紧急生产故障排查；触发词：技术栈对比、TCO、迁移评估
domain: 研发/architecture
triggers: [技术栈评估, 框架对比, TCO, 总拥有成本, 迁移评估, 选型, 云厂商对比, 生态健康, 技术选型, build vs buy]
tags: [架构, 技术选型, TCO, 迁移, 云厂商, 评估决策]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [stack_comparator.py, tco_calculator.py, ecosystem_analyzer.py, security_assessor.py, migration_analyzer.py]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
用数据驱动的方式评估并对比技术、框架与云厂商，输出可落地的选型/迁移建议。

## 何时使用

适用：
- 为新项目对比前端/后端框架（如 React vs Vue、PostgreSQL vs MongoDB）。
- 针对特定工作负载对比云厂商（AWS / Azure / GCP）。
- 规划技术迁移并做风险与成本评估（如 Angular.js → React）。
- 做 build vs buy 决策，需要 5 年 TCO（含隐性成本）支撑。
- 评估开源库的长期可用性（生态健康、社区活跃度、安全态势）。

不该用（负边界）：
- 同类工具间的琐碎二选一，直接按团队偏好定即可。
- 已被强制/拍板的选型，决策已定无需再评。
- 紧急生产故障，应使用监控/排障工具而非选型评估。

## 步骤

1. 明确对比对象、使用场景与加权维度（权重之和=100）。常见维度：生态、性能、开发者体验、TCO、安全合规。
2. 选择分析深度：
   - 快速对比（200-300 tokens）：加权分 + 推荐 + Top 3 决策因子 + 置信度。
   - 标准分析（500-800 tokens）：对比矩阵 + TCO 概览 + 安全摘要。
   - 完整报告（1200-1500 tokens）：全部指标与计算 + 迁移分析 + 详细建议。
3. 准备输入（三种格式任选）：自然语言文本、YAML（适合自动化）、JSON（适合程序集成）。
4. 调用对应脚本完成加权打分、TCO 测算、生态/安全/迁移分析。
5. 汇总为对比矩阵，标注置信度，给出推荐与关键权衡。

置信度判定：高（80-100%，明确赢家、数据充分）/ 中（50-79%，存在权衡、不确定性中等）/ 低（<50%，胜负接近、数据有限）。

## 指令

脚本位于 `scripts/`，按需调用：

```bash
# 加权多准则技术对比
python scripts/stack_comparator.py --help

# 多年 TCO 测算
python scripts/tco_calculator.py --input assets/sample_input_tco.json

# 生态健康分析（GitHub / npm / 社区）
python scripts/ecosystem_analyzer.py --technology react

# 安全态势与合规就绪度评估
python scripts/security_assessor.py --technology express --compliance soc2,gdpr

# 迁移复杂度、工作量与风险估算
python scripts/migration_analyzer.py --from angular-1.x --to react
```

参考文档（`references/`）：`metrics.md`（打分算法与计算公式）、`examples.md`（各分析类型的输入/输出示例）、`workflows.md`（分步评估流程）。

## 示例

文本输入（自然语言）：
```
对比 React vs Vue 用于 SaaS 仪表盘。
权重：开发者生产力 40%、生态 30%、性能 30%。
```

TCO 测算：
```
计算 Next.js 部署在 Vercel 的 5 年 TCO。
团队：8 名开发。托管：$2500/月。增长：40%/年。
```

迁移评估：
```
评估从 Angular.js 迁移到 React。
代码库：50,000 行、200 个组件。团队：6 名开发。
```

YAML 结构化输入（适合自动化）：
```yaml
comparison:
  technologies: ["React", "Vue"]
  use_case: "SaaS dashboard"
  weights:
    ecosystem: 30
    performance: 25
    developer_experience: 45
```

## 注意事项

- 权重必须显式给出且合计为 100，否则打分不可比。
- TCO 要把隐性成本（招聘/培训、迁移、锁定、运维）一并计入，而非只算托管费。
- 置信度低（<50%）时不要强行给单一推荐，应呈现权衡并建议补充数据或做 PoC。
- 选择与场景匹配的分析深度：早期快速筛选用快速对比，正式决策用完整报告。
- 安全评估需结合具体合规要求（如 soc2、gdpr）传参，结论才有意义。

## 互见

- 研发/architecture 域下的迁移规划、build vs buy 决策类技能。
- 云厂商工作负载对比与成本优化相关技能。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
