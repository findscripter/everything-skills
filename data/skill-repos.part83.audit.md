# part83：2026-10-18 增量审核

北京时间 2026-10-18。固定本地/远端 main、zh 并集基线 **2268** 个仓库；本轮审核通过 **76** 个独立新仓库，目录合计 **2344**。另有 **43** 个经实质核验后排除或暂缓。

仅索引 README 级元数据，没有安装、执行候选或导入第三方技能正文。日目标是否完成以当日发布回执和两条发布分支的必要 CI 为准。

## 方法与边界

- Each repository counts once by canonical full_name and available repository ID against the fixed union of local and fetched remote catalog baselines.
- Search-only hits, historical branch imports, maintenance changes, client variants, routers, MCP tools, examples, templates, and generated mirrors do not count as daily repository additions.
- Skill counts have repository-specific semantics; no claim of globally unique skills, security certification, scientific validity, clinical effectiveness, or tested compatibility.
- Partial upstream overlap is recorded separately from an unmodified mirror. Root, near-directory, code, documentation, field-data, and external-service licenses remain distinct.
- A separate reviewer fetched fixed evidence for each accepted repository. Wrong commit/tree fields, a truncated response hash, and license symlink bytes were corrected before admission.
- 根检索取得 371 个唯一线索，其中 127 个已在基线；其余搜索命中不冒充审核通过项。其他来源与查询见检索记录。

## 合格新增

