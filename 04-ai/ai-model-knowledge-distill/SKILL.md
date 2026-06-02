---
name: ai-model-knowledge-distill
title: 从 AI 模型蒸馏结构化领域知识
description: 当需要把 AI 模型会话变成可累积、可检索、可导出的领域参考数据时使用；通过定向提问 + 质量评分 + 对抗校验，蒸馏出结构化 JSONL/CSV 知识库与表格化 ML 训练数据；不适用于训练竞品 LLM、替代专家审核或环境验证；触发词：知识蒸馏、领域参考数据、bdistill
domain: 智能/rag
triggers: [知识蒸馏, 领域参考数据, bdistill, 构建查找表/问答数据集, 跨模型知识对比, 生成传统 ML 训练数据, Ollama 本地模型抽取, 对抗校验知识]
tags: [智能, 知识抽取, 领域知识, 数据护城河, mcp, 参考数据, ollama]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bdistill, bdistill-mcp, ollama, claude, cursor, codex, copilot]
requires: []
related: [rag-implementation-workflow, embedding-model-strategies, self-improving-memory-agent, production-llm-app-builder]
combines_with: [vector-index-tuning, rag-pipeline-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

把 AI 订阅会话变成可复利累积的领域知识库：Agent 回答定向领域问题，bdistill 负责结构化 + 质量评分，输出累积成可搜索、可导出的参考数据集。

适用：
- 需要某领域（医疗、法律、金融、网络安全等）的结构化参考数据。
- 构建查找表、问答数据集或研究语料。
- 为传统 ML 模型（回归、分类）生成训练数据。
- 想对同一领域做跨模型知识对比。

不该用（负边界）：
- 不要用来训练/蒸馏竞品 LLM——产出是参考数据，不是 LLM 训练格式。
- 不要把输出当作环境特定验证、测试或专家审核的替代品。
- 任务范围、必需输入、权限、安全边界或成功标准不清时，先停下来澄清，不要硬跑。

两种抽取路径：会话内（闭源模型，复用现有订阅，无需额外 API key）或本地（开源模型经 Ollama，全程本机运行，不外传数据）。

## 步骤 / 指令

### 1. 安装

```bash
pip install bdistill
claude mcp add bdistill -- bdistill-mcp   # Claude Code 注册 MCP
```

### 2. 会话内蒸馏

```
/distill medical cardiology                    # 预置领域 + 子类
/distill --custom kubernetes docker helm       # 自定义术语
/distill --adversarial medical                 # 开启对抗校验
```

`--adversarial`（对抗模式）会质疑 Agent 的论断，强制其给出证据、纠错并承认局限，从而产出经过校验的知识条目（`validated: true`）。

### 3. 搜索 / 导出 / 复利累积

```bash
bdistill kb list                               # 列出所有领域
bdistill kb search "atrial fibrillation"       # 关键词搜索
bdistill kb export -d medical -f csv           # 导出为表格
bdistill kb export -d medical -f markdown      # 导出为可读文档
```

### 4.（可选）生成表格化 ML 数据

为传统 ML 模型生成结构化训练数据，导出为可直接喂给 pandas/sklearn 的 CSV，每行记录 `source_model` 以便跨模型分析：

```
/schema sepsis | hr:float, bp:float, temp:float, wbc:float | risk:category[low,moderate,high,critical]
```

### 5.（可选）本地开源模型抽取（Ollama）

```bash
# 从 https://ollama.com 安装 Ollama
ollama serve
ollama pull qwen3:4b
bdistill extract --domain medical --model qwen3:4b
```

## 示例

会话内对心脏病学领域提问，输出结构化参考 JSONL（非训练数据格式），含质量分、置信度与来源模型：

```json
{
  "question": "What causes myocardial infarction?",
  "answer": "Myocardial infarction results from acute coronary artery occlusion...",
  "domain": "medical",
  "category": "cardiology",
  "tags": ["mechanistic", "evidence-based"],
  "quality_score": 0.73,
  "confidence": 1.08,
  "validated": true,
  "source_model": "Claude Sonnet 4"
}
```

## 注意事项

- 会话内抽取复用你现有订阅，无需额外 API key；本地抽取全程在本机经 Ollama 运行，不向外部服务发送数据。
- 输出是参考数据（structured reference JSONL），不是 LLM 训练格式——切勿用于训练竞品模型。
- 对高风险领域（医疗、法律等）务必经专家复核，质量分仅作内部排序参考，不等于事实正确性背书。
- 跨模型对比时依赖 `source_model` 字段；做分析前确认该字段已正确写入。

## 互见

- 模型行为透视（`@bdistill-behavioral-xray`）：透视模型的行为模式，与本技能同属 bdistill 套件。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可证），原作者 FrancyJGLisboa。
