---
name: compliance-readiness-review
title: 多框架合规就绪审查（compliance-readiness-review）
description: 当采纳新合规框架、敲定年度审核日历或签署认证就绪结论前使用；用「六问质询」压测合规项目并产出就绪裁决（READY/STAGE-2/NOT-READY）与Top3行动项；不适用于单框架技术配置或日常证据维护；触发词：合规就绪、多框架审计、认证就绪
domain: 安全/compliance
triggers: [合规就绪审查, 多框架合规, 年度审核日历, 认证就绪签署, 认证 stage 1, 模拟审计, 跨框架证据复用, 管理评审 9.3, compliance readiness]
tags: [合规, compliance, 安全, 审计, iso, 认证, 证据管理, 风险治理]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Bash, Write]
requires: []
related: [soc2-compliance-preparer, iso27001-isms-implementer, iso42001-aims-specialist, gdpr-data-handling]
combines_with: [soc2-compliance-preparer, iso27001-isms-implementer, security-audit-toolkit]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

在对合规项目做出**不可逆承诺或就绪签署**之前，用六个强制问题压测项目成色。典型触发：

- 采纳新的合规框架之前
- 敲定**年度审核日历**之前
- 签署认证 stage 1 / stage 2 就绪结论之前
- 召开跨框架管理评审（各 ISO 标准 Clause 9.3）之前
- 证据收集工作量**同比增长 50%+**（异味信号）
- 某次审核产生 **>15% 的严重发现项**

**不该用边界：**
- 单一框架的技术落地/控制项配置（用对应专项技能，如 ISO 42001、ISO 27001、SOC2 等）。
- 日常证据更新与台账维护这类例行运营，无需启动整套质询。
- 法律新案研判、网络安全战略等非合规就绪决策（见「互见」路由）。

## 步骤

按顺序回答六问，每问对应一个产出动作；缺答即视为就绪缺口。

1. **是否枚举了全部适用框架？** 不跑框架选择器就没有可辩护的范围。用公司画像跑 `framework_selector.py`；漏掉框架=日后重建审计项目。重点关注行业叠加项（金融：NYDFS、FINMA；医疗：HIPAA、ISO 13485；AI：ISO 42001 + 欧盟 AI 法案）。
2. **框架在哪里重叠、复用杠杆多大？** 「一份证据 → N 个控制项」是多框架效率的基石。用启用的框架跑 `cross_framework_mapper.py`。映射置信度：HIGH=同一证据；MEDIUM=既有+叠加；LOW=需新建。缺重叠分析会把同一份访问复核记录收集 3 遍。
3. **每份证据归谁、复用杠杆分多少？** 共同归属却无问责，是证据陈旧的头号成因。跑 `evidence_pool_generator.py` 生成证据清单。高杠杆证据（≥5 个映射）**最先建**；每份证据需**唯一**问责人；陈旧证据=实质缺口（哪怕历史上存在过）。
4. **审核日历如何、审核员独立性是否被尊重？** 监督审核挤在同一周是异味。用各框架排期工具（aims_audit_scheduler、isms_audit_scheduler、audit_schedule_optimizer）。审核员不得审自己的工作（各 ISO 标准 Clause 9.2）；小团队：轮换审核员 + 偶尔外部审核员。
5. **模拟审计产出什么、严重度分布是否健康？** 没有模拟审计=没有就绪信号。用「框架+范围」跑 `audit_simulator.py`。健康分布：观察项 ≥40%，严重项 ≤15%；全是严重项=审核破坏性 或 项目真在失败；全是观察项=审核过于浮于表面。
6. **跨框架管理评审节奏如何？** 各框架各自要管理评审；按 Annex SL 做**整合评审**可省 5 倍高管时间。安排**一次季度跨框架评审**，覆盖所有启用框架的 Clause 9.3 输入。输入：风险登记册变化、未关闭不符合项、审核发现、事件、漂移、KPI；输出：行动项、资源决策、范围调整。

## 指令

按需运行脚本（路径相对于原 compliance-os 项目，迁移时按实际目录调整）：

```bash
# 1. 框架选择
python ../../skills/compliance-os/scripts/framework_selector.py profile.json

# 2. 跨框架重叠分析
python ../../skills/compliance-os/scripts/cross_framework_mapper.py program.json

# 3. 证据池整合
python ../../skills/compliance-os/scripts/evidence_pool_generator.py program.json

# 4. 模拟审计（逐框架）
python ../../skills/compliance-os/scripts/audit_simulator.py scope.json
```

完成后按固定模板输出裁决报告（见「示例」）。裁决三档：
- 🟢 READY ｜ 🟡 STAGE-2-CANDIDATE ｜ 🔴 NOT-READY

## 示例

```markdown
# 合规就绪审查：<项目名>
**日期：** YYYY-MM-DD

## 正在做的决策
[框架集 | 审核日历 | 认证就绪 | 证据整合]

## 框架集
- 适用：<列表>
- 强制性（法规）：<数量>
- 可认证：<数量>
- 缺失依赖：<列表>

## 跨框架重叠
- 范围内合并控制项总数：N
- 高杠杆证据（≥5 映射）：M
- Top5 复用机会：<清单>

## 证据池
- 目录内证据数：N
- 高杠杆数：M
- 陈旧证据率：X%
- 无主证据：K

## 审核日历
- 本年度排期框架：<列表>
- 审核员独立性是否被尊重：是/否
- 冲突：<列表>

## 模拟审计结果（逐框架）
- <框架>：发现项 N，严重 X%，观察 Y%，分布健康：是/否

## 裁决
🟢 READY | 🟡 STAGE-2-CANDIDATE | 🔴 NOT-READY

## Top3 行动项
[3 个具体下一步，含负责人 + 截止日期]
```

## 注意事项

- **六问皆为强制题**：任一问无法回答即视为就绪缺口，不应签署就绪结论。
- 严重度分布既看上限也看下限：全严重项与全观察项都是坏信号——前者可能是项目真在失败，后者说明审核太浅。
- 高杠杆证据优先建设（≥5 映射先做），避免重复收集同类记录。
- 涉及认证的多年期财务承诺，建议先「冻结」一段冷静期再拍板（对应原 `/cs:freeze 30`）。
- 脚本路径来自源项目，迁移到本仓库后请校正为实际脚本位置；若脚本缺失，可将六问作为人工核对清单使用。

## 互见

- ISO 42001（AIMS）专项强制问题：`aims-audit`
- 欧盟 AI 法案就绪专项：`ai-act-readiness`
- 网络安全战略评审：`ciso-review`
- 高管 AI 战略评审：`caio-review`
- 法律新案研判：`gc-review`
- 决策记录 / 冷静期冻结：`decide` / `freeze`
- 相邻专项技能：iso42001-specialist、eu-ai-act-specialist、information-security-manager-iso27001、soc2-compliance、gdpr-dsgvo-expert

---

采编自 alirezarezvani/claude-skills（MIT 许可证）。
