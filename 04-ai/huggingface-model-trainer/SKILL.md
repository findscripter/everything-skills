---
name: huggingface-model-trainer
title: TRL 模型微调训练（Hugging Face Jobs）
description: 当需在 Hugging Face Jobs 云端 GPU 用 TRL 微调/训练语言模型（SFT/DPO/GRPO、LoRA、GGUF 导出）时使用；做 hf_jobs() 内联脚本提交、推送 Hub 并出监控信息；不适用于本地无云端 Jobs（付费计划）的训练或纯推理部署。触发词：TRL、微调、SFT/DPO/GRPO、hf_jobs、GGUF
domain: 智能/model-ops
triggers: [TRL 微调, SFT/DPO/GRPO 训练, Hugging Face Jobs, hf_jobs 提交训练, LoRA 微调大模型, 导出 GGUF, 云端 GPU 训练语言模型, trl-jobs]
tags: [机器学习, 模型训练, 微调, TRL, Hugging Face, LoRA, GGUF, LLM]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [hf_jobs, hf_whoami, uv, hf CLI, trl-jobs, trackio]
requires: []
related: [huggingface-hub-cli, mlops-model-productionizer, local-llm-inference, scikit-learn-ml]
combines_with: [embedding-model-strategies, computer-vision-expert, transformers-js]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

需要在 **Hugging Face Jobs** 的托管云端 GPU 上用 **TRL（Transformer Reinforcement Learning）** 微调/训练语言模型时使用，无需本地 GPU，结果自动保存到 Hugging Face Hub。典型场景：

- 无本地基础设施，要在云端 GPU 上微调语言模型
- 用 TRL 方法训练：**SFT**（监督微调）/ **DPO**（偏好对齐）/ **GRPO**（在线 RL）/ Reward Modeling
- 训练 >7B 大模型（配 LoRA/PEFT）
- 训练后导出 **GGUF**，供 Ollama / LM Studio / llama.cpp 本地推理
- 显存吃紧、追求速度或训 VLM 时，改用 **Unsloth**（约省 60% VRAM、约 2 倍速）

**不该用边界：**

- 没有 HF Pro/Team/Enterprise 付费计划——Jobs 需要付费计划，无法提交
- 想纯本地训练（无云端 Jobs）或仅做模型推理/部署——本条目聚焦云端训练
- 任务与上述范围不明确匹配时先停下确认，不要替代环境内的真实验证与专家评审

## 步骤

1. **核对前置条件**：`hf_whoami()` 确认已登录；账号为付费计划；HF_TOKEN 具备写权限。
2. **校验数据集格式**（未知/自定义数据集，尤其 DPO 必做）：用 dataset_inspector 在 CPU 上跑（约 $0.01、<1 分钟），看 `✓ READY` / `✗ NEEDS MAPPING` / `✗ INCOMPATIBLE`，按需套用其给出的 MAPPING CODE。
3. **写训练脚本**：PEP 723 内联依赖，含 LoRA、推 Hub、Trackio 监控。
4. **立即提交**：调用 `hf_jobs("uv", {...})`，`script` 传**内联 Python 字符串**（或公开/私有仓库 URL），**不要**存本地文件（除非用户明确要求）。务必带 `secrets={"HF_TOKEN": "$HF_TOKEN"}`。
5. **设足超时**：默认 30 分钟**太短**，最少 1–2 小时，并加 20–30% 缓冲。
6. **回报信息**：返回 Job ID、监控 URL、预计耗时/成本、Trackio 看板；**异步运行勿轮询**，等用户主动要状态。
7. **（可选）导出 GGUF**：训练后再起一个 job 转换、量化。

## 指令

**关键约束（务必遵守）：**

1. **始终用 `hf_jobs()` MCP 工具**提交，`script` 直接传 Python 代码字符串；不要用 bash `trl-jobs`（Claude Code 场景下）。要求"训练/微调"即**创建脚本并立刻提交**。
2. **始终内置 Trackio**：依赖加 `trackio`，trainer 配 `report_to="trackio"` 与有意义的 `run_name`、`project`。
3. **提交后给细节**：Job ID、监控 URL、预计时间，并说明可稍后查状态。
4. **本地路径不可用**：Jobs 跑在隔离 Docker，`script` 只接受内联代码或可访问 URL（Hub/GitHub/Gist）。本地脚本须先 `hf upload` 到 Hub 再用 `resolve/main/...` URL。

**序列长度**：TRL 配置类用 `max_length`（**不是** `max_seq_length`，后者会 TypeError）。默认 `max_length=1024`（右截断）；长上下文设 2048，省显存设 512，视觉模型设 `None`。

**硬件选型：**

