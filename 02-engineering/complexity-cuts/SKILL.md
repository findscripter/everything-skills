---
name: complexity-cuts
title: 降低算法时空复杂度优化
description: 当现有代码已能跑通但时间/空间复杂度偏高（慢、超时、OOM、N+1）需重构时使用；按"验证-回滚-停止"循环每次只做一处变换，产出降复杂度的 diff 加 before→after 实测；不适用于写新代码、纯 I/O/网络瓶颈、n<100 的启动期代码。触发词：O(n²)、超时、N+1。
domain: 研发/review
triggers: [这段在大输入下很慢, 超时 timeout, 内存爆了 OOM, 降低复杂度 / 优化这个算法, 嵌套循环 O(n²), ORM N+1 查询, for 循环里 await 串行]
tags: [算法, big-o, 重构, 性能优化, n-plus-one, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude-code, antigravity, cursor, gemini-cli, codex-cli]
requires: []
related: [python-performance-optimization, code-simplifier, clean-code-principles, performance-profiler]
combines_with: [systematic-debugger, code-reviewer, test-coverage-gap-finder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当**已存在且能跑通**的代码，时间或空间复杂度高于必要值时使用本技能重构：

- 嵌套循环、`O(n²)` 或更差的扫描、重复计算、冗余分配、内存膨胀。
- 症状描述："大输入下很慢"、"超时"、"OOM/内存太多"、"降低复杂度"、"优化这个算法"。
- ORM 的 N+1 查询（Prisma、Drizzle、SQLAlchemy、Django、ActiveRecord）。
- 对独立项的 `for` 循环里写 `await`，导致串行延迟。

**不该用的边界：**

- 写**新代码**时的复杂度预防 —— 不是本技能职责（源技能体系交给 `lemmaly`）。
- 数学级优化（Bloom、HLL、FFT、JL 投影）—— 升级到 `mathguard`。
- 瓶颈是 **I/O / 网络 / 外部服务延迟**而非 CPU/内存 —— 去修 I/O 模式，本 playbook 无效。
- 启动期只跑一次、n 很小（n < ~100 且不在热路径）的代码 —— 过度优化只增风险无收益。

## 铁律

```text
变换前后，现有测试必须都为绿；没有测试不准动手
```

若代码无测试，**先写一个特征化测试**（golden 输入 → 当前输出），再变换，再验证测试仍通过。跳过这步，优化可能悄悄改坏调用方 ——「更快但更错」远比「慢但对」更糟。

## 步骤

对每一处要优化的代码，按顺序执行：

1. **写下当前与目标 Big-O**（动手前）。一行：当前 `time=O(?) / space=O(?)`；目标 `time=O(?) / space=O(?)`；主导输入维度（n 是什么、实际多大）。说不出当前 Big-O，说明还没读懂代码，继续读。
2. **定位瓶颈行，不要猜。** 指向负责主导项的确切行：嵌套循环？重复线性扫描？重算？热循环里的分配？修复就在那一行，不在别处。
3. **每次只做一处变换，跑"验证-回滚-停止"循环：**
   1. 从 playbook 里取**恰好一个**变换应用。
   2. 跑现有测试套件（或铁律要求你写的特征化测试）。
   3. 任一测试挂掉 → **立即回滚**。不准改测试，不准绕过失败。
   4. 统计这块代码的连续回滚次数。**连续 3 次回滚 → 停止优化**：瓶颈错了、变换错了、或代码有你没建模的不变量。升级到 `invariant-guard` 补写缺失契约，不准试第四次。
   5. 变换落地为绿后，才挑下一个。
4. **精确保持语义。** 降复杂度不得改变输出、顺序保证、稳定性或错误行为。若优化必须改语义（如输出无序），显式声明并确认可接受。
5. **不准编造数字。** 没测过不准写"快 10 倍""省 200MB"。写 `<measured: TBD>` 或真去测。
6. **变换落地后必须报告实测加速比。** 绿了之后跑代表性基准（同输入、同机器、热缓存），一行附在 diff 上：

```text
p50:  186 ms → 1.1 ms   (169× faster, n=20,000, 200 samples)
```

   无法测量（纯渐近、手头没有对应输入）就显式写：`asymptotic only, no measurement — O(n²) → O(n)`。绝不静默跳过。

## 指令

### 时间复杂度变换 playbook（按此顺序尝试）

| 坏味道 | 修复 | 典型收益 |
|---|---|---|
| `for x in A: if x in B`，B 是 list/array | B 一次性转 `Set`/`Map` | O(n·m) → O(n+m) |
| 嵌套循环算配对/连接 | 按 key 做 hash-join，按查找字段建索引 | O(n·m) → O(n+m) |
| 循环内反复 `.find`/`.indexOf`/`.includes` | 循环外预建索引 `Map<key,item>` | O(n²) → O(n) |
| 重复重算同一值 | 按输入 key memoize/缓存 | O(n·f(n)) → O(n+f(n)) |
| 循环内排序 | 循环外排一次 | O(n² log n) → O(n log n) |
| 反复线性扫 min/max/中位数 | 堆 / 有序结构 | O(n·k) → O(n log k) |
| 递归重算（朴素 Fibonacci 形状） | memoize 或改迭代 DP | 指数级 → O(n) |
| 循环内字符串拼接（部分语言） | builder / `join` / `push` 后 join | O(n²) → O(n) |
| 循环内重复编译正则 | 循环外编译一次 | 常数因子，但很大 |
| 嵌套循环计数/分组 | 单遍 `Counter`/`Map<k,count>` | O(n²) → O(n) |
| 滑动窗口写成嵌套循环 | 双指针 / 窗口和 | O(n²) → O(n) |
| 重复前缀和 | 预算前缀数组，O(1) 区间查询 | O(n·q) → O(n+q) |
| 区间两两距离/包含检查 | 排序 + 扫描线 | O(n²) → O(n log n) |
| 全排序取 Top-K | 大小为 K 的堆 | O(n log n) → O(n log k) |
| `await` in `for`（独立项） | `Promise.all` / 批量并发 | 墙钟 O(n·延迟) → O(延迟) |
| 循环内 ORM 查询（N+1） | `IN (...)` / `select_related` / 批量取 | O(n) 往返 → O(1) |

### 空间复杂度变换

| 坏味道 | 修复 | 典型收益 |
|---|---|---|
| 仅为遍历而物化整个 list | 生成器 / 迭代器 / 流 | O(n) → O(1) |
| 大数据上链式 `.map().filter().map()` 建中间数组 | 单遍循环 / 惰性管道 | k·O(n) → O(n) |
| 缓存递归每个中间结果 | 滚动窗口（只留最近 k 个状态） | O(n) → O(k) |
| 只需计数却存 parents/visited | 仅 bitset / 计数器 | O(n) → O(1) |
| 复制输入以便修改 | 调用方允许时原地修改 | O(n) → O(1) |
| 处理前读入整个文件 | 按行 / 分块流式 | O(file) → O(chunk) |
| 循环内深拷贝保安全 | 拷一次 / 结构共享 / 不可变 | O(n·m) → O(n+m) |
| 闭包/监听器/缓存阻止 GC | 限界缓存(LRU)、移除监听、收紧闭包 | 无界 → 有界 |
| 从 DB 加载全量结果集 | 游标 / 分页 / 流式查询 | O(rows) → O(page) |
| `JSON.parse(JSON.stringify(x))` 克隆 | `structuredClone` 或定向拷贝 | 去除 O(n) 开销与分配 |

### 当无法降低渐近 Big-O 时

有时 O(n log n) 就是下界。此时转常数因子优化，并显式声明「渐近下界已是 O(n log n)，仅做常数因子优化」：

- 指针追逐结构换连续数组（缓存局部性）。
- 循环不变量外提。
- 热循环内避免分配（复用 buffer）。
- 数值计算用 typed array / 原生容器替代装箱对象。
- 批量化 syscall / I/O。

### 输出纪律（提议或应用优化时，按此顺序）

1. **瓶颈** —— file:line + 一句原因。
2. **当前复杂度** —— `time=O(?) / space=O(?)`。
3. **变换** —— playbook 里的名字（或描述新变换）。
4. **新复杂度** —— `time=O(?) / space=O(?)`。
5. **语义风险** —— 调用方可能察觉的（顺序、稳定性、错误时机）。属实时 "None" 是合法答案，但要写出来。
6. **实测加速** —— `before → after` + `N× faster`（或 `asymptotic only`）。
7. **diff。**

1–6 缺任一项，优化就不可应用。

## 示例

**瓶颈：** `getOrdersWithUsers()` 在 1 万订单上跑 10 秒。原因：map 内 `users.find(u => u.id === o.userId)` → O(n·m)。

**反例（改了语义还改了测试）：**

```ts
export function getOrdersWithUsers(orders, users) {
  const userById = Object.fromEntries(users.map(u => [u.id, u]));
  return orders
    .map(o => ({ ...o, user: userById[o.userId] }))
    .filter(o => o.user); // 悄悄丢弃了 user 已删除的订单
}
```

更快，但结果集变了。顺手"修"掉了校验旧行为的断言，绿着上线，两周后账单报表崩了。

**正解（一处变换，语义不变）：**

```ts
// Bottleneck: orders.map → users.find (line 14)
// Current: time=O(n·m), space=O(1)  →  Target: time=O(n+m), space=O(m)
// Transformation: 循环外预建索引 Map<userId, User>
// Semantic risk: None —— 缺失 user 的订单仍输出 user: undefined，与原行为一致
// Reverts so far: 0
export function getOrdersWithUsers(orders, users) {
  const userById = new Map(users.map(u => [u.id, u]));
  return orders.map(o => ({ ...o, user: userById.get(o.userId) }));
}
```

一处变换，测试不动，跑测试：绿则发，红则回滚（不准改测试）。连续 3 次回滚后停手，加载 `invariant-guard`。

## 注意事项

**红旗 —— 立即停：**

- 没写当前 Big-O 就优化；只说"应该更快"却指不出具体瓶颈行。
- 验证任何一处前就叠加多个变换。
- 没测量也没渐近论证就声称加速。
- 靠悄悄改输出语义来降复杂度。
- 去改写启动时只跑一次、n=12 的代码。

**常见借口 vs 现实：**

- "我脑子里已经想好了，先贴 diff 再补标签" → 事后补的标签会撒谎，按 瓶颈→复杂度→变换→diff 顺序写。
- "语义风险是 None，跳过这步" → "None" 合法，但必须写出来，读者不知道你考虑过哪些保证。
- "三个变换一个 diff 搞定" → 叠加变换会藏回归，一次一个。
- "晚点再测" → "晚点"就是永远的 `<measured: TBD>`，要么现在测，要么只接受渐近论证。

**完成前的核对清单：**

- [ ] 变换前现有测试（或已写的特征化测试）为绿。
- [ ] 恰好应用了一处变换；变换后测试为绿。
- [ ] 没有为了通过而修改/弱化/跳过任何测试。
- [ ] diff/PR 里写明了当前与目标 Big-O、语义风险。
- [ ] 报告了实测加速比（或显式标 `asymptotic only`）；有测量声明时附上测量命令。
- [ ] 本代码回滚次数 < 3。

任一框没勾 = 没做完，要么回滚要么补齐，不准上半验证的加速。

**停止条件 / 局限：** 渐近 Big-O 已达问题已知下界、输入可证明小且有界、优化会损害正确性/可读性而无实测收益时，停手。本技能仅处理单进程、渐近优化（常数因子是另一独立模式）；分布式瓶颈（共识延迟、复制滞后、队列背压）与 I/O 密集型代码不在范围内；基准需作者自备代表性输入，本技能不替你跑。

## 互见

- `lemmaly` —— 写新代码时的复杂度预防网关（重构既有代码用本技能，不用它）。
- `invariant-guard` —— 连续 3 次变换都让测试挂掉时的升级目标：缺的是契约而非优化。
- `mathguard` —— 触及经典下界、需近似或数学结构（Bloom/HLL/FFT/JL）才能再赢时升级。

---

采编自 sickn33/antigravity-awesome-skills（原作者 morsechimwai，Apache-2.0），MIT 收录。
