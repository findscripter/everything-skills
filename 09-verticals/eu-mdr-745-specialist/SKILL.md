---
name: eu-mdr-745-specialist
title: 欧盟 MDR 2017/745 医疗器械合规
description: 当为进入欧盟市场的医疗器械（含软件 SaMD）做 MDR 2017/745 合规时使用；做器械分类、技术文档、临床证据、上市后监督与 EUDAMED/UDI 注册并产出可提交公告机构的合规材料；不适用于美国 FDA、IVDR 体外诊断或非医疗器械产品。触发词：MDR、附录VIII分类、CER临床评价、PMCF、EUDAMED、UDI
domain: 领域/medical
triggers: [MDR 合规, EU MDR 2017/745, 医疗器械分类, 附录 VIII 分类规则, 技术文档/技术文件, 临床评价 CER, PMCF 上市后临床跟踪, EUDAMED 注册, UDI 唯一器械标识, 公告机构 Notified Body, GSPR 通用安全与性能要求, PSUR/PMS 上市后监督]
tags: [医疗器械, 法规合规, 欧盟 mdr, 质量管理, 临床评价, 上市后监督, udi, eudamed, medical]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [MDR Gap Analyzer (scripts/mdr_gap_analyzer.py)]
requires: []
related: [fda-device-consultant, iso13485-qms-implementer, iso14971-risk-management, eu-ai-act-compliance]
combines_with: [iso13485-qms-implementer, iso14971-risk-management]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当你需要让一款医疗器械（含医疗器械软件 SaMD）满足欧盟 **MDR 2017/745** 要求、进入或维持欧盟市场时使用。覆盖：附录 VIII 器械分类、附录 II/III 技术文档、附录 XIV 临床评价、第七章上市后监督、第 27 条 UDI 与 EUDAMED 注册、公告机构（Notified Body）对接。

**不该用边界（负边界）：**
- 美国 FDA 510(k)/PMA、英国 UKCA、其他法域合规 → 不在本条目范围。
- 体外诊断试剂走 **IVDR 2017/746**，不是 MDR，不要套用本条目的分类规则。
- 非医疗器械（一般健康/健身类、化妆品、药品）不适用。
- 本条目给的是合规框架与产出清单，不替代公告机构的正式审评或法律意见。

## 步骤

按器械生命周期分五条主线推进，每条以「**校验点**」收口。

**1. 器械分类（附录 VIII）**
1. 判定使用时长：暂时（<60 分钟）/ 短期（≤30 天）/ 长期（>30 天）。
2. 判定侵入程度：非侵入 / 经体腔 / 手术侵入 / 植入。
3. 判定接触的身体系统：中枢神经系统、心血管系统、其他。
4. 判定是否有源器械（依赖能量）。
5. 套用规则 1–22。
6. 软件按 **MDCG 2019-11** 算法分类。
7. 记录分类理由（rationale）。
8. **校验点：** 分类结论与公告机构确认一致。

**2. 技术文档（附录 II / III）**
器械描述与变体/附件/预期用途 → 标签与 IFU（第 13 条）→ 设计与制造信息 → **GSPR 通用安全与性能要求**符合性矩阵 → 受益-风险分析 → 验证与确认证据 → 整合风险管理文件（**ISO 14971**）。**校验点：** 技术文件完整性复核通过。

**3. 临床证据（附录 XIV）**
定义临床声称与终点 → 系统性文献检索 → 临床数据质量评价 → 等同性评估（技术/生物/临床三维）→ 识别证据缺口 → 判断是否需要临床试验 → 编制 **CER（临床评价报告）**。**校验点：** CER 经合格评价者审核（医学学位+4 年以上相关临床经验+评价方法学培训）。

**4. 上市后监督（第七章）**
PMS 计划（第 84 条）→ 数据采集方法 → 投诉处理 → 警戒报告流程 → **PSUR** 周期性安全更新 → 整合 **PMCF**（上市后临床跟踪）→ 趋势分析与信号检测。**校验点：** PMS 体系每年审核。

**5. UDI 与 EUDAMED（第 27 条）**
获取发码机构代码（GS1 / HIBCC / ICCBBA）→ 为每个变体分配 **UDI-DI** → 分配 **UDI-PI**（生产标识）→ 标签施加 UDI 载体（AIDC 机读 + HRI 人读）→ EUDAMED 注册主体（Actor）→ 注册器械 → 上传证书。**校验点：** 抽样标签上的 UDI 核验通过。

