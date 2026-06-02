---
name: biopython-molecular-biology
title: Biopython 分子生物学工具箱
description: 当需要用 Python 批处理生物序列、解析转换 FASTA/GenBank/FASTQ/PDB 等格式、程序化检索 NCBI（GenBank/PubMed/Protein）、跑 BLAST、做双序列/多序列比对、解析 3D 蛋白结构或建系统发育树时使用；用 Biopython 各模块（Seq/SeqIO/Entrez/Blast/Align/PDB/Phylo/SeqUtils）写自定义流水线，产出序列统计、比对、结构度量、进化树等结果；不适用于读 SAM/BAM/CRAM（用 pysam）、单基因快速查询（用 gget）、多服务 REST 聚合（用 bioservices）。触发词：Biopython、Bio.Seq、SeqIO、Entrez、BLAST、Bio.PDB、Phylo、序列翻译、比对、系统发育
domain: 领域/science
triggers: [Biopython, Bio.Seq, SeqIO, Entrez, BLAST, Bio.PDB, Phylo, FASTA, GenBank, 序列翻译, 反向互补, 双序列比对, 多序列比对, 系统发育树, PubMed, GC含量, 限制酶, 蛋白结构]
tags: [biopython, bioinformatics, molecular-biology, sequence-analysis, ncbi, entrez, blast, alignment, pdb, phylogenetics, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, Biopython, NumPy, matplotlib, BLAST+, MUSCLE, pandas]
requires: []
related: [scikit-bio-sequence-toolkit, samtools-bam-processing, genomic-file-toolkit, gget-genomic-databases]
combines_with: [gget-genomic-databases, uniprot-protein-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当需要用 Python 写**自定义、可批处理**的分子生物学脚本时用本条，Biopython 是模块化工具箱（非单一流水线），典型场景：

- 解析/转换生物文件格式：FASTA、GenBank、FASTQ、PDB、mmCIF、PHYLIP。
- 程序化检索 NCBI：从 GenBank/PubMed/Protein 按 accession 或检索式拉序列、摘要、文献元数据。
- 跑并解析 BLAST：远程 NCBI（NCBIWWW）或本地 BLAST+。
- 双序列（global/local）或多序列比对，自定义打分矩阵与空位罚分。
- 分析 3D 蛋白结构：原子间距、二面角、结构叠合 RMSD、提取序列。
- 由比对建系统发育树（NJ/UPGMA）并可视化。
- 算序列统计：GC 含量、分子量、解链温度、蛋白等电点/不稳定指数等。
- 批量处理上千条序列做自定义过滤。

**不该用本条的边界**：

- 读 SAM/BAM/CRAM 比对、操作 mapped reads → 用 `pysam`。
- 高级生态多样性指标 → 用 `scikit-bio`。
- 只想快速查单个基因/转录本（一行命令级） → 用 `gget`，无需写流水线。
- 聚合多个生信 REST 服务 → 用 `bioservices`。

前置条件：Python 3.8+；`pip install biopython numpy matplotlib`（树可视化需 matplotlib）。NCBI Entrez 必须先设 `Entrez.email`；设 `Entrez.api_key` 可把限速从 3 req/s 提到 10 req/s。

## 步骤 / 指令

按需取用对应模块，常见组合：

1. **序列操作（Bio.Seq）**：`Seq(...)` 创建后 `.complement()`/`.reverse_complement()`/`.transcribe()`/`.translate()`；非标准遗传密码用 `translate(table=N)`（如线粒体 `table=2`），`to_stop=True` 在首个终止子停止。
2. **读写转换（Bio.SeqIO）**：`SeqIO.parse(path, fmt)` 迭代 SeqRecord；`SeqIO.write(records, ...)`；`SeqIO.convert(in, fmt1, out, fmt2)` 一步转格式；大文件用生成器流式过滤或 `SeqIO.index()` 随机访问。
3. **NCBI 访问（Bio.Entrez）**：先 `Entrez.email=...`；`esearch` 拿 ID 列表 → `efetch`/`esummary` 批量取记录；批量时 `time.sleep(0.4)` 控速。
4. **BLAST（Bio.Blast）**：远程 `NCBIWWW.qblast(program, db, seq, hitlist_size=N)` → `NCBIXML.read/parse` 解析；大规模用本地 BLAST+。
5. **双序列比对（Bio.Align）**：`PairwiseAligner()` 设 `mode`(global/local)、`match_score`/`mismatch_score`/`open_gap_score`/`extend_gap_score`，蛋白用 `substitution_matrix=substitution_matrices.load("BLOSUM62")`。
6. **结构分析（Bio.PDB）**：`PDBParser(QUIET=True).get_structure(id, path)`，按 SMCRA 层级遍历 Structure>Model>Chain>Residue>Atom；`atom1 - atom2` 得距离（Å）；`Superimposer` 算 RMSD。
7. **系统发育（Bio.Phylo）**：`AlignIO.read` 读比对 → `DistanceCalculator(model).get_distance()` → `DistanceTreeConstructor().nj()/.upgma()` → `Phylo.draw_ascii()` 看树、`Phylo.write(..., "newick")` 存树。
8. **序列工具（Bio.SeqUtils）**：`gc_fraction`、`molecular_weight`、`MeltingTemp.Tm_NN`；蛋白用 `ProtParam.ProteinAnalysis` 取 MW/pI/不稳定指数/GRAVY。

## 示例

序列基本操作与翻译（Bio.Seq）：

```python
from Bio.Seq import Seq
dna = Seq("ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG")
print(dna.reverse_complement())          # 反向互补
print(dna.translate())                   # MAIVMGR*KGAR*
print(dna.translate(to_stop=True))       # MAIVMGR（首个终止子停止）
print(dna.translate(table=2))            # 脊椎动物线粒体密码表
```

读取/过滤/转换（Bio.SeqIO，流式省内存）：

```python
from Bio import SeqIO
records = list(SeqIO.parse("sequences.fasta", "fasta"))
long_seqs = (r for r in SeqIO.parse("big.fasta", "fasta") if len(r.seq) >= 200)
SeqIO.write(long_seqs, "filtered.fasta", "fasta")     # 过滤 >=200bp
SeqIO.convert("input.gb", "genbank", "out.fasta", "fasta")  # GenBank→FASTA
idx = SeqIO.index("big.fasta", "fasta"); rec = idx["target_id"]  # 随机访问
```

从 NCBI 取 GenBank 记录（Bio.Entrez，必须先设 email）：

```python
from Bio import Entrez, SeqIO
Entrez.email = "your.email@example.com"   # 必填，否则被 NCBI 拒
h = Entrez.efetch(db="nucleotide", id="EU490707", rettype="gb", retmode="text")
record = SeqIO.read(h, "genbank"); h.close()
print(record.id, record.description, len(record.seq), "bp")
```

蛋白局部比对（Bio.Align + BLOSUM62）：

```python
from Bio import Align
from Bio.Align import substitution_matrices
aligner = Align.PairwiseAligner()
aligner.mode = "local"
aligner.substitution_matrix = substitution_matrices.load("BLOSUM62")
aligner.open_gap_score, aligner.extend_gap_score = -10, -0.5
alns = aligner.align("MVLSPADKTNVKAAWGKV", "MVHLTPEEKSAVTALWGKV")
print(alns.score); print(alns[0])
```

结构距离与叠合 RMSD（Bio.PDB）：

```python
from Bio.PDB import PDBParser, Superimposer
parser = PDBParser(QUIET=True)                 # QUIET 抑制非标准 PDB 告警
s1 = parser.get_structure("s1", "structure1.pdb")
s2 = parser.get_structure("s2", "structure2.pdb")
a1 = [r["CA"] for r in s1[0]["A"].get_residues() if "CA" in r]
a2 = [r["CA"] for r in s2[0]["A"].get_residues() if "CA" in r]
n = min(len(a1), len(a2))
sup = Superimposer(); sup.set_atoms(a1[:n], a2[:n]); sup.apply(s2.get_atoms())
print(f"RMSD: {sup.rms:.3f} Å over {n} CA")
```

端到端工作流（取基因→提 CDS→翻译→蛋白性质）：

```python
from Bio import Entrez, SeqIO
from Bio.SeqUtils import gc_fraction
from Bio.SeqUtils.ProtParam import ProteinAnalysis
Entrez.email = "your.email@example.com"
h = Entrez.efetch(db="nucleotide", id="NM_007294.4", rettype="gb", retmode="text")
rec = SeqIO.read(h, "genbank"); h.close()
cds = next(f for f in rec.features if f.type == "CDS")
cds_seq = cds.location.extract(rec).seq
prot = cds_seq.translate(to_stop=True)
print(f"CDS {len(cds_seq)}bp GC={gc_fraction(cds_seq):.2%} 蛋白 {len(prot)}aa")
a = ProteinAnalysis(str(prot))
print(f"MW={a.molecular_weight():.0f}Da pI={a.isoelectric_point():.2f} GRAVY={a.gravy():.3f}")
```

限制酶分析（Bio.Restriction，克隆设计常用）：

```python
from Bio.Seq import Seq
from Bio.Restriction import EcoRI, BamHI, HindIII, RestrictionBatch, Analysis
seq = Seq("GAATTCAAAGGATCCTTTTAAGCTTGGGAATTC")
print("EcoRI:", EcoRI.search(seq))               # 单酶切位点
res = Analysis(RestrictionBatch([EcoRI, BamHI, HindIII]), seq).full()  # 批量
for enz, sites in res.items():
    if sites: print(enz, sites)
```

## 注意事项

- **Entrez 必须设 email**，否则 NCBI 拒绝；批量请求加 `Entrez.api_key`（3→10 req/s）+ `time.sleep(0.4)`，否则 `HTTPError 429`。
- `HTTPError 400`：accession 无效或检索式不合法，先用 NCBI 网页核对。
- `SeqIO.read()` 报 `No records found`：文件空或 format 字符串错；用 `SeqIO.parse()` 先看有无记录、确认格式与内容一致。
- `SeqIO.index()` 报 `ValueError`：FASTA 有重复 ID，先去重（`SeqIO.to_dict()` 或预处理）。
- `translate()` 中间出现意外 `*`：阅读框错或遗传密码不对，检查起始位与 `table=N`。
- 结构解析告警（PDBConstructionWarning）：非标准原子/占有率问题，用 `PDBParser(QUIET=True)`；叠合要求两组原子数相同（代码里取 `min`）。
- 比对前序列必须已对齐才能喂给 `AlignIO`，否则 `sequences of different lengths`；先用 MUSCLE/Clustal 比对。
- BLAST 远程超时：限 `hitlist_size`，大规模改本地 BLAST+。
- `ImportError: No module named Bio`：`pip install biopython`，验证 `python -c "import Bio; print(Bio.__version__)"`。

## 互见

- requires：无（Biopython 自成体系，仅依赖 NumPy）。
- related：`genomic-file-toolkit` —— 同属生信文件处理；`gatk-variant-calling` —— 下游变异检测取本条产出的序列/比对；`single-cell-rnaseq-analysis`、`gene-set-enrichment-analysis` —— 基因组学分析家族近亲。
- combines_with：`snakemake-workflow-engine` / `nextflow-pipeline-builder` —— 把本条的取序列→BLAST→比对→建树各步包成可复现可并行的工作流；`scientific-database-lookup` —— 与 Entrez 检索互补做跨库查询。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
