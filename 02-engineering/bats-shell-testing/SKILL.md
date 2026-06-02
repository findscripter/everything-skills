---
name: bats-shell-testing
title: Bats Shell 脚本自动化测试
description: 当为 Bash/POSIX shell 脚本、CLI 工具或 CI 流程写单元测试、做 TDD 时使用；做 Bats（Bash Automated Testing System）测试编写——断言退出码/输出/文件副作用、setup/teardown 夹具、命令打桩(stub)、CI 接入，产出 .bats 测试套件与 TAP 报告；不适用于非 shell 项目、跨服务集成测试、仅做 lint/格式化或纯 shellcheck 静态检查；触发词：bats、shell 脚本测试、@test、TAP、脚本 TDD
domain: 研发/testing
triggers: [写 shell 脚本测试, bats-core, @test 断言, shell 脚本 TDD, 测试退出码与输出, setup/teardown 夹具, 命令 stub/mock, CI 跑 bats, TAP 测试报告, 测脚本错误分支]
tags: [bats, shell, 测试, tdd, bash, ci, fixtures, 脚本工程, 研发, tap]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bats-core, bash, mktemp, shellcheck, jq, make, github-actions]
requires: []
related: [posix-shell-scripting, bash-defensive-patterns, shellcheck-linting, test-coverage-gap-finder]
combines_with: [ci-cd-pipeline-builder, git-hooks-automation]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- **该用**：给 shell 脚本/CLI 工具写单元测试；对脚本做 TDD（先写 `@test` 再实现）；在 CI/CD 中接入自动化脚本测试；覆盖边界与错误分支（缺参、文件不存在、权限拒绝、非法选项）；验证脚本在 bash/sh/dash 等多种 shell 下行为一致。
- **不该用（负边界）**：项目根本不含 shell 脚本；需要跨服务/真实环境的集成测试（Bats 只测 shell 层行为）；目标只是 lint 或格式化；只想做静态检查——那用 shellcheck（见互见），它不替代运行时测试。

## 步骤

1. **装 Bats 并确认目标 shell**：`brew install bats-core` / `npm i -g bats` / 源码 `./install.sh /usr/local`；`bats --version` 验证。先确认要支持的 shell 方言与环境。
2. **搭测试结构**：脚本放 `bin/`，测试放 `tests/*.bats`，夹具放 `tests/fixtures/`，共享工具放 `tests/test_helper.sh`（用 `load test_helper` 引入）。
3. **写测试三类断言**：退出码（`$status`）、输出（`$output` / `${lines[N]}`）、副作用（文件是否生成/内容/权限）。每个测试只验一件事，命名清楚说明意图。
4. **加 setup/teardown**：`setup` 建临时目录与夹具，`teardown` 清理；昂贵的一次性准备用 `setup_file`/`teardown_file`。
5. **隔离外部依赖**：mock 函数或在 `PATH` 前置 stub 目录拦截 `curl`/`jq` 等命令；缺依赖用 `skip`。
6. **跑测试并接 CI**：本地 `bats tests/*.bats`（`--tap` 出 TAP、`--parallel N` 并行），在 GitHub Actions / Makefile 中固化。

## 指令

**核心 API（背下来）**

- `run cmd` 执行命令并捕获结果 → 读 `$status`（退出码）、`$output`（全部输出）、`${lines[i]}`（按行）。
- `@test "描述" { ... }` 定义一个测试；测试体内任一 `[ ... ]` 失败即整测试失败。
- `setup`/`teardown` 每个测试前后各跑一次；`setup_file`/`teardown_file` 整文件一次。
- `load 文件名` 引入 helper；`skip "原因"` 跳过；`${BATS_TEST_DIRNAME}` 指向当前 .bats 所在目录。

**断言惯用法**

- 退出码：`[ "$status" -eq 0 ]` / `[ "$status" -ne 0 ]` / 指定码 `[ "$status" -eq 127 ]`。
- 输出相等/含子串/正则：`[ "$output" = "expected" ]` / `[[ "$output" == *"world"* ]]` / `[[ "$output" =~ ^[0-9]{4}$ ]]`。
- 文件副作用：`[ -f file ]`、`[ "$(cat file)" = "..." ]`、`[ "$(wc -c < file)" -eq 5 ]`。

