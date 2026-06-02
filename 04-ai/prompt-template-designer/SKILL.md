---
name: prompt-template-designer
title: 提示词模板设计
description: 当需要为某任务设计稳定可复用的提示词模板（含角色/约束/示例/输出格式）并迭代优化时使用；触发词：写提示词、prompt 模板、提示工程、few-shot、输出格式。
domain: 智能/prompting
tags: [prompting, llm, templates]
level: 进阶
status: stable
version: 0.1.0
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: [first-principles-thinking]
related: [llm-prompt-optimizer, llm-prompt-caching, ai-engineering-toolkit]
combines_with: [claude-api, llm-judge-evaluation, vercel-ai-sdk]
license: CC-BY-SA-4.0
---
## 何时使用

需要把一段会反复执行的提示交付固化为**稳定可复用的模板**（含角色、约束、示例、输出格式），并以可对比方式迭代优化时使用。

**该用**：同一任务要跑多次/多输入、要求输出结构一致、需要团队或多 Agent 复用、想用 few-shot 稳定行为、需要可回归地改进效果。

**不该用**：一次性临时提问（直接写就好，别建模板）；任务本身没想清楚（先用 `first-principles-thinking` 拆解目标再来）；问题应靠检索/工具/代码而非提示解决（如取实时数据、精确计算）；只是改 1～2 个词的微调。

## 步骤 / 指令

```
1. 定义契约
   - 任务目标（一句话）、输入变量集 {var1, var2...}、输出 schema（字段+类型+约束）
   - 成功判据：3~5 条可判定的验收点（用于后续评测）

2. 搭骨架（按固定段顺序，缺省段省略而非留空）
   [ROLE]    角色+能力边界，越窄越好
   [CONTEXT] 背景与已知事实，注入处用 {var} 占位
   [TASK]    明确动作指令，一次只让它做一件事
   [RULES]   约束清单：必须做 / 禁止做 / 边界情形如何处理
   [FORMAT]  输出格式：JSON schema / 模板串 / 字段顺序，给出"仅输出X，不要解释"
   [EXAMPLES] few-shot：2~4 个覆盖正常+边界+易错的输入→输出对
   [INPUT]   {待处理输入} 放最后

3. 占位与防注入
   - 所有可变内容用显式占位符 {name}，并用分隔符（如 <input>...</input>）包裹用户数据
   - 指令与数据分离：用户输入不得改写 RULES/FORMAT

4. 选 few-shot 示例
   - 覆盖：典型例 + 至少 1 个边界例 + 1 个易错/反例（标注期望处理）
   - 示例输出严格符合 [FORMAT]；示例数从少到多，够稳即止

5. 评测与迭代（每次只改一个变量）
   - 准备 5~10 条评测输入（含已知难例）
   - 跑模板 → 对照成功判据打分 → 定位失败模式
   - 按优先级修补：先收紧 RULES，再补/换 EXAMPLES，最后调 ROLE/FORMAT
   - 每次改动记 version 与差异，保留可回滚版本

6. 冻结
   - 通过判据后固化为 vN，记录：变量清单、输出 schema、已知失败模式与规避
```

**修补对照（失败模式 → 动作）**：
- 格式跑偏 → 强化 [FORMAT]，加"仅输出 JSON，无前后缀"，补一个格式示例
- 漏边界/答错难例 → 加对应 few-shot 反例并标注期望
- 越权发挥/废话 → 收窄 [ROLE]，在 [RULES] 加"未知则输出 null，不臆测"
- 受输入劫持 → 强化指令/数据分离与分隔符
- 不稳定/随机 → 降随机性、增确定性示例、把隐含规则显式化

## 示例

最小可用模板（情感分类，输出 JSON）：

```
[ROLE] 你是中文短文本情感分类器，只做分类，不解释、不续写。
[TASK] 判断 <input> 的情感倾向。
[RULES]
- 取值仅限：positive | negative | neutral
- 含讽刺时按真实意图判定
- 信息不足或非情感文本 → neutral
- 仅输出 JSON，无任何额外文字
[FORMAT] {"label": "<positive|negative|neutral>", "confidence": <0~1 两位小数>}
[EXAMPLES]
输入：这服务太"贴心"了，等了俩小时 → {"label":"negative","confidence":0.88}
输入：包装完好，按时送达 → {"label":"positive","confidence":0.80}
输入：明天会下雨 → {"label":"neutral","confidence":0.90}
[INPUT]
<input>{user_text}</input>
```

调用时仅替换 `{user_text}`；评测时换不同 `<input>` 跑 5~10 条，按"取值合法/难例正确/仅输出 JSON"打分后迭代。

## 注意事项

- **单一职责**：一个模板只解决一类任务；多任务请拆成多个模板串联，别堆叠。
- **指令与数据必须分离**：用户内容一律放占位符并用分隔符包裹，RULES/FORMAT 不可被输入改写，防提示注入。
- **示例即契约**：few-shot 输出必须与 [FORMAT] 完全一致，错示例会直接污染产出。
- **一次只改一个变量**：否则无法归因效果变化；每版留 version 可回滚。
- **不要无脑堆示例/堆约束**：token 有成本，够稳即止；冗余规则会相互冲突。
- **跨模型不保证可移植**：换模型需重跑评测，输出格式遵从程度差异大。
- **留逃生口**：为"信息不足/无法判定"显式定义输出（如 null / neutral），避免模型臆造。

## 互见

- requires：`first-principles-thinking` —— 建模板前先用它把任务目标、输入输出契约与成功判据拆清楚，否则模板会固化错误的问题定义。
