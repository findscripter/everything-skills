---
name: viennarna-structure-prediction
title: ViennaRNA RNA 二级结构预测
description: 当需要预测 RNA 二级结构（MFE 折叠、配对概率、RNA-RNA 互作）用于 siRNA/sgRNA 靶点可及性、核酶/适配体设计、miRNA-靶标配对时使用；用 ViennaRNA Python 绑定（import RNA）或 RNAfold CLI 跑「序列→MFE→配分函数与配对概率→点括号→双链」流程并产出结构/能量/bpp 矩阵与图；不适用于三级结构/3D 建模、需 Mfold 算法或 RNAstructure 特定输出、蛋白结构；触发词：RNA 二级结构、ViennaRNA、RNAfold、MFE、点括号、配对概率、siRNA 可及性、sgRNA、RNAduplex、cofold
domain: 领域/science
triggers: [RNA 二级结构, ViennaRNA, RNAfold, MFE, 点括号, 配对概率, siRNA 可及性, sgRNA, RNAduplex, cofold, 适配体, 核酶]
tags: [rna, secondary-structure, viennarna, rnafold, mfe, base-pair-probability, sirna, sgrna, bioinformatics, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [viennarna, python, rnafold, numpy, matplotlib]
requires: []
related: [gget-genomic-databases, cheminformatics-toolkit, protein-language-models, scientific-database-lookup]
combines_with: [snakemake-workflow-engine, scientific-database-lookup]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要基于热力学最近邻参数（Turner 2004）预测 RNA 二级结构时使用本条，典型场景：

- 预测 RNA 序列（mRNA、lncRNA、miRNA 前体、适配体）的最小自由能（MFE）结构与点括号表示
- 计算配分函数得到**配对概率矩阵**（bpp），评估结构置信度、定位明确的茎环
- 评估 siRNA / 反义寡核苷酸效率：折叠靶 mRNA 区域、计算位点**可及性**（P(unpaired)）
- 评估 CRISPR sgRNA：检查 guide 自身二级结构是否折叠从而降低 Cas9 结合效率
- 建模 RNA-RNA 互作（cofold / duplex），用于 miRNA-靶标配对、反义寡核苷酸设计
- 批量比较一组序列的折叠自由能（稳定性排序）

**不该用本条的边界：**

- 需要 RNA 三级结构 / 3D 坐标建模 → 用专门的三级结构工具，ViennaRNA 只做二级结构
- 特定需要 **Mfold 算法** 或 **RNAstructure** 的 Efold 配分函数输出 → 用对应工具；ViennaRNA 用 Turner 2004 参数，是研究级热力学预测的标准
- 蛋白结构、序列比对、变体注释 → 用对应领域技能

## 步骤

1. 装环境：conda 装 viennarna（带 C 库），验证 `import RNA`
2. 序列归一化：大写、T→U、校验字母表（ACGUNX）
3. 基础折叠：`RNA.fold(seq)` 得 `(structure, mfe)`
4. 进阶分析建 `fc = RNA.fold_compound(seq)`，先 `fc.mfe()` 再 `fc.exp_params_rescale(mfe)` 再 `fc.pf()`，最后 `fc.bpp()` 取配对概率矩阵（1-indexed）
5. 按需求分支：可及性分析（siRNA）/ cofold（RNA-RNA）/ subopt（次优结构）/ 硬约束折叠
6. 可视化：bpp 热图、可及性柱状图、mountain plot
7. 批量场景用 `RNAfold` CLI（subprocess + 正则解析），或 `RNA.fold` 循环

## 指令

安装与验证：

```bash
conda install -c conda-forge -c bioconda viennarna   # conda 强烈推荐（自动处理 C 库）
python -c "import RNA; print(RNA.__version__)"        # 例：2.6.4
pip install matplotlib numpy pandas
RNAfold --version                                     # 可选：确认 CLI 可用
```

进阶分析的**固定调用顺序**（顺序错则 bpp 全零）：`fc.mfe()` → `fc.exp_params_rescale(mfe)` → `fc.pf()` → `fc.bpp()`。

关键模型参数（model detail）：`temperature`（默认 37℃，降温更稳）、`dangles`（默认 2=平均，多数场景用 2）、`noGU`（禁 G-U 摆动配对）、`noLP`（禁孤立配对，降噪）。`RNA.subopt` 的能量窗口 `delta` 单位为 10-cal（kcal/mol × 100）。

## 示例

基础 MFE 折叠 + 序列归一化与校验：

```python
import RNA

def prepare_sequence(seq: str) -> str:
    seq = seq.upper().replace("T", "U").strip()
    invalid = set(seq) - set("ACGUNX")
    if invalid:
        raise ValueError(f"非法字符: {invalid}")
    return seq

seq = prepare_sequence("GCGGAUUUAGCUCAGUUGGGAGAGCGCCAGACUGAAGAUCUGGAGGUCCUGUGUUCGAUCCACAGAAUUCGCACCA")
structure, mfe = RNA.fold(seq)            # E. coli tRNA-Phe
assert len(structure) == len(seq)
print(structure, f"{mfe:.2f} kcal/mol")  # (((((((..((((...))))...))))))).. -31.30
```

配分函数 + 配对概率矩阵（取高置信配对）：

```python
import numpy as np
fc = RNA.fold_compound(seq)
_, mfe = fc.mfe()
fc.exp_params_rescale(mfe)               # 重标 Boltzmann 因子，数值稳定
_, gibbs = fc.pf()                       # 系综 Gibbs 自由能
bpp = fc.bpp()                           # (n+1)x(n+1)，1-indexed
n = len(seq)
probs = np.zeros((n, n))
for i in range(1, n + 1):
    for j in range(i + 1, n + 1):
        if bpp[i][j] > 0:
            probs[i-1][j-1] = probs[j-1][i-1] = bpp[i][j]
high = [(i, j, probs[i, j]) for i in range(n) for j in range(i+1, n) if probs[i, j] > 0.9]
```

siRNA 可及性（每位点 P(unpaired)，越高越可及）：

```python
def accessibility(seq):
    n = len(seq); fc = RNA.fold_compound(seq)
    _, mfe = fc.mfe(); fc.exp_params_rescale(mfe); fc.pf(); bpp = fc.bpp()
    p_paired = np.zeros(n)
    for i in range(1, n+1):
        for j in range(1, n+1):
            if i != j:
                p_paired[i-1] += bpp[min(i,j)][max(i,j)]
    return 1.0 - np.clip(p_paired, 0, 1)
# 取 P(unpaired) 最高的位点作为 siRNA/ASO 候选靶点
```

RNA-RNA cofold（用 `&` 拼接两条链）：

```python
structure, mfe = RNA.cofold("UAGCUUAUCAGACUGAUGUUGA" + "&" + "UCAACAUCAGUCUGAUAAGCUA")
# 输出结构中保留 &；按各链长度切片解析跨链配对
```

CLI 批量折叠（subprocess + 正则解析）：

```python
import subprocess, re
def run_rnafold(seq):
    r = subprocess.run(["RNAfold", "--noPS"], input=seq,
                       capture_output=True, text=True, timeout=30)
    if r.returncode != 0:
        raise RuntimeError(r.stderr)
    last = r.stdout.strip().split("\n")[-1]        # 形如 "((....)) (-5.40)"
    m = re.match(r"^([.()\[\]{}<>|]+)\s+\((-?\d+\.\d+)\)$", last)
    return m.group(1), float(m.group(2))
```

```bash
echo "GCGGAUUUAGC...CACCA" | RNAfold          # stdin 单序列
RNAfold < seqs.fasta > out.txt                # 批量 FASTA
RNAfold --noPS < seqs.fasta                    # 抑制 PostScript 输出
RNAfold -p < seqs.fasta                        # 输出配对概率 dot plot（rna.ps）
```

次优结构 + 硬约束折叠：

```python
fc = RNA.fold_compound(seq)
RNA.hc_add_bp(fc, 1, 72)                        # 强制位点 1 与 72 配对（已知茎）
structure_c, mfe_c = fc.mfe()
subopt = RNA.subopt(seq, int(5.0 * 100))       # MFE 上方 5 kcal/mol 内的次优结构
for s in subopt[:3]:
    print(s.structure, s.energy / 100.0)        # energy 单位为 10-cal，除 100 得 kcal/mol
```

## 注意事项

- **调用顺序铁律**：同一 fold_compound 上必须先 `fc.mfe()`、再 `exp_params_rescale`、再 `fc.pf()`，否则 `fc.bpp()` 全零。
- **安装用 conda**：`pip install` 常因 C 库未链接而 `ImportError: No module named 'RNA'`；conda 环境记得先 activate 再跑脚本（否则 `RNAfold not found`）。
- **索引约定**：`bpp` 矩阵 1-indexed（`bpp[i][j]`=位点 i 与 j 配对概率），转 numpy 分析时注意 −1 偏移。
- **能量单位**：`RNA.subopt` 与 `s.energy` 单位是 10-cal，需 ÷100 得 kcal/mol；窗口 `delta` 传入也要 ×100。
- **短序列 MFE 可能为正**：<10 nt 或重复序列无有利配对时 MFE>0 属正常。
- **次优枚举会爆炸**：长/极稳定序列在 5 kcal/mol 窗口内可能上千条，长序列把 `delta` 降到 2~3。
- **cofold 异常配对**：若某条链自身折叠占主导会干扰双链，先单独折叠各链、看其个体 MFE 排查。
- T 由 ViennaRNA 自动转 U；字母表 ACGU（含 N/X）。

## 互见

- related：`genomic-file-toolkit` —— 处理 FASTA/序列文件 I/O
- related：`single-cell-rnaseq-analysis`、`scientific-database-lookup` —— RNA 数据获取与下游分析
- related：`cheminformatics-toolkit`、`molecular-dynamics-simulation` —— 同属分子/结构建模领域
- combines_with：`scientific-database-lookup` —— 先检索目标序列再做结构预测

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
