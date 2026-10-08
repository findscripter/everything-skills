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

生成后的 search.json / graph.json / marketplace.json + JSONL + Logo 矢量源
        └── scripts/build-brand.mjs → assets/brand/*.svg + README 品牌概览
```

`SKILL.md` frontmatter、`taxonomy.json` 和 `data/skill-repos*.jsonl` 是源数据；`INDEX/`、根部多 harness 文件、插件市场清单和 README 技能仓库区是生成物，禁止手工修改生成区。

`assets/brand/logo.svg` 和 `logo-static.svg` 是原创矢量源文件；横幅、统计和流程图由品牌生成器输出。README 品牌区用独立的 `GENERATED:brand` 标记，外部目录仍使用 `GENERATED:skill-repos` 标记；两者互不覆盖。

## 语言策略

- `main`：README、根部上下文文件和技能仓库目录使用英文，技能正文保持原始语言。
- `zh`：上述仓库界面使用中文；结构化 `INDEX/` 索引标题跨分支保持稳定。
- `en`：历史英文镜像分支，已不作为主发布路径。

语言必须通过 `--lang=en|zh` 显式传入统一入口 `scripts/build-all.mjs`。CI 根据目标分支传入同样的语言参数。

## 维护边界

- 索引生成器只扫描 11 个受控卷目录，并跳过嵌套 Git checkout，防止本地辅助 clone 被误纳入数据源。
- 生成器先完成校验，再开始逐文件替换生成物；校验失败不会开始写入，写入异常会清理临时文件并报错。
- `scripts/load-skill-repos.mjs` 是技能仓库 JSONL 的唯一加载与去重入口，README 和 INDEX 不允许各自解释数据。
- CI 只读执行完整生成与漂移检查，覆盖所有生成物；不在 PR 中向贡献分支写入或推送代码。
- 搜索索引优先保留 frontmatter 的显式 `triggers`，仅在字段缺省时从 description 提取；技能路径始终使用真实相对目录。
- `supersedes` 从新技能指向被取代技能，弃用链必须能到达可用技能；数组字段类型错误和第三方来源缺许可会阻止生成。
- 品牌数据直接读取索引；CI 包含 `assets/brand` 的漂移检查与 Node 内建回归测试。

## 常用命令

```bash
# main 风格
npm run build
npm run check

# zh 风格
npm run build:zh
npm run check:zh

# 零依赖的元数据和品牌回归测试
npm test
```

如果检查失败，先查看输出的生成文件列表，再提交对应的生成物。不要直接编辑 `INDEX/`、`AGENTS.md`、`CLAUDE.md` 或 `GEMINI.md` 来绕过检查。
