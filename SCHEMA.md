# 条目规范 · SCHEMA

> 每条技能 = 一个文件夹 + 一个 `SKILL.md`。`SKILL.md` 由 **YAML frontmatter** + **正文** 组成。
> frontmatter 是 AI Agent 发现与「互见」图谱的唯一数据源，`scripts/build-index.mjs` 据此生成所有索引。

## frontmatter 字段

| 字段 | 必填 | 类型 | 说明 |
|---|---|---|---|
| `name` | ✅ | string | 技能唯一 ID，**与文件夹同名**，ASCII kebab-case（如 `pdf-form-filler`） |
| `title` | ✅ | string | 中文标题（如 `PDF 表单填写`） |
| `description` | ✅ | string（单行） | **最关键字段**，Agent 靠它匹配。用结构化模板：`当〈场景〉时使用；做〈动作+产物〉；不适用于〈负边界〉；触发词：a、b、c`。单行 |
| `triggers` |  | string[] | （推荐）显式触发词；缺省时生成器从 description 的「触发词：」自动解析入 search.json |
| `domain` | ✅ | string | 浏览坐标，`卷中文/类`，如 `文书/office`（**卷中文须与所在目录一致，类名使用 taxonomy.json 中的 ASCII slug，生成器强校验**） |
| `tags` |  | string[] | （可选）人工检索与两段式发现的粗筛条件；最终仍按 description 匹配任务 |
| `level` |  | enum | （可选）`入门` \| `进阶` \| `精通`；主要给人看，对发现无用 |
| `status` | ✅ | enum | `draft` \| `stable` \| `deprecated` |
| `version` |  | string | （可选）语义化版本；当前无工具消费，属预留 |
| `agents` | ✅ | string[] | 兼容的助手（受控词表）：`claude-code` `codex` `cursor` `gemini-cli` `copilot` `windsurf` `aider` `cline` |
| `tools` |  | string[] | 依赖的工具/库，如 `[python, pypdf]`（无则省略或空数组） |
| `requires` |  | string[] | **依赖边**：前置技能的 `name`，学/用本技能前应先具备 |
| `related` |  | string[] | **互见**：相关但不互相依赖的技能 `name` |
| `combines_with` |  | string[] | **组合**：常与之搭配解决更大问题的技能 `name` |
| `supersedes` |  | string[] | 本技能取代的旧技能 `name`（配合 `deprecated` 使用） |
| `deprecate_reason` |  | string | 弃用原因；无继任者的历史档案必须明确填写，保留正文但不作为活动技能推荐 |
| `license` |  | string | 原创条目默认 `CC-BY-4.0`（署名许可）；采编条目保留各自上游许可，见 LICENSE / NOTICE |
| `schema_version` |  | string | （可选，约定 `1`）字段演进时的迁移依据，见 [ROADMAP.md](ROADMAP.md) |
| `source` |  | string | 采编来源（repo slug/URL）。采自第三方时必填，自动汇入 `INDEX/sources.md` |
| `source_license` |  | string | 源技能原始许可（Apache-2.0/MIT/CC-BY…）。**专有 / source-available / 无许可 → 禁止采编其内容，生成器报 error** |

## 资源与不可变来源清单

`data/skill-resources.json` 记录补包技能的资源路径、SHA-256、固定来源 URL 和技能目录内的许可文件。统一构建先检查资源存在、真实路径边界和字节一致性，不执行第三方 helper。通用库、服务与输入仍是显式外部依赖，不由“随包”一词隐含提供。

`data/skill-provenance.json` 覆盖所有正式技能的路径、当前本地 SHA-256、原创/采编类型和来源声明。`reference_snapshots` 仅是可重复比较的固定参考文件，包含 commit、路径、Blob、SHA-256 及许可证据；不等于已证明的原采编版本或授权认证。

历史缺少原采编提交的条目保持 `origin_revision_status=unrecorded`、`origin_commit_sha=null`。不能用今天的 HEAD 或本地 vendor HEAD 填成原版本。正文修改后显式运行 `npm run provenance:refresh`；来源或源许可声明改变会清除旧参考并标记待复核。损坏或缺失的清单不能静默重建来掩盖问题。

