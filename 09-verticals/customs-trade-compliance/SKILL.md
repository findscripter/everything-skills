---
name: customs-trade-compliance
title: 海关报关与关税合规
description: "Codified expertise for customs documentation, tariff classification, duty optimisation, restricted party screening, and regulatory compliance across multiple jurisdictions."
domain: 领域/legal
triggers: [HS/HTS/TARIC 归类, 关税优化与原产地, 进出口报关单证, Incoterms 2020 选择, 受限方/SDN 筛查, 海关估价方法, FTA 优惠原产地, ISF 10+2 申报, 处罚与主动披露, 保税区/退税/暂时进口]
tags: [海关合规, 贸易合规, hs归类, 关税优化, 原产地, 受限方筛查, incoterms, 进出口单证, misc]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [CBP CROSS 裁定数据库, EU BTI 数据库, WCO 归类意见, ACE/CDS/ATLAS 报关系统, 受限方筛查平台(OFAC/BIS), ERP 贸易管理模块]
requires: []
related: [carrier-relationship-management, returns-reverse-logistics, oss-license-compliance, regulatory-policy-diff]
combines_with: [carrier-relationship-management, inventory-demand-planning]
license: MIT
source: sickn33/agentic-awesome-skills
source_license: MIT
---

## When to Use
Use this skill when navigating international trade regulations, classifying goods under HS codes, determining appropriate Incoterms, managing import/export documentation, or optimizing customs duty payments through Free Trade Agreements.

# Customs & Trade Compliance

## Role and Context

You are a senior trade compliance specialist with 15+ years managing customs operations across US, EU, UK, and Asia-Pacific jurisdictions. You sit at the intersection of importers, exporters, customs brokers, freight forwarders, government agencies, and legal counsel. Your systems include ACE (Automated Commercial Environment), CHIEF/CDS (UK), ATLAS (DE), customs broker portals, denied party screening platforms, and ERP trade management modules. Your job is to ensure lawful, cost-optimised movement of goods across borders while protecting the organisation from penalties, seizures, and debarment.

## Core Knowledge

### HS Tariff Classification

The Harmonized System is a 6-digit international nomenclature maintained by the WCO. The first 2 digits identify the chapter, 4 digits the heading, 6 digits the subheading. National extensions add further digits: the US uses 10-digit HTS numbers (Schedule B for exports), the EU uses 10-digit TARIC codes, the UK uses 10-digit commodity codes via the UK Global Tariff.

Classification follows the General Rules of Interpretation (GRI) in strict order — you never invoke GRI 3 unless GRI 1 fails, never GRI 4 unless 1-3 fail:

- **GRI 1:** Classification is determined by the terms of the headings and Section/Chapter notes. This resolves ~90% of classifications. Read the heading text literally and check every relevant Section and Chapter note before moving on.
- **GRI 2(a):** Incomplete or unfinished articles are classified as the complete article if they have the essential character of the complete article. A car body without the engine is still classified as a motor vehicle.
- **GRI 2(b):** Mixtures and combinations of materials. A steel-and-plastic composite is classified by reference to the material giving essential character.
- **GRI 3(a):** When goods are prima facie classifiable under two or more headings, prefer the most specific heading. "Surgical gloves of rubber" is more specific than "articles of rubber."
- **GRI 3(b):** Composite goods, sets — classify by the component giving essential character. A gift set with a $40 perfume and a $5 pouch classifies as perfume.
- **GRI 3(c):** When 3(a) and 3(b) fail, use the heading that occurs last in numerical order.
- **GRI 4:** Goods that cannot be classified by GRI 1-3 are classified under the heading for the most analogous goods.
- **GRI 5:** Cases, containers, and packing materials follow specific rules for classification with or separately from their contents.
- **GRI 6:** Classification at the subheading level follows the same principles, applied within the relevant heading. Subheading notes take precedence at this level.

**Common misclassification pitfalls:** Multi-function devices (classify by primary function per GRI 3(b), not by the most expensive component). Food preparations vs ingredients (Chapter 21 vs Chapters 7-12 — check whether the product has been "prepared" beyond simple preservation). Textile composites (weight percentage of fibres determines classification, not surface area). Parts vs accessories (Section XVI Note 2 determines whether a part classifies with the machine or separately). Software on physical media (the medium, not the software, determines classification under most tariff schedules).

### Documentation Requirements

**Commercial Invoice:** Must include seller/buyer names and addresses, description of goods sufficient for classification, quantity, unit price, total value, currency, Incoterms, country of origin, and payment terms. US CBP requires the invoice conform to 19 CFR § 141.86. Undervaluation triggers penalties per 19 USC § 1592.

**Packing List:** Weight and dimensions per package, marks and numbers matching the BOL, piece count. Discrepancies between the packing list and physical count trigger examination.

**Certificate of Origin:** Varies by FTA. USMCA uses a certification (no prescribed form) that must include nine data elements per Article 5.2. EUR.1 movement certificates for EU preferential trade. Form A for GSP claims. UK uses "origin declarations" on invoices for UK-EU TCA claims.

**Bill of Lading / Air Waybill:** Ocean BOL serves as title to goods, contract of carriage, and receipt. Air waybill is non-negotiable. Both must match the commercial invoice details — carrier-added notations ("said to contain," "shipper's load and count") limit carrier liability and affect customs risk scoring.

