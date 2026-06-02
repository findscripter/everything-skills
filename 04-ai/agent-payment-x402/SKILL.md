---
name: agent-payment-x402
title: AI Agent x402 支付执行（非托管钱包与支出限额）
description: 当 Agent 需要为 402 计费的 API/服务/A2A 付费而又不能托管私钥时使用；做法是接入 x402 协议+MCP 支付服务器，由编排层预设 SpendingPolicy（按任务/会话预算、收款白名单、限速）并 fail-closed 强制，产出受限额约束的非托管支付链路；不适用于自建链上结算合约、法币/信用卡收银台或无预算门控的随意转账。触发词：x402、Agent 支付、支出限额、agentwallet-sdk
domain: 智能/agents
triggers: [Agent 给 API/服务/另一个 Agent 付费, 402 Payment Required 自动结算, 为 Agent 设置按任务/会话预算与收款白名单, 非托管钱包 ERC-4337 智能账户, x402 / agentwallet-sdk / OKX Payments 集成, 限制 Agent 支出不让其自行提额]
tags: [x402, agent-payment, spending-policy, non-custodial-wallet, mcp, agentwallet-sdk, okx-payments, base, x-layer, erc-4337]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [MCP 支付服务器（agentwallet-sdk / OKX Payments）, @modelcontextprotocol/sdk Client + StdioClientTransport, preToolHook / postToolHook 编排钩子]
requires: []
related: [agent-tool-builder, agent-tool-design, mcp-builder, stripe-integration]
combines_with: [agent-tool-builder, mcp-builder, langgraph-agent-framework]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
采编自 affaan-m/everything-claude-code（MIT）。

通过策略门控的支付与内建支出限额，让 AI Agent 能用 x402（HTTP 402 协议）和 MCP 工具向外部 API、服务或其他 Agent 付费，而无需托管私钥、承担托管风险。

## 何时使用

适用：Agent 需要为 API 调用付费、购买服务、与另一个 Agent 结算、强制每次任务的支出上限，或管理非托管钱包。可与 `cost-aware-llm-pipeline`、`security-review` 自然组合。

不该用（负边界）：
- 你要自建链上结算/托管合约或资金池——本技能是非托管、单 Agent 自持密钥模型，不做资金归集。
- 法币、信用卡、传统收银台支付——x402 面向链上稳定币结算。
- 不打算做预算门控、想让 Agent 随意转账——违背本技能核心（支出必须被策略约束）。
- 想让 Agent 自己设置/提升自身限额——策略必须由编排层在委派前设定。

## 步骤

按「Agent 是买方（付费访问 API）还是卖方（向他人收费）」选集成路径：

| 需求 | 推荐路径 |
|------|----------|
| Agent 向 Base 等 agentwallet 支持链的 402 API 付费 | 用 `agentwallet-sdk` 作为 MCP 支付服务器，配严格支出策略 |
| Agent 向 X Layer 的 402 API 付费 | 用 `okx/onchainos-skills` 的 OKX Agent 支付协议；`okx-x402-payment` 是已废弃的旧别名 |
| TypeScript/Go/Rust/Java API 要向 Agent 收费 | 用对应语言的 OKX Payments 卖方 SDK 文档（Express/Hono/Fastify/Next.js、Gin/Echo/net/http、Axum、Spring Boot 等） |
| Python API 收费 | 实现前先确认当前 OKX 仓库——可能尚无 Python 卖方指南 |

支持网络（生成生产代码前务必查当前 SDK 文档，二者变动很快）：
- `agentwallet-sdk`：Base Sepolia 是最安全的开发默认；Base 主网为生产路径。
- OKX Payments / X Layer：当前卖方文档面向 X Layer（`eip155:196`）与 USDT0 结算。

核心机制：
1. x402 协议——把 HTTP 402（Payment Required）扩展为机器可协商流程。服务器返回 402 后，Agent 的支付工具协商价格、核对预算、签名交易，仅在编排层设定的策略与确认边界内重试。
2. 支出限额——每次支付工具调用都强制 `SpendingPolicy`：按任务预算（单次动作上限）、按会话预算（会话累计上限）、收款白名单（限制可付地址/服务）、限速（每分/时最大交易数）。
3. 非托管钱包——Agent 通过 ERC-4337 智能账户自持密钥；编排层在委派前设策略，Agent 只能在边界内支出。无资金池、无托管风险。

## 指令

MCP 接入（option A：agentwallet-sdk，Base/多链）：

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

Agent 可调用工具：`get_balance`（查余额）、`send_payment`（向地址或 ENS 付款）、`check_spending`（查剩余预算）、`list_transactions`（审计轨迹）。

