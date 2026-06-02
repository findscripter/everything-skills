---
name: depmap-crispr-essentiality
title: DepMap CRISPR 基因必需性分析
description: 当你用 DepMap CRISPR 基因效应（Chronos）数据分析基因必需性/依赖性，或把表达量与必需性做相关时使用；做符号纠正（负=必需）+ 逐基因 NaN-safe Spearman + 数据对齐，产出每基因相关系数表与阈值命中数；不适用于原始 gene effect 免取负、通路富集、变异致病性查询；触发词：DepMap、CRISPR、基因必需性、Chronos、essentiality
domain: 领域/science
triggers: [DepMap, CRISPR, 基因必需性, 基因依赖性, Chronos, gene effect, 必需性相关, essentiality, CRISPRGeneEffect, 取负符号约定, 逐基因 Spearman, NaN-safe 相关]
tags: [science, genomics, bioinformatics, depmap, crispr, essentiality, chronos, spearman, correlation, cancer-dependency]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pandas, numpy, scipy]
requires: []
related: [pydeseq2-differential-expression, gene-set-enrichment-analysis, guided-statistical-analysis, opentargets-database, scientific-database-lookup]
combines_with: [gene-set-enrichment-analysis, guided-statistical-analysis, pydeseq2-differential-expression]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你要正确解读与分析 **DepMap CRISPR 基因效应（Chronos）数据**，尤其是把表达量与「必需性 / 依赖性」做相关分析时使用本条。典型场景：

- 判断某基因在某细胞系是否为**必需基因**（敲除后活性下降）。
- 把表达量（或其他组学）与「必需性」逐基因做 Spearman 相关，找强相关基因。
- 在细胞系面板上按必需性给基因排序、找选择性必需基因。

**不该用的边界：**
- 问题问的是**原始 gene effect**（非「必需性 / 依赖性」）—— 直接用原始分数，**不要取负**。
- 通路 / 富集解读 —— 交 `gene-set-enrichment-analysis`。
- 变异致病性、群体频率、靶点-疾病关联 —— 交 `clinvar-database` / `gnomad-population-database` / `opentargets-database`。
- 通用 NaN-safe 相关与统计建议 —— 见 `guided-statistical-analysis`。

## 步骤 / 指令

DepMap 分析最高频、最致命的两个错误：(1) 算「必需性」相关时忘记给 CRISPR 分数取负；(2) 用整表捷径（`corrwith` / `rank().corrwith()`）算相关，对逐列 NaN 处理不一致。按下列决策流执行：

1. **判断符号约定**：问题出现「必需性 / essentiality / 依赖性 / dependency」→ 必须对 CRISPR 分数**取负**（原始约定：负分=必需）；问的是原始 gene effect → 不取负。
2. **加载数据**：`CRISPRGeneEffect.csv`（行=细胞系 `ACH-XXXXXX`，列=`基因名 (ENTREZ_ID)` 如 `A1BG (1)`，值含 NaN）；表达量同格式 `OmicsExpressionProteinCodingGenesTPMLogp1BatchCorrected.csv`。
3. **对齐**：先求行（细胞系）、列（基因）交集再取子集，避免错位静默出错。
4. **报告 NaN 摘要**：打印各表 NaN 总数、共同细胞系数、共同基因数，作为审计与排错线索。
5. **必要时取负**：`essentiality = -crispr_aligned`（取负后正值=更必需）。
6. **逐基因 Spearman + 配对去 NaN**：对每个基因单独 `scipy.stats.spearmanr`，掩码 `mask = ~(np.isnan(x) | np.isnan(y))`；有效对 `< 10` 则跳过（保守可设 20+）。**禁用** `DataFrame.corrwith` 和 `rank().corrwith()`。
7. **取阈值出结论 + 显式声明符号约定**：报告 `>= 0.6` / `<= -0.6` 命中数，并写明「CRISPR 分数已取负，正相关=高表达对应更必需」。

