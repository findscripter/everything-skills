---
name: mcp-builder
title: MCP 服务器构建
description: 当需要为外部 API/服务构建 MCP（Model Context Protocol）服务器、设计供 LLM 调用的工具并产出可评测的服务器时使用；做 MCP 服务器的研究/实现/测试/评估全流程产出（工具 schema、分页、错误处理、评估 XML）；不适用于编写普通 REST API、调用现成 MCP 客户端或仅集成单个 Anthropic SDK 功能；触发词：MCP、MCP 服务器、Model Context Protocol、FastMCP、TypeScript SDK、工具暴露给 LLM、build mcp server、registerTool。
domain: 平台/mcp
triggers: [MCP, MCP 服务器, Model Context Protocol, FastMCP, TypeScript SDK, 工具暴露给 LLM, build mcp server, registerTool]
tags: [mcp, model-context-protocol, fastmcp, typescript-sdk, tool-design, agent]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [typescript, node, python, fastmcp, zod, pydantic, mcp-inspector]
requires: []
related: [agent-tool-builder, agent-tool-design, ai-native-cli-design, skill-creator]
combines_with: [agent-tool-builder, ai-native-cli-design, rest-api-endpoint-builder]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
MCP 服务器的质量不取决于工具实现得多全，而取决于这些工具（输入/输出 schema、描述、功能）能否让一个没有额外上下文、只能访问该服务器的 LLM 完成真实、复杂的任务。

## 何时使用

- 需要把某个外部 API/服务（GitHub、Slack、Jira、内部系统等）封装成 MCP 工具，供 Claude 等 LLM/Agent 调用时。
- 触发词：MCP、MCP 服务器、Model Context Protocol、FastMCP、TypeScript SDK、registerTool、把工具暴露给 LLM、build mcp server。
- 典型任务：为某 API 设计工具集、写工具 schema 与描述、加分页/错误处理、产出评估集衡量好不好用。

**不该用（边界）：**
- 写给人或前端用的普通 REST/GraphQL API → 直接写后端，不要套 MCP。
- 只是想在应用里**调用**现成 MCP 服务器或单个 Anthropic SDK 功能（缓存/思考/工具调用）→ 用 `claude-api`，不是建服务器。
- 把一段工作流封装成本词典的「技能」条目 → 用 `skill-creator`，那是 Skill 不是 MCP server。

## 步骤 / 指令

四个阶段，每阶段可独立验证：

**阶段 1 · 研究与规划**
1. **定设计取向**：在「全面覆盖 API 端点」与「少量高层工作流工具」之间权衡。不确定时**优先全面覆盖**，给 Agent 组合操作的自由度。
2. **读协议与 SDK**：从 sitemap `https://modelcontextprotocol.io/sitemap.xml` 找页，页面后加 `.md` 取 markdown。推荐技术栈 **TypeScript**（SDK 成熟、模型擅长生成、静态类型好 lint）；远程服务器用 **Streamable HTTP（无状态 JSON）**，本地用 **stdio**。
3. **梳理目标 API**：列出关键端点、鉴权方式、数据模型；按最常用操作排出要实现的工具清单。

**阶段 2 · 实现**
4. **搭基础设施**：共享 API 客户端（含鉴权）、统一错误处理、JSON/Markdown 两种响应格式化、分页支持。绝不在工具间复制粘贴逻辑（DRY）。
5. **逐个实现工具**，每个工具必须有：
   - **输入 schema**：TS 用 Zod（`.strict()` 禁多余字段）、Python 用 Pydantic；字段带约束、描述和示例。
   - **输出 schema**：尽量定义 `outputSchema`，并在响应里返回 `structuredContent`（TS SDK 特性）。
   - **描述**：精确、无歧义地说明功能、参数、返回结构，并写明「该用/不该用」的例子。
   - **annotations**：`readOnlyHint` / `destructiveHint` / `idempotentHint` / `openWorldHint`，如实标注（这是提示不是安全保证）。
   - I/O 全用 async/await；错误信息**可操作**（给出下一步建议）。

**阶段 3 · 构建与测试**
6. TypeScript：`npm run build` 验证编译；Python：`python -m py_compile your_server.py`。用 `npx @modelcontextprotocol/inspector` 连服务器手测；必要时配 `code-reviewer` 做代码审查。

