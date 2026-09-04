# 技能仓库总目

> 由 scripts/build-skill-repos.mjs 生成，请改 data/skill-repos.jsonl，勿手改本文件。

本文件只收录 GitHub 上的技能库/市场/精选列表，依据各库 README 摘要，不收录对方源码，也不复制对方 SKILL.md 正文。

标注哪些已被 [findscripter/everything-skills](https://github.com/findscripter/everything-skills) 采编进技能正文（见 INDEX/sources.md）。

- 编制日期：2026-09-04（Asia/Shanghai）
- Stars：GitHub Search API 当日快照，非估算
- 收录条数：315 个独立仓库（另注明更名别名）
- 读取方式：GitHub API 读各库 README；未 clone 任何第三方仓库

## 检索与截断

只收 SKILL.md 集合、插件市场、awesome-*-skills、官方目录、垂直技能包、注册表与安装器；也收仓库名不含 skill/agent、但 README 证明可安装的技能包。不倾销 topic:agent-skills。未读到 README 的不入表。

检索覆盖：GitHub topic/org/code search、skills.sh、ClawHub、HN/Reddit/V2EX/即刻/小红书、awesome 外链、`npx skills add`、`.claude-plugin/marketplace.json`。

### 更名与后继

- sickn33/antigravity-awesome-skills → sickn33/agentic-awesome-skills
- affaan-m/everything-claude-code → affaan-m/ECC
- ComposioHQ/awesome-codex-skills → composio-community/awesome-codex-skills
- aaron-he-zhu/seo-geo-claude-skills → aaron-marketing-skills（v9.9.12 冻结）
- openai/skills → openai/plugins
- vercel-labs/next-skills → vercel/next.js skills/
- gsd-build/get-shit-done → open-gsd/gsd-core

### 已采编来源

见 INDEX/sources.md（18 个上游，不论星标一律收录）。

未纳入：InternScience/Awesome-Scientific-Skills（无根 README）、WorldFlowAI/everything-claude-code（ECC 第三方警告）、攻击向/无 README 仓。

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
| [browserbase/skills](https://github.com/browserbase/skills) | 3,708 | Browserbase 官方浏览器自动化技能：browser/functions/trace/autobrowse/safe-browser/search/ui-test 等；npx skills add browserbase/skills。 | README 未单列 SPDX | 18 | 仅索引 |
| [hashicorp/agent-skills](https://github.com/hashicorp/agent-skills) | 858 | HashiCorp 官方 Terraform 16 条 + Packer 4 条 Agent Skills；npx skills add 与 Claude/Codex 产品插件包 terraform@hashicorp / packer@hashicorp。 | MPL-2.0 | 20 | 仅索引 |
| [angular/skills](https://github.com/angular/skills) | 630 | Angular 官方编码技能：angular-developer 与 angular-new-app，npx skills add angular/skills；源在 angular/angular 的 skills/dev-skills。 | README 未单列 SPDX | 2 | 仅索引 |
| [elastic/agent-skills](https://github.com/elastic/agent-skills) | 566 | Elastic 官方技能：Cloud/Elasticsearch/Kibana/Observability/Security 五组，npx skills add elastic/agent-skills 与 Claude/Copilot 插件市场。 | Apache-2.0 | 36 | 仅索引 |
| [ClickHouse/agent-skills](https://github.com/ClickHouse/agent-skills) | 523 | ClickHouse 官方技能：best-practices/architecture/JS troubleshooting/chdb/infra/ClickStack OTel；npx skills add 与 clickhousectl skills。 | Apache-2.0 | 8 | 仅索引 |
| [LambdaTest/agent-skills](https://github.com/LambdaTest/agent-skills) | 364 | TestMu AI（原 LambdaTest）官方测试技能：Selenium/Playwright/Cypress 等跨语言框架，npx agentskillsforall add。 | README 未单列 SPDX | 测试框架技能包 | 仅索引 |
| [qdrant/skills](https://github.com/qdrant/skills) | 230 | Qdrant 官方向量检索技能：scaling/sizing/search-quality/multitenancy/model-migration 等 + Advisor 元技能。 | README 未单列 SPDX | 11 | 仅索引 |
| [OpenZeppelin/openzeppelin-skills](https://github.com/OpenZeppelin/openzeppelin-skills) | 208 | OpenZeppelin 官方安全合约技能：Solidity/Cairo/Stylus/Stellar/Sui 的 setup/upgrade/review。 | AGPL-3.0 | 11 | 仅索引 |
| [resend/resend-skills](https://github.com/resend/resend-skills) | 169 | Resend 官方邮件技能：resend/agent-email-inbox/resend-cli/react-email/email-best-practices，兼 MCP。 | MIT | 5 | 仅索引 |
| [circlefin/skills](https://github.com/circlefin/skills) | 145 | Circle 官方稳定币技能：USDC/CCTP/wallets/Gateway/Arc/agent-wallet 等，npx skills add circlefin/skills。 | Apache-2.0 | 18 | 仅索引 |
| [redis/agent-skills](https://github.com/redis/agent-skills) | 137 | Redis 官方技能：core/connections/search/semantic-cache/clustering/security/observability/iris-development。 | MIT | 8 | 仅索引 |
| [Shopify/agent-skills](https://github.com/Shopify/agent-skills) | 71 | Shopify 官方技能：Admin/Storefront/Functions/Hydrogen/Liquid/Polaris 扩展等 15 条；npx skill install。 | README 未单列 SPDX | 15 | 仅索引 |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | 14,799 | GSAP 官方动画技能 8 条：core/timeline/ScrollTrigger/plugins/utils/react/performance/frameworks；npx skills add greensock/gsap-skills。 | MIT | 8 | 仅索引 |
| [google-gemini/gemini-skills](https://github.com/google-gemini/gemini-skills) | 3,969 | Gemini API 官方技能：gemini-api-dev / live-api / omni-flash；npx skills add google-gemini/gemini-skills。非官方支持产品。 | README 未单列 SPDX | 3 | 仅索引 |
| [aws/agent-toolkit-for-aws](https://github.com/aws/agent-toolkit-for-aws) | 2,503 | AWS 官方 Agent Toolkit：aws-core/agents/data-analytics/devsecops 四插件 + MCP；README 称后继 awslabs/agent-plugins；npx skills add aws/agent-toolkit-for-aws/skills。 | Apache-2.0 | 4 插件 | 仅索引 |
| [apify/agent-skills](https://github.com/apify/agent-skills) | 2,362 | Apify 官方 5 条：ultimate-scraper/actor-development/actorization/output-schema/sdk-integration；npx skills add。社区精选见 apify/awesome-skills。 | Apache-2.0 | 5 | 仅索引 |
| [WordPress/agent-skills](https://github.com/WordPress/agent-skills) | 2,093 | WordPress 官方 17 条：blocks/themes/plugins/REST/Playground 等；npx skills add WordPress/agent-skills。 | GPL-2.0-or-later | 17 | 仅索引 |
| [langchain-ai/langchain-skills](https://github.com/langchain-ai/langchain-skills) | 1,190 | LangChain/LangGraph/Deep Agents 21 条技能；npx skills add langchain-ai/langchain-skills。早期开发。 | README 未单列 SPDX | 21 | 仅索引 |
| [getsentry/skills](https://github.com/getsentry/skills) | 974 | Sentry 团队官方开发技能约 27 条 + 2 子代理；npx skills add getsentry/skills。产品接入技能另见 getsentry/sentry-for-ai。 | Apache-2.0 | 约 27 | 仅索引 |
| [planetscale/database-skills](https://github.com/planetscale/database-skills) | 651 | PlanetScale 官方数据库技能：mysql/postgres/vitess/neki；npx skills add planetscale/database-skills。 | README 未单列 SPDX | 4 | 仅索引 |
| [posit-dev/skills](https://github.com/posit-dev/skills) | 488 | Posit 官方 Claude 技能：R 包/Shiny/Quarto/Connect/GitHub PR 等分类；npx skills add posit-dev/skills。 | MIT | 约 20+ | 仅索引 |
| [elevenlabs/skills](https://github.com/elevenlabs/skills) | 438 | ElevenLabs 官方 TTS/STT/agents/SFX/music/dubbing 等 10 条；npx skills add elevenlabs/skills。 | MIT | 10 | 仅索引 |
| [microsoft/skills-for-copilot-studio](https://github.com/microsoft/skills-for-copilot-studio) | 428 | 微软 Copilot Studio STANDARD agent YAML 插件：manage/author/test/advisor 四子代理。实验性、非官方支持产品。 | README 未单列 SPDX | 4 子代理 | 仅索引 |
| [microsoft/win-dev-skills](https://github.com/microsoft/win-dev-skills) | 406 | 微软 WinUI 3 / Windows App SDK 技能 8 条 + winui-dev 编排代理；Copilot/Claude/Codex 插件市场。Preview。 | MIT | 8 | 仅索引 |
| [amd/skills](https://github.com/amd/skills) | 322 | AMD 官方 Agent Skills：Ryzen AI 本地推理、Instinct LLM serving、ROCm 诊断等；npx skills add amd/skills。 | MIT | 约 7 | 仅索引 |
| [databricks/databricks-agent-skills](https://github.com/databricks/databricks-agent-skills) | 293 | Databricks 官方稳定技能 29 条（core/jobs/pipelines/Unity Catalog 等）；databricks aitools install 与多宿主插件市场。 | README 未单列 SPDX | 29 | 仅索引 |
| [vercel/vercel-plugin](https://github.com/vercel/vercel-plugin) | 273 | Vercel 官方插件：35 条生态技能 + 3 专家代理 + 知识图谱；npx plugins add vercel/vercel-plugin。 | Apache-2.0 | 35 | 仅索引 |
| [mongodb/agent-skills](https://github.com/mongodb/agent-skills) | 181 | MongoDB 官方 Atlas 插件 + 查询/schema/Search/Vector 技能；npx skills add mongodb/agent-skills。 | README 未单列 SPDX | 官方插件包 | 仅索引 |
| [langchain-ai/langsmith-skills](https://github.com/langchain-ai/langsmith-skills) | 153 | LangSmith 观测技能 3 条：trace/dataset/evaluator；npx skills add langchain-ai/langsmith-skills。 | README 未单列 SPDX | 3 | 仅索引 |
| [black-forest-labs/skills](https://github.com/black-forest-labs/skills) | 114 | Black Forest Labs FLUX 图像/视频官方技能：prompt 实践、BFL API、FLUX 3 视频套件；npx skills add。 | MIT | 约 10 | 仅索引 |
| [firecrawl/skills](https://github.com/firecrawl/skills) | 98 | Firecrawl 官方技能目录（CI 同步）：core CLI/MCP、build SDK、workflows；npx skills add firecrawl/skills。 | ISC | 核心+构建+工作流 | 仅索引 |
| [wandb/skills](https://github.com/wandb/skills) | 67 | Weights & Biases 官方训练/评测技能 3 条（experimental）；npx skills add wandb/skills。 | README 未单列 SPDX | 3 | 仅索引 |
| [replicate/skills](https://github.com/replicate/skills) | 55 | Replicate 官方模型检索/对比/运行/发布与图视频 prompting 7 条；npx skills add replicate/skills。 | README 未单列 SPDX | 7 | 仅索引 |
| [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | 41,822 | Vercel 官方浏览器自动化 CLI + 可安装 Agent Skill（发现桩 + CLI 热加载 core）；npx skills add vercel-labs/agent-browser。仓库名含 agent。 | Apache-2.0 | CLI + 发现技能 | 仅索引 |
| [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) | 13,042 | 微软 Playwright CLI with SKILLS：playwright-cli install --skills，面向编码代理的浏览器 CLI（相对 MCP 更省 token）。 | Apache-2.0 | CLI + 技能套件 | 仅索引 |
| [figma/mcp-server-guide](https://github.com/figma/mcp-server-guide) | 1,952 | Figma 官方 MCP 指南仓：Cursor/Claude 插件含 Agent Skills；另有 video-interaction-mapper / generate-project-plan 独立工作流技能。README 标明 Beta。 | README 未单列 SPDX | 官方插件技能 + 2 工作流 | 仅索引 |
| [higgsfield-ai/skills](https://github.com/higgsfield-ai/skills) | 853 | Higgsfield 官方 9 条：generate/soul-id/photoshoot/brandkit/marketplace-cards/websites/explainer/thumbnail/game-generation；npx skills add higgsfield-ai/skills。 | MIT | 9 | 仅索引 |
| [NVIDIA-BioNeMo/bionemo-agent-toolkit](https://github.com/NVIDIA-BioNeMo/bionemo-agent-toolkit) | 445 | NVIDIA BioNeMo 生命科学官方技能：Boltz-2/DiffDock/Evo2/GenMol/OpenFold/RFdiffusion/Parabricks 等 NIM 与工作流；npx skills add。双许可。 | Apache-2.0 / CC-BY-4.0 文档 | 约 30+ | 仅索引 |
| [neondatabase/postgres-skills](https://github.com/neondatabase/postgres-skills) | 29 | Neon 官方厂商无关 Postgres 最佳实践技能（schema/索引/查询）；npx skills add neondatabase/postgres-skills。与 neondatabase/agent-skills 并列。 | Apache-2.0 | 1+ | 仅索引 |
| [TheQtCompanyRnD/agent-skills](https://github.com/TheQtCompanyRnD/agent-skills) | 400 | Qt 官方 12 条：C++/QML review、UI、docs、profiler、test、Figma tokens/components、CMake；Claude 插件市场 + npx skills add + Gemini 扩展。 | BSD-3-Clause | 12 | 仅索引 |
| [NVIDIA/nvidia-kaggle](https://github.com/NVIDIA/nvidia-kaggle) | 309 | NVIDIA 官方 Kaggle 插件：竞赛综述/writeup/kernel 复现/提交；Codex/Claude 插件市场 + SKILL.md。 | MIT | 1 + 市场插件 | 仅索引 |
| [huggingface/pwc-cli](https://github.com/huggingface/pwc-cli) | 112 | Hugging Face 官方 Papers with Code CLI + `pwc skills add` 生成匹配版本的 Agent Skill。 | README 未单列 SPDX | CLI + 1 技能 | 仅索引 |
| [elastic/elastic-docs-skills](https://github.com/elastic/elastic-docs-skills) | 71 | Elastic 官方文档工作流技能目录；Claude 插件市场 + npx skills add elastic/elastic-docs-skills。 | Apache-2.0 | 文档技能目录 | 仅索引 |
| [huggingface/transformers-to-mlx](https://github.com/huggingface/transformers-to-mlx) | 51 | Hugging Face 官方：把 transformers LLM 移植到 mlx-lm 的 Agent Skill（`uvx hf skills add`）。 | README 未单列 SPDX | 1 | 仅索引 |
| [NVIDIA/nurec-skills](https://github.com/NVIDIA/nurec-skills) | 34 | NVIDIA Omniverse NuRec 官方 6 条：nurec-index/datasets/ncore/nre/asset-harvester/nurec-fixer。 | CC-BY-4.0 AND Apache-2.0 | 6 | 仅索引 |
| [huggingface/s2-cli](https://github.com/huggingface/s2-cli) | 27 | Hugging Face 官方 Semantic Scholar CLI + SKILL.md（引用/被引/检索）。 | README 未单列 SPDX | CLI + 1 技能 | 仅索引 |
| [huggingface/physics-intern-skills](https://github.com/huggingface/physics-intern-skills) | 21 | Hugging Face PhysicsIntern：理论物理/数学研究工作流，8 条 slash 技能，适配 Claude/Codex/OpenCode/Pi。 | README 未单列 SPDX | 8 | 仅索引 |
| [elastic/integration-skills](https://github.com/elastic/integration-skills) | 15 | Elastic 官方集成包技能：research/create-integration + CEL/ingest/ECS 等域技能；npx skills add。Beta。 | Apache-2.0 | 2 顶层 + 11 域 | 仅索引 |
| [trycourier/courier-skills](https://github.com/trycourier/courier-skills) | 13 | Courier 官方通知技能：email/SMS/push/inbox/Slack/Teams/WhatsApp；npx skills add trycourier/courier-skills。 | MIT | 1 包（多参考） | 仅索引 |
| [NVIDIA/digital-health-skills](https://github.com/NVIDIA/digital-health-skills) | 10 | NVIDIA Digital Health 官方临床 ASR 四段技能：setup/build/eval/finetune。 | Apache-2.0 | 4 | 仅索引 |
| [astronomer/agents](https://github.com/astronomer/agents) | 432 | Astronomer 官方 Airflow/数仓技能 20+（DAG/dbt/lineage/分析）+ MCP；npx skills add astronomer/agents。 | Apache-2.0 | 20+ | 仅索引 |
| [remix-run/agent-skills](https://github.com/remix-run/agent-skills) | 137 | Remix 官方 React Router 三模式技能（已归档，后继 `npx skills add remix-run/react-router --skill react-router`）。 | MIT | 3（已归档） | 仅索引 |
| [sanity-io/agent-toolkit](https://github.com/sanity-io/agent-toolkit) | 180 | Sanity 官方 4 条技能 + MCP/Claude/Cursor/Codex 插件；npx skills add sanity-io/agent-toolkit。 | MIT | 4 | 仅索引 |
| [coderabbitai/skills](https://github.com/coderabbitai/skills) | 165 | CodeRabbit 官方 code-review / autofix 技能，适配 35+ 代理；npx skills add coderabbitai/skills。 | MIT | 2 | 仅索引 |

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
| [brycewang-stanford/Awesome-Journal-Skills](https://github.com/brycewang-stanford/Awesome-Journal-Skills) | 1,053 | 斯坦福 REAP × CoPaper.AI 期刊技能包：README 宣称 4166 条技能、300 pack、744 venue，覆盖 11 学科投稿规范。 | MIT | 4166 / 300 pack | 仅索引 |
| [fleurytian/awesome-claude-skills](https://github.com/fleurytian/awesome-claude-skills) | 316 | 小红书@如宝 的 Claude Skills：McKinsey 顾问 PPT、咪蒙写作、find-session、美国政府停摆追踪。 | MIT | 4 | 仅索引 |
| [apify/awesome-skills](https://github.com/apify/awesome-skills) | 248 | Apify 社区 Actor 技能精选 13 条（广告情报/地图线索/电商/OSINT 等），npx skills add apify/awesome-skills。 | Apache-2.0 | 13 | 仅索引 |
| [JackyST0/awesome-agent-skills](https://github.com/JackyST0/awesome-agent-skills) | 629 | V2EX 帖整理的跨 Cursor/Claude/Copilot Agent Skills awesome + 5 条示例技能与安装脚本。 | README 未单列 SPDX | 精选列表 + 5 示例 | 仅索引 |
| [figma/community-resources](https://github.com/figma/community-resources) | 843 | Figma 社区开源资源目录：独立 Agent Skill Resources 分表（tokens/组件/无障碍/FigJam 等），指向 southleft/skills-for-figma 等。非官方背书。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [jakubkrehel/skills](https://github.com/jakubkrehel/skills) | 4,766 | Interfaces.dev UI 技能包（typography/colors/a11y 等）；`npx skills add` + Claude 插件市场。 | 未在首页单列 SPDX | 约 11 | 仅索引 |
| [BuilderIO/skills](https://github.com/BuilderIO/skills) | 4,160 | Builder.io Agent-Native 技能包（visual-plan/recap/webmcp 等）；`npx @agent-native/skills` + 插件市场。 | 未在首页单列 SPDX | 约 13 | 仅索引 |
| [Hisn00w/ASu-skills](https://github.com/Hisn00w/ASu-skills) | 3,188 | 中文求职工作流插件：9 入口（简历/面试/开源贡献/投递）；Claude/Codex/Trae 插件。 | MIT | 9 | 仅索引 |
| [JasonColapietro/suede-creator-skills](https://github.com/JasonColapietro/suede-creator-skills) | 129 | 74 个开源 Creator/营销/代码评审技能包（A–F ship grade）；Claude/Codex 插件 + `npx skills add`。 | MIT + BSD（NOTICE） | 74 | 仅索引 |
| [neondatabase/agent-skills](https://github.com/neondatabase/agent-skills) | 85 | Neon 官方 Agent Skills（Postgres/Auth/Object Storage/AI Gateway 等）；`npx skills add` + 插件。 | 未在首页单列 SPDX | 约 8 | 仅索引 |
| [mxyhi/ok-skills](https://github.com/mxyhi/ok-skills) | 480 | 精选编码 Agent 技能合集 31 条（planning/docs/browser/design 等）；clone 到 ~/.agents/skills。 | 见 LICENSE | 31 | 仅索引 |
| [Dominic789654/awesome-deepseek-harness](https://github.com/Dominic789654/awesome-deepseek-harness) | 220 | DeepSeek Harness（DSH）插件/技能/MCP 精选列表。 | README 未单列 SPDX | awesome 列表 | 仅索引 |

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
| [jnMetaCode/superpowers-zh](https://github.com/jnMetaCode/superpowers-zh) | 7,944 | obra/superpowers 中文增强版：14 翻译 + 6 中国特色技能，npx superpowers-zh 适配 23 款编码代理。 | MIT | 20 | 仅索引 |
| [MengTo/Skills](https://github.com/MengTo/Skills) | 5,726 | Meng To 设计/游戏/Web 技能库：123 条 SKILL.md（Codex 工作流、Three.js 游戏、落地页动效）。 | MIT | 123 | 仅索引 |
| [SamurAIGPT/Generative-Media-Skills](https://github.com/SamurAIGPT/Generative-Media-Skills) | 4,205 | 生成式媒体 Agent Skills：MuAPI CLI + 41 条图像/视频/社交配方，npx skills add SamurAIGPT/Generative-Media-Skills。 | MIT | 41+ 配方 | 仅索引 |
| [ScrapeCreators/social-media-research-skills](https://github.com/ScrapeCreators/social-media-research-skills) | 1,973 | 社交研究技能 13 条：outlier/transcript/comments/ads/trends/influencer 等，npx skills add。 | README 未单列 SPDX | 13 | 仅索引 |
| [AIDevGTM/gtm-cofounder](https://github.com/AIDevGTM/gtm-cofounder) | 261 | Product Hunt #1：开发者工具 GTM 技能（定位/首批用户/发布/定价），npx skills add AIDevGTM/gtm-cofounder。 | MIT | 约 18 | 仅索引 |
| [SkyworkAI/Skywork-Skills](https://github.com/SkyworkAI/Skywork-Skills) | 203 | 天工办公技能 6 条：PPT/文档/Excel/图像/搜索/音乐；npx skills add SkyworkAI/Skywork-Skills。 | MIT | 6 | 仅索引 |
| [internet-court/internet-court-skill](https://github.com/internet-court/internet-court-skill) | 5,323 | Agent 间交易信任层总技能：路由 + 91 个 vendored 协议技能；插件市场 / `npx skills add`。 | MIT（vendored 各遵上游） | 1 + 91 vendored | 仅索引 |
| [s1dashu/ip-as-logo-skill](https://github.com/s1dashu/ip-as-logo-skill) | 4,787 | 极简 IP 吉祥物 Logo Agent Skill；`npx skills add s1dashu/ip-as-logo-skill`。 | MIT | 1 | 仅索引 |
| [larashero3-dotcom/lieflat-charts](https://github.com/larashero3-dotcom/lieflat-charts) | 3,751 | 编辑向数据可视化 Agent Skill（Lupi/Glance + 12 套报告模板）；`npx skills add`。 | PolyForm Noncommercial 1.0.0 | 1 | 仅索引 |
| [isjiamu/gzh-design-skill](https://github.com/isjiamu/gzh-design-skill) | 3,472 | 微信公众号 Markdown→内联 HTML 排版技能；6 主题 + 校验脚本；`npx skills add`。 | AGPL-3.0 | 1 | 仅索引 |
| [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) | 3,202 | Cloudflare 开源的多阶段安全审计 Agent Skill；`npx skills add`，产出 findings.json。 | MIT | 1 | 仅索引 |
| [karanb192/itr-wala](https://github.com/karanb192/itr-wala) | 846 | 印度 ITR 报税 Agent Skill：确定性 Python 税引擎 + AI 读单；插件 / `npx skills add`。 | MIT | 1 | 仅索引 |
| [amElnagdy/guard-skills](https://github.com/amElnagdy/guard-skills) | 1,221 | 编码代理质检闸门 5 条：clean-code/test/docs/wp/woo-guard；npx skills add amElnagdy/guard-skills。 | MIT | 5 | 仅索引 |
| [SeanJ1ang/design-judge-skills](https://github.com/SeanJ1ang/design-judge-skills) | 1,022 | 设计奖申报证据驱动技能 6 条：search/evaluation/match/prep/check/pipeline；npx skills add SeanJ1ang/design-judge-skills。 | Apache-2.0 | 6 | 仅索引 |
| [Kulaxyz/self-learning-skills](https://github.com/Kulaxyz/self-learning-skills) | 945 | 元技能：把会话里验证过的 golden path 收成 SKILL.md / Cursor rule；npx skills add kulaxyz/self-learning-skills。 | MIT | 1 元技能 | 仅索引 |
| [BBuf/AI-Infra-Auto-Driven-SKILLS](https://github.com/BBuf/AI-Infra-Auto-Driven-SKILLS) | 783 | LLM serving / SGLang / vLLM 基建技能 11 条 + 72 份模型 PR 史；Claude 插件市场安装。 | README 未单列 SPDX | 11 | 仅索引 |
| [lllllllama/RigorPilot-Skills](https://github.com/lllllllama/RigorPilot-Skills) | 481 | 深度学习实验可复现研究技能 11 条（trusted/explore 双车道）；npx skills add lllllllama/rigorpilot-skills。 | MIT | 11 | 仅索引 |
| [web-infra-dev/midscene-skills](https://github.com/web-infra-dev/midscene-skills) | 305 | Midscene 视觉驱动跨平台 UI 自动化 7 条（browser/desktop/Android/iOS/Harmony/E2E）；npx skills add web-infra-dev/midscene-skills。 | MIT | 7 | 仅索引 |
| [KKKKhazix/human-writing](https://github.com/KKKKhazix/human-writing) | 3,398 | 卡兹克「活人感写作」中文写作技能：材料门槛 + 去模型腔；MIT，SKILL.md 可装 ~/.agents/skills。 | MIT | 1 | 仅索引 |
| [danyuchn/asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill) | 1,747 | ASD-STE100 简化技术英语技能（面向 agent 间文本消歧）；npx skills add danyuchn/asd-ste100-skill。与 AminBlg/SimpleEnglish 独立实现。 | MIT | 1 | 仅索引 |
| [titanwings/ex-skill](https://github.com/titanwings/ex-skill) | 1,073 | Distilly 作者：把聊天记录蒸馏成数字人格 Skill（/create-ex）；Claude/OpenClaw/DSH。 | MIT | 1 元技能 | 仅索引 |
| [JimLiu/Illustrated-Agent-Skills](https://github.com/JimLiu/Illustrated-Agent-Skills) | 677 | 宝玉《图解 Skill》配套仓：book-illustrator 等可安装技能 + 附录。 | 书籍授权（学习参考） | 约 7 | 仅索引 |
| [JimLiu/baocut](https://github.com/JimLiu/baocut) | 478 | 宝玉 BaoCut 字幕/转写/剪辑 Agent Skill；npx skills add JimLiu/baocut。 | MIT | 1 | 仅索引 |
| [obra/superpowers-lab](https://github.com/obra/superpowers-lab) | 423 | Superpowers 实验技能 4 条：语义重复检测、mcp-cli、tmux 交互、windows-vm。 | MIT | 4 | 仅索引 |
| [KKKKhazix/sun-style-writing](https://github.com/KKKKhazix/sun-style-writing) | 365 | 卡兹克「孙割写作」白描/留白叙事技能；SKILL.md 可装 ~/.agents/skills。 | MIT | 1 | 仅索引 |
| [Neeeophytee/finding-unknowns-skills](https://github.com/Neeeophytee/finding-unknowns-skills) | 322 | Thariq Shihipar 未知项方法论 11 条技能；npx skills add + Claude/Codex 插件。非 Anthropic 官方。 | MIT | 11 | 仅索引 |
| [CloudWave818/ieee-skills](https://github.com/CloudWave818/ieee-skills) | 253 | 非官方 IEEE 论文工作流 10 条 Codex skills（summarize/writing/reviewer/experiment/figure 等）。 | MIT | 10 | 仅索引 |
| [JimLiu/science-skills](https://github.com/JimLiu/science-skills) | 225 | 宝玉 Claude Science 风格科学技能：alphafold/boltz/文献/单细胞/远程计算等。 | README 未单列 SPDX | 科学技能目录 | 仅索引 |
| [geekjourneyx/md2wechat-skill](https://github.com/geekjourneyx/md2wechat-skill) | 3,616 | 微信公众号 Markdown→排版/草稿 CLI + Agent Skill（skills/md2wechat）；`md2wechat skills` discovery，适配 Claude/Codex/OpenClaw。 | Source Available（商业需授权） | 1+ 平台变体 | 仅索引 |
| [prompt-security/clawsec](https://github.com/prompt-security/clawsec) | 1,097 | OpenClaw/Hermes/NanoClaw/PicoClaw 安全技能套件：签名情报、漂移检测、安装闸门；`npx skills add prompt-security/clawsec`。 | AGPL-3.0 | suite + 多平台包 | 仅索引 |
| [XiaoMaColtAI/math-modeling-skill](https://github.com/XiaoMaColtAI/math-modeling-skill) | 1,057 | 数学建模三阶段技能（建模/编程/论文）+ DSH 插件；`npx skills add` math-modeling。 | README 未单列 SPDX | 1 主技能 + 角色/工具 | 仅索引 |
| [alchaincyf/huashu-md-html](https://github.com/alchaincyf/huashu-md-html) | 896 | 花叔 md↔html/docx 四向流水线 Agent Skill（4 主题反 AI-slop）；`npx skills add alchaincyf/huashu-md-html`。 | MIT | 1 | 仅索引 |
| [product-on-purpose/pm-skills](https://github.com/product-on-purpose/pm-skills) | 642 | 产品管理 Agent Skills 68 条（Triple Diamond 全生命周期）+ 插件；skills.sh / agentskills.io。 | Apache-2.0 | 68 | 仅索引 |
| [michaelshimeles/skills](https://github.com/michaelshimeles/skills) | 576 | Claude Code 工作流技能包 6 条（worktree/证据测试/Greptile 循环等）+ AGENTS.md。 | README 未单列 SPDX | 6 | 仅索引 |
| [saurabhkumar8112/cyclomatic-complexity-skill](https://github.com/saurabhkumar8112/cyclomatic-complexity-skill) | 367 | 降低圈复杂度重构 Claude 技能；`/plugin marketplace add saurabhkumar8112/cyclomatic-complexity-skill`。 | Apache-2.0 | 1 | 仅索引 |
| [arpitg1304/robotics-agent-skills](https://github.com/arpitg1304/robotics-agent-skills) | 353 | 机器人学 Agent Skills 10 条（ROS1/ROS2/感知/测试/安全）；SKILL.md 集合 + install.sh。 | Apache-2.0 | 10 | 仅索引 |
| [tigerless-labs/design-harness](https://github.com/tigerless-labs/design-harness) | 215 | 证据驱动系统设计 Agent Skill（sources/ideas 画布）；Claude/Codex 插件市场。 | MIT | 1 | 仅索引 |
| [lornshrimp/Lorn.NovelWriteSkills](https://github.com/lornshrimp/Lorn.NovelWriteSkills) | 202 | 长篇网文写作工作流技能库（题材/大纲/章节/多平台分发）+ CommonSkills。 | README 未单列 SPDX | 多题材技能包 | 仅索引 |

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
| [openclaw/clawhub](https://github.com/openclaw/clawhub) | 9,387 | OpenClaw 官方公共技能注册表：发布/检索/版本/扫描 SKILL.md，clawhub CLI 与 clawhub.ai。 | MIT | 注册表 | 仅索引 |
| [cloudflare/agent-skills-discovery-rfc](https://github.com/cloudflare/agent-skills-discovery-rfc) | 342 | Cloudflare 草案：用 RFC 8615 .well-known/agent-skills/index.json 发现 Agent Skills。规范而非技能库。 | Apache-2.0 | 规范 | 仅索引 |
| [huggingface/upskill](https://github.com/huggingface/upskill) | 740 | Hugging Face 官方：从任务/轨迹生成并评测 SKILL.md（teacher→student）。 | README 未单列 SPDX | 生成器/评测 CLI | 仅索引 |
| [NVIDIA/SkillEvaluator](https://github.com/NVIDIA/SkillEvaluator) | 394 | NVIDIA 官方技能三层评测：校验/去重/现场 agent 评测；Verified Skills 流水线，配合 SkillSpector。 | Apache-2.0 | 评测框架 | 仅索引 |
| [changchangidea-oss/SkillRadar](https://github.com/changchangidea-oss/SkillRadar) | 175 | Agent Skills 发现/安全扫描/排序/路由：Codex 插件 + npx skills add；离线注册表 Top-3。 | MIT | 注册表/路由器 | 仅索引 |
| [activeloopai/hivemind](https://github.com/activeloopai/hivemind) | 1,593 | 团队共享记忆：从轨迹挖掘并生成可复用 SKILL.md；Claude 插件市场 + OpenClaw/Codex/Cursor hooks。 | Apache-2.0 | 记忆/技能化 infra | 仅索引 |
| [Railly/tinte](https://github.com/Railly/tinte) | 618 | 把设计系统编译成 Agent Plugin（SKILL.md + tokens.css）；`bunx tinte build --plugin`。仓库名无 skill。 | MIT | 生成器/插件 | 仅索引 |
| [WoJiSama/skill-based-architecture](https://github.com/WoJiSama/skill-based-architecture) | 548 | 可路由项目 Skill 元架构（routing.yaml + 薄壳）；Claude 插件市场 `/plugin marketplace add WoJiSama/skill-based-architecture`。V2EX 热帖。 | 见 LICENSE | 1 元技能 | 仅索引 |
| [EverMind-AI/SkillCorpus](https://github.com/EverMind-AI/SkillCorpus) | 492 | 把散落 SKILL.md 聚合成可检索语料 + 评测/插件（OpenClaw/Hermes/DSH）；SkillHub 配套开源层。 | Apache-2.0（match/evaluate MIT） | 语料/检索 infra | 仅索引 |
| [zhuyansen/agent-skills-hub](https://github.com/zhuyansen/agent-skills-hub) | 355 | AgentSkillsHub：Claude/MCP/Codex 技能目录与评分站点开源后端（非 SKILL.md 库本体）。 | README 未单列 SPDX | 目录/评分 infra | 仅索引 |
| [K-Dense-AI/mimeo](https://github.com/K-Dense-AI/mimeo) | 260 | 把公开专家语料编译成 SKILL.md/AGENTS.md 的 CLI（mimeo）；arxiv:2609.00453。 | README 未单列 SPDX | 生成器 | 仅索引 |

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
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | 60,945 | /last30days 跨 Reddit/X/YouTube/HN/Polymarket 的近期研究技能，marketplace + npx skills add；仓库名无 agent。 | MIT | 1 | 仅索引 |
| [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | 27,843 | Together AI 反 AI-slop 设计技能：21 主题 + 57 闸门；npx skills add nutlope/hallmark。仓库名无 skill。 | MIT | 1 | 仅索引 |
| [guillaumemeyer/watermarks-remover](https://github.com/guillaumemeyer/watermarks-remover) | 20,100 | Agent Skill + 纯标准库 Python 服务：剥离多厂商 AI 溯源水印（文本/文件），面向自有内容隐私。仓库名无 skill。 | 未在首页单列 SPDX | 1 + 服务 | 仅索引 |
| [shadcn/improve](https://github.com/shadcn/improve) | 9,059 | `/improve` 审计技能：用强模型出可执行计划、从不改源码；`npx skills add shadcn/improve`。仓库名无 skill。 | MIT | 1 | 仅索引 |
| [oso95/scroll-world](https://github.com/oso95/scroll-world) | 8,916 | 滚动飞越落地页技能：Claude 插件市场 + `npx skills add`；Monid/Higgsfield 生成连贯镜头。仓库名无 skill。 | MIT | 1 | 仅索引 |
| [petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop) | 6,810 | 写作去 AI 腔技能（20+ 模式），保留个人声线；`npx skills add` + Codex 插件。仓库名无 skill。 | MIT | 1 | 仅索引 |
| [diffusionstudio/lottie](https://github.com/diffusionstudio/lottie) | 5,387 | Text-to-Lottie 技能：`npx skills add diffusionstudio/lottie`，在 coding agent 中生成可交付 Lottie。仓库名无 skill。 | 未在首页单列 SPDX | 1 | 仅索引 |
| [AminBlg/SimpleEnglish](https://github.com/AminBlg/SimpleEnglish) | 3,121 | ASD-STE100 简化技术英语写作技能；`npx skills add` + Claude/Codex 插件，带基准评测。仓库名无 skill。 | MIT | 1 | 仅索引 |
| [kwakseongjae/oh-my-design](https://github.com/kwakseongjae/oh-my-design) | 478 | `oh-my-design-cli` 安装设计系统工作流：23 skills + 440+ 参考 DESIGN.md；适配 Claude/Codex/Cursor。仓库名无 skill。 | MIT | 23 | 仅索引 |
| [NanmiCoder/open-image-prompts](https://github.com/NanmiCoder/open-image-prompts) | 236 | 开源视觉提示词档案 + 2 个可安装 Agent Skills；`npx skills add NanmiCoder/open-image-prompts`。仓库名无 skill。 | MIT（数据另见 DATA_LICENSE） | 2 | 仅索引 |
| [plannotator/effective-html](https://github.com/plannotator/effective-html) | 2,892 | 自包含 HTML 制品技能 6 条：html/design-artifact/wireframe/prototype/plan/diagram；npx skills add plannotator/effective-html。仓库名无 skill。 | MIT | 6 | 仅索引 |
| [Forward-Future/loopy](https://github.com/Forward-Future/loopy) | 3,090 | Loop Library 可安装 loopy 技能：发现/审计/运行有界 agent loop；npx skills add Forward-Future/loopy --skill loopy。仓库名无 skill。 | MIT | 1 | 仅索引 |
| [feicaiclub/video-spec-builder](https://github.com/feicaiclub/video-spec-builder) | 948 | 视频分镜导演技能：问答直到写出 video-spec.md，再交给 HyperFrames；npx skills add feicaiclub/video-spec-builder。仓库名无 skill。 | MIT | 1 | 仅索引 |
| [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop) | 707 | 反 AI-slop 过滤器 6 条（core/ui/copy/human/mobile/code）；npx skills add + Claude/Codex/Antigravity 插件。与 no-ai-slop/hallmark 独立。仓库名无 skill。 | MIT | 6 | 仅索引 |
| [Owl-Listener/designer-skills](https://github.com/Owl-Listener/designer-skills) | 2,478 | 设计师技能套件前门：241 skills + 91 commands / 33 plugins；`/plugin marketplace add Owl-Listener/designer-skills`。 | MIT | 241 | 仅索引 |
| [Owl-Listener/ai-design-skills](https://github.com/Owl-Listener/ai-design-skills) | 166 | AXD 套件 44 skills / 6 plugins（model-interaction 到 prompt-architecture）；Claude/Gemini 插件。 | MIT | 44 | 仅索引 |
| [Owl-Listener/inclusive-design-skills](https://github.com/Owl-Listener/inclusive-design-skills) | 98 | 包容性设计 40 skills / 6 plugins；`/plugin marketplace add Owl-Listener/inclusive-design-skills`。 | MIT | 40 | 仅索引 |
| [mcollina/skills](https://github.com/mcollina/skills) | 1,908 | Matteo Collina Node.js 技能库 11 条（fastify/node/oauth/typescript 等），SKILL.md 集合。 | MIT | 11 | 仅索引 |
| [MicrosoftDocs/Agent-Skills](https://github.com/MicrosoftDocs/Agent-Skills) | 731 | Microsoft Learn Azure Agent Skills：193 条 + VS Code/Claude/Codex 插件市场。 | CC BY 4.0 / MIT | 193 | 仅索引 |
| [microsoft/Dataverse-skills](https://github.com/microsoft/Dataverse-skills) | 216 | Microsoft Dataverse 官方 9 条技能插件（Copilot/Claude/Codex/Cursor）。 | MIT | 9 | 仅索引 |
| [microsoft/cat-agent-skills](https://github.com/microsoft/cat-agent-skills) | 62 | Microsoft CAT 技能画廊：Cowork/Copilot Studio/Scout 可下载 SKILL.md 市场。 | MIT | 市场 | 仅索引 |
| [vinayaklatthe/microsoft-security-skills](https://github.com/vinayaklatthe/microsoft-security-skills) | 170 | Microsoft Security 88 条技能；`npx skills add` / APM；Defender/Sentinel/Entra/Purview。 | MIT | 88 | 仅索引 |
| [K-Dense-AI/science-superpowers](https://github.com/K-Dense-AI/science-superpowers) | 316 | 科研 Superpowers 重实现：16 条预注册方法论技能；Claude/Cursor/Codex/Gemini/OpenCode/Antigravity。 | MIT | 16 | 仅索引 |
| [K-Dense-AI/mimeographs](https://github.com/K-Dense-AI/mimeographs) | 120 | 80 位专家 SKILL.md；`npx skills add K-Dense-AI/mimeographs`。 | MIT | 80 | 仅索引 |
| [ghostsecurity/skills](https://github.com/ghostsecurity/skills) | 405 | Ghost Security 官方 AppSec 插件市场 8 条（SCA/SAST/DAST/secrets）。 | Apache-2.0 | 8 | 仅索引 |
| [obra/superpowers-skills](https://github.com/obra/superpowers-skills) | 745 | Superpowers 社区可编辑技能库（已归档）；由 superpowers 插件自动 clone。 | 见仓库 | community | 仅索引 |
| [NeoLabHQ/context-engineering-kit](https://github.com/NeoLabHQ/context-engineering-kit) | 1,516 | Context Engineering Kit 插件市场：SDD/reflexion 等；Claude/Gemini/OpenCode/Cursor/Antigravity。 | GPL-3.0 | marketplace | 仅索引 |
| [mhattingpete/claude-skills-marketplace](https://github.com/mhattingpete/claude-skills-marketplace) | 668 | Claude Code 工程工作流插件市场 ~17 skills（git/test/review/docs）。 | Apache-2.0 | ~17 | 仅索引 |
| [haunchen/n8n-skills](https://github.com/haunchen/n8n-skills) | 392 | n8n 工作流技能包：1 条 SKILL.md 覆盖 545 nodes + 20 templates。 | MIT | 1 pack | 仅索引 |
| [zxkane/aws-skills](https://github.com/zxkane/aws-skills) | 359 | AWS Claude 插件市场：CDK/SST/cost/serverless/AgentCore；`npx skills add zxkane/aws-skills`。 | MIT | 6 | 仅索引 |
| [PostHog/skills](https://github.com/PostHog/skills) | 60 | PostHog 官方技能插件市场（integration/feature-flags/all）；`/plugin marketplace add PostHog/skills`。 | MIT | marketplace | 仅索引 |
| [antonbabenko/terraform-skill](https://github.com/antonbabenko/terraform-skill) | 2,322 | Terraform/OpenTofu 技能；`npx skills add antonbabenko/terraform-skill`；Claude/Cursor/Codex/Gemini/OpenCode。 | Apache-2.0 | 1 | 仅索引 |
| [sunchaokun/PPT-Design-Skill](https://github.com/sunchaokun/PPT-Design-Skill) | 1,185 | 可编辑 PPTX 设计技能：Build/FreeStyle/VI 三模式 + installer（OpenCode/Claude/Codex）。 | 见仓库 | 1 pack | 仅索引 |
| [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) | 6,171 | n8n-mcp 配套 14 条 Claude 技能 + 路由/hooks；`/plugin install czlonkowski/n8n-skills`。 | MIT | 14 | 仅索引 |
| [n8n-io/skills](https://github.com/n8n-io/skills) | 474 | n8n 官方 13 条能力技能 + using-n8n-skills-official；Claude/Codex/OpenCode 插件 + npx skills add n8n-io/skills。 | Apache-2.0 | 13+meta | 仅索引 |
| [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) | 14,190 | CAD/CAE/CAM 技能库 12 条（cad/urdf/sdf/gcode 等）；`npx skills add earthtojake/text-to-cad`。 | MIT | 12 | 仅索引 |
| [xstongxue/best-skills](https://github.com/xstongxue/best-skills) | 2,751 | 中文高质量 SKILL.md 合集：论文/专利/drawio/公众号/前端/开发五步法。 | 见仓库 | ~14 | 仅索引 |
| [daymade/claude-code-skills](https://github.com/daymade/claude-code-skills) | 1,373 | Claude Code 生产技能市场（skill-creator 加固叉）；MIT。 | MIT | marketplace | 仅索引 |
| [alibaba/skill-up](https://github.com/alibaba/skill-up) | 816 | 阿里巴巴 Agent Skills 评测/演化 CLI + skill-upper；`npx skills add alibaba/skill-up`。 | Apache-2.0 | eval CLI | 仅索引 |
| [wpsnote/wpsnote-skills](https://github.com/wpsnote/wpsnote-skills) | 174 | WPS 笔记官方技能市场：笔记/创作/学习/长篇等 30+ 条；`/plugin marketplace add wpsnote/wpsnote-skills`。 | 见仓库 | 30+ | 仅索引 |
| [stripe/ai](https://github.com/stripe/ai) | 1,788 | Stripe 官方 Agent Skills/插件；`npx skills add https://docs.stripe.com`。 | MIT | 官方技能/插件 | 仅索引 |
| [payloadcms/skills](https://github.com/payloadcms/skills) | 151 | Payload 官方 2 条（开发规范 + cms-migration）。 | MIT | 2 | 仅索引 |
| [livekit/agent-skills](https://github.com/livekit/agent-skills) | 66 | LiveKit 官方语音技能 2 条（agents/simulations）。 | MIT | 2 | 仅索引 |
| [ant-design/antd-skill](https://github.com/ant-design/antd-skill) | 133 | Ant Design 官方 2 条（antd v6/Pro/X + CLI）。 | README 未单列 SPDX | 2 | 仅索引 |
| [longbridge/skills](https://github.com/longbridge/skills) | 52 | 长桥官方 13 条行情/持仓技能；npx skills + Claude/Codex 插件。 | MIT | 13 | 仅索引 |
| [smartcontractkit/chainlink-agent-skills](https://github.com/smartcontractkit/chainlink-agent-skills) | 125 | Chainlink 官方 6 条（CRE/CCIP/Feeds/Streams/ACE/VRF）。 | README 未单列 SPDX | 6 | 仅索引 |
| [video-db/skills](https://github.com/video-db/skills) | 120 | VideoDB 官方视频感知技能（ingest/search/edit/stream）。 | 见 LICENSE | 官方技能包 | 仅索引 |
| [marswaveai/skills](https://github.com/marswaveai/skills) | 78 | ListenHub/Cola 官方内容技能 13+（播客/TTS/图视频）。 | MIT | 13+ | 仅索引 |
| [labring/sealos-skills](https://github.com/labring/sealos-skills) | 78 | Sealos 官方 8 条部署/数据库/S3/canvas；npx skills + 插件。 | MIT | 8 | 仅索引 |
| [opensearch-project/opensearch-agent-skills](https://github.com/opensearch-project/opensearch-agent-skills) | 51 | OpenSearch 官方 6 条搜索/可观测/云部署技能。 | Apache-2.0 | 6 | 仅索引 |
| [op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill) | 25,525 | 歸藏 HTML PPT：杂志/瑞士双视觉 + 演讲者模式。 | AGPL-3.0 | 1 pack | 仅索引 |
| [tanweai/pua](https://github.com/tanweai/pua) | 19,571 | PUA/PIP 高能动技能（多宿主 SKILL.md + 插件）。仓库名无 skill。 | MIT | 多宿主 1 引擎 | 仅索引 |
| [muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) | 17,916 | 上下文工程技能约 17 条 + 插件市场；Claude/Cursor/Codex。 | MIT | 约 17 | 仅索引 |
| [dontbesilent2025/dbskill](https://github.com/dontbesilent2025/dbskill) | 9,883 | dontbesilent 商业/内容 31 条中文技能。 | CC BY-NC 4.0 | 31 | 仅索引 |
| [kangarooking/cangjie-skill](https://github.com/kangarooking/cangjie-skill) | 9,405 | 仓颉：把书/长视频/播客蒸馏成可调用 Skill Pack 的元技能。 | MIT | 1 元技能 | 仅索引 |
| [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) | 64,603 | GSD 归档跳转仓；现行开发迁至 open-gsd/gsd-core。仓库名无 skill。 | 归档跳转 | 路标 | 仅索引 |
| [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) | 9,054 | GSD Core：跨宿主 spec-driven / 上下文工程循环；`npx @opengsd/gsd-core`。仓库名无 skill。 | MIT | SDD 框架 | 仅索引 |
| [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills) | 3,227 | Three.js 技能 10 条（fundamentals→interaction）；SKILL.md 集合。 | MIT | 10 | 仅索引 |
| [yetone/native-feel-skill](https://github.com/yetone/native-feel-skill) | 1,903 | 跨平台桌面原生感架构技能。 | MIT | 1 | 仅索引 |
| [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | 500 | Superdesign UI/演示/图形技能。 | MIT | 1 | 仅索引 |
| [yan-labs/serenity-aleabitoreddit](https://github.com/yan-labs/serenity-aleabitoreddit) | 475 | Serenity AI/半导体供应链研究技能。仓库名无 skill。 | README 未单列 SPDX | 1 | 仅索引 |
| [existential-birds/beagle](https://github.com/existential-birds/beagle) | 80 | Beagle 技能市场：Python/Go/Rust/Elixir/React/iOS 审查。 | README 未单列 SPDX | marketplace | 仅索引 |
| [Nanako0129/sepia](https://github.com/Nanako0129/sepia) | 1,875 | 去 AI 腔写作 Agent Skill（叙事结构优先）；`npx skills add Nanako0129/sepia`，Claude/Codex/Grok/Antigravity 原生插件。仓库名无 skill。 | MIT | 1 + 4 操作包装 | 仅索引 |
| [Vincentwei1021/video-talkcraft](https://github.com/Vincentwei1021/video-talkcraft) | 602 | 口播视频动效 Agent Skill：字级配音同步 + 79 动效卡 + Remotion；`npx skills add Vincentwei1021/video-talkcraft`。仓库名无 skill。 | PolyForm Noncommercial 1.0.0 | 1 | 仅索引 |
| [inkboard/system-atlas](https://github.com/inkboard/system-atlas) | 391 | 架构讨论→可交互等轴测 atlas 的 Agent Skill；`npx skills add inkboard/system-atlas`。仓库名无 skill。 | MIT | 1 | 仅索引 |
| [kunchenguid/vision](https://github.com/kunchenguid/vision) | 310 | 从仓库历史起草并压力测试 VISION.md 的 Agent Skill；`npx skills add kunchenguid/vision`。仓库名无 skill。 | MIT | 1 | 仅索引 |
