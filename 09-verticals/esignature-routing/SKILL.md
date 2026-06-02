---
name: esignature-routing
title: 电子签署路由准备
description: 当一份合同已定稿、准备送签电子签名（e-signature）时使用；先跑签前核对清单、配置签署顺序与抄送，再生成签署请求配置或落地签署指引；不适用于起草/谈判合同条款、提供法律意见、对文档是否「已定稿」拍板；触发词：电子签署、送签、签字、签署顺序、e-signature、签署请求、用印、signature request、envelope
domain: 领域/legal
triggers: [电子签署, 送签, 签字, 签署顺序, e-signature, 签署请求, 用印, signature request, envelope]
tags: [legal, e-signature, contract, signing-workflow, execution, checklist]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pdf-form-filler, markdown-to-docx]
requires: []
related: [contract-playbook-review, contract-proposal-writer, nda-triage-reviewer, deal-desk-reviewer]
combines_with: [contract-playbook-review, contract-proposal-writer, legal-risk-classifier]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# 电子签署路由准备

## 何时使用

- 一份合同（MSA / NDA / SOW / 补充协议等）已**最终定稿、无未决红线**，需要安排电子签名送签（e-signature routing）：跑签前核对、定签署顺序、发起签署请求。
- 送签前需要核验主体名称、附件/附表是否齐全、签署区与授权签字人是否匹配。
- 需要按「顺序签 / 并行签」配置签署流，并安排内部审批与抄送（CC）。

**不该用边界（命中即停，转人工/法务）：**
- 本条**只辅助签署流程，不提供法律意见**。是否「已定稿可签」必须由具备权限的人/法务确认后再进入本流程。
- 不起草、不修改、不谈判合同条款——发现需要改条款 → 退回起草/审查环节，不在送签流里改。
- 文档仍有未决红线（open redlines）、附件缺失、主体名/签字人存疑时，**不得送签**，应在核对清单中标记为 ISSUES 并退回。

## 步骤

1. **接收文档**：接受任意形态——文件上传（PDF / DOCX）、云存储/CLM 链接、或口头指代（如「昨天定稿的 Acme MSA」）。确认拿到的是最终版。
2. **跑签前核对清单**（逐项核验，见下「指令」）。任一项不过 → 整体判 ISSUES，列出问题退回，不进入第 3 步。
3. **配置签署信息**：收集签字人（姓名、邮箱、头衔/角色）；定签署顺序（**顺序 sequential / 并行 parallel**）；确认是否需内部审批先于对方签署；确定抄送（CC）收执行版的人。
4. **发起签署 / 落地指引**：
   - **已接入电子签名**：创建签署信封/请求（envelope），设置签署字段与顺序，按需加首字母缩写（initials）/日期域，发送。
   - **未接入**：生成签署指引文档，输出适配湿签或手动 e-sign 的版本，并列全部签字人及联系方式。
5. **产出请求摘要 + 下一步**：按「示例」模板给出文档详情、核对结论、签署配置表、抄送、状态与跟进节奏。

## 指令

**签前核对清单（Pre-Signature Checklist，逐项打勾，缺一即 ISSUES）：**

```markdown
## Pre-Signature Checklist
- [ ] 文档为最终、已达成一致的版本（无未决红线）
- [ ] 全部附件（exhibits）与附表（schedules）已附上
- [ ] 签署区主体为正确的法律实体全称
- [ ] 日期正确，或留空待执行日填写
- [ ] 签署区与获授权签字人一致
- [ ] 所需内部审批已取得
- [ ] 已由相应法务/律师审过
```

**签署配置要点：**
- **签字人**：谁需要签？（姓名、邮箱、头衔）
- **顺序**：sequential（一人签完触发下一人）还是 parallel（同时发出）。
- **内部审批**：是否需有人在对方签署前先批。
- **抄送（CC）**：谁应收到执行完成版的副本。

## 示例

```markdown
## Signature Request: [文档标题]

### Document Details
- Type: [MSA / NDA / SOW / 补充协议 / …]
- Parties: [甲方] 与 [乙方]
- Pages: [X]

### Pre-Signature Check: [PASS / ISSUES FOUND]
[若 ISSUES，逐条列出需在送签前解决的问题]

### Signing Configuration
| Order | Signer | Email | Role |
|-------|--------|-------|------|
| 1 | [姓名] | [邮箱] | [甲方授权签字人] |
| 2 | [姓名] | [邮箱] | [乙方授权签字人] |

### CC Recipients
- [姓名] — [邮箱]

### Status
[已发起签署 / 待发送 / 须先解决问题]

### Next Steps
- [发送后预期流程]
- [预计回签时长]
- [X 天内未签的跟进动作]
```

## 注意事项

- **主体名称务必逐字核对**——最常见的签署错误就是法律实体全称写错。
- **核验签署权限**——确保每位签字人都有权代表其组织签约（binding authority）。
- **留存执行版**——签署完成后立即把执行版归档到云存储/CLM。
- 本条不替任何人对「是否可签」拍板；状态判 ISSUES 时只列问题并退回，不擅自送签。
- 文档若为 PDF 形态、需要处理表单域或抽取内容，可借 pdf-form-filler；未接入电子签名时，签署指引文档若需 Word 交付，用 markdown-to-docx。

## 互见

- related：`nda-triage-reviewer`、`employment-contract-drafter`、`general-counsel-advisor` —— 签署上游的合同审查/起草/把关环节。
- combines_with：`pdf-form-filler` —— 处理 PDF 形态文档的表单与字段；`markdown-to-docx` —— 把签署指引/请求摘要转成 Word 交付件。

---
本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
