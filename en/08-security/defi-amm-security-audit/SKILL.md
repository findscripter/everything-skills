---
name: defi-amm-security-audit
title: DeFi AMM セキュリティ
description: DeFi自動マーケットメーカー（AMM）スマートコントラクトセキュリティ監査パターン。フラッシュローン、スリッページ、サンドイッチング攻撃、価格操作、再入攻撃、不正確な整数演算をカバー。
domain: 安全/appsec
triggers: [flash loan, sandwich, slippage, reentrancy, x*y=k]
tags: [defi, amm, solidity, web3, appsec]
level: advanced
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [solidity-security-auditor, defi-protocol-templates, blockchain-web3-developer, c-cpp-security-review]
combines_with: [solidity-security-auditor, false-positive-check, security-audit-toolkit]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# DeFi AMM Security

Security patterns and an audit checklist for automated market maker (AMM) smart contracts.

## When to Use

- Reviewing AMM contracts such as Uniswap, Curve, or Balancer
- Detecting security issues in swap functions, mint, and burn logic
- Identifying flash loan and price manipulation vulnerabilities
- Testing the economic security of DeFi protocols

## Common Vulnerabilities

### 1. Flash Loan Attacks

Attacks against contracts that assume a loan will be repaid within the same block.

### 2. Insufficient Slippage Protection

Users are exposed to unexpected, unfavorable price changes.

### 3. Reentrancy Attacks

State checks performed after an external call.

### 4. Price Manipulation

Over-reliance on on-chain price references.

## Security Checklist

- [ ] All price references are sourced from an oracle
- [ ] Flash loans are accounted for (do not trust spot prices)
- [ ] Slippage protection is implemented
- [ ] Checks-Effects-Interactions pattern is used
- [ ] Reentrancy protection is in place (mutex / guard checks)
- [ ] Integer overflow/underflow is handled
- [ ] Access control and role separation are enforced

For more details, refer to the documentation.
