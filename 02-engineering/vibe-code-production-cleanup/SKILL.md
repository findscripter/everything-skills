---
name: vibe-code-production-cleanup
title: Vibe 代码清理：全栈应用上线前安全加固
description: 当 AI 速成/vibe-coded 的全栈应用（Next.js、React、Node.js）能跑但有断裂导入、死代码、重复逻辑、环境变量混乱、需上线或交接前加固时使用；做小步可回滚的安全清理，产出无断链、含共享 helper、env 齐备且构建通过的可维护基线；不适用于重命名路由/API 契约、改 DB schema/鉴权/计费、大重写或删除未验证文件。触发词：vibe代码清理、上线前加固、死代码清理
domain: 研发/frontend
triggers: [vibe 代码清理, 上线前加固, 全栈应用清理, 死代码清理, 断裂导入修复, Next.js 重构, 生产就绪, 代码交接整理]
tags: [cleanup, refactor, nextjs, fullstack, nodejs, production, vibe-code, 重构, 上线加固]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude, claude-code, cursor, gemini]
requires: []
related: [ai-generated-code-auditor, clean-code-principles, code-simplifier, legacy-codebase-modernizer]
combines_with: [pre-deploy-checklist, env-secrets-hygiene, web-mock-data-hunter]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 快速搭起来的应用「能跑」，但存在断裂导入、重复逻辑、死代码、环境变量含义不清、发布卫生脆弱等问题。
- 上线或交接前，需要把探索性代码转成可维护的生产基线。
- 清理必须**保持现有行为不变**，禁止对路由、API、鉴权、数据模型、第三方集成做大范围重写。

不该用（边界）：
- 不要为了「好看」重写能正常工作的系统。
- 不要重命名可能被搜索引擎索引或被缓存的路由、slug、API 端点。
- 不要改动工具入参/出参、API 契约、DB schema、鉴权流程。
- 不要删除尚未确认「全仓库无引用」的文件。
- 不要在单个 commit 里塞进大范围扫荡式改动。

核心原则：**做手术，不做爆破。** 只删可证明已死的代码，其余一律保留；改动要小、定向、可回滚；每批改动后立即验证；优先抽共享 helper 而非复制粘贴；保持向后兼容。

## 步骤

1. **侦察（先读后动）**：先把代码版图摸清，此阶段**只记录、不改动**。
2. **优先修断裂导入**：断裂导入会直接挂掉构建，最先修。修引用本身，不要删被引用的文件——除非确认它全仓库无引用。
3. **识别死代码（删前验证）**：一个文件/导出仅当满足全部条件才可删——(a) grep 确认无其他文件 import；(b) 不被 config、sitemap、路由清单引用；(c) 不是对外 URL（page.js / route.js）。
4. **重复逻辑收敛为 helper**：把出现在 **3 处及以上**的模式（SEO metadata、fetch 包装、错误处理、slugify/formatDate/truncate 等工具函数）抽成共享 helper。一次性业务逻辑、契约不同的路由处理器、触碰 DB/鉴权的代码**不要动**。
5. **环境变量审计**：列出代码中用到的全部 env，与 `.env.example` 比对，标记缺失项。绝不把密钥提交进版本库。
6. **每批改完即验证**：typecheck / lint / build / test 全过；任一项挂掉立刻**回滚上一批**再继续。
7. **提交策略**：每个 commit 是单一逻辑单元，UI、逻辑、删文件分开提；commit 越小越易回滚。

## 指令

侦察（Step 1）：
```bash
# 列出所有页面/路由
find . -path "*/app/**/page.{js,jsx,ts,tsx}" | sort
find . -path "*/pages/**/*.{js,jsx,ts,tsx}" | grep -v "_" | sort
# 断裂导入（TS 项目）
npx tsc --noEmit 2>&1 | head -80
# 未使用导出（大项目可选）
npx ts-prune 2>/dev/null | head -40
# 调试残留
grep -r "console\.log\|debugger\|TODO\|FIXME\|HACK" --include="*.{js,ts,jsx,tsx}" -l
```

死代码验证（Step 3）：
```bash
# 文件是否被任何地方 import
grep -r "from.*my-file\|require.*my-file" --include="*.{js,ts,jsx,tsx}" .
# 组件是否被使用
grep -r "MyComponent" --include="*.{js,ts,jsx,tsx}" .
```

环境变量审计（Step 5）：
```bash
grep -r "process\.env\." --include="*.{js,ts,jsx,tsx}" . | grep -oP 'process\.env\.\w+' | sort -u
cat .env.example 2>/dev/null || cat .env.local 2>/dev/null
```

每批验证（Step 6）：
```bash
npx tsc --noEmit
npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0
npm run build   # 抓 TS 抓不到的运行时问题
npm test -- --runInBand --passWithNoTests
```
构建或 typecheck 挂掉 → **回滚上一批**再继续。

## 示例

**共享 metadata helper（Next.js，Step 4 收敛示范）**：把散落在各 page 的 Open Graph / Twitter / canonical 抽成一处。
```js
// lib/socialMetadata.js
export function buildPageMetadata({ title, description, path, image }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const imageUrl = image?.startsWith('http') ? image : `${baseUrl}${image}`;
  return {
    title,
    description,
    openGraph: {
      title, description,
      url: `${baseUrl}${path}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
    alternates: { canonical: `${baseUrl}${path}` },
  };
}
```

**提交信息范式（Step 7）**——每条一个逻辑单元：
```
fix: remove broken import in app/blog/page.js
refactor: consolidate social metadata into lib/socialMetadata.js
chore: remove verified-unused utils/oldHelper.js
fix: standardize env var references to NEXT_PUBLIC_BASE_URL
```

## 注意事项

**禁区清单**（除非有已验证的 bug，否则一律不碰）：

| 区域 | 原因 |
|------|------|
| 路由 slug / 页面路径 | 可能已被 Google 索引 |
| API 路由契约 | 调用方依赖确切结构 |
| DB schema / Prisma 模型 | 改动需要迁移 |
| 鉴权流程逻辑 | 安全敏感 |
| 第三方集成配置 | key/webhook 与环境绑定 |
| 可用的功能页面 | 直接面向用户 |

**收尾检查清单**：TS 错误清零 / 无断裂导入 / 死代码已删（grep 验证）/ 重复模式（≥3 处）已抽 helper / 无硬编码密钥或本地专用 URL / 所有 env 在 `.env.example` 中有记录 / build 通过 / test 通过（或无测试）/ lint 通过 / 每个 commit 范围清晰可解释。

**局限**：无法仅凭代码推断产品意图——删路由、组件、API 契约、数据模型前必须确认行为；务必小批量评审式推进，大重构会掩盖回归；未经明确需求与测试，不要改动鉴权、计费、持久化或第三方集成行为。

## 互见

- 同域研发/misc 下的「死代码识别」「依赖审计」类技能。
- 上线前可串联安全审查（security-review）与构建/测试验证流程。

---
*采编自 sickn33/antigravity-awesome-skills（MIT）。*
