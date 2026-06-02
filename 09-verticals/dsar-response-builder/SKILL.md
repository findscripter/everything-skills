---
name: dsar-response-builder
title: 数据主体请求响应起草
description: 当收到数据主体的访问/删除/可携/更正等隐私权请求（DSAR）需按法定流程起草回复时使用；做的事是分类请求、核验身份、逐系统定位数据、分析豁免，并产出「确认函+实质回复函」两封信草稿及内部豁免分析；不适用于直接查询业务系统、对疑难案件下豁免结论或直接发送回复（须律师审核后由人发送）。触发词：DSAR、数据主体请求、访问请求、被遗忘权、删除请求、可携权、更正请求、data subject request、access request、right to be forgotten、someone wants their data。
domain: 领域/legal
triggers: [DSAR, 数据主体请求, 访问请求, 被遗忘权, 删除请求, 可携权, 更正请求, data subject request, access request, right to be forgotten, someone wants their data]
tags: [legal, privacy, dsar, gdpr, ccpa, data-subject-rights, compliance, letter-drafting]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [legal-research-connector, westlaw, eur-lex, research-mcp]
requires: []
related: [gdpr-data-handler, privacy-impact-assessor, dpa-clause-reviewer]
combines_with: [gdpr-data-handler, privacy-impact-assessor]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 收到数据主体（个人）发来的隐私权请求，需按法定时限和流程起草回复时。涵盖访问、删除/擦除、可携、更正、反对、限制处理、退出销售/共享与自动化决策等权利。
- 用户粘贴一封访问/删除/可携/更正请求邮件，或说「DSAR 来了」「访问请求」「被遗忘权」「有人要他的数据」时。

不该用的边界：

- 不直接查询生产库、分析、CRM 等业务系统——本技能只给出逐系统核对清单，实际查询由人或外接工具完成。
- 不对疑难/临界案件下豁免结论——只标记出来交律师裁断。
- 不发送回复——产出的是供律师审核的草稿，审核通过后由人发送。

## 步骤

1. 加载流程配置（系统清单、身份核验方法、响应 SLA、谁处理常规/谁需升级）。若系统清单为空或过期，先报警——不知道去哪查就做不全 DSAR。
2. 分类请求：识别援引的是哪项权利；组合请求（如「先给我数据再删账号」=可携+删除）拆成两条关联请求处理。**先研究适用规则**：定位适用法域（GDPR / UK GDPR / CCPA-CPRA / 美国各州法 / 行业法规），引用精确条款，注意生效日期（数据主体权利频繁修订）。
3. 核验身份：按配置方法（已登录会话即确认 / 在档邮箱匹配 / 高价值或删除请求追加质询、电话、证件）。**按风险校准**——过度核验是给监管留坏印象，核验不足则可能把数据交给冒名者。无法核验时几日内回函说明需补验，别拖到第 29 天。
4. 定位数据：逐项走系统清单（生产库、分析、工单、CRM、邮件营销、日志、备份、第三方处理者），逐系统记录是否查询、是否找到、找到什么。B2B 处理者场景：数据主体通常是「你客户的」终端用户，先确认这是不是该转交控制者的请求。
5. 豁免分析：**先研究适用规则**。对每一项，列出所有有善意依据可能适用的豁免（第三方隐私、法律特权、商业秘密、安全、法定保留义务、法律主张确立/抗辩、交易必需、备份轮换等）并附精确引用。**不要凭主观判断收窄清单**——技能宁可多列可能豁免并标注不确定项，由律师收窄；漏列一项事后才发现适用的代价极高（一旦披露豁免就实质失效），多主张则律师审核时可纠正。每条豁免须注明「拟议——主张前需律师审核」。
6. 起草回复——**两封信**（见下）：5a 确认函（数日内即发，绝不与实质回复合并到第 45 天才发）+ 5b 实质回复函（按法定时限发，且仅在身份核验完成、第 4/5 步定位与豁免分析做完后）。
7. 登记：DSAR 会被审计，记录收件日期、身份核验日期、回复日期、产出/删除内容、所主张豁免及依据、经办人。
8. 升级检查：命中任一触发即先转交再继续（见注意事项）。

## 指令

- 加载流程配置（systems list / verification method / SLA）。
- 分类请求 → 研究适用规则并精确引证。
- 核验身份；无法核验时输出（英文模板）：

```markdown
We were unable to verify that this request came from the individual whose data
is at issue. To proceed, please [verification step]. We cannot provide personal
data in response to a request we cannot verify.
```

- 逐系统定位数据，填写下表：

| System | Queried? | Data found? | What |
|---|---|---|---|
| Production database | | | |
| Analytics (Mixpanel/Amplitude) | | | |
| Support tickets (Zendesk) | | | |
| CRM (Salesforce/HubSpot) | | | |
| Email marketing (Marketo) | | | |
| Logs | | | |
| Backups | | | (通常豁免删除) |
| Third-party processors | | | (删除可能须通知) |

