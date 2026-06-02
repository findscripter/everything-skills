---
name: medchem-compound-triage
title: 药物化学过滤与化合物筛选
description: 当需要对化合物库做药物化学过滤、初筛或优先级排序时使用；用 medchem（datamol/RDKit）施加成药性规则、结构警示、复杂度阈值与查询语言，产出可审计的通过/淘汰结果（DataFrame 或布尔掩码）；不适用于纯属性范围卡阈值（用 RuleFilters/描述符）、活性预测、对接打分、合成路线规划。触发词：药物化学过滤、成药性、Lipinski、PAINS、NIBR、复杂度、化合物筛选。
domain: 领域/medical
triggers: [药物化学过滤, 成药性规则, 化合物库初筛, Lipinski 五规则, PAINS 结构警示, NIBR 过滤, 分子复杂度, medchem, datamol, 苗头到先导, 化合物优先级排序, 结构警示目录]
tags: [药物化学, 化合物筛选, 成药性, 结构警示, PAINS, NIBR, 分子复杂度, datamol, RDKit, cheminformatics, drug-discovery, medchem]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Write, Edit]
requires: []
related: [rdkit-cheminformatics, datamol-cheminformatics, cheminformatics-toolkit, molfeat-molecular-featurization]
combines_with: [rdkit-cheminformatics, deepchem-drug-discovery]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

需要对化合物库做**药物化学过滤与优先级排序**时使用：

- 施加成药性/类药规则（Lipinski 五规则、Veber、CNS、lead-like 等）到化合物库
- 用结构警示目录（PAINS、Brenk、NIBR 诺华筛选库规则、ChEMBL 常见警示）剔除问题分子
- 苗头到先导（hit-to-lead）、先导优化阶段的多准则过滤
- 对照 ZINC-15 百分位阈值计算分子复杂度（Bertz、SAS、QED 等）
- 检测官能团 / 命名子结构集合（特权骨架、共价弹头等）
- 用 medchem 查询语言组合多准则过滤器

**不该用的边界（负边界）：**
- 仅需按单一属性范围（MW / LogP / TPSA 上下限）卡阈值 —— 直接用 `RuleFilters` 或 `mc.rules.list_descriptors()` 取描述符，不必引入完整警示流水线。
- 需要**活性/毒性的定量预测、分子对接打分、QSAR 建模、合成可行性/逆合成规划** —— 本技能只做基于规则与目录的「软」分流，不做预测建模。
- 警示是**情境化经验准则**而非硬判据：上市药常违反 Ro5，前药与天然产物是常见例外，必须结合靶点知识与领域判断，不能机械淘汰。

## 步骤

1. **安装环境**：Python ≥ 3.9，安装 medchem 与 datamol（自动带 RDKit）。
2. **载入分子**：从 CSV/SDF 读 SMILES，用 `dm.to_mol(s)` 转为 mol 列表。
3. **选过滤手段**：按目标选规则 / 结构警示 / 命名目录 / 复杂度 / 查询语言（可组合）。
4. **批量执行**：大库（>1000）传 `n_jobs=-1` 并行；`progress=True` 看进度。
5. **辨别返回类型**：`RuleFilters` 与 `structural.*` 类返回 **pandas DataFrame**；`functional.*` 一站式包装返回**布尔掩码**（True = 通过）。
6. **留痕导出**：保留 `status`、`reasons`、`severity` 等列用于审计，落盘 CSV。

## 指令

**版本基线**：示例对齐 medchem 2.0.5（PyPI stable, 2024-11）。

安装：

```bash
uv pip install medchem datamol
```

可选 —— Eli Lilly demerit 过滤器（需 conda-forge 原生二进制）：

```bash
mamba install -c conda-forge lilly-medchem-rules
```

**1）成药性规则（`medchem.rules`）**

```python
import datamol as dm
import medchem as mc

# 列出可用规则
mc.rules.RuleFilters.list_available_rules_names()
# ['rule_of_five', 'rule_of_five_beyond', 'rule_of_four', 'rule_of_three', ...]

# 单分子单规则
smiles = "CC(=O)OC1=CC=CC=C1C(=O)O"  # 阿司匹林
mc.rules.basic_rules.rule_of_five(smiles)   # True
mc.rules.basic_rules.rule_of_cns(smiles)    # True

# 多规则批量（返回 DataFrame）
mols = [dm.to_mol(s) for s in smiles_list]
rfilter = mc.rules.RuleFilters(
    rule_list=["rule_of_five", "rule_of_oprea", "rule_of_cns", "rule_of_leadlike_soft"]
)
df = rfilter(mols=mols, n_jobs=-1, progress=True, keep_props=False)
# 列：mol, pass_all, pass_any, rule_of_five, ...
passing = df[df["pass_all"]]
```

`keep_props=True` 会把算出的描述符（`mw`、`clogp`、`tpsa` 等）一并写入结果。

**2）结构警示（`medchem.structural`，返回 DataFrame）**

```python
# ChEMBL 常见警示
alert_filter = mc.structural.CommonAlertsFilters()
df = alert_filter(mols=mol_list, n_jobs=-1, progress=True)
# 列：mol, pass_filter, status, reasons
clean = df[df["pass_filter"]]

# NIBR（诺华筛选库策展）
nibr_filter = mc.structural.NIBRFilters()
df = nibr_filter(mols=mol_list, n_jobs=-1, progress=True)
# 列：mol, pass_filter, status, severity, reasons, n_covalent_motif, special_mol
```

约束：NIBR 默认排除 `severity >= 10` 的化合物（见 NIBR 原文）。

**3）命名目录（PAINS / Brenk 等）**