**阶段 4 · 评估（衡量好不好用）**
7. 造 **10 道评估问题**，每道必须：**独立**、**只读非破坏**、**复杂**（需多次甚至几十次工具调用）、**真实**、**可验证**（单一答案、可字符串比对）、**稳定**（答案不随时间变）。避免能被关键词直接搜到的简单题；答案尽量人类可读（名字/日期/数量），不要列表/复杂结构。
8. 输出 XML 评估文件，跑评估脚本（自动用 Claude 当 Agent 解题并比对答案），按反馈迭代工具设计。

## 示例

**命名约定**（强约束）：
- 服务器名：Python `{service}_mcp`（如 `slack_mcp`）；Node/TS `{service}-mcp-server`（如 `slack-mcp-server`）。
- 工具名：snake_case + 服务前缀 + 动词开头，如 `github_create_issue`、`slack_send_message`，避免与其他服务器撞名。

**TypeScript 工具注册（现代 API，勿用废弃的 `server.tool()`）：**
```typescript
const UserSearchInput = z.object({
  query: z.string().min(2).max(200).describe("匹配姓名/邮箱的搜索串"),
  limit: z.number().int().min(1).max(100).default(20).describe("返回上限"),
  offset: z.number().int().min(0).default(0).describe("分页偏移"),
}).strict();

server.registerTool("example_search_users", {
  title: "Search Example Users",
  description: "按姓名/邮箱搜索用户……（写清参数、返回 schema、该用/不该用例子）",
  inputSchema: UserSearchInput,
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
}, async (params) => {
  const output = { total, count: users.length, offset: params.offset, users,
                   has_more: total > params.offset + users.length };
  return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
           structuredContent: output };
});
```

**Python / FastMCP：**
```python
mcp = FastMCP("example_mcp")

class UserSearchInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra='forbid')
    query: str = Field(..., description="搜索串", min_length=2, max_length=200)
    limit: int | None = Field(default=20, ge=1, le=100, description="返回上限")

@mcp.tool(name="example_search_users",
          annotations={"readOnlyHint": True, "destructiveHint": False,
                       "idempotentHint": True, "openWorldHint": True})
async def example_search_users(params: UserSearchInput) -> str:
    '''按姓名/邮箱搜索用户。Args/Returns/Examples 写全……'''
    ...
```

**分页响应统一结构：** `{total, count, offset, items, has_more, next_offset}`，默认 20~50 条。

**评估 XML：**
```xml
<evaluation>
  <qa_pair>
    <question>找出 2024 Q2 创建、已完成任务数最多的项目，项目名是？</question>
    <answer>Website Redesign</answer>
  </qa_pair>
</evaluation>
```
跑评估（stdio 模式脚本会自动拉起服务器）：
```bash
python scripts/evaluation.py -t stdio -c python -a my_mcp_server.py \
  -e API_KEY=abc -o report.md evaluation.xml
```

## 注意事项

- **评估是质量标尺**：服务器好不好，看 LLM 能否仅凭你的工具答出真实难题，而非端点覆盖率。先造评估再迭代，否则盲调。
- **工具描述必须精确匹配实际功能**，含糊或夸大会让 Agent 选错工具；保持工具原子、聚焦。
- **响应控量**：分页务必尊重 `limit`，返回 `has_more`/`next_offset`/`total`；大响应设 `CHARACTER_LIMIT`（如 25000）截断并提示用 offset/过滤。Markdown 给人看（时间转可读、名字带 ID），JSON 给程序处理。
- **stdio 服务器禁止往 stdout 打日志**（会污染协议），日志走 stderr。
- **安全**：API key 只放环境变量、启动时校验；用 Pydantic/Zod 校验所有输入防注入/路径穿越；不向客户端暴露内部错误细节；本地 HTTP 服务器开 DNS rebinding 防护、绑 `127.0.0.1`、校验 `Origin`。
- **错误信息要教 Agent 怎么办**，例如「Error: Rate limit exceeded. 请稍后重试」「结果过多，请加 filter='active_only'」。
- 远程优先 Streamable HTTP 的**无状态 JSON**（每请求新建 transport，易扩展），别用已废弃的 SSE。
- 评估题的答案要**稳定**：别数「当前点赞数/成员数」这类动态值，挑已关闭/历史数据。

## 互见

- **related**：`claude-api` — 在应用中调用 LLM、配置缓存/工具调用等单点能力时用它，本词条只负责「建服务器」。
- **related**：`skill-creator` — 把工作流封装成本词典 Skill 用它，区别于 MCP server。
- **combines_with**：`code-reviewer` — 实现完成后审查 DRY、错误处理一致性、类型覆盖与工具描述质量。

> 来源改编自 Anthropic `mcp-builder`（Apache-2.0），按中文技能大典 SCHEMA 适配重写，保留关键命令与约束。
