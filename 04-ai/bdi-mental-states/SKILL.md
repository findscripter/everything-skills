---
name: bdi-mental-states
title: BDI 智能体信念-愿望-意图建模
description: 当需要把外部 RDF 上下文转成智能体心智状态、为 LLM 智能体补充可解释的认知结构时使用；用 BDI 本体（信念/愿望/意图）建模认知链并产出 Turtle/SPARQL 模型与 T2B2T 双向流；不适用于无 RDF/本体需求的纯提示词或一般业务编排；触发词：BDI、信念愿望意图、心智状态建模、神经符号、可解释推理
domain: 智能/agents
triggers: [BDI, 信念-愿望-意图, 信念愿望意图建模, 心智状态建模, 认知智能体, RDF转信念, BDI本体, 理性智能体, 神经符号AI, 逻辑增强生成, LAG, T2B2T, 多智能体心智协调, 可解释推理链, SEMAS]
tags: [智能体, bdi, 本体建模, rdf, 知识图谱, 神经符号, 可解释ai, 多智能体, sparql, misc]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [RDF/Turtle, SPARQL, OWL/DOLCE 本体, SEMAS, JADE/JADEX, LLM (LAG 管线)]
requires: []
related: [agent-memory-architecture, multi-agent-system-designer, crewai-multi-agent]
combines_with: [langgraph-agent-framework, agent-tool-design]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当任务要把**外部 RDF 上下文转化为智能体的心智状态**（信念 Belief、愿望 Desire、意图 Intention），并用形式化 BDI 本体支撑审议推理、可解释性与语义互操作时使用。典型场景：

- 把外部 RDF 上下文解析为关于世界状态的信念
- 用「感知-审议-行动」循环建模理性智能体
- 通过可追溯的推理链实现可解释性
- 落地 BDI 框架（SEMAS、JADE、JADEX）
- 用形式化认知结构增强 LLM（逻辑增强生成 LAG）
- 跨多智能体平台协调心智状态、追踪信念/愿望/意图的时序演化
- 把动机状态链接到行动计划

**不该用的边界（负边界）：**
- 没有 RDF/知识图谱/本体需求的纯提示词工程或一般业务流程编排
- 只需简单状态机或规则引擎、无需认知语义层时
- 输出未经环境内验证/测试/专家评审即直接当作可信结论
- 缺少必要输入、权限、安全边界或成功标准时——应停下并澄清

## 步骤

1. **建模世界状态（World State）**：把环境刻画为独立于智能体视角的结构化配置，作为心智状态的指称基底。
2. **Triples-to-Beliefs（T2B）**：解析外部 RDF，由 `BeliefProcess` 生成信念，信念用 `refersTo` 指向 `WorldState`。
3. **执行 BDI 审议**：信念经 `motivates`/`isMotivatedBy` 触发愿望，愿望经 `IntentionProcess` 提交为意图（`fulfils` 愿望、`isSupportedBy` 信念、`specifies` 计划）。
4. **目标导向规划**：意图 `specifies` 计划，计划 `addresses` 目标，并用 `beginsWith`/`endsWith`/`precedes` 编排任务序列。
5. **Beliefs-to-Triples（B2T）**：计划执行（`PlanExecution`）`satisfies` 计划并 `bringsAbout` 新世界状态，将心智状态投射回 RDF——完成 T2B2T 闭环。
6. **附加可解释性与时序**：每个心智实体链接 `Justification`，并用 `atTime`/`hasValidity` 绑定时间区间。
7. **用能力问题（SPARQL CQ）验证**实现是否满足设计意图。

## 指令（核心约束）

1. 世界状态建模为独立于智能体视角的配置，作为心智状态的指称基底。
2. 区分**续体（endurants，持久心智状态）**与**遭遇体（perdurants，时序心智过程）**，对齐 DOLCE 本体。
3. 目标（Goal）视为**描述**而非心智状态，保持认知层与规划层分离。
4. 用 `hasPart` 表达部分整体（meronymic）结构，支持选择性更新单个信念分量。
5. 每个心智实体都用 `atTime` 或 `hasValidity` 关联时间构造。
6. 使用双向属性对（`motivates`/`isMotivatedBy`、`generates`/`isGeneratedBy`）以便灵活查询。
7. 把心智实体链接到 `Justification` 实例，支撑可解释性与信任。
8. T2B2T 三步：(1) RDF 译为信念，(2) 执行 BDI 推理，(3) 心智状态投射回 RDF。
9. 在心智过程上定义存在性限制，如 `BeliefProcess ⊑ ∃generates.Belief`。
10. 复用成熟 ODP（EventCore、Situation、TimeIndexedSituation、BasicPlan、Provenance）保证互操作。

**按 C4 层级选择记号：** L1 Context / L2 Container → ArchiMate；L3 Component → UML；L4 Code → UML/RDF。

## 示例

认知链（信念→愿望→意图→计划）：

