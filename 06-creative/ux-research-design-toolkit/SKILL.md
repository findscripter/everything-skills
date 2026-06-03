---
name: ux-research-design-toolkit
title: UX 研究与体验设计工具箱
description: 当需要把用户研究数据转化为可落地的设计决策时使用；做用户画像生成、旅程地图绘制、可用性测试规划与研究综合（产出画像/旅程/测试方案/洞察）；不适用于视觉 UI 组件库设计、纯前端实现或无任何用户数据的拍脑袋假设。触发词：用户画像、旅程地图、可用性测试、研究综合、痛点分析。
domain: 创意/design
triggers: [创建用户画像, 从数据生成画像, 绘制客户旅程地图, 映射用户旅程, 规划可用性测试, 设计可用性研究, 分析用户研究, 综合访谈发现, 识别用户痛点, 定义用户原型, 计算研究样本量, 创建同理心地图, 识别用户需求]
tags: [ux研究, 用户画像, 旅程地图, 可用性测试, 研究综合, 设计验证, 创意/design]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, persona_generator.py]
requires: []
related: [ux-ui-principles-audit, apple-hig-advisor, accessibility-wcag-audit, design-brainstorming]
combines_with: [ux-ui-principles-audit, ui-design-system-builder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用于资深 UX 设计师/研究员把"已有的用户数据"转化为可落地设计决策的四类场景：

- **生成用户画像**：手上已有分析数据、问卷或访谈，需要产出有研究背书的 persona。
- **绘制旅程地图**：为某个具体目标，可视化端到端的用户体验与情绪曲线。
- **规划可用性测试**：用真实用户验证某个设计方案。
- **综合研究发现**：把原始访谈/问卷/观察数据聚类成可执行洞察。

**不该用的边界（负边界）：**

- 不用于视觉层 UI / 设计系统组件搭建——那属于「UI 设计系统」技能。
- 不用于纯前端代码实现。
- 不在"零用户数据"时强行造画像。样本不足时只能产出探索性结论，须标注低置信度，不可当作生产级依据。

## 步骤

### 步骤 1 · 生成用户画像

1. 准备用户数据，必须为如下 JSON 结构：

```json
[
  {
    "user_id": "user_1",
    "age": 32,
    "usage_frequency": "daily",
    "features_used": ["dashboard", "reports", "export"],
    "primary_device": "desktop",
    "usage_context": "work",
    "tech_proficiency": 7,
    "pain_points": ["slow loading", "confusing UI"]
  }
]
```

2. 运行画像生成器：

```bash
# 人类可读输出
python scripts/persona_generator.py

# 用于系统集成的 JSON 输出
python scripts/persona_generator.py json
```

3. 逐项校验生成结果：原型是否匹配数据模式 / 人口属性是否源自真实数据 / 目标是否具体可执行 / 挫败点是否带频次计数 / 设计启示是否能让设计师直接落地。
4. 验证画像：拿给 3-5 名真实用户问"这像你吗？"；与客服工单交叉核对；与分析数据复核。

工具会按信号自动判定原型：`power_user`（每日使用、10+ 功能 → 效率与定制）、`casual_user`（每周使用、3-5 功能 → 简洁与引导）、`business_user`（工作场景、团队使用 → 协作与报表）、`mobile_first`（移动优先 → 触控、离线、速度）。

### 步骤 2 · 绘制旅程地图

1. 定义范围：persona、目标、起点（触发事件）、终点（成功标准）、时间跨度。
2. 采集旅程数据：用户访谈（问"带我走一遍……"）、会话录屏、分析漏斗/流失点、客服工单。
3. 划分阶段，典型 B2B SaaS：`认知 → 评估 → 上手 → 采用 → 拥护`。
4. 每个阶段填满分层：

```
阶段：[名称]
├── 行为：用户做了什么？
├── 触点：在哪里交互？
├── 情绪：感受如何？(1-5)
├── 痛点：什么让他受挫？
└── 机会：哪里能改进？
```

5. 识别机会，按 **优先级分 = 频次 × 严重度 × 可解决性** 排序。

### 步骤 3 · 规划可用性测试

1. 把模糊目标改写成可测问题，例如"好用吗？"→"用户能否在 3 分钟内完成结账？"
2. 选方法：有调节远程（5-8 人 / 45-60 分 / 深度洞察）、无调节远程（10-20 人 / 15-20 分 / 快速验证）、游击测试（3-5 人 / 5-10 分 / 即时反馈）。
3. 设计任务，用场景而非指令：

```
场景: "想象你正计划去巴黎旅行……"
目标: "在预算内预订 3 晚酒店。"
成功: "你看到了确认页面。"
```

任务推进顺序：热身 → 核心 → 次要 → 边界 → 自由探索。

4. 定义成功指标：完成率 >80%、任务耗时 <2× 预期、错误率 <15%、满意度 >4/5。
5. 准备主持人指南：出声思考说明、非诱导性追问、任务后提问。

### 步骤 4 · 综合研究

1. 为每个数据点打标签：`[GOAL]` 目标 / `[PAIN]` 痛点 / `[BEHAVIOR]` 行为 / `[CONTEXT]` 场景 / `[QUOTE]` 用户原话。
2. 聚类相似模式（如把"每日使用 + 高级功能"的 A、B 归为 Power Users）。
3. 计算各细分占比，判定主要/次要 persona 的可行性。
4. 每个主题提炼：发现陈述 + 支撑证据（引语/数据）+ 频次（X/Y 受访者）+ 业务影响 + 建议。
5. 按 频次 / 严重度 / 影响广度 / 可解决性（各 1-5 分）排优先级。

## 指令

- 生成画像与旅程时，**只用真实数据，不要拍脑袋假设**；挫败点必须带频次计数（如"加载慢 14/20"）。
- 画像置信度由样本量决定：5-10 人=低（探索性）、11-30 人=中（方向性）、31+ 人=高（生产级）；最低 20 人才可作为正式画像。
- 至少需要 2 个数据源（定量 + 定性）。
- 可用性问题严重度分级：4 严重（阻断完成→立即修）、3 重大（明显困难→发布前修）、2 轻微（造成迟疑→有空就修）、1 表面（不影响→低优先级）。
- 研究方法按问题类型选：「用户做什么」用分析/观察（100+ 事件）、「为什么」用访谈（8-15 人）、「能做多好」用可用性测试（5-8 人）、「偏好什么」用问卷/AB（50+ 人）、「感受如何」用日记研究/访谈（10-15 人）。

## 示例

`persona_generator.py` 的人类可读输出片段：

```
============================================================
PERSONA: Alex the Power User
============================================================

A daily user who primarily uses the product for work purposes

Archetype: Power User
Quote: "I need tools that can keep up with my workflow"

Demographics:
  • Age Range: 25-34
  • Tech Proficiency: Advanced

Goals & Needs:
  • Complete tasks efficiently
  • Automate workflows

Frustrations:
  • Slow loading times (14/20 users)
  • No keyboard shortcuts

Design Implications:
  → Optimize for speed and efficiency
  → Expose API and automation capabilities

Data: Based on 45 users   Confidence: High
```

## 注意事项

- **画像质量自检**：基于 20+ 用户、≥2 数据源、目标具体可执行、挫败点带频次、设计启示具体、置信度已标注。
- **旅程地图自检**：范围（persona/目标/时间跨度）清晰、基于真实数据、各分层填满、每阶段标痛点、机会已排序。
- **可用性测试自检**：研究问题可测、任务是真实场景而非指令、每方案 5+ 参与者、定义成功指标、发现带严重度评级。
- **研究综合自检**：编码一致、模式基于 3+ 数据点、发现带证据、建议可执行、优先级有依据。
- 访谈提问按类型设计：情境（"带我走一遍你的一天"）、行为（"演示你怎么做 X"）、目标（"你想达成什么"）、痛点（"最难的是哪部分"）、反思（"你会改什么"）。

## 互见

- 「UI 设计系统」技能——研究发现反哺设计系统决策。
- 「产品经理工具箱」技能——客户访谈分析与画像研究互补。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。原始技能为 product-team 下的 `ux-researcher-designer`，本条目为中文适配重写，保留其核心命令、数据结构与方法论约束。
