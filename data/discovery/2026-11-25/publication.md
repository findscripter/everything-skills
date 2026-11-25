# 2026-11-25 发布回执

新增 **103 个独立仓库**，外部目录从 **5270** 增至 **5373 条**。

- 163  个候选均已处置。去重后覆盖 161 个仓库，其中 103 个准入、47 个暂缓、11 个排除。835 个未审储备不算收录。
- 437 处固定引用完成公开身份、真实树路径、Git blob/SHA-256/大小及不可变 URL 独立复核；114 份基线目录 Git 对象保持不变。
- 两分支构建、标准 YAML 检查、示例与站点测试通过。Windows main/zh 分别通过 132 / 132 项。Linux CI 通过数见 publication.json。
- 产品/SDK内嵌消费者、技能基础设施、示例、路由、维护条目及生成视图分开计数。组件、变体及冲突许可声明均保留范围；未安装或执行候选，不把上游评测主张写成本轮效果。
- 每日 09:00 自动化仍启用，本次在状态核查后接续。

| 分支 | 已合并PR | 数据提交 | 合并提交 |
|---|---|---|---|
| main | [#134](https://github.com/findscripter/everything-skills/pull/134) | `f83295d4196e1b85e5eff5e8e5759341ddaacf6e` | `0e1c60317f800b0c17f714d7b8794c435e3bf7db` |
| zh | [#135](https://github.com/findscripter/everything-skills/pull/135) | `734a3fda3ab0aa9d10d86eca29245df980591b94` | `b054177b6fa3009c5d98191df3b4f238976c7882` |

采编批次为 2026-11-25，实际发布日期为 2026-11-25（北京时间）。本次定时维护保留分支和工作树。

必要 CI：
- main_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45573146025)，head `f83295d4196e1b85e5eff5e8e5759341ddaacf6e`。
- main_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45573146136)，head `f83295d4196e1b85e5eff5e8e5759341ddaacf6e`。
- main_merge / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45573337498)，head `0e1c60317f800b0c17f714d7b8794c435e3bf7db`。
- main_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45573337479)，head `0e1c60317f800b0c17f714d7b8794c435e3bf7db`。
- zh_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45573146739)，head `734a3fda3ab0aa9d10d86eca29245df980591b94`。
- zh_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45573146895)，head `734a3fda3ab0aa9d10d86eca29245df980591b94`。
- zh_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45573336290)，head `b054177b6fa3009c5d98191df3b4f238976c7882`。

线上目录已核实 5373 条外部仓库记录，并抽查四个新增仓库。
以上 CI 对应数据提交及其合并提交。

详见[采编审阅](../../skill-repos.part119.audit.md)、[覆盖对账](coverage.json)、[固定对象](fixed-object-verification.json)和[交叉复核](quality-review.json)。
