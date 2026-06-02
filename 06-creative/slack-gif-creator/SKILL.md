---
name: slack-gif-creator
title: Slack 动图制作器（slack-gif-creator）
description: 当需要为 Slack 生成符合其尺寸/体积约束的动画 GIF（表情或消息配图）时使用；用 Python PIL 逐帧绘制并经 GIFBuilder 量化优化产出 .gif，再用校验器确认达标；不适用于静态图、视频/MP4、真人照片合成或非 Slack 平台的通用动图；触发词：Slack GIF、Slack 表情动图、animated GIF for Slack、自定义 emoji 动图、做个 GIF、slack-gif-creator
domain: 创意/image
triggers: [Slack GIF, Slack 表情动图, animated GIF for Slack, 自定义 emoji 动图, 做个 GIF, slack-gif-creator]
tags: [slack, gif, animation, pillow, image, emoji, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pillow, imageio, numpy, core.gif_builder, core.validators, core.easing, core.frame_composer]
requires: []
related: [demo-video-generator, videodb-perception-editing]
combines_with: [slack-bolt-bot-builder, demo-video-generator]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
## 何时使用

- 用户要为 Slack 做动画 GIF：自定义表情（emoji）或消息里的动图，例如“给 Slack 做个 X 在做 Y 的 GIF / 做个 Slack 表情动图”。
- 需要程序化逐帧绘制动画（弹跳、抖动、旋转、脉冲、粒子等），并自动满足 Slack 的尺寸与体积约束。
- 用户上传了图片，希望把它“做成动图 / 拆成帧 / 以它为风格参考”。

不该用的边界：
- 只要静态图、海报、单帧设计 → 不需要本技能（动图能力是核心）。
- 要视频 / MP4 / WebM、或真人照片级合成、AI 文生图 → 超出范围。
- 目标平台不是 Slack（通用网页动图、Lottie、APNG 等）→ 约束不同，本技能的优化参数不适配。

## 步骤

1. 确认意图与目标类型：emoji（建议 128x128）还是消息 GIF（480x480）。明确动画内容与时长。
2. 装依赖：`pip install pillow imageio numpy`（源 requirements 还含 `imageio-ffmpeg`）。
3. 用 `GIFBuilder` 初始化画布与帧率，循环用 PIL `ImageDraw` 逐帧绘制并 `add_frame()`。
4. 运动用 `core.easing.interpolate(...)` 做缓动，避免线性生硬。
5. `save()` 时按目标设量化参数；emoji 用 `optimize_for_emoji=True`。
6. 用 `core.validators` 校验是否达标，不达标再回到优化策略调参。
7. 仅当用户明确要“更小”时才执行体积优化（降帧、减色、缩尺寸、去重帧）。

指令（核心 API，签名忠实于源码）：

```python
from core.gif_builder import GIFBuilder
from PIL import Image, ImageDraw

builder = GIFBuilder(width=128, height=128, fps=10)
for i in range(12):
    frame = Image.new('RGB', (128, 128), (240, 248, 255))
    draw = ImageDraw.Draw(frame)
    # 用 PIL 图元绘制：ellipse / polygon / line / rectangle（outline width>=2）
    builder.add_frame(frame)          # 也可 add_frames(list)
builder.save('output.gif', num_colors=48, optimize_for_emoji=True, remove_duplicates=True)
```

```python
# 缓动：t 从 0.0 到 1.0
from core.easing import interpolate
t = i / (num_frames - 1)
y = interpolate(start=0, end=400, t=t, easing='ease_out')
# 可用：linear, ease_in, ease_out, ease_in_out, bounce_out, elastic_out, back_out

# 校验
from core.validators import validate_gif, is_slack_ready
passes, info = validate_gif('output.gif', is_emoji=True, verbose=True)
if is_slack_ready('output.gif'):
    print("Ready!")

# 现成帧辅助
from core.frame_composer import (
    create_blank_frame, create_gradient_background,
    draw_circle, draw_text, draw_star,
)
```

Slack 约束（务必满足）：
- 尺寸：emoji 128x128（建议）；消息 GIF 480x480。
- FPS 10-30（越低体积越小）；颜色 48-128（越少越小）；emoji 时长建议 < 3 秒。

## 示例

弹跳的小球（emoji，128x128）：
```python
from core.gif_builder import GIFBuilder
from core.easing import interpolate
from core.frame_composer import create_gradient_background, draw_circle

n = 12
builder = GIFBuilder(width=128, height=128, fps=10)
for i in range(n):
    t = i / (n - 1)
    y = interpolate(start=20, end=100, t=t, easing='bounce_out')  # 自由落体+落地回弹
    frame = create_gradient_background(128, 128, (250, 250, 255), (200, 220, 255))
    draw_circle(frame, center=(64, int(y)), radius=18,
                fill_color=(255, 120, 60), outline_color=(120, 40, 0), outline_width=3)
    builder.add_frame(frame)
builder.save('bounce.gif', num_colors=48, optimize_for_emoji=True, remove_duplicates=True)
```

## 注意事项

- 让画面“精致”而非占位感：outline/line 一律 `width>=2`；用渐变背景、分层叠加（如星里套小星）、互补高饱和配色、深浅描边制造对比。复杂形状（心形、雪花）用 polygon+ellipse 组合并对称计算关键点。
- 禁止假设：不要用 emoji 字体（跨平台不可靠），也不要假设本技能内置了现成图形素材——一切从 PIL 图元画起。
- 用户上传图片时先判断意图：直接动画化/拆帧（`Image.open(...)` 直接用）还是仅作色彩/风格参考。
- 体积优化只在被要求“更小”时做，按需组合：降 FPS、减 `num_colors`（如 48）、缩到 128x128、`remove_duplicates=True`、`optimize_for_emoji=True`（自动缩到 128、压色、降帧到约 12）。
- 动画概念可组合：抖动/脉冲用 `math.sin/cos`；旋转用 `image.rotate(angle, resample=Image.BICUBIC)`；淡入淡出用 RGBA alpha 或 `Image.blend`；滑入用 `ease_out`、需过冲用 `back_out`；粒子爆炸给每个粒子随机角度+速度并逐帧加重力、淡出。
- 这是 Apache-2.0 来源转写；`core.*` 工具模块与源仓库同目录，调用前确认相对导入路径可用。

## 互见

- canvas-design：需要更通用的版面/视觉设计或单帧构图时配合。
- algorithmic-art：要程序化生成图案、粒子、几何美术作为帧素材时配合。
- theme-factory：需要统一配色/主题风格来约束 GIF 视觉时配合。
