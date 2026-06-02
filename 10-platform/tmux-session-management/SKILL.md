---
name: tmux-session-management
title: tmux 会话与终端多路复用
description: 当需要在远程服务器跑断连不死的持久会话、用脚本搭建多窗格终端布局，或在 bash 中非交互编排 tmux 时使用；做会话/窗口/窗格的创建附加销毁、send-keys/capture-pane 无附加驱动与捕获、整套工作区一键脚本及 ~/.tmux.conf 配置；不适用于 GNU screen、SSH 隧道/端口转发本身与窗格内具体业务命令；触发词：tmux、会话保活、send-keys、capture-pane、多窗格、SSH 断连、终端复用
domain: 平台/cli
triggers: [tmux, 会话保活, session, send-keys, capture-pane, 多窗格, split-window, SSH 断连, 终端复用, tmux.conf, detached session, has-session]
tags: [tmux, terminal, multiplexer, session, window, pane, shell, remote, ssh, automation, cli, platform]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [tmux, bash, ssh]
requires: []
related: [posix-shell-scripting, bash-defensive-patterns, busybox-on-windows, powershell-windows]
combines_with: [imessage-claude-bridge, posix-shell-scripting]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于：在远程服务器搭建跨 SSH 断连存活的持久会话；运行需在断连后继续的长任务（部署、训练、构建）；用脚本一键拉起多窗格布局（编辑器 + 测试 + 日志）；在 bash 中**非交互**地驱动 tmux（创建会话、注入命令、抓取输出做轮询）。识别信号：用户提到「断连后任务还在跑」「一个脚本开好整套终端」「不进 tmux 也能给某窗格发命令」。

不该用：不负责 GNU `screen`（机制相近但命令不同，需求明确指 screen 时转交）；不实现 SSH 本身的隧道/端口转发/密钥管理（tmux 只搭在 SSH 之上）；不替代窗格内运行的具体业务命令（如 docker、vim、npm 的用法属各自技能）。

## 三级模型与步骤

tmux 三层：**session**（顶层，断连存活）> **window**（会话内的标签页）> **pane**（窗口内的分屏）。一切既可从外部 `tmux <命令>` 控制，也可在内部用前缀键（默认 `Ctrl-b`，下文记作 Prefix）操作。脚本化首选**外部命令**。

非交互编排标准流程：
1. **幂等守门**：先 `tmux has-session -t NAME 2>/dev/null` 判断，存在则附加、否则新建，避免重复建会话。
2. **建后台会话并给定尺寸**：`tmux new-session -d -s NAME -x 220 -y 50`。`-d` 后台；`-x/-y` 必给，否则窗格可能 0x0，检测终端尺寸的程序会异常。
3. **布局**：`new-window` 建窗口、`split-window -h/-v` 分屏。
4. **注入命令**：`tmux send-keys -t 目标 "cmd" Enter`（`Enter` 大写，缺它只输入不执行）。
5. **读输出**：`tmux capture-pane -t 目标 -p` 拿窗格内容，可接 `grep` 做轮询等待。
6. 收尾 `tmux attach -t NAME`（人接管）或留后台。

目标定位语法：`session:window.pane`（如 `dev:editor.1`、`work:2`、`work:1.0`）。

## 指令速查

会话：
- `tmux new-session -s work` / `-d` 后台 / `-d -s build "make all"` 建后台并跑命令
- `tmux attach -t work`（裸 `attach` 接最近一个）；内部 Prefix+d 分离
- `tmux ls`（= list-sessions）；`tmux kill-session -t work`；`-a` 杀除当前外全部
- `tmux rename-session -t old new`；`tmux switch-client -t other`
- `tmux has-session -t work 2>/dev/null && echo exists`（脚本判存在）

窗口：
- `tmux new-window -t work -n logs`；`-t work:3 -n server "python -m http.server 8080"`
- `tmux list-windows -t work`；`tmux select-window -t work:logs`
- `tmux rename-window -t work:2 editor`；`tmux kill-window -t work:logs`；`tmux move-window -s work:3 -t work:1`
- 内部：Prefix+c 新建 / `,` 改名 / `&` 关闭 / n,p 上下个 / 0-9 跳号

窗格：
- `tmux split-window -h -t work:1`（左右）/ `-v`（上下）/ 追加命令 `-h -t work:1 "tail -f /var/log/syslog"`
- `tmux select-pane -t work:1.0`；`tmux resize-pane -t work:1.0 -R 20`（向右扩 20 列，方向 -L/-R/-U/-D）；`-Z` 切换缩放（全屏）
- `tmux swap-pane -s work:1.0 -t work:1.1`；`tmux kill-pane -t work:1.1`
- 内部：Prefix+% 竖分 / `"` 横分 / 方向键导航 / z 缩放 / x 杀 / `{`,`}` 与前后交换

无附加驱动窗格（自动化核心）：
- `tmux send-keys -t work:1.0 "ls -la" Enter`
- `tmux send-keys -t work:1.0 C-c`（发 Ctrl+C 停进程）
- `tmux send-keys -t work:1.0 "git commit -m '"`（不带 Enter，预填提示）
- `tmux capture-pane -t work:1.0 -p | grep ERROR`（抓输出过滤）
- `tmux pipe-pane -t work:1.0 "cat >> ~/session.log"`（把窗格输出持续落盘）

