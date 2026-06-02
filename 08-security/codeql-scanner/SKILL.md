---
name: codeql-scanner
title: CodeQL 数据流漏洞扫描
description: 当需要对代码库做深度安全审计、用 CodeQL 跨过程数据流/污点跟踪挖掘漏洞时使用；做的事是建库→建数据扩展→跑查询套件并产出 SARIF 报告；不适用于写自定义 QL 查询、CI/CD 集成、无法编译的语言或快速正则匹配（用 Semgrep/grep）；触发词：codeql、跑 codeql、codeql 扫描、codeql analysis、数据流分析、污点跟踪、SARIF、建 codeql 数据库
domain: 安全/appsec
triggers: [codeql, 跑 codeql, codeql 扫描, codeql scan, codeql analysis, 数据流分析, 污点跟踪, taint tracking, SARIF, 建 codeql 数据库, find vulnerabilities with codeql]
tags: [security, appsec, codeql, sast, taint-tracking, dataflow, sarif, vulnerability-scanning]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [codeql, jq, bash, find, grep]
requires: []
related: [semgrep-rule-creator, sast-configurator, vulnerability-variant-analysis, c-cpp-security-review]
combines_with: [false-positive-check, vulnerability-variant-analysis, sast-configurator]
license: CC-BY-SA-4.0
source: trailofbits/skills
source_license: CC-BY-SA-4.0
---
## 何时使用

适用：
- 用 CodeQL 的跨过程数据流 / 污点跟踪深挖安全漏洞（注入、路径穿越、SSRF、反序列化等需要顺着 source→sink 链路追踪的复杂问题）。
- 从源码构建 CodeQL 数据库（含编译型语言需要追踪构建过程的情况）。
- 用多个 query pack 做体系化安全审计。
- 支持语言：Python、JavaScript/TypeScript、Go、Java/Kotlin、C/C++、C#、Ruby、Swift。

不该用（负边界）：
- 写自定义 QL 查询 —— 用专门的查询开发流程，本条只负责跑现成套件。
- CI/CD 集成 —— 直接看 GitHub Actions 文档。
- 只想快速正则/模式匹配 —— 用 Semgrep 或 grep，更快。
- 编译型语言但无法在本机完成构建 —— 优先考虑 Semgrep；`--build-mode=none` 只是最后兜底，分析严重不完整。
- 单文件或轻量检查 —— Semgrep 更合适。

## 步骤

整条流水线固定为三步：**建库 → 建数据扩展 → 跑分析**。所有产物统一落到一个 `$OUTPUT_DIR`。

1. 环境与输出目录：确认 `codeql` 在 PATH 上（`codeql --version`）。用户指定了输出目录就用它；否则默认 `static_analysis_codeql_1`，存在则自增 `_2`、`_3`……，并先 `mkdir -p` 创建。
2. 发现已有数据库：用 marker 文件 `codeql-database.yml` 识别数据库（不要假定它叫 `codeql.db`）。先在 `$OUTPUT_DIR` 内找，再回退到项目根（顶层 + 下探一层）。`find . -maxdepth 3 -name "codeql-database.yml"`。找到多个时，逐个用 `codeql resolve database` 取语言和创建时间，列给用户选；用户已在指令里指明用哪个或要新建时，跳过询问。
3. 建库（build-database）：`codeql database create $DB_NAME --language=$CODEQL_LANG --source-root=. --overwrite`，编译型语言带 `--command='$BUILD_CMD'`。**建好不等于建对**：必须做质量评估（文件数、baseline LoC、抽取错误率），与预期源文件比对。baseline LoC 必须 > 0、错误率 < 5%。
4. 建数据扩展（create-data-extensions）：即便用 Django/Spring/Express 等标准框架，项目仍会有包裹数据库调用、请求解析、命令执行的自定义封装，CodeQL 默认建模不到。生成对应 source/sink 模型 YAML 放到 `$OUTPUT_DIR/extensions/`；若确实跳过，要给出明确理由。
5. 选规则并跑分析（run-analysis）：选扫描模式（见下），选 query pack、model pack 和威胁模型，执行查询。
6. 处理结果：未过滤的原始结果保留在 `$OUTPUT_DIR/raw/results.sarif`，最终结果落到 `$OUTPUT_DIR/results/results.sarif`（important-only 过滤、run-all 直接拷贝）。把选用的 pack 记到 `$OUTPUT_DIR/rulesets.txt`。

