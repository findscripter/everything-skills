---
name: nft-erc-standards
title: NFT ERC-721/1155 标准精通
description: 当用 Solidity 开发 NFT 合约（艺术品/游戏道具/收藏品/灵魂绑定）、接入市场或设计元数据时使用；做基于 OpenZeppelin 的 ERC-721/1155 合约编写、元数据(链上/IPFS)、EIP-2981 版税、SBT、动态 NFT 与 ERC721A 省 gas 铸造，产出可部署合约与校验清单；不适用于同质化代币(ERC-20)、DeFi、纯前端 dApp 或非以太坊兼容链。触发词：NFT、ERC-721、ERC-1155、铸造、版税、元数据
domain: 领域/fintech
triggers: [NFT, ERC-721, ERC-1155, ERC721A, 铸造 mint, 版税 royalty EIP-2981, 元数据 metadata, 灵魂绑定 SBT, 动态 NFT, OpenSea 市场接入]
tags: [Web3, NFT, Solidity, ERC-721, ERC-1155, OpenZeppelin, 智能合约, 元数据, 版税]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Solidity, OpenZeppelin Contracts, ERC721A, IPFS, Hardhat/Foundry]
requires: []
related: [solidity-security-auditor, defi-protocol-templates, blockchain-web3-developer, evm-token-decimals]
combines_with: [solidity-security-auditor, defi-amm-security-audit, nodejs-keccak256-hashing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于以下 NFT 合约开发场景：

- 创建 NFT 系列（艺术品、游戏资产、收藏品）
- 实现市场（marketplace）兼容功能与版税
- 设计链上或链下（IPFS）元数据
- 创建灵魂绑定代币 SBT（不可转移）
- 实现版税与收益分成（EIP-2981）
- 开发动态/可演化 NFT
- 需要批量铸造省 gas（ERC721A）

**不该用边界**：

- 任务与 NFT 标准无关（如同质化代币 ERC-20、DeFi 借贷、DAO 治理）
- 纯前端/钱包集成、纯链下后端，不涉及合约标准
- 目标链不兼容 EVM（如 Solana SPL、比特币 Ordinals）
- 输出不能替代针对具体环境的测试、审计与专家评审；缺少关键输入（链、供应量、权限模型、安全边界）时先停下来澄清

## 步骤

1. **明确目标与约束**：确定标准（721 单件 vs 1155 多版本/半同质）、最大供应量、铸造价格、单次上限、权限模型、是否需版税/SBT/动态特性。
2. **选基类**：从 OpenZeppelin 选起（`ERC721URIStorage`/`ERC721Enumerable`/`ERC1155`），批量铸造场景换 `ERC721A` 省 gas。
3. **写铸造逻辑**：用 `require` 校验数量、供应量、付款；优先 `_safeMint`。
4. **接元数据**：链下走 IPFS（含 pinning），链上走 `Base64` + `abi.encodePacked` 编码 JSON/SVG。
5. **加扩展**：按需实现 EIP-2981 版税、SBT 转移限制、动态状态。
6. **处理多继承 override**：当混入 `Enumerable`/`URIStorage` 时，必须重写 `_beforeTokenTransfer`、`_burn`、`tokenURI`、`supportsInterface`。
7. **校验**：编译、单测、Etherscan 验证、在 OpenSea testnet 确认元数据与版税显示。

## 指令

- 始终基于 OpenZeppelin 经实战检验的实现，勿手写底层逻辑。
- IPFS 元数据务必用 pinning 服务固定，避免失效。
- 实现 EIP-2981 以兼容市场版税；版税上限建议硬编码（如 ≤10%）。
- 需要详细示例时打开 `resources/implementation-playbook.md`；参考 `references/erc721.md`、`references/erc1155.md`、`references/metadata-standards.md`、`references/enumeration.md`；模板见 `assets/erc721-contract.sol`、`assets/erc1155-contract.sol`、`assets/metadata-schema.json`、`assets/metadata-uploader.py`。

## 示例

**ERC-721 含供应量/价格约束的铸造**：

```solidity
contract MyNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.08 ether;
    uint256 public constant MAX_PER_MINT = 20;

    function mint(uint256 quantity) external payable {
        require(quantity > 0 && quantity <= MAX_PER_MINT, "Invalid quantity");
        require(_tokenIds.current() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");
        // _safeMint + _setTokenURI ...
    }
    // 多继承必须重写：_beforeTokenTransfer / _burn / tokenURI / supportsInterface
}
```

**ERC-1155 多版本道具（批量铸造 + 每 id 供应上限）**：

```solidity
contract GameItems is ERC1155, Ownable {
    uint256 public constant SWORD = 1; uint256 public constant SHIELD = 2;
    constructor() ERC1155("ipfs://QmBaseHash/{id}.json") { maxSupply[SWORD]=1000; }
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) external onlyOwner {
        for (uint256 i=0;i<ids.length;i++){ require(tokenSupply[ids[i]]+amounts[i]<=maxSupply[ids[i]],"Exceeds max supply"); tokenSupply[ids[i]]+=amounts[i]; }
        _mintBatch(to, ids, amounts, "");
    }
}
```

**EIP-2981 版税**（market 兼容，5% 示例，上限 10%）：

```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice)
    external view override returns (address receiver, uint256 royaltyAmount) {
    return (royaltyRecipient, (salePrice * royaltyFee) / 10000); // royaltyFee=500 即 5%
}
// supportsInterface 需返回 interfaceId == type(IERC2981).interfaceId || super...
```

**灵魂绑定 SBT**（禁止转移，仅允许铸造与销毁）：

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
    internal virtual override {
    require(from == address(0) || to == address(0), "Token is soulbound");
    super._beforeTokenTransfer(from, to, tokenId, batchSize);
}
```

**链下元数据 JSON（OpenSea 标准 attributes）**：

```json
{
  "name": "NFT #1", "description": "...", "image": "ipfs://QmImageHash",
  "attributes": [
    {"trait_type": "Rarity", "value": "Legendary"},
    {"trait_type": "Power", "value": 95, "display_type": "number", "max_value": 100}
  ]
}
```

链上元数据用 `Base64.encode(abi.encodePacked('{"name":...,"image":"data:image/svg+xml;base64,"...}'))`，返回 `data:application/json;base64,` 前缀。动态 NFT 在 `tokenURI` 中按当前 `TokenState`（level/experience）实时生成元数据。ERC721A 用 `_mint(msg.sender, quantity)` 批量铸造显著省 gas。

## 注意事项

- **多继承 override 陷阱**：混入 `ERC721Enumerable`/`ERC721URIStorage` 后漏写任一 override（`_beforeTokenTransfer`、`_burn`、`tokenURI`、`supportsInterface`）会编译失败或行为错误。
- **元数据持久性**：IPFS 必须 pinning，否则图片/属性丢失；`{id}.json` 占位符在 1155 中由钱包替换为十六进制 id。
- **版税不可强制**：EIP-2981 只声明版税，链上不强制执行，实际由市场（LooksRare 强制、Blur 可选等）决定；勿假设一定收到。
- **安全**：`withdraw` 等资金操作加 `onlyOwner`；`_safeMint` 防止打到不支持接收的合约；版税费率设上限防滥用。
- **市场兼容**：OpenSea（721/1155 + 元数据标准）、LooksRare（版税强制）、Rarible（懒铸造）、Blur（省 gas 交易）。
- **最佳实践**：reveal 机制（占位图 → 揭晓）、Merkle 树白名单、`walletOfOwner` 枚举支持。
- 输出务必经测试与（必要时）审计，勿直接上主网。

## 互见

- 源技能集中的 ERC-20/同质化代币、智能合约安全审计、Gas 优化、市场前端集成等相邻技能。
- 本仓库 领域/Web3 下的其他智能合约与链上交互条目。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
