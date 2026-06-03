---
name: obsidian-clipper-templates
title: Obsidian 网页剪藏模板
description: 当需要为 Obsidian Web Clipper 制作/打磨可导入 JSON 剪藏模板（含变量、过滤器、条件/循环逻辑、触发器、属性字段映射）时使用；产出经选择器实证校验、可直接复制导入的模板 JSON；不适用于剪藏插件本身的安装运维、非 Obsidian 笔记工具或凭空猜测 DOM 选择器；触发词：Obsidian 剪藏、Web Clipper 模板、剪藏 JSON、selector 变量、schema.org 剪藏
domain: 协作/knowledge
triggers: [Obsidian 网页剪藏, Web Clipper 模板, 剪藏模板 JSON, Obsidian Clipper, selector 变量, schema.org 剪藏, noteContentFormat, 剪藏属性映射]
tags: [obsidian, web-clipper, 知识管理, 模板, json, css-selector, schema-org, 网页剪藏]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [WebFetch, Read, 浏览器 DOM 快照]
requires: []
related: [obsidian-bases-builder, defuddle-web-extract, citation-management, bullet-point-structurer]
combines_with: [filesystem-context-offload, multi-source-knowledge-synthesis]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要为 **Obsidian Web Clipper** 创建或打磨一份可导入的 JSON 剪藏模板。
- 要把某站点的真实 DOM、Schema.org 结构化数据、Meta 标签、CSS 选择器映射成合法的剪藏模板。
- 交付模板前需要做选择器实证校验与模板逻辑（条件/循环/变量赋值/回退）设计。

**不该用边界（负边界）：**
- 不负责剪藏插件本身的安装、授权、同步运维。
- 不适用于非 Obsidian 的笔记/剪藏工具（如 Notion Web Clipper）。
- **严禁凭空猜测选择器**——拿不到 DOM 就停下来要 URL 或截图，不要硬编。

## 步骤

1. **判定意图**：是特定站点（如 YouTube）、特定类型（如食谱 Recipe），还是通用剪藏？
2. **复用已有 Base**：用户常在 `Bases/` 下定义了 Base schema。读取 `Bases/*.base` 找匹配类目（如 `Recipes.base`），用 Base 里的属性来组织模板的 `properties` 字段。
3. **抓取并分析参考 URL（必做）**：向用户索取一个样例 URL；用 **WebFetch** 取页面内容，WebFetch 不可用则改用浏览器 DOM 快照；分析 HTML 中的 Schema.org JSON、Meta 标签与 CSS 选择器。
4. **逐一校验选择器（必做）**：每个选择器都要对照抓取到的真实内容核验；无法核验就明说，并请用户换 URL。
5. **起草 JSON**：按下文 Schema 写出合法 JSON 对象。
6. **按需加逻辑**：仅在能改善模板时使用条件（可选块）、循环（列表数据）、变量赋值（避免重复长表达式）、回退（缺值兜底）；简单模板保持简单。
7. **输出可导入 JSON**：始终以 JSON 代码块交付，供用户复制导入；剪藏编辑器会做语法校验。

## 指令

**根结构与字段：**

```json
{
  "schemaVersion": "0.1.0",
  "name": "模板名",
  "behavior": "create",
  "noteContentFormat": "正文，用 \\n 换行，可用全部变量与模板逻辑",
  "properties": [],
  "triggers": [],
  "noteNameFormat": "{{title}}",
  "path": "Inbox/"
}
```

- `schemaVersion`：恒为 `"0.1.0"`。
- `behavior`：`create`（新建笔记，`path` 为文件夹）/ `append-specific`（追加到指定笔记，`path` 为完整文件路径）/ `append-daily`（追加到日记）。
- `triggers`：自动选中该模板的数组，支持 URL 模式（字符串或正则，如 `"https://www.youtube.com/watch"`）与 Schema 类型（如 `"schema:Recipe"`）。
- `properties`：每项 `{name, value, type}`，`type` ∈ `text | multitext | number | checkbox | date | datetime`；`value` 可含变量与逻辑。

**变量四类：**
- 预设：`{{title}}` `{{content}}` `{{url}}` `{{author}}` `{{published}}` `{{selection}}` `{{image}}` 等。
- 选择器：`{{selector:css}}` 取文本，`{{selector:img.hero?src}}` 取属性，`{{selectorHtml:body|markdown}}`。
- Meta：`{{meta:description}}` `{{meta:og:title}}`。
- Schema.org：`{{schema:Recipe:recipeIngredient}}` `{{schema:author.name}}`。
- AI 提示变量（需启用 Interpreter）：`{{"用 3 个要点总结"}}`。

**常用过滤器**（`{{变量|过滤器}}`）：`markdown` `list` `table` `join:","` `first` `last` `map:item =>> item.text` `wikilink` `date:"YYYY-MM-DD"` `safe_name`。

## 示例

食谱模板（Schema 触发 + 循环 + 过滤器）：

```json
{
  "schemaVersion": "0.1.0",
  "name": "Recipe",
  "behavior": "create",
  "noteContentFormat": "![{{schema:Recipe:image|first}}]\n\n## 食材\n{{schema:Recipe:recipeIngredient|list}}\n\n## 步骤\n{{schema:Recipe:recipeInstructions|map:step =>> step.text|list}}",
  "properties": [
    { "name": "author", "value": "[[{{schema:Recipe:author.name}}]]", "type": "text" },
    { "name": "source", "value": "{{url}}", "type": "text" },
    { "name": "ingredients", "value": "{{schema:Recipe:recipeIngredient}}", "type": "multitext" }
  ],
  "triggers": ["schema:Recipe"],
  "noteNameFormat": "{{schema:Recipe:name}}",
  "path": "Recipes/"
}
```

## 注意事项

- **选择器实证优先**：响应前必对照真实页面核验；元素缺失或 DOM 取不到，就要换 URL/截图，绝不猜测。
- **优先稳定选择器**：data 属性、语义化 role、唯一 ID 优于脆弱的多层 class 链。
- **在推理中标注目标元素**（如「关于侧栏段落」）以降低错配。
- **逻辑语法**须遵循官方 [Logic](https://help.obsidian.md/web-clipper/logic) 文档，否则剪藏模板编辑器会校验报错。
- 逻辑（条件/循环/赋值/回退）在 1.0.0 起对 `noteContentFormat` 与属性 `value` 字段均生效。

## 互见

- 官方文档：[Variables](https://help.obsidian.md/web-clipper/variables) / [Filters](https://help.obsidian.md/web-clipper/filters) / [Logic](https://help.obsidian.md/web-clipper/logic) / [Templates](https://help.obsidian.md/web-clipper/templates)
- 同卷（07-协作/知识管理）：网页内容抓取与分析、结构化数据提取类技能。

---
*采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT），适配重写为中文技能大典条目。*
