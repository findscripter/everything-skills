---
name: large-scale-math-algorithms
title: 大规模数学算法升级
description: 当 n≥10⁶ 的大数据/数值/几何/图算法已触及经典 O(n log n) 下限、需靠数学（概率结构、变换、降维、摊还）再降一个数量级时使用；按「经典下限→为何不够→命名技法→精确/近似+ε→新界推导→买卖代价→禁用场景→代码」八步协议给出可审计的升级方案与带 ε/δ 注释的代码；不适用于需精确结果的鉴权/计费/主键去重、n<10⁴ 非热路径、I/O 瓶颈。触发词：Bloom、HyperLogLog、FFT、近似算法、大规模去重、基数估计
domain: 通用/thinking
triggers: [大规模数据算法卡在 O(n log n), Bloom 过滤器判存在, HyperLogLog 基数/去重计数, Count-Min Sketch 热点统计, MinHash + LSH 相似度, FFT/NTT 多项式或大整数乘法, JL 投影高维降维, 近似算法换空间/时间, sweep line 区间重叠, union-find / 线段树 / Fenwick]
tags: [算法, 概率数据结构, 近似算法, bloom-filter, hyperloglog, fft, 性能优化, 思维, 通用]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude-code, codex, cursor, gemini-cli]
requires: []
related: [complexity-cuts, algorithm-first-discipline, python-performance-optimization, latency-critical-systems]
combines_with: [data-throughput-accelerator, performance-profiler]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 大规模数学算法升级

`complexity-cuts` 帮你把现有代码降一个复杂度档；本技能在**经典算法已是最优（O(n log n) 已是地板）**时介入，靠数学再凿穿一层地板——通常以「接受有界近似 / 利用结构 / 换到更聪明的代数空间」换取渐近优势。模型懂这些技法，但几乎从不主动提出，本技能负责逼它伸手去够。

> 铁律：**没有书面 ε/δ 且调用方明确接受，绝不引入任何近似结构。** 把 Bloom 过滤器塞进调用方默认精确的路径，是生产事故，不是优化。

## 何时使用

适用：

- 大规模数据（**n ≥ 10⁶**）：相似检索、去重、Top-K / 重击者、流式分析、基数估计、向量检索、推荐。
- 信号/图像处理、多项式或大整数运算、卷积、图距离、计算几何、随机化算法。
- 经典 O(n log n) 已是地板、仍需渐近突破：Bloom、HyperLogLog、Count-Min、MinHash/LSH、FFT/NTT、JL 投影、sweep line、kd-tree/BVH、快速幂、幺半群并行归约、摊还势能法。
- 通常在 `complexity-cuts` 或经典选型已确认「经典解不够」之后再加载。

**不该用（负边界）**：

- 调用方需要精确结果（鉴权、计费、为正确性去重、主键、任何流入主键的值）。
- n 小（n < 10⁴）且不在热路径——线性扫描微秒级搞定。
- 瓶颈在 I/O 而非 CPU/内存——数学优势会被网络/磁盘吃掉，退回去优化 I/O。
- 团队无人能在凌晨 3 点 debug 这个技法（写下「team familiarity: ?」）。

## 步骤

提出任何数学级技法前，消息须**按此顺序**包含 1–7，缺任一项不得提出；齐了再给第 8 项代码：

1. **经典下限**：最好的非数学算法及其 Big-O（如「Hash join 是 O(n+m)，已经到顶」）。
2. **为何经典不够**：n 太大 / 空间爆 / 实时截止 / 单机内存放不下。
3. **命名技法**：必须**点名**，禁止「一个聪明的近似」这类含糊说法。
4. **精确还是近似**：`mode: exact` 或 `mode: approximate`；近似须写 ε/δ（误报率、相对误差、失真界）+ 一句「调用方能否容忍这种错」。
5. **新界推导**：一行 bound 论证（如「HLL：O(log log n) 位估基数，标准误 1.04/√m」）。无界不提。
6. **买卖代价**：一行写清「买到（空间/时间/wall-clock/并行）vs 付出（accuracy ε=? / 复杂度 / 依赖 / 非确定性 / 数值稳定性）」；代价对调用方不可见则写「callers see no change」。
7. **何时禁用**：至少一条 disqualifier。
8. **代码或伪代码**。

## 指令

- **点名技法**（可审计 > 含糊）：`Bloom filter`、`HyperLogLog`、`Count-Min Sketch`、`MinHash + LSH`、`Johnson–Lindenstrauss 投影`、`FFT`、`NTT`、`Karatsuba`、`Strassen`、`快速幂`、`sweep line`、`kd-tree`、`BVH`、`带路径压缩的并查集`、`Boyer-Moore 多数投票`、`reservoir sampling`、`Floyd 龟兔判环`、`Fenwick 树`、`带 lazy 的线段树`、`幺半群 / 并行前缀扫描`。
- **精确/近似先声明**：调用方需精确而无精确级胜法时，直说并停手——不得悄悄降级成近似。
- 近似结构的代码**必须**含：① 一行注释点名技法 + 文档链接/引用；② 选定的误差参数（ε、δ、位数、维度）及为何取这些值；③ 一行渐近或实测 bound；④ 若调用方可能要精确，提供 exact-mode 回退路径。
- 随机化技法须写明 seed 策略（固定以复现，或注明非确定性）。

