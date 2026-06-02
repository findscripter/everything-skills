---
name: k6-load-testing
title: k6 负载压力测试
description: 当需要对 HTTP API、WebSocket 或浏览器场景做负载/压力/容量验证时使用；用 k6 编写 JS 测试脚本、配置 VUs/stages/thresholds（SLA）、分析结果并接入 CI/CD，产出可执行测试与达标报告；不适用于单元/接口功能测试与无脚本的纯监控。触发词：k6、负载测试、压测
domain: 研发/testing
triggers: [k6, 负载测试, 压力测试, 性能压测, load testing, stress test, SLA 验证, VUs 并发, thresholds 阈值, 性能回归]
tags: [k6, 负载测试, 性能测试, 压测, API测试, CI/CD, SLA]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [k6, claude, cursor, gemini]
requires: []
related: [playwright-e2e-testing, api-test-suite-builder, webapp-testing, javascript-testing-patterns]
combines_with: [performance-profiler, grafana-dashboards, slo-sli-implementation]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 对 HTTP API、WebSocket 端点或浏览器（k6 Browser）场景做性能测试。
- 在 CI/CD 中建立性能回归门禁，对比代码改动前后的性能。
- 评估系统在不同负载下的表现：冒烟（Smoke）、负载（Load）、压力（Stress）、尖刺（Spike）、浸泡（Soak）。
- 校验 SLA / 性能预算（如 p95 < 500ms、错误率 < 1%）。

不该用：
- 功能正确性验证（用单元/接口测试，而非负载测试）。
- 无脚本的纯线上监控（用 APM/Prometheus 等，k6 是主动施压工具）。
- 缺少目标、权限或成功标准时，先澄清再动手，勿对生产系统盲目施压。

## 步骤

1. 安装 k6（见下方指令）。
2. 写最小脚本，先用 1-5 VUs 跑冒烟测试，确认脚本本身可用。
3. 选定测试类型并配置 `options`（`vus`/`duration` 或 `stages` 渐增渐减）。
4. 加 `thresholds` 表达 SLA，使阈值失败时 k6 返回非零退出码（CI 可据此判失败）。
5. 用 `check()` 断言响应；按需做请求链、参数化、`SharedArray` 加载外部数据。
6. 运行并导出结果（JSON / InfluxDB+Grafana / Prometheus / cloud）。
7. 接入 CI/CD（GitHub Actions / GitLab CI），按需归档 results.json。

测试类型速查：

| 类型 | 用途 | 配置要点 |
|------|------|----------|
| Smoke 冒烟 | 验证脚本基本可用 | 低 VUs(1-5)、短时长 |
| Load 负载 | 常规预期负载 | 按真实流量设目标 VUs |
| Stress 压力 | 找崩溃临界点 | 超出容量持续加压 |
| Spike 尖刺 | 突发流量冲击 | 快速拉升再骤降 |
| Soak 浸泡 | 长期稳定性 | 超长时长运行 |

## 指令

```bash
# 安装
brew install k6            # macOS
choco install k6           # Windows
# Linux: 见 k6 官方 apt 源安装

k6 install chromium        # 浏览器测试支持

# 运行与结果输出
k6 run load-test.js                                  # 文本摘要
k6 run --out json=results.json load-test.js          # JSON 便于解析
k6 run --out influxdb=http://localhost:8086/k6 load-test.js
k6 run --out prometheus=localhost:9090/k6 load-test.js
k6 run --out cloud load-test.js
```

关键结果指标判读：`http_req_duration(p95)` 好<300ms / 警告 300-500ms / 差>500ms；`http_req_failed` 好<0.1% / 警告 0.1-1% / 差>1%。

## 示例

最小冒烟脚本：

```javascript
// simple-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 10, duration: '30s' };

export default function () {
  const res = http.get('https://httpbin.test.k6.io/get');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

渐增负载 + SLA 阈值：

```javascript
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // 渐增
    { duration: '1m',  target: 100 },  // 维持
    { duration: '30s', target: 0 },    // 渐降
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% 请求 < 500ms
    http_req_failed:   ['rate<0.01'],  // 错误率 < 1%
  },
};
```

带鉴权 + 参数化（SharedArray 共享数据，避免内存膨胀）：

```javascript
import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

const users = new SharedArray('users', () => JSON.parse(open('./users.json')));

export default function () {
  const user = users[__VU % users.length];
  const loginRes = http.post('https://api.example.com/login',
    JSON.stringify({ email: user.email, password: user.password }));
  const token = loginRes.json('access_token');
  const res = http.get('https://api.example.com/profile',
    { headers: { Authorization: `Bearer ${token}` } });
  check(res, { 'profile loaded': (r) => r.status === 200 });
}
```

CI（GitHub Actions）核心步骤：用 `grafana/k6-action@v0.2.0` 安装，`k6 run --out json=results.json load-test.js` 运行，再 `actions/upload-artifact` 归档；阈值失败时 k6 退出码非零，job 自动失败。GitLab CI 用 `image: grafana/k6:latest` + `script: k6 run load-test.js`。

## 注意事项

- 先冒烟后放大：1-5 VUs 验证脚本，再逐步加压。
- 用真实数据参数化，用 `tags`（如 `tags: { endpoint: 'users' }`）做细粒度分析。
- 阈值贴合 SLA，从宽到严按历史数据收紧；用 stages 预留预热时间。
- 监控不只自家 API，也要看下游依赖；一个场景一个脚本，保持聚焦。
- 常见坑：本地通过 CI 失败（核对 CI 资源与网络）；多次跑结果不稳（排查外部依赖/随机数据/测试数据污染）；k6 内存溢出（大数据用 `SharedArray`、减少 VUs 或 `--max-memory`）；阈值过严（先放宽再迭代）。
- 安全：勿对未授权或生产系统盲目施压；输出需经环境特定验证，不能替代专家评审。

## 互见

- `performance-engineer`：更广义的性能优化。
- `api-testing-observability-api-mock`：测试期 API 打桩/Mock。
- `application-performance-performance-optimization`：性能优化。
- 资源：k6 文档 https://k6.io/docs/ ，示例 https://github.com/grafana/k6/tree/master/examples 。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
