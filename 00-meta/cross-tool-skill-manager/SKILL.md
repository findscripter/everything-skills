---
name: cross-tool-skill-manager
title: 跨工具技能管理：在 11 个工具间增删改技能
description: 当需在多个 AI 编码工具（Cursor/Claude/Agents/Windsurf/Copilot/Codex/Cline/Aider/Continue/Roo/Augment）间查看、新建、编辑、启停、复制、移动或删除本地技能与规则文件时使用；产出针对各工具正确路径与格式的命令操作；不适用于工具私有只读插件缓存或线上技能市场。触发词：管理技能、跨工具复制技能、列出我的技能。
domain: 通用/communication
triggers: [管理技能, 列出我的技能, 新建一个技能, 把技能复制到X工具, 禁用/启用技能, 跨工具同步规则文件, 在 Cursor/Claude/Windsurf 间迁移技能]
tags: [技能管理, ai编码工具, cursor, claude, windsurf, 规则文件, 跨工具, 文件操作]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [ls/dir, cat, mkdir, cp, mv, rm, find, grep]
requires: []
related: [skill-creator, skill-optimizer, skill-ecosystem-auditor, agents-md-maintainer]
combines_with: [agent-skill-security-scanner, claude-command-selector]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当用户要在多款 AI 编码工具间统一管理本地技能 / 规则文件时使用：查看、列举、新建、编辑、启用、禁用、复制、移动、删除，或在工具间迁移并适配格式。

覆盖 11 个工具，分三类：

- **目录型（每技能一个子目录，含 `SKILL.md`，带 YAML frontmatter）**：Agents、Cursor、Claude。
- **目录型（纯 `.md`，frontmatter 可选）**：Windsurf、Cline、Continue、Roo Code。
- **单文件型（整文件即配置，编辑=整体替换）**：Copilot、Codex、Aider、Augment。

不该用的边界：
- 不要编辑 Cursor 插件缓存（`~/.cursor/plugins/cache/...`）——由 Cursor 托管、只读。
- 不覆盖线上技能市场 / 远程仓库的安装与发布，仅管理本地文件。
- 删除等破坏性操作前必须先与用户确认；缺少必要输入、权限或成功标准时停下来澄清。

## 路径速查

全局路径用 `~/`，项目路径去掉 `~/`（同名时项目作用域覆盖全局）。

目录型（`<name>` 为 kebab-case）：

| 工具 | 全局路径 |
|------|----------|
| Agents | `~/.agents/skills/<name>/SKILL.md` |
| Cursor | `~/.cursor/skills/<name>/SKILL.md` |
| Claude | `~/.claude/skills/<name>/SKILL.md` |
| Windsurf | `~/.windsurf/rules/<name>/<name>.md` |
| Cline | `~/.cline/rules/<name>/<name>.md` |
| Continue | `~/.continue/rules/<name>/<name>.md` |
| Roo Code | `~/.roo/rules/<name>/<name>.md` |

单文件型：

| 工具 | 全局 | 项目 |
|------|------|------|
| Copilot | `~/.github/copilot-instructions.md` | `.github/copilot-instructions.md` |
| Codex | `~/.codex/AGENTS.md` | `.codex/AGENTS.md` |
| Aider | `~/.aider.conf.yml` | `.aider.conf.yml` |
| Augment | `~/augment-guidelines.md` | `augment-guidelines.md` |

## 步骤

1. **辨清工具与作用域**：确定目标工具属于上面哪一类、用全局还是项目路径。
2. **匹配文件格式**：SKILL.md（带 frontmatter）/ 纯 .md / 单文件整体替换，三选一。
3. **执行操作**：按下方指令增删改查；跨工具迁移时同步调整文件命名与格式。
4. **破坏性操作前确认**：删除 / 覆盖前先与用户确认。

## 指令

SKILL.md frontmatter 模板（Agents / Cursor / Claude）：

```markdown
---
name: skill-name
description: Brief description of what this skill does
---

# Skill Name

Skill instructions go here.
```

列举与计数：

