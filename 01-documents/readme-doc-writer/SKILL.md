---
name: readme-doc-writer
title: README 文档撰写
description: 当需要为代码仓库新建或更新 README.md 时使用；先勘探代码库与部署目标，再按固定骨架产出一份覆盖本地开发/系统原理/生产部署的可复制粘贴 README；不适用于 API 参考、教程长文或设计文档等非 README 产物；触发词：写 readme、生成项目文档、document this project
domain: 文书/markdown
triggers: [写 readme, 生成 readme, 创建 readme, 更新 readme, 给项目写文档, document this project, 项目文档, readme.md]
tags: [文档, readme, 技术写作, 开源, 项目说明, misc]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Glob, Grep, Write]
requires: []
related: [docs-architect, codebase-onboarding-doc, technical-reference-builder, code-tutorial-engineer]
combines_with: [docs-architect, changelog-generator]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：用户要求新建或重写仓库的 `README.md`，例如「写 readme」「给这个项目写文档」「document this project」。目标是产出一份"过分详尽"的 README，让任何开发者几分钟内跑起来，并讲清系统如何运行、如何部署到生产。

一份合格 README 服务三个目的：
1. 本地开发——让陌生开发者在几分钟内把应用跑起来。
2. 理解系统——详尽解释应用如何工作。
3. 生产部署——覆盖部署与维护所需的一切。

不该用（负边界）：
- 不是写 API 参考手册、教程长文、ADR/设计文档或营销文案——那些另起文件。
- 不替代真实环境的验证、测试或专家评审；README 只是说明，不保证命令在用户环境必然成功。
- 缺少必要输入（项目用途、部署凭据/URL、影响文档的业务背景）且无法从代码推断时，先停下来发问，不要臆造。

## 步骤

### 第 1 步：深度勘探代码库（动笔前必做）

写下任何一行文档前，先用 Read / Glob / Grep 摸清以下事实，不要凭框架默认值想当然：
- 项目结构：根目录布局、语言/框架（看 `package.json` / `go.mod` / `requirements.txt` / `Cargo.toml` / `Gemfile` 等）、主入口、目录组织。
- 配置文件：`.env.example` / `.env.sample`、应用配置、凭据/密钥管理、`Dockerfile` / `docker-compose.yml`、CI/CD（`.github/workflows/` 等）、部署配置。
- 数据库：schema/迁移/种子数据、数据库类型与连接方式。
- 关键依赖：锁文件中的核心依赖，特别标注需要系统库的原生依赖（如 `pg`、`nokogiri`、`libpq`）。
- 脚本与命令：`bin/`、`scripts/`、Makefile、`package.json` 的 scripts、Procfile、Rake/任务定义。

### 第 2 步：识别部署目标

按特征文件判定平台，针对性地写部署指引：

| 特征文件 | 部署平台 |
| --- | --- |
| `Dockerfile` / `docker-compose.yml` | Docker |
| `vercel.json` / `.vercel/` | Vercel |
| `netlify.toml` | Netlify |
| `fly.toml` | Fly.io |
| `railway.json` / `railway.toml` | Railway |
| `render.yaml` | Render |
| `Procfile` | Heroku 及类 Heroku 平台 |
| `serverless.yml` | Serverless Framework |
| `*.tf` / `terraform/` | Terraform / IaC |
| `k8s/` / `kubernetes/` | Kubernetes |

无任何部署配置时，给出通用指引，并推荐以 Docker 为默认方案。

### 第 3 步：仅在关键处发问

只有当以下信息无法从代码确定时才问用户：项目到底做什么、具体部署凭据/URL、影响文档的业务背景。否则直接继续勘探并动笔。

### 第 4 步：按固定骨架写 README

