---
name: test-coverage-gap-finder
title: 测试覆盖率缺口分析
description: 当需要盘点应用可测面、找出哪些路由/组件/接口/用户流程缺测试时使用；做法是构建覆盖矩阵并按业务影响排序缺口、产出带工作量估算的测试计划；不适用于运行测试或统计行级覆盖率数字本身。触发词：测试覆盖率、缺口分析、哪些没测、缺失测试、coverage gaps、missing tests
domain: 研发/testing
triggers: [测试覆盖率, 覆盖率缺口, 哪些没测, 缺失测试, coverage gaps, missing tests, coverage report, 测试计划, what needs testing]
tags: [testing, coverage, e2e, playwright, 测试规划, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Glob, Grep, Read]
requires: []
related: [python-testing-pytest, javascript-testing-patterns, api-test-suite-builder, webapp-testing]
combines_with: [python-testing-pytest, javascript-testing-patterns, playwright-e2e-testing]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 想知道整个应用「哪些地方有测试、哪些没测」，需要一张全局视图时。
- 在补测试、做发布质量评审、规划测试投入之前，需要按业务影响排出优先级时。
- 关键词触发：测试覆盖率、覆盖率缺口、哪些没测、缺失测试、coverage gaps、missing tests、测试计划。

不该用的边界：
- 不负责实际运行测试套件或采集行/分支级覆盖率百分比（那是 `jest --coverage` / `nyc` / `c8` 等工具的活）；本技能给的是「面」级覆盖估算与缺口清单。
- 不负责直接写测试代码；它产出的是计划，生成测试请转交对应的测试生成流程（如 `/pw:generate`）。
- 单个文件或单个函数的局部覆盖问题，无需走全量盘点。

## 步骤

### 1. 盘点应用可测面（Map Application Surface）

按四类穷举可测对象：

- 路由/页面：扫描路由定义（Next.js 的 `app/`、React Router 配置、Vue Router 等），列出所有面向用户的页面及其路径。
- 组件：识别交互型组件（表单、弹窗、下拉、表格），标注含复杂状态逻辑的组件。
- API 接口：扫描 API route 文件或后端控制器，列出所有端点及其方法。
- 用户流程：识别关键路径（登录鉴权、下单结账、新手引导、核心功能），梳理多步骤工作流。

### 2. 盘点已有测试（Map Existing Tests）

扫描所有 `*.spec.ts` / `*.spec.js` 测试文件，提取：

- 由 `page.goto()` 调用覆盖了哪些页面/路由；
- 由 locator 用法测了哪些组件；
- 哪些 API 端点被 mock 或被真实命中；
- 各区域的测试数量计数。

### 3. 生成覆盖矩阵（Coverage Matrix）

把第 1、2 步对齐成一张表，逐行标注状态（已覆盖 / 部分覆盖 / 缺失）：

```
## Coverage Matrix

| 区域 | 路由 | 测试数 | 状态 |
|---|---|---|---|
| Auth | /login | 5 | 已覆盖 |
| Auth | /register | 0 | 缺失 |
| Auth | /forgot-password | 0 | 缺失 |
| Dashboard | /dashboard | 3 | 部分覆盖（缺错误态） |
| Settings | /settings | 0 | 缺失 |
| Checkout | /checkout | 8 | 已覆盖 |
```

### 4. 按业务影响给缺口排序（Prioritize Gaps）

- 关键（Critical）：鉴权、支付、核心功能 → 最先补。
- 高（High）：面向用户的 CRUD、搜索、导航。
- 中（Medium）：设置、偏好、边界情况。
- 低（Low）：静态页、关于、条款。

### 5. 给出测试计划（Suggest Test Plan）

针对每个缺口给出：需要多少条测试、用 `templates/` 里的哪个模板、工作量估算（quick/medium/complex）。

```
## Recommended Test Plan

### Priority 1: Critical
1. /register（4 条）— 用 auth/registration 模板 — quick
2. /forgot-password（3 条）— 用 auth/password-reset 模板 — quick

### Priority 2: High
3. /settings（4 条）— 用 settings/ 模板 — medium
4. Dashboard 错误态（2 条）— 用 dashboard/data-loading 模板 — quick
```

### 6. 可选：自动生成（Auto-Generate）

询问用户「是否为优先级最高的 N 个缺口生成测试？[是/否/指定]」。若同意，对每个缺口按推荐模板调用 `/pw:generate`。

## 指令

- 用 Glob 定位路由/组件/API/测试文件，用 Grep 抽取 `page.goto()`、locator、被 mock 的端点等信号，再用 Read 精读关键文件，避免逐个全文读。
- 矩阵的「测试数」必须基于实测文件计数，不要凭印象估；状态分三档：已覆盖 / 部分覆盖（注明缺什么，如缺错误态）/ 缺失。
- 排序唯一依据是业务影响，而非实现难易——支付/鉴权即使已部分覆盖也要优先补齐空白。

## 示例

输入：「帮我看下这个 Next.js 项目测试覆盖率有哪些缺口。」

输出要点：
1. Coverage Matrix 表格；
2. 覆盖率的「面」级估算（例如 路由覆盖 6/12 ≈ 50%）；
3. 按 Critical/High/Medium/Low 排序的缺口清单，每项带工作量估算；
4. 询问是否自动生成 Top N 缺口的测试。

## 注意事项

- 这是「可测面」级覆盖，不是代码行覆盖率；不要把它当成 `--coverage` 的替代品，必要时两者结合看。
- 计数依赖测试文件命名约定（`*.spec.ts/js`）与 `page.goto()` 等模式；若项目用了其它框架/命名（如 `*.test.ts`、Cypress、Vitest），需先确认实际约定再扫描。
- 「部分覆盖」最容易被漏判——有 happy path 不等于覆盖了错误态、空态、权限边界，标注时要写清缺口内容。
- 第 6 步自动生成前务必征得用户确认，不要擅自批量写文件。

## 互见

- 测试生成流程：`/pw:generate`（按模板为具体缺口生成测试）。
- 行/分支级覆盖率统计工具：`jest --coverage`、`nyc`、`c8`、`vitest --coverage`。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
