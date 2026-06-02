---
name: firebase-backend
title: Firebase 后端集成
description: 当用 Firebase 搭建前端应用的后端（Auth、Firestore、Cloud Functions、Storage、Hosting）时使用；做数据建模、安全规则、实时监听、批量事务与社交登录的落地实现；不适用于强关系型数据建模、全文检索、支付、邮件发送、容器/K8s 部署。触发词：firebase、firestore、安全规则、cloud functions、社交登录
domain: 平台/cloud
triggers: [firebase, firestore, firebase auth, cloud functions, firebase storage, realtime database, firebase hosting, firebase emulator, 安全规则, security rules, firebase admin, 社交登录, 实时监听 onSnapshot]
tags: [firebase, firestore, 后端即服务, 认证, 云函数, 安全规则, 实时数据, 平台]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [firebase, firebase-admin, firebase-functions, firebase-tools, @firebase/rules-unit-testing]
requires: []
related: [convex-reactive-backend, neon-serverless-postgres, cloudflare-workers-edge, gcp-cloud-run]
combines_with: [firebase-apk-scanner, rest-api-endpoint-builder, stripe-integration]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 给前端应用（Web/移动）快速搭一套后端：认证、数据库、文件存储、云函数、托管。
- 需要 Firestore 数据建模、安全规则、实时监听、批量写/事务、社交登录、Token 管理。
- 适配的场景：读多写少、可去规范化（denormalized）的数据模型。

不该用（负边界，应转交其他技能）：

- 强关系型数据、需要 JOIN 的复杂关系建模 → 用关系型数据库技能（Firestore 无 JOIN，是错误选择）。
- 全文检索 → Firestore 不支持，用 Algolia/Elasticsearch。
- 支付 → Stripe；邮件发送 → SendGrid/Resend（Firebase 不含邮件）。
- 容器/Kubernetes 部署 → DevOps 技能（超出 Firebase Hosting 能力）。
- 复杂 OAuth 流程 → 专门的 OAuth 技能（Firebase Auth 只覆盖基础）。

核心心智：Firebase 易上手但隐藏复杂度。安全规则是最后一道防线，且经常写错；按「查询模式」而非「数据关系」设计模型。Firestore 计费会反咬你——读操作便宜直到不便宜，一个糟糕的监听器可能比专用数据库更贵。

## 步骤

1. 选 SDK：客户端用模块化 `firebase`（v9+，可 tree-shaking）；服务端/云函数用 `firebase-admin`（全权限，绕过安全规则）。云函数用 `firebase-functions` v2。
2. 按查询模式设计数据模型，激进去规范化（重复数据便宜，JOIN 昂贵）。
3. 第一天就写安全规则，并用 `@firebase/rules-unit-testing` 做单测（规则 bug 就是安全漏洞）。
4. 实时功能用 `onSnapshot`，组件卸载时务必 unsubscribe。
5. 多文档一致性用 batch / transaction（单批次最多 500 个操作）。
6. 本地开发用 `firebase-tools` 的 Emulator Suite，避免打到生产环境。

## 指令

- 客户端模块化导入（小包体）：`import { getFirestore, doc, getDoc } from 'firebase/firestore'`，禁用 `firebase/compat/*`。
- 客户端永远不硬编码密钥，走环境配置。
- 客户端不该做的事放云函数。
- `in` / `array-contains-any` 查询最多 30 个值；batch/transaction 最多 500 个操作。
- 解绑：每个 `onSnapshot` 都要保存返回的 `unsubscribe` 并在清理时调用。

## 示例

