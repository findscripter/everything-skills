# 三个能检查、能复现的技能工作流

[English](README.md) · [返回项目](../README.md)

这里展示**输入 → 技能指令 → 实际检查后的结果**。仓库和 API 使用原创、刻意简化的小型 fixture；论文使用真实公开论文，只保存书目事实、来源链接和我们自行撰写的导读。

| 任务 | 实际采用的技能顺序 | 看输出 |
| --- | --- | --- |
| [接手陌生仓库](repository-onboarding/README.zh.md) | `codebase-onboarding-doc` → `monorepo-navigator` | [上手指南](repository-onboarding/output/onboarding.md)、依赖地图、干净目录中的测试与 CLI 执行 |
| [读论文并核查引用](paper-reading/README.zh.md) | `academic-paper-explainer` → `citation-management` | [中文导读](paper-reading/output/reading-guide.zh.md)、修正后的 BibTeX、引用与主张核查 |
| [评审 API 改动](api-review/README.zh.md) | `api-design-reviewer` → `api-security-best-practices` | [评审报告](api-review/output/review.md)、4 项破坏性变更、4 项设计/安全发现 |

在仓库根目录使用 **Node.js 22 或以上版本**运行：

```text
node scripts/check-examples.mjs
```

该检查不需要安装 npm 依赖、API key、模型调用或联网。每个案例都有可复制 prompt、确切输入与技能链接、确定性的复现命令及限制；论文另提供可选的在线元数据核查。

这里的叙述输出是在实际阅读对应 `SKILL.md` 后，按其步骤检查输入而得到的。脚本会复核部分具体事实、运行微型程序、比较 API 输入并检查已保存的书目记录，**不会调用 LLM 重新生成报告**。它们不验证 Claude/Codex 客户端安装，不认证全库技能效果，也不是生产 benchmark。部分技能正文提到的 helper 并未随目录提供，本案例明确使用自行编写的零依赖脚本，没有冒称运行这些缺失的 helper。

fixture 代码及案例文字为本仓库原创，遵循[仓库许可](../LICENSE)。论文保留其自身权利；这里不分发全文、图或表。
