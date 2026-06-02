---
name: entity-compliance-tracker
title: 主体合规与年报期限跟踪
description: 当需要为多主体/多法域跟踪年报、特许经营税、信息声明等合规申报期限，建立 compliance-tracker.yaml、报告 30/60/90 天内到期项、按代理报告更新状态、做健康审计或导出 CSV 时使用；做的是从主体表初始化跟踪器、按主体×法域×主体类型计算到期日、滚动呈现逾期/将到期/状态未知项并署名导出；不适用于实际代为申报、拉取良好信誉证书、替代注册代理服务或权威认定期限。触发词：主体合规、年报期限、annual report、年报到期、申报期限、entity compliance、良好信誉、good standing
domain: 领域/legal
triggers: [主体合规, 年报期限, annual report, 年报到期, 申报期限, entity compliance, filing deadlines, 良好信誉, good standing, 特许经营税, franchise tax, 信息声明, Statement of Information, 合规跟踪器, entity tracker]
tags: [legal, corporate, entity-management, compliance, annual-report, good-standing, yaml, csv]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [yaml, csv, markdown]
requires: []
related: [ip-portfolio-register, contract-renewal-tracker, employee-leave-deadline-tracker, legal-meeting-briefing]
combines_with: [regulatory-policy-diff]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 需要为公司旗下多个主体（公司/LLC/LP）在多个法域跟踪年报、特许经营税、信息声明（SOI）、双年度声明等合规申报，建立单一来源的 `compliance-tracker.yaml`。
- 想知道未来 30/60/90/180 天内有哪些申报将到期、哪些已逾期（`--report`）。
- 收到注册代理（CT Corp、National Registered Agents 等）合规报告或自己手头有新信息，需更新跟踪器状态（`--update` / `--sweep`）。
- 做一次超出申报状态的健康审计（休眠主体、良好信誉缺口、外州资格缺口、关联交易协议缺口；`--audit`）。
- 把跟踪器导出为 CSV / 表格供财务、法务运营或注册代理共享（`--export`）。

不该用：
- **不替你申报**。只产出跟踪器和待办清单；实际申报由律师、外部律师或注册代理完成。
- **不拉取良好信誉证书**。只记录证书上次确认时间，获取仍需人工或经代理。
- **不认定是否需要外州资格登记**。该判断取决于业务活动事实，须由律师确认；本技能只能提出该问题。
- **不替代注册代理服务**。多主体复杂结构应以代理的合规日历为权威，本技能用于组织和呈现其数据，而非取代。
- **期限参考表非法律意见，可能已过时**。依赖前务必向注册代理或州务卿确认。

## 步骤

入口：读取实践档案 `CLAUDE.md` 的 `## Entity Management`（主体表、法域、注册代理）。按标志位路由到对应模式，读写跟踪器 `entities/compliance-tracker.yaml`；任何更新后展示变更摘要与下一步动作。

**模式 1 · 初始化（无标志位 / `--init` / `--rebuild`）**
1. 读主体表。若空，请用户先跑冷启动模块或提供主体清单。
2. 逐个「主体 × 法域」向注册代理或州务卿确认当前申报计划——**不要套用缓存的计划**。先问用户是否有代理的现成合规报告（最权威来源）；没有则记录用户已知信息；用户不知道的项标 `unknown`，待其向代理/州务卿确认。
3. 参考表未覆盖的法域，走 `custom_jurisdictions` 自定义流程采集（申报类型、到期依据、典型费用、当地代理），该定义将自动应用到该法域全部主体。
4. **国际主体**：申报差异极大，一律走自定义流程；有当地申报代理的标 `agent_managed: true`，报告模式单列、提示直接向当地代理确认而非自行算到期日；并询问是否有集团级报告义务（国别报告、受益所有权登记、经济实质申报）。
5. 周年制申报按跟踪器中 `formation_date` 计算；`formation_date` 为空则标 `unknown`。
6. 写跟踪器并打印状态摘要（Current / Due soon / Overdue / Unknown 计数）。

**模式 2 · 报告（`--report [--days 30|60|90|180]`，默认 90 天）**
按 `🔴 逾期 / ⏰ N 天内到期 / ✅ 近 90 天已申报 / ❓ 状态未知 / 🌐 代理托管 / 良好信誉` 分组输出。主体超过约 10 个或用户要求时，提供仪表盘（按申报状态、按良好信誉状态计数 + 可排序主体表）。

**模式 3 · 更新**
- `--update`（3a 手动）：用户口述「某主体某月某日已申报某项，费用 $X」→ 更新 `last_filed` / `last_fee` / `status=current` / 元数据 `last_updated`。
- `--update --from-report`（3b 代理报告上传）：读取 CT Corp / National 等 PDF/CSV/Excel，按主体名匹配（近似名如 "Acme Holdings LLC" vs "Acme Holdings, LLC" 提示确认）并更新；输出 Matched / Unmatched / Not-in-report 三类。
- `--sweep`（3c 批量扫荡）：逐个走 `unknown` / `overdue` 主体，逐条询问是否已申报、何时、费用多少，确认后更新并给完成摘要。

**模式 4 · 健康审计（`--audit`）**
覆盖：申报合规（逾期/未知）、主体健康（休眠主体——尤其 >5 年休眠的解散候选、缺 `formation_date` 的数据缺口）、良好信誉缺口（无确认记录 / 确认 >12 个月过期）、外州资格缺口（标记须确认业务存在）、关联交易协议缺口。输出含 RECOMMENDED ACTIONS 优先级清单。

**模式 5 · 导出（`--export [--format csv|table]`，默认 CSV）**
一行一个「法域 × 申报类型」。`table` 格式只出未来 90 天、适合贴入报告或 Slack 的 Markdown 表。

