---
name: eu-ai-act-compliance
title: 欧盟 AI 法案合规分级
description: 当对一套 AI 系统做欧盟《AI 法案》（Regulation (EU) 2024/1689）合规分级、规划符合性评估或梳理各角色义务时使用；做风险分级（禁止/高风险/有限/最小）、Art.43 评估路线（模块 A/H）选型与 Annex IV 技术文档清单、按 提供者/部署者/进口商/分销商/授权代表 输出带条款引用的义务矩阵；不适用于是否上线 AI 的高管战略决策，也不替代法律意见；触发词：EU AI Act、欧盟 AI 法案、AI 法案、2024/1689、high-risk AI、高风险 AI、Annex III、conformity assessment、符合性评估、CE marking、GPAI、Article 5、FRIA
domain: 领域/legal
triggers: [EU AI Act, 欧盟 AI 法案, AI 法案, Regulation 2024/1689, high-risk AI, 高风险 AI, 禁止类 AI, Annex III, Annex IV, conformity assessment, 符合性评估, CE marking, CE 标识, notified body, 公告机构, GPAI, 通用目的 AI, Article 5, Article 6, Article 50, Article 43, FRIA, 基本权利影响评估, provider deployer 义务, AI 合规分级]
tags: [legal, compliance, eu-ai-act, regulation, risk-classification, conformity-assessment, gpai, governance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, ai_system_risk_classifier.py, conformity_assessment_planner.py, ai_act_obligation_tracker.py]
requires: []
related: [iso42001-aims-specialist, ai-system-security-audit, regulatory-policy-diff, gdpr-data-handler]
combines_with: [iso42001-aims-specialist, ai-system-security-audit]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
本条用于对 AI 系统执行欧盟《AI 法案》（Regulation (EU) 2024/1689）的可操作合规工作，所有结论均按条款（Article）+ 附件（Annex）给出。

## 何时使用

适用于三类条款级决策：
1. **风险分级**——这套 AI 系统属于哪一档：禁止类（Art. 5）/ 高风险（Art. 6 + Annex III）/ 有限风险透明度（Art. 50）/ 最小风险。
2. **高风险系统的符合性评估路线 + 文档包**——Art. 43 选模块 A（内部控制）还是模块 H（完整 QMS + 公告机构），以及 Annex IV 技术文档要装哪些内容。
3. **按组织角色梳理义务**——提供者 / 部署者 / 进口商 / 分销商 / 授权代表（Art. 16、22、23、24、25、26）各自的义务与截止期。

典型触发：AI 系统准入评审、规划符合性评估、界定部署者义务范围。

**不该用的边界：**
- 不做"要不要上线这个 AI 功能"的高管战略决策与商业风险承担——那是 CAIO 的职责；本条只把"决定要上"落成符合条款的交付物。
- 不替代法律意见。法案是有约束力的法规；新型疑难（是否构成 GPAI？Art. 6(3) 豁免是否适用？微调基础模型是否构成"实质性修改"？）须聘请合格外部法律顾问。
- 不做 GDPR 工作。多数 AI 系统同时触发 GDPR（训练数据、输出处理），DPIA 与合法性基础另见 GDPR 专项条目；两法存在交叉（Recital 10、Art. 10 高风险训练数据）。

## 步骤

### 决策 A：风险分级
判定顺序（工具内置同样顺序）：先查 Art. 5 禁止项 → 再查 Annex III 八大类 → 再套 Art. 6(3) 豁免 → 再查 Art. 50 透明度 → 否则归为最小风险。

- **禁止类（Art. 5）**：社会评分；工作/教育场景情绪识别；潜意识操纵；执法机关在公共空间实时远程生物识别（少数例外）。罚则最高 3500 万欧元 / 全球营业额 7%。
- **Annex III 八大类**（触发即落入 Art. 6(2)）：生物识别、关键基础设施、教育、就业、基本公共服务、执法、移民、司法。
- **Art. 6(3) 豁免**：Annex III 系统若仅 (a) 执行狭窄程序性任务、(b) 改进既有人工成果、(c) 检测决策模式但不替代人工判断、(d) 执行准备性任务，则**不**算高风险。**但**对自然人的画像（profiling）始终为高风险，豁免无效。

### 决策 B：符合性评估 + Annex IV 技术文档
高风险系统在投放市场前须证明符合性（Art. 43 + Annex VI/VII），两条路线：
- **模块 A——内部控制（Annex VI）**：提供者自评，已落实统一标准的多数 Annex III 系统适用。
- **模块 H——完整质量管理体系 + 技术文档（Annex VII）**：须公告机构介入；生物识别系统强制（Art. 43(1)）。

**Annex IV 技术文档八项必备：** ①系统总体描述（预期用途、标识、版本）②系统要素详述（架构、训练数据、验证程序）③监测/运行/控制信息 ④风险管理体系描述（Art. 9）⑤投放后变更说明 ⑥所用统一标准清单（或替代方案）⑦欧盟符合性声明（Art. 47）⑧投放后监测体系描述（Art. 72）。

### 决策 C：按角色义务追踪
单一公司可同时扮演多个角色。

