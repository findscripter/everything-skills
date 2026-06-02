---
name: stride-threat-modeler
title: STRIDE威胁建模
description: 当对系统/架构/数据流做威胁建模、安全评审或合规审计时使用；按 STRIDE 六类系统化枚举威胁并产出威胁模型文档（资产、信任边界、威胁矩阵、风险评分、缓解措施）；不适用于扫第三方依赖 CVE（用 dependency-auditor）或审自有代码逻辑漏洞（用 code-reviewer）；触发词：STRIDE、威胁建模、threat modeling、安全建模、攻击面分析、信任边界、DFD 数据流图、安全评审。
domain: 安全/audit
triggers: [STRIDE, 威胁建模, threat modeling, 安全建模, 攻击面分析, 信任边界, DFD 数据流图, 安全评审]
tags: [security, audit, threat-modeling, stride]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python]
requires: []
related: [attack-tree-construction, security-audit-toolkit, ai-system-security-audit, false-positive-check]
combines_with: [attack-tree-construction, security-audit-toolkit, dependency-auditor]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 对系统/服务/架构做安全设计评审或威胁建模会议，需要系统化、无遗漏地枚举攻击面时使用。
- 评估既有架构的安全决策、绘制数据流图（DFD）识别信任边界跨越点、为合规/审计准备威胁文档时使用。
- 目标产物：一份结构化威胁模型（资产清单、信任边界、按 STRIDE 分类的威胁矩阵、风险评分排序、对应缓解措施）。

**不该用**：
- 扫第三方依赖的已知漏洞（CVE）、许可证与供应链风险 → 用 `dependency-auditor`。
- 审查自有代码的具体逻辑漏洞（注入实现、鉴权代码缺陷）→ 用 `code-reviewer`。
- 渗透测试、运行时入侵检测、密钥泄露扫描 → 超出范围；STRIDE 是设计期/评审期的威胁枚举方法，不替代动态测试。

## STRIDE 六类（核心速查）

每一类对应一种被破坏的安全属性与控制族，逐类提问才不会漏：

| 类别 | 提问 | 被破坏属性 | 控制族 |
| --- | --- | --- | --- |
| S 假冒 Spoofing | 攻击者能冒充他人/他系统吗？ | 真实性 | 身份认证 |
| T 篡改 Tampering | 能修改传输中/存储中的数据吗？ | 完整性 | 完整性校验 |
| R 抵赖 Repudiation | 能否抵赖自己做过的操作？ | 不可否认 | 日志/审计 |
| I 信息泄露 Information Disclosure | 能访问到未授权数据吗？ | 机密性 | 加密 |
| D 拒绝服务 Denial of Service | 能破坏可用性吗？ | 可用性 | 限流/扩容 |
| E 权限提升 Elevation of Privilege | 能获得更高权限吗？ | 授权 | 访问控制 |

## 步骤 / 指令

1. **画系统与数据流图（DFD）**：标出四类元素——外部实体（external entity）、处理过程（process）、数据存储（data store）、数据流（data flow），并标注每条流的协议与是否加密。
2. **标信任边界**：典型边界为 外网→DMZ、DMZ→内网、应用→数据库。重点关注跨边界的数据流，尤其**跨边界且未加密**的流。
3. **列资产并定敏感度**：如用户凭据/PII（高）、会话数据（中）、配置与密钥（高）、日志（中），明确数据分类。
4. **按元素类型套用 STRIDE**：不同元素适用的威胁类别不同——外部实体只看 S、R；处理过程六类全看（S/T/R/I/D/E）；数据存储看 T/R/I/D；数据流看 T/I/D。逐元素（或逐交互）提问。
5. **逐类提问枚举威胁**：对每个组件按六类各问 3~4 个问题（见示例问卷），不跳过任何一类——每类揭示不同威胁。
6. **评风险并排序**：风险分 = 影响(1~4) × 可能性(1~4)。分级：≥12 严重、≥6 高、≥3 中、其余低。仅列前若干高风险项作为处置重点。
7. **给缓解并跟踪状态**：每条威胁配缓解措施与状态（open/mitigated）。不要止于「发现」，必须跟到处置。
8. **输出文档**：结构为 系统概述与 DFD → 信任边界 → 资产 → 六类威胁矩阵（ID/威胁/目标/影响/可能性）→ 风险排序 → 分阶段建议（立即/30 天/90 天）。威胁模型是活文档，需随架构演进定期更新。