## 指令

**重大行动闸门（在指引或确认任何申报前）**：读 `CLAUDE.md` 的 `## Who's using this`。若角色为**非律师**，提示「向州务卿提交信息声明 / 年报 / 特许经营税申报有法律后果（系主体正式陈述、带费用、漏报或错报可致丧失良好信誉或特许经营税违约）」，并生成一份给律师的简报（主体/法域/申报类型/到期日、跟踪器记录的上次申报信息、未决问题、可能出错点、要问律师什么）。**未得到明确「是」之前，不得记录新的 `last_filed` 日期。** 跟踪器读取、到期报告、"将到期"输出不需要此闸门。

**主体类型纪律（尤其 Delaware）**：申报日历取决于**主体类型**，不能把"Delaware 主体"当成单一桶——DE Corp、DE LLC、DE LP 申报、到期、漏报后果各不相同。计算或报告前先从主体表确认类型，绝不把一种主体类型的到期日复制到同州另一类型上：
- **DE Corporation（Inc./Corp.）**：年报 + 特许经营税，均 **3 月 1 日**到期。特许经营税按授权股法或假定面值资本法取较低者计算。法源：8 Del. C. §§ 501–502 [verify current]。
- **DE LLC**：**无需年报**；年度税固定 **$300**，**6 月 1 日**到期。法源：6 Del. C. § 18-1107(d) [verify]。
- **DE LP**：**无需年报**；年度税固定 **$300**，**6 月 1 日**到期。法源：6 Del. C. § 17-1109 [verify]。

DE LLC 若被误写 3 月 1 日年报到期，会产生虚假"逾期"标记并掩盖真实的 6 月 1 日敞口。Delaware 主体若主体表无类型，标 `type_unknown` 并请用户确认后再算任一到期日。其他法域同样按类型分别索引（如 CA Corp SOI vs CA LLC SOI 节奏、TX 特许经营税三类主体阈值不同）。

**期限与法域告诫**：参考表日期反映构建日的公开要求，州申报要求与到期日会变；依赖前务必向注册代理或相关州务卿确认。跟踪器按每个主体记录的成立/资格法域计算；若主体实际足迹与 `CLAUDE.md` 不符（未披露的外州资格、已解散主体、重新本土化、由当地代理管理的国际申报），输出可能不适用——向代理或当地律师确认。

**写入前确认**：把跟踪器与日志的 diff 展示给用户后再落盘。

## 示例

跟踪器结构（`entities/compliance-tracker.yaml`）核心字段：

```yaml
metadata:
  company: "[公司名]"
  generated: "[date]"
  last_updated: "[date]"
  last_audit: "[date or null]"

custom_jurisdictions: []   # 参考表未覆盖的州/国家，手动采集后填入

entities:
  - name: "[主体名]"
    type: "[Corporation / LLC / LP / other]"
    state_of_formation: "[state]"
    formation_date: "[date or null]"
    status: "[active / dormant / dissolving]"
    registered_agent: "[CT Corp / National / in-house / other]"
    jurisdictions:
      - state: "[state]"
        qualification: "[domestic / foreign]"
        agent_managed: false        # 国际主体由当地代理处理时设 true
        local_agent: "[name or null]"
        filings:
          - type: "[Annual Report / Franchise Tax / Statement of Information / Biennial Statement]"
            due_date: "[YYYY-MM-DD]"
            due_basis: "[fixed date / anniversary month / other]"
            last_filed: "[date or null]"
            last_fee: "[amount or null]"
            status: "[current / due_soon / overdue / unknown]"
            confirmed_good_standing: "[date or null]"
```

状态取值：`current`（本期已申报、90 天内无到期）/ `due_soon`（90 天内到期）/ `overdue`（过期且本期无申报记录）/ `unknown`（无信息，需人工确认）。

CSV 导出列：`Entity Name, Entity Type, State of Formation, Formation Date, Status, Registered Agent, Jurisdiction, Qualification Type, Filing Type, Due Date, Last Filed, Last Fee, Good Standing Confirmed, Notes`。

## 注意事项

- **公式注入防御**：向 Excel / Sheets / CSV 写入任何来自文档、工具结果或用户粘贴的单元格前，凡以 `=`、`+`、`-`、`@`、Tab、回车、换行开头的，前置单引号（`'=SUM(...)` 显示为文本而非执行）；CSV 还须按 RFC 4180 转义内嵌逗号、双引号、换行。这是硬要求——用户在 Excel 打开会触发宏或经 DDE 外泄数据即供应链攻击。你自控的列头与计算值安全，对方来源文本（主体名、注册代理数据、CLM 导出）视为攻击者可控。
- **轻量定位**：跟踪器是用户拥有的文件，Claude 按命令更新，需要时导出共享；不与代理的权威合规日历竞争。
- **国际申报差异巨大**，一律先确认申报类型/节奏/费用再填表；有当地代理的标 `agent_managed: true` 并提示直接向其核实。
- **休眠主体有成本**（年费、注册代理费）且持续产生合规义务；>5 年休眠者作为解散候选标记，但解散决定须由律师拍板。
- **良好信誉确认 >12 个月即视为过期**，M&A 或融资在即时尤应刷新。

## 互见

- related：`board-minutes-drafter`、`diligence-issue-extractor`、`general-counsel-advisor`、`regulatory-policy-diff`、`legal-hold-manager` —— 同属企业法务卷，主体合规数据常被尽调、董事会治理、监管比对复用。
- combines_with：`diligence-issue-extractor` —— 并购尽调时主体良好信誉与申报状态是常查项；`general-counsel-advisor` —— 合规暴露评估可引用本跟踪器结论。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
