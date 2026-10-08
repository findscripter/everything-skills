# 技能大典 · Everything Skills

<!-- BEGIN GENERATED:brand -->
<!-- END GENERATED:brand -->

## 快速开始

在 Claude Code 中添加插件市场，再选择需要的卷：

```text
/plugin marketplace add findscripter/everything-skills
```

例如，安装研发卷：

```text
/plugin install 02-engineering@everything-skills
```

每条技能由一个 `SKILL.md` 和独立目录组成。Codex、Cursor、Gemini CLI 等 Agent 可通过 [AGENTS.md](AGENTS.md)、[GEMINI.md](GEMINI.md) 或 [CLAUDE.md](CLAUDE.md) 找到技能，再按任务读取所需指令。

## 从发现到组合

<p align="center">
  <picture><source media="(max-width: 600px)" srcset="assets/brand/workflow-mobile.svg" /><source media="(prefers-reduced-motion: reduce)" srcset="assets/brand/workflow-static.svg" /><img src="assets/brand/workflow.svg" alt="通过描述与触发词发现技能，沿 requires / related / combines_with 关系查找前置与搭配技能，再组合工作流。" width="1200" /></picture>
</p>

这是一部面向 AI Agent 的技能类书：按领域归位，用关系图连接。通过 `domain`、`tags`、`triggers` 缩小候选范围，再按 `description` 匹配任务。技能正文保持原始语言，每个技能只存放一处。

完整技能目录见 [Catalog](INDEX/catalog.md)，标签入口见 [Tags](INDEX/tags.md)，依赖、互见与组合关系见 [Graph](INDEX/graph.md)。机器可读版本为 [search.json](INDEX/search.json) 和 [graph.json](INDEX/graph.json)。

## 十一卷，按需取用

| 卷 | 领域 | 适用任务 |
| --- | --- | --- |
| [00-meta](00-meta/README.md) | 通用 | 研究、规划、思考与 Agent 工作方法 |
| [01-documents](01-documents/README.md) | 文书 | 文档、表格、演示与写作 |
| [02-engineering](02-engineering/README.md) | 研发 | 开发、架构、测试与交付 |
| [03-data](03-data/README.md) | 数据 | 分析、数据库与数据工程 |
| [04-ai](04-ai/README.md) | 智能 | 模型、RAG、Agent 与评测 |
| [05-business](05-business/README.md) | 商业 | 营销、产品、经营与增长 |
| [06-creative](06-creative/README.md) | 创意 | 设计、图像、音视频与交互 |
| [07-productivity](07-productivity/README.md) | 协作 | 沟通、项目、流程与个人效率 |
| [08-security](08-security/README.md) | 安全 | 防御审计、风险与合规 |
| [09-verticals](09-verticals/README.md) | 领域专精 | 科研、医疗、法律与行业工作流 |
| [10-platform](10-platform/README.md) | 平台集成 | 云平台、CLI、连接器与自动化 |

## 维护与贡献

技能元数据和外部仓库 JSONL 是源数据，目录、图谱与品牌统计由脚本生成。新增或修改条目后运行 `npm run build:zh`（中文）或 `npm run build`（英文）；提交后运行对应的 `check:zh` / `check` 确认生成物一致。

- [CONTRIBUTING.md](CONTRIBUTING.md)：添加、修改和验证技能。
- [ARCHITECTURE.md](ARCHITECTURE.md)：源数据、生成物与发布边界。
- [LANGUAGE.md](LANGUAGE.md)：`main` / `zh` 界面与原语言技能正文；历史 `en` 镜像已废弃。
- [PROJECT-REVIEW.md](PROJECT-REVIEW.md)：本次全库审查、已修正问题和后续建议。
- [assets/brand/README.md](assets/brand/README.md)：动画 Logo、静态版本与 SVG 素材使用方法。

安全与许可：技能是 Agent 指令包，来源与许可见 [INDEX/sources.md](INDEX/sources.md)、[LICENSE](LICENSE) 和 [NOTICE](NOTICE)；使用约定见 [SECURITY.md](SECURITY.md)。

---
