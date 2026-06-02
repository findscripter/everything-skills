---
name: bazel-build-optimization
title: Bazel 大型单仓构建优化
description: 当为大型 monorepo 配置 Bazel、接入远程缓存/远程执行或优化构建耗时时使用；产出 .bazelrc/WORKSPACE/BUILD 配置、查询脚本与性能剖析方案；不适用于非 Bazel 构建系统（Maven/Gradle/CMake 等）或单工程小项目。触发词：Bazel、monorepo、远程缓存
domain: 研发/devops
triggers: [Bazel, monorepo, 单仓, 远程缓存, remote cache, 远程执行, remote execution, 构建优化, BUILD.bazel, .bazelrc, bazel query, 构建变慢]
tags: [bazel, 构建优化, monorepo, 远程缓存, 远程执行, CI, 研发效能, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bazel, git, dot]
requires: []
related: [turborepo-caching, monorepo-navigator, ci-cd-pipeline-builder, fullstack-project-scaffolder]
combines_with: [monorepo-navigator, ci-cd-pipeline-builder, docker-development-optimizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 为大型 monorepo（多语言、多团队）首次搭建或重构 Bazel。
- 接入远程缓存（remote cache）/ 远程执行（RBE），跨开发者和 CI 共享构建产物。
- 构建/测试耗时过长，需要定位慢 action、调资源并发、做增量优化。
- 编写自定义规则（rule/aspect），用 `bazel query` 做依赖与影响面分析。
- 从其他构建系统（Maven/Gradle/Make）迁移到 Bazel。

不该用（负边界）：

- 任务与 Bazel 无关，或目标构建系统是 Maven/Gradle/CMake/npm scripts 等非 Bazel。
- 单一小工程、无跨模块复用诉求——引入 Bazel 的维护成本通常不划算。
- 需要环境特定的安全/合规评审：本技能产物须经本地实测验证，不能替代专家审查。

## 步骤

1. 明确目标与约束：语言栈、仓库规模、CI 平台、是否已有远程缓存/执行后端、可复现性要求。
2. 固定版本与目录骨架：写 `.bazelversion`、`WORKSPACE.bazel`（或 MODULE.bazel）、按目录粒度放 `BUILD.bazel`。
3. 写 `.bazelrc`：分离本地、`remote-cache`、`remote-exec`、`ci` 等 config，用 `--config=xxx` 切换。
4. 接缓存/执行：先上远程缓存（收益最稳），再按需上远程执行；用 platform + toolchain 描述执行环境。
5. 用 `bazel query` 做依赖/反向依赖/变更影响面分析，缩小 CI 构建范围。
6. 性能剖析：`--profile` + `analyze-profile` 找瓶颈，调 `--jobs`、本地资源、缓存命中。
7. 实测验证：清缓存冷构建 + 增量构建对比耗时与缓存命中率，再固化进 CI。

## 指令

骨架（关键文件）：

```
workspace/
├── WORKSPACE.bazel    # 外部依赖
├── .bazelrc           # 构建配置（分 config）
├── .bazelversion      # 锁定 Bazel 版本
├── BUILD.bazel        # 根 BUILD
├── apps/web/BUILD.bazel
├── libs/utils/BUILD.bazel
└── tools/bazel/rules/ # 自定义规则
```

核心概念：Target（可构建单元）/ Package（含 BUILD 的目录）/ Label（`//path/to:target`）/ Rule（如何构建）/ Aspect（横切构建行为）。

`.bazelrc` 关键项（性能 + 缓存 + 远程，分 config）：

```bash
# 性能
build --jobs=auto
build --local_cpu_resources=HOST_CPUS*.75
build --local_ram_resources=HOST_RAM*.75

# 本地缓存
build --disk_cache=~/.cache/bazel-disk
build --repository_cache=~/.cache/bazel-repo

# 远程缓存（可选）
build:remote-cache --remote_cache=grpcs://cache.example.com
build:remote-cache --remote_upload_local_results=true
build:remote-cache --remote_timeout=3600

# 远程执行（可选）
build:remote-exec --remote_executor=grpcs://remote.example.com
build:remote-exec --remote_instance_name=projects/myproject/instances/default
build:remote-exec --jobs=500

# CI 复用远程缓存 + BES 上报
build:ci --config=remote-cache
build:ci --bes_results_url=https://results.example.com/invocation/
build:ci --bes_backend=grpcs://bes.example.com

test --test_output=errors
try-import %workspace%/user.bazelrc
```

依赖与影响面分析（`bazel query`）：

```bash
# 正向依赖 / 反向依赖
bazel query "deps(//apps/web:web)"
bazel query "rdeps(//..., //libs/utils:utils)"

# 自上次提交以来受影响的目标（用于 CI 增量构建）
bazel query "rdeps(//..., set($(git diff --name-only HEAD~1 | sed 's/.*/\"&\"/' | tr '\n' ' ')))"

# 所有测试目标 / 依赖图导出
bazel query "kind('.*_test', //...)"
bazel query "deps(//apps/web:web)" --output=graph | dot -Tpng > deps.png
```

性能剖析：

```bash
bazel build //... --profile=profile.json
bazel analyze-profile profile.json          # 找慢阶段
bazel build //... --execution_log_json_file=exec_log.json  # 定位慢 action
bazel build //... --memory_profile=memory.json
```

远程执行的 platform/toolchain（描述执行环境）：

```python
# platforms/BUILD.bazel
platform(
    name = "linux_x86_64",
    constraint_values = [
        "@platforms//os:linux",
        "@platforms//cpu:x86_64",
    ],
    exec_properties = {
        "container-image": "docker://gcr.io/myproject/bazel-worker:latest",
        "OSFamily": "Linux",
    },
)
```

## 示例

为含 TS 与 Python 的 monorepo 接入远程缓存并缩小 CI 构建范围：

1. `libs/utils/BUILD.bazel` 用 `ts_project` + `js_library` 声明库，`jest_test` 跑测试；`libs/ml/BUILD.bazel` 用 `py_library`/`py_test`，依赖经 `requirement("numpy")` 显式列出，并依赖 `//libs/utils:utils_py`。
2. `.bazelrc` 配 `build:remote-cache`，开发与 CI 均 `bazel build //... --config=remote-cache`，共享产物。
3. CI 上用上面的 `rdeps(... git diff ...)` 仅构建/测试受改动影响的目标，而非全量。
4. 上线前：清缓存冷构建一次记录基线耗时，再改一处增量构建，对比缓存命中率确认收益。

## 注意事项

推荐做法：

- 细粒度 target —— 缓存命中更高。
- 锁版本/钉依赖（`.bazelversion` + sha256）—— 可复现构建。
- 优先上远程缓存共享产物；按目录写 BUILD；用 `visibility` 约束架构。

避免：

- 别用 `glob` 收集 `deps`，依赖要显式。
- 别提交 `bazel-*` 软链目录，加进 `.gitignore`。
- 别跳过 WORKSPACE/MODULE 基础配置；别忽略构建告警（技术债）。
- 远程执行成本与运维高于远程缓存，先缓存后执行；产物务必本地实测，缺输入/权限/成功标准时停下来澄清。

## 互见

- Bazel 官方文档：https://bazel.build/docs
- 远程执行：https://bazel.build/docs/remote-execution
- rules_js：https://github.com/aspect-build/rules_js

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
