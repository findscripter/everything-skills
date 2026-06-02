---
name: solidity-security-auditor
title: Solidity智能合约安全
description: 当编写、审计 Solidity 智能合约或为 DeFi/区块链应用排查安全漏洞时使用；做漏洞识别与安全模式重写并产出加固代码、测试用例与审计前清单；不适用于非 EVM 链（Solana/Cairo/Move）、链下后端代码或纯业务逻辑审查；触发词：智能合约安全、Solidity 审计、重入、reentrancy、整数溢出、访问控制、CEI、抢跑、front-running、gas 优化
domain: 领域/fintech
triggers: [智能合约安全, Solidity 审计, 重入, reentrancy, 整数溢出, overflow, 访问控制, access control, CEI, 抢跑, front-running, gas 优化, 审计准备]
tags: [security, solidity, smart-contract, web3, audit, fintech, defi]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [solidity, hardhat, openzeppelin, ethers.js, slither]
requires: []
related: [defi-protocol-templates, blockchain-web3-developer, codeql-scanner, security-audit-toolkit]
combines_with: [defi-protocol-templates, blockchain-web3-developer]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 编写新的 Solidity 智能合约，需要从一开始就套用安全模式（CEI、访问控制、输入校验）时。
- 审计已有合约，逐项排查重入、整数溢出/下溢、访问控制缺失、抢跑、未校验外部调用返回值等漏洞时。
- 实现 DeFi 协议、托管、提现、批量支付等涉及资金流转的合约时。
- 在送外部专业审计前，做自检并准备 NatSpec 文档与漏洞清单时。

**不该用**：
- 非 EVM 链合约（Solana/Anchor、Cairo、Move、Cosmos）→ 各链漏洞模型不同，本技能仅覆盖 Solidity/EVM。
- 链下后端、前端、API 代码的逻辑审查 → 用 `code-reviewer`。
- 仅审计第三方库/依赖的已知 CVE 与供应链风险 → 用 `dependency-auditor`。
- 形式化验证、符号执行等高阶证明工作 → 超出范围，应交由专门工具/审计方。

## 步骤

1. **定基线**：确认 `pragma` 版本。`>=0.8.0` 内置溢出/下溢检查；`<0.8.0` 必须引入 OpenZeppelin `SafeMath`。优先升级编译器而非打补丁。
2. **过四大高危漏洞**：逐函数检查 ①重入 ②整数溢出/下溢 ③访问控制 ④抢跑（见「指令」与「示例」）。
3. **核心模式重写**：把「先外部调用后改状态」改写为 **Checks-Effects-Interactions（CEI）**；资金分发用 **Pull-over-Push**；批量转账禁用循环 `transfer`。
4. **加防护层**：高危函数加 `nonReentrant`、`onlyOwner`/角色 modifier、`whenNotPaused`，并在入口做输入校验（零地址、自地址、非零金额、余额上限）。
5. **跑安全测试**：用 Hardhat 编写攻击合约，断言重入被 revert、溢出被 revert、越权调用被 revert。
6. **审计准备**：补全 NatSpec（`@title/@notice/@dev/@param`），对照清单逐条打钩，输出残留风险与假设。

## 指令

- 重入：状态更新必须早于外部调用；外部调用（`call{value:}`）放在函数最后，且检查返回 `success`。可叠加 OpenZeppelin `ReentrancyGuard` 的 `nonReentrant`。
- 溢出/下溢：`0.8+` 默认 revert，无需 SafeMath；低版本用 `using SafeMath for uint256` 并 `.add/.sub`。
- 访问控制：用 `Ownable` 的 `onlyOwner` 或自定义角色 `modifier`；鉴权一律用 `msg.sender`，**禁用 `tx.origin`**。
- 抢跑：敏感交易用 commit-reveal 两步法（先提交 `keccak256` 承诺，下一区块再揭示）。
- 外部交互：禁止对不可信合约 `delegatecall`；不硬编码地址；用事件记录关键状态变更。
- Gas：状态变量优先 `uint256`、对小类型做 **storage 打包**；函数参数用 `calldata` 而非 `memory`。

## 示例

不安全 → 安全（CEI 重入修复）：
```solidity
// 危险：先转账后改状态，可被重入
function withdraw() public {
    uint256 amount = balances[msg.sender];
    (bool ok, ) = msg.sender.call{value: amount}(""); require(ok);
    balances[msg.sender] = 0;   // 太晚！
}

// 安全：Checks-Effects-Interactions
function withdraw() public {
    uint256 amount = balances[msg.sender];
    require(amount > 0, "Insufficient balance");
    balances[msg.sender] = 0;                       // EFFECTS 先
    (bool ok, ) = msg.sender.call{value: amount}(""); // INTERACTIONS 后
    require(ok, "Transfer failed");
}
```

访问控制 + 紧急熔断：
```solidity
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Vault is Ownable, Pausable {
    function withdraw(uint256 amount) public onlyOwner whenNotPaused {
        payable(owner()).transfer(amount);
    }
    function emergencyStop() public onlyOwner { _pause(); }
}
```

Hardhat 安全测试（断言攻击被拦截）：
```javascript
it("Should prevent reentrancy attack", async function () {
  const bank = await (await ethers.getContractFactory("SecureBank")).deploy();
  const attacker = await (await ethers.getContractFactory("ReentrancyAttacker")).deploy(bank.address);
  await bank.deposit({ value: ethers.utils.parseEther("10") });
  await expect(
    attacker.attack({ value: ethers.utils.parseEther("1") })
  ).to.be.revertedWith("ReentrancyGuard: reentrant call");
});
```

审计前自检清单（逐条打钩）：
```
[ ] 重入防护（ReentrancyGuard 或 CEI）   [ ] 溢出/下溢（0.8+ 或 SafeMath）
[ ] 访问控制（Ownable/角色/modifier）    [ ] 输入校验（require）
[ ] 抢跑缓解（必要时 commit-reveal）      [ ] Gas（storage 打包、calldata）
[ ] 紧急熔断（Pausable）                  [ ] 支付用 Pull 而非 Push
[ ] 不对不可信合约 delegatecall           [ ] 鉴权用 msg.sender 而非 tx.origin
[ ] 外部调用置于函数末尾并检查返回值       [ ] 不硬编码地址；代理则有升级机制
```

## 注意事项

- **编译器版本是第一道防线**：先确认 `pragma`，`<0.8.0` 不加 SafeMath 的任何溢出讨论都无意义。
- **CEI ≠ 万能**：`nonReentrant` 只防同合约重入，跨合约/只读重入（read-only reentrancy）仍可能绕过，需结合调用顺序审查。
- **批量 Push 支付有 DoS 风险**：循环里任一 `transfer` 失败会拖垮整批，务必改为 Pull 模式让用户自行提现。
- **`tx.origin` 鉴权可被钓鱼合约劫持**，一律换 `msg.sender`。
- **本技能不替代专业审计**：自检通过仅降低风险，主网上线高价值合约仍需第三方审计 + Slither 等静态分析。
- 漏洞模型与最佳实践随生态演进，具体 OpenZeppelin 导入路径（如 `security/` 在新版可能迁移）以**当前安装版本**为准，不要凭记忆写路径。

## 互见

- related：`code-reviewer` —— 本技能专攻链上合约的资金/权限漏洞，code-reviewer 覆盖链下与通用代码缺陷，二者互补。
- related：`dependency-auditor` —— 合约常依赖 OpenZeppelin 等库，dependency-auditor 负责这些第三方依赖的 CVE 与供应链风险。

---
本条采编自 wshobson/agents（MIT）。
