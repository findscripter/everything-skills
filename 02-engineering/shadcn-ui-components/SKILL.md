---
name: shadcn-ui-components
title: shadcn/ui 组件库实践
description: 当在前端项目中新增/组合/调试 shadcn/ui 组件、初始化项目或切换设计预设时使用；做组件查找-安装-组合的可执行操作并产出符合关键约束的 React/TSX 代码；不适用于非 shadcn/ui 的 UI 库或纯样式问题。触发词：shadcn、组件库、设计系统
domain: 研发/frontend
triggers: [shadcn, shadcn/ui, 组件库, 设计系统, registry, npx shadcn, 新增组件, FieldGroup, 切换预设, monorepo UI]
tags: [前端, React, shadcn, 组件库, 设计系统, Tailwind, TSX, CLI]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [npx shadcn@latest, pnpm dlx shadcn@latest, bunx --bun shadcn@latest]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 从 shadcn/ui 官方或社区 registry **新增组件**。
- **样式化、组合、调试**已有的 shadcn/ui 组件。
- **初始化新项目**或切换设计预设（preset）。
- 检索组件文档、示例与 API 参考。

不该用的边界：

- 非 shadcn/ui 的 UI 库（如 Ant Design、MUI），或与 registry / CLI 无关的纯 Tailwind/CSS 调试。
- 任务范围不清、缺少必需输入（registry、preset、目标框架）时，先停下来询问，不要猜。
- 不能替代环境内的真实校验与测试。

## 步骤

1. **取项目上下文** — 运行 `npx shadcn@latest info --json`。读取关键字段：`aliases`（导入前缀，勿硬编码）、`isRSC`（为 true 时含 useState/事件/浏览器 API 的文件需顶部加 `"use client"`）、`tailwindVersion`（v4 用 `@theme inline`，v3 用 `tailwind.config.js`）、`tailwindCssFile`（改这个文件，勿新建）、`base`（`radix` 用 `asChild`，`base` 用 `render`）、`iconLibrary`（决定图标导入包，勿假定 lucide-react）、`framework`、`packageManager`。
2. **先查已装组件** — 在 `add` 前核对上下文里的 `components` 列表或 `resolvedPaths.ui` 目录，别重复添加、别导入未安装的组件。
3. **查找组件** — `npx shadcn@latest search`，先复用再造轮子，社区 registry 也要查。
4. **取文档与示例** — `npx shadcn@latest docs <component>` 拿到 URL 再抓取；未安装项用 `npx shadcn@latest view` 浏览。创建/修复/调试组件前务必先 `docs`，按真实 API 写而非猜。
5. **安装或更新** — `npx shadcn@latest add`。更新前先 `--dry-run` 和 `--diff` 预览。
6. **修三方组件导入** — 社区 registry（如 `@magicui`、`@bundui`）的非 UI 文件可能含硬编码 `@/components/ui/...`，按 `info` 里真实 `ui` alias 改写。
7. **复查产物** — 添加后必读文件，检查缺失子组件（如 `SelectItem` 缺 `SelectGroup`）、缺导入、组合错误、违反关键约束；并把图标导入换成项目的 `iconLibrary`。
8. **registry 必须显式** — 用户没指定 registry 时（如只说"加个登录块"）要追问，绝不替用户默认。
9. **切换预设先问** 用户选 reinstall / merge / skip（见下）。

## 指令

所有 CLI 命令按项目 `packageManager` 选 runner：`npx shadcn@latest` / `pnpm dlx shadcn@latest` / `bunx --bun shadcn@latest`。下例统一用 `npx`。

```bash
# 初始化项目
npx shadcn@latest init --name my-app --preset base-nova
npx shadcn@latest init --name my-app --preset base-nova --monorepo
npx shadcn@latest init --preset base-nova          # 已有项目
npx shadcn@latest init --defaults                  # = --template=next --preset=base-nova

# 添加组件
npx shadcn@latest add button card dialog
npx shadcn@latest add @magicui/shimmer-button
npx shadcn@latest add --all

# 添加/更新前预览
npx shadcn@latest add button --dry-run
npx shadcn@latest add button --diff button.tsx

# 搜索 / 文档 / 浏览
npx shadcn@latest search @shadcn -q "sidebar"
npx shadcn@latest docs button dialog select
npx shadcn@latest view @shadcn/button
```

**预设名：** `base-nova`、`radix-nova`。**模板：** `next`、`vite`、`start`、`react-router`、`astro`（均支持 `--monorepo`）、`laravel`（不支持 monorepo）。**预设码：** 以 `a` 开头的 Base62 串（如 `a2r6bw`），来自 ui.shadcn.com，直接传给 `--preset`，切勿手动解码或抓取。