- 豁免分析：逐项列出 + 精确引证 + 标注「拟议，需律师审核」。
- 起草两封信（确认函在前、实质回复在后），不要合并。
- 登记 DSAR；命中升级触发则先升级。

### 关键约束

- **不静默补充**：若研究工具对该法域的权利/豁免/时限返回很少或零结果，如实报告并停下，不要用网搜或模型知识填补；列出选项（扩大查询/换工具/网搜并打 `[web search — verify]` 标签/标记未验证并停止）交律师决定。
- **来源分级标签**：模型知识引证按三级打标——`[settled]`（稳定的常见法条，仍需核验但优先级低）、`[verify]`（真实但需核验：实施细则、机构指引、判例、阈值、生效日、2023 后修订）、`[verify-pinpoint]`（精确引证如具体小节/卷页/段号，伪造风险最高，必须对照一手来源核验）。工具检索引证保留来源标签（`[Westlaw]` 等），网搜引证保留 `[web search — verify]`，用户提供保留 `[user provided]`。绝不剥离或合并标签。
- **时钟起算**：响应时钟自收到请求起算，而非身份核验完成时——除非适用法规另有规定，不得默认以核验拖延时钟。
- **两封信规则**：每个 DSAR 都产出确认函（即时，目标当天至 3–5 天）+ 实质回复函（按法定时限）。第 45 天才发一封合并信即使内容正确也是流程失败。
- **非律师门禁**：若角色为非律师，发任一信前必须确认已与律师审核；未确认则生成一页简报（数据主体、援引权利、适用法域、各系统定位结果、扣留项及豁免、身份核验状态、响应时限、发信前要问律师的三件事）并停在此门，无明确「是」不得越过。
- **工作产品头**：两封对外信件均**不**加工作产品头；随附的内部笔记、日志、豁免分析属律师工作产品，单独保存并按配置加工作产品头。

## 示例

实质回复——删除请求回复函模板（英文，对外发送）：

```markdown
Subject: Your Deletion Request — [Company] — [date]

We received your request on [date] to delete the personal data we hold about you.

**What we deleted:**

| Category | System | Deleted on |
|---|---|---|
| [Account and profile] | Production | [date] |
| [Analytics events] | [Amplitude/etc.] | [date] |

**What we retained and why:**

| Category | Reason | Retained until |
|---|---|---|
| [Transaction records] | Legal obligation (tax record retention, [cite law]) | [date] |
| [Backup snapshots] | Will be deleted on next rotation | [date] |

**Third-party processors:** We have instructed [list] to delete your data from
their systems.

Your account is now closed. If you have questions, contact [privacy contact].
```

访问请求回复函要点：用「类别 / 来源 / 目的 / 保留至」表展示找到的数据；附数据导出文件并注明安全交付方式（加密压缩包、带有效期的安全链接）；列出第三方处理者；单列「未包含的数据」及对应豁免与理由（如安全日志、已脱敏的他人数据）。

## 注意事项

- **开始前的数据处理提醒**：请求中含数据主体 PII。确认会话与输出存储满足数据处理要求；删去不需要的内容（证件附件、无关邮件串）；不要把数据主体姓名写进文件名。
- **法域假设**：分析默认配置中指定的法域范围。隐私规则、响应时限、合法性基础因法域差异巨大（GDPR vs 美国州消费者隐私法 vs 行业法），主体/处理活动/控制者若在不同法域，本分析可能不适用。
- **升级触发**（命中即先转交）：请求者可能是原告/对方律师/记者；范围异常（「所有数据包括关于我的内部沟通」）；该个人数据上有诉讼保全令（删除请求+保全=冲突，律师定）；请求者对此前 DSAR 回复有异议；任何监管机构被抄送或提及。
- **时限管理**：研究当前对该项权利与法域生效的响应时限、是否有延期机制及延期需给主体的通知，引用精确条款并注明生效日期。若内部 SLA 比法定时限更紧，用内部 SLA 并注明法定兜底。需要延期就在首个截止日前足够早发「需要更多时间」通知，当天才延期观感差。
- **研究连接器预检**：发任一信或内部豁免分析前，检查本会话是否可达法律研究连接器（Westlaw / EUR-Lex / 监管站点 / 所配置的研究 MCP）。预检结果记入**内部**审核笔记的 `Sources:` 行（审核笔记附在内部豁免分析与说明备忘上，绝不附在对外信件上），不要在输出上方单独加横幅。
- **不要发送**：草稿仅供律师审核。发送会使控制者承诺立场、可能放弃豁免、可能启动监管时钟，须持照律师审核、编辑、批准后再由人发送。

## 互见

- fact-checking：核验法条引证、生效日期与豁免主张，配合三级来源标签使用。
- markdown-to-docx：将定稿的确认函/回复函由 Markdown 转为可发送的 Word 文档。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
