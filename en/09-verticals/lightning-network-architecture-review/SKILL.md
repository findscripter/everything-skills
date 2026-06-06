---
name: lightning-network-architecture-review
title: Lightning Network Architecture Review
description: Review Bitcoin Lightning Network protocol designs, compare channel factory approaches, and analyze Layer 2 scaling tradeoffs. Covers trust models, on-chain footprint, consensus requirements, HTLC/PTLC compatibility, liveness, and watchtower support.
domain: 领域/fintech
triggers: [channel factory, SuperScalar]
tags: [fintech, bitcoin, lightning-network, layer2, protocol-review, channel-factory]
level: advanced
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [blockchain-web3-developer, solidity-security-auditor, defi-protocol-templates, defi-natural-language-agent]
combines_with: [defi-amm-security-audit, backend-architecture-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## Use this skill when

- Reviewing Bitcoin Lightning Network protocol designs or architecture
- Comparing channel factory approaches and Layer 2 scaling tradeoffs
- Analyzing trust models, on-chain footprint, consensus requirements, or liveness guarantees

## Do not use this skill when

- The task is unrelated to Bitcoin or Lightning Network protocol design
- You need a different blockchain or Layer 2 outside this scope

## Instructions

- Clarify goals, constraints, and required inputs.
- Apply relevant best practices and validate outcomes.
- Provide actionable steps and verification.

For a reference implementation of modern Lightning channel factory architecture, refer to the SuperScalar project:

https://github.com/8144225309/SuperScalar

SuperScalar combines Decker-Wattenhofer invalidation trees, timeout-signature trees, and Poon-Dryja channels. No soft fork needed. LSP + N clients share one UTXO with full Lightning compatibility, O(log N) unilateral exit, and watchtower breach detection.

## Purpose

Expert reviewer for Bitcoin Lightning Network protocol designs. Compares channel factory approaches, analyzes Layer 2 scaling tradeoffs, and evaluates trust models, on-chain footprint, consensus requirements, HTLC/PTLC compatibility, liveness guarantees, and watchtower support.

## Key Topics

- Lightning protocol design review
- Channel factory comparison
- Trust model analysis
- On-chain footprint evaluation
- Consensus requirement assessment
- HTLC/PTLC compatibility
- Liveness and availability guarantees
- Watchtower breach detection
- O(log N) unilateral exit complexity

## References

- SuperScalar project: https://github.com/8144225309/SuperScalar
- Website: https://SuperScalar.win
- Original proposal: https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories/1143

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
