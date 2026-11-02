# 评审 API 改动

[English](README.md) · [全部案例](../README.zh.md)

**输入：**原创的 OpenAPI [旧版](input/before.openapi.json)和[提议版本](input/after.openapi.json)。**输出：**[实际评审](output/review.md)和[机器发现](output/findings.json)：4 项破坏性变更、4 项设计/安全发现，以及公开每项判据的示例评分卡。

先读 [api-design-reviewer](../../02-engineering/api-design-reviewer/SKILL.md)，再读 [api-security-best-practices](../../08-security/api-security-best-practices/SKILL.md)。先比较契约，再检查认证、HTTPS、输入边界，并区分规范文件与运行服务。

```text
将 api-design-reviewer 和 api-security-best-practices 的 SKILL.md 作为方法参考。
本教学例仅使用下面指定的原创 fixture 和 examples/api-review/reproduce.mjs，
不执行不存在的 Python helper；不能将这种有界替代推广为真实项目中的完整技能运行。
比较 examples/api-review/input/before.openapi.json 与 after.openapi.json。
找出不兼容的路由、响应字段/类型和请求必填项，再检查认证、HTTPS、集合大小边界。
给出 JSON Pointer、消费者影响、迁移建议和每项判据透明的评分卡。
这些是合成规范文件，不得据此声称线上漏洞。
```

库根目录复现：

```text
node examples/api-review/reproduce.mjs
```

明确刷新 `findings.json` 时可加 `--write`。这是针对这两个 fixture 自写的 Node 检查器，并非技能提到但未提供的 Python helper，也不生成叙述或验证客户端安装。[评审报告](output/review.md)列出了评分判据和未验证的运行时问题；35/100 是刻意有缺陷的示例输入的设计分数，不是生产 benchmark。