```turtle
:Belief_store_open a bdi:Belief ;
    rdfs:comment "Store is open" ;
    bdi:motivates :Desire_buy_groceries .

:Desire_buy_groceries a bdi:Desire ;
    bdi:isMotivatedBy :Belief_store_open .

:Intention_go_shopping a bdi:Intention ;
    bdi:fulfils :Desire_buy_groceries ;
    bdi:isSupportedBy :Belief_store_open ;
    bdi:specifies :Plan_shopping .
```

T2B2T 双向流：

```turtle
# Phase 1 Triples-to-Beliefs：外部 RDF 触发信念形成
:WorldState_notification a bdi:WorldState ;
    rdfs:comment "Push notification: Payment request $250" ;
    bdi:triggers :BeliefProcess_BP1 .
:BeliefProcess_BP1 a bdi:BeliefProcess ;
    bdi:generates :Belief_payment_request .

# Phase 2 Beliefs-to-Triples：审议产出新 RDF
:Intention_pay bdi:specifies :Plan_payment .
:PlanExecution_PE1 a bdi:PlanExecution ;
    bdi:satisfies :Plan_payment ;
    bdi:bringsAbout :WorldState_payment_complete .
```

时序查询（取某时刻仍有效的心智状态）：

```sparql
SELECT ?mentalState WHERE {
    ?mentalState bdi:hasValidity ?interval .
    ?interval bdi:hasStartTime ?start ; bdi:hasEndTime ?end .
    FILTER(?start <= "2025-01-04T10:00:00"^^xsd:dateTime &&
           ?end   >= "2025-01-04T10:00:00"^^xsd:dateTime)
}
```

逻辑增强生成（LAG）——用本体约束 LLM 输出：

```python
def augment_llm_with_bdi_ontology(prompt, ontology_graph):
    ontology_context = serialize_ontology(ontology_graph, format='turtle')
    augmented_prompt = f"{ontology_context}\n\n{prompt}"
    response = llm.generate(augmented_prompt)
    triples = extract_rdf_triples(response)
    is_consistent = validate_triples(triples, ontology_graph)
    return triples if is_consistent else retry_with_feedback()
```

SEMAS 规则翻译——把 BDI 本体映射为可执行产生式规则：

```prolog
% 信念触发愿望
[HEAD: belief(agent_a, store_open)] /
[CONDITIONALS: time(weekday_afternoon)] »
[TAIL: generate_desire(agent_a, buy_groceries)].
% 愿望触发意图提交
[HEAD: desire(agent_a, buy_groceries)] /
[CONDITIONALS: belief(agent_a, has_shopping_list)] »
[TAIL: commit_intention(agent_a, buy_groceries)].
```

能力问题（验收用 SPARQL）：

```sparql
# CQ1 哪些信念促成了某愿望的形成？
SELECT ?belief WHERE { :Desire_D1 bdi:isMotivatedBy ?belief . }
# CQ2 某意图满足哪个愿望？
SELECT ?desire WHERE { :Intention_I1 bdi:fulfils ?desire . }
# CQ3 哪个过程生成了某信念？
SELECT ?process WHERE { ?process bdi:generates :Belief_B1 . }
# CQ4 计划中任务的有序序列？
SELECT ?task ?nextTask WHERE {
    :Plan_P1 bdi:hasComponent ?task .
    OPTIONAL { ?task bdi:precedes ?nextTask }
} ORDER BY ?task
```

## 注意事项（反模式）

1. **混淆心智状态与世界状态**：心智状态 `refersTo` 世界状态，但本身不是世界状态。
2. **缺失时间边界**：每个心智状态都应有有效区间，以支撑历时推理。
3. **扁平信念结构**：复杂信念应用 `hasPart` 做组合式建模，便于选择性更新。
4. **隐式理由**：心智实体必须显式链接 `Justification` 实例。
5. **意图直接映射到行动**：意图指定计划，计划含任务，行动执行任务——不可跳层。

其他：本技能仅在任务明确落入上述范围时使用；输出不能替代环境内验证、测试或专家评审；缺输入/权限/安全边界/成功标准时先停下澄清。

## 互见

- 集成点：RDF 解析后构建认知表征；与本体推理结合推断隐含心智关系；与 FIPA ACL 做跨平台信念共享；与时序推理协调心智演化；接入可解释 AI 系统追踪「感知→审议→行动」；在 LAG 管线中约束 LLM 的神经符号集成。
- 进阶资料（源仓库 `references/`）：`bdi-ontology-core.md`（核心本体与类定义）、`rdf-examples.md`（完整 Turtle 示例）、`sparql-competency.md`（完整能力问题）、`framework-integration.md`（SEMAS/JADE/LAG 集成）。
- 主要文献：Zuppiroli 等《The Belief-Desire-Intention Ontology》(2025)；Rao & Georgeff《BDI agents: From theory to practice》(1995)；Bratman《Intention, plans, and practical reason》(1987)。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
