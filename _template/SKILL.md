---
name: your-skill-name
title: 中文标题
description: 当〈场景/触发条件〉时使用；做〈动作+产物〉；不适用于〈负边界〉；触发词：词1、词2、词3。务必单行。
domain: 卷中文/类
triggers: [词1, 词2, 词3]
tags: [tag1, tag2]
level: 入门
status: draft
agents: [claude-code, codex, cursor]
tools: []
requires: []
related: []
combines_with: []
license: CC-BY-4.0
# 采编自第三方时填写（自有原创可删除以下两行）：
# source: owner/repo
# source_license: Apache-2.0
---

# 中文标题

## 何时使用
一句话判据。以及**不该用**它的边界。

## 步骤 / 指令
1. ……
2. ……
（能用清单/伪代码就不要写散文。这是给 Agent 执行的。）

## 示例
```
最小可用示例：命令 / 提示词 / 代码片段
```

## 注意事项
- 易错点 / 限制 / 安全与合规提醒

## 互见
- requires：`前置技能` —— 为何前置
- related：`近亲技能`
- combines_with：`搭配技能` —— 组合能解决什么
