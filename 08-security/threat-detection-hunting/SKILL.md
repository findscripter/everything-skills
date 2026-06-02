---
name: threat-detection-hunting
title: 威胁狩猎与异常检测
description: 当需要在已通过自动化告警的环境中主动狩猎潜伏威胁、分析 IOC 或检测遥测行为异常时使用；做假设驱动狩猎评分、IOC 时效筛查与扫描清单生成、z-score 统计异常检测，并按 MITRE ATT&CK 映射排序信号、产出可升级的狩猎结论与新检测规则；不适用于已声明事件的应急响应（见 incident-response）或红队攻击模拟（见 red-team）。触发词：威胁狩猎、IOC、异常检测
domain: 安全/ops
triggers: [威胁狩猎, threat hunting, IOC 分析, 异常检测, z-score, MITRE ATT&CK, 蜜罐告警, 横向移动, C2 beaconing, 失陷检测, telemetry 遥测, 假设驱动狩猎]
tags: [安全, ops, 威胁狩猎, threat-hunting, 异常检测, IOC, MITRE-ATTACK, SIEM, EDR, 蓝队]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [threat_signal_analyzer.py, SIEM, EDR, Sysmon, MISP/OpenCTI, Bash/cron]
requires: []
related: [security-incident-response, yara-rule-authoring, wireshark-traffic-analysis, shodan-reconnaissance]
combines_with: [security-incident-response, yara-rule-authoring, wireshark-traffic-analysis]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
威胁狩猎与异常检测：通过假设驱动狩猎、IOC 分析和统计异常检测，在告警触发之前主动发现已绕过自动化管控的攻击者活动。

## 何时使用

适用：
- 收到新威胁情报报告 / CVE 预警，需在自有环境快速验证是否已被利用。
- 怀疑存在已绕过 EDR/SIEM 自动告警的潜伏威胁，需主动狩猎。
- 需要对一批 IOC（IP/域名/哈希/URL/互斥体）做时效筛查并生成扫描清单。
- 需对遥测（DNS 查询量、进程数、认证事件等）做基线偏离的统计异常检测。
- 需把狩猎结论沉淀为新的检测规则，闭环反哺检测工程。

不该用（负边界）：
- 已声明的安全事件的遏制与调查 → 用 incident-response（本技能是「告警前主动找」，非「事件后反应式处置」）。
- 从攻击者视角测试防御的攻击模拟 → 用 red-team。
- 云配置错误 / IAM / S3 暴露面的姿态评估 → 用 cloud-security。

与其他安全技能的区别：threat-detection 是主动（hunt before alerts）；incident-response 是反应式（遏制已声明事件）；red-team 是进攻式（模拟攻击）；cloud-security 是姿态评估（IAM/S3/网络暴露）。

前置条件：对 SIEM/EDR 遥测、端点日志、网络流量有读权限；IOC 源需在 30 天内刷新以避免误报；狩猎假设须先按本环境收敛范围再执行。

## 步骤

核心工具 `threat_signal_analyzer.py` 有三种模式：`hunt`（假设评分）、`ioc`（扫描清单生成）、`anomaly`（统计检测）。退出码：0=无高优先级发现；1=检出中优先级信号；2=确认高优先级发现（可用于自动升级）。

1. 提出可测试假设：聚焦 1–2 个 ATT&CK 技术，先按本环境收敛范围。
2. 假设评分：优先级 = 行为体相关性×3 + 管控缺口×2 + 数据可用性×1。评分 ≥7 升级为完整狩猎。
3. IOC 时效筛查：刷新威胁情报源，过期 IOC 标为 stale 并排除出扫描清单。
4. 异常检测：需 ≥14 天历史遥测建立基线；z-score ≥3.0 升级排查，2.0–2.9 记录加密采样，<2.0 正常。
5. 三角验证与升级：所有异常须人工三角验证后再升级；确认的恶意活动转 incident-response。
6. 闭环：将确认发现转化为新检测规则，误报 IOC 反馈给情报源。

## 指令

```bash
# hunt 模式：对假设按 MITRE ATT&CK 覆盖评分
python3 scripts/threat_signal_analyzer.py --mode hunt \
  --hypothesis "Lateral movement via PtH using compromised service account" \
  --actor-relevance 3 --control-gap 2 --data-availability 2 --json

# ioc 模式：从 IOC 源文件生成扫描目标
python3 scripts/threat_signal_analyzer.py --mode ioc --ioc-file iocs.json --json

# anomaly 模式：检测遥测事件的统计离群点
python3 scripts/threat_signal_analyzer.py --mode anomaly \
  --events-file telemetry.json --baseline-mean 100 --baseline-std 25 --json

# 列出支持的所有 MITRE ATT&CK 技术
python3 scripts/threat_signal_analyzer.py --list-techniques
```

IOC 文件格式：`{"ips": ["1.2.3.4"], "domains": ["malicious.example.com"], "hashes": ["abc123..."]}`

遥测事件文件格式（数组）：`[{"timestamp":"2024-01-15T14:32:00Z","entity":"host-01","action":"dns_query","volume":450}]`

