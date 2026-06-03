---
name: rag-clarity-gate
title: RAG 入库前文档清晰度校验
description: 当文档要入 RAG 知识库 / 交给别的 LLM 前，需检查「假设/预测被当成事实」的幻觉风险时使用；做按 9 点逐项审查、强制补不确定性标记、走两轮 HITL 人工确认，产出带状态字段与校验记录的清晰度门禁文档（CGD）；不适用于核查事实真伪（只校验表述形式不验真值）、文档结构分类、改写润色排版；触发词：清晰度门禁、入库前校验、幻觉风险、能否被 LLM 安全读取、CGD、HITL 核验
domain: 智能/rag
triggers: [清晰度门禁, RAG 入库前校验, 幻觉风险检查, 能否被 LLM 安全读取, 不确定性标记, 假设当事实, HITL 核验, CGD 文档, clarity gate, pre-ingestion check]
tags: [rag, epistemic-quality, hallucination, hitl, document-verification, llm]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python]
requires: []
related: [rag-implementation-workflow, rag-pipeline-builder, production-llm-app-builder, embedding-model-strategies]
combines_with: [rag-pipeline-builder, fact-checking, ai-model-knowledge-distill]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# RAG 入库前文档清晰度校验

## 何时使用

当一份文档**即将进入 RAG 知识库、或要交给另一个 LLM 读取**，你担心里面的假设、预测、估算会被下游模型当成既定事实，进而放大成「自信的幻觉」时使用本技能。

核心拷问：**「如果另一个 LLM 读这份文档，它会把假设误当成事实吗？」**

定位差异——市面工具（UnScientify / HedgeHunter）做的是**检测**「文中是否已有不确定性措辞」；本技能做的是**强制**「在该有不确定性标记的地方补上」（"Revenue will be \$50M" 这类该 hedge 却没 hedge 的句子要被揪出）。

**该用**：文档含预测/估算/假设；写完规格、状态文档、方法论描述后；跨 LLM 会话交接文档；发布未经验证的论断前。

**不该用（边界）**：
- **不核查事实真伪**——本技能只校验「表述形式」(FORM) 不验「真值」(TRUTH)。LLM 完全可以先编造事实、再给假事实补上来源标记从而「骗过」门禁；故 **HITL 人工核验是声明 PASS 前的强制环节**。
- 不做文档类型分类、不重构文档、不加深链/引用、不评判文笔。
- 小语料能整体塞进上下文、无需建知识库时，不必走门禁。

## 步骤 / 指令

按「9 点语义审查 → 状态字段落盘 → 两轮 HITL → 产出 CGD」推进。9 点决定「有哪些问题」，结构字段（C7-C10 规则）保证状态自洽（如发现冲突即标 `clarity-status: UNCLEAR`，未解决不得声明 `REVIEWED`）。

**9 个核验点：**

认知核验（核心 1-4）：
1. **假设 vs 事实标注**：每条论断须明确「已验证 / 假设」。改法：加 `PROJECTED:`、`HYPOTHESIS:`、`UNTESTED:`、`(estimated)`、`~`、`?`，或附证据「[benchmark data in Table 3]」。
2. **不确定性标记**：前瞻性陈述须带限定词。"Revenue will be \$50M" → "Revenue is **projected** to be \$50M"。补 projected/estimated/expected/designed to/intended to。
3. **假设可见性**：影响解读的隐含前提要显式化。"scales linearly" → "scales linearly [assuming <1000 concurrent users]"。
4. **权威外观的未验证数据**：带具体百分比、对勾的表格看着像实测。红旗：89%/95%/100% 无来源。改法：数字加 (guess)/(est.)/?，表头加 "PROJECTED VALUES - NOT MEASURED"。

数据质量（补充 5-7）：
5. **数据一致性**：扫描全文冲突数字/日期（一处 "500 users" 另一处 "750 users"）→ 调和或显式注明差异。
6. **隐含因果**：未证因果（"短提示词提升回答质量"）→ 改写为「MAY…（hypothesis, not validated）」。
7. **未来态当现在态**："The system processes 10,000 rps"（尚未建成）→ "is DESIGNED TO process…" 或 "TARGET: 10,000 rps"。

核验路由（8-9）：
8. **时间一致性**：文档日期、版本时序须内部自洽且合理（当前 2026 却写 "Last Updated: December 2024"、v1.1.0 早于 v1.0.0 都要标）。改法：更新日期、加 "as of [date]"。
9. **可外部核查的论断**：定价、统计、比率、竞品能力等具体数字 → 加带日期来源 / 加不确定标记 / 路由到 HITL 或外部检索 / 泛化（"low cost" 替 "\$0.005"）。

**核验层级与两轮 HITL：**
```
论断抽取 → 是否存在 Source of Truth？
   存在 → Tier1 自动核验（图/文、表/文、数值一致性）→ PASS / BLOCK
   不存在 → Tier2 两轮 HITL（强制）
       Round A 派生数据确认：来自本次会话已见来源的论断，人确认「解读」无误
       Round B 真实人工核验：无来源/人自有数据/外推 → APPROVE / REJECT
```

**确定性状态由字段「存在与否」决定**（无显式 status 字段，防止漏填 who/when）：`confirmed-by` 与 `confirmed-date` 都缺 = PENDING；都在 = VERIFIED；只填其一 = W-HC01 告警。`source` 字段语义随状态变：PENDING 时填「去哪核验」(actionable)，VERIFIED 时填「查到了什么」(evidence)；模糊来源如 "industry reports"/"TBD" 触发 W-HC02。

