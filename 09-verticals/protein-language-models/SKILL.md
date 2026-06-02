---
name: protein-language-models
title: 蛋白质语言模型与设计（ESM）
description: 当需要用 EvolutionaryScale 的 ESM3/ESM C 做蛋白质序列生成、结构预测、逆折叠、功能条件设计或提取嵌入向量时使用；做基于本地开源权重（Python 3.12，PyPI 上的 esm）或 Forge/Biohub 云 API 的蛋白质多模态生成与表征产物；不适用于通用 LLM 文本、小分子药物、基因组核酸序列或无生物背景的纯打分任务；触发词：ESM、ESM3、ESMC、蛋白质语言模型、protein language model、逆折叠、inverse folding、ESMFold、蛋白质嵌入、protein embedding、蛋白质设计。
domain: 领域/science
triggers: [ESM, ESM3, ESMC, 蛋白质语言模型, protein language model, 逆折叠, inverse folding, ESMFold, 蛋白质嵌入, protein embedding, 蛋白质设计]
tags: [protein, bioinformatics, esm, protein-design, embeddings]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, esm, forge-api, biohub-api]
requires: []
related: [molecular-dynamics-simulation, cheminformatics-toolkit, single-cell-rnaseq-analysis]
combines_with: [molecular-dynamics-simulation, scientific-database-lookup]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

需要用 EvolutionaryScale 的蛋白质语言模型完成下列任务时使用：

- **生成型设计（ESM3，多模态）**：补全/变体设计、按功能注释条件生成、序列<->结构<->功能跨模态生成。
- **结构相关**：从序列预测结构、逆折叠（从结构反推序列）、ESMFold2 结构预测（经 Biohub）。
- **表征（ESM C）**：提取蛋白质嵌入向量，供分类、相似度、功能预测等下游 ML 使用。

触发词：ESM、ESM3、ESMC、蛋白质语言模型、protein language model、逆折叠、inverse folding、ESMFold、蛋白质嵌入、protein embedding、蛋白质设计。

**不该用（边界）：**
- 通用 LLM 文本生成/对话 → 用普通大模型，ESM 只懂蛋白质序列。
- 小分子/化合物药物设计、对接打分 → 用 RDKit/对接工具，不是蛋白质 LM。
- 基因组/核酸（DNA/RNA）序列建模 → ESM 面向氨基酸序列，非核苷酸。
- 仅做序列比对/BLAST 检索这类无需深度表征的任务 → 用传统生信工具更轻。
- 真实下游决策前未做湿实验或结构验证 → 生成结果须验证，勿直接当结论。

## 步骤 / 指令

1. **选模型**（按场景，见下）：
   - 本地实验/原型：`esm3-sm-open-v1`（1.4B，开源权重）或 `esmc-300m`。
   - 生产质量：`esm3-medium-2024-08`（7B，仅 Forge）。
   - 最高精度：`esm3-large-2024-03`（98B）或 `esmc-6b-2024-12`（仅 Forge/SageMaker）。
   - 高吞吐：Forge API + 批量异步执行器。
2. **装环境**：要求 **Python 3.12**（`>=3.12,<3.13`）。`uv pip install "esm==3.2.3"`；NVIDIA GPU 推荐再装 `flash-attn`。Forge 客户端随 `esm` 包发行，云推理无需额外安装。
3. **配鉴权（仅云端需要）**：按序检查 `ESM_API_KEY`：环境变量 → 本地 `.env`（只取该键）→ 到 Forge / Biohub 开发者控制台申请。**绝不硬编码或提交 token**。`esm.sdk.client()` 在省略 `token` 时会自动读取 `ESM_API_KEY`。
4. **构造输入**：用 `ESMProtein` 封装序列；`_` 表示待生成的掩码位；逆折叠用 `ESMProtein.from_pdb(...)` 并将 `.sequence=None`。
5. **生成/编码**：调 `model.generate(protein, GenerationConfig(track=..., num_steps=..., temperature=...))`；`track` 取 `sequence`/`structure`/`function`。嵌入走 ESM C 的 `encode -> forward`。
6. **链式思维细化**（复杂设计）：分步切换 track，逐步从结构→序列→功能迭代精修。
7. **取产物**：序列 `protein.sequence`；结构 `protein.coordinates` 或 `protein.to_pdb()`；嵌入为 forward 输出张量。
8. **验证**：用结构预测自洽性或湿实验校验生成序列，按需回调 `temperature`/`num_steps`。

