---
name: social-share-card-hardener
title: 社交分享卡片加固：Open Graph 富链接预览修复
description: 当分享链接在 Facebook/LinkedIn/X/微信/Telegram/Slack/Discord 等平台预览缺失、过期、裁切或错误，或上线前需统一富链接预览时使用；做 OG/Twitter Card 元数据加固、绝对图片 URL 修复与预览调试，产出可复用元数据助手与排错清单；不适用于仅靠客户端 JS 注入标签、未部署的本地页面，也不替代品牌/可访问性/法务审查。触发词：Open Graph、og:image、Twitter Card、富链接预览、分享卡片
domain: 商业/marketing
triggers: [分享链接没有预览卡片, og:image 图片裂了或显示不出来, Twitter Card 只显示小图, 微信/Telegram 链接预览过期, LinkedIn 分享预览要刷新, metadataBase 配置, Next.js 社交元数据, Facebook Sharing Debugger 重新抓取]
tags: [seo, open-graph, twitter-card, social-sharing, og-image, nextjs, metadata, 商业]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude-code, claude, cursor, gemini]
requires: []
related: [seo-meta-tags-optimizer, seo-image-generator, technical-seo-checker, schema-markup-builder]
combines_with: [seo-audit, seo-performance-reporter]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 分享的链接在社交或聊天平台上预览**缺失、过期、被裁切或显示错误**时。
- 需要审计 Web 应用中 Open Graph、Twitter/X Card、图片 URL、alt 文本或 `metadataBase` 覆盖度时。
- 上线前要求每个公开页面在 LinkedIn、X、Facebook、微信/WhatsApp、Slack、Discord、Telegram 上都呈现稳定的富预览时。

**不该用的边界：**

- 仅靠客户端 JS 注入 `og:`/`twitter:` 标签的方案——爬虫不执行 JS，必须改为服务端静态输出。
- 未部署、外网不可达的本地页面——平台调试器无法抓取验证。
- 不替代品牌、可访问性、法务对图片文案/alt/预览文案的审查。

## 为什么预览会坏

| 现象 | 根因 |
|------|------|
| 完全没有预览 | 缺 `og:title` / `og:description` / `og:image` |
| 图片裂掉 | 用了相对 URL（必须绝对 URL） |
| 图片尺寸不对 | 图片非 1200×630px（OG 标准比例） |
| 只有纯文本卡片 | Twitter card 缺失或设成了 `summary` |
| 预览是旧的 | 平台缓存了旧元数据 |
| 抓取时拿不到标签 | 标签由客户端 JS 注入，爬虫读不到 |

## 步骤

1. **抽取统一元数据助手**——所有可分享页面共用一个生成函数，集中处理绝对 URL、MIME 类型、尺寸（见下「指令」中的 `buildSocialMetadata`）。
2. **在静态页 / 动态页 / 首页接入助手**，首页/根布局务必设置 `metadataBase`。
3. **核对 OG 图片**是否符合规格并可被匿名 GET 访问。
4. **抓取原始 HTML** 确认标签出现在静态 HTML 而非 JS 注入。
5. **用各平台调试器验证**并强制刷新缓存。
6. **逐项过清单**收尾。

## 指令

### 统一元数据助手（Next.js App Router）

```js
// lib/socialMetadata.js
export function buildSocialMetadata({
  title,
  description,
  path,          // '/blog/my-post'
  image,         // '/images/og/my-post.jpg' 或完整 URL
  imageAlt,
  imageWidth = 1200,
  imageHeight = 630,
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.yourdomain.com';

  // 始终产出绝对 URL
  const imageUrl = image?.startsWith('http') ? image : `${baseUrl}${image}`;
  const pageUrl  = `${baseUrl}${path}`;

  // 从扩展名推断 MIME 类型
  const ext = imageUrl.split('.').pop().toLowerCase();
  const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const imageType = mimeMap[ext] || 'image/jpeg';

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title, description, url: pageUrl,
      type: 'website',  // 博客文章用 'article'
      images: [{
        url: imageUrl,
        secureUrl: imageUrl,   // 显式 HTTPS 版本
        width: imageWidth, height: imageHeight,
        alt: imageAlt || title,
        type: imageType,
      }],
    },
    twitter: {
      card: 'summary_large_image',  // 不要用 'summary'，那是小图
      title, description,
      images: [imageUrl],
    },
  };
}
```

