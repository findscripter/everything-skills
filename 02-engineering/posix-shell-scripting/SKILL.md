---
name: posix-shell-scripting
title: POSIX Shell 可移植脚本
description: 当需要编写在 dash/ash/BusyBox/bash --posix 等任意 POSIX shell 上可移植运行的脚本时使用；做严格 POSIX sh 脚本的编写、bashism 排查与跨平台校验，产出 #!/bin/sh 脚本与 shellcheck -s sh 通过项；不适用于依赖 bash 专属特性（数组、[[、local、pipefail）或仅单机一次性命令；触发词：POSIX、dash、bashism、可移植脚本
domain: 研发/devops
triggers: [写 POSIX 脚本, dash/ash 兼容, 去 bashism, checkbashisms, 可移植 shell, BusyBox/Alpine 脚本, bash 转 POSIX sh, shellcheck -s sh, init 启动脚本, 嵌入式 shell]
tags: [shell, posix, 可移植性, dash, ash, busybox, shellcheck, 脚本工程, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [shellcheck, shfmt, checkbashisms, dash, ash, bash --posix, mktemp, printf]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- **该用**：脚本要在多种 Unix 类系统/shell 上运行（Linux dash、Alpine/BusyBox ash、macOS、BSD、Solaris）；写 init/启动脚本、容器入口、嵌入式脚本；把 bash 脚本迁移成可移植的 `#!/bin/sh`；需要过 `shellcheck -s sh`、`checkbashisms`、`shfmt -ln posix`。
- **不该用（负边界）**：明确只在 bash 上跑且要用数组、`[[`、`local`、`pipefail`、`${var//}` 等专属特性时——那应写 bash 脚本并用 `#!/bin/bash`；纯一次性、不复用的交互命令也无需为可移植性付出代价。

## 步骤

1. **定目标与约束**：确认目标 shell（至少含 dash + BusyBox ash）、目标平台、必需输入与退出码语义。
2. **写脚本骨架**：`#!/bin/sh` + `set -eu`（POSIX 无 `pipefail`）+ 用法函数 + `-h` 帮助。
3. **遵守 POSIX 约束**（见下「指令」），全程引用变量、`[ ]` 测试、`printf` 输出、`$()` 替换。
4. **加安全/清理**：`trap` 清理临时文件、`umask 077`、`--` 终止选项、输入校验。
5. **静态校验**：`shellcheck -s sh script.sh && shfmt -ln posix -d script.sh && checkbashisms script.sh && sh -n script.sh`。
6. **多 shell 实跑**：在 dash、BusyBox ash、`bash --posix`（必要时 yash）上各跑一遍，容器化复现（`alpine:latest`=ash、`debian:stable`=dash）。

## 指令

**核心约束（POSIX sh 没有的东西，碰到即改）**

- 无数组 → 用位置参数或分隔字符串；无 `[[` → 只用 `[ ]`；无进程替换 `<()`/`>()`；无花括号展开 `{1..10}`。
- 无 `local`/`declare`/`typeset`/`readonly`；无 `+=` 拼接；无 `${var//pat/rep}`；无关联数组；无 `$RANDOM`、`read -a`、`set -o pipefail`、`&>`、`function` 关键字、`echo -e/-n`、`==`。
- 用 `.` 而非 `source`；用 `command -v` 而非 `which`/`type`。

**做法清单**

- 引用所有展开：`"$var"`，绝不裸 `$var`。
- 输出一律 `printf`（`echo` 各实现行为不一）。
- 算术用 `$(( ))`；字符串复杂处理交给 `sed`/`awk`/参数展开。
- 选项解析用 `while` + `case`（POSIX `getopts` 不支持长选项）。
- 命令存在性：`command -v cmd >/dev/null 2>&1 || exit 1`；OS 判别 `uname -s`。
- 显式查错：`cmd || { printf 'failed\n' >&2; exit 1; }`；数值校验 `case $n in *[!0-9]*) exit 1 ;; esac`。
- 绝不对不可信输入 `eval`；安全场景用全路径命令（`/bin/rm`）。
- `IFS` 改动后及时还原；`-h` 显示 synopsis，文档化退出码（0 成功、1 错误、特定码对应特定失败）。

## 示例

安全临时文件 + 清理 trap：

```sh
#!/bin/sh
set -eu
tmpfile=$(mktemp) || exit 1
trap 'rm -f "$tmpfile"' EXIT INT TERM
```

无数组——位置参数模拟数组：

```sh
set -- item1 item2 item3
for arg; do process "$arg"; done
```

分隔字符串拆分（用完还原 IFS）：

```sh
items="a:b:c"
IFS=:; set -- $items; IFS=' '
```

逐行读文件（避免 `for i in $(cat)` 的子shell与分词陷阱）：

```sh
while IFS=: read -r user pass uid gid; do
  printf '%s\n' "$user"
done < /etc/passwd
```

可移植条件与默认值：

```sh
[ -e "$file" ] || exit 1          # 存在性，全平台可用
value=${var:-default}             # var 未设/为空时取默认
```

引号 here-doc 阻止变量展开：`cat <<'EOF' ... EOF`。

## 注意事项

- **常见踩坑**：`[[` 写成 `[`、用数组/`local`、`echo` 代 `printf`、`source` 代 `.`、`&>` 代 `>file 2>&1`、`==` 代 `=`。
- **错误处理**：`set -eu` 后仍需对关键命令显式 `|| exit 1`；成功路径上想取消 EXIT trap 用 `trap - EXIT`。
- **嵌入式/受限环境**：Alpine 默认 ash 非 bash；`mktemp`、`seq`、`timeout` 可能缺失，提供回退（如 `command -v mktemp >/dev/null 2>&1 || mktemp() { ... }`）；`/tmp` 可能只读；信号支持有限。
- **避免 GNU 扩展**：只用 POSIX 指定的标志；`/dev/stdin`、`/dev/stdout` 并非处处可用。
- **质量门槛**：所有展开已引用、无 bashism、临时资源由 EXIT trap 清理、输入校验防注入、在 dash/ash/bash --posix 上均通过。
- **CI**：pre-commit 配 `checkbashisms` + `shellcheck -s sh` + `shfmt -ln posix`；矩阵测试跨 dash/ash/yash 与 Linux/macOS/Alpine。

## 互见

- 测试框架：bats-core / shellspec / shunit2 / sharness（均兼容 POSIX sh）。
- 参考：POSIX.1 Shell Command Language 规范、GNU Autoconf 可移植 shell 指南、Rich's sh tricks（etalabs.net）、checkbashisms 手册。
- 相关条目：bash 高级脚本、shellcheck 静态分析、容器入口脚本编写。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
