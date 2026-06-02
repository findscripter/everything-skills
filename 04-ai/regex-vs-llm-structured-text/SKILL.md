---
name: regex-vs-llm-structured-text
title: 结构化文本解析：正则与 LLM 的取舍决策
description: 当解析有重复模式的结构化文本（题库/表单/发票/文档）、要在正则与 LLM 之间取舍、或搭混合管道控成本时使用；做出"正则优先 + 仅对低置信边角调 LLM"的决策与流水线，产出可控成本的解析方案；不适用于自由格式高度可变文本（直接上 LLM）或一次性临时抽取；触发词：结构化解析、正则 vs LLM、置信度评分、混合管道、降本。
domain: 智能/prompting
triggers: [结构化文本解析, 正则 vs LLM, regex vs llm, 置信度评分, 混合管道, 题库解析, 表单抽取, 发票解析, 降本提速, edge case]
tags: [prompting, llm, regex, parsing, cost-optimization]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [prompt-template-designer, llm-model-router, rag-pipeline-builder]
combines_with: [claude-api, llm-judge-evaluation]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

解析**有重复模式的结构化文本**（题库、表单、发票、收据、含小节/表格的文档）时，决定用正则、用 LLM、还是两者混合。

核心判断：正则能以**零边际成本、确定性**处理 95~98% 的常规情形；把昂贵且较慢的 LLM 调用**只留给剩下的边角案例**。

**该用**：
- 文本格式一致、重复性高（>90% 服从某种模式）。
- 同一类抽取要跑大量条目，成本/速度敏感。
- 想搭"正则抽取 → 置信度评分 → 仅低置信调 LLM"的混合管道。

**不该用（边界）**：
- 文本**自由格式、高度可变**（无稳定模式）→ 直接用 LLM，别硬写正则。
- **一次性临时抽取**几条 → 直接手动或单次 LLM，别建管道。
- 正则已能处理 ≥95% 却把**全量文本喂 LLM** → 纯属浪费成本与时延。

## 步骤 / 指令

决策框架：

```
文本格式是否一致且重复？
├── 是（>90% 服从某种模式）→ 正则优先
│   ├── 正则覆盖 95%+ → 完成，无需 LLM
│   └── 正则覆盖 <95% → 仅对边角案例补 LLM
└── 否（自由格式、高度可变）→ 直接用 LLM
```

混合管道架构：

```
[正则解析器] ── 抽取结构（95~98% 准确）
    ▼
[文本清洗器] ── 去噪（标记符、页码、伪影）
    ▼
[置信度评分] ── 给低置信抽取打标
    ├── 高置信（≥0.95）→ 直接输出
    └── 低置信（<0.95）→ [LLM 校验器] → 输出
```

落地四步：
```
1. 正则解析器——用命名捕获组抽出 id/正文/选项/答案，先覆盖大多数。
2. 置信度评分——按可编程规则（选项过少、缺答案、正文过短…）扣分打标。
3. 阈值筛选——score < 0.95 的项进入 LLM 校验队列，其余直出。
4. LLM 校验器——仅对被标项调最便宜的模型（Haiku 级）修正；其余原样保留。
```

## 示例

正则解析器（处理大多数情形）：

```python
import re
from dataclasses import dataclass

@dataclass(frozen=True)
class ParsedItem:
    id: str
    text: str
    choices: tuple[str, ...]
    answer: str
    confidence: float = 1.0

def parse_structured_text(content: str) -> list[ParsedItem]:
    pattern = re.compile(
        r"(?P<id>\d+)\.\s*(?P<text>.+?)\n"
        r"(?P<choices>(?:[A-D]\..+?\n)+)"
        r"Answer:\s*(?P<answer>[A-D])",
        re.MULTILINE | re.DOTALL,
    )
    items = []
    for match in pattern.finditer(content):
        choices = tuple(
            c.strip() for c in re.findall(r"[A-D]\.\s*(.+)", match.group("choices"))
        )
        items.append(ParsedItem(
            id=match.group("id"),
            text=match.group("text").strip(),
            choices=choices,
            answer=match.group("answer"),
        ))
    return items
```