**切换预设三选一：**
- **Reinstall**（覆盖全部组件）：`init --preset <code> --force --reinstall`
- **Merge**（逐个智能合并）：`init --preset <code> --force --no-reinstall`，再对每个已装组件用 `--dry-run` + `--diff` 合并
- **Skip**（只更新 config/CSS）：`init --preset <code> --force --no-reinstall`

**更新组件**（保留本地改动）：`add <c> --dry-run` 看影响文件 → `add <c> --diff <file>` 看上下游差异 → 无本地改动可覆盖、有改动则读本地文件分析后保留改动。**绝不手动从 GitHub 抓原始文件，绝不在未经用户明确同意下用 `--overwrite`。**

## 示例

四条核心原则：先用现成组件 → 组合而非重造 → 优先内置 variant → 用语义色。

```tsx
// 表单布局：FieldGroup + Field，不要 div + Label
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
  </Field>
</FieldGroup>

// 校验：Field 上 data-invalid，控件上 aria-invalid
<Field data-invalid>
  <FieldLabel>Email</FieldLabel>
  <Input aria-invalid />
  <FieldDescription>Invalid email.</FieldDescription>
</Field>

// 按钮内图标：用 data-icon，不加尺寸 class
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

<div className="flex flex-col gap-4">  // 对：gap-*
<div className="space-y-4">           // 错：space-y-*

<Avatar className="size-10">    // 对：宽高相等用 size-*
<Avatar className="w-10 h-10">  // 错

<Badge variant="secondary">+20.1%</Badge>          // 对：语义/变体
<span className="text-emerald-600">+20.1%</span>   // 错：裸色值
```

组件选型速查：表单输入 `Input`/`Select`/`Combobox`/`Switch`/`Checkbox`/`RadioGroup`；2–5 选项 `ToggleGroup`；弹层 `Dialog`(模态)/`Sheet`(侧栏)/`Drawer`(底部)/`AlertDialog`(确认)；反馈 `sonner`(toast)/`Alert`/`Progress`/`Skeleton`/`Spinner`；空状态 `Empty`；图表 `Chart`(包 Recharts)；命令面板 `Command` 套在 `Dialog` 里。

## 注意事项

以下约束**始终强制**：

- **样式（Tailwind）**：`className` 只管布局不改组件颜色/排版；禁用 `space-x-*`/`space-y-*`，用 `flex` + `gap-*`；宽高相等用 `size-*`；截断用 `truncate`；禁手写 `dark:` 色值覆盖，用语义 token（`bg-background`、`text-muted-foreground`）；条件 class 用 `cn()`；遮罩类组件（Dialog/Sheet/Popover）禁手动 `z-index`。
- **表单**：布局用 `FieldGroup` + `Field`；`InputGroup` 内用 `InputGroupInput`/`InputGroupTextarea`；输入框内按钮用 `InputGroup` + `InputGroupAddon`；2–7 个选项用 `ToggleGroup`；相关 checkbox/radio 分组用 `FieldSet` + `FieldLegend`。
- **组合结构**：Item 必须在对应 Group 内（`SelectItem`→`SelectGroup` 等）；自定义触发器按 `base` 字段用 `asChild`(radix) 或 `render`(base)；`Dialog`/`Sheet`/`Drawer` 必须有 Title（无障碍，视觉隐藏用 `className="sr-only"`）；Card 用完整组合（Header/Title/Description/Content/Footer）；Button 没有 `isPending`/`isLoading`，用 `Spinner` + `data-icon` + `disabled` 组合；`TabsTrigger` 必在 `TabsList` 内；`Avatar` 必带 `AvatarFallback`。
- **优先用组件而非自定义标记**：Callout 用 `Alert`、空态用 `Empty`、toast 用 `sonner`、分隔用 `Separator`(非 `<hr>`)、加载占位用 `Skeleton`(非 `animate-pulse` div)、标签用 `Badge`。
- **图标**：Button 内图标加 `data-icon="inline-start"/"inline-end"`；组件内图标不加尺寸 class（组件用 CSS 自管）；图标以对象传入（`icon={CheckIcon}`，非字符串）。

## 互见

- 源技能含分文件规则：`rules/forms.md`、`rules/composition.md`、`rules/icons.md`、`rules/styling.md`、`rules/base-vs-radix.md`、`cli.md`、`customization.md`，需要边角案例时回查原仓库。
- 前端研发域内其他技能：组件文档抓取可配合通用 WebFetch；主题与 CSS 变量定制见原 `customization.md`。

---

采编自 sickn33/antigravity-awesome-skills（MIT），上游源：shadcn-ui/ui 仓库 skills/shadcn。
