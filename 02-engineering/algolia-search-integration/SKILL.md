---
name: algolia-search-integration
title: Algolia 搜索集成与索引优化
description: 当为 Web/前端应用接入 Algolia 即时搜索、构建索引同步管道或调优相关性时使用；做 InstantSearch/SSR 集成、批量与增量索引、API Key 安全分发、可搜索属性与自定义排序、分面过滤与自动补全的落地方案；不适用于自建 ES/向量检索或非 Algolia 搜索后端。触发词：algolia、instantsearch、搜索索引、typeahead、faceted search
domain: 研发/backend
triggers: [接入 Algolia 搜索, React InstantSearch 集成, Next.js 搜索 SSR, Algolia 索引同步与批量更新, 搜索相关性/自定义排序调优, 分面过滤 faceted search, 搜索自动补全 autocomplete, Algolia API Key 安全, typeahead 即时搜索, search index 配置]
tags: [algolia, instantsearch, 搜索, 索引, relevance, faceting, autocomplete, nextjs, react, backend]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [algoliasearch, react-instantsearch, react-instantsearch-nextjs, @algolia/autocomplete-js]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 给前端应用接入 Algolia 即时搜索（type-ahead / search-as-you-type），用 React InstantSearch（含 Next.js SSR）。
- 建立并维护索引同步管道：全量重建、整记录更新、增量部分更新。
- 配置 API Key 安全策略（搜索专用 Key、Secured Key、限速 Key）。
- 调优相关性：可搜索属性顺序、自定义排序、同义词、Query Rules。
- 实现分面过滤（RefinementList / HierarchicalMenu / RangeInput）与自动补全 / 查询建议。

不该用（负边界）：
- 后端是自建 Elasticsearch / OpenSearch / Meilisearch / 向量检索，而非 Algolia——本技能命令与 SaaS 约束不通用。
- 仅做一次性数据库全文 `LIKE` 查询、无需托管搜索服务的简单场景。
- 缺少 App ID / Admin Key / 索引数据来源等必要输入时——先停下来确认。

## 步骤

1. 划分客户端：前端只用「搜索专用 Key」+ `algoliasearch/lite`；写操作（索引、配置、生成 Secured Key）一律放服务端，用 Admin Key。
2. 设计记录结构：每条记录必须有唯一 `objectID`；日期用时间戳（`getTime()`）以便排序；剔除不需要检索的字段。
3. 建立索引同步：优先增量更新（`partialUpdateObject`），批量写用 `saveObjects`（每批 1K–10K 条 / ≤10MB）；删除用 `deleteObjects(ids)` 而非 `deleteBy`。
4. 配置索引设置：`searchableAttributes`（按重要性排序）、`attributesForFaceting`、`customRanking`（叠加业务指标），并加同义词与 Rules。
5. 接入前端：普通 SPA 用 `<InstantSearch>`；Next.js SSR 用 `<InstantSearchNext>` 并 `export const dynamic = 'force-dynamic'`。
6. 加分面与排序：分面属性须先在 `attributesForFaceting` 声明；多维排序用 replica 副本索引（如 `products_price_asc`）。
7. 加自动补全：用 `@algolia/autocomplete-js` 或内置 Autocomplete widget，建议启用 Query Suggestions 索引。
8. 校验上线：确认无 Admin Key 进入前端、无硬编码凭据、无循环单条索引、无频繁全量重建。

## 指令

- 前端搜索客户端（搜索专用 Key + lite）：
```ts
// lib/algolia.ts
import algoliasearch from 'algoliasearch/lite';
export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!  // 仅搜索 Key
);
export const INDEX_NAME = 'products';
```

- 服务端批量索引（Admin Key，切勿暴露前端）：
```ts
const index = adminClient.initIndex('products');
const BATCH_SIZE = 1000;
for (let i = 0; i < records.length; i += BATCH_SIZE) {
  await index.saveObjects(records.slice(i, i + BATCH_SIZE));
}
```

- 部分更新与原子操作：
```ts
await index.partialUpdateObject({ objectID, price, updatedAt: Date.now() });
await index.partialUpdateObject({
  objectID, viewCount: { _operation: 'Increment', value: 1 },
});
```

