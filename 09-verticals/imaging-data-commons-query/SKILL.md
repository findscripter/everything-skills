---
name: imaging-data-commons-query
title: NCI 影像数据公地查询下载
description: 当需要免认证检索/下载 NCI 影像数据公地（IDC）公开癌症影像（CT、MR、PET、病理切片）用于 AI 训练或科研时使用；用 idc-index 按元数据 SQL 查询、批量下载 DICOM、浏览器可视化、核对许可与生成引用；不适用于读写本地 DICOM 像素（用 dicom-medical-imaging）或私有/院内 PACS 数据。触发词：IDC、Imaging Data Commons、idc-index、癌症影像、公开 DICOM、影像数据集、TCGA 影像
domain: 领域/medical
triggers: [IDC, Imaging Data Commons, idc-index, 癌症影像, 公开DICOM, 影像数据集, TCGA影像, NCI影像]
tags: [idc, idc-index, imaging-data-commons, dicom, cancer-imaging, public-dataset, sql-query, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, idc-index, pydicom, pandas]
requires: []
related: [dicom-medical-imaging, histolab-wsi-tiling, scientific-database-lookup, pyhealth-clinical-dl]
combines_with: [dicom-medical-imaging, histolab-wsi-tiling, pyhealth-clinical-dl]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

适用：
- 查找 NCI 影像数据公地（IDC）中的公开放射影像（CT、MR、PET）或数字病理切片（SM）
- 按癌种、模态、解剖部位、厂商等元数据筛选影像子集，构建 AI 训练集
- 从 IDC 云存储批量下载 DICOM（免认证、免出口费）
- 用前核对数据许可（CC BY vs CC BY-NC）并生成署名引用
- 不下载本地，直接在浏览器（OHIF/SLIM）预览序列或整组检查

不该用：
- 读写/匿名化本地已下载的 DICOM 像素与标签 —— 用 `dicom-medical-imaging`
- 私有、院内或非 IDC 来源的影像（IDC 仅含公开数据集）
- 需要全量 DICOM 标签或私有元素的复杂查询 —— 退到 BigQuery（需 GCP 计费账号）

## 步骤

1. 装包并核对版本（**最先做**）：`pip install --upgrade idc-index`；用 `IDCClient().get_idc_version()` 确认数据版本（当前 v23），落后则升级。
2. 实例化 `client = IDCClient()`；`index`、`prior_versions_index` 自动加载，其余表需 `client.fetch_index("表名")`。
3. **先探值再过滤**：用 `sql_query` 对 `index` 做 `SELECT DISTINCT Modality/BodyPartExamined ... GROUP BY` 看真实可选值，再带验证过的值正式查询（始终先加 `LIMIT` 试跑）。
4. 选数据：癌种在 `collections_index.CancerTypes`（不在 `index`），需 JOIN；衍生标注/分割用 `analysis_results_index`、`seg_index`、`ann_index`。
5. 下载：`client.download_from_selection(collection_id=... 或 seriesInstanceUID=[...], downloadDir=..., dirTemplate=...)`；大集合分批（每批 10-20 个 series）防超时。
6. 可视化：`client.get_viewer_URL(seriesInstanceUID=...)` 或 `studyInstanceUID=...` 取浏览器链接。
7. 合规：查 `license_short_name`，并用 `client.citations_from_selection(...)` 生成引用（APA/BibTeX/JSON/Turtle）。

## 指令

```python
# 1) 版本核对
from idc_index import IDCClient
client = IDCClient()
print(client.get_idc_version())          # 期望 "v23"，落后则 pip install --upgrade idc-index

# 2) 探查可选过滤值（先探后查）
client.sql_query("""
  SELECT DISTINCT Modality, COUNT(*) AS n FROM index GROUP BY Modality ORDER BY n DESC
""")

# 3) 权威列/表结构：client.indices_overview（不必跑 SQL 即可查列与类型）
schema = client.indices_overview["index"]["schema"]
```

## 示例

按癌种 + 模态查（JOIN collections_index）：
```python
client.fetch_index("collections_index")
df = client.sql_query("""
  SELECT i.collection_id, i.PatientID, i.SeriesInstanceUID, i.Modality, i.license_short_name
  FROM index i JOIN collections_index c ON i.collection_id = c.collection_id
  WHERE c.CancerTypes LIKE '%Breast%' AND i.Modality = 'MR'
  LIMIT 20
""")
```

下载指定 series（自定义目录层级）：
```python
client.download_from_selection(
    seriesInstanceUID=list(df['SeriesInstanceUID'].values),
    downloadDir="./data/breast_mr",
    dirTemplate="%collection_id/%PatientID/%Modality")   # 默认含 %StudyInstanceUID 一级
```

命令行下载（装包后即有，自动识别 collection_id / UID / 清单文件）：
```bash
idc download rider_pilot --download-dir ./data
idc download "tcga_luad,tcga_lusc" --download-dir ./data
idc download manifest.txt --download-dir ./data   # 清单每行一个 s3:// URL
```

浏览器可视化 + 许可与引用：
```python
import webbrowser
webbrowser.open(client.get_viewer_URL(seriesInstanceUID=df.iloc[0]['SeriesInstanceUID']))
for c in client.citations_from_selection(collection_id="rider_pilot"):
    print(c)   # 默认 APA；citation_format=IDCClient.CITATION_FORMAT_BIBTEX 出 BibTeX
```

生成清单供复现/分批：
```python
urls = client.sql_query("SELECT series_aws_url FROM index WHERE collection_id='rider_pilot' AND Modality='CT'")
open('ct_manifest.txt','w').write('\n'.join(urls['series_aws_url']))
```

## 注意事项

- 数据分层：IDC 在 DICOM（Patient→Study→Series→Instance）之上加 `collection_id`（原始影像分组，一患者属一集合）与 `analysis_result_id`（跨集合的衍生分割/标注/影像组学）。
- 许可必查：约 97% 为 CC BY（可商用 + 署名），约 3% 为 CC BY-NC（仅非商用），个别自定义条款。发表/商用前务必查 `license_short_name` 并附引用。
- 体量预估：先估大小再下，部分集合达 TB 级；下载文件名是 `<crdc_instance_uuid>.dcm`（非 SOPInstanceUID），云路径 `s3://idc-open-data/<crdc_series_uuid>/<crdc_instance_uuid>.dcm`，可匿名访问、无出口费。
- 列/表以 `client.indices_overview` 为准（随安装版本变化）；外部 indices_reference 文档可能超前于本地版本。
- 报错对策：`ModuleNotFoundError` → `pip install --upgrade idc-index`；下载超时 → 减小批量、加重试；查无数据 → 先 `LIMIT 5` 试跑并核对字段名/版本；`BigQuery 配额/计费` → 改用本地 mini-index。
- 仅当 mini-index 与各专用索引（seg/ann/sm/collections）都无所需元数据（如逐段解剖名、SR 定量/定性测量）时，才动用 BigQuery。

## 互见

- related：`dicom-medical-imaging` —— 下载后读写/匿名化/三维重建本地 DICOM
- related：`genomic-file-toolkit`、`scientific-database-lookup` —— 配套科研数据获取
- combines_with：`guided-statistical-analysis`、`single-cell-rnaseq-analysis` —— 下游影像/组学分析流水线

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
