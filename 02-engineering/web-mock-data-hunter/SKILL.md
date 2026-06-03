---
name: web-mock-data-hunter
title: Mock 数据猎手：审计网页中的假数据与硬编码
description: 当审计 AI 生成 / vibe-coded 网页、签收他人交付物或怀疑仪表盘数据是种子假数据时使用；驱动真实浏览器分五步（盘点→点击→溯源→定性→报告）追每个可见值的来源，产出逐值标注 REAL/MOCK/LLM/HARDCODED/BROKEN/UNKNOWN 的 markdown 审计报告；不适用于未经授权站点的写操作、OAuth/2FA 登录或多页爬取；触发词：mock 数据、假数据、硬编码、vibe-coded 审计、数据是否真连
domain: 研发/review
triggers: [mock 数据审计, 假数据/硬编码排查, vibe-coded 应用验收, 数据是否真连后端, Lovable/Bolt/v0 审计, NO-OP 按钮/坏接口检测]
tags: [mock-detection, web-audit, playwright, qa, ai-testing, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Playwright MCP, 浏览器 DevTools, 只读 DB 客户端(psql/mysql/mongosh/wrangler/supabase REST)]
requires: []
related: [ai-generated-code-auditor, vibe-code-production-cleanup, adversarial-code-reviewer, code-reviewer]
combines_with: [vibe-code-production-cleanup, webapp-testing, click-path-state-audit]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 审计 AI 生成的 UI（Lovable、Bolt、v0、Replit、AI Studio、Cursor Composer），搞清楚哪些可见值真的接了后端、哪些是假的。
- 签收外包或同事的交付物前做核验。
- 把 vibe-coded 的 MVP 给客户/投资人演示之前。
- 仪表盘「太干净」可疑：指标全是整数、时间戳挤在一分钟内、列与列无方差，怀疑是种子假数据。

不该用（负边界）：

- 未经授权的站点上做主动交互 —— 真实点击/提交会改变状态，必须先确认目标归用户所有、有安全测试账号/环境、并逐项授权。
- 登录只支持表单填写；OAuth、magic-link、2FA 不在范围内。
- 多页爬取 —— 单次只审一页，无站内 crawl。
- 只想看现成 CI 的 e2e 结果 —— 不在此范围。

核心姿态：默认**只观察**。在用户确认归属、给出安全测试环境/账号、并明确批准具体的点击/提交动作之前，不做任何可能改变状态的操作。

## 步骤

### 第 1 步 · 准备与提问

1. 问目标 URL。
2. 从 URL 自动识别技术栈：`*.lovable.app` / `*.bolt.new` / `*.v0.app` / `*.replit.app` / `aistudio.google.com`，否则记为 Custom。
3. 问 3–5 个关键问题：鉴权方式（public / localhost / 表单 / skip）、是否提供只读 DB、可疑点、本页目标。
4. 动手前确认：审计计划、归属与授权、目标环境、允许的动作类别。

### 第 2 步 · 导航与盘点

1. `browser_navigate` 打开目标 URL。
2. 按选定方式处理鉴权（表单登录：填字段→点提交）。
3. 等网络空闲（networkidle，最多 10s）。
4. 全页截图 + 抓无障碍快照（accessibility snapshot）。
5. 清点每一个：标题、按钮、链接、输入框、卡片、徽标、统计数、表格单元格、空状态、图片。
6. 记录初始的 console 报错与网络请求。

### 第 3 步 · 测交互

1. 每个 tab：仅在用户批准导航类交互后才点击，然后快照→滚到底→重新盘点。
2. 每个按钮：只点击用户批准、在白名单内、且由 role/可访问名/邻近文案/图标/URL 动作目标/预期网络副作用判断明显无破坏性的控件；可疑或有破坏性的**跳过**，不要只靠标签正则判断。
3. 每个表单：找出必填项，优先做空提交校验；只有用户明确批准了**具体表单 + 目标环境 + 测试账号**，才提交一次性废数据。
4. 逐元素记录行为。

### 第 4 步 · 溯源定性（核心决策树）

对每个可见值跑这棵树：

