---
name: bash-defensive-patterns
title: 防御式 Bash 脚本生产实践
description: 当编写生产级 Bash 脚本、CI/CD 流水线或系统运维工具、需要容错与安全时使用；做严格模式、入参校验、错误陷阱/清理、日志与 dry-run 的防御式编码并产出可复用脚本模式；不适用于一次性临时命令或必须严格 POSIX sh 的环境；触发词：bash脚本、set -Eeuo pipefail、shell容错
domain: 研发/devops
triggers: [写 Bash/shell 脚本, CI/CD 流水线脚本, 系统运维/部署自动化, set -Eeuo pipefail / 严格模式, trap 错误处理与清理, mktemp 临时文件安全, 脚本入参解析与校验, dry-run / 幂等脚本, shell 脚本日志, 脚本依赖检查]
tags: [bash, shell, 脚本, 防御式编程, 错误处理, ci/cd, 运维自动化, 幂等, 研发, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Write, Edit, Read]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：编写生产自动化脚本、CI/CD 流水线脚本、系统运维工具、需容错的部署脚本、必须安全处理边界情况的脚本、可维护的 shell 函数库，以及需要结构化日志/监控或跨平台运行的脚本。

不该用（负边界）：
- 只需一条临时 shell 命令而非脚本时。
- 目标环境强制要求严格 POSIX `sh`（本技能依赖 Bash 特性，如 `[[ ]]`、数组、`mapfile`）。
- 任务与 shell 脚本/自动化无关。
- 不能替代针对具体环境的验证、测试与专家评审；缺少输入、权限、安全边界或验收标准时应先停下来澄清。

## 步骤

1. 确认目标 shell、操作系统与执行环境（Bash 版本、是否 root、是否跨平台）。
2. 脚本起始即开启严格模式与安全默认值。
3. 校验入参、引用变量加引号、安全处理文件。
4. 加上日志、错误 trap 与基本测试（含错误路径）。

安全约束：破坏性命令未经确认或无 dry-run 不执行；非必要不以 root 运行。

## 指令

核心防御原则：

1. 严格模式：`set -Eeuo pipefail`
   - `-E` 函数继承 ERR trap；`-e` 任一命令非零即退出；`-u` 引用未定义变量即退出；`-o pipefail` 管道中任一环失败即失败。
2. 错误陷阱与清理：用 `trap ... ERR` 报告出错行 `$LINENO`，用 `trap ... EXIT` 清理临时目录。
3. 变量安全：一律加引号 `cp "$source" "$dest"`；必填变量用 `: "${REQUIRED_VAR:?REQUIRED_VAR is not set}"`。
4. 数组：迭代用 `"${items[@]}"`；读命令输出用 `mapfile -t lines < <(cmd)`。
5. 条件判断：Bash 用 `[[ ]]`，POSIX 用 `[ ]`；判空用 `[[ -z "${VAR:-}" ]]`。
6. 命令替换用 `$()` 而非反引号；用 `command -v` 而非 `which` 检测可执行文件；优先 `printf` 而非 `echo`。

最佳实践速记：严格模式、变量加引号、`[[ ]]`、错误 trap、校验全部输入、有意义命名的函数、带时间戳的分级日志、支持 dry-run、`mktemp`+trap 处理临时文件、幂等设计、声明依赖与最低版本、测试错误路径。

## 示例

严格模式 + 错误陷阱 + 临时目录清理：
```bash
#!/bin/bash
set -Eeuo pipefail

trap 'echo "Error on line $LINENO"' ERR
trap 'rm -rf -- "$TMPDIR"' EXIT

TMPDIR=$(mktemp -d) || { echo "ERROR: Failed to create temp directory" >&2; exit 1; }
# 脚本主体
```

安全确定脚本目录：
```bash
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
SCRIPT_NAME="$(basename -- "${BASH_SOURCE[0]}")"
```

健壮的参数解析（含 usage 与必填校验）：
```bash
VERBOSE=false; DRY_RUN=false; OUTPUT_FILE=""

usage() { cat <<EOF
Usage: $0 [OPTIONS]
    -v, --verbose       详细输出
    -o, --output FILE   输出文件路径
    -h, --help          显示帮助
EOF
exit "${1:-0}"; }

while [[ $# -gt 0 ]]; do
    case "$1" in
        -v|--verbose) VERBOSE=true; shift ;;
        -o|--output)  OUTPUT_FILE="$2"; shift 2 ;;
        -h|--help)    usage 0 ;;
        --)           shift; break ;;
        *)            echo "ERROR: Unknown option: $1" >&2; usage 1 ;;
    esac
done
[[ -n "$OUTPUT_FILE" ]] || { echo "ERROR: -o/--output is required" >&2; usage 1; }
```

结构化日志：
```bash
log_info()  { echo "[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $*"  >&2; }
log_error() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2; }
log_debug() { [[ "${DEBUG:-0}" == "1" ]] && echo "[$(date +'%F %T')] DEBUG: $*" >&2 || true; }
```

NUL 安全遍历文件：
```bash
while IFS= read -r -d '' file; do
    echo "Processing: $file"
done < <(find "$input_dir" -maxdepth 1 -type f -print0)
```

dry-run 包装与幂等：
```bash
DRY_RUN="${DRY_RUN:-false}"
run_cmd() {
    if [[ "$DRY_RUN" == "true" ]]; then echo "[DRY RUN] Would execute: $*"; return 0; fi
    "$@"
}
run_cmd cp "$source" "$dest"

ensure_directory() {
    local -r dir="$1"
    [[ -d "$dir" ]] && { log_info "目录已存在: $dir"; return 0; }
    mkdir -p "$dir" || { log_error "创建目录失败: $dir"; return 1; }
}
```

依赖检查与原子写：
```bash
check_dependencies() {
    local -a missing=() required=("jq" "curl" "git")
    for cmd in "${required[@]}"; do command -v "$cmd" &>/dev/null || missing+=("$cmd"); done
    [[ ${#missing[@]} -eq 0 ]] || { echo "ERROR: 缺少命令: ${missing[*]}" >&2; return 1; }
}

atomic_write() {
    local -r target="$1"; local tmpfile
    tmpfile=$(mktemp) || return 1
    cat > "$tmpfile"
    mv "$tmpfile" "$target"   # 原子重命名
}
```

## 注意事项

- 破坏性删除用 `rm -rI`（GNU/BSD 兼容，删除前提示）；移动前先检查目标不存在再 `mv`。
- 后台进程编排：用 `PIDS+=($!)` 记录 PID，并在 `trap cleanup SIGTERM SIGINT` 中 `kill -TERM` 后 `wait`，配合 `kill -0 "$pid" 2>/dev/null` 判断存活。
- 函数命名用 `handle_*/process_*/check_*/validate_*` 前缀，局部变量用 `local -r` 只读声明。
- 输出不能替代环境特定的验证与测试；缺少必要输入、权限或安全边界时停下来确认。
- 参考资料：Bash 严格模式（redsymbol.net）、Google Shell 风格指南（google.github.io/styleguide/shellguide.html）。

## 互见

- 同主题另一来源：`.vendor/wshobson__agents/plugins/shell-scripting/skills/bash-defensive-patterns/`（可对照补充）。
- 配套排错/校验类技能：verify、code-review。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
