# 互见图谱 · Graph

> 本文件由 scripts/build-index.mjs 自动生成，请勿手改。

全库 **1108** 节点、**6843** 条互见边（含方向重复前的原始边）。

图例：`-->` 依赖(requires) · `-.-` 互见(related) · `===` 组合(combines_with)。

整库单图无法在 GitHub 上渲染，故拆成「卷级总览 + 按卷折叠」。机读全量见同目录 [`graph.json`](graph.json)。

## 卷级总览（跨卷最强互见）

无向边按跨卷计数取 Top 14；边上数字为边数。示例热点：平台–研发(81)、创意–研发(76)、商业–领域(70)、协作–商业(63)、数据–领域(58)…

```mermaid
graph LR
  通用
  文书
  研发
  数据
  智能
  商业
  创意
  协作
  安全
  领域
  平台
  平台 ---|81| 研发
  创意 ---|76| 研发
  商业 ---|70| 领域
  协作 ---|63| 商业
  数据 ---|58| 领域
  安全 ---|49| 研发
  协作 ---|44| 研发
  协作 ---|41| 通用
  平台 ---|39| 智能
  智能 ---|35| 通用
  安全 ---|33| 领域
  研发 ---|31| 通用
  协作 ---|28| 文书
  商业 ---|24| 研发
```

## 按卷展开（仅卷内边）

每卷最多展示度最高的 25 个节点及其诱导边；空卷跳过。

<details><summary>卷〇 · 通用（25 节点 / 84 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  premortem-plan-challenger["事前验尸式计划挑战"]
  business-assumption-stress-test["商业假设压力测试"]
  four-voice-decision-council["四声决策议会（结构化异议与权衡）"]
  executive-adversarial-mentor["高管对抗式思维伙伴"]
  entity-research-dossier["实体决策级调研档案（entity-research-d…"]
  fact-checking["事实核查"]
  multi-source-knowledge-synthesis["多源知识综合"]
  decision-navigator["分支提问引导决策导航"]
  first-principles-thinking["第一性原理思考"]
  structured-decision-framework["结构化决策框架"]
  boardroom-deliberation["C 级多角色董事会六阶段审议"]
  design-brainstorming["构思转设计的结构化头脑风暴"]
  first-principles-assumption-auditor["第一性原理假设审计"]
  hard-call-advisor["艰难抉择推演顾问"]
  idea-darwin-evolution["达尔文式创意进化"]
  agent-self-reflection["Agent 自我反思复盘"]
  closed-loop-delivery["验收标准闭环交付"]
  decision-cooldown-freeze["决策冷静期锁定"]
  kaizen-continuous-improvement["改善持续改进法（Kaizen）"]
  last-30-days-research["近 30 天研究：Reddit/X/Web 时效话题速成"]
  news-sentiment-briefing["多源新闻情感简报引擎"]
  notebooklm-source-grounded-qa["NotebookLM 源锚定问答"]
  query-decomposition-search["查询分解多源检索"]
  skill-router-interviewer["技能路由顾问：访谈式定位最合适的技能"]
  socratic-explainer["苏格拉底式启发讲解"]
  agent-self-reflection -.- executive-adversarial-mentor
  agent-self-reflection -.- premortem-plan-challenger
  agent-self-reflection -.- first-principles-assumption-auditor
  agent-self-reflection -.- business-assumption-stress-test
  agent-self-reflection === structured-decision-framework
  boardroom-deliberation -.- executive-adversarial-mentor
  boardroom-deliberation -.- premortem-plan-challenger
  boardroom-deliberation -.- business-assumption-stress-test
  boardroom-deliberation === premortem-plan-challenger
  boardroom-deliberation === entity-research-dossier
  business-assumption-stress-test -.- premortem-plan-challenger
  business-assumption-stress-test -.- first-principles-assumption-auditor
  business-assumption-stress-test -.- executive-adversarial-mentor
  closed-loop-delivery -.- structured-decision-framework
  decision-cooldown-freeze -.- hard-call-advisor
  decision-cooldown-freeze -.- structured-decision-framework
  decision-cooldown-freeze -.- decision-navigator
  decision-cooldown-freeze -.- premortem-plan-challenger
  decision-cooldown-freeze === four-voice-decision-council
  decision-navigator -.- design-brainstorming
  decision-navigator -.- first-principles-thinking
  decision-navigator -.- executive-adversarial-mentor
  decision-navigator === design-brainstorming
  design-brainstorming -.- first-principles-thinking
  design-brainstorming === premortem-plan-challenger
  entity-research-dossier -.- fact-checking
  entity-research-dossier -.- news-sentiment-briefing
  entity-research-dossier === fact-checking
  executive-adversarial-mentor -.- premortem-plan-challenger
  executive-adversarial-mentor -.- first-principles-assumption-auditor
  executive-adversarial-mentor === premortem-plan-challenger
  executive-adversarial-mentor === business-assumption-stress-test
  fact-checking -.- news-sentiment-briefing
  fact-checking -.- notebooklm-source-grounded-qa
  first-principles-assumption-auditor -.- first-principles-thinking
  first-principles-assumption-auditor -.- premortem-plan-challenger
  first-principles-assumption-auditor === business-assumption-stress-test
  first-principles-assumption-auditor === premortem-plan-challenger
  first-principles-thinking === business-assumption-stress-test
  first-principles-thinking === design-brainstorming
  four-voice-decision-council -.- boardroom-deliberation
  four-voice-decision-council -.- executive-adversarial-mentor
  four-voice-decision-council -.- premortem-plan-challenger
  four-voice-decision-council -.- decision-navigator
  four-voice-decision-council -.- first-principles-thinking
  four-voice-decision-council === premortem-plan-challenger
  four-voice-decision-council === business-assumption-stress-test
  four-voice-decision-council === entity-research-dossier
  hard-call-advisor -.- structured-decision-framework
  hard-call-advisor -.- four-voice-decision-council
  hard-call-advisor -.- premortem-plan-challenger
  hard-call-advisor -.- decision-navigator
  hard-call-advisor === boardroom-deliberation
  hard-call-advisor === executive-adversarial-mentor
  idea-darwin-evolution -.- design-brainstorming
  idea-darwin-evolution -.- first-principles-thinking
  idea-darwin-evolution -.- kaizen-continuous-improvement
  idea-darwin-evolution === business-assumption-stress-test
  idea-darwin-evolution === structured-decision-framework
  idea-darwin-evolution === premortem-plan-challenger
  kaizen-continuous-improvement -.- closed-loop-delivery
  kaizen-continuous-improvement -.- first-principles-thinking
  last-30-days-research -.- news-sentiment-briefing
  last-30-days-research -.- entity-research-dossier
  last-30-days-research -.- multi-source-knowledge-synthesis
  last-30-days-research -.- query-decomposition-search
  last-30-days-research === fact-checking
  multi-source-knowledge-synthesis -.- query-decomposition-search
  multi-source-knowledge-synthesis -.- fact-checking
  multi-source-knowledge-synthesis -.- notebooklm-source-grounded-qa
  multi-source-knowledge-synthesis === query-decomposition-search
  multi-source-knowledge-synthesis === news-sentiment-briefing
  news-sentiment-briefing === fact-checking
  notebooklm-source-grounded-qa -.- entity-research-dossier
  notebooklm-source-grounded-qa === fact-checking
  premortem-plan-challenger === business-assumption-stress-test
  query-decomposition-search === entity-research-dossier
  skill-router-interviewer -.- decision-navigator
  skill-router-interviewer === query-decomposition-search
  socratic-explainer === notebooklm-source-grounded-qa
  socratic-explainer === multi-source-knowledge-synthesis
  structured-decision-framework -.- four-voice-decision-council
  structured-decision-framework -.- premortem-plan-challenger
  structured-decision-framework === business-assumption-stress-test
