# 2026-11-27 发布回执

新增 **116 个独立仓库**，外部目录从 **5473** 增至 **5589 条**。

- 158  个候选均已处置。去重后覆盖 156 个仓库，其中 116 个准入、36 个暂缓、4 个排除。2214 个未审储备不算收录。
- 605 处固定引用完成公开身份、真实树路径、Git blob/SHA-256/大小及不可变 URL 独立复核；116 份基线目录 Git 对象保持不变。
- 两分支构建、标准 YAML 检查、示例与站点测试通过。Windows main/zh 分别通过 132 / 132 项。Linux CI 通过数见 publication.json。
- 产品/SDK内嵌消费者、技能基础设施、示例、路由、维护条目及生成视图分开计数。组件、变体及冲突许可声明均保留范围；未安装或执行候选，不把上游评测主张写成本轮效果。
- 本轮由每日自动化触发。

| 分支 | 已合并PR | 数据提交 | 合并提交 |
|---|---|---|---|
| main | [#138](https://github.com/findscripter/everything-skills/pull/138) | `f34127085b9bd718416bb5efd00b26921dbd1527` | `d270c87822da5519e93e84b94ba157c977dc06c6` |
| zh | [#139](https://github.com/findscripter/everything-skills/pull/139) | `32bd547d61a18724cf7930563e892bc46867f323` | `89680c89ea9f8ef88ba2f7a6d3e5e006c0a12e64` |

采编批次为 2026-11-27，实际发布日期为 2026-11-27（北京时间）。本次定时维护保留分支和工作树。

必要 CI：
- main_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45921710306)，head `f34127085b9bd718416bb5efd00b26921dbd1527`。
- main_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45921710363)，head `f34127085b9bd718416bb5efd00b26921dbd1527`。
- main_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45921797120)，head `d270c87822da5519e93e84b94ba157c977dc06c6`。
- main_merge / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45921797027)，head `d270c87822da5519e93e84b94ba157c977dc06c6`。
- zh_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45921711435)，head `32bd547d61a18724cf7930563e892bc46867f323`。
- zh_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45921711473)，head `32bd547d61a18724cf7930563e892bc46867f323`。
- zh_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45921797141)，head `89680c89ea9f8ef88ba2f7a6d3e5e006c0a12e64`。

另有 1 个归档技能成员完成内存只读核验：保留外层 Git blob 与成员路径、SHA-256、字节数；未解压或执行归档内容。

线上目录已核实 5589 条外部仓库记录，并抽查新增仓库。两个已合并的工作分支均已从 GitHub 清理。
以上 CI 对应数据提交及其合并提交。

详见[采编审阅](../../skill-repos.part121.audit.md)、[覆盖对账](coverage.json)、[固定对象](fixed-object-verification.json)和[交叉复核](quality-review.json)。
