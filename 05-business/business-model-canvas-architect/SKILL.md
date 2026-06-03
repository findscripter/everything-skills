---
name: business-model-canvas-architect
title: 商业模式画布构建顾问
description: 当需要设计新业务模式、审计现有业务的收入-成本对齐或在转型时重验核心商业逻辑时使用；以 Osterwalder 九宫格画布迭代构建并校验逻辑一致性，产出可审计的商业模式画布。不适用于市场需求验证、财务预测（P&L）或法律实体设计。触发词：商业模式画布、九宫格、价值主张
domain: 商业/finance
triggers: [商业模式画布, 九宫格画布, BMC, 价值主张, 客户细分, 商业模式设计, 业务转型, 收入成本对齐, Osterwalder]
tags: [business-model, osterwalder, strategy, bmc, 商业策略]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude, cursor, gemini]
requires: []
related: [market-sizing-tam-sam-som, unit-economics-analyzer, competitive-analysis, pricing-strategy]
combines_with: [startup-financial-modeler, investor-materials-builder, market-sizing-analyst]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 从零设计一套新的商业架构时。
- 审计现有业务，检查「收入-成本」是否对齐、价值交付是否存在缺口时。
- 业务需要转型（pivot），核心商业逻辑需要重新验证时。

**不该用的边界**：

- 仅作顾问性结构梳理，不验证真实市场需求或模式的实际财务可行性。
- 一致性检查是纯逻辑层面的，无法预测运营执行的瓶颈。
- 不提供详细财务预测（P&L 损益表），也不做法律实体结构设计。

## 步骤

围绕 Osterwalder 九宫格框架，分三步迭代推进，核心是锁住价值主张、客户细分与成本结构之间的内部逻辑闭环。

### 第 1 步：核心价值主张与客户锁定

迭代定义「价值主张（Value Proposition）」与「客户细分（Customer Segments）」，确保二者逻辑对齐——这是整张画布的地基，必须先于其他模块完成。

### 第 2 步：结构设计

在价值-客户锁定的基础上，依次填充：渠道通路（Channels）、客户关系（Relationships）、关键业务（Key Activities）、核心资源（Key Resources）、重要合作（Key Partners）。

### 第 3 步：财务与一致性校验

终检：确认每一项「关键业务」都在「成本结构（Cost Structure）」中有对应条目，且每条「收入来源（Revenue Streams）」都能匹配到对应的客户细分。

## 指令

- 先锁定「价值主张 / 客户细分」闭环，再填其余模块。
- 每一个「关键业务」都必须在「成本结构」中有对应入账项。
- 不要一轮把九个模块全填满；采用迭代方式，逐步深挖以保持逻辑深度。

## 示例

### 示例 1：订阅制 SaaS（可直接运行）

「为一个 AI 驱动的农业科技平台起草商业模式画布：该平台以订阅制为大规模农场主提供土壤分析服务。重点说明核心资源（IoT/AI）如何驱动成本结构。」

### 示例 2：高端零售转型

「分析一个 DTC（直面消费者）有机乳制品品牌的一致性。确保『高端身份』价值主张与其高接触度的营销活动及成本结构相互对齐。」

## 注意事项

- 仅作辅助：本技能支持结构化起草，但不验证市场需求或模式的真实财务可行性。
- 执行盲区：一致性检查纯属逻辑层，无法预判运营执行瓶颈。
- 超出范围：不做详细财务预测（P&L）与具体法律实体结构设计。
- 迭代优先于求全：避免单轮填满九宫格，分步迭代才能保持每个模块的逻辑深度。

## 互见

- 适用于战略规划、新业务立项、业务转型评估等上游场景；下游可衔接财务建模、市场验证类专项工具补足本技能的盲区。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