```

</details>

<details><summary>卷一 · 文书（25 节点 / 73 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  docs-architect["代码库综合技术文档生成"]
  professional-proofreader["专业文稿校对"]
  markdown-to-docx["Markdown 转 Word"]
  doc-coauthoring["协作式文档共创工作流"]
  pdf-processing-toolkit["PDF 处理工具箱"]
  technical-reference-builder["技术参考手册构建"]
  pdf-form-filler["PDF 表单填写"]
  beautiful-prose-stylist["凝练有力散文写作风格契约"]
  code-tutorial-engineer["代码教程与教学内容编写"]
  avoid-ai-writing-patterns["识别并重写 AI 写作腔调"]
  content-humanizer["AI文本人性化改写"]
  openapi-doc-generator["OpenAPI 3.1 API 文档生成"]
  pptx-document-processing["PPTX 演示文稿处理"]
  readme-doc-writer["README 文档撰写"]
  wiki-to-vitepress-site["Wiki 转 VitePress：Markdown 转…"]
  codebase-to-prd["代码库逆向生成PRD"]
  humanize-chinese-text["中文 AI 味检测与降痕改写"]
  interactive-pdf-viewer["交互式 PDF 阅览"]
  python-pptx-deck-generator["python-pptx 幻灯片生成"]
  visa-doc-translate["签证申请材料双语翻译 PDF"]
  audio-to-markdown-transcriber["音频转写为结构化 Markdown 文档"]
  citation-management["研究写作引文系统化管理"]
  codetour-authoring["CodeTour 代码导览编写"]
  internal-comms["内部沟通文书撰写"]
  xlsx-spreadsheet-authoring["XLSX 表格制作：Excel 文件创建与格式化"]
  audio-to-markdown-transcriber -.- markdown-to-docx
  audio-to-markdown-transcriber === doc-coauthoring
  audio-to-markdown-transcriber === professional-proofreader
  avoid-ai-writing-patterns -.- humanize-chinese-text
  avoid-ai-writing-patterns -.- content-humanizer
  avoid-ai-writing-patterns -.- beautiful-prose-stylist
  avoid-ai-writing-patterns -.- professional-proofreader
  avoid-ai-writing-patterns === doc-coauthoring
  beautiful-prose-stylist -.- content-humanizer
  beautiful-prose-stylist -.- humanize-chinese-text
  beautiful-prose-stylist -.- professional-proofreader
  beautiful-prose-stylist === doc-coauthoring
  code-tutorial-engineer -.- docs-architect
  code-tutorial-engineer -.- technical-reference-builder
  code-tutorial-engineer -.- readme-doc-writer
  code-tutorial-engineer === docs-architect
  code-tutorial-engineer === openapi-doc-generator
  codebase-to-prd -.- docs-architect
  codebase-to-prd -.- technical-reference-builder
  codebase-to-prd === docs-architect
  codebase-to-prd === doc-coauthoring
  codetour-authoring -.- code-tutorial-engineer
  codetour-authoring -.- docs-architect
  codetour-authoring === docs-architect
  content-humanizer -.- humanize-chinese-text
  content-humanizer -.- professional-proofreader
  content-humanizer === doc-coauthoring
  doc-coauthoring -.- docs-architect
  doc-coauthoring -.- internal-comms
  doc-coauthoring -.- professional-proofreader
  doc-coauthoring === professional-proofreader
  docs-architect -.- technical-reference-builder
  docs-architect -.- readme-doc-writer
  docs-architect === openapi-doc-generator
  humanize-chinese-text -.- professional-proofreader
  interactive-pdf-viewer -.- pdf-form-filler
  interactive-pdf-viewer -.- pdf-processing-toolkit
  interactive-pdf-viewer -.- professional-proofreader
  interactive-pdf-viewer === pdf-form-filler
  internal-comms -.- professional-proofreader
  internal-comms === beautiful-prose-stylist
  markdown-to-docx -.- pdf-processing-toolkit
  markdown-to-docx -.- pptx-document-processing
  markdown-to-docx -.- professional-proofreader
  markdown-to-docx === docs-architect
  markdown-to-docx === doc-coauthoring
  openapi-doc-generator -.- technical-reference-builder
  openapi-doc-generator -.- docs-architect
  pdf-form-filler -.- pdf-processing-toolkit
  pdf-form-filler -.- markdown-to-docx
  pdf-form-filler === pdf-processing-toolkit
  pdf-processing-toolkit -.- pptx-document-processing
  pdf-processing-toolkit -.- professional-proofreader
  pdf-processing-toolkit === citation-management
  pptx-document-processing -.- python-pptx-deck-generator
  pptx-document-processing === python-pptx-deck-generator
  professional-proofreader === markdown-to-docx
  readme-doc-writer -.- technical-reference-builder
  readme-doc-writer === docs-architect
  technical-reference-builder === openapi-doc-generator
  technical-reference-builder === docs-architect
  visa-doc-translate -.- pdf-processing-toolkit
  visa-doc-translate -.- pdf-form-filler
  visa-doc-translate -.- markdown-to-docx
  visa-doc-translate === pdf-processing-toolkit
  wiki-to-vitepress-site -.- docs-architect
  wiki-to-vitepress-site -.- technical-reference-builder
  wiki-to-vitepress-site -.- readme-doc-writer
  wiki-to-vitepress-site -.- markdown-to-docx
  wiki-to-vitepress-site === docs-architect
  xlsx-spreadsheet-authoring -.- python-pptx-deck-generator
  xlsx-spreadsheet-authoring -.- pdf-form-filler
  xlsx-spreadsheet-authoring -.- markdown-to-docx
```

</details>

<details><summary>卷二 · 研发（25 节点 / 56 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  error-handling-patterns["健壮错误处理模式"]
  react-state-management["React 状态管理"]
  rest-api-endpoint-builder["生产级 REST API 端点构建"]
  typescript-advanced-types["TypeScript 高级类型系统"]
  ci-cd-pipeline-builder["CI/CD流水线生成"]
  microservices-patterns["微服务架构模式"]
  code-reviewer["代码审查"]
  shadcn-ui-components["shadcn/ui 组件库实践"]
  distributed-tracing["Jaeger/Tempo 分布式链路追踪"]
  playwright-e2e-testing["Playwright 端到端测试"]
  frontend-design["前端设计"]
  legacy-codebase-modernizer["遗留系统现代化重构"]
  test-coverage-gap-finder["测试覆盖率缺口分析"]
  webapp-testing["Web 应用测试（Playwright）"]
  clean-code-principles["整洁代码原则与重构"]
  code-simplifier["保持功能不变的代码简化"]
  event-sourcing-cqrs["事件溯源与 CQRS 架构"]
  fastapi-async-api["FastAPI 高性能异步 API"]
  performance-profiler["应用性能剖析（Node/Python/Go）"]
  tanstack-query["TanStack Query 异步状态管理"]
  trpc-typesafe-api["tRPC 端到端类型安全 API"]
  zod-schema-validation["Zod 类型安全数据校验"]
  async-python-patterns["Python 异步并发编程模式"]
  backend-architecture-patterns["后端架构模式（整洁/六边形/DDD）"]
  javascript-testing-patterns["JS/TS 测试策略"]
  async-python-patterns -.- fastapi-async-api
  async-python-patterns === error-handling-patterns
  clean-code-principles -.- code-simplifier
  clean-code-principles -.- code-reviewer
  clean-code-principles === legacy-codebase-modernizer
  clean-code-principles === code-reviewer
  clean-code-principles === test-coverage-gap-finder
  code-simplifier -.- code-reviewer
  code-simplifier === legacy-codebase-modernizer
  distributed-tracing -.- performance-profiler
  distributed-tracing === microservices-patterns
  error-handling-patterns === rest-api-endpoint-builder
  error-handling-patterns === distributed-tracing
  error-handling-patterns === microservices-patterns
  event-sourcing-cqrs -.- microservices-patterns
  event-sourcing-cqrs === distributed-tracing
  event-sourcing-cqrs === backend-architecture-patterns
  fastapi-async-api -.- rest-api-endpoint-builder
  fastapi-async-api === distributed-tracing
  frontend-design -.- webapp-testing
  frontend-design === webapp-testing
  javascript-testing-patterns -.- playwright-e2e-testing
  javascript-testing-patterns -.- test-coverage-gap-finder
  javascript-testing-patterns === playwright-e2e-testing
  javascript-testing-patterns === test-coverage-gap-finder
  legacy-codebase-modernizer -.- clean-code-principles
  legacy-codebase-modernizer -.- code-simplifier
  legacy-codebase-modernizer === test-coverage-gap-finder
  microservices-patterns -.- backend-architecture-patterns
  microservices-patterns === event-sourcing-cqrs
  playwright-e2e-testing -.- webapp-testing
  playwright-e2e-testing === ci-cd-pipeline-builder
  playwright-e2e-testing === test-coverage-gap-finder
  react-state-management -.- tanstack-query
  react-state-management -.- typescript-advanced-types
  react-state-management -.- frontend-design
  react-state-management === shadcn-ui-components
  react-state-management === zod-schema-validation
  shadcn-ui-components -.- react-state-management
  shadcn-ui-components === frontend-design
  tanstack-query -.- trpc-typesafe-api
  tanstack-query -.- zod-schema-validation
  tanstack-query === rest-api-endpoint-builder
  tanstack-query === typescript-advanced-types
  tanstack-query === shadcn-ui-components
  test-coverage-gap-finder -.- webapp-testing
  trpc-typesafe-api -.- zod-schema-validation
  trpc-typesafe-api -.- typescript-advanced-types
  trpc-typesafe-api -.- rest-api-endpoint-builder
  trpc-typesafe-api === zod-schema-validation
  trpc-typesafe-api === tanstack-query
  typescript-advanced-types -.- zod-schema-validation
  typescript-advanced-types === react-state-management
  typescript-advanced-types === shadcn-ui-components
  webapp-testing === code-reviewer
  zod-schema-validation === rest-api-endpoint-builder
