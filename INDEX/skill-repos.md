# 技能仓库总目

> 由 scripts/build-skill-repos.mjs 生成，请改 data/skill-repos.jsonl，勿手改本文件。

本文件只收录 GitHub 上的技能库/市场/精选列表，依据各库 README 摘要，不收录对方源码，也不复制对方 SKILL.md 正文。

标注哪些已被 [findscripter/everything-skills](https://github.com/findscripter/everything-skills) 采编进技能正文（见 INDEX/sources.md）。

- 编制日期：2026-09-05（Asia/Shanghai）；同日清理：去重/政策剔除后 unique ≈1007
- Stars：GitHub Search API 当日快照，非估算
- 收录条数：1132 个独立仓库（另注明更名别名）
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
- adrianpuiu/claude-skills-marketplace → adrianpuiu/specification-document-generator（原仓 README 标明 obsolete）
- 1102tools/federal-contracting-skills → 1102tools-dev/federal-contracting-skills

### 已采编来源

见 INDEX/sources.md（18 个上游，不论星标一律收录）。

未纳入：InternScience/Awesome-Scientific-Skills（无根 README）、WorldFlowAI/everything-claude-code（ECC 第三方警告）、攻击向/无 README 仓（含 mukul975/Anthropic-Cybersecurity-Skills）。

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
| [base/skills](https://github.com/base/skills) | 117 | Base链官方Skills（build-on-base/base-mcp/vibenet）；npx skills add base/skills。 | MIT | 5 | 仅索引 |
| [flutter/agent-plugins](https://github.com/flutter/agent-plugins) | 2,907 | Flutter官方Agent插件市场（marketplace.json）；面向Flutter开发的可安装Skills。 | BSD-3-Clause | 多 | 仅索引 |
| [oxylabs/agent-skills](https://github.com/oxylabs/agent-skills) | 871 | Oxylabs官方产品Agent Skills。 | MIT | 多 | 仅索引 |
| [microsoft/azure-devops-skills](https://github.com/microsoft/azure-devops-skills) | 41 | Azure DevOps MCP+Copilot样例Skills/提示模式。 | MIT | 多 | 仅索引 |
| [microsoft/agent-skills](https://github.com/microsoft/agent-skills) | 2,992 | Microsoft 官方 Agent Skills 仓库（WIP）。 | MIT | 多 | 仅索引 |
| [mozilla-ai/cq](https://github.com/mozilla-ai/cq) | 1,262 | Mozilla AI 共享知识 commons（cq）Claude 插件。 | NOASSERTION | 1+ | 仅索引 |
| [JetBrains/benjamin-plus-skill](https://github.com/JetBrains/benjamin-plus-skill) | 309 | JetBrains Benjamin-Plus 降 token 成本技能。 | MIT | 1+ | 仅索引 |
| [veniceai/skills](https://github.com/veniceai/skills) | 139 | Venice AI Agent Skills。 | MIT | 21 | 仅索引 |
| [base44/skills](https://github.com/base44/skills) | 89 | Base44 官方 Claude Code Skills。 | MIT | 5 | 仅索引 |
| [Shopify/ucp-cli](https://github.com/Shopify/ucp-cli) | 69 | Shopify Universal Commerce Protocol 购物 Agent Skill。 | NOASSERTION | 1+ | 仅索引 |
| [Cap-go/capgo-skills](https://github.com/Cap-go/capgo-skills) | 68 | Capgo/Capacitor 移动开发 Agent Skills。 | MIT | 49 | 仅索引 |
| [Bria-AI/bria-skill](https://github.com/Bria-AI/bria-skill) | 65 | Bria AI 图像 Agent Skill。 | MIT | 6 | 仅索引 |
| [califio/skills](https://github.com/califio/skills) | 59 | Calif.io 官方 Agent Skills。 | MIT | 1+ | 仅索引 |
| [cypress-io/ai-toolkit](https://github.com/cypress-io/ai-toolkit) | 40 | Cypress 官方 AI Toolkit Agent Skills。 | MIT | 1+ | 仅索引 |
| [netlify/context-and-tools](https://github.com/netlify/context-and-tools) | 36 | Netlify 官方 Claude 插件与上下文工具技能。 | NOASSERTION | 12 | 仅索引 |
| [JetBrains/phpstorm-claude-marketplace](https://github.com/JetBrains/phpstorm-claude-marketplace) | 33 | PhpStorm Claude Code 插件市场。 | NOASSERTION | 多 | 仅索引 |
| [Shopify/liquid-skills](https://github.com/Shopify/liquid-skills) | 32 | Shopify Liquid 语言 Claude Code 插件技能。 | NOASSERTION | 多 | 仅索引 |
| [helius-labs/core-ai](https://github.com/helius-labs/core-ai) | 26 | Helius Solana Core AI Skills。 | NOASSERTION | 1+ | 仅索引 |
| [JetBrains/rider-skills](https://github.com/JetBrains/rider-skills) | 20 | .NET/GameDev 向 Rider Agent Skills。 | Apache-2.0 | 7 | 仅索引 |
| [PSPDFKit-labs/nutrient-agent-skill](https://github.com/PSPDFKit-labs/nutrient-agent-skill) | 16 | Nutrient/PSPDFKit 文档 Agent Skill。 | MIT-0 | 20 | 仅索引 |
| [coinpaprika/skills](https://github.com/coinpaprika/skills) | 7 | CoinPaprika/DexPaprika 加密行情 Agent Skills。 | MIT | 1+ | 仅索引 |
| [CesiumGS/cesiumjs-skills](https://github.com/CesiumGS/cesiumjs-skills) | 160 | CesiumJS 开发精选官方 Agent Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [ComPDFKit/compdf-skills](https://github.com/ComPDFKit/compdf-skills) | 104 | ComPDF 面向 Agent 的 PDF 处理 Skills。 | Other | 1+ | 仅索引 |
| [awslabs/hcls-agent-skills](https://github.com/awslabs/hcls-agent-skills) | 26 | AWS 医疗与生命科学官方 Agent Skills。 | MIT | 1+ | 仅索引 |
| [awslabs/startups](https://github.com/awslabs/startups) | 16 | AWS Startups 官方插件/Skills/工具资源库。 | Apache-2.0 | 1+ | 仅索引 |
| [lightonai/next-plaid](https://github.com/lightonai/next-plaid) | 541 | LightOn 语义/多向量代码搜索 Tools Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [mckinsey/agents-at-scale-ark](https://github.com/mckinsey/agents-at-scale-ark) | 422 | McKinsey Agents at Scale / ARK 插件 Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [getsentry/warden](https://github.com/getsentry/warden) | 402 | Sentry 本地/PR AI 代码评审 Agents Skills。 | Other | 1+ | 仅索引 |
| [adobe/spectrum-design-data](https://github.com/adobe/spectrum-design-data) | 151 | Adobe Spectrum 设计令牌与组件 Skills。 | Other | 1+ | 仅索引 |
| [microsoft/aspire-skills](https://github.com/microsoft/aspire-skills) | 86 | .NET Aspire 官方 Agent Skills。 | MIT | 1+ | 仅索引 |
| [microsoft/dataverse-business-skills](https://github.com/microsoft/dataverse-business-skills) | 49 | Dataverse 业务开发官方 Skills。 | MIT | 1+ | 仅索引 |
| [microsoft/power-cat-skills](https://github.com/microsoft/power-cat-skills) | 45 | Power Platform CAT 官方 Skills。 | MIT | 1+ | 仅索引 |
| [microsoft/agent365-skills](https://github.com/microsoft/agent365-skills) | 36 | Microsoft 365 Agent 官方 Skills。 | MIT | 1+ | 仅索引 |
| [microsoft/teams-platform-skills](https://github.com/microsoft/teams-platform-skills) | 7 | Teams 平台开发官方 Skills。 | MIT | 1+ | 仅索引 |
| [microsoft/code-optimizations-skills](https://github.com/microsoft/code-optimizations-skills) | 4 | 代码优化官方 Agent Skills。 | MIT | 1+ | 仅索引 |
| [TencentCloudBase/CloudBase-AI-Toolkit](https://github.com/TencentCloudBase/CloudBase-AI-Toolkit) | 1,092 | 腾讯云 CloudBase AI Toolkit（含 Agent Skills）。 | Other | 多 | 仅索引 |
| [Unity-Technologies/skills](https://github.com/Unity-Technologies/skills) | 712 | Unity 官方 AI Agent Skills 集合（项目/CLI/UI/多人/IAP 等）。 | MIT | 官方 13+ | 仅索引 |
| [auth0/agent-skills](https://github.com/auth0/agent-skills) | 48 | Auth0 官方 Agent Skills。 | Apache-2.0 | 多 | 仅索引 |
| [rstackjs/agent-skills](https://github.com/rstackjs/agent-skills) | 93 | Rstack 官方 Agent Skills 合集。 | MIT | 多 | 仅索引 |
| [AtlasCloudAI/atlas-cloud-skills](https://github.com/AtlasCloudAI/atlas-cloud-skills) | 29 | Atlas Cloud 图像/视频与多模型 Agent Skills。 | Other | 20 | 仅索引 |
| [Starchild-ai-agent/official-skills](https://github.com/Starchild-ai-agent/official-skills) | 25 | Starchild 官方 Skills。 | Other | 11 | 仅索引 |
| [powersync-ja/agent-skills](https://github.com/powersync-ja/agent-skills) | 18 | PowerSync 官方 Agent Skills。 | Other | 多 | 仅索引 |
| [nocodb/agent-skills](https://github.com/nocodb/agent-skills) | 16 | NocoDB Agent Skills。 | Other | 多 | 仅索引 |
| [Tencent-RTC/agent-skills](https://github.com/Tencent-RTC/agent-skills) | 12 | 腾讯 RTC（Chat/Call/Live 等）集成 Agent Skills。 | Other | 多 | 仅索引 |
| [webull-inc/webull-openapi-skills](https://github.com/webull-inc/webull-openapi-skills) | 11 | Webull OpenAPI Agent Skills。 | Apache-2.0 | 多 | 仅索引 |
| [mailtrap/mailtrap-skills](https://github.com/mailtrap/mailtrap-skills) | 10 | Mailtrap 官方邮件测试 Agent Skills。 | Other | 多 | 仅索引 |
| [exasol-labs/exasol-agent-skills](https://github.com/exasol-labs/exasol-agent-skills) | 10 | Exasol 数据库 Agent Skills。 | MIT | 多 | 仅索引 |
| [2ChatCo/agent-skills](https://github.com/2ChatCo/agent-skills) | 10 | WhatsApp/SMS/电话 Agent Skills。 | Other | 8 | 仅索引 |
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
| [anthropics/commerce-agents](https://github.com/anthropics/commerce-agents) | 2,094 | Anthropic 购物与商户 Agent 参考蓝图（prompt/skills/工具契约）。 | Apache-2.0 | 多 | 仅索引 |
| [Shopify/claude-for-commerce-examples](https://github.com/Shopify/claude-for-commerce-examples) | 104 | Shopify 对 Anthropic commerce-agents 的店面/商户实现示例。 | Apache-2.0 | 示例 | 仅索引 |
| [alpacahq/alpaca-skills](https://github.com/alpacahq/alpaca-skills) | 143 | Alpaca Trading/Broker API 官方 Agent Skills。 | Apache-2.0 | 多 | 仅索引 |
| [coinbase/agentic-wallet-skills](https://github.com/coinbase/agentic-wallet-skills) | 126 | Coinbase Agentic Wallet 官方技能（awal CLI）。 | MIT | 1+ | 仅索引 |
| [quark-clouddrive/quarkclouddrive_offical](https://github.com/quark-clouddrive/quarkclouddrive_offical) | 37 | 夸克网盘官方 Skill：Agent 内管理/检索网盘文件。 | Apache-2.0 | 1 | 仅索引 |
| [snyk/agent-scan](https://github.com/snyk/agent-scan) | 3,013 | Snyk 官方：扫描 AI agents/MCP/skills 安全风险。 | Apache-2.0 | 工具 | 仅索引 |
| [okx/agent-skills](https://github.com/okx/agent-skills) | 170 | OKX 官方交易/组合/行情/机器人 Agent Skills（okx CLI）。 | MIT | 9 | 仅索引 |
| [clay-run/agent-plugins](https://github.com/clay-run/agent-plugins) | 110 | Clay 官方 GTM/ enrichment Agent Skills+MCP+CLI。 | 其他 | 多 | 仅索引 |
| [GoogleCloudPlatform/cxas-scrapi](https://github.com/GoogleCloudPlatform/cxas-scrapi) | 95 | Google CX Agent Studio 官方 Python API/CLI/Skills。 | Apache-2.0 | 多 | 仅索引 |
| [resemble-ai/detect-skill](https://github.com/resemble-ai/detect-skill) | 78 | Resemble AI 官方深伪检测/媒体安全 Agent Skill。 | 其他 | 1 | 仅索引 |
| [polars-inc/skills](https://github.com/polars-inc/skills) | 76 | Polars 官方 AI Agent Skills。 | MIT | 多 | 仅索引 |
| [motherduckdb/agent-skills](https://github.com/motherduckdb/agent-skills) | 55 | MotherDuck 官方 22 个 Agent Skills：连接/SQL/Dive/管线。 | MIT | 22 | 仅索引 |
| [confluentinc/agent-skills](https://github.com/confluentinc/agent-skills) | 54 | Confluent 官方流处理/事件流 Agent Skills。 | Apache-2.0 | 多 | 仅索引 |
| [metalbear-co/skills](https://github.com/metalbear-co/skills) | 27 | MetalBear 官方用户 Agent Skills 包。 | MIT | 多 | 仅索引 |
| [Hashnode/gql-skill](https://github.com/Hashnode/gql-skill) | 16 | Hashnode GraphQL API 官方可安装 Agent Skill。 | 其他 | 1 | 仅索引 |
| [transloadit/skills](https://github.com/transloadit/skills) | 3 | Transloadit 官方媒体处理 Agent Skills。 | 其他 | 多 | 仅索引 |

## 2. 精选列表 / 大集合

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [mxyhi/ok-skills](https://github.com/mxyhi/ok-skills) | 480 | 精选编码 Agent 技能合集 31 条（planning/docs/browser/design 等）；clone 到 ~/.agents/skills。 | 见 LICENSE | 31 | 仅索引 |
| [Dominic789654/awesome-deepseek-harness](https://github.com/Dominic789654/awesome-deepseek-harness) | 220 | DeepSeek Harness（DSH）插件/技能/MCP 精选列表。 | README 未单列 SPDX | awesome 列表 | 仅索引 |
| [ttfake92-lab/skills](https://github.com/ttfake92-lab/skills) | 215 | 内容创作Skills合集（视频提示词/Remotion/缩略图）；npx skills add ttfake92-lab/skills。 | None | 10 | 仅索引 |
| [mblode/agent-skills](https://github.com/mblode/agent-skills) | 102 | 交付向Skills 26条（UI/排版/PR/SEO等）+插件市场；npx skills add。 | MIT | 26 | 仅索引 |
| [J-nowcow/awesome-korean-agent-skills](https://github.com/J-nowcow/awesome-korean-agent-skills) | 40 | 韩语Coding Agent Skills精选400+功能分类索引。 | CC0-1.0 | 400+ index | 仅索引 |
| [Agents365-ai/365-skills](https://github.com/Agents365-ai/365-skills) | 37 | Agents365生产级技能/插件市场；npx skills add + Claude marketplace。 | None | 24 | 仅索引 |
| [linny006/awesome-agent-skills](https://github.com/linny006/awesome-agent-skills) | 31 | 自动更新Agent Skills精选列表（质量评级）。 | None | index | 仅索引 |
| [paulnsorensen/easy-cheese](https://github.com/paulnsorensen/easy-cheese) | 18 | 便携跨harness Agent Skills工具包；npx skills/插件市场。 | MIT | 18 | 仅索引 |
| [kevinaimonster/skill-hub](https://github.com/kevinaimonster/skill-hub) | 3 | 中文技能宝50+可安装Skills；npx skills add --full-depth。 | MIT | 101 | 仅索引 |
| [zenstory-ai/oh-story-claudecode](https://github.com/zenstory-ai/oh-story-claudecode) | 6,505 | 网文/小说写作Skill包（扫榜/拆文/写作/去AI味/封面）。`npx skills add zenstory-ai/oh-story-claudecode`。 | MIT | 多 | 仅索引 |
| [Dimillian/Skills](https://github.com/Dimillian/Skills) | 3,941 | 个人Codex Skills合集。 | MIT | 16 | 仅索引 |
| [davidondrej/skills](https://github.com/davidondrej/skills) | 3,935 | David Ondrej个人Agent Skills。 | MIT | 多 | 仅索引 |
| [sanyuan0704/sanyuan-skills](https://github.com/sanyuan0704/sanyuan-skills) | 3,897 | 三元代码审查Skills（SOLID/安全/性能等）。`npx skills add sanyuan0704/sanyuan-skills`。 | MIT | 6 | 仅索引 |
| [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | 2,752 | 基于Lighthouse/Core Web Vitals的Web质量优化Agent Skills。`npx skills add`。 | Apache-2.0 | 多 | 仅索引 |
| [ciembor/agent-rules-books](https://github.com/ciembor/agent-rules-books) | 2,689 | 源自经典书籍的AGENTS.md规则/Skills（Codex/Cursor/Claude）。 | MIT | 多 | 仅索引 |
| [ReScienceLab/opc-skills](https://github.com/ReScienceLab/opc-skills) | 1,757 | 一人公司/独立创业者Agent Skills合集。 | MIT | 多 | 仅索引 |
| [zenstory-ai/drama-skills](https://github.com/zenstory-ai/drama-skills) | 1,585 | AI短剧/漫剧创作Skill合集（剧本→分镜→提示词→审查）；Claude/Codex。 | MIT | 多 | 仅索引 |
| [alchaincyf/huashu-skills](https://github.com/alchaincyf/huashu-skills) | 1,468 | 花叔开源Agent Skills总目录（旗舰+人物视角+内置，50+）。 | MIT | 52 | 仅索引 |
| [tjboudreaux/cc-thinking-skills](https://github.com/tjboudreaux/cc-thinking-skills) | 1,285 | 28个评测导向心智模型/批判思维Claude Skills。`npx skills add tjboudreaux/cc-thinking-skills`。 | MIT | 28 | 仅索引 |
| [gooseworks-ai/goose-skills](https://github.com/gooseworks-ai/goose-skills) | 1,195 | Growth/GTM Skills+数据API（广告/社媒等）for Claude/Codex/Cursor。 | MIT | 多 | 仅索引 |
| [dpearson2699/swift-ios-skills](https://github.com/dpearson2699/swift-ios-skills) | 1,069 | iOS 26+/Swift 6.3/SwiftUI现代Apple框架Agent Skills。 | MIT | 多 | 仅索引 |
| [jezweb/claude-skills](https://github.com/jezweb/claude-skills) | 996 | 全栈Cloudflare/React/Tailwind/AI应用Claude Skills。 | MIT | 多 | 仅索引 |
| [kostja94/marketing-skills](https://github.com/kostja94/marketing-skills) | 950 | 营销Agent Skills（SEO/社媒/达人等）160+开源。 | MIT | 160+ | 仅索引 |
| [new-silvermoon/awesome-android-agent-skills](https://github.com/new-silvermoon/awesome-android-agent-skills) | 950 | 标准化Android Agent Skills精选（Copilot/Claude等）。 | MIT | index | 仅索引 |
| [ferdinandobons/startup-skill](https://github.com/ferdinandobons/startup-skill) | 889 | 创业验证/竞品情报等创业Agent Skills。 | MIT | 多 | 仅索引 |
| [sergebulaev/linkedin-skills](https://github.com/sergebulaev/linkedin-skills) | 873 | LinkedIn写作Claude/Codex Skills（11条）。 | MIT | 11 | 仅索引 |
| [laolaoshiren/claude-code-skills-zh](https://github.com/laolaoshiren/claude-code-skills-zh) | 818 | 中文开发者Claude Code Skills/Agents/Plugins精选与原创。 | MIT | 多 | 仅索引 |
| [rampstackco/claude-skills](https://github.com/rampstackco/claude-skills) | 817 | 网站全生命周期栈无关Claude Skills（品牌→上线）。 | MIT | 多 | 仅索引 |
| [scottstts/Threejs-Awesome-Graphics-Agent-Skills](https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills) | 782 | Three.js炫酷图形场景Agent Skills精选。 | MIT | 多 | 仅索引 |
| [coreyhaines31/makerskills](https://github.com/coreyhaines31/makerskills) | 772 | 个人运营者工艺Agent Skills（决策/研究等）。 | MIT | 多 | 仅索引 |
| [ZeroPointRepo/youtube-skills](https://github.com/ZeroPointRepo/youtube-skills) | 753 | YouTube运营/内容Agent Skills。 | MIT | 多 | 仅索引 |
| [dongshuyan/compass-skills](https://github.com/dongshuyan/compass-skills) | 721 | 指南针式多域Agent Skills。 | MIT | 多 | 仅索引 |
| [staruhub/ClaudeSkills](https://github.com/staruhub/ClaudeSkills) | 707 | 研究/产品决策/幻灯/发布等13条精选Agent Skills。 | MIT | 13 | 仅索引 |
| [Appllama/appllama-skills](https://github.com/Appllama/appllama-skills) | 700 | 把头部App拆解成可落地构建的Agent Skills。 | MIT | 多 | 仅索引 |
| [partme-ai/full-stack-skills](https://github.com/partme-ai/full-stack-skills) | 652 | 免费全栈开发技能市场（多平台AI技能集合）。 | MIT | 多 | 仅索引 |
| [Affitor/affiliate-skills](https://github.com/Affitor/affiliate-skills) | 646 | 联盟营销50条AI Agent Skills。 | MIT | 50 | 仅索引 |
| [nexscope-ai/Amazon-Skills](https://github.com/nexscope-ai/Amazon-Skills) | 629 | 亚马逊卖家关键词/竞品等免费Agent Skills。 | MIT | 多 | 仅索引 |
| [pedronauck/skills](https://github.com/pedronauck/skills) | 596 | 个人/团队可安装Agent Skills。 | MIT | 多 | 仅索引 |
| [momozi1996/awesome-ai-persona-skills](https://github.com/momozi1996/awesome-ai-persona-skills) | 586 | 100+人格蒸馏Skills合集（名人/古籍/职场等）。 | MIT | 100+ | 仅索引 |
| [karanb192/awesome-claude-skills](https://github.com/karanb192/awesome-claude-skills) | 505 | 50+已验证Awesome Claude Skills合集。 | MIT | 50+ | 仅索引 |
| [inhouseseo/superseo-skills](https://github.com/inhouseseo/superseo-skills) | 304 | SEO Claude Skills 11条（审计/外链/写作等）。 | MIT | 11 | 仅索引 |
| [Aperivue/medsci-skills](https://github.com/Aperivue/medsci-skills) | 283 | 医学研究Agent Skills（文献/报告规范等）。 | MIT | 多 | 仅索引 |
| [fewwwww/awesome-web3-skills](https://github.com/fewwwww/awesome-web3-skills) | 210 | Web3/加密Agent Skills精选。 | MIT | index | 仅索引 |
| [finfin/awesome-frontend-skills](https://github.com/finfin/awesome-frontend-skills) | 196 | 可`npx skills add`的前端Agent Skills精选列表。 | MIT | index | 仅索引 |
| [naodeng/awesome-qa-skills](https://github.com/naodeng/awesome-qa-skills) | 191 | 双语（中/英）测试向AI Agent Skills库。 | MIT | index | 仅索引 |
| [itgoyo/awesome-agent-skills](https://github.com/itgoyo/awesome-agent-skills) | 185 | 全网热门Agent-Skills项目收集。 | None | index | 仅索引 |
| [seb1n/awesome-ai-agent-skills](https://github.com/seb1n/awesome-ai-agent-skills) | 173 | 103个即用AI Agent Skills（Claude/Codex/Gemini）。 | MIT | 103 | 仅索引 |
| [BioTender-max/awesome-bio-agent-skills](https://github.com/BioTender-max/awesome-bio-agent-skills) | 172 | 生物医学研究AI Agent Skills精选。 | MIT | index | 仅索引 |
| [richkuo/rk-skills](https://github.com/richkuo/rk-skills) | 49 | rk Agent Skills（GitHub issue/PR/release + Fable规划）；npx/插件。 | MIT | 多 | 仅索引 |
| [flowkit-labs/skills](https://github.com/flowkit-labs/skills) | 2 | Flowkit Skills；skills.sh热装。 | MIT | 多 | 仅索引 |
| [santifer/career-ops](https://github.com/santifer/career-ops) | 70,166 | 求职/职业运营 Agent Skills 工作流（高星）。 | MIT | 1+ | 仅索引 |
| [nexu-io/html-anything](https://github.com/nexu-io/html-anything) | 8,660 | Agent 驱动的多表面 HTML 编辑/生成技能（杂志/海报/小红书等）。 | Apache-2.0 | 75 | 仅索引 |
| [PleasePrompto/notebooklm-skill](https://github.com/PleasePrompto/notebooklm-skill) | 7,752 | 让 Claude Code 直接对话 NotebookLM 的 Skill。 | NOASSERTION | 1+ | 仅索引 |
| [epoko77-ai/im-not-ai](https://github.com/epoko77-ai/im-not-ai) | 5,239 | 韩文去 AI 腔润色 Claude Skill（Humanize KR）。 | MIT | 1+ | 仅索引 |
| [conorbronsdon/avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing) | 4,104 | 检测并改写去除 AI 写作痕迹的 Skill。 | MIT | 多 | 仅索引 |
| [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) | 4,085 | 拒绝低证据 TypeScript/JS 模式的 Oxlint + Agent Skill。 | MIT | 1+ | 仅索引 |
| [nyldn/claude-octopus](https://github.com/nyldn/claude-octopus) | 4,046 | 多模型互补协作的 Claude Octopus 技能/插件。 | MIT | 多 | 仅索引 |
| [liustack/modlens](https://github.com/liustack/modlens) | 3,868 | 为纯文本编码 Agent 外挂视觉/OCR 的 Skill/插件。 | MIT | 多 | 仅索引 |
| [brycewang-stanford/Auto-Empirical-Research-Skills](https://github.com/brycewang-stanford/Auto-Empirical-Research-Skills) | 3,678 | 斯坦福 REAP 社科实证研究 Agent Skills 大库。 | MIT | 23000+ | 仅索引 |
| [nowork-studio/NotFair](https://github.com/nowork-studio/NotFair) | 3,452 | 开源 SEO/GEO/营销 Agent Skills（NotFair）。 | MIT | 45 | 仅索引 |
| [foryourhealth111-pixel/Vibe-Skills](https://github.com/foryourhealth111-pixel/Vibe-Skills) | 3,161 | Vibe Skills 可安装技能合集。 | NOASSERTION | 100+ | 仅索引 |
| [eracle/OpenOutreach](https://github.com/eracle/OpenOutreach) | 2,907 | B2B 线索外联 Claude 插件/技能。 | NOASSERTION | 1+ | 仅索引 |
| [rohitg00/pro-workflow](https://github.com/rohitg00/pro-workflow) | 2,808 | Pro Workflow Agent Skills/工作流包。 | MIT | 多 | 仅索引 |
| [jeremylongshore/claude-code-plugins-plus-skills](https://github.com/jeremylongshore/claude-code-plugins-plus-skills) | 2,698 | 跨模型 Agent Skills 平台与技能目录。 | MIT | 多 | 仅索引 |
| [cocoindex-io/cocoindex-code](https://github.com/cocoindex-io/cocoindex-code) | 2,695 | AST 语义代码搜索 Claude/Cursor Skill（marketplace）。 | Apache-2.0 | 1+ | 仅索引 |
| [AMAP-ML/SkillClaw](https://github.com/AMAP-ML/SkillClaw) | 2,560 | 高德 SkillClaw Agent Skills 相关项目。 | MIT | 多 | 仅索引 |
| [softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit) | 2,428 | 意见化可共享 Agent Skills 工具包。 | MIT | 1+ | 仅索引 |
| [mrgoonie/claudekit-skills](https://github.com/mrgoonie/claudekit-skills) | 2,209 | ClaudeKit 专用工作流 Agent Skills。 | NOASSERTION | 多 | 仅索引 |
| [awesome-skills/code-review-skill](https://github.com/awesome-skills/code-review-skill) | 1,890 | 代码审查 Agent Skill。 | MIT | 1+ | 仅索引 |
| [bergside/typeui.sh](https://github.com/bergside/typeui.sh) | 1,875 | TypeUI 设计系统拉取/安装 Agent Skills 平台。 | MIT | 1+ | 仅索引 |
| [Alisa0808/vox-director](https://github.com/Alisa0808/vox-director) | 1,740 | 影像/短视频导演向 Agent Skill。 | MIT | 1+ | 仅索引 |
| [dvdsgl/claude-canvas](https://github.com/dvdsgl/claude-canvas) | 1,510 | Claude Canvas 插件/marketplace。 | MIT | 多 | 仅索引 |
| [rohitg00/skillkit](https://github.com/rohitg00/skillkit) | 1,486 | Skillkit 技能管理/安装工具与包。 | MIT | 42 | 仅索引 |
| [hyhmrright/brooks-lint](https://github.com/hyhmrright/brooks-lint) | 1,448 | Brooks Lint 代码质量 Agent Skill。 | MIT | 6 | 仅索引 |
| [CloudAI-X/claude-workflow-v2](https://github.com/CloudAI-X/claude-workflow-v2) | 1,413 | Claude 工作流 v2 技能/插件包。 | MIT | 14 | 仅索引 |
| [GanyuanRan/Aegis](https://github.com/GanyuanRan/Aegis) | 1,167 | Aegis 安全防护向 Agent Skills。 | MIT | 1+ | 仅索引 |
| [JuliusBrussee/blueprint](https://github.com/JuliusBrussee/blueprint) | 1,142 | Blueprint Agent Skill/工作流。 | MIT | 1+ | 仅索引 |
| [bear2u/my-skills](https://github.com/bear2u/my-skills) | 922 | My Skills Hub 可安装技能中心。 | MIT | 21 | 仅索引 |
| [vshulcz/deja-vu](https://github.com/vshulcz/deja-vu) | 776 | deja-vu Agent 技能/插件。 | MIT | 3 | 仅索引 |
| [realkimbarrett/advertising-skills](https://github.com/realkimbarrett/advertising-skills) | 743 | 广告投放 Agent Skills。 | MIT | 1+ | 仅索引 |
| [shinpr/claude-code-workflows](https://github.com/shinpr/claude-code-workflows) | 679 | Claude Code 工作流/技能插件包（代码库探索与交付）。 | MIT | 多 | 仅索引 |
| [TexasBedouin/vibe-check](https://github.com/TexasBedouin/vibe-check) | 587 | Vibe Check Agent Skill。 | MIT | 1+ | 仅索引 |
| [hashgraph-online/hol-guard](https://github.com/hashgraph-online/hol-guard) | 553 | Hashgraph Online HOL Guard 技能/插件。 | Apache-2.0 | 1+ | 仅索引 |
| [coffeefuelbump/csv-data-summarizer-claude-skill](https://github.com/coffeefuelbump/csv-data-summarizer-claude-skill) | 462 | CSV 数据摘要 Claude Skill。 | MIT | 20 | 仅索引 |
| [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills) | 417 | 多列表引用的 AI Skills 合集。 | Apache-2.0 | 24 | 仅索引 |
| [marimo-team/marimo-pair](https://github.com/marimo-team/marimo-pair) | 405 | marimo 笔记本结对编程 Agent Skills。 | NOASSERTION | 1+ | 仅索引 |
| [Context-Engine-AI/Context-Engine](https://github.com/Context-Engine-AI/Context-Engine) | 401 | Context Engine 代码检索 Agent Skills。 | NOASSERTION | 4 | 仅索引 |
| [jnMetaCode/ai-shortfilm-prompts](https://github.com/jnMetaCode/ai-shortfilm-prompts) | 395 | AI 短片提示词方法论 Claude Skill。 | MIT | 1+ | 仅索引 |
| [JetBrains/skills](https://github.com/JetBrains/skills) | 335 | JetBrains 官方校验 Agent Skills 精选集合。 | NOASSERTION | 1+ | 仅索引 |
| [intellectronica/agent-skills](https://github.com/intellectronica/agent-skills) | 290 | intellectronica 精选 Claude Code/Cowork Skills。 | NOASSERTION | 1+ | 仅索引 |
| [ohad6k/emulo](https://github.com/ohad6k/emulo) | 288 | emulo Agent Skills/插件。 | MIT | 1+ | 仅索引 |
| [ilyautov/humanizer-ru](https://github.com/ilyautov/humanizer-ru) | 285 | 俄语去 AI 腔 Humanizer Skill。 | MIT | 1+ | 仅索引 |
| [lijigang/ljg-skill-roundtable](https://github.com/lijigang/ljg-skill-roundtable) | 274 | 结构化圆桌辩论 Claude 技能插件。 | MIT | 多 | 仅索引 |
| [squirrelscan/squirrelscan](https://github.com/squirrelscan/squirrelscan) | 265 | SquirrelScan 代码/仓库扫描 Agent Skill。 | MIT | 1+ | 仅索引 |
| [tlehman/litprog-skill](https://github.com/tlehman/litprog-skill) | 259 | Literate programming Agent Skill。 | NOASSERTION | 1+ | 仅索引 |
| [testdouble/han](https://github.com/testdouble/han) | 256 | Han：证据驱动规划/调研/文档 Agent Skills。 | MIT | 1+ | 仅索引 |
| [talkstream/ru-text](https://github.com/talkstream/ru-text) | 223 | 俄语文本处理 Agent Skill。 | MIT | 1+ | 仅索引 |
| [taisly/agent](https://github.com/taisly/agent) | 219 | Taisly Agent 技能包（多列表引用）。 | NOASSERTION | 1+ | 仅索引 |
| [deckardger/tanstack-agent-skills](https://github.com/deckardger/tanstack-agent-skills) | 213 | TanStack 生态 Agent Skills。 | MIT | 1+ | 仅索引 |
| [smixs/creative-director-skill](https://github.com/smixs/creative-director-skill) | 183 | 创意总监 Creative Director Agent Skill。 | NOASSERTION | 1+ | 仅索引 |
| [rand/cc-polymath](https://github.com/rand/cc-polymath) | 163 | cc-polymath 多域 Skill 管理 marketplace。 | MIT | 125 | 仅索引 |
| [gaasher/Agent-Loop-Skills](https://github.com/gaasher/Agent-Loop-Skills) | 163 | Agent Loop Skills 市场包。 | MIT | 20 | 仅索引 |
| [dfkai/xtquantai](https://github.com/dfkai/xtquantai) | 161 | 迅投 QMT 量化交易 AI 技能集。 | MIT | 1+ | 仅索引 |
| [smerchek/claude-epub-skill](https://github.com/smerchek/claude-epub-skill) | 158 | EPUB 电子书处理 Claude Skill。 | NOASSERTION | 1+ | 仅索引 |
| [pattern-ai-labs/agentcall](https://github.com/pattern-ai-labs/agentcall) | 155 | AgentCall Agent Skills/工具包。 | MIT | 1+ | 仅索引 |
| [Gerstep/HumanCompiler](https://github.com/Gerstep/HumanCompiler) | 155 | 将人类行为访谈编译为 AI Agent 的技能包。 | MIT | 1+ | 仅索引 |
| [gokapso/agent-skills](https://github.com/gokapso/agent-skills) | 153 | Kapso Agent Skills 合集。 | NOASSERTION | 1+ | 仅索引 |
| [firecrawl/firecrawl-workflows](https://github.com/firecrawl/firecrawl-workflows) | 151 | Firecrawl 工作流 Agent Skills。 | ISC | 1+ | 仅索引 |
| [Cassette-Editor/oh-my-cassette](https://github.com/Cassette-Editor/oh-my-cassette) | 131 | Oh My Cassette 影像/磁带工作流技能。 | MIT | 多 | 仅索引 |
| [MohamedAbdallah-14/unslop](https://github.com/MohamedAbdallah-14/unslop) | 127 | Unslop 去低质 AI 输出 Agent Skill。 | MIT | 5 | 仅索引 |
| [sandbaseai/sandbase-skills](https://github.com/sandbaseai/sandbase-skills) | 126 | Sandbase Agent Skills 合集。 | Apache-2.0 | 98 | 仅索引 |
| [Vladimir-Human/humanizer-ru](https://github.com/Vladimir-Human/humanizer-ru) | 123 | 去 AI 腔/人性化写作 Agent Skill。 | MIT | 多 | 仅索引 |
| [wrsmith108/linear-claude-skill](https://github.com/wrsmith108/linear-claude-skill) | 121 | Linear 项目管理 Claude Skill。 | MIT | 1+ | 仅索引 |
| [promptadvisers/claudex](https://github.com/promptadvisers/claudex) | 119 | Claude+Codex 对抗审查循环插件。 | MIT | 多 | 仅索引 |
| [beefiker/superloopy](https://github.com/beefiker/superloopy) | 108 | Superloopy Agent 技能/插件。 | MIT | 多 | 仅索引 |
| [numman-ali/zai-cli](https://github.com/numman-ali/zai-cli) | 108 | Z.AI 视觉/搜索等 Agent Skills（zai-cli）。 | MIT | 1+ | 仅索引 |
| [Necmttn/ax](https://github.com/Necmttn/ax) | 104 | Ax Agent Skills/工具包。 | AGPL-3.0 | 8 | 仅索引 |
| [Kevin7Qi/codex-collab](https://github.com/Kevin7Qi/codex-collab) | 95 | Codex 协作 Agent Skill/插件。 | MIT | 1+ | 仅索引 |
| [omkamal/pypict-claude-skill](https://github.com/omkamal/pypict-claude-skill) | 93 | PyPICT 成对测试 Claude Skill。 | MIT | 1+ | 仅索引 |
| [agentrhq/authsome](https://github.com/agentrhq/authsome) | 87 | Authsome 认证相关 Agent Skill。 | MIT | 1+ | 仅索引 |
| [sneg55/agent-starter](https://github.com/sneg55/agent-starter) | 76 | Agent Starter 入门技能包。 | MIT | 1+ | 仅索引 |
| [justincasher/lean-explore](https://github.com/justincasher/lean-explore) | 75 | Lean 4 声明检索 Claude 插件。 | Apache-2.0 | 多 | 仅索引 |
| [eze-is/eze-skills](https://github.com/eze-is/eze-skills) | 73 | 一泽 Eze Skills Claude 插件合集。 | MIT | 多 | 仅索引 |
| [fvadicamo/dev-agent-skills](https://github.com/fvadicamo/dev-agent-skills) | 72 | 开发向 Agent Skills 合集。 | MIT | 多 | 仅索引 |
| [thrixel/build-world](https://github.com/thrixel/build-world) | 71 | Thrixel 3D 游戏资产生成 Claude 插件。 | NOASSERTION | 多 | 仅索引 |
| [k-kolomeitsev/data-structure-protocol](https://github.com/k-kolomeitsev/data-structure-protocol) | 65 | Data Structure Protocol Agent Skill。 | Apache-2.0 | 1+ | 仅索引 |
| [takechanman1228/claude-persona](https://github.com/takechanman1228/claude-persona) | 52 | Claude Persona 人设 Agent Skill。 | MIT | 1+ | 仅索引 |
| [LeeJuOh/claude-code-zero](https://github.com/LeeJuOh/claude-code-zero) | 51 | Claude Code Zero 可分享插件/技能包。 | MIT | 1+ | 仅索引 |
| [Kanevry/session-orchestrator](https://github.com/Kanevry/session-orchestrator) | 49 | Session Orchestrator 会话编排 Agent Skills。 | MIT | 49 | 仅索引 |
| [massimodeluisa/recursive-decomposition-skill](https://github.com/massimodeluisa/recursive-decomposition-skill) | 46 | 递归任务分解 Agent Skill。 | MIT | 1+ | 仅索引 |
| [gbasin/stress-test-skill](https://github.com/gbasin/stress-test-skill) | 42 | 压力测试 Agent Skill。 | MIT | 1+ | 仅索引 |
| [yujiachen-y/codebase-recon-skill](https://github.com/yujiachen-y/codebase-recon-skill) | 36 | 代码库侦察/概览 Agent Skill。 | MIT | 1+ | 仅索引 |
| [awrshift/claude-memory-kit](https://github.com/awrshift/claude-memory-kit) | 33 | Claude Memory Kit 记忆技能包。 | MIT | 8 | 仅索引 |
| [kreuzberg-dev/plugins](https://github.com/kreuzberg-dev/plugins) | 27 | Kreuzberg 文档处理 Codex/Claude 插件。 | MIT | 1+ | 仅索引 |
| [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills) | 46,307 | 学术研究全流程 Claude Skills：检索→写作→审稿→修改→定稿。 | Other | 1+ | 仅索引 |
| [Yuan1z0825/nature-skills](https://github.com/Yuan1z0825/nature-skills) | 39,270 | 面向 Nature 风格论文写作/绘图/审稿的科研 Agent Skills 大库（npx skills）。 | Apache-2.0 | 1+ | 仅索引 |
| [alchaincyf/nuwa-skill](https://github.com/alchaincyf/nuwa-skill) | 32,065 | 女娲：蒸馏任意公开人物思维方式为可安装 Agent Skill。 | MIT | 1+ | 仅索引 |
| [freestylefly/awesome-gpt-image-2](https://github.com/freestylefly/awesome-gpt-image-2) | 28,073 | GPT-Image2 工业级提示词引擎/模板库，提炼为可安装 Skills。 | MIT | 1+ | 仅索引 |
| [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) | 24,824 | 把 Claude Code 变成游戏工作室：49 Agent + 73 工作流 Skills。 | MIT | 73 | 仅索引 |
| [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills) | 12,172 | ConardLi 开源 Skills 合集（网页设计/知识库等）。 | MIT | 5+ | 仅索引 |
| [alchaincyf/zhangxuefeng-skill](https://github.com/alchaincyf/zhangxuefeng-skill) | 10,247 | 张雪峰认知操作系统 Skill（志愿/考研/职业规划，女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [NomaDamas/k-skill](https://github.com/NomaDamas/k-skill) | 7,429 | 面向韩国用户的 Agent Skills 合集。 | MIT | 1+ | 仅索引 |
| [alchaincyf/darwin-skill](https://github.com/alchaincyf/darwin-skill) | 5,877 | 达尔文：评估→改进→测试→棘轮保留的 Skill 自进化系统。 | MIT | 1+ | 仅索引 |
| [Paramchoudhary/ResumeSkills](https://github.com/Paramchoudhary/ResumeSkills) | 2,120 | 简历优化与求职申请类 Agent Skills。 | MIT | 1+ | 仅索引 |
| [GuDaStudio/skills](https://github.com/GuDaStudio/skills) | 2,028 | GuDaStudio Agent Skills 合集。 | MIT | 1+ | 仅索引 |
| [OneWave-AI/claude-skills](https://github.com/OneWave-AI/claude-skills) | 286 | 200+ 生产级 Claude Code Skills 合集。 | MIT | 1+ | 仅索引 |
| [terryso/claude-bmad-skills](https://github.com/terryso/claude-bmad-skills) | 41 | BMAD 方法 Claude Code Skills 集合。 | MIT | 1+ | 仅索引 |
| [cbrock84/headcount](https://github.com/cbrock84/headcount) | 1,253 | 公司化组织的 Claude Code 部门 Skills 市场（125+）。 | MIT | 125+ | 仅索引 |
| [borghei/Claude-Skills](https://github.com/borghei/Claude-Skills) | 703 | 大量 Claude Skills/专家 Agent 与工具合集。 | MIT | 368 | 仅索引 |
| [redfox-data/redfox-community](https://github.com/redfox-data/redfox-community) | 393 | Redfox 社区数据/Agent Skills。 | Other | 1+ | 仅索引 |
| [ericwang915/PythonClaw](https://github.com/ericwang915/PythonClaw) | 41 | Python 向 OpenClaw Skills。 | MIT | 1+ | 仅索引 |
| [VoltAgent/awesome-claude-skills](https://github.com/VoltAgent/awesome-claude-skills) | 33,771 | VoltAgent 精选官方/社区 Agent Skills（非 AI 水货）。 | Other | 精选列表 | 仅索引 |
| [browser-act/skills](https://github.com/browser-act/skills) | 5,587 | BrowserAct 浏览器自动化与抓取 Skills（含 Skill Forge/解决方案目录）。 | MIT | 多 | 仅索引 |
| [qufei1993/skills-hub](https://github.com/qufei1993/skills-hub) | 1,582 | Skills Hub 技能集散/索引。 | Other | 多 | 仅索引 |
| [MoizIbnYousaf/ai-agent-skills](https://github.com/MoizIbnYousaf/ai-agent-skills) | 1,137 | AI Agent Skills 合集。 | Other | 多 | 仅索引 |
| [abubakarsiddik31/claude-skills-collection](https://github.com/abubakarsiddik31/claude-skills-collection) | 1,056 | Claude Skills 精选合集。 | Other | 多 | 仅索引 |
| [coleam00/skills](https://github.com/coleam00/skills) | 477 | 实战软件构建 Agent Skills（PIV 循环/规划/worktree 等）。 | Other | 多 | 仅索引 |
| [freestylefly/canghe-skills](https://github.com/freestylefly/canghe-skills) | 446 | 苍何 Skills 仓库：精选提效技能包。 | Other | 多 | 仅索引 |
| [bencium/bencium-marketplace](https://github.com/bencium/bencium-marketplace) | 418 | Bencium Skills 市场（设计与开发哲学）。 | Other | 多 | 仅索引 |
| [futantan/agent-skills.md](https://github.com/futantan/agent-skills.md) | 256 | Agent Skills 规范/集合文档站。 | Other | 多 | 仅索引 |
| [AtlasCloudAI/awesome-seedance-2.5-prompts-skills](https://github.com/AtlasCloudAI/awesome-seedance-2.5-prompts-skills) | 181 | Seedance 2.5 提示词与视频 Skills 精选。 | Other | 4 | 仅索引 |
| [TerminalSkills/skills](https://github.com/TerminalSkills/skills) | 145 | 开源 AI Agent Skills 库（多客户端）。 | Other | 多 | 仅索引 |
| [LOGIN-TB/claude-skills](https://github.com/LOGIN-TB/claude-skills) | 66 | LOGIN 德语区开放 Claude Skills。 | Other | 多 | 仅索引 |
| [agentbay-ai/agentbay-skills](https://github.com/agentbay-ai/agentbay-skills) | 50 | AgentBay Skills。 | Other | 多 | 仅索引 |
| [adrianpuiu/specification-document-generator](https://github.com/adrianpuiu/specification-document-generator) | 47 | 证据驱动架构规格文档技能/插件市场：`/plugin marketplace add` 安装 architecture-skills（含 specification-architect）；六阶段可追溯文档。接替已废弃的 claude-skills-marketplace。 | Other | 1 | 仅索引 |
| [avenoxai/avenoxskills](https://github.com/avenoxai/avenoxskills) | 48 | 生产级 Agent Skills（Codex/视频/评审等）。 | Other | 多 | 仅索引 |
| [belumume/claude-skills](https://github.com/belumume/claude-skills) | 47 | Claude Skills 合集。 | Other | 多 | 仅索引 |
| [agentskillexchange/skills](https://github.com/agentskillexchange/skills) | 36 | Agent Skill Exchange 技能库。 | Other | 多 | 仅索引 |
| [flaqai/awesome_codex_skills](https://github.com/flaqai/awesome_codex_skills) | 23 | Codex Skills 精选列表。 | Other | 精选列表 | 仅索引 |
| [Ezra144israel/governed-agent-skills](https://github.com/Ezra144israel/governed-agent-skills) | 21 | 治理型 Agent Skills 合集。 | Other | 多 | 仅索引 |
| [zaidmukaddam/skills](https://github.com/zaidmukaddam/skills) | 18 | 面向 Agents/Founders/Engineers 的 AI Skills。 | Other | 多 | 仅索引 |
| [GiaSip/giasip-skills](https://github.com/GiaSip/giasip-skills) | 12 | GiaSip Skills 合集。 | Other | 多 | 仅索引 |
| [ykdojo/claude-code-tips](https://github.com/ykdojo/claude-code-tips) | 10,034 | Claude Code 实用技巧合集（含 dx 插件与可安装 Skills）。 | Other | 多 | 仅索引 |
| [twostraws/Swift-Agent-Skills](https://github.com/twostraws/Swift-Agent-Skills) | 2,595 | Swift/Apple 平台开源 AI Agent Skills 精选目录。 | MIT | 精选列表 | 仅索引 |
| [glebis/claude-skills](https://github.com/glebis/claude-skills) | 370 | Claude Code Skills 合集，增强开发工作流。 | MIT | 多 | 仅索引 |
| [niaka3dayo/agent-skills-vrc-udon](https://github.com/niaka3dayo/agent-skills-vrc-udon) | 278 | VRChat UdonSharp 代码生成 Agent Skills。 | MIT | 多 | 仅索引 |
| [secondsky/claude-skills](https://github.com/secondsky/claude-skills) | 214 | Cloudflare/React/Tailwind 等生产级 Claude Code Skills。 | MIT | 多 | 仅索引 |
| [artwist-polyakov/polyakov-claude-skills](https://github.com/artwist-polyakov/polyakov-claude-skills) | 189 | 俄语向 Claude Skills 合集。 | Other | 多 | 仅索引 |
| [oaustegard/claude-skills](https://github.com/oaustegard/claude-skills) | 147 | 个人 Claude Skills 合集。 | MIT | 多 | 仅索引 |
| [marmbiz/humanizer-de](https://github.com/marmbiz/humanizer-de) | 139 | 德语 AI 文本人性化 Skill（Claude Code/Codex）。 | Other | 多 | 仅索引 |
| [michtio/craftcms-claude-skills](https://github.com/michtio/craftcms-claude-skills) | 78 | Craft CMS 5 生产级 Claude Code Skills/Agents。 | Other | 多 | 仅索引 |
| [PaulRBerg/agent-skills](https://github.com/PaulRBerg/agent-skills) | 70 | PRB 个人 Agent Skills 合集。 | Other | 多 | 仅索引 |
| [magnus919/agent-skills](https://github.com/magnus919/agent-skills) | 67 | Hermes 等框架的 AI Agent Skills 精选集。 | Other | 多 | 仅索引 |
| [Jamie-BitFlight/claude_skills](https://github.com/Jamie-BitFlight/claude_skills) | 65 | Claude Code/Codex/Cursor 插件与 Skills。 | MIT | 多 | 仅索引 |
| [wendylabsinc/claude-skills](https://github.com/wendylabsinc/claude-skills) | 63 | Wendy Labs Claude Skills。 | Other | 多 | 仅索引 |
| [laguagu/claude-code-nextjs-skills](https://github.com/laguagu/claude-code-nextjs-skills) | 62 | Next.js/AI SDK/pgvector 向 Claude Code Skills。 | Apache-2.0 | 多 | 仅索引 |
| [camoa/claude-skills](https://github.com/camoa/claude-skills) | 33 | Claude Skills 合集。 | Other | 多 | 仅索引 |
| [freenet/freenet-agent-skills](https://github.com/freenet/freenet-agent-skills) | 26 | Freenet 应用开发 Agent Skills。 | Other | 10 | 仅索引 |
| [aktsmm/Agent-Skills](https://github.com/aktsmm/Agent-Skills) | 26 | Agent Skills 合集。 | Other | 多 | 仅索引 |
| [shajith003/awesome-claude-skills](https://github.com/shajith003/awesome-claude-skills) | 25 | Awesome Claude Skills 精选列表。 | Other | 精选列表 | 仅索引 |
| [vinnie357/claude-skills](https://github.com/vinnie357/claude-skills) | 24 | Claude Code Skills。 | Other | 精选列表 | 仅索引 |
| [JamalMohafil/claude-skills](https://github.com/JamalMohafil/claude-skills) | 24 | 源自真实问题的 Claude Skills。 | Other | 多 | 仅索引 |
| [gohypergiant/agent-skills](https://github.com/gohypergiant/agent-skills) | 22 | AI coding agent Skills 合集。 | Other | 多 | 仅索引 |
| [felvieira/claude-skills-fv](https://github.com/felvieira/claude-skills-fv) | 22 | Claude Skills（FV）合集。 | Apache-2.0 | 多 | 仅索引 |
| [j4flmao/agent-skills](https://github.com/j4flmao/agent-skills) | 20 | Agent Skills 合集。 | Other | 多 | 仅索引 |
| [Sendmux/skills](https://github.com/Sendmux/skills) | 20 | Sendmux Skills 合集。 | Other | 多 | 仅索引 |
| [Soushi888/holochain-agent-skills](https://github.com/Soushi888/holochain-agent-skills) | 19 | Holochain hApp 开发 Agent Skills。 | Other | 5 | 仅索引 |
| [mhylle/claude-skills-collection](https://github.com/mhylle/claude-skills-collection) | 18 | 代码库研究/上下文/实现规划 Claude Skills。 | Other | 多 | 仅索引 |
| [philipbankier/awesome-agent-skills](https://github.com/philipbankier/awesome-agent-skills) | 17 | 跨平台 Agent Skills/工具/插件精选目录。 | Other | 8 | 仅索引 |
| [ProxiBlue/claude-skills](https://github.com/ProxiBlue/claude-skills) | 17 | Claude Skills 实验合集。 | Other | 多 | 仅索引 |
| [vladimirrott/claude-math](https://github.com/vladimirrott/claude-math) | 16 | Claude Code 终端数学公式 Unicode 可读渲染 Skill。 | Other | 多 | 仅索引 |
| [abagames/agentic-gamedev-skills](https://github.com/abagames/agentic-gamedev-skills) | 14 | 游戏开发与 agentic 工作流提取的 Skills。 | Other | 多 | 仅索引 |
| [Bikach/skills-claude-code](https://github.com/Bikach/skills-claude-code) | 13 | 法语社区 Claude Code Skills。 | Other | 多 | 仅索引 |
| [mthines/agent-skills](https://github.com/mthines/agent-skills) | 12 | 代码评审/DX/UX/TDD 等个人 Agent Skills。 | MIT | 20 | 仅索引 |
| [MindGoblinStudios/grim-tome](https://github.com/MindGoblinStudios/grim-tome) | 12 | Grim Tome：/skills 提示符法术书。 | Other | 多 | 仅索引 |
| [timwukp/agent-skills-best-practice](https://github.com/timwukp/agent-skills-best-practice) | 10 | Scrum/DevSecOps/合规/AWS 等最佳实践 Skills。 | Other | 多 | 仅索引 |
| [carlymr/carlys-claude-skills](https://github.com/carlymr/carlys-claude-skills) | 9 | Carly 的 Claude Skills。 | Other | 多 | 仅索引 |
| [neomjs/neo-agent-skills](https://github.com/neomjs/neo-agent-skills) | 8 | Neo.mjs Agent Skills。 | Other | 多 | 仅索引 |
| [khasky/awesome-agent-skills](https://github.com/khasky/awesome-agent-skills) | 8 | 代码评审/调试/重构等 Agent Skills 精选。 | MIT | 6 | 仅索引 |
| [kevin-burns/claude-skills](https://github.com/kevin-burns/claude-skills) | 8 | 小型 MIT Claude Code Skills。 | MIT | 27 | 仅索引 |
| [adeonir/agent-skills](https://github.com/adeonir/agent-skills) | 8 | 个人 AI coding agent Skills。 | Other | 多 | 仅索引 |
| [Olshansk/agent-skills](https://github.com/Olshansk/agent-skills) | 8 | Agent Skills 合集。 | MIT | 多 | 仅索引 |
| [Bang-isme/CodexAI---Skills](https://github.com/Bang-isme/CodexAI---Skills) | 7 | 端到端开发工作流 Codex Skills 包。 | MIT | 多 | 仅索引 |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 74,261 | Claude Skills 最大社区精选之一，README 收录 1000+ 技能条目。 | Apache-2.0 | 1000+ | 仅索引 |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 53,367 | Claude Code 生态 awesome：技能、斜杠命令、hooks、MCP、插件与工作流。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [VoltAgent/awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills) | 52,318 | 从 ClawHub 等汇总的 OpenClaw 技能精选，README 宣称 5200-5400+。 | README 未单列 SPDX | 5200+ | 仅索引 |
| [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills) | 45,854 | AAS Core：跨代理 SKILL.md 大集合（v16.5.0 宣称 2107 条）。原名 antigravity-awesome-skills。 | MIT | 2107 / 采编 448 | 已采编 |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 33,606 | 官方+社区 Agent Skills 手选目录，徽章宣称 1497+ 条。 | README 未单列 SPDX | 1497+ | 仅索引 |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | 24,796 | Claude Code 子代理精选 158+，相关但不是 SKILL.md 技能库。 | MIT | 158+ 子代理 | 仅索引 |
| [composio-community/awesome-codex-skills](https://github.com/composio-community/awesome-codex-skills) | 16,175 | Codex 技能 awesome 列表；种子名 ComposioHQ/awesome-codex-skills 已迁此仓。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | 14,934 | Claude Skills 社区 awesome 列表，按领域分类索引可安装技能仓。 | README 未单列 SPDX | 精选列表 | 仅索引 |
| [heilcheng/awesome-agent-skills](https://github.com/heilcheng/awesome-agent-skills) | 6,163 | Agent Skills 目录，配套站点 agent-skill.co。 | README 未单列 SPDX | 精选列表 | 仅索引 |
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
| [aiskillstore/marketplace](https://github.com/aiskillstore/marketplace) | 416 | 安全审计过的 Claude/Codex 技能市场，一键安装。 | 其他 | 多 | 仅索引 |
| [majiayu000/spellbook](https://github.com/majiayu000/spellbook) | 274 | 跨运行时 Claude/Codex 多 Agent 技能书。 | 其他 | 多 | 仅索引 |
| [yan-labs/yan-skills](https://github.com/yan-labs/yan-skills) | 177 | Google Trends SEO/AI 新闻等 Yan 技能合集。 | 其他 | 多 | 仅索引 |
| [swyxio/skills](https://github.com/swyxio/skills) | 156 | swyx 的 Claude Code/Agent Skills 合集。 | 其他 | 多 | 仅索引 |
| [TheGoat395/Codex-Skills](https://github.com/TheGoat395/Codex-Skills) | 122 | Codex 优先前端/网站/动效/无访问性技能库。 | 其他 | 多 | 仅索引 |
| [mathbullet/skills](https://github.com/mathbullet/skills) | 119 | mathbullet：面向日文工作流的可安装 Agent Skills 合集。 | 其他 | 多 | 仅索引 |
| [Gingiris-1031/gingiris-skills](https://github.com/Gingiris-1031/gingiris-skills) | 77 | AI 创业运营可复用 Claude Code 技能集。 | MIT | 多 | 仅索引 |
| [ogulcancelik/agent-skills](https://github.com/ogulcancelik/agent-skills) | 76 | 小而固执的跨 Agent 编码技能包。 | 其他 | 多 | 仅索引 |
| [fei0810/bear-research-skills](https://github.com/fei0810/bear-research-skills) | 71 | 熊言熊语：学术科研思路沉淀为 Agent Skills。 | 其他 | 多 | 仅索引 |
| [nota-america/forgecat-agent-profiles](https://github.com/nota-america/forgecat-agent-profiles) | 64 | ForgeCat 可安装 Agent Profiles/技能包市场。 | 其他 | 多 | 仅索引 |
| [zeroclaw-labs/zeroclaw-skills](https://github.com/zeroclaw-labs/zeroclaw-skills) | 61 | ZeroClaw 官方社区技能注册表。 | 其他 | 多 | 仅索引 |
| [palmier-io/palmier-skills](https://github.com/palmier-io/palmier-skills) | 60 | Palmier Pro 精选/社区 Agent Skills 目录。 | 其他 | 多 | 仅索引 |
| [open-fox/agents](https://github.com/open-fox/agents) | 55 | open-fox：浏览器自动化/内容/设计/Obsidian 等 Agent Skills。 | 其他 | 多 | 仅索引 |
| [huangwb8/skills](https://github.com/huangwb8/skills) | 48 | 通用技能开发流水线（Claude Code & Codex）。 | 其他 | 多 | 仅索引 |

## 3. 垂直领域技能包

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
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
| [Agents365-ai/video-podcast-maker](https://github.com/Agents365-ai/video-podcast-maker) | 1,601 | 主题→4K口播视频Agent Skill（研究/脚本/TTS/Remotion）；经365-skills市场安装。 | CC BY-NC 4.0 | 4 | 仅索引 |
| [yushui2022/MathModel-Skill](https://github.com/yushui2022/MathModel-Skill) | 352 | 数学建模全流程Skills（赛题→建模→代码→论文）；Trae/Claude/Codex安装包。异于XiaoMaColtAI同主题仓。 | MIT | 30 | 仅索引 |
| [ascend-ai-coding/awesome-ascend-skills](https://github.com/ascend-ai-coding/awesome-ascend-skills) | 168 | 昇腾NPU开发Skills知识库；npx按域安装；skills.sh收录。 | None | 231 | 仅索引 |
| [DoHyun468/claw-hwp](https://github.com/DoHyun468/claw-hwp) | 158 | 韩文HWP读写Claude/Codex插件技能；plugin marketplace add。 | MIT | 1 | 仅索引 |
| [maplibre/maplibre-agent-skills](https://github.com/maplibre/maplibre-agent-skills) | 143 | MapLibre GL JS社区Skills；npx skills add maplibre/maplibre-agent-skills。 | NOASSERTION | 9 | 仅索引 |
| [Azhi-ss/academic-figure-skills](https://github.com/Azhi-ss/academic-figure-skills) | 98 | 学术论文配图Skills 5条；npx skills add -g --all。 | MIT | 5 | 仅索引 |
| [0731coderlee-sudo/wechat-publisher](https://github.com/0731coderlee-sudo/wechat-publisher) | 46 | Markdown→微信公众号草稿OpenClaw Skill；npx skills add。V2EX。 | MIT | 1 | 仅索引 |
| [prime-skills/runcomfy-agent-skills](https://github.com/prime-skills/runcomfy-agent-skills) | 42 | RunComfy媒体生成Skills；skills.sh热榜；agentspace-so别名指向本仓。 | MIT | 30 | 仅索引 |
| [Tetra-Research/dangerous-professional-plugin](https://github.com/Tetra-Research/dangerous-professional-plugin) | 10 | Patio11 Dangerous Professional沟通风格插件/Skill；HN Show。 | MIT | 1 | 仅索引 |
| [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill) | 28,582 | 技术书PDF→Claude Code Skill；可学习/引用的知识技能包。`npx skills add virgiliojr94/book-to-skill`。 | MIT | 1+ | 仅索引 |
| [Agents365-ai/drawio-skill](https://github.com/Agents365-ai/drawio-skill) | 9,049 | 自然语言/资料→可维护.drawio架构图Skill（Diagram IR）；经365市场安装。 | MIT | 1+ | 仅索引 |
| [chuspeeism/dashi-ppt-skill](https://github.com/chuspeeism/dashi-ppt-skill) | 7,522 | 多视觉主题、浏览器可编辑演示文稿生成Agent Skill（大师PPT）。 | MIT | 1 | 仅索引 |
| [op7418/guizang-social-card-skill](https://github.com/op7418/guizang-social-card-skill) | 6,850 | 小红书轮播/微信封面图生成Claude/Codex Skill。`npx skills add op7418/guizang-social-card-skill`。 | MIT | 1 | 仅索引 |
| [ningzimu/codex-ppt-skill](https://github.com/ningzimu/codex-ppt-skill) | 5,606 | Codex/Claude等GPT-Image-2图片风PPT生成Skill。 | MIT | 1 | 仅索引 |
| [wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill) | 5,155 | GPT Image 2提示词库+Agent Skill/CLI；插件市场安装。 | MIT | 1+ | 仅索引 |
| [coleam00/excalidraw-diagram-skill](https://github.com/coleam00/excalidraw-diagram-skill) | 4,688 | 让Claude Code等生成美观实用Excalidraw图的Skill。 | MIT | 1 | 仅索引 |
| [twostraws/SwiftUI-Agent-Skill](https://github.com/twostraws/SwiftUI-Agent-Skill) | 4,650 | SwiftUI专家指导Agent Skill（Claude/Codex等）。`npx skills add`。 | MIT | 1 | 仅索引 |
| [0x0funky/agent-sprite-forge](https://github.com/0x0funky/agent-sprite-forge) | 3,999 | 2D精灵表/地图透明PNG帧生成Agent Skill。 | MIT | 1 | 仅索引 |
| [muxuuu/serenity-skill](https://github.com/muxuuu/serenity-skill) | 3,952 | 供应链瓶颈选股研究Agent Skill（半导体/算力/创新药等）。 | MIT | 1+ | 仅索引 |
| [HughYau/qiushi-skill](https://github.com/HughYau/qiushi-skill) | 3,766 | 求是式调研Agent Skill：先调查、抓主要矛盾、实践验证。插件市场安装。 | MIT | 1 | 仅索引 |
| [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill) | 3,101 | 面向编码Agent的通用Playwright自动化Skill。`npx skills add lackeyjb/playwright-skill`。 | MIT | 1 | 仅索引 |
| [NarratorAI-Studio/narrator-ai-cli-skill](https://github.com/NarratorAI-Studio/narrator-ai-cli-skill) | 2,537 | AI解说大师：封装narrator-ai-cli供Claude/Codex调用的Skill。 | MIT | 1 | 仅索引 |
| [yanliudesign/mono-color-skill](https://github.com/yanliudesign/mono-color-skill) | 2,520 | 单色/双色编辑印刷风图像Skill（海报/杂志/肖像）。 | MIT | 1 | 仅索引 |
| [amElnagdy/delegate-skills](https://github.com/amElnagdy/delegate-skills) | 1,673 | 把编码任务委派给独立CLI Agent并审diff落地。`npx skills add amElnagdy/delegate-skills`。 | MIT | 多 | 仅索引 |
| [AvdLee/Swift-Concurrency-Agent-Skill](https://github.com/AvdLee/Swift-Concurrency-Agent-Skill) | 1,641 | Swift Concurrency专家Agent Skill（开源Agent Skills格式）。 | MIT | 1 | 仅索引 |
| [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) | 1,526 | 通用动效设计原则Agent Skill（timing/easing等）。`npx skills add LottieFiles/motion-design-skill`。 | MIT | 1 | 仅索引 |
| [conorluddy/ios-simulator-skill](https://github.com/conorluddy/ios-simulator-skill) | 1,242 | iOS Simulator Claude插件Skill。`/plugin marketplace add conorluddy/ios-simulator-skill`。 | MIT | 1 | 仅索引 |
| [AvdLee/Xcode-Build-Optimization-Agent-Skill](https://github.com/AvdLee/Xcode-Build-Optimization-Agent-Skill) | 1,212 | Xcode增量/清洁构建优化Agent Skill。`npx skills add`。 | MIT | 1 | 仅索引 |
| [imxv/Pretty-mermaid-skills](https://github.com/imxv/Pretty-mermaid-skills) | 1,182 | 美化Mermaid→SVG/终端ASCII的Agent Skill。`npx skills add imxv/pretty-mermaid-skills`。 | MIT | 1 | 仅索引 |
| [itsmostafa/aws-agent-skills](https://github.com/itsmostafa/aws-agent-skills) | 1,150 | AWS场景Agent Skills合集。 | MIT | 多 | 仅索引 |
| [bevibing/tutor-skills](https://github.com/bevibing/tutor-skills) | 1,130 | PDF/文档/代码库→Obsidian学习库的Claude Skill。 | MIT | 1 | 仅索引 |
| [adithya-s-k/manim_skill](https://github.com/adithya-s-k/manim_skill) | 1,089 | Manim/3Blue1Brown风格动画Agent Skills。 | MIT | 多 | 仅索引 |
| [rorkai/app-store-connect-cli-skills](https://github.com/rorkai/app-store-connect-cli-skills) | 1,005 | App Store Connect CLI自动化Skills。 | MIT | 多 | 仅索引 |
| [Spielewoy/autoprompt-skill](https://github.com/Spielewoy/autoprompt-skill) | 990 | 降低agentic任务失败率的Autoprompt编码Skill。 | MIT | 1 | 仅索引 |
| [boyang-hu/website-rebuild-skill](https://github.com/boyang-hu/website-rebuild-skill) | 916 | 只读镜像抓取+压缩代码还原网站复刻Agent Skill。 | MIT | 1 | 仅索引 |
| [Sushegaad/Claude-Skills-Governance-Risk-and-Compliance](https://github.com/Sushegaad/Claude-Skills-Governance-Risk-and-Compliance) | 876 | GRC治理风险合规Claude Skills。 | MIT | 多 | 仅索引 |
| [Gabberflast/academic-pptx-skill](https://github.com/Gabberflast/academic-pptx-skill) | 842 | 学术会议答辩PPTX生成Claude Skill。 | MIT | 1 | 仅索引 |
| [JeffLi1993/seo-audit-skill](https://github.com/JeffLi1993/seo-audit-skill) | 750 | 单页SEO审计Agent Skill；输出结构化HTML报告。V2EX。`npx skills add JeffLi1993/seo-audit-skill`。 | MIT | 1 | 仅索引 |
| [tourmind-com/Tourmind-Booking-Skills](https://github.com/tourmind-com/Tourmind-Booking-Skills) | 690 | 酒店搜索预订端到端AI Agent Skill。 | MIT | 多 | 仅索引 |
| [leenbj/novel-creator-skill](https://github.com/leenbj/novel-creator-skill) | 620 | 小说创作Agent Skill。 | MIT | 1+ | 仅索引 |
| [aldefy/compose-skill](https://github.com/aldefy/compose-skill) | 577 | Jetpack Compose Agent Skill（真实API知识）。 | MIT | 1 | 仅索引 |
| [op7418/guizang-yingzao-skill](https://github.com/op7418/guizang-yingzao-skill) | 327 | 中国传统营造/建筑文化图像生成Claude/Codex Skill。 | MIT | 1 | 仅索引 |
| [AvdLee/Core-Data-Agent-Skill](https://github.com/AvdLee/Core-Data-Agent-Skill) | 303 | Apple Core Data框架Agent Skill。 | MIT | 1 | 仅索引 |
| [ZeKaiNie/universal-examprep-skill](https://github.com/ZeKaiNie/universal-examprep-skill) | 280 | 考前突击教练Claude Agent Skill（课件→复习）。 | MIT | 1 | 仅索引 |
| [zouchenzhen/thesis-defense-pptx-skill](https://github.com/zouchenzhen/thesis-defense-pptx-skill) | 255 | PDF/LaTeX→可编辑答辩PPTX的Codex/Claude Skill。 | MIT | 1 | 仅索引 |
| [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) | 42,716 | 科研 Agent Skills 大合集（Scientific Skills）。 | MIT | 多 | 仅索引 |
| [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) | 28,749 | 用编码 Agent 生成精美 HTML 演示文稿的 Skill。 | MIT | 1+ | 仅索引 |
| [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | 16,325 | 开源 SEO 分析 Claude 插件/技能包。 | MIT | 1+ | 仅索引 |
| [AgriciDaniel/claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian) | 14,635 | Obsidian + Claude 自组织第二大脑技能包。 | MIT | 多 | 仅索引 |
| [AgriciDaniel/claude-ads](https://github.com/AgriciDaniel/claude-ads) | 8,735 | 跨 12 广告平台的付费媒体运营 Claude Skill。 | MIT | 1+ | 仅索引 |
| [eugeniughelbur/obsidian-second-brain](https://github.com/eugeniughelbur/obsidian-second-brain) | 4,324 | Obsidian 明文第二大脑：跨 CLI Agent 持久记忆技能包。 | MIT | 3 | 仅索引 |
| [AvdLee/SwiftUI-Agent-Skill](https://github.com/AvdLee/SwiftUI-Agent-Skill) | 3,491 | SwiftUI 专家 Agent Skill（marketplace/npx）。 | MIT | 1+ | 仅索引 |
| [vuejs-ai/skills](https://github.com/vuejs-ai/skills) | 2,822 | Vue 3 开发 Agent Skills 集合。 | MIT | 1+ | 仅索引 |
| [indranilbanerjee/digital-marketing-pro](https://github.com/indranilbanerjee/digital-marketing-pro) | 793 | 数字营销专业 Agent Skills。 | MIT | 163 | 仅索引 |
| [GarethManning/education-agent-skills](https://github.com/GarethManning/education-agent-skills) | 731 | 教育领域 Agent Skills。 | NOASSERTION | 20 | 仅索引 |
| [onmax/nuxt-skills](https://github.com/onmax/nuxt-skills) | 706 | Nuxt 前端 Agent Skills。 | MIT | 1+ | 仅索引 |
| [Orkas-AI/Orkas-VideoStudio](https://github.com/Orkas-AI/Orkas-VideoStudio) | 491 | Orkas 视频工作室 Agent Skill。 | MIT | 1+ | 仅索引 |
| [educlopez/ui-craft](https://github.com/educlopez/ui-craft) | 313 | UI Craft 设计质量系统 Agent Skills。 | MIT | 1+ | 仅索引 |
| [Infrasity-Labs/dev-gtm-claude-skills](https://github.com/Infrasity-Labs/dev-gtm-claude-skills) | 122 | 开发者 GTM Claude Skills。 | MIT | 3 | 仅索引 |
| [emaynard/claude-family-history-research-skill](https://github.com/emaynard/claude-family-history-research-skill) | 108 | 家族史/谱系研究 Claude Skill。 | NOASSERTION | 1+ | 仅索引 |
| [kgraph57/mckinsey-style-visualization-skill](https://github.com/kgraph57/mckinsey-style-visualization-skill) | 94 | 麦肯锡风格可视化 Agent Skill。 | MIT | 1+ | 仅索引 |
| [shepsci/kaggle-skill](https://github.com/shepsci/kaggle-skill) | 85 | Kaggle 竞赛工作流 Agent Skill。 | MIT | 3 | 仅索引 |
| [longsizhuo/openInvest](https://github.com/longsizhuo/openInvest) | 83 | 金融/投资研究 Agent Skills。 | MIT | 多 | 仅索引 |
| [plasma-ai/wiki](https://github.com/plasma-ai/wiki) | 82 | Plasma Wiki 第二大脑 Agent 技能包。 | GPL-3.0 | 多 | 仅索引 |
| [mykpono/ultimate-seo-geo](https://github.com/mykpono/ultimate-seo-geo) | 74 | 面向 AI Agent 的 SEO/GEO 分析与优化技能包。 | MIT | 1+ | 仅索引 |
| [TomGranot/hubspot-admin-skills](https://github.com/TomGranot/hubspot-admin-skills) | 70 | HubSpot CRM 管理 Agent Skills。 | MIT | 37 | 仅索引 |
| [dreamrec/LivePilot](https://github.com/dreamrec/LivePilot) | 67 | Ableton Live 音乐制作 Agent/MCP 技能插件。 | NOASSERTION | 1+ | 仅索引 |
| [muthuishere/hand-drawn-diagrams](https://github.com/muthuishere/hand-drawn-diagrams) | 65 | 手绘风格图表生成 Agent Skill。 | MIT | 1+ | 仅索引 |
| [AlterLab-IEU/AlterLab-Academic-Skills](https://github.com/AlterLab-IEU/AlterLab-Academic-Skills) | 64 | 学术研究 AlterLab Agent Skills。 | MIT | 20 | 仅索引 |
| [Ericyoung-183/alpha-insights](https://github.com/Ericyoung-183/alpha-insights) | 59 | Alpha Insights 投资洞察 Agent Skill。 | MIT | 1+ | 仅索引 |
| [sergebulaev/x-skills](https://github.com/sergebulaev/x-skills) | 56 | X/Twitter 相关 Agent Skills。 | MIT | 9 | 仅索引 |
| [dembrandt/dembrandt-skills](https://github.com/dembrandt/dembrandt-skills) | 52 | Dembrandt 设计向 Agent Skills。 | MIT | 1+ | 仅索引 |
| [JanYork/llm-wiki-cli](https://github.com/JanYork/llm-wiki-cli) | 52 | LLM Wiki CLI 第二大脑/知识库 Agent 技能。 | Apache-2.0 | 1+ | 仅索引 |
| [takechanman1228/claude-ecom](https://github.com/takechanman1228/claude-ecom) | 49 | 电商运营 Claude Agent Skills。 | MIT | 多 | 仅索引 |
| [liuyuexi1987/shenlun-review-pro](https://github.com/liuyuexi1987/shenlun-review-pro) | 44 | 申论材料解析/作答批改 Claude 插件。 | NOASSERTION | 多 | 仅索引 |
| [naorsabag/openhop](https://github.com/naorsabag/openhop) | 42 | OpenHop 动画数据流图 Claude Skill。 | MIT | 1+ | 仅索引 |
| [brycewang-stanford/many-ppt-skills](https://github.com/brycewang-stanford/many-ppt-skills) | 40 | AI 幻灯片 Skill 对比选型注册表。 | Apache-2.0 | 1+ | 仅索引 |
| [jinwx/weather-data-skills](https://github.com/jinwx/weather-data-skills) | 37 | 气象数据 Agent Skills。 | MIT | 1+ | 仅索引 |
| [SupercmoHQ/superCMO-skills](https://github.com/SupercmoHQ/superCMO-skills) | 33 | SuperCMO 营销 Agent Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | 52,076 | 文档/主题一键生成原生 PowerPoint 的 AI PPT Agent Skills。 | MIT | 1+ | 仅索引 |
| [alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design) | 23,887 | 花书设计：Claude Code 里 HTML 原生高保真原型/幻灯片/动画 Skill。 | MIT | 1+ | 仅索引 |
| [teng-lin/notebooklm-py](https://github.com/teng-lin/notebooklm-py) | 19,152 | NotebookLM 非官方 Python API + 可安装 agentic Skill。 | MIT | 1+ | 仅索引 |
| [FreedomIntelligence/OpenClaw-Medical-Skills](https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills) | 2,992 | 大型开源医疗 AI Skills 库（OpenClaw）。 | MIT | 多 | 仅索引 |
| [Ceeon/videocut-skills](https://github.com/Ceeon/videocut-skills) | 2,971 | 用 Claude Code Skills 做的视频剪辑 Agent。 | Apache-2.0 | 1+ | 仅索引 |
| [AgriciDaniel/claude-blog](https://github.com/AgriciDaniel/claude-blog) | 2,057 | 博客写作 Claude 插件/技能套件（多 sub-skills + agents）。 | MIT | 2 | 仅索引 |
| [Eronred/aso-skills](https://github.com/Eronred/aso-skills) | 1,826 | App Store Optimization / 应用营销 Agent Skills。 | MIT | 1+ | 仅索引 |
| [tigerless-labs/autoharness](https://github.com/tigerless-labs/autoharness) | 1,682 | 从真实会话蒸馏并自我更新的 Claude Code Skill 层。 | MIT | 1+ | 仅索引 |
| [BehiSecc/VibeSec-Skill](https://github.com/BehiSecc/VibeSec-Skill) | 1,260 | 安全优先编码 Skill：把漏洞狩猎经验注入写作流程（防御向）。 | MIT | 1+ | 仅索引 |
| [JuneYaooo/gpt-image2-ppt-skills](https://github.com/JuneYaooo/gpt-image2-ppt-skills) | 1,247 | 用 gpt-image-2 仿制/生成 PPT 版式的 Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [GPTomics/bioSkills](https://github.com/GPTomics/bioSkills) | 1,199 | 生物信息学 Agent Skills（SKILL.md 集合）。 | MIT | 1+ | 仅索引 |
| [alchaincyf/x-mentor-skill](https://github.com/alchaincyf/x-mentor-skill) | 1,194 | X/Twitter 运营方法论主题 Skill（女娲非人类蒸馏作品）。 | MIT | 1+ | 仅索引 |
| [RoundTable02/tutor-skills](https://github.com/RoundTable02/tutor-skills) | 1,130 | 把 PDF/文档/代码库变成 Obsidian 学习资料的 Skill。 | MIT | 1+ | 仅索引 |
| [coji/natural-japanese](https://github.com/coji/natural-japanese) | 965 | 让日文职场写作更自然易读的 Agent Skill。 | MIT | 1+ | 仅索引 |
| [alchaincyf/steve-jobs-skill](https://github.com/alchaincyf/steve-jobs-skill) | 944 | 乔布斯认知操作系统 Skill（女娲蒸馏，含心智模型与启发式）。 | MIT | 1+ | 仅索引 |
| [Raymondhou0917/speak-human-tw](https://github.com/Raymondhou0917/speak-human-tw) | 932 | 繁中去 AI 腔改写 Skill（含中国用语/标点校正）。 | MIT | 1+ | 仅索引 |
| [Anionex/dsh-vision-toolkit](https://github.com/Anionex/dsh-vision-toolkit) | 853 | DeepSeek Harness 视觉工具箱 Skill/插件。 | MIT | 1+ | 仅索引 |
| [zenstory-ai/novel-to-game](https://github.com/zenstory-ai/novel-to-game) | 755 | 小说改编为可玩游戏的 Agent Skills 套件。 | MIT | 1+ | 仅索引 |
| [LB623/no-negative-echo](https://github.com/LB623/no-negative-echo) | 741 | 减少被否决方案残留于标题/commit/PR 的 Codex Skill。 | MIT | 1+ | 仅索引 |
| [AmazingAng/old-coder](https://github.com/AmazingAng/old-coder) | 710 | 证据优先的老派工程策略 Skill（先跑验收再读代码）。 | MIT | 1+ | 仅索引 |
| [heliocosta-dev/revenue-centric-design](https://github.com/heliocosta-dev/revenue-centric-design) | 669 | 面向 SaaS 转化与行为科学的产品设计 Skills。 | Other | 1+ | 仅索引 |
| [chubbyguan/chubbyskills](https://github.com/chubbyguan/chubbyskills) | 657 | 中文全渠道内容采集进个人知识库的 13 个 AI Skills。 | MIT | 1+ | 仅索引 |
| [sparklabx/drawio-ai-kit](https://github.com/sparklabx/drawio-ai-kit) | 638 | 教 Agent 画正确美观 draw.io 图的 Skill 工具包。 | MIT | 1+ | 仅索引 |
| [Light0305/Light-skills](https://github.com/Light0305/Light-skills) | 589 | 科研/竞赛/创新项目工作流 Skill 包。 | MIT | 1+ | 仅索引 |
| [ayi-ai/nie-grassroots-logic](https://github.com/ayi-ai/nie-grassroots-logic) | 544 | 聂·基层运行逻辑方法论工具箱 Agent Skill。 | MIT | 1+ | 仅索引 |
| [NoizAI/skills](https://github.com/NoizAI/skills) | 524 | 让 Agent 以更自然语音说话/喊话的 Skills。 | Other | 6+ | 仅索引 |
| [Jaycheng1103/chatgpt-video-editing-skills](https://github.com/Jaycheng1103/chatgpt-video-editing-skills) | 518 | ChatGPT/Codex 可验证短影音剪辑环境 Skills。 | MIT | 2 | 仅索引 |
| [Johell1NS/browser-search](https://github.com/Johell1NS/browser-search) | 513 | SearXNG + 浏览器自动化的 Agent 联网搜索 Skill。 | MIT | 1+ | 仅索引 |
| [alchaincyf/elon-musk-skill](https://github.com/alchaincyf/elon-musk-skill) | 503 | 马斯克认知操作系统 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [OSideMedia/higgsfield-ai-prompt-skill](https://github.com/OSideMedia/higgsfield-ai-prompt-skill) | 493 | Higgsfield 电影级视频提示词 Skill（多子技能）。 | MIT | 多 | 仅索引 |
| [Yuzzyuk/marketing-os](https://github.com/Yuzzyuk/marketing-os) | 475 | 一整套营销部门能力封装为单个 Claude Skill。 | MIT | 1+ | 仅索引 |
| [yanhua1010/self-media-content-workflow](https://github.com/yanhua1010/self-media-content-workflow) | 474 | 模块化自媒体内容生产与经营 Skills。 | MIT | 9+ | 仅索引 |
| [bitwize-music-studio/claude-ai-music-skills](https://github.com/bitwize-music-studio/claude-ai-music-skills) | 471 | Suno 人机音乐制作工作流 Claude Skills。 | Other | 1+ | 仅索引 |
| [limingrui679-design/high-stakes-analytics-decision-lab](https://github.com/limingrui679-design/high-stakes-analytics-decision-lab) | 452 | 高风险决策的数据剖析与可视化分析 Skill。 | MIT | 1+ | 仅索引 |
| [tt-a1i/simplify-codebase](https://github.com/tt-a1i/simplify-codebase) | 437 | 证明并移除代码库偶然复杂度的 Agent Skill。 | MIT | 1+ | 仅索引 |
| [EvoScientist/EvoSkills](https://github.com/EvoScientist/EvoSkills) | 434 | 为 EvoScientist 扩展的可安装科研 Skill/知识包。 | Apache-2.0 | 1+ | 仅索引 |
| [reticlehq/reticle](https://github.com/reticlehq/reticle) | 433 | 给 Agent 运行时感知 Web/桌面应用的验证 Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [rollingSirius/equity-research-skill](https://github.com/rollingSirius/equity-research-skill) | 430 | 深度个股/财报研究与可复现估值 Skill（美/港/A）。 | MIT | 1+ | 仅索引 |
| [BrianRWagner/ai-marketing-skills](https://github.com/BrianRWagner/ai-marketing-skills) | 408 | 可被 Claude Code 执行的营销框架 Skills。 | MIT | 1+ | 仅索引 |
| [Adkid-Zephyr/anti-defensive-writing-Skill](https://github.com/Adkid-Zephyr/anti-defensive-writing-Skill) | 396 | 学术论文去防御性写作的轻量 Skill。 | MIT | 2 | 仅索引 |
| [DougTrajano/pydantic-ai-skills](https://github.com/DougTrajano/pydantic-ai-skills) | 368 | 在 pydantic-ai 中接入 Agent Skills 标准。 | MIT | 1+ | 仅索引 |
| [alchaincyf/munger-skill](https://github.com/alchaincyf/munger-skill) | 358 | 芒格多元思维模型 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [AlmogBaku/debug-skill](https://github.com/AlmogBaku/debug-skill) | 317 | 调试向 Agent Skill（npx/skills.sh）。 | MIT | 1+ | 仅索引 |
| [EveryInc/charlie-cfo-skill](https://github.com/EveryInc/charlie-cfo-skill) | 309 | 面向创业公司的 CFO 财务管理 Claude Skill。 | MIT | 1+ | 仅索引 |
| [Lupynow/math-modeling-skills](https://github.com/Lupynow/math-modeling-skills) | 305 | 数学建模竞赛全流程工具链 Skills（国赛/美赛）。 | MIT | 1+ | 仅索引 |
| [alchaincyf/karpathy-skill](https://github.com/alchaincyf/karpathy-skill) | 298 | Karpathy 认知操作系统 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [alchaincyf/trump-skill](https://github.com/alchaincyf/trump-skill) | 265 | 特朗普谈判与权力分析框架 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [alchaincyf/feynman-skill](https://github.com/alchaincyf/feynman-skill) | 264 | 费曼学习/教学思维 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [andylizf/nonstop](https://github.com/andylizf/nonstop) | 263 | Claude Code 持续自主工作模式插件/Skills。 | MIT | 1+ | 仅索引 |
| [alchaincyf/naval-skill](https://github.com/alchaincyf/naval-skill) | 242 | Naval 财富/杠杆人生哲学 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [Aboudjem/humanizer-skill](https://github.com/Aboudjem/humanizer-skill) | 214 | 开源去 AI 写作痕迹/检测 Skill。 | MIT | 1+ | 仅索引 |
| [rileyhilliard/rr](https://github.com/rileyhilliard/rr) | 195 | 远端同步跑命令的 Claude 插件/Skills。 | MIT | 1+ | 仅索引 |
| [Bomx/distribb-skill](https://github.com/Bomx/distribb-skill) | 185 | AI SEO 写作 Distribb CLI/多 Agent Skill。 | Other | 多 | 仅索引 |
| [mattgierhart/PRD-driven-context-engineering](https://github.com/mattgierhart/PRD-driven-context-engineering) | 182 | PRD 驱动上下文工程 / Memory 基建 Skills。 | MIT | 1+ | 仅索引 |
| [leeguooooo/cross-request-master](https://github.com/leeguooooo/cross-request-master) | 171 | YApi 浏览器插件 + YApi Skill。 | MIT | 1+ | 仅索引 |
| [alchaincyf/zhang-yiming-skill](https://github.com/alchaincyf/zhang-yiming-skill) | 167 | 张一鸣认知操作系统 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [Square-Zero-Labs/video-prompting-skill](https://github.com/Square-Zero-Labs/video-prompting-skill) | 165 | 视频模型提示词 Agent Skill。 | Apache-2.0 | 1+ | 仅索引 |
| [bartekpucek/miodkuj](https://github.com/bartekpucek/miodkuj) | 161 | 含 marketplace 的 Claude 插件技能包。 | MIT | 1+ | 仅索引 |
| [Digidai/product-manager-skills](https://github.com/Digidai/product-manager-skills) | 157 | SaaS 指标诊断等 PM Skills（多 Agent）。 | Other | 1+ | 仅索引 |
| [Mark393295827/third-brain-v5-skills](https://github.com/Mark393295827/third-brain-v5-skills) | 139 | Agent Wiki + 工程 Skills 第三脑包。 | MIT | 13+ | 仅索引 |
| [Alisa0808/vibe-creating-skill](https://github.com/Alisa0808/vibe-creating-skill) | 137 | 双语 AI 视频提示词改写 Skill。 | MIT | 1+ | 仅索引 |
| [0xE1337/thesis-figure-skill](https://github.com/0xE1337/thesis-figure-skill) | 130 | 论文文本自动生成投稿级 LaTeX 图 Skill。 | MIT | 1+ | 仅索引 |
| [alchaincyf/taleb-skill](https://github.com/alchaincyf/taleb-skill) | 119 | 塔勒布反脆弱/风险思维 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [alchaincyf/mrbeast-skill](https://github.com/alchaincyf/mrbeast-skill) | 109 | MrBeast 内容创造方法论 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [obra/claude-session-driver](https://github.com/obra/claude-session-driver) | 107 | 启动/控制/监控其他 Claude Code 会话的 Skill。 | MIT | 1+ | 仅索引 |
| [opentrace/opentrace](https://github.com/opentrace/opentrace) | 106 | 知识图谱平台附带的 Agent marketplace Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [bmad-code-org/bmad-method-test-architecture-enterprise](https://github.com/bmad-code-org/bmad-method-test-architecture-enterprise) | 96 | BMAD 方法测试架构企业增强 Skills。 | MIT | 1+ | 仅索引 |
| [alchaincyf/paul-graham-skill](https://github.com/alchaincyf/paul-graham-skill) | 95 | Paul Graham 认知操作系统 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [nathankim0/clean-architecture-skills](https://github.com/nathankim0/clean-architecture-skills) | 88 | 整洁架构评审与设计 Claude Skills。 | MIT | 1+ | 仅索引 |
| [KerberosClaw/kc_ai_skills](https://github.com/KerberosClaw/kc_ai_skills) | 79 | 中文优先的 Claude/Codex 实用 AI Skills。 | MIT | 1+ | 仅索引 |
| [kevindutra/crit](https://github.com/kevindutra/crit) | 79 | 评审 AI 生成代码/方案的 TUI（含 marketplace）。 | Other | 1+ | 仅索引 |
| [Ashutos1997/claude-design-auditor-skill](https://github.com/Ashutos1997/claude-design-auditor-skill) | 75 | 按 19 条设计规则审计界面的 Claude Skill。 | Other | 1+ | 仅索引 |
| [ujjwalredd/Dopamine](https://github.com/ujjwalredd/Dopamine) | 69 | 仿人类多巴胺调度的 Agent Skill。 | MIT | 1+ | 仅索引 |
| [HeshamFS/materials-simulation-skills](https://github.com/HeshamFS/materials-simulation-skills) | 66 | 计算材料学 Agent Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [Dianel555/DSkills](https://github.com/Dianel555/DSkills) | 64 | CLI 工具类 AI 编程助手 Skills。 | MIT | 1+ | 仅索引 |
| [heleninsights-dot/phd-deepread-workflow](https://github.com/heleninsights-dot/phd-deepread-workflow) | 61 | 博士生精读文献 CLI 工作流 Skills。 | MIT | 1+ | 仅索引 |
| [KieranGao/general-readme-skill](https://github.com/KieranGao/general-readme-skill) | 61 | 为任意项目生成专业 README 的 Skill。 | MIT | 1+ | 仅索引 |
| [Equilateral-AI/equilateral-agents-open-core](https://github.com/Equilateral-AI/equilateral-agents-open-core) | 59 | 多 Agent 编排开源核心（含可安装 Skills）。 | MIT | 1+ | 仅索引 |
| [btachinardi/church](https://github.com/btachinardi/church) | 58 | 整洁代码「教团」式 subagents/插件包。 | MIT | 1+ | 仅索引 |
| [suntay44/buildable-plugin-skills](https://github.com/suntay44/buildable-plugin-skills) | 53 | 本地优先 AI 应用构建脑（Claude 插件 Skills）。 | MIT | 1+ | 仅索引 |
| [Rtur2003/Claude-Code-Promts-Skills](https://github.com/Rtur2003/Claude-Code-Promts-Skills) | 50 | 面向 Claude 编程 Agent 的生产级提示词/Skills 库。 | MIT | 5+ | 仅索引 |
| [alchaincyf/ilya-sutskever-skill](https://github.com/alchaincyf/ilya-sutskever-skill) | 49 | Ilya Sutskever 研究品味/AI 安全思维 Skill（女娲蒸馏）。 | MIT | 1+ | 仅索引 |
| [memi-design/memi](https://github.com/memi-design/memi) | 40 | 面向 Agent 的设计上下文层 Skills。 | MIT | 1+ | 仅索引 |
| [latentwill/ideonomy-skill](https://github.com/latentwill/ideonomy-skill) | 39 | Patrick 创意展开方法论 Claude Skill。 | MIT | 1+ | 仅索引 |
| [powerofjinbo/phdtaketaketake](https://github.com/powerofjinbo/phdtaketaketake) | 32 | 博士导师匹配导向的连接优先 Skill。 | MIT | 1+ | 仅索引 |
| [reqvire-org/reqvire](https://github.com/reqvire-org/reqvire) | 19 | 语义工程框架附带的 marketplace Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [bmad-labs/skills](https://github.com/bmad-labs/skills) | 15 | 可安装 Agent Skill/插件包（README 含安装证明）。 | MIT | 1+ | 仅索引 |
| [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) | 27,134 | ADHD 友好输出 Skill：减少废话、把答案前置。 | MIT | 1+ | 仅索引 |
| [wanshuiyin/Auto-claude-code-research-in-sleep](https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep) | 15,741 | ARIS：睡眠/后台自动科研的轻量 Markdown Skills。 | MIT | 1+ | 仅索引 |
| [Zeejay0/gathered-scenes-zine-skill](https://github.com/Zeejay0/gathered-scenes-zine-skill) | 4,811 | 收集场景并生成 zine/小册的 Agent Skill。 | Other | 1+ | 仅索引 |
| [vinvcn/mattpocock-skills-zh-CN](https://github.com/vinvcn/mattpocock-skills-zh-CN) | 3,972 | mattpocock/skills 简体中文本地化 Skills。 | Other | 1+ | 仅索引 |
| [nowork-studio/notfair-plugin](https://github.com/nowork-studio/notfair-plugin) | 3,452 | 开源 SEO/GEO/营销 Agent Skills 插件。 | MIT | 1+ | 仅索引 |
| [Sahir619/fable-method](https://github.com/Sahir619/fable-method) | 2,274 | Claude Fable 工作流蒸馏为可安装 Skills。 | MIT | 1+ | 仅索引 |
| [HUANGCHIHHUNGLeo/claude-real-video](https://github.com/HUANGCHIHHUNGLeo/claude-real-video) | 2,119 | 让 Agent 真正「看懂」视频的场景化 Skills。 | MIT | 1+ | 仅索引 |
| [feiskyer/claude-code-settings](https://github.com/feiskyer/claude-code-settings) | 1,646 | Claude Code 技能/子代理与配置模板合集。 | MIT | 1+ | 仅索引 |
| [Klotzkette/claude-fuer-deutsches-recht](https://github.com/Klotzkette/claude-fuer-deutsches-recht) | 1,551 | 面向德国法律场景的实验性 Claude Skills。 | MIT | 1+ | 仅索引 |
| [skills-directory/skill-codex](https://github.com/skills-directory/skill-codex) | 1,424 | 把提示委托给 Codex 的 Claude Code Skill。 | Other | 1+ | 仅索引 |
| [mem9-ai/mem9](https://github.com/mem9-ai/mem9) | 1,206 | OpenClaw 无限记忆官方插件/Skills。 | MIT | 1+ | 仅索引 |
| [ClawBio/ClawBio](https://github.com/ClawBio/ClawBio) | 1,125 | 生物信息学原生 AI Agent Skills 库。 | MIT | 1+ | 仅索引 |
| [Bhanunamikaze/Agentic-SEO-Skill](https://github.com/Bhanunamikaze/Agentic-SEO-Skill) | 890 | 面向 Antigravity/Codex/Claude 的 LLM 优先 SEO 分析 Skill。 | MIT | 1+ | 仅索引 |
| [plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills) | 879 | 高级设计架构师 UX/UI Agent Skills。 | MIT | 1+ | 仅索引 |
| [nexscope-ai/eCommerce-Skills](https://github.com/nexscope-ai/eCommerce-Skills) | 861 | 电商研究/营销自动化 Agent Skills。 | MIT | 1+ | 仅索引 |
| [ZhangHanDong/makepad-skills](https://github.com/ZhangHanDong/makepad-skills) | 747 | Makepad/Robius/MolyKit 应用开发 Skills。 | MIT | 1+ | 仅索引 |
| [learnwithu/mingli-master](https://github.com/learnwithu/mingli-master) | 713 | 紫微斗数命盘解读与可视化 HTML Skill。 | MIT | 1+ | 仅索引 |
| [rshankras/claude-code-apple-skills](https://github.com/rshankras/claude-code-apple-skills) | 700 | Apple 平台（iOS/macOS）开发 Claude Skills。 | MIT | 1+ | 仅索引 |
| [evanca/flutter-ai-rules](https://github.com/evanca/flutter-ai-rules) | 633 | Flutter AI Skills/Rules（多 Agent）。 | MIT | 1+ | 仅索引 |
| [memvid/claude-brain](https://github.com/memvid/claude-brain) | 575 | Memvid 官方 Claude Code 记忆插件 Skills。 | MIT | 1+ | 仅索引 |
| [axtonliu/smart-illustrator](https://github.com/axtonliu/smart-illustrator) | 553 | 文章智能配图与位置检测 Skill。 | MIT | 1+ | 仅索引 |
| [24kchengYe/human-skill-tree](https://github.com/24kchengYe/human-skill-tree) | 545 | 终身学习技能树（30+ human skills）Agent Skills。 | MIT | 30+ | 仅索引 |
| [michalparkola/tapestry-skills-for-claude-code](https://github.com/michalparkola/tapestry-skills-for-claude-code) | 538 | 下载文章/PDF/YouTube 等资料的 Tapestry Skills。 | MIT | 1+ | 仅索引 |
| [joeseesun/qiaomu-design](https://github.com/joeseesun/qiaomu-design) | 532 | 乔木设计：反 AI 味设计与风格系统 Skill。 | MIT | 1+ | 仅索引 |
| [ancoleman/ai-design-components](https://github.com/ancoleman/ai-design-components) | 518 | AI 辅助 UI/UX 与后端组件设计 Skills。 | MIT | 1+ | 仅索引 |
| [zenstory-ai/video-recap-skills](https://github.com/zenstory-ai/video-recap-skills) | 495 | 视频剪辑成解说回顾的 Claude Skills。 | MIT | 1+ | 仅索引 |
| [Ryze-AI-Adgent/open-seo-mcp-skills](https://github.com/Ryze-AI-Adgent/open-seo-mcp-skills) | 476 | 开源 SEO/GEO Claude Skills（含关键词/排名）。 | MIT | 1+ | 仅索引 |
| [geekjourneyx/claude-design-card](https://github.com/geekjourneyx/claude-design-card) | 466 | 14 种版式设计卡片生成 Skill。 | MIT | 1+ | 仅索引 |
| [YurunChen/repo-docs-skills](https://github.com/YurunChen/repo-docs-skills) | 460 | 为编码 Agent 维护活文档/进度日志的 Skills。 | Other | 1+ | 仅索引 |
| [ViryaZheng/recomby-geo](https://github.com/ViryaZheng/recomby-geo) | 453 | GEO 领域 AI 员工开源 Skills 方案。 | MIT | 1+ | 仅索引 |
| [jabrena/plinth](https://github.com/jabrena/plinth) | 435 | 现代 Java 企业工程 AI 原生工具包 Skills。 | Other | 1+ | 仅索引 |
| [geekjourneyx/hyperframes-motion-director](https://github.com/geekjourneyx/hyperframes-motion-director) | 433 | 中文优先 HyperFrames 动态视频 Skill。 | MIT | 1+ | 仅索引 |
| [boshu2/agentops](https://github.com/boshu2/agentops) | 433 | Agent 工程运维层便携 Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [evolsb/claude-legal-skill](https://github.com/evolsb/claude-legal-skill) | 431 | 合同审查/CUAD 风险检测法律 Skill。 | MIT | 1+ | 仅索引 |
| [gcpdev/llm-council-skill](https://github.com/gcpdev/llm-council-skill) | 430 | 多 LLM 理事会头脑风暴 Skill。 | Other | 1+ | 仅索引 |
| [appautomaton/latex-arxiv-SKILL](https://github.com/appautomaton/latex-arxiv-SKILL) | 423 | 面向 arXiv 就绪论文的 LaTeX/科研 Skill。 | MIT | 1+ | 仅索引 |
| [seo-skills/seo-audit-skill](https://github.com/seo-skills/seo-audit-skill) | 415 | 332 条规则的综合 SEO 审计 CLI Skill。 | MIT | 1+ | 仅索引 |
| [waynesutton/convexskills](https://github.com/waynesutton/convexskills) | 404 | Convex 后端开发 Agent Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [leopard627/fire-your-seo-agency](https://github.com/leopard627/fire-your-seo-agency) | 394 | 可替代 SEO 代理的 Agent Skills。 | MIT | 1+ | 仅索引 |
| [LukasNiessen/kubernetes-skill](https://github.com/LukasNiessen/kubernetes-skill) | 392 | Kubernetes 运维 Agent Skill。 | MIT | 1+ | 仅索引 |
| [jamditis/claude-skills-journalism](https://github.com/jamditis/claude-skills-journalism) | 386 | 新闻采写 Claude Skills。 | MIT | 1+ | 仅索引 |
| [fcakyon/phd-skills](https://github.com/fcakyon/phd-skills) | 385 | 博士研究工作流 Skills。 | MIT | 1+ | 仅索引 |
| [yanliudesign/offer-toolkit-skill](https://github.com/yanliudesign/offer-toolkit-skill) | 385 | 求职 Offer 工具箱 Skill。 | MIT | 1+ | 仅索引 |
| [dogwood-policy/dogwood](https://github.com/dogwood-policy/dogwood) | 383 | 政策/合规相关 Dogwood Claude 插件。 | Apache-2.0 | 1+ | 仅索引 |
| [testdino-hq/playwright-skill](https://github.com/testdino-hq/playwright-skill) | 359 | Playwright 测试 Agent Skill。 | MIT | 1+ | 仅索引 |
| [staskh/trading_skills](https://github.com/staskh/trading_skills) | 355 | 交易/量化相关 Agent Skills。 | MIT | 1+ | 仅索引 |
| [zhoushoujianwork/easyeda-agent](https://github.com/zhoushoujianwork/easyeda-agent) | 353 | EasyEDA 电路设计 Agent Skills。 | MIT | 1+ | 仅索引 |
| [leeguooooo/chatgpt-imagegen](https://github.com/leeguooooo/chatgpt-imagegen) | 343 | ChatGPT 图像生成相关 Skills。 | MIT | 1+ | 仅索引 |
| [athola/claude-night-market](https://github.com/athola/claude-night-market) | 335 | Claude 夜市 Skills 市场合集。 | MIT | 1+ | 仅索引 |
| [joeseesun/qiaomu-cut-skill](https://github.com/joeseesun/qiaomu-cut-skill) | 330 | 乔木剪辑/视频剪 Skill。 | MIT | 1+ | 仅索引 |
| [cosai-oasis/project-codeguard](https://github.com/cosai-oasis/project-codeguard) | 329 | 安全 AI 编码 Project CodeGuard 插件。 | Other | 1+ | 仅索引 |
| [AThevon/genjutsu](https://github.com/AThevon/genjutsu) | 325 | Genjutsu Agent Skills 插件包。 | MIT | 1+ | 仅索引 |
| [codeswithroh/tastemaker](https://github.com/codeswithroh/tastemaker) | 322 | 品味/设计品味 Agent Skills。 | MIT | 1+ | 仅索引 |
| [tachikomared/character-animation-creator-skill](https://github.com/tachikomared/character-animation-creator-skill) | 317 | 角色动画创建 Skill。 | MIT | 1+ | 仅索引 |
| [LukasNiessen/terrashark](https://github.com/LukasNiessen/terrashark) | 316 | Terraform/IaC Shark Skills（Claude/Codex）。 | MIT | 1+ | 仅索引 |
| [datadrivenconstruction/DDC_Skills_for_AI_Agents_in_Construction](https://github.com/datadrivenconstruction/DDC_Skills_for_AI_Agents_in_Construction) | 303 | 建筑业 AI Agent Skills。 | MIT | 1+ | 仅索引 |
| [bevibing/socrates-skill](https://github.com/bevibing/socrates-skill) | 300 | 苏格拉底式提问/思辨 Skill。 | MIT | 1+ | 仅索引 |
| [BeamusWayne/simp-skill](https://github.com/BeamusWayne/simp-skill) | 300 | Simp 简化工作流 Skill。 | MIT | 1+ | 仅索引 |
| [sv-number/skills](https://github.com/sv-number/skills) | 296 | 可安装 Agent Skills 合集。 | MIT | 1+ | 仅索引 |
| [AaravKashyap12/safe-project-approach](https://github.com/AaravKashyap12/safe-project-approach) | 293 | 可移植的项目规划 Skill（Codex/Claude）。 | MIT | 1+ | 仅索引 |
| [smixs/visual-skills](https://github.com/smixs/visual-skills) | 292 | 视觉设计 Agent Skills。 | MIT | 1+ | 仅索引 |
| [coldteadotai/pr-lens](https://github.com/coldteadotai/pr-lens) | 290 | PR 评审视角 Skill。 | MIT | 1+ | 仅索引 |
| [Rimagination/good-question](https://github.com/Rimagination/good-question) | 289 | 高质量提问 Skill。 | MIT | 1+ | 仅索引 |
| [likaku/Mck-ppt-design-skill](https://github.com/likaku/Mck-ppt-design-skill) | 268 | McKinsey 风格 PPT 设计 Skill。 | Other | 1+ | 仅索引 |
| [membranedev/application-skills](https://github.com/membranedev/application-skills) | 266 | 应用开发 Skills（含 ClawHub）。 | MIT | 1+ | 仅索引 |
| [Bomx/super-video-maker-skill](https://github.com/Bomx/super-video-maker-skill) | 260 | 超级视频制作 Skill。 | Other | 1+ | 仅索引 |
| [Yeachan-Heo/My-Jogyo](https://github.com/Yeachan-Heo/My-Jogyo) | 244 | 科研目标→可复现 Jupyter 的科学研究插件。 | MIT | 1+ | 仅索引 |
| [jiabaobei/skills-constitution](https://github.com/jiabaobei/skills-constitution) | 222 | Skills 宪章/规范合集。 | MIT | 1+ | 仅索引 |
| [OrangeViolin/content-pipeline](https://github.com/OrangeViolin/content-pipeline) | 217 | 内容流水线 Skills。 | MIT | 1+ | 仅索引 |
| [kharmanskyi/open-steps](https://github.com/kharmanskyi/open-steps) | 216 | 开放步骤/流程 Skills。 | MIT | 1+ | 仅索引 |
| [luoling8192/technical-writing](https://github.com/luoling8192/technical-writing) | 212 | 技术写作 Agent Skills。 | MIT | 1+ | 仅索引 |
| [Wholiver/swiftui-design-skill](https://github.com/Wholiver/swiftui-design-skill) | 184 | SwiftUI 设计 Skill。 | MIT | 1+ | 仅索引 |
| [alexgreensh/repo-forensics](https://github.com/alexgreensh/repo-forensics) | 169 | 仓库取证/分析 Skills。 | MIT | 1+ | 仅索引 |
| [dbwls99706/ros2-engineering-skills](https://github.com/dbwls99706/ros2-engineering-skills) | 162 | ROS2 工程 Skills。 | Apache-2.0 | 1+ | 仅索引 |
| [csthink/dashmotion](https://github.com/csthink/dashmotion) | 160 | DashMotion 动效 Skills。 | MIT | 1+ | 仅索引 |
| [dososo/blcaptain-style-skill](https://github.com/dososo/blcaptain-style-skill) | 154 | BL Captain 风格写作 Skill。 | Other | 1+ | 仅索引 |
| [oil-oil/vibe-hub-skill](https://github.com/oil-oil/vibe-hub-skill) | 154 | Vibe Hub 设计/氛围 Skill。 | MIT | 1+ | 仅索引 |
| [jdforsythe/forge](https://github.com/jdforsythe/forge) | 151 | 科学组队：Mission/Agent/Skill Creator 套件。 | MIT | 1+ | 仅索引 |
| [RollingGo-AI/rollinggo-hotel-skill-cn](https://github.com/RollingGo-AI/rollinggo-hotel-skill-cn) | 149 | 酒店运营中文 RollingGo Skills。 | MIT | 1+ | 仅索引 |
| [mujingquan835/dashiai-ppt-skill](https://github.com/mujingquan835/dashiai-ppt-skill) | 146 | 大石 AI PPT 生成 Skill。 | MIT | 1+ | 仅索引 |
| [op7418/guizang-sports-skill](https://github.com/op7418/guizang-sports-skill) | 137 | 归藏运动/体育主题 Skill。 | GPL-3.0 | 1+ | 仅索引 |
| [cognyai/claude-code-marketing-skills](https://github.com/cognyai/claude-code-marketing-skills) | 96 | Cogny 营销 Claude Skills。 | MIT | 1+ | 仅索引 |
| [Xquik-dev/tweetclaw](https://github.com/Xquik-dev/tweetclaw) | 91 | X/Twitter 相关 OpenClaw Skills。 | MIT | 1+ | 仅索引 |
| [wakatime/claude-code-wakatime](https://github.com/wakatime/claude-code-wakatime) | 91 | WakaTime Claude Code 用时追踪插件。 | Other | 1+ | 仅索引 |
| [eduardo-sl/go-agent-skills](https://github.com/eduardo-sl/go-agent-skills) | 71 | Go 语言工程 Agent Skills。 | MIT | 1+ | 仅索引 |
| [salespeak-ai/buyer-eval-skill](https://github.com/salespeak-ai/buyer-eval-skill) | 67 | 买方评估 Salespeak Skill。 | MIT | 1+ | 仅索引 |
| [typefully/agent-skills](https://github.com/typefully/agent-skills) | 57 | Typefully 官方写作/社交 Agent Skills。 | MIT | 1+ | 仅索引 |
| [scdenney/open-science-skills](https://github.com/scdenney/open-science-skills) | 54 | 社会科学开放科学方法 Agent Skills。 | MIT | 1+ | 仅索引 |
| [hanhuark/mechanical-engineering-research-skill](https://github.com/hanhuark/mechanical-engineering-research-skill) | 16 | 机械工程研究 Skills。 | MIT | 1+ | 仅索引 |
| [ariaxhan/kernel-claude](https://github.com/ariaxhan/kernel-claude) | 12 | Kernel Claude 插件 Skills。 | MIT | 1+ | 仅索引 |
| [brandondees/code-quality-atlas](https://github.com/brandondees/code-quality-atlas) | 9 | 代码质量地图 Skills。 | MIT | 1+ | 仅索引 |
| [bcanfield/agentic-tech-debt](https://github.com/bcanfield/agentic-tech-debt) | 8 | 技术债治理 Agent Skills。 | MIT | 1+ | 仅索引 |
| [lnvestor/twitr-skills](https://github.com/lnvestor/twitr-skills) | 8 | Twitter/X 相关 Skills。 | MIT | 1+ | 仅索引 |
| [tartinerlabs/skills](https://github.com/tartinerlabs/skills) | 7 | 可安装 Agent Skills 包。 | MIT | 1+ | 仅索引 |
| [lltx/skills](https://github.com/lltx/skills) | 6 | 可安装 Agent Skills（npx）。 | MIT | 1+ | 仅索引 |
| [Maksim-Burtsev/simple-man](https://github.com/Maksim-Burtsev/simple-man) | 5 | 可安装简易 Agent Skills。 | MIT | 1+ | 仅索引 |
| [axtonliu/axton-obsidian-visual-skills](https://github.com/axtonliu/axton-obsidian-visual-skills) | 3,568 | Axton Obsidian 可视化 Skills。 | MIT | 多 | 仅索引 |
| [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) | 3,329 | 界面细节打磨 Skill：动效/字体/触控热区/光学对齐等。 | Other | 1 | 仅索引 |
| [YouMind-OpenLab/nano-banana-pro-prompts-recommend-skill](https://github.com/YouMind-OpenLab/nano-banana-pro-prompts-recommend-skill) | 1,848 | Nano Banana Pro 提示词推荐 Skill。 | MIT | 1 | 仅索引 |
| [feichanggege/ecommerce-visual-copywriting-skill](https://github.com/feichanggege/ecommerce-visual-copywriting-skill) | 700 | 电商视觉文案设计 Skill：主图/详情分镜/图内文案与生图 Prompt。 | MIT | 1+ | 仅索引 |
| [analogjs/angular-skills](https://github.com/analogjs/angular-skills) | 591 | Analog/Angular Agent Skills。 | Other | 多 | 仅索引 |
| [badseal/ssh-skill](https://github.com/badseal/ssh-skill) | 500 | 跨平台 SSH 工作流 Skill（Codex/Claude Code）。 | Other | 1+ | 仅索引 |
| [cookjohn/gs-skills](https://github.com/cookjohn/gs-skills) | 500 | Google Scholar 检索/引用/全文/Zotero 导出 Claude Skills。 | Other | 多 | 仅索引 |
| [skydoves/compose-performance-skills](https://github.com/skydoves/compose-performance-skills) | 496 | Jetpack Compose 性能优化 Agent Skills 合集。 | Other | 多 | 仅索引 |
| [agentenatalie/get-job.skill](https://github.com/agentenatalie/get-job.skill) | 494 | 求职实习 Skill：改简历、抠面经、面试准备。 | Other | 1+ | 仅索引 |
| [alonw0/web-asset-generator](https://github.com/alonw0/web-asset-generator) | 492 | 网站图标/App Icon/社媒图生成 Claude Skill。 | Other | 1+ | 仅索引 |
| [archlizheng/frontend-slides-editable](https://github.com/archlizheng/frontend-slides-editable) | 487 | 可编辑 HTML 演示文稿 Skill（拖拽缩放/导出）。 | Other | 1+ | 仅索引 |
| [leonardomso/rust-skills](https://github.com/leonardomso/rust-skills) | 486 | Rust 惯用写法 Agent Skills（多分类规则）。 | Other | 多 | 仅索引 |
| [aj-geddes/claude-code-bmad-skills](https://github.com/aj-geddes/claude-code-bmad-skills) | 485 | BMAD Method 的 Claude Code Skills。 | Other | 多 | 仅索引 |
| [Boom5426/Nature-Paper-Skills](https://github.com/Boom5426/Nature-Paper-Skills) | 481 | Nature 风格论文撰写/修订/审计 Agent Skills。 | Other | 多 | 仅索引 |
| [bentossell/visualise](https://github.com/bentossell/visualise) | 480 | 对话内联交互可视化（SVG/HTML/图表）Agent Skill。 | Other | 1 | 仅索引 |
| [blacktwist/social-media-skills](https://github.com/blacktwist/social-media-skills) | 480 | 社交媒体内容策略/创作/分析 Agent Skills。 | Other | 多 | 仅索引 |
| [yzddmr6/repo-analyzer](https://github.com/yzddmr6/repo-analyzer) | 479 | 开源项目深度架构分析 Agent Skill。 | Other | 1+ | 仅索引 |
| [claesbackman/AI-research-feedback](https://github.com/claesbackman/AI-research-feedback) | 477 | 学术研究评审 Claude Code Skills 合集。 | Other | 多 | 仅索引 |
| [managedcode/dotnet-skills](https://github.com/managedcode/dotnet-skills) | 477 | .NET 可安装技能目录与 CLI（Codex/Claude/Copilot/Gemini）。 | Other | 多 | 仅索引 |
| [himself65/trade-skills](https://github.com/himself65/trade-skills) | 449 | AI 交易相关 Skills 合集。 | Other | 多 | 仅索引 |
| [AvdLee/Swift-Testing-Agent-Skill](https://github.com/AvdLee/Swift-Testing-Agent-Skill) | 446 | Swift Testing 专注 Agent Skill（迁移/架构/现代测试）。 | Other | 1+ | 仅索引 |
| [waditu-tushare/skills](https://github.com/waditu-tushare/skills) | 445 | Tushare 金融数据 Skills 包。 | Other | 多 | 仅索引 |
| [bahayonghang/academic-writing-skills](https://github.com/bahayonghang/academic-writing-skills) | 441 | 学术写作后处理 Skills（格式/语法/去AI味/审稿）。 | Other | 5 | 仅索引 |
| [wyh0626/resume-optimizer](https://github.com/wyh0626/resume-optimizer) | 436 | 面向求职者的简历优化 Skill。 | Other | 1 | 仅索引 |
| [secondsky/sap-skills](https://github.com/secondsky/sap-skills) | 434 | SAP 开发生产级 Skills（BTP/CAP/Fiori/ABAP 等）。 | Other | 多 | 仅索引 |
| [palkan/layered-rails-skills](https://github.com/palkan/layered-rails-skills) | 428 | Layered Rails 架构实践 Agent Skills。 | Other | 多 | 仅索引 |
| [twostraws/Swift-Testing-Agent-Skill](https://github.com/twostraws/Swift-Testing-Agent-Skill) | 423 | Swift Testing Agent Skill（Claude/Codex 等）。 | Other | 1+ | 仅索引 |
| [BrianRWagner/ai-marketing-claude-code-skills](https://github.com/BrianRWagner/ai-marketing-claude-code-skills) | 408 | AI 营销 Claude Code Skills。 | Other | 多 | 仅索引 |
| [cclank/lanshu-awesome-ai-video-kit](https://github.com/cclank/lanshu-awesome-ai-video-kit) | 387 | 揽书 AI 视频工具包 Skills。 | Other | 多 | 仅索引 |
| [tizzy916/humanities-writing-companion](https://github.com/tizzy916/humanities-writing-companion) | 379 | 人文学科写作陪伴 Skills。 | Other | 多 | 仅索引 |
| [Kiterlin/anti-defensive-writing](https://github.com/Kiterlin/anti-defensive-writing) | 372 | 去防御性写作 Skill。 | Other | 1+ | 仅索引 |
| [zexuanw958-svg/travel-plan-viz](https://github.com/zexuanw958-svg/travel-plan-viz) | 362 | 旅行计划可视化 Skill。 | Other | 1+ | 仅索引 |
| [AgriciDaniel/claude-youtube](https://github.com/AgriciDaniel/claude-youtube) | 350 | YouTube 相关 Claude Skills。 | Other | 1+ | 仅索引 |
| [AlpacaLabsLLC/skills-for-architects](https://github.com/AlpacaLabsLLC/skills-for-architects) | 342 | 建筑/地产/职场策略 Claude Skills。 | MIT | 1+ | 仅索引 |
| [Mr-funny/hbg-classical-poem-silk-video](https://github.com/Mr-funny/hbg-classical-poem-silk-video) | 324 | 古典诗词丝绸视频生成 Skill。 | Other | 1+ | 仅索引 |
| [jzOcb/writing-style-skill](https://github.com/jzOcb/writing-style-skill) | 264 | 写作风格 Skill 模板，内置从修改中自动学习规则。 | Other | 1+ | 仅索引 |
| [WenyuChiou/ai-research-skills](https://github.com/WenyuChiou/ai-research-skills) | 239 | 科研工作流通用 SKILL.md 目录（文献/设计/写作等）。 | Other | 多 | 仅索引 |
| [jakubkrehel/oklch-skill](https://github.com/jakubkrehel/oklch-skill) | 235 | OKLCH 颜色工作流 Agent Skill。 | Other | 1 | 仅索引 |
| [Kyure-A/agent-skills-nix](https://github.com/Kyure-A/agent-skills-nix) | 225 | Nix 相关 Agent Skills。 | Other | 多 | 仅索引 |
| [AgriciDaniel/claude-shorts](https://github.com/AgriciDaniel/claude-shorts) | 204 | 短视频 Shorts Claude Skills。 | Other | 1+ | 仅索引 |
| [ai4s-research/ai4s-skills](https://github.com/ai4s-research/ai4s-skills) | 204 | AI for Science 科研 Agent Skills。 | MIT | 多 | 仅索引 |
| [ahmedasmar/devops-claude-skills](https://github.com/ahmedasmar/devops-claude-skills) | 199 | DevOps Claude Skills。 | Other | 多 | 仅索引 |
| [anildash/better-documents](https://github.com/anildash/better-documents) | 162 | 商业文档沟通最佳实践 Claude Skill。 | Other | 1 | 仅索引 |
| [adaptyvbio/protein-design-skills](https://github.com/adaptyvbio/protein-design-skills) | 158 | 蛋白质设计 Agent Skills。 | Other | 多 | 仅索引 |
| [O0000-code/paper-search-pro](https://github.com/O0000-code/paper-search-pro) | 155 | 学术文献发现 Skill（多源检索与报告）。 | Other | 1+ | 仅索引 |
| [Yusuke710/manim-skill](https://github.com/Yusuke710/manim-skill) | 150 | Manim 动画制作 Agent Skill。 | Other | 1 | 仅索引 |
| [AIwithhassan/lets-scroll](https://github.com/AIwithhassan/lets-scroll) | 119 | 滚动驱动飞越落地页 Agent Skill。 | Other | 1+ | 仅索引 |
| [pillar-labs/sail-skill](https://github.com/pillar-labs/sail-skill) | 118 | SAIL AI 安全生命周期评估 Skill。 | Other | 1+ | 仅索引 |
| [DogInfantry/claude-skill-management-consultant-B1](https://github.com/DogInfantry/claude-skill-management-consultant-B1) | 110 | MBB 级管理咨询 Claude Skill/插件。 | Apache-2.0 | 3 | 仅索引 |
| [beiyuii/personal-api-skill](https://github.com/beiyuii/personal-api-skill) | 73 | 个人 API Skill。 | MIT | 1+ | 仅索引 |
| [fivetaku/claude-office-skills](https://github.com/fivetaku/claude-office-skills) | 70 | Excel/PowerPoint 办公建模 Claude Skills。 | Other | 多 | 仅索引 |
| [Yuki001/game-dev-skills](https://github.com/Yuki001/game-dev-skills) | 67 | 游戏开发 Agent Skills。 | Other | 多 | 仅索引 |
| [erfnzdeh/arvancloud-agent-skill](https://github.com/erfnzdeh/arvancloud-agent-skill) | 59 | ArvanCloud API Agent Skill（非官方）。 | Other | 1+ | 仅索引 |
| [mrSutivu/Unreal-Engine-5-C-Expert-Skills](https://github.com/mrSutivu/Unreal-Engine-5-C-Expert-Skills) | 59 | UE5 C++ 专家级 Agent Skills（大量 SKILL.md）。 | Other | 多 | 仅索引 |
| [Desko77/claude-code-skills-1c](https://github.com/Desko77/claude-code-skills-1c) | 55 | 1C 平台 Claude Code Skills。 | Other | 多 | 仅索引 |
| [ningzimu/codex-gpt-image](https://github.com/ningzimu/codex-gpt-image) | 55 | Codex OAuth 驱动 gpt-image 的 OpenClaw/Claude Skill。 | Other | 1 | 仅索引 |
| [ElmatadorZ/MoneyAtlas-ClaudeSkill-Agent](https://github.com/ElmatadorZ/MoneyAtlas-ClaudeSkill-Agent) | 54 | 金融宏观/地缘 Money Atlas Claude Skill。 | Other | 1+ | 仅索引 |
| [jeremylongshore/excel-analyst-pro-skill-md](https://github.com/jeremylongshore/excel-analyst-pro-skill-md) | 54 | 专业财务建模 Excel Claude Skill。 | Other | 1+ | 仅索引 |
| [tikoci/routeros-skills](https://github.com/tikoci/routeros-skills) | 53 | MikroTik RouterOS v7 Agent Skills。 | Other | 1+ | 仅索引 |
| [AVGVSTVS96/better-github-skill](https://github.com/AVGVSTVS96/better-github-skill) | 49 | 精简 GitHub 工作流 Agent Skill（少工具调用）。 | Other | 6 | 仅索引 |
| [LeadMagic/gtm-skills](https://github.com/LeadMagic/gtm-skills) | 48 | GTM 获客/增长 Agent Skills。 | Other | 多 | 仅索引 |
| [XieWxx/maxhub-api-skills](https://github.com/XieWxx/maxhub-api-skills) | 45 | MAXHUB API Skills。 | MIT | 多 | 仅索引 |
| [DeliciousBuding/xiaohongshu-skill](https://github.com/DeliciousBuding/xiaohongshu-skill) | 44 | 小红书浏览器工具箱 Skill（搜索/发布/互动等）。 | Other | 1+ | 仅索引 |
| [haidrrrry/compose-kotlin-agent-skills](https://github.com/haidrrrry/compose-kotlin-agent-skills) | 43 | Jetpack Compose/Kotlin Agent Skills。 | Other | 多 | 仅索引 |
| [kunhai1994/xhs-research](https://github.com/kunhai1994/xhs-research) | 42 | 小红书调研 Skill。 | Other | 1+ | 仅索引 |
| [EodHistoricalData/eodhd-claude-skills](https://github.com/EodHistoricalData/eodhd-claude-skills) | 38 | EODHD 金融数据 Claude Skills。 | Other | 1+ | 仅索引 |
| [skywain/trip-planner-skill](https://github.com/skywain/trip-planner-skill) | 37 | 可核验可预订行程规划 Agent Skill。 | Other | 1+ | 仅索引 |
| [matteotitta/genesys-skills](https://github.com/matteotitta/genesys-skills) | 36 | B2B SaaS GTM Claude Skills（内容/获客/SEO 等）。 | Other | 多 | 仅索引 |
| [AugustusW/audio-tldr-skill](https://github.com/AugustusW/audio-tldr-skill) | 35 | 音视频/播客本地转写摘要 Claude Skill。 | MIT | 4 | 仅索引 |
| [malkreide/socratic-method-skill](https://github.com/malkreide/socratic-method-skill) | 34 | 苏格拉底教学法 Claude Skill。 | Other | 1 | 仅索引 |
| [ilindaniel/impeccable-lite](https://github.com/ilindaniel/impeccable-lite) | 33 | 轻量 UI 品味约束 Skill（单 SKILL.md）。 | Other | 1 | 仅索引 |
| [tcsenpai/specification-website-skill](https://github.com/tcsenpai/specification-website-skill) | 27 | specification.website 离线打包 Agent Skill。 | Other | 1 | 仅索引 |
| [CrowdStrike/foundry-skills](https://github.com/CrowdStrike/foundry-skills) | 25 | CrowdStrike Falcon Foundry 应用构建 Skills。 | Other | 3 | 仅索引 |
| [Leehyunbin0131/claude-ros2-skills](https://github.com/Leehyunbin0131/claude-ros2-skills) | 19 | ROS2 Claude Skills。 | Other | 多 | 仅索引 |
| [novoads/agent-skills](https://github.com/novoads/agent-skills) | 14 | 营销向 AI 视频/图片广告 Skills。 | Other | 多 | 仅索引 |
| [EmblemCompany/Agent-skills](https://github.com/EmblemCompany/Agent-skills) | 12 | EmblemAI 官方 Agent Skills（多链加密工具）。 | MIT | 2 | 仅索引 |
| [Alexeyisme/hermes-spotify-skill](https://github.com/Alexeyisme/hermes-spotify-skill) | 11 | Hermes Agent 的 Spotify 播放控制 Skill。 | Other | 6 | 仅索引 |
| [AlterLab-IEU/AlterLab-FC-Skills](https://github.com/AlterLab-IEU/AlterLab-FC-Skills) | 11 | 传播学学生向 72 个 Claude Skills（公关/广告等）。 | MIT | 12 | 仅索引 |
| [0xArchiveIO/0xarchive-skill](https://github.com/0xArchiveIO/0xarchive-skill) | 10 | 0xArchive 市场数据 Skill（Hyperliquid/Lighter）。 | Other | 13 | 仅索引 |
| [Aznatkoiny/zAI-Skills](https://github.com/Aznatkoiny/zAI-Skills) | 9 | Claude Code 插件市场：AI/ML 与咨询框架 Skills。 | Other | 多 | 仅索引 |
| [CoinLobster/agent-skills](https://github.com/CoinLobster/agent-skills) | 9 | 加密货币鲸鱼流向解读 Agent Skills（无需 API Key）。 | MIT | 4 | 仅索引 |
| [BuildShipGrowRepeat/nextjs-sanity-blog-skill](https://github.com/BuildShipGrowRepeat/nextjs-sanity-blog-skill) | 8 | Next.js + Sanity SEO 博客 Claude Skill。 | Other | 1+ | 仅索引 |
| [Deibler/universal-design-principles](https://github.com/Deibler/universal-design-principles) | 8 | 42 条通用设计原则的可组合 Claude 插件/Skills。 | Other | 多 | 仅索引 |
| [kali20gakki/mindstudio-skills](https://github.com/kali20gakki/mindstudio-skills) | 8 | MindStudio Skills 包。 | Other | 多 | 仅索引 |
| [Amey-Thakur/AI-SKILLS](https://github.com/Amey-Thakur/AI-SKILLS) | 7 | 即插即用 AI 编程助手 Skills/提示词。 | MIT | 多 | 仅索引 |
| [AndreaBozzo/Ceres-Claude-Skill](https://github.com/AndreaBozzo/Ceres-Claude-Skill) | 7 | Ceres 相关 Claude Code Skill。 | Apache-2.0 | 2 | 仅索引 |
| [Benknightdark/neo-skills](https://github.com/Benknightdark/neo-skills) | 7 | 可安装 AI Agent 技能模组（语言/框架/DevOps/治理等）。 | Other | 2 | 仅索引 |
| [DotDebian/asd-ste100-skill](https://github.com/DotDebian/asd-ste100-skill) | 7 | 软件文档简化技术英语（STE）Claude Skill。 | MIT | 3 | 仅索引 |
| [IcyCreamDAS/shidi-skill](https://github.com/IcyCreamDAS/shidi-skill) | 7 | 师弟风格写作 Skill。 | Other | 1 | 仅索引 |
| [JohnWayneeee/casely-qa-skill](https://github.com/JohnWayneeee/casely-qa-skill) | 7 | Casely 问答/质检 Skill。 | Other | 1 | 仅索引 |
| [Aarvion-AI/stackwise-skills](https://github.com/Aarvion-AI/stackwise-skills) | 5 | Stackwise 技术栈 Agent Skills。 | MIT | 9 | 仅索引 |
| [Cristhianzl/claude-skills-czl](https://github.com/Cristhianzl/claude-skills-czl) | 5 | 实战 Claude Code 配置与 Skills 基线。 | MIT | 多 | 仅索引 |
| [HiMyNameIsDavidKim/prompt-triwizard-skill](https://github.com/HiMyNameIsDavidKim/prompt-triwizard-skill) | 5 | Prompt Triwizard 提示工程 Skill。 | Other | 1 | 仅索引 |
| [HideinbushZY/boss-zhipin-skill](https://github.com/HideinbushZY/boss-zhipin-skill) | 5 | BOSS 直聘求职相关 Skill。 | Other | 1 | 仅索引 |
| [Jason-chen-coder/dev-skills](https://github.com/Jason-chen-coder/dev-skills) | 5 | 开发向 Agent Skills。 | Other | 多 | 仅索引 |
| [KKenny0/card-skill](https://github.com/KKenny0/card-skill) | 5 | 卡片设计/生成 Skill。 | Other | 1 | 仅索引 |
| [Aident-AI/aident-skill](https://github.com/Aident-AI/aident-skill) | 4 | Aident Loadout：连接千级应用的 Agent Skill。 | MIT | 2 | 仅索引 |
| [Basic-XYZ/baku-skills](https://github.com/Basic-XYZ/baku-skills) | 2 | 我自己在真实工作流里跑过、觉得值得留下的 Agent Skills。 | MIT | 37 | 仅索引 |
| [ASOScan/aso-skills](https://github.com/ASOScan/aso-skills) | 1 | ASO（应用商店优化）Agent Skills。 | MIT | 20 | 仅索引 |
| [Imbad0202/academic-research-skills-codex](https://github.com/Imbad0202/academic-research-skills-codex) | 10,028 | Codex 原生学术研究 Skills 套件（人机协同科研工作流）。 | Other | 多 | 仅索引 |
| [op7418/NanoBanana-PPT-Skills](https://github.com/op7418/NanoBanana-PPT-Skills) | 3,235 | NanoBanana PPT Skills：AI 生成高质量 PPT 图/视频。 | MIT | 多 | 仅索引 |
| [op7418/Youtube-clipper-skill](https://github.com/op7418/Youtube-clipper-skill) | 2,176 | YouTube 剪辑/切片相关 Agent Skill。 | MIT | 多 | 仅索引 |
| [truongduy2611/app-store-preflight-skills](https://github.com/truongduy2611/app-store-preflight-skills) | 1,353 | App Store 上架预检 Agent Skills（拒审风险扫描）。 | Other | 多 | 仅索引 |
| [wshuyi/x-article-publisher-skill](https://github.com/wshuyi/x-article-publisher-skill) | 863 | 将 Markdown 文章发布到 X（Twitter）的 Claude Skill。 | Other | 多 | 仅索引 |
| [aiworkskills/wechat-article-skills](https://github.com/aiworkskills/wechat-article-skills) | 557 | 微信公众号全流程运营 Skills（选题/写稿/审稿/排版/配图/发布）。 | Apache-2.0 | 多 | 仅索引 |
| [codejunkie99/graph-engineering](https://github.com/codejunkie99/graph-engineering) | 478 | 知识图谱/任务图工程 Skill（9 阶段流水线与教学模式）。 | MIT | 多 | 仅索引 |
| [agiprolabs/claude-trading-skills](https://github.com/agiprolabs/claude-trading-skills) | 342 | 交易/DeFi/量化金融 Agent Skills（68+）。 | MIT | 68 | 仅索引 |
| [ognjengt/founder-skills](https://github.com/ognjengt/founder-skills) | 289 | 面向创始人的 Claude Skills 合集。 | Other | 多 | 仅索引 |
| [CosmoBlk/email-marketing-bible](https://github.com/CosmoBlk/email-marketing-bible) | 286 | 邮件营销 Claude Code Skill（大型资料库）。 | Other | 精选列表 | 仅索引 |
| [angieruiz17/claude-fintech-skills](https://github.com/angieruiz17/claude-fintech-skills) | 144 | 金融科技/交易与经纪基础设施 Claude Skills。 | MIT | 精选列表 | 仅索引 |
| [Hao0321/claude-skill-code-cleanup](https://github.com/Hao0321/claude-skill-code-cleanup) | 73 | 代码/Skill 清理与基准驱动研发 Skills。 | Other | 多 | 仅索引 |
| [robzolkos/skill-rails-upgrade](https://github.com/robzolkos/skill-rails-upgrade) | 54 | Rails 升级相关 Agent Skill。 | Other | 多 | 仅索引 |
| [modem-dev/skills](https://github.com/modem-dev/skills) | 53 | Modem Agent Skills（含可发现内容写作等）。 | MIT | 多 | 仅索引 |
| [moonlight-lupin/agent-skills](https://github.com/moonlight-lupin/agent-skills) | 51 | Hermes Agent Skills（研究/创意/生产力/DevOps）。 | MIT | 多 | 仅索引 |
| [Linked-API/linkedin-skills](https://github.com/Linked-API/linkedin-skills) | 48 | LinkedIn 自动化 Agent Skills（销售/社媒）。 | MIT | 多 | 仅索引 |
| [levineam/lastXdays-skill](https://github.com/levineam/lastXdays-skill) | 46 | 近 X 天主题调研 Claude Skill。 | MIT | 多 | 仅索引 |
| [shinpr/codex-workflows](https://github.com/shinpr/codex-workflows) | 37 | Codex 开发工作流 Skills/编排。 | MIT | 20 | 仅索引 |
| [Natan-Mohart/24-strategy-skills-for-claude](https://github.com/Natan-Mohart/24-strategy-skills-for-claude) | 37 | 24 个战略分析 Claude Skills。 | Other | 24 | 仅索引 |
| [WenyuChiou/agent-collab-skills](https://github.com/WenyuChiou/agent-collab-skills) | 25 | 多智能体协作 Claude Code marketplace Skills。 | Other | 多 | 仅索引 |
| [1102tools-dev/federal-contracting-skills](https://github.com/1102tools-dev/federal-contracting-skills) | 25 | 美国联邦采购/合同 Agent Skills。 | Other | 6 | 仅索引 |
| [marceloeatworld/nixos-ai-skill](https://github.com/marceloeatworld/nixos-ai-skill) | 22 | NixOS/Nix 生态文档驱动 Agent Skill。 | Other | 多 | 仅索引 |
| [KirKruglov/claude-skills-kit](https://github.com/KirKruglov/claude-skills-kit) | 18 | Claude Skills 工具包。 | MIT | 精选列表 | 仅索引 |
| [HetCreep/CoalMine](https://github.com/HetCreep/CoalMine) | 12 | 九项质量金丝雀 Skills + 自动节奏 hooks。 | Apache-2.0 | 6 | 仅索引 |
| [ciberjohn/Hermes-Skills](https://github.com/ciberjohn/Hermes-Skills) | 11 | Hermes Agent Skills（内容/图示/社媒/业务等）。 | Other | 多 | 仅索引 |
| [thatmike1/claude-skills](https://github.com/thatmike1/claude-skills) | 8 | 可复用情境化 Claude Skills。 | Other | 多 | 仅索引 |
| [lcrawfurd/claude-skills](https://github.com/lcrawfurd/claude-skills) | 8 | 学术论文/代码审阅与可复现审计 Skills。 | Other | 7 | 仅索引 |
| [Tygb99/claude-code-session-skills](https://github.com/Tygb99/claude-code-session-skills) | 8 | Claude Code 会话交接/查询/日志还原 Skills。 | MIT | 多 | 仅索引 |
| [Natan-Mohart/24-finance-skills-for-claude](https://github.com/Natan-Mohart/24-finance-skills-for-claude) | 7 | 24 个金融向 Claude Skills。 | MIT | 24 | 仅索引 |
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
| [Neeeophytee/finding-unknowns-skills](https://github.com/Neeeophytee/finding-unknowns-skills) | 322 | Thariq Shihipar 未知项方法论 11 条技能；npx skills add + Claude/Codex 插件。非 Anthropic 官方。 | MIT | 11 | 仅索引 |
| [CloudWave818/ieee-skills](https://github.com/CloudWave818/ieee-skills) | 253 | 非官方 IEEE 论文工作流 10 条 Codex skills（summarize/writing/reviewer/experiment/figure 等）。 | MIT | 10 | 仅索引 |
| [JimLiu/science-skills](https://github.com/JimLiu/science-skills) | 225 | 宝玉 Claude Science 风格科学技能：alphafold/boltz/文献/单细胞/远程计算等。 | README 未单列 SPDX | 科学技能目录 | 仅索引 |
| [crawfordxx/xiaoma-durex-copywriter](https://github.com/crawfordxx/xiaoma-durex-copywriter) | 572 | 杜蕾斯式双层语义文案与海报 Skill。 | MIT | 1 | 仅索引 |
| [Kronop/vibe-aso](https://github.com/Kronop/vibe-aso) | 349 | iOS App Store 优化与多语言 ASO 技能。 | MIT | 1 | 仅索引 |
| [gozen3ji/consulting-pptx-skill](https://github.com/gozen3ji/consulting-pptx-skill) | 239 | 咨询风 PPTX：62 型幻灯片目录与机械校验。 | MIT | 1 | 仅索引 |
| [GaZmagik/iso-24495](https://github.com/GaZmagik/iso-24495) | 171 | ISO 24495 简明语言写作与审计技能/插件。 | MIT | 7 | 仅索引 |
| [tigerless-labs/influencer-discovery](https://github.com/tigerless-labs/influencer-discovery) | 178 | 影响者发现与联系人富化管线技能。 | 其他 | 1 | 仅索引 |
| [tigerless-labs/paper-radar](https://github.com/tigerless-labs/paper-radar) | 169 | 28 家科技公司 arXiv 论文雷达技能。 | MIT | 1 | 仅索引 |
| [phileiny/h3-storyboard-skill](https://github.com/phileiny/h3-storyboard-skill) | 154 | MiniMax H3 分镜与角色表演技能。 | MIT | 1 | 仅索引 |
| [machina-exm/film-studio-skills](https://github.com/machina-exm/film-studio-skills) | 111 | AI 影视制片管线：7 个可安装技能。 | 其他 | 7 | 仅索引 |
| [wanshuiyin/HERO-Anti-OverDefense](https://github.com/wanshuiyin/HERO-Anti-OverDefense) | 417 | HERO 反过度防御：粘贴式编码 Agent 契约。 | 其他 | 1 | 仅索引 |
| [chrichuang218/ai-learning-coach](https://github.com/chrichuang218/ai-learning-coach) | 213 | Codex 项目制 AI 私教学习教练技能。 | 其他 | 1 | 仅索引 |
| [T8mars/minimax-h3-prompt-skill-T8](https://github.com/T8mars/minimax-h3-prompt-skill-T8) | 197 | MiniMax H3/Seedance 2.0 创意 DNA 视频技能。 | 其他 | 多 | 仅索引 |
| [appautomaton/document-SKILLs](https://github.com/appautomaton/document-SKILLs) | 157 | PDF/Excel/Word/PPTX 文档操作 Claude/Codex Skills。 | 其他 | 多 | 仅索引 |
| [SerhiiKorniienko/bullshit-detector](https://github.com/SerhiiKorniienko/bullshit-detector) | 140 | 逐条核验音视频/文章的事实核查 Agent Skills。 | 其他 | 多 | 仅索引 |
| [godot-fun/godot-agent](https://github.com/godot-fun/godot-agent) | 139 | 轻量 Godot 框架 + 出游戏 Agent Skills。 | 其他 | 多 | 仅索引 |
| [Ovid/paad](https://github.com/Ovid/paad) | 110 | PAAD：把工程实践带回 AI 速度的 Claude 插件技能。 | 其他 | 多 | 仅索引 |
| [LiarMTTT/TavernWeave](https://github.com/LiarMTTT/TavernWeave) | 105 | SillyTavern 角色卡工程非商业 Agent Skills。 | 其他 | 多 | 仅索引 |
| [v2space-labs/shader-for-interfaces](https://github.com/v2space-labs/shader-for-interfaces) | 105 | 产品界面 GPU 特效设计/校验 Agent Skill。 | 其他 | 1 | 仅索引 |
| [drpwchen/lecture-to-notes](https://github.com/drpwchen/lecture-to-notes) | 101 | 讲座录音→带时间戳结构化笔记+HTML 查看器。 | 其他 | 1 | 仅索引 |
| [kwhi6693-web/photo-abstract-editorial](https://github.com/kwhi6693-web/photo-abstract-editorial) | 97 | 照片→忠实编辑风抽象艺术作品 Agent Skill。 | 其他 | 1 | 仅索引 |
| [ahacker-1/cre-agent-skills](https://github.com/ahacker-1/cre-agent-skills) | 92 | 商业地产承销/尽调/融资工作流 Agent Skills。 | 其他 | 多 | 仅索引 |
| [wuwangzhang1216/DirectorSKILL](https://github.com/wuwangzhang1216/DirectorSKILL) | 83 | AI 影视分镜/关键帧提示词（十位导演风）。 | 其他 | 1 | 仅索引 |
| [aurorascharff/nextjs-app-architecture-skill](https://github.com/aurorascharff/nextjs-app-architecture-skill) | 82 | Next.js 16+ App Router 构建与审计技能。 | 其他 | 1 | 仅索引 |
| [Ronvaknins/ableton-extensions-skill](https://github.com/Ronvaknins/ableton-extensions-skill) | 80 | Ableton Live 扩展脚手架/打包 Agent Skill。 | 其他 | 1 | 仅索引 |
| [moonlin1213/muted-zine-poster-v01](https://github.com/moonlin1213/muted-zine-poster-v01) | 79 | 低饱和 zine 风纸海报图像生成 Agent Skill。 | 其他 | 1 | 仅索引 |
| [jiankang1991/nsfc-benzi-audit](https://github.com/jiankang1991/nsfc-benzi-audit) | 78 | 国自然申请书初稿诊断 Agent Skill。 | 其他 | 1 | 仅索引 |
| [mcpads/create-retro-game-kr-patch](https://github.com/mcpads/create-retro-game-kr-patch) | 78 | 复古游戏韩语同人补丁全流程 Agent Skill。 | 其他 | 1 | 仅索引 |
| [LeeHueeng/store-screenshots](https://github.com/LeeHueeng/store-screenshots) | 77 | App Store/Play 营销截图自动生成 Agent Skill。 | 其他 | 1 | 仅索引 |
| [nuyoah-ai-works/nuyoah-image-reverse-prompt](https://github.com/nuyoah-ai-works/nuyoah-image-reverse-prompt) | 77 | 南鸢：参考图结构字段与中文提示词反推技能。 | 其他 | 1 | 仅索引 |
| [heyman333/agent-notion-template-docs](https://github.com/heyman333/agent-notion-template-docs) | 76 | 锁定 Notion 文档结构与视觉风格的写作技能。 | 其他 | 1 | 仅索引 |
| [akii-technologies-ltd/akii-seo-ai-search-optimizer](https://github.com/akii-technologies-ltd/akii-seo-ai-search-optimizer) | 75 | 免费 SEO/AEO/GEO Claude 插件：审计与 AI 可见度。 | 其他 | 多 | 仅索引 |
| [gongnyang/deck-factory](https://github.com/gongnyang/deck-factory) | 75 | 一句话意图→暗色编辑风 HTML 演示稿技能。 | 其他 | 1 | 仅索引 |
| [Zsun79/ConferenceWatch](https://github.com/Zsun79/ConferenceWatch) | 75 | 盯 AI 会议截稿日期的 Agent Skill。 | 其他 | 1 | 仅索引 |
| [Timefiles404/lean-mode-skill](https://github.com/Timefiles404/lean-mode-skill) | 74 | 节制工程：何时防御性代码与压缩构建耗时。 | 其他 | 1 | 仅索引 |
| [liangdabiao/weekend-city-trip](https://github.com/liangdabiao/weekend-city-trip) | 73 | 中国城市周末微旅行深度调研 Agent Skill。 | 其他 | 1 | 仅索引 |
| [trussary/vietnamese-language-skill](https://github.com/trussary/vietnamese-language-skill) | 73 | 让 Claude 写出可交付越南语专业文案的技能。 | 其他 | 多 | 仅索引 |
| [JangHyun-bin/korean-report-skills](https://github.com/JangHyun-bin/korean-report-skills) | 72 | 韩语文档表达与设计补强 Agent Skills。 | 其他 | 多 | 仅索引 |
| [JuneYaooo/self-media-compliance-review](https://github.com/JuneYaooo/self-media-compliance-review) | 72 | 自媒体发布前违规风险五级审核技能。 | 其他 | 1 | 仅索引 |
| [madebypan/threads-api-skill](https://github.com/madebypan/threads-api-skill) | 70 | Threads API 发帖/串帖/图片全流程技能。 | 其他 | 1 | 仅索引 |
| [morankor/theorist-toolbox](https://github.com/morankor/theorist-toolbox) | 70 | 经济理论证明/对抗校验 Claude 技能工具箱。 | 其他 | 多 | 仅索引 |
| [ricmmartins/azure-sre-agent-skills](https://github.com/ricmmartins/azure-sre-agent-skills) | 70 | Azure SRE Agent 治理/成本/架构质量技能。 | 其他 | 多 | 仅索引 |
| [jaakla/openmapstack](https://github.com/jaakla/openmapstack) | 68 | 可复现 GIS 分析开源栈 Agent Skill。 | 其他 | 1 | 仅索引 |
| [ZeoxCode/gaokao-advisor-skill](https://github.com/ZeoxCode/gaokao-advisor-skill) | 68 | 站在学生家长一侧的高考志愿决策技能。 | 其他 | 1 | 仅索引 |
| [dripips/plain-prose](https://github.com/dripips/plain-prose) | 67 | 英/俄/德散文去 AI 味写作 Agent Skill。 | 其他 | 1 | 仅索引 |
| [xiaofeng-928/chinese-longnovel-skill](https://github.com/xiaofeng-928/chinese-longnovel-skill) | 67 | 中文长篇网文：分层上下文与伏笔追踪技能。 | 其他 | 1 | 仅索引 |
| [anshaneja5/markscrub](https://github.com/anshaneja5/markscrub) | 66 | 清洗文本/文件中 AI 出处标记的 CLI+技能。 | 其他 | 1 | 仅索引 |
| [millwright-labs/minto-pyramid-skill](https://github.com/millwright-labs/minto-pyramid-skill) | 66 | Barbara Minto 金字塔原理写作 Agent Skill。 | 其他 | 1 | 仅索引 |
| [ZongziForu/cn-law-hub](https://github.com/ZongziForu/cn-law-hub) | 66 | 中国法条检索与现行有效核验 Agent Skill。 | 其他 | 1 | 仅索引 |
| [kangarooking/director-skills](https://github.com/kangarooking/director-skills) | 65 | AI 视频创作导演技能包（开源）。 | 其他 | 多 | 仅索引 |
| [Songzhi-lab/chinese-font-selector](https://github.com/Songzhi-lab/chinese-font-selector) | 65 | 可商用中文字体选字与中英混排知识包技能。 | 其他 | 1 | 仅索引 |

## 4. 安装器 / 注册表 / 基础设施

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [activeloopai/hivemind](https://github.com/activeloopai/hivemind) | 1,593 | 团队共享记忆：从轨迹挖掘并生成可复用 SKILL.md；Claude 插件市场 + OpenClaw/Codex/Cursor hooks。 | Apache-2.0 | 记忆/技能化 infra | 仅索引 |
| [Railly/tinte](https://github.com/Railly/tinte) | 618 | 把设计系统编译成 Agent Plugin（SKILL.md + tokens.css）；`bunx tinte build --plugin`。仓库名无 skill。 | MIT | 生成器/插件 | 仅索引 |
| [WoJiSama/skill-based-architecture](https://github.com/WoJiSama/skill-based-architecture) | 548 | 可路由项目 Skill 元架构（routing.yaml + 薄壳）；Claude 插件市场 `/plugin marketplace add WoJiSama/skill-based-architecture`。V2EX 热帖。 | 见 LICENSE | 1 元技能 | 仅索引 |
| [EverMind-AI/SkillCorpus](https://github.com/EverMind-AI/SkillCorpus) | 492 | 把散落 SKILL.md 聚合成可检索语料 + 评测/插件（OpenClaw/Hermes/DSH）；SkillHub 配套开源层。 | Apache-2.0（match/evaluate MIT） | 语料/检索 infra | 仅索引 |
| [zhuyansen/agent-skills-hub](https://github.com/zhuyansen/agent-skills-hub) | 355 | AgentSkillsHub：Claude/MCP/Codex 技能目录与评分站点开源后端（非 SKILL.md 库本体）。 | README 未单列 SPDX | 目录/评分 infra | 仅索引 |
| [K-Dense-AI/mimeo](https://github.com/K-Dense-AI/mimeo) | 260 | 把公开专家语料编译成 SKILL.md/AGENTS.md 的 CLI（mimeo）；arxiv:2609.00453。 | README 未单列 SPDX | 生成器 | 仅索引 |
| [Chat2AnyLLM/awesome-claude-skills](https://github.com/Chat2AnyLLM/awesome-claude-skills) | 147 | Claude Skills上游源元数据目录（不镜像正文）。 | None | 目录级 | 仅索引 |
| [LearnPrompt/skillrush-town](https://github.com/LearnPrompt/skillrush-town) | 107 | 淘金小镇：ClawHub Top100快照+潜力技能雷达，附可安装Skill。 | MIT | 1 | 仅索引 |
| [dfrysinger/qrspi-plus](https://github.com/dfrysinger/qrspi-plus) | 38 | QRSPI结构化agentic开发流水线Claude/Copilot插件。 | MIT | 38 | 仅索引 |
| [MichelKerkmeester/skilled-agent-harness_spec-driven-loops](https://github.com/MichelKerkmeester/skilled-agent-harness_spec-driven-loops) | 34 | Spec-driven agent loops定制Skill/连续性框架。 | MIT | 87 | 仅索引 |
| [davepoon/buildwithclaude](https://github.com/davepoon/buildwithclaude) | 3,416 | Claude Skills/Agents/Commands/Hooks/Plugins/Marketplace发现枢纽。仓库名无skill。 | MIT | 目录 | 仅索引 |
| [yaojingang/yao-meta-skill](https://github.com/yaojingang/yao-meta-skill) | 2,596 | YAO元技能：工程化/评测/治理/可移植的技能工作流。 | MIT | 1+ | 仅索引 |
| [rebelytics/one-skill-to-rule-them-all](https://github.com/rebelytics/one-skill-to-rule-them-all) | 2,364 | 自改进元技能：构建并改进你的全部skills（含自身）。 | MIT | 1 | 仅索引 |
| [DenisSergeevitch/agents-best-practices](https://github.com/DenisSergeevitch/agents-best-practices) | 2,271 | 跨厂商Agent Skill最佳实践（Codex/Claude/harness）。`npx skills add DenisSergeevitch/agents-best-practices`。 | MIT | 1+ | 仅索引 |
| [Astro-Han/karpathy-llm-wiki](https://github.com/Astro-Han/karpathy-llm-wiki) | 2,152 | Karpathy风格LLM Wiki，兼容Claude/Cursor/Codex Agent Skills。 | MIT | 多 | 仅索引 |
| [AI-Builder-Club/skills](https://github.com/AI-Builder-Club/skills) | 1,236 | Codebase harness + loop engineer Skills。 | MIT | 多 | 仅索引 |
| [CreminiAI/skillpack](https://github.com/CreminiAI/skillpack) | 1,197 | 本地AI Agent打包部署给团队的Skill包。 | MIT | 多 | 仅索引 |
| [agenmod/immortal-skill](https://github.com/agenmod/immortal-skill) | 1,029 | 开源数字永生：聊天记录蒸馏七维数字分身Skill框架。 | MIT | 1+ | 仅索引 |
| [sandiiarov/skill-creator](https://github.com/sandiiarov/skill-creator) | 614 | Skill 创建器基建：`npx @asnd/skill-creator` 安装，从 OpenAPI/GraphQL/MCP 生成含 SKILL.md 的可复用 Agent Skill。 | MIT | 1 | 仅索引 |
| [joeseesun/qiaomu-meta-skill](https://github.com/joeseesun/qiaomu-meta-skill) | 371 | 乔木元技能：工作流→可研究/评测/发布的Agent Skill。 | MIT | 1 | 仅索引 |
| [Peiiii/skild](https://github.com/Peiiii/skild) | 113 | Agent Skills包管理器/平台（skild.sh）；安装/发布/搜索。V2EX。 | MIT | 工具 | 仅索引 |
| [CyrilLeMat/temper-skills](https://github.com/CyrilLeMat/temper-skills) | 4 | Temper：Skill 决策逻辑对抗测试/冻结工具；Claude Code 内 `/temper`，技能位于 `.claude/skills`。 | Other | 10 | 仅索引 |
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
| [what1f/kitter](https://github.com/what1f/kitter) | 194 | 本地优先 Skill 管理器：一库多项目按需装。 | Apache-2.0 | 工具 | 仅索引 |
| [agent-sh/agnix](https://github.com/agent-sh/agnix) | 404 | Agent 指令文件（SKILL.md/CLAUDE.md）linter 与 LSP。 | MIT | 工具 | 仅索引 |
| [first-fluke/oh-my-agent](https://github.com/first-fluke/oh-my-agent) | 1,268 | 跨运行时多 Agent harness：产物门控与独立评审。 | MIT | 工具 | 仅索引 |
| [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | 67,409 | 规格驱动开发 OpenSpec（含 agent skills）。 | 其他 | 多 | 仅索引 |
| [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | 52,714 | BMAD 方法：多智能体规格驱动开发技能体系。 | 其他 | 多 | 仅索引 |
| [millionco/react-doctor](https://github.com/millionco/react-doctor) | 14,718 | React Doctor：面向 Agents 的代码审查技能。 | 其他 | 1 | 仅索引 |
| [tw93/Waza](https://github.com/tw93/Waza) | 6,963 | Waza：Claude Code 设计/工程技能包。 | 其他 | 多 | 仅索引 |
| [runkids/skillshare](https://github.com/runkids/skillshare) | 2,623 | 一条命令跨 60+ AI CLI 同步/分享 Skills（含审计）。 | MIT | 工具 | 仅索引 |
| [a5c-ai/babysitter](https://github.com/a5c-ai/babysitter) | 1,773 | Agent 劳动力服从性与确定性自编排 harness。 | 其他 | 工具 | 仅索引 |
| [fcakyon/claude-codex-settings](https://github.com/fcakyon/claude-codex-settings) | 1,131 | 实战 Claude/Codex/Cursor 配置、插件与 Agents。 | 其他 | 多 | 仅索引 |
| [notque/vexjoy-agent](https://github.com/notque/vexjoy-agent) | 419 | VexJoy：自然语言路由到专家 Agent 的技能系统。 | 其他 | 多 | 仅索引 |
| [opensesh/KARIMO](https://github.com/opensesh/KARIMO) | 285 | Claude Code harness：PRD 驱动编排与评审。 | 其他 | 多 | 仅索引 |
| [kairyou/agent-tools](https://github.com/kairyou/agent-tools) | 177 | 可复用 Agent Skills + Codex/Claude/opencode 集成。 | 其他 | 多 | 仅索引 |
| [sudokar/openspec-plus](https://github.com/sudokar/openspec-plus) | 173 | 增强 OpenSpec 规范驱动开发的 Agent Skills。 | 其他 | 多 | 仅索引 |
| [oliver-zehentleitner/keep-the-why](https://github.com/oliver-zehentleitner/keep-the-why) | 152 | 仓库原生保留决策理由的 Agent Skill 约定。 | 其他 | 1 | 仅索引 |
| [genggng/hermes-arxiv-agent](https://github.com/genggng/hermes-arxiv-agent) | 119 | Hermes 每日 arXiv 抓取摘要推飞书技能。 | 其他 | 1 | 仅索引 |
| [ashutoshsinghpr7/wikiskill](https://github.com/ashutoshsinghpr7/wikiskill) | 116 | WikiSkill：持久知识 wiki 自进化 Hermes Skills。 | 其他 | 工具 | 仅索引 |
| [ollygarden/opentelemetry-agent-skills](https://github.com/ollygarden/opentelemetry-agent-skills) | 97 | 上游来源锚定的 OpenTelemetry Agent Skills。 | 其他 | 多 | 仅索引 |
| [qkycir-123/dsh-run2skill](https://github.com/qkycir-123/dsh-run2skill) | 96 | 成功 DeepSeek Harness 会话自动变可复用 Skills。 | 其他 | 工具 | 仅索引 |
| [YPares/rigup.nix](https://github.com/YPares/rigup.nix) | 88 | Nix 模块化打包可参数化 Agent Skills/工具。 | 其他 | 工具 | 仅索引 |
| [klubinskak/skilldex](https://github.com/klubinskak/skilldex) | 78 | 本地优先桌面：发现/组织/收藏 Agent Skills。 | 其他 | 工具 | 仅索引 |
| [smixs/mentor](https://github.com/smixs/mentor) | 77 | 读本地 Claude/Codex 历史写工作洞察报告技能。 | 其他 | 1 | 仅索引 |
| [Apeironics/prompt-refine-skill](https://github.com/Apeironics/prompt-refine-skill) | 76 | 静默按当前模型精炼提示词的 Agent Skill。 | 其他 | 1 | 仅索引 |
| [NulightJens/rocket-fuel-skill](https://github.com/NulightJens/rocket-fuel-skill) | 75 | Fable+Codex 联合创始人式 V/I 操作系统技能。 | 其他 | 1 | 仅索引 |
| [adewale/skill-eval-harness](https://github.com/adewale/skill-eval-harness) | 73 | Agent Skill 成对变体评测与轨迹产物 harness。 | 其他 | 工具 | 仅索引 |
| [Tasihi89/build-to-learn](https://github.com/Tasihi89/build-to-learn) | 72 | 以学习为目标、构建为测验的 Claude 技能。 | 其他 | 1 | 仅索引 |
| [levi-qiao/longgraph-skill](https://github.com/levi-qiao/longgraph-skill) | 71 | 长程多任务账本循环 Agent Skill（跨宿主）。 | 其他 | 1 | 仅索引 |
| [Lyn-77/ProMentor](https://github.com/Lyn-77/ProMentor) | 70 | 把 AI 编程助手变成阶梯式导师的 Skill。 | 其他 | 1 | 仅索引 |
| [lingbol088-spec/auto-skill-installer](https://github.com/lingbol088-spec/auto-skill-installer) | 68 | AI Agent 技能自动发现与安装器。 | 其他 | 工具 | 仅索引 |
| [pc-style/skill-view](https://github.com/pc-style/skill-view) | 68 | 本地 Web GUI 检视各来源 SKILL.md。 | 其他 | 工具 | 仅索引 |
| [ericrisco/rsc-harness](https://github.com/ericrisco/rsc-harness) | 65 | 给 Agent 记忆与数据库手臂的元 harness。 | 其他 | 工具 | 仅索引 |
| [musoyangrigor/gitx-skill](https://github.com/musoyangrigor/gitx-skill) | 65 | 跨 Agent 干净提交/打标签/安全推送的 GitX 技能。 | 其他 | 1 | 仅索引 |
| [per-simmons/fable-orchestration](https://github.com/per-simmons/fable-orchestration) | 65 | 用 Fable 架构、Opus 执行的廉价编排技能。 | 其他 | 1 | 仅索引 |

## 5. 其他值得索引的技能库

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) | 52,358 | Claude API cookbook（笔记本/教程），不是 SKILL.md 技能库；作为官方学习材料索引。 | README 未单列 SPDX | 教程而非技能 | 仅索引 |
| [UditAkhourii/neuroarxiv](https://github.com/UditAkhourii/neuroarxiv) | 417 | 写新架构前先检索 arXiv 先验的技能。 | MIT | 1 | 仅索引 |
| [Socialpranker/deepdive](https://github.com/Socialpranker/deepdive) | 393 | Claude Code 十二阶段结构化深度研究技能。 | MIT | 1 | 仅索引 |
| [aigorahub/elves](https://github.com/aigorahub/elves) | 218 | 多批次自主开发/研究过夜技能（跨模型）。 | MIT | 1 | 仅索引 |
| [Vuk97/forward-implementation-first](https://github.com/Vuk97/forward-implementation-first) | 163 | 先交付实现、再验证的反簿记拖延技能。 | MIT | 1 | 仅索引 |
| [SeanEllyJames/deep-research-skill](https://github.com/SeanEllyJames/deep-research-skill) | 201 | 强调判断而非堆砌信息的深度调研技能。 | MIT | 1 | 仅索引 |
| [MrZoyo/deslop-GPT](https://github.com/MrZoyo/deslop-GPT) | 97 | 删除优先：去测试膨胀与验证剧场的技能。 | MIT | 1 | 仅索引 |

## 6. 名称不含 skill / agent 的技能库（本轮追加）

仓库名往往是方法论、产品或梗。判定依据是 README：可安装的 SKILL.md / Claude 插件市场 / `npx skills add`。

| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |
|---|---:|---|---|---|---|
| [Nanako0129/sepia](https://github.com/Nanako0129/sepia) | 1,875 | 去 AI 腔写作 Agent Skill（叙事结构优先）；`npx skills add Nanako0129/sepia`，Claude/Codex/Grok/Antigravity 原生插件。仓库名无 skill。 | MIT | 1 + 4 操作包装 | 仅索引 |
| [Vincentwei1021/video-talkcraft](https://github.com/Vincentwei1021/video-talkcraft) | 602 | 口播视频动效 Agent Skill：字级配音同步 + 79 动效卡 + Remotion；`npx skills add Vincentwei1021/video-talkcraft`。仓库名无 skill。 | PolyForm Noncommercial 1.0.0 | 1 | 仅索引 |
| [inkboard/system-atlas](https://github.com/inkboard/system-atlas) | 391 | 架构讨论→可交互等轴测 atlas 的 Agent Skill；`npx skills add inkboard/system-atlas`。仓库名无 skill。 | MIT | 1 | 仅索引 |
| [kunchenguid/vision](https://github.com/kunchenguid/vision) | 310 | 从仓库历史起草并压力测试 VISION.md 的 Agent Skill；`npx skills add kunchenguid/vision`。仓库名无 skill。 | MIT | 1 | 仅索引 |
| [hopechen067/MapStage](https://github.com/hopechen067/MapStage) | 279 | 地图投影/地形调参器+可安装mapstage Skill；仓库名无skill。 | MIT | 1 | 仅索引 |
| [bybit-exchange/svg-diagram](https://github.com/bybit-exchange/svg-diagram) | 218 | 手写SVG架构/流程/时序图Skill+svg-lint；npx skills add。V2EX。仓库名无skill。 | MIT | 1 | 仅索引 |
| [yschimke/compose-ai-tools](https://github.com/yschimke/compose-ai-tools) | 110 | Compose Preview→PNG CLI，附Claude skills供Agent看UI；仓库名无skill。 | Apache-2.0 | 3 | 仅索引 |
| [Kayforkind/reimagine-it](https://github.com/Kayforkind/reimagine-it) | 39 | HTML→更强独立页CLI+Agent Skill/插件；仓库名无skill。 | MIT | 7 | 仅索引 |
| [V-Songbird/foreman](https://github.com/V-Songbird/foreman) | 34 | Claude插件：跨会话项目计划保活；仓库名无skill。 | MIT | 5 | 仅索引 |
| [nidhinjs/prompt-master](https://github.com/nidhinjs/prompt-master) | 12,368 | 为任意AI工具写准提示词的Claude Skill；零额外token宣传。仓库名无skill。 | MIT | 1 | 仅索引 |
| [neilsonnn/image-blaster](https://github.com/neilsonnn/image-blaster) | 4,841 | 图像→世界Skillset for Claude。仓库名无skill。 | MIT | 多 | 仅索引 |
| [gotalab/cc-sdd](https://github.com/gotalab/cc-sdd) | 3,652 | Spec-driven长期自治实现框架；附可安装Skills。仓库名无skill。 | MIT | 多 | 仅索引 |
| [jangviktor-web/nihaixia](https://github.com/jangviktor-web/nihaixia) | 2,803 | 倪海厦视角中医Agent Skill（伤寒/金匮/针灸等）。`npx skills add`。仓库名无skill。 | None | 1+ | 仅索引 |
| [romainsimon/paperasse](https://github.com/romainsimon/paperasse) | 2,369 | 法国官僚流程专项Agent Skills（会计/公证等）。仓库名无skill。 | MIT | 多 | 仅索引 |
| [JuneYaooo/nihaisha-nishi-tcm](https://github.com/JuneYaooo/nihaisha-nishi-tcm) | 2,050 | 倪海厦中医课程Agent Skill：检索/方证穴位/笔记与板书证据。仓库名无skill。 | None | 1+ | 仅索引 |
| [nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft) | 1,804 | 高端沉浸式滚动驱动网站构建Agent Skill。仓库名无skill。 | MIT | 1 | 仅索引 |
| [lennney/stop-that-shit](https://github.com/lennney/stop-that-shit) | 1,568 | Stop That Shit：拦截无需求哈希/校验和乱造的Hook+Skill Guard。仓库名无skill。 | MIT | 多 | 仅索引 |
| [lyra81604/zhengxi-views](https://github.com/lyra81604/zhengxi-views) | 1,546 | 可溯源郑希投研Agent Skill（公开观点+基金数据打分）。仓库名无skill。 | MIT | 1 | 仅索引 |
| [MrGeDiao/shuorenhua](https://github.com/MrGeDiao/shuorenhua) | 1,428 | 说人话：中文优先去AI味改写Skill（Codex/Claude）。仓库名无skill。 | MIT | 1 | 仅索引 |
| [wuji-labs/nopua](https://github.com/wuji-labs/nopua) | 1,387 | 用尊重/关怀激发AI潜能的Skill（找Bug等）。仓库名无skill。 | MIT | 1 | 仅索引 |
| [noobnooc/agent](https://github.com/noobnooc/agent) | 1,378 | 个人主页式Agent Skills合集。仓库名无skill。 | MIT | 多 | 仅索引 |
| [pyang5166/gbro-collage-broll](https://github.com/pyang5166/gbro-collage-broll) | 1,250 | 半调纸拼贴B-roll生成Skill（三闸门审批）。仓库名无skill。 | MIT | 1 | 仅索引 |
| [huytieu/COG-second-brain](https://github.com/huytieu/COG-second-brain) | 1,170 | 自演进第二大脑：33 skills/10 agents/CRM闭环。仓库名无skill。 | MIT | 33 | 仅索引 |
| [Anionex/agent-vision-toolkit](https://github.com/Anionex/agent-vision-toolkit) | 1,162 | 纯文本模型看图工具箱与技能（多图/UI还原/GUI自动化）。仓库名无skill。 | MIT | 多 | 仅索引 |
| [SpaceZephyr/creator-buddy](https://github.com/SpaceZephyr/creator-buddy) | 1,109 | 跨平台内容搜索/创作者分析编排Agent Skills。仓库名无skill。 | MIT | 多 | 仅索引 |
| [shang-zhu/violin](https://github.com/shang-zhu/violin) | 1,055 | 开源视频翻译Skill。仓库名无skill。 | MIT | 1 | 仅索引 |
| [917Dhj/DeepPaperNote](https://github.com/917Dhj/DeepPaperNote) | 1,034 | 单篇论文深读与高质量笔记Agent Skill。仓库名无skill。 | MIT | 1 | 仅索引 |
| [agiwhitelist/auteur](https://github.com/agiwhitelist/auteur) | 1,019 | 像导电影一样导网站的Claude Skill。仓库名无skill。 | MIT | 1+ | 仅索引 |
| [bitjaru/styleseed](https://github.com/bitjaru/styleseed) | 943 | 设计风格种子/品味Skill。仓库名无skill。 | MIT | 1+ | 仅索引 |
| [gitroomhq/postiz-agent](https://github.com/gitroomhq/postiz-agent) | 446 | Postiz 社媒排期 Agent（Claude/OpenClaw Skills）。 | Other | 1+ | 仅索引 |
| [frmoretto/stream-coding](https://github.com/frmoretto/stream-coding) | 96 | Stream Coding 方法论与官方 SKILL.md。 | Other | 1+ | 仅索引 |
| [mahmoudilyan/marmoui](https://github.com/mahmoudilyan/marmoui) | 41 | Marmo UI 组件库配套 Claude Skills/插件。 | Other | 1+ | 仅索引 |
| [swaylq/humanize-chinese](https://github.com/swaylq/humanize-chinese) | 14 | 中文 AI 文本去痕迹 Skill。 | MIT | 2 | 仅索引 |
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
| [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) | 9,054 | GSD Core：跨宿主 spec-driven / 上下文工程循环；`npx @opengsd/gsd-core`。仓库名无 skill。 | MIT | SDD 框架 | 仅索引 |
| [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills) | 3,227 | Three.js 技能 10 条（fundamentals→interaction）；SKILL.md 集合。 | MIT | 10 | 仅索引 |
| [yetone/native-feel-skill](https://github.com/yetone/native-feel-skill) | 1,903 | 跨平台桌面原生感架构技能。 | MIT | 1 | 仅索引 |
| [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | 500 | Superdesign UI/演示/图形技能。 | MIT | 1 | 仅索引 |
| [yan-labs/serenity-aleabitoreddit](https://github.com/yan-labs/serenity-aleabitoreddit) | 475 | Serenity AI/半导体供应链研究技能。仓库名无 skill。 | README 未单列 SPDX | 1 | 仅索引 |
| [existential-birds/beagle](https://github.com/existential-birds/beagle) | 80 | Beagle 技能市场：Python/Go/Rust/Elixir/React/iOS 审查。 | README 未单列 SPDX | marketplace | 仅索引 |
| [Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy) | 3,084 | Depth Tree 反懒惰完成纪律技能（验收闸门）。 | MIT | 1 | 仅索引 |
| [s0xDk/refactoring-ui-skill](https://github.com/s0xDk/refactoring-ui-skill) | 530 | Refactoring UI 书中机械设计规则技能。 | MIT | 1 | 仅索引 |
| [LunarXuan/image-prompt-reverse](https://github.com/LunarXuan/image-prompt-reverse) | 298 | 高保真图像提示词逆向工程技能。 | GPL-3.0 | 1 | 仅索引 |
| [aaronyi97/image-story-video-wizard](https://github.com/aaronyi97/image-story-video-wizard) | 267 | 确认门控的图文故事视频制作技能。 | MIT | 1 | 仅索引 |
| [camilleroux/genart-skill](https://github.com/camilleroux/genart-skill) | 137 | 确定性哈希种子生成艺术 Claude 插件技能。 | MIT | 1 | 仅索引 |
| [hi-nikola/hand-drawn-explainer-video-nikola](https://github.com/hi-nikola/hand-drawn-explainer-video-nikola) | 108 | 中文手绘知识讲解视频 Codex Skill。 | Apache-2.0 | 1 | 仅索引 |
| [op7418/Humanizer-zh](https://github.com/op7418/Humanizer-zh) | 16,729 | 中文去 AI 味 Humanizer 技能。 | 其他 | 1 | 仅索引 |
