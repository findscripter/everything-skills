---
name: entity-research-dossier
title: 实体决策级调研档案（entity-research-dossier）
description: 当你要面见/投资/尽调/竞调某个公司·人物·非营利·政府机构，需要一份「检验假设」而非泛泛介绍的调研档案时使用；强制先说出你的假设，再做支持/反证双向取证，产出带假设裁决、身份事实、12个月时间线、关系网、声誉、红旗、3-5条对话切入点和来源审计的可编辑 Word（.docx）；不适用于「介绍一下微软」式通用画像、无消歧标识的同名实体、或拒不给出任何假设。触发词：调研某公司、给某人做背景档案、会前准备、投前尽调、竞品研究
domain: 通用/research
triggers: [调研这家公司, 给某人/某公司做背景档案, 帮我准备和XX的会面, 对XX做尽职调查, 我该了解这家公司的什么, 投前尽调/投资�diligence, 竞品/竞争对手研究, 面试前研究这家公司, 背景核查 background check, dossier on / due diligence on]
tags: [实体调研, 尽职调查, 竞争情报, 会前准备, 假设检验, websearch, webfetch, sec-edgar, docx报告, 来源审计]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [WebSearch, WebFetch, Bash, Read, Write]
requires: []
related: [fact-checking, competitive-analysis, competitive-intel-tracker, news-sentiment-briefing]
combines_with: [fact-checking, boardroom-deliberation, ma-playbook]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当你即将就某个**具体实体**（公司 / 人物 / 非营利组织 / 政府机构）做出决策，需要一份能**检验你预设判断**的调研档案时使用。典型用法是带着假设来：

> 「我周二要向微软推介。我的假设是他们正把 AI 预算集中到自家 Foundry 平台上。帮我验证或推翻，并给我三条与发现挂钩的对话切入点。」

它的核心差异化在于**强制假设检验**：每次调用都逼你先暴露假设（见步骤 Q4），档案据此**主动找反证**，而不是确认你已经相信的东西。产出是可编辑的 Word 文档，含对假设的裁决（成立 / 部分成立 / 被推翻 / 无法定论）。

**不该用于：**
- 「介绍一下微软」式的通用画像——这种请求应被拒绝或要求补充假设，否则只会得到一份维基百科摘要。
- 同名实体未消歧（有 47 个 John Smith、3 家叫「Atlas」的公司）——必须先拿到唯一标识，否则拒绝开工。
- 用户坚决不肯给任何假设——退一步推一次，仍拒绝则回落到隐式假设并在审计日志中标注。
- Q6 中用户声明排除的敏感话题（医疗、家庭、政治史等）。

## 步骤

整个流程分 10 个阶段，强调「先逼问、再消歧、后取证」。

**阶段 1 — 逼问式访谈（6 个强制问题，一次只问一个，禁止打包）**
- **Q1 主体身份**：要确切名称；公司给官网/LinkedIn URL，人物给 LinkedIn URL 或唯一标识（任职单位+职位）。只给名字则追问第二标识，**同名歧义拒绝继续**。
- **Q2 主体类型**：人物 / 公司 / 非营利 / 政府机构 / 其他（其他需一句话描述）。决定后续用哪套信源矩阵。
- **Q3 用途**：1 销售/合作推介 2 投资尽调 3 收购尽调 4 新闻调查/尽调 5 求职面试准备 6 竞争情报 7 个人核验（约会/招聘/合伙）8 其他。用途决定角度、深度与红旗敏感度。
- **Q4 假设 — 强制必答**：「你进场时的假设是什么？你已经相信什么、想验证或推翻什么？」这是**非通用化的锚点**，跳过它技能就退化为维基摘要。用户说「没有」就推回一次：「那就猜一个，给出一个事后可修正的立场。」仍拒绝则回落到隐式假设「我能挖到的最意外的事是什么」并在审计日志标注。
- **Q5 深度**：5 分钟简报（≤10 次搜索、跳过关系网+声誉环节）或 15 分钟决策级档案（每节深挖）。
- **Q6 敏感排除**（仅当 Q3 ∈ {新闻调查, 个人核验} 时问）：是否有需排除的敏感内容（医疗、家庭、政治史等）。低敏感用途跳过。

**停止条件**：Q6（或因依赖跳过更早）之后即提交并进入阶段 2，**阶段 2 开始后绝不重开访谈**。