```

</details>

<details><summary>卷三 · 数据（25 节点 / 104 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  data-pipeline-engineer["数据管道与流式架构工程"]
  matplotlib-visualization["Matplotlib 数据可视化"]
  polars-dataframe["Polars 高性能数据框"]
  sql-query-builder["SQL 查询构建"]
  csv-data-cleaner["CSV 数据清洗"]
  data-quality-frameworks["数据质量验证框架"]
  data-quality-validator["数据质量校验框架"]
  snowflake-development["Snowflake 数据开发"]
  dbt-transformation-modeler["dbt数据转换建模"]
  scikit-learn-ml["scikit-learn 机器学习"]
  airflow-dag-builder["Airflow 数据管道编排"]
  kpi-dashboard-design["KPI 仪表盘设计"]
  spark-job-optimization["Apache Spark 作业性能调优"]
  dataset-profiler["数据集探查画像"]
  dataset-quality-auditor["数据集质量审计"]
  dbt-transformation-patterns["dbt 数据转换建模与测试模式"]
  plotly-interactive-viz["Plotly 交互式可视化"]
  analysis-qa-validator["分析交付前质检"]
  dask-distributed-dataframes["Dask 超内存分布式计算"]
  data-question-analyzer["数据问题分析（从速查到正式报告）"]
  seaborn-statistical-charts["Seaborn 统计图表"]
  airflow-dag-patterns["Airflow DAG 生产实践模式"]
  clickhouse-analytics-io["ClickHouse 查询优化与分析"]
  html-dashboard-builder["交互式 HTML 仪表盘构建"]
  postgresql-optimization["PostgreSQL 性能优化"]
  airflow-dag-builder -.- airflow-dag-patterns
  airflow-dag-builder -.- data-pipeline-engineer
  airflow-dag-builder -.- dbt-transformation-modeler
  airflow-dag-builder -.- snowflake-development
  airflow-dag-builder === data-quality-frameworks
  airflow-dag-builder === dbt-transformation-modeler
  airflow-dag-builder === spark-job-optimization
  airflow-dag-patterns -.- data-pipeline-engineer
  airflow-dag-patterns -.- dbt-transformation-patterns
  airflow-dag-patterns -.- snowflake-development
  airflow-dag-patterns === data-quality-validator
  airflow-dag-patterns === dbt-transformation-patterns
  airflow-dag-patterns === spark-job-optimization
  analysis-qa-validator -.- data-quality-validator
  analysis-qa-validator -.- dataset-quality-auditor
  analysis-qa-validator -.- data-quality-frameworks
  analysis-qa-validator === dataset-profiler
  analysis-qa-validator === html-dashboard-builder
  clickhouse-analytics-io -.- postgresql-optimization
  clickhouse-analytics-io -.- sql-query-builder
  clickhouse-analytics-io === dbt-transformation-modeler
  clickhouse-analytics-io === data-pipeline-engineer
  clickhouse-analytics-io === html-dashboard-builder
  csv-data-cleaner -.- dataset-quality-auditor
  csv-data-cleaner -.- data-quality-validator
  csv-data-cleaner -.- polars-dataframe
  csv-data-cleaner -.- data-quality-frameworks
  csv-data-cleaner === polars-dataframe
  csv-data-cleaner === dataset-quality-auditor
  csv-data-cleaner === matplotlib-visualization
  dask-distributed-dataframes -.- polars-dataframe
  dask-distributed-dataframes -.- spark-job-optimization
  dask-distributed-dataframes -.- snowflake-development
  dask-distributed-dataframes === matplotlib-visualization
  dask-distributed-dataframes === scikit-learn-ml
  data-pipeline-engineer -.- dbt-transformation-modeler
  data-pipeline-engineer -.- snowflake-development
  data-pipeline-engineer -.- spark-job-optimization
  data-pipeline-engineer === airflow-dag-builder
  data-pipeline-engineer === data-quality-frameworks
  data-pipeline-engineer === dbt-transformation-modeler
  data-quality-frameworks -.- data-quality-validator
  data-quality-frameworks -.- dataset-quality-auditor
  data-quality-frameworks -.- dbt-transformation-modeler
  data-quality-frameworks -.- data-pipeline-engineer
  data-quality-frameworks === dbt-transformation-modeler
  data-quality-validator -.- dataset-quality-auditor
  data-quality-validator -.- dbt-transformation-patterns
  data-quality-validator === dbt-transformation-patterns
  data-quality-validator === data-pipeline-engineer
  data-question-analyzer -.- analysis-qa-validator
  data-question-analyzer -.- data-quality-validator
  data-question-analyzer -.- kpi-dashboard-design
  data-question-analyzer -.- sql-query-builder
  data-question-analyzer === html-dashboard-builder
  data-question-analyzer === matplotlib-visualization
  dataset-profiler -.- dataset-quality-auditor
  dataset-profiler -.- data-quality-validator
  dataset-profiler -.- analysis-qa-validator
  dataset-profiler -.- csv-data-cleaner
  dataset-profiler === csv-data-cleaner
  dataset-profiler === matplotlib-visualization
  dataset-quality-auditor === scikit-learn-ml
  dataset-quality-auditor === polars-dataframe
  dbt-transformation-modeler -.- dbt-transformation-patterns
  dbt-transformation-modeler -.- snowflake-development
  dbt-transformation-modeler -.- sql-query-builder
  dbt-transformation-modeler === snowflake-development
  dbt-transformation-patterns -.- snowflake-development
  dbt-transformation-patterns -.- data-pipeline-engineer
  dbt-transformation-patterns -.- sql-query-builder
  dbt-transformation-patterns === snowflake-development
  html-dashboard-builder -.- kpi-dashboard-design
  html-dashboard-builder -.- plotly-interactive-viz
  html-dashboard-builder === sql-query-builder
  html-dashboard-builder === kpi-dashboard-design
  kpi-dashboard-design -.- plotly-interactive-viz
  kpi-dashboard-design -.- matplotlib-visualization
  kpi-dashboard-design -.- sql-query-builder
  kpi-dashboard-design === sql-query-builder
  kpi-dashboard-design === plotly-interactive-viz
  matplotlib-visualization -.- seaborn-statistical-charts
  matplotlib-visualization -.- plotly-interactive-viz
  matplotlib-visualization === seaborn-statistical-charts
  matplotlib-visualization === polars-dataframe
  matplotlib-visualization === scikit-learn-ml
  plotly-interactive-viz -.- seaborn-statistical-charts
  plotly-interactive-viz === polars-dataframe
  polars-dataframe -.- spark-job-optimization
  polars-dataframe -.- scikit-learn-ml
  polars-dataframe === scikit-learn-ml
  postgresql-optimization -.- sql-query-builder
  postgresql-optimization === sql-query-builder
  scikit-learn-ml -.- matplotlib-visualization
  seaborn-statistical-charts === polars-dataframe
  seaborn-statistical-charts === scikit-learn-ml
  snowflake-development -.- sql-query-builder
  snowflake-development === airflow-dag-builder
  snowflake-development === data-quality-frameworks
  spark-job-optimization -.- airflow-dag-builder
  spark-job-optimization -.- snowflake-development
  spark-job-optimization === data-pipeline-engineer
  spark-job-optimization === data-quality-validator
  sql-query-builder === dbt-transformation-modeler
```

