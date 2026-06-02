---
name: claim-element-chart-builder
title: 权利要求/要件对照表构建
description: 当需要构建或审查「要件对照表」——专利权利要求图表（侵权/无效/审查）或民事诉因/抗辩的要件证据对照表，逐格带精确引证并以缺口检测为首要产物时使用；做按要件逐项映射证据/被控产品/现有技术、标注映射类型与状态、产出缺口清单及 md/CSV/表格；不适用于无源臆造映射、替律师下侵权/责任结论、裁断权利要求解释或满足无效的清晰可信证明标准；触发词：claim chart、要件对照表、权利要求图表、侵权对照、无效对照、要件逐项映射、证明缺口、还缺什么
domain: 领域/legal
triggers: [claim chart, 要件对照表, 权利要求图表, 侵权对照, 无效对照, 要件逐项映射, element chart, 证明缺口, 我还缺什么才能证明, infringement contention, invalidity contention]
tags: [legal, litigation, patent, claim-chart, element-chart, infringement, invalidity, gap-detection, pin-cite]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [markdown, csv, xlsx]
requires: []
related: [freedom-to-operate-triage, invention-disclosure-screen, ip-infringement-triage, litigation-chronology-builder]
combines_with: [ip-portfolio-register, legal-case-brief]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

当用户需要构建或审查一份**要件对照表**时使用，两种模式：

- **模式 1 · 专利权利要求图表（claim chart）**：把权利要求的各技术特征逐项映射到——被控产品（`--infringement` 侵权）、现有技术（`--invalidity` 无效）、或他方已出的图表（`--review` 审查）。用于 PLR 3-1/3-3 侵权/无效主张、IPR/PGR petition 或 response 附件、FTO、起诉状附件。
- **模式 2 · 民事要件证据对照表（element chart）**：把某诉因（或积极抗辩）的各**要件**逐项映射到证据。用于起诉状合理性自查、证据开示规划、即决判决（MSJ）准备、举证顺序大纲。

无 flag 时**先问用户是哪一种**。两种模式共同前置收集：我方/对方立场、管辖/法院（陪审团指示模板因辖区而异：CACI/NYPJI/巡回区模板/制定法；专利则 PLR 因 N.D.Cal./E.D.Tex./D.Del./ITC/PTAB 而异）、案件阶段（立案前/诉答/开示/MSJ/庭审准备）。

**核心产物永远是缺口**：民事出「缺口清单（gap list）」、专利出「待证清单（needs-evidence list）」——这是做这张表的目的，其余都是支撑。

**不该用的边界（直接拒绝或转交）：**
- **不下结论**：不认定侵权/不侵权、不认定有责/无责，永不。
- **不裁断权利要求解释**（专利）或**控制性要件**（民事）：只标注争议术语/基线要件并在声明的假设下作图。
- **不满足无效的「清晰可信」证明标准，也不满足庭审的优势证据标准**：只产出供律师审阅的初步（prima facie）草稿。
- **不替代专家分析**：源码审查、拆机、技术/损害专家是另行的工作成果，本表只路由而不取代。
- **不臆造、不静默补源**：证据不在就置 `needs-evidence`/`gap`，绝不用网搜/训练知识/「这类案子通常怎么走」去填缺口。
- **不签署、不提交、不送达任何东西**：每份产出都是草稿。

## 步骤

固定流程，**开工三道前置门必须最先且每次执行**：

- **门 0 · 披露文档使用限制**：先问「这些文档是否经诉讼披露/证据开示取得？」若是——英格兰及威尔士 CPR 31.22 默示承诺仅可用于披露所在的诉讼，他用可能构成藐视法庭；美国适用保护令与 Rule 26(c)，查相关命令。未确认则标 `⚠️ 披露文档可能有使用限制，确认本次使用获许可前勿继续`。
- **门 1 · 草稿声明（置于每份产出顶部，不得删改、不得软化）**：「本表是供律师分析与核验的草稿，不是已提交的主张、MSJ 书状、开庭陈述或法律意见。每一处映射都是律师须对源核验的线索。所列要件来自陪审团指示模板/Restatement/解析出的权利要求语言——用户辖区的**控制性**权威（CACI/NYPJI/巡回区模板/制定法/Markman 命令）可能不同且永远优先。缺口检测是开示或动议的起点，不是对案件实体的结论。」漏标缺口是单向门（无合理性的起诉、无证据的 MSJ 答辩、无损害证明的庭审）；多标缺口是律师 30 秒内可清的双向门——**默认偏向双向门**。
- **门 2 · 加载上下文**：读起诉状/反诉/答辩（按实际诉答的诉因/抗辩，不用泛化版）、控制性陪审团指示来源、制定法、证据语料（庭审证词、陈述书、披露文档、专家报告）；专利则读专利、被主张权利要求、说明书、审查历史、被控产品材料或现有技术、Markman 命令或约定解释。

