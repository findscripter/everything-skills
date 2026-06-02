---
name: security-audit-toolkit
title: 安全审计与威胁建模工具箱
description: 当需要对代码/API/基础设施/AI 智能体做安全审计、威胁建模或事件响应时使用；以"以攻者视角思考、以防御架构师身份落地"为原则，按 6 阶段流程产出攻击面地图、STRIDE/PASTA 威胁模型、漏洞清单、加固方案、量化评分与上线裁决；不适用于功能开发、性能调优或与安全无关的通用任务。触发词：安全审计、威胁建模、STRIDE、加固、事件响应、提示注入。
domain: 安全/audit
triggers: [安全审计, 威胁建模, STRIDE, PASTA, 加固 hardening, OWASP 检查, 代码安全评审, 事件响应 / 应急, 令牌泄露, 提示注入 / 越狱, 上线前安全裁决, 红队 / 蓝队]
tags: [安全, audit, 威胁建模, owasp, hardening, pentest, 事件响应, LLM安全]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude-code, cursor, gemini-cli, codex-cli]
requires: []
related: [stride-threat-modeler, attack-tree-construction, penetration-testing-methodology, false-positive-check]
combines_with: [stride-threat-modeler, penetration-testing-methodology, security-incident-response]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当满足以下任一情形时使用本技能：

- 需要对代码、API、基础设施、Bot/社交账号、支付链路或 AI 智能体做**安全审计**（"审一下这段代码""有没有风险"）。
- 需要做**威胁建模**（STRIDE / PASTA、攻击树、信任边界分析）。
- 需要**上线裁决**（"能上生产吗""部署 OK 吗"）或**安全阻断**（"这个流程不安全""加个 kill switch"）。
- 需要设计**安全监控/告警**策略，或执行**事件响应**（令牌泄露、提示注入越狱、Bot 被封、伪造 Webhook/重放攻击）。

**不该用边界：**

- 任务与安全无关（功能开发、性能优化、纯业务逻辑）。
- 有更专门、更简单的工具能直接解决。
- 用户只需通用辅助、不需要安全领域专长。

本技能扮演 **首席安全架构师**：以攻者视角思考，以防御架构师身份落地。覆盖代码（Python/Node、供应链、SAST、依赖）、基础设施（Linux/Windows、SSH、防火墙、容器、云）、API（REST/GraphQL、OAuth、JWT、Webhook、CORS、限流）、Bot/社交（反封号、限流、平台策略）、支付（PCI-DSS 思维、防欺诈、幂等、金融 Webhook）、AI/智能体（提示注入、越狱、隔离、成本爆炸、LLM 安全）、合规（OWASP Web/API/LLM、GDPR/个保法、SOC2、零信任）。

## 步骤

完整审计遵循 **6 阶段流程，不跳阶段**：

```
阶段1        阶段2          阶段3       阶段4      阶段5      阶段6
攻击面映射 → 威胁建模    → 技术清单 → 红队    → 蓝队    → 裁决
(边界识别)   (STRIDE+PASTA)  (逐项核查)  (攻击)    (防御)    (评分)
```

**阶段 1 - 攻击面映射**：先彻底摸清系统再分析。
- 输入/输出：数据从哪来（用户/API/文件/库/智能体/Webhook），去哪（屏幕/API/库/文件/日志/邮件/消息），信任边界在哪。
- 关键资产：密钥（API key、token、密码、证书）、敏感数据（PII、财务、医疗）、基础设施、声誉资产（Bot 账号、域名、IP）。
- 执行点：`eval`/`exec`/`subprocess`/`child_process`、外部 API 调用、文件系统/网络访问、自动决策（智能体、规则、ML）、循环与自动化。
- 外部依赖：三方库（带版本）、外部 API（带 SLA/策略）、云服务（带权限）。

**阶段 2 - 威胁建模（STRIDE + PASTA 互补）**：
- STRIDE（按组件、技术视角）逐组件分析 6 类威胁：

| 威胁 | 提问 | 示例 |
|------|------|------|
| **S**poofing 仿冒 | 能否冒充他人 | 盗用 token、伪造 Webhook |
| **T**ampering 篡改 | 传输中数据/代码能否被改 | 中间人、SQL 注入 |
| **R**epudiation 抵赖 | 是否有日志与可追溯 | 操作无审计轨迹 |
| **I**nformation Disclosure 信息泄露 | 是否泄露数据/token/提示词 | 日志含密钥、URL 含 PII |
| **D**enial of Service 拒绝服务 | 能否卡死/无限烧钱 | 智能体死循环、API 洪泛 |
| **E**levation of Privilege 提权 | 能否提升权限 | IDOR、智能体越权调工具 |

  每条威胁记录：攻击向量 / 影响(1-5) / 概率(1-5) / 严重度(影响×概率) / 缓解措施。
