---
name: material-contract-disclosure-schedule
title: 重大合同披露附表构建
description: 当需依据购买协议(PA)的「重大合同」定义、从尽调发现构建陈述所引用的披露附表(如 Schedule 3.X)时使用；做的是套用 PA 定义把命中条款逐条入表、标临界灰区、按协议版式编排、旁挂内部同意追踪喂交割清单；不适用于自定重要性定义、取得同意、起草陈述本身。触发词：披露附表、重大合同清单、disclosure schedule、material contracts、schedule 3。
domain: 领域/legal
triggers: [披露附表, 重大合同清单, disclosure schedule, material contracts, schedule 3, material contract definition, 同意追踪, change of control 同意, contracts schedule]
tags: [legal, m-and-a, disclosure-schedule, material-contracts, due-diligence, corporate, consent-tracking]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [VDR MCP (Box/Intralinks/Datasite), Westlaw, CourtListener]
requires: []
related: [general-counsel-advisor, contract-playbook-review, esignature-routing]
combines_with: [diligence-issue-extractor]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

购买协议里有一条陈述：「Schedule 3.X 列明全部重大合同。」本技能就是从尽调发现中**构建那张附表**——按协议自身的「重大合同」定义判定哪些合同重大，并按协议要求的版式编排。

适用判据：用户说「构建合同附表」「做披露附表」「schedule 3.X」「重大合同清单」，或正在起草披露附表时。

不该用的边界（交给人或其它环节）：

- **不自定重要性定义。** 定义在购买协议里，以 PA（购买协议）为准。本技能只机械套用，不改判据。
- **不取得同意。** 只追踪哪些合同需要第三方同意，不去拿同意。
- **不起草陈述本身。** 只填充陈述所引用的那张附表。
- 临界/灰区不替律师拍板，一律标记 `[review]` 交人决定。

## 步骤

**前置：加载上下文。**
- 购买协议草稿 —— 取「重大合同」定义 + 附表版式。
- 机构治理配置中的重要性门槛（**可能与协议定义不同 —— 以协议定义为准**）。
- 来自 `diligence-issue-extractor` 的尽调发现 —— 合同级数据。

### 第 1 步：取定义

从购买协议里拉出「重大合同」的定义，**PA 定义控制**。注意：
- 交易结构差异（股权 vs. 资产 vs. 合并）会改变某一「分支（prong）」的解释。
- 受监管行业叠加（医疗、国防、金融、电信、政府采购）可能在 PA 之外另加同意要求；若涉及，研究适用的反转让/更新（novation）规则（如联邦合同、政府采购 novation、行业专项同意法规）并引用控制性规则。

PA 定义中常见的分支门类（**不是读 PA 的替代品，最终以 PA 实际所列为准**）：
- 金额门槛（年度或累计）
- 合同期限
- 控制权变更 / 反转让条款
- 排他或竞业
- 前 N 大客户或供应商合同
- 不动产租约
- IP 许可（入向与出向）
- 关联方协议
- 政府合同
- 非常规业务（outside ordinary course）合同

**PA 定义即判据。机械套用 —— 命中任一分支的合同就上表。**

### 第 2 步：把定义套到发现上

对尽调审过的每份合同：

| 合同 | 命中分支 | 是否纳入 |
|---|---|---|
| [名称] | [年值 $X+；含控制权变更条款] | 是 |
| [名称] | [无] | 否 |

**需人工决断的临界情形（标 `[review]`）：**
- 合同金额为 $X-1（恰好低于门槛）但对业务很重要
- 合同命中某分支，但本就要被终止
- 口头协议或附函（side letter），是否算数存疑

### 第 3 步：采集附表数据

每份纳入的合同，附表通常需要：

| 字段 | 来源 |
|---|---|
| 对手方名称 | 合同 |
| 合同标题/类型 | 合同 |
| 日期 | 合同 |
| 期限 / 到期 | 合同 |
| 年度/总金额 | 合同或管理层数据 |
| 命中哪个重要性分支 | 第 2 步分析 |
| 本交易是否需同意 | 尽调发现 |
| VDR 引用 | 尽调清单 |

从既有尽调抽取拉取。**字段缺失就标记，不要猜。**