### 首页 / 根布局必须设置 metadataBase

```js
export const metadata = {
  metadataBase: new URL('https://www.yourdomain.com'), // 缺它则 OG 图片是相对 URL，平台一律拒绝
  ...buildSocialMetadata({
    title: 'My Site — Tagline Here',
    description: 'Site-wide description.',
    path: '/',
    image: '/images/og/home.jpg',
  }),
};
```

### 核对 OG 图片是否可达且尺寸正确

```bash
curl -sI https://www.yourdomain.com/images/og/home.jpg | grep -i "content-type\|content-length\|status"
```

### 抓原始 HTML 确认标签未被 JS 注入

```bash
curl -s https://www.yourdomain.com/blog/my-post | grep -i "og:\|twitter:"
```

标签不出现 → 是 JS 注入的（不可被爬取）。修复：改用 `export const metadata` 或 `generateMetadata`。

## 示例

**静态页：**

```js
// app/about/page.js
import { buildSocialMetadata } from '@/lib/socialMetadata';

export const metadata = buildSocialMetadata({
  title: 'About Us | My Site',
  description: 'Learn about our team and mission.',
  path: '/about',
  image: '/images/og/about.jpg',
  imageAlt: 'The My Site team',
});
```

**动态页（博客文章 / 工具页）：**

```js
// app/blog/[slug]/page.js
import { buildSocialMetadata } from '@/lib/socialMetadata';

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return buildSocialMetadata({
    title: `${post.title} | My Blog`,
    description: post.excerpt,
    path: `/blog/${params.slug}`,
    image: post.ogImage || '/images/og/default.jpg',
    imageAlt: post.title,
  });
}
```

## 注意事项

**OG 图片规格：** 1200×630px（2:1，通吃各平台）；小于 8MB（Facebook 上限）；HTTPS 提供；文件名无空格（用连字符）；格式 JPEG 或 PNG（WebP 多数爬虫支持但非全部）；可匿名 GET 访问、无需鉴权。

**各平台差异：**

- **Facebook/Meta**：缓存激进，用 [Sharing Debugger](https://developers.facebook.com/tools/debug/) 强制重抓；最小 200×200，但仍用 1200×630。
- **X/Twitter**：`twitter:card = summary_large_image` 才是大图；`twitter:image` 必须绝对 URL；用 [Card Validator](https://cards-dev.twitter.com/validator) 测。
- **LinkedIn**：缓存很硬，用 [Post Inspector](https://www.linkedin.com/post-inspector/) 刷新；只认 `og:`，忽略 `twitter:`；图片需 ≥1.91:1。
- **微信/WhatsApp/Telegram**：首次分享时读 OG，缓存可达数小时；隔几小时重分享让缓存自然过期。
- **Slack/Discord**：均用 OG 且均缓存；Discord 支持 `og:type = article` 获得更丰富嵌入。

**刷新缓存：** 部署后把 URL 贴进各平台调试器，点击「Fetch new scrape information」（或同义按钮）。

**收尾清单：**

- [ ] 根布局设置了 `metadataBase`
- [ ] 所有可分享页面共用 `buildSocialMetadata`
- [ ] OG 图片 URL 均为绝对（以 `https://` 开头）
- [ ] OG 图片块中 `secureUrl` 等于 `url`
- [ ] 图片 1200×630px、<8MB、HTTPS
- [ ] `twitter:card` 为 `summary_large_image`（非 `summary`）
- [ ] 图片带 alt 文本
- [ ] 标签出现在原始 HTML（非 JS 渲染）
- [ ] 各平台调试器预览正确
- [ ] 部署后已在各平台刷新缓存

**局限：** 无法强制每个平台立即刷新缓存，修对后部分预览仍可能短暂滞留旧版；可靠验证要求已部署、外网可达的 URL。

## 互见

- SEO/元数据相关：站点级 canonical、结构化数据（Schema.org）等技能。
- 图片资产生成与压缩流水线（OG 封面批量产出）。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
