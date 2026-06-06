---
name: backtesting-frameworks
title: Backtesting Frameworks
description: Build robust, production-grade backtesting systems that avoid common pitfalls and produce reliable strategy performance estimates.
domain: 领域/fintech
triggers: [backtest, walk-forward]
tags: [quant, backtesting, trading-strategy, risk, python]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [trading-strategy-backtester, portfolio-risk-metrics, portfolio-rebalancer]
combines_with: [alpha-vantage-market-data, portfolio-risk-metrics, trading-strategy-backtester]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Backtesting Frameworks

Build robust, production-grade backtesting systems that avoid common pitfalls and produce reliable strategy performance estimates.

## Use this skill when

- Developing trading strategy backtests
- Building backtesting infrastructure
- Validating strategy performance and robustness
- Avoiding common backtesting biases
- Implementing walk-forward analysis

## Do not use this skill when

- You need live trading execution or investment advice
- Historical data quality is unknown or incomplete
- The task is only a quick performance summary

## Instructions

- Define hypothesis, universe, timeframe, and evaluation criteria.
- Build point-in-time data pipelines and realistic cost models.
- Implement event-driven simulation and execution logic.
- Use train/validation/test splits and walk-forward testing.
- If detailed examples are required, open `resources/implementation-playbook.md`.

## Safety

- Do not present backtests as guarantees of future performance.
- Avoid providing financial or investment advice.

## Resources

- `resources/implementation-playbook.md` for detailed patterns and examples.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
