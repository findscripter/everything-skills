---
name: obsidian-bases-builder
title: Obsidian Bases 数据库视图
description: 当在 Obsidian 中需要把笔记按属性聚合成表格/卡片/列表视图时使用；编写并校验 .base（YAML）文件，定义过滤器、公式、汇总与多视图，产出可直接渲染的数据库视图；不适用于非 Obsidian 数据库或 Dataview 插件查询。触发词：.base、Bases、表格视图、卡片视图、过滤器、公式。
domain: 协作/knowledge
triggers: [创建 .base 文件, Obsidian Bases, 笔记表格视图, 卡片视图/画廊视图, 按 tag/文件夹/属性过滤笔记, 为笔记定义公式/汇总列, 嵌入 base 视图到笔记, .base YAML 报错排查]
tags: [obsidian, bases, 知识管理, yaml, 数据库视图, 笔记自动化]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [文本编辑器, Obsidian]
requires: []
related: [obsidian-clipper-templates, confluence-space-architect, notion-template-business, company-policy-lookup]
combines_with: [bullet-point-structurer, multi-source-knowledge-synthesis]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 在 Obsidian 中创建或编辑 `.base` 文件，把笔记聚合成类数据库视图（表格 / 卡片 / 列表 / 地图）。
- 需要按 tag、文件夹、frontmatter 属性或日期过滤笔记，并叠加公式列、汇总统计或分组。
- 用户明确提到 Obsidian Bases、`.base`、表格/卡片视图、过滤器或公式。

不该用的边界：
- 不要用于 Dataview / DataviewJS 查询（语法不同）、非 Obsidian 的数据库或电子表格。
- `.base` 仅是「视图」，不修改笔记本身的 frontmatter；要批量改属性请用其他手段。
- 地图视图依赖 latitude/longitude 属性与社区 Maps 插件，缺失时不可用。

## 步骤

1. 建文件：在 vault 中创建 `.base` 文件，内容为合法 YAML。
2. 定范围：用 `filters` 选定哪些笔记入表（按 tag / 文件夹 / 属性 / 日期）。
3. 加公式（可选）：在 `formulas` 段定义计算列。
4. 配视图：在 `views` 下添加一个或多个视图，用 `order` 指定显示哪些列及顺序。
5. 校验：确认 YAML 无语法错误；所有引用的属性与 `formula.X` 都已定义。常见坑：含特殊字符的字符串未加引号、公式内引号嵌套不匹配、`order` 引用了未在 `formulas` 中定义的公式。
6. 在 Obsidian 中打开 `.base` 验证渲染。若报 YAML 错误，回到引号规则排查。

## 指令

整体骨架（顶层 `filters` 作用于全部视图）：

```yaml
filters:                      # 全局过滤：单条字符串，或 and/or/not 递归对象
  and: []
formulas:                     # 计算属性，跨视图可用
  formula_name: 'expression'
properties:                   # 配置列显示名
  property_name: { displayName: "显示名" }
  formula.formula_name: { displayName: "公式列名" }
summaries:                    # 自定义汇总公式
  custom_name: 'values.mean().round(3)'
views:
  - type: table | cards | list | map
    name: "视图名"
    limit: 10                 # 可选：限制条数
    groupBy: { property: status, direction: ASC }   # 可选：分组
    filters: { and: [] }      # 视图级过滤
    order: [file.name, property_name, formula.formula_name]
    summaries: { property_name: Average }
```

过滤器（可全局或按视图）：

```yaml
filters: 'status == "done"'           # 单条
filters: { and: ['status == "done"', 'priority > 3'] }   # 全部满足
filters: { or: ['file.hasTag("book")', 'file.hasTag("article")'] }  # 任一满足
filters: { not: ['file.hasTag("archived")'] }            # 排除
# 可嵌套：or 下可再写 and / not 子对象
```

运算符：`==` `!=` `>` `<` `>=` `<=`，逻辑 `&&` `||` `!`。

三类属性：
- 笔记属性（frontmatter）：`note.author` 或直接 `author`。
- 文件属性：`file.name`、`file.basename`、`file.path`、`file.folder`、`file.ext`、`file.size`、`file.ctime`、`file.mtime`、`file.tags`、`file.links`、`file.backlinks`、`file.embeds`、`file.properties`。
- 公式属性：`formula.my_formula`。
- `this` 关键字：正文区指 base 文件本身；被嵌入时指嵌入它的文件；侧栏中指主区活动文件。

公式与常用函数：

