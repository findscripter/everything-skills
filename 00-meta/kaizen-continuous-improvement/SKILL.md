---
name: kaizen-continuous-improvement
title: 改善持续改进法（Kaizen）
description: 当写代码、重构、做设计或评审需要稳步提升质量时使用；用四支柱（持续小改进/防错设计/标准化/按需交付）做出可验证的增量改动并防止整类错误；不适用于一次性推倒重写或无度量的提前优化。触发词：重构、改善、防错、提质
domain: 通用/thinking
triggers: [重构代码, 提升代码质量, 改善流程, 防错设计, 评审改进建议, 避免过度设计, 增量优化, 标准化模式]
tags: [思维方法, 持续改进, 重构, 防错, 代码质量, 工程文化, YAGNI]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [invariant-guard-correctness, algorithm-first-discipline, closed-loop-delivery, first-principles-thinking]
combines_with: [clean-code-principles, tech-debt-prioritizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于日常工程改进，贯穿写码、重构、架构设计、错误处理与代码评审。核心信条：许多小改进胜过一次大变更；错误在设计期预防，而非靠事后修补。

**不该用（负边界）：**
- 不为追求「一次到位的完美」而停滞——本法主张今天够好、明天更好。
- 不做大爆炸式推倒重写；改进必须可拆分、可逐步验证。
- 不做无度量的提前优化与「以防万一」的过度抽象——先有证据再加复杂度。
- 任务边界、权限、安全约束或成功标准不清时，先停下来问清楚，再动手。

## 步骤

四支柱，按需取用：

**1. 持续改进（Kaizen）——增量优于革命**
- 每次只做能提升质量的「最小可行变更」，验证通过后再做下一个。
- 顺手改善：随手修小问题、删死代码、更新过时注释（限定在当前 scope 内）。
- 三遍迭代法，不要一次全做：第一遍让它跑通 → 第二遍让它清晰 → 第三遍让它健壮/高效。
- 重构时一次只治一种坏味道，每步提交、保持测试常绿，到「够好」（收益递减）就停。
- 评审时建议增量改进而非重写，按 关键 → 重要 → 锦上添花 排序，接受「比之前更好」。

**2. 防错（Poka-Yoke）——让错误无法发生**
分层防御，越靠左（越早）越好：① 类型系统（编译期）→ ② 边界校验（运行期、尽早）→ ③ 守卫/前置条件 → ④ 错误边界（优雅降级）。
- 用类型让非法状态不可表达（联合类型带状态数据、`NonEmptyArray<T>`、品牌类型 `PositiveNumber`）。
- 在系统边界校验一次，内部到处安全使用；绝不「先用后校验」。
- 用早返回守卫表达并强制前置条件，快速且响亮地失败，给出清晰错误信息。
- 配置「必填优于带默认的可选」，启动时校验全部配置，失败就让部署/启动挂掉，而非到生产请求时才炸。

**3. 标准化工作——沿用已被证明的模式**
- 一致性优于聪明：沿用代码库既有模式，不重复造轮子；新模式需显著更优且团队共识。
- 文档与代码同处：README 写架构、CLAUDE.md 写约定、注释写「为什么」而非「做什么」、复杂模式配示例。
- 自动化标准：Linter 管风格、类型检查管契约、测试管行为、CI/CD 管质量门禁。
- 落地前先搜代码库有无现成解法、查 CLAUDE.md 约定；破例需讨论并更新文档。

**4. 准时制（JIT / YAGNI）——只造此刻需要的**
- 只实现当前需求，删掉「以后可能用到」的投机代码。
- 用「能跑通的最简方案」起步，需求变了再加复杂度。
- 优化先剖析后动手：先 profile 定位瓶颈，度量前后差异，接受「够好」的性能。
- 抽象遵循「三次法则」：同类场景出现 3+ 次再抽象；宁可重复，不要错误的抽象。

## 指令

- 始终做最小可验证变更，做完一个验证一个再继续。
- 永远让代码比你看到时更好（leave it better）。
- 把校验放在边界、放在使用之前；让正确路径显而易见、错误路径难以走通。
- 沿用既有模式；引入新模式必须更优且达成共识，并更新文档。
- 没度量不优化，没出现 3+ 次不抽象，删除一切「以防万一」的代码。

## 示例

三遍迭代（TypeScript，源自原技能）：

```typescript
// 第一遍：跑通
const calculateTotal = (items: Item[]) => {
  let total = 0;
  for (let i = 0; i < items.length; i++) total += items[i].price * items[i].quantity;
  return total;
};

// 第二遍：清晰
const calculateTotal = (items: Item[]): number =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

// 第三遍：健壮（加校验）
const calculateTotal = (items: Item[]): number => {
  if (!items?.length) return 0;
  return items.reduce((total, item) => {
    if (item.price < 0 || item.quantity < 0) throw new Error('价格与数量必须非负');
    return total + item.price * item.quantity;
  }, 0);
};
```

防错——边界校验一次，内部恒安全：

```typescript
type PositiveNumber = number & { readonly __brand: 'PositiveNumber' };
const validatePositive = (n: number): PositiveNumber => {
  if (n <= 0) throw new Error('必须为正数');
  return n as PositiveNumber;
};
// 入口处校验一次
const handlePaymentRequest = (req: Request) => {
  const amount = validatePositive(req.body.amount);
  processPayment(amount); // amount 已保证为正，内部无需再查
};
```

配套命令（结构化问题分析，与本法配合）：`/why`（5 Whys 根因）、`/cause-and-effect`（鱼骨图多因分析）、`/plan-do-check-act`（PDCA 迭代）、`/analyse-problem`（A3 全量文档）、`/analyse`（Gemba/VSM/Muda 智能选法）。命令用于结构化攻坚，本法用于日常开发。

## 注意事项

各支柱的红旗信号，出现即纠偏：
- 违反持续改进：「以后再重构」（永远不会）、把代码留得更糟、用大爆炸重写代替增量。
- 违反防错：「用户自己小心点就好」、先用后校验、可选配置且无校验。
- 违反标准化：「我就喜欢按自己的来」、不查既有模式、无视项目约定。
- 违反 JIT：「说不定哪天用得上」、还没用就先造框架、没度量就优化。

记住：是「持续小改进 + 设计期防错 + 沿用成熟模式 + 只造所需」；不是「一次到位的完美 + 大重构 + 炫技抽象 + 提前优化」。本法不替代针对具体环境的验证、测试与专家评审。

## 互见

- 配套结构化命令：`/why`、`/cause-and-effect`、`/plan-do-check-act`、`/analyse-problem`、`/analyse`。
- 通用/思维域内的其他「增量交付 / 防错设计 / YAGNI 与简化」类技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
