---
name: busco-completeness-interpretation
title: BUSCO 组装完整度解读
description: 当需要解读 BUSCO 完整度结果（C/S/D/F/M/n）、跨基因组/转录组/蛋白组比较完整度、或撰写可发表的质控报告时使用；做谱系数据集选型、正确按 S+D 计完整度、解析 short_summary 与 full_table.tsv，产出可比的完整度统计与解读结论；不适用于跑变异检测（用 gatk-variant-calling）、读写 BAM/VCF（用 genomic-file-toolkit）、reads 级质控（用 fastp-fastq-preprocessing）。触发词：BUSCO、完整度、completeness、Duplicated、单拷贝、Fragmented、Missing、odb10、谱系数据集、组装质量、proteome
domain: 领域/science
triggers: [BUSCO, 完整度, completeness, Duplicated, 单拷贝, single-copy, Fragmented, Missing, odb10, 谱系数据集, lineage, 组装质量, proteome, transcriptome, short_summary, full_table]
tags: [busco, bioinformatics, genomics, qc, completeness, assembly, orthodb, proteome, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [BUSCO, Python, pandas]
requires: []
related: [nextflow-pipeline-builder, snakemake-workflow-engine, scikit-bio-sequence-toolkit, bulk-rnaseq-orchestrator]
combines_with: [bulk-rnaseq-orchestrator, samtools-bam-processing]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
# BUSCO 组装完整度解读

## 何时使用

当需要正确理解并报告 BUSCO（Benchmarking Universal Single-Copy Orthologs）完整度结果时使用本条，典型场景：

- 解读 BUSCO 输出的 `C:..%[S:..%,D:..%],F:..%,M:..%,n:..` 记号，搞清各类别含义与计数口径。
- 跨多个基因组/转录组/蛋白组比较完整度，做组装或注释质量基准。
- 为论文「方法」与「结果」撰写可复现、可发表的完整度报告。
- 排查异常结果：高 Duplicated、高 Fragmented、近零完整度的真实原因。
- 解析 `short_summary.*.txt` 与 `full_table.tsv` 做按基因（per-ortholog）的细粒度分析。

不该用本条的边界：

- 跑变异检测/联合分型 → 用 `gatk-variant-calling`，本条不做变异。
- 仅读写 BAM/VCF、抓区域、统计覆盖度 → 用 `genomic-file-toolkit`。
- reads 级质控（接头去除、质量过滤）→ 用 `fastp-fastq-preprocessing`；BUSCO 评估的是组装/注释产物，不是原始 reads。
- 本条聚焦「解读与报告」，BUSCO 的具体安装与逐参数调用细节请查官方 user guide。

核心纠错点：**最常见的错误是把 Duplicated 排除在完整度之外**——这会人为压低多倍体物种与含合法基因重复的组装得分。完整度恒为 S + D。

## 步骤

1. **选谱系数据集**：定位物种分类位置，选「能涵盖该物种的最具体」OrthoDB 数据集（越具体 BUSCO 标记越多、分辨率越高）；不确定时先 `busco --auto-lineage`（细菌用 `--auto-lineage-prok`）。
2. **按输入类型选模式**：基因组组装 → genome 模式；de novo 转录组 → transcriptome 模式（D% 通常偏高，正常）；预测蛋白组 → protein 模式。模式选错会得到误导性结果。
3. **跑 BUSCO 并记录元信息**：完整记录命令、BUSCO 版本、OrthoDB 数据集版本、非默认参数，供复现。
4. **解析 short summary**：从 `short_summary.*.txt` 提取 C/S/D/F/M/n 六个值（见示例正则）。
5. **正确计完整度**：完整 = Complete(single-copy) + Duplicated。务必 `Status.isin(['Complete','Duplicated'])`，不要只数 `== 'Complete'`。
6. **必要时下钻 full_table.tsv**：按 Status 计数，排查 Fragmented 是否聚集在特定区域/功能类。
7. **跨样本比较**：所有样本必须用**同一谱系数据集 + 同一 BUSCO 大版本**，否则结果不可比。
8. **报告**：四类别（S/D/F/M）全报 + 总数 n；方法段写明版本、数据集、模式；用 `generate_plot.py` 生成标准堆叠柱图。

**类别速查**（C% = S + D）：

| 状态 | 缩写 | 含义 | 计入完整？ |
|---|---|---|---|
| Complete single-copy | S | 恰好命中一次 | 是 |
| Duplicated | D | 命中多次（多拷贝，基因仍完整） | 是 |
| Fragmented | F | 部分匹配，基因模型可能不完整 | 否 |
| Missing | M | 完全未检出 | 否 |

**谱系选型**（取最具体且涵盖该物种者）：

| 物种类型 | 推荐谱系 | 示例数据集 | 备注 |
|---|---|---|---|
| 广义真核初筛 | eukaryota | `eukaryota_odb10`（255 标记） | 分辨率低，仅初查 |
| 脊椎动物 | 纲级 | `mammalia_odb10`（9226）、`actinopterygii_odb10` | 纲级分辨率更好 |
| 昆虫 | 目级 | `diptera_odb10`、`hymenoptera_odb10` | 有目级优先用 |
| 植物 | viridiplantae 或更具体 | `embryophyta_odb10`、`eudicots_odb10` | 多倍体常致高 D% |
| 真菌 | 门/纲级 | `ascomycota_odb10`、`basidiomycota_odb10` | 匹配已知系统发育位置 |
| 细菌 | 门级 | `proteobacteria_odb10` | 未知菌用 `--auto-lineage-prok` |

## 示例

short summary 记号格式：

```
C:95.0%[S:90.0%,D:5.0%],F:3.0%,M:2.0%,n:255
```

解析 short summary（正则提取六个值）：

```python
import re

def parse_busco_summary(filepath):
    """解析 BUSCO short_summary 文件，返回 C/S/D/F/M/n。"""
    with open(filepath) as f:
        text = f.read()
    m = re.search(
        r'C:(\d+\.?\d*)%\[S:(\d+\.?\d*)%,D:(\d+\.?\d*)%\],'
        r'F:(\d+\.?\d*)%,M:(\d+\.?\d*)%,n:(\d+)', text)
    if not m:
        return None
    return {
        'complete_pct':    float(m.group(1)),  # S + D
        'single_copy_pct': float(m.group(2)),
        'duplicated_pct':  float(m.group(3)),
        'fragmented_pct':  float(m.group(4)),
        'missing_pct':     float(m.group(5)),
        'total':           int(m.group(6)),
    }
```

正确计数 vs 错误计数（核心约束）：

```python
import pandas as pd
df = pd.read_csv('full_table.tsv', sep='\t', comment='#',
                 names=['Busco_id','Status','Sequence','Score','Length'])

# 错误：只把单拷贝当完整，漏掉 Duplicated
n_wrong = (df['Status'] == 'Complete').sum()

# 正确：单拷贝 + 多拷贝都算完整
n_complete = df['Status'].isin(['Complete', 'Duplicated']).sum()
print(f"complete (S+D) = {n_complete}")  # 应与 short summary 的 C% 对得上
```

完整度公式：

```
Completeness(%) = (Complete_single_copy + Duplicated) / Total_BUSCOs * 100
```

跨蛋白组统一口径比较：

```python
def compare_completeness(results: dict):
    """results: {名称: full_table 的 DataFrame}。返回按完整度降序的汇总表。"""
    rows = []
    for name, d in results.items():
        n_complete = d['Status'].isin(['Complete', 'Duplicated']).sum()
        n_total = len(d)
        rows.append({'name': name, 'complete': n_complete,
                     'total': n_total, 'pct': round(100*n_complete/n_total, 1)})
    out = pd.DataFrame(rows).sort_values('pct', ascending=False)
    print(out.to_string(index=False))
    return out
```

## 注意事项

- **Duplicated 必须计入完整**：D 代表直系同源基因「存在且完整、只是多拷贝」，可源于全基因组复制（植物、硬骨鱼、两栖类常见）、串联/片段复制、近期多倍化、蛋白组含多转录本异构体。斑马鱼（古多倍化硬骨鱼）常见 15–25% D，属预期。
- **高 D% 不必然是错误**：先核对物种已知倍性与复制史，并对照近缘已发表 BUSCO 结果；但单倍体细菌出现高 D% 可能提示未折叠单倍型或污染等组装假象。
- **谱系不可混用**：`eukaryota_odb10`（255）与 `insecta_odb10`（1367）搜索的直系同源集合不同，得分天然不可比；同一比较内所有样本统一数据集与版本。
- **谱系必须涵盖物种**：把真菌基因组跑 `insecta_odb10` 会得近零完整度——是数据集选错，不是组装差。不确定先 `--auto-lineage` 或查 OrthoDB 分类。
- **别忽略 Fragmented**：F% 高（如 >5–10%）常指向真实问题——基因模型截断、genic 区组装差、抛光不足，可考虑加抛光轮次。下钻 `full_table.tsv` 看 F 是否聚集。
- **版本差异不可比**：BUSCO v3/v4/v5 算法、数据集、阈值不同；比较时全样本重跑同一版本。
- **报告必带 n**：「95% 完整」脱离 n 是模糊的——95% of 255（eukaryota）与 95% of 9226（mammalia）含义迥异。统一用 `C:..%[S:..%,D:..%],F:..%,M:..%,n:..` 记号。

## 互见

- requires：`genomic-file-toolkit` —— 组装/注释的 FASTA、序列与索引处理是 BUSCO 的输入基础。
- related：`fastp-fastq-preprocessing` —— reads 级质控（上游）与 BUSCO 的产物级完整度（下游）互补；`star-rnaseq-aligner` —— 转录组组装常用 BUSCO transcriptome 模式评估完整度；`gatk-variant-calling` —— 同属基因组学分析家族，组装质量影响变异检出。
- combines_with：`nextflow-pipeline-builder`、`snakemake-workflow-engine` —— 把「选谱系→跑 BUSCO→解析汇总」各步包成可复现、可批量并行的工作流。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