IOC 类型与时效阈值（超期标 stale，排除扫描）：IP 30 天（防火墙/NetFlow/代理日志，T1071/T1105）；域名 30 天（DNS/代理日志，T1568/T1583）；文件哈希 90 天（EDR 文件创建/AV，T1105/T1027）；URL 14 天（代理/浏览历史，T1566.002）；互斥体名 180 天（EDR 运行时，T1055）。

高价值狩猎假设示例：WMI 横向移动 T1047（WMI/EDR 进程日志，WINRM 派生 WMI、异常父子链）；LOLBin 防御绕过 T1218（certutil/regsvr32/mshta 伴随网络活动）；C2 beaconing T1071.001（固定间隔 ±10% 抖动外联）；Pass-the-Hash T1550.002（4624 type3，NTLM 从异常源主机连管理共享）；LSASS 访问 T1003.001（非系统进程 OpenProcess lsass.exe）；Kerberoasting T1558.003（4769 大量 TGS 请求服务账户）；计划任务持久化 T1053.005（4698/Sysmon 1&11，非标准目录建任务）。

高价值异常目标：DNS 解析器（每主机每小时查询数 → beaconing/隧道/DGA）；端点（每日唯一进程数 → 恶意安装/LOLBin）；服务账户（每小时认证数 → 撞库/横向移动）；邮件网关（每小时附件类型 → 钓鱼爆发）；云 IAM（每身份每小时 API 调用 → 凭据失陷/外泄）。

## 示例

快速狩猎（30 分钟，应对新情报/CVE）：
```bash
# 1. 假设评分
python3 scripts/threat_signal_analyzer.py --mode hunt \
  --hypothesis "Exploitation of CVE-YYYY-NNNNN in Apache" \
  --actor-relevance 2 --control-gap 3 --data-availability 2 --json
# 2. 构建 IOC 扫描清单
echo '{"ips":["1.2.3.4"],"domains":["malicious.tld"],"hashes":[]}' > iocs.json
python3 scripts/threat_signal_analyzer.py --mode ioc --ioc-file iocs.json --json
# 3. 近 24h Web 遥测异常
python3 scripts/threat_signal_analyzer.py --mode anomaly \
  --events-file web_events_24h.json --baseline-mean 80 --baseline-std 20 --json
```
决策：hunt 优先级 ≥7 或任一 IOC 命中 → 升级为完整狩猎。

持续监控（自动化，6 小时一次，退出码 2 自动告警）：
```bash
python3 scripts/threat_signal_analyzer.py --mode anomaly \
  --events-file /var/log/telemetry/events_6h.json \
  --baseline-mean "${BASELINE_MEAN}" --baseline-std "${BASELINE_STD}" \
  --json > /var/log/threat-detection/$(date +%Y%m%d_%H%M%S).json
if [ $? -eq 2 ]; then send_alert "Hard anomaly detected — threat_signal_analyzer"; fi
```

完整狩猎（多日）：Day1 复盘情报+映射近 30 天告警找覆盖缺口、评分 Top5 假设；Day2 拉近 14 天 SIEM 遥测跑基线异常+刷新 IOC 扫描+查狩猎 playbook；Day3 三角验证、升级 incident-response、沉淀检测规则、回报误报 IOC。

## 注意事项

反模式（务必避免）：
1. 无假设狩猎 — 全量盲查只产噪声；每次狩猎须从聚焦 1–2 个 ATT&CK 技术的可测试假设开始。
2. 使用过期 IOC — 超 30 天的 IOC 制造误报、训练分析员忽视告警；扫描前必查时效，自动扫描排除 stale。
3. 跳过基线建立 — 无效基线会在正常高峰日误报；任何实体启用统计告警前需 ≥14 天基线。
4. 只狩猎已知技术 — 仅打文档化 ATT&CK 会漏掉新型行为；定期加入开放式异常分析以暴露未知 TTP。
5. 不闭环检测工程 — 确认恶意的发现必须产出新检测规则，否则狩猎无持久价值。
6. 把异常当确认威胁 — 高 z-score 只代表偏离基线而非已确认恶意；所有异常须人工三角验证后再升级。
7. 忽视蜜罐告警 — 与诱骗资产的任何交互都是高保真信号，蜜罐命中绕过常规评分管线，默认视为 SEV2 直到被证伪。

基线在以下情况后须重算：安全事件后（行为变化）、重大基础设施变更（云迁移/新 SaaS）、季节性使用模式变化（季末/假期）。

诱骗资产类型：密码库蜜罐凭据（T1555）；假 AWS 密钥蜜罐令牌放 Git/S3（T1552.004）；蜜罐文件如 passwords.xlsx 放共享/端点（T1074）；休眠 AD 蜜罐账户（T1078.002）；DMZ/扁平网段蜜罐网络服务（T1046/T1190）。

## 互见

- incident-response：狩猎确认的威胁升级到此做三角验证与遏制。
- red-team：红队演练产生真实 TTP，反哺狩猎假设排序。
- cloud-security：云姿态发现（开放 S3、IAM 通配）形成数据外泄 TTP 的狩猎目标。
- security-pen-testing：渗透发现的攻击面应在修复后由狩猎持续监控。

---
采编自 alirezarezvani/claude-skills（MIT License）。原技能名 threat-detection，本条目适配重写为 threat-detection-hunting。