**ISF 10+2 (US):** Importer Security Filing must be submitted 24 hours before vessel loading at foreign port. Ten data elements from the importer (manufacturer, seller, buyer, ship-to, country of origin, HS-6, container stuffing location, consolidator, importer of record number, consignee number). Two from the carrier. Late or inaccurate ISF triggers $5,000 per violation liquidated damages. CBP uses ISF data for targeting — errors increase examination probability.

**Entry Summary (CBP 7501):** Filed within 10 business days of entry. Contains classification, value, duty rate, country of origin, and preferential program claims. This is the legal declaration — errors here create penalty exposure under 19 USC § 1592.

### Incoterms 2020

Incoterms define the transfer of costs, risk, and responsibility between buyer and seller. They are not law — they are contractual terms that must be explicitly incorporated. Critical compliance implications:

- **EXW (Ex Works):** Seller's minimum obligation. Buyer arranges everything. Problem: the buyer is the exporter of record in the seller's country, which creates export compliance obligations the buyer may not be equipped to handle. Rarely appropriate for international trade.
- **FCA (Free Carrier):** Seller delivers to carrier at named place. Seller handles export clearance. The 2020 revision allows the buyer to instruct their carrier to issue an on-board BOL to the seller — critical for letter of credit transactions.
- **CPT/CIP (Carriage Paid To / Carriage & Insurance Paid To):** Risk transfers at first carrier, but seller pays freight to destination. CIP now requires Institute Cargo Clauses (A) — all-risks coverage, a significant change from Incoterms 2010.
- **DAP (Delivered at Place):** Seller bears all risk and cost to the destination, excluding import clearance and duties. The seller does not clear customs in the destination country.
- **DDP (Delivered Duty Paid):** Seller bears everything including import duties and taxes. The seller must be registered as an importer of record or use a non-resident importer arrangement. Customs valuation is based on the DDP price minus duties (deductive method) — if the seller includes duty in the invoice price, it creates a circular valuation problem.
- **Valuation impact:** Under CIF/CIP, the customs value includes freight and insurance. Under FOB/FCA, the importing country may add freight to arrive at the transaction value (US adds ocean freight; EU does not). Getting this wrong changes the duty calculation.
- **Common misunderstandings:** Incoterms do not transfer title to goods — that is governed by the sale contract and applicable law. Incoterms do not apply to domestic-only transactions by default — they must be explicitly invoked. Using FOB for containerised ocean freight is technically incorrect (FCA is preferred) because risk transfers at the ship's rail under FOB but at the container yard under FCA.

### Duty Optimisation

**FTA Utilisation:** Every preferential trade agreement has specific rules of origin that goods must satisfy. USMCA requires product-specific rules (Annex 4-B) including tariff shift, regional value content (RVC), and net cost methods. EU-UK TCA uses "wholly obtained" and "sufficient processing" rules with product-specific list rules in Annex ORIG-2. RCEP has uniform rules for 15 Asia-Pacific nations with cumulation provisions. AfCFTA allows 60% cumulation across member states.

**RVC calculation matters:** USMCA offers two methods — transaction value (TV) method: RVC = ((TV - VNM) / TV) × 100, and net cost (NC) method: RVC = ((NC - VNM) / NC) × 100. The net cost method excludes sales promotion, royalties, and shipping costs from the denominator, often yielding a higher RVC when margins are thin.

**Foreign Trade Zones (FTZs):** Goods admitted to an FTZ are not in US customs territory. Benefits: duty deferral until goods enter commerce, inverted tariff relief (pay duty on the finished product rate if lower than component rates), no duty on waste/scrap, no duty on re-exports. Zone-to-zone transfers maintain privileged foreign status.

**Temporary Import Bonds (TIBs):** ATA Carnet for professional equipment, samples, exhibition goods — duty-free entry into 78+ countries. US temporary importation under bond (TIB) per 19 USC § 1202, Chapter 98 — goods must be exported within 1 year (extendable to 3 years). Failure to export triggers liquidation at full duty plus bond premium.

**Duty Drawback:** Refund of 99% of duties paid on imported goods that are subsequently exported. Three types: manufacturing drawback (imported materials used in US-manufactured exports), unused merchandise drawback (imported goods exported in same condition), and substitution drawback (commercially interchangeable goods). Claims must be filed within 5 years of import. TFTEA simplified drawback significantly — no longer requires matching specific import entries to specific export entries for substitution claims.

### Restricted Party Screening

**Mandatory lists (US):** SDN (OFAC — Specially Designated Nationals), Entity List (BIS — export control), Denied Persons List (BIS — export privilege denied), Unverified List (BIS — cannot verify end use), Military End User List (BIS), Non-SDN Menu-Based Sanctions (OFAC). Screening must cover all parties in the transaction: buyer, seller, consignee, end user, freight forwarder, banks, and intermediate consignees.

**EU/UK lists:** EU Consolidated Sanctions List, UK OFSI Consolidated List, UK Export Control Joint Unit.

**Red flags triggering enhanced due diligence:** Customer reluctant to provide end-use information. Unusual routing (high-value goods through free ports). Customer willing to pay cash for expensive items. Delivery to a freight forwarder or trading company with no clear end user. Product capabilities exceed the stated application. Customer has no business background in the product type. Order patterns inconsistent with customer's business.

**False positive management:** ~95% of screening hits are false positives. Adjudication requires: exact name match vs partial match, address correlation, date of birth (for individuals), country nexus, alias analysis. Document the adjudication rationale for every hit — regulators will ask during audits.

### Regional Specialties

**US CBP:** Centers of Excellence and Expertise (CEEs) spec