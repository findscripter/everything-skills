---
name: ma-process-letter
title: 并购流程函与报价指引
description: 当卖方主导的并购流程需要向买方发出流程函、报价规则或管理层会议邀请时使用；起草初步意向(IOI)指引、第二轮/最终约束性报价规则、管理层会议邀请，产出带公司抬头与修订模式的 .docx 信函；不适用于估值建模、CIM/teaser 撰写或 NDA 起草；触发词：流程函、报价指引、IOI 意向函、最终轮报价规则、管理层会议邀请
domain: 商业/finance
triggers: [流程函, process letter, 报价指引, bid instructions, IOI 意向函, IOI letter, 最终轮报价规则, final round letter, 管理层会议邀请, management meeting invite, 约束性报价, 竞标规则]
tags: [商业, finance, 并购, m&a, 卖方流程, 投行, 报价规则, 文档起草]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit]
requires: []
related: [ma-deal-teaser, ma-buyer-list, ma-playbook, cim-builder]
combines_with: [ma-buyer-list, ma-deal-teaser, cim-builder]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

在卖方主导（sell-side）的并购流程中，需要向潜在买方下发书面规则与时间表时使用，包括四类信函：

- 初步流程函（随 teaser/CIM 发出，说明流程与 IOI 要求）
- IOI 指引（首轮意向书 indication of interest 的具体要求）
- 第二轮/最终报价函（尽调后提交约束性报价的规则）
- 管理层会议邀请（现场/线上管理层路演的安排）

不该用的边界：
- 不负责估值建模、CIM/teaser 或营销材料撰写。
- 不负责 NDA/保密协议本身的起草（信中仅引用既有 NDA）。
- 不负责买方侧（buy-side）出价函或尽调清单本身的编写。
- 信中任何陈述、承诺、排他条款须经法务把关，本技能不替代法律意见。

## 步骤

### 第 1 步：确定信函类型
先判定属于上述四类中的哪一类，不同类型字段差异很大，避免混用模板。

### 第 2 步：初步流程函 / IOI 指引
抬头：日期、项目代号（deal code name）、标注「机密 Confidential」、致具名潜在买方。

正文小节：
1. 引言：机会与卖方目标的简述。
2. 流程概览：时间表、关键日期、预期轮次。
3. IOI 要求（首轮意向需包含）：
   - 估值区间（企业价值 enterprise value）
   - 对价形式（现金、换股、对赌 earnout、股权滚存 rollover）
   - 融资来源与确定性
   - 关键尽调诉求
   - 预计交割时间表
   - 任何前提条件或或有事项
   - 买方简介与战略逻辑
4. 提交细节：递交方式、截止日期与时间、格式要求。
5. 保密提醒：引用 NDA、数据室（data room）访问规则。
6. 联系方式：负责银行家联系人。

### 第 3 步：最终轮 / 第二轮报价函
在 IOI 基础上追加：
1. 收购协议修订：随附 SPA/APA 草案并要求买方批注（markup）。
2. 详细融资承诺：要求提供承诺性融资函（committed financing letters）。
3. 剩余尽调事项：明确还需哪些确认性尽调。
4. 排他条款：排他期的期限与条件。
5. 监管分析：反垄断申报要求与时间表。
6. 关键人员条款：雇佣协议、薪酬、股权滚存。
7. 约束性与否：明确本阶段哪些内容具约束力。
8. 评估标准：报价如何评判（价格、确定性、速度、契合度）。

### 第 4 步：管理层会议邀请
1. 后勤：日期、时间、地点（或视频链接）、时长。
2. 出席人：公司方汇报人、买方应到人员。
3. 议程：管理层路演标准议程（概览、财务、运营、增长、Q&A）。
4. 规则：禁止录制、保密、提问方式。
5. 材料：将分发的内容（演示文稿、数据室访问）。
6. 后续：会后补充提问的提交流程。

### 第 5 步：产出
- 专业信函排版的 Word 文档（.docx）。
- 公司抬头占位符（firm letterhead placeholder）。
- 供客户审阅的修订模式（track changes）版本。

## 示例

场景：某消费品公司卖方流程，项目代号「Project Aster」，准备首轮 IOI 指引。

骨架（节选）：
```
机密 Confidential
2026年6月15日 — Project Aster

致 [潜在买方名称]：

一、引言
卖方拟出售其旗下消费品业务……

二、流程概览
首轮 IOI 截止：2026年7月3日 17:00（北京时间）
预计两轮，第二轮于尽调后约 4 周

三、IOI 要求
请在意向书中说明：
- 企业价值区间（EV）
- 对价形式（现金/换股/earnout/rollover）
- 融资来源与确定性
- 拟交割时间表与前提条件
- 买方简介与战略逻辑

四、提交细节
邮件递交至 [banker@firm.com]，PDF 格式，逾期不候。

五、保密
受 2026年5月1日 NDA 约束；数据室访问见单独通知。

六、联系人
[银行家姓名 / 电话 / 邮箱]
```
截止设定：IOI 通常给 2–3 周，最终报价 3–4 周。

## 注意事项

- 流程函为整笔交易定调，务必清晰、专业、条理化。
- 截止日期应坚定但合理：IOI 约 2–3 周，最终报价约 3–4 周。
- 务必写明评估标准，买方需要知道自己将如何被评判。
- 信中任何陈述、承诺或排他条款须与法务协同确认。
- 发出前须经客户审阅批准，客户可能调整措辞或条款。
- 留存收件台账：记录每封信的收件人与时间，这就是流程跟踪表（process tracker）。

## 互见

- CIM / teaser 撰写（营销材料，先于本流程函发出）
- NDA / 保密协议起草（信中引用，需先行签署）
- SPA / APA 收购协议（最终轮随附并要求 markup）
- 数据室与尽调清单管理

---
采编自 anthropics/financial-services（Apache-2.0）。