安全规则（Firestore，rules_version '2'，最后一道防线）：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return request.auth.uid == userId; }
    function isAdmin() { return request.auth.token.admin == true; }

    match /users/{userId} {
      allow read: if true;
      allow write: if isOwner(userId);
      match /private/{document=**} { allow read, write: if isOwner(userId); }
    }
    match /posts/{postId} {
      allow read: if resource.data.published == true
                  || isOwner(resource.data.authorId);
      allow create: if isSignedIn()
                    && request.resource.data.authorId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.authorId);
    }
    match /admin/{document=**} { allow read, write: if isAdmin(); }
  }
}
```

面向查询的数据建模（内嵌作者信息，1 次读取无需 JOIN）：

```js
const post = {
  title: 'My Post', content: '...',
  author: { id: 'user456', name: 'Jane Doe', avatarUrl: '...' }, // 内嵌常用字段
  tags: ['javascript', 'firebase'],   // array-contains 查询
  stats: { likes: 42, comments: 7 },
  createdAt: serverTimestamp(),
  published: true, featured: false    // 布尔位用于过滤
};
// 代价：作者改名要更新其所有 post —— 写复杂、读快
```

实时监听 + 清理（React Hook）：

```js
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, path), (snap) => {
    setData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  }, (err) => setError(err));
  return () => unsubscribe();   // 卸载时解绑，防内存泄漏与多余读取
}, [path]);
```

事务（先读后写，保证一致性，如点赞计数）：

```js
import { runTransaction, increment, serverTimestamp } from 'firebase/firestore';
await runTransaction(db, async (tx) => {
  const postRef = doc(db, 'posts', postId);
  const likeRef = doc(db, 'posts', postId, 'likes', userId);
  const postSnap = await tx.get(postRef);
  if (!postSnap.exists()) throw new Error('Post not found');
  if ((await tx.get(likeRef)).exists()) throw new Error('Already liked');
  tx.update(postRef, { likeCount: increment(1) });
  tx.set(likeRef, { userId, createdAt: serverTimestamp() });
});
```

云函数 v2（HTTP 验证 Token / Firestore 触发器 / 定时任务）：

```js
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const api = onRequest({ cors: true, region: 'us-central1' }, async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const decoded = await getAuth().verifyIdToken(token);
  res.json({ userId: decoded.uid });
});

export const onUserCreated = onDocumentCreated('users/{userId}', async (event) => {
  if (!event.data) return;
  await db.collection('notifications').add({ userId: event.params.userId, type: 'welcome' });
});

export const dailyCleanup = onSchedule({ schedule: '0 0 * * *', timeZone: 'UTC' }, async () => {
  // batch 删除 30 天前日志，单批 ≤500
});
```

社交登录（弹窗 vs 重定向：桌面用 popup，移动/iOS Safari 用 redirect）：

```js
async function signIn(provider) {
  if (/iPhone|iPad|Android/i.test(navigator.userAgent)) {
    return signInWithRedirect(auth, provider);
  }
  try { return await signInWithPopup(auth, provider); }
  catch (e) {
    if (e.code === 'auth/popup-blocked') return signInWithRedirect(auth, provider);
    throw e;
  }
}
// 账号冲突 auth/account-exists-with-different-credential 时，用 linkWithCredential 关联
```

Token 管理（后端 API 调用，自动刷新 + 401 重试）：

```js
async function apiCall(url, opts = {}) {
  const token = await getIdToken(auth.currentUser);
  const res = await fetch(url, { ...opts, headers: { ...opts.headers, Authorization: 'Bearer ' + token } });
  if (res.status === 401) {
    const fresh = await getIdToken(auth.currentUser, true); // 强制刷新
    return fetch(url, { ...opts, headers: { ...opts.headers, Authorization: 'Bearer ' + fresh } });
  }
  return res;
}
```

## 注意事项

- 安全规则是必选项，不是可选项；每次读写都过规则，写错即数据泄露。上线前用 rules-unit-testing 覆盖。
- 按查询设计、不按关系设计；去规范化的代价是写更复杂、读更快。
- 计费陷阱：监听器和大量读取会显著推高成本；为查询模式而非数据关系规划模型。
- 离线持久化不是免费的，按需启用。
- `firebase-admin` 绕过安全规则，只在受信任的服务端使用。
- 框架绑定：React 用 reactfire、Vue 用 vuefire、Angular 用 angularfire（自动处理订阅）。
- Apple 登录对 iOS App 是必需的（`new OAuthProvider('apple.com')`）。
- 会话持久化：`browserLocalPersistence`（默认，关浏览器仍在）vs `browserSessionPersistence`（关标签页即清）。
- 解绑/Unlink provider 时至少保留一个登录方式。

## 互见

- 关系型数据库技能：需要强关系建模 / JOIN 时。
- OAuth 认证技能：复杂 OAuth 流程。
- Stripe：支付集成（Firebase + Stripe 常见组合）。
- 邮件技能：发送邮件（SendGrid/Resend）。
- 搜索技能（Algolia/Elasticsearch）：全文检索。
- DevOps 技能：容器 / Kubernetes 部署。
- 常配合：Next.js App Router、React 模式。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
