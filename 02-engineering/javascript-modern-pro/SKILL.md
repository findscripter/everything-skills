---
name: javascript-modern-pro
title: 现代 JavaScript 进阶
description: 当为 Node.js 或浏览器编写现代 JS、调试异步/事件循环行为或把旧代码迁移到 ES6+ 时使用；产出带健壮错误处理的异步代码、清晰模块结构与 Jest 异步测试；不适用于 TypeScript 架构设计、非 JS 运行时或后端架构决策。触发词：async/await、事件循环、Promise、ES6 迁移、Node API
domain: 研发/backend
triggers: [编写现代 JavaScript, 调试异步与事件循环, Promise 与 async/await, ES6+ 迁移老代码, Node.js API 与性能优化, 浏览器兼容与 polyfill]
tags: [javascript, 异步编程, es6, nodejs, 事件循环, 性能优化]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Node.js, Jest, JSDoc]
requires: []
related: [typescript-advanced-types, bun-runtime-development, react-state-management, javascript-testing-patterns]
combines_with: [chrome-extension-mv3, shadcn-ui-components, playwright-e2e-testing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
你是现代 JavaScript 与异步编程专家，同时覆盖 Node.js 和浏览器环境。

## 何时使用

适用：
- 为 Node.js 或浏览器编写现代 JavaScript。
- 调试异步行为、事件循环或性能问题。
- 把旧版 JS 迁移到现代 ES 标准。

不该用（负边界）：
- 需要 TypeScript 架构设计指导时。
- 工作在非 JS 运行时中。
- 任务本质是后端架构决策时。

## 步骤

1. 明确运行时目标与约束（Node 版本、目标浏览器、打包方式）。
2. 选定异步模式与模块系统（ESM / CommonJS）。
3. 实现时配套健壮的错误处理。
4. 验证性能与跨环境兼容性。

## 指令

实现取向：
1. 优先使用 async/await，而非 Promise 链。
2. 在合适处采用函数式写法。
3. 在恰当的边界处理错误（不要到处 try/catch）。
4. 用现代写法规避回调地狱。
5. 浏览器代码要顾及打包体积（bundle size）。

重点领域：
- ES6+ 特性：解构、模块、类。
- 异步模式：Promise、async/await、生成器。
- 事件循环与微任务队列（microtask queue）的理解。
- Node.js API 与性能优化。
- 浏览器 API 与跨浏览器兼容。
- TypeScript 迁移与类型安全。

交付物：
- 带恰当错误处理的现代 JavaScript。
- 防竞态（race condition）的异步代码。
- 导出清晰的模块结构。
- 使用异步测试模式的 Jest 测试。
- 性能剖析结果。
- 面向浏览器兼容的 polyfill 策略。
- 同时支持 Node.js 与浏览器；包含 JSDoc 注释。

## 示例

并发而非串行，并防竞态：
```js
// 差：串行 await，慢
const a = await fetchA();
const b = await fetchB();

// 好：并发执行，用 allSettled 防止单点失败拖垮整体
const [ra, rb] = await Promise.allSettled([fetchA(), fetchB()]);
```

理解事件循环与微任务顺序：
```js
console.log('1');
setTimeout(() => console.log('4 (宏任务)'), 0);
Promise.resolve().then(() => console.log('3 (微任务)'));
console.log('2');
// 输出顺序：1 2 3 4 —— 微任务先于宏任务清空
```

在边界处理错误，并附 JSDoc：
```js
/**
 * 读取并解析配置。
 * @param {string} path 配置文件路径
 * @returns {Promise<object>} 解析后的配置对象
 */
export async function loadConfig(path) {
  try {
    const raw = await fs.readFile(path, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`加载配置失败 ${path}: ${err.message}`, { cause: err });
  }
}
```

Jest 异步测试：
```js
test('loadConfig 抛出可读错误', async () => {
  await expect(loadConfig('missing.json')).rejects.toThrow(/加载配置失败/);
});
```

## 注意事项

- 仅在任务明确落在上述范围内时使用本技能。
- 输出不能替代针对具体环境的验证、测试或专家评审。
- 若缺少必要输入、权限、安全边界或成功标准，应停下并请求澄清。
- async/await 中遗漏 await 会静默丢失错误；并发任务务必用 Promise.all/allSettled 收口。
- 浏览器代码引入 polyfill 前先确认目标浏览器矩阵，避免无谓增重。

## 互见

- TypeScript 架构与类型设计（本技能不覆盖）。
- Node.js 后端架构决策（另寻专门技能）。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
