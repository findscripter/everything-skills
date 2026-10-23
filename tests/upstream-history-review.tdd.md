# 历史补证与上游复审的验证证据

本轮验收来自用户要求：实际完成历史补证和上游新内容复审，保留未知状态，不把历史记录替换成今天的版本。

|行为保障|RED 检查点|GREEN 检查点|实际验证|
|---|---|---|---|
|目录/CLI使用已审固定版本，磁盘原记录不变；不可访问项不虚构版本|`e24a9fa`|`de3f64f`|5个工程回归全部通过；缺commit、以commit充tree、身份覆盖均在写生成物前失败|
|来源索引同时显示历史声明与固定参考范围|`2f4f59a`|`386a403`|1个索引回归通过；原MIT声明与BSD参考范围同时可见|

RED均实际运行并因缺少对应行为失败，GREEN复跑相同目标后通过。检查点在本轮同一分支可达，没有复用其他任务提交。原测试输出保存在本次本地审计工作材料中；公共回归用例本身可以重跑。

实际命令：

```powershell
node --test --test-name-pattern='reviewed repository|repository review rejects|closed inaccessible' tests/engineering-regressions.test.mjs
node --test --test-name-pattern='source index separates' tests/index-pipeline.test.mjs
node --test tests/engineering-regressions.test.mjs tests/index-pipeline.test.mjs
```

两个模块合计38项通过。另通过V8对隔离fixture子进程采样，合并共享加载器的执行范围，得到行覆盖估算93.33%（98/105个非空非注释行）；该数字是模块诊断，不是全仓覆盖率。

机械整合校验还逐字段比较全部2,673条原始目录记录：仅新增218个 `current_review`，原身份、Stars、来源版本、审阅日期和旧摘要均保持原值。全部1,099个采编条目仍为 `origin_commit_sha: null`，历史调查的完成状态不提升origin。

固定Git对象和哈希校验仅证明读取到的文件与对象对应。未执行第三方技能、未验证真实外部服务或科学结果；全文比较、分发范围与许可范围结论的证据见 `data/upstream-review-completed-2026-10-23.json`、`data/historical-origin-investigation-2026-10-23.json`、`data/historical-license-review-2026-10-23.json`。

最终英文整套测试73/73通过；构建通过。Windows改动技能先统一LF再刷新清单，避免工作副本与Git提交的换行转换导致哈希漂移。正式发布前另以Git暂存区Blob核对全部1,113份正文与170个资源。
