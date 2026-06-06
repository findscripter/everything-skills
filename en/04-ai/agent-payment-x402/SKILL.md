---
name: agent-payment-x402
title: エージェント決済実行（x402）
description: タスクごとのバジェット、支出コントロール、ノンカストディアルウォレットを備えた x402 決済実行を AI エージェントに追加します。agentwallet-sdk を通じて Base をサポートし、OKX Payments / OKX エージェント決済プロトコルを通じて X Layer をサポートします。
domain: 智能/agents
triggers: []
tags: [x402, agent-payment, spending-policy, non-custodial-wallet, mcp, agentwallet-sdk, okx-payments, base, x-layer, erc-4337]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [agent-tool-builder, agent-tool-design, mcp-builder, stripe-integration]
combines_with: [agent-tool-builder, mcp-builder, langgraph-agent-framework]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Agent Payment Execution (x402)

Enable AI agents with policy-gated payments and built-in spending controls. Use the x402 HTTP payment protocol and MCP tools to pay external services, APIs, or other agents without custodial risk.

## When to Use

Use this when an agent needs to pay for API calls, purchase services, settle payments with another agent, enforce per-task spending limits, or manage a non-custodial wallet. It combines naturally with the `cost-aware-llm-pipeline` and `security-review` skills.

## Decision Tree

Choose your integration path based on whether the agent is purchasing access to paid APIs or charging others for access:

| Need | Recommended path |
|------|------------------|
| Agent pays a 402-gated API on Base or another agentwallet-supported chain | Use `agentwallet-sdk` as an MCP payment server with a strict spending policy |
| Agent pays a 402-gated API on X Layer | Use the OKX agent payment protocol from `okx/onchainos-skills`; `okx-x402-payment` is a deprecated legacy alias |
| A TypeScript API charges agents | Use the OKX Payments TypeScript seller SDK docs for Express, Hono, Fastify, or Next.js |
| A Go API charges agents | Use the OKX Payments Go seller SDK docs for Gin, Echo, or `net/http` |
| A Rust API charges agents | Use the OKX Payments Rust seller SDK docs for Axum |
| A Java API charges agents | Use the OKX Payments Java seller SDK docs for Spring Boot 2/3, Java EE, or Jakarta |
| A Python API charges agents | Check the current OKX Payments repository before implementing; a Python seller guide may not exist |

## Supported Networks

- `agentwallet-sdk`: Confirm current network coverage in the package docs before production use. Base Sepolia is the safest development default; Base mainnet is the production path described in the original skill.
- OKX Payments / X Layer: The current seller docs target X Layer (`eip155:196`) and USDT0 settlement. Because the payment packages and facilitator behavior can change quickly, fetch the current SDK docs before generating production code.

## How It Works

### The x402 Protocol
x402 extends HTTP 402 (Payment Required) into a machine-negotiable flow. When a server returns `402`, the agent's payment tool negotiates the price, checks the budget, signs the transaction, and retries only within the policy and confirmation boundaries set by the orchestrator.

### Spending Controls
Every payment tool call enforces a `SpendingPolicy`:
- **Per-task budget** — the maximum spend for a single agent action
- **Per-session budget** — a cumulative limit across the whole session
- **Allowlisted recipients** — restricts the addresses/services the agent can pay
- **Rate limits** — the maximum number of transactions per minute/hour

### Non-Custodial Wallet
Agents hold their own keys through an ERC-4337 smart account. The orchestrator sets the policy before delegation, and the agent can only spend within those boundaries. No pooled funds, no custodial risk.

## MCP Integration

The payment layer exposes standard MCP tools that drop into your Claude Code or agent harness setup.

> **Security note**: Always pin the package version. This tool manages a private key — an unpinned `npx` install introduces supply-chain risk.

### Option A: agentwallet-sdk (Base / multi-chain)

```json
{
  "mcpServers": {
    "agentpay": {
      "command": "npx",
      "args": ["agentwallet-sdk@6.0.0"]
    }
  }
}
```

### Available Tools (agent-callable)

| Tool | Purpose |
|------|---------|
| `get_balance` | Check the agent wallet balance |
| `send_payment` | Send a payment to an address or ENS |
| `check_spending` | Query the remaining budget |
| `list_transactions` | Audit trail of all payments |

> **Note**: The spending policy is set by the **orchestrator** before delegation to the agent — never by the agent itself. This prevents an agent from escalating its own spending limits. Set the policy via `set_policy` in the orchestration layer or a pre-task hook, not as an agent-callable tool.

### Option B: OKX Agent Payment Protocol (X Layer)

Use this path for X Layer x402, multi-party payments (MPP), session payments, charges, and A2A charge flows.

For buyer-side agent flows:

1. Install or reference the current `okx/onchainos-skills` repository.
2. Use `skills/okx-agent-payments-protocol/SKILL.md` as the dispatcher.
3. Treat `skills/okx-x402-payment/SKILL.md` as a deprecated compatibility alias, not the canonical skill.
4. Require explicit user confirmation before checking wallet state or taking a payment action. Do not hide payment execution behind a generic tool call.

For seller-side API flows, fetch the latest language-specific guide before generating code:

