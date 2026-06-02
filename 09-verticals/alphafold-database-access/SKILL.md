---
name: alphafold-database-access
title: AlphaFold 蛋白结构数据库访问
description: 当需要按 UniProt ID 获取 AlphaFold 预测的蛋白 3D 结构、置信度或批量蛋白组数据时使用；用 BioPython/REST API/Google Cloud 下载 mmCIF/PDB 并分析 pLDDT 与 PAE，产出结构文件、置信度报告与高可信区域。不适用于实验结构（用 PDB）或自行跑预测（用 ColabFold/本地 AlphaFold）。触发词：AlphaFold、UniProt、pLDDT、PAE、蛋白结构预测、蛋白组下载
domain: 领域/science
triggers: [AlphaFold, AlphaFold DB, UniProt 结构, pLDDT, PAE, 蛋白结构预测, 预测蛋白结构下载, mmCIF 下载, 蛋白组批量下载, AF-P, 置信度分析, 结构对接受体]
tags: [science, 结构生物学, 药物发现, 蛋白结构, AlphaFold, BioPython, 生物信息学]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Python, BioPython, requests, numpy, matplotlib, gsutil, BigQuery]
requires: []
related: [uniprot-protein-database, protein-language-models, opentargets-database, gget-genomic-databases]
combines_with: [molecular-dynamics-simulation, autodock-vina-docking]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：
- 按 UniProt 登录号检索 AI 预测蛋白结构，下载 mmCIF/PDB 用于结构分析或对接。
- 分析预测置信度：pLDDT（每残基）、PAE（结构域级相对定位）。
- 经 Google Cloud 批量下载整个物种蛋白组预测。
- 为缺乏实验数据的蛋白搭建结构模型、识别高可信结合位点、与 PDB 实验结构比对。

不该用（负边界）：
- 只需实验结构 → 直接用 PDB，不要用预测模型。
- 要自己运行 AlphaFold 预测 → 用 ColabFold 或本地 AlphaFold，本技能只做"访问已有数据库"。
- 预测模型不含配体、PTM、辅因子与多链上下文；高 pLDDT 不等于功能正确性，勿据此直接下功能结论。

## 步骤 / 指令

1. 装依赖：`pip install biopython requests numpy matplotlib`；批量另装 `pip install google-cloud-bigquery google-cloud-storage`（BioPython 需 ≥1.80）。
2. 检索预测元数据（单蛋白首选 BioPython）。
3. 下载坐标文件（优先 mmCIF）与置信度/PAE JSON。
4. 分析 pLDDT 分级、绘制 PAE 矩阵、抽取高可信区域。
5. 大批量（>100 蛋白或整蛋白组）改走 Google Cloud（gsutil/BigQuery），顺序请求间隔 100–200ms，并发 ≤10。

关键约束：
- AlphaFold ID 格式 `AF-{UniProt}-F{片段号}`（如 `AF-P00520-F1`）；大蛋白（>2700 残基）拆 F1/F2…须逐片段检查。
- 当前库版本 **v4**，所有文件 URL 必须带 `_v4` 后缀，可复现分析中固定版本号。
- pLDDT 以 B-factor 存于结构文件。
- 文件基址 `https://alphafold.ebi.ac.uk/files/`。

### 置信度判读表

| 指标 | 范围 | 判读 | 适用 |
|------|------|------|------|
| pLDDT >90 | 极高 | 主链+侧链可靠 | 精细分析、对接 |
| pLDDT 70–90 | 高 | 主链总体可靠 | 折叠/结构域识别 |
| pLDDT 50–70 | 低 | 谨慎使用 | 可能柔性/无序 |
| pLDDT <50 | 极低 | 很可能无序 | 从分析中剔除 |
| PAE <5Å | 可信 | 结构域相对位置可靠 | 多域装配 |
| PAE 5–10Å | 中等 | 排布不确定 | 各域独立处理 |
| PAE >15Å | 不确定 | 域可能可动 | 勿信朝向 |