</details>

<details><summary>卷四 · 智能（25 节点 / 96 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  production-llm-app-builder["生产级 LLM 应用与 RAG 系统构建"]
  langfuse-llm-observability["Langfuse LLM 可观测"]
  rag-pipeline-builder["RAG 检索管道搭建"]
  langgraph-agent-framework["LangGraph 智能体编排"]
  embedding-model-strategies["嵌入模型选型与优化"]
  llm-model-router["测量驱动的 LLM 模型路由"]
  ai-engineering-toolkit["AI 工程工作流工具箱"]
  llm-judge-evaluation["LLM-as-Judge 高级评测"]
  multi-agent-system-designer["多智能体系统架构设计"]
  autonomous-coding-agent-patterns["自主编码智能体设计模式"]
  claude-api["Claude API 应用开发"]
  llm-agent-benchmarking["LLM 智能体测试与基准评测"]
  agent-tool-builder["AI 智能体工具设计与构建"]
  agent-tool-design["面向 Agent 的工具设计"]
  context-compression["智能体上下文压缩策略"]
  rag-implementation-workflow["RAG 检索增强实现"]
  mlops-model-productionizer["机器学习模型生产化与 MLOps"]
  llm-prompt-caching["LLM 提示词缓存策略"]
  local-llm-inference["本地 LLM 推理部署"]
  agent-memory-systems["AI 智能体记忆系统设计"]
  agent-workflow-pattern-designer["智能体工作流模式设计"]
  coding-agent-headtohead-eval["编码 Agent 对比评测（通过率/成本/耗时）"]
  context-window-management["LLM 上下文窗口管理策略"]
  llm-prompt-optimizer["LLM 提示词优化"]
  skill-optimizer["Agent 技能诊断与优化（Skill Optimiz…"]
  agent-memory-systems -.- embedding-model-strategies
  agent-memory-systems === rag-pipeline-builder
  agent-tool-builder -.- agent-tool-design
  agent-tool-builder -.- autonomous-coding-agent-patterns
  agent-tool-builder === langgraph-agent-framework
  agent-tool-builder === multi-agent-system-designer
  agent-tool-design -.- autonomous-coding-agent-patterns
  agent-tool-design -.- skill-optimizer
  agent-tool-design === multi-agent-system-designer
  agent-tool-design === langgraph-agent-framework
  agent-tool-design === agent-workflow-pattern-designer
  agent-workflow-pattern-designer -.- multi-agent-system-designer
  agent-workflow-pattern-designer -.- langgraph-agent-framework
  agent-workflow-pattern-designer === llm-agent-benchmarking
  agent-workflow-pattern-designer === context-compression
  ai-engineering-toolkit -.- llm-judge-evaluation
  ai-engineering-toolkit -.- llm-agent-benchmarking
  ai-engineering-toolkit -.- llm-prompt-optimizer
  ai-engineering-toolkit -.- production-llm-app-builder
  ai-engineering-toolkit === langfuse-llm-observability
  ai-engineering-toolkit === rag-implementation-workflow
  ai-engineering-toolkit === context-window-management
  autonomous-coding-agent-patterns -.- multi-agent-system-designer
  autonomous-coding-agent-patterns === langgraph-agent-framework
  autonomous-coding-agent-patterns === context-compression
  claude-api -.- llm-prompt-caching
  claude-api === llm-prompt-optimizer
  claude-api === context-window-management
  claude-api === langfuse-llm-observability
  coding-agent-headtohead-eval -.- llm-judge-evaluation
  coding-agent-headtohead-eval -.- llm-agent-benchmarking
  coding-agent-headtohead-eval -.- autonomous-coding-agent-patterns
  coding-agent-headtohead-eval -.- ai-engineering-toolkit
  coding-agent-headtohead-eval === llm-judge-evaluation
  coding-agent-headtohead-eval === llm-model-router
  context-compression -.- context-window-management
  context-compression -.- llm-prompt-caching
  context-compression -.- llm-prompt-optimizer
  context-compression -.- agent-memory-systems
  context-compression === production-llm-app-builder
  context-compression === langgraph-agent-framework
  context-compression === rag-pipeline-builder
  context-window-management -.- llm-prompt-caching
  context-window-management -.- llm-prompt-optimizer
  context-window-management -.- llm-model-router
  context-window-management === production-llm-app-builder
  context-window-management === rag-pipeline-builder
  embedding-model-strategies -.- rag-pipeline-builder
  embedding-model-strategies === rag-implementation-workflow
  embedding-model-strategies === production-llm-app-builder
  embedding-model-strategies === agent-memory-systems
  langfuse-llm-observability -.- llm-judge-evaluation
  langfuse-llm-observability -.- llm-agent-benchmarking
  langfuse-llm-observability -.- ai-engineering-toolkit
  langfuse-llm-observability -.- llm-model-router
  langfuse-llm-observability === production-llm-app-builder
  langfuse-llm-observability === langgraph-agent-framework
  langgraph-agent-framework -.- multi-agent-system-designer
  langgraph-agent-framework === agent-memory-systems
  llm-agent-benchmarking -.- llm-judge-evaluation
  llm-agent-benchmarking -.- skill-optimizer
  llm-agent-benchmarking === multi-agent-system-designer
  llm-agent-benchmarking === langgraph-agent-framework
  llm-agent-benchmarking === production-llm-app-builder
  llm-judge-evaluation -.- llm-prompt-optimizer
  llm-judge-evaluation === production-llm-app-builder
  llm-judge-evaluation === rag-implementation-workflow
  llm-model-router -.- claude-api
  llm-model-router -.- llm-prompt-caching
  llm-model-router -.- mlops-model-productionizer
  llm-model-router === langfuse-llm-observability
  llm-model-router === ai-engineering-toolkit
  llm-model-router === production-llm-app-builder
  llm-prompt-caching === production-llm-app-builder
  llm-prompt-caching === rag-pipeline-builder
  llm-prompt-caching === langfuse-llm-observability
  llm-prompt-optimizer -.- llm-prompt-caching
  llm-prompt-optimizer === llm-agent-benchmarking
  llm-prompt-optimizer === context-window-management
  local-llm-inference -.- llm-model-router
  local-llm-inference === embedding-model-strategies
  local-llm-inference === production-llm-app-builder
  local-llm-inference === mlops-model-productionizer
  mlops-model-productionizer -.- production-llm-app-builder
  mlops-model-productionizer === langfuse-llm-observability
  mlops-model-productionizer === llm-model-router
  production-llm-app-builder -.- rag-implementation-workflow
  production-llm-app-builder -.- rag-pipeline-builder
  production-llm-app-builder === multi-agent-system-designer
  rag-implementation-workflow -.- rag-pipeline-builder
  rag-implementation-workflow -.- embedding-model-strategies
  rag-implementation-workflow === langfuse-llm-observability
  rag-pipeline-builder === llm-judge-evaluation
  skill-optimizer -.- llm-prompt-optimizer
  skill-optimizer === llm-judge-evaluation
  skill-optimizer === langfuse-llm-observability
