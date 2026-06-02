---
name: canva-campaign-creator
title: Canva 营销活动设计与排期生成
description: 当你拿到已批准的内容简报、要把它端到端落地为一场社媒+邮件营销活动时使用；做发布排期表→素材清单→Canva 设计生成→文案→HubSpot 排期入队（每步需 owner 显式批准）；不适用于邮件路径走 Canva 设计、自动发布、或无简报开工。触发词：做内容/生成帖子、营销活动落地、Canva 排期
domain: 创意/design
triggers: [把简报变成营销活动, 生成社媒帖子和设计, 做内容/创建素材, Canva 营销活动排期, 社媒发布日历 + HubSpot 排期]
tags: [design, 创意, canva, 营销活动, social-media, hubspot, 排期, 内容生成]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Canva Connect API, Canva MCP, HubSpot Marketing API]
requires: []
related: [social-media-content-creator, paid-ad-creative, ad-creative-generator, social-media-multi-publisher]
combines_with: [content-marketing-strategist, email-drip-sequence, brand-guidelines]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

拿到一份**已批准的内容简报**后，需要把它端到端落地成一场营销活动：排期、出图、写文案、入队待发。本技能按五个串行阶段推进，**每个阶段都由 owner 显式批准后才进入下一阶段**：

```
简报 → 排期日历 → 素材清单 → Canva 设计 → 文案 → HubSpot 排期入队
```

两条路径分流（排期表用 `Path` 列标注每一行）：

| 路径 | 渠道 | 产物 |
|------|------|------|
| Canva（社媒） | Instagram、Facebook、X、LinkedIn | Canva 设计 + 文案 + HubSpot 排期帖 |
| 纯文本 | 邮件（newsletter / 营销 / drip） | 主题 + 预览文字 + 正文，内联呈现给 owner 自行发送 |

**不该用本技能的边界：**
- **邮件行绝不走 Canva**：不建模板、不 autofill、不复制设计、不上传/导出素材。邮件正文由 Claude 直接写成纯文本内联呈现。原因：邮件模板 autofill 在图片槽多于可用照片时会塞占位图，且缩略图在聊天预览里渲染失败。owner 若要 Canva 邮件设计 → 见源仓 `reference/gotchas.md` 的转向话术。
- **不做自动发布**：所有 HubSpot 帖子只入队为 `SCHEDULED`，上线由 owner 控制。
- **无简报不开工**：没有简报先索取，别凭空动手。

## 步骤 / 指令

### 飞行前检查（Stage 1 之前）

1. **简报**：用户已引用/粘贴已批准简报；否则索取。
2. **Canva 等级**：Pro/Teams 需从用户库手选模板（无 autofill API）；Enterprise 可从品牌模板 autofill。
3. **HubSpot 等级**：社媒入队需 Marketing Hub Professional；Starter/Free → 跳过 Stage 5，改导出 CSV。
4. **品牌素材**：确认磁盘上产品照路径，或 Canva 品牌套件已就绪。
5. **生成预算**：开工前估算并公示设计总量。默认每行 3 个候选，每个设计约 5 次 API 调用（autofill + export + 轮询）。预计总设计数 > 30 时，先建议单候选模式；锁定该值贯穿整个会话。

```
本次活动生成预算：
  Canva（社媒）行数: 8
  每行候选数:        3   （默认；说 "单候选" 改为 1）
  设计总数:          24
  API 调用（约）:    ~120
Canva 限速 100 请求/分钟，约 2-3 分钟，余量充足。继续？
```

### Stage 1 — 发布排期日历

从简报提取主题、渠道、节奏、硬日期（上新/促销/节日）。建表，每行用 `Path` 列路由到 Canva 或纯文本：

| Date | Channel | Path | Theme | Asset type | Caption/Subject angle |
|------|---------|------|-------|------------|-----------------------|
| Jun 2 | Instagram feed | Canva（社媒） | Linen launch | Square post | "finally, a dress…" |
| Jun 5 | Email | 纯文本 | Linen launch | Email body | "Linen that actually breathes" |

所有邮件行标 `纯文本`；默认 30 天封顶；提前标出排期冲突（同日同产品两帖）。

**检查点 1**：展示日历 → "符合计划吗？要改日期/加渠道/换主题吗？" 迭代至批准后，**口头复述分流**："N 行走 Canva，M 行走纯文本"。在此抓错是免费的，出图之后再抓就不是了。

### Stage 2 — 素材清单（仅 Canva 行）

邮件行整段跳过。逐 Canva 行建清单：

