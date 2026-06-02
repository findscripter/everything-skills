---
name: evm-token-decimals
title: EVM 代币精度防错（小数位不匹配）
description: 当读取 ERC-20 余额、跨链比对代币数量或算法币价值时使用；运行时查询 decimals() 并按 (chain_id, token) 缓存，输出精度安全的归一化金额；不适用于非 EVM 链或链下数据库已存精度的纯展示场景；触发词：ERC-20、decimals、小数位、跨链代币、桥接资产、USD 估值
domain: 领域/fintech
triggers: [读取 ERC-20 余额, 计算代币 USD 价值, 跨 EVM 链比较代币数量, 处理桥接资产精度, 构建投资组合追踪器/机器人/聚合器, decimals 不匹配排错]
tags: [fintech, evm, erc20, web3, solidity, 精度, 区块链]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [web3.py, ethers.js, Solidity, cast (foundry)]
requires: []
related: [nodejs-keccak256-hashing, solidity-security-auditor, blockchain-web3-developer, defi-protocol-templates]
combines_with: [blockchain-web3-developer, defi-protocol-templates, agent-payment-x402]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

当你在 Python / TypeScript / Solidity 中读取 ERC-20 余额、把链上原始余额换算成法币价值、跨多条 EVM 链比较代币数量、处理桥接（bridged）资产，或构建投资组合追踪器、交易机器人、数据看板、DeFi 聚合器时使用。

小数位静默不匹配是导致余额或 USD 估值差几个数量级却不报错的最常见原因之一——它不抛异常，只给你错误的数字。

不该用：

- 非 EVM 链（如 Solana、比特币）——精度模型不同，本条不适用。
- 精度已由可信链下数据源固化、且仅做纯展示的场景，可省去运行时查询；但只要参与计算或跨链比较，仍应回到运行时查询。

## 步骤

1. 运行时查询：对每个代币调用合约的 `decimals()`，不要按符号（symbol）硬编码。
2. 按链+地址缓存：用 `(chain_id, token_address)` 做缓存键，绝不用符号缓存（同符号在不同链精度可能不同）。
3. 精确数学：换算与估值用 `Decimal` / `BigInt` 等精确类型，禁用 float。
4. 防御回退：`decimals()` revert 时回退到 18 并记录告警日志，保持可见。
5. 桥接/包装后重查：资产经桥接或 wrapper 变更后重新查询小数位。
6. 统一归一化：比较或计价前，把内部记账统一归一化（如归一到 WAD/18 位）。

## 指令

- 始终在运行时查询 `decimals()`，不要假设稳定币都用相同小数位。
- 缓存键用链 + 代币地址，不用符号。
- 精确数学优先：`Decimal` / `BigInt` 或等价精确类型，绝不用 float。
- 桥接或 wrapper 变更后必须重查小数位。
- 比较和价格计算前先一致地归一化内部记账。

## 示例

运行时查询余额（Python / web3.py）：

```python
from decimal import Decimal
from web3 import Web3

ERC20_ABI = [
    {"name": "decimals", "type": "function", "inputs": [],
     "outputs": [{"type": "uint8"}], "stateMutability": "view"},
    {"name": "balanceOf", "type": "function",
     "inputs": [{"name": "account", "type": "address"}],
     "outputs": [{"type": "uint256"}], "stateMutability": "view"},
]

def get_token_balance(w3: Web3, token_address: str, wallet: str) -> Decimal:
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address),
        abi=ERC20_ABI,
    )
    decimals = contract.functions.decimals().call()
    raw = contract.functions.balanceOf(Web3.to_checksum_address(wallet)).call()
    return Decimal(raw) / Decimal(10 ** decimals)
```

不要因为某符号在别处通常是 6 位就硬编码 `1_000_000`。

按链 + 代币缓存（lru_cache，键含 chain_id）：

```python
from functools import lru_cache

@lru_cache(maxsize=512)
def get_decimals(chain_id: int, token_address: str) -> int:
    w3 = get_web3_for_chain(chain_id)
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address),
        abi=ERC20_ABI,
    )
    return contract.functions.decimals().call()
```

防御性处理非标准代币（revert 回退 18 并告警）：

```python
try:
    decimals = contract.functions.decimals().call()
except Exception:
    logging.warning(
        "decimals() reverted on %s (chain %s), defaulting to 18",
        token_address,
        chain_id,
    )
    decimals = 18
```

记录回退日志保持可见——旧的或非标准代币依然存在。

Solidity 中归一化到 WAD（18 位）：

```solidity
interface IERC20Metadata {
    function decimals() external view returns (uint8);
}

function normalizeToWad(address token, uint256 amount) internal view returns (uint256) {
    uint8 d = IERC20Metadata(token).decimals();
    if (d == 18) return amount;
    if (d < 18) return amount * 10 ** (18 - d);
    return amount / 10 ** (d - 18);
}
```

TypeScript（ethers，并发取 decimals 与余额）：

```typescript
import { Contract, formatUnits } from 'ethers';

const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
];

async function getBalance(provider: any, tokenAddress: string, wallet: string): Promise<string> {
  const token = new Contract(tokenAddress, ERC20_ABI, provider);
  const [decimals, raw] = await Promise.all([
    token.decimals(),
    token.balanceOf(wallet),
  ]);
  return formatUnits(raw, decimals);
}
```

命令行快速链上核对（foundry cast）：

```bash
cast call <token_address> "decimals()(uint8)" --rpc-url <rpc>
```

## 注意事项

- 不要假设所有稳定币小数位一致：USDT/USDC 在以太坊是 6 位，在部分链或桥接版本可能是 18 位。
- 缓存键必须含 `chain_id`：同一符号、甚至同一地址在不同链上精度可能不同。
- 浮点不精确：float 在大数或多次运算后会丢精度，统一用 `Decimal` / `BigInt`。
- `decimals()` 可能 revert：极旧或非标准 ERC-20 未实现该方法，需回退并告警，不要静默吞掉。
- 桥接/wrapper 会改变精度：资产跨桥或被包装后务必重查，不要沿用旧值。
- 计价/比较前先归一化：避免把不同精度的内部记账直接相加或比大小。

## 互见

- 同域 fintech 下涉及链上金额、价格计算、稳定币处理的技能。
- 涉及 web3.py / ethers.js 合约调用与缓存策略的技能。

---

采编自 affaan-m/everything-claude-code（MIT），适配重写自其 evm-token-decimals 技能。