```

</details>

<details><summary>卷五 · 商业（25 节点 / 76 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  seo-content-writer["SEO 内容写作"]
  board-deck-builder["董事会与投资人汇报材料生成"]
  pricing-strategy["定价与套餐策略"]
  conversion-rate-optimizer["转化率优化分析"]
  content-strategy-planner["内容策略规划"]
  cfo-financial-advisor["CFO 财务顾问（单位经济与融资）"]
  competitive-analysis["竞品分析与市场定位"]
  schema-markup-builder["结构化数据 Schema 标记"]
  startup-financial-modeler["创业财务模型构建"]
  cro-revenue-advisor["CRO 营收增长顾问（B2B SaaS）"]
  seo-audit["SEO 技术审计"]
  variance-flux-commentary["财务差异（Flux）说明撰写"]
  conversion-copywriter["转化文案撰写"]
  landing-page-copywriting["落地页营销文案撰写"]
  product-marketing-gtm-strategy["产品营销定位与 GTM 策略"]
  sales-enablement["销售赋能物料制作"]
  cold-email-writer["B2B 冷启动邮件撰写"]
  customer-research-synthesizer["客户调研与洞察综合"]
  ma-playbook["并购策略手册（尽调与估值整合）"]
  social-media-content-creator["社媒内容创作与排期"]
  churn-prevention["流失预防与留存"]
  content-marketing-strategist["全渠道内容营销策略"]
  equity-earnings-update-report["股票财报点评报告撰写"]
  sales-prospecting["销售线索挖掘与筛选"]
  market-sizing-analyst["市场规模测算（TAM/SAM/SOM）"]
  board-deck-builder -.- cfo-financial-advisor
  board-deck-builder -.- startup-financial-modeler
  board-deck-builder === cfo-financial-advisor
  cfo-financial-advisor -.- startup-financial-modeler
  cfo-financial-advisor -.- cro-revenue-advisor
  cfo-financial-advisor === startup-financial-modeler
  cfo-financial-advisor === pricing-strategy
  cold-email-writer -.- sales-prospecting
  cold-email-writer -.- sales-enablement
  cold-email-writer === sales-prospecting
  cold-email-writer === sales-enablement
  competitive-analysis -.- market-sizing-analyst
  competitive-analysis -.- product-marketing-gtm-strategy
  competitive-analysis === market-sizing-analyst
  competitive-analysis === product-marketing-gtm-strategy
  competitive-analysis === pricing-strategy
  content-marketing-strategist -.- content-strategy-planner
  content-marketing-strategist -.- social-media-content-creator
  content-marketing-strategist === content-strategy-planner
  content-marketing-strategist === seo-content-writer
  content-marketing-strategist === social-media-content-creator
  content-strategy-planner -.- seo-content-writer
  content-strategy-planner === seo-content-writer
  content-strategy-planner === customer-research-synthesizer
  conversion-copywriter -.- landing-page-copywriting
  conversion-copywriter -.- conversion-rate-optimizer
  conversion-copywriter === conversion-rate-optimizer
  conversion-copywriter === landing-page-copywriting
  conversion-rate-optimizer -.- landing-page-copywriting
  conversion-rate-optimizer === landing-page-copywriting
  conversion-rate-optimizer === customer-research-synthesizer
  cro-revenue-advisor -.- pricing-strategy
  cro-revenue-advisor -.- sales-enablement
  cro-revenue-advisor === pricing-strategy
  cro-revenue-advisor === sales-enablement
  cro-revenue-advisor === board-deck-builder
  customer-research-synthesizer -.- competitive-analysis
  customer-research-synthesizer -.- content-strategy-planner
  customer-research-synthesizer -.- product-marketing-gtm-strategy
  customer-research-synthesizer -.- conversion-rate-optimizer
  customer-research-synthesizer === conversion-copywriter
  customer-research-synthesizer === product-marketing-gtm-strategy
  equity-earnings-update-report -.- variance-flux-commentary
  equity-earnings-update-report -.- board-deck-builder
  equity-earnings-update-report -.- market-sizing-analyst
  equity-earnings-update-report -.- competitive-analysis
  equity-earnings-update-report === board-deck-builder
  equity-earnings-update-report === pricing-strategy
  ma-playbook -.- cfo-financial-advisor
  ma-playbook -.- startup-financial-modeler
  ma-playbook -.- competitive-analysis
  ma-playbook -.- market-sizing-analyst
  ma-playbook === cfo-financial-advisor
  ma-playbook === startup-financial-modeler
  ma-playbook === board-deck-builder
  market-sizing-analyst -.- startup-financial-modeler
  market-sizing-analyst === startup-financial-modeler
  market-sizing-analyst === board-deck-builder
  pricing-strategy -.- cfo-financial-advisor
  product-marketing-gtm-strategy -.- sales-enablement
  product-marketing-gtm-strategy === sales-enablement
  sales-prospecting -.- cro-revenue-advisor
  sales-prospecting -.- sales-enablement
  sales-prospecting === sales-enablement
  schema-markup-builder -.- seo-audit
  schema-markup-builder === seo-audit
  seo-audit -.- seo-content-writer
  seo-audit === seo-content-writer
  seo-content-writer === schema-markup-builder
  social-media-content-creator === content-strategy-planner
  startup-financial-modeler === board-deck-builder
  variance-flux-commentary -.- cfo-financial-advisor
  variance-flux-commentary -.- board-deck-builder
  variance-flux-commentary -.- startup-financial-modeler
  variance-flux-commentary === board-deck-builder
  variance-flux-commentary === cfo-financial-advisor
```

</details>

<details><summary>卷六 · 创意（25 节点 / 73 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  ui-design-system-builder["UI 设计系统与设计令牌"]
  theme-factory["主题工厂：为内容产物套用配色与字体主题"]
  fal-ai-media-generation["fal.ai 多模态媒体生成（图像/视频/音频）"]
  high-end-visual-design["高端视觉界面设计"]
  demo-video-generator["产品演示视频生成"]
  algorithmic-art["算法艺术：用 p5.js 生成可探索的生成式艺术"]
  canvas-design["画布设计（Canvas Design）：用设计哲学驱动…"]
  design-critique["设计评审反馈"]
  magic-motion-animator["AI 动效动画生成"]
  minimax-media-cli["MiniMax 多模态生成 CLI"]
  brand-guidelines["品牌视觉规范（Anthropic）"]
  design-dev-handoff["设计开发交付规格"]
  design-spells-microinteractions["网页微交互与设计细节灵感"]
  glassmorphism-ui-design["玻璃拟态与空间感 UI 设计"]
  glsl-shader-programming["GLSL 着色器编程：写顶点/片元着色器与常见视觉特效"]
  slack-gif-creator["Slack 动图制作器（slack-gif-creat…"]
  stitch-design-system-taste["Stitch 设计品味：排版色彩布局动效系统生成"]
  ux-research-design-toolkit["UX 研究与体验设计工具箱"]
  ux-ui-principles-audit["UX/UI 原则评估与反模式检测"]
  animejs-web-animation["Anime.js 高性能网页动画"]
  iconsax-icon-library["Iconsax 图标库与生成"]
  industrial-brutalist-ui["工业野兽派遥测 UI"]
  minimalist-editorial-ui["极简编辑风界面设计"]
  stitch-iterative-build-loop["Stitch 迭代构建循环：自主接力式网站搭建"]
  videodb-perception-editing["VideoDB 视频感知索引与编辑"]
  algorithmic-art -.- glsl-shader-programming
  algorithmic-art -.- canvas-design
  algorithmic-art === theme-factory
  animejs-web-animation -.- design-spells-microinteractions
  animejs-web-animation -.- glassmorphism-ui-design
  brand-guidelines -.- theme-factory
  brand-guidelines -.- ui-design-system-builder
  brand-guidelines -.- canvas-design
  brand-guidelines === theme-factory
  canvas-design -.- theme-factory
  canvas-design -.- ui-design-system-builder
  canvas-design === brand-guidelines
  canvas-design === theme-factory
  demo-video-generator -.- videodb-perception-editing
  demo-video-generator -.- slack-gif-creator
  design-critique -.- ux-ui-principles-audit
  design-critique -.- design-dev-handoff
  design-critique -.- ui-design-system-builder
  design-critique === design-dev-handoff
  design-critique === ux-research-design-toolkit
  design-dev-handoff -.- ui-design-system-builder
  design-dev-handoff === ui-design-system-builder
  design-spells-microinteractions -.- glassmorphism-ui-design
  design-spells-microinteractions -.- ux-ui-principles-audit
  design-spells-microinteractions === animejs-web-animation
  fal-ai-media-generation -.- slack-gif-creator
  fal-ai-media-generation -.- algorithmic-art
  fal-ai-media-generation -.- demo-video-generator
  fal-ai-media-generation -.- videodb-perception-editing
  fal-ai-media-generation === demo-video-generator
  glassmorphism-ui-design === theme-factory
  high-end-visual-design -.- minimalist-editorial-ui
  high-end-visual-design -.- glassmorphism-ui-design
  high-end-visual-design -.- ui-design-system-builder
  high-end-visual-design -.- design-spells-microinteractions
  iconsax-icon-library -.- ui-design-system-builder
  iconsax-icon-library -.- high-end-visual-design
  iconsax-icon-library -.- theme-factory
  iconsax-icon-library === ui-design-system-builder
  iconsax-icon-library === design-dev-handoff
  industrial-brutalist-ui -.- high-end-visual-design
  industrial-brutalist-ui -.- minimalist-editorial-ui
  industrial-brutalist-ui -.- glassmorphism-ui-design
  industrial-brutalist-ui -.- ui-design-system-builder
  magic-motion-animator -.- animejs-web-animation
  magic-motion-animator -.- demo-video-generator
  magic-motion-animator -.- design-spells-microinteractions
  magic-motion-animator -.- fal-ai-media-generation
  magic-motion-animator === slack-gif-creator
  magic-motion-animator === theme-factory
  minimalist-editorial-ui -.- glassmorphism-ui-design
  minimalist-editorial-ui -.- ui-design-system-builder
  minimalist-editorial-ui === theme-factory
  minimax-media-cli -.- fal-ai-media-generation
  minimax-media-cli -.- demo-video-generator
  minimax-media-cli -.- magic-motion-animator
  minimax-media-cli -.- videodb-perception-editing
  minimax-media-cli === algorithmic-art
  slack-gif-creator -.- videodb-perception-editing
  slack-gif-creator === demo-video-generator
  stitch-design-system-taste -.- stitch-iterative-build-loop
  stitch-design-system-taste -.- ui-design-system-builder
  stitch-design-system-taste -.- high-end-visual-design
  stitch-design-system-taste === stitch-iterative-build-loop
  stitch-design-system-taste === theme-factory
  stitch-iterative-build-loop -.- high-end-visual-design
  stitch-iterative-build-loop === theme-factory
  theme-factory -.- ui-design-system-builder
  ui-design-system-builder === theme-factory
  ux-research-design-toolkit -.- ux-ui-principles-audit
  ux-research-design-toolkit === ux-ui-principles-audit
  ux-research-design-toolkit === ui-design-system-builder
  videodb-perception-editing === demo-video-generator
