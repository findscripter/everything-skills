# 读论文并核查引用

[English](README.md) · [全部案例](../README.zh.md)

**输入：**真实论文 *Attention Is All You Need*，[arXiv 1706.03762v7](https://arxiv.org/abs/1706.03762v7)、[原创任务](input/task.md)、[刻意含错的两条引用草稿](input/draft-citations.json)。**输出：**[中文五步导读](output/reading-guide.zh.md)、[4 条来源化主张核查](output/claim-check.json)、[书目核查](output/citation-check.json)、[脚本生成的 BibTeX](output/references.bib)。

实际先读 [academic-paper-explainer](../../09-verticals/academic-paper-explainer/SKILL.md)，再读 [citation-management](../../01-documents/citation-management/SKILL.md)。已读取全文的方法、实验与限制，并调用 DataCite 核对书目，交叉检查 arXiv 记录和 NeurIPS 页面。[来源记录](output/sources.json)列出范围。

```text
将 academic-paper-explainer 和 citation-management 的 SKILL.md 依次作为方法参考。
本教学例仅使用下面指定的公开论文、examples/paper-reading/input 中的原创 fixture，
并用 examples/paper-reading/reproduce.mjs 做可复现检查，不执行不存在的 Python helper。
不能将这种有界替代推广为真实科研项目中的完整技能运行。
阅读 https://arxiv.org/html/1706.03762v7，用中文完成五步精简导读：一句话定位、
逐章导读、忠于技术的故事、两个公式逐符号拆解、专家点评。区分训练并行与自回归推理，
比较表格和正文的报告数字。以权威元数据核查 examples/paper-reading/input/draft-citations.json，
修正字段、按身份去重并生成 BibTeX，给出来源且保留无法裁定的差异。不复制全文和图表。
```

库根目录离线复现：

```text
node examples/paper-reading/reproduce.mjs
```

可选在线核查：

```text
node examples/paper-reading/reproduce.mjs --online
```

在线命令核对 DataCite 的标题/年份/作者/DOI 以及版本化 arXiv 页的 HTTP 状态，来源不可用时会失败；它不重新进行全文解释。加 `--write` 可重建引用报告与 BibTeX，同时使用 `--online` 时保存在线核查结果。输入仅保存[选取的书目事实](input/metadata.json)。

真实核查发现数值差异：NeurIPS 摘要为 27.5/41.1 BLEU，v7 摘要与 Table 2 为 28.4/41.8，v7 §6.1 的 EN-FR 正文为 41.0。本例保留差异，未编造解释。导读由 Agent 阅读后撰写；离线脚本只验证部分保存事实与引文规范化，不验证所有科学主张。没有重新训练、重算 BLEU、系统综述、全参考文献核查或客户端安装测试；未冒称执行技能目录中不存在的 Python helper。
