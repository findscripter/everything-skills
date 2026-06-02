---
name: hr-partner-pro
title: HR 招聘与人事管理
description: 当需要做招聘、入/离职、假期、绩效、员工关系与合规政策的人事工作时使用；产出结构化面试包、30/60/90 计划、PTO 政策、绩效/PIP 模板、调查与沟通文案（含占位符与落地清单）；不适用于具体法律意见或脱离 HR 范围的任务（高风险事项须转交本地律师）。触发词：招聘、入职、绩效、PTO、员工关系
domain: 协作/knowledge
triggers: [招聘, 面试评分表, JD 职位描述, 入职 30/60/90, 离职清单, PTO 假期政策, 绩效考核, PIP 改进计划, 员工关系调查, HR 合规政策]
tags: [人力资源, 招聘, 绩效管理, 员工关系, 合规, 模板]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit]
requires: []
related: [interview-system-designer, company-culture-builder, org-change-management, employment-contract-drafter]
combines_with: [interview-system-designer, employment-contract-drafter, company-culture-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于以「员工为中心、合规优先」的人事工作，覆盖六类交付：

- 招聘与面试：JD、结构化面试包、评分量规（rubric）、评分卡（scorecard）、候选人沟通模板。
- 入职：30/60/90 计划、IT/薪资/合规培训清单、伙伴（buddy）计划与 7/30/90 天反馈。
- PTO（带薪休假）与请假：发放/累积规则、申请审批流、结转上限、覆盖排班。
- 绩效管理：分层胜任力矩阵、SMART 目标、评审包、PIP（绩效改进计划）。
- 员工关系：问题受理、调查计划、访谈记录、结论备忘录、文档规范。
- 离职与合规政策：离职清单、离职面谈、隐私/工时/反歧视政策初稿。

不该用的边界：
- 任务与 HR 无关，或需要其他领域/工具。
- 需要正式法律意见——本技能只提供通用信息与模板，不构成律师意见，不建立委托关系。
- 高风险或跨境事项（解雇、医疗/受保护假期、移民、工会/劳资会、跨境数据传输）须提示升级到本地合规律师，不可代替。

## 步骤

1. 收集关键输入，最多问 3 个有针对性的问题再动手：
   - 司法辖区（国家/州/地区）、是否有工会、内部政策约束。
   - 公司画像：规模、行业、组织结构（IC vs 管理者）、远程/混合/驻场。
   - 用工类型：全职/兼职/外包；标准工时；节假日历。
2. 确认目标、约束与所需产物。辖区未知时，给出辖区中立草稿 + 辖区专项检查清单，并默认采用「最严保护标准」直到律师确认。
3. 按对应 Playbook 生成交付物，套用占位符。
4. 自检合规与偏见：使用与岗位相关的客观标准，剔除歧视性或违法问题。
5. 给出落地清单、沟通文案与度量指标。

## 指令

- 输出单一 Markdown 包，固定包含 6 块：① 概要（产出了什么、为什么）；② 输入与假设（辖区、规模、约束）；③ 最终产物（政策/JD/面试包/量规/矩阵/模板）；④ 落地清单（步骤、负责人、时间线）；⑤ 沟通草稿（邮件/Slack）；⑥ 度量指标（如 time-to-fill、各轮通过率、eNPS、评审周期达成率）。
- 占位符统一用双花括号：`{{CompanyName}}`、`{{Jurisdiction}}`、`{{RoleTitle}}`、`{{ManagerName}}`、`{{StartDate}}`、`{{Department}}`。
- 首次出现的缩写要展开：PTO = Paid Time Off（带薪休假）；FLSA = Fair Labor Standards Act；GDPR = General Data Protection Regulation；EEOC = Equal Employment Opportunity Commission。
- 优先用表格、编号步骤、清单，给出可直接复制的片段。
- 结构化面试包标准：8–12 道与岗位相关的问题（行为/情境/技术混合）；每个胜任力配 1–5 分锚点（精确定义「达标」）；面试官分工避免重复与违法话题；附评分卡表与复盘清单。
- PIP 模板以「辅导」为导向，附客观证据标准；员工关系文档须事实化、带时间戳、与岗位相关，避免对医疗或受保护类别的臆测。
- 拒绝违规要求：若用户提出不合规做法，拒绝并给出合法替代方案。在政策末尾附「法律与隐私提示」小块，含辖区检查项与链接占位符。

## 示例

- 「为 {{Jurisdiction}} 的 {{CompanyName}} 招聘 {{RoleTitle}}，生成结构化面试包和评分卡。」
- 「为 {{Jurisdiction}} 一家 50 人公司起草累积制 PTO 政策，结转上限 5 天。」
- 「为远程 {{Department}} 的 {{RoleTitle}} 生成 30/60/90 入职计划。」
- 「为 {{RoleTitle}} 提供带辅导步骤和客观度量的 PIP 模板。」

## 注意事项

- 不是持牌法律意见的替代品；高风险或辖区专项事项务必咨询本地律师。
- 隐私与数据最小化：只采集必要的个人数据，非必要不处理敏感数据。
- 辖区规则不清时先问再做，并提供中立草稿 + 本地核查清单。
- 偏见缓解：用包容性语言、标准化评估标准与清晰评分锚点。
- 产出不替代环境内的验证、测试或专家评审；缺少必要输入、权限、安全边界或成功标准时，停下来澄清。

## 互见

源技能建议在 Claude Code 内按需协作：

- 公司手册/长篇政策文档 → `docs-architect`。
- 法律措辞或网站政策 → `legal-advisor`。
- 安全/隐私章节 → `security-auditor`。
- 编制/运营指标 → `business-analyst`。
- 招聘文案与招聘广告 → `content-marketer`。

本技能库内可配合 `resume-builder`（候选人简历生成）一同使用。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
