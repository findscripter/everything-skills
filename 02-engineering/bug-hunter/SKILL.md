---
name: bug-hunter
title: 症状到根因的缺陷追踪修复
description: 当报告 bug、出现报错或行为异常、需要排查间歇性故障与线上问题时使用；做证据驱动的系统化调试（复现→取证→假设→验证→定位根因→改根因→回归测试），产出根因结论、最小修复与防回归用例；不适用于纯新功能开发、需求设计或仅靠掩盖症状（如随手加可选链兜底）即收工的场景；触发词：修 bug、调试、报错排查
domain: 研发/review
triggers: [修 bug, 调试 debug, 报错/异常排查, 间歇性故障, 线上问题定位, git bisect 找回归]
tags: [调试, 缺陷修复, 根因分析, 回归测试, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [日志/控制台, 调试器(debugger/--inspect), git bisect, 浏览器 DevTools, 单元测试框架]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 用户报告 bug 或报错、说「修一下这个 bug」「调试一下」。
- 功能行为与预期不符。
- 间歇性失败、偶现的诡异行为。
- 线上/生产问题需要调查。

不该用（负边界）：

- 纯新功能开发、架构/需求设计 —— 不属于「已有缺陷追踪」。
- 仅想用兜底掩盖症状（如随手加 `?.` 默认值）而不查根因 —— 本技能要求改根因。
- 缺少复现步骤、必要权限或成功判据时，先停下来追问，别盲改。

核心原则：不靠猜，跟着证据走；先复现再修；修根因而非症状；改完务必回归并补测试。

## 步骤

1. 复现：拿到精确复现步骤，本地复现，记录触发条件、错误信息/行为，确认是必现还是偶现。无法复现就补环境信息（dev/staging/prod、浏览器/设备、前置操作、错误日志）。
2. 取证：查日志（`tail -f logs/app.log`、`journalctl -u myapp -f`、浏览器 DevTools Console），看完整堆栈（错误类型、消息、行号、时间戳），看状态（处理的数据、DB、localStorage/cookie）。
3. 立假设：基于证据给出可证伪的猜测，例如「登录超时是因为 session cookie 在鉴权完成前就过期」。
4. 验假设：加日志（`console.log('before:', userData)`）、下断点（`debugger;`）、隔离问题（注释代码、换 mock 数据缩小范围）。
5. 定根因：从症状回溯，常见根因 —— null/undefined、类型错误、竞态、缺错误处理、逻辑错误、差一错误、async/await 漏用、缺校验。沿「症状→在哪→为什么…」逐层下钻到真正起点。
6. 改根因：修起点而非掩盖表象。

```javascript
// 坏修复（掩盖症状）
const name = user?.profile?.name || 'Unknown';

// 好修复（修根因：登录时确保写入 user ID）
const login = async (credentials) => {
  const user = await authenticate(credentials);
  if (user) { session.userId = user.id; return user; }
  throw new Error('Invalid credentials');
};
```

7. 验修复：复现原 bug → 应用修复 → 再复现应失败 → 测边界 → 测相关功能 → 跑现有测试。
8. 防回归：补一条测试锁住行为。

```javascript
test('login sets user ID in session', async () => {
  const user = await login({ email: 'test@example.com', password: 'pass' });
  expect(session.userId).toBe(user.id);
  expect(session.userId).not.toBeNull();
});
```

## 指令

- 二分定位：撒 `CHECKPOINT 1/2/3` 日志，每次把问题空间砍一半。
- 时光调试：用 git 找引入回归的提交：

```bash
git bisect start
git bisect bad            # 当前提交是坏的
git bisect good abc123    # 这个旧提交是好的
# git 会逐个 checkout 提交供你测试
```

- 打印调试：在 input / transform 后 / save 前 / result 处打日志。
- 差异调试：最近改了什么？环境/数据有何不同？
- 小黄鸭调试：逐行讲给别人（或鸭子）听，常在讲的过程中发现问题。
- 卡住时：休息 10 分钟 / 搜精确错误信息 / 查 GitHub Issues 与 SO / 做最小复现 / 删了重写问题代码 / 带上下文求助。

## 示例

根因回溯链：

```
症状：Cannot read property 'name' of undefined
↓ 在哪：user.profile.name
↓ 为什么：user.profile 是 undefined
↓ 为什么：API 没返回 profile
↓ 为什么：User ID 为 null
↓ 根因：登录没把 user ID 写进 session
```

常见 bug 模式（坏→好）：

```javascript
// 竞态：data 还没加载就读
let data = null;
fetchData().then(r => data = r);
console.log(data);            // null
const data = await fetchData(); // 修复

// 差一错误
for (let i = 0; i <= arr.length; i++) {} // 末次越界
for (let i = 0; i < arr.length; i++) {}  // 修复

// 类型隐式转换
if (count == 0) {}  // "" / [] / null 都为真
if (count === 0) {} // 仅 0 为真

// 漏 await
const r = asyncFn();        // 拿到的是 Promise
const r = await asyncFn();  // 修复
```

修复后按模板归档：症状 / 根因 / 修复 / 变更文件(含行号) / 测试 / 防回归措施。

## 注意事项

- 不要把「掩盖症状」当修复；可选链兜底只在确实是合法空值时用。
- 改完一定跑现有测试 + 新增回归用例，验证边界与相关功能。
- 调试工具速记：浏览器 DevTools（Console/Sources 断点/Network/Application/Performance）；Node `node --inspect app.js` 配 `chrome://inspect`；VS Code 用 `.vscode/launch.json` 配 `launch`。
- 缺输入、权限、安全边界或成功判据时停下追问；本技能产出不替代环境内验证、测试与专家评审。

## 互见

- 系统化调试（进阶调试方法）。
- 测试驱动开发（补测试/防回归）。
- 推送前代码审计（代码评审）。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
