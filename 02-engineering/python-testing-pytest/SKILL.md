---
name: python-testing-pytest
title: Python Testing with pytest
description: Implement comprehensive testing strategies with pytest, fixtures, mocking, and TDD. Use when writing Python unit/integration tests, setting up test suites, mocking external dependencies, or measuring coverage. Triggers: pytest, fixture, parametrize, mock, monkeypatch, conftest, p
domain: 研发/testing
triggers: [write unit tests, set up pytest suite, fixture setup teardown, parametrize tests, mock dependencies, monkeypatch, test coverage, pytest-cov, test exceptions, async test asyncio, property-based testing hypothesis, conftest, tmp_path temp files, test database, TDD]
tags: [testing, python, pytest, fixture, mock, parametrize, coverage, tdd, unit-testing, integration-testing]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [javascript-testing-patterns, test-coverage-gap-finder, api-test-suite-builder, async-python-patterns]
combines_with: [fastapi-async-api, django-async-pro, test-coverage-gap-finder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill when:

- Writing unit tests for Python code, or setting up test suites and test infrastructure.
- Implementing test-driven development (TDD), or creating integration tests for APIs and services.
- Mocking external dependencies and services (HTTP, SDKs, environment variables, object attributes).
- Testing async code and concurrent operations, or testing database operations.
- Implementing property-based testing (hypothesis) to cover a larger input space.
- Setting up continuous testing in CI/CD with coverage gates, or debugging failing tests.

Do **not** use this skill when:

- The task is unrelated to Python testing, or the target language is JS/TS (use `javascript-testing-patterns`) or another stack.
- You would be treating passing tests as a substitute for environment-specific validation, release acceptance, or expert review — tests only cover the paths you assert on.
- Required inputs, the target under test, success criteria, permissions, or safety boundaries are missing — stop and ask for clarification first.

## Steps

1. **Pick the test type:** Unit (test individual functions/classes in isolation), Integration (test interaction between components), Functional/E2E (complete features), Performance. Favor unit tests — the pyramid is wide at the bottom, narrow at the top.
2. **Structure each unit test with the AAA pattern:** **Arrange** (set up test data and preconditions) → **Act** (execute the code under test) → **Assert** (verify the results). Name tests after behavior: `test_login_fails_with_invalid_password`, not `test_1`.
3. **Extract repeated setup/teardown into `@pytest.fixture`** (use `yield` to split setup/teardown), choosing `scope` as needed (`function`/`module`/`session`). Share fixtures across files via `conftest.py`. Use `autouse=True` for fixtures that must run before every test, and parametrized fixtures (`params=[...]`, `request.param`) to run a test across backends.
4. **Use `@pytest.mark.parametrize`** for the same logic across many inputs; name special cases with `pytest.param(..., id=...)`.
5. **Isolate external side effects:** HTTP/SDKs with `unittest.mock` (`patch`/`Mock`/`MagicMock`/`side_effect`); environment variables and object attributes with the built-in `monkeypatch` (`setenv`/`delenv`/`setattr`); temporary files with `tmp_path`.
6. **Test exception paths** with `pytest.raises(Exc, match="...")`; capture `as exc_info` and inspect `exc_info.value` when you need details.
7. **Test async code with `pytest-asyncio`:** mark tests and fixtures with `@pytest.mark.asyncio`; run concurrent ops with `asyncio.gather`.
8. **Classify tests with markers** (`slow`/`integration`/`unit`/`e2e`). Register them in config and use `--strict-markers` to catch typos. Filter runs with `pytest -m "not slow"`, etc. Use `skip`/`skipif`/`xfail` for conditional or known-failing cases.
9. **Measure coverage with `pytest-cov`;** gate CI with `--cov-fail-under=80` and focus on quality (untested branches and error paths) rather than the raw percentage.
10. **Keep tests independent and isolated:** no shared mutable state, each test cleans up after itself; write tests first (TDD) or alongside the code.

## Example

Basic tests, fixtures, parametrization, mocking, and exceptions:

```python
# test_calculator.py
import pytest
from unittest.mock import Mock, patch
import requests

class Calculator:
    def add(self, a: float, b: float) -> float:
        return a + b
    def divide(self, a: float, b: float) -> float:
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

@pytest.fixture
def calc():                      # setup -> yield -> teardown
    c = Calculator()
    yield c

@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5), (-1, 1, 0), (0, 0, 0),
])
def test_add(calc, a, b, expected):           # AAA + parametrize
    assert calc.add(a, b) == expected

def test_divide_by_zero(calc):                # exception path
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        calc.divide(5, 0)

def test_get_user_success():                  # mock external dependency
    mock_response = Mock()
    mock_response.json.return_value = {"id": 1, "name": "John Doe"}
    mock_response.raise_for_status.return_value = None
    with patch("requests.get", return_value=mock_response) as mock_get:
        assert requests.get("https://api.x/users/1").json()["id"] == 1
        mock_get.assert_called_once_with("https://api.x/users/1")

# Custom test IDs for clarity
@pytest.mark.parametrize("value,expected", [
    pytest.param(1, True, id="positive"),
    pytest.param(0, False, id="zero"),
    pytest.param(-1, False, id="negative"),
])
def test_is_positive(value, expected):
    assert (value > 0) == expected
```

Environment variables, temporary files, and async:

```python
import os, asyncio, pytest

def get_database_url() -> str:
    return os.environ.get("DATABASE_URL", "sqlite:///:memory:")

def test_env_custom(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/test")
    assert get_database_url() == "postgresql://localhost/test"

def test_env_not_set(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    assert get_database_url() == "sqlite:///:memory:"

def test_file_operations(tmp_path):           # tmp_path is a pathlib.Path
    f = tmp_path / "data.txt"
    f.write_text("Hello, World!")
    assert f.exists()
    assert f.read_text() == "Hello, World!"

@pytest.mark.asyncio
async def test_concurrent_fetches():
    async def fetch(url): 
        await asyncio.sleep(0)
        return {"url": url}
    results = await asyncio.gather(*(fetch(u) for u in ("u1", "u2", "u3")))
    assert len(results) == 3
```

Shared fixtures in `conftest.py`:

```python
# conftest.py — shared fixtures for all tests
import pytest

@pytest.fixture(scope="session")
def database_url():
    return "postgresql://localhost/test_db"

@pytest.fixture(autouse=True)
def reset_database(database_url):             # runs before each test
    # setup: clear database
    yield
    # teardown: clean up

@pytest.fixture(params=["sqlite", "postgresql", "mysql"])
def db_backend(request):                      # runs each test 3x
    return request.param
```

Property-based testing with hypothesis:

```python
from hypothesis import given, strategies as st

@given(st.text())
def test_reverse_twice_is_original(s):
    assert s[::-1][::-1] == s

@given(st.integers(), st.integers())
def test_addition_commutative(a, b):
    assert a + b == b + a
```

Coverage and configuration:

```bash
pip install pytest-cov
pytest --cov=myapp tests/                              # run with coverage
pytest --cov=myapp --cov-report=html tests/            # HTML report
pytest --cov=myapp --cov-report=term-missing tests/    # show missing lines
pytest --cov=myapp --cov-fail-under=80 tests/          # fail under threshold
```

```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --strict-markers --tb=short --cov=myapp --cov-report=term-missing
markers =
    slow: marks tests as slow
    integration: marks integration tests
    unit: marks unit tests
    e2e: marks end-to-end tests
```

```yaml
# .github/workflows/test.yml — CI matrix
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.9", "3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
      - run: pip install -e ".[dev]" && pip install pytest pytest-cov
      - run: pytest --cov=myapp --cov-report=xml
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

## Notes

- **Isolation first:** no shared mutable state between tests; each test cleans up after itself. Use `yield` fixtures rather than separate setup/teardown functions so teardown still runs on exceptions.
- **Mock where it is used, not where it is defined:** `patch` the symbol path as referenced by the module under test (e.g. if the code does `import requests` then calls `requests.get`, patch `requests.get`).
- **Prefer one behavior per test.** When you have multiple assertions, make sure they all describe the same behavior — otherwise split them out.
- **`--strict-markers`** prevents misspelled markers from being silently ignored; register every new marker in config.
- **Coverage is a means, not an end:** 80% green does not prove the logic is correct — focus on the untested branches and error paths.
- **Async tests require `pytest-asyncio`** and `@pytest.mark.asyncio` on both functions and fixtures, or coroutines will never be awaited.
- Tests are not a substitute for environment-specific validation; when preconditions, permissions, or success criteria are missing, stop and clarify.

## See also

- related: `async-python-patterns` — testing async code pairs with this stack's asyncio patterns.
- related: `javascript-testing-patterns` — sister skill for the equivalent JS/TS testing patterns.
- combines_with: `test-coverage-gap-finder` — find uncovered paths, then return here to add the missing tests.
- combines_with: `ci-cd-pipeline-builder` — wire pytest + coverage gates into a continuous-testing pipeline.
- combines_with: `systematic-debugger` — diagnose root causes when test cases fail.

---
Adapted from sickn33/antigravity-awesome-skills (MIT).