## 指令

**分类矩阵（速查）**

| 因素 | I 类 | IIa 类 | IIb 类 | III 类 |
|---|---|---|---|---|
| 时长 | 任意 | 短期 | 长期 | 长期 |
| 侵入性 | 非侵入 | 经体腔 | 手术侵入 | 植入 |
| 接触系统 | 任意 | 非关键 | 关键器官 | 中枢神经/心血管 |
| 风险 | 最低 | 低-中 | 中-高 | 最高 |

**软件分类（MDCG 2019-11）**：提供决策信息 + 非严重 → IIa；提供决策信息 + 严重 → IIb；驱动诊疗 + 危急 → III。

**符合性评估路径**：I 类走附录 II 自我声明（无公告机构）；Is/Im 仅无菌/测量方面需公告机构；IIa = 附录 II + IX 或 XI；IIb = 附录 IX + X 或 X + XI（型式检验 + 生产）；III = 附录 IX + X（完整 QMS + 型式检验）。

**严重事件报告时限**：严重公共健康威胁 **2 天**；死亡或健康严重恶化 **10 天**；其他严重事件 **15 天**。

**PSUR 频率**：III 类与 IIb 植入每年；IIb 每 2 年；IIa 必要时。

**工具 — MDR 差距分析器：**
```bash
# 快速差距分析
python scripts/mdr_gap_analyzer.py --device "器械名称" --class IIa

# JSON 输出便于集成
python scripts/mdr_gap_analyzer.py --device "器械名称" --class III --output json

# 交互式评估
python scripts/mdr_gap_analyzer.py --interactive
```
输出：按类别的要求清单、带优先级的差距识别、关键差距高亮、合规路线图建议。

**参考文档（references/）：** `mdr-classification-guide.md`（规则 1–22 全文+MDCG 2019-11+实例）、`clinical-evidence-requirements.md`（临床证据框架+CER 结构+PMCF）、`technical-documentation-templates.md`（附录 II/III 内容+GSPR 矩阵模板+符合性声明 DoC 模板+公告机构提交清单）。

## 示例

**例 1 · 可吸收手术缝线** — 规则 8（植入、长期），时长 >30 天（被吸收），接触一般组织 → **IIb 类**。

**例 2 · AI 诊断软件** — 规则 11 + MDCG 2019-11，诊断严重病症 → **IIb 类**。

**例 3 · 心脏起搏器** — 规则 8（植入），接触中枢循环系统 → **III 类**。

**技术文件结构（附录 II）：** 器械描述与 UDI-DI → 标签与使用说明 → 设计与制造信息 → GSPR 符合性矩阵 → 受益-风险分析 → 验证与确认 → 临床评价报告。

## 注意事项

- **GSPR 是技术文档主干**：安全设计（GSPR 1-3）对应风险管理文件；化学性能（10.1）对应生物相容性报告；感染风险（10.2）对应灭菌确认；软件要求（GSPR 17）对应 **IEC 62304** 文档；标签（GSPR 23）对应标签图样与 IFU。逐条留痕（☐/状态）。
- **临床证据按类递进**：I 类受益-风险分析通常即可；IIa 文献+上市后数据；IIb 系统性文献综述（常需试验）；III 必须有完整临床数据并按 **第 61 条**开展临床试验。
- **公告机构对接前自检**：技术文档完整、GSPR 矩阵全覆盖、风险管理文件最新、CER 完成、**ISO 13485 QMS** 已认证、标签与 IFU 定稿，且内部差距评估完成。选择公告机构看：指定范围是否覆盖你的器械、产能/初审排期、地理覆盖、技术专长、收费透明度。
- **EUDAMED 模块归属**：主体注册（制造商/授权代表）、UDI/器械数据（制造商）、证书（公告机构）、临床试验（申办者）、警戒（制造商）、市场监督（主管当局）——上传方别搞错。
- 法规与 MDCG 指南会更新，提交前务必核对生效版本与公告机构的最新要求。

## 互见

- 风险管理：**ISO 14971** 风险管理文件需贯穿技术文档与受益-风险分析。
- 质量管理体系：**ISO 13485** 是 IIa 及以上符合性评估的前置。
- 软件生命周期：**IEC 62304**（SaMD 必备）+ MDCG 2019-11 软件分类。
- 体外诊断器械请改用对应的 **IVDR 2017/746** 合规条目。

---
*采编自 alirezarezvani/claude-skills（MIT 许可）。适配重写，非逐字翻译。*
