# 技能仓库总目

本文件只收录 GitHub 上的技能库/市场/精选列表，依据各库 README 摘要，不收录对方源码，也不复制对方 SKILL.md 正文。

标注哪些已被 [findscripter/everything-skills](https://github.com/findscripter/everything-skills) 采编进技能正文（见 INDEX/sources.md）。

- 编制日期：2026-09-02（Asia/Shanghai）
- Stars：GitHub Search API 当日快照，非估算
- 收录条数：134 个独立仓库（另注明更名别名）
- 读取方式：GitHub API 读各库 README；未 clone 任何第三方仓库

## 检索方法与截断规则

GitHub topic agent-skills 命中两万以上仓库，本目录不倾销该 topic。只收 SKILL.md 集合、插件市场、awesome-*-skills、官方目录、垂直技能包、注册表与安装器。也收仓库名不含 skill/agent、但 README 证明是可安装技能包的库。

### 使用过的检索式
1. topic:agent-skills stars-gt-100
2. awesome agent skills in name and description
3. awesome-claude-skills OR awesome-agent-skills OR awesome-codex-skills in:name
4. openai/skills, vercel-labs/skills, agentskills/agentskills, anthropics/skills
5. topic:claude-skills stars-gt-50
6. marketplace, skill registry, skillhub, skills.sh
7. seed-name lookups for renamed and official catalogs
8. topic:agent-skills awesome-list stars-gt-80
9. org:anthropics skills or plugins or cookbooks
10. topic:agent-skills stars-gt-500 page 2
11. seed list user and in:name lookups
12. follow-up README reads for NVIDIA, Microsoft, Matt Pocock, Obsidian, PM, Orchestra, Skill Seekers, SkillSpector, k12, community plugins, aaron marketing
13. claude-plugin marketplace
14. "npx skills" OR skills.sh
15. filename:SKILL.md
16. Claude 技能库 / 技能包 / 智能体技能
17. names that are skills without saying so: ponytail, caveman, gstack, graphify, planning-with-files
18. awesome skills in:name
19. "npx skills" / skills.sh / "plugin marketplace" claude
20. Cowork / opencode / antigravity skills
21. filename:marketplace.json ".claude-plugin"
22. org:google|huggingface|cloudflare|expo|makenotion skills; org:microsoft SkillOpt|azure-skills|waza|power-platform|skills-for-fabric
23. 技能库/技能包; seed names baoyu-skills, tons-of-skills-marketplace, finance-skills, next-skills, compound-engineering-plugin, awesome-codex-plugins, awesome-hermes-agent
24. topic:agent-skills stars:200..2000 collection OR pack OR kit OR marketplace
25. skills.sh homepage All Time leaderboard
26. HN Show HN skill packs (Recursive-Mode)
27. 少数派 / V2EX / 掘金 / 即刻 / 卡兹克公众号 / DEV HyperFrames
28. retry unread READMEs from prior catalog pass
29. unnamed-style high-star: taste / impeccable / hyperframes / archify / humanizer / diagram-design / distilly / baoyu-design
30. official vendor CLIs and skill packs: larksuite/cli, googleworkspace/cli, prisma, supabase, firebase, remotion, dotnet, SenseNova
31. topic:agent-skills created:>2026-06-01 stars:>200

### 截断规则

官方仓库一律收录。everything-skills INDEX/sources.md 的 18 个已采编来源一律收录（不论星标）。未读到 README 的仓库不进入分表。排除仅挂 topic 的应用产品、CS 学习路线图。

### 更名与后继

- sickn33/antigravity-awesome-skills 现为 sickn33/agentic-awesome-skills（AAS Core）
- affaan-m/everything-claude-code 现为 affaan-m/ECC
- ComposioHQ/awesome-codex-skills 现为 composio-community/awesome-codex-skills
- aaron-he-zhu/seo-geo-claude-skills 为路标仓，技能在 aaron-he-zhu/aaron-marketing-skills（旧 20 技能冻结于 tag v9.9.12）
- openai/skills 已弃用，现行示例在 openai/plugins
- vercel-labs/next-skills 是路标仓，技能已迁入 vercel/next.js 的 skills/

### 已采编来源（everything-skills INDEX/sources.md）

anthropics/skills, wshobson/agents, sickn33/antigravity-awesome-skills（现 agentic-awesome-skills）, alirezarezvani/claude-skills, affaan-m/everything-claude-code（现 ECC）, coreyhaines31/marketingskills, voidful/academic-skills, jaechang-hits/SciAgent-Skills, K-Dense-AI/scientific-agent-skills, trailofbits/skills, OctagonAI/skills, aaron-he-zhu/seo-geo-claude-skills, tradermonty/claude-trading-skills, aklofas/kicad-happy, anthropics/financial-services, anthropics/knowledge-work-plugins, anthropics/claude-for-legal, jeffallan/claude-skills

---

## 1. 官方与权威

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | 173,110 | Anthropic 官方 Agent Skills 示例与文档技能；marketplace 源 anthropics/skills。 | Apache-2.0 | 采编 12 | 已采编 |
