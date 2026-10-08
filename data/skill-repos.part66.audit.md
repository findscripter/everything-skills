# part66 增量核验记录

核验日期：2026-10-08（Asia/Shanghai）。本轮新增 14 个仓库，删除 1 个重复 fork，目录总数由 1715 调整为 1728。这里只索引上游项目，不安装候选、不执行候选脚本，也不复制技能正文。

## 方法与基线

- 更新前本地提交为 `5523edd`，工作区干净；已执行 `git fetch origin --prune`。
- 本地目录共 1715 项；远端 `main`、`zh`、10-01 和 10-02 索引分支合计去重为 2006 项，本地与远端并集为 2022 项。新增项均不在该并集中。
- 全部 JSONL 按 UTF-8 严格解析，名称按大小写归一去重；额外检查 GitHub 仓库 ID、规范名称、fork 和归档状态。
- 每个候选读取 README 安装入口、LICENSE 及代表性 `SKILL.md`，检查完整目录树。技能数量区分公开技能、维护技能、模板与客户端副本。
- 远端已有 `part58` 至 `part65`，因此本批使用 `part66`，避免继续占用远端分片编号。当前分支仍保留先前本地批次，未合并远端数据。

完整仓库 ID、SHA、技能路径和来源链接保存在 [机器可读核验记录](skill-repos.part66.audit.json)。其中 `source_tree_sha` 记录查询到的 Git 目录树，页面链接仍指向各仓库默认分支。

## 新增项目

| 项目 | 核验的技能数 | 许可 | 核验范围 |
| --- | --- | --- | --- |
| [Columnar](https://github.com/columnar-tech/skills) | 4 | Apache-2.0 | ADBC、dbc、databow、DuckDB ADBC |
| [Synalog](https://github.com/SynaLinks/synalog) | 1 | Apache-2.0 | 数据规则、SQL 编译与运行 |
| [Our World in Data](https://github.com/owid/skills) | 1 | CC-BY-4.0 | 数据、图表与来源引用 |
| [KiCad Agent](https://github.com/Seahan1/kicad-agent) | 1 | MIT | 原理图、ERC、网表与渲染复核 |
| [Product Translation](https://github.com/BrunoMiguens/translating-products-skill) | 23 | MIT | 产品本地化、语言专家与译文审查 |
| [ABET CLO Mapper](https://github.com/labarba/abet-clo-mapper) | 1 | CC-BY-4.0 | 工程课程成果映射 |
| [Data Engineering Skills](https://github.com/gordonmurray/data-engineering-skills) | 8 | MIT | Iceberg、Paimon、Flink 等 |
| [Vietnamese Humanizer](https://github.com/longhang2004/vietnamese-humanizer) | 4 | MIT | 越南语语法、写作与译文润色 |
| [Mapbox](https://github.com/mapbox/mapbox-agent-skills) | 20 | MIT | 地图、导航与地理数据可视化 |
| [Neo4j GDS](https://github.com/neo4j-contrib/gds-agent) | 1 + MCP | MIT | 图数据科学 |
| [Apache DataFusion Python](https://github.com/apache/datafusion-python) | 1 公开技能，另 4 条维护技能 | Apache-2.0 | DataFrame、SQL 与 Arrow |
| [Espressif ESP-DL](https://github.com/espressif/esp-dl) | 4 | MIT | 算子、量化与 ESP32 SIMD |
| [Graphistry](https://github.com/graphistry/graphistry-skills) | 9 公开技能 | BSD-3-Clause | 图 ETL、查询与可视化 |
| [Agora](https://github.com/AgoraIO/skills) | 1 | MIT | 语音 AI、实时音视频与 CLI/MCP |

OWID 与 ABET 的 GitHub API 许可证字段为 `NOASSERTION`，但各自 README 和 LICENSE 明确为 CC-BY-4.0；目录使用实际许可证原文。Graphistry 的内部维护技能和模板不计入公开技能数。

## 对先前记录的修正

- 删除 `minhhoit/gamedev-agent-skills`：API 确认为已收录 `gamedev-skills/awesome-gamedev-agent-skills` 的 fork，README 安装命令也指向上游；更新上游计数为 74 条技能及 1 个路由器。
- `Shubhamsaboo/awesome-llm-apps` 的 `100+` 是 Agent、技能和 RAG 项目的合计，改用主目录的 7 条技能；应用示例内嵌的 3 个技能另计。
- `calesthio/OpenMontage` 的 `700+` 混合技能与制作知识文件，并包含不同客户端副本，计数改为“多技能/知识库”。
- `skill-one/agents-skills` 按 README 和许可文件改为 `MIT OR Apache-2.0`。

本轮新增项的 Stars 是本日快照，未刷新旧项目的全部 Stars。未收录无许可的 Viam/机器人候选、许可范围未逐项核清的 Snowflake 集合，以及安装源已失效的 Front-End Checklist 路标入口。

## 本地验证

- JSONL 严格解析及仓库名称、API ID 去重通过；14 条新增记录与核验记录中的 Stars、许可证、fork 状态一致。
- `node scripts/build-all.mjs --lang=zh` 通过，生成 1728 个目录条目；技能正文索引仍为 1108 条技能、6843 条关系边。
- 新增分片、修正数据与全部生成物提交后，以 `node scripts/check-generated.mjs --lang=zh` 再次检查一致性。
- 既有 544 条 description 长度告警和 1 条嵌套 checkout 跳过告警保留；本轮没有技能校验错误。