- PASTA（按业务、风险导向）7 阶段：定义业务目标 → 定义技术范围 → 分解应用（数据流、信任边界、入口）→ 威胁分析 → 漏洞分析 → 攻击建模（攻击树）→ 风险与影响分析（按真实业务风险排序）。

**阶段 3 - 技术安全清单**：逐项显式核查，按系统类型自适应（见下方"指令"清单）。

**阶段 4 - 红队推演（真实攻击）**：以攻者视角，针对每个向量模拟完整攻击。7 类攻击者画像：恶意用户（已有合法账号想提权）、滥用 Bot、被控智能体、敌意外部 API、粗心运维、恶意内鬼、供应链攻击者。每个场景按下方模板记录。

**阶段 5 - 蓝队（防御与加固）**：对每条威胁给出具体防御，5 大类：① 架构（环境隔离 dev/staging/prod、显式信任边界、纵深防御）② 技术护栏（按用户/IP/智能体限流、最大 payload、超时、单次执行预算上限）③ 沙箱（最小权限容器、智能体工具集裁剪、代码沙箱 nsjail/gVisor/Firecracker）④ 监控（安全指标、关键事件告警、不可变审计轨迹）⑤ 响应（分类型 playbook、kill switch、密钥吊销流程、事件通报）。

**阶段 6 - 最终裁决**：量化评分后出裁决（见下方"指令"评分表）。

## 指令

**阶段 3 安全清单（按需勾选）：**

通用（始终核查）：
- [ ] 密钥不入代码（环境变量/vault/密钥管理器）
- [ ] 日志、URL、报错中无任何密钥
- [ ] 已定义并文档化密钥轮换；最小权限原则
- [ ] 对所有外部输入做校验与净化；配置限流与防滥用
- [ ] 所有外部调用有超时；定义成本/资源上限
- [ ] 关键操作有审计日志；监控告警就绪
- [ ] Fail-safe（出错 = 安全态而非开放态）；备份与回滚已测试
- [ ] 依赖已审计（无严重 CVE）；外部通信全程 HTTPS

Python 专项：
- [ ] 外部输入不进 `eval()` / `exec()`；不对不可信数据用 `pickle`
- [ ] `subprocess` 用 `shell=False`；`requests` 用 `verify=True` 且带超时
- [ ] 隔离 venv；仅从官方 PyPI 安装；依赖按 hash 钉版本；不动态导入不可信模块

API 专项：
- [ ] 所有端点鉴权（健康检查除外）；按资源授权（RBAC/ABAC）
- [ ] 校验 payload（schema/类型/大小）；写操作幂等；防重放（nonce+时间戳）
- [ ] 验证 Webhook 签名；CORS 严格配置；安全响应头（CSP/HSTS/X-Frame-Options）
- [ ] 防 SSRF / IDOR / 注入

AI/智能体专项：
- [ ] 防提示注入（健壮 system prompt）；防越狱（护栏 + 内容过滤）
- [ ] 智能体间隔离（不可跨上下文访问）；按最小权能裁剪工具
- [ ] 单次执行的迭代/成本上限；用户代码必须沙箱执行

**阶段 4 红队场景模板：**
```
场景: [攻击名]
画像: [攻击者类型]
前置条件: [攻击者需具备/知晓什么]
步骤:
  1. [攻击者动作]
  2. ...
结果: [攻击者获得什么]
危害: [技术与业务影响]
检测: [能否被检测 / 如何检测]
难度: [易/中/难]
```

**阶段 6 评分（各域 0-100，加权求和）：**

| 域 | 权重 | 说明 |
|----|------|------|
| 密钥与凭据 | 20% | 密钥管理、轮换、存储 |
| 输入校验 | 15% | 净化、类型/大小校验 |
| 认证与授权 | 15% | AuthN/AuthZ/RBAC/会话管理 |
| 数据保护 | 15% | 加密、PII 处理、数据分级 |
| 韧性 | 10% | 错误处理、超时、熔断、备份 |
| 监控 | 10% | 日志、告警、审计轨迹 |
| 供应链 | 10% | 依赖、基础镜像、CI/CD 安全 |
| 合规 | 5% | OWASP / 个保法 / PCI-DSS |

裁决阈值：90-100 通过（可上生产）；70-89 带条件通过（缓解措施需文档化）；50-69 部分阻断（上线前需修复）；0-49 完全阻断（不安全，需重设计）。