| 仓库 | Stars 快照 | 许可范围 | 公开技能计数 | 检索领域 |
| --- | ---: | --- | --- | --- |
| [mem0ai/mem0](https://github.com/mem0ai/mem0) | 67360 | Apache-2.0 | 6 | embedded-product-skill |
| [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) | 50413 | MIT | 9 | business-operations |
| [googleapis/mcp-toolbox](https://github.com/googleapis/mcp-toolbox) | 16674 | Apache-2.0 | 技能生成器 | skill-infrastructure |
| [scalar/scalar](https://github.com/scalar/scalar) | 16279 | MIT | 1 | embedded-product-skill |
| [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) | 15118 | MIT | 1 | commercial-creative |
| [yizhiyanhua-ai/fireworks-tech-graph](https://github.com/yizhiyanhua-ai/fireworks-tech-graph) | 11757 | MIT | 1 | commercial-creative |
| [rerun-io/rerun](https://github.com/rerun-io/rerun) | 11609 | Apache-2.0 | 12 | embedded-product-skill |
| [ariga/atlas](https://github.com/ariga/atlas) | 8780 | Apache-2.0 | 13 | embedded-product-skill |
| [HKUDS/OpenSpace](https://github.com/HKUDS/OpenSpace) | 7755 | MIT (tooling); benchmark/imported skills not relicensed | 2 host guides + tooling | skill-infrastructure |
| [mufeedvh/code2prompt](https://github.com/mufeedvh/code2prompt) | 7725 | MIT | 1 | embedded-product-skill |
| [TheWidlarzGroup/react-native-video](https://github.com/TheWidlarzGroup/react-native-video) | 7720 | MIT | 1 | embedded-product-skill |
| [Cocoon-AI/architecture-diagram-generator](https://github.com/Cocoon-AI/architecture-diagram-generator) | 7452 | MIT | 1 | commercial-creative |
| [Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design) | 5816 | MIT | 1 | commercial-creative |
| [emqx/MQTTX](https://github.com/emqx/MQTTX) | 5076 | Apache-2.0 | 1 | embedded-product-skill |
| [microsoft/apm](https://github.com/microsoft/apm) | 4031 | MIT (APM); dependencies retain upstream licenses | package manager | skill-infrastructure |
| [DingTalk-Real-AI/dingtalk-workspace-cli](https://github.com/DingTalk-Real-AI/dingtalk-workspace-cli) | 3723 | Apache-2.0 | 16 | embedded-product-skill |
| [memodb-io/Acontext](https://github.com/memodb-io/Acontext) | 3697 | Apache-2.0 | 1 installer (+2 runtime templates) | skill-infrastructure |
| [AlphaGBM/skills](https://github.com/AlphaGBM/skills) | 3668 | MIT | 多技能/研究方法 | business-operations |
| [google-deepmind/science-skills](https://github.com/google-deepmind/science-skills) | 3280 | Apache-2.0 (software); CC-BY-4.0 (other materials); external database terms | 37 + 3 support skills | science-lab |
| [nuxt-content/docus](https://github.com/nuxt-content/docus) | 3117 | MIT | 2 | embedded-product-skill |
| [alpic-ai/skybridge](https://github.com/alpic-ai/skybridge) | 2162 | MIT | 1 | embedded-product-skill |
| [lodev09/react-native-true-sheet](https://github.com/lodev09/react-native-true-sheet) | 2075 | MIT | 1 | embedded-product-skill |
| [MicrosoftDocs/mcp](https://github.com/MicrosoftDocs/mcp) | 1951 | CC-BY-4.0 (documentation); MIT (code) | 3 plugin + 1 CLI | embedded-product-skill |
| [Asymptote-Labs/agent-beacon](https://github.com/Asymptote-Labs/agent-beacon) | 1836 | MIT (skills/code); documentation and third-party pricing data retain separate terms | 5 | skill-infrastructure |
| [ai-evals-course/evals-skills](https://github.com/ai-evals-course/evals-skills) | 1523 | Apache-2.0 | 8（另含入口路由） | skill-infrastructure |
| [starknet-io/starknet.js](https://github.com/starknet-io/starknet.js) | 1255 | MIT | 1 | embedded-product-skill |
| [google-gemma/gemma-skills](https://github.com/google-gemma/gemma-skills) | 1025 | Apache-2.0 | 2 | embedded-product-skill |
| [SynaLinks/synalinks-skills](https://github.com/SynaLinks/synalinks-skills) | 907 | Apache-2.0 | 1 | embedded-product-skill |
| [mnemon-dev/mnemon](https://github.com/mnemon-dev/mnemon) | 638 | Apache-2.0 | 1 (17 client variants) | embedded-product-skill |
| [AlphaGBM/investment-masters](https://github.com/AlphaGBM/investment-masters) | 634 | MIT | 1 | business-operations |
| [tuya/tuya-openclaw-skills](https://github.com/tuya/tuya-openclaw-skills) | 482 | MIT | 1 | embedded-product-skill |
| [VisActor/skills](https://github.com/VisActor/skills) | 471 | MIT | 3 | embedded-product-skill |
| [alirezarezvani/ClaudeForge](https://github.com/alirezarezvani/ClaudeForge) | 431 | MIT; Karpathy-derived guidelines retain upstream attribution | 5 | skill-infrastructure |
| [ThinkfleetAI/memmesh](https://github.com/ThinkfleetAI/memmesh) | 420 | Apache-2.0 (open-source code/skills); hosted services separate | 6 integration + 18 plugin workflows | embedded-product-skill |
| [oracle/netsuite-suitecloud-sdk](https://github.com/oracle/netsuite-suitecloud-sdk) | 356 | UPL-1.0 | 10 | embedded-product-skill |
| [0xranx/golembot](https://github.com/0xranx/golembot) | 322 | MIT | 7 built-ins (+6 starter templates) | skill-infrastructure |
| [Abhinavbwj/Skills-Architects](https://github.com/Abhinavbwj/Skills-Architects) | 298 | MIT | 多技能 | cae-cad |
| [Geeksfino/finskills](https://github.com/Geeksfino/finskills) | 282 | Apache-2.0 | 15（中美市场版本） | business-operations |
| [brightdata/skills](https://github.com/brightdata/skills) | 266 | MIT (skill instructions); external service/data terms separate | 21 | embedded-product-skill |
| [BuildGreatProducts/builder-os](https://github.com/BuildGreatProducts/builder-os) | 230 | MIT | 7 tasks + 3 harness variants | business-operations |
| [OpenWonderLabs/switchbot-openapi-cli](https://github.com/OpenWonderLabs/switchbot-openapi-cli) | 135 | MIT | 1 | embedded-product-skill |
| [Abhinavbwj/Urban-Design-Skills-Claude](https://github.com/Abhinavbwj/Urban-Design-Skills-Claude) | 133 | MIT | 多技能 | public-interest-operations |
| [flysheep-ai/education-skills](https://github.com/flysheep-ai/education-skills) | 116 | MIT | 5 | education-learning |
| [Cocoon-AI/process-flow-diagram-generator](https://github.com/Cocoon-AI/process-flow-diagram-generator) | 103 | MIT | 1 | commercial-creative |
| [SteadfastAsArt/geoscience-skills](https://github.com/SteadfastAsArt/geoscience-skills) | 70 | MIT (skill instructions); bundled field data retain CC-BY-3.0/4.0 and hydro test fixture GPL-3.0 terms | 47 + 1 router | geo-weather |
| [joeseesun/qiaomu-learning](https://github.com/joeseesun/qiaomu-learning) | 68 | MIT | 1 | education-learning |
| [stbenjam/skillsaw](https://github.com/stbenjam/skillsaw) | 67 | Apache-2.0 (tool); fixtures and vendored schemas retain separate terms | 6 + linter | skill-infrastructure |
| [sadassimov/geemu-skill](https://github.com/sadassimov/geemu-skill) | 60 | MIT (original skill); CC-BY-4.0 / Apache-2.0 / MIT third-party references and dataset-specific terms | 1 | geo-weather |
| [Benny-Lewis/home-assistant-assistant](https://github.com/Benny-Lewis/home-assistant-assistant) | 57 | MPL-2.0 | 14 | embedded-product-skill |
| [sunxiayi/make-blender-education-video-skill](https://github.com/sunxiayi/make-blender-education-video-skill) | 56 | MIT; separately published demo media excluded | 1 | education-learning |
| [jokull/icelandic-data](https://github.com/jokull/icelandic-data) | 55 | MIT; public-source data retain their source terms | 55 + 1 maintainer skill | public-interest-operations |
| [skilluse/skilluse](https://github.com/skilluse/skilluse) | 55 | MIT | 基础设施 | skill-infrastructure |
| [handsomeZR-netizen/social-science-paperwork-skill](https://github.com/handsomeZR-netizen/social-science-paperwork-skill) | 48 | MIT | 1 | humanities-curation |
| [vikiboss/60s-skills](https://github.com/vikiboss/60s-skills) | 47 | MIT | 7 | geo-weather |
| [CaseMark/skills](https://github.com/CaseMark/skills) | 45 | Apache-2.0 | 多技能 | business-operations |
| [Qsnh/skillsgist](https://github.com/Qsnh/skillsgist) | 43 | MIT | 基础设施 | skill-infrastructure |
| [cooleava1-gif/Materials-Science-Skills](https://github.com/cooleava1-gif/Materials-Science-Skills) | 38 | MIT | 15 + 1 router | science-lab |
| [h9-tec/arabic-ai-atlas](https://github.com/h9-tec/arabic-ai-atlas) | 38 | MIT (code/instructions); CC-BY-4.0 (catalog data) | 5 | language-accessibility |
| [Zhonghao1995/agentic-swmm-workflow](https://github.com/Zhonghao1995/agentic-swmm-workflow) | 30 | MIT; external runtime and data providers retain their own terms | 16 + 1 authoring skill | geo-weather |
| [uw-ssec/rse-plugins](https://github.com/uw-ssec/rse-plugins) | 29 | BSD-3-Clause; containerization and zarr-chunk-optimization plugins MIT | 75 + 1 router | scientific-compute-hpc |
| [Sogni-AI/sogni-creative-agent-skill](https://github.com/Sogni-AI/sogni-creative-agent-skill) | 24 | MIT | 2（多客户端入口） | commercial-creative |
| [LengFeng00/research-gap-finder](https://github.com/LengFeng00/research-gap-finder) | 18 | MIT | 1 | literature-reference-management |
| [sshtomar/claude-code-skills-social-science](https://github.com/sshtomar/claude-code-skills-social-science) | 16 | MIT | 10 + 1 foundation skill | science-lab |
| [326389540-jpg/xugeyuan-music-education-skills](https://github.com/326389540-jpg/xugeyuan-music-education-skills) | 13 | MIT | 1 | education-learning |
| [Jignesh-Ponamwar/skills-mcp](https://github.com/Jignesh-Ponamwar/skills-mcp) | 10 | Apache-2.0 | 基础设施 | skill-infrastructure |
| [berba-q/faostat-skills](https://github.com/berba-q/faostat-skills) | 9 | MIT; upstream FAOSTAT data retain provider terms | 14 | agriculture-public-interest |
| [tanglele110-hash/museum-relic-stamp](https://github.com/tanglele110-hash/museum-relic-stamp) | 9 | MIT (scripts/instructions); CC-BY-4.0 (original visuals); third-party image/font terms | 1 | humanities-curation |
| [jo-inc/safe-skill-search](https://github.com/jo-inc/safe-skill-search) | 8 | MIT | 基础设施 | skill-infrastructure |
| [raphysicst-create/science-teacher-skills](https://github.com/raphysicst-create/science-teacher-skills) | 8 | Apache-2.0; Common Core reference material retains separate public-license terms | 2 | education-learning |
| [Vambrocop/EvidenceForge](https://github.com/Vambrocop/EvidenceForge) | 7 | MIT | 5 | science-lab |
| [shikaijieskj/science-skills](https://github.com/shikaijieskj/science-skills) | 5 | MIT | 9 | science-lab |
| [carla-simulator/carla-agentic-tools](https://github.com/carla-simulator/carla-agentic-tools) | 4 | MIT | 60 | robotics-embedded |
| [AI-Marketing-OS-LTD/cmo-so-skills](https://github.com/AI-Marketing-OS-LTD/cmo-so-skills) | 2 | MIT; adapted third-party notices retained | 多技能 | business-operations |
| [Eternity-487/Teach3D](https://github.com/Eternity-487/Teach3D) | 2 | MIT; externally sourced 3D assets require their original permissions | 1 | education-learning |
| [sunzhaokai95/curation-research-skill](https://github.com/sunzhaokai95/curation-research-skill) | 2 | MIT | 1 | humanities-curation |
| [Insightful-Pipe/marketing-skills](https://github.com/Insightful-Pipe/marketing-skills) | 0 | MIT | 77（另含路由） | business-operations |

## 审核中修正的证据

- 科学组的 22 个 tree 字段初稿误填为 commit SHA；独立请求固定 commit API 后改为真实 Git tree SHA，旧值与修订原因保留在机器审核中。
- UW RSE 的 containerization 与 zarr-chunk-optimization 均为 MIT；三个 BSD 许可路径是 `../../LICENSE` 符号链接，分别记录链接字节哈希与根许可解析目标。
- Cocoon 流程图技能首次 HTTP 响应被截断；固定 raw 文件与 Git blob/base64 两条独立路径均返回完整 17,492 字节，并与树中 blob 一致。修正后的 SHA-256 与旧值保留在审核中。
- 基础设施包不按测试 fixture 数计技能；兼容客户端副本、嵌入副本、路由入口、模板、历史版和 MCP 工具都与公开任务分开说明。

## 暂缓与排除

| 仓库 | 原因 |
| --- | --- |
| `agenticros/agenticros-skills` | No license; README explicitly says robotics npm skill contract, not Agent Skills. Metadata marketplace deferred. |
| `appwrite/appwrite` | README install resolves appwrite/agent-skills, while in-repo SKILLs are internal console SEO/blog workflows. |
| `arcadeai-labs/smithery-cli` | Deferred until README install identities smithery/cli and smithery-ai/cli are mapped conclusively to the current canonical source. |
| `c-kick/hnl-agent-skills` | No declared repository license found; 23 files not sufficient admission evidence. |
| `ChatGPT3a01/claude-educational-ai-skills` | No exact public SKILL.md file in fixed tree; ordinary Markdown prompts do not satisfy skill entry contract. |
| `ComeOnOliver/skillshub` | Large imported skill mirror pool with 11690 SKILL files; not independent skill-content source. Raw read failed SSL once; not needed for admission. |
| `D-Robotics/device-knowledge` | Real original device knowledge and MIT present, but overlaps existing D-Robotics/rdk-skills hub and includes Apache vendored Anthropic maintainer skills; defer until upstream/hub overlap checked. |
| `dungnotnull/early-childhood-education-advisor-agent-skill` | No exact public SKILL.md file in fixed tree. |
| `evloghq/evlog` | Public usage SKILL files found, but root README did not establish distribution; further package README/CLI install review deferred. |
| `firebase/firebase-tools` | README install resolves firebase/agent-skills; local skill files are maintainer tasks. |
| `firecrawl/firecrawl` | Build skills authored here are CI-synced to already indexed firecrawl/skills; substantial overlap and common canonical source, no new independent catalog credit. |
| `GBA-BI/EpiClaw` | README describes copied/imported skill library for teammates; representative metadata homepage points to tsunyu/epiclaw. Canonical upstream and independent substance unresolved. |
| `genkit-ai/genkit` | README points to already indexed genkit-ai/skills; local files are mostly SDK demonstrations/internal tooling. |
| `GISWLH/IPCC` | No LICENSE/explicit reuse grant in fixed tree, despite root SKILL.md. |
| `github/copilot-sdk` | No SKILL.md in the inspected tree; generic agent SDK not counted as a skill package. |
| `hamelsmu/evals-skills` | Archived/deprecated predecessor; README names active ai-evals-course/evals-skills successor admitted instead. |
| `JohnnyChen1113/claw4science-skills` | All README installation commands use bioinfoark/claw4science-skills, whose API endpoint returns 404; installation source drift unresolved. |
| `jpudysz/react-native-unistyles` | Skill and install verified, but no license text found anywhere in pinned tree. README MIT badge alone deferred. |
| `KRASA-AI/education-ai-skills` | No exact public SKILL.md file in fixed tree. |
| `lamm-mit/ScienceSkills` | Deferred: original physics skills promising, but root Apache vs per-skill BSD/MIT and reusable upstream collection sections require a complete scope audit. |
| `livekit/agents` | No SKILL files; advertised package is external livekit/agent-skills. |
| `Lucaswangzcx/literature-downloader-skill` | Deferred: potential copyright-sensitive full-text downloader; not manually cleared for source/access policy this round. |
| `microsoft/WindowsAppSDK` | Only issue triage, triage meeting and worktree maintainer workflows; no public consumer skill distribution. |
| `naliehu/science-skills` | Deferred: mixed scientific/synthetic biology/biotoxin workflows and parent/child router accounting need separate risk and content scope review; not cleared only from root MIT. |
| `neuml/txtai` | General semantic-search framework without a concrete distributed SKILL or skill-specific infrastructure contract in this review. |
| `oujingzhou/skillbase` | No declared repository license found. |
| `poorvith-mp/skillary` | Hub-only follow-up; not counted separately from domain collections this round. |
| `poorvith-mp/skills-education` | Deferred: 35 skill files vs 21 documented, hub relation/canonical source and duplicate/alias counting require follow-up. |
| `ProvableHQ/sdk` | The only SKILL teaches writing the SDK tutorial/docs/templates, not external application usage; README generic agent support is insufficient. |
| `ritual-foundation/ritual-dapp-skills` | Public dapp skills exist; contract and wallet execution boundaries deferred. |
| `scdenney/open-science-skills` | Already in local baseline; not a new independent repository. |
| `spiceai/spiceai` | No SKILL files; advertised skill source is spiceai/skills. |
| `spree/spree` | README installs from spree/agent-skills while local .agents files are contributor workflows; source product is not counted again. |
| `TeoSlayer/pilot-skills` | Public protocol skills exist, but daemon-driven periodic injection/refresh of host skill directories needs a separate side-effect review. |
| `thecolab-ai/.skills` | Deferred: public data pack promising but aggregate also includes high-risk authenticated personal banking entry and Anthropic proprietary pptx/LICENSE.txt; needs scoped pack admission rather than blanket 190-file count. |
| `tinyhumansai/skill-registry` | No declared repository license found; sample git-summary not proof of licensed published registry. |
| `Trac-Systems/intercom` | Public root skill exists; transaction/network runtime boundaries need further review. |
| `trustwallet/tw-agent-skills` | Public licensed skills exist; wallet-operation boundary review deferred, not classified as missing-license. |
| `vercel/ai` | Several real public-usage skill files exist, but root README did not establish their public distribution in this review; internal engineering and sample files interleaved. Deferred rather than counted. |
| `wsimmonds/claude-nextjs-skills` | README describes Next.js benchmark POC and before/after scores; lacks explicit public skill installation/consumption entry. Not using benchmark assets as independently distributed skills. |
| `YerayL/Science-Research-Writing-Skills` | Deferred: framework/reference files explicitly extracted from commercial writing book; MIT root is insufficient to confirm all referenced material rights. |
| `zjp1997720/zhijian-skills` | Public source exists, but model bridges/client routing and nested license scope need deeper review; not selected merely to increase count. |
| `zocomputer/skills` | Mixed vendor and community skill distribution; blanket root MIT not used for every community item. Deferred pending per-content provenance. |

## 文件与验证

- [正式数据](skill-repos.part83.jsonl) · [机器审核](skill-repos.part83.audit.json) · [检索记录](skill-repos.part83.search-provenance.json)
- [当日基线](discovery/2026-10-18/baseline.json) · [当日新增清单](discovery/2026-10-18/additions.json)
- 发布前依次执行 main 英文、zh 中文全量生成和一致性检查，以及仓库要求的 18 项回归测试；最终远端提交与 CI 见当日发布回执。