**模式 1 · 专利流程：**
- **Step 1 解析权利要求**：把被主张独立权利要求拆成编号要件 `[1a][1b][1c]`，编号稳定（它是表的脊柱）。处理前序部分（是否限定→解释问题，未决标 `preamble-limiting: unresolved`）、过渡词（comprising 开放/consisting of 封闭/consisting essentially of 半开放）、§112(f) means-plus-function（按列/行引证说明书结构，无结构标 `indefinite-112f`）、Markush/Jepson/方法步骤顺序依赖。**结构性术语同源词默认 `construction-dependent`**（如 barb 倒刺 vs. 任何 projection 凸起、channel vs. 任何 passage）——这些是 Markman 最常争的，默认干净字面解读会漏标风险。**解析后先给用户确认再映射**：错的解析会污染下面每一行。
- **Step 2 解释检查**：标争议术语并对每个给出「映射在 X 解释下成立、在 Y 解释下失败」——自造术语、有审查历史的（*Phillips*；*Festo* 禁反言）、功能性语言（configured to）、相对术语（substantially/about，*Nautilus* 不确定性）、计算机实现术语（*Alice* §101）。有 Markman 命令则适用；正在 briefing 则按双方各自主张的解释各作一版。
- **Step 3 映射**：每要件×每目标——①找证据（被控产品：文档/手册/数据表/源码/拆机/证词/专家报告；现有技术：US 专利列/行、公开申请段落、NPL 页/图，并标该引证是否合格 §102(a)(1)/(a)(2)/(b)、AIA vs. pre-AIA）；②逐字引用（character-for-character，不转述，句界处剪并标省略）；③按下方词表定映射类型；④定单格状态；⑤标开放问题（「若 X 则成立，需拆机/源码/证词/专家确认」）。**无声补充禁止**：文档薄就 `needs-evidence`，不从相似产品外推。
- **Step 4 从属权利要求——执行而非示意**：被主张从属项必须产出实际的附加限定行，不得只留「应作图」的占位说明。只给独立项就显式点名被丢下的从属项（建议 `--include-dependents` 或贴入从属项文本重跑）。
- **Step 4.5 DOE 补充——执行而非示意**（仅侵权）：凡 `literal` 行其被控特征结构相似但非字面相同、或 `literal` 取决于争议解释的，产出配对的 DOE 候选行（function-way-result 三段+逐要件标审查历史禁反言/捐献公众风险+支撑等同的证据），不得只脚注「DOE 另议」而不作实际映射。
- **Step 5 间接/分离/故意（仅侵权）**：诱导 §271(b)（*Commil*/*Global-Tech*）、帮助 §271(c)、分离/共同 §271(a)（*Akamai* 指挥控制）、故意（*Halo*，§284 三倍）——只标不评，不要把间接侵权折进直接侵权行。
- **Step 6 无效门槛（仅无效）**：§102 须单一引证含全部要件且如权利要求排列（*Net MoneyIN*）；跨引证的部分映射是 §103（主引证+次引证+*KSR* 结合动机+二次考量 *Graham*：商业成功、长期需求、他人失败、业界赞誉、抄袭）。另标 §101（*Alice*/*Mayo*）、§112 各款。**无效须清晰可信证据证明（*i4i*），表中 prima facie 不等于庭审证明**。
- **Step 7（审查子模式）**：逐行问映射是否被支撑、引证是否准确、要件是否被完整覆盖、最强反驳与反驳机会，出逐行 `supported`/`weak`/`unsupported` 与全表脆弱点。