1. **逐一列出每个图片槽并命名**（`Header_Image`、`Product1_Image`…），**绝不**笼统写成 "产品图"。Enterprise 从 `GET /v1/brand-templates/{id}` 的 `dataset[].label` 读字段名；Pro/Teams 数模板里每个独立图片矩形。
2. **盘点可用素材**：简报文本（产品名、报价、定价）、已上传 Canva 的照片（`GET /v1/assets`）或磁盘照片、品牌色与字体（Enterprise）。
3. **建逐槽差距表**（每槽一行，不是每设计一行）：

| Date | Slot name | Slot kind | Available asset | Status |
|------|-----------|-----------|-----------------|--------|
| Jun 2 | Hero_Image | image | bloom_summer.jpg → asset_id pending | upload |
| Jun 9 | Product1_Image | image | — | **MISSING** |

4. **槽位多于照片时暂停问 owner**（复用同图 / 补图 / 换简单模板），未选定前不发任何生成调用——空槽会渲染成 Canva 默认风景占位图。
5. **上传缺图并拿到已验证的 asset ID**：`POST /v1/asset-uploads`，轮询 `GET /v1/asset-uploads/{job_id}` 直到 `status == "success"`，记录响应里的 `asset.id`——这是 autofill 图片字段**唯一**有效的值；传空串/URL/文件路径/过期 ID 都会静默渲染成 Canva 库存风景图。
6. **确认清单**：向 owner 展示每槽已解决、每个图片 `asset.id` 已确认的完整表——这是调 Canva API 前最后一站。

### Stage 3 — Canva 设计生成

调任何 Canva API 前，重读日历，丢弃 `Path` 不是 `Canva（社媒）` 的行。

**一次只处理一个日历行**，每行 3 候选（或飞行前选定值）。每行循环：生成候选 → 验证 → 导出 → 肉眼检查 → 重试失败项 → 呈现 → 等 owner 选 → 下一行。**行间停 30 秒**，不并行多行——这是防止中途撞配额的保护。

- **轮询节奏**：每 3-5 秒查一次 job 状态，别更快。
- **预览 URL 只有一种可安全嵌入**：autofill 返回的 `design.canva.ai` 缩略图几分钟内过期，嵌入会变成坏图。只嵌入永久导出 URL（`export-download.canva.com` 或 `export-design` MCP 工具）。原生 Cowork 轮播让其自行渲染，别重新嵌入。

**单行循环：**
1. **定模板**（每会话一次）：Enterprise `GET /v1/brand-templates` 按资产类型过滤；Pro/Teams `GET /v1/designs?ownership=any&query={模板名}`，呈现前 3 个让 owner 确认。**绝不替 Pro/Teams 自动选模板。**
2. **并行生成本行候选**：Enterprise 每候选 `POST /v1/autofills`（模板 ID + 字段值），并发轮询；Pro/Teams `POST /v1/designs` 建副本，描述文本/图片编辑，收回 design ID。
3. **验证 job 状态**：确认 `GET /autofills/{job_id}` 返回 `status == "success"` 且有 `result.design.id`。错误分级处理：
   - `JOB_FAILED` → 读 `job.error.message`，修字段值/asset ID，重试一次。
   - `RATE_LIMIT_EXCEEDED`（本会话首次）→ 等 60s，仅重试该候选一次。
   - `RATE_LIMIT_EXCEEDED`（第二次）**或**任何 `quota_exceeded`/日上限错误 → **立即停止生成，不重试**，汇报进度并让 owner 选（切单候选跑完 / 暂停 60 分钟 / 用现有的转文案）。
4. **每个成功候选导出为永久 PNG**（并行）：REST `POST /v1/exports`（`format.type: "png"`），轮询 `GET /v1/exports/{job_id}` 至成功，取 `urls[0]`；或 Canva MCP `export-design`。这些永久 URL 才用于预览嵌入和后续 HubSpot 附件。
5. **肉眼验证每张导出**，命中即拒：带云和绿丘的通用风景（Canva 默认占位）、该放照片处的纯灰矩形、lorem-ipsum/模板默认文本、主体与简报不符（错产品/错品牌）。失败 → 复查该槽清单、修 `asset.id`、只重生成该候选、重导出、重验证。
6. **部分失败按候选重试**：N 个里 1 个失败，只重生成那一个，别重做整行、别呈现半坏轮播。第二次仍失败 → 让 owner 选（跳过 / 换简单模板 / 换张照片再试）。
7. **呈现本行候选**：让原生 Cowork 轮播渲染 autofill 结果，下方加文字提示让 owner 选。轮播不渲染时改嵌 Step 4 的永久 PNG；最终兜底链到 `https://www.canva.com/d/{design_id}`。**绝不重新嵌入 `design.canva.ai` URL。**
8. **停 30 秒，进入下一行。**

