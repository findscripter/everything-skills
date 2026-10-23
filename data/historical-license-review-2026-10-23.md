# 历史参考文件许可范围复核（2026-10-23）

已核对 **533 个本地条目、1121 个有路径/名称/脚注依据的历史比较文件、16 个本地历史仓库快照**。读取失败 0，候选提升为原始采编版本 0。完整逐项结果及去重证据见 [JSON](historical-license-review-2026-10-23.json)。

本报告保存比较参考的授权范围，不证明当时确实读取、改写了哪个上游版本。原 `origin_commit_sha` 仍未证实。29 项差异表示当前来源标签与固定参考声明不一致，并不据此断言侵权或未获授权。

## 已确认的范围区别

### PyTDC 与 dbSNP

SciAgent 历史快照 README 第297行明确：原创内容使用 CC-BY-4.0，各技能的许可项描述底层工具。根 LICENSE 也分别注明 CC-BY-4.0 原创内容、K-Dense MIT 引用和 Biomni Apache-2.0 引用，不能任取一个标签覆盖所有部分。

- **PyTDC**：应同时显示 SciAgent 原创指令文字的 CC-BY-4.0 范围，以及上游技能记录的 PyTDC 工具 MIT。上次修复把文件前言 MIT 直接当作全部技能文字许可，范围解释不完整；原声明保留在版本历史和本次证据中，不冒称重新授权。
- **dbSNP**：保留上游 CC0-1.0 数据声明，并另列 SciAgent 原创指令文字 CC-BY-4.0。数据声明不等于技能文档为公共领域，也不覆盖所有关联数据或服务。

### 文件和目录条款不能由根许可证覆盖

- **K-Dense 13 个条目**：文件前言明确 BSD、Apache 或 CeCILL，历史 README 又明示各技能许可可不同于根 MIT。具体名称与文件见下表；外链形式的条款不猜 SPDX。
- **Anthropic partner-built 7 个条目**：Apollo、Slack、Zoom 插件的最近 LICENSE 是 MIT，不能仅记录集合根 Apache-2.0。
- **Sickn33 232 个强依据条目**：LICENSE-CONTENT 明确原创代码 MIT、原创文字 CC-BY-4.0，并保留第三方上游例外；来源表还含 Compatible 等不构成精确许可的标注。没有证据把232项全部认作原创文字，故没有整批改写为 CC-BY-4.0；逐项保留原声明、具体前言和范围。
- **energy-procurement**：历史英文及日文候选明确 Apache-2.0，中文/集合包装候选没有该前言、仅继承根 MIT；多候选分区保留，不用某一版本替代原采编证明。

## 29 项固定参考声明差异

| 本地条目 | 复核时声明 | 固定参考声明/文字范围 |
|---|---|---|
| `algorithm-first-discipline` | MIT | Apache-2.0 |
| `large-scale-math-algorithms` | MIT | Apache-2.0 |
| `complexity-cuts` | MIT | Apache-2.0 |
| `dask-distributed-dataframes` | MIT | BSD-3-Clause |
| `networkx-graph-analysis` | MIT | BSD-3-Clause |
| `pymc-bayesian-modeling` | MIT | Apache-2.0 |
| `seaborn-statistical-charts` | MIT | BSD-3-Clause |
| `umap-dimensionality-reduction` | MIT | BSD-3-Clause |
| `transformers-js` | MIT | Apache-2.0 |
| `apollo-lead-enrichment` | Apache-2.0 | MIT |
| `apollo-sequence-loader` | Apache-2.0 | MIT |
| `arboreto-gene-regulatory-networks` | MIT | BSD-3-Clause |
| `astronomy-data-toolkit` | MIT | BSD-3-Clause |
| `cheminformatics-toolkit` | MIT | BSD-3-Clause |
| `cirq-quantum-circuits` | MIT | Apache-2.0 |
| `dbsnp-database` | CC0-1.0 | CC-BY-4.0 |
| `fluidsim-cfd-simulation` | MIT | CeCILL FREE SOFTWARE LICENSE AGREEMENT |
| `medchem-compound-triage` | MIT | Apache-2.0 |
| `polars-bio-genomic-intervals` | MIT | Apache-2.0 |
| `pymoo-multiobjective-optimization` | MIT | Apache-2.0 |
| `pytdc-therapeutics-data-commons` | MIT | CC-BY-4.0 |
| `quantum-circuit-builder` | MIT | Apache-2.0 |
| `qutip-open-quantum-systems` | MIT | BSD-3-Clause |
| `single-cell-rnaseq-analysis` | MIT | BSD-3-Clause |
| `slack-message-formatter` | Apache-2.0 | MIT |
| `zoom-integration-planner` | Apache-2.0 | MIT |
| `zoom-meeting-app-builder` | Apache-2.0 | MIT |
| `zoom-meeting-bot-builder` | Apache-2.0 | MIT |
| `zoom-rtms-realtime-media` | Apache-2.0 | MIT |

外部未固定许可链接共三个条目：`dicom-medical-imaging`、`polars-dataframe`、`sympy-symbolic-math`。本轮未把当前远端文件冒充历史授权，也未从根 MIT 推定这些链接的条款。

## 五组合并来源范围

| 规范条目 | 合并旧条目 | 必须保留的范围 |
|---|---|---|
| `molecular-dynamics-openmm` | `molecular-dynamics-simulation` | 两条当前均声明K-Dense；强依据molecular-dynamics参考为MIT。不引入没有证据的SciAgent/CCBY来源。 |
| `dpa-playbook-review` | `dpa-clause-reviewer` | 两条当前均声明anthropics/claude-for-legal、Apache-2.0；不引入knowledge-work-plugins来源。 |
| `x-twitter-scraper-toolkit` | `x-twitter-automation` | 两条均声明Sickn33，代码/原创文字/第三方例外并列；Xquik服务条款单列。 |
| `market-sizing-tam-sam-som` | `market-sizing-analyst` | 被合并market-sizing-analyst声明wshobson/agents（MIT）；规范条目声明Sickn33，两层来源范围共同保留；不是Alireza。 |
| `astropy-astronomy-toolkit` | `astronomy-data-toolkit` | 两条均声明K-Dense；强依据astropy参考前言BSD-3-Clause优先于根MIT。不添加没有证据的SciAgent来源。 |

JSON 保存当前 `supersedes`/归档前言、三个最近本地提交及文件 SHA-256，证明本仓的合并与历史保留关系；其中8个条目的上游目前只有内容候选，未提升为原采编证据。

## 证据边界与复查方式

每条记录保留固定仓库、commit、文件路径、Git blob、SHA-256、原前言、最近 LICENSE、根许可范围及 README 上下文。多次出现的证据去重存放于 JSON 的 `evidence`；`root_scope_policies` 保留16个固定仓库快照。

复核状态：{"confirmed_reference_mismatch": 29, "scope_clarification_needed": 226, "consistent_with_fixed_reference_scope": 277, "multiple_reference_terms": 1}。一致表示与该固定参考范围一致，不表示原始采编版本或全部依赖已获运行/授权验证。

本次仅增加审计证据文件，未在本报告中声称已将所有建议自动应用为新的许可或重新授权。
