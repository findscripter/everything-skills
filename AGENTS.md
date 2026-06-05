<!-- 本文件由 scripts/build-index.mjs 自动生成，请勿手改。 -->
# 技能大典 · Everything Skills —— AI Agent 使用指南

本仓库是面向 AI Agent 的技能库：**1108 条 `SKILL.md` 技能**，按 11 卷功能域组织在 `00-meta/` … `10-platform/` 目录下（非单一 `skills/` 目录）。

## 如何发现技能
- Agent 按每条技能 frontmatter 的 `description` 字段匹配是否加载——不靠浏览目录。
- 人工浏览：`INDEX/catalog.md`（按卷/类总目）、`INDEX/tags.md`（标签）、`INDEX/graph.md`（互见关系图）。
- 机读召回：`INDEX/search.json`（name/description/triggers/domain 扁平记录，供"先粗筛域/标签、再按 description 精排"的两段式发现）。

## 如何使用一条技能
进入该技能文件夹，读取其 `SKILL.md` 并遵循「## 步骤 / 指令」。每条技能单一职责、自包含。

## 安装（Claude Code 插件市场）
```
/plugin marketplace add findscripter/everything-skills
```
11 卷对应 11 个插件，可整库或按卷安装。

## 技能间关系
通过 frontmatter 的 `requires`(依赖) / `related`(相关) / `combines_with`(组合) 表达，汇总于 `INDEX/graph.md`。

## 许可
精选改编的合集，逐条许可见各 `SKILL.md` 的 `source_license` 与 `INDEX/sources.md`；总说明见 `LICENSE` 与 `NOTICE`。
