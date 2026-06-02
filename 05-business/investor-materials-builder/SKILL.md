---
name: investor-materials-builder
title: 投资人材料制作（路演 PPT / 备忘录 / 财务模型）
description: 当需要制作或修订融资材料（路演 PPT、一页纸、投资备忘录、加速器申请、财务模型）时使用；做对外融资资料的撰写与跨文档一致性核对，产出可在合伙人会议上经得起追问的材料；不适用于内部经营分析、产品文档或无融资目的的财务记账；触发词：路演 PPT、投资备忘录、融资材料
domain: 商业/finance
triggers: [路演 PPT, pitch deck, 投资备忘录, 一页纸, 融资材料, use of funds, 财务模型, 加速器申请, 资金用途]
tags: [商业, finance, 融资, 投资人材料, pitch-deck, 财务模型]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit]
requires: []
related: [ib-pitch-deck-builder, board-deck-builder, startup-financial-modeler, pitch-deck-refresh]
combines_with: [python-pptx-deck-generator, three-statement-model, market-sizing-tam-sam-som]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

适用于一切对外融资沟通材料的制作与修订：

- 创建或改版路演 PPT（pitch deck）
- 撰写投资备忘录（memo）或一页纸（one-pager）
- 搭建财务模型、里程碑计划或资金用途（use of funds）表
- 回答加速器 / 孵化器申请表问题
- 让多份融资文档对齐到同一份「事实基准」（source of truth）

不该用：内部经营复盘、产品需求文档、对外不涉及融资的演示，以及单纯的记账 / 报税。这些场景没有「向投资人自证」的核心约束，套用本流程只会增加无谓负担。

## 步骤

铁律（Golden Rule）：所有融资材料必须互相一致。动笔前先建立或确认唯一「事实基准」，至少覆盖：牵引力指标（traction）、定价与营收假设、融资额与工具（如 SAFE / 可转债 / 股权）、资金用途、团队简历与头衔、里程碑与时间线。一旦发现数字打架，立即停下来先对齐，再起草。

核心工作流：

1. 盘点既有的权威事实（canonical facts）
2. 找出缺失的假设并补齐
3. 选定要产出的资产类型
4. 用显性逻辑起草该资产（假设可见、不藏在公式里）
5. 逐一把每个数字回核到事实基准

## 指令

按资产类型分别遵循：

### 路演 PPT（推荐页序）
1 公司与切入点（wedge）→ 2 问题 → 3 解决方案 → 4 产品 / Demo → 5 市场 → 6 商业模式 → 7 牵引力 → 8 团队 → 9 竞争 / 差异化 → 10 融资诉求（ask）→ 11 资金用途 / 里程碑 → 12 附录。

若用户要 Web 原生的演示稿，本技能与 `frontend-slides`（前端幻灯片）配合使用。

### 一页纸 / 备忘录
- 用一句干净的话讲清楚公司在做什么
- 说明「为什么是现在」（why now）
- 牵引力与佐证点尽量靠前
- 融资诉求要精确（金额、工具、估值口径）
- 所有论断都易于被核实

### 财务模型
- 假设显性列出
- 视情况给出 悲观 / 基准 / 乐观（bear / base / bull）三档
- 营收逻辑逐层清晰拆解
- 支出与里程碑挂钩
- 决策高度依赖某假设时，附敏感性分析

### 加速器申请
- 精确回答被问的那个问题，别答非所问
- 优先突出牵引力、独到洞察与团队优势
- 不堆砌空话
- 内部指标与 PPT、模型保持一致

## 示例

场景：用户要做一份种子轮路演 PPT，并附一页纸和资金用途表。

1. 先建事实基准：MRR ¥80k、月环比 15%、拟融 ¥600 万（SAFE，估值上限 ¥4500 万）、资金用途 = 研发 50% / 增长 30% / 运营 20%。
2. 校验资金用途：50 + 30 + 20 = 100%，¥600 万拆为 300 / 180 / 120 万，加总回到 600 万 —— 通过。
3. 按推荐页序产出 12 页 PPT，牵引力页与一页纸的 MRR 必须字字相同。
4. 交付前过质量门：三处文档的融资额、估值、增速、用途占比逐项比对一致。

## 注意事项

要避开的红旗（Red Flags）：

- 无法核实的论断
- 没有假设支撑的模糊市场测算
- 团队角色 / 头衔前后不一
- 营收数学加不齐
- 在脆弱假设上表现出过度确定

交付前质量门（Quality Gate）：

- 每个数字都与当前事实基准一致
- 资金用途与营收各层都能正确加总
- 假设是可见的，没有埋进公式
- 故事清晰、不靠夸大话术
- 最终材料在合伙人会议上经得起追问

## 互见

- `frontend-slides`：需要 Web 原生 / 可交互演示稿时配合使用。

---

采编自 affaan-m/everything-claude-code（MIT 许可证）。
