# 2026-10-24 日常收录审核

基线为 2673 条目录记录、2655 个可解析仓库 ID。本日通过固定 commit/tree、README、代表 SKILL、许可证和 Git Blob/SHA-256 复核并去重后新增 **68 个独立仓库身份**，目标 50，最终目录预计 2741 条。

## 准入

每条记录保留规范 repository_id、固定 commit/tree、README/代表技能/许可 URL 与 SHA-256、公开技能路径和计数依据。公开叶技能、插件/市场入口、产品内嵌技能、工作流和科研技能按分发范围分别计数；没有把镜像、维护文件、路由或测试夹具当作独立技能。

本日候选汇总中有 3 条因证据或读取限制保留 hold/error，另有 0 条与日初基线重复；它们没有计入 50。查询与代理报告的哈希见 `publication.json`，逐项审计台账见 `audit.json`。

未执行第三方技能。agent-reach 命令行不可用，已按其 GitHub dev fallback 使用官方 GitHub API、Git 固定对象和 codeload/HTTPS 证据；不输出凭证。
