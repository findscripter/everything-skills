---
name: computer-use-agents
title: 计算机操作型 AI 智能体构建
description: 当需要构建像人一样看屏幕、移鼠标、点击、输入的计算机操作型智能体时使用；做感知-推理-执行循环、Docker 沙箱隔离、敏感操作确认、动作日志与成本/上下文控制的可落地方案（含 Anthropic Computer Use、Playwright 浏览器自动化）；不适用于纯文本/纯 API 任务，也不适用于直接在真实主机上裸跑智能体。触发词：computer use、桌面自动化、屏幕控制 AI、视觉智能体、浏览器智能体、GUI 自动化、Operator
domain: 智能/agents
triggers: [computer use, 桌面自动化智能体, 屏幕控制 AI, 视觉智能体, GUI 自动化, Claude computer use, OpenAI Operator, 浏览器智能体, RPA AI, Playwright 自动化]
tags: [AI智能体, 计算机操作, 视觉模型, 沙箱安全, 浏览器自动化, 提示注入防御, Anthropic, Playwright]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [anthropic, pyautogui, playwright, docker, xdotool]
requires: []
related: [autonomous-coding-agent-patterns, browser-automation-builder, computer-vision-expert, agent-tool-builder]
combines_with: [langgraph-agent-framework, multi-agent-system-designer, full-page-screenshot]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

需要构建「像人一样操作计算机」的智能体：截屏看界面、移动光标、点击按钮、键盘输入，覆盖 Anthropic Computer Use、OpenAI Operator/CUA 及开源方案。典型场景：

- 从零搭建桌面/全屏控制智能体，把视觉模型接到鼠标键盘上。
- 浏览器内自动化（表单填写、数据抓取、网页流程）。
- 重复性、可后台跑、对准确率要求高于速度的任务。

不该用：
- 纯文本或纯 API 即可完成的任务——别套视觉循环，浪费 token 且更不可靠。
- 纯网页任务但有稳定 DOM/可访问性树时——优先结构化的 Playwright，而非像素级视觉。
- 直接在你的真实主机上裸跑智能体——风险极高，必须沙箱（见注意事项）。

## 步骤

1. 搭好感知-推理-执行循环：截屏 → 视觉模型决策 → 执行动作 → 观察结果，循环至完成。必须设 `max_steps`（建议 50）防失控。
2. 用 Docker 沙箱隔离运行：非 root 用户、`--cap-drop ALL`、网络白名单或 `--network none`、只读根文件系统、CPU/内存/超时上限。
3. 选实现方式：全桌面控制用 Anthropic Computer Use（带 `betas=["computer-use-2024-10-22"]`，screenshot/mouse/keyboard/bash/text_editor 工具）；纯网页用 Playwright 走可访问性树 + 可交互元素列表，更快更省更准。
4. 在敏感动作前加确认门（ConfirmationGate）：按 LOW/MEDIUM/HIGH/CRITICAL 分级，购买、登录、输密码、转账等强制人工确认。
5. 全程动作日志：时间戳、动作参数（脱敏）、前后截图、成败、模型推理，落 JSONL，便于审计与回放。
6. 控成本与上下文：降分辨率（1280×800 或更低）、必要时 JPEG、裁剪、按需才传截图；只保留近 N 张截图，长任务做 checkpoint 或拆子任务。

## 指令

- 循环：每步先 `screenshot`，再让模型输出 JSON 动作（click/type/key/scroll/done），解析失败用正则兜底提取 `\{[^}]+\}`，动作间留 0.5s 让 UI 刷新。
- 最小沙箱命令（CRITICAL，永远别省）：

```bash
docker run -it --rm \
    --security-opt no-new-privileges \
    --cap-drop ALL \
    --network none \
    --read-only \
    --tmpfs /tmp \
    --memory 2g --cpus 1 \
    computer-use-sandbox
```

