---
name: compensation-analysis
title: 薪酬基准与定级分析
description: 当为某岗位定薪/判断 offer 是否有竞争力/给股权授予建模/上传薪酬数据找异常与留存风险时使用；按总薪酬框架拉市场分位带(P25/50/75/90)、对照薪酬带做定级、建股权模型并产出建议；不适用于真实抓取薪酬数据、个人发薪/HRIS 写操作、税务社保核算；触发词：定薪、薪酬基准、offer 竞争力、薪酬带、股权授予建模、compensation、benchmark
domain: 商业/copy
triggers: [定薪, 薪酬基准, offer 竞争力, 薪酬带, 定级, 股权授予建模, 薪酬异常, 留存风险, compensation, benchmark, equity grant]
tags: [compensation, benchmarking, hr, equity, salary-band, retention, business]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [performance-review-builder, offer-letter-drafter, interview-plan-builder, hr-partner-pro]
combines_with: [offer-letter-drafter, performance-review-builder]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

- 为招聘/调薪给某岗位定薪：「某城市某级别的资深工程师该给多少？」需要市场分位带与定位建议。
- 判断一份 offer 或现有薪资是否有市场竞争力，对照 P25/50/75/90 分位。
- 给股权授予/refresh 授予建模：「4 年授予 10K 股、股价 $50，价值多少？」
- 上传/粘贴薪酬数据（CSV 或薪酬带），做带内定位、找异常值与留存风险。

不该用的边界：
- 不负责真实抓取权威薪酬数据库；无连接器时只能用公开数据 + 用户提供口径，所有外部数字标 [需核查]。
- 不做个人发薪、HRIS 写操作、个税/社保/公积金核算与合规裁定。
- 不替代法律/税务顾问对股权税务、归属条款的专业意见。
- 薪酬数据高度敏感，仅在本次会话内分析，不外传、不留存。

## 步骤 / 指令

输入先问清：`role`（职能+专长）、`level`（IC/管理级别）、`location`（地域，必问）、`company_stage`（初创/成长/上市）、`industry`。缺地域不要出基准。

```
1. 拆总薪酬（Total Comp）四件套，别只看 base：
   Base 基本工资 / Equity 股权(RSU·期权) / Bonus 目标奖金·签字费 / Benefits 福利(医疗·退休·难量化)

2. 定关键变量：role × level × location × company_stage × industry
   地域差异极大(SF vs Austin vs London)，公司阶段决定 base/equity 配比。

3. 取基准数据：
   有薪酬库连接器 → 按 role/level/location 拉已验证基准，并和用户薪酬带实时对照。
   无 → 公开薪资数据 + web 检索 + 用户上下文；务必注明数据时效与来源局限。

4. 出市场分位带：对 base / equity / total comp 各给 P25/P50/P75/P90。
   叠加地域调整系数与公司阶段语境。

5. 带内定位(若给了数据)：每人算 position = (current_base - band_min)/(band_max - band_min)
   标注 Below / At / Above band；找异常值(显著偏离带或同级)。

6. 留存风险：低于带中位且绩效好、或 offer 落后市场 P50 → 标高留存风险，给调薪/股权建议。

7. 交付：分位带表 + 带分析表 + 建议(定薪/股权/留存)，附数据源与时效。
```

股权建模速记：
```
授予总价值 ≈ 股数 × 当前/预期股价(注明口径)
年化价值   ≈ 授予总价值 / 归属年限(常见 4 年)
期权另算   : 内在价值 ≈ (现价 - 行权价) × 股数；标注归属表(常见 1 年 cliff + 逐月)
始终区分「面值」与「预期价值」，初创股权高度不确定，标风险。
```

## 示例

输出骨架（Markdown）：

```markdown
## 薪酬分析：[岗位/范围]

### 市场基准
| 分位 | Base | Equity | Total Comp |
|------|------|--------|------------|
| P25  | $[X] | $[X]   | $[X]       |
| P50  | $[X] | $[X]   | $[X]       |
| P75  | $[X] | $[X]   | $[X]       |
| P90  | $[X] | $[X]   | $[X]       |

**数据源：** [薪酬库 / web 检索 / 用户提供]（时效：[年月]）

### 带内分析（若提供数据）
| 员工 | 现 Base | 带下限 | 带中位 | 带上限 | 定位 |
|------|---------|--------|--------|--------|------|
| [名] | $[X]    | $[X]   | $[X]   | $[X]   | Below/At/Above |

### 建议
- [具体定薪建议]
- [股权考量]
- [留存风险（如有）]
```

## 注意事项

- 地域必问：不给地域不要出基准，城市间差异可达数倍。
- 看总薪酬而非只看 base：股权、奖金、福利一并纳入才完整。
- 数据卫生：外部薪资数字、研报、「市场普遍给…」一律标 [需核查] 交 `fact-checking`，本技能不自行背书；标清时效，避免引用过期口径。
- 保密：薪酬属敏感数据，分析结果只留在本次会话，不落盘、不外发。
- 股权不确定性：初创/未上市股权区分面值与预期价值，明示归属表与风险，不替代税务/法律意见。
- 单一职责：只给框架、分位带、定级与建议逻辑，不抓权威数据、不发薪、不做合规裁定。

## 互见

- related：`startup-financial-modeler` —— 股权授予建模与稀释、资金消耗可接入其财务模型。
- related：`cfo-financial-advisor` —— 薪酬总包预算与人力成本规划从 CFO 视角校准。
- related：`pricing-strategy` —— 同属「定价/定值」方法，分位带与意愿支付的思路可互参。
- related：`market-sizing-analyst` —— 分位带与三角校准的方法论可借鉴其数据源处理。
- combines_with：`competitive-analysis` —— 做雇主竞争力对标时，结合竞品/同行薪酬情报输入。

---
本条采编自 anthropics/knowledge-work-plugins（Apache-2.0 许可）。
