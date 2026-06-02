---
name: slo-sli-implementation
title: SLI/SLO 服务等级目标落地
description: 当需要为服务定义可观测的可靠性目标、落地 SLI/SLO/错误预算与多窗口燃尽告警时使用；做产出 SLI 定义、SLO 目标、Prometheus 录制规则与告警/看板配置；不适用于不可量化的"体验好坏"评估、无指标数据源、纯采集配置（交给监控配置技能）、SLA 合同条款撰写；触发词：SLO、SLI、错误预算、服务等级目标、燃尽率、可靠性目标。
domain: 研发/observability
triggers: [SLO, SLI, 错误预算, 服务等级目标, 燃尽率, burn rate, 可靠性目标, error budget, 可用性目标, 延迟 SLO]
tags: [slo, sli, observability, reliability, sre, prometheus]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [prometheus, grafana]
requires: []
related: [prometheus-configuration, grafana-dashboards, observability-strategy-designer, sre-incident-responder]
combines_with: [distributed-tracing, postmortem-writer, incident-commander-framework]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要把"服务该多可靠"变成可量化目标：定义 SLI、设定 SLO、算错误预算、配燃尽率告警与看板时使用。
- 已经有指标数据源（如 Prometheus 的 `http_requests_total`、`http_request_duration_seconds`），要在其上构建可靠性度量时使用。
- 触发词：SLO、SLI、错误预算、服务等级目标、燃尽率、可用性/延迟目标。

不该用的边界：
- 不可量化的"主观体验好不好"评估 → 本技能只处理可测量的 SLI，无指标就先补埋点/采集。
- 纯指标采集/抓取配置（scrape、exporter）→ 交给监控配置类技能；本技能假设指标已可查。
- 撰写对外 SLA 合同条款、法务赔偿 → 不在范围内；SLA 是面向客户的承诺，SLO 是内部目标。
- 一次就追求 100% 可靠 → 反模式；SLO 故意留错误预算换迭代速度。

## 步骤 / 指令

```
1. 厘清层级与对象
   - SLA（对客户的合同承诺）⊃ SLO（内部可靠性目标）⊃ SLI（实际测量值）。
   - 先选用户面服务，明确"用户感知"的成败口径（哪些算成功请求）。

2. 定义 SLI（成功事件 / 总事件，比值落在 0~1）
   - 可用性：非 5xx 请求占比。
   - 延迟：低于阈值（如 500ms）的请求占比。
   - 持久性：成功写入 / 总写入。
   - 统一选定窗口（常用 28d，对齐月度运营）。

3. 设定 SLO 目标
   - 参考：用户期望、业务要求、当前真实表现、可靠性成本、竞品基准。
   - 别盲目堆 9：可用性每加一个 9，停机预算大幅收紧（见示例表）。

4. 算错误预算
   - 错误预算 = 1 - SLO目标；剩余预算% =(SLI - 目标)/(1 - 目标)*100。
   - 配错误预算策略：剩余越少越收紧发布（100%正常→0%冻结功能保可靠）。

5. 落地为 Prometheus 录制规则
   - sli:*:ratio（高频，如 30s 算 SLI 比值）。
   - slo:*:compliance / error_budget_remaining / burn_rate_*（5m 算合规与燃尽）。

6. 配多窗口燃尽率告警（短+长窗口联立，降误报）
   - 快烧：1h 与 5m 同时 > 14.4x（1 小时烧掉 ~2% 预算）→ critical。
   - 慢烧：6h 与 30m 同时 > 6x（6 小时烧掉 ~5% 预算）→ warning。
   - 预算耗尽：error_budget_remaining < 0 → critical。

7. 做看板 + 周期复盘
   - 看板：当前合规、剩余预算条、28d SLI 趋势、各窗口燃尽率。
   - 周（合规/预算/趋势/事故影响）、月（达成/用量/复盘/微调）、季（目标相关性/流程/工具）。
```

规则：
- SLI 一律是"好事件 / 总事件"的比值，口径要与用户感知一致。
- 燃尽率告警必须多窗口联立（短窗确认仍在烧、长窗确认非抖动），单窗易误报。
- SLO 目标要可达且留预算，不追 100%；目标值在录制规则里写死要与告警阈值一致。

