---
name: defi-natural-language-agent
title: 自然语言 DeFi 链上交易代理
description: 当用户想用自然语言在 EVM 链上做 DeFi 操作（查价/换币/质押/桥接）并签名上链时使用；驱动 Aomi CLI 把提示转成钱包待签交易，先 list+模拟再经显式批准签名；不适用于无网络后端、非本人账户或绕过防盗保护。触发词：DeFi 代理、链上交易、自然语言换币、Aomi、钱包签名、跨链桥
domain: 领域/fintech
triggers: [自然语言 DeFi 操作, 在 EVM 链上换币/质押/桥接, 查询链上余额价格路由报价, 构建/模拟/签名钱包交易, EIP-712 类型化数据签名, 切换 app/模型/链/会话或 AA 设置]
tags: [defi, wallet, onchain, account-abstraction, eip-712, cli, agent, intent]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [@aomi-labs/client, aomi, npm, npx]
requires: []
related: [blockchain-web3-developer, agent-payment-x402, defi-protocol-templates, evm-token-decimals]
combines_with: [solidity-security-auditor, nodejs-keccak256-hashing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 想在终端里用自然语言和 Aomi 代理对话，让它在 Ethereum、Base、Arbitrum、Optimism、Polygon、Linea 上执行 DeFi 操作。
- 查询余额、价格、路由、报价或交易状态。
- 构建、模拟、确认、签名或广播钱包请求；或在签名前模拟一批待处理交易。
- 查看/切换 app、模型、链、会话，或调整账户抽象（EIP-7702 / ERC-4337）设置。
- 签名 EIP-712 类型化数据（链下协议、意图填充）。

不该用（负边界）：
- 无网络后端时。CLI 需连 `api.aomi.dev`，离线只有本地读命令（`aomi tx list`、`aomi session log`）可用。
- 非用户本人持有的账户、或不信任的网络。本技能会签名并广播真实价值交易。
- 试图绕过防盗保护（drain vectors）。当 `recipient`/`onBehalfOf`/`mintRecipient` ≠ `msg.sender` 时代理会拒绝，这是安全特性，应把拦截如实告知用户而非改写提示。

## 步骤

1. 新任务的第一条命令带 `--new-session`；任务中途不要重用，否则代理会丢失刚给出的报价。
2. 用自然语言发起意图（`aomi chat "..."`），传入 `--public-key 0xUserAddress` 和目标 `--chain`。代理自动选协议/合约、把 approve+swap 暂存为一批、在分叉链上模拟，并返回待签队列。
3. 签名前永远先 `aomi tx list`，不要假设 chat 响应已排队交易。
4. 多步批次签名前必须 `aomi tx simulate tx-1 tx-2 ...`。模拟器在分叉链上按序执行，使 swap 能看到 approve 的状态变更；单笔交易模拟可选但模拟从不出错。
5. 停在 list/模拟之后，向用户汇总交易 id、链、value、收款方、calldata 用途、模拟结果，再请用户给出明确签名指令（如 `sign tx-1`）。仅在该独立批准后才运行确切的签名命令。

## 指令

- 安装：`npm install -g @aomi-labs/client`，或按需 `npx @aomi-labs/client@0.1.30 ...`。要求 **v0.1.30 或更新**（旧版缺 `--aa`、`--aa-provider`、`--aa-mode` 和模拟门）。
- 账户抽象优先：默认走零配置 Alchemy 代理（无需 provider 凭据），主网用 EIP-7702、L2 用 ERC-4337。每次 `aomi <子命令>` 启动—执行—退出，无常驻进程。
- 签名门（强约束）：不要把 `aomi tx sign` 放进可复制/可运行的多命令块。只有出现用户独立、明确、点名具体 `tx-N` 的批准后，才执行确切的签名命令。
- 只签名 `Batch [...] passed` 的交易，跳过早期失败尝试留下的孤儿（`failed at step N: 0x...`）。
- `--rpc-url` 要匹配队列里那笔交易的链，而非会话链（`--chain`）——两者是独立控制项。
- 永不回显凭据值。需要 provider token 的 app（`binance`、`polymarket`、`dune` 等）须由用户自行在 shell 配置或 `aomi secret add NAME=<value>`；技能只用句柄名或派生地址确认配置。

## 示例

只读查价（不排队任何钱包请求）：
```bash
aomi --prompt "what is the price of ETH?" --new-session
```

单笔 — Lido 质押：
```bash
aomi chat "Stake 0.01 ETH with Lido to get stETH" \
  --public-key 0xUserAddress --chain 1 --new-session
aomi tx list
```
即 Lido stETH `0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84` 上的 `submit(address(0))`，`value = 0.01 ETH`，无 approve、单笔。停在此处展示队列细节，等用户明确指令再签。

多步批次 — Uniswap V3 换币：
```bash
aomi chat "swap 1 USDC for WETH on Uniswap V3, send to my wallet" \
  --public-key 0xUserAddress --chain 1 --new-session
aomi tx list                 # tx-1 = approve, tx-2 = swap
aomi tx simulate tx-1 tx-2   # 多步必做
```
不要单独签 step 2，否则会 revert。模拟后汇总批次，等用户点名两个 tx id 再签。

跨链 — CCTP 以太坊 → Base：
```bash
aomi chat "Bridge 50 USDC from Ethereum to Base via CCTP. Recipient is my wallet." \
  --public-key 0xUserAddress --chain 1 --new-session
aomi tx list
aomi tx simulate tx-1 tx-2
```
签名后源链 burn 在 1-2 个区块确认；目标链 mint 需 Circle 链下背书（约 13-19 分钟）。

## 注意事项

- L2 上 AA 代付不保证：v0.1.30 的零配置代理在 Base/Arbitrum/Optimism 上不一定代付。若 EOA 在目标链零原生 gas，`aomi tx sign` 会报 viem 的 `insufficient funds for transfer`。要么给 EOA 充少量原生 gas，要么配置带代付策略的真实 BYOK Alchemy/Pimlico provider。不要改用 `--eoa` 重试——那条路同样要 gas。
- 公共 RPC 可能限流（`429`）或鉴权失败（`401`）。生产签名时用户应通过 `--rpc-url` 提供可靠且匹配链的 RPC。
- 滑点与截止时间：带 deadline 的路由（Across、Khalani 填充器）报价可能在用户审阅时过期，代理会用新 deadline 自愈重建，用户应重新 `aomi tx list` 取最新通过的批次。
- 授权声明：本技能能签名并广播真实价值的链上交易，不托管资金，用户经 `--public-key` 与底层钱包保有完整签名密钥控制权。运行 `aomi tx sign` 前请审阅每一笔队列中的 `tx-N`。

## 互见

- 上游完整技能（references / templates / agents 元数据）：`aomi-labs/skills`（[aomi-transact](https://github.com/aomi-labs/skills/tree/main/aomi-transact)），本条目仅为规范化的 SKILL.md。
- 账户抽象参考、App 目录（25+ 应用）、流程示例、防盗向量表、排障指南、`aomi-workflow.sh` 模板均见上游仓库。
- 安全评审：上游 [aomi-transact/SECURITY.md](https://github.com/aomi-labs/skills/blob/main/aomi-transact/SECURITY.md)（OWASP AST01–AST10 走查及扫描报告）。

---
采编自 sickn33/antigravity-awesome-skills（MIT），上游原始为 aomi-labs/skills（MIT）。
