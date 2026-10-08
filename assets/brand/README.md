# Everything Skills 品牌素材

“开卷互见”以左页的 E、右页的关系节点和延伸金线表达项目的分类、技能与互见网络。深墨绿 `#111d1a` 为底色，纸色 `#f3eddc` 为主体，暖金 `#deb46c`、玉色 `#90b8a7`、珊瑚 `#e88f76` 为点缀。

| 素材 | 用途 |
| --- | --- |
| [logo.svg](logo.svg) / [logo-static.svg](logo-static.svg) | 192 × 192 动画与静态 Logo |
| [hero.svg](hero.svg) / [hero-static.svg](hero-static.svg) | README 动画与静态横幅 |
| [hero-mobile.svg](hero-mobile.svg) / [hero-mobile-static.svg](hero-mobile-static.svg) | 窄屏动画与静态横幅 |
| [stats.svg](stats.svg) / [stats-mobile.svg](stats-mobile.svg) | 从项目索引生成的统计概览 |
| [workflow.svg](workflow.svg) / [workflow-static.svg](workflow-static.svg) / [workflow-mobile.svg](workflow-mobile.svg) | 发现、关联、组合流程 |
| [preview.html](preview.html) | 本地浏览器预览，含窄屏布局 |

SVG 使用内置 CSS 动画，8–12 秒缓慢循环；没有 JavaScript、外部字体或资源请求。动画尊重 `prefers-reduced-motion`，主体在动画关闭时仍完整可见。静态版本完全没有动画，可用于分享或不支持动画的阅读器。

README 以图片方式引用素材，不依赖 README 注入 CSS。窄屏通过 `<picture>` 选择竖向或两列布局；减少动态效果时直接选静态 SVG，避免仅依赖 SVG 内部媒体查询。GitHub 上线后的动画仍受访问者浏览器和图像缓存行为影响。

兼容性依据：[GitHub 图片与 picture 说明](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github)、[MDN 的 SVG 图片模式说明](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image)。

`logo.svg` 与 `logo-static.svg` 是矢量源文件；其余 SVG 由 `scripts/build-brand.mjs` 生成。通常运行 `npm run build:zh` 或 `npm run build` 即可同时更新索引、统计和 README；只刷新品牌素材可运行 `npm run build:brand:zh` 或 `npm run build:brand`，前提是索引已经最新。请勿手工维护 SVG 中的统计数字。

本仓库原创 SVG 素材按根目录 [LICENSE](../../LICENSE) 的原创部分 CC BY 4.0 使用，并保留 Everything Skills / findscripter 署名。
