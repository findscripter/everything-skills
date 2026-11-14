# 技能大典 · Everything Skills

[English](https://github.com/findscripter/everything-skills/blob/main/README.md) · **简体中文**

<!-- BEGIN GENERATED:brand -->
<p align="center">
  <a href="INDEX/catalog.md"><picture><source media="(prefers-reduced-motion: reduce) and (max-width: 600px)" srcset="assets/brand/hero-mobile-static.svg" /><source media="(prefers-reduced-motion: reduce)" srcset="assets/brand/hero-static.svg" /><source media="(max-width: 600px)" srcset="assets/brand/hero-mobile.svg" /><img src="assets/brand/hero.svg" alt="Everything Skills — a connected atlas of Agent Skills" width="1200" /></picture></a>
</p>

<p align="center"><strong>从任务出发找技能，沿关系组合工作流，按领域安装。</strong></p>

<p align="center">
  <a href="INDEX/catalog.md">技能总目</a> · <a href="INDEX/graph.md">关系图谱</a> · <a href="INDEX/skill-repos.md">外部技能库</a> · <a href="CONTRIBUTING.md">贡献指南</a>
</p>

<p align="center">
  <picture><source media="(max-width: 600px)" srcset="assets/brand/stats-mobile.svg" /><img src="assets/brand/stats.svg" alt="1115 skills · 11 volumes · 6795 relation edges · 4523 indexed entries" width="1200" /></picture>
</p>
<!-- END GENERATED:brand -->

从任务找到技能，把技能组合成工作流，再按需安装对应的卷。

**[在线搜索技能](https://findscripter.github.io/everything-skills/)** · **[跟着示例做一遍](examples/README.zh.md)** · [完整目录](INDEX/catalog.md) · [技能关系](INDEX/graph.md)

<details>
<summary>观看 33 秒目录操作演示</summary>

![真实目录搜索、筛选与分卷安装说明](assets/demos/catalog-walkthrough.gif)

[清晰视频与录制范围说明](assets/demos/README.md)

</details>

## 1. 选任务，找组合

| 你的任务 | 从这里开始 | 再搭配 |
| --- | --- | --- |
| 接手一个陌生代码库 | [codebase-onboarding-doc](07-productivity/codebase-onboarding-doc/SKILL.md) | [monorepo-navigator](02-engineering/monorepo-navigator/SKILL.md) |
| 解释论文并整理引用 | [academic-paper-explainer](09-verticals/academic-paper-explainer/SKILL.md) | [citation-management](01-documents/citation-management/SKILL.md) |
| 评审与测试 REST API | [api-design-reviewer](02-engineering/api-design-reviewer/SKILL.md) | [api-test-suite-builder](02-engineering/api-test-suite-builder/SKILL.md) |
| 审计网页无障碍体验 | [accessibility-wcag-audit](02-engineering/accessibility-wcag-audit/SKILL.md) | [wcag-22-audit-patterns](02-engineering/wcag-22-audit-patterns/SKILL.md) |

打开技能的 `SKILL.md` 查看范围、输入和依赖。[工作流示例](examples/README.zh.md) 提供首句提示词、预期产物和检查方法；需要更多覆盖时，再沿着 `requires`、`related`、`combines_with` 查找前置与搭配技能。

## 2. 安装并试一个任务

### Claude Code

在 Claude Code 内执行下面两条命令，添加插件市场并安装研发卷：

```text
/plugin marketplace add findscripter/everything-skills
/plugin install 02-engineering@everything-skills
```

然后提供 OpenAPI 文件或接口说明，用这句话开始：

> 使用 api-design-reviewer 技能评审这份 REST API。先阅读前置条件，缺少输入时向我确认，再输出兼容性问题、对应证据和修改建议。

每卷是一个独立插件；其他任务可选择下表中的卷，也可以安装多卷。

### 通过 skills CLI 为 Codex 安装单个技能

准备 Node.js **22.20.0 及以上版本**，在需要使用技能的项目目录运行：

```sh
npx skills@1.7.4 add findscripter/everything-skills --skill codebase-onboarding-doc --agent codex --copy
```

这条命令在项目范围安装所选技能文件；实际执行任务前仍需核对技能要求的工具与输入。只查看默认公开集合、不安装时，单独执行：

```sh
npx skills@1.7.4 add findscripter/everything-skills --list
```

Claude Code 的按卷插件与 skills CLI 的单技能安装是两条可选路径。

### Node.js 22 及以上版本的本地检索

先准备 Git、Node.js **>=22** 和 npm，然后在终端执行：

```sh
git clone https://github.com/findscripter/everything-skills.git
cd everything-skills
node --version
npm run skill -- search "API review"
npm run skill -- why api-design-reviewer
```

CLI 无第三方依赖，不需要 `npm install`。它检索已随仓库提供的索引，`why` 展示技能关系。打开返回路径中的 `SKILL.md`，再让 Agent 按它处理任务。Codex、Cursor、Gemini CLI 可通过 [AGENTS.md](AGENTS.md)、[CLAUDE.md](CLAUDE.md)、[GEMINI.md](GEMINI.md) 熟悉本仓库的导航方式。

### 系统入口与组合方案

`bin/everything-skills.mjs` 使用自身的目录位置，从其他项目目录调用时也能定位索引：

```sh
node bin/everything-skills.mjs compose api-review --json
node bin/everything-skills.mjs show api-design-reviewer --json
```

`compose` 返回有序的已登记案例配方或无序搭配建议，不执行步骤；`show` 返回正文、绝对路径和资源目录。[目录导航技能](00-meta/everything-skills-catalog/SKILL.md) 说明如何按阶段使用。可选系统包、客户端接入、依赖与限制见 [Arch/Omarchy 接入说明](docs/omarchy.md)；该包尚未进入 Omarchy 软件仓库。

## 3. 按领域继续探索

| 卷 | 适用任务 |
| --- | --- |
| [00-meta](00-meta/README.md) | 研究、规划、推理与 Agent 工作流 |
| [01-documents](01-documents/README.md) | 文档、表格、演示与写作 |
| [02-engineering](02-engineering/README.md) | 开发、架构、测试与交付 |
| [03-data](03-data/README.md) | 分析、数据库与数据工程 |
| [04-ai](04-ai/README.md) | 模型、RAG、Agent 与评测 |
| [05-business](05-business/README.md) | 营销、产品、经营与增长 |
| [06-creative](06-creative/README.md) | 设计、图像与音视频 |
| [07-productivity](07-productivity/README.md) | 沟通、项目与个人工作流 |
| [08-security](08-security/README.md) | 防御审计、风险与合规 |
| [09-verticals](09-verticals/README.md) | 科研、医疗、法律与领域专精 |
| [10-platform](10-platform/README.md) | 云平台、CLI、连接器与自动化 |

## 收录内容与证据

按卷插件可安装 **1094 条现行技能**；目录另保留 **21 条归档记录**用于来源追溯和迁移，合计 **1115 个技能目录**。正文保留原始语言。

**4523 条外部仓库记录**用于发现上游项目，其技能正文不包含在按卷插件中。日常仓库收集扩充这份外部目录，仓库内技能的新增与修订另按采编流程处理。

[技能目录](INDEX/catalog.md)、[标签](INDEX/tags.md)、[关系图](INDEX/graph.md)、[search.json](INDEX/search.json)、[quality.json](INDEX/quality.json) 是生成的导航与证据视图。审核状态、新鲜度、许可与运行依赖分别记录；`unknown`、`unreviewed` 表示尚无对应验证结论。运行前请阅读所选技能的前置条件与[来源/许可记录](INDEX/sources.md)。

## 参与维护，关注更新

想推荐技能，或发现某条工作流有问题？[提交 Issue](https://github.com/findscripter/everything-skills/issues/new)，或按 [CONTRIBUTING.md](CONTRIBUTING.md) 参与贡献。如果这个合集帮到了你，可以 Star 方便下次找到，并[关注 Releases](https://github.com/findscripter/everything-skills/releases) 获取精选更新。

[项目架构](ARCHITECTURE.md) · [语言策略](LANGUAGE.md) · [维护 SOP](sop.md) · [安全约定](SECURITY.md) · [来源](INDEX/sources.md) · [许可](LICENSE) · [声明](NOTICE)

---

<!-- BEGIN GENERATED:skill-repos -->
## 技能仓库目录

浏览 **4523** 条外部 GitHub 技能库、市场和精选列表目录记录；这些上游的技能正文不随本仓库安装。

点击分类查看完整条目、摘要、许可、历史 Stars 与复核状态。[完整仓库总目](INDEX/skill-repos.md)。

| 分类 | 目录记录 |
| --- | ---: |
| [官方与权威](INDEX/skill-repos.md#1-官方与权威) | 547 |
| [精选列表 / 大集合](INDEX/skill-repos.md#2-精选列表--大集合) | 759 |
| [垂直领域技能包](INDEX/skill-repos.md#3-垂直领域技能包) | 2066 |
| [安装器 / 注册表 / 基础设施](INDEX/skill-repos.md#4-安装器--注册表--基础设施) | 928 |
| [其他技能库](INDEX/skill-repos.md#5-其他值得索引的技能库) | 24 |
| [名称不含 skill / agent](INDEX/skill-repos.md#6-名称不含-skill--agent-的技能库本轮追加) | 199 |

已记录的上游状态: 6 上游已归档 · 19 不可访问，保留历史 · 1 仅历史来源.
<!-- END GENERATED:skill-repos -->
