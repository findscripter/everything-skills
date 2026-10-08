# part75：扩展技能仓库挖掘范围

核验日期：2026-10-09（Asia/Shanghai）。基线为本地 part74，共 2034 个仓库；本轮检查 50 个新候选，新增 35 个独立仓库，15 个暂缓或排除，目录增至 **2069**。新增内容只有仓库元数据；本项目的 1109 条技能正文没有增加。

## 接续基线与方法

- 实际工作目录为 `E:\Everthing-Skills`；当前聊天目录为空。依据项目索引、part66 审核、分支整合审核、生成脚本及截图接续工作。截图中的历史操作不作为本轮推送或合并授权。
- 保留当前 `codex/architecture-hardening` 分支的已有暂存及未暂存修改。先执行只读性质的 `git fetch origin --prune`，读取 origin/main 与 origin/zh 合并去重的 1916 个条目；本轮候选均不在本地或该远端并集中。远端最大分片为 part61，本地为 part74，因此新增 part75。
- 用领域词与实际文件/安装约定检索，不要求仓库名称含 skill/agent。发现产品配套包、实验室仓库、在线技能文档注册表及国内分发工具等来源。
- 使用 agent-reach 的 GitHub/检索路线及 browser-harness 公开页面检查。本机 agent-reach CLI 不可用、gh 未登录；改读公开 GitHub REST/原始文件。REST 匿名配额用尽后，通过公开仓库页面取得元数据，读取固定提交归档；归档仅在内存中逐文件核对，不解包、不执行。搜索有两批 429，已串行重试。
- 初批保存 API 仓库 ID、Git tree SHA、README SHA256；归档批保存固定 commit SHA。对所有新增的实际技能包读取代表性分发技能，检查 name/description；基础设施的示例与远程服务另标。此检查不等于全技能执行、安全、科学有效性或临床有效性验证。

证据见 [机器审核](skill-repos.part75.audit.json)、[检索来源](skill-repos.part75.search-provenance.json)与[可复用检索范围](skill-repos.discovery-scope.json)。

## 发现的薄弱类型

| 扩展类型 | 本轮新增仓库 | 挖掘线索 |
|---|---:|---|
| 机器人与嵌入式 | 5 | 见下方仓库及 scope.json 中的查询与目录布局 |
| GIS、遥感、天气气候 | 6 | 见下方仓库及 scope.json 中的查询与目录布局 |
| 数字人文、策展、档案与设计史 | 3 | 见下方仓库及 scope.json 中的查询与目录布局 |
| 工程仿真、CAD、BIM 与制造 | 6 | 见下方仓库及 scope.json 中的查询与目录布局 |
| 实验室与可复现科研工作流 | 5 | 见下方仓库及 scope.json 中的查询与目录布局 |
| 技能开发、国际化、按需寻址与在线注册表 | 4 | 见下方仓库及 scope.json 中的查询与目录布局 |
| 无障碍与细分语言工作流 | 2 | 见下方仓库及 scope.json 中的查询与目录布局 |
| 国内客户端及多平台分发 | 1 | 见下方仓库及 scope.json 中的查询与目录布局 |
| 产品、SDK、CLI 内嵌技能 | 2 | 见下方仓库及 scope.json 中的查询与目录布局 |
| 行业创作与迁移单仓库 | 1 | 见下方仓库及 scope.json 中的查询与目录布局 |

这些是通过本轮新候选确认的覆盖薄弱处，并非宣称此前对整个领域零覆盖。基线有中英文混合摘要、巨大合集的摘要不会枚举所有子领域，因此不使用关键词命中数量证明领域缺失。农业、食品生产、公益政务与绿色软件继续列为优先方向；目前的候选证据不足，未为填空而放宽准入。

## 新增仓库

