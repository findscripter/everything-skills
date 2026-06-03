---
name: photopea-embedded-editor
title: Photopea 嵌入式编辑器集成（photopea.js）：网页内嵌图像编辑引擎
description: 当你要在网页/Web 应用里内嵌 Photopea 作图像编辑器、用宿主页 JS 远程驱动它（打开文件、跑脚本、改图层/文字、导出 PNG/JPG/WebP/PSD）时使用；做法是用 photopea.js 包装器 createEmbed + runScript 调用 Photoshop 兼容脚本 API，产出可运行的嵌入代码与编辑/导出流程；不适用于服务端无头批处理、桌面版 Photoshop 自动化或不嵌 Photopea 的纯前端画图；触发词：Photopea、photopea.js、嵌入图像编辑器、runScript、saveToOE、PSD、图层脚本
domain: 创意/image
triggers: [Photopea, photopea.js, 嵌入图像编辑器, runScript, saveToOE, PSD, 图层脚本, exportImage, createEmbed, 在线 PS]
tags: [photopea, image-editor, embed, iframe, psd, postmessage, photoshop-scripting, web]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [photopea.js, JavaScript, iframe, Photoshop CC 2015 JS API]
requires: []
related: [fal-ai-media-generation, slack-gif-creator, algorithmic-art, web-artifacts-builder]
combines_with: [web-artifacts-builder, fal-ai-media-generation]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：在**网页 / Web 应用**里把 Photopea 当作图像编辑引擎嵌入，并从宿主页 JavaScript **远程驱动**它：
- 内嵌一个可视化图像/PSD 编辑器（createEmbed 注入 iframe）。
- 自动化编辑流程：打开本地/远程文件、跑脚本改图层/文字/选区/滤镜、导出结果。
- 用 Photopea 作引擎给产品加图像编辑功能（如模板改字、批量水印）。
- 插件模式：你的页面跑在 Photopea 侧栏 iframe 里，反向控制宿主 Photopea。

不该用（负边界）：
- **服务端 / 无头批处理**：Photopea 是浏览器内运行时，本技能是宿主页集成，不是 Node 端图像流水线 → 用 sharp/ImageMagick 等。
- **桌面版 Photoshop 自动化** 或 .jsx 文件运行 → 那是 Adobe 桌面环境，非本技能。
- **不嵌 Photopea 的纯前端画图**（Canvas/SVG 从零绘制）→ 用 `canvas-design`、`algorithmic-art`。
- **生成式出图**（文生图/图生图）→ 用 `fal-ai-media-generation`、`minimax-media-cli`。

铁律：**绝不手写裸 `postMessage` 接线，一律用 `photopea.js` 包装器**。

## 步骤

1. **引入 photopea.js**（三选一）
   - CDN：`<script src="https://cdn.jsdelivr.net/npm/photopea@1.1.1/dist/photopea.min.js"></script>`
   - 自托管：`<script src="./photopea.min.js"></script>`
   - npm：`npm install photopea` 后 `import Photopea from "photopea";`
2. **内嵌**：容器 `<div>` **必须先有固定宽高**，否则 `createEmbed` 永不 resolve。
3. **打开文件**：`openFromURL(url, asSmart)`（远程）/ `loadAsset(arrayBuffer)`（本地/字体/笔刷）/ `runScript("app.open('data:...')")`（base64）。
4. **跑脚本**：`runScript(jsString)` 返回数组 = 各 `app.echoToOE(...)` 值 + 末位 `"done"`；要取数据必须 echo 出来。脚本在 Photopea 文档上下文执行，遵循 **Photoshop CC 2015 JS 脚本接口**。
5. **导出**：`exportImage("png"|"jpg")` 返回 Blob；其他格式用 `runScript("app.activeDocument.saveToOE('webp:0.85')")` 再 `new Blob([result[0]], ...)`。

所有方法返回 Promise —— 务必 `await`。

## 指令

核心 API（`Photopea` 类）：

| 方法 | 作用 |
|---|---|
| `Photopea.createEmbed(container)` | 注入 iframe，就绪后 resolve 出 `pea` |
| `new Photopea(window.parent)` | 插件模式：包裹父窗口 |
| `pea.runScript(script)` | 在 Photopea 内跑 JS，返回输出数组 |
| `pea.loadAsset(arrayBuffer)` | 加载二进制（图片/字体/笔刷/渐变） |
| `pea.openFromURL(url, asSmart)` | 远程 URL 开为新文档或智能对象层 |
| `pea.exportImage("png"\|"jpg")` | 导出当前文档为 Blob |

