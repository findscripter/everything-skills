---
name: blockchain-web3-developer
title: Web3 智能合约与 DeFi 开发
description: 当需要开发智能合约、DeFi 协议、NFT 平台、DAO 治理或 dApp 前端时使用；产出可上线的 Solidity/Rust 合约、测试、Gas 优化方案与安全审计清单；不适用于纯链下后端、传统支付清算或与区块链无关的任务。触发词：智能合约、DeFi、NFT、DAO、Solidity、Foundry、Web3、跨链
domain: 领域/fintech
triggers: [智能合约, DeFi, NFT, DAO, Solidity, Foundry, Hardhat, Web3, ERC-20, ERC-721, 跨链桥, Chainlink 预言机, dApp, Gas 优化, 合约审计, 账户抽象]
tags: [web3, blockchain, smart-contract, solidity, defi, nft, dao, security, ethereum, misc]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Foundry, Hardhat, Solidity, OpenZeppelin, Slither, Mythril, Ethers.js, Viem, Wagmi, The Graph, Chainlink, Anchor]
requires: []
related: [defi-protocol-templates, solidity-security-auditor]
combines_with: [solidity-security-auditor, defi-protocol-templates]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于以下区块链/Web3 开发场景：

- 编写、审计或升级智能合约：Solidity（EVM）、Rust（Solana/NEAR/Cosmos）、Vyper。
- 实现 DeFi 协议：AMM（Uniswap V2/V3、Curve）、借贷（Aave/Compound/MakerDAO）、收益耕作、闪电贷、衍生品。
- 构建 NFT 平台：ERC-721/1155、版税（EIP-2981）、链上元数据、市场合约、IPFS 存储。
- 搭建 DAO 治理：治理代币、加权投票、提案执行、多签金库、时间锁。
- 开发 dApp 前端与钱包集成、预言机接入、跨链桥、账户抽象（ERC-4337）。

不该用（负边界）：

- 纯链下后端、传统数据库 CRUD、与区块链无关的 Web 应用。
- 法币支付清算、传统银行对账等不上链的金融逻辑。
- 需要不同领域工具或超出区块链范围的任务。
- 缺少关键输入（目标链、合约接口、资金/权限边界、安全验收标准）时，应先停下来澄清，而非直接产出代码。

## 步骤

1. 厘清需求与权衡：目标链、安全性、可扩展性、去中心化程度三者的取舍；明确约束与必需输入。
2. 设计架构：选定链与 L2、规划合约间交互、升级模式（透明代理 / UUPS / Beacon）、预言机与跨链方案。
3. 实现生产级代码：优先复用 OpenZeppelin 等经过实战检验的库，避免重复造轮子；遵循 checks-effects-interactions。
4. 全面测试：单元测试 + 模糊测试（fuzzing）+ 基于属性的测试，覆盖重入、溢出、访问控制等攻击面。
5. Gas 优化与成本分析：精简合约体积、打包存储槽、减少 SLOAD/SSTORE。
6. 安全审计：静态分析（Slither、Mythril）与形式化验证（Certora），输出攻击向量与缓解措施。
7. 部署与监控：测试网先行、CI 自动化部署、多链配置管理，接入监控与异常检测。
8. 文档与合规：审计就绪的代码注释，评估监管与法律影响。

## 指令

- 安全优先于上线速度，先验证再部署。
- 始终复用 battle-tested 库与既有模式（OpenZeppelin、标准 EIP）。
- 升级合约必须使用规范代理模式，注意存储布局兼容。
- 价格/随机数走预言机（Chainlink Price Feeds / VRF），并做 MEV 与抢跑防护。
- 涉及资金的逻辑须有重入保护、访问控制、暂停开关与多签/时间锁。
- 如需更详尽的实现样板，打开 `resources/implementation-playbook.md`。

## 示例

- 「构建可上线的 DeFi 借贷协议，含清算机制。」
- 「实现带版税分配的跨链 NFT 市场。」
- 「设计 DAO 治理系统：代币加权投票 + 提案自动执行。」
- 「做带自动复投与风险管理的收益耕作协议。」
- 「实现带时间锁交易的多签金库管理系统。」

典型 Foundry 工作流：

```bash
forge init my-protocol           # 初始化项目
forge install OpenZeppelin/openzeppelin-contracts
forge test --fuzz-runs 10000     # 含模糊测试
forge coverage                   # 覆盖率
slither .                        # 静态安全分析
forge script script/Deploy.s.sol --rpc-url $RPC --broadcast --verify
```

最小重入防护示例（Solidity）：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    mapping(address => uint256) public balances;

    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;                 // effects 先于 interactions
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
    }
}
```

## 注意事项

- 重入、整数溢出、访问控制是最高频漏洞，务必逐一覆盖测试与审计。
- 合约一旦部署不可随意更改，主网部署前必须经测试网与外部审计验证。
- 升级模式下注意存储槽冲突，新增变量只能追加不可插入。
- 跨链桥与预言机是常见攻击面，设计阶段即考虑互操作与抗操纵。
- 关注全球监管与合规（KYC/AML、证券属性），涉及资产代币化尤需谨慎。
- 私钥与多签由硬件钱包/阈值密码学管理，切勿硬编码。
- 本技能输出不能替代针对具体环境的验证、测试与专家审计；缺少输入或边界不清时先澄清。

## 互见

- 领域/misc 下其他安全审计与 DevOps 自动化类技能。
- 前端 dApp 集成可参考 React/Next.js 与 Wagmi/RainbowKit 相关技能。
- 链下数据索引参见 The Graph 与自定义索引器相关条目。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