## 示例

检索 + 下载 + 看置信度：

```python
from Bio.PDB import alphafold_db
import requests, numpy as np

uniprot_id = "P00520"  # ABL1 激酶
preds = list(alphafold_db.get_predictions(uniprot_id))
af_id = preds[0]['entryId']                                   # AF-P00520-F1
cif_file = alphafold_db.download_cif_for(preds[0], directory="./structures")

conf = requests.get(f"https://alphafold.ebi.ac.uk/files/{af_id}-confidence_v4.json").json()
scores = conf['confidenceScore']
print(f"平均 pLDDT: {np.mean(scores):.1f}, 高可信残基: {sum(1 for s in scores if s>90)}/{len(scores)}")
```

REST API（取下载 URL，便于集成）：

```python
data = requests.get(f"https://alphafold.ebi.ac.uk/api/prediction/{uniprot_id}").json()
pred = data[0]
print(pred['cifUrl'], pred['pdbUrl'], pred['paeDocUrl'])
```

下载文件（mmCIF 推荐；PDB 仅限 <99999 原子；bcif 体积小约 70%）：

```python
base = "https://alphafold.ebi.ac.uk/files"
cif = requests.get(f"{base}/{af_id}-model_v4.cif")
open(f"{af_id}.cif", "w").write(cif.text)
pae = requests.get(f"{base}/{af_id}-predicted_aligned_error_v4.json").json()
pae_matrix = np.array(pae['distance'])   # N×N，按设计非对称，聚类前需对称化
```

PAE 可视化（低 PAE 区=可信相对定位）：

```python
import matplotlib.pyplot as plt
plt.imshow(pae_matrix, cmap='viridis_r', vmin=0, vmax=30)
plt.colorbar(label='PAE (Å)'); plt.savefig(f'{af_id}_pae.png', dpi=300, bbox_inches='tight')
```

批量经 Google Cloud：

```bash
gsutil ls gs://public-datasets-deepmind-alphafold-v4/
# 按物种 taxonomy ID 下载整蛋白组（人 9606 / E.coli 83333 / 小鼠 10090）
gsutil -m cp gs://public-datasets-deepmind-alphafold-v4/proteomes/proteome-tax_id-9606-*_v4.tar .
gsutil cp gs://public-datasets-deepmind-alphafold-v4/accession_ids.csv .
```

BigQuery 筛高可信人源蛋白：

```sql
SELECT entryId, uniprotAccession, gene, globalMetricValue, fractionPlddtVeryHigh
FROM `bigquery-public-data.deepmind_alphafold.metadata`
WHERE organismScientificName = 'Homo sapiens'
  AND fractionPlddtVeryHigh > 0.8 AND isReviewed = TRUE
LIMIT 100
```

## 注意事项

- 单蛋白用 BioPython，>100 蛋白/整蛋白组用 Google Cloud（并行快若干数量级）。
- 下游分析前务必先查 pLDDT，剔除 <50 的无序区，再做对接/接触图/结合位点预测。
- 多域蛋白用 PAE 而非仅 pLDDT 判断域朝向是否可信。
- 本地缓存已下载文件（同版本文件为静态），避免重复下载。
- 常见错误：`404`=该 UniProt 无预测；`429`=超速率限制，加 `time.sleep(0.2)` 或转 GCS；预测列表空=ID 不在库内或用规范同种型；`ModuleNotFoundError: Bio.PDB.alphafold_db`=升级 `biopython>=1.80`；GCS 失败=`gcloud auth login` 或用公共数据匿名访问。

## 互见

- autodock-vina：以 AlphaFold 结构为受体做分子对接。
- biopython：AlphaFold 之外的通用蛋白结构解析与分析。
- 参考：AlphaFold DB https://alphafold.ebi.ac.uk/ ；Jumper et al. (2021) Nature 596;583 ；Varadi et al. (2024) NAR 52,D368。

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
