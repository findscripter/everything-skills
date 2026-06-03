---
name: autonomous-coding-agent-patterns
title: 自主编码智能体设计模式
description: 当设计/实现自主编码智能体（Agent Loop、工具调用、权限审批、浏览器自动化、上下文与检查点、MCP 集成）时使用；产出可落地的架构模式、工具 Schema、权限分级与沙箱约束。不适用于单次问答式提示或不涉及工具执行的纯对话。触发词：autonomous agent、agent loop、工具调用、权限审批、沙箱、MCP
domain: 智能/agents
triggers: [构建自主编码智能体, 设计 agent loop / 工具调用 API, 实现权限与审批系统, 为智能体做浏览器自动化, 上下文注入与检查点恢复, 集成 MCP 动态工具, human-in-the-loop 工作流]
tags: [智能体, agents, agent-loop, tool-calling, 权限审批, 沙箱, 浏览器自动化, mcp, 上下文管理, checkpoint]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [computer-use-agents, agent-tool-builder, multi-agent-system-designer, parallel-agent-hub]
combines_with: [langgraph-agent-framework, autoresearch-optimization-agent, context-compression]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于设计或实现「自主编码智能体」时，需要一套可落地的工程模式：

- 搭建智能体主循环（思考→决策→执行→观察）与多模型分工。
- 设计工具/函数调用 API（工具 Schema、文件编辑、终端、检索）。
- 实现权限分级与审批系统（auto / ask_once / ask_each / never）。
- 为智能体接入浏览器自动化或视觉定位。
- 做上下文注入（@file/@folder/@url/@problems）与检查点恢复。
- 集成 MCP，动态发现甚至生成新工具。

**不该用边界：**

- 单次问答式提示、纯对话、无工具执行的场景，无需引入本套循环与权限机制。
- 任务不明确匹配上述范围时不要硬套；缺少必需输入、权限、安全边界或验收标准时应先停下来澄清。
- 本文是设计模式而非可直接运行的成品，不能替代针对具体环境的验证、测试与专家评审。

## 步骤

1. **定义主循环**：构建 `think → decide → act → observe` 的迭代循环，设上限 `max_iterations`（如 50）防失控。无工具调用即视为任务完成。
2. **设计工具集**：每个工具暴露 JSON Schema（name/description/parameters/required），覆盖文件、检索、终端、浏览器、提问/联网五类（见示例 `CODING_AGENT_TOOLS`）。
3. **加固编辑工具**：文件编辑用 search/replace + `expected_occurrences` 校验，匹配数不符则拒绝写入，避免误改。
4. **加权限层**：按风险给每个工具配权限级别；高危命令（`rm -rf`/`sudo`/`chmod`）触发 HIGH 风险审批，危险操作（`sudo_command`/`format_disk`）直接 `NEVER`。
5. **上沙箱**：限制可执行命令白名单、路径必须在 workspace 内、隔离 `HOME`、加 `timeout`。
6. **管理上下文与检查点**：支持 @file/@folder/@url/@problems 注入；长任务定期保存 history/context 与 git ref 以便恢复。
7. **（可选）接 MCP**：连接 MCP server 动态发现工具，必要时按描述生成新工具并热加载。

## 指令

- **循环上限是硬约束**：任何主循环都要有 `max_iterations`，到顶返回 "Max iterations reached" 而非死循环。
- **工具执行要捕获异常**：返回统一的 `ToolResult(success, output, error)`，让 LLM 能观察失败原因并自我纠正。
- **权限默认收紧**：未配置的工具默认 `ASK_EACH`；只有 `read_file`/`list_directory`/`search_code` 这类只读操作才 `AUTO`。
- **路径与命令双校验**：执行前先 `validate_path`（realpath 必须以 workspace 为前缀）+ `validate_command`（基命令在白名单内）。
- **多模型按任务分工**：planning 用快模型、analysis 用强模型、code 用代码专用模型，控成本与质量。

## 示例

主循环骨架（保留源关键实现）：

```python
class AgentLoop:
    def run(self, task: str) -> str:
        self.history.append({"role": "user", "content": task})
        for i in range(self.max_iterations):
            response = self.llm.chat(messages=self.history,
                                     tools=self._format_tools(), tool_choice="auto")
            if response.tool_calls:
                for tool_call in response.tool_calls:
                    result = self._execute_tool(tool_call)   # act
                    self.history.append({"role": "tool",
                        "tool_call_id": tool_call.id, "content": str(result)})  # observe
            else:
                return response.content   # 无工具调用 = 完成
        return "Max iterations reached"
```

安全编辑（带出现次数校验）：

```python
actual = content.count(search)
if actual != expected_occurrences:
    return ToolResult(success=False,
        error=f"Expected {expected_occurrences} occurrences, found {actual}")
new_content = content.replace(search, replace)
```

权限分级与风险评估：

```python
PERMISSION_CONFIG = {
    "read_file": PermissionLevel.AUTO,        # 只读，自动放行
    "write_file": PermissionLevel.ASK_ONCE,   # 每会话问一次
    "run_command": PermissionLevel.ASK_EACH,  # 每次都问
    "sudo_command": PermissionLevel.NEVER,    # 永不放行
}
# run_command 命中 "rm -rf"/"sudo"/"chmod" → 标记 HIGH 风险
```

沙箱执行约束：

```python
subprocess.run(command, shell=True, cwd=self.workspace,
    capture_output=True, timeout=30,
    env={**os.environ, "HOME": self.workspace})  # 隔离 home，限定 30s
```

检查点状态（用于长任务恢复）：

```python
"workspace_state": {
    "git_ref": "<git rev-parse HEAD>",
    "git_dirty": "<git status --porcelain>",
}
```

## 注意事项

- **风险等级为 critical**：本模式涉及命令执行、文件写删、浏览器操作，落地时务必先开启权限审批与审计日志，再放开自动化。
- 危险操作（删除、sudo、磁盘格式化）必须默认阻断，且在审批 UI 中明确展示风险级别。
- 提供撤销/回滚能力（如 git 检查点），并向用户实时反馈进度与每步动作的解释。
- 不要把视觉定位（坐标点击）当作选择器的可靠替代，仅在无稳定 selector 时兜底。
- 输出不能替代针对具体环境的验证与测试；安全边界不清时先澄清再执行。

## 互见

- Cline：https://github.com/cline/cline
- OpenAI Codex：https://github.com/openai/codex
- Model Context Protocol：https://modelcontextprotocol.io/
- Anthropic Tool Use：https://docs.anthropic.com/claude/docs/tool-use

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证），已按「技能大典」体例适配重写。
