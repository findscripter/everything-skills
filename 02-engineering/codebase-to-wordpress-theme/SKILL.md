---
name: codebase-to-wordpress-theme
title: 代码库转 WordPress 主题
description: 当把 React/Next.js/HTML 前端转成像素级一致、SEO 不丢失的 WordPress 主题，或审计已有转换的结构与 SEO 缺陷时使用；做四阶段取证式比对与改造，产出保留原 DOM/类名、接入动态菜单与 ACF 的 PHP 主题模板；不适用于纯静态托管、不接 WordPress CMS、或允许重排版改类名的场景；触发词：转 WordPress 主题、像素级一致、ACF、wp_nav_menu、SEO 保留
domain: 研发/frontend
triggers: [转 WordPress 主题, React 转 WP, Next.js 转主题, HTML 转主题, 像素级一致, pixel-perfect 转换, ACF 字段映射, wp_nav_menu 保留类名, WordPress 模板拆分, get_template_directory_uri, 主题 SEO 保留, WordPress 转换审计, header.php footer.php, 动态菜单不破结构]
tags: [wordpress, 主题开发, php, react, tailwind, acf, seo, 前端迁移, 研发]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [php, wordpress, acf, tailwindcss]
requires: []
related: [frontend-design, php-pro, accessibility-wcag-audit, i18n-localization-patterns]
combines_with: [seo-audit, technical-seo-checker, schema-markup-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 代码库转 WordPress 主题

把静态或 React 前端高保真转成 CMS 驱动的 WordPress 主题。核心约束是「UI 绝对锁定」：像素级一致优先于代码整洁。

## 何时使用
- 把 React（CRA/Vite/Next.js）或 HTML 项目转成 WordPress 主题。
- 客户要求与原始来源 100% 像素级一致。
- 审计已有 WordPress 转换的结构 / SEO / 可编辑性缺陷。
- 要确保技术 SEO（Schema、Meta、标题层级 H1-H6）原样保留。

不该用：纯静态托管、无需接入 WordPress CMS、或项目允许重排版 / 改类名「顺手清理代码」的场景——本技能的前提就是不许动 UI。

## 步骤
按 4 阶段取证流程推进，**每阶段只做该阶段的事，不允许越界修复**：

1. **取证式 UI 比对**：识别源码全部组件，建「原始输出 vs WordPress 输出」并排对照表，逐项标差异。本阶段只检测、零修复。
2. **全面审计**：深查 UI、SEO、CMS 可编辑性、导航、功能、性能六个维度。
3. **行动计划**：每个任务分级为 SAFE / RISKY / BLOCKED，防止改坏 UI。
4. **迭代修复**：一次只做一个 SAFE 任务，每步做完立即验证。维护 Live Tracker（总问题数 / 已修 / 剩余），每次修复后确认：✅ 无 UI 变化 ✅ 无 DOM 变化 ✅ 无 class 变化。

### 改造指令
- **字段映射**：静态文案 → `the_title()` / `get_field()` / `the_content()`；静态路径 → `get_template_directory_uri()`。
- **核心钩子**：`header.php` 在 `</head>` 前调 `wp_head()`，`footer.php` 在 `</body>` 前调 `wp_footer()`；页面模板调 `get_header()` / `get_footer()`；用 `register_nav_menus()` 注册动态导航。
- **UI 绝对锁定**：不改布局/间距/字体/配色；原样保留 Tailwind / CSS 类名；零改动 DOM 结构与 HTML 嵌套。

## 示例

导航转换 —— 用自定义 Walker 保留原 Tailwind 结构，而非套默认包裹层：
```php
// 错误：默认替换会加 <div>/<ul> 包裹层
wp_nav_menu(['theme_location' => 'primary']);

// 正确：保留原类名与结构
wp_nav_menu([
    'theme_location' => 'primary',
    'container'      => false,
    'items_wrap'     => '<ul class="flex space-x-8">%3$s</ul>',
    'walker'         => new Custom_Tailwind_Walker()
]);
```

资源路径转换：
```php
// 源：<img src="/images/logo.png" />
<img src="<?php echo get_template_directory_uri(); ?>/assets/images/logo.png" alt="Logo" />
```

## 注意事项
- ✅ 内部链接用 `get_page_by_path()` 更稳健；`functions.php` 里给 ACF 字段配回退默认值；Tailwind 配置放 `header.php` 确保全局样式生效。
- ❌ 不要加 `div` 包裹层或重命名类名去「清理代码」；不要套与原设计冲突的 WordPress 默认样式。
- 产物不能替代环境内的真实校验、测试与人工评审；缺输入 / 权限 / 安全边界 / 验收标准时先停下来问清。
- 参考：ACF 文档、Tailwind in WordPress、WordPress Theme Handbook。

## 互见
- related：`php-pro` —— 主题模板与 `functions.php` 的 PHP 进阶写法
- related：`tailwind-css-patterns` —— 保留并复用原 Tailwind 类
- combines_with：`frontend-design` —— 比对原始前端设计、保证像素级一致

---
采编自 sickn33/antigravity-awesome-skills（MIT），适配重写为中文。
