---
name: security-incident-response
title: 安全事件分级与响应
description: 当已检测/声明一起安全事件、需要分级与响应处置时使用；做事件分类、SEV1–SEV4 定级、误报过滤、升级路由、易失证据取证与监管通报时限判定，产出可执行的处置流程与证据链记录；不适用于事前威胁狩猎或事后合规映射；触发词：安全事件、事件响应、incident response、分级定级、SEV、误报过滤、取证、证据链、升级路由、监管通报、勒索软件、数据外泄
domain: 安全/ops
triggers: [安全事件, 事件响应, incident response, 分级定级, SEV, 误报过滤, 取证, 证据链, 升级路由, 监管通报, 勒索软件, 数据外泄]
tags: [security, incident-response, ops, forensics, triage, severity, nist-800-61, compliance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, jq, Volatility, FTK Imager, dd, netstat, ps, AWS CloudTrail, SIEM, EDR]
requires: []
related: [threat-detection-hunting, wireshark-traffic-analysis, yara-rule-authoring, security-audit-toolkit]
combines_with: [threat-detection-hunting, wireshark-traffic-analysis, incident-commander-framework]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 已检测或已声明一起安全事件，需要把原始告警/事件分类成具体事件类型、给出 SEV1–SEV4 定级、过滤误报、确定升级路径，并启动易失证据取证。
- 输入来源：SIEM 告警、EDR 检测、威胁情报命中、用户上报。先有事件 payload，再做 triage。
- 桌面演练（tabletop）时强制指定某一 SEV 级别做流程演练。

不该用边界：
- 不做事前威胁狩猎（在告警触发前找威胁，属 threat-detection 范畴）。
- 不做事后合规映射 / 控制项对账（属 governance/compliance-mapping）。
- 不替代云安全态势评估（IAM/S3/网络配置错误属 cloud-security 的预防性工作）。
- 本条聚焦“对已声明事件的分类、定级、升级、取证”，不覆盖红队攻击模拟。

## 步骤

1. 摄取事件：构造 JSON payload（含 event_type、host、user、source_ip、timestamp、raw_payload）。
2. 分类：将事件归入 14 类事件类型之一，得到默认 SEV、MITRE 技术映射与响应 SLA。
3. 误报过滤：升级前先跑五类误报过滤器（CI/CD 代理、测试环境标签、定时任务、白名单身份、扫描器活动），确认误报则抑制升级并记录原因留审计。
4. 定级与重定级：按 SEV 矩阵打分；命中“升级触发器”则自动重定为更高级别（见下表）。
5. 升级路由：按 SEV 和事件类型确定立即联系人、桥接会议与外部通报。
6. 取证：按 DFRWS 六阶段、易失优先原则采集证据，全程维护证据链（SHA-256、UTC 时间戳、工具来源、调查人、转移记录）。
7. 监管通报：通报时钟从“事件声明/发现”起算，不是从调查结束起算；按适用框架的最严时限上报。

### 事件分类与默认 SEV（节选 14 类）

| 事件类型 | 默认 SEV | MITRE | 响应 SLA |
|---|---|---|---|
| ransomware 勒索软件 | SEV1 | T1486 | 15 分钟 |
| data_exfiltration 数据外泄 | SEV1 | T1048 | 15 分钟 |
| apt_intrusion APT 入侵 | SEV1 | T1566 | 15 分钟 |
| supply_chain_compromise 供应链 | SEV1 | T1195 | 15 分钟 |
| domain_controller_breach 域控失陷 | SEV1 | T1078.002 | 15 分钟 |
| credential_compromise 凭据失陷 | SEV2 | T1110 | 1 小时 |
| lateral_movement 横向移动 | SEV2 | T1021 | 1 小时 |
| malware_infection 恶意软件感染 | SEV2 | T1204 | 1 小时 |
| insider_threat 内部威胁 | SEV2 | T1078 | 1 小时 |
| cloud_account_compromise 云账号失陷 | SEV2 | T1078.004 | 1 小时 |
| unauthorized_access 越权访问 | SEV3 | T1190 | 4 小时 |
| policy_violation 策略违规 | SEV3 | N/A | 4 小时 |
| phishing_attempt 钓鱼尝试 | SEV4 | T1566.001 | 24 小时 |
| security_alert 安全告警 | SEV4 | N/A | 24 小时 |

### SEV 矩阵与升级路径

| SEV | 名称 | 判据（节选） | 升级路径 |
|---|---|---|---|
| SEV1 | Critical | 确认勒索；活跃 PII/PHI 外泄（>1万条）；域控失陷；防御绕过（CloudTrail 被关）；供应链失陷 | SOC Lead → CISO → CEO → 董事长 |
| SEV2 | High | 确认越权访问敏感系统；高权限凭据失陷；确认横向移动；有勒索迹象但未确认执行 | SOC Lead → CISO |
| SEV3 | Medium | 疑似越权（未确认）；恶意软件已检测并遏制；单账号失陷无提权 | SOC Lead → 安全经理 |
| SEV4 | Low | 无确认影响的告警；信息性指标；无数据风险的策略违规 | L3 分析师队列 |

### 自动重定级触发器

| 触发条件 | 新 SEV |
|---|---|
| 发现勒索信 / 确认活跃外泄 / CloudTrail 或 SIEM 被关 / 确认域控访问 / 第二台系统失陷 | SEV1 |
| 外泄量 > 1 GB / 高管账号被访问 | 至少 SEV2 |