## 示例

风险评分与威胁分级（Python，照搬源约束）：

```python
from enum import Enum

class StrideCategory(Enum):
    SPOOFING = "S"; TAMPERING = "T"; REPUDIATION = "R"
    INFORMATION_DISCLOSURE = "I"; DENIAL_OF_SERVICE = "D"; ELEVATION_OF_PRIVILEGE = "E"

# 风险分 = 影响 × 可能性（各 1~4）
def risk_level(impact: int, likelihood: int) -> str:
    score = impact * likelihood
    if score >= 12: return "Critical"
    if score >= 6:  return "High"
    if score >= 3:  return "Medium"
    return "Low"
```

按元素类型映射适用威胁（DFD 分析）：

```python
threat_mapping = {
    "external": ["S", "R"],
    "process":  ["S", "T", "R", "I", "D", "E"],
    "datastore":["T", "R", "I", "D"],
    "dataflow": ["T", "I", "D"],
}
# 重点：找出跨信任边界且未加密的数据流 —— 高优先级 I/T 威胁
```

逐组件 STRIDE 问卷（节选，每类 3~4 问）：

```
S 假冒：能否冒充合法用户？认证令牌是否被正确校验？会话 ID 可被预测/窃取吗？是否有 MFA？
T 篡改：传输中能否被改？静态能否被改？输入校验是否充分？应用逻辑能被操纵吗？
R 抵赖：所有安全相关操作都记日志了吗？日志可被篡改吗？归属是否充分？时间戳可靠同步吗？
I 泄露：静态/传输是否加密？错误信息会泄露敏感信息吗？访问控制是否落实？
D 拒服：是否限流？恶意输入能否耗尽资源？有无放大攻击防护？有无单点故障？
E 提权：授权检查是否一致？能访问他人资源吗（IDOR）？参数操纵能否提权？是否最小权限？
```

威胁矩阵片段（最小格式）：

```
| ID | 威胁          | 目标         | 影响     | 可能性 |
|----|---------------|--------------|----------|--------|
| T1 | SQL 注入      | 数据库查询   | Critical | Medium | → 风险 12 严重：参数化查询 + 输入校验
| E1 | IDOR          | 用户资源     | High     | High   | → 风险  9 高：服务端授权校验
| S3 | 撞库          | 登录端点     | High     | High   | → 风险  9 高：MFA + 账户锁定
```

## 注意事项

- **不要跳过任何一类**：六类各对应不同安全属性，遗漏一类即遗漏一类攻击面；每个组件都逐类过一遍。
- **质疑每个组件**：不要默认任何组件安全；可视化的 DFD 帮助发现被忽视的信任边界跨越点。
- **协作而非闭门**：拉上安全、研发、运维三方视角共同建模，单人建模易盲区。
- **现实地排优先级**：聚焦高影响威胁，但低概率 × 高影响项不可忽视。
- **缓解措施按生命周期落地**：常见缓解——S：MFA/安全会话/密码学令牌；T：参数化查询/HMAC/CSP；R：防篡改集中审计日志/数字签名；I：传输与静态加密/最小化错误信息；D：限流/自动扩容/熔断/配额；E：RBAC/最小权限/服务端权限校验。
- **活文档**：架构变更后须更新威胁模型，否则评分与缓解会过期失效。

## 互见
- related：`dependency-auditor` —— STRIDE 看系统设计层的威胁面，依赖审计看第三方包层的已知漏洞，二者在安全/审计维度互补。
- related：`code-reviewer` —— STRIDE 在设计/评审期枚举威胁，code-reviewer 在实现期找具体代码缺陷，前者定方向后者落实现。

---
*本条采编自 wshobson/agents（MIT）。*
