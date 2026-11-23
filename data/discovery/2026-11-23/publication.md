# 2026-11-23 发布回执

新增 **104 个独立仓库身份**，目录 **5064 → 5168 条**；正式技能正文保持 **1115** 份。50 为最低目标，不设收录上限。

- 178 个选定审阅项全部处置；全局去重后 104 个准入、72 个暂缓、2 个排除。1223 个未审储备不算收录。
- 474 处固定引用完成公开身份、真实树路径、Git blob/SHA-256/大小及不可变 URL 独立复核；112 份基线目录 Git 对象保持不变。
- 两分支完整构建、标准YAML分发、示例、站点和提交后只读检查通过；Windows 各 131 项通过，1 项 Linux 专用测试跳过。Linux 数据 PR 各 132 项全通过。
- 产品/SDK内嵌消费者、技能基础设施、示例、路由、维护条目及生成视图分开计数。组件、变体及冲突许可声明均保留范围；未安装或执行候选，不把上游评测主张写成本轮效果。
- 每日09:00自动化的本次触发已实际收到（北京时间09:02:11）；绑定与无上限、不删分支规则已核对，本轮未修改配置。

| 分支 | 已合并PR | 数据提交 | 合并提交 |
|---|---|---|---|
| main | [#127](https://github.com/findscripter/everything-skills/pull/127) | `2d5e68ea02091c016b1fac9027d4534ac8703f42` | `22677ec0e016de5fd72b838355de3e3889803b4f` |
| zh | [#128](https://github.com/findscripter/everything-skills/pull/128) | `29b410521f8425e7d8ecdcd91ad341c226273af4` | `a6316ca1ddb619657f3f67ab81724cbcc68cb4a7` |

采编批次为 2026-11-23，实际发布日期为 2026-11-23（北京时间）。本次定时维护保留分支和工作树。

必要 CI：
- main_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45093936497)，head `2d5e68ea02091c016b1fac9027d4534ac8703f42`。
- main_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45093936653)，head `2d5e68ea02091c016b1fac9027d4534ac8703f42`。
- main_merge / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45094015956)，head `22677ec0e016de5fd72b838355de3e3889803b4f`。
- main_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45094015998)，head `22677ec0e016de5fd72b838355de3e3889803b4f`。
- zh_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45093936845)，head `29b410521f8425e7d8ecdcd91ad341c226273af4`。
- zh_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45093936908)，head `29b410521f8425e7d8ecdcd91ad341c226273af4`。
- zh_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45094018575)，head `a6316ca1ddb619657f3f67ab81724cbcc68cb4a7`。

这些CI绑定数据及合并提交，不自引用本回执提交。回执提交的检查从Actions另行核对。

详见[采编审阅](../../skill-repos.part117.audit.md)、[覆盖对账](coverage.json)、[固定对象](fixed-object-verification.json)和[交叉复核](quality-review.json)。
