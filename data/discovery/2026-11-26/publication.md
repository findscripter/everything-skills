# 2026-11-26 发布回执

新增 **100 个独立仓库**，外部目录从 **5373** 增至 **5473 条**。

- 158  个候选均已处置。去重后覆盖 158 个仓库，其中 100 个准入、41 个暂缓、17 个排除。1608 个未审储备不算收录。
- 480 处固定引用完成公开身份、真实树路径、Git blob/SHA-256/大小及不可变 URL 独立复核；115 份基线目录 Git 对象保持不变。
- 两分支构建、标准 YAML 检查、示例与站点测试通过。Windows main/zh 分别通过 132 / 132 项。Linux CI 通过数见 publication.json。
- 产品/SDK内嵌消费者、技能基础设施、示例、路由、维护条目及生成视图分开计数。组件、变体及冲突许可声明均保留范围；未安装或执行候选，不把上游评测主张写成本轮效果。
- 本轮由每日自动化触发。

| 分支 | 已合并PR | 数据提交 | 合并提交 |
|---|---|---|---|
| main | [#136](https://github.com/findscripter/everything-skills/pull/136) | `d399def8f3be1fc445ed9e9f5976f8a82cabb483` | `13e39d555df9aa48d3cbe002c66829cc2f48ca04` |
| zh | [#137](https://github.com/findscripter/everything-skills/pull/137) | `2f69cfb1d43778ea10a6005937be627b36680278` | `e6a41c27569894dccf9be49ffb7ed3f2755a08b9` |

采编批次为 2026-11-26，实际发布日期为 2026-11-26（北京时间）。本次定时维护保留分支和工作树。

必要 CI：
- main_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45734164193)，head `d399def8f3be1fc445ed9e9f5976f8a82cabb483`。
- main_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45734164210)，head `d399def8f3be1fc445ed9e9f5976f8a82cabb483`。
- main_merge / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45734290264)，head `13e39d555df9aa48d3cbe002c66829cc2f48ca04`。
- main_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45734290204)，head `13e39d555df9aa48d3cbe002c66829cc2f48ca04`。
- zh_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45734162479)，head `2f69cfb1d43778ea10a6005937be627b36680278`。
- zh_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45734162429)，head `2f69cfb1d43778ea10a6005937be627b36680278`。
- zh_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45734291021)，head `e6a41c27569894dccf9be49ffb7ed3f2755a08b9`。

线上目录已核实 5473 条外部仓库记录，并抽查新增仓库。两个已合并的工作分支均已从 GitHub 清理。
以上 CI 对应数据提交及其合并提交。

详见[采编审阅](../../skill-repos.part120.audit.md)、[覆盖对账](coverage.json)、[固定对象](fixed-object-verification.json)和[交叉复核](quality-review.json)。