`saveToOE` 格式串：`"png"` / `"jpg:0.8"`（质量 0–1）/ `"webp:0.7"` / `"psd"` / `"psd:true"`（精简 PSD）/ `"svg:true"`。

像素脚本起手必设单位（否则 `bounds` 等返回 UnitValue 而非数字）：
```js
var saved = app.preferences.rulerUnits;
app.preferences.rulerUnits = Units.PIXELS;
// ... 你的代码 ...
app.preferences.rulerUnits = saved;
```

脚本常用对象速查：`app.activeDocument`（width/height/layers/selection）；`doc.layers.getByName(name)`（找不到抛错，嵌套层需递归）；`ArtLayer`（translate/rotate/resize、applyGaussianBlur、adjustLevels、blendMode）；`textItem`（contents/font/size/color、`text.color.rgb.hexValue="FF0000"`）；`Selection`（select/feather/fill/stroke）；`doc.close(SaveOptions.DONOTSAVECHANGES)`。DOM 未覆盖的高级操作（智能对象编辑、调整图层）走 `executeAction(...)`。

## 示例

最小内嵌：
```html
<div id="editor" style="width:1000px;height:650px;"></div>
<script src="https://cdn.jsdelivr.net/npm/photopea@1.1.1/dist/photopea.min.js"></script>
<script>
  Photopea.createEmbed(document.getElementById("editor")).then(async (pea) => {
    // pea 就绪
  });
</script>
```

React（注意 StrictMode 二次挂载，用 ref 守卫）：
```jsx
useEffect(() => {
  if (!containerRef.current || peaRef.current) return;
  Photopea.createEmbed(containerRef.current).then((pea) => { peaRef.current = pea; });
}, []);
```

模板改字 + 导出（动态值务必 `JSON.stringify` 后再拼进脚本串）：
```js
async function generateCard(pea, name, tagline) {
  await pea.openFromURL("https://example.com/card.psd", false);
  await pea.runScript(`
    app.activeDocument.layers.getByName("Name").textItem.contents    = ${JSON.stringify(name)};
    app.activeDocument.layers.getByName("Tagline").textItem.contents = ${JSON.stringify(tagline)};
  `);
  return await pea.exportImage("png");
}
```

读取结构化数据（echoToOE + JSON）：
```js
const out = await pea.runScript(`
  app.echoToOE(JSON.stringify({
    width: app.activeDocument.width, layers: app.activeDocument.layers.length
  }));
`);
const info = JSON.parse(out[0]);
```

异步加层等待（智能对象加载有延迟，用轮询确认层数 +1）：先记录 `layers.length`，`app.open(url, null, true)` 后轮询直到层数增加再 resolve。

## 注意事项

- **容器必须有宽高**，否则 `createEmbed` 永不 resolve。
- `runScript` 返回 `["done"]` 无数据 = 脚本里没 `app.echoToOE(...)`；要回传什么就 echo 什么。
- **远程图片受 CORS 约束**：服务器须回 `Access-Control-Allow-Origin: *`，否则加载失败。
- **安全/注入**：动态值（URL、图层名、文本）一律 `JSON.stringify` 后再嵌入脚本串，**绝不直接字符串拼接用户输入**；只跑你理解、且用户批准的脚本/文件。
- 像素坐标异常 → 忘了设 `Units.PIXELS`；文字尺寸看着不对 → 设 `app.preferences.typeUnits = TypeUnits.PIXELS`。
- `exportImage` 只出 PNG/JPG；WebP/PSD/SVG 走 `saveToOE`。
- 智能对象编辑完务必 `doc.save(); doc.close()`，否则挂起。
- 导出表现受文档大小、浏览器内存、当前 Photopea 运行时支持格式影响；远程加载还依赖用户 Photopea 账号/会话状态。
- 本技能只覆盖**宿主页集成**，不替代 Photopea 自身条款与 API 文档。

## 互见

- related：`fal-ai-media-generation`、`minimax-media-cli` —— 生成式出图（与本技能的"编辑既有图"互补）。
- related：`slack-gif-creator`、`algorithmic-art` —— 其他图像产出路径。
- combines_with：`web-artifacts-builder`、`frontend-design` —— 搭建承载该嵌入式编辑器的宿主页面/前端。

---
采编自 sickn33/antigravity-awesome-skills（源 yikuansun/PhotopeaAPI，MIT）。
