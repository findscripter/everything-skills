# 技能仓库总目

本文件只收录 GitHub 上的技能库/市场/精选列表，依据各库 README 摘要，不收录对方源码，也不复制对方 SKILL.md 正文。

标注哪些已被 [findscripter/everything-skills](https://github.com/findscripter/everything-skills) 采编进技能正文（见 INDEX/sources.md）。

- 编制日期：2026-10-22（Asia/Shanghai）；分支整合至 part74，范围扩展增量至 part87
- Stars：GitHub API / 仓库公开页面采集快照，非估算；各批次采集日期不同
- 收录条数：{{COUNT}} 个独立仓库（另注明更名别名）
- 读取方式：GitHub API / 原始文件读取 README；part75 补充公开页面元数据及固定提交归档的内存读取，未 clone 任何第三方仓库

范围扩展与本轮候选核验见 [part87 审核记录](../data/skill-repos.part87.audit.md)、[2026-10-22 当日回执](../data/discovery/2026-10-22/publication.json)、[part86 审核记录](../data/skill-repos.part86.audit.md)、[2026-10-21 当日回执](../data/discovery/2026-10-21/publication.json)、[part85 审核记录](../data/skill-repos.part85.audit.md)、[2026-10-20 当日回执](../data/discovery/2026-10-20/publication.json)、[part84 审核记录](../data/skill-repos.part84.audit.md)、[part83 审核记录](../data/skill-repos.part83.audit.md)、[当日新增清单](../data/discovery/2026-10-18/additions.json)、[追加收录回执](../data/discovery/2026-10-18/follow-up.json)、[part82 审核记录](../data/skill-repos.part82.audit.md)、[part81 审核记录](../data/skill-repos.part81.audit.md)、[part80 审核记录](../data/skill-repos.part80.audit.md)、[part79 审核记录](../data/skill-repos.part79.audit.md)、[part78 审核记录](../data/skill-repos.part78.audit.md)、[part77 审核记录](../data/skill-repos.part77.audit.md)、[part76 审核记录](../data/skill-repos.part76.audit.md)、[part75 审核记录](../data/skill-repos.part75.audit.md)及[后续检索范围](../data/skill-repos.discovery-scope.json)；此前增量核验见 [part66 审核记录](../data/skill-repos.part66.audit.md)，分支历史增量整合见 [整合记录](../data/branch-integration-2026-10-08.audit.json)。Stars 保留各批次原始采集快照；合入历史索引不等于重新核验其全部许可。

## 检索与截断

只收 SKILL.md 集合、插件市场、awesome-*-skills、官方目录、垂直技能包、注册表与安装器；也收仓库名不含 skill/agent、但 README 证明可安装的技能包。不倾销 topic:agent-skills。未读到 README 的不入表。

检索覆盖：GitHub topic/org/code search、skills.sh、ClawHub、HN/Reddit/V2EX/即刻/小红书、awesome 外链、`npx skills add`、`.claude-plugin/marketplace.json`。

part75 扩展：GIS/天气气候、机器人/嵌入式、CAE/CAD/BIM、数字策展/设计史、实验室科研、无障碍/翻译，以及产品内嵌技能、在线技能注册表、技能国际化与开发基础设施。公开分发、贡献者内部技能、模板、测试样例与客户端副本分别核验；不把原始 SKILL.md 文件数直接当作独立技能数。GitLab/Gitee/GitCode 线索单列在审核记录，不混入现有 GitHub 仓库数据。

part78 扩展：公益筹款、城市开放数据、规划与公共采购、电网与工厂运营，并追踪产品原生桌面技能目录和活跃后继。将当前技能、历史版本、核心包/视图、任务技能/路由入口及内部维护流程分开计数；许可证保留内容分区与 MIT-0 等准确标签。

part80 扩展：教学与课程诊断、科学计算与 HPC、计算化学、文献管理、公开档案视觉工作流及产品内嵌技能。补充固定提交技能 blob 的跨仓库重叠核验；带非商业限制的内容只明确索引元数据，不采编正文或称为无限制开源内容。

part82 扩展：工业 MES、半导体与制造、CAD/DFM、计算化学、科研传播、财务和商业创意工作流，并追踪产品、SDK、CLI 的原生公开技能。按公开清单区分主技能、插件模块、维护项、镜像及安装副本；保留第三方模板和派生内容的许可范围。

part85 扩展：农业食品与绿色软件、细分语言和认知/信息无障碍、数字人文与公共服务，以及数据模型、认证、桌面和机器人 SDK 的公开原生技能。技能、服务、SDK、示例素材分别记录许可范围；共享入口、维护项和镜像不充作新增。

### 更名与后继

- sickn33/antigravity-awesome-skills → sickn33/agentic-awesome-skills
- affaan-m/everything-claude-code → affaan-m/ECC
- ComposioHQ/awesome-codex-skills → composio-community/awesome-codex-skills
- 1102tools/federal-contracting-skills → 1102tools-dev/federal-contracting-skills

### 永久剔除

- mukul975/Anthropic-Cybersecurity-Skills（攻击包）

## 字段

- `summary`：English one-line blurb（目录英文版）
- `summary_zh`：Chinese one-line blurb（原摘要迁入；目录中文版优先）
- README：`node scripts/refresh-readme-skill-repos-directory.mjs --lang=en|zh`