- 零停机全量重建（写临时索引 → 拷贝设置 → 原子交换）：
```ts
await tempIndex.saveObjects(/* ... */);
await adminClient.copyIndex('products', 'products_temp', { scope: ['settings','synonyms','rules'] });
await adminClient.moveIndex('products_temp', 'products');
```

- 服务端生成用户级 Secured Key：
```ts
adminClient.generateSecuredApiKey(searchKey, {
  filters: `userId:${userId}`,
  validUntil: Math.floor(Date.now()/1000) + 3600,
  restrictIndices: ['user_documents'],
});
```

- 索引相关性设置（顺序即权重）：
```ts
await index.setSettings({
  searchableAttributes: ['name','brand','category','description'],
  attributesForFaceting: ['category','brand','filterOnly(inStock)','searchable(tags)'],
  customRanking: ['desc(popularity)','desc(rating)','desc(createdAt)'],
  typoTolerance: true, minWordSizefor1Typo: 4, minWordSizefor2Typos: 8,
  attributesToHighlight: ['name','description'],
});
```

## 示例

前端即时搜索（React InstantSearch + Hooks）：
```tsx
'use client';
import { InstantSearch, SearchBox, Hits, Configure } from 'react-instantsearch';
import { searchClient, INDEX_NAME } from '@/lib/algolia';

export function ProductSearch() {
  return (
    <InstantSearch searchClient={searchClient} indexName={INDEX_NAME}>
      <Configure hitsPerPage={20} />
      <SearchBox placeholder="搜索产品..." />
      <Hits hitComponent={Hit} />
    </InstantSearch>
  );
}
```
自定义 Hooks：`useSearchBox`（输入/refine）、`useHits`（结果）、`useRefinementList`（分面）、`usePagination`（分页）、`useInstantSearch`（全局状态/`status`）。

分面 + 多维排序（排序需 replica 副本索引）：
```tsx
<SortBy items={[
  { label: '相关性', value: 'products' },
  { label: '价格升序', value: 'products_price_asc' },
  { label: '评分', value: 'products_rating_desc' },
]} />
<HierarchicalMenu attributes={['categories.lvl0','categories.lvl1','categories.lvl2']} />
<RefinementList attribute="brand" searchable showMore limit={5} />
<RangeInput attribute="price" />
// 副本: products_price_asc → customRanking: ['asc(price)']
```

Next.js SSR：用 `<InstantSearchNext>` 替换 `<InstantSearch>`，并设 `export const dynamic = 'force-dynamic'` 保证结果新鲜。

## 注意事项

- 致命（CRITICAL）：Admin Key 绝不进入前端代码，它能删库改配置；前端只用搜索专用或 Secured Key。
- 凭据全部走环境变量，禁止硬编码。
- 索引用 Admin Key，搜索用搜索 Key——用错 Key 会报权限错误。
- 批量索引：禁止循环里单条 `saveObject`；用 `saveObjects` 成批；删除用 `deleteObjects` 而非 `deleteBy`（昂贵且限速）。
- 全量重建消耗大量操作配额且会刷新整个索引；小改动一律走 `partialUpdateObject` 增量。
- 每次按键 = 一次搜索操作，注意配额；Algolia 自带防抖，无需手写。
- 公开搜索设 `maxQueriesPerIPPerHour` 限速，防机器人耗尽配额。
- 分面属性必须先在 `attributesForFaceting` 声明，否则报错；不展示的过滤用 `filterOnly()`。
- `searchableAttributes` 顺序直接影响相关性；缺 `customRanking` 会忽略业务价值。
- SSR 易出 hydration mismatch；副本索引会成倍增加存储；索引名勿含 PII（网络可见）。

## 互见

- 电商下单/支付 → stripe-integration（搜索引导购买）
- 搜索分析埋点 → segment-cdp（追踪查询与结果）
- 用户鉴权（按用户发 Secured Key）→ clerk-auth
- 索引数据来源（数据库）→ postgres-wizard
- 索引任务的 Serverless 部署 → aws-serverless

---
采编自 sickn33/antigravity-awesome-skills（MIT）。原始来源标注为 vibeship-spawner-skills（Apache 2.0）。
