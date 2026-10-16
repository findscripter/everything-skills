# part81：每日 50 条目标——产品原生、基础设施与垂直技能扩展

核验日期：2026-10-16 (Asia/Shanghai)。基线 2132 个仓库，候选池 246 个，结构核验通过 153 个；本轮正式新增 **50 个独立仓库**，合入后 **2182 个**。
本轮只更新仓库索引，不安装、执行或复制第三方技能正文。

## 候选池与核验

- Fixed the 2,132-repository local/main/zh baseline before searching; candidate pool was deduplicated by canonical full_name and repository ID against all local shards and fetched remote branches.
- GitHub authenticated REST metadata and commit-pinned recursive trees supplied repository IDs, fork/archived flags, Stars, licenses, README paths, representative SKILL paths, and commit SHAs.
- 153 candidates passed structural tree/license/README/representative-frontmatter screening; 50 were selected after domain coverage, public distribution evidence, overlap, and risk review.
- Security/offensive repositories, generated or user-installed copies, templates, documentation-only repositories, unresolved provenance, and candidates without a usable license or public install/usage boundary were not counted.
- The 50 selected repositories are independent repository records; multiple SKILL.md files inside one repository are represented by one row and do not inflate the daily count.

## 新增仓库（50）

| 仓库 | Stars | 许可 | 技能计数 | 领域 | 代表入口 |
| --- | ---: | --- | ---: | --- | --- |
| [morluto/rea](https://github.com/morluto/rea) | 270516 | MIT | 4 | skill-infrastructure | [SKILL.md](https://github.com/morluto/rea/blob/1bd5c5c87e81b27bfb16140f71ffa03563e58477/.agents/skills/rea-changelog-update/SKILL.md) |
| [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | 102732 | MIT | 79 | skill-infrastructure | [SKILL.md](https://github.com/paperclipai/paperclip/blob/fa9f3f8a08453db042df90e97d428c5c994d65c6/.agents/skills/add-product-e2e-eval/SKILL.md) |
| [nexu-io/open-design](https://github.com/nexu-io/open-design) | 101359 | Apache-2.0 | 549 | skill-infrastructure | [SKILL.md](https://github.com/nexu-io/open-design/blob/7abd6fc2b11987c3940eb4ffc461478ff37c0b33/.claude/skills/od-contribute/SKILL.md) |
| [ruvnet/RuView](https://github.com/ruvnet/RuView) | 98217 | MIT | 54 | skill-infrastructure | [SKILL.md](https://github.com/ruvnet/RuView/blob/a1ca023ee872683d160250d47ae3d4d228af55a0/.claude/skills/agentdb-advanced/SKILL.md) |
| [Egonex-AI/Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) | 86488 | MIT | 9 | embedded-product-skill | [SKILL.md](https://github.com/Egonex-AI/Understand-Anything/blob/f2d0164f72fe678805c34245a6df36acededfebd/understand-anything-plugin/skills/understand-chat/SKILL.md) |
| [ruvnet/ruflo](https://github.com/ruvnet/ruflo) | 75137 | MIT | 380 | skill-infrastructure | [SKILL.md](https://github.com/ruvnet/ruflo/blob/1882006a02487590c8c66a7eec8d7504f6af33c3/.agents/skills/agent-adaptive-coordinator/SKILL.md) |
| [career-ops-hq/career-ops](https://github.com/career-ops-hq/career-ops) | 75057 | MIT | 12 | skill-infrastructure | [SKILL.md](https://github.com/career-ops-hq/career-ops/blob/c3230d12a5e94e9c00840410c75e8d89753218f0/.agents/skills/career-ops/SKILL.md) |
| [zhayujie/CowAgent](https://github.com/zhayujie/CowAgent) | 47420 | MIT | 3 | embedded-product-skill | [SKILL.md](https://github.com/zhayujie/CowAgent/blob/99be4c16bf741916542ad23023aa9a0d35a3e3bf/skills/image-generation/SKILL.md) |
| [alibaba/open-code-review](https://github.com/alibaba/open-code-review) | 47389 | Apache-2.0 | 4 | skill-infrastructure | [SKILL.md](https://github.com/alibaba/open-code-review/blob/11ac6d4c57082f310067a4a1654ad5b63cb57410/plugins/open-code-review/skills/open-code-review-delegate/SKILL.md) |
| [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template) | 36842 | MIT | 1 | cae-cad | [SKILL.md](https://github.com/JCodesMore/ai-website-cloner-template/blob/ee3f5a2f31fd549b9593fa4f7cf6d2955ee593bb/.agents/skills/clone-website/SKILL.md) |
| [agentscope-ai/QwenPaw](https://github.com/agentscope-ai/QwenPaw) | 35727 | Apache-2.0 | 49 | skill-infrastructure | [SKILL.md](https://github.com/agentscope-ai/QwenPaw/blob/5c56644a6e130762a236f8c946103e95a0a1eec8/plugins/apps/qwenpaw-creator/backend/skills/edu-math-tutorial/SKILL.md) |
| [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | 32053 | Apache-2.0 | 12 | skill-infrastructure | [SKILL.md](https://github.com/iOfficeAI/OfficeCLI/blob/fb98e593612dee2cec36847666671dba502e60aa/SKILL.md) |
| [nanocoai/nanoclaw](https://github.com/nanocoai/nanoclaw) | 30955 | MIT | 63 | skill-infrastructure | [SKILL.md](https://github.com/nanocoai/nanoclaw/blob/19698fe2b007b6fa6c0283583df8d3d37a3000fa/.claude/skills/add-anydoc/SKILL.md) |
| [pascalorg/editor](https://github.com/pascalorg/editor) | 24894 | MIT | 4 | embedded-product-skill | [SKILL.md](https://github.com/pascalorg/editor/blob/3dd378b8eb933d711fa903140f74b02a1e9ab33f/.agents/skills/open-pr/SKILL.md) |
| [tradecatlabs/vibe-coding-cn](https://github.com/tradecatlabs/vibe-coding-cn) | 17583 | MIT | 24 | embedded-product-skill | [SKILL.md](https://github.com/tradecatlabs/vibe-coding-cn/blob/3cea2af6c1b6a6303fdf55d6850dec40b3eff2a6/.github/research/vibe-cybersecurity-cn/skills/smart-contract-audit/analyzing-ethereum-smart-contract-vulnerabilities/SKILL.md) |
| [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | 17451 | MIT | 2 | embedded-product-skill | [SKILL.md](https://github.com/citrolabs/ego-lite/blob/dca7003349c5f7132189ba00547cbbd7ff8e597e/.github/dev-skills/ego-lite-simplify/SKILL.md) |
| [latent-spaces/brag](https://github.com/latent-spaces/brag) | 16158 | MIT | 2 | embedded-product-skill | [SKILL.md](https://github.com/latent-spaces/brag/blob/069432cac935ed1895859df201c31436c07fb74e/skills/brag-slim/SKILL.md) |
| [eigent-ai/eigent](https://github.com/eigent-ai/eigent) | 15559 | Apache-2.0 | 6 | skill-infrastructure | [SKILL.md](https://github.com/eigent-ai/eigent/blob/6bcde0b0e2ad4d7bfdf332bed05fc7a18f023b5f/resources/example-skills/docx/SKILL.md) |
| [EverMind-AI/EverOS](https://github.com/EverMind-AI/EverOS) | 13439 | Apache-2.0 | 5 | skill-infrastructure | [SKILL.md](https://github.com/EverMind-AI/EverOS/blob/ec32f4b99070170afc8ff3195760ad5049c6fad3/.claude/skills/add-memory-kind/SKILL.md) |
| [krillinai/OpenCreator](https://github.com/krillinai/OpenCreator) | 13251 | Apache-2.0 | 15 | embedded-product-skill | [SKILL.md](https://github.com/krillinai/OpenCreator/blob/c5be806cb8dbb18350a805c776b572b36b0181ad/apps/daemon/runtime/opencreator-runtime/SKILL.md) |
| [OrchestratorInc/agent-orchestrator](https://github.com/OrchestratorInc/agent-orchestrator) | 13213 | Apache-2.0 | 7 | skill-infrastructure | [SKILL.md](https://github.com/OrchestratorInc/agent-orchestrator/blob/7dceb0ec7d2eddd4360692123a64e5bd3daf78eb/.agents/skills/ao-desktop-dev/SKILL.md) |
| [tw93/Kami](https://github.com/tw93/Kami) | 11973 | MIT | 2 | skill-infrastructure | [SKILL.md](https://github.com/tw93/Kami/blob/d9352d1321b24f37b53a6216ecae2543f8dc3a02/plugins/kami/skills/kami/SKILL.md) |
| [MemTensor/MemOS](https://github.com/MemTensor/MemOS) | 11880 | Apache-2.0 | 7 | skill-infrastructure | [SKILL.md](https://github.com/MemTensor/MemOS/blob/a7367d07e55db61099f7b4e2c1108bc5831a24f3/apps/memos-local-openclaw/site/public/SKILL.md) |
| [aden-hive/hive](https://github.com/aden-hive/hive) | 11108 | Apache-2.0 | 24 | embedded-product-skill | [SKILL.md](https://github.com/aden-hive/hive/blob/e44fdd933d011deae34ed6a9eba5773a27dbdf26/.claude/skills/browser-edge-cases/SKILL.md) |
| [pacifio/atlas](https://github.com/pacifio/atlas) | 9606 | Apache-2.0 | 6 | embedded-product-skill | [SKILL.md](https://github.com/pacifio/atlas/blob/bb8eb6acad9d64477cdb84f4f567ed93fd61c614/src-tauri/resources/skills/atlas-self-configure/SKILL.md) |
| [android/skills](https://github.com/android/skills) | 7842 | Apache-2.0 | 30 | skill-infrastructure | [SKILL.md](https://github.com/android/skills/blob/5bda39f154fb859a08d45e2392f3568e049f83fb/build-system/agp/agp-9-upgrade/SKILL.md) |
| [mvschwarz/openrig](https://github.com/mvschwarz/openrig) | 7513 | Apache-2.0 | 94 | skill-infrastructure | [SKILL.md](https://github.com/mvschwarz/openrig/blob/e0c65c41e429678272522eb5f9875583a69b48a5/.agents/skills/developing-openrig/SKILL.md) |
| [TokenRhythm/opensquilla](https://github.com/TokenRhythm/opensquilla) | 7099 | Apache-2.0 | 12 | embedded-product-skill | [SKILL.md](https://github.com/TokenRhythm/opensquilla/blob/05867ab0eb41bd8de491d46880094b1d949ca0af/src/opensquilla/skills/bundled/browser-use/SKILL.md) |
| [SawyerHood/dev-browser](https://github.com/SawyerHood/dev-browser) | 6666 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/SawyerHood/dev-browser/blob/a25e7672e199153b2f5b52a841a62436a28d925f/skills/dev-browser/SKILL.md) |
| [anysearch-ai/anysearch-skill](https://github.com/anysearch-ai/anysearch-skill) | 6525 | Apache-2.0 | 1 | embedded-product-skill | [SKILL.md](https://github.com/anysearch-ai/anysearch-skill/blob/9b91ee215164de60d61c7d63789c891a1948b039/SKILL.md) |
| [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper) | 6485 | MIT | 1 | geo-weather | [SKILL.md](https://github.com/gosom/google-maps-scraper/blob/d0b51bcf3cd56d9a3f71e049cb6e226554e24162/skills/google-maps-scraper/SKILL.md) |
| [kucherenko/jscpd](https://github.com/kucherenko/jscpd) | 6399 | MIT | 5 | embedded-product-skill | [SKILL.md](https://github.com/kucherenko/jscpd/blob/3cc4758c8b2cdb9fb05d19776e4e7d09d94c7988/skills/code-migration/SKILL.md) |
| [ThinkInAIXYZ/deepchat](https://github.com/ThinkInAIXYZ/deepchat) | 6362 | Apache-2.0 | 25 | skill-infrastructure | [SKILL.md](https://github.com/ThinkInAIXYZ/deepchat/blob/ec507626946e792ed387f1d1daf1dd5ce97e2bbf/.agents/skills/add-provider/SKILL.md) |
| [Q00/ouroboros](https://github.com/Q00/ouroboros) | 6229 | MIT | 24 | skill-infrastructure | [SKILL.md](https://github.com/Q00/ouroboros/blob/0d05d40dab5cd622ddde5b4f5116a1006da43038/skills/auto/SKILL.md) |
| [maziyarpanahi/openmed](https://github.com/maziyarpanahi/openmed) | 5693 | Apache-2.0 | 74 | skill-infrastructure | [SKILL.md](https://github.com/maziyarpanahi/openmed/blob/0386c53a27951ac51f7a94b3876c69e8e7f84393/skills/annotating-variants/SKILL.md) |
| [GargantuaX/gemini-watermark-remover](https://github.com/GargantuaX/gemini-watermark-remover) | 5670 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/GargantuaX/gemini-watermark-remover/blob/dcf688f34f4d05cc1c33236d104b4624314748ed/skills/gemini-watermark-remover/SKILL.md) |
| [metalbear-co/mirrord](https://github.com/metalbear-co/mirrord) | 5365 | MIT | 12 | embedded-product-skill | [SKILL.md](https://github.com/metalbear-co/mirrord/blob/c947633c3d294de31a210245bf7f871b4940c52c/mirrord/mcp/corpus/skills/mirrord-chaos/SKILL.md) |
| [aipoch/open-science](https://github.com/aipoch/open-science) | 4905 | Apache-2.0 | 25 | skill-infrastructure | [SKILL.md](https://github.com/aipoch/open-science/blob/608f6b3bf4d8ae5f5ca9972a8d74f950ed0bfd0b/resources/skills/alphafold2/SKILL.md) |
| [Observal/Observal](https://github.com/Observal/Observal) | 4484 | Apache-2.0 | 11 | embedded-product-skill | [SKILL.md](https://github.com/Observal/Observal/blob/d5f1063edd9e0e372eef1bf8f2f611956b10743d/.agents/skills/release/SKILL.md) |
| [zgsm-ai/costrict](https://github.com/zgsm-ai/costrict) | 4450 | Apache-2.0 | 3 | skill-infrastructure | [SKILL.md](https://github.com/zgsm-ai/costrict/blob/dd38f540d3c3171eee179792168a994d30a78292/.roo/skills/evals-context/SKILL.md) |
| [parcadei/Continuous-Claude-v3](https://github.com/parcadei/Continuous-Claude-v3) | 3944 | MIT | 160 | skill-infrastructure | [SKILL.md](https://github.com/parcadei/Continuous-Claude-v3/blob/d07ff4b06b62f43771bc0c927d0211b734d6149e/.claude/plugins/braintrust-tracing/skills/trace-claude-code/SKILL.md) |
| [evalstate/fast-agent](https://github.com/evalstate/fast-agent) | 3936 | Apache-2.0 | 3 | skill-infrastructure | [SKILL.md](https://github.com/evalstate/fast-agent/blob/470f95e269132323b798d2b16b50e2014badbe3f/design/fast-agent-system/SKILL.md) |
| [glitternetwork/pinme](https://github.com/glitternetwork/pinme) | 3747 | MIT | 7 | embedded-product-skill | [SKILL.md](https://github.com/glitternetwork/pinme/blob/7822b0501607786958ecb458f3bd02a061933efa/skills/pinme-auth/SKILL.md) |
| [Ar9av/obsidian-wiki](https://github.com/Ar9av/obsidian-wiki) | 3576 | MIT | 40 | skill-infrastructure | [SKILL.md](https://github.com/Ar9av/obsidian-wiki/blob/7a3d143eb854840caf620dc91435ed87f1deb820/.skills/claude-history-ingest/SKILL.md) |
| [FireRedTeam/FireRed-OpenStoryline](https://github.com/FireRedTeam/FireRed-OpenStoryline) | 3492 | Apache-2.0 | 7 | embedded-product-skill | [SKILL.md](https://github.com/FireRedTeam/FireRed-OpenStoryline/blob/c9e945215586f45c12a61c1951ee9a8e9c43a027/.claude/skills/openstoryline-install/SKILL.md) |
| [QingYunA/answer-me-with-html](https://github.com/QingYunA/answer-me-with-html) | 3454 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/QingYunA/answer-me-with-html/blob/96f1b3ce22ed3ff3b7d9919b7aec649e280cc52d/skills/answer-me-with-html/SKILL.md) |
| [rlaope/oh-my-hermes](https://github.com/rlaope/oh-my-hermes) | 3383 | MIT | 260 | skill-infrastructure | [SKILL.md](https://github.com/rlaope/oh-my-hermes/blob/9016989dbb1f0a89e014485baac3d0d141d3e774/.claude/skills/model-onboarding/SKILL.md) |
| [Jakeschincariol/replica-skill](https://github.com/Jakeschincariol/replica-skill) | 2756 | MIT | 11 | embedded-product-skill | [SKILL.md](https://github.com/Jakeschincariol/replica-skill/blob/77c9436fb3d18c3d58169efb8caf4fe906b0dc51/replica-architect/SKILL.md) |
| [oil-oil/oil-motion](https://github.com/oil-oil/oil-motion) | 2599 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/oil-oil/oil-motion/blob/07e31f2265f80caa8f2c1df825d85ac24a46307c/SKILL.md) |
| [zanwei/design-dna](https://github.com/zanwei/design-dna) | 1976 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/zanwei/design-dna/blob/593e39bc9e3652734653bd75544a333d7d43615e/SKILL.md) |

## 重点排除与后续审计

| 候选 | 原因 |
| --- | --- |
| `SnailSploit/Claude-Red` | security/offensive collection; excluded from daily catalog under attack/high-risk policy |
| `elementalsouls/Claude-BugHunter` | red-team/security collection; excluded from attack/high-risk policy |
| `Garyson26/Trident-SecOps-Skills` | security operations/red-team collection; excluded from high-risk policy |
| `aipoch/medical-research-skills` | part75 provenance defer remains: nested/upstream license scope is unresolved |
| `EthanYoQ/Skill-hub` | tree is dominated by archived/user-installed/generated copies; no independent canonical package boundary |
| `tinyplex/tinybase` | representative file is documentation/examples; public skill distribution evidence did not close |
| `NomaDamas/k-skill` | already indexed under existing source or incompatible generated runtime boundary |
| `Rationaliser/ros-llm-toolkit` | no SKILL.md in fixed tree; MCP/Claude docs alone fail admission |

完整证据见 [part81.audit.json](skill-repos.part81.audit.json)。本轮其余 146 个结构合格候选未选入当日清单，原因记录在候选池去重/风险筛选结果中，后续可按领域继续复核但不重复计数。
