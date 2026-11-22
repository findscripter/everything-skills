# 2026-11-22 发布回执

新增 **77 个独立仓库身份**，目录 **4987 → 5064 条**；正式技能正文保持 **1115** 份。50 为最低目标，不设收录上限。

- 139 个选定审阅项全部处置；全局去重后 77 个准入、57 个暂缓、5 个排除。1308 个未审储备不算收录。
- 349 处固定引用完成公开身份、真实树路径、Git blob/SHA-256/大小及不可变 URL 独立复核；111 份基线目录 Git 对象保持不变。
- 两分支完整构建、标准YAML分发、示例、站点和提交后只读检查通过；Windows 各 131 项通过，1 项 Linux 专用测试跳过。Linux 数据 PR 各 132 项全通过。
- 产品/SDK内嵌消费者、技能基础设施、示例、路由、维护条目及生成视图分开计数。组件、变体及冲突许可声明均保留范围；未安装或执行候选，不把上游评测主张写成本轮效果。
- 每日09:00自动化的本次触发已实际收到（北京时间09:02:48）；绑定与无上限、不删分支规则已核对，本轮未修改配置。

| 分支 | 已合并PR | 数据提交 | 合并提交 |
|---|---|---|---|
| main | [#125](https://github.com/findscripter/everything-skills/pull/125) | `c34d7fc99761d4f7a3d0281afafd5bf21c80fafe` | `6b39b11bdfee3e1b89931ff0f3c2eea1f726a676` |
| zh | [#126](https://github.com/findscripter/everything-skills/pull/126) | `3d2efc79d1b3343b40b4931f01991a163da07fff` | `464940d217fbc405c1323a3fa91a063df604c141` |

采编批次为 2026-11-22，实际补发日期为 2026-11-23（北京时间）。本次按维护者要求清理已核实合并的分支。

必要 CI：
- main_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45043545495)，head `c34d7fc99761d4f7a3d0281afafd5bf21c80fafe`。
- main_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45043545502)，head `c34d7fc99761d4f7a3d0281afafd5bf21c80fafe`。
- main_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45043637056)，head `6b39b11bdfee3e1b89931ff0f3c2eea1f726a676`。
- main_merge / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45043637123)，head `6b39b11bdfee3e1b89931ff0f3c2eea1f726a676`。
- zh_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45043547132)，head `3d2efc79d1b3343b40b4931f01991a163da07fff`。
- zh_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45043547066)，head `3d2efc79d1b3343b40b4931f01991a163da07fff`。
- zh_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45043636964)，head `464940d217fbc405c1323a3fa91a063df604c141`。

这些CI绑定数据及合并提交，不自引用本回执提交。回执提交的检查从Actions另行核对。

详见[采编审阅](../../skill-repos.part116.audit.md)、[覆盖对账](coverage.json)、[固定对象](fixed-object-verification.json)和[交叉复核](quality-review.json)。