**阶段 2 — 主体消歧**：人物确认 LinkedIn URL 或（雇主+职位+城市）；公司确认域名或（法定名称+注册地）；非营利确认 EIN 或（法定名称+州）；政府机构确认官方 .gov URL。仍有歧义则**停下重问 Q1**。

**阶段 3 — 信源矩阵选择**（按 Q2 路由）：
- 人物：LinkedIn、个人网站、Twitter/X（限流，优雅降级）、GitHub（技术人）、Google Scholar（学者）、新闻（WebSearch+WebFetch）、演讲/播客文字稿。
- 公司：官网（about/leadership/news/careers）、SEC EDGAR（免费 API，上市公司 10-K/10-Q/8-K）、Crunchbase 免费层、新闻、GitHub（技术公司）、Glassdoor+Comparably（情绪，被封则降级）、LinkedIn 公司页。
- 非营利：ProPublica Nonprofit Explorer（免费，Form 990）、官网、新闻、GuideStar。
- 政府机构：官方 .gov、新闻、ProPublica（联邦机构）。
- 接入了付费 MCP（Apollo/Pitchbook/SimilarWeb）就用，但在审计日志中标记为 **BYOK 来源**。

**阶段 4 — 假设驱动搜索**：每次搜索必须归类为**支持证据**或**反证证据**；**至少 30% 的搜索预算分配给反证查询**（用 `scripts/disconfirming_evidence_balance.py` 强制校验）。这是档案「决策级」而非「确认偏误」的关键。每次搜索用 `citation_tracker.py` 记录分类，用 `source_tier_classifier.py` 给每个结果 URL 打可靠性层级。

**阶段 5 — 12 个月活动时间线**：默认 12 个月窗口；类别含新闻（并购/入职/离职/产品发布）、融资/财务事件、争议/法律事件、公开表态/战略转向。倒序排列，每条带超链接与层级。

**阶段 6 — 关系网 + 声誉信号**：关系网取 5-10 条按「与假设相关性」排序（公司=投资人/客户/合作方；人物=联合创始人/顾问/任职/董事会；非营利=资助方/董事会/负责人）。声誉取近 12 个月新闻情绪、公司 Glassdoor（总评分+3 条代表性评价）、人物的同行提及；注明声誉数据噪声大，按层级标注。

**阶段 7 — 红旗排查**（呈现但不渲染）：诉讼（法庭记录→一级）、监管处罚（SEC/DOJ→一级）、异常人事（90 天内核心人员离职）、财务信号（10-K 的持续经营存疑→一级）、声誉冲击（持续负面报道→二级）。**每个红旗都带层级**。

**阶段 8 — 对话切入点生成**：3-5 条**与真实发现挂钩**的切入点（非通用话术）。每条含：切入点一句话 + 所挂钩的发现（带超链接+层级）+ 可直接套用的措辞（suggested framing）。

**阶段 9 — DOCX 生成（9 节）**：用 Node.js + `docx` 库。九节为 1 执行摘要（含假设裁决与三条须知）2 身份事实表（每格带来源与层级悬浮提示）3 假设检验（逐字复述用户假设 + 3-5 条支持证据 + 3-5 条反证证据 + 裁决段）4 12 个月时间线 5 关系网信号 6 声誉信号 7 红旗与隐藏模式 8 对话切入点 9 来源出处与审计日志（每来源列层级、搜索汇总表、三计数+分层计数、失败搜索、BYOK 使用标记）。

**阶段 10 — 交付**：保存到 `<output-dir>/dossier_<entity-slug>_<YYYY-MM-DD>.docx`；聊天中回报文件路径 + 假设裁决 + 审计计数 + 分层明细 + 用到的 BYOK MCP；并校验 `python scripts/office/validate.py <docx>`。

## 指令

代理诚信规则（来自研究包约定，逐条遵守）：
- **执行纪律**：顺序调用搜索，确认上一次返回再发下一次，保持约 1 q/sec 礼貌限速。
- **来源纪律**：只引用本次会话工具调用返回的来源。维基百科/训练知识标注 `[背景信息——引用前需核实]`，不计入主要发现数。
- **三计数追踪**：发出查询数 / 收到来源数 / 引用来源数，外加**分层明细（一级/二级/三级）**，呈现在审计日志中。
- **重试策略**：失败→等 3 秒→重试一次→记录。连续失败 3 次：停止并告警用户。
- **来源可靠性分层**：每条引用标 一级（官方、SEC、法庭记录）/ 二级（主流新闻、行业媒体）/ 三级（博客、论坛）；DOCX 中每个标记旁都显示层级。

