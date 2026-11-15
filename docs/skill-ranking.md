# 同类技能的任务推荐顺序

同一能力可以保留多个技能。检索先区分用户要的产物，再对已审阅的相近技能给出首选与备选。这里的顺序是维护者对当前正文适用范围的判断，不是模型成功率、下载量、Stars 或安全分数。

首批在 2026-11-15 静态核对了四份 PPT 相关正文，登记三个任务：

| 查询示例 | 首选 | 备选及条件 |
| --- | --- | --- |
| `做PPT` / `PPTX` | [pptx-document-processing](../01-documents/pptx-document-processing/SKILL.md) | [python-pptx-deck-generator](../01-documents/python-pptx-deck-generator/SKILL.md)：希望拿到生成脚本时采用 |
| `用Python生成PPT` / `python-pptx` | [python-pptx-deck-generator](../01-documents/python-pptx-deck-generator/SKILL.md) | [pptx-document-processing](../01-documents/pptx-document-processing/SKILL.md)：还需要编辑、结构或渲染检查时采用 |
| `投行模板填充` / `pitch deck` | [ib-pitch-deck-builder](../05-business/ib-pitch-deck-builder/SKILL.md) | [pitch-deck-refresh](../05-business/pitch-deck-refresh/SKILL.md)：其要求先读取的四份 reference 文件尚未随目录提供，补齐后才可使用 |

[html-animated-slides](../01-documents/html-animated-slides/SKILL.md) 交付 HTML；[theme-factory](../06-creative/theme-factory/SKILL.md) 负责套配色与字体。它们保持各自检索入口，不因“PPT 相关”就纳入上述文件制作排名。

```sh
node bin/everything-skills.mjs search "做PPT" --limit 3 --json
node bin/everything-skills.mjs search "用Python生成PPT" --limit 3 --json
node bin/everything-skills.mjs search "投行模板填充" --limit 3 --json
```

CLI 与网站使用同一个排序模块和生成索引。命中登记任务时，结果返回 `recommendation`：任务、组内名次、推荐理由与审阅日期；`score` 继续表示原有关键词分，不能把二者混成效果评分。网站展示当前语言的推荐理由。

排序优先级：精确技能 ID → 命中任务的组内顺序 → 原关键词匹配分 → 名称。用户明确指定某个技能 ID 时会保留该选择。筛选分卷仍生效，归档技能默认隐藏。`compose` 在未命中已登记配方时，也采用相同的检索规则选择主技能。

任务触发词必须整句匹配，只忽略大小写、首尾空格和连续空白。例如 `PPTX` 可触发登记任务；更长的自由描述仍走原有关键词检索，避免片段匹配覆盖否定、格式或专门用途。后续根据真实查询补充经审阅的任务别名。

维护数据是 [data/skill-rankings.json](../data/skill-rankings.json)，不是技能 frontmatter。每组保存独立任务、双语标题、触发词、审阅日期；条目按顺序保存技能 ID、双语理由及已读正文 SHA-256。构建会拒绝重复任务/触发词、未知或非 stable 技能、重复成员及变化后的正文哈希。正文更新后重新比较范围、依赖和交付物，再更新哈希与顺序。

本次只做静态范围比较与检索回归，没有运行四种 PPT 工作流或测量生成质量；排名不会改变原有的来源、许可、质量状态和使用前依赖检查。未登记的技能继续正常检索，不赋予虚构名次。