**模式 2 · 民事流程：**
- **Step 1 识别诉因**：什么诉因/抗辩？多诉因各作一表。哪一方（原告默认映射 prima facie case 即证明要件；被告默认映射缺口与积极抗辩即否证/规避要件）。哪个辖区。读哪份诉答（按实际诉答的诉因作图）。
- **Step 2 加载要件**：三条路径——(a) 模板库基线（按诉答诉因选模板，附 Restatement/模板指示引证与辖区警示）；(b) 用户自定义或贴入陪审团指示/制定法/诉状中某诉因来解析编号；(c) 积极抗辩（时效、懈怠、禁反言、弃权、不洁之手、和解、未减损等，各有举证负担）。**DE/NY/CA 三大商事法庭辖区差异主动给出**，不等用户来教（如违约 DE 三要件、求特定履行加第 5 要件无充分法律救济；过失 CA 按 CACI 400、NY 按 PJI 2:10;欺诈 NY 须 CPLR 3016(b) 特定性陈述）。差异显著时表首加一行辖区提示。**映射前先与用户确认要件清单**。
- **Step 3 映射**：每要件——支持证据（带精确引证，见下）、逐字引用、相反证据（这是该行的脆弱点）、强度 `strong/moderate/weak/none`、单格状态 `supported/partial/disputed/gap/needs-discovery`。
- **Step 4 缺口检测——杀手产物**：映射后产出缺口清单（证据薄或无的要件）。原告：这些威胁起诉合理性（Iqbal/Twombly）、MSJ 答辩、庭审；被告：这些是你的 MSJ 与定向裁决靶子；开示前：这些是开示优先级（哪些证人/文档保管人/质询/RFA）。**缺口不是实体结论，是案件薄弱处的地图**。
- **Step 5 阶段化框架**：同一张表、不同产出框架——诉答阶段查 Iqbal/Twombly 合理性；开示阶段每个 `gap`/`needs-discovery` 列出所需开示；MSJ 阶段查是否有重大事实真实争议；庭审阶段把表变成举证顺序大纲。
- **Step 6（审查子模式）**：审对方 MSJ/驳回动议/外部律师草稿，逐要件查其引证是否真能证明、其表何处偏薄、你最强的反驳。

## 指令

**映射类型词表（专利）**：`literal`（字面读到）/ `literal-construction-dependent`（在 X 下字面、在 Y 下失败）/ `doe`（等同，仅侵权）/ `anticipation`（单一引证抵触，仅无效）/ `obviousness-combination`（次引证补缺+结合动机，仅无效）/ `partial` / `not-found` / `needs-evidence` / `construction-dependent`。

**单格状态**：专利 `mapped`/`mapped-doe`/`partial`/`not-found`/`needs-evidence`/`construction-dependent`/`anticipation`/`obviousness-combination`；民事 `supported`/`partial`/`disputed`/`gap`/`needs-discovery`。

**逐格精确引证（不可省、不可造）**：每个 pin cite 都是关于源的断言，由律师核验。引证不出来则该格 `needs-evidence`/`gap`，绝不编造。民事引证格式：证词 `[Doe Dep. 42:15–43:7]`、陈述书 `[Smith Decl. ¶ 12]`、产出文档 `[DEF00012345 at 3]`、自认 `[Def.'s Resp. to RFA No. 5]`、专家报告 `[Jones Expert Rep. at 18]`。

**来源溯源标签**：每条逐字引用在配套 `_sources` 文件/隐藏源列有出处。溯源不到已获取文档的用 `[网搜——待核实]`/`[模型知识——待核实]`/`[用户提供]`，且这些标签绝不删除合并。

**重要性/强度纪律**：民事强度只用四档，过度校准是噪音，真正要紧的是 `weak` 和 `none` 行。

**CSV/表格公式注入防护（强制，写每个格前检查首字符）**：若单元格值首字符是 `=`、`+`、`-`、`@`、制表符 `\t` 或回车 `\r`，**前置一个单引号 `'`** 以中和 Excel/Sheets 公式解释。来自对抗性源的逐字证据（对方主张、竞品手册、第三方现有技术、抓取网页、证词、披露产出）可能含 `=HYPERLINK(...)`、`=cmd|...!A1`、`+WEBSERVICE(...)` 这类被表格执行的字符串，使图表沦为数据外泄或 RCE 载体；RFC 4180 引号无法防住——前导 `=` 仍被解释。CSV/XLSX/Sheets 三处都加，并记录被中和的格供审阅者查。

## 示例

专利侵权对照表：

```markdown
| [#] | 要件（逐字） | 被控特征 | 证据（精确引证） | 映射 | 状态 | 已核验 |
|---|---|---|---|---|---|---|
| 1a | "a processor configured to..." | SoC per datasheet | [Datasheet p. 7] "..." | literal-construction-dependent | mapped | ☐ |
| 1b | "means for [function]" (§112(f)) | [alleged equiv.] | [source, file.c:124] "..." | needs-evidence | needs-evidence | ☐ |
```