DOCX 样式：正文 Arial 12pt，深蓝标题（#1a3a5c），浅蓝表头（#e8f0f8），红色红旗标注，绿色对话切入点标注。

超链接写法（docx 库）：

```js
new ExternalHyperlink({
  link: "https://...",
  children: [new TextRun({ text: title, style: "Hyperlink" })],
});
```

配套脚本：

| 脚本 | 作用 |
|---|---|
| `scripts/citation_tracker.py` | 三计数审计 + 支持/反证分类 + 来源分层，会话状态存于 `~/.dossier_sessions/<session>.json` |
| `scripts/disconfirming_evidence_balance.py` | 校验反证查询是否占搜索预算 ≥30%，偏倚时告警 |
| `scripts/source_tier_classifier.py` | 按域名启发式把 URL 归为 一级/二级/三级 |

## 示例

通用话术 vs 与发现挂钩的切入点（这是质量分水岭）：

| ❌ 通用 | ✅ 挂钩发现 |
|---|---|
| 「问问他们的路线图」 | 「提一下他们近期对 X 的收购——这表明他们在押注 Y 垂直领域。建议措辞：『看到 X 的公告了——这会怎样改变你们在 Y 上的路线图？』」 |
| 「问问招聘」 | 「他们的工程 VP 三周前离职了（LinkedIn）。建议措辞：『我注意到某某离开了——工程线领导层后续怎么安排？』」 |
| 「聊聊他们的价值观」 | 「上周他们更新了定价页（官网）。建议措辞：『看到定价调整了——是什么驱动的？』」 |

反证预算示例（假设「微软正把 AI 预算集中到 Foundry」）：
- **支持查询**：「Microsoft Foundry adoption 2026」「Microsoft AI infrastructure consolidation」
- **反证查询**：「Microsoft OpenAI deal renegotiation」「Microsoft AI vendor diversification」「Microsoft third-party model partnerships 2026」

## 注意事项

错误处理：
- 主体名称歧义 → 拒绝继续，带消歧标识重问 Q1。
- 用户拒绝给假设 → 推回一次；仍拒绝则回落到「最意外的发现」隐式假设并在审计标注。
- 主体几乎没有公开足迹 → 明确说明，建议换名或说明是早期阶段，**不要编造**。
- LinkedIn 抓取被封 → 审计中记录，回落到 WebSearch，建议用户手动核实。
- SEC EDGAR 失败 → 重试一次，仍失败则记「未取得公开文件」并继续。
- 情绪数据稀少 → 声誉节标「公开信号有限」，**不从训练知识臆测**。
- 触及 Q6 排除的敏感话题 → 从 DOCX 中剔除，仅在聊天中告知（不写进 DOCX），让用户知道排除已被遵守。
- 连续 3 次工具失败 → 停止、告警、交付已收集内容。
- DOCX 生成失败 → 把原始数据存为 JSON 兜底。

必须拒绝的反模式：没逼问 Q4 假设就出档案；反证证据 <30% 搜索预算；打包问访谈问题；接受歧义主体名；通用对话切入点；渲染/编辑红旗（应分层、不评论）；红旗上漏掉可靠性层级；抓取被封时编造覆盖面；用 BYOK MCP 数据却不在审计标注；纳入 Q6 已排除的敏感话题；不回应反证就给「成立」的确认偏误裁决。

可移植性：需要 `WebSearch` + `WebFetch`、装有 `docx` 包的 Node.js，免费 API 用 `bash` + `curl`（SEC EDGAR、GitHub、ProPublica）。BYOK MCP（LinkedIn、Crunchbase、Apollo、Pitchbook、SimilarWeb）为可选增强。在 Claude Code CLI 原生可用。

## 互见

- `references/hypothesis_testing_discipline.md` — ≥30% 反证规则 + 决策级 vs 百科式的判定标准
- `references/subject_type_source_matrix.md` — 人物/公司/非营利/政府的信源矩阵全文
- `references/conversation_hook_quality.md` — 与发现挂钩的切入点纪律

---

采编自 alirezarezvani/claude-skills（MIT 许可证），原技能 `dossier`（源规格 megaprompts/12-dossier-megaprompt.md，Path B 直转，假设检验变体）。本条为适配中文「技能大典」的重写版，保留其强制假设检验、≥30% 反证、来源分层与审计、9 节 DOCX 等关键约束。
