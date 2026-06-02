---
name: ip-portfolio-register
title: 知识产权组合登记与续展
description: 当需要登记/更新 IP 资产、追踪商标续展·专利年费·使用声明等到期项、或审计组合查缺口与失效风险时使用；按 --report/--add/--update/--audit 维护 portfolio.yaml 登记簿并产出按紧迫度分级的到期报告与审计清单；不适用于代为递交申请·缴费、自动核验官方记录或替代 IPMS/律师定夺。触发词：知识产权组合, 商标续展, 专利年费, 使用声明, 到期提醒, 续展登记, IP登记簿, 组合审计, portfolio, renewal, maintenance fee, §8, annuity, docket
domain: 领域/legal
triggers: [知识产权组合, 商标续展, 专利年费, 使用声明, 到期提醒, 续展登记, IP登记簿, 组合审计, portfolio, renewal, maintenance fee, §8, annuity, docket]
tags: [legal, ip, trademark, patent, portfolio, renewal, maintenance, docketing, yaml, compliance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [yaml, markdown]
requires: []
related: [entity-compliance-tracker, contract-renewal-tracker, trademark-clearance-knockout, invention-disclosure-screen]
combines_with: [freedom-to-operate-triage]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 需查看未来 N 天（默认 90）内即将到期的商标续展、专利年费、§8 使用声明、域名续费等项，并按紧迫度分级。
- 新登记或更新一项 IP 资产（商标/专利/版权/外观设计/域名），含类型、法域、号码、关键日期、权利人、业务负责人。
- 记录一次维护性递交或缴费已完成，与 IPMS 同步，或变更资产状态。
- 对整个组合做更广的健康审计：到期卫生、登记缺口、§8 临近商标的「商业使用」问题、权利人不一致、到期视野、未监控商标。
- 登记簿为空且已连 IPMS 时，从权威系统拉取组合做初始化（Mode 1 / `--rebuild`）。

不该用：
- **不代为递交任何申请或缴费**。本技能只把到期项摆到律师/外国代理人面前，告诉对方期限与需准备什么。
- **不核验官方记录**。期限是从你给的日期算出来的；登记簿是工作副本，注册局/IPMS 才是真相源。
- **不替代 IPMS**。数百件以上的组合应用 Anaqua/CPA Global/Clarivate/Alt Legal 等（有注册局直连、自动催办、年费代缴）；本技能仅适合小型组合或作为轻量呈现层。
- **不决定是否续展**。续与不续是商业判断（商标是否在用、专利是否仍有价值），由业务与律师拍板。

## 步骤

登记簿位于 `~/.claude/plugins/config/claude-for-legal/ip-legal/portfolio.yaml`。四种模式由标志位路由，无标志位等价 `--report`。每次出报告前**先重算所有资产的到期项**，勿仅依赖存量日期。

- **`--report [--days 30|60|90|180]`（默认）**：按紧迫度分组列出窗口内到期项：🔴 已失效/宽限期、⏰ 窗口内到期、🟡 即将、🌐 代理托管、❓ 未知（缺关键日期无法计算）。结尾固定附核验告诫语。资产超约 10 件或用户要求时，提议生成可视化 dashboard。
- **`--add`**：交互式登记单件——类型/法域/标题/权利人/关键日期/号码/类别或权利要求数/IPMS docket ID/外部律师/业务负责人。采集后按规则算到期项；法域无内置规则时走 `custom_rules` 采集流程，并标 `agent_managed: true`。
- **`--update`**：记录维护递交/缴费、与 IPMS 同步、或改状态。**把任何到期项置为 `filed` 前，先过「重大行动闸门」**。
- **`--audit`**：更广健康检查（见下）。

**custom_rules 采集**（法域非内置时逐项问）：①适用哪些维护事件（每 N 年续展？逐年年费？使用声明？）；②到期起算点（申请日/注册日/授权日/进入国家阶段/某周年）；③是否有宽限期、代价几何；④是否有外国代理人/本地代理管理。存入 `custom_rules:` 并应用于该法域后续资产。

## 指令

**重大行动闸门（`--update` 置 `filed` 前）**：读 `CLAUDE.md` 的 `## Who's using this`，若角色为非律师，提示「把 §8 声明、§9 续展、专利年费、国际年费记为已递交有后果——若记录错误（漏期、实体规模错、使用样本错），期限不会顺延，资产仍可能失效」，要求其先向实际递交的律师/外国代理人或官方记录（USPTO TSDR / WIPO Madrid Monitor / 相关注册局）确认；未得明确「是」**不得**置 `filed`。仅 `filed` 需此闸门，状态刷新、出报告、呈现即将到期项不需要。

**到期项状态值**：`upcoming`（>90 天）/ `due_soon`（90 天内未递交）/ `overdue`（过主期限、在宽限期内）/ `grace`（宽限期，带附加费）/ `lapsed`（过宽限期未行动，除非可复活否则资产实质丧失）/ `filed`（本周期已完成）。

**内置法域维护机制（关键约束，触发后须仍向官方/IPMS 核验）**：
- **美国商标**：注册第 5–6 周年间递 §8 使用声明（Madrid 指定为 §71），第 10 年起每 10 年递 §8/§9 合并续展；连续使用满 5 年可申 §15 不可争议。§8/§9 有 6 个月宽限期带附加费。
- **Madrid 国际商标**：10 年期在 WIPO 续展；各指定国可能有本地使用/声明要求。
- **EUIPO 商标**：10 年续展，6 个月宽限期带附加费。
- **美国实用专利**：年费于授权后 3.5/7.5/11.5 年到期，6 个月宽限期带附加费，逾期后若属非故意可请愿复活。
- **美国外观专利**：无年费；2015-05-13 及以后申请的为授权起 15 年期（更早为 14 年），期中无需行动。
- **EPO/各国专利**：年费通常自申请或进入国家阶段起逐年缴，规则因国而异，须逐法域确认。
- **美国版权**：1978 年及以后作品无维护；1964 年前作品可能涉续展义务，交律师审。
- **域名**：按注册商逐年/多年续费，典型 30 天宽限期，再赎回期（约 30 天高费），后释放。

**Mode 1 初始化**：先定来源——已连 IPMS 则以其为权威、登记簿仅镜像不另加期限；有导出表则导入、缺注册/授权日的资产标 `unknown`；都没有则交互式逐件录入。为每件填 `next_deadlines`（最近 2–3 项即可，几十年后的 10 年续展按需在报告时计算，不投机存储）。

## 示例

```
/ip-legal:portfolio --report --days 180
/ip-legal:portfolio --add
/ip-legal:portfolio --update
/ip-legal:portfolio --audit
```

登记簿资产结构（节选，YAML）：

```yaml
assets:
  - id: "TM-US-001"
    type: "trademark"            # trademark/patent/copyright/design/domain
    jurisdiction: "US"
    mark_or_title: "[标识或标题]"
    owner: "[在册权利人——关乎 §8 与转让]"
    status: "registered"         # pending/registered/lapsed/abandoned/cancelled
    registration_number: "[号或 null]"
    registration_date: "[YYYY-MM-DD]"
    next_deadlines:
      - type: "§8 Declaration of Use"
        due_date: "[YYYY-MM-DD]"
        grace_end: "[YYYY-MM-DD or null]"
        basis: "5th-6th anniversary of registration"
        action: "File §8 Declaration of Use (or excusable nonuse)"
        status: "upcoming"
    use_in_commerce: true        # 仅 TM，驱动 §8 分析
    agent_managed: false
    business_owner: "[邮箱或团队]"
```

**`--audit` 检查面**：到期卫生（当前处 grace 的项 / lapsed 未标 abandoned 的项 / 无 `next_deadlines` 的项）；登记缺口（商标申请 pending >18 月、专利申请 pending >4 年）；商业使用（§8 临近但 `use_in_commerce: false`/存疑的商标需使用审计或可宽宥不使用声明）；权利人卫生（权利人非现存活实体、同一实体多种名称写法）；到期视野（未来 24 月到期的专利）；品牌监控（已注册却不在监控清单的商标）。输出按「到期卫生 / 登记缺口 / 商业使用 / 权利人 / 到期视野 / 品牌监控 / 建议行动」分区。

## 注意事项

- **期限仅供参考**。本技能套用的规则反映构建时点的公开要求；IP 局要求、宽限期、费率、维护周期会变。每次输出结尾固定附：「Computed from portfolio register. Verify each deadline against the USPTO/WIPO/registry of record before filing or paying.」**已登记但算错的期限比没登记更糟——它制造虚假安全感**，「近期无到期」类输出尤须复核。
- **work-product 抬头**：按 `CLAUDE.md` → Outputs 在分析类输出前置抬头，角色与法域不同抬头不同；外发件（C&D、DMCA、对外摘要）须剥离抬头。
- **法域差异显著**：维护机制因法域与资产类型而异；非内置法域走 `custom_rules`，报告中显示为 `agent_managed`，向外国代理人确认而非自行算日期。
- **配套**：`ip-renewal-watcher` 代理可按周排程跑 `--report` 并把 🔴 项即时推送；新资产记录由起诉/检索/转让登记类流程交接而来。
- **§8 验证**：登记簿里标 `filed` 仅表示有人这么说，不等于 USPTO 已受理；受理状态须经 TSDR 或 IPMS 确认。

## 互见

- related：`legal-hold-manager` —— 同属法务组合/案件治理，登记簿/日志范式相通。
- related：`oss-license-compliance` —— 同为 IP 资产合规追踪（开源许可侧）。
- related：`general-counsel-advisor` —— 续与不续的商业判断与上报口径可由其统筹。
- combines_with：`regulatory-policy-diff` —— 当法域维护规则发生变更时，用其追踪规则差异并回写 `custom_rules`。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