```bash
ls ~/.cursor/skills/        # 列某工具的技能
echo "Cursor: $(ls ~/.cursor/skills/ 2>/dev/null | wc -l | tr -d ' ')"   # 计数
test -f ~/.codex/AGENTS.md && echo "Codex: exists" || echo "Codex: not found"  # 单文件型探测
```

新建：

```bash
# 目录型（SKILL.md）
mkdir -p ~/.agents/skills/my-new-skill
cat > ~/.agents/skills/my-new-skill/SKILL.md << 'EOF'
---
name: my-new-skill
description: What this skill does
---

# My New Skill

Instructions for the agent go here.
EOF

# 目录型（纯 .md：Windsurf/Cline/Continue/Roo）
mkdir -p ~/.windsurf/rules/my-new-rule
cat > ~/.windsurf/rules/my-new-rule/my-new-rule.md << 'EOF'
# My New Rule

Instructions go here.
EOF
```

启用 / 禁用（禁用=改名为 `.disabled`，保留内容、工具忽略）：

```bash
mv ~/.cursor/skills/my-skill/SKILL.md ~/.cursor/skills/my-skill/SKILL.md.disabled   # 禁用
mv ~/.cursor/skills/my-skill/SKILL.md.disabled ~/.cursor/skills/my-skill/SKILL.md   # 启用
```

复制 / 移动 / 删除 / 提到项目作用域：

```bash
cp -r ~/.cursor/skills/my-skill ~/.claude/skills/my-skill        # 同格式工具间复制
mv ~/.cursor/skills/my-skill ~/.agents/skills/my-skill           # 移动
rm -rf ~/.cursor/skills/my-skill                                  # 删除（先确认！）
cp -r ~/.cursor/skills/my-skill .cursor/skills/my-skill          # 全局 -> 项目
```

搜索与排障：

```bash
# 跨工具按名列出全部技能目录
find ~/.agents/skills ~/.cursor/skills ~/.claude/skills ~/.windsurf/rules ~/.cline/rules ~/.continue/rules ~/.roo/rules -maxdepth 1 -type d 2>/dev/null | sort
# 按内容搜
grep -rl "search term" ~/.agents/skills/ ~/.cursor/skills/ ~/.claude/skills/ 2>/dev/null
# 找出被禁用的技能
find ~/.agents/skills ~/.cursor/skills ~/.claude/skills -name "*.disabled" 2>/dev/null
```

## 示例

跨格式迁移（Agents 的 SKILL.md -> Windsurf 纯 .md，需改文件名）：

```bash
mkdir -p ~/.windsurf/rules/my-skill
cp ~/.agents/skills/my-skill/SKILL.md ~/.windsurf/rules/my-skill/my-skill.md
```

要点：目标是 `rules/<name>/<name>.md` 而非 `SKILL.md`；frontmatter 在 Windsurf 可选，可保留也可删去。

## 注意事项

- 删除技能前务必与用户确认。
- 跨工具复制遇到格式不同（如 Cursor 的 `SKILL.md` -> Windsurf 纯 `.md`）时，要同步调整文件命名。
- 项目作用域同名技能覆盖全局技能。
- 单文件型工具（Copilot/Codex/Aider/Augment）「编辑」即整文件替换，没有逐技能粒度。
- 新建技能目录名用 kebab-case（如 `my-new-skill`）。
- 不要直接改 Cursor 插件缓存目录（只读、由 Cursor 托管）。
- Windows 下 `ls/cat/mkdir/cp/mv/rm/find/grep` 对应 `Get-ChildItem/Get-Content/New-Item/Copy-Item/Move-Item/Remove-Item`，路径分隔符与 `~` 展开需相应调整。

## 互见

- 各工具自身的技能编写规范文档（frontmatter 字段、激活机制）。
- 本仓库「技能创建 / Skill Maker」类条目（如何写一条高质量技能）。

---
采编自 sickn33/antigravity-awesome-skills（原 `manage-skills`，上游 umutbozdag/agent-skills-manager），遵循 MIT 许可。
