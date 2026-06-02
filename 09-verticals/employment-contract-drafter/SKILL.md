---
name: employment-contract-drafter
title: 劳动合同与 HR 文书起草
description: 当需要起草劳动合同、录用通知（offer letter）、员工手册或 HR 制度文书时使用；做按文书类型套用结构化模板，产出含薪酬/保密/知识产权/竞业/解除等条款的草案并标注需法务定稿处；不适用于代替执业律师出具法律意见、判定条款可执行性或处理具体劳动争议；触发词：劳动合同、雇佣协议、employment contract、offer letter、录用通知、员工手册、employee handbook、HR 制度、保密协议 NDA、竞业限制、non-compete
domain: 领域/legal
triggers: [劳动合同, 雇佣协议, employment contract, offer letter, 录用通知, 员工手册, employee handbook, HR 制度, 保密协议, NDA, 竞业限制, non-compete]
tags: [legal, hr, employment-contract, offer-letter, employee-handbook, templates]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [markdown]
requires: []
related: [worker-classification-analyzer, general-counsel-advisor, nda-triage-reviewer, board-minutes-drafter]
combines_with: [worker-classification-analyzer, hr-partner-pro]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 起草录用通知（offer letter）、劳动/雇佣合同、员工手册或 HR 制度章节，需要法律上较稳妥的结构化草案。
- 标准化一批雇佣文书：统一条款骨架、占位符与措辞。
- 入职文书包：合同 + 保密协议（NDA）+ 知识产权归属 + （可选）竞业限制 的成套生成。
- 触发词：劳动合同、雇佣协议、employment contract、offer letter、录用通知、员工手册、employee handbook、HR 制度、保密协议、NDA、竞业限制、non-compete。

不该用的边界：

- 不替代执业律师出具法律意见，也不判定任何条款是否可执行——所有草案须经合格法务/律师定稿。
- 不处理具体劳动争议、仲裁、解雇赔偿测算等个案裁断。
- 不保证跨法域适用：源模板以美国「at-will（雇主可随时无因解雇）」为背景，**该制度在中国大陆等多数法域不适用**，须按目标法域（《劳动合同法》或当地法律）改写解除、试用、经济补偿等条款。
- 通用模板禁止直接套用，必须按法域与岗位定制。

固定免责声明（须保留在产出中）：本文书仅供参考，不构成法律意见；签署前请咨询合格法律顾问。

## 步骤 / 指令

输入：`doc_type`（offer/合同/手册/NDA/竞业）、`jurisdiction`（法域）、`company`、`employee/candidate`、`position`、`compensation`、`employment_type`（全职/兼职、是否计件/豁免加班）。

```
1. 选文书类型（按用途与时点）
   - 录用通知 offer letter → 录用前，初步要约
   - 劳动/雇佣合同 → 入职，正式协议
   - 员工手册/HR 制度 → 入职/在职，政策与流程
   - 保密协议 NDA → 接触机密信息前
   - 竞业限制 non-compete → 入职/离职（可执行性强依赖法域）

2. 确认关系定性（直接影响条款）
   - 劳动关系 vs 劳务/承揽；雇员 vs 外包/独立承包人
   - 全职 vs 兼职；固定期限 vs 无固定期限（源模板的 at-will 仅美国适用，须改写）
   - 是否豁免加班（exempt/non-exempt）等法域特定要求

3. 按目标 doc_type 套结构骨架（见「示例」），逐节填占位符 [大写方括号]

4. 法域适配（关键改写点）
   - 解除条款：把 at-will 改为目标法域的合法解除事由、通知期、经济补偿
   - 试用期、加班、最低工资、带薪假按当地法定下限校准
   - 竞业限制：标注「可执行性因法域而异，须本地法务确认」，并补偿金/期限/地域留可填

5. 注入合规底线（手册场景）
   - 平等就业 EEO、反骚扰与举报-调查-反报复流程、行为准则
   - 声明手册不构成雇佣合同、政策可变更

6. 标注所有需法务定稿/需核查处，并附固定免责声明

7. 交付：默认 Markdown；需 Word 交付转 markdown-to-docx
```

## 示例

录用通知（offer letter）骨架——关键小节：

```markdown
# 录用通知 / EMPLOYMENT OFFER LETTER
职位详情：Title / Department / Reports To / Location / Start Date / Employment Type
薪酬：Base Salary $[AMOUNT] per [year/hour]，发薪周期；Bonus；Equity（期权 4 年归属、1 年 cliff）
福利：医疗/401k 或当地社保公积金/带薪假/法定假
录用前提（Contingencies）：背景调查、合法用工资格核验、签署保密/IP/（可选）竞业协议
[at-will 段：仅美国法域保留；其他法域删除或替换为当地解除条款]
接受方式：[DEADLINE] 前签署回传；逾期失效
ACCEPTANCE：Signature / Printed Name / Date / Start Date
```

劳动/雇佣合同核心条款编号（保留源结构）：

```
1 EMPLOYMENT（职位/职责/全职投入/工作地点）
2 TERM（期限；at-will 或固定期限——按法域二选一并改写）
3 COMPENSATION（基本工资/奖金 discretionary/股权/福利/费用报销）
4 CONFIDENTIALITY（机密信息定义/不披露/离职归还/存续：商业秘密无限期、其他 [3] 年）
5 INTELLECTUAL PROPERTY（Work Product 归公司、转让、协助、Exhibit A 既有发明）
6 NON-COMPETE & NON-SOLICITATION（竞业 [12] 个月 + 客户/员工不招揽；标注法域差异）
7 TERMINATION（for Cause 即时解除四类事由；无因 [30] 天通知；离职生效、第 4/5/6/8/9 节存续）
8 GENERAL（完整协议/修改须书面/governing law/争议解决/可分割性）
9 ACKNOWLEDGMENTS（已阅读、已获咨询机会、自愿）
+ 签署页与 EXHIBIT A 既有发明清单
```

员工手册必含合规节：平等就业（EEO）、反骚扰（禁止行为 + 举报-调查-反报复）、工时考勤、带薪假 PTO（按司龄阶梯）、病假、法定假、行为准则、技术/社媒使用，末尾附「手册不构成合同、政策可变更」的签收确认。

## 注意事项

- 法律意见红线：本技能产出仅为草案模板，不构成法律意见；签署前必须经合格律师/法务定稿。这是源模板的硬性免责，须随产出保留。
- 法域优先：源模板默认美国 at-will 与 EEO 框架；面向中国大陆等法域时，解除、试用期、经济补偿、竞业补偿等必须按当地法律改写，不可照搬。
- 拒绝通用模板：每份文书按法域与岗位定制；不做可能形成「默示合同」的口头/书面承诺。
- 竞业限制可执行性强依赖法域（含补偿金对价要求），一律标注「须本地法务确认」。
- 反歧视：措辞与适用不得涉及受保护特征歧视；保留 EEO/反骚扰条款。
- 留痕：所有签署文件留存签字原件，法律与政策变更时定期更新。
- 所有金额、期限、百分比、法域名占位符 [LIKE_THIS] 在交付前须替换或显式标注「待法务确认」。

## 互见

- related：`markdown-to-docx` —— 把起草好的合同/手册 Markdown 转为可交付、可签署的 Word 文档。
- related：`internal-comms` —— 员工手册配套的内部通知、制度发布与 FAQ 撰写。

---

本条采编自 wshobson/agents（MIT）。
