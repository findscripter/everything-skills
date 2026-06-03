---
name: exa-semantic-search
title: Exa 语义搜索研究
description: 当需要基于语义/向量做网页检索、找相似内容或按类别（公司/人物/论文等）做结构化调研时使用；做 Exa API 语义搜索并产出带正文摘要的结果集；不适用于精确关键词匹配、站内全文检索或纯本地数据查询；触发词：语义搜索、相似内容、Exa
domain: 平台/integration
triggers: [语义搜索, 相似内容, Exa, 类别检索, 论文检索, embeddings 搜索]
tags: [平台, misc, 搜索, 调研, exa, 语义检索]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Exa API, 环境变量, curl]
requires: []
related: [firecrawl-web-scraper, defuddle-web-extract, hybrid-search-retrieval, apify-ecommerce-scraper]
combines_with: [rag-implementation-workflow, defuddle-web-extract]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 需要基于语义/embeddings 检索网页，而非精确关键词匹配（例如"讲清楚 X 概念的优质文章"）。
- 给定一篇文章/URL，想找语义相似的内容（find similar）。
- 按类别做结构化调研：公司、人物、研究论文、新闻、GitHub 等。
- 希望检索结果直接带回正文/摘要，省去逐条抓取。

不该用（负边界）：
- 精确关键词或布尔匹配、站内全文检索 —— 用传统关键词搜索引擎或站点自带搜索。
- 纯本地/私有数据库查询 —— Exa 检索的是公网内容。
- 把结果当作权威事实直接采纳 —— 仍需对来源做环境相关的核验与人工审阅。
- 缺少 API Key、检索范围或成功标准不明确时，先停下来澄清。

## 步骤

1. 安装技能（全局）：
   ```bash
   npx skills add -g BenedictKing/exa-search
   ```
2. 配置 Exa API Key（务必通过环境变量，不要硬编码）：
   ```bash
   export EXA_API_KEY="your-exa-api-key"
   ```
3. 在 Claude Code 对话中用自然语言发起检索；按需指定类别（company / people / research paper 等）或"找相似"。
4. 拿到结果后，对关键结论回到原始来源做二次核验。

## 指令

- 语义搜索：描述你想要的内容含义，而非堆砌关键词。
- 类别检索：明确说明类别（如"研究论文""公司"），以获得结构化结果。
- 相似内容：提供一个参考 URL，请求"语义相似"的页面。
- 直接调用 API（无封装时的兜底）：
  ```bash
  curl -s https://api.exa.ai/search \
    -H "x-api-key: $EXA_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query":"best explanation of vector embeddings","numResults":5,"contents":{"text":true}}'
  ```

## 示例

- 语义搜索："找几篇把向量 embeddings 讲清楚的高质量文章。"
- 类别检索："按研究论文类别，找近一年关于检索增强生成（RAG）的代表性论文。"
- 相似内容："基于这篇 URL，找语义相似的深度文章。"

更多用法与排障见上游仓库：https://github.com/BenedictKing/exa-search

## 注意事项

- API Key 一律走环境变量（EXA_API_KEY），不写入代码或提交记录。
- 语义检索结果具有概率性，重要结论需回到原始来源核验，不可作为环境相关验证、测试或专家评审的替代。
- 仅在任务确实落在上述语义/相似/类别检索范围内时使用；否则改用关键词搜索或对应专用工具。
- 检索消耗 API 配额，注意 numResults 与调用频率。

## 互见

- context7-auto-research（依赖库/框架文档自动调研）
- tavily-web（通用 Web 搜索）
- firecrawl-scraper（抓取与结构化提取网页）
- codex-review（代码审阅）

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
