# 2026-11-01 发布回执

本日新增 **158 个独立仓库身份**，目录 **3114 → 3272 条**；正式技能仍为 **1114** 份。按无数量上限准入执行，没有达到 50/55 后提前停止。

- 158 个新增身份、497 份固定文件引用通过独立 API/原始字节验证；92 份基线目录数据文件的 SHA-256 保持不变。
- 193 个广搜读取对象和领域检索流的覆盖对账见 [coverage.json](coverage.json)，声明范围内缺失为零。
- 英文和中文各 73 项测试通过，分别构建并通过提交后的只读生成物检查；两边源数据/代码一致，仅保留五份语言界面差异。

| 分支 | 已合并 PR | 数据提交 CI | 合并后 CI |
|---|---|---|---|
| main | [65](https://github.com/findscripter/everything-skills/pull/65) | [通过](https://github.com/findscripter/everything-skills/actions/runs/41279298580) | [通过](https://github.com/findscripter/everything-skills/actions/runs/41279347612) |
| zh | [66](https://github.com/findscripter/everything-skills/pull/66) | [通过](https://github.com/findscripter/everything-skills/actions/runs/41279471648) | [通过](https://github.com/findscripter/everything-skills/actions/runs/41279544507) |

CI 链接指向精确的数据提交及合并提交，不声称验证本回执自己的提交。后续回执提交的 CI 可从仓库 Actions 另行核查。

本批只索引第三方元数据，未安装、执行或复制候选技能正文。代表性审阅不等于全正文或运行结果认证。59 项排除/暂缓和 19 项待审不计新增；Deflow 最终按名字、稳定 ID 和固定提交复查均返回 404，保留历史读取依据但暂缓收录。

审核、许可范围、检索窗口和暂缓原因见 [part97 审核](../../skill-repos.part97.audit.md) 与 [固定对象验证](fixed-object-verification.json)。

基线哈希口径：`baseline.json` 保留采集开始时的工作区原始字节 hash，并另存 `git_data_files_sha256`。旧 `part96.jsonl` 工作区为 CRLF、Git 对象为 LF，规范化后严格相同；92 份基线文件在来源提交与本批数据提交中的 Git blob 均未变化。本批新增文件按 LF 写入并校验暂存区对象。