按顺序写以下小节，缺项可省但顺序勿乱：
1. 标题与概述（2-3 句说清做什么、给谁用）+ Key Features 列表。
2. 技术栈（语言/框架/前端/数据库/任务队列/缓存/部署，逐项列出）。
3. 前置要求（开始前必须安装什么，含版本下限）。
4. 快速开始（克隆 → 装依赖 → 配环境 → 建库 → 启动，假设全新机器，每一步都要写全）。
5. 架构总览（在此处"过分深入"：目录结构树、请求生命周期、数据流、关键组件、数据库 schema）。
6. 环境变量（拆 Required / Optional 两张表，列出含义与获取方式/默认值；敏感值走加密凭据）。
7. 可用脚本（命令表格：命令 + 说明）。
8. 测试（如何跑全部/单文件/按模式/覆盖率，测试目录结构，最小示例）。
9. 部署（按第 2 步识别的平台定制命令）。
10. 故障排查（报错 → 原因 → 解决，覆盖数据库连接、待执行迁移、资源编译、原生扩展构建、凭据不匹配等高频问题）。
11. 贡献指南（开源/团队项目时可选）。
12. 许可证（可选）。

### 第 5 步：输出

直接把成品写到项目根目录的 `README.md`。超过约 200 行时，在顶部加带锚点链接的目录（TOC）。

## 指令

撰写时遵循以下原则：
- 过分详尽：拿不准就写上，细节越多越好。
- 大量使用代码块：每条命令都能直接复制粘贴，并标注语言提示（```bash、```typescript 等）。
- 展示预期输出：有助理解时，写明用户应看到什么。
- 解释"为什么"：不只说"运行这条命令"，还要说它做了什么（如 `db:setup` 等价于 `db:create` + `db:schema:load` + `db:seed`）。
- 假设全新机器：当作读者从没见过这个代码库。
- 用表格做参考：环境变量、脚本、选项用表格最清晰。
- 命令贴合实际：项目用 `pnpm` 就写 `pnpm`，用 `npm` 就写 `npm`，别照抄模板里的包管理器。
- 长文档加 TOC：超过约 200 行时在顶部加链接目录。

## 示例

快速开始小节的写法（命令必须可直接复制）：

```markdown
## 快速开始

### 1. 克隆仓库
\`\`\`bash
git clone https://github.com/user/repo.git
cd repo
\`\`\`

### 2. 安装依赖
\`\`\`bash
pnpm install   # 按项目实际包管理器替换
\`\`\`

### 3. 配置环境变量
\`\`\`bash
cp .env.example .env
\`\`\`

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `DATABASE_URL` | 数据库连接串 | `postgresql://localhost/myapp_dev` |
| `SECRET_KEY_BASE` | 会话/Cookie 密钥 | 运行 `bin/rails secret` 生成 |

### 4. 启动开发服务
\`\`\`bash
bin/dev   # 一键拉起后端 + 前端
\`\`\`
打开 http://localhost:3000
```

故障排查小节统一用「报错 → 原因/解决」结构，例如数据库连接被拒：先 `pg_isready` / `docker ps` 确认服务在跑，再核对 `DATABASE_URL` 格式，最后 `db:create` 确保库存在。

## 注意事项

- 先勘探后动笔：跳过第 1、2 步直接套模板，会产出与项目不符的命令（包管理器、数据库、部署平台错配是最常见翻车点）。
- 模板里的示例偏 Rails（`bin/rails`、Inertia、Solid Queue 等），是骨架示意而非照抄对象——务必替换成本项目真实的命令与组件。
- 凭据安全：敏感值放加密凭据或部署平台的环境变量，绝不硬编码进 README；`master.key` 一类文件不应进 git。
- 假设读者在全新机器上、从未见过此库；原生依赖要写清所需系统库（`brew install` / `apt-get install`）。
- 把成品直接写到根目录 `README.md`；长文档别忘了顶部 TOC。

## 互见

- 与「项目文档/技术写作」类技能配合：README 负责"如何跑起来与如何部署"，深入设计与决策记录交由 ADR/设计文档承担。

---
采编自 sickn33/antigravity-awesome-skills（MIT），适配重写，非逐字翻译。
