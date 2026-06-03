---
name: claude-code-settings-auditor
title: Claude Code 设置审计：仓库权限配置推荐
description: 当为某仓库初始化或审计 Claude Code 的 .claude/settings.json 权限时使用；做检测技术栈/构建工具/monorepo 结构并产出仅含只读命令的 permissions allow 推荐清单（及按需的 .mcp.json 建议）；不适用于会改状态的安装/构建/部署命令、自定义脚本或绝对路径授权；触发词：settings.json、claude 权限审计、只读 allow 清单、权限基线、mcp 配置
domain: 平台/cli
triggers: [settings.json, claude 权限审计, 只读 allow 清单, 权限基线, mcp 配置, permissions allow, claude-code-settings-auditor]
tags: [claude-code, settings, permissions, audit, read-only, monorepo, mcp, tech-stack-detection, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, ls, find, git, gh]
requires: []
related: [ai-native-cli-design, agent-skill-security-scanner, skill-ecosystem-auditor]
combines_with: [mcp-builder, devcontainer-claude-setup]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于为一个仓库初始化、审计或重写 Claude Code 的 `.claude/settings.json` 权限：基于技术栈、构建工具、包管理器与 monorepo 结构，推断出一份**仅含只读命令**的 `permissions.allow` 白名单，并按需给出 `.mcp.json` 建议。目标是让 Agent 在尽量少弹权限确认的前提下，仍只能执行无副作用的探查命令。

不该用：需要授权会改变状态的命令（install / build / run / 写 / 删 / 部署）；要给自定义项目脚本（如 `./scripts/deploy.sh`）或用户态绝对路径开口子；做完整的代码安全审计或漏洞扫描（那是安全卷的事，见互见）。本技能只产出推荐，不替代环境特定的验证与人工复核。

## 步骤

1. 探测技术栈：列目录并扫关键配置文件（见下方指令的 find 命令），用指示文件判定语言/构建/monorepo。
2. 探测服务集成与框架：读依赖清单（`package.json` 的 dependencies/devDependencies、`pyproject.toml` 的依赖表、`Gemfile`、`Cargo.toml`）识别 Web 框架与第三方服务。
3. 读现有设置：`cat .claude/settings.json`，决定是新建还是与现有基线合并。
4. 生成 allow 清单：基线只读命令 + **仅**已检测到工具对应的栈命令；多锁文件并存时各自只取对应包管理器命令。
5. 按需给出 `.mcp.json`：注意 MCP 配在 `.mcp.json` 而非 `settings.json`；**永远不要建议 GitHub MCP**，GitHub 一律走 `gh` CLI。
6. 输出：检测摘要表 + 可直接复制的 `settings.json` + （如适用）MCP 建议 + 合并说明。

## 指令

探测命令：

```bash
ls -la
find . -maxdepth 2 \( -name "*.toml" -o -name "*.json" -o -name "*.lock" -o -name "*.yaml" -o -name "*.yml" -o -name "Makefile" -o -name "Dockerfile" -o -name "*.tf" \) 2>/dev/null | head -50
cat .claude/settings.json 2>/dev/null || echo "No existing settings"
cat .mcp.json 2>/dev/null || echo "No existing .mcp.json"
```

指示文件 → 判定：

| 类别 | 指示文件 |
|---|---|
| Python | `pyproject.toml` `setup.py` `requirements.txt` `Pipfile` `poetry.lock` `uv.lock` |
| Node.js | `package.json` `package-lock.json` `yarn.lock` `pnpm-lock.yaml` |
| Go / Rust | `go.mod` `go.sum` / `Cargo.toml` `Cargo.lock` |
| Ruby / Java | `Gemfile` `Gemfile.lock` / `pom.xml` `build.gradle` |
| 构建 / 基建 | `Makefile` `Dockerfile` `docker-compose.yml` / `*.tf` `kubernetes/` `helm/` |
| monorepo | `lerna.json` `nx.json` `turbo.json` `pnpm-workspace.yaml` |

栈命令（仅检测到才加，全部带 `:*` 后缀放行任意参数）：