| 角色 | 主要条款 | 关键义务 |
|---|---|---|
| 提供者 Art. 3(3) | 8–17、47、49、72 | 符合性评估；CE 标识；风险管理；数据治理；技术文档；投放后监测；严重事件报告（Art. 73） |
| 部署者 Art. 3(4) | 26 | 按说明使用；人工监督；输入数据质量；记录留存（Art. 19）；告知员工（Art. 26(7)）；公共部门/基本服务须做 FRIA（Art. 27） |
| 进口商 Art. 3(6) | 23 | 核验符合性、CE 标识、技术文档可得性 |
| 分销商 Art. 3(7) | 24 | 投放前核验 CE 标识 + 文档 |
| 授权代表 Art. 22 | 22 | 非欧盟提供者须指定，代表对提供者义务负责 |

**关键（Art. 25）：** 部署者若对高风险系统作实质性修改，或以自己名义投放市场，即转为**提供者**并继承提供者全部义务。

**GPAI 独立赛道（Art. 51–55）：** 训练算力超过 10²⁵ FLOPs 触发 Art. 51 系统性风险，规则更严，须单独评估。

## 指令

三个脚本均支持"空跑用内置样例 / 传 JSON 跑实际数据"：

```bash
# 决策 A：按法案分级 AI 系统
python scripts/ai_system_risk_classifier.py                    # 内置 5 系统样例
python scripts/ai_system_risk_classifier.py path/to/systems.json

# 决策 B：为高风险系统生成符合性评估计划 + Annex IV 清单
python scripts/conformity_assessment_planner.py                # 内置高风险样例
python scripts/conformity_assessment_planner.py path/to/system.json

# 决策 C：按角色生成按截止期排序的义务矩阵
python scripts/ai_act_obligation_tracker.py                    # 内置样例（提供者 + 部署者）
python scripts/ai_act_obligation_tracker.py path/to/roles.json
```

**输出格式（每次产出固定结构，禁止脱离条款引用作答）：**
```
结论一句话：[分级 + 最重大义务]
条款引用：[Article + 段号；不得在无引用下转述]
本次决策：[分级 | 评估路线 | 义务范围 三选一]
依据：[Article + Annex 引用；分级置信度]
行动建议：[3 条具体下一步，含负责人 + 对齐法案分阶段生效的截止期]
留待人工裁断：[合规官/法律顾问拍板项——分级争议、新型疑难、GPAI 阈值判定]
```

## 示例

**AI 系统准入评审（单系统，约 2 小时）：**
```bash
# 1. 记录系统特征：用途、用户、数据、自主性、部署环境
# 2. 跑分级器
python scripts/ai_system_risk_classifier.py systems.json
# 3. 若高风险：跑评估计划器
python scripts/conformity_assessment_planner.py system.json
# 4. 厘清所扮演角色（提供者 / 部署者 / 两者）
python scripts/ai_act_obligation_tracker.py roles.json
# 5. 若涉个人数据，交叉核对 GDPR DPIA
# 6. 若已建 ISO 42001，交叉核对 AIMS 证据
# 7. 产出：分级备忘 + 符合性计划 + 义务清单
```

**Annex IV 技术文档构建（单高风险系统，2–4 周）：** 跑评估计划器拿清单 → 汇总系统描述/架构/训练数据/验证/风险管理 → 复用 ISO 42001、ISO 27001 已有证据满足对应项 → 跑 Art. 9 风险管理生命周期 → 评估通过后再签 Art. 47 符合性声明 → 加贴 CE 标识（Art. 48） → 在欧盟数据库登记（Art. 71，Annex III 高风险系统）。

**上线前义务审计：** 复核分级是否仍准确 → 确认高风险系统已完成符合性评估 → 确认 Art. 50 透明度要求（聊天机器人、深度伪造、情绪识别） → 确认 Art. 72 投放后监测已运行 → 确认 Art. 73 严重事件报告流程已成文 → 部署者确认 FRIA（Art. 27）已做、员工已告知（Art. 26(7)） → GPAI 确认 Art. 51–55 义务已满足。

## 注意事项

- **逢输出必引条款**：每条结论都要带 Article + 段号 / Annex，不要在无引用的情况下转述法条。
- **分级是单选**：法案采风险导向（Recital 26），每个系统恰好落入四档之一。
- **画像永远高风险**：涉及对自然人画像的，Art. 6(3) 豁免一律不适用。
- **角色会升级**：部署者实质性修改或贴牌投放即变提供者（Art. 25），义务陡增。
- **分阶段生效**：截止期随 Title III 分期推进（2025 → 2026 → 2027），Art. 5 禁止清单可经授权法案扩充；年度刷新时须为每个系统重跑分级器与义务追踪器。
- **新型疑难交律师**：GPAI 判定、6(3) 豁免适用性、"实质性修改"界定等留待合格外部法律顾问。

## 互见

- GDPR DPIA + 合法性基础（多数 AI 系统同时触发 GDPR）。
- ISO 42001 AIMS（自愿性管理体系，可满足提供者 Art. 17 QMS 的部分要求）。
- ISO 27001（满足 Art. 15 网络安全要求）。
- ISO 14971 风险管理（Art. 6(1) 安全部件 AI 引用）。
- MDR 2017/745（医疗器械 AI 交叉）。
- 高管 AI 战略（chief-ai-officer-advisor，决定是否上线，与本条互补）。

---
本条采编自 alirezarezvani/claude-skills（MIT）。