| Runtime | Current guide |
|---------|---------------|
| TypeScript | `https://raw.githubusercontent.com/okx/payments/main/typescript/SELLER.md` |
| Go | `https://raw.githubusercontent.com/okx/payments/main/go/x402/SELLER.md` |
| Rust | `https://raw.githubusercontent.com/okx/payments/main/rust/x402/SELLER.md` |
| Java | `https://raw.githubusercontent.com/okx/payments/main/java/SELLER.md` |

Do not copy examples from stale docs without checking the current OKX repository. Current OKX guidance uses `okx-agent-payments-protocol` as the dispatcher, and Java seller docs are now available.

## Example

### Budget Enforcement in an MCP Client

For building an orchestrator that enforces a budget before dispatching a paid tool call.

> **Prerequisite**: Install the package before adding the MCP config — in non-interactive environments, `npx` without `-y` will prompt for confirmation and the server will hang: `npm install -g agentwallet-sdk@6.0.0`

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // 1. Validate credentials before constructing the transport.
  //    Fail immediately if the key is missing — never start the subprocess without auth.
  const walletKey = process.env.WALLET_PRIVATE_KEY;
  if (!walletKey) {
    throw new Error("WALLET_PRIVATE_KEY is not set — refusing to start payment server");
  }

  // Connect to the agentpay MCP server over the stdio transport.
  // Whitelist only the env vars the server needs —
  // do not pass all of process.env to a third-party subprocess that manages a private key.
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["agentwallet-sdk@6.0.0"],
    env: {
      PATH: process.env.PATH ?? "",
      NODE_ENV: process.env.NODE_ENV ?? "production",
      WALLET_PRIVATE_KEY: walletKey,
    },
  });
  const agentpay = new Client({ name: "orchestrator", version: "1.0.0" });
  await agentpay.connect(transport);

  // 2. Set the spending policy before delegating to the agent.
  //    Always confirm success — a silent failure means the controls are not active.
  const policyResult = await agentpay.callTool({
    name: "set_policy",
    arguments: {
      per_task_budget: 0.50,
      per_session_budget: 5.00,
      allowlisted_recipients: ["api.example.com"],
    },
  });
  if (policyResult.isError) {
    throw new Error(
      `Failed to set spending policy — do not delegate: ${JSON.stringify(policyResult.content)}`
    );
  }

  // 3. Use preToolCheck before any paid action
  await preToolCheck(agentpay, 0.01);
}

// Pre-tool hook: fail-closed budget enforcement with four distinct error paths.
async function preToolCheck(agentpay: Client, apiCost: number): Promise<void> {
  // Path 1: reject invalid input (NaN/Infinity bypasses the < comparison)
  if (!Number.isFinite(apiCost) || apiCost < 0) {
    throw new Error(`Invalid apiCost: ${apiCost} — action blocked`);
  }

  // Path 2: transport/connection failure
  let result;
  try {
    result = await agentpay.callTool({ name: "check_spending" });
  } catch (err) {
    throw new Error(`Payment service unreachable — action blocked: ${err}`);
  }

  // Path 3: the tool returned an error (e.g., auth failure, wallet not initialized)
  if (result.isError) {
    throw new Error(
      `check_spending failed — action blocked: ${JSON.stringify(result.content)}`
    );
  }

  // Path 4: parse and validate the response shape
  let remaining: number;
  try {
    const parsed = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text
    );
    if (!Number.isFinite(parsed?.remaining)) {
      throw new TypeError("missing or non-finite 'remaining' field");
    }
    remaining = parsed.remaining;
  } catch (err) {
    throw new Error(
      `check_spending returned unexpected format — action blocked: ${err}`
    );
  }

  // Path 5: budget exceeded
  if (remaining < apiCost) {
    throw new Error(
      `Budget exceeded: need $${apiCost} but only $${remaining} remaining`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
```

## Best Practices

- **Set the budget before delegation**: When spawning a subagent, attach the SpendingPolicy through the orchestration layer. Never give an agent unlimited spend.
- **Pin dependencies**: Always specify the exact version in the MCP config (e.g., `agentwallet-sdk@6.0.0`). Verify package integrity before a production deployment.
- **Audit trail**: Use `list_transactions` in a post-task hook to log what was spent.
- **Fail closed**: If the payment tool is unreachable, block the paid action — do not fall back to unbilled access.
- **Combine with security-review**: Payment tools are highly privileged. Apply the same scrutiny you would to shell access.
- **Test on testnet first**: Use Base Sepolia for development; switch to Base mainnet for production.

## Production References

- **npm**: [`agentwallet-sdk`](https://www.npmjs.com/package/agentwallet-sdk)
- **Merged into the NVIDIA NeMo Agent Toolkit**: [PR #17](https://github.com/NVIDIA/NeMo-Agent-Toolkit-Examples/pull/17) — x402 payment tool for NVIDIA's agent examples
- **Protocol spec**: [x402.org](https://x402.org)
- **OKX Payments SDK**: [`okx/payments`](https://github.com/okx/payments) — TypeScript, Go, Rust, and Java seller integrations for X Layer x402
- **OKX Agent Payment Protocol skill**: [`okx/onchainos-skills`](https://github.com/okx/onchainos-skills/tree/main/skills/okx-agent-payments-protocol)
- **OKX Payments overview**: [web3.okx.com/onchainos/dev-docs/payments/overview](https://web3.okx.com/onchainos/dev-docs/payments/overview)
