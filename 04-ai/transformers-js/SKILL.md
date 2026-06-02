---
name: transformers-js
title: Transformers.js 浏览器端模型推理
description: 当需要在浏览器或 Node.js 端、无后端 ML 服务直接运行 Hugging Face 模型（文本/图像/音频/多模态/向量）时使用；做用 pipeline API 加载模型并产出推理结果，含设备(webgpu)、量化(dtype)、缓存与显存释放；不适用于需 Python 后端、训练/微调或超大模型(>数 GB)的生产重负载。触发词：transformers.js、浏览器端推理、pipeline、WebGPU、ONNX、嵌入向量
domain: 智能/model-ops
triggers: [transformers.js, @huggingface/transformers, 浏览器端模型推理, pipeline API, WebGPU 推理, ONNX 模型, 客户端 ML, feature-extraction 嵌入, 无后端跑模型, Hugging Face JS]
tags: [transformers-js, 智能/模型运维, 浏览器推理, WebGPU, ONNX, 量化, 嵌入向量, JavaScript, Hugging Face, 客户端AI]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [npm, node, @huggingface/transformers]
requires: []
related: [local-llm-inference, huggingface-hub-cli, embedding-model-strategies, computer-vision-expert]
combines_with: [vercel-ai-sdk, huggingface-model-trainer, rag-pipeline-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

在 JS/TS（Node.js 18+ 或现代浏览器，支持 ES Modules）里直接跑 Hugging Face 模型、不想架 Python 后端时使用。典型场景：

- 文本：分类/情感、NER、问答、生成、翻译、摘要、零样本分类、句向量/嵌入。
- 视觉：图像分类、目标检测、分割、深度估计、零样本图像分类。
- 音频：语音识别(ASR)、音频分类、文本转语音(TTS)。
- 多模态：图生文(captioning)、文档问答、零样本目标检测。
- 完全在浏览器端推理（无服务端），或在 Node 端做轻量本地推理。

**不该用（负边界）：**
- 需要训练/微调模型 —— 本库主要做推理。
- 单机无法承载的超大模型或高并发生产重负载 —— 改用 Python + GPU 服务端（transformers / vLLM / TGI）。
- 模型仓库无 ONNX 权重（无 `onnx/` 目录）—— Transformers.js 跑不起来。
- 要求逐字精度且不可降级 —— 量化（q8/q4）会损失精度。

## 步骤

1. 安装：Node 端 `npm install @huggingface/transformers`；浏览器用 CDN `import` 即可（见示例）。
2. 选模型：在 Hub 按 `library=transformers.js` 过滤，再加 `pipeline_tag=<任务>` 与 `sort=trending/downloads`。优先选 `Xenova`、`onnx-community` 维护的模型；确认有 ONNX 权重。
3. 建 pipeline：`await pipeline(task, modelId, options)`，按需传 `device`、`dtype`、`progress_callback`。
4. 推理：调用 `await pipe(input, genOptions)`；可传数组做批处理。
5. **释放显存：用完务必 `await pipe.dispose()`**，否则内存泄漏（单模型占 100MB ~ 数 GB）。
6. 生产前固定版本：`{ revision: '<git commit>' }`；用 try/catch 包裹并配加载进度 UI。

## 指令

- 安装：`npm install @huggingface/transformers`
- 设备：`{ device: 'webgpu' }`（实验性，需 Chrome/Edge 113+）；默认 WASM 走 CPU。
- 量化 `dtype`：`'fp32'`（最准最大）→ `'fp16'` → `'q8'` → `'q4'`（最小，精度损失明显）。浏览器优先 `q8`/`q4`。
- 全局 `env` 控制缓存与加载：`env.allowRemoteModels` / `env.allowLocalModels` / `env.localModelPath` / `env.useFSCache`(Node) / `env.useBrowserCache`(浏览器) / `env.cacheDir`。
- 常用任务 ID：`text-classification`(=`sentiment-analysis`)、`token-classification`(=`ner`)、`question-answering`、`summarization`、`translation`、`text-generation`、`zero-shot-classification`、`image-classification`、`object-detection`、`image-segmentation`、`automatic-speech-recognition`、`text-to-speech`、`image-to-text`、`document-question-answering`、`feature-extraction`。

## 示例

基础 pipeline（含释放）：

```javascript
import { pipeline } from '@huggingface/transformers';

const pipe = await pipeline('sentiment-analysis');
const result = await pipe('I love transformers!');
// [{ label: 'POSITIVE', score: 0.9998 }]
await pipe.dispose(); // 必做：释放显存
```

指定模型 + 量化 + WebGPU（文本生成）：

```javascript
const generator = await pipeline(
  'text-generation',
  'onnx-community/gemma-3-270m-it-ONNX',
  { dtype: 'q4', device: 'webgpu' }
);
const out = await generator('Explain quantum computing simply.', {
  max_new_tokens: 100, temperature: 0.7
});
await generator.dispose();
```

句向量/嵌入（mean pooling + 归一化）：

```javascript
const extractor = await pipeline('feature-extraction',
  'onnx-community/all-MiniLM-L6-v2-ONNX');
const emb = await extractor('Text to embed', { pooling: 'mean', normalize: true });
```

浏览器 CDN：

```html
<script type="module">
  import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers';
</script>
```

下载进度回调：

```javascript
const clf = await pipeline('sentiment-analysis', null, {
  progress_callback: (info) => {
    if (info.status === 'progress')
      console.log(`${info.file}: ${info.progress.toFixed(1)}%`);
  }
});
```

错误处理：

```javascript
try {
  const pipe = await pipeline('sentiment-analysis', 'model-id');
  await pipe('text');
} catch (e) {
  if (e.message.includes('fetch')) console.error('下载失败，检查网络');
  else if (e.message.includes('ONNX')) console.error('执行失败，检查模型兼容性');
  else console.error('未知错误', e);
}
```

## 注意事项

- **显存管理是头号坑**：用完、切模型前、组件卸载、应用退出都要 `dispose()`；服务端在 SIGTERM/SIGINT 优雅关闭时释放。
- 复用而非重建：pipeline 建一次多次用，别在循环里反复 `pipeline()`。
- 模型可从几 MB 到数 GB，要给加载进度指示；浏览器端注意内存上限。
- 量化是空间/速度换精度，对精度敏感任务先评测再上 q4。
- WebGPU 实验性：`fp32` 失败可降 `fp16`，再不行回退 WASM。
- 首次推理前用小输入本地基准测速度与内存；生产用 `revision` 固定版本。
- 联网用于从 Hub 拉模型；纯本地推理可设 `env.allowRemoteModels = false` + 本地模型目录。

## 互见

- 官方文档：https://huggingface.co/docs/transformers.js ；Pipelines API：https://huggingface.co/docs/transformers.js/api/pipelines
- 模型库（已过滤）：https://huggingface.co/models?library=transformers.js&sort=trending
- 源仓库与示例：https://github.com/huggingface/transformers.js

---

采编自 sickn33/antigravity-awesome-skills（MIT）；上游技能源自 huggingface/transformers.js（Apache-2.0）。
