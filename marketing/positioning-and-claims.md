# 定位与宣传 claim 核对

## 定位

面向中文 Claude Code / Codex 用户：**从任务检索技能，查看关系，再按需使用。** 第一批内容围绕“接手陌生仓库”展开，只要求读者试一个任务。

可见价值与证据：

| 主张 | 可核验对象 | 可使用的表述 | 边界 |
| --- | --- | --- | --- |
| 任务检索 | [CLI](https://github.com/findscripter/everything-skills/blob/main/scripts/everything-skills.mjs)、[search.json](https://github.com/findscripter/everything-skills/blob/main/INDEX/search.json) | 输入任务关键词，得到候选技能 | 当前为字段匹配与排序；不要称为语义向量检索或声称一定找到最优项 |
| 技能关系 | [graph.json](https://github.com/findscripter/everything-skills/blob/main/INDEX/graph.json)、[关系图说明](https://github.com/findscripter/everything-skills/blob/main/INDEX/graph.md) | 查看 requires / related / combines_with 声明 | 是声明关系；不等于自动编排，也不证明所有组合执行通过 |
| 按需安装 | [marketplace](https://github.com/findscripter/everything-skills/blob/main/.claude-plugin/marketplace.json)、[README](https://github.com/findscripter/everything-skills#quick-start) | Claude Code 按卷安装 | 11 个卷插件；不要宣传成 CLI 按单技能安装或承诺所有工具同一安装方式 |
| Codex 使用 | [AGENTS.md](https://github.com/findscripter/everything-skills/blob/main/AGENTS.md) | 按导航读取仓库里的技能文件 | 不声称 Codex 已内置、自动发现、原生 marketplace 安装或官方推荐 |
| 可跟随的案例 | [examples](https://github.com/findscripter/everything-skills/blob/main/examples/README.md) | 按写明的输入、环境和验收步骤重跑 | 发布前必须确认文件已公开、命令和产物可复现；待建页不能当作已运行证据 |
| 网页检索 | [计划公开站点](https://findscripter.github.io/everything-skills/) | 站点部署并实测后称“检索入口” | 当前文案是发布草稿；上线和实测前不宣称已可用 |
| 来源与质量信息 | [来源](https://github.com/findscripter/everything-skills/blob/main/INDEX/sources.md)、[quality.json](https://github.com/findscripter/everything-skills/blob/main/INDEX/quality.json) | 查看来源、许可声明、依赖及审阅状态 | unknown / unreviewed 保留其含义；结构校验、许可声明、运行测试、安全审计不能混称 |
| 本库与外部目录 | [README](https://github.com/findscripter/everything-skills#what-you-are-looking-at)、[外部目录](https://github.com/findscripter/everything-skills/blob/main/INDEX/skill-repos.md) | 库内技能与外部仓库目录分开展示 | 外部目录记录不等于已打包技能，不与本库数相加 |

## 数字规则

[2026-11-02 快照](snapshot-2026-11-02.json) 固定于提交 `8b5fbc17a5ed8122c8f02d2697800c8e84dde14f`：1,114 个本库技能索引条目，其中 21 个 deprecated；11 个卷插件；3,273 条外部目录记录。关系图有 6,787 条原始边，含方向与声明重复的统计语义，不用“6,787 条独立知识关联”宣传。

文案有数字时同时带日期或链接快照。发布日期晚于快照且数据有变化时，重新生成数字和来源；不把固定快照称为实时。

## 禁止与替换

| 不使用 | 原因 / 替换方向 |
| --- | --- |
| 千条全部已验证、全部运行通过 | 当前存在未审阅、未知与弃用条目。按实际验证范围描述 |
| 安全认证、零风险、放心一键运行 | 没有这类认证与保证。展示来源、依赖、已知风险及实际检查 |
| 官方合作、官方指定、官方背书 | 收录上游或提交贡献不能证明合作，不使用平台 logo 制造暗示 |
| 效率提升 X 倍、节省 X 小时 | 没有对照实验就不写。展示具体步骤与实际产物 |
| 全网最大、最全、最强 | 没有可复核的全集比较。描述已覆盖的卷和任务 |
| 自动组合一切技能、所有工具通用 | 关系来自声明，工具读取和安装能力各有边界。分别写路径 |

## 写作基准

以公开 README、AGENTS、CLI 及实际示例为来源，写“做什么、如何试、怎样检查”。句子简短，命令可复制，先展示一个任务；每条 X 单帖只说一件事。平台差异体现在内容长度与操作细节，不添加虚构使用经历、用户证言或数据。平台文案不含私人邮箱、流量报表、设备目录或会话记录。

## 发布证据记录

发布者在执行后补充公开链接或可公开结论：

- 站点与源文件跳转检查：待检查。
- 案例页合入及复跑：待检查。
- Claude Code marketplace 安装：待实测。
- Codex 文件读取路径：待实测。
- 视频画面脱敏与文案审核：待检查。

上述项目是发布质量门槛，没有自动执行发帖的授权。发布材料和统计快照的完成，不代表内容已经对外发布。
