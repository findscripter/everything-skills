---
name: javascript-testing-patterns
title: JS/TS 测试策略
description: 当为 JavaScript/TypeScript 项目搭建测试体系、写单元/集成/E2E 测试或 mock 依赖时使用；用 Jest/Vitest + Testing Library 按 AAA 模式产出可执行测试、覆盖率配置与 fixture 工厂；不适用于非 JS/TS 语言或纯环境验证、专家评审替代。触发词：单元测试、Vitest/Jest、mock、覆盖率、Testing Library
domain: 研发/testing
triggers: [写单元测试, 搭建测试框架, Vitest 配置, Jest 配置, mock 依赖, 测试覆盖率, React 组件测试, API 集成测试, TDD, 测试 Hook]
tags: [测试, javascript, typescript, vitest, jest, testing-library, 单元测试, 集成测试, mock, 覆盖率]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Jest, Vitest, Testing Library, supertest, @faker-js/faker]
requires: []
related: [python-testing-pytest, playwright-e2e-testing, test-coverage-gap-finder, api-test-suite-builder]
combines_with: [javascript-modern-pro, playwright-e2e-testing, test-coverage-gap-finder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：
- 为新项目搭建测试基础设施（Jest 或 Vitest）。
- 为纯函数、类、异步方法编写单元测试。
- 为 API、Service、数据库仓储编写集成测试。
- mock 外部依赖（fetch、第三方模块、SMTP 等）或用依赖注入解耦。
- 测试 React/Vue 等前端组件与自定义 Hook。
- 实践 TDD，在 CI/CD 中配置持续测试与覆盖率门槛。

不该用（负边界）：
- 任务与 JS/TS 测试无关，或涉及其他语言/工具栈（如 Python pytest、Go test）。
- 把测试输出当作环境特定验证、上线验证或专家评审的替代品——测试不等于生产可用证明。
- 缺少必要输入（被测代码、依赖边界、成功判据）时，应先澄清而非臆造。

## 步骤

1. 选框架：Vite 项目优先 Vitest（原生快、API 与 Jest 兼容）；通用 Node/TS 项目可用 Jest（`ts-jest` preset）。
2. 配置覆盖率门槛与 setup 文件（见示例 config）。
3. 按 AAA 模式（Arrange-Act-Assert）写测试，从纯函数到类、再到异步与集成逐层推进。
4. 隔离外部依赖：模块用 `vi.mock`，可控对象用依赖注入 + mock，观察调用用 `vi.spyOn`。
5. 用 fixture 工厂（`@faker-js/faker`）生成一致测试数据，避免硬编码散落。
6. 前端用 Testing Library：优先语义查询（getByRole/getByPlaceholderText），`data-testid` 少用。
7. 集成测试用 `supertest` 打真实路由，配 `beforeAll/afterAll` 建表清表、`beforeEach` 清数据。
8. 接入 CI：`vitest --coverage`，覆盖率目标 80%+。

## 指令

- 明确目标、约束与必需输入后再动手。
- 测试行为而非实现细节；覆盖错误分支与边界，而不仅是 happy path。
- 命名要描述「测什么」；一条测试一个逻辑断言。
- 用 `beforeEach/afterEach` 做建立与清理，防止测试间污染（mock 用 `vi.clearAllMocks()`，spy 用 `mockRestore()`）。
- 慢操作（网络、定时器）一律 mock；定时器用 `vi.useFakeTimers()` + `vi.advanceTimersByTime()`。

## 示例

Vitest 配置（覆盖率 + setup）：
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.d.ts', '**/*.config.ts', '**/dist/**'],
    },
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

Jest 覆盖率门槛（核心约束）：
```typescript
// jest.config.ts
coverageThreshold: {
  global: { branches: 80, functions: 80, lines: 80, statements: 80 },
}
```

单元测试纯函数（含异常分支）：
```typescript
import { describe, it, expect } from 'vitest';
import { divide } from './calculator';

describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });
  it('should throw when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
});
```

异步 + mock fetch：
```typescript
global.fetch = vi.fn();

it('should fetch user successfully', async () => {
  const mockUser = { id: '1', name: 'John' };
  (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => mockUser });

  const user = await service.fetchUser('1');
  expect(user).toEqual(mockUser);
  expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/1');
});

it('should throw if not ok', async () => {
  (fetch as any).mockResolvedValueOnce({ ok: false });
  await expect(service.fetchUser('999')).rejects.toThrow('User not found');
});
```

依赖注入 mock 仓储（比 mock 全局更可控）：
```typescript
beforeEach(() => {
  mockRepository = { findById: vi.fn(), create: vi.fn() };
  service = new UserService(mockRepository);
});

it('should throw if user not found', async () => {
  vi.mocked(mockRepository.findById).mockResolvedValue(null);
  await expect(service.getUser('999')).rejects.toThrow('User not found');
});
```

React 组件测试（Testing Library，语义查询优先）：
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

it('should call onSubmit with form data', () => {
  const onSubmit = vi.fn();
  render(<UserForm onSubmit={onSubmit} />);
  fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'John' }));
});
```

Hook 测试（`renderHook` + `act`）：
```typescript
import { renderHook, act } from '@testing-library/react';

it('should increment count', () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

API 集成测试（supertest + 数据库生命周期）：
```typescript
import request from 'supertest';

beforeEach(async () => { await pool.query('TRUNCATE TABLE users CASCADE'); });

it('should create a new user', async () => {
  const res = await request(app).post('/api/users').send(userData).expect(201);
  expect(res.body).not.toHaveProperty('password'); // 不泄露敏感字段
});
```

fixture 工厂（faker，数据一致）：
```typescript
import { faker } from '@faker-js/faker';

export function createUserFixture(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    ...overrides,
  };
}
```

定时器测试：
```typescript
vi.useFakeTimers();
const cb = vi.fn();
setTimeout(cb, 1000);
expect(cb).not.toHaveBeenCalled();
vi.advanceTimersByTime(1000);
expect(cb).toHaveBeenCalled();
vi.useRealTimers();
```

package.json 脚本：
```json
{ "scripts": {
  "test": "vitest",
  "test:coverage": "vitest --coverage",
  "test:ui": "vitest --ui"
}}
```

## 注意事项

- 一条测试一个逻辑断言；测行为不测实现，避免组件重构即红的脆弱测试。
- 必清理：mock 用 `vi.clearAllMocks()`，spy 用 `mockRestore()`，集成用 `afterAll` 关连接（`pool.end()`），否则测试相互污染、句柄泄漏。
- 异步必须 `await`：断言 reject 用 `await expect(...).rejects.toThrow(...)`，漏 await 会假绿。
- 快照测试谨慎：大快照难审、易盲目 `--update`；仅用于稳定、小粒度的 UI 输出。
- `data-testid` 少用，优先语义查询，更贴近真实用户行为。
- 覆盖率是下限不是目标——80% 覆盖不等于测试有效，关键是覆盖错误分支与边界。
- 集成测试依赖真实数据库/服务，需独立测试库与隔离环境，勿连生产或共享开发库。

## 互见

- 前端 E2E、组件交互可配合 Chrome DevTools/Lighthouse 类工具做端到端与性能验证。
- CI/CD 中将 `test:coverage` 作为合并门禁的一环。
- 参考文档：Vitest（vitest.dev）、Jest（jestjs.io）、Testing Library（testing-library.com）。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可），已按「技能大典」SCHEMA 适配重写。
