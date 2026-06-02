---
name: yara-rule-authoring
title: YARA-X 恶意软件检测规则编写
description: 当为恶意软件家族编写、审查或优化 YARA-X 检测规则，或把 IOC/威胁情报转成签名、排查误报、从旧版 YARA 迁移时使用；产出命名规范、字符串选型、condition 短路排序、误报控制良好的可部署规则。不适用于反汇编/动态沙箱/网络流量(Suricata)/内存取证或纯哈希匹配。触发词：YARA、YARA-X、yr scan/check/fmt、恶意软件检测、malware detection、威胁狩猎、threat hunting、IOC、检测签名、crx 模块、dex 模块、误报 false positive。
domain: 安全/ops
triggers: [YARA, YARA-X, yr scan, yr check, yr fmt, 恶意软件检测, malware detection, 威胁狩猎, threat hunting, IOC, 检测签名, crx 模块, dex 模块, 误报, false positive]
tags: [yara, yara-x, malware-detection, threat-hunting, security, detection-engineering, ioc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [yr (YARA-X CLI), yarGen, FLOSS, YARA-CI, yara_lint.py, atom_analyzer.py]
requires: []
related: [threat-detection-hunting, anti-reversing-techniques, binary-analysis-patterns, security-incident-response]
combines_with: [threat-detection-hunting, security-incident-response, binary-analysis-patterns]
license: CC-BY-SA-4.0
source: trailofbits/skills
source_license: CC-BY-SA-4.0
---
> 本条针对 **YARA-X**（Rust 重写的 YARA 继任者，VirusTotal 生产环境采用，推荐实现）。与旧版 YARA 99% 兼容但校验更严格。

## 何时使用

适用：
- 为具体恶意软件家族编写新的 YARA-X 检测规则；
- 审查现有规则的质量/性能、优化慢规则集；
- 把 IOC 或威胁情报转成检测签名；
- 排查误报（FP）、为生产部署做准备；
- 从旧版 YARA 迁移规则；
- 分析 Chrome 扩展（crx 模块）、Android 应用（dex 模块）。

不该用（改用其他工具）：
- 需要反汇编的静态分析 → Ghidra/IDA；
- 动态沙箱分析 → 沙箱类工具；
- 基于网络流量的检测 → Suricata/Snort；
- 内存取证 → Volatility；
- 简单哈希匹配 → 直接用哈希清单。

## 核心原则

1. **字符串要能生成好的 atom**：YARA 提取 4 字节子序列做快速匹配。含重复字节、常见序列或不足 4 字节的串会迫使大量文件走慢速字节码校验。
2. **瞄准具体家族，而非大类**："检测勒索软件"等于谁都抓、谁都抓不准；"检测 LockBit 3.0 配置提取例程"才精准。
3. **部署前先打 goodware**：会命中 Windows 系统文件的规则毫无价值。用 VirusTotal goodware 语料或自己的干净文件集验证。
4. **用廉价检查先短路**：把 `filesize < 10MB and uint16(0) == 0x5A4D` 放在昂贵的字符串搜索/模块调用之前。
5. **元数据即文档**：未来的你和团队需要知道它抓什么、为什么、样本来自哪里。

## 步骤

1. **收集样本** — 多样本；单样本规则很脆。
2. **提取候选串** — `yarGen.py -m samples/ --excludegood`；yarGen 失败时用 `floss sample.exe` 提取混淆/栈字符串。
3. **筛选质量** — yarGen 输出需 ~80% 过滤，逐条按"字符串够不够好"判断（见下）。
4. **写初版规则** — 套模板，命名 `{CATEGORY}_{PLATFORM}_{FAMILY}_{VARIANT}_{DATE}`，补齐元数据。
5. **校验与格式化** — `yr check rule.yar`、`yr fmt -w rule.yar`、跑 lint 脚本。
6. **goodware 验证** — VirusTotal/YARA-CI 语料或本地干净文件，要求 0 命中。
7. **部署** — 入库附完整元数据，持续监控 FP。

## 指令

安装与核心命令：
```bash
brew install yara-x        # macOS
cargo install yara-x       # 或 cargo
yr check rule.yar          # 语法校验（错误定位精确到行）
yr fmt -w rule.yar         # 内置格式化
yr dump -m pe sample.exe --output-format yaml   # 查看模块字段，无需写哑规则
time yr scan -s rule.yar corpus/                # 带计时扫描，-s 显示命中串
```

**命名与必需元数据**（每条规则都要有，`description` 以「Detects」开头）：
```yara
meta:
    description = "Detects Example malware via unique mutex and C2 path"
    author = "Your Name <email@example.com>"
    reference = "https://example.com/analysis"
    date = "2025-01-29"
```
前缀：`MAL_` `HKTL_` `WEBSHELL_` `EXPL_` `SUSP_` `GEN_`；平台：`Win_` `Lnx_` `Mac_` `Android_` `CRX_`。例：`MAL_Win_Emotet_Loader_Jan25`。

**字符串选型** — 好：互斥量名(mutex)、PDB 路径、C2 路径、栈字符串、配置标记；差：API 名、常见可执行文件、格式化串、通用路径。判断流程：
- < 4 字节 / 含重复字节(0000、9090) → 不要，补上下文或换更长串；
- 是 API 名(VirtualAlloc、CreateRemoteThread) → 改用调用点的十六进制模式；
- 出现在 Windows 系统文件/常见路径(C:\Windows\、cmd.exe) → 太通用；
- 唯一于该家族 → 用；多家族共有 → 与家族专属标记组合。

**condition 排序短路**：`filesize <`（瞬时）→ `uint16(0)==0x5A4D` 魔数（近瞬时）→ 字符串（廉价）→ 模块（昂贵）。超过 5 行就拆成多条规则。

**all of vs any of**：每个串单独即可疑 → `any of`；串都很常见但组合可疑 → `all of`；置信度不同 → 分组 `all of ($core_*) and any of ($variant_*)`；FP 多 → any 收紧为 all 并加必需串。

**字符串类型**：精确文本 → `$s = "MutexName" ascii wide`；字节序列 → `{ 4D 5A 90 00 }`；带变体 → 通配 `{ 4D 5A ?? ?? 50 45 }`；有结构(URL/路径) → 有界正则 `/https:\/\/[a-z]{5,20}\.onion/`；未知编码 → `xor(0x00-0xFF)` 修饰符。

**关键约束**：
- 正则必须锚定到 4+ 字节字面量子串，否则在每个文件偏移评估，性能灾难：写 `/mshta\.exe http:\/\/.../` 而非 `/http:\/\/.../`；
- 禁用无界 `.*`，用 `.{0,30}`；
- 循环必须用 filesize 限界：`filesize < 100KB and for all i in (1..#a) : ...`；
- 不要投机使用 `nocase`/`wide`，仅在确有证据表明大小写/编码变化时用（`nocase` 翻倍 atom，`wide` 翻倍匹配）；
- 优先 `uint32()` 等显式十六进制检查，能不加载模块就别加载（避免 magic 模块）。

**YARA-X 新特性**：私有模式 `private $helper = "..."`（隐藏不输出）；`$_unused` 抑制告警；数字下划线 `filesize < 10_000_000`；`yr scan --output-format ndjson`。

**从旧版迁移**（99% 兼容，校验更严）：
```bash
yr check --relaxed-re-syntax rules/   # 仅用作诊断，定位问题
yr check rules/                       # 修好后不带 relaxed 复验
```
常见修复：正则中字面 `{` → `/\{/`；非法转义 `\R` → `\\R`；base64 串需 3+ 字符；负索引 `@a[-1]` → `@a[#a - 1]`；去掉重复修饰符。

**字符串失效时转向结构**：高熵段用 `math.entropy()`；导入异常用 `pe.imphash()` 聚类；瞄准节名/大小/特征或版本信息/时间戳/资源。先判是否加壳（熵 > 7.0 或可读串极少 → 多半加壳，去打未加壳层或检测壳本身，别对加壳层写规则）。

## 示例

**多指标分组聚类**（不同置信度分组表达递进要求）：
```yara
strings:
    // A 类：库指标
    $a1 = "SRWebSocket" ascii
    $a2 = "SocketRocket" ascii
    // B 类：行为指标
    $b1 = "SSH tunnel" ascii
    $b2 = "keylogger" ascii nocase
    // C 类：C2 模式
    $c1 = /https:\/\/[a-z0-9]{8,16}\.onion/
condition:
    filesize < 10MB and
    any of ($a*) and any of ($b*)   // 要求两类都有证据
```

**Chrome 扩展（crx 模块，需 v1.5.0+，permhash 需 v1.11.0+）**：
```yara
import "crx"
rule SUSP_CRX_HighRiskPerms {
    condition:
        crx.is_crx and
        for any perm in crx.permissions : (perm == "debugger")
}
```
红旗：`nativeMessaging`+`downloads`、`debugger` 权限、内容脚本作用于 `<all_urls>`。

**Android DEX（dex 模块，需 v1.11.0+，与旧版 dex 模块不兼容）**：
```yara
import "dex"
rule SUSP_DEX_DynamicLoading {
    condition:
        dex.is_dex and
        dex.contains_class("Ldalvik/system/DexClassLoader;")
}
```
红旗：单字母类名（混淆）、`DexClassLoader` 反射加载、加密资产。

辅助脚本：
```bash
uv run scripts/yara_lint.py rule.yar       # 校验风格/元数据
uv run scripts/atom_analyzer.py rule.yar   # 检查字符串 atom 质量
```

## 注意事项

需要警惕并拒绝的合理化借口：
- "这个通用串够独特了" → 先打 goodware，直觉常错；
- "yarGen 给的串" → yarGen 只建议，必须逐条人工校验；
- "我 10 个样本上能跑" → 10 个 ≠ 生产，用 VirusTotal goodware 语料；
- "一条规则抓所有变种" → 引发 FP 洪水，瞄准具体家族；
- "有 FP 再收紧" → 一开始就写紧，FP 烧掉信任；
- "API 名说明它恶意" → 合法软件用同样 API，需行为上下文；
- "这是狩猎规则不用太严" → 狩猎规则会变检测规则，同一质量门槛。

何时放弃当前思路：yarGen 只返回 API 名和路径、找不到 3 个唯一串（多半加壳）、规则命中 goodware（1-2 个查清收紧，3-5 个换指标，6+ 个推倒重来）、优化后性能仍差（架构问题，拆规则或加严前置过滤）、描述写不出（规则太泛）。

排查 FP：`yr scan -s rule.yar fp.exe` 看哪个串命中 → 若在合法库里加排除 → 若是常见开发模式换更具体指标 → 若多个通用串同时命中则收紧为 all 并加唯一标记 → 若是恶意软件用了常见技术则瞄准其实现细节而非技术本身。

部署前清单：命名合规；description 以「Detects」开头并说明 what/how；author/reference/date 齐全；串唯一且 4+ 字节有好 atom；base64 修饰符仅用于 3+ 字符串；正则已转义 `{` 且转义合法；condition 以廉价检查开头；命中全部目标样本；goodware 语料 0 命中；`yr check` 与 `yr fmt --check` 通过；lint 通过；完成同行评审。

经验启发：mutex 名是金、C2 路径是银、错误信息是铜；栈字符串几乎总是唯一；需要 >6 个串说明在过拟合。命中 <50% 变种太窄，命中 goodware 太宽。

## 互见

- 规则属于代码评审范畴时配合 code-reviewer；
- 把规则集依赖/工具链审计交给 dependency-auditor；
- 编写新技能条目时参考 skill-creator。

---
本条采编自 trailofbits/skills（CC-BY-SA-4.0），适配重写为中文技能大典条目。
