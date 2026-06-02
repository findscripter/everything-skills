---
name: cellchat-cell-communication
title: CellChat 细胞间通讯推断
description: 当用 scRNA-seq 推断并可视化细胞间配体-受体通讯、做通路信号网络与跨条件比较时使用；用 R 包 CellChat 从 Seurat/计数矩阵建对象→CellChatDB 子集→过表达基因→通讯概率→通路聚合→网络中心性→弦图/热图/气泡图→双条件对比，产出交互表与图；不适用于纯 Python 流程或多数据库共识排名（用 liana）、配体到靶基因调控推断（用 NicheNet）、人/鼠以外物种（需自建库）；触发词：CellChat、细胞通讯、配体受体、cell-cell communication、CellChatDB、netVisual
domain: 领域/science
triggers: [CellChat, 细胞通讯, 配体受体, cell-cell communication, CellChatDB, netVisual, 通路信号, 发送者受体者]
tags: [cellchat, cell-communication, ligand-receptor, scrna-seq, r, bioinformatics, pathway, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [R, CellChat, Seurat, NMF, ggplot2, igraph, liana]
requires: []
related: [single-cell-rnaseq-analysis, celltypist-cell-annotation, gene-set-enrichment-analysis, muon-multiomics-singlecell]
combines_with: [single-cell-rnaseq-analysis, celltypist-cell-annotation, harmony-batch-correction]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要从单细胞 RNA-seq 推断并可视化细胞类型间的信号通讯时使用本条，典型场景：

- 判定组织/疾病样本里哪些细胞类型是旁分泌/自分泌信号的主要发送者与受体者
- 找出介导特定细胞群通讯的配体-受体对（如 肿瘤→T 细胞、成纤维→上皮）
- 比较两条件（健康 vs 疾病、用药 vs 对照）的信号网络，发现重连/丢失的通讯
- 发现某细胞互作中富集的通路级信号程序（如 MHC-II、COLLAGEN、VEGF）
- 按通讯强度或网络中心性排序，为扰动实验优先选靶

**不该用本条的边界：**

- 想要纯 Python 流程，或跨多个配体-受体数据库（CellChat/CellPhoneDB/Connectome/NicheNet）的共识排名 → 用 **liana**（py）
- 需要配体到靶基因的调控推断（预测发送细胞配体调控受体细胞哪些靶基因）→ 用 **NicheNet**
- 物种非人/鼠：CellChatDB 仅覆盖人鼠，其它物种需自建数据库

## 步骤

1. 建对象：从 Seurat 对象（取归一化 `data` + Idents 标签）或计数矩阵 + 标签向量 `createCellChat`
2. 设库子集：`cellchat@DB <- CellChatDB.human`（或 .mouse），可 `subsetDB` 限定信号类别，再 `subsetData`
3. 过表达：`identifyOverExpressedGenes` → `identifyOverExpressedInteractions`
4. 算概率：`computeCommunProb`（质量作用定律）→ `filterCommunication(min.cells=10)`
5. 通路聚合：`computeCommunProbPathway` → `aggregateNet`（产出 net$count / net$weight）
6. 网络中心性：`netAnalysis_computeCentrality` 算发送/受体/中介/影响者；`identifyCommunicationPatterns`（NMF，k 由 `selectK` 肘部定）
7. 可视化：弦图 `netVisual_circle/aggregate`、热图 `netVisual_heatmap`、气泡图 `netVisual_bubble`
8. 跨条件：`mergeCellChat` → `compareInteractions` / `netVisual_diffInteraction` / `rankNet`

## 指令

安装（CRAN 常滞后，从 GitHub 装）：

```r
if (!requireNamespace("BiocManager", quietly = TRUE)) install.packages("BiocManager")
BiocManager::install(c("BiocNeighbors", "ComplexHeatmap"))
devtools::install_github("jinworks/CellChat")   # CellChat >= 2.0
install.packages(c("NMF","ggplot2","ggalluvial","igraph","dplyr","patchwork","circlize"))
```

数据要求：归一化表达矩阵（基因×细胞）+ 细胞分组标签向量。物种符号须匹配——人为全大写 HGNC（`TGFB1`），鼠为首字母大写 MGI（`Tgfb1`）。

## 示例

完整流程（Seurat 输入 → 弦图 + 气泡图）：

```r
library(CellChat); library(Seurat)
data.input <- GetAssayData(seurat_obj, assay="RNA", slot="data")   # 对数归一化
meta <- data.frame(labels = Idents(seurat_obj), row.names = colnames(seurat_obj))

cellchat <- createCellChat(object=data.input, meta=meta, group.by="labels")
cellchat@DB <- CellChatDB.human                       # 或 CellChatDB.mouse
cellchat <- subsetData(cellchat)
cellchat <- identifyOverExpressedGenes(cellchat)
cellchat <- identifyOverExpressedInteractions(cellchat)
cellchat <- computeCommunProb(cellchat, type="triMean",      # 最稳健的聚合
                              nboot=100, seed.use=42, population.size=TRUE)
cellchat <- filterCommunication(cellchat, min.cells=10)
cellchat <- computeCommunProbPathway(cellchat)
cellchat <- aggregateNet(cellchat)
print(cellchat@netP$pathways)                         # 显著通路名

# 导出 LR 级显著交互（p<0.05）
df.lr <- subsetCommunication(cellchat, slot.name="net")
write.csv(df.lr[df.lr$pval < 0.05, ], "cellchat_lr.csv", row.names=FALSE)

# 聚合弦图（计数 + 强度）
groupSize <- as.numeric(table(cellchat@idents))
par(mfrow=c(1,2))
netVisual_circle(cellchat@net$count,  vertex.weight=groupSize, weight.scale=TRUE, title.name="Number of interactions")
netVisual_circle(cellchat@net$weight, vertex.weight=groupSize, weight.scale=TRUE, title.name="Interaction strength")

# 指定通路弦图 + 气泡图
netVisual_aggregate(cellchat, signaling="COLLAGEN", layout="chord")
netVisual_bubble(cellchat, signaling=c("COLLAGEN","MIF","VEGF"))
ggsave("bubble.pdf", width=10, height=8)
```

中心性与跨条件比较：

```r
cellchat <- netAnalysis_computeCentrality(cellchat, slot.name="netP")
netAnalysis_signalingRole_heatmap(cellchat, pattern="all")   # 行=通路 列=细胞群

# 双条件：合并后比较
object.list <- list(Control=cellchat_ctrl, Disease=cellchat_disease)
cc <- mergeCellChat(object.list, add.names=names(object.list))
compareInteractions(cc, group=c(1,2), measure="weight")
netVisual_diffInteraction(cc, weight.scale=TRUE)             # 增/减连接弦图
rankNet(cc, mode="comparison", stacked=TRUE, do.stat=TRUE)   # 各条件特异通路
```

## 注意事项

- **输入必须是对数归一化值**，不是原始计数（否则 `computeCommunProb` 概率全 0）；用 `subsetData()` 后确认 `nrow(cellchat@data.signaling) > 0`。
- **基因命名匹配物种**：人全大写 / 鼠首字母大写；混用会导致概率全 0。鼠数据用 `CellChatDB.mouse`。
- **关键参数**：`type="triMean"`（最严格，推荐）/ `truncatedMean`（配 `trim`）；`nboot` 默认 100，内存紧张可降到 50；`population.size=TRUE` 对异质数据推荐；`min.cells` 默认 10，小簇被丢可降到 5 或先合并稀有簇。
- **net$count vs net$weight**：count 是显著 LR 对数量，weight 是通讯概率之和（信息流）。高 count 低 weight = 多弱交互；高 weight 低 count = 少数主导通路。
- **NMF 模式**：`identifyCommunicationPatterns` 的 `k` 用 `selectK()` 肘部选，先试 k=2/3；不收敛多因 k 过高或数据过稀疏。
- **大数据/内存**：≤30000 细胞/条件，或降 `nboot`；细胞群过多时弦图不可读，改用 `netVisual_heatmap` 或先把簇并成大类。
- **跨条件合并**：`mergeCellChat` 前须 `setIdent()` 统一两对象的细胞群名 `levels(...@idents)`，否则报标签不匹配。
- **检查点**：`saveRDS(cellchat, "cellchat.rds")` 保存完成对象，可视化/比较前先存盘。

## 互见

- related：`single-cell-rnaseq-analysis` —— 先用 Scanpy/Seurat 完成质控、聚类与细胞类型注释，产出 CellChat 所需的分组标签
- related：`gene-set-enrichment-analysis` —— 对富集通路做进一步功能解读
- related：`nextflow-pipeline-builder` —— 把通讯分析纳入可复现的批量流程
- combines_with：`single-cell-rnaseq-analysis` —— 上游注释 + 下游通讯推断构成完整 scRNA-seq 解读链

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
