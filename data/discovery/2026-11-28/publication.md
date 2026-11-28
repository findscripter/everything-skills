# 2026-11-28 发布回执

新增 **100 个独立仓库**，外部目录从 **5589** 增至 **5689 条**。

- 124  个候选均已处置。去重后覆盖 124 个仓库，其中 100 个准入、23 个暂缓、1 个排除。3219 个未审储备不算收录。
- 495 处固定引用完成公开身份、真实树路径、Git blob/SHA-256/大小及不可变 URL 独立复核；117 份基线目录 Git 对象保持不变。
- 两分支构建、标准 YAML 检查、示例与站点测试通过。Windows main/zh 分别通过 132 / 132 项。Linux CI 通过数见 publication.json。
- 产品/SDK内嵌消费者、技能基础设施、示例、路由、维护条目及生成视图分开计数。组件、变体及冲突许可声明均保留范围；未安装或执行候选，不把上游评测主张写成本轮效果。
- 本轮由每日自动化触发。

| 分支 | 已合并PR | 数据提交 | 合并提交 |
|---|---|---|---|
| main | [#140](https://github.com/findscripter/everything-skills/pull/140) | `7541933345d5e6aabc68df3ffc7d2a43cf7e041b` | `8b95043ca5cab12f0f860fa6ee72cab76f5869c7` |
| zh | [#141](https://github.com/findscripter/everything-skills/pull/141) | `5a2b022e7860949147776beb1a313fee950c80b7` | `2edc64469f172534f00a885ed7ae2e53005bc1ae` |

采编批次为 2026-11-28，实际发布日期为 2026-11-28（北京时间）。本次定时维护保留分支和工作树。

必要 CI：
- main_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/46149747075)，head `7541933345d5e6aabc68df3ffc7d2a43cf7e041b`。
- main_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/46149747105)，head `7541933345d5e6aabc68df3ffc7d2a43cf7e041b`。
- main_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/46149975475)，head `8b95043ca5cab12f0f860fa6ee72cab76f5869c7`。
- main_merge / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/46149975500)，head `8b95043ca5cab12f0f860fa6ee72cab76f5869c7`。
- zh_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/46149757943)，head `5a2b022e7860949147776beb1a313fee950c80b7`。
- zh_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/46149758018)，head `5a2b022e7860949147776beb1a313fee950c80b7`。
- zh_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/46149991269)，head `2edc64469f172534f00a885ed7ae2e53005bc1ae`。

线上目录已核实 5689 条外部仓库记录，并核对本日全部新增仓库名称。两个已合并的工作分支均已从 GitHub 清理。
以上 CI 对应数据提交及其合并提交。

详见[采编审阅](../../skill-repos.part122.audit.md)、[覆盖对账](coverage.json)、[固定对象](fixed-object-verification.json)和[交叉复核](quality-review.json)。
