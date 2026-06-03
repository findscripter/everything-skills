---
name: codebase-structure-protocol
title: 代码库结构记忆协议
description: 当 Agent 需要在大型代码库中持久记忆结构、导航依赖、做改前影响分析时使用；用 .dsp/ 目录与 dsp-cli 把"实体-导入-导出及原因"外化为可查图谱并随代码增量维护；不适用于纯内部实现改动、人类文档或 AST 全量转储；触发词：.dsp、dsp-cli、结构映射
domain: 通用/research
triggers: [项目存在 .dsp/ 目录, 要求 bootstrap 或映射项目结构, 在 DSP 跟踪的项目中增删改代码文件, 导航依赖/查找模块, 重构或替换依赖前做影响分析, 提到 DSP、dsp-cli、.dsp]
tags: [代码库导航, 依赖图, 影响分析, 结构记忆, 重构, 上下文优化]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [dsp-cli.py, Bash, Read]
requires: []
related: [filesystem-context-offload, monorepo-navigator, codebase-onboarding-doc, agents-md-maintainer]
combines_with: [codebase-to-prd, legacy-codebase-modernizer, tech-debt-prioritizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

满足以下任一情况时使用：

- 项目已有 `.dsp/` 目录（DSP 已搭好）。
- 用户要求搭建 DSP、bootstrap 或映射项目结构。
- 在 DSP 跟踪的项目中**新建/修改/删除代码文件**，需同步图谱。
- 导航项目结构、理解依赖、定位模块。
- 重构或替换某依赖**前**做影响分析（谁会被波及）。
- 用户提到 DSP、`dsp-cli`、`.dsp` 或"结构映射"。

**不该用**：仅改了内部实现而未影响实体的用途或依赖时，不要动 `.dsp/`。DSP 不是给人看的文档，也不是 AST 全量转储；不要为每个局部变量或私有 helper 建实体，只记文件级 Object 与公开/共享实体。

## 核心模型

- **代码即图**：有向图。节点是**实体**，边是 `imports` 与 `shared`(导出)。实体两类——**Object**（非函数的"东西"：模块/文件/类/配置/资源/外部依赖）和 **Function**（导出的函数/方法/handler/pipeline）。
- **按 UID 定身份，不按路径**：每个实体有稳定 UID——Object 为 `obj-<8hex>`，Function 为 `func-<8hex>`。路径是可变属性，UID 在重命名、移动、重排版后不变。文件内实体用源码注释锚点绑定 UID：
  ```js
  // @dsp func-7f3a9c12
  export function calculateTotal(items) { ... }
  ```
- **每条连接都有"为什么"**：记录 import 时存一句简短 reason，写在被导入实体的 `exports/` 反向索引里。无 reason 的依赖图只告诉你"谁导入谁"，reason 才告诉你**改它安全吗、谁会坏**——DSP 的价值大半在此。
- **全导入覆盖**：任何被引用的文件/产物（代码、图片、样式、配置、JSON、wasm…）都要在 `.dsp` 里有对应 Object。外部依赖记为 `kind: external`，加入 TOC，但**绝不深入** `node_modules`/`site-packages` 分析其内部。

存储为纯文本，可 diff、可评审，无需数据库。目录结构：
```
.dsp/
├── TOC                  # 从根开始的全部实体 UID 有序列表
├── obj-a1b2c3d4/
│   ├── description      # 源路径、kind、用途（1-3 句）
│   ├── imports          # 依赖的 UID（每行一个）
│   ├── shared           # 公开 API / 导出实体的 UID
│   └── exports/         # 反向索引：谁导入了我、为什么
└── func-7f3a9c12/ ...
```

## 步骤

**前置**：依赖独立 Python CLI 脚本 `dsp-cli.py`（需 Python 3.10+）。若项目缺失，下载：
```bash
curl -O https://raw.githubusercontent.com/k-kolomeitsev/data-structure-protocol/main/skills/data-structure-protocol/scripts/dsp-cli.py
```
所有命令形如 `python dsp-cli.py --root <项目根> <command>`。

**Bootstrap（首次映射，`.dsp/` 为空时）**：沿 import 从根入口做 DFS。
1. 识别根入口（`package.json` 的 main、框架入口、`main.py` 等）。
2. 记录根文件：`create-object`，为每个导出 `create-function`，再 `create-shared`，对所有依赖 `add-import`。
3. 取第一个**非外部**导入，完整记录它，下钻进它的 imports。
4. 无未访问的本地导入时回溯；直到所有可达文件都被记录。
5. 外部依赖：`create-object --kind external` 并加入 TOC，但不下钻。

**改代码时的对应动作**（仅在用途或依赖变化时才动 DSP）：

| 代码变更 | DSP 动作 |
|---|---|
| 新建文件/模块 | `create-object` + `create-function` + `create-shared` + `add-import` |
| 新增 import | `add-import`（新依赖先 `create-object --kind external`） |
| 移除 import | `remove-import` |
| 新增导出 | `create-shared`（新函数先 `create-function`） |
| 移除导出 | `remove-shared` |
| 重命名/移动文件 | `move-entity`（UID 不变） |
| 删除文件 | `remove-entity`（级联清理自动完成） |
| 用途变化 | `update-description` |
| 仅内部实现改动 | **无需更新 DSP** |

**改前必做**：用 `search` / `find-by-source` / `read-toc` 找到受影响实体，读它们的 `description` 与 `imports` 理解上下文，再动手。

## 指令

关键命令分组：
- **创建**：`init`、`create-object`、`create-function`、`create-shared`、`add-import`
- **更新**：`update-description`、`update-import-why`、`move-entity`
- **删除**：`remove-import`、`remove-shared`、`remove-entity`
- **导航**：`get-entity`、`get-children --depth N`、`get-parents --depth N`、`get-path`、`get-recipients`、`read-toc`
- **搜索**：`search <query>`、`find-by-source <path>`
- **诊断**：`detect-cycles`、`get-orphans`、`get-stats`

## 示例

**示例 1：搭建 DSP 并记录一个模块**
```bash
python dsp-cli.py --root . init
python dsp-cli.py --root . create-object "src/app.ts" "应用主入口"
# 输出: obj-a1b2c3d4
python dsp-cli.py --root . create-function "src/app.ts#start" "启动 HTTP 服务" --owner obj-a1b2c3d4
# 输出: func-7f3a9c12
python dsp-cli.py --root . create-shared obj-a1b2c3d4 func-7f3a9c12
python dsp-cli.py --root . add-import obj-a1b2c3d4 obj-deadbeef "HTTP 路由"
```

**示例 2：改动前导航图谱**
```bash
python dsp-cli.py --root . search "authentication"
python dsp-cli.py --root . get-entity obj-a1b2c3d4
python dsp-cli.py --root . get-children obj-a1b2c3d4 --depth 2
python dsp-cli.py --root . get-recipients obj-a1b2c3d4
python dsp-cli.py --root . get-path obj-a1b2c3d4 func-7f3a9c12
```

**示例 3：替换某库前的影响分析**
```bash
python dsp-cli.py --root . find-by-source "lodash"
# 输出: obj-11223344
python dsp-cli.py --root . get-recipients obj-11223344
# 列出所有导入 lodash 的模块及"为什么"——据此可系统化替换
```

## 注意事项

- 创建文件、新增 import、改公开 API 时**立即**更新 DSP，别攒着。
- 记 import 时务必写有意义的 `why`，这是 DSP 价值集中地。
- 第三方库一律 `kind: external`，不分析其内部。
- `description` 保持精简（1-3 句讲用途，不讲实现）。
- 把 `.dsp/` 的 diff 当代码 diff 评审，保持准确。
- 重命名/移动**不要**改 UID，用 `move-entity`。
- 仅内部实现改动**不要**碰 `.dsp/`。
- 仅在任务明确落入上述范围时使用；产物不替代环境内验证、测试与专家评审；缺少必要输入、权限、安全边界或成功标准时，停下来澄清。

## 互见

- **上下文压缩 / 上下文优化**：DSP 用定向检索替代"全量加载"，减少压缩需求，agent 只拉取最小"上下文包"。
- **架构设计**：DSP 捕获的导入/导出边界即架构边界，可反哺系统设计决策。

---
采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT），原协议出处 [k-kolomeitsev/data-structure-protocol](https://github.com/k-kolomeitsev/data-structure-protocol)。