### 监管通报时限（从发现/声明起算）

| 框架 | 触发 | 时限 |
|---|---|---|
| GDPR (EU 2016/679) | 个人数据泄露 | 发现后 72 小时 |
| PCI-DSS v4.0 | 持卡人数据泄露 | 24 小时内报收单行 |
| HIPAA (45 CFR 164) | PHI 泄露（>500 人） | 发现后 60 天 |
| NY DFS 23 NYCRR 500 | 网络安全事件 | 72 小时报 DFS |
| SEC (17 CFR 229.106) | 重大网络安全事件 | 重大性判定后 4 个工作日 |
| CCPA / CPRA | 敏感个人信息泄露 | 不得无理拖延 |
| NIS2 (EU 2022/2555) | 重大事件（关键服务） | 24 小时预警；72 小时通报 |

操作规则：声明时范围不清时，按适用范围内最严时限处理，并在首个响应窗口内确认范围。

## 指令

退出码契约（用于驱动自动化处置）：`0`=SEV3/SEV4 或干净，标准工单处理；`1`=SEV2，1 小时桥接会议、异步协同；`2`=SEV1，立即 15 分钟战情室、全员响应。

```bash
# 分类一个 JSON 事件
python3 scripts/incident_triage.py --input event.json --classify --json

# 分类 + 启用误报过滤
python3 scripts/incident_triage.py --input event.json --classify --false-positive-check --json

# 桌面演练：强制指定 SEV 级别
python3 scripts/incident_triage.py --input event.json --severity sev1 --json

# 从 stdin 读事件
echo '{"event_type": "ransomware", "host": "prod-db-01", "raw_payload": {}}' | \
  python3 scripts/incident_triage.py --classify --false-positive-check --json
```

DFRWS 六阶段：Identification → Preservation（写保护/快照/法律保全）→ Collection（按易失性顺序采集）→ Examination（2 小时内）→ Analysis（4 小时内）→ Presentation（结案前出报告）。

易失证据优先采集顺序：1) 内存 RAM 转储（重启即丢）；2) 运行进程与网络连接（`netstat`、`ps`）；3) 登录用户与活动会话；4) 系统运行时长与当前时间（用于时间线锚定）；5) 环境变量与已加载内核模块。

证据链每项必录：采集时 SHA-256 哈希、含时区偏移的 UTC 采集时间戳、工具来源（FTK Imager / Volatility / dd / CloudTrail 导出）、调查人身份、转移日志（谁在何时持有）。

## 示例

快速 triage（15 分钟，单告警，升级决策前）：

```bash
# 1. 带误报过滤分类
python3 scripts/incident_triage.py --input alert.json \
  --classify --false-positive-check --json
# 2. 检查输出中的 severity、escalation_path、false_positive_flag
# 3. severity=sev1/sev2 → 立即呼叫 SOC Lead
# 4. false_positive_flag=true → 记录并关闭
```
决策：退出码 2 = 立即开 SEV1 战情室；退出码 1 = 30 分钟内 SEV2 桥接会议。

SEV1 全流程时间线：T+0 检测到达 → T+5 分类 → T+10 呼叫 CISO、开战情室、启动监管时钟 → T+15 启动取证（易失优先）+ 并行遏制评估 → T+30 遏制动作人工审批门 → T+45 执行已批准遏制 → T+60 评估遏制效果、PII/PHI 范围通报法务 → T+4h 终版证据包与驻留时间估计 → T+8h 根除与恢复计划 → T+72h 监管通报提交（若触发 GDPR/NIS2）。

桌面演练模拟：

```bash
echo '{"event_type": "credential_compromise", "user": "admin_user", "source_ip": "203.0.113.5"}' | \
  python3 scripts/incident_triage.py --classify --false-positive-check --json
```

## 注意事项

- 通报时钟从“发现”起算，不是从“调查结束”起算。GDPR 72 小时 / PCI 24 小时延迟声明会触发最高处罚，哪怕事件本身轻微。
- 遏制前必须并行采集易失证据。重启或隔离会摧毁 RAM、运行进程和活动连接；取证与遏制并行，绝不在遏制之后。
- 升级前先跑误报过滤。把每条告警都升到 SEV1 会损害 SOC 公信力并造成告警疲劳。
- SEV1 期间每个决策（含不确定下做的决策）都要带时间戳和理由写入证据链；未记录的决策在监管调查中无法辩护。
- 结案 ≠ 调查完成。事件在根除与恢复完成时关闭；取证报告与监管提交可在运营关闭后继续。
- 避免单源定级。仅凭单条 SIEM 告警无佐证常导致误分类；声明 SEV1 前至少收集两个独立信号。
- 遏制动作（网络隔离、凭据吊销）的人工审批门不可绕过；自动化变更动作可能造成生产中断、毁证与法律责任。
- 同源反复误报应在检测层调优消除，而非每次在 triage 反复过滤。

## 互见

- code-reviewer：代码安全缺陷评审；在野被利用的漏洞可能升级为安全事件进入本流程。
- dependency-auditor：依赖/供应链漏洞审计；供应链失陷会触发本流程的 SEV1 分类。

---

本条采编自 alirezarezvani/claude-skills（MIT），适配重写为面向 AI Agent 的中文条目。