速查表（技法 → 问题 → 收益 → 注意）：

```text
判存在「见过这个 key 吗」    Bloom filter         O(n) 位，可调 ε   只误报，不能删
流式去重/基数计数            HyperLogLog          O(log log n) 位   ~1% 相对误差，不能列元素
流式 Top-K / 重击者          Count-Min + 堆       O(log(1/δ)·1/ε)   会高估，刻意选 ε,δ
海量集合/文档相似            MinHash + LSH        亚线性 ANN 查询    调 recall/precision
高维 k-NN                    JL 投影 → HNSW/IVF   O(log n)/查询      (1±ε) 失真，recall<1
多项式/大整数乘法 O(n²)      FFT / NTT / Karatsuba O(n log n)        浮点 FFT 掉精度→整数用 NTT
pow(a,b) mod p，b 大         快速幂(平方-乘)      O(log b)          防内部溢出，用模运算
区间/矩形重叠对 O(n²)        sweep line + 活动集  O((n+k) log n)    k=输出规模
合并下的连通分量            并查集(路径压缩+秩)  ≈O(1)/操作摊还     逆 Ackermann 近似常数
区间和/单点更新             Fenwick 树           O(log n)/操作      包含区间，防 off-by-one
判链表有环                  Floyd 龟兔           O(1) 空间          时间同阶，空间大胜
n 项并行归约                幺半群 + 并行扫描     O(n/p + log p)    运算须满足结合律，先验证
```

## 示例

**问题**：统计 24h 事件流的去重用户数。~20 亿事件/天，~5000 万唯一用户，上仪表盘，±2% 可接受。

**反面（静默 OOM 或更糟——计费错误）**：

```ts
// "Just use a Set" —— 5000 万字符串静默撑爆机器
const seen = new Set<string>();
for await (const e of stream) seen.add(e.userId);
return seen.size;        // 精确，但进程在第 4100 万行就死了
```

更糟：拿 HyperLogLog「为性能」却插进按结果计费的管线——计费看到 4970 万而非 5000 万，一部分用户永远不被计费。

**正面（可审计的 HLL）**：

```ts
// 经典下限: 精确 Set 需 O(unique) 内存，5000 万串×~50B ≈ 2.5GB
// 为何不够: 仪表盘机器只有 512MB，每分钟刷新
// 技法: HyperLogLog (HLL)
// mode: approximate. ε ≈ 1.04/√m. m=2^14 寄存器 → ~0.8% 相对误差
// 买卖: 买到 O(log log n) 位空间(~12KB); 付出 显示计数 ±0.8%
// 禁用: 任何流入计费/主键/逐用户动作的场景
// 调用方接受: 已确认——仪表盘产品负责人接受 ±2%，写在 PR 里
import { createHLL } from 'hyperloglog-lite';
const hll = createHLL({ precision: 14 });
for await (const e of stream) hll.add(e.userId);
return hll.estimate();   // 4960 万 ± 40 万；仪表盘读到 ~5000 万
```

两版技法相同，差别只在第二版把 ε 写进注释、点了调用方、显式列出 disqualifier（计费）——**可审计**。

## 注意事项

发车前核对清单（任一项打不上勾 = 不能上，退回经典或停下来问）：

- [ ] 技法已点名（不是「一个聪明的近似」）。
- [ ] 近似则 ε、δ（或等价误差参数）写在代码或 PR 描述里。
- [ ] 已识别调用方并写明其对该误差的容忍度。
- [ ] 有一行 bound 推导（渐近或实测）。
- [ ] 至少一条「何时禁用」已记录。
- [ ] 有 exact-mode 回退，或一行说明为何精确不可能。
- [ ] 随机化则 seed 策略已记录（固定复现 / 注明非确定）。
- [ ] 已审计假设精确的下游（在此值上 join、计费、鉴权、主键）。

红线—立即 STOP：提概率结构却不写 ε、δ；说「这里能用 FFT」却不写 n 多大才真赢 schoolbook（多项式乘法约 n≥64 起 schoolbook 才开始输）；在 100×100 矩阵上推 Strassen；未经调用方同意切到近似输出；命不出 bound 的技法。

边界与局限：

- ε/δ 多为平均/高概率界，对抗性输入可击穿——写明威胁模型。
- 库质量参差（seed、hash、内存布局各异），选维护活跃的库并锁版本。
- 浮点 FFT / 随机 SVD / JL 累积浮点误差；要组合精确性用 NTT 或精确整数变体。
- 本技能告诉你能凿穿哪层渐近天花板，**不测常数因子**——声称 wall-clock 胜出前先 benchmark（交给 `performance-profiler`）。

## 互见

- requires：无。
- related：`complexity-cuts`（已有代码、瓶颈在 CPU/内存而非近似时，先走它做经典级降复杂度；本技能在其之上、经典触底时再加载）、`performance-profiler`（本技能不测常数因子，需实测 wall-clock 收益时用它）。
- combines_with：`complexity-cuts` —— 经典优化触及地板后，接力到本技能用数学再降一档。

---

采编自 sickn33/antigravity-awesome-skills（mathguard，再溯源 morsechimwai/lemmaly，Apache-2.0 许可证）。