```

</details>

<details><summary>卷七 · 协作（25 节点 / 77 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  enterprise-project-manager["企业级项目组合管理"]
  agile-product-owner["敏捷产品负责人与待办管理"]
  company-culture-builder["公司文化构建与度量"]
  company-operating-system["公司运营系统框架（EOS/OKR）"]
  jira-expert["Jira 项目与工作流专家"]
  task-decomposition-planner["任务拆解与依赖编排"]
  status-report-generator["项目状态报告生成"]
  org-health-diagnostic["组织健康度跨职能诊断"]
  product-manager-toolkit["产品经理工具箱（RICE/PRD）"]
  coo-operations-advisor["COO 运营顾问（流程与 OKR 执行）"]
  hr-partner-pro["HR 招聘与人事管理"]
  org-change-management["组织变革管理ADKAR"]
  strategic-alignment-cascader["战略对齐自上而下级联"]
  company-culture-architect["公司文化体系构建"]
  company-policy-lookup["公司政策查询与白话解释"]
  multi-agent-orchestrator["多智能体任务编排器"]
  new-hire-onboarding-plan["新员工入职计划"]
  stakeholder-update-writer["干系人进展更新撰写"]
  business-process-mapper["业务流程绘制与瓶颈分析"]
  codebase-onboarding-doc["代码库上手文档生成"]
  decision-log-recorder["决策日志记录（两层记忆）"]
  ops-capacity-planner["运营产能与人力规划"]
  resource-capacity-planner["资源产能规划"]
  technical-change-tracker["技术变更记录与会话交接追踪"]
  activity-digest-generator["活动动态摘要生成"]
  activity-digest-generator -.- status-report-generator
  activity-digest-generator -.- stakeholder-update-writer
  activity-digest-generator === status-report-generator
  activity-digest-generator === stakeholder-update-writer
  agile-product-owner -.- product-manager-toolkit
  agile-product-owner -.- jira-expert
  agile-product-owner -.- task-decomposition-planner
  agile-product-owner === product-manager-toolkit
  agile-product-owner === jira-expert
  agile-product-owner === enterprise-project-manager
  business-process-mapper -.- coo-operations-advisor
  business-process-mapper -.- ops-capacity-planner
  business-process-mapper -.- company-operating-system
  business-process-mapper === coo-operations-advisor
  business-process-mapper === ops-capacity-planner
  company-culture-architect -.- company-culture-builder
  company-culture-architect -.- company-operating-system
  company-culture-architect -.- org-change-management
  company-culture-architect -.- hr-partner-pro
  company-culture-architect === company-operating-system
  company-culture-architect === org-change-management
  company-culture-architect === org-health-diagnostic
  company-culture-builder -.- company-operating-system
  company-culture-builder -.- org-health-diagnostic
  company-culture-builder -.- hr-partner-pro
  company-culture-builder === company-operating-system
  company-culture-builder === org-change-management
  company-culture-builder === org-health-diagnostic
  company-operating-system -.- coo-operations-advisor
  company-operating-system -.- strategic-alignment-cascader
  company-operating-system === coo-operations-advisor
  company-operating-system === strategic-alignment-cascader
  company-operating-system === org-health-diagnostic
  company-policy-lookup -.- hr-partner-pro
  company-policy-lookup -.- new-hire-onboarding-plan
  company-policy-lookup === hr-partner-pro
  company-policy-lookup === new-hire-onboarding-plan
  coo-operations-advisor -.- ops-capacity-planner
  coo-operations-advisor -.- strategic-alignment-cascader
  coo-operations-advisor === ops-capacity-planner
  decision-log-recorder -.- stakeholder-update-writer
  decision-log-recorder === status-report-generator
  enterprise-project-manager -.- agile-product-owner
  enterprise-project-manager -.- jira-expert
  enterprise-project-manager -.- task-decomposition-planner
  enterprise-project-manager === jira-expert
  enterprise-project-manager === product-manager-toolkit
  hr-partner-pro -.- org-change-management
  hr-partner-pro === company-culture-builder
  multi-agent-orchestrator -.- task-decomposition-planner
  multi-agent-orchestrator === task-decomposition-planner
  new-hire-onboarding-plan -.- hr-partner-pro
  new-hire-onboarding-plan -.- codebase-onboarding-doc
  new-hire-onboarding-plan === codebase-onboarding-doc
  new-hire-onboarding-plan === company-culture-architect
  ops-capacity-planner -.- company-operating-system
  ops-capacity-planner -.- enterprise-project-manager
  org-change-management -.- company-culture-builder
  org-change-management === org-health-diagnostic
  org-health-diagnostic -.- company-operating-system
  product-manager-toolkit -.- enterprise-project-manager
  product-manager-toolkit === jira-expert
  resource-capacity-planner -.- ops-capacity-planner
  resource-capacity-planner -.- enterprise-project-manager
  resource-capacity-planner -.- task-decomposition-planner
  resource-capacity-planner -.- agile-product-owner
  resource-capacity-planner === enterprise-project-manager
  resource-capacity-planner === status-report-generator
  stakeholder-update-writer -.- status-report-generator
  stakeholder-update-writer === status-report-generator
  stakeholder-update-writer === task-decomposition-planner
  stakeholder-update-writer === enterprise-project-manager
  status-report-generator -.- enterprise-project-manager
  strategic-alignment-cascader -.- org-health-diagnostic
  strategic-alignment-cascader === coo-operations-advisor
  strategic-alignment-cascader === org-change-management
  task-decomposition-planner === agile-product-owner
```

</details>