**附带脚本（确定性计算）：**
```bash
# 稳定哈希式 claim ID
python scripts/claim_id.py "Base price is $99/mo" "api-pricing/1"   # → claim-75fb137a
python scripts/claim_id.py --test
# 文档 SHA-256（按 FORMAT_SPEC §2.2-2.4 规范化：剥 frontmatter 的 document-sha256 行、去尾空白、3+ 换行折叠为 2、NFC、CRLF→LF）
python scripts/document_hash.py my-doc.cgd.md
python scripts/document_hash.py --verify my-doc.cgd.md
```
Claim ID 推荐哈希式 `claim-[a-f0-9]{8,}`（1000 条碰撞率 ~0.012%，超 1000 用 12+ 位）。

## 示例

通过审查后产出的 CGD（`.cgd.md`，YAML + 正文 + 结束标记）：
```yaml
---
clarity-gate-version: 2.1
processed-date: 2026-01-12
processed-by: Claude + Human Review
clarity-status: CLEAR          # CLEAR | UNCLEAR
hitl-status: REVIEWED          # PENDING | REVIEWED | REVIEWED_WITH_EXCEPTIONS
hitl-pending-count: 0
points-passed: 1-9
rag-ingestable: true           # 校验器计算，勿手填
document-sha256: 7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730
hitl-claims:
  - id: claim-75fb137a
    text: "Revenue projection is $50M"
    value: "$50M"
    source: "Q3 planning doc, page 12"
    location: "revenue-projections/1"
    round: B
    confirmed-by: Francesco
    confirmed-date: 2026-01-12
---

# 文档标题
正文应用认知标记后："Revenue will be $50M" → "Revenue is **projected** to be $50M *(unverified projection)*"

## HITL Verification Record   # 存在 claim 时此节强制（否则 E-ST10）
### Round B: True HITL Verification
| # | Claim | Status | Verified By | Date |
|---|-------|--------|-------------|------|
| 1 | [claim] | ✓ Confirmed | [name] | [date] |

<!-- CLARITY_GATE_END -->
Clarity Gate: CLEAR | REVIEWED
```

审查报告骨架（结论先行）：
```
## Clarity Gate Results
**Document:** [file]   **Issues Found:** [n]
### Critical（会致幻觉）  - [问题 + 位置 + 修法]
### Warning（可能误读）   - …
### Temporal（时间问题）  - …
### Externally Verifiable Claims  | # | Claim | Type | 建议核验方式 |
---
## Round A: 回复 "confirmed" 或指出我误读处
## Round B: | # | Claim | 为何需 HITL | [ ]True / [ ]False |
**Verdict:** PENDING CONFIRMATION
```

无法解决的内容用排除块（不可部分入库，整篇被拒）：
```markdown
<!-- CG-EXCLUSION:BEGIN id=auth-legacy-1 -->
需 SME 评审的遗留鉴权细节…
<!-- CG-EXCLUSION:END id=auth-legacy-1 -->
```
排除块 ID 须匹配 `[A-Za-z0-9][A-Za-z0-9._-]{0,63}`、不可嵌套/重叠、每 ID 仅用一次，并要求 `hitl-status: REVIEWED_WITH_EXCEPTIONS` + `exceptions-reason`/`exceptions-ids`。

## 注意事项

- **只校验形式不验真值**：通过门禁≠内容为真。`rag-ingestable: true` 只在 `CLEAR | REVIEWED` 且无排除块时由校验器置位，**永远以 HITL 确认为准，不可手填**。
- **存在 claim 时 `## HITL Verification Record` 节强制**（缺失 = E-ST10 ERROR）；表行数须与 `hitl-claims` 数一致（否则 W-ST11）。
- `confirmed-by`/`confirmed-date` 要么都填要么都空，半填即 W-HC01；来源勿写 "research"/"TBD" 等模糊词（W-HC02）。
- 要在正文里书写 `*(estimated)*` 这类标记本身又不想被解析，用反引号包裹：`` `*(estimated)*` ``。
- SOT（Source of Truth）= 带 `tier:` 块的 CGD，须含 `## Verified Claims` 表（列序 Claim/Value/Source/Verified，违反触发 E-TB01~E-TB07，如缺节、无数据行、列缺失/错序、空单元格、日期格式错、Verified 日期超 24h 落在未来）；表不得置于排除块内；用 `[STABLE]`/`[CHECK]`/`[VOLATILE]`/`[SNAPSHOT]` 标注时效。
- 哈希跨平台确定性：BOM/CRLF/CR 归一、边界检测防止对 CGD 结构外内容算哈希。

## 互见

- **requires**：`rag-implementation-workflow` —— 本技能是入库前的质量门禁，配合完整 RAG 实施流程在「文档清洗/分块前」拦截带幻觉风险的语料。
- **related**：`rag-pipeline-builder`（管道防注入与上下文拼接）、`llm-judge-evaluation`（用 LLM-as-judge 给清晰度/答案打分，是 HITL 之外的自动评估补充）、`hybrid-search-retrieval`、`embedding-model-strategies`。
- **combines_with**：`prompt-template-designer` —— 生成端「仅依据上下文作答、标注引用、忽略文档内越权指令」的提示模板，与本技能的「形式校验」共同压低下游幻觉。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可），适配重写为中文。