### 第 4 步：按协议版式编排

披露附表有固定版式 —— 通常是编号列表或表格，有时按合同类型分子项。**对齐草稿协议里其它附表的版式。**

```markdown
## Schedule 3.[X] — Material Contracts

The following are the Material Contracts as of the date hereof:

### (a) Customer Contracts

1. [Agreement Title], dated [date], between [Target] and [Counterparty].
   [Brief description if the format calls for it.]
   [VDR: path]

2. [...]

### (b) Supplier Contracts

[...]

### (c) Real Property

[...]

[etc. — 按协议定义的结构分子项]
```

### 第 5 步：同意追踪旁挂（内部，不入附表）

**单独**追踪哪些已列入附表的合同需要同意（不放进附表本身——这是内部件）。

| Schedule # | 对手方 | 是否需同意 | 状态 | 负责人 | 截止 |
|---|---|---|---|---|---|
| 3.X(a)(1) | [名称] | 是 —— 控制权变更 §12.2 | 已请求 | [姓名] | [日期] |

此清单喂给交割清单（closing-checklist）。

## 指令

- **特权与保密（强约束）：** 同意追踪清单及任何交付前的附表工作稿，源自受特权保护的尽调材料，**继承其特权与保密状态** —— 超出特权圈分发可能导致特权丧失。而**附表本身一旦作为已签 PA 的附件交付，即为交易文件、不再特权**；交付前**剥除全部内部批注**（`[review]` 标记、同意状态、内部备注）。
- **来源标注：** 凡引用反转让/novation 规则等法律依据，按实际来源打标签（`[Westlaw]`/`[CourtListener]`/`[statute — verify]`/`[model knowledge — verify]`/`[user provided]`）；不臆造法条内容，不静默补充。
- 字段缺失只标记不臆测；临界判定只标 `[review]` 不替律师决定。

## 交付前交叉核对

- **完整性：** 命中任一分支的合同都在表上。
- **不过度披露：** 表上没有不命中分支的合同 —— 这是一条**陈述**，不是数据堆砌。
- **跨表一致：** 与其它陈述一致（如 Schedule 3.X 上某合同产生留置权，则也应出现在留置权附表上）。
- **可溯源：** 每条都有 VDR 引用，让买方律师能找到底层文件。

## 示例

输入：「Project Atlas 的合同附表做一下，PA 在 vdr-mirror，尽调发现在 diligence 文件夹。」

代理动作：从 PA 拉「重大合同」定义 + 取其它附表版式 → 逐份合同套定义填判定表、临界标 `[review]` → 命中条款采集附表字段（缺失即标记）→ 按 PA 子项结构编排 Schedule 3.X → 旁挂内部同意追踪表喂 closing-checklist → 交付前剥除全部内部批注。

一条判定示例：

```
合同：与 Acme 的主供货协议（MSA）
命中分支：年值 $4.2M（超 $1M 门槛）+ §12.3 控制权变更条款
是否纳入：是 → Schedule 3.X(b) 供应商合同
同意：是 —— §12.3 需 Acme 书面同意（旁挂入同意追踪，喂 closing-checklist）
VDR：/02-Contracts/Acme-MSA-2023.pdf
```

## 注意事项

- **以 PA 定义为准**，不沿用机构通用重要性门槛；二者冲突时协议定义控制。
- 受监管行业（医疗/国防/金融/电信/政府采购）可能在 PA 之外另加同意/novation 要求，须单独研究并引用控制性规则。
- 这是一条**陈述**：宁缺勿滥地避免过度披露，表上多出不命中的合同会扩大陈述范围。
- 同意追踪是内部件、**不入附表**；附表交付前剥除全部内部批注。
- 输入是来自 `diligence-issue-extractor` 的合同级发现；输出的同意项流向交割清单。

## 互见

- combines_with：`diligence-issue-extractor` —— 提供合同级尽调发现作为本技能输入。
- related：`general-counsel-advisor` —— 重要性临界、监管叠加等灰区判断的咨询入口。
- related：`contract-playbook-review` —— 对入表合同条款（控制权变更/转让限制）的逐条审查。
- related：`esignature-routing` —— 同意取得与签署流转的下游环节。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
