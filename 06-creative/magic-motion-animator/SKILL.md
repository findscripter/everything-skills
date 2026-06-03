---
name: magic-motion-animator
title: AI 动效动画生成
description: 当需要给静态 Logo、UI、图标或社媒素材加 AI 驱动的高级动效时使用；按品类选预设、用 AI 助手以提示词生成运动并微调关键帧，导出 Lottie(JSON)/GIF/MP4 集成到 Web、App 或社媒；不适用于一行 CSS transition 的简单过渡、3D/视频剪辑或代码级动画编排；触发词：Logo 动效、UI 动画、图标动效、微交互、Lottie、动起来
domain: 创意/av
triggers: [让 Logo 动起来, Logo 动效, UI 动画, 界面动效, 图标动效, 微交互动画, 品牌动效揭示, loading 动画, 导出 Lottie, social media 动画素材, 把静态设计做成动画, magic animator]
tags: [创意, av, 动效, 动画, Lottie, 微交互, Logo 动效, UI 动画, 社媒素材]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Magic Animator, Lottie, SVG, Figma]
requires: []
related: [animejs-web-animation, demo-video-generator, design-spells-microinteractions, fal-ai-media-generation]
combines_with: [slack-gif-creator, theme-factory]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
借助 [Magic Animator](https://magicanimator.com/) 以 AI 驱动的运动，把静态 Logo、界面、图标与社媒素材在数秒内变成高级、动感的体验。核心是通过聊天式提示词请求「有意图、显高级」的运动，而非套用平庸的线性动画。先想清楚要传达的情绪与品牌调性，再动手。

## 何时使用

适用于以下场景：

- 给静态 Logo / 品牌标识注入生命力，让它更具记忆点。
- 为网站 / App UI 增加 loading、动态控件或平滑转场。
- 为图标和微交互加动效，用动感引导用户行为。
- 需要导出 Lottie/GIF/MP4 直接集成到 Web、移动端或社媒投放。

不该用边界（负边界）：

- 一行 CSS `transition`（如悬停显隐、`opacity .2s`）就能解决的简单过渡，无需引入动效工具。
- 需要逐帧代码级编排时间线 / stagger / SVG 路径的，用 `animejs-web-animation`；3D、真人实拍或剪辑已有视频素材也不在范围内。
- 任务范围不明、缺目标素材或成功标准时，先停下澄清再动手。

## 步骤

1. **选素材（Select Asset）**：锁定要动画的静态元素——SVG、PNG 或 Figma 图层。矢量（SVG）通常动效质量最佳。
2. **选品类 / 预设（Choose Category）**：按上下文挑对应域——Logos / UI / Icons / Social Media——以保证运动曲线契合场景。
3. **生成动效（Animate）**：用 AI 动画助手以聊天提示词请求具体且高级的运动，例如「Make it feel like a high-end luxury brand reveal」或「Give it a kinetic, elastic pop」。
4. **微调（Refine）**：如支持，编辑关键帧进一步打磨，确保缓动曲线自然、高级，运动节奏不拖沓也不杂乱。
5. **导出与集成（Export & Integrate）**：Web / 移动端优先导出 **Lottie（JSON）**（清晰、体积小、可缩放）；社媒投放导出 **GIF / MP4**。

## 指令

- **创意硬性要求**：用本技能构建现代、有创意、视觉惊艳的 UI/UX，制造「wow」时刻；不要退回平庸的线性动画。
- **运动要有意图（Purposeful Motion）**：每个动画都应显得刻意且高级；避免杂乱或过快的运动干扰核心体验。
- **格式纪律（Format Discipline）**：原生 App 与 Web 集成优先 Lottie，以保持清晰度和低体积；仅在社媒等位图场景才用 GIF/MP4。

## 示例

用户：「帮这个公司 Logo 做一个高级感的入场动效，要放在官网首屏。」

执行要点：
1. 选素材：取 Logo 的 SVG（矢量优先），便于缩放且动效更干净。
2. 选品类：Logos 预设，确保曲线偏品牌揭示而非 UI 交互。
3. 提示词生成：在 AI 助手输入「Make it feel like a high-end luxury brand reveal, with a smooth elastic settle」。
4. 微调关键帧：让收尾缓动自然，末帧停留约 1-2s，节奏不抢戏。
5. 导出 Lottie(JSON) 交付前端，集成到首屏。

## 注意事项

- 仅在任务确实落在上述范围时使用，避免为简单需求过度设计。
- 输出动效不能替代具体环境的验证、测试与专家评审，务必在目标浏览器/设备实测性能与观感。
- 缺少必要素材、权限、安全边界或成功标准时，先停下询问澄清再继续。
- Magic Animator 为第三方在线服务，涉及上传品牌资产时注意版权与数据合规。

## 互见

- related：`animejs-web-animation` —— 需要代码级、可控的时间线/stagger/SVG 编排时改用它；本技能聚焦在线 AI 一键生成。
- related：`design-spells-microinteractions` —— 微交互设计模式。
- related：`glassmorphism-ui-design` —— 配套视觉风格。
- combines_with：`frontend-design` —— 把导出的 Lottie 集成进前端实现。
- combines_with：`demo-video-generator` —— 动效素材纳入产品演示视频。
- combines_with：`ui-design-system-builder` —— 动效作为设计系统的运动规范一环。

---
采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT License）。