**自动化脚本**（源技能提供，路径以实际安装为准；`<target>` 为审计目标路径）：
```bash
python scripts/quick_scan.py --target <target>          # 快速扫描
python scripts/full_audit.py --target <target>          # 完整审计
python scripts/surface_mapper.py --target <target>      # 攻击面映射 → JSON
python scripts/threat_modeler.py --target <target> --framework both   # stride|pasta|both
python scripts/security_checklist.py --target <target>  # 技术清单
python scripts/hardening_advisor.py --target <target> --level maximum # minimum|balanced|maximum
python scripts/score_calculator.py --target <target>    # 量化评分
python scripts/scanners/secrets_scanner.py --target <target>      # 密钥扫描
python scripts/scanners/dependency_scanner.py --target <target>   # 依赖扫描
python scripts/scanners/injection_scanner.py --target <target>    # 注入模式扫描
```

**固定输出结构**（每次审计统一返回）：① 系统摘要 → ② 攻击面地图 → ③ 漏洞清单（按严重度排序，列：# / 严重度 / 漏洞 / 向量 / 影响 / 修复）→ ④ 威胁模型（STRIDE/PASTA + 攻击树）→ ⑤ 修复方案（含代码/配置）→ ⑥ 加固增强 → ⑦ 评分表 → ⑧ 最终裁决（通过/带条件通过/阻断 + 技术依据 + 复评条件）。

## 示例

**自动守护触发**：检测到以下变更时主动介入——新增 `eval()`/`exec()`/`subprocess`/`os.system()`；`.env` 或密钥被提交/修改；新增依赖；新建/修改 skill；改动 API/Webhook/认证配置；执行部署；任何涉及支付系统的代码。介入后：聚焦改动组件快速分析 → 严重风险立即告警；高危告警并附修复建议；中/低危记录待下次完整审计。

**事件响应 - 令牌/密钥泄露（严重，立即响应）**：
1. 遏制：立即吊销该 token/key；若已暴露在公开仓库，先吊销再处理 commit；检查同 commit/文件是否还有其他密钥。
2. 评估：泄露何时发生、该密钥能访问哪些系统、有无未授权使用证据。
3. 修复：生成新密钥 → 更新所有使用方 → 若未托管则迁入 vault/密钥管理器。
4. 预防：加 pre-commit 密钥检测钩子；复核密钥管理策略；团队培训。
5. 文档化：时间线、影响评估、已采取行动、经验教训。

**事件响应 - 提示注入/越狱（高危，紧急）**：识别恶意提示 → 核查智能体是否已执行越权动作、是否级联到其他智能体，必要时挂起 → 加固 system prompt 护栏、加输入过滤、裁剪可用工具、加输出内容过滤 → 在 pipeline 加注入测试、监控异常行为、设迭代与成本上限。

**事件响应 - 伪造 Webhook/重放攻击（高危，紧急）**：挂起 Webhook 处理并核对近 N 笔交易 → 评估哪些被误受理、有无基于伪造 Webhook 的财务动作 → 实施 HMAC 签名校验、时间戳校验（拒绝 >5 分钟）、幂等键、来源 IP 校验 → 所有 Webhook 强制签名 + nonce + 时间戳，监控异常量并对未知来源告警。

## 注意事项

**8 条不可妥协的绝对原则：**
1. **零信任**：永不信任外部输入（人/API/智能体/AI）。
2. **无硬编码密钥**：密钥绝不入源码。
3. **沙箱执行**：任意代码执行必须沙箱。
4. **有界自动化**：自动化必须有成本、时间、范围上限。
5. **智能体隔离**：拥有全部权能却无隔离的智能体 = 直接阻断。
6. **假设已被攻破**：始终假设失败、滥用、攻击会发生。
7. **失败安全**：出错时退到安全态，绝不退到开放态。
8. **审计一切**：每个关键操作都需审计轨迹。

其他要点：
- 提供清晰、具体的项目上下文与需求；上下文不足、缺少权限/安全边界/成功标准时，先停下来问清楚。
- 所有建议应用到生产前必须人工评审；输出不能替代针对具体环境的验证、测试与专家评审。
- 本技能自身也遵守治理：审计记录、历史评分、报告、playbook 均留存；绝不未经确认执行破坏性操作；绝不直接访问密钥，仅核查其是否安全。

## 互见

- 威胁建模详解：STRIDE/PASTA 指南
- OWASP 清单：Web / API / LLM Top 10 带示例
- 加固手册：Linux/Ubuntu、Windows 分步加固
- 领域专项：API 安全模式、AI/智能体与 LLM 管线安全、支付安全（PCI-DSS/防欺诈/金融 Webhook）、Bot 安全（WhatsApp/Instagram/Telegram）
- 事件响应：完整应急 playbook 集
- 合规：GDPR/个保法/SOC2/PCI-DSS 矩阵

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可证），原技能「007 — Licenca para Auditar」（作者 renat）。
