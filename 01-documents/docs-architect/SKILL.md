---
name: docs-architect
title: 代码库综合技术文档生成
description: 当需要从现有代码库产出长篇技术手册或架构文档时使用；分析架构、设计模式与实现细节，生成分章节、含图表说明、带代码引用的综合技术文档；不适用于单文件注释、README 速写或 API 参考自动抽取。触发词：架构文档、技术手册、代码库文档、onboarding 文档、设计决策记录。
domain: 文书/markdown
triggers: [生成架构文档, 为代码库写技术手册, 整理系统设计文档, 新人 onboarding 文档, 记录设计决策与权衡, 长篇技术参考文档]
tags: [技术文档, 架构, 代码库分析, 文档工程, onboarding]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Glob, Grep, Write]
requires: []
related: [technical-reference-builder, readme-doc-writer, code-tutorial-engineer, codebase-onboarding-doc]
combines_with: [codebase-to-prd, openapi-doc-generator]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当需要把一个**现有代码库**提炼成长篇、权威的技术参考文档时使用，典型产物为 10–100+ 页的技术手册、架构白皮书或电子书，既讲「是什么（what）」也讲「为什么（why）」。适用场景：

- 为新人 onboarding、架构评审、长期维护沉淀系统级文档。
- 需要梳理系统边界、核心组件、数据流、集成点与设计决策的来龙去脉。
- 需要分受众（开发、架构师、运维）提供阅读路径。

**不该用边界：**

- 任务与代码库文档无关，或属于其他领域/工具范畴。
- 只需单文件注释、README 速写、changelog 或自动抽取的 API 参考——本技能是「长篇综合」而非「片段速记」。
- 缺少必要输入（代码访问权限、目标受众、成功标准）时，先停下来澄清，不要凭空臆造。

## 步骤

1. **发现（Discovery）**：分析代码库结构与依赖，识别关键组件及其关系，提取设计模式与架构决策，绘制数据流与集成点。
2. **结构化（Structuring）**：建立逻辑化的章节层级，设计「渐进式复杂度披露」（先全局后细节），规划图表与可视化，统一术语表。
3. **写作（Writing）**：从执行摘要与总览起笔，由高层架构逐步下沉到实现细节，对每个设计决策给出 rationale（为什么这么选），并配带充分解释的代码示例。

## 指令

- 先澄清目标、约束与必需输入，再动笔。
- 套用相关最佳实践，并验证产出是否自洽、可导航。
- 给出可执行步骤与验证方式；若需要详尽样例，打开 `resources/implementation-playbook.md`。
- 始终解释设计决策背后的「为什么」，用代码库中的**真实例子**而非杜撰。
- 同时记录当前状态与演进历史，附上排错指南与常见坑。
- 为不同受众（developers / architects / operations）提供独立阅读路径。

**建议包含的关键章节：**

1. 执行摘要（一页，面向干系人）
2. 架构总览（系统边界、关键组件、交互）
3. 设计决策（架构取舍的 rationale）
4. 核心组件（逐个模块/服务深入）
5. 数据模型（Schema 设计与数据流）
6. 集成点（API、事件、外部依赖）
7. 部署架构（基础设施与运维考量）
8. 性能特征（瓶颈、优化、基准）
9. 安全模型（认证、授权、数据保护）
10. 附录（术语表、参考、详细规格）

**输出格式约束（保留源约束）：** 使用 Markdown，要求清晰的标题层级；代码块带语法高亮；结构化数据用表格；列表用项目符号；重要提示用引用块（blockquote）；指向源码的链接统一用 `file_path:line_number` 格式。

## 示例

为一个微服务后端生成文档时的骨架：

```markdown
# 订单系统技术手册

## 1. 执行摘要
（一页：系统做什么、为谁服务、核心能力）

## 2. 架构总览
（系统边界 + 组件交互图，文字详述）

## 4. 核心组件
### 4.1 OrderService
- 职责：……
- 关键实现见 `src/order/service.go:42`
- 设计取舍：为什么采用 Saga 而非两阶段提交……
```

> 提示：每个「设计决策」都要回答「为什么不是另一种方案」，这是综合技术文档区别于普通 README 的关键。

## 注意事项

- 仅在任务明确落入上述范围时使用本技能。
- 产出不能替代环境相关的验证、测试或专家评审。
- 若缺少必需输入、权限、安全边界或成功标准，停下来询问澄清。
- 图表（架构图、时序图、流程图）即使无法直接绘制，也要用文字详细描述到可据此还原的程度。

## 互见

- README / API 参考类轻量文档需求：改用更聚焦的速写型技能或文档生成器。
- 涉及飞书在线协作产物时，可结合 `lark-doc`、`lark-wiki` 将本地 Markdown 导入为云文档。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