| 仓库 | 类型 | 核验计数 | README 摘要 |
|---|---|---|---|
| [wimblerobotics/ros2-copilot-skills](https://github.com/wimblerobotics/ros2-copilot-skills) | 机器人与嵌入式 | 158 | ROS 2 / Nav2 技能包：控制、感知、SLAM、定位及机器人开发。 |
| [D-Robotics/rdk-skills](https://github.com/D-Robotics/rdk-skills) | 机器人与嵌入式 | 97 | 地瓜机器人 RDK 官方技能枢纽：板卡诊断、BSP、模型部署与 OE 工具链；代码与技能文档分开授权。 |
| [bernardleex526/robotics-skills](https://github.com/bernardleex526/robotics-skills) | 机器人与嵌入式 | 24 | WorkBuddy 机器人工作流：标定、力控、感知、数据回放、部署与基准评估。 |
| [phuismann/geoskills](https://github.com/phuismann/geoskills) | GIS、遥感、天气气候 | 7 | 地理数据入库、坐标系选择与重投影、质量检查、空间机器学习、PostGIS 与 Snowflake 技能。 |
| [isaaccorley/geospatial-skills](https://github.com/isaaccorley/geospatial-skills) | GIS、遥感、天气气候 | 19 | 可安装 GIS 技能：GDAL、GeoParquet、GeoZarr、PMTiles、STAC 与空间前端；部分条目来自其他地理技能上游。 |
| [opengeos/geoai-skills](https://github.com/opengeos/geoai-skills) | GIS、遥感、天气气候 | 8 | GeoAI Claude 插件：空间文件检查、影像下载、STAC 检索、栅格处理与目标检测。 |
| [portolan-sdi/portolan-skills](https://github.com/portolan-sdi/portolan-skills) | GIS、遥感、天气气候 | 12 | Portolan SDI 地理数据目录技能：初始化、注册、缩略图、数据源发现与目录工作流。 |
| [wuyaojunkylin/research-digital-curation-skills](https://github.com/wuyaojunkylin/research-digital-curation-skills) | 数字人文、策展、档案与设计史 | 7 | 研究型数字策展与线上博物馆技能：选题、叙事、视觉语言、原型及方法日志。 |
| [natdexterra/source-synthesis](https://github.com/natdexterra/source-synthesis) | 数字人文、策展、档案与设计史 | 1 | 基于证据分级的资料综合，含考古历史及医学科学预设，产出可追溯的主张清单。 |
| [adityakamath/ros2-skill](https://github.com/adityakamath/ros2-skill) | 机器人与嵌入式 | 1 | 通过本地 rclpy CLI 控制 ROS 2 机器人的技能，附运行规则与命令文档。 |
| [test1card/femis-skill](https://github.com/test1card/femis-skill) | 工程仿真、CAD、BIM 与制造 | 1 | FEM/CAE 分析治理技能：网格独立性、验证与确认、求解器选择及工程证据；需与求解执行器配合。 |
| [fmschulz/omics-skills](https://github.com/fmschulz/omics-skills) | 实验室与可复现科研工作流 | 34 | 微生物基因组与多组学技能集合，带任务路由、输入输出契约及 Claude/Codex 插件。 |
| [variomeanalytics/bioinformatics-agent-skills](https://github.com/variomeanalytics/bioinformatics-agent-skills) | 技能开发、国际化、按需寻址与在线注册表 | 0 (remote skill registry) | SkillGraph MCP 提供生信技能文档发现与可组合流程路径；仓库本身没有检入 SKILL.md 文件。 |
| [Demolinator/revit-mcp-plugin](https://github.com/Demolinator/revit-mcp-plugin) | 工程仿真、CAD、BIM 与制造 | 1 | Revit BIM Claude 插件，捆绑 BIM 技能、MCP 服务与斜杠命令，用于建筑模型工作流。 |
| [srini047/skills-i8n](https://github.com/srini047/skills-i8n) | 技能开发、国际化、按需寻址与在线注册表 | 3 examples | 技能国际化 CLI，保留代码块与伴随文件；三个示例用于演示，不是生产技能包。 |
| [Tasdax123/claude-fidelity-translator](https://github.com/Tasdax123/claude-fidelity-translator) | 无障碍与细分语言工作流 | 1 | 长文本忠实翻译插件，含术语种子、章节处理及语言对扩展方法。 |
| [KreerC/ACCESSIBILITY.md](https://github.com/KreerC/ACCESSIBILITY.md) | 无障碍与细分语言工作流 | 2 | 由无障碍实践者整理的开发与测试技能，包含残障使用者的实践经验。 |
| [angri450/Nong.Dev.Net](https://github.com/angri450/Nong.Dev.Net) | 国内客户端及多平台分发 | 10 | 经 GitHub/GitCode 分发的开发工具包，含 Bash、PowerShell、.NET、Gitee 与 GitCode 技能；属于通用开发工具。 |
| [SylphAI-Inc/atskills](https://github.com/SylphAI-Inc/atskills) | 技能开发、国际化、按需寻址与在线注册表 | 10 examples | 以路径寻址、按需读取 SKILL.md 的协议与工具，附十个示例技能及可选持久化。 |
| [salikkhann/openmedskills](https://github.com/salikkhann/openmedskills) | 实验室与可复现科研工作流 | 83 | 带风险元数据、引用、示例、评测与跨代理导出的医学研究及教育技能注册表。 |
| [mims-harvard/ToolUniverse](https://github.com/mims-harvard/ToolUniverse) | 实验室与可复现科研工作流 | 205 | ToolUniverse 科学工具平台，附可安装研究技能与 Claude 市场分发；插件副本不重复计数。 |
| [ZimoLiao/scholaraio](https://github.com/ZimoLiao/scholaraio) | 实验室与可复现科研工作流 | 44 | 学术 Agent 工作环境，附论文流程及 OpenFOAM、GROMACS、LAMMPS、Quantum ESPRESSO 科学运行技能。 |
| [rhiza-research/weather-skills](https://github.com/rhiza-research/weather-skills) | GIS、遥感、天气气候 | 37 | 实验阶段的天气气候技能：抓取、转换与绘制带来源记录的 Zarr 数据；原名 forecasting-skills。 |
| [ForgeCAD/forgecad-public-kit](https://github.com/ForgeCAD/forgecad-public-kit) | 工程仿真、CAD、BIM 与制造 | 10 | ForgeCAD 官方公共配套包，含可安装参数化 CAD 技能：建模、检查、重建与验证。 |
| [swtbkim/openfoam-claude-suite](https://github.com/swtbkim/openfoam-claude-suite) | 工程仿真、CAD、BIM 与制造 | 4 | OpenFOAM v2412 Claude 插件，含配置、仿真、诊断与后处理技能；求解需另有运行环境。 |
| [truman-t3/industrial-design-portfolio-skill](https://github.com/truman-t3/industrial-design-portfolio-skill) | 工程仿真、CAD、BIM 与制造 | 1 | 工业设计作品集技能，将产品证据与设计判断整理为可审阅 HTML 作品集。 |
| [beriberikix/zephyr-agent-skills](https://github.com/beriberikix/zephyr-agent-skills) | 机器人与嵌入式 | 22 | Zephyr RTOS 技能注册表：板卡启动、构建、设备树、驱动与嵌入式开发，附总入口路由技能。 |
| [toby/flashback](https://github.com/toby/flashback) | 数字人文、策展、档案与设计史 | 1 | 设计史技能，从公开历史档案检索指定年份的字体、配色与视觉参考。 |
| [fastah/ip-geofeed-skills](https://github.com/fastah/ip-geofeed-skills) | GIS、遥感、天气气候 | 1 | Fastah IP 地理馈送编写与审查技能，面向公开 RFC 8805 CSV，附可选地名检索 MCP。 |
| [fcon-tech/portolan](https://github.com/fcon-tech/portolan) | 产品、SDK、CLI 内嵌技能 | 1 | 代码库测绘产品，捆绑可安装 Portolan 技能、MCP 接入及可追溯架构图。 |
| [leap-laboratories/discovery-engine](https://github.com/leap-laboratories/discovery-engine) | 产品、SDK、CLI 内嵌技能 | 1 | Leap Laboratories 表格模式发现服务，附 Agent Skill 与 MCP/SDK 指南；托管执行属于独立服务。 |
| [msimchowitz/writing-skills](https://github.com/msimchowitz/writing-skills) | 实验室与可复现科研工作流 | 16 | 研究实验室写作技能，区分 Agent 技能、人类指南与 LaTeX 起始材料，附安装器。 |
| [Zyzhan417/OpenFOAM_expert_SKILL](https://github.com/Zyzhan417/OpenFOAM_expert_SKILL) | 工程仿真、CAD、BIM 与制造 | 1 | 基于源码的 OpenFOAM 专家技能：实现定位、字典错误、边界条件与自定义库分析。 |
| [rhiza-research/weather-skills-core](https://github.com/rhiza-research/weather-skills-core) | 技能开发、国际化、按需寻址与在线注册表 | 1 | 可组合天气技能开发基础设施：共享 Zarr 契约、来源记录、检查工具与技能编写指南。 |
| [HiAPIAI/hiapi-product-video-skills](https://github.com/HiAPIAI/hiapi-product-video-skills) | 行业创作与迁移单仓库 | 4 | 预览阶段产品视频技能单仓库：食品广告、时尚图册、代言与 UGC 广告；四个技能目录各有 MIT 许可。 |

## 计数、来源与许可修正

- GeoSpatial：19 个源技能及 19 个插件副本，只计 19；其中导入 Portolan/GeoAI 的技能也会与另两个仓库重叠，不将各仓库技能数相加当作全局独立技能总数。
- OpenMedSkills：83 个源技能、83 个导出及 1 个模板，只计 83；代码 MIT、技能内容 CC-BY-4.0。
- ToolUniverse：205 个非模板源技能、1 个嵌套模板及 322 个插件副本；插件分发各为 161。计 205 个源技能，不计 528 个独立技能。
- D-Robotics：97 个源目录与 3 个插件副本；代码 Apache-2.0、技能文档 CC-BY-4.0；源目录本身是多个产品仓库的镜像。
- Zephyr：21 个领域技能加 1 个总入口，排除内部 skill-creator。Weather Core：只计 1 条编写指南，排除 14 个测试样例。
- Portolan 产品：只计对用户分发的 skill/SKILL.md，排除 11 个 .zcode/ 贡献者 OpenSpec 技能。它与 portolan-sdi 的 GIS 技能是不同产品。
- srini047/skills-i8n 是国际化基础设施，3 条只是示例；LICENSE 原文及 README 为 Apache-2.0，未照抄 API NOASSERTION。@skills 的 10 条均为示例。SkillGraph 本库无 SKILL.md，是远程文档注册表接口，未连接服务核验在线内容。
- Weather Skills 的旧 URL forecasting-skills 重定向到 weather-skills；只收规范名称，并保留 README 对实验状态及旧安装名的说明。
- HiAPI：只新增统一仓库的 4 个场景技能，排除 4 个兼容副本及旧食品仓库。四个技能目录各有 MIT 文件；共享 runner 的许可未确认，索引明确标注。
- 本轮许可证只用于准确标注索引，不授予任何后续采编权限；要采编技能正文仍须逐文件检查来源与授权。Stars 是本日 API 或公开页面快照，不使用搜索引擎缓存的旧数值。

## 暂缓或排除

| 候选 | 原因 |
|---|---|
| [Abhinavbwj/Claude-skills-for-Computational-Designers](https://github.com/Abhinavbwj/Claude-skills-for-Computational-Designers) | 代表性技能 frontmatter 只有 title、没有 name；18 个 SKILL.md 文件不等于已验证符合当前发现契约，暂缓。 |
| [abwoo/nih-skill](https://github.com/abwoo/nih-skill) | 未找到仓库许可证，README 未给出独立技能安装入口，暂缓。 |
| [dungnotnull/Agricultural-Economic-Development-Forecast-Strategy-Advisor-agent-skill](https://github.com/dungnotnull/Agricultural-Economic-Development-Forecast-Strategy-Advisor-agent-skill) | 农业经济候选有 SKILL.md；README 未说明技能挂载入口，存在 example 占位链接，MIT 后附条款尚未厘清。 |
| [odisysai/agentic-agri-advisor](https://github.com/odisysai/agentic-agri-advisor) | 农业应用的 38 个技能偏项目内部开发；README 未证明它们是面向农业任务分发的独立技能包。 |
| [microsoft/vscode](https://github.com/microsoft/vscode) | 79 个 SKILL.md 混有贡献者流程和测试资产；根 README 没有可复用技能安装证据，未将产品名声当作技能包资格。 |
| [bestagentkits/agency-skills](https://github.com/bestagentkits/agency-skills) | 843 个 skills/ 文件及 17 个工具文件混合采编；发现 Anthropic 文书技能专有条款，不能把根 MIT 扩展为整包许可。 |
| [beita6969/ScienceClaw](https://github.com/beita6969/ScienceClaw) | 科学 Agent 应用含 311 个根 skills/ 和 8 个扩展技能；当前 README 强调应用运行与自演化，未完成独立技能分发与逐源许可核验。 |
| [dromlakhani/MD2SKILL](https://github.com/dromlakhani/MD2SKILL) | 893 个 SKILL.md；README 声称 MIT，但树中未找到对应许可证文件，暂缓。 |
| [aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills) | 605 个 SKILL.md 分布在医研、科学及审核目录；顶层 MIT 已读，嵌套许可证/上游采编范围未全核。临时核验器遇到空格路径未 URL 编码，证据不足，暂缓。 |
| [twj011/openfoam-agent-skills](https://github.com/twj011/openfoam-agent-skills) | 存在可挂载 OpenFOAM 技能，未发现许可证文件，保留候选。 |
| [LZF1111/CFDriver_skill](https://github.com/LZF1111/CFDriver_skill) | 存在 OpenFOAM 技能且附官方源码；未找到许可证文件，内置源码授权范围尚未核清。 |
| [milim6/OpenFOAM_Turbo_expert_SKILL](https://github.com/milim6/OpenFOAM_Turbo_expert_SKILL) | GitHub 明确标记 fork，README 安装指向 Zyzhan417/OpenFOAM_expert_SKILL；只收已核验上游。 |
| [vindu939/freecad-skills](https://github.com/vindu939/freecad-skills) | 16 个 SKILL.md 与 README 所称 12 个生产技能需继续对账，目录内没有发现许可证文件。 |
| [tholewis/green-software-engineer](https://github.com/tholewis/green-software-engineer) | 绿色软件候选有可安装技能，但未找到许可证文件，保留候选。 |
| [HiAPIAI/hiapi-food-commercial-video-skill](https://github.com/HiAPIAI/hiapi-food-commercial-video-skill) | README 标记为迁移后的兼容入口；本轮只新增统一 monorepo 的四个场景技能，不重复新增旧分发仓库。 |

## 跨平台线索与下一轮范围

- Gitee：检索发现 [tekan/skill](https://gitee.com/tekan/skill)；GitLab：[fabriciotelles/skills](https://gitlab.com/fabriciotelles/skills)。这两条仍是搜索线索，没有完整读取许可证与技能目录，不算已核验仓库。GitCode 搜索未得到足够的可核验新增来源；Nong.Dev.Net 的 README 明确给出 GitCode 分发入口。
- 下一轮按 scope.json 分领域检索，再沿产品包注册表、安装源、作者组织和上游来源继续追踪。优先查 .github/skills、.agents/skills、.claude/skills、.qwen/skills、.trae/skills、.codebuddy/skills、.zcode/skills、for-agents、skill/SKILL.md、plugins 与 dist；不同布局仍按公开分发证据判断。
- 非 GitHub 平台正式入表前，应给加载器及数据规范补平台/规范 URL 身份键，避免同 owner/repo 名称跨平台碰撞。现有 GitHub 数据结构未在本轮改变。

## 本地验证

- 35 条新增 JSONL 与审核记录中的仓库 ID、Stars、许可、计数和日期一致；全部新增项有许可证来源证据。共享加载器通过字段、大小写去重与分类校验。
- `node scripts/build-all.mjs --lang=en` 连续两次通过，28 个生成文件的 SHA256 完全一致；INDEX 与 README 均包含全部 35 个新增链接。
- 生成结果为 1109 条技能、11 卷、6779 条关系边、2069 个仓库；原有描述长度与孤岛技能告警保留。
- 对 1218 个既有非生成文件比较哈希，除计划修改的 `data/skill-repos.meta.md` 外，1217 个文件完全未变；已有暂存路径清单未变，没有执行 git add、commit、push 或 merge。
- 未运行要求生成物已经提交的 `check-generated.mjs`：工作区原有大量暂存/未暂存修改，本轮也保留未提交增量。用二次全量生成的逐文件哈希一致性核验生成内容，没有把工作区干净性失败当成通过。
