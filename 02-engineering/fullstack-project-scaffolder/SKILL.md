---
name: fullstack-project-scaffolder
title: 全栈项目脚手架与技术栈选型
description: 当需要为 Next.js / FastAPI+React / MERN / Django 全栈项目搭脚手架、做技术栈选型或审计代码质量时使用；先用决策引擎根据四项前提（团队规模、发布节奏、面向对象、预算）锁定 profile 并产出 SLO 底线与审批链，再生成项目骨架并跑质量分析（安全/复杂度/依赖评分）。不适用于纯前端组件实现、API 契约细评、DB schema 详设等专精任务（应转交对应 skill）。触发词：脚手架、技术栈选型、代码质量审计、全栈搭建
domain: 研发/architecture
triggers: [搭一个全栈项目脚手架, 创建 Next.js 应用, FastAPI 配 React 怎么搭, 我该选什么技术栈, 审计代码质量, 扫描代码库安全问题, 生成项目模板/样板, MERN 项目初始化, Django + React 工程化]
tags: [全栈, 脚手架, 技术栈选型, 代码质量, 架构决策, Next.js, FastAPI, SLO]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Write, Edit]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用场景：
- 新项目要从零搭骨架（Next.js / FastAPI+React / MERN / Django+React），需要规范的目录、配置与 Docker 化样板。
- 团队在多套技术栈之间犹豫，需要一个可复现、可解释的选型依据。
- 对现有代码库做质量审计：安全漏洞、复杂度、依赖健康度、测试覆盖估算。

不该用（负边界，应转交对应专精 skill）：
- 只要写某个前端组件或某段业务逻辑 —— 这是实现任务，本 skill 不接管。
- API 契约细评、数据库 schema 详设、CI/CD 流水线落地、性能 profiling —— 这些归专精 skill，本 skill 只做路由分流（见「互见」）。
- 四项前提（团队规模、发布节奏、面向对象、预算）未知时，不要直接推荐或动手；先走「逼问七问」补齐，否则决策引擎会拒绝输出。

## 步骤

### 流程 A：启动新项目
1. 按需求选栈（参考下方「选型矩阵」，或先跑决策引擎）。
2. 生成脚手架。
3. 校验：确认 `package.json`（或 `requirements.txt`）已生成。
4. 跑一次质量检查，先清掉所有 P0（critical）问题再继续。
5. 配好开发环境并启动。

### 流程 B：审计现有代码库
1. 跑质量分析（`--verbose`）。
2. 看安全发现，立即修掉全部 P0。
3. 重跑分析器，确认 P0 已清零。
4. 给 P1/P2 建工单跟踪。

### 流程 C：选型（先决策后动手）
锁定任何架构/栈决策前，逐条走「逼问七问」（每轮只问一题、给出带依据的推荐答案、答案记到工作文件 `/tmp/fullstack-grill-<date>.md`；触发 kill criterion 就停，不要绕过缺口继续搭）。七问答完，用这些答案作为输入跑决策引擎。

七问速览：①当前团队人数 + 12 个月后人数；②发布节奏（每 PR / 每日 / 每周 / 每季）；③面向客户 / 内部工具 / 营销站；④一年内 p50/p99 流量预测；⑤是按该栈招人还是培训现有团队；⑥首年每月云 + SaaS 预算上限；⑦三项可验证成功指标（带数字）。

## 指令

```bash
# 决策引擎：四项前提齐全时直接锁 profile（缺一即拒绝）
python scripts/fullstack_decision_engine.py --help
python scripts/fullstack_decision_engine.py --sample            # 跑样例
python scripts/fullstack_decision_engine.py \
    --team-size 6 --team-size-12mo 12 \
    --cadence daily --user-facing true --budget 5000 \
    --traffic-p99-rps 45 --data-sensitivity pii-only
python scripts/fullstack_decision_engine.py --sample --output json   # 给下游工具用

# 项目脚手架：模板 nextjs | fastapi-react | mern | django-react
python scripts/project_scaffolder.py --list-templates
python scripts/project_scaffolder.py nextjs my-app
python scripts/project_scaffolder.py nextjs my-app --output ./projects
python scripts/project_scaffolder.py nextjs my-app --json

# 代码质量分析：评分 0-100 + 等级，含安全/复杂度/依赖/覆盖率
python scripts/code_quality_analyzer.py .
python scripts/code_quality_analyzer.py /path/to/project --verbose
python scripts/code_quality_analyzer.py . --json --output report.json
```

