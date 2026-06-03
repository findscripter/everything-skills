---
name: longbridge-securities-toolkit
title: 长桥证券工具集：实时行情、组合与期权分析
description: 当需要查港股/美股/A股/新加坡市场实时行情、K线、基本面、自选组合、持仓盈亏、期权与板块资金流时使用；通过 longbridge CLI（无则回退 MCP）以 JSON 输出按子命令拉数并用用户语言解读；不适用于自动下单、加密非 .HAS 标的或无凭证/无 CLI/MCP 环境。触发词：港股美股行情、自选股、持仓盈亏、期权分析、板块资金流、longbridge、长桥
domain: 领域/fintech
triggers: [港股美股A股行情, 实时报价 K线, 自选股, 持仓盈亏 账户, 期权分析, 板块排行 资金流, longbridge auth, 长桥证券]
tags: [fintech, 证券, 行情, 组合, 期权, 港股, 美股, A股, CLI, MCP]
level: 进阶
status: stable
agents: [claude-code, cursor, gemini-cli, codex]
tools: [longbridge CLI, Longbridge MCP, npx]
requires: []
related: [octagon-stock-quote, alpha-vantage-market-data, portfolio-risk-metrics, portfolio-rebalancer, institutional-flow-tracker]
combines_with: [portfolio-risk-metrics, portfolio-rebalancer, octagon-stock-quote]
license: CC-BY-4.0
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当用户围绕**长桥证券（Longbridge）**做行情/组合/期权查询时使用。它是长桥官方 125+ 子技能的统一入口，覆盖港股（HK）、美股（US）、A 股（沪 SH / 深 SZ）、新加坡（SG）四地市场，可取实时报价、K 线/图表、公司基本面与财报评级、自选组合、持仓与账户盈亏、期权分析、板块排行、资金流与新闻。简繁中英三语均可触发。

**不该用的边界：**

- **自动下单 / 撮合交易**——本工具默认只读，不下单；自选改动与下单类操作走「预览 + 确认」两步协议。
- **加密货币标的命名差异**——长桥平台加密标的用 `.HAS` 后缀，非该后缀勿当成加密查询。
- **无凭证 / 未登录**——基础行情需 `auth login`；组合与账户功能需 `--trade`（交易范围）授权，否则不可用。
- **既无 CLI 又无 MCP 的环境**——取数依赖 `longbridge` CLI 或回退的 Longbridge MCP，两者皆无则无法工作。
- 行情新鲜度受长桥数据订阅约束（无订阅为延迟数据）；结果供分析参考，不替代尽调与人工复核。

## 步骤

1. **认证**：基础行情 `longbridge auth login`；需要组合/账户时 `longbridge auth login --trade`。
2. **发现子命令**：跑 `longbridge --help` 列出当前可用子命令。**不要硬编码子命令名**——CLI 会演进。
3. **确认参数**：`longbridge <subcommand> --help` 查清旗标与输出格式再调用。
4. **以 JSON 取数**：`longbridge <subcommand> --format json`，解析结构化输出。
5. **按用户语言渲染**：从用户输入检测简体/繁体/英文，用对应语言解读并回报。
6. **CLI 缺失则回退 MCP**：若 `longbridge` 二进制未安装，改用 Longbridge MCP 工具；运行时探测可用 MCP 工具名，**勿硬编码**（随服务端版本变化）。

## 指令

**认证：**

```bash
longbridge auth login          # 基础行情（只读）
longbridge auth login --trade  # 组合与账户功能
```

**三步取数范式：**

```bash
longbridge --help                       # 1. 发现子命令（勿硬编码）
longbridge <subcommand> --help          # 2. 确认旗标/输出格式
longbridge <subcommand> --format json   # 3. JSON 输出，便于解析
```

**安装：**

```bash
# Claude Code 插件市场
/plugin marketplace add longbridge/skills

# 或经 npx
npx skills add https://github.com/longbridge/skills
```

**MCP 回退**：CLI 不存在时使用 Longbridge MCP；运行时 inspect 可见 MCP 工具，按需调用。

## 示例

```bash
# 港股实时报价（00700 腾讯）—— 子命令名以 --help 实际输出为准
longbridge quote --symbol 00700.HK --format json

# 美股基本面 / 评级
longbridge fundamentals --symbol AAPL.US --format json

# 自选组合（需先登录）
longbridge watchlist --format json

# 持仓与账户盈亏（需 --trade 范围）
longbridge positions --format json

# 期权链分析
longbridge options --symbol TSLA.US --format json

# 板块排行 / 资金流
longbridge sector --rank capital-flow --format json
```

> 实际子命令名、旗标须以 `longbridge --help` 与 `longbridge <sub> --help` 为准；上为典型形态示意。检测到用户用繁体或英文提问时，用对应语言回报解读。

## 注意事项

- **只读优先**：所有行情查询无副作用；自选改动、下单相关功能严格走「预览 + 确认」两步，未确认不执行。
- **范围分级**：组合/账户需 `--trade` 授权；基础行情只需普通登录。缺范围会报权限错误，先补认证。
- **数据订阅**：实时与否取决于长桥数据订阅，无订阅得延迟数据；回报时标注数据时效，勿把延迟价当实时。
- **市场后缀**：标的带市场后缀（`.HK` / `.US` / `.SH` / `.SZ` / `.SG`）；加密用 `.HAS`，勿混淆。
- **不硬编码命名**：子命令名与 MCP 工具名都随版本演进，每次以 `--help` / 运行时探测为准。
- **凭证安全**：凭证由长桥 auth 系统管理，本技能不存储、不传输 token。
- 源仓库将本技能标为 critical 风险（涉账户/交易语境），涉及任何写操作务必二次确认。

## 互见

- requires：（无）
- related：`octagon-stock-quote`（按 Ticker 取美股实时报价快照）、`alpha-vantage-market-data`（程序化拉全球行情/历史 OHLCV/基本面）、`portfolio-risk-metrics`（组合层风险度量）、`portfolio-rebalancer`（组合再平衡）、`institutional-flow-tracker`（13F 机构持仓流向）。
- combines_with：`portfolio-risk-metrics`（长桥拉持仓 → 汇入风险指标）、`portfolio-rebalancer`（持仓快照 → 计算再平衡建议）、`octagon-stock-quote`（跨源交叉验证同一标的报价）。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT 许可），已做中文适配重写。
