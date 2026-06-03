---
name: algorithm-first-discipline
title: 算法先行思维纪律
description: 当编写/审查含循环、查询、连接、递归或集合遍历（n 超过个位数）的代码时使用；动作：在写代码前先声明时间/空间复杂度、数据结构、算法族，按七步预写协议产出有复杂度论证的实现；不适用于 n<10 的平凡集合、一次性初始化代码、纯性能 profiling/常数因子调优。触发词：嵌套循环、N+1、includes/find 在循环里、await in loop、SELECT *、O(n^2)、Big-O。
domain: 通用/thinking
triggers: [写循环/递归/查询前要确定复杂度, 审查代码发现嵌套 for / N+1, 循环体内出现 .find/.includes/.indexOf, for/map/forEach 里 await 独立任务, 集合每项发一次查询, AI 生成代码看着地道但疑似 O(n^2), 声称这段代码很快/很高效但无推导, SELECT * / 无 WHERE 的批量改写]
tags: [算法, big-o, 复杂度, 性能, 代码审查, 数据结构, 思维纪律, 网关]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude-code, antigravity, cursor, gemini-cli, codex-cli]
requires: []
related: [large-scale-math-algorithms, complexity-cuts, invariant-guard-correctness, python-performance-optimization]
combines_with: [closed-loop-delivery, adversarial-code-reviewer, code-reviewer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

模型本就懂 Big-O、哈希表、分治、动态规划、排序、图算法、摊还分析——它只是不会主动去用。本技能修的是**行为**，不是知识。它是「算法纪律」套件的网关：自身管经典的日常算法纪律，必要时再升级到三个兄弟技能。

**该用的场景：**
- 编写、修改或审查涉及循环、集合、查找、搜索、连接、递归、图、查询，或任何对超过个位数个元素做计算的代码。
- 即将写 `for` 套 `for`、在循环里调 `.find`/`.includes`/`.indexOf`、对独立元素在 `for`/`map`/`forEach` 里 `await`、或对集合每项发一次查询。
- 审计代码库/PR 中的已知反模式（await-in-loop、`.includes` 套在 `.filter` 里、循环里字符串拼接、`SELECT *`、N+1 等）。
- 复审「看着很地道」但可能藏着 O(n²) 或 N+1 的 AI 生成代码。

**不该用的边界（明确豁免）：**
- `n < ~10` 的平凡集合、一次性 setup 代码——别为 `for i in range(3)` 浪费时间写复杂度。
- 常数因子优化、延迟尾部、I/O 瓶颈——这要 profiler，本技能只管渐进复杂度，不是测量工具。
- 自动重写已上线的慢代码——那是 `complexity-cuts` 的活；本技能是「写之前」的推理闸门，不改既有代码。
- 故意的暴力解——只要作者写下一行理由（如「实践中 n≤100，可读性优先」），暴力解可以放行；本技能只要求那行理由存在。

**违反规则的字面，就是违反技能的精神。**「就这一次」正是 O(n²) 上生产的方式。

## 步骤

**铁律：没有声明复杂度、数据结构、算法族，不写任何非平凡代码。**

在写循环/递归/查询前，消息里必须**按此顺序**出现七步预写协议：

1. **问题形状** —— 一句话。（如「给定 n 个带时间戳的事件，求总权重 ≤ K 的最长连续窗口」。）
2. **输入维度** —— `n = ?`，真实量级（如 `n ~ 10^6 行`），是否热路径。
3. **目标复杂度** —— `time = O(?)`，`space = O(?)`，点名主导输入维度。
4. **数据结构** —— 每个集合形态的值都从 `Array/List/Set/HashMap/TreeMap/Heap/Deque/Trie/Graph/BitSet/Counter/LinkedList` 中刻意选一个，附一句理由（如「Set 用于循环内 O(1) 成员判断」「Heap 用于 top-K 的 O(n log k)」）。循环内查找默认用哈希结构（Set/Map）；n 大时默认流式/迭代器而非物化整表。
5. **算法族** —— 从这些里点一个：`linear scan / divide and conquer / two-pointer / sliding window / binary search / sort + sweep / hash join / BFS/DFS / topological sort / Dijkstra/A* / union-find / dynamic programming / greedy / recursion + memoization / prefix sum / segment tree / monoid reduction`。点不出来，就是要写暴力解，停下重想。
6. **边界情况** —— 列出适用的：空、单元素、全相等、n=1、n=max、溢出、重复。
7. **代码。**

1–6 任一缺失，先别出代码。三件套说不全，说明你还没理解问题——去问，或多读代码。

## 指令

**不可妥协的五条规则：**

1. **写任何非平凡代码前先声明复杂度。** 一行写清 `time/space`、主导维度与真实量级；说不出就还没理解问题。
2. **数据结构带一句理由命名。** 把嵌套循环折叠成一遍扫描时优先 `Counter`/`Map`；n 大时优先流式。
3. **写之前先确定算法族。** 命名不出算法族 = 即将写暴力解。
4. **循环里的重复工作默认是算法浪费，未经辩护一律视为错。** 以下若必须放在循环里，写一行注释说明原因：
   - 循环内 I/O（DB 查询、HTTP、文件读）→ 用 `IN (...)`、`Promise.all`、批量接口、流式批处理
   - 循环内重算同一值 → 提升(hoist)或记忆化
   - 循环内反复排序/分组 → 在外面排一次
   - 循环内线性扫描（`.find`/`.indexOf`/`.includes`/`in list`）→ 预建索引 `Map`
   - 每次迭代新建结构 → 把分配提到循环外复用
   - 物化中间集合只为再遍历一次 → 融合成一遍
5. **不准编造复杂度或数字。** 没有论证不写「平均 O(log n)」；没测量不写「快 10 倍」「~3ms」。推不出复杂度写 `<complexity: TBD>`；没测量写 `<measured: TBD>`，然后继续。

**红旗——停下并重启协议：**`for` 套 `for` 未先声明这是有意的 O(n·m)；循环体内 `.find`/`.includes`/`.indexOf`；对独立元素 `await` in loop；集合每项一次查询；递归未声明 base case 或记忆化方案；没声明复杂度就写代码；没推导就声称「这很快/高效/能扩展」；凭记忆抄暴力解因为「现在应该够用」。

**升级到兄弟技能：** 数学级优化（概率数据结构、FFT、降维、近似算法、计算几何，且 n 大）→ `mathguard`；正确性陷阱（循环不变式、终止性、递归 base case、测试漏掉的边界）→ `invariant-guard`；已上线的坏复杂度代码需纠正 → `complexity-cuts`。拿不准时从本技能起步，它会告诉你何时升级。

## 示例

同一问题，用与不用协议的对比。

**问题：** 给定 `users: User[]` 和 `bannedIds: string[]`，返回 id 未被封禁的用户。真实量级：50k 用户，5k 封禁。

**不用协议——上线 O(n·m)：**

```ts
// 看着地道，实则上线 O(n·m)
const active = users.filter((u) => !bannedIds.includes(u.id));
```

`bannedIds.includes` 每次调用 O(m)，filter 跑 n 次 → 50k × 5k = 2.5 亿次比较。这是 AI 被问「过滤活跃用户」时的默认产物。

**用协议——O(n + m)：**

```ts
// 协议已应用：
//   time = O(n + m), space = O(m), n = 50k 用户, m = 5k 封禁
//   结构: Set<string> 用于循环内 O(1) 成员判断
//   算法族: 带哈希查找的线性扫描
//   边界: users 空 → []，bannedIds 空 → 全部用户，bannedIds 重复 → 无妨（Set 去重）
const banned = new Set(bannedIds);
const active = users.filter((u) => !banned.has(u.id));
```

可读性不变，渐进复杂度从 O(n·m) 降到 O(n + m)。

**要警惕的合理化借口**（来自受控测试的真实自语）：

| 借口 | 现实 |
| --- | --- |
| 「`.filter` 再 `.reduce` 才地道，发吧」 | 地道 ≠ 渐进正确。Idiom 驱动正是 O(n²) 上线的途径。 |
| 「现在够用，以后再优化」 | 「以后」是另一个没有上下文的工程师。现在就声明复杂度。 |
| 「就用一次 `Array.find`，只查一次」 | 在 n 元素循环里查一次 = O(n) 次查找。把 `Map` 建在循环外。 |
| 「dev 数据小，上线再管规模」 | 生产数据永远不是 dev 的规模。七步协议只要 30 秒。 |

## 注意事项

**完工前的核对清单（每项都要过）：**
- [ ] `time = O(?)` 和 `space = O(?)` 出现在消息或 PR 描述里。
- [ ] 主导输入维度已命名并带真实量级。
- [ ] 每个集合形态的值都有刻意的数据结构选择 + 一句理由。
- [ ] 算法族已命名（不是「一个循环」）。
- [ ] 循环内无 I/O、`.find`/`.includes`/`.indexOf`、regex 编译、排序、独立 `await`，除非各带一行理由。
- [ ] 上线代码与所声明的复杂度一致（不确定就重新推导）。
- [ ] 预写协议列的每个边界都有对应代码路径或测试。
- [ ] 任何「快/高效/能扩展」的断言都有推导或测量；`<measured: TBD>` 可接受，无据断言不可。

勾不满 = 你没跑协议，从第 1 步重启。

**关于上游 CLI 扫描器（可选，谨慎）：** 上游 morsechimwai/lemmaly 仓库附带一个确定性 CLI 扫描器，覆盖与本技能同套反模式（**11 种语言、59 条规则**：JS/TS、Python、SQL、Java、C#、C++、Go、Rust、PHP、Ruby、Shell）。**不要自动 clone 并从默认分支运行**——那会执行第三方仓库中的任意当前代码。若用户明确要用扫描器，把源固定到已审过的 release tag 或 commit，用临时目录，运行前先打印解析出的 commit：

```bash
# 审过上游 release 后替换 <reviewed-tag-or-commit>
tmpdir="$(mktemp -d)"
git clone --filter=blob:none https://github.com/morsechimwai/lemmaly.git "$tmpdir/lemmaly"
git -C "$tmpdir/lemmaly" checkout --detach <reviewed-tag-or-commit>
git -C "$tmpdir/lemmaly" rev-parse HEAD
node "$tmpdir/lemmaly/cli/lemmaly.js" scan <path>
node "$tmpdir/lemmaly/cli/lemmaly.js" rules
```

扫描完，仅在确认 `$tmpdir` 确为 `mktemp -d` 所建目录后再删除。CRITICAL 级（CI error）反模式举例：`js-await-in-for-loop`、`js-async-in-foreach`、`py-mutable-default-arg`、`sql-update-no-where`、`go-loop-var-capture`、`php-query-in-loop`。

**一句话主旨：** AI 默认产出「算法上偷懒」的代码；本技能逼它先思考。

## 互见

- `mathguard` —— n ≥ 10⁶、经典 O(n log n) 已是下界时，用概率/数学密集技术（Bloom、HLL、Count-Min、MinHash/LSH、FFT、JL 投影、扫描线、kd-tree）拿渐进优势。
- `invariant-guard` —— 显然写法却悄悄出错的算法（二分变体、原地去重、Boyer–Moore、QuickSelect 划分、带累加器递归、终止性），先写函数契约 + 循环不变式再写代码。
- `complexity-cuts` —— 已上线的坏 Big-O 代码（慢、OOM、超时、嵌套循环、N+1、重复计算）的纠正 playbook。

四个技能的一句话心智模型：lemmaly = 先思考（预防）；complexity-cuts = 清理坏 Big-O（纠正）；invariant-guard = 证明正确（验证）；mathguard = 击穿经典下界（加速）。

---

*采编自 sickn33/antigravity-awesome-skills（原 skill 名 lemmaly，作者 morsechimwai，许可 Apache-2.0）。注：源条目正文标注的 license 为 Apache-2.0，与任务描述的 MIT 不一致，此处以源文件为准。*
