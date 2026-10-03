# Language policy

项目采用“仓库界面分支化、技能正文保留原语言”的语言模型：

| 表面 | 规则 |
| --- | --- |
| `main` 仓库界面 | 英文 README、根文档、策略、multi-harness 上下文和技能仓库目录标题 |
| `zh` 仓库界面 | 中文 README、根文档、策略、multi-harness 上下文和技能仓库目录标题 |
| `00-meta` … `10-platform` 下的 `SKILL.md` | 保留原始/本地语言，不维护第二套完整英文技能树 |
| `data/skill-repos*.jsonl` | 只做 README 级外部目录；`summary` / `summary_zh` 按字段逐步补齐 |

`INDEX/catalog.md`、`tags.md`、`tools.md`、`graph.md` 和 `sources.md` 是面向维护与机器消费的稳定结构索引，当前跨分支保留中文标题。

`en` 分支的完整英文技能镜像已废弃。今后新增或修订技能只进入一套卷目录，通过 `main` / `zh` 生成不同语言的仓库界面。

## 生成命令

语言必须显式传入，避免生成物在分支之间漂移：

```bash
# main
npm run check

# zh
npm run check:zh

# 直接调用统一入口
node scripts/build-all.mjs --lang=en
node scripts/build-all.mjs --lang=zh
```

CI 根据 PR 目标分支或 push 分支选择同样的语言参数，并检查全部生成物是否已提交。
