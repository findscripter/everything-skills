---
name: llm-model-router
title: 测量驱动的 LLM 模型路由
description: 当需要在不牺牲质量的前提下削减 Claude Code（或同类多档位 LLM）token 花费时使用；做按任务类别把子任务路由到最便宜够用的模型（Haiku/Sonnet/Opus）、逐条记账真实 token 与成本、并用 A/B 实测验证降档；不适用于跨厂商路由（用 LiteLLM/OpenRouter）；触发词：模型路由、降本、token 优化、A/B 实测、成本审计。
domain: 智能/model-ops
triggers: [模型路由, 降本, token 优化, 成本审计, A/B 实测, Haiku/Sonnet/Opus, model routing, cost reduction]
tags: [model-routing, token-optimization, cost-reduction, ab-testing, measurement, claude-code, model-ops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude]
requires: []
related: [claude-api, llm-prompt-caching, context-window-management, mlops-model-productionizer]
combines_with: [langfuse-llm-observability, ai-engineering-toolkit, production-llm-app-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

把子任务自动路由到「能干完活的最便宜模型」，并对每一次路由记账真实 token + 成本，再用 A/B 实测验证降档是否真的不掉质量时使用。核心定位：**不靠拍脑袋估算，用你自己的真实工作负载来验证路由决策**。

**该用**：
- 想在不牺牲产出质量的前提下削减 Claude Code 的 token 花费。
- 怀疑某类任务（文件读、grep、改格式…）用 Haiku/Sonnet 就够，但不敢信，想先实测。
- 审计 Opus 的 token 到底烧在哪（背景：Anthropic Issue #27665 报告 Max 订阅用户 93.8% 的 token 流向 Opus）。
- 按会话记录成本，供财务核算 / chargeback。

**不该用（边界）**：
- **跨厂商路由**：本方案 Anthropic-only，要在 OpenAI/本地模型间路由请用 LiteLLM 或 OpenRouter。
- 一次性短任务（<100 字、无文件上下文）：起子代理的开销 > 省下的钱，直接内联跑。
- 你根本不在意成本、只追求单次最佳质量：直接全程用最强档即可，路由是噪声。
- 子代理 `model:` 参数在部分 Claude Code 构建上有静默失败 bug——若安装期探测到路由不生效，应拒绝配置而非带病上线。

## 步骤 / 指令

1. **定义路由分类法**（按任务类别映射到档位）：

   | 档位 | 模型 | 任务类别 |
   |---|---|---|
   | 机械 (Mechanical) | Haiku 4.5 | 文件读、grep、格式化、重命名、简单编辑、文档查阅 |
   | 受限推理 (Scoped) | Sonnet 4.6 | 单文件重构、有界检索、写测试 |
   | 综合 (Synthesis) | Opus 4.7 | 架构决策、多文件重构、安全审查 |

2. **设置安全闸**（防止降档反而失控或更贵）：
   - Haiku 不再派生子代理。
   - 最大派生深度 = 2。
   - 子代理若需更强模型，**回交父代理**决定，不允许自行升档。
   - 任务 <100 字且无文件上下文 → 内联执行（子代理开销 > 收益）。
   - 子代理上下文 >30k token → 自动升一档。

3. **逐条记账**：每次路由把 `{任务类别, 模型, 输入/输出 token, 成本$}` 追加写入项目本地 `.tokenwise/log.ndjson`（NDJSON 一行一条）。
4. **出报表**：按会话汇总实际花费，并对比「全程 Opus」基线，得出真实节省额。
5. **A/B 实测验证**：对同一任务在多个档位各跑一遍，对产出打质量分，生成 markdown 对比表——**这一步是花钱买确定性**，是把「估算节省」变成「验证节省」的关键。
6. **隐私收口**：零遥测；日志全部本地；任务描述截断到 80 字并剥离文件内容后才落盘。

## 子命令（安装后可用）

- `/tokenwise:install` —— 引导式安装，带 diff 预览、自动备份、`--dry-run`。
- `/tokenwise:report` —— 单会话 token + 成本汇总 vs 全 Opus 基线。
- `/tokenwise:summary [--week|--month|--all]` —— 历史聚合与趋势。
- `/tokenwise:ab "<task>"` —— 同任务多档位 A/B，产出 markdown 对比。
- `/tokenwise:undo` —— 从备份还原 CLAUDE.md / settings.json。

## 示例

在任意 Claude Code 会话中安装：

```
/plugin marketplace add CodeShuX/tokenwise
/plugin install tokenwise@tokenwise
```

随后运行 `/tokenwise:install` 跟随引导完成配置。验证某类任务能否降档：

```
/tokenwise:ab "把 src/ 下所有 import 按字母排序"
```

它会在 Haiku/Sonnet/Opus 各跑一遍、打质量分并算成本——若 Haiku 质量达标，就放心把这类「机械任务」固定路由到 Haiku。

## 注意事项

- **token 数是近似值**：与 Anthropic 实际账单约 ±2% 偏差，用于决策足够，不要当精确财务凭证。
- **A/B 会额外花钱**：一个任务 × N 档位是一次性验证成本，刻意为之，别频繁全量跑。
- **静默失败要拦在安装期**：部分 Claude Code 构建的子代理 `model:` 参数不生效，安装时必须探测，路由坏了就拒配。
- **不要无测降档**：没有日志和 A/B 数据就改路由 = 盲调；先记账、再实测、后固化。
- **隐私默认本地**：任务描述落盘前截断 80 字并去除文件内容，源中不存在任何分析上报端点。

## 互见

- requires：`first-principles-thinking` —— 决定某类任务能否降档前，先用它把「这个任务真正需要的能力」拆清楚，避免按直觉乱归类。
- related：`prompt-template-designer` —— 路由到弱档位时，配套收紧提示词模板往往能补回质量、把降档做实。

---
采编自 sickn33/antigravity-awesome-skills（源 CodeShuX/tokenwise，MIT）。