参数：脚手架 `template` / `project_name` / `--output,-o` / `--list-templates,-l` / `--json`；分析器 `project_path` / `--verbose,-v` / `--json` / `--output,-o`。

## 示例

启动一个 SaaS 新项目（流程 A 完整命令）：

```bash
python scripts/project_scaffolder.py nextjs my-saas-app   # 1. 生成
ls my-saas-app/package.json                               # 2. 校验存在
cd my-saas-app && npm install                             # 3. 安装
cp .env.example .env.local                                # 4. 配环境
python ../scripts/code_quality_analyzer.py .              # 5. 质量检查（先清 P0）
npm run dev                                               # 6. 启动
```

质量报告样例（节选）：

```
Overall Score: 75/100 (Grade: C)   Files: 45   Lines: 12,500
--- SECURITY ---  Critical: 1  High: 2  Medium: 5
--- RECOMMENDATIONS ---
1. [P0] SECURITY  Issue: Potential hardcoded secret  Action: 在第 42 行移除或加密
```

## 注意事项

- 四项前提是硬门槛（Karpathy 纪律）：团队规模、发布节奏、面向对象、预算。任一未知就停下走逼问七问，决策引擎会因缺输入而拒绝推荐。
- 每条推荐必须带三个可机器校验的数字，缺一即视为不完整：API 延迟目标（p50/p95/p99，ms）、前端性能目标（移动 4G 下 LCP/INP/CLS）、可用性/SLO 目标。
- 决策引擎从不自动审批，只返回最佳 profile、与次优的权衡、推荐栈、该 profile 的反模式，以及具名审批链。
- 四个内置 profile 校准所有推荐：`saas-startup`（<10 工程师，面客，日发，$8K/月，Next.js+Postgres 模块化单体）、`enterprise-scale`（50+ 工程师，受监管，每 PR 带门禁，$250K/月，领域边界服务+平台团队）、`internal-tool`（≤5 工程师，鉴权墙内，<100 DAU，$500/月，Retool 优先）、`marketing-site`（依赖 SEO，近零写入，$200/月，静态优先 Astro/11ty/Next-static）。加自定义 profile：复制 `profiles/saas-startup.json` 为 `profiles/<org>.json`，改 `constraints` 与 `stack_recommendations` 再重跑，无需改代码。

选型矩阵（速查）：

| 需求 | 推荐 |
|---|---|
| SEO 关键站点 | Next.js + SSR |
| 内部仪表盘 | React + Vite |
| API 优先后端 | FastAPI 或 Fastify |
| 企业级规模 | NestJS + PostgreSQL |
| 快速原型 | Next.js API routes |
| 文档型数据 | MongoDB |
| 复杂查询 | PostgreSQL |

常见坑：N+1 查询→用 DataLoader/预加载；构建慢→查包体积+懒加载；鉴权复杂→Auth.js/Clerk；类型报错→tsconfig 开 strict；CORS→正确配中间件。

## 互见

本 skill 只做编排与分流，不重实现以下专精范围，遇到时 fork 出去：
- API 契约评审 → api-design-reviewer
- 数据库 schema 设计 → database-designer
- 可靠性 / SLO 设计 → slo-architect
- CI/CD 流水线 → ci-cd-pipeline-builder
- 性能 profiling → performance-profiler
- 提交前 Karpathy 审查 → karpathy-coder
- 架构预检逼问 → grill-me

---
采编自 alirezarezvani/claude-skills（MIT License）。