**检查点 2**：owner 为每个日历行选定一个设计即满足；要重生成只重生成那一个候选。

### Stage 4 — 文案撰写

每行写文案：社媒行写 caption，邮件行写整封邮件。

**社媒 caption**（IG/FB/X/LinkedIn）：长度按渠道（IG ≤ 2200、FB ≤ 500 推荐、X ≤ 280）；结构 hook → 一个产品利益点 → CTA → 3-5 个话题标签（不是 30 个）；语气匹配简报 tone；不写 "Exciting news!"/"We're thrilled to announce" 这类填充。

**邮件正文**（Claude 全写，无 Canva）：主题 ≤ 50 字、具体、不标题党；预览文字 ≤ 90 字、补充主题而非重复；正文纯散文 100-250 词（开头钩子 → 1-2 段实质 → 单一明确 CTA → 签名）；语气同社媒；**不引用图片**（别写 "见上图"）；每封一个 CTA。

社媒 caption 内联呈现在对应行下；邮件按下列格式内联：

```
Subject: <主题>
Preheader: <预览文字>

<正文>
```

**检查点 3**："有要重写的 caption 或邮件吗？标出日期和改动。" 迭代至批准。

### Stage 5 — HubSpot 排期入队 + 邮件交接

社媒帖入队 HubSpot；邮件不入队，内联呈现给 owner 自行复制到其邮件工具。

1. **建活动**：`POST /marketing/v3/campaigns`（活动名 + 起止日期）。
2. **逐 `Canva（社媒）` 行入队**：`POST` 到 HubSpot Social API：`channel` 映射到 HubSpot 账号 ID；`scheduledAt` 用 ISO 8601 且调用前确认在未来；`content.body` 填已批准 caption；`attachments` 填 Stage 3 的永久 Canva 导出 PNG URL；`status` 恒为 `SCHEDULED`（**绝不 `PUBLISHED`**）。
3. **确认队列**：`GET /marketing/v3/social/posts?status=SCHEDULED`，列出并给 HubSpot 活动视图直链。
4. **交接邮件内容**：每个邮件行按发送日期分组，内联呈现已批准的主题 + 预览 + 正文，owner 自行复制到其邮件工具。

**最终检查点**：告知社媒已排期入队（附链接，可在 HubSpot 取消/编辑），邮件内容内联待复制，问 "结束前还有要改的吗？"。

## 示例

完整可运行示例（单槽社媒、多槽模板）见源仓 `reference/examples/boutique-brief-campaign.md`。典型一行的端到端：Jun 2 IG 方图 → 清单 `Hero_Image` 上传拿 `asset.id` → 3 候选 autofill → 导出 3 张永久 PNG → 肉眼剔除风景占位 → 轮播呈现让 owner 选 1 → 写 caption（hook+利益点+CTA+4 标签）→ HubSpot 排期为 Jun 2 9:00 `SCHEDULED`。

## 注意事项（审批闸门）

- **邮件行不调任何 Canva**：每次 API 调用前重查 `Path` 列。
- **不发布**：HubSpot 帖恒为 `SCHEDULED`。
- **飞行前必公示生成预算**：owner 见总设计数并批准后再进 Stage 1。
- **Stage 3 一次一行**：行内候选并行，行间串行 + 30s 间隔——这是配额保护。
- **第二次配额错误就暂停问 owner**，绝不循环重试。
- **呈现前必导出永久 PNG**：job 成功 ≠ 设计渲染正确。
- **消息里绝不嵌 `design.canva.ai` URL**（会过期）。
- **单候选失败绝不重做整行**：只按候选重试。
- **Pro/Teams 绝不自动选模板**：始终确认。
- **绝不跳过逐槽清单**：多槽模板任一空槽会渲染风景占位。
- **绝不跳过检查点 1**：日历批准前出图是本技能最大的返工来源。

## 互见

- 源仓参考：`reference/canva-api.md`（Canva Connect API 端点、素材上传、导出格式、MCP 等价）、`reference/hubspot-staging.md`（HubSpot Social API 与非 Pro 等级的 CSV 兜底）、`reference/gotchas.md`（每种生产失败模式的好/坏对照）、`reference/examples/boutique-brief-campaign.md`（完整示例）。
- 上游：内容简报通常来自 content-strategy 技能。

---

采编自 anthropics/knowledge-work-plugins（small-business/skills/canva-creator），遵循 Apache-2.0 许可。
