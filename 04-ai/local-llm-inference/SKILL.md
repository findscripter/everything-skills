---
name: local-llm-inference
title: 本地 LLM 推理部署
description: 当需要在本地硬件上跑开源大模型时使用；按显存/内存约束选模型与量化格式、给出 Ollama/llama.cpp/vLLM 的可执行命令与正确 Chat 模板，产出离线推理部署方案；不适用于云端 API 调用、非 LLM 机器学习或从零训练；触发词：本地LLM、Ollama、量化、GGUF、显存、vLLM
domain: 智能/model-ops
triggers: [本地LLM, Ollama, llama.cpp, vLLM, LM Studio, 量化, GGUF, EXL2, AWQ, GPTQ, 显存, VRAM, num_ctx, Modelfile, Chat模板, ChatML, Llama3, DeepSeek, Mistral, Qwen, 离线推理, OOM, 本地部署大模型]
tags: [本地llm, 推理引擎, 量化, ollama, vllm, llama.cpp, 显存优化, 离线部署, 提示词模板, 智能]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Ollama, llama.cpp, vLLM, LM Studio, GPT4All]
requires: []
related: [huggingface-hub-cli, transformers-js, huggingface-model-trainer, llm-model-router]
combines_with: [embedding-model-strategies, production-llm-app-builder, mlops-model-productionizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 规划本地推理硬件需求（显存 VRAM、内存 RAM），估算某模型能否跑得动。
- 在量化格式间做选型（GGUF、EXL2、AWQ、GPTQ），权衡体积/速度/质量。
- 配置本地推理引擎：Ollama、llama.cpp、vLLM、LM Studio/GPT4All。
- 排查 Chat 模板问题（ChatML、Llama-3 Inst、Zephyr、Alpaca），输出乱码多半是模板错配。
- 设计隐私优先、可离线运行的 AI 应用。
- 处理 OOM（显存溢出）报错，调小上下文或换更激进的量化。

不该用（负边界）：
- 直接对接云端专有 API（OpenAI、Anthropic 等），那是在线服务而非本地推理。
- 非 LLM 的机器学习任务（计算机视觉、传统 NLP）。
- 从零训练模型；本技能聚焦推理与微调后的部署，不覆盖预训练。

## 步骤

1. 先确认硬件：显存 VRAM、内存 RAM、CPU/GPU 架构（含 Mac 统一内存）。没有这些信息先问清，不要凭空推荐。
2. 按约束选模型规模 + 量化格式，让模型刚好装进显存且留出 KV Cache 余量。
3. 给出所选引擎（Ollama / llama.cpp / vLLM）的精确命令、Modelfile 或脚本。
4. 配齐该模型要求的 system prompt 与 Chat 模板，确保对话格式正确。
5. 给 1-2 条提速建议：`num_ctx`、GPU 层数 `-ngl`、flash attention，并强调离线与隐私优势。

## 指令

显存估算（核心公式）：

```
基础模型体积 = 参数量 × 每权重比特数 ÷ 8
总显存需求 ≈ 基础模型体积 + 上下文开销（KV Cache）
```

据此为 8GB / 12GB / 16GB / 24GB / Mac 统一内存推荐合适的 `num_ctx`，预留 KV Cache 防 OOM。

量化选型要点：
- GGUF（llama.cpp）：按显存在 k-quants 间取舍，常用 `Q4_K_M`（性价比高）vs `Q5_K_M`（质量更好、更占显存）。
- EXL2（ExLlamaV2）：消费级 GPU 上速度优先，按 bpw 选档（如 `4.0bpw`、`6.0bpw`）映射到模型体积。
- AWQ / GPTQ：在 vLLM 中做高吞吐部署，显存占用与 GGUF 有差异，按吞吐需求选。

引擎要点：
- Ollama：编写 `Modelfile` 定制 system prompt 与参数（`temperature`、`num_ctx`），CLI 管理本地模型，易上手首选。
- llama.cpp：CPU/GPU 高性能推理，掌握 `-ngl`（GPU 层数）、`-c`（上下文）、`-m`（模型路径），按后端（CUDA/Metal/Vulkan）编译。
- vLLM：规模化服务，PagedAttention、连续批处理，搭建 OpenAI 兼容 API，支持多卡。
- LM Studio / GPT4All：图形界面快速离线部署并提供 API。

模型与模板：紧跟开源前沿（Llama 3、DeepSeek Coder/V2、Mistral/Mixtral、Qwen2、Phi-3）；务必匹配各自 Chat 模板（ChatML、Llama-3 Inst、Zephyr、Alpaca）。

## 示例

- 「16GB Mac M2 上怎么用 Python 跑 Llama 3 8B？」
  -> 按 Mac 统一内存估算，推荐 Ollama + `ollama run llama3:8b`，再给 `ollama` Python 客户端调用代码。

- 「24GB RTX 4090 跑 Mixtral 8x7B 报 OOM。」
  -> Mixtral 原生约 45GB，远超 24GB。改用 `Q4_K_M` 的 GGUF，或 EXL2 `4.0bpw`，并给出下载与运行命令。

- 「想用开源模型对外提供 OpenAI 式 API。」
  -> 给出 vLLM 或 Ollama 的逐步搭建，启用 OpenAI 兼容层。

- 「给 Qwen2 写一个 ChatML 包装。」
  -> 给出精确格式：`<|im_start|>system\n...<|im_end|>\n<|im_start|>user\n...<|im_end|>`。

## 注意事项

- 隐私与离线优先：本地推理的核心价值是数据不出本机，非必要不引导用户转向闭源在线 API（除非用户明确要混合方案）。
- 先问硬件再推荐，避免给出装不下的模型。
- 解释清楚 VRAM 数学与量化取舍的「为什么」，不要只甩结论。
- 常见坑：重复堆叠 system prompt；Chat 模板错配会直接导致输出乱码。
- 输出不能替代环境实测：在目标机器上跑通并验证速度与显存占用后再交付。
- 缺少硬件、权限或成功标准时，停下来问清楚再动手。

## 互见

- 量化与微调后部署可延伸到 LoRA / QLoRA 基础知识（仅服务于部署类问题，本技能不深入训练）。
- 需要云端 API 编排或托管 Agent 时，转用对应的云服务技能，本技能不覆盖。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