> 关键陷阱：若你对**原始**分数相关，得到 3 个基因 `<= -0.6`、0 个 `>= 0.6`，那么「与必需性强正相关」的正确答案是 **3** 而非 0 —— 原始负相关就是必需性正相关。

## 示例

```python
import pandas as pd, numpy as np
from scipy.stats import spearmanr

crispr = pd.read_csv('CRISPRGeneEffect.csv', index_col=0)
expr   = pd.read_csv('OmicsExpressionProteinCodingGenesTPMLogp1BatchCorrected.csv', index_col=0)

def per_gene_spearman(expr, crispr, negate=True, min_pairs=10):
    # 对齐：先交集再取子集（否则错位静默出错）
    lines = expr.index.intersection(crispr.index)
    genes = expr.columns.intersection(crispr.columns)
    expr, crispr = expr.loc[lines, genes], crispr.loc[lines, genes]
    if negate:
        crispr = -crispr  # DepMap：负=必需；取负后正=必需
    # NaN 摘要（分析前打印，便于排错）
    print(f"共同细胞系 {len(lines)} | 共同基因 {len(genes)} | "
          f"expr NaN {expr.isna().sum().sum()} | crispr NaN {crispr.isna().sum().sum()}")
    out = {}
    for g in genes:
        x, y = expr[g].values, crispr[g].values
        mask = ~(np.isnan(x) | np.isnan(y))   # 配对去 NaN，而非整表 dropna
        if mask.sum() < min_pairs:            # 有效对太少则跳过
            continue
        out[g], _ = spearmanr(x[mask], y[mask])
    return pd.Series(out).sort_values(ascending=False)

corr = per_gene_spearman(expr, crispr, negate=True)
thr = 0.6
print(f">= {thr}: {(corr >= thr).sum()} 个 | <= -{thr}: {(corr <= -thr).sum()} 个")
print("注：CRISPR 分数已取负，正相关=高表达对应更必需。")
```

反模式（出现即替换为上面的逐基因循环）：
```python
expr.rank().corrwith(crispr.rank())          # 错：整表 NaN 处理不可靠
expr.corrwith(crispr, method='spearman')     # 错：同上
```

## 注意事项

- **取负只在「必需性」语境**：原始约定负分=必需，反直觉；忘取负会让每个相关系数符号反转、结论全错。加注释 `# 负=必需`。
- **配对去 NaN，禁整表 dropna**：各基因缺失模式不同，全表 `dropna()` 会丢掉所有「任一列含 NaN」的细胞系，样本量骤降。
- **最小有效对阈值**：`< 10` 对的相关不稳定，按需调到 20+。
- **必须先对齐**：两表细胞系/基因集可能不同，不取交集会错配行或抛索引错。
- **列名格式**：DepMap 列是 `基因名 (ENTREZ_ID)`，拿纯符号（`TP53` 而非 `TP53 (7157)`）去 intersection 会得空集；先 `df.columns[:5]` 看格式，必要时 `df.columns.str.extract(r'^(.+?)\s*\(')[0]` 解析。
- **结果显式声明符号约定**：报告必带一句「CRISPR 分数已取负，正相关表示高表达对应更必需」，避免下游误读。
- 数据源与算法：DepMap Portal（depmap.org/portal）；Chronos 见 Dempster et al. 2019（doi:10.1038/s41467-019-09612-6）。

## 互见

- related：`pydeseq2-differential-expression`、`guided-statistical-analysis`、`opentargets-database`、`scientific-database-lookup`
- combines_with：`gene-set-enrichment-analysis` —— 把必需性强相关基因列表交富集，定位通路；`guided-statistical-analysis` —— NaN-safe 相关与多重检验校正的通用方法；`pydeseq2-differential-expression` —— 表达量上游来源

---
*采编自 [jaechang-hits/SciAgent-Skills](https://github.com/jaechang-hits/SciAgent-Skills)（CC-BY-4.0），适配重写为中文。*
