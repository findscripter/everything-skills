---
name: agile-product-owner
title: 敏捷产品负责人与待办管理
description: 当用 Scrum 写用户故事、定验收标准、拆 Epic、排 Sprint 或排序待办时使用；做出 INVEST 合规故事/GWT 验收标准/容量内的 Sprint 计划/加权优先级排序；不适用于纯看板、瀑布、通用任务管理及未适配的 SAFe/LeSS。触发词：用户故事、验收标准、Sprint 规划、故事点估算、拆 Epic、待办排序
domain: 协作/pm
triggers: [写用户故事, 创建验收标准, Sprint 规划, 故事点估算, 拆分 Epic, 待办排序, backlog grooming, definition of done, INVEST 校验, Given-When-Then, 团队容量, 速率跟踪]
tags: [敏捷, scrum, 产品负责人, 用户故事, sprint规划, 待办管理, 验收标准, 协作, pm]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [product-manager-toolkit, github-issue-writer, jira-expert, task-decomposition-planner]
combines_with: [product-manager-toolkit, jira-expert, enterprise-project-manager]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

在 Scrum 框架下做产品待办管理与 Sprint 执行时使用，典型场景：

- 把需求写成 INVEST 合规的用户故事；用 Given-When-Then 写可测试验收标准。
- 拆分 Epic 为可在一个 Sprint 内交付的故事；估算故事点（Fibonacci）。
- 计算团队容量、规划 Sprint、按价值/影响/风险/成本加权排序待办。

不该用的边界（直接转其他方法，勿强套本技能）：

- 纯看板（Kanban-only）流，不分 Sprint 不估点。
- 瀑布式项目计划、通用任务管理（用 todo/工单即可）。
- 未做适配的非 Scrum 框架（SAFe、LeSS）。

## 步骤

围绕四条核心工作流，每条以「校验」收尾，不通过则回退重做。

1. 用户故事生成：确定 persona → 定义动作/能力 → 阐明价值 → 写 GWT 验收标准 → Fibonacci 估点 → INVEST 校验 → 入待办并定优先级。校验：通过全部 INVEST 且验收标准可测。
2. Epic 拆分：定义 Epic 范围与成功标准 → 列出受影响 persona 及各自能力 → 按逻辑归组为故事 → 确保每个故事 ≤8 点 → 标依赖 → 排增量交付顺序。校验：每个故事独立交付价值，合计覆盖 Epic 全范围。
3. Sprint 规划：算容量（速率×可用因子）→ 评审 Sprint 目标 → 从已排序待办选故事 → 装载至容量 80-85%（承诺）→ 加 10-15% 拉伸目标 → 标依赖与风险 → 复杂故事拆任务。校验：承诺点 ≤85% 容量，且所有故事都有验收标准。
4. 待办排序：按优先级级别（Critical/High/Medium/Low）与加权因子打分排序，入 Sprint 前逐条过 INVEST。

## 指令

容量与装载公式（务必照此计算，勿凭感觉）：

```
Sprint 容量 = 平均速率 × 可用因子
示例：平均速率 30，可用因子 0.9 → 调整后容量 27
承诺 = 23（容量的 85%）；拉伸 = 4（容量的 15%）
```

可用因子参照：满负荷无请假 1.0；一人半休 0.9；Sprint 内有节假日 0.8；多人缺勤 0.7。

加权优先级（权重固定，保持取舍透明）：业务价值 40% / 用户影响 30% / 风险与依赖 15% / 成本 15%。

按故事点的最少验收标准数：1-2 点→3-4 条；3-5 点→4-6 条；8 点→5-8 条；13+ 点→直接拆故事。

脚本工具（源仓库自带，按需调用）：

```bash
# 从样例 Epic 生成故事
python scripts/user_story_generator.py
# 带容量做 Sprint 规划
python scripts/user_story_generator.py sprint 30
```

可参考 `references/user-story-templates.md`（模板库、反模式）与 `references/sprint-planning-guide.md`（WSJF 排序、燃尽、DoD）。

## 示例

用户故事模板与 GWT 验收标准：

```
作为 [persona]，
我想要 [动作/能力]，
以便 [价值/收益]。

示例：作为市场经理，我想要把活动报告导出为 PDF，以便与无系统权限的干系人分享结果。
```

```
Given [前置条件/上下文]，
When [动作/触发]，
Then [预期结果]。

Given 用户已用有效凭证登录，When 点击「导出」按钮，Then 2 秒内开始 PDF 下载。
```

Epic 拆分（每条 ≤8 点，标注 persona）：

```
Epic: 用户仪表盘（共 34 点）
├── US-001 查看关键指标（5 点）- 终端用户
├── US-002 自定义布局（5 点）- 高级用户
├── US-003 导出 CSV（3 点）- 终端用户
└── US-008 启用缓存（3 点）- Enabler
```

五种拆分技法：按工作流步骤（结账→加购+支付+确认）、按 persona（仪表盘→管理员+用户）、按数据类型（导入→CSV+Excel）、按操作（管理用户→增+改+删）、Happy path 优先（基础流→错误处理→边界）。

## 注意事项

- INVEST 是硬校验而非建议：每个故事入 Sprint 前逐项过 I/N/V/E/S/T，S 要求 ≤8 点、T 要求验收标准清晰可验证。
- 容量装载只到 85%，留出缓冲；超 85% 视为过载，回退取舍。
- 验收标准要覆盖五类：Happy Path、校验、错误处理、性能（如 2 秒内）、可访问性（如纯键盘可达）。
- 速率求 3-5 个 Sprint 平均，波动控制在 ±10%；规划时按平均略保守承诺。
- Definition of Done 全勾才算完成：代码完成并评审、单测通过、验收标准已验证、文档更新、部署到 staging、PO 验收、无遗留严重 bug。
- 关键指标目标：承诺可靠性 >85%，中途范围变更 <10%，结转 <15%。

## 互见

- Scrum Master（`project-management/scrum-master/`）：速率数据与 Sprint 仪式，与待办管理互补。
- Product Manager Toolkit（`product-team/product-manager-toolkit/`）：RICE 排序可作为待办排序输入。

---

采编自 alirezarezvani/claude-skills（MIT 许可证），已按中文技能大典 SCHEMA 适配重写。
