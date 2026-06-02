---
name: red-team-recon
title: 红队侦察方法论
description: 当你获得授权对目标域名/IP/应用做安全评估、漏洞挖掘或赏金侦察时使用；产出子域枚举、存活主机识别、技术指纹、内容发现到漏洞扫描的可执行 recon 流水线与归档结果；不适用于未授权目标、生产环境压测/DoS，或纯防守加固；触发词：红队侦察、recon、子域枚举、subdomain enumeration、bug bounty、漏洞挖掘、attack surface、信息收集
domain: 安全/appsec
triggers: [红队侦察, recon, 子域枚举, subdomain enumeration, bug bounty, 漏洞挖掘, attack surface, 信息收集, 存活主机探测, nuclei 扫描]
tags: [security, appsec, red-team, recon, bug-bounty, subdomain-enumeration, vulnerability-scanning, offensive]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [amass, subfinder, assetfinder, findomain, dnsgen, httpx, httprobe, massdns, whatweb, nuclei, ffuf, waybackurls, gau, unfurl, paramspider, Gxss, dalfox, qsreplace, anew, Burp Suite]
requires: []
related: [penetration-testing-methodology, shodan-reconnaissance, ffuf-web-fuzzing, cloud-penetration-testing]
combines_with: [shodan-reconnaissance, ffuf-web-fuzzing, penetration-testing-methodology]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你**已获得明确授权**（赏金项目范围、客户委托、受控实验环境）对目标做攻击面侦察、漏洞发现时使用本条。它把顶尖安全研究者的成熟流程固化为可复制的 recon 流水线：从资产/ASN 梳理、子域枚举、存活探测、指纹识别、内容发现，到自动化 XSS 与 Nuclei 扫描。

**不该用：**
- 未授权目标，或超出赏金项目 scope 边界（先核对 scope 再动手）。
- 生产环境的 DoS、暴力 fuzz、无速率限制的高并发扫描。
- 纯防守视角（加固、补丁、检测规则）——本条是进攻侦察，不是 blue team 任务。

前置：Linux 攻击机（Kali/Ubuntu）、Go/Python 环境、各服务 API key（Shodan/Censys 等）、已确认的目标 scope。

## 步骤

1. **项目与资产梳理**：建目录、查收购公司/子公司、拿 ASN。
2. **子域枚举**：被动+主动多源并跑，再合并去重。
3. **存活探测**：筛出响应主机并记录状态码/标题/技术栈。
4. **指纹识别**：识别框架/CMS/版本，为定向攻击铺路。
5. **内容发现**：目录爆破 + 历史 URL（Wayback/gau）+ 参数提取。
6. **应用分析**（Jason Haddix 热力图法）：定位高价值入口。
7. **自动化 XSS / Nuclei 扫描**：参数挖掘 + 模板化漏洞扫描。
8. **API 枚举**：endpoint 爆破、版本探测、HTTP 方法越权。
9. **归档**：所有输出落盘，人工复核后再写报告。

## 指令

资产与 ASN：
```bash
mkdir -p target/{recon,vulns,reports} && cd target
amass intel -org "Target Company" -src
curl -s "https://bgp.he.net/search?search=targetcompany&commit=Search"
```

子域枚举（多源合并）：
```bash
echo "target.com" > wildcards
amass enum -passive -d target.com -src -o amass_passive.txt
subfinder -d target.com -silent -o subfinder.txt
cat wildcards | assetfinder --subs-only | anew domains.txt
findomain -t target.com -o
cat domains.txt | dnsgen - | httprobe > permuted.txt      # 生成置换变体
cat amass_*.txt subfinder.txt | sort -u > all_subs.txt
```

存活探测与指纹：
```bash
cat domains.txt | httpx -title -tech-detect -status-code -o live_hosts.txt
cat domains.txt | httprobe -c 80 --prefer-https | anew hosts.txt
whatweb -i hosts.txt -a 3 -v > tech_stack.txt
nuclei -l hosts.txt -t technologies/ -o tech_nuclei.txt
```

内容发现与参数：
```bash
ffuf -ac -v -u https://target.com/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
waybackurls target.com | tee wayback.txt
gau target.com | tee all_urls.txt
cat all_urls.txt | grep "=" | sort -u > params.txt
cat all_urls.txt | unfurl paths | sort -u > custom_wordlist.txt
```

自动化 XSS 与漏洞扫描：
```bash
python3 paramspider.py --domain target.com -o params.txt
cat params.txt | Gxss -p test
cat params.txt | dalfox pipe --mining-dict params.txt -o xss_results.txt
nuclei -l hosts.txt -t ~/nuclei-templates/ -o nuclei_results.txt
nuclei -l hosts.txt -t cves/ -o cve_results.txt
```

API 枚举（含 HTTP 方法越权探测）：
```bash
ffuf -u https://target.com/api/FUZZ -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt
for method in GET POST PUT DELETE PATCH; do
    curl -X $method https://target.com/api/users -v
done
```
重点排查路径：`/api/v1/users` `/api/v1/admin` `/api/users/me` `/api/config` `/api/debug` `/api/swagger` `/api/graphql`。

**应用分析热力图（优先级入口）**：文件上传（注入/XXE/SSRF/webshell）、multipart 表单、API（隐藏方法/缺鉴权）、个人资料区（存储型 XSS）、第三方集成（SSRF）、错误页（异常注入点）。分析时自问：数据如何传递（参数/API/混合）？用户标识在哪（UID/UUID 端点）？是否多租户/分级权限？是否有历史 writeup？

## 示例

快速子域 recon：
```bash
subfinder -d target.com | httpx -title | tee results.txt
```

XSS 挖掘流水线：
```bash
waybackurls target.com | grep "=" | qsreplace "test" | httpx -silent | dalfox pipe
```

一键串联自动化脚本（recon.sh）：
```bash
#!/bin/bash
domain=$1
[[ -z $domain ]] && { echo "Usage: ./recon.sh <domain>"; exit 1; }
mkdir -p "$domain"
subfinder -d "$domain" -silent > "$domain/subs.txt"
cat "$domain/subs.txt" | httpx -title -tech-detect -status-code > "$domain/live.txt"
cat "$domain/live.txt" | waybackurls > "$domain/urls.txt"
nuclei -l "$domain/live.txt" -o "$domain/nuclei.txt"
echo "[+] Recon complete!"
```

## 注意事项

- **仅限授权使用**：动手前逐项核对项目 scope，越界即停。
- 严守速率限制，避免触发封禁；被限流时用代理轮换、降并发。
- 不在生产环境做 DoS / 无限制 fuzz。
- 工具结果存在误报，**报告前必须人工复核**。
- 多源合并能补全单一工具漏掉的子域；结果太多时按技术栈聚焦。
- 部分工具需 API key 才能发挥全功能；缺 Go 工具用 `go install` 安装。

## 互见

- code-reviewer：发现可疑代码点后做代码层面审查。
- dependency-auditor：组件/依赖版本指纹命中后核查已知 CVE 与供应链风险。
- webapp-testing：对存活应用做功能/交互层面的复现验证。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
