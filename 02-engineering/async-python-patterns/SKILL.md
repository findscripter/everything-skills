---
name: async-python-patterns
title: Python 异步并发编程模式
description: 当用 asyncio 写 I/O 密集的异步并发（API/爬虫/WebSocket/批量请求/后台队列）时使用；做出带超时、限流、取消与结构化错误处理的 async/await 代码与排错方案；不适用于 CPU 密集任务、同步脚本足够或运行环境无事件循环的场景；触发词：asyncio、async/await、gather、并发请求、协程。
domain: 研发/backend
triggers: [asyncio, async/await, gather, 并发请求, 协程, aiohttp, 事件循环, 异步爬虫, WebSocket, 信号量限流, run_in_executor, 生产者消费者, asyncio.Queue, 超时, TimeoutError]
tags: [python, asyncio, concurrency, async-await, backend, engineering]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 asyncio 构建/优化 **I/O 密集**型系统：异步 Web API（FastAPI、aiohttp、Sanic）、并发数据库/文件/网络访问。
- 并发爬虫、批量 HTTP 请求；WebSocket 服务、聊天等实时应用；异步后台任务与队列。
- 同时跑多个相互独立、需要等待的任务；微服务间异步通信。
- 触发词：asyncio、async/await、gather、并发请求、协程、aiohttp、信号量限流、超时。

不该用的边界：
- **CPU 密集**、几乎没有 I/O 的计算 → 异步无收益，用多进程（`multiprocessing`/`ProcessPoolExecutor`）；必须在协程里跑阻塞计算时用 `loop.run_in_executor` 丢到线程/进程池。
- 一段简单同步脚本就够用 → 别引入事件循环增加复杂度。
- 运行环境不支持 asyncio/事件循环（如某些受限沙箱、已有同步框架且无法改造）→ 不适用。
- 想要并发但只是顺序 `await` 多个协程 → 那是串行，不是并发；并发要靠 `create_task`/`gather`。

## 步骤 / 指令

```
1. 判定工作负载：I/O 密集才用 asyncio；先确认目标（吞吐/延迟）与运行时约束。
2. 选并发原语并定义取消规则：
   - 入口统一用 asyncio.run(main())（Python 3.7+）。
   - 多任务并发：asyncio.gather(*tasks) 或 asyncio.create_task() + 后续 await。
   - 队列解耦：asyncio.Queue（生产者/消费者）。
   - 资源池/限流：asyncio.Semaphore；连接复用用 aiohttp.TCPConnector。
3. 加固：每个外部调用配 timeout（asyncio.wait_for / ClientTimeout）；
   队列设 maxsize 做背压；gather(..., return_exceptions=True) 收集失败而非整体崩。
4. 正确处理取消：捕获 asyncio.CancelledError 做清理后 re-raise，勿吞掉。
5. 隔离阻塞：绝不在协程里调 time.sleep / 阻塞 IO / 重计算；用 await asyncio.sleep
   或 loop.run_in_executor 包装。
6. 测试与调试：用 pytest-asyncio（@pytest.mark.asyncio）覆盖正常/超时/取消路径。
```

规则：
- 协程必须 `await` 才执行；`f()` 只返回协程对象不会跑。
- 单事件循环单线程：任何阻塞调用都会卡住所有协程。
- 失败要么 `try/except` 包裹，要么 `gather(return_exceptions=True)` 收集，二选一，别裸奔。
- 超时是默认配置而非可选项；外部 I/O 一律设上限。

## 示例

并发抓取（gather + 超时 + 错误隔离 + 连接池）：
```python
import asyncio, aiohttp
from typing import List, Dict

async def fetch(session: aiohttp.ClientSession, url: str) -> Dict:
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as r:
            return {"url": url, "status": r.status, "length": len(await r.text())}
    except Exception as e:
        return {"url": url, "error": str(e)}

async def scrape(urls: List[str]) -> List[Dict]:
    conn = aiohttp.TCPConnector(limit=100, limit_per_host=10)  # 连接池
    async with aiohttp.ClientSession(connector=conn) as session:
        return await asyncio.gather(*(fetch(session, u) for u in urls))

asyncio.run(scrape(["https://httpbin.org/delay/1"]))
```

信号量限流（控制最大并发）：
```python
async def api_call(url, sem: asyncio.Semaphore):
    async with sem:                       # 同时最多 N 个进入
        await asyncio.sleep(0.5)
        return {"url": url, "status": 200}

async def main(urls, max_concurrent=3):
    sem = asyncio.Semaphore(max_concurrent)
    return await asyncio.gather(*(api_call(u, sem) for u in urls))
```

超时控制：
```python
try:
    result = await asyncio.wait_for(slow_op(5), timeout=2.0)
except asyncio.TimeoutError:
    print("Operation timed out")
```

把阻塞操作丢进线程池（避免卡事件循环）：
```python
import concurrent.futures
async def run_blocking(data):
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        return await loop.run_in_executor(pool, blocking_operation, data)
```

正确处理取消：
```python
async def cancelable_task():
    try:
        while True:
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        # 在这里做清理
        raise   # 必须 re-raise 以传播取消
```

测试（pytest-asyncio）：
```python
@pytest.mark.asyncio
async def test_with_timeout():
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(slow_op(5), timeout=1.0)
```

## 注意事项

- 忘记 `await`：`result = async_function()` 拿到的是协程对象、不会执行；要 `await async_function()`。
- 阻塞事件循环：协程内用 `time.sleep(1)` 会冻结整个循环；改 `await asyncio.sleep(1)`；CPU/阻塞活全部丢 `run_in_executor`。
- 不处理取消：捕获 `CancelledError` 清理后必须 `raise` 重新抛出，否则取消语义被破坏。
- 同步/异步混用：`def` 函数里不能直接 `await`（语法错误）；从同步侧进入异步用 `asyncio.run(coro())`，但别在已有事件循环内再次 `asyncio.run`。
- 队列要设 `maxsize` 做背压；生产者用哨兵值（如 `None`）通知消费者结束，并配合 `queue.join()` / `task_done()`。
- 性能：复用连接（连接池）、按批处理（batch + gather）、用 `Semaphore` 限流防止打爆下游。
- 共享可变状态用 `asyncio.Lock` 保护，避免在 `await` 之间被穿插改写。
- 别把它当 CPU 加速器：异步只省 I/O 等待时间，纯计算请用多进程。
- 常用生态：aiohttp（HTTP 客户端/服务）、FastAPI（异步框架）、asyncpg（PostgreSQL）、motor（MongoDB）；官方文档 https://docs.python.org/3/library/asyncio.html。

## 互见

- requires：无。
- related：`code-reviewer`（审查异步代码的取消/超时/竞态等正确性问题）。
- combines_with：无。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
