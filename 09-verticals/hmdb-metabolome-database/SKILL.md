---
name: hmdb-metabolome-database
title: HMDB 人类代谢组数据库
description: 当需查代谢物理化性质/通路/体液/疾病关联/谱图，或做质谱鉴定、HMDB↔KEGG/PubChem/ChEBI 转 ID 时使用；ElementTree 解析本地 ~6GB hmdb_metabolites.xml（无 REST API）产出结构化字段与候选表。不适用于在线化合物查询（用 pubchem-compound-search）。触发词：HMDB、代谢物、代谢组、生物标志物、质谱鉴定、谱图
domain: 领域/science
triggers: [HMDB, 代谢物, 代谢组, metabolite, metabolome, 生物标志物, biomarker, 质谱鉴定, m/z 匹配, 单同位素质量, SMILES, InChI, 通路, 生物体液, biofluid, 浓度参考范围, NMR, MS/MS, 谱图, ID 转换, ClassyFire]
tags: [science, 代谢组学, metabolomics, hmdb, 本地xml, 质谱, 生物标志物, id转换]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, xml.etree.ElementTree, lxml, pandas]
requires: []
related: [pubchem-compound-search, kegg-database, chembl-bioactivity-database, uniprot-protein-database, pyopenms-mass-spectrometry, opentargets-database]
combines_with: [pyopenms-mass-spectrometry, kegg-database, gene-set-enrichment-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

在 HMDB（人类代谢组数据库，22 万+ 代谢物条目）中查询信息时使用。HMDB **无编程用 REST API**，全部访问靠解析本地下载的 XML。典型场景：

- 按 HMDB ID 或名称查代谢物（描述、化学分类、细胞定位）。
- 取理化性质：分子式、平均/单同位素分子量、SMILES、InChI、InChIKey、状态。
- 找代谢物的通路关联与关联酶/蛋白（含 UniProt ID）。
- 定位代谢物的生物体液/组织（血、尿、脑脊液 CSF、唾液）。
- 查疾病关联与正常/异常浓度参考范围，用于生物标志物发现。
- 提取 NMR（¹H/¹³C 化学位移）或 MS/MS 峰列表做代谢物鉴定。
- 把 HMDB ID 转到 KEGG、PubChem、ChEBI、DrugBank、CAS 等。

**不该用本技能的边界：**
- **免下载的在线化合物理化查询** → 用 `pubchem-compound-search`（PubChemPy REST）。
- **药物专属数据**（相互作用、靶点、药理）→ 用 DrugBank 本地 XML（同类解析模式）。
- **完整 LC-MS/MS 处理管线**（特征检测、去卷积）→ 用 `pyopenms-mass-spectrometry`，HMDB 只做鉴定这一步。
- **谱库相似度打分** → 交 matchms 等，HMDB 仅提供参考谱图。

## 步骤 / 指令

1. **拿数据**：在 https://hmdb.ca/downloads 注册后下载 `hmdb_metabolites.xml.zip`（解压 ~6 GB）。另有 `structures.sdf`(~200 MB，仅结构)、`hmdb_proteins.fasta`(~50 MB)。
2. **装依赖**：`pip install lxml pandas`（`lxml` XPath 更快；标准库 `xml.etree.ElementTree` 也可）。本地解析无速率限制。
3. **命名空间是头号坑**：每个 `find()`/`findall()` 都要传 `NS = {'hmdb': 'http://www.hmdb.ca'}`，漏了一律返回空。
4. **一次解析建索引，绝不在循环里重解析**：全量解析需 60–120s、占 ~8–12 GB 内存。解析一次后建 `dict`（HMDB ID + 小写名 → 元素）。
5. **内存吃紧用 `iterparse`**：流式遍历，提完字段后 `elem.clear()` 释放，避免 `MemoryError`。**只在取完该条目全部字段后再 clear**。
6. **守空值**：很多可选字段缺失，访问前判 `el is not None and el.text`。
7. **质谱匹配用单同位素质量**：`monisotopic_molecular_weight` 才对；`average_molecular_weight` 留给其他计算。常用加合物：`[M+H]+ = +1.00728`、`[M+Na]+ = +22.9892`、`[M-H]- = -1.00728`。
8. **大规模搜索先按化学类预筛**：用 `taxonomy`（ClassyFire 本体）的 `super_class` 收窄，再遍历 22 万+ 条目。
9. **认准主登录号**：去重时用 `accession`（主键），不用 `secondary_accessions`。

**条目结构速查（XPath，均带 `hmdb:` 前缀）：**

| 区块 | 关键路径 | 内容 |
|---|---|---|
| 身份 | `accession` / `name` / `iupac_name` | 主标识符 |
| 化学结构 | `chemical_formula` / `smiles` / `inchi` / `inchikey` | 结构描述符 |
| 物性 | `average_molecular_weight` / `monisotopic_molecular_weight` / `state` | 分子量、状态 |
| 分类 | `taxonomy/{kingdom,super_class,class,sub_class,direct_parent}` | ClassyFire 化学本体 |
| 生物 | `biological_properties/biospecimen_locations/biospecimen`（及 `tissue_locations`、`cellular_locations`） | 体液/组织/细胞定位 |
| 通路 | `pathways/pathway/{name,smpdb_id,kegg_map_id}` | SMPDB + KEGG 通路 |
| 酶/蛋白 | `protein_associations/protein/{name,uniprot_id,gene_name}` | 关联蛋白 |
| 疾病 | `diseases/disease/{name,omim_id,references/reference/pubmed_id}` | 疾病关联 |
| 浓度 | `normal_concentrations` / `abnormal_concentrations` 下 `concentration/{biospecimen,concentration_value,concentration_units,subject_condition}` | 生物标志物参考范围 |
| 谱图 | `spectra/spectrum/{type,nucleus,ms_ms_peaks,nmr_one_d_peaks}` | NMR / MS/MS 峰 |
| 外部 ID | `kegg_id` / `pubchem_compound_id` / `chebi_id` / `drugbank_id` / `cas_registry_number` 等 | 跨库标识符 |

**字段覆盖率**（不是每条都全）：ID/名/式 ~100%；SMILES/InChI/MW ~90%；分类 ~85%；体液 ~60%；通路 ~40%；蛋白关联 ~35%；疾病 ~25%；正常浓度 ~20%；MS/MS ~15%；NMR ~10%。

## 示例

**建索引 + 按 ID/名查（一次解析，全程复用 `root`/`NS`）：**

```python
import xml.etree.ElementTree as ET
NS = {'hmdb': 'http://www.hmdb.ca'}
tree = ET.parse('hmdb_metabolites.xml')        # 60–120s
root = tree.getroot()

metabolite_index = {}
for met in root.findall('hmdb:metabolite', NS):
    acc = met.find('hmdb:accession', NS); nm = met.find('hmdb:name', NS)
    if acc is not None and acc.text: metabolite_index[acc.text] = met
    if nm is not None and nm.text:  metabolite_index[nm.text.lower()] = met

def find_metabolite(q):                          # 按 HMDB ID 或名（不分大小写）
    return metabolite_index.get(q) or metabolite_index.get(q.lower())

met = find_metabolite('HMDB0000122')             # 葡萄糖
print(met.find('hmdb:name', NS).text, met.find('hmdb:chemical_formula', NS).text)
# Glucose C6H12O6
```

**内存受限 — `iterparse` 流式提取：**

```python
met_names = {}
for event, elem in ET.iterparse('hmdb_metabolites.xml', events=('end',)):
    if elem.tag == '{http://www.hmdb.ca}metabolite':
        acc = elem.find('{http://www.hmdb.ca}accession')
        nm  = elem.find('{http://www.hmdb.ca}name')
        if acc is not None and nm is not None and acc.text and nm.text:
            met_names[acc.text] = nm.text
        elem.clear()                             # 取完字段后再释放
```

**理化性质 / 分类 / 通路 / 体液 / 酶（统一守空 + 命名空间）：**

```python
def txt(el, path):
    x = el.find(path, NS); return x.text if x is not None and x.text else None

def get_props(m):
    return {t: txt(m, f'hmdb:{t}') for t in
            ['accession','name','chemical_formula','average_molecular_weight',
             'monisotopic_molecular_weight','smiles','inchi','inchikey','state']}

def get_pathways(m):
    return [{'name': txt(pw,'hmdb:name'), 'smpdb_id': txt(pw,'hmdb:smpdb_id'),
             'kegg_map_id': txt(pw,'hmdb:kegg_map_id')}
            for pw in m.findall('hmdb:pathways/hmdb:pathway', NS)]

def get_biofluids(m):
    bp = 'hmdb:biological_properties/hmdb:'
    return [e.text for e in m.findall(f'{bp}biospecimen_locations/hmdb:biospecimen', NS) if e.text]

def get_enzymes(m):
    return [{'gene': txt(p,'hmdb:gene_name'), 'uniprot': txt(p,'hmdb:uniprot_id'),
             'name': txt(p,'hmdb:name')}
            for p in m.findall('hmdb:protein_associations/hmdb:protein', NS)]

g = find_metabolite('HMDB0000122')
print(get_props(g)['average_molecular_weight'], get_biofluids(g))
```

**跨库 ID 映射：**

```python
def get_external_ids(m):
    fields = {'kegg_id':'KEGG','pubchem_compound_id':'PubChem','chebi_id':'ChEBI',
              'drugbank_id':'DrugBank','cas_registry_number':'CAS','foodb_id':'FooDB','metlin_id':'METLIN'}
    return {lab: txt(m, f'hmdb:{tag}') for tag, lab in fields.items() if txt(m, f'hmdb:{tag}')}

print(get_external_ids(find_metabolite('HMDB0000122')))
# {'KEGG': 'C00031', 'PubChem': '5793', 'ChEBI': '17234', ...}
```

**工作流 1 — 质谱代谢物鉴定（实测 m/z → 候选）：**

```python
import pandas as pd
observed_mz, adduct, tol = 180.063, 1.00728, 0.01     # [M+H]+，葡萄糖
target = observed_mz - adduct
rows = []
for met in root.findall('hmdb:metabolite', NS):
    mw = txt(met, 'hmdb:monisotopic_molecular_weight')   # 用单同位素质量
    if not mw: continue
    d = abs(float(mw) - target)
    if d <= tol:
        rows.append({'hmdb_id': txt(met,'hmdb:accession'), 'name': txt(met,'hmdb:name'),
                     'mw': float(mw), 'delta': d, 'formula': txt(met,'hmdb:chemical_formula')})
print(pd.DataFrame(rows).sort_values('delta').head(10).to_string(index=False))
```

**工作流 2 — 某疾病的生物标志物（遍历找疾病关联 + 异常浓度计数）：**

```python
q = 'diabetes'; biomarkers = []
for met in root.findall('hmdb:metabolite', NS):
    for d in met.findall('hmdb:diseases/hmdb:disease', NS):
        dn = txt(d, 'hmdb:name')
        if not dn or q.lower() not in dn.lower(): continue
        ab = sum(1 for c in met.findall('hmdb:abnormal_concentrations/hmdb:concentration', NS)
                 if (txt(c,'hmdb:subject_condition') or '').lower().find(q) >= 0)
        biomarkers.append({'hmdb_id': txt(met,'hmdb:accession'),
                           'metabolite': txt(met,'hmdb:name'), 'abnormal': ab})
print(pd.DataFrame(biomarkers).drop_duplicates('hmdb_id')
        .sort_values('abnormal', ascending=False).head(15).to_string(index=False))
```

**谱图提取（MS/MS 峰、NMR 位移）：**

```python
def get_ms_peaks(m):
    out = []
    for s in m.findall('hmdb:spectra/hmdb:spectrum', NS):
        if 'MS' not in (txt(s,'hmdb:type') or ''): continue
        peaks = [{'mz': float(txt(p,'hmdb:mass_charge')), 'intensity': float(txt(p,'hmdb:intensity') or 0)}
                 for p in s.findall('hmdb:ms_ms_peaks/hmdb:ms_ms_peak', NS) if txt(p,'hmdb:mass_charge')]
        out.append({'type': txt(s,'hmdb:type'), 'num_peaks': len(peaks), 'peaks': peaks})
    return out
```

## 注意事项

- **漏命名空间 → `find()` 恒返回 `None`**：每次调用都带 `NS = {'hmdb': 'http://www.hmdb.ca'}`。
- **`MemoryError`**：全量入内存需 ~8–12 GB；改用 `ET.iterparse()` + `elem.clear()` 增量处理。
- **启动慢（>120s）**：只解析一次、建索引字典，循环里禁止重解析。
- **按名查不到**：大小写或同义词问题——统一转小写，或直接用 HMDB ID。
- **谱图为空属正常**：MS/MS ~15%、NMR ~10% 覆盖；缺谱时找 METLIN/MassBank 补。
- **浓度数据稀疏**：仅 ~20% 临床代谢物有参考范围；可交叉 MetaboAnalyst 或文献。
- **重复条目**：同化合物可能有次级登录号（`HMDB00XXXXX` vs `HMDB0000XXXX`）——用主 `accession` 去重。
- **`iterparse` 丢数据**：`elem.clear()` 调早了——务必在提完该元素全部字段之后再清。
- **MS 匹配别用平均分子量**：必须用 `monisotopic_molecular_weight`。
- **格式选型**：全字段访问用全量 XML；只要结构+基本属性可用 `structures.sdf`（~200 MB），更省内存。

## 互见

- requires：无。
- related：`pubchem-compound-search` —— 免下载的在线化合物理化查询；`kegg-database`、`uniprot-protein-database` —— 用 HMDB 外部 ID（`kegg_id`/`uniprot_id`）下钻通路与蛋白；`chembl-bioactivity-database`、`opentargets-database` —— 经 ID 桥接生物活性与疾病-靶点证据。
- combines_with：`pyopenms-mass-spectrometry` —— LC-MS/MS 全管线在前，HMDB 做代谢物鉴定步；`kegg-database` —— 用 `kegg_id` 接 KEGG 取通路背景；`gene-set-enrichment-analysis` —— 命中代谢物的通路集供富集分析。

参考：HMDB 主站 https://hmdb.ca/ ｜ 下载页 https://hmdb.ca/downloads ｜ Wishart DS et al. (2022) HMDB 5.0, *Nucleic Acids Res.* 50(D1):D801-D816, https://doi.org/10.1093/nar/gkab1062 ｜ MetaboAnalyst（互补工具）https://www.metaboanalyst.ca/

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