<details><summary>卷八 · 安全（25 节点 / 68 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  penetration-testing-methodology["渗透测试全生命周期"]
  security-audit-toolkit["安全审计与威胁建模工具箱"]
  false-positive-check["漏洞误报核验"]
  red-team-recon["红队侦察方法论"]
  burp-suite-testing["Burp Suite Web 安全测试"]
  dependency-auditor["依赖与供应链审计"]
  api-fuzzing-bug-bounty["REST/GraphQL API 模糊测试与漏洞挖掘"]
  compliance-readiness-review["多框架合规就绪审查（compliance-readin…"]
  wireshark-traffic-analysis["Wireshark 流量分析"]
  codeql-scanner["CodeQL 数据流漏洞扫描"]
  insecure-defaults-detector["不安全默认配置检测"]
  sast-configurator["SAST静态扫描配置"]
  security-incident-response["安全事件分级与响应"]
  binary-analysis-patterns["二进制逆向与汇编分析模式"]
  c-cpp-security-review["C/C++ 内存安全审查"]
  stride-threat-modeler["STRIDE威胁建模"]
  vulnerability-variant-analysis["漏洞变体横向排查"]
  yara-rule-authoring["YARA-X 恶意软件检测规则编写"]
  agent-skill-security-scanner["AI 技能安装前安全扫描"]
  ai-system-security-audit["AI 系统安全评估（注入/越狱）"]
  backend-security-coder["后端安全编码与 API 防护"]
  broken-authentication-testing["认证与会话漏洞检测利用"]
  cloud-misconfig-auditor["云基础设施安全审计"]
  cloud-penetration-testing["多云基础设施渗透测试"]
  soc2-compliance-preparer["SOC 2 审计准备与控制矩阵"]
  agent-skill-security-scanner -.- dependency-auditor
  agent-skill-security-scanner === dependency-auditor
  agent-skill-security-scanner === false-positive-check
  ai-system-security-audit -.- stride-threat-modeler
  ai-system-security-audit -.- security-audit-toolkit
  ai-system-security-audit === stride-threat-modeler
  api-fuzzing-bug-bounty -.- broken-authentication-testing
  api-fuzzing-bug-bounty -.- burp-suite-testing
  api-fuzzing-bug-bounty === burp-suite-testing
  api-fuzzing-bug-bounty === red-team-recon
  backend-security-coder -.- insecure-defaults-detector
  backend-security-coder === sast-configurator
  backend-security-coder === codeql-scanner
  binary-analysis-patterns -.- yara-rule-authoring
  binary-analysis-patterns === yara-rule-authoring
  broken-authentication-testing -.- burp-suite-testing
  broken-authentication-testing === burp-suite-testing
  broken-authentication-testing === penetration-testing-methodology
  burp-suite-testing === red-team-recon
  c-cpp-security-review -.- binary-analysis-patterns
  c-cpp-security-review -.- codeql-scanner
  c-cpp-security-review === codeql-scanner
  c-cpp-security-review === vulnerability-variant-analysis
  c-cpp-security-review === false-positive-check
  cloud-misconfig-auditor -.- cloud-penetration-testing
  cloud-penetration-testing -.- penetration-testing-methodology
  cloud-penetration-testing === red-team-recon
  cloud-penetration-testing === cloud-misconfig-auditor
  cloud-penetration-testing === penetration-testing-methodology
  codeql-scanner -.- sast-configurator
  codeql-scanner -.- vulnerability-variant-analysis
  codeql-scanner === false-positive-check
  codeql-scanner === vulnerability-variant-analysis
  codeql-scanner === sast-configurator
  compliance-readiness-review -.- soc2-compliance-preparer
  compliance-readiness-review === soc2-compliance-preparer
  compliance-readiness-review === security-audit-toolkit
  dependency-auditor -.- sast-configurator
  dependency-auditor === false-positive-check
  false-positive-check -.- vulnerability-variant-analysis
  false-positive-check -.- codeql-scanner
  false-positive-check -.- security-audit-toolkit
  false-positive-check === vulnerability-variant-analysis
  false-positive-check === security-audit-toolkit
  insecure-defaults-detector -.- sast-configurator
  insecure-defaults-detector === codeql-scanner
  insecure-defaults-detector === false-positive-check
  insecure-defaults-detector === vulnerability-variant-analysis
  penetration-testing-methodology -.- red-team-recon
  penetration-testing-methodology === red-team-recon
  penetration-testing-methodology === burp-suite-testing
  penetration-testing-methodology === security-audit-toolkit
  red-team-recon -.- cloud-penetration-testing
  sast-configurator === dependency-auditor
  security-audit-toolkit -.- stride-threat-modeler
  security-audit-toolkit -.- penetration-testing-methodology
  security-audit-toolkit === stride-threat-modeler
  security-audit-toolkit === security-incident-response
  security-incident-response -.- wireshark-traffic-analysis
  security-incident-response -.- yara-rule-authoring
  security-incident-response -.- security-audit-toolkit
  security-incident-response === wireshark-traffic-analysis
  soc2-compliance-preparer === security-audit-toolkit
  stride-threat-modeler -.- false-positive-check
  stride-threat-modeler === dependency-auditor
  vulnerability-variant-analysis -.- c-cpp-security-review
  wireshark-traffic-analysis === penetration-testing-methodology
  yara-rule-authoring === security-incident-response
```

</details>

<details><summary>卷九 · 领域专精（25 节点 / 61 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  octagon-equity-research-analyst["股票研究分析编排"]
  gene-set-enrichment-analysis["通路与基因集富集分析"]
  single-cell-rnaseq-analysis["单细胞 RNA-seq 分析（Scanpy）"]
  general-counsel-advisor["总法律顾问（合同/IP/条款）"]
  scientific-database-lookup["科研数据库 API 查询"]
  cheminformatics-toolkit["化学信息学工具箱（RDKit）"]
  portfolio-risk-metrics["投资组合风险指标计算"]
  genomic-file-toolkit["基因组文件处理（BAM/VCF/FASTQ）"]
  gget-genomic-databases["gget 统一基因组数据库接口"]
  uniprot-protein-database["UniProt 蛋白序列与注释数据库"]
  dcf-valuation-model["DCF 现金流折现估值模型"]
  gatk-variant-calling["GATK 种系变异检测最佳实践（HaplotypeCa…"]
  octagon-financial-health-scores["财务健康评分（Z-Score / Piotroski）"]
  legal-risk-classifier["法律风险分级评估"]
  alpha-vantage-market-data["Alpha Vantage 全球金融数据接入"]
  diligence-issue-extractor["尽职调查问题提取"]
  octagon-stock-quote["实时股票报价"]
  portfolio-rebalancer["投资组合再平衡"]
  contract-playbook-review["合同对照评审红线"]
  odoo-module-developer["Odoo 自定义模块开发"]
  pubchem-compound-search["PubChem 化合物检索"]
  legal-hold-manager["诉讼证据保全通知管理"]
  litigation-chronology-builder["案件事实时间线构建"]
  guided-statistical-analysis["统计分析与检验选择"]
  opentargets-database["Open Targets 靶点-疾病关联查询"]
  alpha-vantage-market-data -.- scientific-database-lookup
  alpha-vantage-market-data -.- portfolio-risk-metrics
  alpha-vantage-market-data === portfolio-risk-metrics
  alpha-vantage-market-data === dcf-valuation-model
  cheminformatics-toolkit -.- scientific-database-lookup
  cheminformatics-toolkit === scientific-database-lookup
  contract-playbook-review -.- legal-risk-classifier
  contract-playbook-review -.- general-counsel-advisor
  contract-playbook-review === legal-risk-classifier
  diligence-issue-extractor -.- litigation-chronology-builder
  diligence-issue-extractor -.- general-counsel-advisor
  diligence-issue-extractor === general-counsel-advisor
  gatk-variant-calling -.- genomic-file-toolkit
  gene-set-enrichment-analysis -.- single-cell-rnaseq-analysis
  gene-set-enrichment-analysis -.- genomic-file-toolkit
  gene-set-enrichment-analysis -.- scientific-database-lookup
  gene-set-enrichment-analysis === single-cell-rnaseq-analysis
  gene-set-enrichment-analysis === scientific-database-lookup
  genomic-file-toolkit -.- single-cell-rnaseq-analysis
  genomic-file-toolkit === gene-set-enrichment-analysis
  gget-genomic-databases -.- uniprot-protein-database
  gget-genomic-databases -.- scientific-database-lookup
  gget-genomic-databases -.- opentargets-database
  gget-genomic-databases === uniprot-protein-database
  gget-genomic-databases === gene-set-enrichment-analysis
  gget-genomic-databases === single-cell-rnaseq-analysis
  legal-hold-manager -.- litigation-chronology-builder
  legal-hold-manager -.- diligence-issue-extractor
  legal-hold-manager === litigation-chronology-builder
  legal-risk-classifier -.- diligence-issue-extractor
  legal-risk-classifier -.- general-counsel-advisor
  legal-risk-classifier === diligence-issue-extractor
  octagon-equity-research-analyst -.- dcf-valuation-model
  octagon-equity-research-analyst -.- alpha-vantage-market-data
  octagon-equity-research-analyst -.- portfolio-risk-metrics
  octagon-equity-research-analyst === dcf-valuation-model
  octagon-equity-research-analyst === alpha-vantage-market-data
  octagon-financial-health-scores -.- alpha-vantage-market-data
  octagon-financial-health-scores -.- dcf-valuation-model
  octagon-financial-health-scores -.- portfolio-risk-metrics
  octagon-financial-health-scores === dcf-valuation-model
  octagon-financial-health-scores === alpha-vantage-market-data
  octagon-stock-quote -.- alpha-vantage-market-data
  octagon-stock-quote -.- octagon-financial-health-scores
  octagon-stock-quote -.- octagon-equity-research-analyst
  octagon-stock-quote -.- dcf-valuation-model
  octagon-stock-quote === octagon-financial-health-scores
  octagon-stock-quote === dcf-valuation-model
  octagon-stock-quote === portfolio-risk-metrics
  opentargets-database -.- uniprot-protein-database
  opentargets-database === uniprot-protein-database
  opentargets-database === gene-set-enrichment-analysis
  portfolio-rebalancer -.- portfolio-risk-metrics
  portfolio-rebalancer === portfolio-risk-metrics
  pubchem-compound-search -.- cheminformatics-toolkit
  pubchem-compound-search -.- scientific-database-lookup
  pubchem-compound-search === cheminformatics-toolkit
  scientific-database-lookup -.- genomic-file-toolkit
  scientific-database-lookup === alpha-vantage-market-data
  single-cell-rnaseq-analysis -.- scientific-database-lookup
  uniprot-protein-database -.- scientific-database-lookup
```

