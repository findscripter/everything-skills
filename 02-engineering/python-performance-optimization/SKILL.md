---
name: python-performance-optimization
title: Python 性能优化
description: 当 Python 应用变慢、CPU/内存吃紧、需要在优化前定位真实瓶颈时使用；先用 cProfile/line_profiler/memory_profiler/py-spy 剖析热点，再按算法→数据结构→缓存→向量化→并行的次序优化并做前后基准对比；不适用于功能正确性 bug、非 Python 代码或线上分布式链路追踪；触发词：Python 性能、cProfile、py-spy、lru_cache、内存泄漏、慢。
domain: 研发/review
triggers: [Python 性能优化, 代码变慢, cProfile, line_profiler 逐行剖析, memory_profiler 内存, py-spy 生产环境剖析, lru_cache 缓存, 内存泄漏 tracemalloc, __slots__ 省内存, NumPy 向量化, multiprocessing CPU 密集, timeit 基准, 生成器省内存, 字典 O(1) 查找, 性能瓶颈]
tags: [python, 性能优化, profiling, cProfile, py-spy, 内存优化, lru_cache, numpy, benchmark, engineering]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, cProfile, line_profiler, memory_profiler, py-spy, tracemalloc, numpy, pytest-benchmark]
requires: []
related: [complexity-cuts, performance-profiler, async-python-patterns, code-simplifier]
combines_with: [python-testing-pytest, polars-dataframe, systematic-debugger]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- Python 应用变慢、延迟/响应时间偏高，但不确定瓶颈在 CPU、内存、IO 还是 DB。
- CPU 密集运算、数据处理流水线、热点算法需要提速。
- 内存占用过高或疑似内存泄漏，需要定位分配来源。
- 数据库查询、IO 操作慢，需要批量化或异步化。
- 给线上 Python 进程做无侵入采样剖析。

不该用（负边界）：

- 排查的是功能正确性缺陷/逻辑 bug，而非性能 → 用调试类技能。
- 非 Python 代码，或需要跨服务分布式链路追踪 → 用 `performance-profiler`。
- 还没测量就想"凭感觉优化"——本技能要求先剖析、后优化。

铁律：**先测量，后优化（profile before optimizing）**；只优化高频热路径，避免对罕见路径过度优化；先保证清晰，再谈性能。

## 步骤 / 指令

1. **建基线**：用 `timeit`/`time.perf_counter` 或下方 `@benchmark` 装饰器记录优化前耗时/内存，作为对照。
2. **定位热点**（按需选工具）：
   - CPU 整体热点 → `cProfile` + `pstats`（按 `cumtime` 排序看 Top N）。
   - 单函数逐行 → `line_profiler`（`kernprof -l -v script.py`）。
   - 内存分配/峰值 → `memory_profiler`（`@profile` + `python -m memory_profiler`）或 `tracemalloc` 快照对比。
   - 线上/不可重启进程 → `py-spy`（采样，无需改代码）。
3. **按收益排序优化**（先大后小）：算法/数据结构 → 实现层惯用法 → 缓存 → 向量化(NumPy) → 并行(多进程/异步)。
4. **复测对比**：用同一基线脚本测优化后，报告加速比；用 `pytest-benchmark --benchmark-compare` 做回归。
5. **守门**：在 CI/关键路径加基准测试，防止性能回退。

优化决策速查：

- 成员查找频繁 → 用 `dict`/`set`（O(1)）替代 `list in`（O(n)）。
- 大数据集只遍历一次 → 用**生成器**而非列表，内存恒定。
- 纯数值批量运算 → **NumPy 向量化**替代 Python 循环。
- 重复/递归计算 → `functools.lru_cache`。
- 海量同构小对象 → 类加 `__slots__` 省内存。
- CPU 密集且可并行 → `multiprocessing.Pool`（GIL 下多线程无效）。
- IO 密集 → `asyncio`/`aiohttp` 异步并发（见 `async-python-patterns`）。
- DB 写入 → `executemany` + 单次 `commit` 批量化；查询加索引、`SELECT` 指定列、`EXPLAIN QUERY PLAN` 看计划。
- 字符串拼接 → `"".join(...)` 替代循环 `+=`。
- 热循环内减少函数调用与全局变量访问（局部变量更快）。

## 示例

cProfile 定位 CPU 热点：

```python
import cProfile, pstats
from pstats import SortKey

profiler = cProfile.Profile()
profiler.enable()
main()                      # 待剖析入口
profiler.disable()

stats = pstats.Stats(profiler)
stats.sort_stats(SortKey.CUMULATIVE)
stats.print_stats(10)       # Top 10
stats.dump_stats("profile_output.prof")
```

命令行剖析与查看：

```bash
python -m cProfile -o output.prof script.py
python -m pstats output.prof   # 交互：sort cumtime / stats 10
```

线上进程无侵入采样（py-spy）：

```bash
pip install py-spy
py-spy top  --pid 12345                 # 实时热点
py-spy record -o profile.svg --pid 12345 # 生成火焰图
py-spy dump --pid 12345                  # 当前调用栈
```

缓存递归——`lru_cache` 量级提速：

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
# fib.cache_info() 查看命中率
```

通用基准装饰器：

```python
import time
from functools import wraps

def benchmark(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.perf_counter()-start:.6f}s")
        return result
    return wrapper
```

检测内存泄漏（tracemalloc 前后快照对比）：

```python
import tracemalloc
tracemalloc.start()
snap1 = tracemalloc.take_snapshot()
run_suspect_code()
snap2 = tracemalloc.take_snapshot()
for stat in snap2.compare_to(snap1, 'lineno')[:10]:
    print(stat)
tracemalloc.stop()
```

## 注意事项

- **不测量不优化**：靠猜测优化是头号陷阱，先用 profiler 找真实瓶颈。
- 优先用内置函数与标准库（多为 C 实现），优先选对数据结构，再谈微优化。
- 避免不必要的数据拷贝、滥用全局变量、忽视算法复杂度。
- `multiprocessing` 例子和带 `if __name__ == "__main__":` 的脚本相关代码必须放在该守卫内，否则 Windows 下会递归启动子进程。
- 剖析有开销：`cProfile`/`memory_profiler` 会拖慢被测代码，比较时只看相对值；线上用 `py-spy` 采样更轻。
- NumPy/多进程/异步提速有适用前提（数值批量、CPU 密集可分、IO 密集）；用错场景反而更慢。
- 数据库需配合连接池；`SELECT *`、缺索引、N+1 是常见慢源。
- 性能结论依赖具体环境与数据规模，务必在目标环境实测，勿照搬加速比。

## 互见

- requires：无
- related：`performance-profiler` —— 跨语言(Node/Python/Go)与线上链路、负载测试的更广剖析方法论；`async-python-patterns` —— IO 密集型的 asyncio 异步并发优化
- combines_with：`systematic-debugger` —— 先定位再优化的系统化排查流程

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