| 模型规模 | 推荐硬件 | 约成本/时 |
|---|---|---|
| <1B | `t4-small` | ~$0.75（仅 demo，关 eval） |
| 1-3B | `t4-medium`/`l4x1` | ~$1.5-2.5 |
| 3-7B | `a10g-small/large` | ~$3.5-5 |
| 7-13B | `a10g-large`/`a100-large` | ~$5-10（用 LoRA） |
| 13B+ | `a100-large`/`a10g-largex2` | ~$10-20（用 LoRA） |

>7B 一律用 LoRA/PEFT；多卡由 TRL/Accelerate 自动处理；测试先用小硬件。成本/时间可用 `estimate_cost.py` 估算。

## 示例

**方式一（推荐）：UV 内联脚本 + LoRA + Trackio**

```python
hf_jobs("uv", {
    "script": """
# /// script
# dependencies = ["trl>=0.12.0", "peft>=0.7.0", "trackio"]
# ///
from datasets import load_dataset
from peft import LoraConfig
from trl import SFTTrainer, SFTConfig
import trackio

dataset = load_dataset("trl-lib/Capybara", split="train")
split = dataset.train_test_split(test_size=0.1, seed=42)

trainer = SFTTrainer(
    model="Qwen/Qwen2.5-0.5B",
    train_dataset=split["train"],
    eval_dataset=split["test"],
    peft_config=LoraConfig(r=16, lora_alpha=32),
    args=SFTConfig(
        output_dir="my-model",
        push_to_hub=True,
        hub_model_id="username/my-model",   # 必填
        num_train_epochs=3,
        eval_strategy="steps", eval_steps=50,
        report_to="trackio",
        project="my_project", run_name="qwen-sft-capybara",
    ),
)
trainer.train()
trainer.push_to_hub()
""",
    "flavor": "a10g-large",
    "timeout": "2h",
    "secrets": {"HF_TOKEN": "$HF_TOKEN"}
})
```

**方式二：TRL 官方维护脚本（免写代码）**

```python
hf_jobs("uv", {
    "script": "https://github.com/huggingface/trl/blob/main/trl/scripts/sft.py",
    "script_args": ["--model_name_or_path", "Qwen/Qwen2.5-0.5B",
        "--dataset_name", "trl-lib/Capybara", "--output_dir", "my-model",
        "--push_to_hub", "--hub_model_id", "username/my-model"],
    "flavor": "a10g-large", "timeout": "2h",
    "secrets": {"HF_TOKEN": "$HF_TOKEN"}
})
```

**方式三：HF Jobs CLI（MCP 不可用时）。注意顺序是 `hf jobs uv run`，所有 flag 在 URL 之前，且用 `--secrets`（复数）：**

```bash
hf jobs uv run --flavor a10g-large --timeout 2h --secrets HF_TOKEN \
  "https://huggingface.co/user/repo/resolve/main/train.py"
hf jobs ps                 # 列出任务
hf jobs logs <job-id>      # 看日志
```

**查状态（MCP）：** `hf_jobs("ps")` / `hf_jobs("inspect", {"job_id": "..."})` / `hf_jobs("logs", {"job_id": "..."})`

## 注意事项

- **环境是临时的——必须推 Hub**：job 结束后所有文件删除。配置须 `push_to_hub=True` + `hub_model_id`，job 须带 `secrets={"HF_TOKEN": "$HF_TOKEN"}`，否则**训练成果全部丢失**。
- **超时太短会丢进度**：默认 30 分钟不够。开发 1-2h，生产 3-7B 模型 4-6h，并留缓冲；可配 `save_strategy="steps"`、`hub_strategy="every_save"` 增量保存检查点。
- **OOM 处理顺序**：①降 `per_device_train_batch_size=1`、提 `gradient_accumulation_steps=8`（有效 batch = 两者相乘，尽量接近 128）②开 `gradient_checkpointing=True` ③升级硬件 / 用 LoRA。
- **DPO 格式最易错**：约 90% 数据集列名需映射成 `prompt`/`chosen`/`rejected`，务必先用 inspector 校验。
- **缺依赖**：在 PEP 723 头追加包，如 `# dependencies = ["trl>=0.12.0", "peft>=0.7.0", "trackio", "缺的包"]`。
- **异步纪律**：提交即返回，日志可能延迟 30-60 秒；不要自动反复轮询，等用户要状态再查。

## 互见

- 数据集校验：[dataset_inspector.py](https://huggingface.co/datasets/mcp-tools/skills/raw/main/dataset_inspector.py)
- TRL 文档：https://huggingface.co/docs/trl ｜ HF Jobs 文档：https://huggingface.co/docs/huggingface_hub/guides/jobs
- trl-jobs 包（终端一行命令训练）：https://github.com/huggingface/trl-jobs
- 源技能内参考：`references/unsloth.md`（VLM/省显存）、`references/gguf_conversion.md`、`references/trackio_guide.md`、`references/hardware_guide.md`、`references/training_methods.md`
- 文档检索：`hf_doc_search("...", product="trl")`、`hf_doc_fetch("https://huggingface.co/docs/trl/sft_trainer")`

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
