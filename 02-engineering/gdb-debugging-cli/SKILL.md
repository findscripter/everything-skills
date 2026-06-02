---
name: gdb-debugging-cli
title: GDB 崩溃与核心转储调试
description: 当需要用 GDB（经 gdb-cli）分析 C/C++ 程序的核心转储、附加调试运行进程、排查崩溃/死锁/内存问题时使用；做源码与运行时状态关联分析并产出根因定位结论；不适用于非 C/C++ 调试、无 GDB（需 9.0+ 带 Python）或非 Linux 环境；触发词：core dump、崩溃、死锁、gdb attach、backtrace、段错误
domain: 研发/review
triggers: [core dump 分析, 核心转储, 程序崩溃排查, 段错误 / segfault, 死锁分析, gdb attach 运行进程, backtrace / 调用栈, 空指针解引用, 多线程卡死, 内存损坏]
tags: [调试, gdb, core-dump, 崩溃分析, C/C++, 多线程, 死锁, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gdb-cli, gdb, Bash]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 分析核心转储（core dump / crash dump），定位崩溃位置与根因。
- 用 GDB attach 调试正在运行的进程（如卡死的服务）。
- 排查崩溃、死锁、内存损坏等问题。
- 调试多线程程序，关联源码上下文做智能分析。

不该用（负边界）：

- 任务与 C/C++ 调试无关。
- 用户只需通用协助，并不涉及调试。
- 环境不满足：需 GDB 9.0+ 且启用 Python 支持、Python 3.6.8+、Linux 系统；缺这些条件不要使用本技能。

前置准备：

```bash
# 安装 gdb-cli
pip install gdb-cli
# 或从 GitHub 安装
pip install git+https://github.com/Cerdore/gdb-cli.git

# 验证 GDB 已启用 Python 支持
gdb -nx -q -batch -ex "python print('OK')"
```

## 步骤

1. 初始化会话：加载 core 或 attach 进程，记下返回的 `session_id`。
2. 收集初始信息：线程列表、带局部变量的回溯、寄存器。
3. 关联源码（关键）：对每个栈帧读取崩溃点 ±20 行源码，结合局部变量值分析逻辑。
4. 深入排查：求值变量/字段、查类型、查内存、反汇编、遍历全部线程（死锁）。
5. 会话管理：查看状态、用完即 `stop` 清理。

## 指令

初始化会话：

```bash
# 加载核心转储
gdb-cli load --binary <binary_path> --core <core_path> [--gdb-path <gdb_path>]

# 附加运行进程
gdb-cli attach --pid <pid> [--binary <binary_path>]
```

返回形如 `"session_id": "a1b2c3"`，后续命令复用：

```bash
SESSION="<session_id>"

# 线程列表
gdb-cli threads -s $SESSION
# 回溯（含局部变量）
gdb-cli bt -s $SESSION --full
# 寄存器
gdb-cli registers -s $SESSION
# 指定帧的局部变量
gdb-cli locals-cmd -s $SESSION --frame <N>
```

深入排查：

```bash
# 求值变量 / 指针字段
gdb-cli eval-cmd -s $SESSION "variable_name"
gdb-cli eval-cmd -s $SESSION "ptr->field"
# 查看类型定义
gdb-cli ptype -s $SESSION "struct_name"
# 内存检查
gdb-cli memory -s $SESSION "0x7fffffffe000" --size 64
# 反汇编
gdb-cli disasm -s $SESSION --count 20
# 遍历全部线程回溯（死锁分析）
gdb-cli thread-apply -s $SESSION bt --all
# 共享库
gdb-cli sharedlibs -s $SESSION
```

会话管理：

```bash
gdb-cli sessions             # 列出活动会话
gdb-cli status -s $SESSION   # 查看会话状态
gdb-cli stop -s $SESSION     # 停止并清理
```

常见模式速查：

- 空指针解引用：崩溃在内存访问指令、指针为 `0x0`。查 `registers`（看 RIP）+ `eval-cmd "ptr"`。
- 死锁：多线程卡在锁函数、回溯出现 `pthread_mutex_lock`。用 `thread-apply ... bt --all` 找循环等待。
- 内存损坏：崩溃在 malloc/free、变量为乱码值。查 `memory "&variable" --size 128` + `registers`。

## 示例

源码与运行时关联（核心方法）：

```
Frame #0: process_data() at src/worker.c:87
源码：
  85: Node* node = get_node(id);
  86: if (node == NULL) return;
  87: node->data = value;  <- 崩溃在此

变量：
  node = 0x0 (NULL)

结论：第 86 行的 NULL 检查未拦住该问题。
```

核心转储分析：

```bash
gdb-cli load --binary ./myapp --core /tmp/core.1234
gdb-cli bt -s a1b2c3 --full          # 崩溃位置
gdb-cli locals-cmd -s a1b2c3 --frame 0
```

运行进程调试：

```bash
gdb-cli attach --pid 12345
gdb-cli threads -s b2c3d4
gdb-cli thread-apply -s b2c3d4 bt --all
```

## 注意事项

最佳实践：

- 先读源码再据变量值下结论，避免误判。
- 线程数多或回溯过深时用 `--range` 分页。
- 用 `ptype` 先理解复杂数据结构再看值。
- 多线程问题务必检查所有线程；类型需与源码定义交叉核对。

安全与权限：

- 本技能需访问进程与核心转储；attach 进程可能需要相应权限（sudo、ptrace_scope）。
- 核心转储可能包含敏感数据，谨慎处理。
- 只调试你有授权分析的进程。
- 输出不能替代针对具体环境的验证、测试或专家复核；缺少必要输入、权限、安全边界或成功标准时应暂停并澄清。

## 互见

- 系统化调试方法论（systematic-debugging）：通用调试流程。
- 测试驱动开发（test-driven-development）：先写测试再实现。
- 仓库 https://github.com/Cerdore/gdb-cli ｜ PyPI https://pypi.org/project/gdb-cli/

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
