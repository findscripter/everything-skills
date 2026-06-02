---
name: defi-amm-security-audit
title: DeFi AMM 智能合约安全审计
description: 当审计 Uniswap/Curve/Balancer 类自动做市商（AMM）合约的 swap/mint/burn 逻辑时使用；按闪电贷、价格操纵、滑点、重入、整数运算、访问控制逐项审查并产出分级漏洞清单与加固建议；不适用于非 EVM 链、链下后端或非 AMM 的通用合约审计。触发词：AMM 审计、闪电贷攻击、价格操纵、三明治、滑点保护、重入
domain: 安全/appsec
triggers: [AMM 安全审计, 闪电贷攻击, flash loan, 价格操纵, 三明治攻击, sandwich, 滑点保护, slippage, 重入攻击, reentrancy, 预言机操纵, 恒定乘积, x*y=k, swap/mint/burn 审计]
tags: [安全, DeFi, AMM, 智能合约, Solidity, 审计, 闪电贷, 价格操纵, Web3, appsec]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob]
requires: []
related: [solidity-security-auditor, defi-protocol-templates, blockchain-web3-developer, c-cpp-security-review]
combines_with: [solidity-security-auditor, false-positive-check, security-audit-toolkit]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

适用于对**自动做市商（AMM）**类智能合约做专项安全审计：

- 审查 Uniswap / Curve / Balancer 等 AMM 及其分叉的 `swap` / `mint` / `burn` / 流动性逻辑
- 识别闪电贷攻击、链上价格操纵、滑点 / 三明治、重入、整数运算缺陷
- 评估 DeFi 协议的**经济安全**（套利、价格参照可信度、储备一致性）

**不该用（负边界）：**

- 非 EVM 链（Solana / Cairo / Move）合约
- 链下后端、撮合服务、数据分析等非合约代码
- 不含做市 / 兑换逻辑的通用合约（用通用 Solidity 审计技能即可）
- 用户只要功能实现，而非安全审查

**心态：** 像攻击者一样在单个区块内组合闪电贷 + 价格操纵 + 兑换，再像安全工程师一样按真实可利用性分级，不夸大、不臆造。

## 步骤

1. **建模攻击面**：列出未授权调用者、闪电贷借款人、抢跑 / 夹击的 MEV 机器人、低权限 LP。重点想清楚「同一区块内能否用借来的资金扭曲价格再反向获利」。
2. **逐项审查六类漏洞**（见下方指令清单）。
3. **核对兑换不变量**：确认 `swap` 后恒定乘积 / 加权不变量（如 `x*y>=k`）成立，含手续费后储备不被掏空。
4. **风险分级**：每项标注 `Critical / High / Medium / Low / Informational`，贴合实际可利用性。
5. **输出报告**：漏洞 → 等级 → 利用场景（攻击交易序列）→ 修复建议（含安全重构示例）。

## 指令

### 六类核心漏洞审查

1. **闪电贷攻击**：合约是否假定借入资金会在同块归还、并据此信任余额 / 价格？任何「读当前储备或现货价 → 做决策」的路径都要假设攻击者可在同块临时拉爆储备。
2. **滑点保护缺失**：`swap` 是否强制 `amountOutMin` / `amountInMax` 与 `deadline`？用户是否会因价格在 mempool 中被夹击而成交在不利价位（三明治攻击）？
3. **重入攻击**：外部调用（`transfer` / 回调 / hook）之后是否还读写状态？是否遵循 **检查—生效—交互（CEI）** 顺序，并加重入锁（mutex）？
4. **价格操纵**：是否直接用**单一池子的现货储备**作价格参照？是否改用抗操纵的预言机（如 Chainlink）或 **TWAP**（时间加权均价）？
5. **整数运算**：是否有上溢 / 下溢、精度截断、除零、先除后乘导致的舍入流失？低于 0.8.0 是否用 SafeMath？
6. **访问控制与角色分离**：管理 / 铸造 / 暂停 / 参数调整是否做了权限与角色隔离？是否存在缺失修饰符的特权函数？

### 安全检查清单

- [ ] 所有价格参照来自抗操纵预言机或 TWAP，**不直接信任现货储备**
- [ ] 已考虑闪电贷（不信任同块内的瞬时价格 / 余额）
- [ ] 已实现滑点保护（`amountOutMin` / `amountInMax` + `deadline`）
- [ ] 遵循检查—生效—交互（CEI）模式
- [ ] 有重入保护（mutex / 状态检查 / `nonReentrant`）
- [ ] 处理整数上溢 / 下溢与精度
- [ ] 访问控制与角色分离到位
- [ ] 兑换后核心不变量（如 `x*y>=k`，含手续费）始终成立

### 行为约束

- 不臆造漏洞；未说明时不假设处于生产环境
- 优先**协议层缓解**（不变量校验、预言机、CEI），而非堆砌外部依赖
- 务实、精确；按可利用性分级，切勿一律 Critical

## 示例

**Issue：用现货储备作价格参照，可被闪电贷操纵**
**Risk：Critical**

问题：清算 / 兑换逻辑直接读取池子 `reserve0 / reserve1` 计算现货价。

利用：攻击者在同一区块借闪电贷 → 向池子大额单边兑换拉偏价格 → 触发以扭曲价成交的依赖逻辑 → 反向兑换并归还闪电贷套利。

修复：改用抗操纵价格源。

```solidity
// 反例：易被同块操纵
uint price = reserve1 * 1e18 / reserve0;

// 推荐：链下预言机 / TWAP
uint price = oracle.latestAnswer();          // 如 Chainlink
// 或对池子累积价格取时间加权（TWAP），跨多区块取均值
```

**Issue：`swap` 缺少滑点与 deadline 参数**
**Risk：High** — 用户暴露于三明治攻击；应强制 `amountOutMin` 与 `deadline`。

## 注意事项

- 仅当合约确含做市 / 兑换逻辑时使用本技能；其余转交通用 Solidity 审计。
- 审计结论不能替代针对具体部署的形式化验证、模糊测试与专家复审。
- 现货储备价、`block.timestamp`、单块内余额都**不可信**——始终从攻击者可在同块操纵的前提出发。
- 若缺少必要源码、依赖合约或成功标准，先停下向用户澄清。

## 互见

- requires：`solidity-security-auditor` —— 通用 EVM / Solidity 安全审计是 AMM 专项审计的前置基础
- related：`defi-protocol-templates`、`blockchain-web3-developer`
- combines_with：`stride-threat-modeler` —— 系统化建模 AMM 攻击面；`semgrep-rule-creator`、`codeql-scanner` —— 将检查清单沉淀为可复用静态扫描规则；`false-positive-check` —— 复核分级、剔除误报

---

采编自 affaan-m/everything-claude-code（MIT 许可）。
