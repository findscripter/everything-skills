---
name: citation-management
title: 研究写作引文系统化管理
description: 当撰写论文/学位论文需要系统管理参考文献时使用；做学术检索、元数据提取、引文校验并产出规范 BibTeX 与校验报告；不适用于正文叙事写作或非学术文档排版。触发词：BibTeX、DOI、引文管理、参考文献、PubMed
domain: 文书/writing
triggers: [BibTeX, DOI, 引文管理, 参考文献, 文献检索, PubMed, Google Scholar, arXiv, PMID, 引文校验, 去重, 元数据提取, bibliography]
tags: [文书, misc, 学术写作, 引文管理, BibTeX, 文献检索, 元数据, 校验]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [search_google_scholar.py, search_pubmed.py, extract_metadata.py, doi_to_bibtex.py, format_bibtex.py, validate_citations.py]
requires: []
related: [scientific-database-lookup, academic-paper-writer, scientific-manuscript-writing, fact-checking]
combines_with: [academic-paper-writer, scientific-manuscript-writing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

在研究与写作全过程中系统化管理引文时使用，典型场景：

- 在 Google Scholar / PubMed 检索特定主题或高被引论文
- 把 DOI、PMID、arXiv ID 或 URL 转换为规范 BibTeX
- 提取完整元数据（作者、标题、期刊、年份、卷期页码、DOI 等）
- 校验既有引文的准确性与完整性、检测重复条目
- 清洗、排序、统一格式化 .bib 文件
- 为论文、学位论文构建可复现的参考文献库

不该用的边界：

- 仅做正文叙事写作、文章结构编排（属写作类技能，本技能只管引文层）
- 非学术文档的普通参考链接整理、网页书签管理
- 需要绕过出版商付费墙获取全文（本技能只处理元数据，不抓全文）
- 输入标识符（DOI/PMID 等）、API 权限或成功标准缺失时，应先停下确认而非臆造

## 步骤

引文管理遵循五阶段流程：

1. 检索发现：用 Google Scholar（跨学科覆盖最广）或 PubMed（生物医学，3500 万+ 条目）按主题、作者、年份、刊物检索，导出 JSON/BibTeX。
2. 元数据提取：把论文标识符转为完整准确元数据。优先用 DOI（最可靠），经 CrossRef / PubMed E-utilities / arXiv / DataCite 等 API 拉取。
3. BibTeX 格式化：生成干净、字段顺序统一、标题大小写用 `{}` 保护、页码用 `--` 的条目。
4. 引文校验：核验 DOI 可解析、必填字段齐全、数据一致（年份 4 位、卷期为数字、页码格式正确）、无重复、语法合规。
5. 写作集成：合并、去重、排序、校验后导出最终 .bib，在 LaTeX 中 `\bibliography{final_references}` 引用。

## 指令

检索（Google Scholar / PubMed）：

```bash
# 主题检索 + 年份过滤
python scripts/search_google_scholar.py "machine learning protein folding" \
  --year-start 2020 --year-end 2024 --limit 100 --output ml.json

# 按被引量排序找奠基性论文
python scripts/search_google_scholar.py "AlphaFold protein structure" \
  --sort-by citations --limit 20 --output seminal.json

# PubMed 用 MeSH 词 + 文献类型过滤
python scripts/search_pubmed.py \
  --query '"Alzheimer Disease"[MeSH] AND "Drug Therapy"[MeSH]' \
  --date-start 2020 --date-end 2024 \
  --publication-types "Clinical Trial,Review" --output trials.json
```

元数据提取与 DOI 转换：

```bash
# 通用提取：支持 --doi / --pmid / --arxiv / --url
python scripts/extract_metadata.py --doi 10.1038/s41586-021-03819-2
python scripts/extract_metadata.py --pmid 34265844
python scripts/extract_metadata.py --arxiv 2103.14030

# 批量（文件混合标识符，每行一个）
python scripts/extract_metadata.py --input ids.txt --output citations.bib

# 快速 DOI 转 BibTeX
python scripts/doi_to_bibtex.py 10.1038/s41586-021-03819-2
python scripts/doi_to_bibtex.py --input dois.txt --output references.bib
```

格式化与校验：

```bash
# 去重 + 按年份倒序排序
python scripts/format_bibtex.py refs.bib \
  --deduplicate --sort year --descending --output sorted.bib

# 校验并自动修复，输出报告
python scripts/validate_citations.py refs.bib \
  --auto-fix --report validation.json --output final_references.bib
```

Google Scholar 高级算符：`"exact phrase"`、`author:lastname`、`intitle:keyword`、`source:Nature`、`-exclude`、`OR`、`2020..2024`。
PubMed 字段标签：`[Title]`、`[Title/Abstract]`、`[Author]`、`[Journal]`、`[Publication Date]`、`[Publication Type]`、`[MeSH]`。

BibTeX 常见条目类型：`@article`（期刊）、`@book`、`@inproceedings`（会议）、`@incollection`（书章）、`@phdthesis`、`@misc`（预印本/软件/数据集）。期刊条目必填示例：

```bibtex
@article{Author2024keyword,
  author  = {Last1, First1 and Last2, First2},
  title   = {Article Title},
  journal = {Journal Name},
  year    = {2024},
  volume  = {10}, number = {3}, pages = {123--145},
  doi     = {10.1234/example}
}
```

## 示例

为一篇论文构建参考文献库的端到端流程：

```bash
# 1. 检索主题论文
python scripts/search_pubmed.py \
  '"CRISPR-Cas Systems"[MeSH] AND "Gene Editing"[MeSH]' \
  --date-start 2020 --limit 200 --output crispr.json

# 2. 从结果提取元数据为 BibTeX
python scripts/extract_metadata.py --input crispr.json --output crispr_refs.bib

# 3. 追加已知关键论文
python scripts/doi_to_bibtex.py 10.1038/nature12345 >> crispr_refs.bib

# 4. 去重 + 排序
python scripts/format_bibtex.py crispr_refs.bib \
  --deduplicate --sort year --descending --output references.bib

# 5. 校验 + 自动修复
python scripts/validate_citations.py references.bib \
  --auto-fix --report validation.json --output final_references.bib

# 6. 审阅报告并在 LaTeX 中引用 \bibliography{final_references}
```

校验报告（JSON）会按 `errors`（如缺字段 missing_field、无效 DOI invalid_doi）与 `warnings`（如疑似重复 possible_duplicate）分级输出，便于定位修复。

## 注意事项

- 高被引判断参考阈值：0-3 年 20+ 引用值得关注、100+ 高影响；7+ 年 500+ 为奠基、1000+ 为基础性工作。优先 Tier-1 刊物（Nature、Science、Cell、NEJM、Lancet、JAMA、PNAS）与顶会（NeurIPS、ICML、ICLR）。
- 不要盲信提取的元数据：关键论文需抽查作者名、刊名、年份、卷期页码是否与原文一致。
- 优先用 DOI 作为标识符；预印本已正式发表时改引期刊版本，避免引用过期预印本。
- 提交前务必跑一次完整校验；手动改过 .bib 后需重新校验。
- 永远用脚本从元数据源生成条目，不要手敲 BibTeX。
- 标题大小写用 `{}` 保护，页码用 `--`，特殊字符正确转义以免 LaTeX 编译失败。
- 多库交叉检索（Scholar + PubMed + arXiv）避免单一来源偏倚。
- 本技能输出不能替代环境内的实际验证、测试或专家评审；仅在任务明确落在上述范围内时使用。

## 互见

- 文献综述类技能：负责多库系统检索与主题化综合，本技能为其提供元数据提取与校验的技术底座（先检索综合，再用本技能校验最终文献库）。
- 科学写作类技能：导出经校验的 BibTeX 供 LaTeX 稿件使用，按期刊要求格式化参考文献。
- 投稿模板类技能：不同会议/期刊要求不同引文样式，配合本技能生成符合投稿要求的参考文献。
- 科学示意图类技能：可为引文工作流、检索方法学等生成出版级示意图。

---

采编自 sickn33/antigravity-awesome-skills（MIT License），原作者 K-Dense Inc.。
