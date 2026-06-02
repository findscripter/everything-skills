---
name: technical-reference-builder
title: 技术参考手册构建
description: 当需要把 API、配置项或数据 Schema 整理成穷尽、可检索、字段级精确的技术参考手册时使用；做参数/方法/配置项的逐条编目，含类型、默认值、约束、错误码、示例与交叉引用的权威参考文档产物；不适用于教程、长篇架构叙事或 README 速写。触发词：API 参考、参数手册、配置项文档、Schema 文档、错误码表、字段参考
domain: 文书/markdown
triggers: [编写 API 参考手册, 整理参数与配置项文档, 生成 Schema 字段参考, 罗列错误码与异常表, 做可检索的技术参考, 为每个方法补全签名与示例, 配置项默认值与取值范围文档]
tags: [技术文档, API参考, 参数手册, 配置文档, Schema, 文档工程, 技术写作]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Glob, Grep, Write]
requires: []
related: [openapi-doc-generator, docs-architect, readme-doc-writer, code-tutorial-engineer]
combines_with: [openapi-doc-generator, docs-architect]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当需要把一套接口、配置或数据结构整理成**穷尽、可检索、字段级精确**的技术参考手册时使用，目标是成为「单一事实来源」，让开发者用秒级而非分钟级查到答案。三类典型产物：

- **API 参考**：完整方法签名与全部参数、返回类型与取值、错误码与异常、速率限制与性能特征、鉴权要求。
- **配置指南**：每个可配置项、默认值与有效范围、环境差异、配置项间依赖、弃用项的迁移路径。
- **Schema 文档**：字段类型与约束、校验规则、关系与外键、索引及其性能影响、演进与版本化。

**不该用边界：**

- 任务是教程、入门引导或概念讲解（参考手册只答「是什么/怎么调」，不讲「为什么/怎么学」）。
- 需要的是长篇架构叙事或设计决策记录 —— 改用 `docs-architect`。
- 只需 README 速写、changelog 或一段内部备注。
- 缺少必需输入（接口清单、代码/规范访问权、目标读者）时先停下澄清，不要臆造字段。

## 步骤

参考构建流程（保留源 6 步法）：

1. **盘点（Inventory）**：编目所有对外接口/配置项/字段，确保零遗漏。
2. **抽取（Extraction）**：从代码、注释、规范中提取已有文档与签名。
3. **增强（Enhancement）**：为每个条目补充示例与上下文（含边界与错误用例）。
4. **校验（Validation）**：逐条对照真实实现核对类型、默认值、约束，验证准确性与完整性。
5. **组织（Organization）**：按字母序或逻辑分组排版，便于快速检索。
6. **交叉引用（Cross-Reference）**：链接相关条目与依赖关系。

## 指令

- **统一条目模板**，每个方法/参数/配置项都按同一结构出，缺项也保留字段以示「无」。
- 记录**行为而非实现**；同时给出 happy path 与错误/边界用例；示例必须可运行。
- 术语一致、为每项标注版本（Since / Deprecated），并把搜索关键词、别名显式写进文档以提召回。
- 组织成层级：概览 → 速查表（cheat sheet）→ 详细参考（字母序/逻辑分组）→ 进阶主题 → 附录（术语表、错误码、弃用清单）。
- 善用表格（参数表、兼容矩阵、状态码映射）与标注块：`Warning`（坑）/`Note`（要点）/`Tip`（最佳实践）/`Deprecated`（迁移指引）/`Security`（安全影响）。
- 主格式用 Markdown（标题层级清晰、代码高亮、表格、交叉引用链接）；需机读时附 JSON Schema / OpenAPI / 类型定义。
- 弃用项必须给迁移路径，破坏性变更给升级指南。

**标准条目格式（保留源约束）：**

```
### [Feature/Method/Parameter Name]

**Type**: [数据类型或签名]
**Default**: [默认值，如适用]
**Required**: [Yes/No]
**Since**: [引入版本]
**Deprecated**: [弃用版本，如适用]

**Description**: [用途与行为的完整描述]

**Parameters**:
- `paramName` (type): 说明 [约束]

**Returns**: [返回类型与说明]

**Throws**:
- `ExceptionType`: 触发条件

**Examples**: [覆盖不同用例的多个示例]

**See Also**:
- [相关条目]
```

## 示例

为一个 REST 端点写参考条目：

```markdown
### POST /v2/orders

**Type**: HTTP POST
**Required auth**: Bearer JWT（scope: `orders:write`）
**Since**: v2.0  **Rate limit**: 100 req/min/key

**Description**: 创建订单。幂等键通过 `Idempotency-Key` 头传入。

**Parameters**:
- `items` (array, required): 行项目，1–50 条
- `currency` (string): ISO 4217，默认 `CNY`

**Returns**: `201` + Order 对象；`409` 表示幂等键冲突

**Throws**:
- `422 ValidationError`：items 为空或超 50 条

**Examples**:
\`\`\`bash
curl -X POST .../v2/orders -H "Authorization: Bearer $T" \
  -d '{"items":[{"sku":"A1","qty":2}]}'
\`\`\`

**See Also**: `GET /v2/orders/{id}`、错误码附录
```

> 质量标线：每个对外接口都被文档化、对照实现验证过、格式与术语一致、含搜索关键词。

## 注意事项

- 产出不替代环境相关的验证、测试或专家评审；字段、默认值、约束须**对照真实实现**核对，杜绝杜撰。
- 仅在任务明确落入参考手册范围时使用；偏教程/架构叙事时移交对应技能。
- 缺少必需输入（接口清单、规范/代码访问权、目标读者、成功标准）或权限边界不明时，先停下询问澄清。
- 维护性优先：清晰的版本标注与更新追踪，避免文档与实现漂移。

## 互见

- related：`docs-architect` —— 需要长篇架构叙事 / 设计决策（讲「为什么」）时改用它，本技能专攻字段级「速查」。
- related：`openapi-doc-generator` —— 若参考对象是 REST/事件驱动 API，可用它产出 OpenAPI 3.1 规范与交互式门户，本技能负责把规范落成穷尽的人读参考。
- combines_with：飞书在线协作（`lark-doc`、`lark-wiki`）—— 将本地 Markdown 参考导入为云文档 / 知识库以便团队检索。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