民事要件证据对照表：

```markdown
| [#] | 要件 | 支持证据（精确引证） | 相反证据 | 强度 | 状态 | 已核验 |
|---|---|---|---|---|---|---|
| 1 | 合同存在 | [Ex. 3, MSA § 1; Smith Dep. 22:4–14] | none | strong | supported | ☐ |
| 2 | 原告履行 | [Jones Decl. ¶¶ 4–9] | [Doe Dep. 101:3–11: "they never delivered Phase 2"] | moderate | disputed | ☐ |
| 3 | 被告违约 | — | [Doe Dep. 101:3–11] | none | gap | ☐ |
| 4 | 因果关系 | — | — | none | needs-discovery | ☐ |
| 5 | 损害 | [Expert Rep. at 18 — $2.4M] | [Def.'s Expert Rep. at 6 — 质疑方法] | moderate | disputed | ☐ |
```

**输出三件套**（均带工作成果头）：md 表（一表/诉因/权利要求/目标）+ CSV（`[slug].csv` 值 + `[slug]_sources.csv` 逐字引用与引证）+ 按用户偏好的 Excel/Sheets（每要件一行、证据列配隐藏源列、按状态配色：白=mapped/supported、黄=partial/disputed/DOE、橙=needs-evidence/needs-discovery、红=not-found/gap；附 `_elements` 来源溯源表、`_gaps` 缺口表、专利另加 `_claim-parse`/`_constructions`）。文件名：`claim-chart-infringement-[专利号]-claim[#]-[目标]-YYYY-MM-DD.{md,csv,xlsx}` / `element-chart-[诉因slug]-[立场]-YYYY-MM-DD.{...}`。

## 注意事项

- **三道门不可绕过**：披露限制→草稿声明→上下文，每次都最先执行；草稿声明置于每份产出顶部，不删不软化。
- **缺口=首要产物**：md 在表后依次给「抗辩/门槛标记」「缺口/待证清单（首要）」「攻防摘要——最强/最弱要件」「结论行：本技能不下结论，已映射要件=[…]、待证/缺口要件=[…]、解释依赖/争议要件=[…]，需律师裁断」「引证核验提示」。
- **缺口 ≠ 案件完结**：缺口是线索，一份陈述书/专家报告/一次开示可补上；表只指明往哪挖。
- **决策姿态**：要件是否满足拿不准就 `[review]` 标行，不静默替律师裁断；`partial` 告诉律师缺哪一部分。宁可犯可恢复的错（双向门）。
- **辖区特定**：要件清单只是基线，控制性陪审团指示/制定法永远优先，在 `_elements` 表注明要件来源。专利：Rule 11/PLR 要求合理调查与非轻率依据，本表是草稿非主张。
- **仅作实际诉答的诉因/被主张的权利要求**：不因事实可能支持就加诉状未诉的诉因，也不作未被主张的权利要求（除非用户要求）。
- **冲突门（matter 模式）**：案件未在 `_log.yaml` 登记则拒绝构建，指引先跑立项流程（冲突检查是前置门）。
- **目的地检查**：`PRIVILEGED & CONFIDENTIAL` 头只是标签不是控制；越出特权圈分发（公司全员频道、对方律师、业务方）可能弃权，分发前先确认目的地在圈内。
- **非律师门**：使用者为非律师时附「本表是研究草稿非法律文件，送达主张/提交书状/据此出实体意见有 Rule 11 及实体法后果，须相关辖区律师审阅」，并随附一页交给律师的摘要。

## 互见

- requires：`litigation-chronology-builder` —— 时间线条目常成为对照表某格的证据引证；先有事实矩阵的时间轴再填证据矩阵更顺。
- related：`deposition-outline-prep` —— `needs-discovery` 格常变成证言提纲题目，取证后新证言回填各格。
- related：`privilege-log-reviewer` —— 证据语料中的特权判定与本表共用逐格引证+核验状态模型。
- related：`diligence-issue-extractor` —— 同源的逐格引证-核验范式，尽调问题网格是要件对照表的近亲。
- combines_with：`general-counsel-advisor` —— 把缺口/待证清单接入策略层，判断要件攻防意义与下一步动议/开示决策。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
