---
name: error-handling-patterns
title: 健壮错误处理模式
description: 当为新功能/API/分布式系统设计错误处理、排查线上故障或提升可靠性时使用；做错误分类、自定义错误层级、重试退避、熔断、降级与错误聚合，产出可落地的健壮处理方案与代码；不适用于纯日志查询、性能压测或具体业务逻辑实现本身；触发词：错误处理、异常设计、重试、熔断、优雅降级、Result 类型。
domain: 研发/backend
triggers: [错误处理, 异常设计, 重试, 熔断, 优雅降级, Result 类型, error handling, retry, circuit breaker, 故障容错]
tags: [error-handling, resilience, engineering, reliability, patterns]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [bug-hunter, systematic-debugger, error-log-detective, saga-orchestration]
combines_with: [rest-api-endpoint-builder, distributed-tracing, microservices-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 为新功能、API 或分布式系统设计错误处理策略时使用。
- 排查线上故障、提升可靠性、改进面向用户/开发者的错误信息时使用。
- 实现重试、熔断、限流、并发/异步错误处理或故障容错时使用。
- 触发词：错误处理、异常设计、重试、熔断、优雅降级、Result 类型、故障容错。

不该用的边界：
- 纯查日志、聚合指标、性能压测：本技能给处理模式，不替代可观测性工具与压测。
- 实现具体业务逻辑本身（"这功能怎么写"）：先写功能，错误处理是其中一环而非全部。
- 依赖/CVE/许可证体检 → 用 `dependency-auditor`；找改动里的 bug → 用 `code-reviewer`。
- 不替代环境特定的验证、测试与专家评审；缺关键输入/约束/成功标准时先问清再做。

## 步骤 / 指令

```
1. 先分类错误，再选机制
   - 可恢复（网络超时、文件缺失、非法输入、限流）→ 重试/降级/校验。
   - 不可恢复（OOM、栈溢出、空指针等编程 bug）→ 快速失败/崩溃，不要 catch 后吞掉。

2. 选错误表达方式（按场景而非一刀切）
   - 异常 Exception：意外、异常条件。
   - Result/Either 类型：预期内的失败、校验错误（显式 ok/err，强制处理）。
   - Option/Maybe：可空值。
   - Panic/Crash：不可恢复的编程错误。

3. 建立类型化错误层级
   - 定义 ApplicationError 基类，挂 code / details / timestamp。
   - 派生 ValidationError、NotFoundError、ExternalServiceError 等语义子类。
   - 外部服务错误要带 service 等上下文；抛出时用 `raise ... from e` / `%w` 保留因果链。

4. 在正确层级处理
   - 在能"有意义地处理"的层捕获；否则向上传播。
   - 已知应用错误直接 re-raise；未知错误记一次日志再包装抛出，避免重复日志。

5. 加韧性模式（按需）
   - 重试 + 指数退避：仅对可重试异常重试，限定 max_attempts，退避 backoff_factor ** attempt。
   - 熔断 Circuit Breaker：CLOSED/OPEN/HALF_OPEN 三态，失败超阈值断开，超时后半开试探。
   - 优雅降级：主路径失败回退到缓存/备用源/默认值。
   - 错误聚合：校验多字段时收集全部错误再一次性抛 AggregateError，而非首错即停。

6. 清理资源
   - try-finally / context manager / defer，确保文件、连接、事务回滚或关闭。
```

规则（核心约束，务必遵守）：
- 快速失败：尽早校验输入。
- 保留上下文：栈、元数据、时间戳一并带上。
- 消息要可操作：说清发生了什么、怎么修，禁止 "Error occurred" 式无效信息。
- 日志要克制：真错误记日志；预期内失败别刷屏。
- 不要吞错误：要么记日志要么重抛，禁止空 catch 静默吞掉。
- 不要又记日志又重抛同一处：会产生重复日志。
- 尽量用类型化错误，少用裸错误码。

## 示例

自定义异常层级（Python）：
```python
class ApplicationError(Exception):
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

class ValidationError(ApplicationError): pass
class NotFoundError(ApplicationError): pass

class ExternalServiceError(ApplicationError):
    def __init__(self, message: str, service: str, **kwargs):
        super().__init__(message, **kwargs)
        self.service = service
```

重试 + 指数退避（Python，只对指定异常重试）：
```python
def retry(max_attempts=3, backoff_factor=2.0, exceptions=(Exception,)):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last = e
                    if attempt < max_attempts - 1:
                        time.sleep(backoff_factor ** attempt)
                        continue
                    raise
            raise last
        return wrapper
    return decorator
```

Result 类型（TypeScript，显式成功/失败）：
```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseJSON<T>(json: string): Result<T, SyntaxError> {
  try { return { ok: true, value: JSON.parse(json) as T }; }
  catch (e) { return { ok: false, error: e as SyntaxError }; }
}

const r = parseJSON<User>(userJson);
if (r.ok) console.log(r.value.name);
else console.error('Parse failed:', r.error.message);
```

错误包装与解包（Go，保留因果链）：
```go
func processUser(id string) error {
    user, err := getUser(id)
    if err != nil {
        return fmt.Errorf("process user failed: %w", err)  // %w 包装
    }
    _ = user
    return nil
}
// errors.Is 比对哨兵错误，errors.As 提取具体类型
```

熔断器三态（Python，要点）：
```python
class CircuitState(Enum):
    CLOSED = "closed"        # 正常
    OPEN = "open"            # 失败，拒绝请求
    HALF_OPEN = "half_open"  # 试探是否恢复
# 失败计数 >= failure_threshold → OPEN；
# OPEN 且距上次失败 > timeout → 转 HALF_OPEN；
# HALF_OPEN 连续成功 >= success_threshold → CLOSED。
```

优雅降级（Python，主失败回退）：
```python
def with_fallback(primary, fallback, log_error=True):
    try:
        return primary()
    except Exception as e:
        if log_error:
            logger.error(f"Primary function failed: {e}")
        return fallback()
# get_user_profile = with_fallback(缓存, 数据库)
```

## 注意事项

常见坑（务必规避）：
- 捕获过宽：裸 `except Exception` 会掩盖 bug，按需精确捕获。
- 空 catch 块：静默吞错误，最难排查。
- 又记又抛：同一错误在多层重复记日志。
- 忘记清理：文件、连接、事务未关闭/回滚。
- 错误信息空洞："发生错误"对排障毫无帮助。
- 滥用错误码：优先异常或 Result 类型。
- 忽略异步错误：未处理的 promise rejection。

其他：
- "处理在正确层级"：能有意义处理就捕获，否则传播；别在底层硬吞。
- 区分可恢复与不可恢复：编程 bug 应快速失败暴露，而非重试或降级掩盖。
- 重试只对幂等且可重试的操作；对非幂等写操作加重试前先确认安全。
- 输出方案不替代环境特定的测试与验证。

## 互见

- requires：无。
- related：`code-reviewer`（审查改动中的错误处理/资源释放/异常吞掉等正确性问题）、`dependency-auditor`（依赖与供应链层面的风险）。
- combines_with：无。

---
本条目为适配重写，采编自 sickn33/antigravity-awesome-skills（MIT 许可证）的 error-handling-patterns。
