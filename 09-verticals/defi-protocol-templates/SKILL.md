---
name: defi-protocol-templates
title: DeFi 协议合约模板
description: 当用 Solidity 搭建质押/AMM/治理/借贷/闪电贷等 DeFi 协议时使用；基于 OpenZeppelin 提供可直接套用的合约骨架并给出安全与上线检查清单；不适用于纯前端 DApp、链下数据分析或非 EVM 链。触发词：DeFi、Solidity、质押、AMM、治理代币、闪电贷
domain: 领域/fintech
triggers: [DeFi 协议, 智能合约模板, Solidity 质押合约, AMM 自动做市商, 治理代币, 闪电贷, 流动性挖矿, 借贷协议, StakingRewards, ERC20Votes]
tags: [DeFi, Solidity, 智能合约, 区块链, OpenZeppelin, AMM, 质押, 治理, 闪电贷, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Solidity, OpenZeppelin, Foundry, Hardhat]
requires: []
related: [blockchain-web3-developer, solidity-security-auditor]
combines_with: [solidity-security-auditor, blockchain-web3-developer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 搭建带奖励分发的质押平台（StakingRewards 模式）。
- 实现 AMM 自动做市商（恒定乘积、流动性 LP、swap）。
- 创建治理代币与提案投票系统（ERC20Votes + Governor）。
- 开发借贷/借出协议、集成闪电贷、上线流动性挖矿。

不该用（负边界）：
- 任务与 DeFi 合约无关，或纯前端 DApp、链下脚本、数据分析。
- 目标链非 EVM（如 Solana/Move 系），本模板基于 Solidity + OpenZeppelin。
- 把这些模板当作可直接主网部署的成品——它们是骨架，缺少审计、测试与场景化校验。

## 步骤

1. 明确目标、约束与必需输入：协议类型、代币标准、费率、奖励曲线、权限模型。
2. 选定对应模板（质押 / AMM / 治理 / 闪电贷）作为起点，按需裁剪。
3. 复用成熟库：OpenZeppelin（ReentrancyGuard、Ownable、ERC20Votes）或 Solmate，避免手写底层。
4. 编写测试：单元测试 + 集成测试 + 模糊测试（fuzzing），覆盖边界与攻击面。
5. 上线前做专业安全审计；先发 MVP，再逐步增量加功能。
6. 部署后持续监控合约健康度与用户活动，并准备应急暂停（pause）机制。

## 指令

- 先澄清目标、约束与所需输入，再动手。
- 套用对应最佳实践并验证产出，给出可执行步骤与验证方法。
- 需要更完整示例时打开 `resources/implementation-playbook.md`。
- 不得把输出当作环境化验证、测试或专家评审的替代品；缺少必需输入、权限、安全边界或成功标准时，停下来询问。

## 示例

质押合约核心（StakingRewards，含奖励累计与重入防护）：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingRewards is ReentrancyGuard, Ownable {
    IERC20 public stakingToken;
    IERC20 public rewardsToken;
    uint256 public rewardRate = 100; // 每秒奖励
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;
    uint256 private _totalSupply;

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) return rewardPerTokenStored;
        return rewardPerTokenStored +
            ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / _totalSupply;
    }

    function earned(address account) public view returns (uint256) {
        return (balances[account] *
            (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18 + rewards[account];
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        _totalSupply += amount;
        balances[msg.sender] += amount;
        stakingToken.transferFrom(msg.sender, address(this), amount);
    }
    // withdraw / getReward / exit 同理，均带 nonReentrant + updateReward
}
```

AMM 核心：恒定乘积定价 + 0.3% 手续费的 swap：

```solidity
// 0.3% fee；amountOut = resOut * amountInWithFee / (resIn + amountInWithFee)
uint256 amountInWithFee = (amountIn * 997) / 1000;
amountOut = (resOut * amountInWithFee) / (resIn + amountInWithFee);
```

治理：用 `ERC20Votes` 做投票快照，提案校验 `getPastVotes(msg.sender, block.number - 1) >= proposalThreshold`，投票按 `getPastVotes` 在 `startBlock` 的权重计票，`forVotes > againstVotes` 且过 `endBlock` 后方可 `execute`。

闪电贷：先 `transfer` 借出，回调 `executeOperation`，再校验 `balanceAfter >= balanceBefore + fee` 验证还款，否则 revert（费率示例 `feePercentage = 9` 即 0.09%，`fee = amount * feePercentage / 10000`）。

## 注意事项

最佳实践：
1. 复用成熟库：OpenZeppelin、Solmate。
2. 充分测试：单元 / 集成 / 模糊测试。
3. 上线前做专业安全审计。
4. 从简起步，MVP 优先，增量加功能。
5. 监控合约健康度与用户活动。
6. 可升级性：评估代理（proxy）模式。
7. 紧急控制：为关键问题预留暂停机制。

常见 DeFi 模式：TWAP（抗预言机操纵的时间加权均价）、流动性挖矿、Vesting 线性释放、多签（Multisig）、时间锁（Timelock）。

约束与局限：仅在任务明确落在上述范围内时使用；不要将输出当作环境化校验、测试或专家评审的替代；缺少必需输入、权限、安全边界或成功标准时应停止并询问。

## 互见

源仓库附带的深入参考（如需可对照查阅）：
- `references/staking.md`：质押机制与奖励分发
- `references/liquidity-pools.md`：AMM 数学与定价
- `references/governance-tokens.md`：治理与投票系统
- `references/lending-protocols.md`：借贷实现
- `references/flash-loans.md`：闪电贷安全与用例
- `assets/*.sol`：质押 / AMM / 治理 / 借贷的完整合约模板

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