关键约束：`set_policy` 由**编排层**在委派前设置（或放任务前置钩子），**绝不暴露为 Agent 可调用工具**——否则 Agent 可自行提升限额。

option B：OKX Agent 支付协议（X Layer，用于 MPP 多方结算、会话支付、充值、A2A 充值流）：
1. 安装/引用当前 `okx/onchainos-skills` 仓库。
2. 以 `skills/okx-agent-payments-protocol/SKILL.md` 作分发器。
3. 将 `skills/okx-x402-payment/SKILL.md` 视为废弃兼容别名，不当正规技能。
4. 查钱包状态或执行支付前必须显式征求用户确认，不把支付执行藏在通用工具调用背后。

卖方侧生成代码前取最新语言指南（勿照抄旧文档示例）：

```
TS:   https://raw.githubusercontent.com/okx/payments/main/typescript/SELLER.md
Go:   https://raw.githubusercontent.com/okx/payments/main/go/x402/SELLER.md
Rust: https://raw.githubusercontent.com/okx/payments/main/rust/x402/SELLER.md
Java: https://raw.githubusercontent.com/okx/payments/main/java/SELLER.md
```

安全提示：始终锁定包版本。此工具管理私钥——未固定版本的 `npx` 安装带来供应链风险。

## 示例

在 MCP 客户端里 fail-closed 强制预算（先装包再配 MCP：非交互环境下不带 `-y` 的 `npx` 会等确认导致服务器挂起，故 `npm install -g agentwallet-sdk@6.0.0`）：

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // 1. 构造 transport 前先校验凭据，缺失即立即失败——不允许无认证启动子进程。
  const walletKey = process.env.WALLET_PRIVATE_KEY;
  if (!walletKey) {
    throw new Error("WALLET_PRIVATE_KEY is not set — refusing to start payment server");
  }

  // 仅白名单服务器所需的 env，不把整个 process.env 传给管理私钥的第三方子进程。
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

  // 2. 委派给 Agent 前设置支出策略，并务必确认成功——静默失败=限额未生效。
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

  // 3. 付费动作前走 preToolCheck。
  await preToolCheck(agentpay, 0.01);
}

// 前置钩子：fail-closed 预算强制，覆盖多条错误路径。
async function preToolCheck(agentpay: Client, apiCost: number): Promise<void> {
  // 拒绝非法输入（NaN/Infinity 会绕过 < 比较）
  if (!Number.isFinite(apiCost) || apiCost < 0) {
    throw new Error(`Invalid apiCost: ${apiCost} — action blocked`);
  }
  // 传输/连接失败
  let result;
  try {
    result = await agentpay.callTool({ name: "check_spending" });
  } catch (err) {
    throw new Error(`Payment service unreachable — action blocked: ${err}`);
  }
  // 工具返回错误（如认证失败、钱包未初始化）
  if (result.isError) {
    throw new Error(`check_spending failed — action blocked: ${JSON.stringify(result.content)}`);
  }
  // 解析并校验响应形状
  let remaining: number;
  try {
    const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text);
    if (!Number.isFinite(parsed?.remaining)) {
      throw new TypeError("missing or non-finite 'remaining' field");
    }
    remaining = parsed.remaining;
  } catch (err) {
    throw new Error(`check_spending returned unexpected format — action blocked: ${err}`);
  }
  // 预算超限
  if (remaining < apiCost) {
    throw new Error(`Budget exceeded: need $${apiCost} but only $${remaining} remaining`);
  }
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
```

## 注意事项

- 委派前设预算：生成子 Agent 时通过编排层附加 SpendingPolicy，绝不给 Agent 无限支出权。
- 固定依赖：MCP 配置写精确版本（如 `agentwallet-sdk@6.0.0`），生产部署前核对包完整性。
- 审计轨迹：任务后置钩子用 `list_transactions` 记录花费明细。
- Fail-closed：支付工具不可达时阻断付费动作，绝不回退到「免费/未计费」访问。
- 配合 security-review：支付工具权限极高，按与 shell 访问同等的标准审查。
- 先在测试网测：开发用 Base Sepolia，生产切 Base 主网。

生产参考：npm `agentwallet-sdk`；已并入 NVIDIA NeMo Agent Toolkit（PR #17）；协议规范 x402.org；OKX Payments SDK `okx/payments`（X Layer x402 的 TS/Go/Rust/Java 卖方集成）；OKX Agent 支付协议技能 `okx/onchainos-skills`；OKX Payments 概览 web3.okx.com/onchainos/dev-docs/payments/overview。

## 互见

- `cost-aware-llm-pipeline`——成本感知调用编排，与支出预算天然互补。
- `security-review`——对管理私钥的高权限支付工具做安全审查。
