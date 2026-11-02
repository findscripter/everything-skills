# 接手陌生仓库

[English](README.md) · [全部案例](../README.zh.md)

**输入：**[原创的 7 文件 Node.js 工作区](input/mini-repo/)，包含 CLI 和共享 core。**输出：**[上手指南](output/onboarding.md)、依赖图和[机器事实](output/facts.json)。已在干净临时副本中实际运行 3 项测试和 CLI。

先读 [codebase-onboarding-doc](../../07-productivity/codebase-onboarding-doc/SKILL.md)，再读 [monorepo-navigator](../../02-engineering/monorepo-navigator/SKILL.md)。实际顺序为扫描配置与文件 → 阅读实现/测试 → 整理工作区依赖 → 干净目录运行 → 为新人写指南。

```text
将本库的 codebase-onboarding-doc 和 monorepo-navigator 的 SKILL.md 作为方法参考。
本教学例仅使用下面指定的原创 fixture 和 examples/repository-onboarding/reproduce.mjs，
不执行不存在的 Python helper；不能将这种有界替代推广为真实项目中的完整技能运行。
只读检查 examples/repository-onboarding/input/mini-repo。
写给新维护者的上手指南：项目用途、Node 前提、精确运行命令、关键文件、
依赖图、修改影响和排错。在干净临时副本中运行测试与 CLI，给重要结论列文件证据。
不要加构建工具，不要把 fixture 写成已部署服务。
```

在库根目录复现：

```text
node examples/repository-onboarding/reproduce.mjs
```

修改 fixture 后可明确使用 `--write` 重建机器事实；脚本不生成叙述指南。脚本仅用 Node 内置模块，并非技能正文提及但未随目录提供的 Python helper。此例不验证客户端安装、部署、安全或大型仓库性能；范围见输出中的 evidence and limits。
