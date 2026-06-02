---
name: click-path-state-audit
title: 点击路径状态序列审计（隐性交互冲突）
description: 当系统化调试已扫过仍有"按钮点了没反应/最终状态不对"的报障、或共享状态 store 大重构后做交互回归时使用；逐个交互触点按调用顺序追踪状态读写与副作用，产出 store 副作用图、触点审计表与互相抵消/竞态的缺陷清单；不适用于纯崩溃/类型/接线类 bug（用 systematic-debugger）或单元接口测试；触发词：点击路径、状态副作用、互相抵消、隐性重置、共享状态冲突、Zustand、Redux、按钮无反应、最终状态不一致、竞态
domain: 研发/testing
triggers: [点击路径, 状态副作用, 互相抵消, 隐性重置, 共享状态冲突, Zustand, Redux, 按钮无反应, 最终状态不一致, 竞态]
tags: [click-path-audit, state-management, side-effects, race-condition, ui-bug, testing]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [zustand, redux, react-context]
requires: []
related: [systematic-debugger, systematic-debugging-strategies, webapp-testing, react-state-management]
combines_with: [playwright-e2e-testing, bug-hunter, react-state-management]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

适用：
- 系统化调试已扫过一轮、修了一批 bug，但用户仍报「这个按钮点了没反应 / 状态没变 / 结果不对」这类隐性问题。
- 触碰共享状态 store（Zustand / Redux / React Context）的主干重构之后，做交互回归。
- 怀疑两个单独都正常的功能在同一处理器里被串联调用时**互相抵消**，或异步调用乱序解析产生错误最终状态。

不该用（负边界）：
- 缺接线、运行时崩溃、类型错误、数据流不通这类「静态/常规」缺陷 —— 用 `systematic-debugger`，常规调试就能抓到。
- 单元测试 / 接口（HTTP API）测试 / 纯后端逻辑断言。
- 已知根因、直接改码即可，无需审计整条路径。

核心价值：补常规调试的盲区。常规调试只问「函数存在吗？会崩吗？返回类型对吗？」，**不问**：最终 UI 状态和按钮标签承诺的一致吗？函数 B 是否悄悄撤销了函数 A 刚做的事？共享状态里有没有抵消本次操作的副作用？

> 真实案例：「新邮件」按钮先 `setComposeMode(true)` 再 `selectThread(null)`，两者单独都正常；但 `selectThread` 有个副作用会把 `composeMode` 重置为 `false`，于是按钮点了等于没点。同批 54 个 bug 被常规系统化调试找到，唯独这个被漏掉。

## 步骤

对目标区域每一个可交互触点，按下面顺序走：

```
1. 定位处理器（onClick / onSubmit / onChange ...）
2. 按【调用顺序】列出处理器里的所有函数调用
3. 逐个函数调用，问四件事：
   a. 读了哪些状态？
   b. 写了哪些状态？
   c. 对共享状态有无副作用？
   d. 是否把某些状态作为副作用重置/清空？
4. 检查：后面的调用是否撤销了前面调用的状态变更？
5. 检查：最终状态是否等于用户从按钮标签预期的状态？
6. 检查：有无竞态（异步调用以错误顺序解析）？
```

## 指令

### 步骤 1：先画状态 store 副作用图（前置，不可跳过）

审计任何触点之前，先把范围内所有 store action / setter 的副作用建成一张图。不知道 `selectThread` 会重置 `composeMode`，那个 bug 就永远看不见。

```
对范围内每个 Zustand store / React Context：
  对每个 action / setter：
    - 它 set 哪些字段？
    - 它作为副作用 reset 哪些不属于自己的字段？
    - 记录：actionName → { sets: [...], resets: [...] }
```

输出格式（重点标注「危险重置」—— 即清空了非自己所有状态的 action）：

```
STORE: emailStore
  setComposeMode(bool) → sets: {composeMode}
  selectThread(thread|null) → sets: {selectedThread, selectedThreadId, messages, drafts, selectedDraft, summary}
                              RESETS: {composeMode: false, composeData: null, redraftOpen: false}
  setDraftGenerating(bool) → sets: {draftGenerating}

DANGEROUS RESETS（清空了不属于自己的状态）：
  selectThread → 重置 composeMode（该字段由 setComposeMode 所有）
  reset        → 重置一切
```

### 步骤 2：逐触点审计

对目标区域每个按钮 / 开关 / 表单提交：

```
TOUCHPOINT: [按钮标签] in [组件:行号]
处理器：    [完整的函数调用序列]
预期最终态：[这次交互应当达成的状态]
判定：      序列中是否有后置调用命中步骤 1 的 DANGEROUS RESETS，
            从而撤销了本触点想要的状态？最终态与按钮承诺一致吗？
```

## 示例

对照副作用图逐行核对「新邮件」按钮：

```
TOUCHPOINT: "新邮件" in ComposeButton:42
处理器：
  1. setComposeMode(true)     // 想进入撰写态：composeMode = true
  2. selectThread(null)       // 想清空当前会话
预期最终态：composeMode = true（露出撰写面板）

核对副作用图：
  selectThread ∈ DANGEROUS RESETS → resets {composeMode: false}
  → 第 2 步把第 1 步刚设的 composeMode 又改回 false
判定：互相抵消，按钮点了无反应。
修复：交换顺序，或让 selectThread 接受 preserveCompose 选项 /
      把 composeMode 移出 selectThread 的重置范围。
```

竞态版：处理器先 `await save()` 再 `await refresh()`，但 `refresh` 实际先解析，拿到旧数据覆盖了 `save` 的写入 —— 同样体现为「最终态 ≠ 预期态」。把异步调用纳入步骤 6 的顺序检查。

## 注意事项

- 副作用图是整套方法的命门：漏画一个 RESETS，对应的抵消 bug 就隐形。务必先全量建图，再审触点。
- 重点盯「清空了非自己所有状态」的 action（如 `selectThread`、各类 `reset`）—— 抵消 bug 几乎都源于此。
- 处理器内调用**有序**，顺序就是缺陷所在：后置调用覆盖前置调用是默认嫌疑。
- 异步调用不能只看书写顺序，要看实际**解析顺序**，否则会漏掉竞态。
- 本方法是定位手段，不是测试框架；定位到后，建议用 `webapp-testing` 真实驱动浏览器复现该次点击、确认修复生效。

## 互见

- requires：`react-state-management` —— 需先理解 Zustand/Redux/Context 的 action、副作用与所有权，才能正确建副作用图。
- related：`systematic-debugger`、`systematic-debugging-strategies` —— 常规系统化调试负责接线/崩溃/类型类 bug，本技能专补其漏掉的「状态互相抵消」盲区，二者互补。
- combines_with：`webapp-testing` —— 审计定位出可疑触点后，用其驱动浏览器实测复现点击、验证修复；`code-reviewer` / `adversarial-code-reviewer` —— 大重构后先静态评审改动、再跑本审计，形成「评审 + 状态路径审计」闭环。

---
本条采编自 affaan-m/everything-claude-code（MIT）。
