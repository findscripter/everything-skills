---
name: filesystem-context-offload
title: 文件系统上下文卸载
description: 当工具输出撑爆上下文窗口、需要跨长任务持久化状态、子 Agent 间共享信息、或任务所需上下文超出单窗口时使用；做把大块内容写入文件、上下文窗口只留摘要/路径指针，再用 ls/glob/grep/按行读取按需召回（卸载工具输出、持久化计划、子 Agent 文件工作区、动态加载技能、持久化终端日志、自我修改指令）；不适用于单轮即结束、上下文本就装得下、或对延迟极敏感（文件 I/O 有开销）的场景。触发词：上下文卸载、context offload、scratch pad、按需加载、token 臃肿、filesystem context
domain: 通用/research
triggers: [上下文卸载, context offload, filesystem context, scratch pad, 暂存盘, 按需加载, just-in-time context, 动态上下文发现, token 臃肿, 工具输出太大, 子 Agent 共享状态, 跨会话持久化, 动态技能加载, 终端日志持久化]
tags: [上下文工程, token 优化, scratch pad, 多 Agent 协作, 动态上下文, 记忆持久化, 文件检索, grep glob]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [grep, glob, ls, read_file]
requires: []
related: [context-compression, context-window-management, context-budget-audit, codebase-structure-protocol]
combines_with: [parallel-agent-dispatch, iterative-context-retrieval]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 文件系统上下文卸载

把文件系统当成 Agent 的「无限上下文层」：写一次、按需选读。核心是用**动态上下文发现**取代**静态全量加载**——上下文窗口只保留指针（文件名/描述/路径），需要时才用检索工具拉回完整内容。

## 何时使用

适用：
- 工具输出（网搜、DB 查询、日志）超过 ~2000 token，正在撑大消息历史
- 任务跨多轮对话，需要持久化计划/状态，防止被摘要或注意力衰减丢失
- 多 Agent 协作，子 Agent 需要共享信息但不想靠「传话游戏」逐跳衰减
- 技能/指令集很多但每次只用一小部分，塞进 system prompt 既费 token 又互相干扰
- 终端/日志输出需要被 Agent 选择性查询（grep 取错误行）
- 想让 Agent 把学到的偏好写回自己的指令文件

不该用（负边界）：
- 任务单轮即可完成，没有跨轮需求
- 上下文本就装得下，卸载只是徒增 I/O 往返
- 延迟极敏感场景——文件读写有开销
- 底层模型能力弱、不会主动判断何时需要回读文件（动态发现依赖模型自觉拉取）

## 步骤

按场景套用六种模式，统一收敛到「写大块进文件 → 上下文留指针/摘要 → 按需 grep/按行读回」：

1. **暂存盘（Scratch Pad）**：工具输出超阈值就落盘，返回引用而非全文。
2. **计划持久化**：把计划写成结构化文件，每轮开头或迷失时回读（「靠复述操纵注意力」）。
3. **子 Agent 文件通信**：各子 Agent 把发现直接写入文件，协调者直读文件，绕开消息传递的逐跳衰减。
4. **动态技能加载**：技能存为文件，静态上下文只放「名字+一句描述」，相关时才 read_file 拉全文。
5. **终端/日志持久化**：把会话输出同步到文件，用 grep 取相关段而非整段回灌。
6. **自我修改学习**：把学到的偏好写回 Agent 自己的指令文件，下次会话自动加载（需护栏，见注意事项）。

## 指令

**暂存盘落盘逻辑**（超阈值才写文件，返回路径+摘要）：

```python
def handle_tool_output(output: str, threshold: int = 2000) -> str:
    if len(output) < threshold:
        return output
    file_path = f"scratch/{tool_name}_{timestamp}.txt"
    write_file(file_path, output)
    key_summary = extract_summary(output, max_tokens=200)
    return f"[Output written to {file_path}. Summary: {key_summary}]"
```

之后用 `grep` 搜特定模式、或 `read_file` 带行范围取定向片段。

**计划持久化**——结构化存盘，每轮回读：

```yaml
# scratch/current_plan.yaml
objective: "Refactor authentication module"
status: in_progress
steps:
  - id: 1
    description: "Audit current auth endpoints"
    status: completed
  - id: 2
    description: "Design new token validation flow"
    status: in_progress
```

**检索四件套**（模型受过文件系统遍历训练，结构化内容常胜过语义检索）：
- `ls` / `list_dir`：发现目录结构
- `glob`：按模式找文件（`**/*.py`）
- `grep`：搜内容返回匹配行，如 `grep -A 5 "error" terminals/1.txt`
- `read_file` 带行范围：只读指定行段，不加载整文件

语义检索与文件检索互补：概念性查询用语义，结构化/精确匹配用文件检索。

**推荐文件组织**（命名一致、带时间戳/ID 便于消歧）：

```
project/
  scratch/   tool_outputs/  plans/   # 临时工作文件
  memory/    preferences.yaml  patterns.md   # 持久学到的信息
  skills/    # 可加载的技能定义
  agents/    # 子 Agent 工作区
```

## 示例

**工具输出卸载**
```
输入：网搜返回 8000 token
卸载前：8000 token 进消息历史，全程占用
卸载后：写入 scratch/search_results_001.txt
        返回 "[Results in ...001.txt. Key finding: API rate limit is 1000 req/min]"
        需要细节时再 grep 该文件
结果：上下文里 ~100 token，8000 token 按需可达
```

**动态技能加载**
```
用户问数据库索引 → 静态上下文仅有 "database-optimization: Query tuning and indexing"
Agent 动作：read_file("skills/database-optimization/SKILL.md")
结果：仅在相关时加载完整技能
```

**聊天历史转文件引用**
```
触发：上下文窗口将满，需要摘要
动作：1) 全量历史写入 history/session_001.txt
      2) 生成摘要进新窗口
      3) 附引用 "Full history in history/session_001.txt"
结果：摘要丢的细节可回查历史文件找回
```

## 注意事项

- **卸载阈值**：约定工具输出 >2000 token 才落盘；过小内容直接返回，避免无谓 I/O。
- **返回摘要+引用，不返回全文**：这是省 token 的关键；只把指针留在上下文。
- **动态发现依赖模型自觉**：前沿模型表现好，弱模型可能识别不出「该回读文件了」——此时退回静态加载更稳。
- **自我修改要加护栏**：该模式仍在演进，无校验会让 Agent 累积错误/矛盾指令；写回前做验证。
- **scratch 要清理**：实现定期清理，防止暂存文件无界增长。
- **度量再优化**：测静态/动态上下文比、卸载前后工具输出大小、动态上下文实际被加载的频率，按实测而非假设优化。

## 互见

- related：`context-budget-audit` —— 前者治「运行期工具输出臃肿」，后者治「静态配置开销」，互补。
- related：`context-compression` —— 文件引用是一种无损「压缩」，可与有损摘要配合。
- combines_with：`multi-source-knowledge-synthesis` —— 子 Agent 文件工作区落盘多源材料，再统一汇编综合。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
