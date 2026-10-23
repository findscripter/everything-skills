# SK06 来源清单治理验证

需求由全量审计 SK06 及集成任务给出。比较快照只是可复现的参考版本，不等于历史采编原版本，也不认证逐段许可证。

- RED 检查点 `fac234b`：先编写真实临时技能树、来源清单和 CLI 行为测试，尚无新入口时新功能调用失败。补充检查点 `09398fb` 强制所有负例先确认命令存在，避免把 MODULE_NOT_FOUND 当作正确拒绝；此时 7/7 失败。
- GREEN：`node --test tests/skill-provenance.test.mjs`，7/7 通过。
- 覆盖率：`node --test --experimental-test-coverage tests/skill-provenance.test.mjs`，两入口行覆盖 100%，共享模块 97.67%，合计 97.97%；函数覆盖 100%。分支覆盖 57.89%，未穷举每种格式错误。

| 行为 | 保证 |
| --- | --- |
| 精确覆盖 | 直接遍历全部 11 个受控卷和嵌套技能；旧 INDEX 不决定扫描清单 |
| 只读核查 | 缺项、删除、重复、hash 或来源/许可声明变动报错；原 manifest 字节不变 |
| 显式刷新 | 只有 `--write` 才写；正文变化更新本地 hash，保持原比较快照和 unknown origin |
| 来源变更 | source 或 source_license 变化清除旧比较/规范身份字段，并标为 needs-review；新增/删除同步反映在清单 |
| 固定证据契约 | 完整 commit/blob/SHA 字段、固定 GitHub URL 和许可证证据路径对应；reference 角色不能被写成 origin |
| 失败保护 | 无 manifest、坏 JSON、未知 schema 和非法原记录不自动修复、不覆盖 |
| 路径边界 | manifest 路径和技能树中的符号链接/Windows junction 被拒绝；相对路径禁止跨出卷或包含 `..` |

全部验证离线运行，不访问网络、不执行技能正文，不重新认证远端参考文件内容。fixed-reference 字段格式有效只表示记录结构一致，其原始远端 hash 证据仍由采集审计负责。当前 schema 的 curated 原采编状态只接受 unrecorded/null；需要增加历史原版本认证时必须另行定义证据契约。

只读检查集成工作树时，正确发现 PDF/XLSX 改写及 Odoo 正文修复造成的既有清单漂移。正式清单刷新、package/build-all 接入由根代理集成，不由本分支改写。
