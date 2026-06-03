---
name: seo-image-generator
title: SEO 图像生成：OG 卡片、信息图与产品视觉
description: 当为 SEO/内容发布生成 OG 卡片、博客头图、产品图、信息图、Schema 配图等成品视觉时使用；做按用例映射宽高比/分辨率/领域模式并经创意总监管线产出图片+SEO 清单（alt/命名/WebP/ImageObject/og:image）；不适用于未安装图像生成扩展、纯图像分析审计或非 SEO 场景；触发词：OG 图、信息图、产品图、hero 图、社交预览、SEO 配图。
domain: 商业/seo
triggers: [OG 图, 信息图, 产品图, hero 图, 社交预览, SEO 配图, schema 配图, 图像生成]
tags: [SEO, 图像生成, OG, 信息图, 内容发布]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [banana-mcp, gemini, imagemagick, python3]
requires: []
related: [seo-meta-tags-optimizer, unsplash-photo-integration, social-share-card-hardener, seo-content-writer]
combines_with: [seo-meta-tags-optimizer, seo-content-writer, social-share-card-hardener]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 当 SEO / 内容发布流程中需要**生成**成品视觉时：OG/社交预览卡、博客头图、产品图、信息图、Schema 配图、社交方图、Pinterest 长图、favicon 等。
- 当上游审计（如 seo-images）已识别出缺失或低质图片，需据此驱动生成时。

**不该用：**
- 图像生成扩展（banana MCP）未安装/未连接时——先安装再用。
- 只做图片**分析/审计打分**而不生成时（那是 seo-images 或审计 agent 的职责，本技能不自动生成）。
- 非 SEO、与发布无关的随手出图场景。

## 前置检查

需要 banana 扩展提供 MCP 工具。使用前先确认 `gemini_generate_image`、`set_aspect_ratio` 等工具可用；不可用则提示用户安装：

```bash
./extensions/banana/install.sh
```

## 步骤 / 指令

1. **识别用例**：从命令或上下文判定（og / hero / product / infographic / custom / batch）。
2. **套用 SEO 默认参数**：按下表映射宽高比、分辨率、领域模式。
3. **设置宽高比**：调用 `set_aspect_ratio` MCP 工具。
4. **构建推理简报**（创意总监 6 要素管线，按需加载 `references/prompt-engineering.md`）：领域模式加权（Subject 30% / Style 25% / Context 15% …），描述要**具体且有画面感**——写"镜头看到了什么"。
5. **生成**：调用 `gemini_generate_image`。
6. **跑生成后 SEO 清单**（见下）。

### 用例 → 参数映射

| 用例 | 宽高比 | 分辨率 | 领域模式 | 说明 |
|---|---|---|---|---|
| OG/社交预览 | `16:9` | `1K` | Product / UI-Web | 干净专业、留白利于叠字 |
| 博客 Hero | `16:9` | `2K` | Cinema / Editorial | 戏剧性、氛围感、编辑级质感 |
| Schema 配图 | `4:3` | `1K` | Product | 描述性、对应 ImageObject |
| 社交方图 | `1:1` | `1K` | UI-Web | 平台优化方图 |
| 产品图 | `4:3` | `2K` | Product | 白底、影棚布光 |
| 信息图 | `2:3` | `4K` | Infographic | 数据密集、竖版 |
| Favicon/图标 | `1:1` | `512` | Logo | 极简、可缩放、易识别 |
| Pinterest Pin | `2:3` | `2K` | Editorial | 高竖版卡 |

### 模型路由

| 场景 | 模型 | 理由 |
|---|---|---|
| OG/社交预览 | `gemini-3.1-flash-image-preview` @1K | 快、省 |
| Hero/产品图 | `gemini-3.1-flash-image-preview` @2K | 质量+细节 |
| 含文字信息图 | `gemini-3.1-flash-image-preview` @2K, thinking: high | 文字渲染更好 |
| 快速草稿 | `gemini-2.5-flash-image` @512 | 快速迭代 |

### 预设（可选）

用户提到品牌或已配置 SEO 预设时，先列出并套用为默认：

```bash
python3 ~/.claude/skills/seo-image-generator/scripts/presets.py list
```

也可参考 `references/seo-image-presets.md` 中的 SEO 预设模板。

## 生成后 SEO 清单

每次成功生成后，引导用户完成：

1. **Alt 文本**：写描述性、含目标关键词的 alt。
2. **文件命名**：`关键词-描述-宽x高.webp`。
3. **WebP 转换**（提速）：
   ```bash
   magick output.png -quality 85 output.webp
   ```
4. **体积**：Hero 图 <200KB，缩略图 <100KB。
5. **Schema 标记**（ImageObject）：
   ```json
   {
     "@type": "ImageObject",
     "url": "https://example.com/images/keyword-description.webp",
     "width": 1200,
     "height": 630,
     "caption": "含目标关键词的描述性说明"
   }
   ```
6. **OG meta 标签**（社交预览图）：
   ```html
   <meta property="og:image" content="https://example.com/images/og-image.webp" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta property="og:image:alt" content="描述性 alt 文本" />
   ```

## 示例

```text
/seo image-gen og  "SaaS 仪表盘上线公告，深色科技风，左侧留白叠标题"
/seo image-gen hero "AI 数据中心夜景，冷蓝光，电影级氛围"
/seo image-gen infographic "2026 内容营销趋势，竖版，5 段数据，品牌主色"
/seo image-gen batch "极简咖啡品牌产品图" 3   # 生成 3 个变体（默认 3）
```

返回时务必给出：图片保存路径、实际发送的提示词（教学用）、设置（模型/宽高比/分辨率）、SEO 清单、可用的 ImageObject 或 og:image 片段。

## 注意事项

- **成本透明**：出图花钱。批量前先报估价；每次生成记账，需要时出汇总：
  ```bash
  python3 ~/.claude/skills/seo-image-generator/scripts/cost_tracker.py log --model MODEL --resolution RES --prompt "brief"
  python3 ~/.claude/skills/seo-image-generator/scripts/cost_tracker.py summary
  ```
  参考价（gemini-3.1-flash）：512 ≈ $0.02、1K ≈ $0.04、2K ≈ $0.08、4K ≈ $0.16 /张。
- **错误处理**：
  - MCP 未配置 / 扩展未装 → `./extensions/banana/install.sh`。
  - API key 失效 → 在 https://aistudio.google.com/apikey 重新申请。
  - 限流 429 → 等 60s 重试（免费档约 10 RPM / 500 RPD）。
  - `IMAGE_SAFETY` → 改写提示词（见 `references/prompt-engineering.md` 安全节）。
  - MCP 不可用兜底：`python3 ~/.claude/skills/seo-image-generator/scripts/generate.py --prompt "..." --aspect-ratio "16:9"`。
- **按需加载参考**：勿启动即全量加载 `references/` 下文档（prompt-engineering / gemini-models / mcp-tools / post-processing / cost-tracking / presets …）。
- 生成结果不替代环境内的验证、测试或专家审核；输入、权限、安全边界或成功标准缺失时，先停下来问清。

## 互见

- related：`seo-images` —— 图片分析/审计，识别缺失或低质图，其结论可驱动本技能生成。
- combines_with：`seo-schema` —— 生成后产出 `ImageObject` Schema 指向新资源。
- related：`seo-audit` —— 站点审计会派生（audit-only）分析 agent，产出生成计划（计划由它出、图由本技能生）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