## 示例

本地序列补全（ESM3 开源权重）：
```python
from esm.models.esm3 import ESM3
from esm.sdk.api import ESM3InferenceClient, ESMProtein, GenerationConfig

model: ESM3InferenceClient = ESM3.from_pretrained("esm3-sm-open-v1").to("cuda")
protein = ESMProtein(sequence="MPRT___KEND")  # '_' 为掩码位
protein = model.generate(protein, GenerationConfig(track="sequence", num_steps=8))
print(protein.sequence)
```

云端（Forge，接口同本地）：
```python
import os, esm
from esm.sdk.api import ESMProtein, GenerationConfig

model = esm.sdk.client("esm3-medium-2024-08", token=os.environ["ESM_API_KEY"])
protein = model.generate(protein, GenerationConfig(track="sequence", num_steps=8))
```

逆折叠（由结构设计序列）：
```python
protein = ESMProtein.from_pdb("target_structure.pdb")
protein.sequence = None  # 移除原序列
designed = model.generate(
    protein,
    GenerationConfig(track="sequence", num_steps=50, temperature=0.7),
)
```

ESM C 提取嵌入：
```python
from esm.models.esmc import ESMC
from esm.sdk.api import ESMProtein

model = ESMC.from_pretrained("esmc-300m").to("cuda")
protein = ESMProtein(sequence="MPRTKEINDAGLIVHSP...")
tensor = model.encode(protein)
embeddings = model.forward(tensor)
```

功能条件生成（指定功能注释生成新蛋白）：
```python
from esm.sdk.api import ESMProtein, FunctionAnnotation, GenerationConfig

protein = ESMProtein(
    sequence="_" * 200,
    function_annotations=[FunctionAnnotation(label="fluorescent_protein", start=50, end=150)],
)
out = model.generate(protein, GenerationConfig(track="sequence", num_steps=200))
```

Forge 异步批处理：
```python
import os, asyncio, esm
client = esm.sdk.client("esm3-medium-2024-08", token=os.environ["ESM_API_KEY"])

async def batch_generate(proteins):
    tasks = [client.async_generate(p, GenerationConfig(track="sequence")) for p in proteins]
    return await asyncio.gather(*tasks)

proteins = [ESMProtein(sequence=f"MPRT{'_' * 50}KEND") for _ in range(10)]
results = asyncio.run(batch_generate(proteins))
```

## 注意事项

- **Python 版本强约束**：当前发行版仅支持 `3.12`，环境不匹配直接装不上。
- **密钥安全**：`ESM_API_KEY` 只从环境或 `.env` 读取，不写进脚本、不入版本库；`KeyError` 即提示未配置而非吞掉。
- **temperature 控制多样性**：`0.0` 确定性、`1.0` 多样；批量/逆折叠常用 `0.5~0.7`。
- **6B 权重不开放本地裸跑**：`esmc-6b` 需经 Forge 或 SageMaker。
- **平台迁移**：部分服务（含 ESMFold2 结构预测）正迁往 biohub.ai，SDK 类名可能仍写 "Forge"；ESMFold2/Biohub 专属配置见源仓库 `references/biohub-platform.md`。
- **嵌入要点**：尽量批量编码、缓存复用、算相似度前归一化；查询与建库务必用同一模型。
- **生产化**：加重试/限流与错误处理，监控 token 用量，重负载考虑 SageMaker 专用部署。
- **负责任使用**：遵循 Responsible Biodesign Framework（responsiblebiodesign.ai），设计新蛋白前评估生物安全与伦理，实验验证前审慎。

## 互见

- 暂无强相关的本仓技能可联动；如需为生成的蛋白质嵌入做下游向量检索/聚类，可自行接入通用向量管道。

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT License）。