复制模式/缓冲：Prefix+`[` 进入（向上翻屏），vi 模式下 `/`,`?` 搜索、Space 起选、Enter 复制、q 退出；Prefix+`]` 粘贴。`tmux list-buffers` / `show-buffer` / `save-buffer /tmp/out.txt` / `load-buffer /tmp/data.txt`。

## 示例

一键开发工作区脚本（幂等，最有价值的模式）：

```bash
#!/usr/bin/env bash
set -euo pipefail
SESSION="dev"

# 已存在则直接附加
tmux has-session -t "$SESSION" 2>/dev/null && {
  echo "Session $SESSION 已存在，附加中..."
  tmux attach -t "$SESSION"; exit 0
}

# 建会话 + 首个窗口（给定尺寸）
tmux new-session -d -s "$SESSION" -n editor -x 220 -y 50

# 窗口1：编辑器 + 测试并排
tmux send-keys -t "$SESSION:editor" "vim ." Enter
tmux split-window -h -t "$SESSION:editor"
tmux send-keys -t "$SESSION:editor.1" "npm test -- --watch" Enter
tmux select-pane -t "$SESSION:editor.0"

# 窗口2：服务 + 日志
tmux new-window -t "$SESSION" -n server
tmux send-keys -t "$SESSION:server" "docker compose up" Enter
tmux split-window -v -t "$SESSION:server"
tmux send-keys -t "$SESSION:server.1" "tail -f logs/app.log" Enter

tmux new-window -t "$SESSION" -n shell
tmux select-window -t "$SESSION:editor"
tmux attach -t "$SESSION"
```

可复用自动化函数：

```bash
# 幂等会话：建或附加
ensure_session() {
  local name="$1"
  tmux has-session -t "$name" 2>/dev/null || tmux new-session -d -s "$name"
  tmux attach -t "$name"
}

# 轮询等待某窗格出现指定输出
wait_for_output() {
  local target="$1" pattern="$2" timeout="${3:-30}" elapsed=0
  while (( elapsed < timeout )); do
    tmux capture-pane -t "$target" -p | grep -q "$pattern" && return 0
    sleep 1; (( elapsed++ ))
  done
  return 1
}
```

远程 / SSH 工作流：

```bash
# SSH 进去直接附加，没有则新建
ssh user@host -t "tmux attach -t work || tmux new-session -s work"
# 远程发后台部署，断连不影响
ssh user@host "tmux new-session -d -s deploy 'bash /opt/deploy.sh'"
# 只读附加旁观（不会误输入），适合共享/结对
ssh user@host -t "tmux attach -t deploy -r"
```

`~/.tmux.conf` 关键配置：

```bash
unbind C-b; set -g prefix C-a; bind C-a send-prefix  # 前缀改 Ctrl-a
set -g mouse on                       # 鼠标支持
set -g base-index 1; setw -g pane-base-index 1; set -g renumber-windows on
set -g history-limit 50000            # 加大回滚缓冲
setw -g mode-keys vi                  # 复制模式用 vi 键
set -s escape-time 0                  # 去掉 ESC 延迟
bind r source-file ~/.tmux.conf \; display "Config reloaded"  # 热重载
bind | split-window -h -c "#{pane_current_path}"  # | 竖分、保持当前目录
bind - split-window -v -c "#{pane_current_path}"
```

## 注意事项

- **脚本里永远命名会话**（`-s name`）：匿名会话难以可靠定位。
- **建后台会话务必带 `-x/-y`**：否则窗格 0x0，依赖终端尺寸的程序出错。
- **自动化用 `send-keys ... Enter`** 而非管道喂 stdin：即便目标窗格在跑交互程序也有效；`Enter` 必须大写，否则只输入不回车。
- **幂等守门** `has-session ... || new-session -d`：避免每次跑都建重复会话。
- 安全：`send-keys` 不经确认直接在窗格执行命令，**下手前核对 `-t session:window.pane` 目标**，防止误发到错误窗格；共享会话给协作者用 `-r` 只读附加；勿把密钥写进窗口/窗格标题或会话环境变量（共享机上易泄露）。
- 常见坑：报 `no server running` → 先 `tmux start-server` 或先建一个后台会话；复制模式选择异常 → 确认 `~/.tmux.conf` 里 `mode-keys vi`/`emacs` 与习惯一致。
- 把 `~/.tmux.conf` 纳入版本控制，跨机一致可复现。

## 互见

- requires：`posix-shell-scripting` —— tmux 编排脚本本身就是 shell 脚本，需先具备健壮脚本能力
- related：`bash-defensive-patterns` —— 用 `set -euo pipefail`、幂等守门等防御式写法包裹 tmux 编排
- combines_with：`ai-native-cli-design` —— 设计供 Agent 非交互驱动的 CLI 工作流时，tmux 提供后台会话与输出捕获的承载层

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
