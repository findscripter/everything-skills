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
| [google/skills](https://github.com/google/skills) | 19,197 | Google 官方 Agent Skills：GCP/GKE/BigQuery/Ads/Firebase 等，npx skills add google/skills；并捆绑 Claude/Codex/Antigravity 插件市场。 | Apache-2.0 | 约 126 | 仅索引 |
| [huggingface/skills](https://github.com/huggingface/skills) | 11,000 | Hugging Face 官方 Hub/训练/评测/Spaces 技能；市场默认只暴露 hf-cli，其余用 hf skills add。 | README 未单列 SPDX | 25 | 仅索引 |
| [google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills) | 8,239 | Google Stitch 设计技能与三个插件（design/build/utilities），兼容 Codex、Antigravity、Claude Code、Cursor。非官方支持产品。 | README 未单列 SPDX | 15 | 仅索引 |
| [anthropics/defending-code-reference-harness](https://github.com/anthropics/defending-code-reference-harness) | 7,399 | Anthropic 防御性安全参考 harness：威胁建模、扫描、分诊、补丁与检测响应技能，外加自主扫描流水线。标明不再维护。 | README 未单列 SPDX | 8 | 仅索引 |
| [google/agents-cli](https://github.com/google/agents-cli) | 5,788 | Gemini Enterprise Agent Platform 的 CLI + 技能：把任意编码代理变成 ADK 代理构建/评测/部署专家。 | README 未单列 SPDX | 7 技能 + CLI | 仅索引 |
| [microsoft/SkillOpt](https://github.com/microsoft/SkillOpt) | 16,618 | 微软把 SKILL.md 当可训练状态的优化器：冻结模型、用轨迹与验证门编辑技能文档，产出可部署 best_skill.md。 | MIT | 优化器而非技能库 | 仅索引 |
| [cloudflare/skills](https://github.com/cloudflare/skills) | 2,763 | Cloudflare 官方 Workers/Agents SDK/Durable Objects/Wrangler/Cloudflare One 技能与 MCP。 | README 未单列 SPDX | 约 12 | 仅索引 |
| [expo/skills](https://github.com/expo/skills) | 2,494 | Expo 官方构建/部署/升级/调试技能；Claude/Codex 走插件市场，其余用 skills CLI。 | MIT | 约 22 | 仅索引 |
| [microsoft/azure-skills](https://github.com/microsoft/azure-skills) | 1,441 | 微软 Azure 技能插件：准备/校验/部署/诊断/成本/AI/RBAC 等，并接入 Azure MCP 与 Foundry MCP。 | README 未单列 SPDX | 约 25 | 仅索引 |
| [microsoft/skills-for-fabric](https://github.com/microsoft/skills-for-fabric) | 1,091 | Microsoft Fabric 技能市场：fabric-skills 全包与独立的 Power BI 作者包。 | MIT | 2 插件包 | 仅索引 |
| [vercel-labs/next-skills](https://github.com/vercel-labs/next-skills) | 977 | 路标仓：原 Next.js Agent Skills 已迁入 vercel/next.js 的 skills/，用 npx skills add vercel/next.js。 | README 未单列 SPDX | 路标 | 仅索引 |
| [anthropics/launch-your-agent](https://github.com/anthropics/launch-your-agent) | 976 | Anthropic 参考技能：访谈→范围 v0→在本人账户启动 Claude Managed Agent→评分迭代→定时部署。 | Apache-2.0 | 2 | 仅索引 |
| [awslabs/agent-plugins](https://github.com/awslabs/agent-plugins) | 881 | AWS Labs Agent Plugins 市场：Amplify、Serverless、SageMaker、deploy-on-aws 等；README 称后继为 Agent Toolkit for AWS。 | Apache-2.0 | 9 插件 | 仅索引 |
| [google/mantis](https://github.com/google/mantis) | 856 | Google 可移植安全审查技能套件：计划、研究、复现、补丁、报告的顺序流水线；npx skills add google/mantis。非官方支持产品。 | README 未单列 SPDX | 约 16 | 仅索引 |
| [microsoft/power-platform-skills](https://github.com/microsoft/power-platform-skills) | 795 | 微软 Power Platform 插件市场：Power Pages、Model/Canvas/Code/Mobile Apps、Power Automate 等。 | MIT | 8 插件 | 仅索引 |
| [makenotion/skills](https://github.com/makenotion/skills) | 161 | Notion 官方 Agent Skills，推荐 npx skills add makenotion/skills；当前公开表仅 notion-cli。 | README 未单列 SPDX | 1 | 仅索引 |
| [googleworkspace/cli](https://github.com/googleworkspace/cli) | 30,698 | Google Workspace 非官方支持 CLI（gws）：Drive/Gmail/Calendar 等 Discovery 动态命令面，附 100+ Agent Skills。 | Apache-2.0 | 100+ | 仅索引 |
| [larksuite/cli](https://github.com/larksuite/cli) | 16,946 | 飞书/Lark 官方 CLI：200+ 命令与 26 条 Agent Skills（日历/文档/消息/表格/会议等），skills CLI 安装 larksuite/cli。 | MIT | 26 | 仅索引 |
| [dotnet/skills](https://github.com/dotnet/skills) | 5,319 | .NET 官方 Agent Skills 插件市场：dotnet/advanced/data/diag/msbuild/nuget/upgrade/maui/ai/test/aspnetcore/blazor 等，Copilot/Claude/Codex/Cursor 插件市场。 | README 指向 LICENSE | 15 插件 | 仅索引 |
| [OpenSenseNova/SenseNova-Skills](https://github.com/OpenSenseNova/SenseNova-Skills) | 5,272 | 商汤 SenseNova 办公技能：信息图/PPT/Excel 分析/深度研究/多源搜索，SKILL.md 可装 OpenClaw 与 Hermes。 | MIT | 约 22 | 仅索引 |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | 4,468 | Remotion 官方 Agent Skills：best-practices/create/markup/studio/render/maps/captions/saas/interactivity/docs/upgrade/multimedia。 | README 未单列 SPDX | 12 | 仅索引 |
| [supabase/agent-skills](https://github.com/supabase/agent-skills) | 2,569 | Supabase 官方技能：supabase 全产品包 + postgres-best-practices；skills CLI 与 Claude 插件市场。 | README 未单列 SPDX | 2 | 仅索引 |
| [firebase/agent-skills](https://github.com/firebase/agent-skills) | 432 | Firebase 官方 Agent Skills：README 安装命令指向 firebase/skills 别名路径，兼 Gemini/Claude/Codex/Kimi 插件。 | Apache-2.0 | 官方技能包 | 仅索引 |
| [prisma/skills](https://github.com/prisma/skills) | 54 | Prisma 官方 ORM/Client/Postgres/Compute 技能 8 条。 | MIT | 8 | 仅索引 |

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
| [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) | 31,971 | 独立社区网络安全技能库（非 Anthropic 官方）：818 条、34 域，映射 ATT&CK/NIST CSF/ATLAS/D3FEND/AI RMF/F3。 | Apache-2.0 | 818 | 仅索引 |
| [BehiSecc/awesome-claude-skills](https://github.com/BehiSecc/awesome-claude-skills) | 10,085 | Claude Skills 社区 awesome 精选列表。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [anbeime/skill](https://github.com/anbeime/skill) | 6,061 | 中文 Skill 商店：自动抓取官方技能 + 63 条本地中文技能（文档/短视频/电商等），宣称总计 245 条、每 24 小时同步。 | MIT | 245 | 仅索引 |
| [0xNyk/awesome-hermes-agent](https://github.com/0xNyk/awesome-hermes-agent) | 5,533 | Nous Hermes Agent 独立目录：技能、插件、记忆、工具与指南。 | README 未单列 SPDX | 精选目录 | 仅索引 |
| [libukai/awesome-agent-skills](https://github.com/libukai/awesome-agent-skills) | 5,034 | Agent Skills 中文终极指南：规范、安装、官方项目表与精选技能。 | Apache-2.0 | 精选+教程 | 仅索引 |
| [jeremylongshore/tons-of-skills-marketplace](https://github.com/jeremylongshore/tons-of-skills-marketplace) | 2,691 | Tons of Skills 市场：440 插件、2984 条可见技能、347 代理定义；ccpi CLI 与 tonsofskills.com。 | MIT（脚手架） | 2984 / 440 插件 | 仅索引 |
| [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) | 2,619 | 67 套 DESIGN.md + SKILL.md 设计系统技能，用 npx typeui.sh pull <slug> 拉到 Cursor/Claude 等。 | MIT | 67 | 仅索引 |
| [obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace) | 1,239 | Superpowers 的 Claude Code 插件市场：核心 superpowers、Elements of Style、插件开发技能、Private Journal MCP。 | MIT | 4 插件 | 仅索引 |
| [numman-ali/n-skills](https://github.com/numman-ali/n-skills) | 1,041 | 跨代理精选市场（SKILL.md + AGENTS.md + openskills）：orchestration、gastown、dev-browser 等。 | Apache-2.0 | 5 | 仅索引 |
| [hashgraph-online/awesome-codex-plugins](https://github.com/hashgraph-online/awesome-codex-plugins) | 878 | Codex/ChatGPT 插件与技能精选，自称 Codex Marketplace，配套 hol.org/registry。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) | 795 | 68 条游戏开发技能 + 路由器：Godot/Unity/Unreal/Phaser 等十引擎，SKILL.md 可 npx skills add。 | Apache-2.0 | 68 + 路由器 | 仅索引 |
| [lawve-ai/awesome-legal-skills](https://github.com/lawve-ai/awesome-legal-skills) | 676 | 法律工作自动化 Agent Skills 精选列表。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [trailofbits/skills-curated](https://github.com/trailofbits/skills-curated) | 496 | Trail of Bits 审核过的 Claude Code 插件市场：开发/安全/生产力/写作，以及从 openai/skills 转换的便携技能。 | CC-BY-SA-4.0 | 约 28 插件 | 仅索引 |
| [LinklyAI/best-skills](https://github.com/LinklyAI/best-skills) | 368 | 跨 skills.sh / ClawHub / 腾讯 SkillHub 的每日 Top 100 技能排行与开放 CSV，非技能正文库。 | CC BY 4.0 | 排行榜 | 仅索引 |
| [tmstack/awesome-persona-skills](https://github.com/tmstack/awesome-persona-skills) | 3,821 | 中文人设/蒸馏技能精选：同事/老板/前任/自己/女娲等，链到 titanwings/distilly 等独立仓。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [Prat011/awesome-llm-skills](https://github.com/Prat011/awesome-llm-skills) | 1,709 | 跨 Claude/Codex/Gemini/OpenCode/Qwen 的 LLM Skills awesome 列表。 | Apache-2.0 | 精选列表 | 仅索引 |
| [spencerpauly/awesome-cursor-skills](https://github.com/spencerpauly/awesome-cursor-skills) | 745 | Cursor 专用 SKILL.md 精选：Cursor-native 工作流 + 市场插件索引。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [skillmatic-ai/awesome-agent-skills](https://github.com/skillmatic-ai/awesome-agent-skills) | 667 | Agent Skills 学习路径 awesome：规范、平台、市场、评测与论文索引。 | README 未单列 SPDX | 精选+教程 | 仅索引 |
| [ZeroPointRepo/awesome-hermes-skills](https://github.com/ZeroPointRepo/awesome-hermes-skills) | 497 | Nous Hermes Agent 技能/插件精选，README 徽章 368 条（内置+可选+社区）。 | README 未单列 SPDX | 368 | 仅索引 |

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
| [JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills) | 25,579 | 宝玉自用内容创作技能集合（公众号、Markdown、小红书图文、PPT 等），带 .claude-plugin 与 skills/ 目录。 | MIT | 内容创作技能包 | 仅索引 |
| [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) | 24,771 | Compound Engineering：brainstorm→plan→work→review→compound 循环的 33 条技能，覆盖 Claude Code、Cursor、Codex、Copilot、OpenCode 等 14 宿主。 | MIT | 33 | 仅索引 |
| [rjs/shaping-skills](https://github.com/rjs/shaping-skills) | 1,425 | Basecamp Shape Up 方法论技能：framing-doc、kickoff-doc、shaping、breadboarding，给 Claude Code 做需求塑形。 | README 未单列 SPDX | 4 | 仅索引 |
| [himself65/finance-skills](https://github.com/himself65/finance-skills) | 3,278 | 金融分析/交易 Agent Skills：估值、财报、期权、社交只读源、TradingView/Hyperliquid 等插件组。 | MIT | 约 26 | 仅索引 |
| [samber/cc-skills-golang](https://github.com/samber/cc-skills-golang) | 3,143 | 生产级 Go 专用技能（风格、并发、测试、安全、samber/* 库等），评测宣称有技能 98% vs 无技能 57%。 | MIT | 约 46 | 仅索引 |
| [RKiding/Awesome-finance-skills](https://github.com/RKiding/Awesome-finance-skills) | 2,835 | AlphaEar 金融技能：新闻、行情、情绪、Kronos 预测、逻辑链可视化、研报；npx skills add。 | README 未单列 SPDX | 8 | 仅索引 |
| [eternityspring/shuohao-skills](https://github.com/eternityspring/shuohao-skills) | 2,535 | AI 短剧制作五段技能：大纲、角色、美术、剧本、分镜，软链到 Claude Code 与 Codex。 | Apache-2.0 | 5 | 仅索引 |
| [badlogic/pi-skills](https://github.com/badlogic/pi-skills) | 2,478 | pi-coding-agent 技能集，兼容 Claude Code/Codex/Amp/Droid：Brave 搜索、浏览器、Gmail/Calendar/Drive、转录等。 | MIT | 8 | 仅索引 |
| [wondelai/skills](https://github.com/wondelai/skills) | 2,079 | 畅销书框架蒸馏成商业/营销/UX/编码技能，README 宣称 50 技能 + 12 引导旅程。 | README 未单列 SPDX | 50 | 仅索引 |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | 34,707 | animations.dev 作者的设计/动效技能：emil-design-eng、animate、review-animations、apple-design 等。 | README 未单列 SPDX | 12 | 仅索引 |
| [titanwings/distilly](https://github.com/titanwings/distilly) | 24,265 | Distilly（原 Colleague Skill）：把人的经验蒸馏成可安装 Person Profile 技能，覆盖同事/关系/名人三族。 | MIT | 1 元技能（生成人设技能） | 仅索引 |
| [KKKKhazix/khazix-skills](https://github.com/KKKKhazix/khazix-skills) | 20,356 | 数字生命卡兹克自用 6 条技能：leader/storage-analyzer/aihot/neat-freak/hv-analysis/khazix-writer。 | MIT | 6 | 仅索引 |
| [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | 7,064 | 电影感产品视频 Agent Skill：157 镜配方卡 + Remotion 模板，面向 Claude Code/Codex。 | README 未单列 SPDX | 1（配方库技能） | 仅索引 |
| [JimLiu/baoyu-design](https://github.com/JimLiu/baoyu-design) | 3,805 | 把 Claude Design 封装为本地 Agent Skill：高保真 UI/原型/PPT 输出独立 HTML，Cursor/Claude/Codex。 | MIT | 1（内置多工作流） | 仅索引 |
| [mohitagw15856/pm-claude-skills](https://github.com/mohitagw15856/pm-claude-skills) | 1,330 | 1153 条专业 Agent Skills（PRD/复盘到生活工作流），MIT，在 Anthropic 官方插件目录。 | MIT | 1153 | 仅索引 |
| [fivetaku/gptaku_plugins](https://github.com/fivetaku/gptaku_plugins) | 1,101 | GPTaku Claude Code 插件市场：17 插件（insane-search/design/review/research 等），韩英中日西多语 README。 | MIT | 17 插件 | 仅索引 |
| [BagelHole/DevOps-Security-Agent-Skills](https://github.com/BagelHole/DevOps-Security-Agent-Skills) | 944 | DevOps/安全/基础设施/合规 Agent Skills，README 宣称 160+。 | MIT | 160+ | 仅索引 |
| [data-goblin/power-bi-agentic-development](https://github.com/data-goblin/power-bi-agentic-development) | 887 | Power BI / Fabric 插件市场：11 插件（semantic-models/reports/pbip/fabric-cli 等），Claude Code 与 Copilot CLI。 | GPL-3.0 | 11 插件 | 仅索引 |
| [inference-sh/skills](https://github.com/inference-sh/skills) | 722 | inference.sh 官方技能：图像/视频生成、LLM、搜索、SDK/UI 组件。 | MIT | 工具+指南技能包 | 仅索引 |
| [giuseppe-trisciuoglio/developer-kit](https://github.com/giuseppe-trisciuoglio/developer-kit) | 337 | 模块化 Claude Code 插件市场：150+ 技能、45+ 代理，覆盖 Java/TS/Python/PHP/AWS。 | MIT | 150+ | 仅索引 |
| [try-works/recursive-mode](https://github.com/try-works/recursive-mode) | 129 | 文件化递归工程工作流技能包：requirements→plan→TDD→review→memory；Show HN。 | README 未单列 SPDX | 9 | 仅索引 |

## 4. 安装器 / 注册表 / 基础设施

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) | 15,585 | Agent Skills 安全扫描器：安装前检测漏洞、恶意模式、提示注入与供应链风险。 | Apache-2.0 | 扫描器 | 仅索引 |
| [yusufkaraaslan/Skill_Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) | 14,882 | 把文档站、GitHub、PDF、视频等 18 类来源转成 SKILL.md 的 CLI 与 MCP。 | MIT | 生成器 | 仅索引 |
| [numman-ali/openskills](https://github.com/numman-ali/openskills) | 10,730 | 通用 SKILL.md 安装器：从 GitHub 技能仓装到多种代理目录。 | Apache-2.0 | 安装器 | 仅索引 |
| [iflytek/skillhub](https://github.com/iflytek/skillhub) | 4,953 | 科大讯飞开源自托管技能注册表与市场。 | Apache-2.0 | 注册表 | 仅索引 |
| [modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) | 7,214 | MCP 服务器官方注册表，不是 SKILL.md 库；作为相邻基础设施收录。 | README 未单列 SPDX | MCP 注册表 | 仅索引 |
| [antfu/skills-npm](https://github.com/antfu/skills-npm) | 512 | Anthony Fu helper for publishing agent skills as packages. | MIT | infra | 仅索引 |
| [microsoft/waza](https://github.com/microsoft/waza) | 1,291 | 微软 Agent Skills CLI/框架：创建、测试、度量并改进技能质量与触发效果。 | README 未单列 SPDX | 评测/CLI | 仅索引 |
| [microsoft/skill-recorder](https://github.com/microsoft/skill-recorder) | 3,751 | 微软桌面录屏工具：把一次真实操作还原成可复用技能文档或定时自动化。 | MIT | 生成器 | 仅索引 |
| [TanStack/intent](https://github.com/TanStack/intent) | 328 | TanStack 官方 CLI：为库作者生成并校验 Agent Skills。 | README 未单列 SPDX | 生成器/CLI | 仅索引 |

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
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 83,508 | Anti-slop 前端审美技能：design-taste-frontend 等约 13 条。 | MIT | 约 13 | 仅索引 |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 64,828 | 前端设计技能：1 技能 + 23 命令 + 61 检测规则；impeccable install 与 Claude 插件市场。 | Apache-2.0 | 1 技能 + 23 命令 | 仅索引 |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 43,656 | HeyGen HTML→MP4 视频框架，附 20 条 Agent Skills（hyperframes 路由器）。 | Apache-2.0 | 20 | 仅索引 |
| [tt-a1i/archify](https://github.com/tt-a1i/archify) | 42,971 | 架构图 Agent Skill：把代码/系统描述编成可交互 HTML/SVG。 | MIT | 1 | 仅索引 |
| [blader/humanizer](https://github.com/blader/humanizer) | 39,789 | 去 AI 腔写作技能，35 条维基模式。 | MIT | 1 | 仅索引 |
| [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) | 29,375 | 39 种编辑向图示类型技能，输出独立 HTML+SVG，面向 Claude Code/Codex/Pi。 | README 未单列 SPDX | 39 图示类型 | 仅索引 |

## 自 2026 年中以来值得注意的新库或爆发仓

相对 2026 年 6 月本地草稿：

- VoltAgent/awesome-openclaw-skills、affaan-m/ECC、sickn33/agentic-awesome-skills、vercel-labs/skills、mattpocock/skills、kepano/obsidian-skills、microsoft/skills、phuryn/pm-skills、openai/plugins、iflytek/skillhub、NVIDIA/SkillSpector、NVIDIA/skills、anthropics/claude-plugins-community、anthropics/k12-teacher-skills
- 本轮补录爆发仓：google/skills、huggingface/skills、google-labs-code/stitch-skills、EveryInc/compound-engineering-plugin、JimLiu/baoyu-skills、mukul975/Anthropic-Cybersecurity-Skills、jeremylongshore/tons-of-skills-marketplace、anbeime/skill、microsoft/SkillOpt、microsoft/waza、google/mantis、anthropics/launch-your-agent
- 名称不含 skill 的本轮追加：ponytail、caveman、gstack、graphify、planning-with-files、ui-ux-pro-max-skill
- 本轮平台帖/热榜补录爆发仓：Leonxlnx/taste-skill、pbakaus/impeccable、heygen-com/hyperframes、tt-a1i/archify、blader/humanizer、cathrynlavery/diagram-design、emilkowalski/skills、titanwings/distilly、KKKKhazix/khazix-skills、googleworkspace/cli、larksuite/cli、Vincentwei1021/video-shotcraft、JimLiu/baoyu-design
- 上轮未读现已入表：dotnet/skills、OpenSenseNova/SenseNova-Skills、TanStack/intent、microsoft/skill-recorder 及一组 awesome/垂直市场仓
- 名称不含 skill/agent 现已入表：defending-code-reference-harness、launch-your-agent、agents-cli、mantis、compound-engineering-plugin、waza、superpowers-marketplace、awesome-codex-plugins（另加第 6 节 ponytail/caveman/gstack/planning-with-files/ui-ux-pro-max-skill/graphify）

## 未能拉取 README / 未纳入分表

种子或检索中出现、但本轮未成功阅读 README（或不收录），故不进入上列分表，供下轮补读：

- InternScience/Awesome-Scientific-Skills（根 README.md 不存在，仅 skills-metric/README.md）
- WorldFlowAI/everything-claude-code（ECC 第三方重传警告，跳过）
- gemini-extension.json skills（0 hits）

本目录供 findscripter/everything-skills 维护者做来源发现；转载请保留检索方法与采编标记。
