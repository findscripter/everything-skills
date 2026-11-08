# 2026-11-08 发布回执

新增 **97 个独立仓库身份**，目录 **3898 → 3995 条**；正式技能仍为 **1114** 份（1093 活动、21 弃用）。不设 50/55 条上限。

- 428 份固定文件引用通过独立复核；98 份基线目录数据的 Git 对象保持不变。Git 字节与历史工作区换行哈希口径分开保存。
- 英文 109 项、中文 109 项测试及构建、分发、离线示例、站点和提交后只读生成检查通过。
- 源数据和代码一致，仅保留五份语言界面差异。检索窗口、准入子集、具体排除/暂缓和未审储备见 [覆盖对账](coverage.json)。

| 分支 | 已合并 PR | 数据提交 CI | 合并后 CI |
|---|---|---|---|
| main | [#85](https://github.com/findscripter/everything-skills/pull/85) | [publish-site](https://github.com/findscripter/everything-skills/actions/runs/42461709776), [generated-index](https://github.com/findscripter/everything-skills/actions/runs/42461709864) | [publish-site](https://github.com/findscripter/everything-skills/actions/runs/42461776838), [generated-index](https://github.com/findscripter/everything-skills/actions/runs/42461776847) |
| zh | [#86](https://github.com/findscripter/everything-skills/pull/86) | [generated-index](https://github.com/findscripter/everything-skills/actions/runs/42461965889), [publish-site](https://github.com/findscripter/everything-skills/actions/runs/42461965802) | [generated-index](https://github.com/findscripter/everything-skills/actions/runs/42462026941) |

CI 链接对应精确的数据提交及合并提交；后续回执提交的检查另从仓库 Actions 核对，不自引用为自己的验证。

本批仅索引第三方元数据，未安装、执行或复制候选技能正文。代表文件审阅不等于全量正文或运行验证。计数区分叶任务、路由、适配器、内部维护、镜像、模板和动态入口；根许可不覆盖局部例外。

详细审阅见 [part103 审核](../../skill-repos.part103.audit.md)、[固定对象回执](fixed-object-verification.json) 和 [独立交叉检查](quality-review.json)。