```
有网络请求返回过这个值吗？
├── 有 —— 在某个响应里找到：
│   ├── 状态 4xx/5xx → BROKEN
│   ├── 端点匹配 /ai|openai|generate|llm|chat → LLM
│   ├── 响应形状匹配 mock 库（faker、MSW、mockoon）→ MOCK
│   ├── 命中均匀性标志 → MOCK 或 LLM（待复核）
│   ├── 提供了 DB 连接？
│   │   ├── 跑只读 SELECT，值匹配 DB 行 → REAL
│   │   └── 值不在 DB 里 → MOCK
│   └── 无 DB → UNKNOWN（最佳猜测）
└── 没有 —— 任何网络响应里都没有这个值：
    ├── DOM 源码里的字符串字面量 → HARDCODED
    ├── 由 Math.random / Date.now / faker 计算 → MOCK
    └── 判不出来 → UNKNOWN
```

均匀性启发式（命中即标可疑）：

- 所有行的数值完全相同。
- 所有百分比都是整数（50%、75%、90%）。
- 所有时间戳挤在同一分钟内。
- 10+ 行里唯一值 < 3 个。

### 第 5 步 · 报告

生成 `mockhunter-report.md`，含：汇总表（各裁决计数）；按区块/tab 列发现（元素 / 值 / 裁决 / 来源 / 严重度 / 建议动作）；console 报错与网络失败；NO-OP 按钮；可疑模式；给用户的跟进问题。

## 指令

- 裁决词表固定六类：`REAL` `MOCK` `LLM` `HARDCODED` `BROKEN` `UNKNOWN`，每个可见值恰好一类。
- 有 DB 就用：只读 SELECT 能把 UNKNOWN 抬升为 REAL 或 MOCK，**永不** INSERT/UPDATE/DELETE。
- 跑冷启动测试（零数据状态）—— 很多 vibe-coded 应用在这里露馅。
- 用户已声明某些区块是故意 AI 生成的，就别误报它们。
- 废数据测试只用占位凭据 `mockhunter@example.com`，绝不用用户真实凭据。

## 示例

审计 Lovable 后台仪表盘：

```
User: /mockhunter audit https://my-app.lovable.app/admin
[第1步] 栈=Lovable；鉴权=skip；DB=无。
[第2步] 盘点：6 张统计卡、4 个审核队列、8 条动态。
[第3步] 搜索框 NO-OP（零网络请求）；动态链接 → 404。
[第4步] bundle 2.7 MB；零 /api/、零 supabase、零 axios。
        "$42,850" → JSX 字符串字面量 → HARDCODED。
        "+12% vs last month" → 字符串字面量 → HARDCODED。
[第5步] 裁决：23 HARDCODED、1 BROKEN、1 NO-OP、0 REAL。
        报告写入 ./mockhunter-report.md
```

公开营销站（大多为真）：

```
[第5步] 裁决：8 REAL、18 HARDCODED（有意的营销文案）、
        0 MOCK、0 BROKEN、2 UNKNOWN；无 console 报错、无坏接口。
```

## 注意事项

- 别在不属于自己、未获许可的应用上做主动交互：实时点击与表单提交会改变状态。
- 别只靠「破坏性按钮排除清单」：本地化标签、图标、aria 文本、后端路由都可能藏着改数据的动作。
- 绝不提交看起来像支付、删号、对外写入、改账户、邀请、发布、部署、发消息、转账的表单。
- 页面没加载成功就别信审计结果 —— 先看 console。
- 已知限制：单次单页（无多页 crawl）；鉴权仅支持表单登录（无 OAuth/magic-link/2FA）；每页约取最显著的 30 个按钮封顶；只出 markdown 报告（暂无 JSON）；DB 校验支持任何可经 shell 命令访问的库（psql、mysql、mongosh、wrangler、supabase REST），但不直接支持 Firestore。
- 所有浏览器动作都在受控的 MCP 浏览器上下文里发生，不做无头权限提升。

## 互见

- related：`webapp-testing`（同样用 Playwright 驱动浏览器做功能验证，本技能侧重「数据是真是假」的溯源审计）。
- combines_with：`bug-hunter`（审计发现 BROKEN 接口 / NO-OP 控件后，交给它做症状→根因的追踪修复）。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