| 检测到 | 加入的只读命令 |
|---|---|
| Python | `python --version`；`poetry.lock`→`poetry show`/`poetry env info`；`uv.lock`→`uv pip list`/`uv tree`；`Pipfile.lock`→`pipenv graph`；仅 `requirements.txt`→`pip list`/`pip show`/`pip freeze` |
| Node.js | `node --version`；`pnpm-lock.yaml`→`pnpm list`/`pnpm why`；`yarn.lock`→`yarn list`/`yarn why`；`package-lock.json`→`npm list`/`npm view`/`npm outdated`；`tsconfig.json`→`tsc --version` |
| Go / Rust | `go version`/`go list`/`go mod graph`/`go env`；`rustc --version`/`cargo tree`/`cargo metadata` |
| Ruby / Java | `bundle list`/`bundle show`；`mvn dependency:tree` 或 `gradle dependencies` |
| 构建 | `docker --version`/`docker ps`/`docker images`；`docker-compose config`；`terraform providers`/`terraform state list`；`make -n` |

框架 → WebFetch 域名（检测到才加）：Django→`docs.djangoproject.com`；FastAPI→`fastapi.tiangolo.com`；React→`react.dev`；Next.js→`nextjs.org`；Vue→`vuejs.org`；Rails→`guides.rubyonrails.org`；Go→`pkg.go.dev`；Rust→`docs.rs`/`doc.rust-lang.org`；Docker→`docs.docker.com`；K8s→`kubernetes.io`；Terraform→`registry.terraform.io`。

## 示例

始终纳入的基线只读命令（系统探查 + git/gh 只读）：

```json
[
  "Bash(ls:*)", "Bash(pwd:*)", "Bash(find:*)", "Bash(file:*)", "Bash(stat:*)",
  "Bash(wc:*)", "Bash(head:*)", "Bash(tail:*)", "Bash(cat:*)", "Bash(tree:*)",
  "Bash(git status:*)", "Bash(git log:*)", "Bash(git diff:*)", "Bash(git show:*)",
  "Bash(git branch:*)", "Bash(git remote:*)", "Bash(git tag:*)",
  "Bash(git stash list:*)", "Bash(git rev-parse:*)",
  "Bash(gh pr view:*)", "Bash(gh pr list:*)", "Bash(gh pr checks:*)", "Bash(gh pr diff:*)",
  "Bash(gh issue view:*)", "Bash(gh issue list:*)",
  "Bash(gh run view:*)", "Bash(gh run list:*)", "Bash(gh run logs:*)",
  "Bash(gh repo view:*)", "Bash(gh api:*)"
]
```

最终落盘结构（按类别分组、注释说明来源）：

```json
{
  "permissions": {
    "allow": [
      // 基线 + 仅检测到的栈命令 + 框架 WebFetch 域名
    ],
    "deny": []
  }
}
```

MCP 建议（仅检测到对应服务时，写入 `.mcp.json`，占位符替换为实际值）：

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server"],
      "env": { "LINEAR_API_KEY": "${LINEAR_API_KEY}" }
    }
  }
}
```

输出结构：① 检测摘要表（语言/包管理器/框架/服务/构建工具）；② 可复制的 `.claude/settings.json`；③ 如适用的 `.mcp.json`；④ 已有设置时的合并说明。

## 注意事项

- **只放只读、无副作用**的命令；`:*` 仅放行该基命令的任意参数，不要放行 shell 串联。
- **绝不**纳入：用户态绝对路径（`/home/...`、`/Users/...`）、项目自定义脚本、任何 install/build/run/写/删命令。
- **包管理器互斥**：项目用 pnpm 就别放 npm/yarn；用 poetry 就别放 pip（除非同时有 `requirements.txt`）；uv→不放 pip/poetry。多锁文件并存时各取所需。
- MCP 配在 `.mcp.json`，不在 `settings.json`；**永不建议 GitHub MCP**，GitHub 操作统一用 `gh` CLI。
- 有第三方服务（如 Sentry/Linear）时，对应的 Skill 放行、文档域名、MCP 仅在确实检测到该服务时才加，避免污染基线。
- 输出是推荐基线，落库前需人工复核是否贴合本仓库的安全边界；缺输入或边界不清时先停下问清。

## 互见

- related：`agent-plugin-audit` —— 审计已安装的 Agent 插件/技能的权限与风险，与本技能的权限基线互补。
- related：`env-secrets-hygiene` —— 配套收紧密钥/环境变量暴露面，避免只读放行外的泄露。
- related：`dependency-auditor` —— 同为仓库级只读审计，可在 CI 中与权限基线一起跑。
- combines_with：`devcontainer-claude-setup` —— 搭建 Claude Code 项目环境后，用本技能生成配套的 `settings.json` 权限。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
