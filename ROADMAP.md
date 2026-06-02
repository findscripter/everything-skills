# 路线图 · ROADMAP

> 来源：对分类法与字段规范做的 3 视角对抗式评审（discovery 发现机制 / maintainer 归位 / scale 规模化）。
> 三个视角高度收敛。下面区分**本次已折叠进骨架**与**待办（按 P0–P3）**。骨架阶段先立架构与治理护栏，填肉阶段再补量与工具。

## ✅ 已折叠进骨架（本次）

- **修复 domain↔卷目录一致性校验**（旧版注释声称校验、`validate()` 实则没做——评审抓到的真 bug）。现为 error 级。
- **互见图健壮性**：悬空互见 → error；指向已弃用技能 → error；`requires` **环检测** → error；`related`/`combines_with` 无向去重渲染。
- **弃用链校验**：`status=deprecated` 必须有 `supersedes` 且目标存在。
- **召回层产物 `INDEX/search.json`**：扁平记录（name/title/domain/tags/triggers/description），为「两段式发现」打地基。
- **description 治理（弱版）**：自动解析「触发词：」入 search.json；过短/过长/缺触发词告警。
- **agents 受控词表**告警。
- **新增卷十 · 平台集成**（integration/cli/cloud/browser/mcp）——安置 `lark-*`、连接器、CLI、抓取这类原本无家可归的高频技能。
- **研发卷补 `mobile` / `observability`**；`fullstack` 降级为 `combines_with`（不再并列）。
- **verticals 正交规则**：垂直卷只收行业强绑定技能，纯功能实现放功能卷 + 行业 tag。
- **降噪**：`version` / `level` / `tags` 由必填改为可选；默认 license 由 CC-BY-SA-4.0 → **CC-BY-4.0**（利于单包自由复制）。

## ⏳ P0（填肉前必须补）

- **类（第二层）受控化**：建 `taxonomy.json`（卷→合法类枚举），生成器 error 级校验 `domain` 的「类」∈ 本卷类集，并消除样例里 `Office`/`思维`/`SQL` 这类中英大小写不一致。
- **description 结构化强校验**：固定模板「当〈场景〉时使用；做〈动作+产物〉；不适用于〈负边界〉；触发词：a、b、c」，四段齐全方可合入；设长度硬上限（error）。**负触发词是降误召的关键，当前缺失。**
- **发现回归集**：`scripts/eval-discovery.mjs` + `queries.jsonl`（用户说法→期望命中 name），用关键词/嵌入跑召回率与误召率。没有它，「description 发现」无法证伪。
- **两段式发现协议**：先按 `domain`/`tags`/`triggers` 粗筛候选，再按 `description` 精排——消费 `search.json`，让分类法真正进入召回链路（否则分类对 Agent 零贡献）。

## ⏳ P1

- 用**真 YAML 解析器**替换手写正则；每条 `SKILL.md` 加 `schema_version` 以支持未来字段演进迁移。
- **互见反向边自动补全**：`related`/`combines_with` 单写一处，生成器补双向（规模化下人工双向维护必失败）。
- **卷间消歧矩阵**：对 writing↔copy↔communication、automation↔devops↔agents、review↔audit 等高频争议写明默认归属与判据，并做成可校验约束（主类唯一）。
- **补缺类**：web-scraping/browser 收编、integration 收窄 automation、observability 落地。
- **生命周期字段**：`owner` / `last_reviewed` / `deprecate_reason` + 一个 health 体检报告（列出 N 月未更新、孤岛、被弃用却仍被依赖者）。

## ⏳ P2 / P3

- **受控词表 + 归一**：tags/agents/tools 建词表，`pdf=PDF=PDFs` 别名归一，避免索引碎片化。
- **图谱分片渲染**：单一 Mermaid 图在数千节点不可渲染——改按卷生成子图；catalog 也分卷。
- **国际化**：`description_en` / `keywords_en`，title 中英并存（服务英文语境 Agent，提升英文触发词召回）。
- **version 去仪式化**：要么让工具消费它（驱动弃用/兼容/变更日志）并规定 bump 规则，要么删除直到有依赖求解需求。

---

*评审是为了让骨架经得起规模化，而非堆砌。每条 P0/P1 落地时，更新此表的状态。*
