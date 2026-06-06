---
name: longbridge-securities-toolkit
title: Longbridge Securities Toolkit: real-time quotes, portfolios, and options analysis
description: Query real-time HK/US/A-share/SG quotes, charts, fundamentals, watchlists, positions/P&L, options, and sector capital flow via the longbridge CLI (with MCP fallback), emitting JSON per subcommand. Use for HK/US stock quotes, watchlist, position P&L, options analysis, sector flow,
domain: 领域/fintech
triggers: [HK/US/A-share quotes, real-time quote K-line, watchlist, position P&L account, options analysis, sector ranking capital flow, longbridge auth, Longbridge Securities]
tags: [fintech, securities, market-data, portfolio, options, hk-stocks, us-stocks, a-shares, cli, mcp]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [octagon-stock-quote, alpha-vantage-market-data, portfolio-risk-metrics, portfolio-rebalancer, institutional-flow-tracker]
combines_with: [portfolio-risk-metrics, portfolio-rebalancer, octagon-stock-quote]
license: CC-BY-4.0
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill when the user works with **Longbridge Securities** for market-data, portfolio, or options queries. It is the unified entry point to Longbridge's official 125+ agent skills, covering real-time quotes, charts, company fundamentals, earnings and analyst ratings, watchlists, positions and account P&L, options analysis, sector rankings, capital flow, and news. It spans HK, US, A-share (SH/SZ), and SG markets, and is trilingual: Simplified Chinese, Traditional Chinese, and English.

Reach for it when:

- The user asks about stock prices, charts, or market data for HK / US / A-share / SG markets.
- The user wants company fundamentals, earnings, or analyst ratings.
- The user asks about their portfolio, positions, or account P&L via Longbridge.
- The user wants options analysis, sector rankings, capital flow, or news.
- The user asks in Chinese (Simplified or Traditional) or English about any securities topic.

**Out of scope / boundaries:**

- **Auto-trading / order placement** — read-only by default; this skill does not place orders. Watchlist mutations and order-related features follow a **preview + confirm** two-step protocol.
- **Crypto naming differences** — crypto symbols use the `.HAS` suffix on the Longbridge platform; do not treat non-`.HAS` symbols as crypto.
- **No credentials / not logged in** — basic market data needs `auth login`; portfolio and account features need the **Trade scope** (`--trade`), otherwise they are unavailable.
- **Environments with neither CLI nor MCP** — data retrieval depends on the `longbridge` CLI or the Longbridge MCP fallback; without either it cannot work.
- Data freshness is bound by your Longbridge data subscription (delayed data without a subscription). Results are for analysis only and do not replace due diligence or human review.

## Steps

1. **Authenticate** — basic market data: `longbridge auth login`; portfolio/account: `longbridge auth login --trade`.
2. **Discover the right subcommand** — run `longbridge --help` to list available subcommands. **Never hard-code subcommand names** — the CLI evolves.
3. **Check subcommand options** — run `longbridge <subcommand> --help` to confirm flags and output format before calling.
4. **Call with JSON output** — `longbridge <subcommand> --format json`, then parse the structured output.
5. **Render in the user's language** — detect Simplified / Traditional Chinese or English from the user's input and report back accordingly.
6. **Fall back to MCP if the CLI is missing** — if the `longbridge` binary is not installed, use the Longbridge MCP tools; inspect available MCP tool names at runtime and **do not hard-code** them, as they change with server versions.

## Example

**Authentication:**

```bash
longbridge auth login          # Basic market data (read-only)
longbridge auth login --trade  # Portfolio and account features
```

**Three-step retrieval pattern:**

```bash
longbridge --help                       # 1. Discover subcommands (don't hard-code)
longbridge <subcommand> --help          # 2. Confirm flags / output format
longbridge <subcommand> --format json   # 3. JSON output, easy to parse
```

**Install:**

```bash
# Claude Code plugin marketplace
/plugin marketplace add longbridge/skills

# Or via npx
npx skills add https://github.com/longbridge/skills
```

**Typical queries** (exact subcommand names must come from `--help`; the forms below are illustrative):

```bash
# HK real-time quote (00700 Tencent)
longbridge quote --symbol 00700.HK --format json

# US fundamentals / ratings
longbridge fundamentals --symbol AAPL.US --format json

# Watchlist (requires login)
longbridge watchlist --format json

# Positions and account P&L (requires --trade scope)
longbridge positions --format json

# Options chain analysis
longbridge options --symbol TSLA.US --format json

# Sector ranking / capital flow
longbridge sector --rank capital-flow --format json
```

**MCP fallback:** if the CLI is absent, use the Longbridge MCP; inspect the available MCP tools at runtime and call them as needed.

## Notes

- **Read-only first** — all market-data queries have no side effects. Watchlist mutations and order-related features strictly follow the **preview + confirm** two-step protocol; do not execute without confirmation.
- **Scope tiers** — portfolio/account features require the `--trade` scope; basic market data only needs an ordinary login. A missing scope yields a permission error — re-authenticate first.
- **Data subscription** — whether data is real-time depends on your Longbridge data subscription; without one you get delayed data. Label data freshness when reporting and never present a delayed price as real-time.
- **Market suffixes** — symbols carry a market suffix (`.HK` / `.US` / `.SH` / `.SZ` / `.SG`); crypto uses `.HAS` — do not confuse them.
- **Never hard-code names** — both subcommand names and MCP tool names evolve across versions; always rely on `--help` / runtime inspection.
- **Credential safety** — credentials are handled by the Longbridge auth system; this skill does not store or transmit tokens.
- The source repository marks this skill as **critical** risk (account/trading context); always re-confirm before any write operation.

## See also

- **requires:** (none)
- **related:** `octagon-stock-quote` (real-time US quote snapshot by ticker), `alpha-vantage-market-data` (programmatic global quotes / historical OHLCV / fundamentals), `portfolio-risk-metrics` (portfolio-level risk measures), `portfolio-rebalancer` (portfolio rebalancing), `institutional-flow-tracker` (13F institutional holding flows).
- **combines_with:** `portfolio-risk-metrics` (pull positions from Longbridge → feed into risk metrics), `portfolio-rebalancer` (position snapshot → compute rebalancing suggestions), `octagon-stock-quote` (cross-source verification of the same symbol's quote).

---

Adapted from sickn33/antigravity-awesome-skills (MIT license); body reused from the upstream Longbridge skill (longbridge/skills, MIT).
