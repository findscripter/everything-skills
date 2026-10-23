# 工程审计修复 TDD 证据

需求来自 2026-10-23 全量审计 ENG-01 至 ENG-08，以及目录计数/状态展示要求。所有可执行反例均使用系统临时目录中的最小 fixture；没有运行技能正文指令，也没有改写正式生成物。

## 使用者保证

| 问题 | 回归保证 | 验证类型 |
| --- | --- | --- |
| ENG-01 | 干净快照检查成功；新增技能源或 README 模板漂移检查失败；源树每个文件 SHA-256 均保持不变，未跟踪笔记也保留 | CLI 集成 |
| ENG-02 | deprecated 不进入安装清单及默认搜索/浏览；显式历史搜索和 `why` 仍可读 | 生成器及 CLI 集成 |
| ENG-03 | 不同名称的同一个 repository_id 在共享 loader/CLI 被拒绝，已有目录产物不变；历史缺 ID 仍兼容 | 生成器及 CLI 集成 |
| ENG-04 | 未知 status 在输出前报错，已有 INDEX 不变 | 生成器集成 |
| ENG-05 | 缺类、空类和三段 domain 均在输出前报错 | 生成器集成 |
| ENG-06 | END 在 BEGIN 之前的 README 目录边界报错且原文不变 | CLI 集成 |
| ENG-07 | `--json` 放在查询词或 `why` 名称之前也不会吞位置参数 | CLI 集成 |
| ENG-08 | 只对一个真实技能目录注入 EACCES 后生成失败，全部源文件和既有产物保持原字节 | 生成器故障注入 |
| 目录口径 | 总数使用目录记录/indexed entries，状态栏明确显示上游不可访问与已归档 | 生成器集成 |

## 检查点

- RED：`954a78c9730b82d21e3fcaf2c61650a592b3a35d`。修改生产代码之前执行 `node --test tests/engineering-regressions.test.mjs`，12 项测试全部因对应既有行为失败；另有一次早期 11 项测试运行也全部失败。
- GREEN：运行 `npm test`，36/36 通过，包含全部 12 项新增回归及 24 项既有回归。
- 覆盖率命令：`node --test --experimental-test-coverage tests/brand.test.mjs tests/index-pipeline.test.mjs tests/skill-cli.test.mjs tests/engineering-regressions.test.mjs`，36/36 通过；报告的源树 `everything-skills.mjs` 行覆盖率 85.98%，`load-skill-repos.mjs` 83.87%，合计 85.34%。

## 覆盖范围与局限

本机 Node v24.19.0 / Windows。Node 默认覆盖率报告只合并了当前项目路径下的上述两个脚本；复制到临时 fixture 执行的生成器不在该覆盖率百分比的分母中，其保证来自表中的真实输入、退出码与产物完整性断言。该百分比不代表所有脚本全仓覆盖率。EACCES 使用 Node preload 精确注入，不更改系统 ACL。

正式仓库的中英文完整构建、生成物刷新和漂移检查由集成阶段在去重/技能修复合入后统一执行；本分支不提交生成物。没有 push 或 merge。