</details>

<details><summary>卷十 · 平台集成（25 节点 / 71 边）（已截断：仅保留度最高的 25 个节点及其诱导边）</summary>

```mermaid
graph LR
  terraform-specialist["Terraform 基础设施即代码"]
  browser-automation-builder["浏览器自动化与抓取"]
  zoom-oauth-setup["Zoom 认证与 OAuth 实现"]
  zoom-meeting-app-builder["Zoom 会议嵌入应用开发（Meeting SDK）"]
  zoom-product-surface-selector["Zoom 构建面选型与权衡"]
  zoom-webhooks-setup["Zoom Webhooks 事件订阅与校验"]
  aws-serverless-architect["AWS无服务器架构设计"]
  firecrawl-web-scraper["Firecrawl 网页抓取"]
  azure-cloud-architect["Azure 云架构设计"]
  zoom-integration-planner["Zoom 集成方案规划（架构/认证/里程碑）"]
  apify-ecommerce-scraper["Apify 电商数据抓取"]
  cloud-cost-optimization["云成本优化"]
  twilio-communications["Twilio 短信与语音通信集成"]
  zoom-phone-integration["Zoom Phone 集成（呼叫/事件/API）"]
  defuddle-web-extract["Defuddle 网页正文提取为 Markdown"]
  gcp-cloud-run["GCP Cloud Run 无服务器"]
  mcp-builder["MCP 服务器构建"]
  multi-cloud-architecture["多云架构决策框架"]
  zoom-meeting-bot-builder["Zoom 会议机器人 / 实时媒体工作流"]
  agentphone-voice-sms-agents["AI 电话与短信代理（AgentPhone）"]
  ai-native-cli-design["面向 AI 智能体的 CLI 设计规范"]
  aws-cost-optimizer["AWS 成本分析与优化建议"]
  aws-serverless-builder["AWS 无服务器应用构建"]
  exa-semantic-search["Exa 语义搜索研究"]
  gcp-cloud-architect["GCP 云架构设计"]
  agentphone-voice-sms-agents -.- twilio-communications
  agentphone-voice-sms-agents -.- zoom-phone-integration
  agentphone-voice-sms-agents === twilio-communications
  ai-native-cli-design -.- mcp-builder
  ai-native-cli-design === mcp-builder
  apify-ecommerce-scraper -.- firecrawl-web-scraper
  apify-ecommerce-scraper -.- browser-automation-builder
  apify-ecommerce-scraper -.- defuddle-web-extract
  apify-ecommerce-scraper -.- exa-semantic-search
  apify-ecommerce-scraper === browser-automation-builder
  aws-cost-optimizer -.- cloud-cost-optimization
  aws-cost-optimizer -.- multi-cloud-architecture
  aws-cost-optimizer -.- aws-serverless-architect
  aws-cost-optimizer -.- terraform-specialist
  aws-cost-optimizer === aws-serverless-architect
  aws-cost-optimizer === terraform-specialist
  aws-cost-optimizer === cloud-cost-optimization
  aws-serverless-architect -.- aws-serverless-builder
  aws-serverless-architect -.- gcp-cloud-architect
  aws-serverless-architect -.- azure-cloud-architect
  aws-serverless-architect === terraform-specialist
  aws-serverless-builder -.- gcp-cloud-run
  aws-serverless-builder === aws-serverless-architect
  aws-serverless-builder === terraform-specialist
  azure-cloud-architect -.- gcp-cloud-architect
  azure-cloud-architect -.- multi-cloud-architecture
  azure-cloud-architect === terraform-specialist
  azure-cloud-architect === cloud-cost-optimization
  browser-automation-builder -.- firecrawl-web-scraper
  browser-automation-builder -.- defuddle-web-extract
  cloud-cost-optimization -.- multi-cloud-architecture
  cloud-cost-optimization -.- terraform-specialist
  cloud-cost-optimization === multi-cloud-architecture
  cloud-cost-optimization === terraform-specialist
  defuddle-web-extract -.- firecrawl-web-scraper
  defuddle-web-extract -.- exa-semantic-search
  defuddle-web-extract === exa-semantic-search
  exa-semantic-search -.- firecrawl-web-scraper
  gcp-cloud-architect -.- gcp-cloud-run
  gcp-cloud-architect -.- multi-cloud-architecture
  gcp-cloud-architect === terraform-specialist
  gcp-cloud-architect === cloud-cost-optimization
  gcp-cloud-run === terraform-specialist
  multi-cloud-architecture -.- aws-serverless-architect
  multi-cloud-architecture === terraform-specialist
  zoom-integration-planner -.- zoom-product-surface-selector
  zoom-integration-planner -.- zoom-oauth-setup
  zoom-integration-planner -.- zoom-meeting-app-builder
  zoom-integration-planner === zoom-product-surface-selector
  zoom-integration-planner === zoom-oauth-setup
  zoom-meeting-app-builder -.- zoom-meeting-bot-builder
  zoom-meeting-app-builder -.- zoom-product-surface-selector
  zoom-meeting-app-builder -.- zoom-oauth-setup
  zoom-meeting-app-builder === zoom-integration-planner
  zoom-meeting-app-builder === zoom-webhooks-setup
  zoom-meeting-bot-builder -.- zoom-product-surface-selector
  zoom-meeting-bot-builder === zoom-oauth-setup
  zoom-meeting-bot-builder === zoom-webhooks-setup
  zoom-oauth-setup -.- zoom-webhooks-setup
  zoom-oauth-setup -.- zoom-product-surface-selector
  zoom-oauth-setup === zoom-meeting-app-builder
  zoom-oauth-setup === zoom-webhooks-setup
  zoom-phone-integration -.- zoom-webhooks-setup
  zoom-phone-integration -.- zoom-oauth-setup
  zoom-phone-integration -.- zoom-meeting-app-builder
  zoom-phone-integration === zoom-oauth-setup
  zoom-phone-integration === zoom-webhooks-setup
  zoom-phone-integration === zoom-product-surface-selector
  zoom-product-surface-selector === zoom-meeting-app-builder
  zoom-webhooks-setup -.- zoom-integration-planner
  zoom-webhooks-setup -.- zoom-product-surface-selector
```

</details>

