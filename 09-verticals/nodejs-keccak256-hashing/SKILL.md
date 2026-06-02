---
name: nodejs-keccak256-hashing
title: Node.js Keccak-256 以太坊哈希防错
description: 当在 JS/TS 中计算以太坊函数选择器、事件 topic、EIP-712 类型哈希、存储槽或从公钥派生地址，或审查直接用 Node crypto 哈希以太坊数据的代码时使用；做 Keccak-256 与 NIST SHA3-256 的辨错并产出 ethers/viem/web3 正确哈希调用与审计命令；不适用于真正需要 NIST SHA3-256 的场景、非 EVM 链或合约本身的安全审计；触发词：keccak256、sha3-256、函数选择器、存储槽、EIP-712、createHash 误用
domain: 领域/fintech
triggers: [keccak256, sha3-256, 函数选择器, selector, 存储槽, storage slot, EIP-712, createHash sha3, 公钥派生地址, ethers keccak, viem keccak, soliditySha3]
tags: [web3, ethereum, keccak256, hashing, nodejs, typescript, fintech, ethers, viem]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [nodejs, typescript, ethers, viem, web3.js]
requires: []
related: [evm-token-decimals, solidity-security-auditor, blockchain-web3-developer, defi-protocol-templates]
combines_with: [defi-amm-security-audit, agent-payment-x402]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

- 在 JS/TS 里计算以太坊**函数选择器**、**事件 topic**、**EIP-712 类型哈希**、**Merkle 树**或 **mapping 存储槽**时。
- 从**公钥派生以太坊地址**（取 Keccak-256 后 20 字节）时。
- 审查直接用 Node `crypto` 哈希以太坊数据的代码，排查选择器/签名/地址对不上的「静默错误」时。

**不该用**：
- 你确实需要 NIST 标准化 SHA3-256（如某些非以太坊协议、FIPS 合规场景）→ 此时 `crypto.createHash('sha3-256')` 才是正解，不要改成 Keccak。
- 非 EVM 链（Solana/Cairo/Move 用各自哈希）。
- 智能合约本身的漏洞审计 → 用 `solidity-security-auditor`。

## 根因

以太坊用的是 **Keccak-256**（原始提案版），而 Node 的 `crypto.createHash('sha3-256')` 是 **NIST 标准化的 SHA3-256**。二者**填充（padding）不同**，对同一输入产出**不同摘要**，且 Node 不会报任何警告 —— 错误会静默地破坏选择器、签名、存储槽与地址派生。

```javascript
import crypto from 'crypto';
import { keccak256, toUtf8Bytes } from 'ethers';

const data = 'hello';
const nistSha3 = crypto.createHash('sha3-256').update(data).digest('hex');
const keccak   = keccak256(toUtf8Bytes(data)).slice(2);
console.log(nistSha3 === keccak); // false —— 不可互换
```

## 步骤 / 指令

1. **铁律**：以太坊上下文**绝不**用 `crypto.createHash('sha3-256')`。改用 `ethers` / `viem` / `web3` 的 Keccak 专用 helper，或其他显式 Keccak 实现。
2. **选库**：项目用哪个就用哪个的 keccak —— ethers `keccak256`、viem `keccak256`、web3 `web3.utils.keccak256`。需带 ABI 类型打包时用 `solidityPackedKeccak256` / `soliditySha3`。
3. **入参要喂字节**：字符串先转字节再哈希。ethers 用 `toUtf8Bytes(...)`，viem 用 `toBytes(...)`；不要把裸字符串直接丢进字节版 `keccak256`。
4. **选择器取前 4 字节**：`id('transfer(address,uint256)').slice(0, 10)`（`0x` + 8 hex = 4 字节）。
5. **公钥派生地址**：先去掉前缀字节再哈希，取末 20 字节：`'0x' + keccak256(pubkey.slice(1)).slice(-40)`。
6. **审计存量代码**：用下方 grep 命令扫出 `createHash('sha3'...)` 误用与所有 keccak 调用点逐一核对。

## 示例

ethers v6（最常用）：
```typescript
import { keccak256, toUtf8Bytes, solidityPackedKeccak256, id, AbiCoder } from 'ethers';

const hash    = keccak256(new Uint8Array([0x01, 0x02]));
const hash2   = keccak256(toUtf8Bytes('hello'));
const topic   = id('Transfer(address,address,uint256)');        // 事件 topic0
const selector = id('transfer(address,uint256)').slice(0, 10);   // 函数选择器
const typeHash = keccak256(toUtf8Bytes('Transfer(address from,address to,uint256 value)')); // EIP-712
const packed  = solidityPackedKeccak256(
  ['address', 'uint256'],
  ['0x742d35Cc6634C0532925a3b8D4C9B569890FaC1c', 100n],
);

// mapping(address => uint) 的存储槽
function getMappingSlot(key: string, mappingSlot: number): string {
  return keccak256(
    AbiCoder.defaultAbiCoder().encode(['address', 'uint256'], [key, mappingSlot]),
  );
}

// 公钥 → 地址（去掉首字节，取末 20 字节）
function pubkeyToAddress(pubkeyBytes: Uint8Array): string {
  return '0x' + keccak256(pubkeyBytes.slice(1)).slice(-40);
}
```

viem：
```typescript
import { keccak256, toBytes } from 'viem';
const hash = keccak256(toBytes('hello'));
```

web3.js：
```javascript
const hash   = web3.utils.keccak256('hello');
const packed = web3.utils.soliditySha3(
  { type: 'address', value: '0x742d35Cc6634C0532925a3b8D4C9B569890FaC1c' },
  { type: 'uint256', value: '100' },
);
```

审计存量代码库：
```bash
# 揪出 NIST SHA3 误用
grep -rn "createHash.*sha3" --include="*.ts" --include="*.js" --exclude-dir=node_modules .
# 列出所有 keccak 调用点逐一核对
grep -rn "keccak256" --include="*.ts" --include="*.js" . | grep -v node_modules
```

## 注意事项

- **静默是最大陷阱**：SHA3-256 和 Keccak-256 摘要长度相同、调用都不报错，错误只在选择器对不上、签名验不过、地址算错时才暴露 —— 务必从源头杜绝。
- **`slice` 别忘了去 `0x`**：ethers 的 `keccak256` 返回带 `0x` 前缀的 hex，做选择器/比较时按需 `.slice(2)` 或 `.slice(0, 10)`。
- **`soliditySha3` 名字会误导**：web3.js 里它实际算的就是 Keccak-256，不是 NIST SHA3，可放心用于以太坊。
- **打包哈希要对齐 ABI 编码**：`solidityPackedKeccak256`（紧打包）与 `AbiCoder.encode`（标准 ABI 编码，含 padding）结果不同，存储槽用标准编码、紧打包多用于签名消息，别混。
- 反过来说，**不要无脑把所有 `sha3-256` 替换成 keccak** —— 先确认该处确属以太坊上下文，否则会反向破坏需要 NIST SHA3 的逻辑。

## 互见

- related：`solidity-security-auditor` —— 本条防的是链下 JS/TS 的哈希算法选错，后者审的是链上合约逻辑漏洞，二者互补。
- related：`blockchain-web3-developer` —— 通用 Web3/以太坊开发，本条是其中哈希环节的专项纠错。
- combines_with：`defi-protocol-templates` —— 实现 DeFi 协议的选择器、EIP-712 签名、存储槽计算时复用本条的正确哈希调用。

---
本条采编自 affaan-m/everything-claude-code（MIT）。
