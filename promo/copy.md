# 推广弹药 · 可直接复制

> 把下面的 `<仓库地址>` 替换成你的 GitHub 链接（如 `https://github.com/你的用户名/everything-skills`）。

---

## 0. 上线前置 checklist（先做完再推广）

- [ ] `git init` → 建 GitHub 仓库 → push（当前还不是 git 仓库）
- [ ] 已加 `LICENSE` + `NOTICE`（合规，**公开前必须**）✅ 已备好
- [ ] 填 `.claude-plugin/marketplace.json` 的 `owner`（现在是占位 "Everything Skills"，改成你的名字/邮箱/主页）
- [ ] README 顶部放一张**互见图谱截图**（用 `promo/showcase-graph.md` 的 Mermaid，在 mermaid.live 渲染后截图）
- [ ] GitHub 仓库 About 填一句话简介 + topics：`claude-code` `agent-skills` `skills` `mcp` `chinese`
- [ ] 验证安装命令真的能跑：`/plugin marketplace add <仓库地址>`

---

## 1. 一句话定位

**中文**：把全网高 star 的 AI Agent 技能，按中国「类书」体例精选、中文化、连成互见知识网的开源技能大典——可 `/plugin marketplace add` 一键安装。

**English**: A curated, cross-referenced *encyclopedia* of the best open-source AI agent skills — re-organized with a classical Chinese "leishu" taxonomy, a skill-relationship graph, and per-skill license attribution. Installable as a Claude Code plugin marketplace.

---

## 2. HelloGitHub 投稿（hellogithub.com/periodical 提交入口）

> **项目名**：技能大典 Everything Skills
> **地址**：<仓库地址>
> **语言**：Markdown / JavaScript
> **简介**：一部"类书"式的 AI Agent 技能库。借鉴《永乐大典》的"事以类聚 + 互见"思想，把全网高 star 仓库（anthropics、trail of bits、wshobson 等）里 500+ 个优质技能**精选、中文化、按 11 卷功能域归类**，并用结构化关系图把技能连成网络。每条都标注了来源与许可。零依赖脚本自动生成索引、互见图谱和可一键安装的插件市场清单。亮点：中文优先、逐条溯源、`taxonomy.json` 受控分类（机器校验）、`/plugin marketplace add` 直接装。

---

## 3. 阮一峰《科技爱好者周刊》投稿

> 去 ruanyf/weekly 仓库提 issue，标题「推荐项目：技能大典」，正文：
>
> 【技能大典 Everything Skills】<仓库地址>
> 一个用中国古代"类书"思路重新组织 AI Agent 技能的开源项目。作者把各大开源仓库里 500 多个 Claude/Codex 技能精选、翻译成中文、按 11 个功能域分类，并用一张"互见图谱"把相关技能连起来（哪些是前置、哪些可组合）。每条技能都标了原始来源和许可。可以作为 Claude Code 插件市场一键安装。有意思的点是它没沿用平铺列表，而是把"分类 + 互见 + 索引"这套古籍编纂法搬到了 AI 技能上。

---

## 4. Show HN（news.ycombinator.com/submit）

> **Title**: Show HN: Everything Skills – AI agent skills organized like a Chinese encyclopedia
>
> **首条评论**：
> I curated 500+ of the best open-source AI agent skills (from anthropics/skills, trailofbits, wshobson/agents and others), translated/adapted them into Chinese, and re-organized everything using the structure of a classical Chinese *leishu* (类书) encyclopedia — categories + cross-references + indexes.
>
> The twist: instead of a flat awesome-list, every skill has a controlled-vocabulary category and a relationship graph (requires / related / combines-with), all machine-validated by a zero-dependency build script. Each skill keeps its upstream license attribution. The repo doubles as an installable Claude Code plugin marketplace.
>
> It's openly a *curation* project, not 500 original skills — the value is the taxonomy, the cross-reference graph, and the Chinese adaptation. Feedback on the structure welcome. <仓库地址>

---

## 5. Reddit r/ClaudeAI

> **Title**: I organized 500+ Claude skills into a cross-referenced "encyclopedia" (installable marketplace)
>
> Most skill repos are flat lists. I tried something different: curated 500+ skills from the big open-source repos, adapted them to Chinese, and organized them with a classical encyclopedia structure — every skill has a category + a graph of related/required/combinable skills. Validated by a build script, attributed per upstream license, and installable via `/plugin marketplace add`. Honest note: it's a curation, sources credited. Would love structural feedback. <仓库地址>

---

## 6. X / Twitter 串（中英混）

1/ 大多数 AI 技能仓库都是一长串平铺列表，找东西全靠 Ctrl+F。
我用《永乐大典》的"类书"思路重做了一遍 👇 <仓库地址>

2/ 500+ 个技能，从 anthropics / trailofbits / wshobson 等高 star 仓库精选 + 中文化，按 11 卷功能域归类，每条都逐条溯源标注许可。

3/ 真正不一样的是「互见图谱」：技能之间的"前置/相关/可组合"关系连成网。[配 showcase 图]

4/ 可直接 `/plugin marketplace add` 装进 Claude Code，还能按卷分装。
开源、署名优先、欢迎 PR。

---

## 7. 掘金 / 知乎 标题候选（配 promo/article-leishu.md 正文）

- 《我用《永乐大典》的思路，重新组织了 500 个 AI Agent 技能》
- 《AI 技能仓库都在堆列表，我把它做成了"类书"》
- 《500+ Claude 技能，按古籍编纂法分类 + 互见成网》

---

## 8. 私信源作者模板（争取转发/star）

> Hi! I built a curated Chinese-language collection of the best agent skills, and included adapted versions of several of yours from <repo>, with full attribution (your name + original MIT/Apache/CC license, see NOTICE/sources.md). Just wanted to credit you directly and say thanks — hope that's cool. <仓库地址>

---

## 节奏建议（一个人）
第 1 周：上线 + 蹭 awesome 列表 PR + HelloGitHub/周刊投稿。
第 2 周：发设计故事文章（掘金/知乎/HN）。
第 3 周起：回 issue、私信源作者、持续加新源（用 .vendor 那套流水线）。
别刷 star、别 spam、别吹原创——慢热但耐久。
