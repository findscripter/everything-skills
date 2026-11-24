# 2026-11-24 发布回执

新增 **102 个独立仓库身份**，目录 **5168 → 5270 条**；正式技能正文保持 **1115** 份。50 为最低目标，不设收录上限。

- 205 个选定审阅项全部处置；全局去重后 102 个准入、101 个暂缓、2 个排除。1596 个未审储备不算收录。
- 528 处固定引用完成公开身份、真实树路径、Git blob/SHA-256/大小及不可变 URL 独立复核；113 份基线目录 Git 对象保持不变。
- 两分支完整构建、标准YAML分发、示例、站点和提交后只读检查通过；Windows 各 131 项通过，1 项 Linux 专用测试跳过。Linux 数据 PR 各 132 项全通过。
- 产品/SDK内嵌消费者、技能基础设施、示例、路由、维护条目及生成视图分开计数。组件、变体及冲突许可声明均保留范围；未安装或执行候选，不把上游评测主张写成本轮效果。
- 每日09:00自动化的本次触发已实际收到（北京时间09:01:33）；绑定与无上限、不删分支规则已核对，本轮未修改配置。

| 分支 | 已合并PR | 数据提交 | 合并提交 |
|---|---|---|---|
| main | [#129](https://github.com/findscripter/everything-skills/pull/129) | `78525285af246be7da43abf24876d66275cc1078` | `467fc47b81bb0b6c025745739b63ea5f8d1a8d54` |
| zh | [#130](https://github.com/findscripter/everything-skills/pull/130) | `85b48a698719c598564e976a6309114290c73878` | `61d5639021ba25d385f59ff561f6b621dce4599b` |

采编批次为 2026-11-24，实际发布日期为 2026-11-24（北京时间）。本次定时维护保留分支和工作树。

必要 CI：
- main_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45304313141)，head `78525285af246be7da43abf24876d66275cc1078`。
- main_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45304313126)，head `78525285af246be7da43abf24876d66275cc1078`。
- main_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45304431616)，head `467fc47b81bb0b6c025745739b63ea5f8d1a8d54`。
- main_merge / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45304431584)，head `467fc47b81bb0b6c025745739b63ea5f8d1a8d54`。
- zh_pr / publish-site：[成功](https://github.com/findscripter/everything-skills/actions/runs/45304315038)，head `85b48a698719c598564e976a6309114290c73878`。
- zh_pr / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45304315183)，head `85b48a698719c598564e976a6309114290c73878`。
- zh_merge / generated-index：[成功](https://github.com/findscripter/everything-skills/actions/runs/45304430650)，head `61d5639021ba25d385f59ff561f6b621dce4599b`。

这些CI绑定数据及合并提交，不自引用本回执提交。回执提交的检查从Actions另行核对。

详见[采编审阅](../../skill-repos.part118.audit.md)、[覆盖对账](coverage.json)、[固定对象](fixed-object-verification.json)和[交叉复核](quality-review.json)。
