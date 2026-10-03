# Everything Skills 架构说明

## 目标

本项目是一个以 `SKILL.md` 为最小发布单元的 Agent 技能目录。它没有运行时服务，核心质量来自数据契约、索引生成和多语言分支之间的一致性。

## 数据流

```text
00-meta … 10-platform/**/SKILL.md
        │ frontmatter + 正文
        ▼
scripts/build-index.mjs
        ├── INDEX/catalog.md / tags.md / tools.md
        ├── INDEX/graph.md / graph.json / search.json / sources.md
        ├── .claude-plugin/marketplace.json
        └── AGENTS.md / CLAUDE.md / GEMINI.md / gemini-extension.json

data/skill-repos*.jsonl + data/skill-repos.meta.md
        │ 共享 JSONL loader
        ├── scripts/build-skill-repos.mjs --lang=en|zh → INDEX/skill-repos.md
        └── scripts/refresh-readme-skill-repos-directory.mjs --lang=en|zh → README.md
```

`SKILL.md` frontmatter、`taxonomy.json` 和 `data/skill-repos*.jsonl` 是源数据；`INDEX/`、根部多 harness 文件、插件市场清单和 README 技能仓库区是生成物，禁止手工修改生成区。

## 语言策略

- `main`：英文仓库 chrome，技能正文保持原始语言。
- `zh`：中文仓库 chrome。
- `en`：历史英文镜像分支，已不作为主发布路径。

语言必须通过 `--lang=en|zh` 显式传入统一入口 `scripts/build-all.mjs`。CI 根据目标分支传入同样的语言参数。

## 维护边界

- 索引生成器只扫描 11 个受控卷目录，并跳过嵌套 Git checkout，防止本地辅助 clone 被误纳入数据源。
- 生成器先完成校验，再开始逐文件替换生成物；校验失败不会开始写入，写入异常会清理临时文件并报错。
- `scripts/load-skill-repos.mjs` 是技能仓库 JSONL 的唯一加载与去重入口，README 和 INDEX 不允许各自解释数据。
- CI 只读执行完整生成与漂移检查，覆盖所有生成物；不在 PR 中向贡献分支写入或推送代码。

## 常用命令

```bash
# main 风格
npm run build
npm run check

# zh 风格
npm run build:zh
npm run check:zh
```

如果检查失败，先查看输出的生成文件列表，再提交对应的生成物。不要直接编辑 `INDEX/`、`AGENTS.md`、`CLAUDE.md` 或 `GEMINI.md` 来绕过检查。
