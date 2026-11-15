# 同类任务推荐顺序 · Task-specific skill picks

> 本文件由 scripts/build-index.mjs 自动生成，请勿手改。

这是静态任务适配顺序，不是运行效果或安全评分。精确技能 ID 优先；任务别名整句匹配才应用组内顺序。

已覆盖 **1094 条现行技能**：199 条进入 98 个同类任务组，895 条保持独立；21 条归档不参与推荐。

逐条范围、区别与正文哈希见[覆盖清单](../data/skill-ranking-review.json)。任务边界初筛与入组全文比较分开记录；未执行技能或测量任务成功率。

<details><summary>同任务组目录（98）</summary>

- [设计产品 A/B 实验方案](#ab-experiment-plan)
- [筹备董事会对抗问答](#adversarial-board-prep)
- [优化 AI 搜索内容引用](#ai-search-citation)
- [AMM智能合约安全检查](#amm-contract-review)
- [整理已比对 BAM 并建立索引](#bam-sort-index)
- [编写并测试 Airflow 数据 DAG](#build-airflow-data-dag)
- [构建跨会话对话记忆](#build-conversation-memory)
- [搭建数据管道质量校验与契约](#build-data-quality-gates)
- [搭建 dbt 分层转换模型](#build-dbt-layered-models)
- [构建历史交易策略回测](#build-trading-backtest)
- [构建企业文化行为体系](#company-culture-system)
- [设计公司运营会议节奏](#company-operating-cadence)
- [压缩长会话并保留续作状态](#compress-long-agent-session)
- [规划Confluence模板内容与样例页](#confluence-reusable-template)
- [规划内容支柱与编辑路线图](#content-editorial-strategy)
- [制作可编辑 PPTX](#create-pptx)
- [协调跨职能顾问决策](#cross-functional-decision-routing)
- [维护投行交易里程碑台账](#deal-milestone-workbook)
- [设计或重构 Agent 工具契约](#design-agent-tool-contracts)
- [设计多智能体工作流 JSON 骨架](#design-agent-workflow-json)
- [设计关系数据库 Schema 与约束](#design-relational-schema)
- [设计并优化可复用提示词](#design-reusable-prompt)
- [并行分派并整合独立子任务](#dispatch-independent-agent-tasks)
- [起草知识产权停止侵权函](#draft-ip-cease-desist)
- [分析财报问答中的分析师关切](#earnings-analyst-concerns)
- [提取财报电话会前瞻指引](#earnings-forward-guidance)
- [规划 AI 系统输入的静态签名评估](#engineering-ai-static-signature-review)
- [规划授权 AWS 攻击路径评估](#engineering-authorized-aws-assessment)
- [组织可用性事故响应与服务恢复](#engineering-availability-incident-response)
- [分析 AWS 账单并形成降本建议](#engineering-aws-cost-analysis)
- [为后端 API 实施安全控制](#engineering-backend-api-hardening)
- [选择 Zoom 集成产品与 API 面](#engineering-choose-zoom-surface)
- [开发 Chrome Manifest V3 扩展](#engineering-chrome-mv3-extension)
- [实现 Cloudflare Worker 与存储绑定](#engineering-cloudflare-worker)
- [实现 CQRS 命令查询分离与读模型](#engineering-cqrs-read-write)
- [编写架构决策记录并维护索引](#engineering-create-adr)
- [优化 Dockerfile 镜像与构建缓存](#engineering-dockerfile-optimization)
- [定位并修复已有软件缺陷](#engineering-fix-reproducible-bug)
- [将命令式 TypeScript 渐进重构为 fp-ts](#engineering-fp-ts-migration)
- [编写 GitHub Actions 测试构建流水线](#engineering-github-ci-workflow)
- [实现可取消的 Go Worker Pool](#engineering-go-cancellable-pool)
- [用 Go 实现 Chromium 页面提取与交互](#engineering-go-chromium-automation)
- [生成 Grafana 运维看板配置](#engineering-grafana-operations-dashboard)
- [渐进迁移遗留框架并保留旧行为](#engineering-legacy-framework-migration)
- [建立后端端口与适配器架构](#engineering-ports-adapters)
- [提取已知公开网页的干净正文](#engineering-public-page-markdown)
- [检索公开网页并整理来源线索](#engineering-public-web-research)
- [评审 REST API 契约与一致性](#engineering-rest-contract-review)
- [静态评审代码改动并给出证据化发现](#engineering-review-code-diff)
- [在 CI 或运行时接入密钥库与轮换](#engineering-secrets-backend)
- [安装前静态审查第三方 Agent 技能](#engineering-skill-install-security)
- [定义 SLI/SLO 与错误预算告警](#engineering-slo-budget)
- [静态审计技能库质量与重复](#engineering-static-skill-library-audit)
- [编写可复用 Terraform 模块](#engineering-terraform-module)
- [配置 Turborepo 任务与远程缓存](#engineering-turborepo-cache)
- [配置 Vexor 并按语义定位文件](#engineering-vexor-setup-search)
- [实现有明确视觉方向的前端组件](#engineering-visual-frontend-component)
- [审计 Web 无障碍并给出 WCAG AA 整改](#engineering-wcag-aa-audit)
- [规划零停机数据库结构迁移](#engineering-zero-downtime-db-plan)
- [从用户数据构建研究画像](#evidence-based-user-persona)
- [从表达矩阵生成调控网络表](#expression-grn-table)
- [撰写功能 PRD 与验收标准](#feature-prd-document)
- [设计 GA4/GTM 追踪计划](#ga4-gtm-tracking-plan)
- [GDPR工程控制与同意管理](#gdpr-engineering-controls)
- [推演艰难抉择并制定沟通方案](#hard-call-with-communication)
- [对中文文稿去 AI 腔并保留语域](#humanize-chinese-prose)
- [投行 PPT 模板填充](#ib-template-fill)
- [利润表同比增长分析](#income-statement-yoy)
- [规划站内链接与锚文本](#internal-link-opportunity-plan)
- [设计岗位面试题库与评分卡](#interview-question-scorecard)
- [设计生命周期邮件序列](#lifecycle-email-flow)
- [对模糊决策做多视角权衡](#multi-perspective-decision)
- [制定新员工入职计划](#new-hire-30-60-90-plan)
- [制定组织变革采用计划](#organization-adoption-plan)
- [生成付费广告文案变体](#paid-ad-copy)
- [在投入前对计划做事前验尸](#plan-premortem-review)
- [撰写项目周期状态报告](#project-periodic-status-report)
- [获取PyTDC数据集与标准划分](#pytdc-dataset-benchmark)
- [用 RDKit 分析化合物库](#rdkit-library-profile)
- [读取公开X单帖为结构化数据](#read-public-x-post)
- [登记已批准的高风险决策](#record-approved-high-risk-decision)
- [去除现有文稿的 AI 腔调](#remove-ai-prose-patterns)
- [撰写与修订科研论文](#research-manuscript-writing)
- [评审现有界面设计](#review-existing-interface-design)
- [生成多源科技新闻情感简报](#rss-sentiment-briefing)
- [分析订阅企业单位经济与队列](#saas-unit-economics-cohorts)
- [编制销售管线加权预测](#sales-weighted-forecast)
- [选择 LLM 应用模式与生产护栏](#select-production-llm-patterns)
- [编写 SEO 周期绩效报告](#seo-periodic-performance-report)
- [把已有素材改编为多平台内容](#social-source-repurposing)
- [搭建初创财务与跑道情景模型](#startup-financial-scenarios)
- [压力测试可证伪的商业假设](#stress-test-business-assumption)
- [接入 Stripe 订阅支付](#stripe-subscription-integration)
- [审计技术 SEO 健康度](#technical-seo-health-audit)
- [分诊收到的知识产权律师函](#triage-inbound-ip-letter)
- [为 VCF 汇总统计做质量检查](#vcf-quality-before-statistics)
- [供应商合同逐条红线审查](#vendor-contract-redlines)
- [撰写网站转化营销文案](#website-conversion-copy)

</details>

<a id="ab-experiment-plan"></a>

## 设计产品 A/B 实验方案 · ab-experiment-plan

Design a product A/B experiment · 2026-11-15

检索任务：`A/B实验方案`、`增长实验设计`、`product ab experiment plan`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`ab-test-setup-gates`](../05-business/ab-test-setup-gates/SKILL.md) | 先冻结假设、主指标、样本量与护栏，再过就绪门控，任务输入和禁止开测条件明确。 |
| 2 | [`ab-test-designer`](../05-business/ab-test-designer/SKILL.md) | 同类方案备选，补充ICE排期和复盘；统计表述及平台参数使用时另核。 |

<a id="adversarial-board-prep"></a>

## 筹备董事会对抗问答 · adversarial-board-prep

Prepare for adversarial board questions · 2026-11-15

检索任务：`董事会对抗备会`、`董事会问答演练`、`adversarial board preparation`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`board-prep-orchestrator`](../07-productivity/board-prep-orchestrator/SKILL.md) | 五相位形成数字、问题库、逐董事预案和48小时清单，可检查产物更明确。 |
| 2 | [`board-meeting-prep`](../05-business/board-meeting-prep/SKILL.md) | 同类演练备选，覆盖脱稿数字、五段叙事与会后行动，适合已有议程自测。 |

<a id="ai-search-citation"></a>

## 优化 AI 搜索内容引用 · ai-search-citation

Optimize content for AI citations · 2026-11-15

检索任务：`AI搜索引用优化`、`GEO内容优化`、`ai citation optimization`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`ai-answer-engine-seo`](../05-business/ai-answer-engine-seo/SKILL.md) | 审计、答案块改写、监控闭环明确，并区分验证与推测；平台爬虫声明仍需另核。 |
| 2 | [`ai-search-seo`](../05-business/ai-search-seo/SKILL.md) | 同类备选，增加第三方露出与查询集；正文效果数字未验证，不作为本排名效果依据。 |

<a id="amm-contract-review"></a>

## AMM智能合约安全检查 · amm-contract-review

Review AMM smart-contract security · 2026-11-15

检索任务：`AMM合约安全检查`、`自动做市商安全审查`、`review AMM contract security`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`defi-amm-security-audit`](../08-security/defi-amm-security-audit/SKILL.md) | 专门检查做市/兑换合约的不变量、储备与经济安全，并给分级发现；本轮仅比较指令，未对合约实施审计。 |
| 2 | [`solidity-security-auditor`](../09-verticals/solidity-security-auditor/SKILL.md) | 可提供EVM权限、状态顺序和外部调用的通用基础检查及测试思路；AMM经济模型仍需专项流程和专家复核。 |

<a id="bam-sort-index"></a>

## 整理已比对 BAM 并建立索引 · bam-sort-index

Sort and index an aligned BAM · 2026-11-15

检索任务：`BAM排序建索引`、`已比对BAM整理`、`bam sort and index`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`samtools-bam-processing`](../09-verticals/samtools-bam-processing/SKILL.md) | 专门按排序、索引、QC准备下游文件，并给索引与格式失败处理。 |
| 2 | [`genomic-file-toolkit`](../09-verticals/genomic-file-toolkit/SKILL.md) | 需要Python脚本内完成相同排序索引时采用，有pysam绑定与异常类型。 |

<a id="build-airflow-data-dag"></a>

## 编写并测试 Airflow 数据 DAG · build-airflow-data-dag

Write and test an Airflow data DAG · 2026-11-15

检索任务：`编写Airflow DAG`、`Airflow DAG`、`Airflow数据编排`、`build airflow dag`、`airflow data pipeline`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`airflow-dag-builder`](../03-data/airflow-dag-builder/SKILL.md) | 先定幂等、原子、增量和可观测，再给 DAG、sensor、重试与 DagBag 校验；数据调度边界明确。 |
| 2 | [`airflow-dag-patterns`](../03-data/airflow-dag-patterns/SKILL.md) | 覆盖相同 TaskFlow、分支、sensor 和测试，另有回填 runbook；日期字符串与 datetime.now 示例需先核对模板和幂等性。 |

<a id="build-conversation-memory"></a>

## 构建跨会话对话记忆 · build-conversation-memory

Build cross-session conversation memory · 2026-11-15

检索任务：`构建对话记忆`、`跨会话记住用户`、`长期对话记忆`、`build conversation memory`、`cross-session memory`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`agent-memory-systems`](../04-ai/agent-memory-systems/SKILL.md) | 提供记忆类型、元数据、用户隔离、预算、冲突版本与召回评测，适合一般长期对话记忆方案。 |
| 2 | [`llm-conversation-memory`](../04-ai/llm-conversation-memory/SKILL.md) | 四层 TS 骨架贴近对话存取与巩固；接口需补全，示例还需落实正文要求的用户命名空间。 |

<a id="build-data-quality-gates"></a>

## 搭建数据管道质量校验与契约 · build-data-quality-gates

Build data-pipeline quality checks and contracts · 2026-11-15

检索任务：`数据管道质量校验`、`搭建数据质量闸门`、`Great Expectations校验`、`build data quality checks`、`data quality contract`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`data-quality-validator`](../03-data/data-quality-validator/SKILL.md) | 工具选择、测试分层、新鲜度、自定义断言及带 schema 的契约均在正文，适合建立可重复校验。 |
| 2 | [`data-quality-frameworks`](../03-data/data-quality-frameworks/SKILL.md) | 覆盖相同期望、dbt 测试和 SodaCL 契约，另提醒 owner、修复与阻断前回退，可作较简洁方案入口。 |

<a id="build-dbt-layered-models"></a>

## 搭建 dbt 分层转换模型 · build-dbt-layered-models

Build layered dbt transformation models · 2026-11-15

检索任务：`dbt分层建模`、`dbt建模`、`dbt增量模型`、`build dbt models`、`dbt transformation pipeline`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`dbt-transformation-patterns`](../03-data/dbt-transformation-patterns/SKILL.md) | 内联串起 source 新鲜度、staging、mart、代理键、模型测试与增量策略，示例和工程文件关系清楚。 |
| 2 | [`dbt-transformation-modeler`](../03-data/dbt-transformation-modeler/SKILL.md) | 七步流程可快速组织工程；模型测试片段重复 customer_key 列定义，落地前应整理并由 dbt 校验。 |

<a id="build-trading-backtest"></a>

## 构建历史交易策略回测 · build-trading-backtest

Build a historical strategy backtest · 2026-11-15

检索任务：`构建策略回测`、`搭建回测框架`、`build trading backtest`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`backtesting-frameworks`](../09-verticals/backtesting-frameworks/SKILL.md) | 含向量化回测、指标函数、窗口与重采样示例，适合作实现起点；本轮未运行代码或验证收益。 |
| 2 | [`trading-strategy-backtester`](../09-verticals/trading-strategy-backtester/SKILL.md) | 覆盖同类成本/偏差及事件驱动边界；_calculate_metrics等示例片段需补实现，适合作已有引擎检查清单。 |

<a id="company-culture-system"></a>

## 构建企业文化行为体系 · company-culture-system

Build a company culture system · 2026-11-15

检索任务：`企业文化体系`、`文化行为锚点`、`company culture system`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`company-culture-builder`](../07-productivity/company-culture-builder/SKILL.md) | 价值观、行为锚点、准则、匿名测评与规模仪式闭环自包含，不强制外部模板。 |
| 2 | [`team-culture-architect`](../05-business/team-culture-architect/SKILL.md) | 同类备选，含第30天行为检验与领导诊断，源模板需按实际补充。 |
| 3 | [`company-culture-architect`](../07-productivity/company-culture-architect/SKILL.md) | 更细工作坊问卷，但1–5量表接9–10的eNPS算法，使用前须统一评分口径。 |

<a id="company-operating-cadence"></a>

## 设计公司运营会议节奏 · company-operating-cadence

Design a company operating cadence · 2026-11-15

检索任务：`公司会议节奏`、`运营节奏设计`、`company operating cadence`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`company-operating-system`](../07-productivity/company-operating-system/SKILL.md) | 责权图、周记分卡、L10议程、IDS与季度Rocks在正文可直接组成节奏模板。 |
| 2 | [`coo-operations-advisor`](../07-productivity/coo-operations-advisor/SKILL.md) | 战略级联和流程诊断并行时采用；必跑ops与OKR脚本缺失，补齐后按全流程使用。 |

<a id="compress-long-agent-session"></a>

## 压缩长会话并保留续作状态 · compress-long-agent-session

Compress a long agent session while preserving continuation · 2026-11-15

检索任务：`压缩长会话`、`保留文件状态的对话压缩`、`长会话摘要`、`compress agent session`、`conversation summary for continuation`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`context-compression`](../04-ai/context-compression/SKILL.md) | 围绕意图、文件、决策、状态和下一步做增量合并，并用续作/文件探针评估信息损失。 |
| 2 | [`context-window-management`](../04-ai/context-window-management/SKILL.md) | 还需 token 预算、响应预留、重要性裁剪与序位时采用；文件轨迹和多次摘要漂移验收不如专门流程明确。 |

<a id="confluence-reusable-template"></a>

## 规划Confluence模板内容与样例页 · confluence-reusable-template

Plan Confluence template content and sample pages · 2026-11-15

检索任务：`Confluence模板内容`、`Confluence样例页规范`、`plan Confluence template content`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`atlassian-template-builder`](../07-productivity/atlassian-template-builder/SKILL.md) | 专门给样例渲染、逐次发布拉回校验及失败回滚；先核对MCP与storage格式。 当前confluence_create_page路径交付普通样例页；原生模板或Blueprint注册需另有API/UI流程，不能按样例页验收原生模板。 |
| 2 | [`confluence-space-architect`](../07-productivity/confluence-space-architect/SKILL.md) | 同时规划空间层级与权限时的模板备选，建测试页验收后再共享。 |

<a id="content-editorial-strategy"></a>

## 规划内容支柱与编辑路线图 · content-editorial-strategy

Plan content pillars and an editorial roadmap · 2026-11-15

检索任务：`内容支柱规划`、`主题集群路线图`、`content editorial roadmap`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`content-strategy-planner`](../05-business/content-strategy-planner/SKILL.md) | 输入、买家旅程和四维排序清楚，固定交付支柱、优先选题与集群地图。 |
| 2 | [`content-engine-strategist`](../05-business/content-engine-strategist/SKILL.md) | 同类备选，适合把库存审计、简报和30/60/90日历一起规划。 |
| 3 | [`content-marketing-strategist`](../05-business/content-marketing-strategist/SKILL.md) | 同类支柱日历备选，偏全渠道分发与指标；优先级契约较少。 |

<a id="create-pptx"></a>

## 制作可编辑 PPTX · create-pptx

Create an editable PPTX · 2026-11-15

检索任务：`做PPT`、`生成PPT`、`制作PPT`、`PPT`、`PPTX`、`PowerPoint`、`create powerpoint`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`pptx-document-processing`](../01-documents/pptx-document-processing/SKILL.md) | 直接交付可编辑 PPTX，涵盖新建、模板编辑、结构和视觉验收；先核对可用工具。 |
| 2 | [`python-pptx-deck-generator`](../01-documents/python-pptx-deck-generator/SKILL.md) | 适合希望保留 Python 生成脚本的简单演示；不负责编辑已有文件或精细视觉验收。 |

<a id="cross-functional-decision-routing"></a>

## 协调跨职能顾问决策 · cross-functional-decision-routing

Coordinate cross-functional adviser decisions · 2026-11-15

检索任务：`跨职能决策协调`、`幕僚长顾问编排`、`cross functional decision routing`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`chief-of-staff-orchestrator`](../07-productivity/chief-of-staff-orchestrator/SKILL.md) | 评分、路由、防环、单轮评议、四步综合与日志格式齐全，交付一个带取舍的决策点。 |
| 2 | [`chief-of-staff-ops`](../07-productivity/chief-of-staff-ops/SKILL.md) | 同机制备选，含到期复盘提醒；完整路由与综合文件属于源参考。 |

<a id="deal-milestone-workbook"></a>

## 维护投行交易里程碑台账 · deal-milestone-workbook

Maintain a deal milestone workbook · 2026-11-15

检索任务：`投行交易台账`、`交易里程碑跟踪`、`deal milestone workbook`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`ib-deal-tracker`](../05-business/ib-deal-tracker/SKILL.md) | 投行字段、完整里程碑、临近14天和逾期判据明确，固定Excel分页交付。 |
| 2 | [`deal-pipeline-tracker`](../07-productivity/deal-pipeline-tracker/SKILL.md) | 轻量同产物备选，阶段可按业务改写，不承担重型关键路径管理。 |

<a id="design-agent-tool-contracts"></a>

## 设计或重构 Agent 工具契约 · design-agent-tool-contracts

Design or refactor agent tool contracts · 2026-11-15

检索任务：`Agent工具设计`、`Agent工具契约`、`工具集精简`、`design agent tools`、`agent tool contract`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`agent-tool-design`](../04-ai/agent-tool-design/SKILL.md) | 先定工作流粒度与合并例外，再定义输入输出、可恢复错误和代表请求回测，边界完整。 |
| 2 | [`agent-tool-design-patterns`](../04-ai/agent-tool-design-patterns/SKILL.md) | 相同整合原则与八步流程可替代，适合紧凑检查；架构精简例外较少。 |
| 3 | [`agent-tool-builder`](../04-ai/agent-tool-builder/SKILL.md) | 需要 JSON Schema、SDK/MCP 片段时采用；字符串返回和错误格式等假设需按宿主协议核对。 |

<a id="design-agent-workflow-json"></a>

## 设计多智能体工作流 JSON 骨架 · design-agent-workflow-json

Design a multi-agent workflow JSON skeleton · 2026-11-15

检索任务：`多智能体工作流设计`、`生成Agent工作流骨架`、`Agent交接契约`、`multi-agent workflow design`、`agent workflow skeleton`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`multi-agent-workflow-designer`](../04-ai/multi-agent-workflow-designer/SKILL.md) | 五种模式、命令默认值、输出参数与交接字段明确，内联 JSON 可对照；脚手架和参考文件已随包。 |
| 2 | [`agent-workflow-pattern-designer`](../04-ai/agent-workflow-pattern-designer/SKILL.md) | 采用相同五模式与脚手架，交接和预算约束等价，可作相同 JSON 工作流任务的紧凑备选。 |

<a id="design-relational-schema"></a>

## 设计关系数据库 Schema 与约束 · design-relational-schema

Design a relational database schema and constraints · 2026-11-15

检索任务：`关系数据库Schema设计`、`关系表结构设计`、`关系数据库建模`、`design relational schema`、`relational database modeling`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`database-design-advisor`](../02-engineering/database-design-advisor/SKILL.md) | 按真实约束定义 schema、索引与可逆迁移并要求执行计划验证，适合作关系建模的通用入口。 |
| 2 | [`erd-schema-designer`](../03-data/erd-schema-designer/SKILL.md) | 实体→基数→3NF→Mermaid 流程更专门；但 RLS 默认 permissive 策略把租户与软删除条件按 OR 放行，存在跨租户风险；Prisma 索引引用未定义 dueDate，采用前须修正。 |

<a id="design-reusable-prompt"></a>

## 设计并优化可复用提示词 · design-reusable-prompt

Design and optimize a reusable prompt · 2026-11-15

检索任务：`设计可复用提示词`、`提示词模板`、`优化提示词模板`、`reusable prompt template`、`design a prompt template`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`prompt-template-designer`](../04-ai/prompt-template-designer/SKILL.md) | 先定义变量、输出 schema 和验收点，再分离数据指令、覆盖边界 few-shot 并逐变量迭代，交付可回归模板。 |
| 2 | [`llm-prompt-optimizer`](../04-ai/llm-prompt-optimizer/SKILL.md) | 适合从含糊、格式漂移或冗长症状按 RSCIT 改写；变量契约、防注入和版本冻结不如模板入口完整。 |

<a id="dispatch-independent-agent-tasks"></a>

## 并行分派并整合独立子任务 · dispatch-independent-agent-tasks

Dispatch and integrate independent agent tasks · 2026-11-15

检索任务：`并行分派独立任务`、`独立测试失败并行修复`、`独立子任务派发`、`dispatch independent tasks`、`parallel independent agent tasks`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`parallel-agent-dispatch`](../00-meta/parallel-agent-dispatch/SKILL.md) | 先核实根因独立和无共享状态，再定义范围/目标/约束并回收冲突检查和真实全量测试，直接覆盖独立问题分派。 |
| 2 | [`quota-aware-subagent-orchestrator`](../04-ai/quota-aware-subagent-orchestrator/SKILL.md) | 大型多文件且需成本分轮控制时采用；配额仅人工估算，集成清单的心算 build 不能替代真实构建。 |

<a id="draft-ip-cease-desist"></a>

## 起草知识产权停止侵权函 · draft-ip-cease-desist

Draft an IP cease-and-desist letter · 2026-11-15

检索任务：`起草停止侵权函`、`知识产权维权函`、`draft IP cease and desist`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`cease-and-desist-letter`](../09-verticals/cease-and-desist-letter/SKILL.md) | send分支专门核对权利、证据、对方尽调与审批姿态；交付待律师审阅草稿，需案件配置。 |
| 2 | [`demand-letter-drafter`](../09-verticals/demand-letter-drafter/SKILL.md) | 已有索赔intake时可采用通用C&D模板及特权/自认检查；不代替权利调查或实际发函。 |

<a id="earnings-analyst-concerns"></a>

## 分析财报问答中的分析师关切 · earnings-analyst-concerns

Analyze analyst concerns in earnings Q&A · 2026-11-15

检索任务：`财报分析师关切`、`电话会提问归因`、`analyze earnings analyst concerns`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`octagon-earnings-analyst-questions`](../09-verticals/octagon-earnings-analyst-questions/SKILL.md) | 按主题、提问人/机构、回答状态及热度归档，直接覆盖关切归因；需Octagon来源页码。 |
| 2 | [`octagon-earnings-qa-analysis`](../09-verticals/octagon-earnings-qa-analysis/SKILL.md) | 同样覆盖关切与回应质量，适合将问答放回竞争、利润率和资本配置语境；读数不是交易信号。 |

<a id="earnings-forward-guidance"></a>

## 提取财报电话会前瞻指引 · earnings-forward-guidance

Extract forward guidance from earnings calls · 2026-11-15

检索任务：`提取财报指引`、`财报前瞻指引`、`extract earnings guidance`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`octagon-earnings-financial-guidance`](../09-verticals/octagon-earnings-financial-guidance/SKILL.md) | 专门输出定量区间、分部指引、风险口径和指引/实际跟踪表；需Octagon逐字稿及页码证据。 |
| 2 | [`octagon-earnings-call-analysis`](../09-verticals/octagon-earnings-call-analysis/SKILL.md) | 整场纪要流程也抽取指引，适合同时要战略、供应链和运营挑战全貌；不负责交易执行。 |

<a id="engineering-ai-static-signature-review"></a>

## 规划 AI 系统输入的静态签名评估 · engineering-ai-static-signature-review

Plan static signature assessment of AI system inputs · 2026-11-15

检索任务：`AI静态签名评估`、`LLM输入签名审计`、`plan ai signature assessment`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`ai-system-security-audit`](../08-security/ai-system-security-audit/SKILL.md) | 直接列出输入格式、覆盖与护栏输出，适合规划静态签名评估；核心 scripts/ai_threat_scanner.py 缺失，不能执行或据其静态分数宣称抗攻击能力。 |
| 2 | [`ai-ml-security-assessor`](../08-security/ai-ml-security-assessor/SKILL.md) | 覆盖相同评估与审批门，但扫描器和 references/atlas-coverage.md 均缺失，须补齐才可执行所述扫描与覆盖核对。 |

<a id="engineering-authorized-aws-assessment"></a>

## 规划授权 AWS 攻击路径评估 · engineering-authorized-aws-assessment

Plan an authorized AWS attack-path assessment · 2026-11-15

检索任务：`授权AWS攻击路径评估`、`AWS渗透评估方案`、`plan authorized aws assessment`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`cloud-penetration-testing`](../08-security/cloud-penetration-testing/SKILL.md) | 明确scope/ROE、账号边界与禁止生产客户数据，AWS资源枚举可作为评估计划起点；所有修改/提取示例必须逐动作限定授权，不能视为默认操作。 |
| 2 | [`aws-penetration-testing`](../08-security/aws-penetration-testing/SKILL.md) | IAM与AWS路径更细，但包含删除/收窄审计轨迹示例，与保留审计证据目标冲突；需先剔除这类步骤并限定隔离测试资源，不能整篇照跑。 |

<a id="engineering-availability-incident-response"></a>

## 组织可用性事故响应与服务恢复 · engineering-availability-incident-response

Coordinate an availability incident and restore service · 2026-11-15

检索任务：`线上可用性事故响应`、`服务中断应急响应`、`respond to availability incident`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`sre-incident-responder`](../02-engineering/sre-incident-responder/SKILL.md) | 按影响定级、IC/沟通/技术分工、立即止损、可观测排查和SLI恢复校验组织闭环，不依赖缺失的本地分类器。 |
| 2 | [`incident-commander-framework`](../02-engineering/incident-commander-framework/SKILL.md) | 指挥与沟通模板较全，但自动分类、时间线和PIR三个脚本及声明参考缺失；采用手工模板时仍需按组织权限与事故类型调整。 |

<a id="engineering-aws-cost-analysis"></a>

## 分析 AWS 账单并形成降本建议 · engineering-aws-cost-analysis

Analyze AWS spend and recommend cost reductions · 2026-11-15

检索任务：`分析AWS成本`、`AWS账单降本`、`analyze aws cost`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`aws-cost-optimizer`](../10-platform/aws-cost-optimizer/SKILL.md) | 直接从Cost Explorer与CloudWatch取支出/利用率并盘点闲置资源，明确删除与生产变更需逐项确认，适合AWS分析报告。 |
| 2 | [`cloud-cost-optimization`](../10-platform/cloud-cost-optimization/SKILL.md) | 适合还需多云标签、预算、定价和架构治理时，AWS账单取数流程较少；折扣量级与具体留存删除配置需另按实际核验。 |

<a id="engineering-backend-api-hardening"></a>

## 为后端 API 实施安全控制 · engineering-backend-api-hardening

Implement backend API security controls · 2026-11-15

检索任务：`后端API安全加固`、`接口安全控制实现`、`implement backend api security`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`backend-security-coder`](../08-security/backend-security-coder/SKILL.md) | 按输入、查询、会话、cookie/CSRF、权限、外部URL/超时和日志逐层实施，并要求自动/人工回归，适合已有后端补防护。 |
| 2 | [`api-security-best-practices`](../08-security/api-security-best-practices/SKILL.md) | 提供JWT、对象授权、参数化查询和限流代码实例；固定阈值须按环境调整，密码长度正文与示例不一致需先统一。 |

<a id="engineering-choose-zoom-surface"></a>

## 选择 Zoom 集成产品与 API 面 · engineering-choose-zoom-surface

Choose Zoom integration products and API surfaces · 2026-11-15

检索任务：`Zoom接口面选型`、`选择Zoom SDK`、`choose zoom integration surface`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`zoom-product-surface-selector`](../10-platform/zoom-product-surface-selector/SKILL.md) | 直接交付一条推荐路线、最小支撑件、被否方案与下一步，专门解决Meeting/Video/REST/MCP等构建面歧义。 |
| 2 | [`zoom-integration-planner`](../10-platform/zoom-integration-planner/SKILL.md) | 包含同样的接口面决策表，适合还需要认证scope、分阶段交付、风险与最小验证切片的完整实施计划。 |

<a id="engineering-chrome-mv3-extension"></a>

## 开发 Chrome Manifest V3 扩展 · engineering-chrome-mv3-extension

Build a Chrome Manifest V3 extension · 2026-11-15

检索任务：`开发Chrome扩展`、`Manifest V3扩展`、`build chrome mv3 extension`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`chrome-extension-mv3`](../02-engineering/chrome-extension-mv3/SKILL.md) | 聚焦三上下文边界、消息、权限、存储和加载调试，并指出 Worker 失活与 alarms 约束，适合 Chrome MV3 实现。 |
| 2 | [`browser-extension-builder`](../02-engineering/browser-extension-builder/SKILL.md) | 提供工程目录、弹窗/内容脚本/后台和商店检查，适合还需变现与发布规划时；Chrome 实现约束不如首选集中。 |

<a id="engineering-cloudflare-worker"></a>

## 实现 Cloudflare Worker 与存储绑定 · engineering-cloudflare-worker

Implement a Cloudflare Worker and storage bindings · 2026-11-15

检索任务：`部署Cloudflare Worker`、`Cloudflare Worker开发`、`implement cloudflare worker`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`cloudflare-workers-expert`](../02-engineering/cloudflare-workers-expert/SKILL.md) | 把配置、绑定、存储选型、处理器和部署观测列成完整顺序，适合新建 Worker；正文限额与性能数字仍需按目标账户核验。 |
| 2 | [`cloudflare-workers-edge`](../10-platform/cloudflare-workers-edge/SKILL.md) | 提供相同 Fetch/KV 与响应改写示例，适合已有 Worker 的简明参考；不增加平台运行验证证据。 |

<a id="engineering-cqrs-read-write"></a>

## 实现 CQRS 命令查询分离与读模型 · engineering-cqrs-read-write

Implement CQRS command/query separation and read models · 2026-11-15

检索任务：`实现CQRS`、`CQRS读写分离`、`implement cqrs read models`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`cqrs-implementation`](../02-engineering/cqrs-implementation/SKILL.md) | 集中命令/查询总线、投影checkpoint、读己之写与滞后SLA，适合将读写模型分离后实施和恢复验证。 |
| 2 | [`event-sourcing-cqrs`](../02-engineering/event-sourcing-cqrs/SKILL.md) | 同样覆盖命令和投影，但重点是事件事实、快照与版本；当读写分离还需事件历史回放时采用。 |

<a id="engineering-create-adr"></a>

## 编写架构决策记录并维护索引 · engineering-create-adr

Write an architecture decision record and index · 2026-11-15

检索任务：`编写ADR`、`架构决策记录`、`write architecture decision record`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`adr-management-patterns`](../02-engineering/adr-management-patterns/SKILL.md) | 模板、决策驱动因素、评审清单与取代治理集中在正文，适合主动编写正式 ADR；adr-tools 是可选自动化。 |
| 2 | [`adr-auto-capture`](../02-engineering/adr-auto-capture/SKILL.md) | 同样给出完整 ADR 模板和索引；更适合从正在进行的对话捕获决策，包含草稿批准与回读已有记录步骤。 |

<a id="engineering-dockerfile-optimization"></a>

## 优化 Dockerfile 镜像与构建缓存 · engineering-dockerfile-optimization

Optimize a Dockerfile image and build cache · 2026-11-15

检索任务：`优化Dockerfile`、`Docker镜像瘦身`、`optimize dockerfile`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`docker-expert`](../02-engineering/docker-expert/SKILL.md) | 包含环境勘察、沿用现有约定及构建/运行验证路径，不依赖缺失的本地分析器；示例 target、健康检查工具与基础镜像须按项目校正。 |
| 2 | [`docker-development-optimizer`](../02-engineering/docker-development-optimizer/SKILL.md) | 四类优化清单和多语言模板清楚，但强制校验引用的 scripts/dockerfile_analyzer.py 与 compose_validator.py 未随目录提供，补齐后使用该路径。 |
| 3 | [`docker-container-optimizer`](../10-platform/docker-container-optimizer/SKILL.md) | 提供同类构建缓存与多阶段决策，适合紧凑参考；同样缺少两份声明的校验脚本，不能按文中命令直接完成验收。 |

<a id="engineering-fix-reproducible-bug"></a>

## 定位并修复已有软件缺陷 · engineering-fix-reproducible-bug

Diagnose and fix an existing software defect · 2026-11-15

检索任务：`修复软件bug`、`定位bug根因`、`diagnose and fix bug`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`bug-hunter`](../02-engineering/bug-hunter/SKILL.md) | 从复现、证据到最小根因修复、原路径回归和新增用例闭环，并给出含变更文件的交付模板。 |
| 2 | [`systematic-debugger`](../02-engineering/systematic-debugger/SKILL.md) | 覆盖同样的证据假设循环，并有多语言断点、差分表和生产取证限制；补回归用例的要求不如首选集中。 |
| 3 | [`systematic-debugging-strategies`](../02-engineering/systematic-debugging-strategies/SKILL.md) | 同类调查步骤与 git bisect、内存和性能工具参考齐备，适合排查复杂症状；仍须自行补具体修复与防回归交付。 |

<a id="engineering-fp-ts-migration"></a>

## 将命令式 TypeScript 渐进重构为 fp-ts · engineering-fp-ts-migration

Incrementally refactor imperative TypeScript to fp-ts · 2026-11-15

检索任务：`迁移fp-ts`、`fp-ts重构`、`refactor imperative typescript to fp-ts`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`fp-ts-refactor`](../02-engineering/fp-ts-refactor/SKILL.md) | 逐步修改错误类型、函数签名、返回值与边界桥接，涵盖 Either/TaskEither/Reader 的模块化迁移与测试约束。 |
| 2 | [`fp-ts-pragmatic-guide`](../02-engineering/fp-ts-pragmatic-guide/SKILL.md) | 提供最小模式决策树与可读性回退边界，适合先改少数链式流程；大范围签名与调用方迁移策略较少。 |

<a id="engineering-github-ci-workflow"></a>

## 编写 GitHub Actions 测试构建流水线 · engineering-github-ci-workflow

Write a GitHub Actions test/build workflow · 2026-11-15

检索任务：`编写GitHub CI`、`GitHub Actions测试构建`、`write github actions ci`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`github-actions-author`](../10-platform/github-actions-author/SKILL.md) | 按触发器、runner、jobs、permissions、缓存和环境门禁组织YAML，并直接给测试/镜像/复用实例。 |
| 2 | [`ci-cd-pipeline-builder`](../02-engineering/ci-cd-pipeline-builder/SKILL.md) | 先检测真实脚本再产出跨平台基线的思路贴合起步CI，但stack_detector.py与pipeline_generator.py缺失，自动生成路径须补齐。 |

<a id="engineering-go-cancellable-pool"></a>

## 实现可取消的 Go Worker Pool · engineering-go-cancellable-pool

Implement a cancellable Go worker pool · 2026-11-15

检索任务：`Go可取消工作池`、`goroutine优雅关闭`、`implement cancellable go worker pool`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`golang-pro`](../02-engineering/golang-pro/SKILL.md) | 工作池示例把ctx.Done与jobs接收放在同一select，处理通道关闭和job错误，并要求race与基准；适合先交付基本可取消池。 |
| 2 | [`go-concurrency-patterns`](../02-engineering/go-concurrency-patterns/SKILL.md) | 给出更多pool/pipeline/errgroup策略，但pool示例的range接收和results发送未同时监听取消，与正文阻塞点要求不一致，须修正后使用。 |

<a id="engineering-go-chromium-automation"></a>

## 用 Go 实现 Chromium 页面提取与交互 · engineering-go-chromium-automation

Automate Chromium extraction and interaction in Go · 2026-11-15

检索任务：`Go浏览器页面提取`、`Go Chromium自动化`、`go chromium automation`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`go-rod-browser-automation`](../10-platform/go-rod-browser-automation/SKILL.md) | 对 Chromium 场景提供等待、返回error、超时、请求拦截、页面池和文件产物的直接示例；需按目标版本验证，未测反检测效果。 |
| 2 | [`go-playwright-automation`](../10-platform/go-playwright-automation/SKILL.md) | 适合已有 playwright-go 的项目，突出多Context会话隔离与日志；示例存在忽略error和未给出的SafeAction/BezierMouse，需补齐后使用。 |

<a id="engineering-grafana-operations-dashboard"></a>

## 生成 Grafana 运维看板配置 · engineering-grafana-operations-dashboard

Create Grafana operations dashboard configuration · 2026-11-15

检索任务：`生成Grafana运维看板`、`Grafana监控面板配置`、`create grafana operations dashboard`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`grafana-dashboards`](../02-engineering/grafana-dashboards/SKILL.md) | 明确从RED/USE到PromQL、模板变量、JSON和Provisioning的配置产物；示例面板/告警schema须对齐目标Grafana版本。 |
| 2 | [`observability-dashboard-builder`](../02-engineering/observability-dashboard-builder/SKILL.md) | 先检查现有schema并围绕排障问题设计最小看板，适合已有平台和查询数据；提供验收清单而非完整配置实例。 |
| 3 | [`observability-strategy-designer`](../02-engineering/observability-strategy-designer/SKILL.md) | 支持角色化看板并连接SLI/SLO体系，但依赖的dashboard_generator.py及样例输入缺失，须补齐才可运行生成路径。 |

<a id="engineering-legacy-framework-migration"></a>

## 渐进迁移遗留框架并保留旧行为 · engineering-legacy-framework-migration

Migrate a legacy framework while preserving behavior · 2026-11-15

检索任务：`遗留框架迁移`、`渐进迁移旧系统`、`migrate legacy framework`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`legacy-framework-modernizer`](../02-engineering/legacy-framework-modernizer/SKILL.md) | 先盘点版本差距、依赖与调用面，再用特征测试、绞杀切流和逐阶段验证/回滚表组织迁移，贴合框架迁移交付。 |
| 2 | [`legacy-codebase-modernizer`](../02-engineering/legacy-codebase-modernizer/SKILL.md) | 同样交付迁移计划、兼容层、回归套件和弃用表，适合更广的代码库现代化；强调将既有 bug 修正与迁移分开。 |

<a id="engineering-ports-adapters"></a>

## 建立后端端口与适配器架构 · engineering-ports-adapters

Build backend ports and adapters boundaries · 2026-11-15

检索任务：`端口适配器架构`、`六边形架构实现`、`implement ports and adapters`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`hexagonal-architecture`](../02-engineering/hexagonal-architecture/SKILL.md) | 从显式用例I/O、出站端口、适配器到组合根和分层测试逐步落地，并给渐进迁移与行为等价检查。 |
| 2 | [`backend-architecture-patterns`](../02-engineering/backend-architecture-patterns/SKILL.md) | 提供整洁/六边形/DDD 的取舍和目录及端口示例，适合尚未确定架构模式时；具体装配和测试边界较简略。 |

<a id="engineering-public-page-markdown"></a>

## 提取已知公开网页的干净正文 · engineering-public-page-markdown

Extract clean content from a known public webpage · 2026-11-15

检索任务：`提取网页正文`、`公开网页转Markdown`、`extract webpage main content`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`defuddle-web-extract`](../10-platform/defuddle-web-extract/SKILL.md) | 针对常规公开单页直接给出Markdown/JSON/元数据与落盘命令，不需托管API凭据；不适用强动态或登录页。 |
| 2 | [`firecrawl-web-scraper`](../10-platform/firecrawl-web-scraper/SKILL.md) | 适合动态渲染、交互后取正文或批量/整站任务，提供onlyMainContent与格式参数；需API Key、额度及返回完整性检查。 |
| 3 | [`tavily-web-research`](../10-platform/tavily-web-research/SKILL.md) | 已知URL列表可用extract取正文，并与后续搜索调研共用服务；单页清洗格式和交互控制较少。 |

<a id="engineering-public-web-research"></a>

## 检索公开网页并整理来源线索 · engineering-public-web-research

Search public webpages and collect source leads · 2026-11-15

检索任务：`公开网页资料检索`、`带来源网页调研`、`search public web sources`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`tavily-web-research`](../10-platform/tavily-web-research/SKILL.md) | 明确search/extract/crawl分工、时间/域名收敛与原始来源复核，适合问题驱动且需引用线索的调研；本轮未核验实时搜索效果。 |
| 2 | [`exa-semantic-search`](../10-platform/exa-semantic-search/SKILL.md) | 适合语义相近、类别或给定URL找相似资料；公开问题检索也可用，但正文对extract/crawl工作流覆盖较少。 |

<a id="engineering-rest-contract-review"></a>

## 评审 REST API 契约与一致性 · engineering-rest-contract-review

Review a REST API contract and consistency · 2026-11-15

检索任务：`评审REST接口`、`REST接口规范审查`、`review rest api contract`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`api-design-principles`](../02-engineering/api-design-principles/SKILL.md) | 资源、方法、错误、分页与版本规则及示例直接在正文，能够据现有规格进行静态契约评审，不依赖本地专用脚本。 |
| 2 | [`api-design-reviewer`](../02-engineering/api-design-reviewer/SKILL.md) | 更聚焦新旧 OpenAPI 对比与评分报告，但 CI 路径依赖的 api_linter.py、breaking_change_detector.py、api_scorecard.py 均缺失，补齐后才能完成该自动化交付。 |

<a id="engineering-review-code-diff"></a>

## 静态评审代码改动并给出证据化发现 · engineering-review-code-diff

Statically review a code diff with evidence · 2026-11-15

检索任务：`静态代码评审`、`评审代码改动`、`review code diff`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`code-reviewer`](../02-engineering/code-reviewer/SKILL.md) | 限定改动及直接调用契约，按文件行号、触发条件和具体改法给证据，允许无发现或标注待确认。 |
| 2 | [`adversarial-code-reviewer`](../02-engineering/adversarial-code-reviewer/SKILL.md) | 多角色清单适合作为补充挑刺视角；强制每角色至少一条且重复命中自动升级严重度，可能把假设推成发现，必须独立核实后采用。 |

<a id="engineering-secrets-backend"></a>

## 在 CI 或运行时接入密钥库与轮换 · engineering-secrets-backend

Integrate a secrets backend and rotation · 2026-11-15

检索任务：`接入密钥库`、`CI密钥管理`、`integrate secrets backend`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`secrets-management`](../08-security/secrets-management/SKILL.md) | 先梳理 owner、轮转要求与后端访问模型，再拉取、验证轮转和审计；示例仍是需补业务函数和权限配置的模板。 |
| 2 | [`secrets-manager`](../08-security/secrets-manager/SKILL.md) | 覆盖相同 Vault/云密钥库、External Secrets 和扫描注入路径，适合已有后端的配置参考；轮换骨架及 Terraform 敏感 state 仍需环境复核。 |

<a id="engineering-skill-install-security"></a>

## 安装前静态审查第三方 Agent 技能 · engineering-skill-install-security

Statically review a third-party Agent skill before installation · 2026-11-15

检索任务：`技能安装前安全审查`、`审查第三方技能安全`、`review skill before installation`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`agent-skill-security-scanner-v2`](../08-security/agent-skill-security-scanner-v2/SKILL.md) | 模式、行为、权限和误报研判已内联，使用现成 rg/读取即可完成报告，不依赖自动扫描器；结论仍是离线静态判断。 |
| 2 | [`agent-skill-security-scanner`](../08-security/agent-skill-security-scanner/SKILL.md) | 四维扫描、退出码和整改契约明确，但核心 scripts/skill_security_auditor.py 缺失，须补齐后采用自动扫描流程。 |

<a id="engineering-slo-budget"></a>

## 定义 SLI/SLO 与错误预算告警 · engineering-slo-budget

Define SLI/SLO and error-budget alerts · 2026-11-15

检索任务：`定义SLO错误预算`、`SLI SLO告警`、`define slo error budget`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`slo-sli-implementation`](../02-engineering/slo-sli-implementation/SKILL.md) | 围绕好事件比率、目标、预算与多窗口告警给出规则；剩余天数示例把分母燃尽率写成错误率乘积，可严重高估可用天数，须先修正公式并补齐记录规则，不能直接采用示例结果。 |
| 2 | [`observability-strategy-designer`](../02-engineering/observability-strategy-designer/SKILL.md) | 将SLO与服务画像、角色看板和告警治理衔接，适合体系规划；slo_designer.py及输入样例缺失，不能按命令完成生成。 |

<a id="engineering-static-skill-library-audit"></a>

## 静态审计技能库质量与重复 · engineering-static-skill-library-audit

Statically audit skill-library quality and overlap · 2026-11-15

检索任务：`静态审计技能库`、`技能库质量重复审计`、`static skill library audit`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`skill-ecosystem-auditor`](../08-security/skill-ecosystem-auditor/SKILL.md) | 针对整库逐项质量、安全、治理、依赖、成本与跨技能重复给出报告骨架，自动工具链缺失时正文明确允许手工等价审查；无会话记录也可开展静态任务。 |
| 2 | [`skill-optimizer`](../04-ai/skill-optimizer/SKILL.md) | 同样包含静态质检、冲突和Token诊断，但重心是会话触发、反应与完成证据；无会话数据时这些维度必须N/A，适合后续解释实际技能使用问题。 静态规则含固定frontmatter/篇幅/小节假设，须先适配目标Schema，不能把不同格式直接判为缺陷。 |

<a id="engineering-terraform-module"></a>

## 编写可复用 Terraform 模块 · engineering-terraform-module

Build a reusable Terraform module · 2026-11-15

检索任务：`编写Terraform模块`、`可复用Terraform模块`、`build reusable terraform module`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`terraform-module-builder`](../10-platform/terraform-module-builder/SKILL.md) | 直接规定变量/输出/版本/示例/测试目录与Terratest验收，贴合模块交付；示例CIDR正则只验形状，需改用实际CIDR解析校验。 |
| 2 | [`terraform-specialist`](../10-platform/terraform-specialist/SKILL.md) | 覆盖模块组合、远程state和固定plan审批，适合模块还需多环境运维时；模块接口和完整用例模板较少。 |

<a id="engineering-turborepo-cache"></a>

## 配置 Turborepo 任务与远程缓存 · engineering-turborepo-cache

Configure Turborepo tasks and remote caching · 2026-11-15

检索任务：`配置Turborepo缓存`、`Turborepo远程缓存`、`configure turborepo cache`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`turborepo-caching`](../02-engineering/turborepo-caching/SKILL.md) | 从 workspace 与根脚本到任务键、远程后端和冷/增量命中检查形成闭环；采用前核对目标 Turbo 版本的配置字段。 |
| 2 | [`turborepo-build-caching`](../02-engineering/turborepo-build-caching/SKILL.md) | 同样提供包级覆盖、filter 和 CI 示例，适合已有项目直接调整缓存；起步 workspace 与基线检查较少。 |

<a id="engineering-vexor-setup-search"></a>

## 配置 Vexor 并按语义定位文件 · engineering-vexor-setup-search

Configure Vexor and locate files semantically · 2026-11-15

检索任务：`配置Vexor语义检索`、`Vexor文件搜索`、`configure vexor semantic search`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`vexor-vector-cli-setup`](../10-platform/vexor-vector-cli-setup/SKILL.md) | 安装、嵌入提供方/本地模型、索引、搜索和Agent接入均内联，并明确远程片段外发的隐私边界。 |
| 2 | [`vexor-semantic-file-search`](../10-platform/vexor-semantic-file-search/SKILL.md) | 对已安装工具给出更细搜索模式、路径过滤和机读输出参考；初装转向未随目录提供的install-vexor参考，需要额外补齐。 |

<a id="engineering-visual-frontend-component"></a>

## 实现有明确视觉方向的前端组件 · engineering-visual-frontend-component

Implement a frontend component with a clear visual direction · 2026-11-15

检索任务：`设计前端视觉组件`、`美化UI组件`、`build visual frontend component`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`frontend-design`](../02-engineering/frontend-design/SKILL.md) | 从用户目标和约束确定视觉方向，直接交付框架适配的可运行代码，并列出对比度、焦点和键盘要求；不依赖专用生成服务。 |
| 2 | [`magic-ui-component-generator`](../02-engineering/magic-ui-component-generator/SKILL.md) | 适合先比较多个视觉方案再集成的组件任务；须具备 Magic MCP 或浏览器服务路径和相关依赖，且强制选择步骤增加交互前提。 |

<a id="engineering-wcag-aa-audit"></a>

## 审计 Web 无障碍并给出 WCAG AA 整改 · engineering-wcag-aa-audit

Audit Web accessibility and recommend WCAG AA remediation · 2026-11-15

检索任务：`WCAG无障碍审计`、`Web无障碍整改`、`audit web accessibility`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`wcag-22-audit-patterns`](../02-engineering/wcag-22-audit-patterns/SKILL.md) | 明确 WCAG2.2 准则、自动/人工核验、问题映射与复测留痕，适合网页 AA 审计；不能据此宣称法律合规。 |
| 2 | [`accessibility-wcag-audit`](../02-engineering/accessibility-wcag-audit/SKILL.md) | 同样给出扫描、键盘读屏与整改流程，并有组件/CI示例；示例扫描标签集中2.0/2.1，2.2目标需补核，自动补alt/label仍需人工语义审查。 |

<a id="engineering-zero-downtime-db-plan"></a>

## 规划零停机数据库结构迁移 · engineering-zero-downtime-db-plan

Plan a zero-downtime database schema migration · 2026-11-15

检索任务：`规划零停机数据库迁移`、`数据库Expand Contract迁移`、`plan zero downtime database migration`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`zero-downtime-migration-architect`](../02-engineering/zero-downtime-migration-architect/SKILL.md) | 风险、Expand-Contract、双写/CDC、回滚触发、预演与割接对账集中成计划；CI示例的两份脚本未随包，自动化校验需另备。 |
| 2 | [`database-migration-strategies`](../02-engineering/database-migration-strategies/SKILL.md) | 适合已有 ORM 的Schema演进与up/down脚本，包含双写回填切读阶段；跨库割接的持续同步与业务对账没有首选集中。 |

<a id="evidence-based-user-persona"></a>

## 从用户数据构建研究画像 · evidence-based-user-persona

Build a research persona from user data · 2026-11-15

检索任务：`数据驱动用户画像`、`客户证据画像`、`evidence based user persona`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`customer-research-synthesizer`](../05-business/customer-research-synthesizer/SKILL.md) | 逐素材原话、分段综合、置信度和完整画像模板均在正文，无必需生成脚本。 |
| 2 | [`buyer-persona-builder`](../05-business/buyer-persona-builder/SKILL.md) | 营销买家画像备选，有同类数据与原型规则；必跑 persona_generator.py 缺失，须补齐并接真实数据。 |
| 3 | [`ux-research-design-toolkit`](../06-creative/ux-research-design-toolkit/SKILL.md) | 同类画像可服务设计决策并接旅程与测试；必跑 scripts/persona_generator.py 缺失，须先补齐。 |

<a id="expression-grn-table"></a>

## 从表达矩阵生成调控网络表 · expression-grn-table

Generate a regulatory-network table from expression data · 2026-11-15

检索任务：`表达矩阵GRN表`、`Arboreto调控网络`、`expression grn table`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`arboreto-grn-inference`](../09-verticals/arboreto-grn-inference/SKILL.md) | 同推断阶段输入输出、可复现性、落盘产物与失败处理更明确，不代表因果或实验验证。 |
| 2 | [`arboreto-gene-regulatory-networks`](../09-verticals/arboreto-gene-regulatory-networks/SKILL.md) | 同工具网络表的模块化备选，明确上游预处理与下游调控子分析边界。 |

<a id="feature-prd-document"></a>

## 撰写功能 PRD 与验收标准 · feature-prd-document

Write a feature PRD and acceptance criteria · 2026-11-15

检索任务：`功能PRD`、`需求规格与验收`、`feature prd document`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`prd-spec-writer`](../07-productivity/prd-spec-writer/SKILL.md) | 完整章节、非目标、优先级、正负边界验收在正文，适合从想法到评审稿。 |
| 2 | [`product-manager-toolkit`](../07-productivity/product-manager-toolkit/SKILL.md) | 排序访谈后的PRD备选；所引 references/prd_templates.md 与 assets/prd_template.md 均未提供。 |

<a id="ga4-gtm-tracking-plan"></a>

## 设计 GA4/GTM 追踪计划 · ga4-gtm-tracking-plan

Design a GA4/GTM tracking plan · 2026-11-15

检索任务：`GA4埋点计划`、`GTM追踪审计`、`ga4 gtm tracking plan`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`marketing-analytics-tracker`](../05-business/marketing-analytics-tracker/SKILL.md) | 从决策反推事件，固定追踪表及无PII、无重复校验，边界清楚。 |
| 2 | [`analytics-tracking-setup`](../05-business/analytics-tracking-setup/SKILL.md) | 同类配置调试备选；平台额度、追溯和同意模式的具体声明须使用时核验。 |

<a id="gdpr-engineering-controls"></a>

## GDPR工程控制与同意管理 · gdpr-engineering-controls

Implement GDPR engineering controls · 2026-11-15

检索任务：`GDPR工程落地`、`GDPR同意管理`、`GDPR engineering controls`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`gdpr-data-handler`](../09-verticals/gdpr-data-handler/SKILL.md) | 正文给出同意审计、删除例外、最小化及通知骨架；法定规则和时限仍须当前辖区法务核验。 |
| 2 | [`gdpr-data-handling`](../08-security/gdpr-data-handling/SKILL.md) | 同类工程流程的短入口；完整代码分支引用未随包的implementation-playbook，补齐后采用，同样须法务核验。 |

<a id="hard-call-with-communication"></a>

## 推演艰难抉择并制定沟通方案 · hard-call-with-communication

Work through a hard decision and its communication · 2026-11-15

检索任务：`艰难抉择`、`艰难决定沟通`、`hard call`、`hard decision communication`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`hard-call-advisor`](../00-meta/hard-call-advisor/SKILL.md) | 六步覆盖可逆性、时间视角、外部 CEO 视角、相关者、预公告与通知顺序，直接交付决策及沟通计划。 |
| 2 | [`executive-adversarial-mentor`](../00-meta/executive-adversarial-mentor/SKILL.md) | hard-call 动作保留核心判断框架，但沟通对象、顺序和后续安排较简；还需其他高管挑战时采用。 |

<a id="humanize-chinese-prose"></a>

## 对中文文稿去 AI 腔并保留语域 · humanize-chinese-prose

Humanize Chinese prose while preserving register · 2026-11-15

检索任务：`中文去AI味`、`中文去 AI 味`、`中文文稿降痕`、`humanize Chinese text`、`Chinese prose cleanup`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`humanize-chinese-text`](../01-documents/humanize-chinese-text/SKILL.md) | 直接限定中文，优先定点改写并保留事实、术语、引用和学术语域；脚本缺失时可手动完成。 |
| 2 | [`avoid-ai-writing-patterns`](../01-documents/avoid-ai-writing-patterns/SKILL.md) | 中文等价清单与二次复检可作通用备选；特定学术或平台语域需补充目标约束。 |

<a id="ib-template-fill"></a>

## 投行 PPT 模板填充 · ib-template-fill

Populate an investment-banking template · 2026-11-15

检索任务：`投行模板填充`、`PPT模板填充`、`投行路演`、`pitch deck`、`pitch deck template`、`populate slides`、`季度数据刷新`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`ib-pitch-deck-builder`](../05-business/ib-pitch-deck-builder/SKILL.md) | 正文集中给出抽数、映射、排版、财务校验与有限修复循环；使用前核对演示与渲染工具。 |
| 2 | [`pitch-deck-refresh`](../05-business/pitch-deck-refresh/SKILL.md) | 同类英文详细流程；要求先读的四份 reference 文件未随目录提供，补齐后才可采用。 |

<a id="income-statement-yoy"></a>

## 利润表同比增长分析 · income-statement-yoy

Analyze income-statement year-over-year growth · 2026-11-15

检索任务：`利润表同比增长`、`利润表增速分析`、`income statement growth analysis`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`octagon-financial-metrics-analysis`](../09-verticals/octagon-financial-metrics-analysis/SKILL.md) | 按Ticker/周期输出收入、成本与各层利润同比，直接分析成本侵蚀和经营杠杆；需Octagon及凭据。 |
| 2 | [`octagon-income-statement-growth`](../09-verticals/octagon-income-statement-growth/SKILL.md) | 同任务的EPS聚焦变体，需要摊薄EPS/净利背离时更适合；两套示例字段并不证明接口完全相同。 |

<a id="internal-link-opportunity-plan"></a>

## 规划站内链接与锚文本 · internal-link-opportunity-plan

Plan internal links and anchor text · 2026-11-15

检索任务：`内链优化方案`、`站内链接机会`、`internal linking plan`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`internal-linking-optimizer`](../05-business/internal-linking-optimizer/SKILL.md) | 架构已定时交付来源位置、目标页、锚文本和优先级，含孤儿页与监测检查。 |
| 2 | [`seo-site-architecture`](../05-business/seo-site-architecture/SKILL.md) | 模式三交付同类内链方案；还需改URL和导航骨架时采用。 |

<a id="interview-question-scorecard"></a>

## 设计岗位面试题库与评分卡 · interview-question-scorecard

Design interview questions and a scorecard · 2026-11-15

检索任务：`岗位面试包`、`面试题库评分卡`、`interview questions scorecard`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`interview-plan-builder`](../05-business/interview-plan-builder/SKILL.md) | 岗位职级JD到胜任力、分工、题库追问、1–4量规及debrief完整自包含。 |
| 2 | [`hr-partner-pro`](../07-productivity/hr-partner-pro/SKILL.md) | 含候选人沟通和属地检查的通用HR备选；其1–5量规须与现有制度对齐。 |
| 3 | [`interview-system-designer`](../07-productivity/interview-system-designer/SKILL.md) | 需多轮loop与历史校准时采用；所需三个根目录Python脚本均缺失，先补齐。 |

<a id="lifecycle-email-flow"></a>

## 设计生命周期邮件序列 · lifecycle-email-flow

Design a lifecycle email sequence · 2026-11-15

检索任务：`生命周期邮件序列`、`欢迎培育邮件流`、`lifecycle email flow`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`email-sequence-designer`](../05-business/email-sequence-designer/SKILL.md) | 逐封稿、分支退出、再进入、抑制、流程图与平台映射完整，无必需本地评分脚本。 |
| 2 | [`lifecycle-email-sequence`](../05-business/lifecycle-email-sequence/SKILL.md) | 轻量欢迎培育召回备选，有完整草稿和主题变体，先备产品营销上下文。 |
| 3 | [`email-drip-sequence`](../05-business/email-drip-sequence/SKILL.md) | 同类备选；必跑 sequence_analyzer.py 缺失，补齐才可按正文完成评分。 |

<a id="multi-perspective-decision"></a>

## 对模糊决策做多视角权衡 · multi-perspective-decision

Weigh an ambiguous decision from multiple perspectives · 2026-11-15

检索任务：`多视角决策`、`多方权衡`、`second opinion decision`、`weigh decision options`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`four-voice-decision-council`](../00-meta/four-voice-decision-council/SKILL.md) | 独立初始立场、三个隔离声音与综合偏置护栏均有模板，适合一轮精简权衡。 宿主须能以干净上下文启动三个隔离子智能体，单会话角色扮演不能替代。 |
| 2 | [`boardroom-deliberation`](../00-meta/boardroom-deliberation/SKILL.md) | 需要 C 级角色投票、交叉质询和归档备忘录时采用；六阶段流程较重，须具备隔离角色调用能力。 |

<a id="new-hire-30-60-90-plan"></a>

## 制定新员工入职计划 · new-hire-30-60-90-plan

Create a new-hire onboarding plan · 2026-11-15

检索任务：`新员工入职计划`、`30 60 90入职`、`new hire onboarding plan`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`new-hire-onboarding-plan`](../07-productivity/new-hire-onboarding-plan/SKILL.md) | 五项明确输入到入职前、首日首周、30/60/90、联系人及权限表，交付直接。 |
| 2 | [`hr-partner-pro`](../07-productivity/hr-partner-pro/SKILL.md) | 需要入职计划连同HR政策、沟通草稿和度量交付时采用的宽入口。 |

<a id="organization-adoption-plan"></a>

## 制定组织变革采用计划 · organization-adoption-plan

Plan organizational change adoption · 2026-11-15

检索任务：`组织变革采用计划`、`ADKAR落地计划`、`organizational adoption plan`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`org-change-management-adkar`](../07-productivity/org-change-management-adkar/SKILL.md) | ADKAR诊断、知识传递选型、四类变革时序、沟通模板与采用判据完整。 |
| 2 | [`org-change-management`](../07-productivity/org-change-management/SKILL.md) | 同模型时间线备选，覆盖阻力话术、疲劳与变革自查。 |

<a id="paid-ad-copy"></a>

## 生成付费广告文案变体 · paid-ad-copy

Generate paid ad copy variants · 2026-11-15

检索任务：`付费广告文案`、`广告创意矩阵`、`paid ad copy variants`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`paid-ad-creative`](../05-business/paid-ad-creative/SKILL.md) | 按角度平台交付带字符数的上传矩阵，可消费用户给的数据；示例拉数CLI另备。 |
| 2 | [`ad-creative-generator`](../05-business/ad-creative-generator/SKILL.md) | 同类备选；强制 scripts/ad_copy_validator.py 未随目录提供，须补齐后使用。 |

<a id="plan-premortem-review"></a>

## 在投入前对计划做事前验尸 · plan-premortem-review

Run a premortem before committing resources · 2026-11-15

检索任务：`计划事前验尸`、`事前验尸`、`计划挑战`、`premortem plan`、`challenge this plan`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`premortem-plan-challenger`](../00-meta/premortem-plan-challenger/SKILL.md) | 直接交付假设评级、脆弱点地图、依赖链、可逆性与 30/60/90 天止损阀。 |
| 2 | [`executive-adversarial-mentor`](../00-meta/executive-adversarial-mentor/SKILL.md) | challenge 动作覆盖同一失败倒推与止损框架；还需董事会问答或复盘时采用这个总入口。 |

<a id="project-periodic-status-report"></a>

## 撰写项目周期状态报告 · project-periodic-status-report

Write a periodic project status report · 2026-11-15

检索任务：`项目状态周报`、`团队月度状态报告`、`periodic project status report`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`status-report-generator`](../07-productivity/status-report-generator/SKILL.md) | 项目周期KPI、成果、风险、决策及下期优先级表固定，省略无数据空节。 |
| 2 | [`stakeholder-update-writer`](../07-productivity/stakeholder-update-writer/SKILL.md) | 同类备选，适合同一进展改成高管、工程和跨职能多受众版本。 |

<a id="pytdc-dataset-benchmark"></a>

## 获取PyTDC数据集与标准划分 · pytdc-dataset-benchmark

Load PyTDC datasets and standard splits · 2026-11-15

检索任务：`PyTDC数据集基准`、`治疗学标准数据集`、`load PyTDC datasets`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`pytdc-therapeutics-datasets`](../09-verticals/pytdc-therapeutics-datasets/SKILL.md) | 区分数据、划分、评测与模型训练，适合作数据入口；需真实预测与当前库协议，本轮未跑基准。 |
| 2 | [`pytdc-therapeutics-data-commons`](../09-verticals/pytdc-therapeutics-data-commons/SKILL.md) | 补充缓存和格式转换；测试标签充当预测的示例占位必须替换，不能据其报告模型效果。 |

<a id="rdkit-library-profile"></a>

## 用 RDKit 分析化合物库 · rdkit-library-profile

Profile a compound library with RDKit · 2026-11-15

检索任务：`RDKit库画像`、`RDKit库筛选分析`、`rdkit library profile`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`rdkit-cheminformatics`](../09-verticals/rdkit-cheminformatics/SKILL.md) | 导入校验到标准化、属性表和导出形成闭环库工作流，不替代实验验证。 |
| 2 | [`cheminformatics-toolkit`](../09-verticals/cheminformatics-toolkit/SKILL.md) | 同类属性相似性产物的模块化备选，适合底层定制，批处理流程需按任务组装。 |

<a id="read-public-x-post"></a>

## 读取公开X单帖为结构化数据 · read-public-x-post

Read a public X post as structured data · 2026-11-15

检索任务：`公开推文转JSON`、`读取X单帖正文`、`read public X post JSON`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`x-post-to-json-fetcher`](../10-platform/x-post-to-json-fetcher/SKILL.md) | 当前正文以curl调用免认证ADHX入口读取单帖/长文，适合只有公开链接时；本轮未验证外部服务可用性。 |
| 2 | [`x-twitter-scraper-toolkit`](../10-platform/x-twitter-scraper-toolkit/SKILL.md) | 已有XQUIK_API_KEY时可用托管只读端点取单帖及指标；须核对配额，本组不授权发布、监控或写操作。 |

<a id="record-approved-high-risk-decision"></a>

## 登记已批准的高风险决策 · record-approved-high-risk-decision

Record an approved high-risk decision · 2026-11-15

检索任务：`登记高风险决策`、`登记已批准决策`、`保留决策异议`、`record approved decision`、`log high-risk decision`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`structured-decision-framework`](../00-meta/structured-decision-framework/SKILL.md) | 批准检查、成功/终止阈值、逐字异议、双层记录与 90 天复盘均在正文，适合登记可追溯结论。 |
| 2 | [`decision-log-recorder`](../07-productivity/decision-log-recorder/SKILL.md) | 需要跨会冲突、负责人和行动项治理时采用；手动记录流程自含，但 decision_tracker.py 未随目录提供。 |

<a id="remove-ai-prose-patterns"></a>

## 去除现有文稿的 AI 腔调 · remove-ai-prose-patterns

Remove AI-like patterns from an existing draft · 2026-11-15

检索任务：`去AI味`、`去 AI 味`、`去除AI腔`、`remove AI writing patterns`、`humanize a draft`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`avoid-ai-writing-patterns`](../01-documents/avoid-ai-writing-patterns/SKILL.md) | 21 类检查、保留原意的改写与强制二次复检均在正文，无需外部脚本即可完成通用去腔调。 |
| 2 | [`humanize-chinese-text`](../01-documents/humanize-chinese-text/SKILL.md) | 中文稿件可用最小改动、术语/引用保留与语域复核，有手动路径；仅适用中文。 |
| 3 | [`content-humanizer`](../01-documents/content-humanizer/SKILL.md) | 品牌声音重建时采用，先提供声音范例；评分脚本和两份引用清单未随包提供，不能声称完成其校验。 |

<a id="research-manuscript-writing"></a>

## 撰写与修订科研论文 · research-manuscript-writing

Write and revise a research manuscript · 2026-11-15

检索任务：`科研论文写作`、`研究手稿修订`、`research manuscript writing`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`scientific-manuscript-writing`](../09-verticals/scientific-manuscript-writing/SKILL.md) | 从目标期刊报告规范组织IMRAD、图表、引用和投稿声明，适合通用科研稿。 |
| 2 | [`academic-paper-writer`](../09-verticals/academic-paper-writer/SKILL.md) | 适合CS ML顶会章节与rebuttal，固定中文自审和英文LaTeX；评分只是模拟。 |

<a id="review-existing-interface-design"></a>

## 评审现有界面设计 · review-existing-interface-design

Review an existing interface design · 2026-11-15

检索任务：`评审现有界面`、`界面设计评审`、`设计稿反馈`、`review interface design`、`critique a mockup`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`design-critique`](../06-creative/design-critique/SKILL.md) | 先确认阶段和用户目标，再用五维检查给严重度、原因与替代方案；截图/Figma/描述均有自含流程。 |
| 2 | [`ux-ui-principles-audit`](../06-creative/ux-ui-principles-audit/SKILL.md) | 需要反模式、用户流或 AI 信任专项时采用；内联结构化规则可用，但完整 168/44 条原原则清单未列出。 |

<a id="rss-sentiment-briefing"></a>

## 生成多源科技新闻情感简报 · rss-sentiment-briefing

Create a multi-source technology news sentiment briefing · 2026-11-15

检索任务：`RSS情感简报`、`新闻情感简报`、`多源科技新闻简报`、`news sentiment briefing`、`RSS sentiment digest`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`rss-news-sentiment-engine`](../03-data/rss-news-sentiment-engine/SKILL.md) | 采集、同源去重、排序与核对流程自含，明确 JSON 字段和独立信源约束，便于结构化交付。 |
| 2 | [`news-sentiment-briefing`](../00-meta/news-sentiment-briefing/SKILL.md) | 相同六步可产出面向阅读的简报卡，偏研究语境；JSON 消费路径不如数据管道版明确。 |

<a id="saas-unit-economics-cohorts"></a>

## 分析订阅企业单位经济与队列 · saas-unit-economics-cohorts

Analyze subscription unit economics and cohorts · 2026-11-15

检索任务：`SaaS单位经济分析`、`订阅队列LTV CAC`、`subscription unit economics cohorts`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`unit-economics-analyzer`](../09-verticals/unit-economics-analyzer/SKILL.md) | 客户级输入、ARR桥、GRR NDR、队列矩阵与Excel固定产物清楚。 |
| 2 | [`cfo-financial-advisor`](../05-business/cfo-financial-advisor/SKILL.md) | 战略备选；要求运行的单位经济、burn、融资三个脚本均缺失，须补齐。 |

<a id="sales-weighted-forecast"></a>

## 编制销售管线加权预测 · sales-weighted-forecast

Build a weighted sales pipeline forecast · 2026-11-15

检索任务：`销售加权预测`、`管线预测commit`、`weighted sales pipeline forecast`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`sales-forecast-builder`](../05-business/sales-forecast-builder/SKILL.md) | 最小CRM字段到概率、三情景、commit upside、风险和配额缺口表，契约完整。 |
| 2 | [`cro-revenue-advisor`](../05-business/cro-revenue-advisor/SKILL.md) | B2B SaaS董事会营收预测备选；必跑forecast与churn两个脚本缺失。 |

<a id="select-production-llm-patterns"></a>

## 选择 LLM 应用模式与生产护栏 · select-production-llm-patterns

Select LLM application patterns and production guardrails · 2026-11-15

检索任务：`LLM应用模式选型`、`生产LLM模式`、`LLM架构决策矩阵`、`select LLM architecture pattern`、`production LLM patterns`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`llm-app-production-patterns`](../04-ai/llm-app-production-patterns/SKILL.md) | 决策矩阵将 RAG、函数调用、ReAct 和计划执行映射到任务，给有界循环及缓存/限流/回退骨架；重试示例异常过滤需补正。 |
| 2 | [`production-llm-app-builder`](../04-ai/production-llm-app-builder/SKILL.md) | 适合架构、检索、隐私与观测总览；具体模式选择和实现骨架须补充专门细节。 |

<a id="seo-periodic-performance-report"></a>

## 编写 SEO 周期绩效报告 · seo-periodic-performance-report

Write a periodic SEO performance report · 2026-11-15

检索任务：`SEO绩效月报`、`SEO GEO汇报`、`periodic seo performance report`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`seo-performance-reporter`](../05-business/seo-performance-reporter/SKILL.md) | SEO GEO专用指标、来源周期、品牌拆分和缺数据标记齐全，行动有负责人。 |
| 2 | [`marketing-performance-report`](../05-business/marketing-performance-report/SKILL.md) | 同类自然渠道报告备选，需连同其他营销渠道或预算QBR汇报时采用。 |

<a id="social-source-repurposing"></a>

## 把已有素材改编为多平台内容 · social-source-repurposing

Repurpose source material across platforms · 2026-11-15

检索任务：`多平台素材改编`、`文章改社媒内容`、`social source repurposing`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`social-media-content-creator`](../05-business/social-media-content-creator/SKILL.md) | 有完整平台改编、周月排期和指标流程，可在用户提供品牌上下文时完成，无额外必需技能。 |
| 2 | [`platform-native-content-engine`](../05-business/platform-native-content-engine/SKILL.md) | 适合真实素材与作者声音保真；正文要求的brand-voice未在现行库找到，须先补齐该前置或提供经确认的VOICE PROFILE。 |

<a id="startup-financial-scenarios"></a>

## 搭建初创财务与跑道情景模型 · startup-financial-scenarios

Build startup financial and runway scenarios · 2026-11-15

检索任务：`初创财务情景模型`、`创业现金跑道建模`、`startup financial scenarios`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`startup-financial-modeler`](../05-business/startup-financial-modeler/SKILL.md) | 队列收入、成本招聘现金融资输入较清楚；使用前须修正净烧钱写作收入减支出的跑道符号矛盾。 |
| 2 | [`cfo-financial-advisor`](../05-business/cfo-financial-advisor/SKILL.md) | 同类base bull bear战略模型备选；必跑burn、单位经济和融资脚本均缺失，先补齐。 |

<a id="stress-test-business-assumption"></a>

## 压力测试可证伪的商业假设 · stress-test-business-assumption

Stress-test a falsifiable business assumption · 2026-11-15

检索任务：`商业假设压力测试`、`假设压力测试`、`stress-test business assumption`、`business assumption test`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`business-assumption-stress-test`](../00-meta/business-assumption-stress-test/SKILL.md) | 围绕单条假设提供反证、定量/定性分流、下行情景、敏感度和三类对冲，报告模板完整。 |
| 2 | [`executive-adversarial-mentor`](../00-meta/executive-adversarial-mentor/SKILL.md) | stress-test 段能完成基本检验；还需计划挑战或艰难决策时可采用较宽的五动作入口。 |

<a id="stripe-subscription-integration"></a>

## 接入 Stripe 订阅支付 · stripe-subscription-integration

Integrate Stripe subscription payments · 2026-11-15

检索任务：`Stripe订阅接入`、`Stripe Checkout订阅`、`stripe subscription integration`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`stripe-integration`](../10-platform/stripe-integration/SKILL.md) | 覆盖Checkout、门户、Webhook验签和重试测试骨架；采用前须补并发安全的幂等认领/副作用处理和周期末降级排程，不能把分离的查标记/写标记或proration:none当作完整保证，并需适配当前SDK联调。 |
| 2 | [`digital-product-monetization`](../05-business/digital-product-monetization/SKILL.md) | Python接入连同套餐留存方案交付时采用；需补齐持久化幂等实现和支付联调。 |

<a id="technical-seo-health-audit"></a>

## 审计技术 SEO 健康度 · technical-seo-health-audit

Audit technical SEO health · 2026-11-15

检索任务：`技术SEO体检`、`抓取索引SEO检查`、`technical seo health audit`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`technical-seo-checker`](../05-business/technical-seo-checker/SKILL.md) | 基础设施九步证据报告，含迁移、批量URL及不可信页面内容边界。 |
| 2 | [`seo-audit`](../05-business/seo-audit/SKILL.md) | 同技术基础加页面、内容与权威诊断，适合根因尚不明的综合问题。 |

<a id="triage-inbound-ip-letter"></a>

## 分诊收到的知识产权律师函 · triage-inbound-ip-letter

Triage an incoming IP demand letter · 2026-11-15

检索任务：`收到停止侵权函`、`侵权来函分诊`、`triage incoming cease and desist`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`cease-and-desist-letter`](../09-verticals/cease-and-desist-letter/SKILL.md) | receive分支专门处理商标/版权主张、权利状态、回应选项和期限，保留律师复核与升级边界。 |
| 2 | [`inbound-demand-letter-triage`](../09-verticals/inbound-demand-letter-triage/SKILL.md) | 先抽来函字段、对事务台账和初步分流；不核验法律、不起草回复，深入IP判断另交律师。 |

<a id="vcf-quality-before-statistics"></a>

## 为 VCF 汇总统计做质量检查 · vcf-quality-before-statistics

Check VCF quality before summary statistics · 2026-11-15

检索任务：`VCF统计前质控`、`VCF过滤状态核查`、`vcf quality before statistics`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`vcf-variant-filtering`](../09-verticals/vcf-variant-filtering/SKILL.md) | 围绕既有过滤状态、原始文件保留及统计口径声明组织报告，阈值须按数据来源复核。 |
| 2 | [`bcftools-variant-manipulation`](../09-verticals/bcftools-variant-manipulation/SKILL.md) | 同过滤QC备选，需要同时规范化、合并或ID注释时更合适。 |

<a id="vendor-contract-redlines"></a>

## 供应商合同逐条红线审查 · vendor-contract-redlines

Review vendor contracts against a playbook · 2026-11-15

检索任务：`供应商合同红线审查`、`供应商协议审查`、`vendor contract redline review`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`vendor-agreement-redline-review`](../09-verticals/vendor-agreement-redline-review/SKILL.md) | 明确区分采购/销售方向、致命条款、双轴严重度和具名升级；需团队playbook及法务复核。 |
| 2 | [`contract-playbook-review`](../09-verticals/contract-playbook-review/SKILL.md) | 同样输出逐条偏离和可插入红线；更适合兼顾客户合同及通用谈判优先级，不替代律师批准。 |

<a id="website-conversion-copy"></a>

## 撰写网站转化营销文案 · website-conversion-copy

Write website conversion copy · 2026-11-15

检索任务：`网站转化文案`、`落地页营销文案`、`website conversion copy`

| 顺序 | 技能 | 推荐理由与条件 |
| --- | --- | --- |
| 1 | [`conversion-copywriter`](../05-business/conversion-copywriter/SKILL.md) | 输入、分页面结构、区块稿、关键注释与标题CTA备选均在正文。 |
| 2 | [`landing-page-copywriting`](../05-business/landing-page-copywriting/SKILL.md) | 同类成稿备选，标题角度更多；可选 headline_scorer.py 缺失，不能声称跑过评分。 |
| 3 | [`psychology-conversion-copy`](../05-business/psychology-conversion-copy/SKILL.md) | 适合需按认知和信任阻力定制的同类稿件，强调心理任务标注，页型结构需按任务补齐。 |
