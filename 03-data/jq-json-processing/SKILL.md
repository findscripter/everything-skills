---
name: jq-json-processing
title: jq JSON 查询与转换
description: 当处理 API/CLI/日志输出的 JSON 时使用；用 jq 过滤、转换、聚合并产出结构化结果或 CSV/TSV/原始文本；不适用于写文件或非 JSON 数据。触发词：jq、JSON 解析、JSON 转换
domain: 数据/wrangling
triggers: [jq, JSON 解析, JSON 过滤, JSON 转换, 提取 JSON 字段, JSON 转 CSV, 解析接口返回的 JSON, kubectl/aws/gh JSON 输出]
tags: [jq, json, shell, cli, 数据转换, bash, 数据/misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [jq, bash, shell]
requires: []
related: [polars-dataframe, csv-data-cleaner, sql-query-builder]
combines_with: [csv-data-cleaner, polars-dataframe, matplotlib-visualization]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 解析 API、CLI 工具（AWS、GitHub、kubectl、docker）或日志文件输出的 JSON。
- 转换 JSON 结构：重命名键、扁平化数组、按字段分组、构造新对象。
- 在 bash 脚本或一行命令里嵌入 jq。
- 需要解释一段复杂 jq 表达式的含义。

不该用的边界：

- jq 只读，无法写文件或执行命令；需要落盘/改文件请用其他工具。
- 输入不是 JSON（如纯文本、CSV、YAML）时不适用，先转换或改用 awk/yq 等。
- 不能替代环境相关的校验、测试或专家复核；缺少输入、权限或成功标准时先澄清。

## 步骤

1. 先用 `jq 'keys'` 或 `jq '.'` 探查实际结构与字段名（JSON 大小写敏感）。
2. 用 `.field`、`.[]`、`.[i]` 定位数据，用管道 `|` 逐级组合过滤器。
3. 用 `select(...)` 过滤、`map(...)`/`{...}` 转换、`add`/`group_by` 聚合。
4. 输出给 shell 变量或下游命令时加 `-r` 去引号；NDJSON 管道用 `-c`。
5. 注入外部变量一律用 `--arg`（字符串）/`--argjson`（数字、布尔、JSON），切勿把 shell 变量直接拼进过滤器字符串。

## 指令

- 取字段 / 嵌套：`jq '.name'`、`jq '.user.email'`
- 数组：索引 `jq '.[1]'`、切片 `jq '.[2:4]'`、遍历 `jq '.[]'`
- 过滤：`jq '[.[] | select(.role == "admin")]'`，多条件 `select(.active == true and .score >= 80)`
- 转换：`jq 'map(.name)'`、构对象 `jq '[.[] | {user: .name, years: .age}]'`、加字段 `jq '[.[] | . + {senior: (.age > 28)}]'`
- 聚合：`jq 'add'`、`jq '[.[].price] | add'`、`jq 'length'`、`jq 'max_by(.score)'`、`jq 'group_by(.status) | map({status: .[0].status, count: length})'`
- reduce：`jq 'reduce .[] as $x (0; . + $x)'`
- 格式化（配 `-r`）：插值 `"\(.name) is \(.age)"`、`@csv`、`@tsv`、`@uri`、`@base64`
- 键与路径：`jq 'keys'`、`jq 'has("email")'`、`jq 'del(.password)'`、递归取值 `jq '.. | .id? // empty'`
- 条件与容错：`if .score >= 90 then "A" elif .score >= 80 then "B" else "C" end`、默认值 `.nickname // .name`、容错 `try .nested.value catch null`
- 多文件/多行：`jq -s '.' records.ndjson`、`jq -s 'add' a.json b.json`
- 进阶：`unique_by(.email)`、`flatten(1)`、`transpose`、`walk(if type=="string" then ascii_downcase else . end)`、`jq -n 'env.API_KEY'`

## 示例

```bash
# 提取字段
echo '{"name":"alice","age":30}' | jq '.name'        # "alice"

# 过滤管理员并收回数组
echo '[{"role":"admin"},{"role":"user"},{"role":"admin"}]' \
  | jq '[.[] | select(.role == "admin")]'

# 求和一个字段
jq '[.[].price] | add'

# 安全注入 shell 变量（字符串用 --arg，数字用 --argjson）
STATUS="active"
jq --arg s "$STATUS" '[.[] | select(.status == $s)]'
jq --argjson threshold 42 '[.[] | select(.value > $threshold)]'

# 转 CSV（-r 去引号）
jq -r '.[] | [.name, .age, .email] | @csv'

# 对象的数组 -> 数组的对象
# 输入: {"names":["a","b"],"scores":[10,20]}
jq '[.names, .scores] | transpose | map({name: .[0], score: .[1]})'

# 与外部 CLI 串联
kubectl get pods -o json | jq '.items[] | {name: .metadata.name, status: .status.phase}'
gh pr list --json number,title | jq -r '.[] | "\(.number)\t\(.title)"'
aws ec2 describe-instances \
  | jq -r '.Reservations[].Instances[] | select(.State.Name=="running") | .InstanceId'
```

## 注意事项

- 传给 shell 变量或下游命令时务必加 `-r`，去掉 JSON 字符串引号。
- 注入变量只用 `--arg`/`--argjson`，绝不把 shell 变量直接拼进过滤器字符串（既防注入又防引号问题）。
- 过滤器在脚本中用单引号 `jq '.field'`，避免 shell 提前展开；用双引号易出错。
- `map(f)` 比 `[.[] | f]` 更易读；用 `empty` 丢弃元素而非过滤成 `null`。
- 常见坑：
  - 输出 `null` 而非预期值：多半是键名拼错，先 `jq 'keys'` 查实际字段名。
  - 数字被当成字符串：注入数值用 `--argjson` 而非 `--arg`。
  - 空数组 `add` 返回 `null`：用 `add // 0` 或 `add // ""` 兜底。
  - 大文件处理慢：试 `jq --stream`，或改用 `jstream` / `gron`。
- 安全：jq 设计上只读，不能写文件或执行命令；勿把不可信的 JSON 字段值直接拼进 shell 命令，始终加引号或用 `--arg`。

## 互见

- `bash-pro` / `bash-linux`：把 jq 调用封装进健壮的 shell 脚本与管道。
- `github-automation`：结合 GitHub CLI 的 JSON 输出使用 jq。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