```yaml
formulas:
  total: "price * quantity"                                  # 算术
  status_icon: 'if(done, "✅", "⏳")'                          # 条件
  created: 'file.ctime.format("YYYY-MM-DD")'                 # 日期格式化
  days_old: '(now() - file.ctime).days'                      # 距今天数
  days_until_due: 'if(due, (date(due) - today()).days, "")'  # 距截止天数（带空值守卫）
```

核心函数：`date(string)` 解析日期（`YYYY-MM-DD HH:mm:ss`）、`now()` 当前时刻、`today()` 今日零点、`if(cond, a, b?)`、`duration(string)`、`file(path)`、`link(path, display?)`。完整函数表见源仓库 `references/FUNCTIONS_REFERENCE.md`。

Duration 约束（关键）：两日期相减得到的是 Duration 而非数字，不支持直接 `.round()/.floor()/.ceil()`。必须先取数值字段（`.days/.hours/.minutes/.seconds/.milliseconds`）再做数字运算：

```yaml
"(date(due_date) - today()).days.round(0)"   # 正确
# "((date(due) - today()) / 86400000).round(0)"  # 错误：Duration 不支持先除后取整
```

日期加减的时长单位：`y/year`、`M/month`、`d/day`、`w/week`、`h/hour`、`m/minute`、`s/second`，如 `'now() + "1 day"'`、`'today() + "7d"'`。

默认汇总公式（用于 `summaries`）：数值类 `Average/Min/Max/Sum/Range/Median/Stddev`；日期类 `Earliest/Latest/Range`；布尔类 `Checked/Unchecked`；通用 `Empty/Filled/Unique`。

嵌入到 Markdown：`![[MyBase.base]]`，指定视图 `![[MyBase.base#View Name]]`。

## 示例

任务追踪 Base（过滤 + 公式 + 分组 + 汇总 + 多视图）：

```yaml
filters:
  and:
    - file.hasTag("task")
    - 'file.ext == "md"'
formulas:
  days_until_due: 'if(due, (date(due) - today()).days, "")'
  priority_label: 'if(priority == 1, "🔴 High", if(priority == 2, "🟡 Medium", "🟢 Low"))'
properties:
  formula.days_until_due: { displayName: "Days Until Due" }
  formula.priority_label: { displayName: Priority }
views:
  - type: table
    name: "Active Tasks"
    filters: { and: ['status != "done"'] }
    order: [file.name, status, formula.priority_label, due, formula.days_until_due]
    groupBy: { property: status, direction: ASC }
    summaries: { formula.days_until_due: Average }
  - type: table
    name: "Completed"
    filters: { and: ['status == "done"'] }
    order: [file.name, completed_date]
```

每日笔记索引（正则匹配文件名 + 派生列 + limit）：

```yaml
filters:
  and:
    - file.inFolder("Daily Notes")
    - '/^\d{4}-\d{2}-\d{2}$/.matches(file.basename)'
formulas:
  word_estimate: '(file.size / 5).round(0)'
  day_of_week: 'date(file.basename).format("dddd")'
views:
  - type: table
    name: "Recent Notes"
    limit: 30
    order: [file.name, formula.day_of_week, formula.word_estimate, file.mtime]
```

阅读清单可用卡片视图（`type: cards`，`order` 首项放封面图属性如 `cover`）；纯标题列表用 `type: list`。

## 注意事项

YAML 引号规则：
- 含双引号的公式整体用单引号包裹：`'if(done, "Yes", "No")'`。
- 普通字符串用双引号：`"My View Name"`。
- 含 `: { } [ ] , & * # ? | - < > = ! % @ \`` 等特殊字符的字符串必须加引号，例如 `displayName: "Status: Active"`（不可写裸的 `Status: Active`）。

常见公式错误：
- Duration 未取字段就调用数字函数 —— 先 `.days` 再 `.round()`。
- 缺空值守卫：属性可能在部分笔记不存在，用 `if(prop, ..., "")` 兜底，否则空值会报错。
- 引用未定义公式：`order` / `properties` 中每个 `formula.X` 都要在 `formulas` 中有对应定义，否则静默失效。

通用边界：仅在任务明确落在上述范围内时使用；输出不能替代在真实 Obsidian 环境中的验证；若缺少必要属性、权限或成功标准，先停下来澄清。

## 互见

- Obsidian 官方文档：Bases Syntax / Functions / Views / Formulas（help.obsidian.md/bases）。
- 完整函数参考：源仓库 `references/FUNCTIONS_REFERENCE.md`。

---

采编自 sickn33/antigravity-awesome-skills（MIT），原 skill `obsidian-bases`，源 https://github.com/kepano/obsidian-skills。