```python
mc.catalogs.list_named_catalogs()
# ['tox', 'pains', 'pains_a', 'brenk', 'nibr', 'zinc', ...]

# 函数式 API：True = 分子通过（未命中警示）
passes = mc.functional.alert_filter(mols=mol_list, alerts=["pains"], n_jobs=-1)
```

**4）函数式一站式 API（返回布尔掩码，True = 通过）**

```python
mc.functional.rules_filter(mols=mol_list, rules=["rule_of_five", "rule_of_cns"], n_jobs=-1)
mc.functional.nibr_filter(mols=mol_list, max_severity=10, n_jobs=-1)
mc.functional.alert_filter(mols=mol_list, alerts=["pains", "brenk"], n_jobs=-1)
mc.functional.complexity_filter(mols=mol_list, complexity_metric="bertz", limit="99", n_jobs=-1)
```

其他：`catalog_filter`、`chemical_group_filter`、`lilly_demerit_filter`（需可选二进制，默认 max demerits=160）、`macrocycle_filter`、`bredt_filter`、`protecting_groups_filter` 等。

**5）化学基团（`medchem.groups`）**

```python
mc.groups.list_default_chemical_groups()
# ['privileged_scaffolds', 'common_warhead_covalent_inhibitors', 'rings_in_drugs', ...]
group = mc.groups.ChemicalGroup(groups=["privileged_scaffolds"])
group.has_match(mol)      # bool
group.get_matches(mol)    # {基团: 原子索引}
# 返回「不匹配该基团」的分子
mc.functional.chemical_group_filter(mols=mol_list, chemical_group=group, n_jobs=-1)
```

自定义基团可经 `groups_db` 从 CSV 载入（含 `smiles`/`smarts`、`name`、`group` 列）。

**6）分子复杂度（对照 ZINC-15 百分位阈值）**

```python
cf = mc.complexity.ComplexityFilter(limit="99", complexity_metric="bertz")
cf(mol)  # 低于 99 百分位阈值则 True
# 度量可选：bertz, sas, qed, whitlock, barone, smcm, twc
```

**7）查询语言（`medchem.query.QueryFilter`，返回 list[bool]）**

```python
qf = mc.query.QueryFilter('MATCHRULE("rule_of_five") AND NOT HASALERT("pains")')
mask = qf(mols=mol_list, n_jobs=-1)

qf = mc.query.QueryFilter('MATCHRULE("rule_of_cns") AND HASPROP("tpsa", <=, 90)')
mask = qf(mols=mol_list, n_jobs=-1)
```

查询语法：`MATCHRULE("...")` 应用命名规则；`HASALERT("pains")` 命中命名目录；`HASPROP("mw", <, 500)`（比较符不加引号）；`HASGROUP("...")` 化学基团；`HASSUBSTRUCTURE("c1ccccc1")` 子结构；逻辑符 `AND`/`OR`/`NOT`。列描述符：`mc.rules.list_descriptors()`。

## 示例

**模式 1：化合物库初筛**

```python
import datamol as dm, medchem as mc, pandas as pd

df = pd.read_csv("compounds.csv")
mols = [dm.to_mol(s) for s in df["smiles"]]

rules_df = mc.rules.RuleFilters(rule_list=["rule_of_five", "rule_of_veber"])(mols=mols, n_jobs=-1)
qf = mc.query.QueryFilter('MATCHRULE("rule_of_five") AND NOT HASALERT("pains")')
pass_mask = qf(mols=mols, n_jobs=-1)

df["passes_rules"] = rules_df["pass_all"].values
df["drug_like"] = pass_mask
df[df["drug_like"]].to_csv("filtered_compounds.csv", index=False)
```

**模式 2：先导优化多准则过滤**

```python
rules_df = mc.rules.RuleFilters(rule_list=["rule_of_leadlike_soft"])(mols=candidates, n_jobs=-1)
nibr_df = mc.structural.NIBRFilters()(mols=candidates, n_jobs=-1)
complex_mask = mc.functional.complexity_filter(mols=candidates, complexity_metric="bertz", limit="95", n_jobs=-1)

passes = rules_df["pass_all"] & nibr_df["pass_filter"] & complex_mask
```

**模式 3：检测官能团（如共价弹头）**

```python
group = mc.groups.ChemicalGroup(groups=["common_warhead_covalent_inhibitors"])
warhead_mols = [m for m in mol_list if group.has_match(m)]
```

**批量脚本（源仓库 scripts/filter_molecules.py，支持 CSV/TSV/SDF/SMILES）**

```bash
uv run python scripts/filter_molecules.py input.csv \
  --rules rule_of_five,rule_of_cns --pains --nibr --output filtered.csv
```

## 注意事项

1. **情境优先**：上市药常违反 Ro5；前药、天然产物是常见例外，别机械淘汰。
2. **组合使用**：规则 + 警示目录 + 复杂度阈值协同效果最好，单一维度易误杀。
3. **务必并行**：库 >1000 分子时传 `n_jobs=-1`。
4. **核对返回类型**：`RuleFilters` 与 `structural.*` 类返回 DataFrame；`functional.*` 返回布尔数组；`QueryFilter` 返回 list[bool]。混用易出错。
5. **Lilly demerits 为可选**：需单独装 `lilly-medchem-rules`，函数式 API 默认 max demerits=160。
6. **保留审计列**：留存 `status`、`reasons`、`severity`，便于追溯过滤决策。

## 互见

- 官方文档：https://medchem-docs.datamol.io/
- GitHub：https://github.com/datamol-io/medchem ｜ PyPI：medchem 2.0.5
- 源仓库参考文件：`references/api_guide.md`（逐模块 API 与返回类型）、`references/rules_catalog.md`（规则/警示/复杂度度量清单与选型指引）

---

采编自 K-Dense-AI/scientific-agent-skills（MIT）。底层库 medchem 由 datamol-io 发布（Apache-2.0）。
