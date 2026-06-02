---
name: error-log-detective
title: 日志错误模式排查
description: 当需要从日志/代码库中定位错误模式、堆栈跟踪与异常并追根因时使用；做日志解析、错误提取正则、跨服务关联与根因假设并产出时间线、监控查询与可疑代码位置；不适用于无错误信号的常规功能开发或纯性能调优。触发词：报错排查、堆栈跟踪、日志分析、错误关联、根因定位
domain: 研发/observability
triggers: [报错排查, 堆栈跟踪分析, 日志分析, 错误模式, 错误关联, 根因定位, 异常检测, error log, stack trace, log aggregation]
tags: [研发, misc, 日志分析, 错误排查, 根因分析, 可观测性, 堆栈跟踪]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Grep, Bash, Read]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 从日志或代码库中搜索错误模式、堆栈跟踪与异常，需要可复用的提取正则。
- 跨分布式系统/多服务关联同类错误，定位级联失败（cascading failure）。
- 把错误高峰与发布、配置变更或部署关联，给出根因假设与证据。
- 需要给出可复现监控查询（Elasticsearch / Splunk / 日志平台），防止问题再次出现。

不该用（负边界）：

- 任务与「错误/异常排查」无关，例如纯新功能开发、纯 UI 调整、纯性能调优（无错误信号）。
- 需要跳出日志分析范围、依赖其他领域工具的任务。
- 缺少日志样本、时间窗口或服务范围等关键输入时——先停下来询问，不要臆测。

## 步骤

遵循「从症状反推根因」的思路：

1. 从错误症状出发，反向追溯到原因，而非先猜结论。
2. 在多个时间窗口内寻找重复模式（按分钟/小时/天聚合）。
3. 将错误与部署、发布、配置变更做时间对齐关联。
4. 检查级联失败：上游错误是否触发下游连锁报错。
5. 识别错误率的变化与尖峰（spike），定位起始时刻。

## 指令

- 先澄清目标、约束与必需输入（日志来源、时间范围、涉及服务、可接受的根因证据标准）。
- 应用日志分析最佳实践，并对结论做验证，不把假设当结论。
- 给出可执行步骤与验证方法（如重放查询、对照发布记录）。
- 关注点（Focus Areas）：日志解析与错误提取（正则）、跨语言堆栈跟踪分析、跨分布式系统错误关联、常见错误模式与反模式、日志聚合查询（Elasticsearch、Splunk）、日志流中的异常检测。
- 产出物（Output）应包含：错误提取正则、错误发生时间线、服务间关联分析、带证据的根因假设、检测复发的监控查询、可疑代码位置。
- 聚焦可执行结论，同时给出「即时修复」与「预防策略」。

## 示例

错误提取正则（示意，按实际日志格式调整）：

```
# 通用 ERROR/异常级别行
\b(ERROR|FATAL|Exception|panic|Traceback)\b

# 提取时间戳 + 级别 + 消息
^(?<ts>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+(?<level>ERROR|WARN|FATAL)\s+(?<msg>.*)$
```

本地快速排查（ripgrep）：

```
# 统计各错误关键字出现次数，定位高频错误
rg -c -i "exception|timeout|connection refused" ./logs

# 提取最近的堆栈跟踪上下文（命中行前后 5 行）
rg -n -A 5 "Traceback|at .*\(.*:\d+\)" ./logs
```

聚合平台查询（示意）：

```
# Elasticsearch / Kibana KQL：按服务统计错误率
level:"ERROR" and service:"checkout"

# Splunk SPL：按时间桶看错误尖峰
index=app level=ERROR | timechart span=5m count by service
```

典型输出片段：

- 时间线：19:02 部署 v1.4.2 → 19:05 checkout 服务 `ConnectionTimeout` 错误率从 0.1% 升至 8%。
- 根因假设：新版本连接池超时阈值过低，证据为错误集中在发布后 3 分钟内且仅命中 checkout。
- 监控查询：对上述 SPL 设置 5 分钟窗口、阈值 >2% 的告警以检测复发。

## 注意事项

- 本技能输出不能替代针对具体环境的验证、测试或专家评审。
- 仅在任务明确落在「日志/错误排查」范围内时使用。
- 若缺少必需输入、权限、安全边界或成功标准，应停下来请求澄清，而非继续。
- 正则与查询均需按目标系统的真实日志格式校准后再上线。

## 互见

- 研发/misc 下其他可观测性、监控告警与故障复盘相关技能。
- 涉及代码定位时可配合代码检索类技能（Grep/Read）联用。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
