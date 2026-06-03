---
name: vexor-semantic-file-search
title: Vexor 语义文件检索：定位代码实现位置
description: 当在中大型仓库中按意图（功能/作用）查找文件而非精确文件名或文本时使用；用 vexor 做语义检索，产出按相似度排序的文件路径、行号与片段预览；不适用于精确字符串匹配（用 grep）或需环境内验证/测试的场景；触发词：定位实现、语义检索、找文件、vexor
domain: 平台/cli
triggers: [定位实现在哪, 找到某功能的代码文件, 语义文件检索, 不确定文件位置, vexor, 按意图找文件, config loader 在哪, 查认证流程文档]
tags: [代码检索, 语义搜索, vexor, cli工具, 代码导航, 文件定位]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [vexor]
requires: []
related: [vexor-vector-cli-setup, codebase-structure-protocol, monorepo-navigator]
combines_with: [codebase-onboarding-doc, vexor-vector-cli-setup]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 想按「意图/功能」而非精确文件名或文本匹配来定位文件：某功能在哪里实现、在哪里加载、在哪里定义或被文档描述。
- 仓库较大，手工浏览或裸 `grep` 太慢或太含糊。
- 优先于人工翻目录：先用 `vexor` 做意图检索，再下钻确认。

不该用的边界：
- 已知精确字符串/正则要匹配时，用 `grep`/`rg` 更快更准，别用语义检索。
- 检索结果只是定位线索，不能替代环境内的实际验证、测试或专家审查。
- 缺少必要输入、权限、安全边界或成功标准时，先停下来向用户澄清，不要硬猜。

## 步骤

1. 确认 `vexor` 已安装；若缺失，按 `references/install-vexor.md`（源仓库）安装，或运行 `vexor doctor` / `vexor config --show` 排查 API、缓存与连通性。
2. 用一句话描述「你要找的东西做什么」作为 query（描述意图，不是文件名）。
3. 选最省的 `--mode`（见下「模式」），按需用 `--path` 限定根目录、`--ext` 限定扩展名、`--exclude-pattern` 排除目录。
4. 首次检索会建立索引（可能耗时约一分钟，必要时调长超时）；后续检索很快。
5. 读取结果：相似度排序 + 精确文件路径 + 行号 + 匹配片段预览，挑最相关项下钻。

## 指令

```bash
vexor "<QUERY>" [--path <ROOT>] [--mode <MODE>] [--ext .py,.md] \
  [--exclude-pattern <PATTERN>] [--top 5] [--format rich|porcelain|porcelain-z]
```

常用参数：
- `--path/-p`：根目录（默认当前目录）
- `--mode/-m`：索引/检索策略（见下）
- `--ext/-e`：限定扩展名，如 `.py,.md`
- `--exclude-pattern`：按 gitignore 风格排除路径，可重复；`.js` 会展开为 `**/*.js`
- `--top/-k`：返回结果数
- `--include-hidden`：包含点文件
- `--no-respect-gitignore`：包含被忽略的文件
- `--no-recursive`：仅检索顶层目录
- `--format`：`rich`（默认）；脚本用 `porcelain`（TSV）或 `porcelain-z`（NUL 分隔）
- `--no-cache`：仅内存，不读写索引缓存

模式（挑能用的最省的）：
- `auto`：按文件类型自动路由（默认）
- `name`：仅文件名（最快）
- `head`：仅首部若干行（快）
- `brief`：关键词摘要（适合 PRD）
- `code`：对 `.py/.js/.ts` 做代码感知分块（代码库的最佳默认）
- `outline`：按 Markdown 标题/章节（文档最佳）
- `full`：分块整文件内容（最慢、召回最高）

## 示例

```bash
# 找 CLI 入口/命令
vexor search "typer app commands" --top 5
```

```bash
# 按标题/章节检索文档
vexor search "user authentication flow" --path docs --mode outline --ext .md --format porcelain
```

```bash
# 定位配置加载/校验逻辑
vexor search "config loader" --path . --mode code --ext .py
```

```bash
# 排除测试和 JS 文件
vexor search "config loader" --path . --exclude-pattern tests/** --exclude-pattern .js
```

## 注意事项

- 首次检索建索引较慢、之后很快；必要时用更长的超时。
- 需要被忽略或隐藏的文件时，加 `--include-hidden` 和/或 `--no-respect-gitignore`。
- 脚本化消费输出用 `--format porcelain`（TSV）或 `porcelain-z`（NUL 分隔）。
- `--ext` 与 `--exclude-pattern` 可叠加：先选子集再在其上应用排除规则。
- 详细帮助：`vexor search --help`；配置/连通性问题：`vexor doctor` 或 `vexor config --show`。

## 互见

- `grep`/`rg`：精确字符串或正则匹配时改用，与本技能形成「语义定位 → 精确匹配」的配合。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