## 示例

可用性 / 延迟 SLI（PromQL，28d 窗口）：
```promql
# 可用性：非 5xx 占比
sum(rate(http_requests_total{status!~"5.."}[28d]))
/ sum(rate(http_requests_total[28d]))

# 延迟：<500ms 占比
sum(rate(http_request_duration_seconds_bucket{le="0.5"}[28d]))
/ sum(rate(http_request_duration_seconds_count[28d]))
```

可用性 SLO 与停机预算（直观感受"加 9 的代价"）：

| SLO %  | 每月停机   | 每年停机    |
|--------|-----------|------------|
| 99%    | 7.2 小时   | 3.65 天    |
| 99.9%  | 43.2 分钟  | 8.76 小时  |
| 99.95% | 21.6 分钟  | 4.38 小时  |
| 99.99% | 4.32 分钟  | 52.56 分钟 |

错误预算策略：
```yaml
error_budget_policy:
  - remaining_budget: 100%   # 正常迭代速度
  - remaining_budget: 50%    # 推迟高风险变更
  - remaining_budget: 10%    # 冻结非关键变更
  - remaining_budget: 0%     # 功能冻结，专注可靠性
```

Prometheus 录制规则（SLI/合规/剩余预算/燃尽率）：
```yaml
groups:
  - name: sli_rules
    interval: 30s
    rules:
      - record: sli:http_availability:ratio
        expr: |
          sum(rate(http_requests_total{status!~"5.."}[28d]))
          / sum(rate(http_requests_total[28d]))
  - name: slo_rules
    interval: 5m
    rules:
      - record: slo:http_availability:compliance
        expr: sli:http_availability:ratio >= bool 0.999
      - record: slo:http_availability:error_budget_remaining
        expr: (sli:http_availability:ratio - 0.999) / (1 - 0.999) * 100
      - record: slo:http_availability:burn_rate_5m
        expr: |
          (1 - (
            sum(rate(http_requests_total{status!~"5.."}[5m]))
            / sum(rate(http_requests_total[5m]))
          )) / (1 - 0.999)
```

多窗口燃尽率告警（短+长联立）：
```yaml
rules:
  - alert: SLOBurnRateHigh
    expr: |
      (slo:http_availability:burn_rate_1h  > 14.4 and slo:http_availability:burn_rate_5m  > 14.4)
      or
      (slo:http_availability:burn_rate_6h  > 6    and slo:http_availability:burn_rate_30m > 6)
    labels:
      severity: critical
  - alert: SLOErrorBudgetExhausted
    expr: slo:http_availability:error_budget_remaining < 0
    for: 5m
    labels:
      severity: critical
```

按当前燃尽速度估算"预算还能撑几天"：
```promql
(slo:http_availability:error_budget_remaining / 100)
* 28
/ ((1 - sli:http_availability:ratio) * (1 - 0.999))
```

## 注意事项

- 窗口一致性：SLI、SLO 阈值、燃尽率分母里的目标值（如 0.999）必须三处对齐，改 SLO 要同步改全部规则。
- `>= bool` 用于把比较结果落成 0/1 指标供合规判断，别漏 `bool`。
- 燃尽率阈值（14.4x/6x）对应"在窗口内烧掉固定比例预算"，与你的 SLO 窗口绑定；换窗口需重算，不要照抄。
- 单窗口告警噪声大：务必短窗确认仍在烧 + 长窗确认非瞬时抖动，二者联立。
- 别只盯单一 SLI：可用性与延迟应分别建 SLI/SLO，避免"可用但很慢"被漏判。
- SLO 是工程优先级工具，不是 100% 完美承诺；预算见底时该冻结发布、把资源转向可靠性。
- 本技能产出配置与算法，不替代环境内实测：上线前用真实流量验证录制规则与告警是否触发正常。

## 互见

- requires：无。
- related：监控采集/配置类技能（负责 `http_requests_total` 等指标的抓取与存储，本技能在其上构建度量）；可视化看板类技能（把 SLO 合规、剩余预算、燃尽率画成 Grafana 面板）。
- combines_with：告警/事件响应类技能（燃尽告警触发后的值班、降级与事故复盘，与本技能的错误预算策略联动）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
