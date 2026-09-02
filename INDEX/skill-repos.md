# 技能仓库总目

本文件只收录 GitHub 上的技能库/市场/精选列表，依据各库 README 摘要，不收录对方源码，也不复制对方 SKILL.md 正文。

标注哪些已被 [findscripter/everything-skills](https://github.com/findscripter/everything-skills) 采编进技能正文（见 INDEX/sources.md）。

- 编制日期：2026-09-02（Asia/Shanghai）
- Stars：GitHub Search API 当日快照，非估算
- 收录条数：61 个独立仓库（另注明更名别名）
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

### 截断规则

官方仓库一律收录。everything-skills INDEX/sources.md 的 18 个已采编来源一律收录（不论星标）。未读到 README 的仓库不进入分表。排除仅挂 topic 的应用产品、CS 学习路线图。

### 更名与后继

- sickn33/antigravity-awesome-skills 现为 sickn33/agentic-awesome-skills（AAS Core）
- affaan-m/everything-claude-code 现为 affaan-m/ECC
- ComposioHQ/awesome-codex-skills 现为 composio-community/awesome-codex-skills
- aaron-he-zhu/seo-geo-claude-skills 为路标仓，技能在 aaron-he-zhu/aaron-marketing-skills（旧 20 技能冻结于 tag v9.9.12）
- openai/skills 已弃用，现行示例在 openai/plugins

### 已采编来源（everything-skills INDEX/sources.md）

anthropics/skills, wshobson/agents, sickn33/antigravity-awesome-skills（现 agentic-awesome-skills）, alirezarezvani/claude-skills, affaan-m/everything-claude-code（现 ECC）, coreyhaines31/marketingskills, voidful/academic-skills, jaechang-hits/SciAgent-Skills, K-Dense-AI/scientific-agent-skills, trailofbits/skills, OctagonAI/skills, aaron-he-zhu/seo-geo-claude-skills, tradermonty/claude-trading-skills, aklofas/kicad-happy, anthropics/financial-services, anthropics/knowledge-work-plugins, anthropics/claude-for-legal, jeffallan/claude-skills

---

## 1. 官方与权威

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | 173,110 | Anthropic 官方 Agent Skills 示例与文档技能；marketplace 源 anthropics/skills。 | Apache-2.0 | 采编 12 | 已采编 |
| [agentskills/agentskills](https://github.com/agentskills/agentskills) | 24,957 | Agent Skills 开放规范（agentskills.io）：SKILL.md 格式与跨厂商可移植性。 | Apache-2.0 / CC-BY-4.0 文档 | 规范而非技能库 | 仅索引 |
| [openai/skills](https://github.com/openai/skills) | 25,342 | OpenAI 早期技能示例；README 标明已弃用，现行示例迁至 openai/plugins。 | 未强调 SPDX | 示例（已弃用） | 仅索引 |
| [openai/plugins](https://github.com/openai/plugins) | 5,334 | OpenAI 现行 Codex 插件/技能示例目录，接替 openai/skills。 | README 未单列 SPDX | 插件/技能示例 | 仅索引 |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 30,733 | Vercel 官方约 8 条可安装 Agent Skills。 | MIT | 约 8 | 仅索引 |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | 30,218 | Vercel npx skills CLI 与 skills.sh：向 70 余种编码代理安装 GitHub 技能仓的事实标准安装器。 | MIT | 安装器 | 仅索引 |
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 35,808 | Anthropic 维护的 Claude Code / Cowork 官方插件市场。 | 官方插件 | 官方插件目录 | 仅索引 |
| [anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community) | 3,221 | 社区插件市场只读镜像；经提交、安全扫描与审批后夜间同步。 | Apache-2.0 | 社区插件目录 | 仅索引 |
| [anthropics/financial-services](https://github.com/anthropics/financial-services) | 34,634 | Claude for Financial Services 官方技能/插件包。 | Apache-2.0 | 采编 51 | 已采编 |
| [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | 23,820 | 知识工作向 Cowork 插件（约 11 个角色插件）。 | README 未单列 SPDX | 11 插件 / 采编 77 条目 | 已采编 |
| [anthropics/claude-for-legal](https://github.com/anthropics/claude-for-legal) | 9,319 | Claude for Legal 官方技能：合同审查、法律研究与律所工作流。 | Apache-2.0 | 采编 54 | 已采编 |
| [anthropics/k12-teacher-skills](https://github.com/anthropics/k12-teacher-skills) | 462 | Claude for Teachers 配套 K-12 技能与评测，与 Learning Commons 合编。 | Apache-2.0 | 4 | 仅索引 |
| [github/awesome-copilot](https://github.com/github/awesome-copilot) | 38,538 | GitHub 官方 Awesome Copilot：自定义代理、指令、prompt 与技能精选。 | README 未单列 SPDX | 精选目录 | 仅索引 |
| [microsoft/skills](https://github.com/microsoft/skills) | 2,981 | 微软官方 Azure SDK / AI Foundry Agent Skills；Skill Explorer 宣称 175 条。 | MIT | 175 | 仅索引 |
| [NVIDIA/skills](https://github.com/NVIDIA/skills) | 3,174 | NVIDIA 官方已验证技能目录：Physical AI、仿真、CUDA-X、RAG。 | Apache-2.0 + CC-BY-4.0 | 持续增长的官方目录 | 仅索引 |

## 2. 精选列表 / 大集合

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 74,261 | Claude Skills 最大社区精选之一，README 收录 1000+ 技能条目。 | Apache-2.0 | 1000+ | 仅索引 |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 53,367 | Claude Code 生态 awesome：技能、斜杠命令、hooks、MCP、插件与工作流。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [VoltAgent/awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills) | 52,318 | 从 ClawHub 等汇总的 OpenClaw 技能精选，README 宣称 5200-5400+。 | README 未单列 SPDX | 5200+ | 仅索引 |
| [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills) | 45,854 | AAS Core：跨代理 SKILL.md 大集合（v16.5.0 宣称 2107 条）。原名 antigravity-awesome-skills。 | MIT | 2107 / 采编 448 | 已采编 |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 33,606 | 官方+社区 Agent Skills 手选目录，徽章宣称 1497+ 条。 | README 未单列 SPDX | 1497+ | 仅索引 |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | 24,796 | Claude Code 子代理精选 158+，相关但不是 SKILL.md 技能库。 | MIT | 158+ 子代理 | 仅索引 |
| [composio-community/awesome-codex-skills](https://github.com/composio-community/awesome-codex-skills) | 16,175 | Codex 技能 awesome 列表；种子名 ComposioHQ/awesome-codex-skills 已迁此仓。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | 14,934 | Claude Skills 社区 awesome 列表，按领域分类索引可安装技能仓。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [heilcheng/awesome-agent-skills](https://github.com/heilcheng/awesome-agent-skills) | 6,163 | Agent Skills 目录，配套站点 agent-skill.co。 | README 未单列 SPDX | 精选列表 | 仅索引 |

## 3. 垂直领域技能包

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [obra/superpowers](https://github.com/obra/superpowers) | 280,619 | 方法论技能包：TDD、头脑风暴、子代理驱动开发等可组合工程纪律。 | MIT | 方法论技能包 | 仅索引 |
| [affaan-m/ECC](https://github.com/affaan-m/ECC) | 245,944 | Everything Claude Code 后继：技能/代理/命令/钩子插件市场。原名 everything-claude-code。 | MIT | 插件市场 / 采编 31 | 已采编 |
| [mattpocock/skills](https://github.com/mattpocock/skills) | 244,460 | Matt Pocock 给真工程师的可组合技能：grill-me、TDD、架构深化、分诊与规格化。 | MIT | 工程+生产力约 25+ | 仅索引 |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | 91,569 | Addy Osmani 生产工程技能 25 条 + 9 条斜杠命令。 | MIT | 25 技能 + 9 命令 | 仅索引 |
| [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) | 47,713 | Obsidian 创始人维护：Markdown、Bases、JSON Canvas、CLI、Defuddle。 | MIT | 5 | 仅索引 |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 46,549 | 营销向 Agent Skills（内容、SEO、增长等），README 列出约 50 条。 | MIT | 约 50 / 采编 14 | 已采编 |
| [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | 41,900 | 科学计算技能库 v2.65.0：163 条技能 + 100+ 数据库/工具连接。 | MIT | 163 / 采编 41 | 已采编 |
| [wshobson/agents](https://github.com/wshobson/agents) | 39,345 | Claude Code 插件超集：94 插件、202 代理、183 技能、105 命令。 | MIT | 183 / 采编 29 | 已采编 |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | 25,399 | 企业级 Claude 技能/代理/工具包，README 宣称 388 技能、118 代理、13 工具。 | MIT | 388 / 采编 158 | 已采编 |
| [phuryn/pm-skills](https://github.com/phuryn/pm-skills) | 25,913 | 产品经理技能市场：9 插件、68 技能与 42 条链式工作流。 | MIT | 68 | 仅索引 |
| [Orchestra-Research/AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs) | 12,246 | AI 研究从选题到论文的开源技能库，README 宣称 98 条、23 个类别。 | MIT | 98 | 仅索引 |
| [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) | 11,292 | 全栈工程技能与工作流（README：67 技能、9 工作流）。 | MIT | 67 / 采编 4 | 已采编 |
| [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills) | 6,783 | 77 条教学向 PM 框架技能 + 6 命令工作流；许可非商用共享。 | CC BY-NC-SA 4.0 | 77 | 仅索引 |
| [trailofbits/skills](https://github.com/trailofbits/skills) | 6,940 | Trail of Bits 安全工程技能（代码审计、威胁建模等）。 | CC-BY-SA-4.0 | 采编 12 | 已采编 |
| [antfu/skills](https://github.com/antfu/skills) | 5,829 | Anthony Fu 的 Vite/Nuxt/Vue 意见向技能集：手维护 + 文档生成 + 上游 vendored。 | MIT | 约 18 | 仅索引 |
| [tech-leads-club/agent-skills](https://github.com/tech-leads-club/agent-skills) | 5,107 | 经过校验的技能注册表 + CLI；引擎 MIT，TLC 技能 CC-BY-4.0。 | MIT / CC-BY-4.0 | 注册表+官方技能 | 仅索引 |
| [tradermonty/claude-trading-skills](https://github.com/tradermonty/claude-trading-skills) | 2,759 | 交易/量化工作流 Claude 技能包。 | MIT | 采编 16 | 已采编 |
| [aaron-he-zhu/aaron-marketing-skills](https://github.com/aaron-he-zhu/aaron-marketing-skills) | 2,713 | 120 条营销技能伞仓（叙事/SEO-GEO/社交/邮件/付费/达人/发布）。 | Apache-2.0 | 120 | 仅索引 |
| [aaron-he-zhu/seo-geo-claude-skills](https://github.com/aaron-he-zhu/seo-geo-claude-skills) | 185 | 路标仓：16 条 SEO/GEO 技能已迁入 aaron-marketing-skills；独立 20 技能线冻结于 v9.9.12。 | Apache-2.0 | 16 现行 / 采编 12 | 已采编 |
| [aklofas/kicad-happy](https://github.com/aklofas/kicad-happy) | 1,063 | KiCad PCB 设计 Agent Skills。 | MIT | 11 / 采编 8 | 已采编 |
| [jaechang-hits/SciAgent-Skills](https://github.com/jaechang-hits/SciAgent-Skills) | 359 | 生物医学科研技能，README 称 199 条生物技能，BixBench 约 92%。 | CC-BY-4.0 | 199 / 采编 77 | 已采编 |
| [OctagonAI/skills](https://github.com/OctagonAI/skills) | 125 | Octagon 金融分析技能 + Octagon MCP。 | MIT | 约 46 / 采编 46 | 已采编 |
| [voidful/academic-skills](https://github.com/voidful/academic-skills) | 126 | 学术研究技能（文献、写作、投稿等）。 | MIT | 7 / 采编 7 | 已采编 |
| [findscripter/everything-skills](https://github.com/findscripter/everything-skills) | 2 | 本项目：中文优先类书式技能大典，1108 条技能、11 卷插件市场。 | 混合（见 NOTICE） | 1108 | 本项目 |

## 4. 安装器 / 注册表 / 基础设施

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) | 15,585 | Agent Skills 安全扫描器：安装前检测漏洞、恶意模式、提示注入与供应链风险。 | Apache-2.0 | 扫描器 | 仅索引 |
| [yusufkaraaslan/Skill_Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) | 14,882 | 把文档站、GitHub、PDF、视频等 18 类来源转成 SKILL.md 的 CLI 与 MCP。 | MIT | 生成器 | 仅索引 |
| [numman-ali/openskills](https://github.com/numman-ali/openskills) | 10,730 | 通用 SKILL.md 安装器：从 GitHub 技能仓装到多种代理目录。 | Apache-2.0 | 安装器 | 仅索引 |
| [iflytek/skillhub](https://github.com/iflytek/skillhub) | 4,953 | 科大讯飞开源自托管技能注册表与市场。 | Apache-2.0 | 注册表 | 仅索引 |
| [modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) | 7,214 | MCP 服务器官方注册表，不是 SKILL.md 库；作为相邻基础设施收录。 | README 未单列 SPDX | MCP 注册表 | 仅索引 |
| [antfu/skills-npm](https://github.com/antfu/skills-npm) | 512 | Anthony Fu helper for publishing agent skills as packages. | MIT | infra | 仅索引 |

## 5. 其他值得索引的技能库

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) | 52,358 | Claude API cookbook（笔记本/教程），不是 SKILL.md 技能库；作为官方学习材料索引。 | README 未单列 SPDX | 教程而非技能 | 仅索引 |

## 6. 名称不含 skill / agent 的技能库（本轮追加）

仓库名往往是方法论、产品或梗。判定依据是 README：可安装的 SKILL.md / Claude 插件市场 / `npx skills add`。

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | 120,526 | 「懒惰的高级工程师」技能/插件：YAGNI 梯子，少写代码；`/plugin marketplace add`，附带 6 条 slash 技能。 | MIT | 6 条命令技能 | 仅索引 |
| [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | 102,351 | 压缩 agent 输出（及输入代理）的技能；`npx skills add JuliusBrussee/caveman`，宣称适配 30+ agent。 | MIT（技能）/ BSL-1.1（引擎） | 技能+命令套件 | 仅索引 |
| [garrytan/gstack](https://github.com/garrytan/gstack) | 131,059 | Garry Tan 的 Claude Code 虚拟工程团队：23 个角色 slash 命令 + 8 个工具，全 Markdown。 | MIT | 23 专家 + 8 工具 | 仅索引 |
| [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files) | 26,575 | 文件化规划技能：task_plan/findings/progress 落盘，hooks 每轮注入；`npx skills add`，60+ agent。 | MIT | 规划技能 | 仅索引 |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 124,042 | UI/UX 设计智能技能：192 条推理规则、可安装到 Claude/Cursor 等；marketplace + CLI。 | MIT | UI/UX 技能 | 仅索引 |
| [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) | 113,737 | `/graphify` 技能：把代码/文档/PDF 建成可查询知识图谱（tree-sitter 本地解析）。 | 未在 README 首页单列 SPDX | `/graphify` 技能 | 仅索引 |

## 自 2026 年中以来值得注意的新库或爆发仓

相对 2026 年 6 月本地草稿：

- VoltAgent/awesome-openclaw-skills、affaan-m/ECC、sickn33/agentic-awesome-skills、vercel-labs/skills、mattpocock/skills、kepano/obsidian-skills、microsoft/skills、phuryn/pm-skills、openai/plugins、iflytek/skillhub、NVIDIA/SkillSpector、NVIDIA/skills、anthropics/claude-plugins-community、anthropics/k12-teacher-skills
- 名称不含 skill 的本轮追加：ponytail、caveman、gstack、graphify、planning-with-files、ui-ux-pro-max-skill

本目录供 findscripter/everything-skills 维护者做来源发现；转载请保留检索方法与采编标记。