- Anthropic 工具版本：`computer_20251124`（Opus 4.5，多 zoom 缩放）/ `computer_20250124`（其他模型）。bash 工具须拦截 `rm -rf`、`mkfs`、`dd if=`、`> /dev/` 等危险命令并设 30s 超时。
- 提示注入扫描：处理网页文本前匹配 `ignore.*instructions`、`disregard.*previous`、`you are now`、`act as if` 等模式，命中则拒绝。

## 示例

最小感知-推理-执行循环（pyautogui 版要点）：

```python
class ComputerUseAgent:
    def __init__(self, client, model="claude-sonnet-4-20250514"):
        self.client, self.model = client, model
        self.max_steps, self.action_delay = 50, 0.5

    def capture_screenshot(self):
        s = pyautogui.screenshot().resize((1280, 800), Image.LANCZOS)
        buf = io.BytesIO(); s.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()

    def run(self, task):
        # 每步：截屏 -> 带图发模型 -> 解析 JSON 动作 -> 执行 -> sleep
        # 动作类型: click / type / key / scroll / done
        ...
```

浏览器结构化方案（Playwright）核心：用 `page.accessibility.snapshot()` + `querySelectorAll('a,button,input,select,textarea,[role="button"]')` 取可交互元素（截断前 50 个省 token），喂给模型按 id>name>class>文本 选 CSS 选择器执行 navigate/click/type/extract。

人性化抗检测（视觉智能体会精准点中心，易被反爬识别）：

```python
def humanized_click(x, y):
    return x + int(random.gauss(0, 5)), y + int(random.gauss(0, 5))
def humanized_delay():
    d = random.uniform(0.3, 0.8)
    if random.random() < 0.2: d += random.uniform(0.5, 2.0)
    time.sleep(d)
```

## 注意事项

- 网页内容能劫持你的智能体（CRITICAL）：每个网页、广告、嵌入文档都是提示注入向量；已有真实案例（Copilot 被恶意邮件诱导导出 CRM、Gemini 被日历邀请隐藏指令操纵删事件）。纵深防御：沙箱 + 注入分类器 + 敏感动作确认 + 限定/临时凭证，无单一银弹。
- 在真实主机裸跑（CRITICAL）：智能体会误判、点错、被注入，且无撤销。务必沙箱 + 非 root + 网络/文件系统限制 + 资源上限 + 动作确认 + 日志，七层叠加。
- 复杂控件不可靠（HIGH）：下拉框、滚动条、拖拽、悬浮菜单、canvas 视觉模型难搞（官方亦承认）。对策：能用键盘就用键盘（聚焦后打字母 + Enter 选项）、把拖拽拆成 down→分步 move→up、网页回退到 `page.select_option` 等 DOM 操作、动作后做验证（如对比 `window.scrollY`）。
- 截图吃满上下文（HIGH）：每张约 1500-3000 token，模型每轮重看全部历史截图，呈二次增长。只留近 10 张、旧的转文字摘要、做 checkpoint、拆子任务。
- 成本易失控（HIGH）：50 轮 × 平均 25 图可达 5-10 美元/任务。加 CostTracker 设 `max_cost_per_task`，降分辨率/JPEG/裁剪/按需传图，简单决策用更便宜模型分级。
- 慢 2-5 倍（MEDIUM）：单动作 2-7s，接受「换准确率与无人值守」的取舍，给用户真实时长预期。
- 验证红线：无沙箱=ERROR；沙箱全网络/容器 root=ERROR；无 `--cap-drop ALL`、无 seccomp、无 `max_steps`、无超时、无内存上限、无成本跟踪=WARNING。

## 互见

- 纯网页自动化 → 浏览器自动化（Playwright/Selenium 对网页更高效）。
- 沙箱与注入防御审查 → 安全专家。
- 容器编排与横向扩展 → DevOps（Kubernetes/Docker Swarm）。
- 视觉模型选型与提示工程 → LLM 架构。
- 多个操作智能体协同 → 多智能体编排。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
