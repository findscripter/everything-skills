---
name: c4-architecture-docs
title: C4 模型架构文档自动生成
description: 当需要为已有代码仓库生成 C4（Context/Container/Component/Code）架构文档时使用；用自底向上分析产出分层 Markdown 文档与 OpenAPI 规格到 C4-Documentation/；不适用于全新设计、单纯画一张图或非软件系统建模；触发词：C4 模型、架构文档、Context/Container/Component/Code、系统上下文图、容器图、Mermaid C4
domain: 研发/architecture
triggers: [C4 模型, C4 架构文档, 架构文档生成, 系统上下文图, 容器图, Context Container Component Code, Mermaid C4 diagram, 为仓库生成架构图]
tags: [架构, 文档, C4-model, 代码分析, Mermaid, OpenAPI, 逆向工程]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [代码检索（codebase search / Glob / Grep）, Read, Write, Task（子代理编排，可选）, Mermaid, OpenAPI 3.1]
requires: []
related: [docs-architect, adr-management-patterns, codetour-walkthrough-builder, backend-architecture-patterns]
combines_with: [adr-auto-capture, docs-architect]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

为一个**已存在的代码仓库**反向生成完整的 C4 架构文档（自底向上）。C4 模型四层：Code（代码）→ Component（组件）→ Container（容器）→ Context（系统上下文）。

适用：
- 接手陌生代码库，需要系统化梳理结构、依赖、对外接口与部署形态。
- 给技术与非技术干系人同时提供可读的架构资料（上下文层面向人，容器层展示技术选型）。

**不该用（负边界）：**
- 全新系统的**正向设计**——本技能是从代码逆向生成文档，不替代设计决策。
- 只想画**一张图**或一次性示意——杀鸡用牛刀，直接写 Mermaid 即可。
- 非软件系统、纯业务流程或与架构无关的任务。

提示：按官方 C4 模型，多数团队只需 Context + Container 两层即可；本流程为完整性生成全部四层，可按需取舍。

## 步骤

自底向上、逐层合成，每层基于上一层产物。所有输出写入仓库根目录的 `C4-Documentation/`。

**Phase 1 · Code 层（自底向上）**
1. 检索全部子目录，按深度排序（最深优先），过滤 `node_modules / .git / build / dist` 等非代码目录。
2. 从最深目录开始，逐个分析并产出 `c4-code-<目录名>.md`（文件名做 sanitize：`/`→`-`、去特殊字符）。每个目录文档含四节：Overview（名称/描述/位置/语言/用途）、Code Elements（函数完整签名+参数类型+返回值+位置+依赖；类/模块同理）、Dependencies（内部/外部）、Relationships（关系复杂时附 Mermaid）。
3. 重复直到**每个子目录**都有对应 `c4-code-*.md`。

**Phase 2 · Component 层（合成）**
1. 汇总所有 `c4-code-*.md`，按领域/技术/团队边界识别逻辑组件。
2. 每个组件产出 `c4-component-<名>.md`：Overview / Purpose / Software Features / Code Elements（链接所含 code 文档）/ Interfaces（名称+协议 REST·GraphQL·gRPC·Events+操作签名）/ Dependencies / Component Diagram（Mermaid）。
3. 生成主索引 `c4-component.md`：列出全部组件 + 组件关系 Mermaid 图。

**Phase 3 · Container 层（合成）**
1. 搜索部署定义：Dockerfile、K8s manifest、docker-compose、Terraform/CloudFormation、Serverless、CI/CD。
2. 将组件映射到容器，产出 `c4-container.md`，每个容器含：Name/Description/Type/Technology/Deployment、Purpose、Components、Interfaces、Dependencies、Infrastructure（部署配置链接+伸缩策略+资源需求）、Container Diagram（Mermaid）。
3. 为每个容器 API 生成 **OpenAPI 3.1+** 规格，存到 `C4-Documentation/apis/<容器名>-api.yaml`（含端点+方法、请求/响应 schema、鉴权、错误响应）。

**Phase 4 · Context 层**
1. 收集 README、架构文档、需求/设计文档、测试文件、API 文档。
2. 产出 `c4-context.md`：System Overview（一句话+详述）、Personas（人类用户/程序化用户/外部系统：类型+目标+所用特性）、System Features、User Journeys（每个关键特性×角色的分步旅程，含集成旅程）、External Systems and Dependencies、System Context Diagram（用 Mermaid `C4Context` 记法）、Related Documentation。
3. 上下文文档须对**非技术干系人可读**，聚焦系统用途、用户与外部关系。

## 指令

可调配置（默认值）：
- `target_directory`：分析根目录（默认当前仓库根）
- `exclude_patterns`：排除模式（默认 node_modules、.git、build、dist 等）
- `output_directory`：输出目录（默认 `C4-Documentation/`）
- `include_tests`：是否分析测试文件辅助理解上下文（默认 true）
- `api_format`：API 规格格式（默认 openapi）

子代理编排（可选，按上述四层对应）：
```
Task subagent_type="c4-architecture::c4-code"      # Phase 1
Task subagent_type="c4-architecture::c4-component" # Phase 2
Task subagent_type="c4-architecture::c4-container" # Phase 3
Task subagent_type="c4-architecture::c4-context"   # Phase 4
```
无子代理环境时，由主代理顺序执行各层即可，产物结构不变。

最终目录结构：
```
C4-Documentation/
├── c4-code-*.md         # Code 层（每目录一份）
├── c4-component-*.md    # Component 层（每组件一份）
├── c4-component.md      # 组件主索引
├── c4-container.md      # Container 层
├── c4-context.md        # Context 层
└── apis/
    └── <容器>-api.yaml  # 每容器 OpenAPI 规格
```

## 示例

调用：
```bash
/c4-architecture:c4-architecture
```
执行效果：自底向上遍历所有子目录 → 为每目录生成 `c4-code-*.md` → 合成组件 → 映射容器并附 API 文档 → 生成含角色与用户旅程的系统上下文。全部写入 `C4-Documentation/`。

## 注意事项

- **自底向上**：先把最深目录的 code 文档做全，再向上合成；任一目录缺 code 文档就不进入合成。
- **增量合成**：每层严格基于下一层产物，不跳层臆造。
- **链接一致**：各文档相互正确链接，便于导航。
- **图用规范记法**：所有图用合规 Mermaid C4 记法；Context 用 `C4Context`。
- **API 必带规格**：容器对外 API 必须有 OpenAPI/Swagger 规格。
- 完成自检（部分）：每子目录有 code 文档且函数签名完整；组件边界清晰且都有接口文档；容器对应真实部署单元且 API 有规格；上下文覆盖全部人类与程序化角色、关键特性旅程、全部外部系统。
- 仅在任务确属"为已有代码库逆向生成 C4 文档"时使用；产物不替代环境内的验证、测试与专家评审；缺少必要输入、权限或成功标准时先停下来澄清。

## 互见

- C4 官方模型与图示：https://c4model.com/diagrams
- 可与"Mermaid 图表绘制""OpenAPI/接口文档"类技能配合，用于细化单图或单接口规格。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
