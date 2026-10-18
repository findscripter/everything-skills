# part84 审核记录

- 核验日期：2026-10-18（Asia/Shanghai）
- 固定基线：2344 个仓库（part83 发布后）
- 本批合格：38 个独立仓库；发布后目录总数：2382
- 性质：日目标达成后的追加收录，不重复计入 part83 的 76 条日目标条目。
- 范围：产品原生技能/SDK/CLI、技能注册表、设计与无障碍、科研/GIS/CAE、机器人/嵌入式。
- 规则：只保留有 README 分发证据、SKILL.md 或明确基础设施契约、许可证和固定仓库身份的条目；未安装、未执行候选。

## 分类映射

- `products:embedded` → `infra`（Agent 运行环境或基础设施）。
- `science:*` → `vertical`（科研、GIS、CAE 等领域技能）。
- `workflows:skill-infrastructure` → `infra`。
- 其余社区工作流/设计/注册表 → `collections`。

## 收录仓库

### official（13）

- [cursor/plugins](https://github.com/cursor/plugins) — Cursor plugin specification and official plugins；许可：Per-plugin licenses (representative cursor-sdk plugin license; root API reports NOASSERTION)；技能计数：111 个官方插件目录（多技能）
- [google/adk-recipes](https://github.com/google/adk-recipes) — A collection of agent recipes, reference patterns, and vertical plugins built with Agent Development Kit (ADK)；许可：Apache-2.0 repository; plugin dependencies/assets may retain their own terms；技能计数：2
- [browser-use/browser-harness](https://github.com/browser-use/browser-harness) — Let Claude Code, Codex or Cursor use your real Chrome, logged in as you. One prompt to set up. Open source, MIT.；许可：MIT；技能计数：1
- [pinchtab/pinchtab](https://github.com/pinchtab/pinchtab) — High-performance browser automation bridge and multi-instance orchestrator with advanced stealth injection and real-time dashboard.；许可：MIT；技能计数：4
- [xberg-io/xberg](https://github.com/xberg-io/xberg) — Polyglot document intelligence with a Rust core: extract text, metadata, images, tables, and structured data from 106 formats across 140 file extensions, plus code intelligence for 371 languages. Fifteen bindings, with CLI, REST API, and MCP server.；许可：MIT code/skills; some reference material retains Elastic-2.0 terms；技能计数：7
- [anthropics/oncall-kit](https://github.com/anthropics/oncall-kit) — Starter kit for a Claude-assisted on-call: mines your incident history into triage playbooks, sets up through human-approved gates, and runs read-only in your Slack channel — humans deploy every fix.；许可：Apache-2.0；技能计数：4
- [AnmolSaini16/mapcn](https://github.com/AnmolSaini16/mapcn) — Beautiful map components. 100% Free, Zero config, one command setup.；许可：MIT；技能计数：1
- [OpenMinis/MinisSkills](https://github.com/OpenMinis/MinisSkills) — Skills collection for Minis.；许可：MIT collection; nested shortcuts-builder includes its own NOTICE/terms；技能计数：56
- [vite-hub/vitehub](https://github.com/vite-hub/vitehub) — Agents for any host, composed with server primitives through one Vite plugin.；许可：Apache-2.0；技能计数：1
- [openfilm/openfilm](https://github.com/openfilm/openfilm) — The open source AI video agent: turns any coding agent into a video agent, with an editor to change anything it makes.；许可：MIT；技能计数：11
- [vibeic/vibe-ic](https://github.com/vibeic/vibe-ic) — AI-native IC design plugin with MCP-EDA — from natural-language intent to verified silicon.；许可：Apache-2.0；技能计数：71
- [no-phux/skills](https://github.com/no-phux/skills) — Agent skills for phux. Install: npx skills add no-phux/skills；许可：Apache-2.0；技能计数：3
- [BintzGavin/helios](https://github.com/BintzGavin/helios) — Programmatic video creation with web technologies you already know. CSS animations just work.；许可：Apache-2.0 (skills/plugin); ELv2 engine；技能计数：19

### collections（9）

- [21st-dev/registry](https://github.com/21st-dev/registry) — Publish, search and install team React components through the 21st.dev registry with a bundled Agent Skill.；许可：MIT；技能计数：1
- [CODE-SAURABH/OpenSkills](https://github.com/CODE-SAURABH/OpenSkills) — Portable production-grade AI engineering skills for memory, backend, API, security, QA, planning and retrospectives.；许可：MIT；技能计数：49
- [iam-niranjan/wcag-skills](https://github.com/iam-niranjan/wcag-skills) — Normative WCAG 2.2 Level A, AA and AAA criteria packaged as verified SKILL.md files for accessibility audits.；许可：MIT；技能计数：3
- [arham777/ui-ux-kit](https://github.com/arham777/ui-ux-kit) — Taste-first anti-slop UI design workflow that leaves a reusable DESIGN_SYSTEM.md for future pages.；许可：MIT；技能计数：1
- [Armitanemati/liquid-glass-claude-skill](https://github.com/Armitanemati/liquid-glass-claude-skill) — Brand-agnostic Liquid Glass and glassmorphism reasoning for web, SwiftUI and mobile with contrast, performance and fallback rules.；许可：MIT；技能计数：1
- [manish1803/nextjs-fullstack-skills](https://github.com/manish1803/nextjs-fullstack-skills) — Next.js, React, R3F, motion, payments and UX/UI Agent Skills for multi-agent frontend/full-stack development.；许可：MIT；技能计数：23
- [Taimoorkhan1122/boring-react](https://github.com/Taimoorkhan1122/boring-react) — Evidence-tested React engineering skills enforcing maintainable components, production patterns, quality and motion discipline.；许可：MIT；技能计数：4
- [weareoxd/design-skill-generator](https://github.com/weareoxd/design-skill-generator) — Generate design-system SKILL.md context from screenshots or Figma URLs, alongside feature/refinement skills used by the project.；许可：MIT；技能计数：3
- [alfaris/Design-AI-Skills](https://github.com/alfaris/Design-AI-Skills) — Bilingual English/Arabic design critique and persuasive-thinking skills for design review, presentation and defense.；许可：CC-BY-4.0；技能计数：2

### vertical（7）

- [1507078/openwrt-one-skills](https://github.com/1507078/openwrt-one-skills) — Set up and operate an OpenWrt One router with an AI coding agent. For developers who don't know networking. Works with Claude Code, Codex, and any Agent Skills host.；许可：MIT；技能计数：3
- [Superfast-Robotics/robot-skill-hub](https://github.com/Superfast-Robotics/robot-skill-hub) — Agent-first robotics skill discovery: pinned source examples, reproducible preparation, and reviewed task findings.；许可：MIT；技能计数：1
- [aws-geospatial/amazon-location-agent-context](https://github.com/aws-geospatial/amazon-location-agent-context) — Official AWS Amazon Location Service context and Agent Skill package for maps, places, geocoding, routing, geofencing and tracking across Kiro, Claude, Cursor and generic Agent Skills clients.；许可：MIT-0 (README and LICENSE.md; GitHub API metadata reported Apache-2.0, requiring source-license precedence)；技能计数：1
- [enesgul23/scientific-figure-skills](https://github.com/enesgul23/scientific-figure-skills) — Evidence-first scientific figure suite for planning, rendering, auditing and packaging publication-grade figures with reproducible exports, visual-claim ledgers and journal checks.；许可：MIT；技能计数：1
- [Cai-aa/CAE-Agent-Hub](https://github.com/Cai-aa/CAE-Agent-Hub) — CAE engineering simulation hub combining reusable agent skills, MCP bridges and evidence-oriented Abaqus, Ansys, CST, Calculix, COMSOL, FEP, LAMMPS, OVITO and Peridigm workflows.；许可：MIT；技能计数：多技能
- [ShaishavMaisuria/research-paper-lifecycle-skills](https://github.com/ShaishavMaisuria/research-paper-lifecycle-skills) — 42 Agent Skills covering the research-paper lifecycle from literature discovery and writing through verification, submission, rebuttal, publication and talks.；许可：Apache-2.0；技能计数：42
- [muend/geoai-skills](https://github.com/muend/geoai-skills) — Vendor-neutral 18-skill geospatial AI stack that tests CRS, units, comparability, spatial leakage, uncertainty, provenance and safe refusal before a result becomes a claim.；许可：MIT；技能计数：18

### infra（9）

- [smol-machines/smolvm](https://github.com/smol-machines/smolvm) — An embeddable, portable, branchable virtual machine to safely run Agents locally.；许可：Apache-2.0；技能计数：11
- [activeing123/mcptoon](https://github.com/activeing123/mcptoon) — One zero-dependency CLI for every MCP server and agent skill. Token optimization, tool discovery and context compression: 71,929 -> 581 tokens (-99.2%, measured), schemas stay out of context. One config for Claude Code, Codex, Cursor, every agent. 341KB, pure Python. | 零依赖 CLI：管所有 MCP 工具与技能，工具发现省 99.2% token。；许可：Apache-2.0；技能计数：1
- [evgeniiPerov/quay](https://github.com/evgeniiPerov/quay) — Git-native registry and MCP server for sharing, installing, updating and auditing SKILL.md files across agent roots.；许可：MIT；技能计数：25
- [yaacovcorcos/papiskill](https://github.com/yaacovcorcos/papiskill) — Git-backed public registry and CLI for searching, installing, validating and publishing portable SKILL.md packages.；许可：MIT；技能计数：5
- [sentenz/skills](https://github.com/sentenz/skills) — Apache-licensed catalog of modular development skills for AI coding assistants with `.agents/skills` installation.；许可：Apache-2.0；技能计数：23
- [sigistry/marketplace](https://github.com/sigistry/marketplace) — Verified plugin/skill registry with open security checks, machine-readable verification and consent-first external references.；许可：MIT (registry; nested/plugin licenses retained)；技能计数：36
- [scalefocus/skilly](https://github.com/scalefocus/skilly) — Apache-licensed self-hosted governed registry for versioned, reviewed organizational SKILL.md assets.；许可：Apache-2.0；技能计数：基础设施
- [SkillsCatalog/registry](https://github.com/SkillsCatalog/registry) — Community Agent Skills registry with creation, installation, search, validation, publishing and safety-scanning workflows.；许可：MIT；技能计数：7
- [Kargatharaakash/website-design-systems-mcp](https://github.com/Kargatharaakash/website-design-systems-mcp) — MCP product that extracts website design systems and generates AI-ready SKILL.md files from live sites.；许可：MIT；技能计数：基础设施

## 重点许可与 README 备注

- `aws-geospatial/amazon-location-agent-context` 以源文件 MIT-0 为准，GitHub API 的 Apache-2.0 仅记录为元数据冲突。
- `cursor/plugins` 使用插件级许可证，根仓库 NOASSERTION 不外推。
- `xberg-io/xberg`、`OpenMinis/MinisSkills`、`BintzGavin/helios` 等保留嵌套 NOTICE/许可证范围。
- `21st-dev/registry` 的 README 示例存在字符编码瑕疵，但安装路径与分发契约仍可核验。
- `scalefocus/skilly`、`Kargatharaakash/website-design-systems-mcp` 按基础设施/产品契约收录，不把生成输出计为独立技能。

## 机器证据

- [part84 JSONL](skill-repos.part84.jsonl)
- [机器审核](skill-repos.part84.audit.json)
- 产品组：`C:/Users/13185/AppData/Local/Temp/products18-wave3-accepted.audit.json`
- 科研组：`C:/Users/13185/AppData/Local/Temp/everything-science-20261018b/science2.audit.json`
- 工作流组：`C:/Users/13185/AppData/Local/Temp/everything-workflows-20261018/reviewed2.json`
