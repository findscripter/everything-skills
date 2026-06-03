---
name: rsvp-speed-reader
title: RSVP 快速阅读器
description: 当需要让用户以 400–800+ WPM 速读长文本或 Agent 的长回复、又不愿逐行滚动时使用；做生成一个单页 RSVP 速读器（逐词闪现 + Spritz 式 ORP 红字对齐 + 速度/暂停控制）的 HTML 产物；不适用于需对照、跳读、做笔记、看代码块/表格或精读校对的场景。触发词：RSVP、速读、快速阅读、Spritz、ORP、逐词闪现
domain: 通用/learning
triggers: [RSVP, 速读, 快速阅读, 逐词闪现, Spritz, ORP, speed read, WPM, 一个词一个词地读, 把回复做成速读]
tags: [速读, RSVP, Spritz, 阅读辅助, 前端单页应用, 通用, 可访问性]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [html, javascript]
requires: []
related: [bullet-point-structurer, socratic-explainer, interactive-pdf-viewer, multi-source-knowledge-synthesis]
combines_with: [web-artifacts-builder, youtube-transcript-ingest, interactive-pdf-viewer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 用户想以 400–800+ WPM 速读一段长文本、文章，或 Agent 刚产出的一大段回复，懒得逐行滚动。
- 用户显式提到 RSVP、Spritz、ORP、逐词闪现、speed read、WPM。
- 需要一个零依赖、可离线打开的单页 HTML 阅读器，带速度调节与暂停/续读。

不该用（RSVP 的固有短板，这些场景会丢信息或更慢）：

- 需要回看、对照、跳读、做笔记或高亮的精读 / 校对。
- 内容含代码块、表格、公式、长 URL、ASCII 图——逐词闪现破坏其二维结构，应原样展示。
- 重排版分词不可靠的语言或混排（含大量 CJK 无空格分词、富 emoji），先评估分词质量。
- 有光敏性癫痫风险或前庭不适的用户——高频闪烁可能不适，需提供降速与停止。

## 步骤

1. 取文本：默认对「当前要呈现给用户的长文本」操作（如 Agent 上一段长回复），或用户粘贴的文本。
2. 分词：按空白切成 token，保留紧跟的标点；超长 token（>13 字符）可按音节/连字符再切。
3. 算 ORP（最佳识别点 / Optimal Recognition Point）：每个词选一个略偏左的「焦点字母」，渲染时该字母染红并在水平方向对齐到固定参考线 —— 这是 Spritz 风格的核心，让眼睛几乎不必移动。常用规则按词长定 ORP 下标：
   - 1 → 0；2–5 → 1；6–9 → 2；10–13 → 3；≥14 → 4。
4. 定时闪现：按目标 WPM 计算每词基准停留 `60000 / WPM` 毫秒；对长词、句末标点（. ! ? 。！？）适当延长（如 ×1.5），给大脑断句缓冲。
5. 控件：速度滑杆（100–1000 WPM）、播放/暂停（空格）、上一词/下一词、重启、进度条；暂停时显示当前词的上下文便于定位。
6. 产出：写成一个自包含 `index.html`（内联 CSS/JS，无外部依赖），可直接双击打开。

## 指令

实现要点（保留源约束：600+ WPM、RSVP、Spritz 式 ORP 高亮）：

- 三段式布局让 ORP 字母绝对居中：`左片段 | 焦点字母(红) | 右片段`，三块用等宽字体，焦点字母固定在中心参考线，左右片段向两侧伸展。等宽字体保证对齐稳定。
- 焦点字母用醒目色（典型为红 `#d33`），其余字符常规色；中心可加一条细参考线辅助定位。
- WPM→毫秒：`ms = 60000 / wpm`；句末/逗号/长词加权延时，避免「读完了但没记住」。
- 键盘可达性：空格=播放/暂停，←/→=逐词，上/下=调速；尊重 `prefers-reduced-motion`，并提供显眼的停止与降速。
- 纯前端、可离线；不外联网络，不上传文本（隐私）。

最小 ORP 计算（JS）：

```js
function orpIndex(word) {
  const n = word.length;
  if (n <= 1) return 0;
  if (n <= 5) return 1;
  if (n <= 9) return 2;
  if (n <= 13) return 3;
  return 4;
}
function splitWord(word) {
  const i = orpIndex(word);
  return { left: word.slice(0, i), pivot: word[i], right: word.slice(i + 1) };
}
const delay = wpm => 60000 / wpm; // 每词基准毫秒
```

## 示例

提示词：

> 把你上面那段回复做成 RSVP 速读器，默认 500 WPM，Spritz 式红色 ORP 对齐，生成可直接打开的 index.html。

最小渲染骨架（HTML + 内联脚本，节选）：

```html
<div id="reader" style="font-family:monospace;font-size:48px">
  <span id="l"></span><span id="p" style="color:#d33"></span><span id="r"></span>
</div>
<input id="wpm" type="range" min="100" max="1000" value="500">
<script>
  const words = TEXT.split(/\s+/).filter(Boolean);
  let i = 0, timer = null;
  const wpm = () => +document.getElementById('wpm').value;
  function show() {
    const { left, pivot, right } = splitWord(words[i] || '');
    l.textContent = left; p.textContent = pivot || ''; r.textContent = right;
  }
  function tick() {
    show();
    const long = (words[i] || '').length > 9 ? 1.5 : 1;
    i = (i + 1) % words.length;
    timer = setTimeout(tick, (60000 / wpm()) * long);
  }
  tick(); // 空格暂停/续读自行绑定
</script>
```

## 注意事项

- 600+ WPM 是上限不是默认：先从 ~300–400 WPM 起步让用户适应，再调高；过快只剩「看过」没有「读懂」。
- RSVP 牺牲回看换速度，理解率在高速下显著下降；重要 / 需精读的内容别用，或读完提示「需要时回看原文」。
- 分词与标点处理决定体验：缩写、数字、带连字符词、中文无空格文本都是坑，先验证分词质量。
- 可访问性是硬要求：提供降速与停止，尊重 `prefers-reduced-motion`，对光敏用户给警示。
- 焦点字母务必用等宽字体并真正对齐到中心，否则眼睛仍要扫动，ORP 优势丧失。
- 始终纯本地处理文本，不外传（隐私）。

## 互见

- related：`bullet-point-structurer` —— 速读前先把长回复结构化，分词与断句更友好。
- related：`caveman-compressed-mode` —— 与其飞速读冗长文本，不如先压缩 token 再读。
- combines_with：`web-artifacts-builder` —— 把 RSVP 阅读器封装成更完整的单页 Web 工件。

---

采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) 的 claude-speed-reader 技能（MIT 许可），其上游源为 [SeanZoR/claude-speed-reader](https://github.com/SeanZoR/claude-speed-reader）。源条目为占位骨架，本条目按 RSVP / Spritz ORP 通行算法做中文适配重写并补全可执行细节，非逐字翻译。