## 指令

五条不可妥协的原则：
1. **数据库质量一票否决** —— 能 build 不代表抽取得好；缓存命中的构建抽取量为零。永远做质量评估。
2. **数据扩展补 CodeQL 的盲区** —— 跳过 create-data-extensions 就会漏掉项目特有代码路径里的漏洞。
3. **永远用显式套件引用，别直接传 pack 名** —— 切勿 `codeql database analyze ... -- codeql/cpp-queries`。每个 pack 的 `defaultSuiteFile` 会偷偷套强过滤，可能直接 0 结果。务必生成自定义 `.qls` 套件。
4. **0 结果要查不要庆祝** —— 0 结果可能意味着库质量差、缺模型、选错 pack 或套件被静默过滤；报「干净」前先排查。
5. **macOS Apple Silicon 编译型语言需绕坑** —— 退出码 137 是 `arm64e`/`arm64` 不匹配而非构建失败；先试 Homebrew arm64 工具链或 Rosetta，再考虑 `--build-mode=none`。

两种扫描模式：
- **Run all（推荐，最大覆盖）**：同时导入 `security-and-quality` + `security-experimental` 两个套件。注意 `security-and-quality` 排除了所有 `experimental/` 路径，单用会漏 1–52 条查询（视语言而定）。
- **Important only**：按精度和 security-severity 阈值过滤的高精度安全发现。

别迷信 `security-extended`：它只是基线。对应语言若有 Trail of Bits packs 或 GitHubSecurityLab 社区 packs，要一并检查启用，它们能覆盖 `security-extended` 完全遗漏的类别。

## 示例

最常见场景「扫描这个代码库找漏洞」：

```bash
# 1. 确认 CodeQL 已安装
command -v codeql >/dev/null 2>&1 && codeql --version || echo "NOT INSTALLED"

# 2. 解析输出目录（自增）
BASE="static_analysis_codeql"; N=1
while [ -e "${BASE}_${N}" ]; do N=$((N + 1)); done
OUTPUT_DIR="${BASE}_${N}"; mkdir -p "$OUTPUT_DIR"

# 3. 建库（解释型语言示例）
codeql database create "$OUTPUT_DIR/codeql.db" --language=python --source-root=. --overwrite

# 4. 跑分析：用显式 .qls 套件，never 直接传 pack 名
codeql database analyze "$OUTPUT_DIR/codeql.db" \
  --format=sarif-latest \
  --output="$OUTPUT_DIR/raw/results.sarif" \
  --threads=0 \
  $THREAT_MODEL_FLAG $MODEL_PACK_FLAGS $ADDITIONAL_PACK_FLAGS \
  -- "$SUITE_FILE"
```

model pack 引入方式：已安装的用 `--model-packs=myorg/java-models`；仓库内 model pack 或独立扩展用 `--additional-packs=./lib/codeql-models`（或 `--additional-packs=.`）。

## 注意事项

- 所有生成文件（数据库、build.log、diagnostics、extensions、raw、results）一律进 `$OUTPUT_DIR`，不要散落在工作目录，否则无法清理且会覆盖历史运行。`$OUTPUT_DIR` 在流程开始时一次性解析好，所有子流程共用。
- 「scan / 全量扫描」不等于「替我选数据库」：存在多个数据库且用户没点名时，要问。
- 一旦选定某个工作流，按阶段顺序执行，不要跳阶段——每个阶段是下一个的门禁，跳过质量评估或数据扩展会导致分析不完整。
- 编译型语言无法构建时，`--build-mode=none` 仅作绝对最后手段。

## 互见

- code-reviewer：人工/规则向的代码审查，可与 CodeQL 的自动数据流扫描互补。
- dependency-auditor：依赖与供应链安全审计，覆盖 CodeQL 源码扫描之外的第三方组件风险。

---
本条采编自 trailofbits/skills（CC-BY-SA-4.0）。
