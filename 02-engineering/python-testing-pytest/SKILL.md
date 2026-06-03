---
name: python-testing-pytest
title: Python pytest 测试模式
description: 当为 Python 项目搭建 pytest 测试体系、写单元/集成测试或 mock 外部依赖时使用；用 fixture/参数化/mock/monkeypatch 按 AAA 模式产出可执行测试、conftest 与覆盖率配置；不适用于非 Python 语言或拿测试替代环境验证与专家评审。触发词：pytest、fixture、参数化、mock、覆盖率
domain: 研发/testing
triggers: [写单元测试, 搭建 pytest 测试, fixture 夹具, 参数化测试, mock 依赖, monkeypatch, 测试覆盖率, pytest-cov, 测试异常, 异步测试 asyncio, 属性测试 hypothesis, conftest, tmp_path 临时文件, 测试数据库, TDD]
tags: [测试, python, pytest, fixture, mock, 参数化, 覆盖率, tdd, 单元测试, 集成测试]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pytest, pytest-cov, pytest-asyncio, pytest-mock, hypothesis]
requires: []
related: [javascript-testing-patterns, test-coverage-gap-finder, api-test-suite-builder, async-python-patterns]
combines_with: [fastapi-async-api, django-async-pro, test-coverage-gap-finder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 为 Python 函数/类写单元测试，或搭建测试套件与测试基础设施。
- 实践 TDD（先写测试再实现），或为 API/服务写集成测试。
- 需要 mock 外部依赖（HTTP、环境变量、对象属性），测试异步代码、数据库操作。
- 引入参数化降低重复，或用属性测试（hypothesis）覆盖更大输入空间。
- 配置 CI/CD 持续测试与覆盖率门槛，排查失败用例。

不该用：

- 任务与 Python 测试无关，或目标语言是 JS/TS（改用 `javascript-testing-patterns`）等其他栈。
- 把通过测试当成环境特定验证、上线验收或专家评审的替代品——测试只覆盖你断言到的路径。
- 缺少明确的被测目标、成功判据或所需输入时，先澄清再动手。

## 步骤 / 指令

1. 选测试类型：单元（隔离测函数/类）/ 集成（测组件交互）/ 端到端 / 性能。优先单元，金字塔下宽上窄。
2. 单测按 **AAA** 写：Arrange 准备数据与前置 → Act 执行被测代码 → Assert 验证结果。命名描述「行为」：`test_login_fails_with_invalid_password`，别用 `test_1`。
3. 重复的 setup/teardown 抽成 `@pytest.fixture`（用 `yield` 分隔 setup/teardown），按需设 `scope`（function/module/session）；跨文件共享放 `conftest.py`。
4. 同逻辑多输入用 `@pytest.mark.parametrize`，特殊用例用 `pytest.param(..., id=...)` 命名。
5. 隔离外部副作用：HTTP/SDK 用 `unittest.mock`（`patch`/`Mock`/`side_effect`）；环境变量与对象属性用内置 `monkeypatch`（`setenv`/`delenv`/`setattr`）；临时文件用 `tmp_path`。
6. 异常路径用 `pytest.raises(Exc, match="...")`，需要细节时 `as exc_info` 取 `exc_info.value`。
7. 异步代码用 `pytest-asyncio`：测试与 fixture 加 `@pytest.mark.asyncio`，并发用 `asyncio.gather`。
8. 用 `marks`（slow/integration/...）分类，`pytest.ini` 里 `--strict-markers` 防拼错；跑 `pytest -m "not slow"` 等筛选。
9. 接 `pytest-cov` 量覆盖率，CI 上 `--cov-fail-under=80` 卡门槛，关注质量而非纯百分比。
10. 保持测试**独立**：无共享状态、各自清理；测试先行或与代码同步写。

## 示例

最小用例 + fixture + 参数化 + mock + 异常：

```python
# test_demo.py
import pytest
from unittest.mock import patch, Mock
import requests

class Calculator:
    def add(self, a, b): return a + b
    def divide(self, a, b):
        if b == 0: raise ValueError("Cannot divide by zero")
        return a / b

@pytest.fixture
def calc():            # setup → yield → teardown
    c = Calculator()
    yield c

@pytest.mark.parametrize("a,b,expected", [(2, 3, 5), (-1, 1, 0), (0, 0, 0)])
def test_add(calc, a, b, expected):       # AAA + 参数化
    assert calc.add(a, b) == expected

def test_divide_by_zero(calc):            # 测异常
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        calc.divide(5, 0)

def test_http_mock():                     # mock 外部依赖
    resp = Mock()
    resp.json.return_value = {"id": 1}
    resp.raise_for_status.return_value = None
    with patch("requests.get", return_value=resp) as m:
        assert requests.get("http://x/users/1").json()["id"] == 1
        m.assert_called_once_with("http://x/users/1")
```

环境变量 / 临时文件 / 异步：

```python
def test_env(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/test")
    monkeypatch.delenv("CACHE", raising=False)

def test_file(tmp_path):
    f = tmp_path / "a.txt"; f.write_text("hi")
    assert f.read_text() == "hi"

@pytest.mark.asyncio
async def test_async():
    import asyncio
    results = await asyncio.gather(*(asyncio.sleep(0, r) for r in (1, 2, 3)))
    assert results == [1, 2, 3]
```

属性测试（hypothesis）：

```python
from hypothesis import given, strategies as st

@given(st.text())
def test_reverse_twice(s):
    assert s[::-1][::-1] == s
```

覆盖率与配置：

```bash
pip install pytest-cov
pytest --cov=myapp --cov-report=term-missing --cov-fail-under=80 tests/
```

```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
addopts = -v --strict-markers --tb=short --cov=myapp --cov-report=term-missing
markers =
    slow: marks tests as slow
    integration: marks integration tests
```

## 注意事项

- **隔离优先**：测试间不共享可变状态，每个用例自清理；fixture 用 `yield` 而非 setup/teardown 函数，确保异常时也能清理。
- **mock 打在使用处**：`patch` 的目标是「被测模块引用该符号的路径」，不是定义处（例如被测代码 `import requests` 后用 `requests.get`，则 patch `requests.get`）。
- 断言尽量**一个用例一个行为**；多断言时确保它们描述同一行为，否则拆开。
- `--strict-markers` 防止 marker 拼写错误被静默忽略；新 marker 要在配置里登记。
- 覆盖率是手段不是目的：80% 绿了不代表逻辑对，重点补「未测的分支与错误路径」。
- 异步测试需装 `pytest-asyncio` 且函数/fixture 都打 `@pytest.mark.asyncio`，否则协程不会被 await。
- 测试不能替代环境特定验证；缺前置条件、权限或成功判据时停下来澄清。

## 互见

- related：`async-python-patterns` —— 异步代码的测试常配合此栈的 asyncio 写法。
- related：`javascript-testing-patterns` —— 同源姊妹篇，JS/TS 侧的等价测试模式。
- combines_with：`test-coverage-gap-finder` —— 找出未覆盖路径后回到本技能补齐用例。
- combines_with：`ci-cd-pipeline-builder` —— 把 pytest + 覆盖率门槛接入 CI/CD 持续运行。
- combines_with：`systematic-debugger` —— 用例失败时用系统化排错定位根因。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
