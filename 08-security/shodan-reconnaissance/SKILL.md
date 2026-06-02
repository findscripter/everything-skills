---
name: shodan-reconnaissance
title: Shodan 资产侦察方法论
description: 当在授权范围内用 Shodan 做暴露资产/服务侦察、漏洞面测绘与 OSINT 时使用；用 CLI/REST API/搜索过滤器查主机、按 org/net/vuln/port 检索、统计、下载解析与按需扫描，产出资产清单、漏洞报告与导出数据；不适用于无书面授权的主动扫描、主机直连漏扫或对未授权目标取证。触发词：Shodan、暴露资产侦察、shodan search、vuln 过滤、IoT/工控发现。
domain: 安全/appsec
triggers: [Shodan, 暴露资产侦察, shodan search, shodan host, shodan count, shodan stats, shodan scan submit, honeyscore蜜罐, vuln过滤CVE, org网段侦察, net CIDR检索, ssl证书检索, IoT设备发现, 工控Modbus, 暴露数据库, REST API侦察, 攻击面测绘]
tags: [安全, 侦察, OSINT, Shodan, 攻击面测绘, 资产发现, 漏洞测绘, 红队]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [shodan-cli, Shopython, curl, jq, Python3]
requires: []
related: [red-team-recon, penetration-testing-methodology, wireshark-traffic-analysis, cloud-penetration-testing]
combines_with: [red-team-recon, penetration-testing-methodology, firmware-reverse-analyst]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Shodan 资产侦察方法论

> 仅限授权使用：被动检索（search/host/count/stats/download）通常合法，但**按需扫描（scan submit）属主动行为，必须有书面授权**；任何针对未授权目标的操作均可能违法。

## 何时使用

- 已获书面授权，需要对目标组织/网段做**外部攻击面测绘**：发现暴露主机、开放端口、服务横幅与软件版本。
- 需要按 `org`/`net`/`hostname`/`vuln`/`product`/`ssl` 等过滤器批量检索资产，统计分布并导出 JSON/CSV 供后续分析。
- 做 IoT/工控/数据库暴露排查、SSL 证书测绘，或对单 IP 做蜜罐判定（honeyscore）。

**不该用（负边界）：**
- 无书面授权、或目标不在约定范围 —— 尤其 `scan submit`（主动扫描）一律先确认授权。
- 直接对主机做漏洞利用/爆破/取证 —— 那属渗透/利用类技能，Shodan 只做被动测绘。
- 实时端口扫描需求 —— Shodan 是历史爬取数据，可能滞后数天/数周，需现时数据请走 Nmap 等主动扫描。

**前置**：shodan.io 账号 + API Key；`pip install shodan`；目标 IP/域名/网段清单；了解查询/扫描积分制。

## 步骤

1. **初始化**：装 CLI → `shodan init KEY` → `shodan info` 核对积分。
2. **单点侦察**：`shodan host IP` 取端口/横幅；可选 `shodan honeyscore IP` 判蜜罐。
3. **检索**：先 `shodan count`（不耗积分）估量，再 `shodan search`（含过滤器耗 1 积分/查询）按 org/net/vuln 定位。
4. **统计**：`shodan stats --facets` 看端口/产品/地理分布，掌握资产画像。
5. **批量导出**：`shodan download` 落盘 → `shodan parse --fields` 抽字段为 CSV。
6. **（授权时）按需扫描**：`shodan scan submit IP`（1 积分/IP）取较新数据，`scan status` 跟踪。
7. **持续监控/编程化**：Web Monitor 告警，或 REST API / Python 库自动化。

全程原则：能 count/被动则不主动，先小范围验证查询语法再放量下载。

## 指令

**配置与账户（不耗积分）**
```bash
pip install shodan          # 安装；Arch: sudo pacman -S python-shodan
shodan init YOUR_API_KEY    # 写入 Key
shodan info                 # 查询/扫描积分；shodan myip / shodan version
```

**单主机与蜜罐**
```bash
shodan host 1.1.1.1         # 主机名/国家/组织/开放端口/横幅
shodan honeyscore IP        # 蜜罐概率 0~1
```

**检索（count 不耗积分；带过滤器的 search 耗 1 积分/查询）**
```bash
shodan count openssh                 # 仅计数，不耗积分
shodan search apache                 # 无过滤器基础检索
shodan search --fields ip_str,port,os smb
shodan search product:nginx country:US city:"New York"
```

