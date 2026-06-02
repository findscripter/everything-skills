---
name: file-upload-storage
title: 文件上传与云存储
description: 当处理文件上传、对接 S3/Cloudflare R2、生成预签名 URL、做分片上传或图片优化时使用；做安全可靠的上传链路设计与产出可落地的校验/直传代码；不适用于纯前端 UI 交互、数据库元数据建模或 CDN 图片投递调优；触发词：文件上传、S3、R2、预签名 URL、分片上传、图片上传、云存储。
domain: 研发/backend
triggers: [文件上传, S3, Cloudflare R2, 预签名 URL, presigned URL, 分片上传, multipart, 图片上传, 云存储, object storage, 大文件上传]
tags: [文件上传, 云存储, S3, R2, 预签名URL, 分片上传, 安全, 研发, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [file-type, AWS SDK (S3 PutObjectCommand / getSignedUrl), multer, formidable, sharp]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当需要实现或评审文件上传链路、对接对象存储（S3、Cloudflare R2 等兼容服务）、签发预签名 URL 让客户端直传、处理大文件分片上传，或在上传后做图片优化/转码时使用本技能。核心心法：永远不信任客户端声称的文件类型，优先用预签名 URL 直传而非服务端代理，大文件用流式处理绝不全量缓冲，上传时校验、上传后优化。

不该用的边界：
- 纯前端上传组件的 UI/交互设计（拖拽、进度条样式等）不属本技能。
- 文件元数据入库与表结构设计 → 交给数据库相关技能。
- 图片 CDN 投递与缓存命中调优 → 交给性能优化相关技能。
- 缺少桶名、凭证、大小上限、允许类型等关键输入时，先停下来问清，不要硬猜。

## 步骤

1. 定上传方式：敏感/大文件优先预签名 URL 直传对象存储；仅小文件或需服务端深度处理时才走服务端代理。
2. 限大小：客户端先做一次早检拦截，服务端/预签名再强制 `ContentLength` 或框架 `maxFileSize`，双重设限。
3. 校类型：读取文件魔数（magic bytes）判断真实 MIME，对照白名单，绝不只看扩展名或 Content-Type。
4. 净化文件名：取 `basename`，剔除路径分隔符，最佳实践是直接用 UUID 重新生成文件名 + 校验后的扩展名。
5. 签发与分发：为敏感文件设置短过期时间，预签名 URL 响应加 `no-store` 防 CDN 缓存。
6. 上传后处理：图片用 sharp 等做压缩/转码/生成缩略图，与上传主流程解耦异步执行。

## 指令

- 校验真实类型（魔数，非扩展名）：

```ts
import { fileTypeFromBuffer } from "file-type";

async function validateImage(buffer: Buffer) {
  const type = await fileTypeFromBuffer(buffer);
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!type || !allowedTypes.includes(type.mime)) {
    throw new Error("Invalid file type");
  }
  return type;
}
// 流式场景：import { fileTypeFromStream } from "file-type";
```

- 设置大小上限（多重防线）：

```ts
// 服务端框架
const form = formidable({ maxFileSize: 10 * 1024 * 1024 });   // 10MB
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// 客户端早检
if (file.size > 10 * 1024 * 1024) { alert("File too large (max 10MB)"); return; }

// 预签名时强制大小
new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentLength: expectedSize });
```

- 净化文件名，防路径穿越：

```ts
import path from "path";
import crypto from "crypto";

function safeFilename(userFilename: string): string {
  const ext = path.extname(userFilename).toLowerCase();
  const allowed = [".jpg", ".png", ".pdf"];
  if (!allowed.includes(ext)) throw new Error("Invalid extension");
  return crypto.randomUUID() + ext;   // 直接重命名最稳妥
}
// 危险：const p = "uploads/" + req.body.filename;
// 正确：const p = "uploads/" + safeFilename(req.body.filename);
```

- 控制预签名 URL 的过期与缓存：

```ts
const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 分钟
return Response.json({ url }, {
  headers: { "Cache-Control": "no-store, max-age=0" },
});
// 需要更细粒度控制时改用 CloudFront 签名 URL
```

## 示例

场景：用户上传头像图片，需安全存入 R2 并返回直传地址。
1. 后端按 `userId + crypto.randomUUID() + ext` 生成 key，签发 `PutObjectCommand` 预签名 URL，`expiresIn: 300`，响应带 `no-store`。
2. 客户端上传前先 `file.size` 早检（>10MB 拒绝），再 PUT 到预签名 URL。
3. 上传完成回调里，后端用 `fileTypeFromBuffer` 复核魔数为 `image/jpeg|png|webp`，否则删除该对象。
4. 异步用 sharp 转 webp 并生成缩略图，落到独立 key。

## 注意事项

- 仅看扩展名 = CRITICAL 漏洞：`malware.exe` 改名 `image.jpg` 即可绕过，必须查魔数。
- 用户文件名直接拼路径 = CRITICAL 漏洞：`../../../etc/passwd` 可路径穿越，必须 `basename` 净化或重命名。
- 无大小限制 = HIGH 风险：10GB 上传可打爆内存/磁盘或产生天价账单。
- 预签名 URL 被 CDN 缓存 = MEDIUM 风险：私有文件在过期前被任意访问，务必 `no-store` 且缩短过期。
- 本技能产出不替代环境内的实测、权限与安全评审；上线前请按真实存储桶与凭证验证。

## 互见

- 图片投递与 CDN 优化 → 性能优化相关技能。
- 存储文件元数据与表结构 → 数据库相关技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