置信度评分（给需复核的项打标，阈值默认 0.95）：

```python
@dataclass(frozen=True)
class ConfidenceFlag:
    item_id: str
    score: float
    reasons: tuple[str, ...]

def score_confidence(item: ParsedItem) -> ConfidenceFlag:
    reasons, score = [], 1.0
    if len(item.choices) < 3:
        reasons.append("few_choices"); score -= 0.3
    if not item.answer:
        reasons.append("missing_answer"); score -= 0.5
    if len(item.text) < 10:
        reasons.append("short_text"); score -= 0.2
    return ConfidenceFlag(item.id, max(0.0, score), tuple(reasons))

def identify_low_confidence(items, threshold=0.95):
    flags = [score_confidence(i) for i in items]
    return [f for f in flags if f.score < threshold]
```

LLM 校验器（仅边角案例，用最便宜的模型）：

```python
def validate_with_llm(item, original_text, client):
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",  # 校验用最便宜的模型
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": (
                f"Extract the question, choices, and answer from this text.\n\n"
                f"Text: {original_text}\n\n"
                f"Current extraction: {item}\n\n"
                f"Return corrected JSON if needed, or 'CORRECT' if accurate."
            ),
        }],
    )
    # 解析 LLM 响应并返回修正后的 item...
    return corrected_item
```

混合管道（正则 → 置信度检查 → 仅边角案例调 LLM）：

```python
def process_document(content, *, llm_client=None, confidence_threshold=0.95):
    items = parse_structured_text(content)                 # 1. 正则抽取（95~98%）
    low_conf = identify_low_confidence(items, confidence_threshold)  # 2. 置信度评分
    if not low_conf or llm_client is None:
        return items
    low_conf_ids = {f.item_id for f in low_conf}
    result = []
    for item in items:                                     # 3. 仅对被标项调 LLM
        if item.id in low_conf_ids:
            result.append(validate_with_llm(item, content, llm_client))
        else:
            result.append(item)
    return result
```

**真实指标**（生产题库管道，410 项）：正则成功率 98.0%；低置信项 8 个（2.0%）；实际 LLM 调用约 5 次；相比全量 LLM 省成本约 95%；测试覆盖率 93%。

## 注意事项

- **正则优先**：不完美的正则也是可迭代的基线，远胜一开始就全量 LLM。
- **用置信度评分而非碰运气**：靠可编程规则定位"需要 LLM 的项"，别指望正则"应该没问题"。
- **校验用最便宜的模型**：Haiku 级足矣，别用旗舰模型做体力活。
- **不可变更已解析对象**：清洗/校验步骤一律**返回新实例**，不要原地修改 ParsedItem。
- **TDD 对解析器特别有效**：先为已知模式写测试，再补边角案例（畸形输入、缺字段、编码问题）测试。
- **记录指标**（正则成功率、LLM 调用次数）以追踪管道健康度。

**要避开的反模式**：
- 正则已能覆盖 95%+ 却把全文喂 LLM（贵且慢）。
- 对自由格式、高度可变文本硬用正则（该用 LLM）。
- 跳过置信度评分、指望正则"自己会成"。
- 在清洗/校验步骤里原地改已解析对象。
- 不测边角案例（畸形输入、缺字段、编码问题）。

## 互见

- related：`prompt-template-designer` —— 写 LLM 校验器的提示时，用模板设计的"角色/约束/示例/输出格式"思路稳定其修正行为与 JSON 输出。
- related：`llm-model-router` —— 校验环节"用最便宜模型"的决策，可由模型路由按难度/成本统一调度。
- related：`rag-pipeline-builder` —— 当抽取需外部知识或上下文时，与检索管道协同；本技能负责结构抽取，RAG 负责补语义。
- combines_with：`claude-api` —— LLM 校验器的实际调用、prompt 缓存与成本控制走 Claude API 实现。
- combines_with：`llm-judge-evaluation` —— 用 LLM 评审离线评测正则+LLM 管道的抽取质量，量化置信度阈值的取舍。

---
采编自 affaan-m/everything-claude-code（MIT）。
