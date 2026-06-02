---
name: drugbank-database-access
title: DrugBank 药物数据库解析
description: 当需要从本地 DrugBank XML 离线查询药物信息、药物相互作用(DDI)、靶点/酶/转运体或化学性质时使用;做按 ID/名称/CAS 检索、提取带严重度的 DDI、映射靶点与外部库 ID、算 SMILES 相似度,产出结构化药物数据/表格。不适用于实时生物活性(IC50/Ki 用 chembl)或免下载库的化合物属性查询(用 pubchem)。触发词:DrugBank、药物相互作用、药物靶点
domain: 领域/science
triggers: [DrugBank, 药物数据库, 药物相互作用, DDI, 药物靶点, drugbank xml, drug interaction, 联合用药安全, SMILES 相似度, 药物外部库映射]
tags: [领域/science, structural-biology-drug-discovery, database, drug-discovery, cheminformatics, xml-parsing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, xml.etree.ElementTree, lxml, rdkit, pandas]
requires: []
related: [ddinter-drug-interactions, gtopdb-pharmacology-database, clinpgx-pharmacogenomics-database, pubchem-compound-search]
combines_with: [chembl-bioactivity-database, rdkit-cheminformatics, opentargets-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用场景:
- 按 DrugBank ID、药名或 CAS 号查询药物的描述、适应症、作用机制、药理学信息。
- 检查药物-药物相互作用(DDI)及严重度分级,做联合用药(polypharmacy)安全筛查。
- 提取药物的靶点、酶、转运体、载体,并带 UniProt 登录号、基因名。
- 取化学性质(SMILES、InChI、分子量、logP 等)做化学信息学分析。
- 把 DrugBank 条目映射到 PubChem、ChEMBL、UniProt、KEGG 等外部库。
- 用分子指纹算药物间 Tanimoto 相似度、构建相似度矩阵。

不该用的边界:
- 需要实时生物活性数据(IC50、Ki、EC50)→ 用 `chembl-database-bioactivity`,本技能只读静态药物目录。
- 只想查单个化合物属性、不想下载整个数据库 → 用 `pubchem-compound-search`。
- 需要 3D 构象、高级指纹等超出 DrugBank 自带性质的分析 → 用 rdkit 完整工具链。
- REST API 仅 3000 次/月(开发层),批量工作一律走本地 XML,勿循环打 API。

## 步骤 / 指令

### 1. 前置准备
- DrugBank 账号:在 https://go.drugbank.com/ 注册(学术免费)。
- 下载 `drugbank_all_full_database.xml.zip`(解压后约 1.5 GB)。
- 安装依赖:
```bash
pip install lxml pandas
pip install rdkit-pypi          # 化学相似度
pip install drugbank-downloader  # 可选,编程式下载 XML
```

### 2. 解析一次,建内存索引(关键)
全量 XML 解析需 30-60 秒。务必只解析一次并建立 `{ID/小写名 → element}` 索引,绝不在循环内重复解析。

```python
import xml.etree.ElementTree as ET

NS = {'db': 'http://www.drugbank.ca'}  # 所有 XPath 查询都必须带命名空间

tree = ET.parse('drugbank_all_full_database.xml')
root = tree.getroot()

drug_index = {}
for drug in root.findall('db:drug', NS):
    db_id = drug.find('db:drugbank-id[@primary="true"]', NS)
    name = drug.find('db:name', NS)
    if db_id is not None and name is not None:
        drug_index[db_id.text] = drug
        drug_index[name.text.lower()] = drug

def find_drug(query):
    """按 DrugBank ID、药名(不区分大小写)或 CAS 号查找。"""
    result = drug_index.get(query) or drug_index.get(query.lower())
    if result is not None:
        return result
    for drug in root.findall('db:drug', NS):  # CAS 兜底
        cas = drug.find('db:cas-number', NS)
        if cas is not None and cas.text == query:
            return drug
    return None
```

内存受限时用 `iterparse` + `elem.clear()` 边解析边释放,标签需写完整 URI `{http://www.drugbank.ca}drug`。

### 3. 选取需要的能力模块
- 药物信息:`get_drug_info()` 抽取描述/适应症/机制/分组(见示例)。
- DDI:`get_interactions()` + `classify_severity()` 分级 major/moderate/minor。
- 靶点:`get_targets(drug, target_type)`,`target_type` ∈ `targets`/`enzymes`/`transporters`/`carriers`。
- 化学性质:`get_property(drug, 'SMILES')`、`get_all_properties()`。
- 外部库映射:`get_external_ids()`。

### 4. 验证与导出
- 用 pandas 把结果落成 DataFrame/CSV;严重度排序输出联合用药报告。

## 示例

### 抽取药物信息
```python
def get_drug_info(drug_element):
    def txt(path):
        el = drug_element.find(path, NS)
        return el.text if el is not None and el.text else None
    return {
        'drugbank_id': txt('db:drugbank-id[@primary="true"]'),
        'name': txt('db:name'),
        'type': drug_element.get('type'),
        'description': txt('db:description'),
        'indication': txt('db:indication'),
        'mechanism_of_action': txt('db:mechanism-of-action'),
        'cas_number': txt('db:cas-number'),
        'groups': [g.text for g in drug_element.findall('db:groups/db:group', NS)],
    }
```

### DDI 提取与严重度分级
```python
def get_interactions(drug_element):
    return [{
        'drugbank_id': i.find('db:drugbank-id', NS).text,
        'name': i.find('db:name', NS).text,
        'description': i.find('db:description', NS).text,
    } for i in drug_element.findall('db:drug-interactions/db:drug-interaction', NS)]

def classify_severity(description):
    if not description:
        return 'unknown'
    dl = description.lower()
    if any(w in dl for w in ['contraindicated', 'avoid', 'fatal', 'life-threatening']):
        return 'major'
    if any(w in dl for w in ['increase', 'decrease', 'enhance', 'reduce', 'alter']):
        return 'moderate'
    return 'minor'
```

### 靶点与外部库映射
```python
def get_targets(drug_element, target_type='targets'):
    results = []
    for target in drug_element.findall(f'db:{target_type}/db:{target_type[:-1]}', NS):
        t = {
            'name': (target.find('db:name', NS).text
                     if target.find('db:name', NS) is not None else None),
            'actions': [a.text for a in target.findall('db:actions/db:action', NS) if a.text],
        }
        poly = target.find('db:polypeptide', NS)
        if poly is not None:
            t['uniprot_id'] = poly.get('id')
            gene = poly.find('db:gene-name', NS)
            t['gene_name'] = gene.text if gene is not None else None
        results.append(t)
    return results

def get_external_ids(drug_element):
    ids = {}
    for ident in drug_element.findall('db:external-identifiers/db:external-identifier', NS):
        resource = ident.find('db:resource', NS)
        identifier = ident.find('db:identifier', NS)
        if resource is not None and identifier is not None:
            ids[resource.text] = identifier.text
    return ids
# 常见 resource 名:'PubChem Compound'、'ChEMBL'、'KEGG Drug'、'UniProtKB'、'PharmGKB'、'ChEBI'
```

### 化学相似度(RDKit Morgan 指纹)
```python
from rdkit import Chem
from rdkit.Chem import AllChem, DataStructs

def get_property(drug_element, kind_name, section='calculated'):
    for prop in drug_element.findall(f'db:{section}-properties/db:property', NS):
        kind = prop.find('db:kind', NS)
        if kind is not None and kind.text == kind_name:
            return prop.find('db:value', NS).text
    return None

def drug_similarity(d1, d2, radius=2, nbits=2048):  # radius=2 即 ECFP4
    smi1, smi2 = get_property(d1, 'SMILES'), get_property(d2, 'SMILES')
    if not smi1 or not smi2:
        return None
    mol1, mol2 = Chem.MolFromSmiles(smi1), Chem.MolFromSmiles(smi2)
    if mol1 is None or mol2 is None:
        return None
    fp1 = AllChem.GetMorganFingerprintAsBitVect(mol1, radius, nBits=nbits)
    fp2 = AllChem.GetMorganFingerprintAsBitVect(mol2, radius, nBits=nbits)
    return DataStructs.TanimotoSimilarity(fp1, fp2)
```

### 工作流:联合用药安全筛查
预先建 `{drug_id: {interacting_id: desc}}` 相互作用映射,再两两比对并按严重度排序输出:
```python
medications = ['Warfarin', 'Aspirin', 'Omeprazole', 'Atorvastatin', 'Metformin']
# 1) 建 idx{小写名->id} 与 inter_map{id->{id:desc}}
# 2) med 两两组合查 inter_map,命中则 classify_severity 分级
# 3) pd.DataFrame(report).sort_values('Severity') 输出
```
Lipinski 五规则过滤:从 `get_all_properties()` 取 MW、logP、HBA、HBD,统计 `MW>500 / logP>5 / HBA>10 / HBD>5` 违规数,违规 ≤1 视为通过。

## 注意事项

- 命名空间是第一坑:每个 `find()`/`findall()` 都要传 `NS={'db':'http://www.drugbank.ca'}`,漏掉则返回空。`iterparse` 用完整 URI。
- `@primary="true"` 用于选主 ID(DB00XXX),区别于次要 ID。
- 防 None:并非所有药物都有全部字段,取 `.text` 前先判 `el is not None`,否则 `AttributeError`。
- 优先用 calculated 而非 experimental 性质(SMILES、logP、MW 几乎全覆盖);生物技术/蛋白类药物 `drug.get('type')=='biotech'`,无小分子性质,`calculated-properties` 为空属正常。
- `MemoryError`(全量约占 2-3 GB)→ 改用 `iterparse` + `elem.clear()`。
- XML 中相互作用可能不对称,需双向检查或建对称索引。
- REST API 返回 `429` 即超速率限制,批量改走本地 XML。
- 关键 XPath 速查:DDI=`db:drug-interactions/db:drug-interaction`;靶点=`db:targets/db:target`;通路=`db:pathways/db:pathway`(SMPDB);性质=`db:calculated-properties`/`db:experimental-properties`;外部 ID=`db:external-identifiers`。

## 互见

- chembl-database-bioactivity — 实时生物活性库(IC50/Ki/EC50),补足 DrugBank 静态目录。
- pubchem-compound-search — 公共化合物属性查询,无需下载数据库。
- rdkit 化学信息学 — 3D 构象、高级指纹、超出 DrugBank 自带性质的描述符计算。

---
采编自 jaechang-hits/SciAgent-Skills(CC-BY-4.0)。原条目:structural-biology-drug-discovery/drugbank-database-access。参考:DrugBank 5.0,Wishart DS et al. (2018), Nucleic Acids Res. 46(D1):D1074-D1082;XML schema https://docs.drugbank.com/xml/。
