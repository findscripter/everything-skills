# 技能仓库总目

本文件只收录 GitHub 上的技能库/市场/精选列表，依据各库 README 摘要，不收录对方源码，也不复制对方 SKILL.md 正文。

标注哪些已被 [findscripter/everything-skills](https://github.com/findscripter/everything-skills) 采编进技能正文（见 INDEX/sources.md）。

- 编制日期：2026-09-19（Asia/Shanghai）；日常增量索引 part58
- Stars：GitHub Search API 当日快照，非估算
- 收录条数：1712 个独立仓库（另注明更名别名）
- 读取方式：GitHub API 读各库 README；未 clone 任何第三方仓库

## 检索与截断

只收 SKILL.md 集合、插件市场、awesome-*-skills、官方目录、垂直技能包、注册表与安装器；也收仓库名不含 skill/agent、但 README 证明可安装的技能包。不倾销 topic:agent-skills。未读到 README 的不入表。

检索覆盖：GitHub topic/org/code search、skills.sh、ClawHub、HN/Reddit/V2EX/即刻/小红书、awesome 外链、`npx skills add`、`.claude-plugin/marketplace.json`。

### 更名与后继

- sickn33/antigravity-awesome-skills → sickn33/agentic-awesome-skills
- affaan-m/everything-claude-code → affaan-m/ECC
- ComposioHQ/awesome-codex-skills → composio-community/awesome-codex-skills
- 1102tools/federal-contracting-skills → 1102tools-dev/federal-contracting-skills

### 永久剔除

- mukul975/Anthropic-Cybersecurity-Skills（攻击包）

## 字段

- `summary`：English one-line blurb（目录英文版）
- `summary_zh`：Chinese one-line blurb（原摘要迁入；目录中文版优先）
- README：`node scripts/refresh-readme-skill-repos-directory.mjs --lang=en|zh`