**夹具与隔离**

- 临时目录：`setup() { TEST_DIR=$(mktemp -d); export TEST_DIR; }` + `teardown() { rm -rf "$TEST_DIR"; }`，绝不污染工作区。
- 命令 stub：把可执行假命令写进 `$STUBS_DIR` 并 `export PATH="$STUBS_DIR:$PATH"`，控制其输出与退出码。
- 函数 mock：重定义同名函数 + `export -f`，让被测脚本调到假实现。

## 示例

最小测试文件（夹具 + 三类断言）：

```bash
#!/usr/bin/env bats
load test_helper

setup()    { TMPDIR=$(mktemp -d); export TMPDIR; }
teardown() { rm -rf "$TMPDIR"; }

@test "成功时返回 0" {
    run my_function "input"
    [ "$status" -eq 0 ]
}

@test "缺参时报错并提示 Usage" {
    run my_function
    [ "$status" -ne 0 ]
    [[ "$output" == *"Usage:"* ]]
}

@test "生成输出文件且内容正确" {
    my_function > "$TMPDIR/out.txt"
    [ -f "$TMPDIR/out.txt" ]
    [ "$(cat "$TMPDIR/out.txt")" = "expected content" ]
}
```

命令打桩（拦截外部 `curl`）：

```bash
create_stub() {            # 在 $STUBS_DIR 生成假命令
    cat > "$STUBS_DIR/$1" <<EOF
#!/bin/bash
echo "$2"
exit ${3:-0}
EOF
    chmod +x "$STUBS_DIR/$1"
}

@test "API 调用走桩" {
    create_stub curl '{ "status": "ok" }' 0
    run my_api_function
    [ "$status" -eq 0 ]
}
```

依赖缺失时跳过 + 多 shell 兼容：

```bash
@test "JSON 解析" {
    command -v jq >/dev/null || skip "jq 未安装"
    run my_json_parser '{"key":"value"}'
    [ "$status" -eq 0 ]
}

@test "脚本在 POSIX sh 下可运行" {
    sh "${BATS_TEST_DIRNAME}/../bin/script.sh" arg1
}
```

CI 接入（GitHub Actions 片段）：

```yaml
- name: Install Bats
  run: npm install --global bats
- name: Run Tests
  run: bats tests/*.bats --tap | tee test_output.tap
```

## 注意事项

- **务必清理**：临时文件/目录一律在 `teardown` 中 `rm -rf`，否则测试间相互污染。改了权限做完即复原（如 `chmod 000` 测完 `chmod 644`）。
- **测好失败路径**：别只测 happy path——缺参、`/nonexistent` 文件、空输入、权限拒绝、非法选项都要覆盖，并断言错误信息（`*"not found"*`、`*"Usage:"*`）。
- **`run` 的边界**：`run` 会吞掉退出码（命令失败不会让测试自动失败），必须显式断言 `$status`；不需要捕获时也可直接跑命令让其非零退出令测试失败。
- **隔离单元**：mock/stub 外部命令，别在单测里打真实网络/数据库；复杂数据用 fixtures 文件提升可读性。
- **可移植性**：`stat -f`、`echo -e`、`{1..10}` 等并非各 shell 通用；要跨 dash/ash 验证就在对应 shell 实跑（容器：`alpine`=ash、`debian`=dash）。
- **速度**：测试要快，独立用例用 `bats --parallel N` 并行；不寻常的 setup 写注释说明。

## 互见

- requires：`bash-defensive-patterns` —— 先会写健壮 shell 脚本，才谈得上为其编写有意义的测试。
- related：`posix-shell-scripting`（被测脚本若要可移植，配套用 sh 方言测试）、`shellcheck-linting`（静态检查与 Bats 运行时测试互补，二者都进 pre-commit）。
- combines_with：`ci-cd-pipeline-builder` —— 把 `bats tests/*.bats --tap` 接入流水线，回归早发现。
- 参考：Bats-core 仓库 github.com/bats-core/bats-core、文档 bats-core.readthedocs.io、TAP 协议 testanything.org。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
