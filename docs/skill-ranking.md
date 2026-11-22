# 同类技能的任务推荐顺序

同一能力可以保留多个技能。检索先区分用户要的产物，再对已审阅的相近技能给出首选与备选。这里的顺序是维护者对当前正文适用范围的判断，不是模型成功率、下载量、Stars 或安全分数。

全库以实际技能清单为全集：现行条目逐项初筛任务边界，疑似同任务与同交付物的候选再阅读全文比较。入组条目给出首选与备选；本轮保持独立的条目保留入口，归档只留历史。

**[查看全部同类任务及推荐理由](../INDEX/task-rankings.md)** · [逐项覆盖清单](../data/skill-ranking-review.json) · [排名源数据](../data/skill-rankings.json)

下面保留 PPT 示例；完整总目还包含研发、数据、AI、创意、业务、协作、安全、领域与平台任务。

| 查询示例 | 首选 | 备选及条件 |
| --- | --- | --- |
| `做PPT` / `PPTX` | [pptx-document-processing](../01-documents/pptx-document-processing/SKILL.md) | [python-pptx-deck-generator](../01-documents/python-pptx-deck-generator/SKILL.md)：希望拿到生成脚本时采用 |
| `用Python生成PPT` / `python-pptx` | [python-pptx-deck-generator](../01-documents/python-pptx-deck-generator/SKILL.md) | 保留独立脚本交付入口；通用PPTX流程没有同样的Python脚本交付契约，不在该任务排备选 |
| `投行模板填充` / `pitch deck` | [ib-pitch-deck-builder](../05-business/ib-pitch-deck-builder/SKILL.md) | [pitch-deck-refresh](../05-business/pitch-deck-refresh/SKILL.md)：其要求先读取的四份 reference 文件尚未随目录提供，补齐后才可使用 |

[html-animated-slides](../01-documents/html-animated-slides/SKILL.md) 交付 HTML；[theme-factory](../06-creative/theme-factory/SKILL.md) 负责套配色与字体。它们保持各自检索入口，不因“PPT 相关”就纳入上述文件制作排名。

```sh
node bin/everything-skills.mjs search "做PPT" --limit 3 --json
node bin/everything-skills.mjs search "用Python生成PPT" --limit 3 --json
node bin/everything-skills.mjs search "投行模板填充" --limit 3 --json
```

CLI 与网站使用同一个排序模块和生成索引。命中登记任务时，结果返回 `recommendation`：任务、组内名次、推荐理由与审阅日期；`score` 继续表示原有关键词分，不能把二者混成效果评分。网站展示当前语言的推荐理由。

排序优先级：精确技能 ID → 命中任务的组内顺序 → 原关键词匹配分 → 名称。用户明确指定某个技能 ID 时会保留该选择。筛选分卷仍生效，归档技能默认隐藏。`compose` 在未命中已登记配方时，也采用相同的检索规则选择主技能。

技能检索的任务触发词必须整句匹配，忽略大小写和首尾空格，折叠连续空白，并忽略汉字旁的空格。例如 `PPTX` 和 `做 PPT` 可触发登记任务。较长的自由描述仍走技能关键词检索，避免片段匹配覆盖否定、格式或专门用途。网站的「同类对比」也可以按任务标题、别名或技能 ID 查找比较组，组内按审阅顺序显示完整名单。

维护数据是 [data/skill-rankings.json](../data/skill-rankings.json)，不是技能 frontmatter。每组保存独立任务、双语标题、触发词、审阅日期；条目按顺序保存技能 ID、双语理由及已读正文 SHA-256。构建会拒绝重复任务/触发词、未知或非 stable 技能、重复成员及变化后的正文哈希。正文更新后重新比较范围、依赖和交付物，再更新哈希与顺序。

全库覆盖清单逐条保存正文哈希、任务、分类、比较对象、理由与实际阅读范围：`metadata`、`metadata-and-usage-section` 或 `full-body-comparison`。初筛不冒称通读；进入排名的条目须有全文比较。构建会核对现行/归档全集，拒绝遗漏、重复、变化后的正文、分类与组员身份矛盾，以及只凭元数据登记的全文比较排名。

新增或修改正式技能后，重审受影响的覆盖记录与排名；本轮保持独立不代表永久不存在其他替代技能。本次没有执行库内工作流、验证所有外部接口新鲜度或测量任务成功率。缺资源和静态示例问题写在对应理由中；来源、许可、原有质量状态和使用前依赖检查保持独立。