**下载与解析**
```bash
shodan download results.json.gz "apache country:US"   # 默认 1000 条，每 100 条 1 积分
shodan download --limit -1 all.json.gz "query"        # 全量
shodan parse --fields ip_str,port,hostnames results.json.gz
shodan parse --fields ip_str,port,org --separator , results.json.gz > out.csv
```

**统计**
```bash
shodan stats nginx                                    # 默认 Top10 国家/组织
shodan stats --facets port,product,country 'org:"Target"'
```

**按需扫描（主动，须授权，1 积分/IP，24h 内同 IP 不可重扫）**
```bash
shodan scan submit 192.168.1.100
shodan scan list / shodan scan status SCAN_ID / shodan scan protocols
```

**REST API / Python**
```bash
curl -s "https://api.shodan.io/shodan/host/search?key=KEY&query=apache" | jq
```
```python
import shodan
api = shodan.Shodan('YOUR_API_KEY')
r = api.search('org:"Target"')           # 含 vuln 等过滤器耗 1 积分
print(r['total'])
for m in r['matches']:
    print(m['ip_str'], m['port'], m.get('product','?'))
```

**搜索过滤器速查**

| 类别 | 过滤器 |
|------|--------|
| 网络 | `ip:` `net:192.168.0.0/24` `hostname:` `port:` `asn:AS15169` |
| 地理 | `country:US` `city:"San Francisco"` `geo:37.7,-122.4` |
| 组织 | `org:"Google"` `isp:"Comcast"` |
| 服务 | `product:` `version:` `os:` `http.title:` `http.status:200` `ssl.cert.subject.cn:*.example.com` `ssl:true` |
| 漏洞 | `vuln:CVE-2019-0708` `has_vuln:true` |
| 截图 | `has_screenshot:true` `screenshot.label:webcam` |

## 示例

**组织侦察闭环（授权）**
```bash
shodan count 'org:"Target Company"'                            # 先估量
shodan search 'org:"Target Company"'                           # 资产列表
shodan stats --facets port,product,country 'org:"Target Company"'
shodan download target.json.gz 'org:"Target Company"'
shodan parse --fields ip_str,port,product target.json.gz
```

**漏洞面与暴露资产**
```bash
shodan search 'vuln:CVE-2021-44228 country:US'                 # Log4j 暴露
shodan search 'product:elastic port:9200 -authentication'      # 无认证 ES
shodan search 'net:192.168.1.0/24 vuln:CVE-2019-0708'          # 网段内 BlueKeep
shodan search 'webcam has_screenshot:true'                     # 暴露摄像头
shodan search 'port:502 product:modbus'                        # 工控
```
常用查询：`product:mongodb`、`product:redis`、`port:3389 vuln:CVE-2019-0708`、`http.component:wordpress`、`port:2375 product:docker`、`port:3306,5432,27017,6379`(数据库暴露)。

## 注意事项

- **授权与合规**：被动检索通常合法但视司法辖区而定；`scan submit` 等主动行为必须授权，全程记录侦察活动。
- **积分制**：无过滤器 search 与 count/host/parse 免费；带过滤器 search、每 100 条 download、stats 各耗 1 查询积分；scan 耗扫描积分（1/IP）。
- **限速**：约 1 请求/秒；编程化时在请求间 `time.sleep(1)`。
- **数据时效**：爬取数据可能滞后数天/数周；非企业版 24h 内不可重扫同一 IP；历史数据需付费。
- **排错**：未配 Key→`shodan init` 后 `shodan info` 验证；积分耗尽→改用免费查询或等重置；空结果→短语用引号 `'org:"Company Name"'` 并放宽条件；下载文件解析失败→`gunzip -t file.gz` 校验后用 `--limit` 重下。

## 互见

- requires：`penetration-testing-methodology` —— Shodan 是其「侦察」阶段的被动情报来源。
- related：`aws-penetration-testing`、`cloud-penetration-testing` —— 云资产暴露面排查可与 Shodan 资产清单互证。
- combines_with：`dependency-auditor` —— Shodan 定位暴露的软件版本后，可结合依赖/漏洞审计判定可利用性。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原作者 zebbern。
