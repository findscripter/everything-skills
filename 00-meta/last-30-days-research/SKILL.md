---
name: last-30-days-research
title: 近 30 天研究：Reddit/X/Web 时效话题速成
description: 当需要在 Reddit/X/Web 上调研近 30 天热议话题、快速成为该话题专家时使用；做的是解析话题与目标工具、跨源检索综合并产出可直接粘贴到目标工具的提示词；不适用于无时效性的通用知识问答或单纯网页摘要；触发词：近30天、时效热议、Reddit X 调研、最佳/推荐 X、为某工具写提示词。
domain: 通用/research
triggers: [近30天热门, Reddit X Web 调研, 最佳/top/推荐某话题, 某话题最新动态/新闻, 为某工具写可粘贴提示词, 时效性话题速成]
tags: [research, web-search, reddit, twitter-x, prompt-engineering, trend, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [WebSearch, Bash, Read]
requires: []
related: [news-sentiment-briefing, entity-research-dossier, multi-source-knowledge-synthesis, query-decomposition-search]
combines_with: [x-twitter-scraper-toolkit, fact-checking, exa-semantic-search]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

需要了解某话题**近 30 天**在 Reddit、X、Web 上的真实热议、推荐与争论，并据此快速成为该话题"专家"、最终为目标工具产出可直接粘贴的提示词时使用。典型场景：

- **提示词类**（PROMPTING）："Nano Banana Pro 真人照"、"Midjourney 提示词" → 学技巧、拿可粘贴提示词
- **推荐类**（RECOMMENDATIONS）："最佳 Claude Code 技能"、"top AI 工具" → 要一份**具体名称**清单
- **新闻类**（NEWS）："OpenAI 最近怎么了"、"AI 最新发布" → 当下事件与更新
- **通用类**（GENERAL）：任意好奇话题 → 理解社区在说什么

**不该用**：无时效性的通用知识问答（直接答即可，无需调研）；只要一份网页摘要而不需要跨源综合或产出提示词；以及话题与"近期社区讨论/热度"无关的场景。

## 步骤

1. **解析用户意图**（动手前先做）：抽取三个变量并记住——
   - `TOPIC`＝要调研的话题
   - `TARGET_TOOL`＝提示词将用于哪个工具（未指定则记 `unknown`）
   - `QUERY_TYPE`＝`RECOMMENDATIONS | NEWS | PROMPTING | GENERAL`
   - 常见模式：`[话题] for [工具]`、`[话题] prompts for [工具]` → 工具已指定；`最佳/top [话题]` → RECOMMENDATIONS。
   - **关键约束：调研前不要追问目标工具**。工具已给就用；未给则**先调研，出结果后再问**。

2. **环境检测（可选 API Key）**：脚本会自动检测 Key 并决定模式，缺 Key 也要继续（web-only 回退）。三种模式：both（Reddit+X+Web，最佳）/ reddit-only 或 x-only / web-only（仅 WebSearch，无互动数据）。**无 Key 不要停**。

3. **运行调研脚本**，按输出判断模式（见下方指令）。

4. **做 WebSearch 补充**（所有模式都做；web-only 模式下它提供全部数据）。按 `QUERY_TYPE` 选查询词：
   - RECOMMENDATIONS：`best {TOPIC} recommendations`、`{TOPIC} list examples`、`most popular {TOPIC}` → 目标是挖**具体名称**而非泛泛建议
   - NEWS：`{TOPIC} news 2026`、`{TOPIC} announcement update`
   - PROMPTING：`{TOPIC} prompts examples 2026`、`{TOPIC} techniques tips`
   - GENERAL：`{TOPIC} 2026`、`{TOPIC} discussion`
   - 所有类型通用：**用用户原话术**，别按自己旧知识替换或追加技术名（如用户说 "ChatGPT image prompting" 就照搜，别擅自加 "DALL-E"）；**排除** reddit.com / x.com / twitter.com（脚本已覆盖）；纳入博客、教程、文档、新闻、GitHub；**不要输出 "Sources:" 列表**。

5. **裁判式综合**（内部进行，先别显示统计）：Reddit/X 源**权重更高**（有点赞/评论等互动信号），WebSearch 源权重更低；找出三源都出现的最强信号；记下矛盾点；提炼 3-5 条可执行洞见。**务必基于真实调研内容**，而非既有知识——注意精确产品名（如 "ClawdBot" ≠ "Claude Code"，勿混为一谈）。若是 RECOMMENDATIONS，要数清每个具体名称被提及次数并按热度排序。**特别留意调研推荐的提示词格式**（JSON / 结构化参数 / 自然语言 / 关键词），后续产出必须照此格式。

6. **展示"我学到了什么" + 统计 + 邀请**（顺序固定，输出干净、用真实数字，不要 "Sources:" 列表）：先按 QUERY_TYPE 给洞见/榜单，再给统计块，最后给邀请语。若 `TARGET_TOOL` 仍 unknown，**此时才问**用什么工具，然后**停下等用户**。

7. **用户给出愿景后，写一条最贴合的提示词**：**格式必须匹配调研结论**（说 JSON 就写 JSON，说自然语言就写散文）。仅当用户要更多选项时再给 2-3 个变体。

8. **进入专家模式**：后续追问**不再发起新 WebSearch**，直接用已有调研回答；仅当用户换到**全新话题**才重新调研。

## 指令

首次配置（可选，加 Key 提升效果）：

```bash
mkdir -p ~/.config/last30days
cat > ~/.config/last30days/.env << 'ENVEOF'
# last30days API Configuration（两个 Key 均可选，缺则走 WebSearch 回退）
OPENAI_API_KEY=     # Reddit 调研（OpenAI web_search）
XAI_API_KEY=        # X/Twitter 调研（xAI x_search）
ENVEOF
chmod 600 ~/.config/last30days/.env
```

运行调研脚本（脚本自动检测 Key 并输出模式行 `Mode: both|reddit-only|x-only|web-only`）：

```bash
TOPIC_FILE="$(mktemp)"
trap 'rm -f "$TOPIC_FILE"' EXIT
cat <<'LAST30DAYS_TOPIC' > "$TOPIC_FILE"
$ARGUMENTS
LAST30DAYS_TOPIC
python3 ~/.claude/skills/last30days/scripts/last30days.py "$(cat "$TOPIC_FILE")" --emit=compact 2>&1
```

深度开关（从用户命令透传）：`--quick`（每源 8-12 条）/ 默认（20-30 条）/ `--deep`（Reddit 50-70、X 40-60）。

统计块模板（full/partial 模式）：

```
✅ All agents reported back!
├─ 🟠 Reddit: {n} threads │ {sum} upvotes │ {sum} comments
├─ 🔵 X: {n} posts │ {sum} likes │ {sum} reposts
├─ 🌐 Web: {n} pages │ {domains}
└─ Top voices: r/{sub1}, r/{sub2} │ @{handle1}, @{handle2}
```

web-only 模式则只列 Web 统计，并提示加 Key 解锁互动数据。

## 示例

输入 `最佳 Claude Code 技能`（QUERY_TYPE=RECOMMENDATIONS）：

- 反面综合（差）：「技能很强大，控制在 500 行内，用渐进式披露。」——这是泛泛建议，没给名字。
- 正面综合（好）：「提及最多的技能：/commit（5 次）、remotion skill（4 次）、git-worktree（3 次）、/pr（3 次）。Remotion 公告在 X 上获 16K 赞。」——给出具体名称 + 提及次数 + 来源。

榜单展示模板：

```
🏆 提及最多：
1. [具体名称] — {n}x（r/sub、@handle、blog.com）
2. ...
其他值得一提：[1-2 次提及的具体项]
```

产出提示词时，若调研说"用带设备规格的 JSON 提示词"，就**真的写成 JSON**，结尾用一行说明所用洞见，例如：`此提示词应用了调研中的「结构化 JSON + 真实设备分辨率」模式。`

## 注意事项

- **缺 API Key 不要停**，自动走 web-only；只是没有互动指标。
- **调研前不问目标工具**；未指定则先出结果再问。
- **杜绝知识投射**：综合前自检——"我学到了什么"是否与调研**真实内容**一致？话题若是 ClawdBot 就别写成 Claude Code。
- WebSearch **用用户原术语**，别按自身（可能过时的）知识替换或扩写技术名。
- 始终**排除** reddit.com / x.com / twitter.com，**不输出 "Sources:" 列表**，统计只在末尾呈现。
- 产出提示词的**格式必须匹配调研结论**，否则前面的调研白做。
- 用真实数字填统计块，不要编造。

## 互见

- `deep-research`：需要多源、对抗式核查、带引用的深度研究报告时用它；本技能偏"近 30 天时效话题速成 + 产出可粘贴提示词"。
- 各 WebSearch / WebFetch 能力：本技能的 web-only 回退即依赖通用网页检索。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
