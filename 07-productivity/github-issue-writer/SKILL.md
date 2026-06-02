---
name: github-issue-writer
title: GitHub Issue 编写器
description: 当需要把报错日志、截图、语音口述、零散吐槽等非结构化 bug 输入整理成开发者可直接处理的 GitHub Issue 时使用；做的事是抽取结构化信息并产出含复现步骤、预期/实际、影响等级、证据引用的标准 Issue Markdown；不适用于代码评审、需求/PRD 撰写或环境实测验证；触发词：github issue、提 issue、写 issue、bug 报告、缺陷单、复现步骤、issue 编写、报错整理
domain: 协作/pm
triggers: [github issue, 提 issue, 写 issue, bug 报告, 缺陷单, 复现步骤, issue 编写, 报错整理]
tags: [github, issue, bug-report, collaboration, pm, triage]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [github, markdown]
requires: []
related: [bug-hunter, jira-expert, agile-product-owner, github-pr-comment-resolver]
combines_with: [bug-hunter, jira-expert, agile-product-owner]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你拿到的是**非结构化的缺陷输入**——粘贴的报错日志、客服/支持记录、截图或 GIF、语音口述、随手记录的吐槽——需要把它整理成一条干净、开发者拿来即可处理的 GitHub Issue（含摘要、复现步骤、预期 vs 实际、影响等级、证据引用）时使用。

不该用的边界：
- 不是代码评审、方案设计或 PRD/需求文档撰写。
- 产出的 Issue 不能替代环境实测、回归测试或专家复核——它只是把信息结构化，不做验证结论。
- 若缺少必要输入、权限、安全边界或验收标准，停下来向用户追问，不要硬编。

## 步骤

1. 从混乱输入中**抽取事实**：口述和随手记录里事实往往埋在口语里，逐条拎出来（动作、现象、报错码、时间线）。
2. **补全缺失上下文**：用户说「同一个项目」「那个 dashboard」时，结合对话/记忆补齐具体名称；确实补不出的留占位符并标注待确认。
3. 按下方模板填充各小节，**判定影响等级**（见指令）。
4. **脱敏**：项目名、用户 ID、密钥等敏感信息用 `[PROJECT_NAME]`、`[USER_ID]` 等占位符替换。
5. 输出 Issue。如需落盘，**存为 Markdown 文件**到仓库根的 `/issues/` 目录，命名 `YYYY-MM-DD-短描述.md`。

## 指令

- **精简无废话**：每个字都要有价值，删掉客套与重复。
- **影响等级判定**（Severity 对照）：
  - Critical：服务宕机、数据丢失、安全问题
  - High：核心功能不可用且无绕过方案
  - Medium：功能受损但有 workaround
  - Low：轻微不便或纯外观问题
- **图片/GIF 引用**：内联引用附件，格式 `![描述](路径)`。
- 缺失字段宁可留占位符 + 标注，也不要编造。

输出模板：

```markdown
## Summary
[一句话描述问题]

## Environment
- **Product/Service**:
- **Region/Version**:
- **Browser/OS**: (如相关)

## Reproduction Steps
1. [步骤]
2. [步骤]

## Expected Behavior
[预期行为]

## Actual Behavior
[实际行为]

## Error Details
​```
[报错信息/代码，如有]
​```

## Visual Evidence
[附带截图/GIF 的引用]

## Impact
[Severity: Critical/High/Medium/Low + 简要说明]

## Additional Context
[其他相关细节]
```

## 示例

输入（语音口述）：
> 我刚才想部署那个 agent，结果它就静默失败了，没报错啥提示都没有，workflow 跑完了但 agent 直接从列表里消失，刷新重试了三次才成。

输出：

```markdown
## Summary
Agent 部署静默失败——无报错提示，agent 从列表消失

## Environment
- **Product/Service**: Azure AI Foundry
- **Region/Version**: westus2

## Reproduction Steps
1. 进入 agent 部署页
2. 配置并部署 agent
3. 观察到 workflow 执行完成
4. 查看 agent 列表

## Expected Behavior
Agent 出现在列表中并显示部署状态；部署失败时给出错误提示

## Actual Behavior
Agent 从列表消失，无任何错误信息，需刷新页面重试

## Impact
**High** - 阻断 agent 部署流程，失败时无任何反馈

## Additional Context
重试 3 次后才部署成功
```

---

输入（报错粘贴）：
> Error: PERMISSION_DENIED when publishing to Teams channel. Code: 403. 昨天还好好的。

输出：

```markdown
## Summary
向 Teams 频道发布时报 403 PERMISSION_DENIED

## Environment
- **Product/Service**: Copilot Studio → Teams 集成
- **Region/Version**: [REGION]

## Reproduction Steps
1. 为 Teams 频道配置 agent
2. 尝试发布

## Expected Behavior
Agent 成功发布到 Teams 频道

## Actual Behavior
返回 `PERMISSION_DENIED`，状态码 403

## Error Details
​```
Error: PERMISSION_DENIED
Code: 403
​```

## Impact
**High** - 阻断 Teams 集成，相比此前可用状态属于回归

## Additional Context
昨天还正常，疑似权限/配置变更或服务回归
```

## 注意事项

- 影响等级要与真实业务影响匹配，不要为了显眼一律标 High/Critical。
- 敏感数据务必脱敏后再写入 Issue，尤其是粘贴的日志常含 token、内网地址、用户标识。
- 复现步骤要能被他人独立执行；无法复现时明确写出「偶发/无法稳定复现」而非省略。
- 落盘文件名用当天日期（如 2026-06-01）加短描述，便于检索归档。

## 互见

—

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
