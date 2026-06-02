---
name: odoo-localization-compliance
title: Odoo 本地化与税务合规
description: 当为特定国家的公司配置 Odoo 会计、税务与电子发票（e-invoicing）合规时使用；做本地化模块（l10n_*）选型安装、税码/财政税位（fiscal position）配置、CFDI/FatturaPA/SAF-T 等电子发票对接与税务申报；不适用于 Odoo 二次开发建模、非合规类的常规会计记账或脱离本地化模块手工搭建科目表；触发词：odoo 本地化、l10n、电子发票、e-invoicing、CFDI、FatturaPA、SAF-T、税务合规、财政税位、fiscal position、增值税 VAT/IVA/GST、科目表 chart of accounts
domain: 领域/fintech
triggers: [odoo 本地化, l10n, 电子发票, e-invoicing, CFDI, FatturaPA, SAF-T, 税务合规, 财政税位, fiscal position, 增值税, VAT, IVA, GST, 科目表, chart of accounts]
tags: [odoo, fintech, localization, tax-compliance, e-invoicing, accounting, vat, erp]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo, l10n modules, odoo-bin, CFDI, FatturaPA, SAF-T]
requires: []
related: [customs-trade-compliance, regulatory-policy-diff]
combines_with: [customs-trade-compliance, gl-subledger-reconciler]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于面向某个国家/地区落地 Odoo 财税合规的场景：

- 为特定国家的公司初始化 Odoo 会计（墨西哥、意大利、西班牙、美国、巴西、德国等）。
- 配置国家强制的电子发票（向税务机关提交电子发票，如墨西哥 CFDI、意大利 FatturaPA、波兰 SAF-T、哥伦比亚 DIAN）。
- 设置 VAT/GST/IVA 税则并配置正确的财政税位（fiscal position）。
- 生成法定税务报表（VAT 申报、SAF-T、DIAN 报送等）。

**不该用边界**：与本地化/合规无关的常规记账、Odoo 模块二次开发与数据建模，以及在已有官方本地化模块时仍手工搭建科目表的情况——本技能不替代针对具体环境的验证、测试与专业（税务/审计）复核。若国家、Odoo 版本、税号、证书等关键输入缺失，应先停下来追问。

## 步骤

1. **确认前置信息**：国家、Odoo 版本、公司税号（如 RFC/VAT ID）、公司类型。
2. **选型本地化模块**：按国家选择对应 `l10n_*` 模块（见下表），它会装好正确的科目表、税种与税务报表。
3. **安装模块**：在「应用(Apps)」中搜索国家名安装，或用 CLI 安装。
4. **配置公司与证书**：填写国家、税号、公司类型；电子发票场景上传税务机关签发的证书与私钥。
5. **配置税码与财政税位**：用 fiscal position 自动切换不同客户（B2B/B2C、境内/出口）的税率。
6. **先测后上线**：在税务机关测试环境验证电子发票，再切生产。

## 指令

国家本地化模块对照表：

| 国家 | 模块 | 关键能力 |
|---|---|---|
| 美国 | `l10n_us` | GAAP 科目表、薪酬（ADP 桥接）、1099 报送 |
| 墨西哥 | `l10n_mx_edi` | CFDI 4.0 电子发票、SAT 对接、IEPS 税 |
| 西班牙 | `l10n_es` | SII 实时 VAT、Modelo 303/390、AEAT |
| 意大利 | `l10n_it_edi` | FatturaPA XML、SDI 报送、反向征收 |
| 波兰 | `l10n_pl` | SAF-T JPK_FA、VAT-7 申报 |
| 巴西 | `l10n_br` | NF-e、NFS-e、SPED、ICMS/PIS/COFINS |
| 德国 | `l10n_de` | SKR03/SKR04 科目表、DATEV 导出、UStVA |
| 哥伦比亚 | `l10n_co_edi` | DIAN 电子发票、UBL 2.1 |

CLI 安装与校验：

```bash
# 当模块不在 Apps 中时，通过 CLI 安装
./odoo-bin -d mydb --stop-after-init -i l10n_mx_edi

# 在 Odoo 中校验：
# Apps → Installed → 搜索 "l10n_mx" → 应显示为 Installed
```

## 示例

**示例 1：配置墨西哥 CFDI 4.0**

```
步骤 1：安装模块
  Apps → 搜索 "Mexico" → 安装 "Mexico - Accounting"
  另装："Mexico - Electronic Invoicing" (l10n_mx_edi)

步骤 2：配置公司
  Settings → Company → [你的公司]
  Country: Mexico
  RFC: 你的 RFC 税号
  Company Type: Moral Person 或 Physical Person

步骤 3：上传 SAT 证书
  Accounting → Configuration → Certificates → New
  CSD 证书 (SAT 签发的 .cer 文件)
  私钥 (.key 文件)
  Password: 你的 FIEL 密码

步骤 4：开具 CFDI 发票
  创建发票 → 确认 → 自动生成 CFDI XML
  报送 SAT → 取得 UUID (folio fiscal)
  PDF 含二维码 + UUID 供买方核验
```

**示例 2：欧盟内部交易 VAT 配置（任意欧盟国家）**

```
菜单：Accounting → Configuration → Taxes → New

Tax Name: EU Intra-Community Sales (0%)
Tax Type: Sales
Tax Scope: Services 或 Goods
Tax Computation: Fixed
Amount: 0%
Tax Group: Intra-Community

发票上标签："Intra-Community Supply - VAT Exempt per Art. 138 VAT Directive"

财政税位（单独创建）：
  Name: EU B2B Intra-Community
  自动识别：Country Group = Europe 且 VAT Required = YES
  税映射：Standard VAT Rate → 0% Intra-Community
```

## 注意事项

- **先装本地化模块，再录任何会计分录**——它负责建立正确的科目结构。
- 用**财政税位（fiscal position）**自动切换国际客户税率（B2B vs B2C、境内 vs 出口）。
- 电子发票务必先在**税务机关测试环境**验证再上线。
- 已有对应国家本地化模块时，**不要手工创建科目表**。
- **不要**把本地化税务科目与自建科目混用——会破坏税务报表。
- 输出不能替代针对具体环境的验证、测试与专业复核；缺少关键输入（国家、版本、税号、证书、权限、成功标准）时先追问。

## 互见

（无可关联的现有技能。）

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