`npm run check:assets` 与 `npm run check:provenance` 均只读；`build-all` 在写生成物之前运行这两项，失败即停止。新增资源须先核实文件级许可，禁止按集合根许可覆盖子目录专有条款。

## 质量筛选元数据（`data/quality-overrides.json`）

质量元数据与技能正文分离，供 `INDEX/quality.json` 和 `INDEX/search.json` 的筛选器使用。覆盖文件的最小结构为：

```json
{
  "schema_version": 1,
  "skills": {
    "skill-name": {
      "review_status": "reviewed",
      "last_reviewed": "2026-10-18",
      "source_freshness": "fresh",
      "license_confidence": "verified",
      "capabilities": ["read-only"],
      "security_risk": "review",
      "dependencies": {"runtime": ["python"]}
    }
  }
}
```

所有字段均可省略；生成器会为缺少证据的维度使用保守默认值。`requires` 和 `tools` 始终从技能 frontmatter 生成，不能通过覆盖文件改写。受控值如下：

- `review_status`: `unreviewed` | `reviewed` | `needs-review` | `archived`
- `source_type`: `native` | `curated` | `external-reference`
- `source_freshness`: `fresh` | `aging` | `stale` | `unknown`
- `license_confidence`: `verified` | `declared` | `inferred` | `unknown`
- `maturity`: `experimental` | `stable` | `deprecated`
- `security_risk`: `low` | `review` | `high` | `unknown`

空覆盖文件不代表条目已通过安全审查：默认 `review_status=unreviewed`、`source_freshness=unknown`、`security_risk=unknown`。`license_confidence=declared` 仅表示条目声明了许可，不等于法律核验；`security_risk=low` 只能由人工审查证据显式填写。

生成器输出：

- `INDEX/quality.json`：按技能列出的完整质量摘要；
- `INDEX/search.json`：每条召回记录内嵌相同的 `quality` 摘要，便于一次检索后筛选。

质量覆盖只允许引用现有技能名称，未知名称或非法枚举会使生成校验失败。

### 关于「互见」三件套（类书精髓 → 图的边）

- `requires` → 有向边「依赖」：A requires B 表示用 A 前需要 B（驱动**前置学习路径**）。
- `related` → 无向边「互见」：横向相关，供发散查找。
- `combines_with` → 无向边「组合」：协同使用（驱动**组合推荐**）。

生成器会校验：互见指向的 `name` 必须真实存在，否则报「悬空互见」错误。

## 发现机制（两段式）

Agent 发现技能靠 `description` 语义匹配，不浏览目录。规模化后单字段匹配会漏召/误召，故规范要求：

1. **粗筛**：先用 `domain` / `tags` / `triggers` 缩小候选集（消费自动生成的 `INDEX/search.json`）。
2. **精排**：在候选内用 `description` 精确匹配。

因此 `description` 必须含**负边界**（不适用于…）降误召、含**触发词**提召回。`INDEX/search.json` 是这套召回的机读底座，由生成器维护。完整的发现-治理路线见 [ROADMAP.md](ROADMAP.md)。

## 正文结构（机读友好，单一职责）

正文是给 Agent 执行用的，**精简、可操作**，不要写源流/文献那类百科叙事。固定小节：

```markdown
# {中文标题}

## 何时使用
一句话判据 + 不该用的边界。

## 步骤 / 指令
给 Agent 的可执行步骤或决策流程。能写成清单/伪代码就别写散文。

## 示例
最小可用示例（命令、提示词、代码片段）。

## 注意事项
易错点、限制、安全/合规提醒。

## 互见
- requires：`xxx` —— 为何前置
- related：`yyy`
- combines_with：`zzz` —— 组合能解决什么
```

## 写作硬约束

1. **单一职责**：一条技能只解决一件事。太大就拆，用 `combines_with` 串起来。
2. **`description` 含触发词**：想清楚用户会怎么说，把那些词放进去（决定 Agent 能否命中）。
3. **`description` 单行**：不要用多行 `>`/`|`，保证零依赖解析器稳定。
4. **token 精简**：正文为执行服务，不堆背景知识。
5. **跑校验**：按目标分支选择统一入口 `node scripts/build-all.mjs --lang=en`（main）或 `node scripts/build-all.mjs --lang=zh`（zh），确保无必填缺失、无悬空互见、无重名，并提交生成物。
