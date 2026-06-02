---
name: attack-tree-construction
title: 攻击树构建与威胁路径可视化
description: 当需要系统化建模攻击场景、识别防御缺口、向干系人传达安全风险时使用；做的事是以根目标为顶、AND/OR 分解子目标、为叶子标注成本/技能/耗时/被检出概率，并产出攻击树（Mermaid/PlantUML 图）、最易/最省/最隐蔽路径分析与按覆盖率排序的缓解措施清单；不适用于无授权或未定范围的建模、不含攻击路径建模的泛化风险评审、与安全评估无关的需求。触发词：攻击树、威胁路径、AND/OR 分解、缓解优先级、攻击场景可视化
domain: 安全/audit
triggers: [攻击树, attack tree, 威胁路径, threat path, 攻击场景建模, AND/OR 分解, 防御缺口, 缓解措施优先级, 攻击路径可视化, 红队评估范围, Mermaid 攻击树, PlantUML 思维导图攻击树]
tags: [安全, audit, 威胁建模, 攻击树, 风险评估, 防御规划, 可视化, 红队]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Bash]
requires: []
related: [stride-threat-modeler, security-audit-toolkit, penetration-testing-methodology, ai-system-security-audit]
combines_with: [stride-threat-modeler, security-audit-toolkit, penetration-testing-methodology]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

仅限授权用途：本技能只用于已获授权的安全评估、防御验证或受控的教学环境。

适用：
- 需要把复杂攻击场景结构化、可视化（根目标 -> 子目标 -> 原子攻击步骤）。
- 识别防御缺口与优先级，规划防御投入或确定测试范围。
- 向干系人（管理层、红蓝队）传达安全风险与攻击路径。

不该用（负边界）：
- 缺乏授权或未定义建模范围时，先停下来索要授权与范围，不要建模。
- 任务是泛化风险评审、不涉及攻击路径建模时。
- 需求与安全评估或安全设计无关时。

## 步骤

1. 定根：确认评估范围、目标资产与攻击者目标，将其作为根节点（默认按 OR 处理）。
2. 分解：把根目标拆成子目标，明确每层是 AND（所有子节点都必须达成）还是 OR（任一子节点达成即可）。
3. 标注叶子：每个原子攻击步骤标注四属性 —— 成本（$/$$/$$$）、所需技能（低/中/高）、耗时（小时/天/周）、被检出概率（低/中/高）。
4. 映射缓解：为每条分支挂载缓解措施，标出最易/最省/最隐蔽路径与无缓解的叶子。
5. 出图与定优先级：导出 Mermaid 或 PlantUML 图，按"阻断路径数/覆盖率"对缓解措施排序，优先处理高影响路径。
6. 复杂模板/代码：需要完整数据模型、构建器、导出器与路径分析器时，参见源仓库 resources/implementation-playbook.md。

## 指令

- 节点类型：OR（椭圆，任一子节点达成目标）/ AND（矩形，所有子节点都需达成）/ Leaf（方框，原子攻击步骤）。
- 路径聚合规则（用于估算）：OR 节点取子节点的最小值（难度/成本取 min）；AND 节点难度取 max、成本取 sum。
- 最小可执行做法：先用纯文本树或 Mermaid 画出结构，再补属性与缓解，避免一次到位导致遗漏。
- Mermaid 形状约定：OR 用 `N0((名称))`，AND 用 `N1[名称]`，Leaf 用 `N2[/名称/]`；按难度着色（trivial 红、expert 蓝）直观暴露最易攻击点。
- PlantUML 用 `@startmindmap ... @endmindmap`，节点前缀标 `[OR]` / `[AND]` / `<<难度>>`。
- 关键约束（务必遵守）：
  - 攻击树只与已授权干系人共享。
  - 非必要不写入敏感的漏洞利用细节。
  - 不要把输出当作环境特定验证、测试或专家评审的替代品。
  - 缺少必要输入、权限、安全边界或成功标准时，停下并澄清。

## 示例

以"账户接管（Account Takeover）"为例，根目标 G1 = 取得用户账户的未授权访问，三条 OR 子目标：

```
G1 取得账户控制权 (OR)
├─ S1 窃取凭据 (OR)
│   ├─ A1 钓鱼          难度低/成本低/检出中   缓解: 安全意识培训, 邮件过滤
│   ├─ A2 撞库          难度极低/成本低/检出高 缓解: 限速, MFA, 泄露口令监测
│   └─ A3 键盘记录木马  难度中/成本中/检出中   缓解: 终端防护, MFA
├─ S2 绕过认证 (OR)
│   ├─ A4 会话劫持      难度中/成本低/检出低   缓解: 安全会话管理, 全站 HTTPS
│   └─ A5 认证绕过漏洞  难度高/成本低/检出低   缓解: 安全测试, 代码审计, WAF
└─ S3 社会工程 (OR)
    └─ S3.1 账户找回攻击 (AND ← 两步都需完成)
        ├─ A6 收集个人信息   难度低/成本免费/检出无
        └─ A7 致电支持台     难度中/成本免费/检出中 缓解: 支持台核验流程, 安全问题
```

读法：S3.1 是 AND，A6 与 A7 都完成才达成；其余为 OR，任一叶子得手即达成父目标。撞库（A2）难度极低，是最易路径，应优先落实限速 + MFA。源仓库提供可直接运行的 Python 数据模型与构建器（`AttackTreeBuilder().goal(...).or_node(...).attack(...).end().build()`）以及 Mermaid/PlantUML 导出器、`AttackPathAnalyzer`（`find_easiest_path` / `coverage_analysis` / `prioritize_mitigations`），可一键算路径指标与缓解优先级。

## 注意事项

- 该做：先定清晰目标；尽量穷举攻击向量；为每个叶子标全属性；定期更新（新威胁不断出现）；让红队/专家评审。
- 不该做：过度简化（真实攻击是复杂的）；忽略 AND 依赖；遗漏内部威胁（攻击者不全是外部）；跳过缓解（树的目的就是防御规划）；让树变成静态文档（威胁态势会演化）。
- 共享与脱敏：图与报告只发给授权干系人，必要时对利用细节脱敏。
- 参考资料：Bruce Schneier 的 Attack Trees、MITRE ATT&CK、OWASP Attack Surface Analysis Cheat Sheet。

## 互见

- 同 domain（安全/audit）下的威胁建模、漏洞评估、红队范围界定类技能可与本技能串联：先用本技能产出攻击树与路径优先级，再下钻具体测试或缓解落地。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
