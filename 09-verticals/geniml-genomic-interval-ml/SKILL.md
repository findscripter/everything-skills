---
name: geniml-genomic-interval-ml
title: geniml 基因组区间机器学习
description: 当处理 BED 文件 / scATAC-seq 等基因组区间数据并需用机器学习学习区间嵌入、构建共识峰、做相似检索与聚类时使用；做 geniml 全流程（分词→Region2Vec/BEDspace/scEmbed 训练→universe 构建→评估检索）并产出嵌入向量、共识 universe.bed 与聚类结果；不适用于变异检测、序列比对、表达定量等非区间嵌入任务。触发词：geniml、Region2Vec、scEmbed、BEDspace、consensus peak、BED 嵌入
domain: 领域/science
triggers: [geniml, Region2Vec, scEmbed, BEDspace, 基因组区间嵌入, consensus peak, 共识峰 universe, scATAC-seq 嵌入, BED 文件机器学习, region2vec 分词训练]
tags: [领域/misc, 基因组学, 机器学习, 嵌入, 单细胞, BED, scATAC-seq, Python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [geniml, uv, scanpy, uniwig, StarSpace]
requires: []
related: [polars-bio-genomic-intervals, macs3-peak-calling, deeptools-ngs-analysis, encode-database]
combines_with: [single-cell-rnaseq-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当你手头是**基因组区间数据**（BED 文件集合、scATAC-seq 染色质可及性、峰集合），并希望用无监督机器学习把区间 / 单细胞 / 元数据标签映射成向量，进而做相似检索、聚类、降维或下游 ML 时，用 geniml。典型场景：

- 给 BED 文件集合学习区间嵌入做特征向量 → Region2Vec
- 区间与元数据（细胞类型、组织、条件）联合嵌入、跨模态检索（区间↔标签）→ BEDspace
- scATAC-seq 单细胞聚类 / 细胞类型注释、与 scanpy 集成 → scEmbed
- 从多份 BED 构建统计严谨的共识峰参考集（universe）→ Consensus Peaks

**不该用的边界**：geniml 解决的是「区间嵌入 / 共识峰 / 区间级 ML」。若任务是变异检测、序列比对、基因表达定量、motif 扫描、通路富集等非区间嵌入分析，本技能不适用，应改用对应专用工具（GATK、STAR、DESeq2 等）。另外它要求输入为 BED / AnnData 形式的区间坐标；纯序列 FASTA 不是其输入。

## 步骤

总体顺序：**构建 universe → 分词 → 训练 → 评估 / 检索**。universe（共识峰参考集）是分词的字典，质量决定一切。

### 安装

```bash
uv pip install geniml          # 基础
uv pip install 'geniml[ml]'    # 含 PyTorch 等 ML 依赖
uv pip install git+https://github.com/databio/geniml.git  # 开发版
```

### 1. 构建 universe（共识峰）

四种方法，按统计严谨度递增、算力消耗递增：

- **CC**（Coverage Cutoff）：阈值法，最简单
- **CCF**（Coverage Cutoff Flexible）：给边界加置信区间
- **ML**（最大似然）：对位置做概率建模
- **HMM**（隐马尔可夫）：复杂状态建模，最重

```bash
cat bed_files/*.bed > combined.bed
uniwig -m 25 combined.bed chrom.sizes coverage/   # 生成覆盖度轨道

geniml universe build cc \
  --coverage-folder coverage/ \
  --output-file universe.bed \
  --cutoff 5 --merge 100 --filter-size 50

geniml universe evaluate \
  --universe universe.bed \
  --coverage-folder coverage/ \
  --bed-folder bed_files/
```

### 2. Region2Vec：区间嵌入

word2vec 风格无监督学习，三步：分词 → 训练 → 评估。

```python
from geniml.tokenization import hard_tokenization
from geniml.region2vec import region2vec
from geniml.evaluation import evaluate_embeddings

hard_tokenization(src_folder='bed_files/', dst_folder='tokens/',
                  universe_file='universe.bed', p_value_threshold=1e-9)
region2vec(token_folder='tokens/', save_dir='model/',
           num_shufflings=1000, embedding_dim=100)
metrics = evaluate_embeddings(embeddings_file='model/embeddings.npy',
                              labels_file='metadata.csv')
```

CLI：`geniml region2vec --token-folder tokens/ --save-dir model/ --num-shuffle 1000`

### 3. BEDspace：区间 + 元数据联合嵌入

基于 StarSpace，把区间集与元数据标签嵌入同一空间，支持 r2l（区间查标签）/ l2r 等检索。流程：预处理 → 训练 → 算距离 → 检索。

```bash
geniml bedspace preprocess --input regions/ --metadata labels.csv --universe universe.bed
geniml bedspace train --input preprocessed.txt --output model/ --dim 100
geniml bedspace search -t r2l -d distances.pkl -q query.bed -n 10
```

### 4. scEmbed：单细胞 ATAC-seq 嵌入

在 scATAC-seq 上训练 Region2Vec 得到细胞级嵌入，与 scanpy 无缝集成。**务必先预分词以加速训练**。

```python
import scanpy as sc
from geniml.scembed import ScEmbed
from geniml.io import tokenize_cells

adata = sc.read_h5ad('scatac_data.h5ad')
tokenize_cells(adata='scatac_data.h5ad', universe_file='universe.bed', output='tokens.parquet')

model = ScEmbed(embedding_dim=100)
model.train(dataset='tokens.parquet', epochs=100)
adata.obsm['scembed_X'] = model.encode(adata)

sc.pp.neighbors(adata, use_rep='scembed_X')
sc.tl.leiden(adata); sc.tl.umap(adata)
```

### 5. 配套工具（Utilities）

- **BBClient**：缓存远端 BED（BEDbase 仓库），避免重复下载
- **BEDshift**：保留基因组上下文的随机化，生成统计零模型：`geniml bedshift --input peaks.bed --genome hg38 --preserve-chrom --iterations 100`
- **Evaluation**：嵌入质量指标（silhouette、Davies-Bouldin 等）
- **Tokenization**：hard / soft / universe-based 多种分词
- **Text2BedNN**：基因组查询的神经检索后端

## 示例

**选型速查**：
- 批量数据（ChIP-seq / ATAC-seq）、无元数据、跨实验比较区间集 → **Region2Vec**
- 有元数据标签、要按标签查区间或反查、建可检索基因组库 → **BEDspace**
- 单细胞 ATAC-seq 聚类 / 细胞类型注释、要接 scanpy → **scEmbed**
- 需要分词参考集、把多实验合成共识、要统计严谨的区间定义 → **Universe Building**
- 缓存远端 BED / 造零模型 / 评估嵌入 / 建检索接口 → **Utilities**

## 注意事项

- **universe 质量是命门**：分词覆盖率理想 >80%，训练前先核验。
- **基因组版本要对齐**：universe 与数据的 assembly 必须一致（如都是 hg38），否则分词覆盖率会崩。
- **可复现**：记录所有参数与随机种子。
- **算力**：ML / HMM 的 universe 方法很重；scEmbed 大数据集要分批或降采样。
- 常见报错排查：
  - 「分词覆盖率过低」→ 检查 universe 完整性，p 值阈值放宽（1e-9 → 1e-6），确认 assembly 一致。
  - 「训练不收敛」→ 学习率调到 0.01–0.05，增大 epoch，检查预处理。
  - 「内存溢出」→ scEmbed 减小 batch、分块、用预分词。
  - 「StarSpace not found」（BEDspace）→ 单独装 StarSpace，正确设置 `--path-to-starspace`。
- 集成：scEmbed 嵌入直接进 `adata.obsm`；远端仓库用 BBClient；模型可导出到 Hugging Face（databio 组织）分享；R 端可用 reticulate。

## 互见

- 生态：BEDbase（统一区间平台）、BEDboss（BED 处理流水线）、Gtars（基因组工具）、BBClient（仓库客户端）。
- 文档：https://docs.bedbase.org/geniml/ ，源码：https://github.com/databio/geniml ，预训练模型在 Hugging Face（databio）。
- 同领域可对照其他单细胞 / 基因组嵌入技能（scanpy 工作流、共识峰构建相关条目）。

---
采编自 K-Dense-AI/scientific-agent-skills（MIT）。
