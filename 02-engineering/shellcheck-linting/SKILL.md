---
name: shellcheck-linting
title: ShellCheck 脚本静态检查配置
description: 当为 shell 脚本配置静态检查、修脚本告警或在 CI/CD 接入 lint 时使用；做安装/配置 .shellcheckrc、按 SC 码定位修复、抑制误报、接 pre-commit 与 CI 并产出可复用配置与门禁脚本；不适用于非 shell 脚本或运行期测试；触发词：shellcheck、.shellcheckrc、SC2086
domain: 研发/devops
triggers: [shellcheck, .shellcheckrc, shell 脚本 lint / 静态检查, SC2086 / SC2181 / SC2015 等错误码, 脚本告警如何修复, CI/CD 接入 shellcheck, pre-commit 钩子检查脚本, 抑制 shellcheck 误报, shellcheck disable 注释, POSIX 可移植性检查]
tags: [shellcheck, shell, bash, 静态分析, lint, 代码质量, ci/cd, pre-commit, posix, 研发, devops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Write, Edit, Read]
requires: []
related: [bash-defensive-patterns, posix-shell-scripting, powershell-windows, git-hooks-automation]
combines_with: [bash-defensive-patterns, git-hooks-automation, ci-cd-pipeline-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：为 shell 脚本搭建 lint 基础设施、在 CI/CD 流水线对脚本做质量门禁、读懂并修复 ShellCheck 告警、为项目定制规则集（开启/关闭检查）、抑制误报、推进脚本通过质量门、保障跨 shell 可移植性。

不该用（负边界）：
- 任务与 shell 脚本的静态检查无关（如运行期单元测试、性能压测）。
- 需要的是另一种语言/工具的 linter（Python 用 ruff、JS 用 eslint 等）。
- 把 ShellCheck 输出当成环境相关验证的替代品——它是静态分析，不替代实跑测试与专家评审。

## 步骤

1. 安装并核对版本：`shellcheck --version`。
2. 在项目根放 `.shellcheckrc`，固定目标 shell 方言（`shell=bash` 或 `sh`），集中管理开关。
3. 本地逐个或并行扫描脚本，按 SC 码定位问题。
4. 优先按修复原则改代码，而非一律 `disable`；确需抑制的写行内注释并注明理由。
5. 接入 pre-commit 钩子（提交前拦截）与 CI（合并前门禁），`--format=gcc/json` 便于机器解析。

决策：能改就改（引号、`if` 判断退出码等）；规则性误报（如未跟随 source 文件 SC1091）才整体关闭，并在配置里写明原因。

## 指令

安装：
```bash
brew install shellcheck        # macOS
apt-get install shellcheck     # Ubuntu/Debian
shellcheck --version           # 校验
```

`.shellcheckrc`（项目级，放仓库根）：
```
shell=bash
enable=avoid-nullary-conditions,require-variable-braces,check-unassigned-uppercase
# SC1091：不跟随 source 文件，误报多
disable=SC1091
# SC2119：参数调用风格提示
disable=SC2119
external-sources=true
```

常见命令档位：
```bash
# 严格可移植（按 sh 检查、跟随 source）
shellcheck --shell=sh --external-sources --check-sourced script.sh
# Bash 开发（开全部检查 + 精选排除）
shellcheck --shell=bash --enable=all --exclude=SC1091,SC2119 script.sh
# CI 门禁：扫全部 .sh，发现问题即失败
find . -type f -name "*.sh" -print0 | xargs -0 -P4 -n1 shellcheck --format=gcc
```

抑制误报（务必注明原因，能改勿关）：
```bash
# shellcheck disable=SC2086   # 仅对下一行生效
# shellcheck source=./helper.sh
source helper.sh
```

输出格式：`--format=gcc`（CI 友好）、`--format=json`（程序解析）、`--format=quiet`（仅靠退出码）。

## 示例

pre-commit 钩子（`.git/hooks/pre-commit`，只检查本次改动的脚本）：
```bash
#!/bin/bash
set -e
git diff --cached --name-only | grep '\.sh$' | while read -r script; do
    if ! shellcheck "$script"; then
        echo "ShellCheck failed on $script"; exit 1
    fi
done
```

GitHub Actions：
```yaml
name: ShellCheck
on: [push, pull_request]
jobs:
  shellcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run ShellCheck
        run: |
          sudo apt-get install shellcheck
          find . -type f -name "*.sh" -exec shellcheck {} \;
```

典型告警与修法：
```bash
# SC2086 加引号防分词/通配      for i in "${list[@]}"; do ... done
# SC2181 直接判退出码           if some_command; then ... fi
# SC2015 用 if 而非 && ||       if [ -f "$f" ]; then ...; else ...; fi
# SC2016 单引号不展开变量       echo "value: $VAR"
# SC2009 用 pgrep 代替 grep     pgrep -f myprocess
```

## 注意事项

- 务必按目标 shell 检查（别拿 bash 当 sh 分析），否则误报/漏报。
- 排除规则要在配置里写注释说明缘由；尽量改代码而非关告警。
- `--enable=all` 配合谨慎排除可获得最严检查；定期升级 ShellCheck 以获取新规则。
- 大批量脚本用 `xargs -P` 并行或对结果做哈希缓存提速。
- 缺少输入、权限或验收标准时先停下澄清，别用静态结果替代实跑验证。
- 参考：ShellCheck 仓库 https://github.com/koalaman/shellcheck ；Wiki（按 SC 码查解释）https://www.shellcheck.net/wiki/ 。

## 互见

- related：`bash-defensive-patterns` —— 防御式 Bash 编码，ShellCheck 是其落地的检查器
- combines_with：`ci-cd-pipeline-builder` —— 把脚本检查接入流水线门禁
- combines_with：`pre-commit`/Git 钩子类技能 —— 提交前本地拦截

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
