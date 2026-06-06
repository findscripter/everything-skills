---
name: nodejs-keccak256-hashing
title: Node.js Keccak-256
description: JavaScriptとTypeScriptにおけるEthereumハッシュバグを防ぐ。NodeのSHA3-256はNIST SHA3であり、Ethereum Keccak-256ではなく、セレクター、署名、ストレージスロット、アドレス導出を静かに破壊する。
domain: 领域/fintech
triggers: [keccak256, sha3-256, selector, storage slot, EIP-712, createHash sha3, ethers keccak, viem keccak, soliditySha3]
tags: [web3, ethereum, keccak256, hashing, nodejs, typescript, fintech, ethers, viem]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [evm-token-decimals, solidity-security-auditor, blockchain-web3-developer, defi-protocol-templates]
combines_with: [defi-amm-security-audit, agent-payment-x402]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Node.js Keccak-256

Ethereum uses Keccak-256, not the NIST-standardized SHA3 variant exposed by Node's `crypto.createHash('sha3-256')`.

## When to use

- Computing Ethereum function selectors or event topics
- Building EIP-712, signature, Merkle, or storage-slot helpers in JS/TS
- Reviewing code that hashes Ethereum data using Node's crypto directly

## How it works

The two algorithms produce different outputs for the same input, and Node gives no warning.

```javascript
import crypto from 'crypto';
import { keccak256, toUtf8Bytes } from 'ethers';

const data = 'hello';
const nistSha3 = crypto.createHash('sha3-256').update(data).digest('hex');
const keccak = keccak256(toUtf8Bytes(data)).slice(2);

console.log(nistSha3 === keccak); // false
```

## Examples

### ethers v6

```typescript
import { keccak256, toUtf8Bytes, solidityPackedKeccak256, id } from 'ethers';

const hash = keccak256(new Uint8Array([0x01, 0x02]));
const hash2 = keccak256(toUtf8Bytes('hello'));
const topic = id('Transfer(address,address,uint256)');
const packed = solidityPackedKeccak256(
  ['address', 'uint256'],
  ['0x742d35Cc6634C0532925a3b8D4C9B569890FaC1c', 100n],
);
```

### viem

```typescript
import { keccak256, toBytes } from 'viem';

const hash = keccak256(toBytes('hello'));
```

### web3.js

```javascript
const hash = web3.utils.keccak256('hello');
const packed = web3.utils.soliditySha3(
  { type: 'address', value: '0x742d35Cc6634C0532925a3b8D4C9B569890FaC1c' },
  { type: 'uint256', value: '100' },
);
```

### Common patterns

```typescript
import { id, keccak256, AbiCoder } from 'ethers';

const selector = id('transfer(address,uint256)').slice(0, 10);
const typeHash = keccak256(toUtf8Bytes('Transfer(address from,address to,uint256 value)'));

function getMappingSlot(key: string, mappingSlot: number): string {
  return keccak256(
    AbiCoder.defaultAbiCoder().encode(['address', 'uint256'], [key, mappingSlot]),
  );
}
```

### Public key to address

```typescript
import { keccak256 } from 'ethers';

function pubkeyToAddress(pubkeyBytes: Uint8Array): string {
  const hash = keccak256(pubkeyBytes.slice(1));
  return '0x' + hash.slice(-40);
}
```

### Auditing a codebase

```bash
grep -rn "createHash.*sha3" --include="*.ts" --include="*.js" --exclude-dir=node_modules .
grep -rn "keccak256" --include="*.ts" --include="*.js" . | grep -v node_modules
```

## Rules

In an Ethereum context, never use `crypto.createHash('sha3-256')`. Use the Keccak-aware helpers from `ethers`, `viem`, `web3`, or another explicit Keccak implementation.
