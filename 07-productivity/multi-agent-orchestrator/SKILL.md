---
name: multi-agent-orchestrator
title: 多智能体任务编排器
description: 当有 3 个以上专职 AI Agent 需协同完成复杂任务，且出现重复劳动、冲突改文件或质量参差时使用；做的事是搭建单一编排器（任务拆解→去重→路由→质量门禁→心跳监控）并产出任务登记表、委派指令与验收证据；不适用于单 Agent 简单任务或无需协同的场景；触发词：多智能体编排、multi-agent orchestration、任务路由 task routing、Agent 去重 anti-duplication、质量门禁 quality gate、心跳监控 heartbeat
domain: 协作/automation
triggers: [多智能体编排, multi-agent orchestration, 任务路由, task routing, Agent 去重, anti-duplication, 质量门禁, quality gate, 心跳监控, heartbeat]
tags: [multi-agent, orchestration, task-routing, quality-gates, anti-duplication]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, sqlite3, difflib, git, claude, cursor, gemini]
requires: []
related: [agent-workflow-builder, task-decomposition-planner, multi-agent-system-designer, parallel-agent-hub]
combines_with: [task-decomposition-planner, agent-workflow-builder, multi-agent-workflow-designer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 有 3 个及以上专职 Agent（代码、研究、测试、安全、文档等）需要在一个复杂任务上协同。
- Agent 之间出现重复劳动或互相冲突（例如同时改同一文件）。
- 需要审计轨迹，记录"谁、在何时、做了什么"。
- Agent 产出质量不稳定，需要在标记完成前做验证。

不该用：

- 单个 Agent 即可完成、无需拆解与协同的简单任务。
- 不要把编排器的产出当作环境相关验证、测试或专家评审的替代品。
- 若缺少必要输入、权限、安全边界或验收标准，应先停下来澄清，而不是开工。

## 步骤

1. 定义编排器身份（含 NOT-block）：明确它"是什么 / 不是什么"，强制它只委派不亲自干活。生产数据显示 NOT-block 可降低约 35% 的任务漂移。
2. 建立任务登记表：在分配前用相似度比对查重，避免重复派单。
3. 路由到专职 Agent：用关键词打分把任务匹配到最合适的 Agent。
4. 执行质量门禁：把 Agent 自报"完成"视为"主张"，把测试输出视为"证据"，全部检查通过才标记 done。
5. 每 30 分钟心跳：盘点近 30 分钟委派了什么，发现空闲 Agent 就补派或重派。

## 指令

身份定义（NOT-block 模式）：

```
你是任务编排器（Task Orchestrator）。你绝不亲自做专项工作。
你负责：拆解任务、委派给正确的 Agent、防止冲突、并在标记完成前验证质量。

你不是：
- 不是写代码的人 —— 委派给代码 Agent
- 不是研究员 —— 委派给研究 Agent
- 不是测试员 —— 委派给测试 Agent
```

任务查重（SQLite + difflib，相似度阈值 0.55）：

```python
import sqlite3
from difflib import SequenceMatcher

def check_duplicate(description, threshold=0.55):
    conn = sqlite3.connect("task_registry.db")
    c = conn.cursor()
    c.execute("SELECT id, description, agent, status FROM tasks WHERE status IN ('pending', 'in_progress')")
    for row in c.fetchall():
        ratio = SequenceMatcher(None, description.lower(), row[1].lower()).ratio()
        if ratio >= threshold:
            return {"id": row[0], "description": row[1], "agent": row[2]}
    return None
```

关键词打分路由：

```python
AGENTS = {
    "code-architect": ["code", "implement", "function", "bug", "fix", "refactor", "api"],
    "security-reviewer": ["security", "vulnerability", "audit", "cve", "injection"],
    "researcher": ["research", "compare", "analyze", "benchmark", "evaluate"],
    "doc-writer": ["document", "readme", "explain", "tutorial", "guide"],
    "test-engineer": ["test", "coverage", "unittest", "pytest", "spec"],
}

def route_task(description):
    scores = {}
    for agent, keywords in AGENTS.items():
        scores[agent] = sum(1 for kw in keywords if kw in description.lower())
    return max(scores, key=scores.get) if max(scores.values()) > 0 else "code-architect"
```

质量门禁（全部通过才算 done）：

```
Agent 报告完成后逐项核验：
1. 文件是否真的改动了？  git diff --stat
2. 测试是否通过？        npm test / pytest
3. 是否引入了密钥？      grep 检索 API key、token
4. 构建是否成功？        npm run build
5. 是否只动了该动的文件？（范围检查）
仅当全部检查通过，才标记完成。
```

30 分钟心跳：

```
每 30 分钟自问：
1. 过去 30 分钟我"委派"了什么？
2. 若什么都没委派 → 打开任务积压，派下一个任务
3. 检查空闲 Agent（分配的任务上 >30 分钟无消息）
4. 重新催促空闲 Agent，或重新分配其任务
```

## 示例

示例 1 —— 委派一个代码任务（明确范围、验证命令、截止时间）：

```
[ORCHESTRATOR -> code-architect] 任务：给 /api/users 加限流
范围：仅 src/middleware/rate-limit.ts
验证：npm test -- --grep "rate-limit"
截止：30 分钟
```

示例 2 —— 处理重复任务：

```
用户提出："修复登录 bug"
登记表查重：任务 #47 "Fix authentication bug" 正由 security-reviewer 进行中
决策：SKIP —— 已有相似任务（78% 匹配）
动作：告知用户已有任务，等待其完成
```

## 注意事项

- 给每个 Agent 都写 NOT-block，明确它必须拒绝做什么。
- 任务登记表用 SQLite 即可（轻量、无需服务端）。
- 去重相似度阈值取 55%（再低会误报过多）；可对同名文件做行级锁与队列，避免两个 Agent 同时改一个文件。
- 质量门禁要基于"证据"而非 Agent 的口头主张：先看 git diff 再接受完成。
- 每次委派都留痕：任务 ID、Agent、范围、截止时间、验证命令。
- 常见坑：编排器自己动手做活（对策：加 NOT-block 与角色边界）；任务堆积无进展（对策：靠 30 分钟心跳发现并重派陈旧任务）。

## 互见

- code-reviewer：委派后对代码改动做评审。
- dependency-auditor：在质量门禁中核查依赖与安全问题。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
