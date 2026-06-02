---
name: legal-hold-manager
title: 诉讼证据保全通知管理
description: 当在诉讼/调查/合规场景需要签发、刷新、解除或汇总「法律保全 / litigation hold / legal hold」时使用；按 --issue/--refresh/--release/--status 起草保全通知 .docx、更新 _log.yaml 中 legal_hold 字段并排期下次刷新；不适用于真正执行数据冻结、自动外发通知或替代律师审批定夺。触发词：法律保全, 证据保全, 诉讼保全, 保全通知, 签发保全, 刷新保全, 解除保全, 保全状态, legal hold, litigation hold, preservation, spoliation, custodian
domain: 领域/legal
triggers: [法律保全, 证据保全, 诉讼保全, 保全通知, 签发保全, 刷新保全, 解除保全, 保全状态, legal hold, litigation hold, preservation, spoliation, custodian]
tags: [legal, litigation, legal-hold, preservation, spoliation, docx, compliance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [docx, yaml, markdown]
requires: []
related: [litigation-chronology-builder, deposition-outline-prep, privilege-log-reviewer, diligence-issue-extractor]
combines_with: [litigation-chronology-builder, deposition-outline-prep]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 诉讼已起诉/送达，或合理预期发生（收到索赔函、调查通知）时，需向相关保管人（custodian）**签发**证据保全通知。
- 已有保全到了刷新周期（默认 +6 个月），或案情/保管人/系统范围变化，需**刷新**重申。
- 案件真正了结（无上诉、无重启可能、相关请求权诉讼时效已过）需**解除**保全。
- 需要跨案件组合（portfolio）出一份**保全状态**报告。

不该用：
- 不负责**实际执行**保全/冻结数据——本技能只起草通知，由 IT/保管人在系统层落实。
- 不**自动外发**通知——只产出 .docx 草稿，由用户按惯例邮件发送。
- 不**独自拍板范围**或在未审阅时自动刷新——范围与时点由律师/用户判断。
- 不替代律师审批。所有草稿均为「待律师审阅」，非可直接外发的定稿。

## 步骤

四种模式由标志位路由：`--issue | --refresh | --release | --status`，无标志位则先询问。

**冲突核查闸门（不可绕过）**：签发/刷新/解除前，先在 `_log.yaml` 中按案件 slug 查记录。若案件不在 `_log.yaml`，拒绝并引导用户先完成案件立案（intake，由立案流程跑冲突核查并写入 `_log.yaml` 行），不在未立案案件上操作保全。

**加载上下文**：
- `matters/_log.yaml` — 日志行（legal_hold 字段 + status）
- `matters/[slug]/matter.md` — 案件背景（对方当事人、事实、internal_owners 中关键保管人）
- `CLAUDE.md` — 院内规范：保全模板指针、密级标注、上报口径

**管辖假设**：保全义务因法域差异显著（美国联邦 Zubulake / Residential Funding / Rule 37(e) 与各州、监管保全义务如 SEC Rule 17a-4、HIPAA 各不相同），触发时点、范围、制裁/灭失证据救济均有别。草稿中的判断只是针对案件所列法域的起点，签发/刷新/解除前须经律师确认。

按标志位执行：
- `--issue`：先研判适用保全规则（法域、义务来源、触发标准、范围标准、制裁敞口，引用一手法源）。采集范围、保管人、起算日期、系统、紧迫性、生效日。起草 `legal-hold-v1.docx`。更新 `legal_hold` 字段，追加 history 条目，设 `next_refresh`（默认 +6 个月）。
- `--refresh`：采集范围/保管人变更，起草下一版本。更新 `last_refresh` + `next_refresh`。**离职保管人**单独标记为保全行动项（需 IT 在系统层保全其文件与邮件归档，而非仅通知本人）。
- `--release`：采集解除日期、保留指示（恢复常规保留？继续保全一段期间？转归档？）。起草解除通知，设 `released:` 字段。
- `--status`（无 slug）：读 `_log.yaml`，出组合级保全报告。

写入前先确认：把草稿通知和日志 diff 展示给用户。

## 指令

**非律师闸门（签发/解除前）**：读取 `CLAUDE.md` 的 `## Who's using this`，若角色为非律师，提示「签发/解除保全有法律后果（范围、保管人名单、时点构成日后被据以评判的保全记录；解除后保管人可能开始删除材料，时机不当造成灭失证据敞口）」，生成一页给律师的摘要（案件与触发、拟议范围与保管人、研判的法域保全规则、已知灭失证据敞口、可能出错点、要问律师什么），并在得到明确「是」之前不外发。起草和定范围不需要此闸门，签发/解除才需要。

**外发件密级**：发给保管人的通知用模板中的「律师-当事人沟通」标注（`[PRIVILEGED & CONFIDENTIAL — ATTORNEY-CLIENT COMMUNICATION]`），**不要**带 `ATTORNEY WORK PRODUCT` 工作成果抬头。

**发送闸门（草稿收尾，预览中保留、外发前剥离）**：注明「这是供律师审阅的保全通知草稿，非可签发的定稿。签发将触发日后灭失证据争议中被评判的保全义务，通知本身也可能可被披露。须由执业律师审阅、批准并签发，勿未经审阅即分发。」

**写入物**：
- `matters/[slug]/legal-hold-v[N].docx`（解除为 `legal-hold-release.docx`），经 `docx` 技能生成。
- 追加 `matters/[slug]/history.md` 条目。
- 更新 `_log.yaml` 的 `legal_hold` 块。

## 示例

`legal-hold --issue` 后，`_log.yaml` 行更新为：

```yaml
legal_hold:
  issued: true
  issued_date: [YYYY-MM-DD]
  scope: "[一行摘要]"
  custodians: [名单]
  last_refresh: [YYYY-MM-DD]   # 首次签发同 issued_date
  next_refresh: [YYYY-MM-DD]   # 默认 issued_date + 6 个月
  released: null
```

默认保全通知模板（外发给每位保管人）要点：

```
[PRIVILEGED & CONFIDENTIAL — ATTORNEY-CLIENT COMMUNICATION]
DATE / TO / FROM(签发人) / RE: LITIGATION HOLD NOTICE — [案件简称]

立即生效，须保全：
1. 与 [范围条目] 相关的全部文档、邮件、短信、Slack/Teams 等沟通。
2. [范围条目 2] ...

保全义务覆盖：邮件（含已发/归档/已删）、Slack/Teams、共享盘与云存储、用于
公务的个人设备(BYOD)、纸质文档、语音留言、日历与会议记录。

切勿：删除/修改/销毁任何可能相关材料；对邮件或消息做自动删除或"Inbox Zero"。

如不确定某项是否被覆盖，一律从保全角度处理（ERR ON THE SIDE OF PRESERVING）。
请在三个工作日内确认收悉。本通知在收到书面解除前持续有效。
```

`--status` 报告含「Active holds」表（Matter/Issued/Last refresh/Next refresh/Custodians/Status）与「⚠️ Attention」区（刷新逾期、30 天内到期、活跃案件未签发保全、已结案件保全仍生效）。

## 注意事项

- **范围权衡**：太宽=运营负担，太窄=灭失证据风险（`[SME VERIFY]`）。范围由用户/律师确认。
- **保管人名单**是「可辩护保全」与「缺口论」的分水岭，从 matter.md 的 internal_owners 与常见角色（业务负责人、HR、CISO）取建议后确认。
- **离职保管人**必须单列为行动项，仅通知个人不足以保全其归档。
- **解除时机**：确认案件确实终结（无上诉、无重启、相关请求权时效已过）再解除。
- 与 `portfolio-status` 联动：后者标记「活跃诉讼未签发保全」，本技能负责消除该标记。

## 互见

- 与组合状态/立案流程（matter-intake、portfolio-status）配套，但这些不在本大典已有技能清单内，故不列入 related。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
