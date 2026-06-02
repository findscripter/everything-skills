---
name: code-simplifier
title: 保持功能不变的代码简化
description: 当需要在不改变行为的前提下清理/简化代码、提升可读性与一致性，或让本次改动对齐项目规范时使用；做最小化重构并产出更清晰可维护的等价代码；不适用于新增功能、改变输出/行为、性能调优或大范围重写。触发词：简化代码、clean up、refactor for clarity、提升可读性、code-simplifier
domain: 研发/review
triggers: [简化代码, 清理代码, clean up code, refactor for clarity, 重构提升可读性, improve readability, 去除嵌套三元, 对齐项目规范, code-simplifier]
tags: [代码重构, 可读性, 代码质量, 等价改写, 研发, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Grep, Glob]
requires: []
related: [clean-code-principles, complexity-cuts, clean-craft-code-review, code-reviewer]
combines_with: [legacy-codebase-modernizer, systematic-debugger, adversarial-code-reviewer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要在**不改变行为**的前提下简化、清理代码，或对齐项目编码规范。
- 任务聚焦可读性提升、降低不必要复杂度，或让本次（近期）改动符合团队标准。
- 想做以「清晰、可维护」为目标的精修，而非功能开发。

**不该用边界：**
- 需要新增/修改功能、改变输出或行为 —— 这属于功能开发，不是简化。
- 以性能优化、API 重设计为目标的大范围重写。
- 缺少明确输入、权限、安全边界或验收标准时：先停下来询问澄清，不要擅自动手。
- 不要把本技能产出当作环境验证、测试或专家评审的替代品。

## 步骤

1. **定位（Identify）**：找出本会话中近期被修改/触碰的代码段。默认只精修这些范围，除非用户明确要求扩大范围。
2. **分析（Analyze）**：识别可提升优雅度与一致性的机会。
3. **应用（Apply）**：套用项目专属最佳实践与编码规范（见下方「指令」）。
4. **守恒（Ensure）**：确保所有功能、输出、行为完全不变。
5. **校验（Verify）**：确认改后代码确实更简单、更易维护。
6. **记录（Document）**：仅对影响理解的重大改动做说明，不为显而易见的改动写注释。

## 指令

**核心铁律：只改「怎么做」，不改「做什么」。** 原有的全部特性、输出与行为必须原样保留。

提升清晰度（Enhance Clarity）：
- 降低不必要的复杂度与嵌套层级。
- 删除冗余代码与多余抽象。
- 用清晰的变量名/函数名提升可读性，合并相关逻辑。
- 移除描述显而易见代码的无用注释。
- **避免嵌套三元运算符** —— 多分支条件改用 `switch` 或 `if/else` 链。
- 宁清晰勿紧凑：显式代码通常优于过度压缩的代码。

对齐项目规范（按 CLAUDE.md，以下为典型 TS/React 项目示例，无则按实际项目规范）：
- ES 模块，import 排序正确、带扩展名。
- 优先 `function` 关键字而非箭头函数。
- 顶层函数显式标注返回类型。
- React 组件用显式 `Props` 类型等规范模式。
- 合理的错误处理（尽量避免 try/catch）。
- 命名约定保持一致。

保持平衡（Maintain Balance）—— 避免过度简化导致：
- 降低可读性或可维护性；产生难懂的「聪明」写法。
- 把过多职责塞进单个函数/组件。
- 删掉有助于组织结构的有用抽象。
- 为「行数更少」牺牲可读性（如嵌套三元、稠密一行流）。
- 让代码更难调试或扩展。

## 示例

**嵌套三元 → 清晰的条件链：**

```typescript
// Before
const status = isLoading ? 'loading' : hasError ? 'error' : isComplete ? 'complete' : 'idle';

// After
function getStatus(isLoading: boolean, hasError: boolean, isComplete: boolean): string {
  if (isLoading) return 'loading';
  if (hasError) return 'error';
  if (isComplete) return 'complete';
  return 'idle';
}
```

**过度紧凑的链式调用 → 分步骤：**

```typescript
// Before
const result = arr.filter(x => x > 0).map(x => x * 2).reduce((a, b) => a + b, 0);

// After
const positiveNumbers = arr.filter(x => x > 0);
const doubled = positiveNumbers.map(x => x * 2);
const sum = doubled.reduce((a, b) => a + b, 0);
```

**冗余抽象 → 直接判断：**

```typescript
// Before
function isNotEmpty(arr: unknown[]): boolean {
  return arr.length > 0;
}
if (isNotEmpty(items)) { /* ... */ }

// After
if (items.length > 0) { /* ... */ }
```

## 注意事项

- 仅在任务明确落在上述范围时使用本技能。
- 范围默认锁定在近期改动；扩大范围需用户显式授权。
- 简化不等于压缩行数；可读性优先级高于「更短」。
- 输出仍需经过环境内的验证、测试与人工评审，本技能不替代它们。
- 信息不全（输入/权限/安全边界/验收标准缺失）时先询问，再动手。

## 互见

- `/simplify`：对改动代码做复用、简化、效率与抽象层次清理并直接应用修复（纯质量，不查 bug）。
- `/code-review`：审查当前 diff 的正确性 bug 与清理项；查 bug 用它。
- `code-review`、`review`：PR/分支级别评审。

---

*采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT 许可）；其原作基于 Anthropic 官方 code-simplifier agent。*
