---
name: codebase-to-prd
title: 代码库逆向生成PRD
description: 当拿到现有前端/后端/全栈代码库、需要逆向产出产品需求文档（PRD）或功能清单时使用；做三阶段扫描（全局扫描→逐页深析→结构化文档生成）并产出可让工程师或 AI 完整重建每个页面与接口的业务可读 PRD（README+分页文档+枚举/接口/页面关系附录）；不适用于无源码的纯需求规划、UI 视觉走查或单纯代码审查。触发词：生成PRD、逆向需求文档、代码转文档、梳理页面字段与接口
domain: 文书/writing
triggers: [生成PRD, 逆向生成需求文档, 把代码库转成PRD, code to prd, reverse-engineer requirements, 从现有代码提取产品规格, 梳理页面字段和交互, 整理功能清单, 记录API接口文档, 分析后端路由, 为已有项目补写需求文档]
tags: [PRD, 逆向工程, 需求文档, 代码分析, 产品文档, 接口清单, 前端, 后端, 全栈, 文书写作]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob, Bash, Write]
requires: []
related: [docs-architect, product-manager-toolkit, codebase-onboarding-doc, technical-reference-builder]
combines_with: [docs-architect, doc-coauthoring]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当你拿到一个**已有源码**的前端、后端或全栈项目，需要把它逆向成一份**业务可读、又足够细到能让工程师或 AI 完整重建每个页面/接口**的 PRD（产品需求文档）时使用。典型场景：给祖传项目补需求文档、从代码抽取产品规格、整理页面字段与交互清单、梳理 API 接口与枚举字典。

支持栈：
- **前端**：React、Vue、Angular、Svelte、Next.js（App/Pages Router）、Nuxt、SvelteKit、Remix、Astro。
- **后端**：NestJS、Express、Fastify、Django、Django REST Framework、FastAPI、Flask。
- **全栈**：Next.js（API routes + pages）、Nuxt（server/ + pages/）、Django（views + templates）。

> 后端项目里，「页面」概念映射为 **API 资源组 / admin 视图**：路由→接口，组件→控制器/视图，交互→请求/响应流。同一套三阶段流程仍然适用。

**不该用的边界：**
- 没有可读源码、纯凭口述做需求规划 → 这是从 0 写 PRD，不是逆向。
- 只想做 UI 视觉走查、可用性评估或代码质量审查 → 用对应专门方法，本技能聚焦「业务功能复原」。
- 只要一句话接口说明、不需要完整结构化文档时，杀鸡用牛刀。

## 步骤

采用**三阶段**工作流：全局扫描 → 逐页深析 → 结构化文档生成。

### 阶段一 · 项目全局扫描
先建立全局上下文再钻页面。

1. **识别项目结构**：扫根目录，定位
   - 前端：页面/路由（`pages/ views/ routes/ app/ src/pages/`）、组件（`components/ modules/`）、路由配置（`router.ts routes.ts`）、API/service 层（`services/ api/ requests/`）、状态管理（`store/ models/ context/`）、i18n（`locales/ i18n/`，字段显示名常在此）。
   - 后端(NestJS)：模块 `*.module.ts`、控制器 `*.controller.ts`、服务 `*.service.ts`、`dto/`、实体 `*.entity.ts`、guards/pipes/interceptors。
   - 后端(Django)：apps、`urls.py`、`views.py/viewsets.py`、`models.py`、`serializers.py`、`forms.py`、`templates/`、`admin.py`。
2. **判定框架**：从 `package.json`（Node 系）或项目文件（`manage.py`→Django，`requirements.txt/pyproject.toml`→Python）识别。框架不同，路由/组件/状态写法差异极大，先判定才能准确解析。
3. **构建路由/页面清单**：从路由配置抽出全部页面 → 字段为「路由路径｜页面标题｜模块/菜单层级｜组件文件路径」。文件路由（Next.js/Nuxt）按目录结构推断。后端则产出**接口/资源清单**：「接口路径｜HTTP 方法｜控制器/视图｜所属模块/app｜是否鉴权」。NestJS 从 `@Controller` + `@Get/@Post/...` 装饰器抽；Django 从 `urls.py` 的 `urlpatterns` 和路由注册抽。
4. **梳理全局上下文**：全局状态（用户/权限/feature flag）、共享组件（布局/导航/鉴权守卫）、枚举与常量、API 基础配置（baseURL/拦截器/鉴权头/错误处理）、数据库模型（后端，关系/字段类型/约束）、中间件、DTO/Serializer。

### 阶段二 · 逐页深度分析
**每个页面产出一个独立 Markdown 文件**，按维度回答：

- **A 概述**：这页干什么（一句话）、在系统中的位置、用户什么场景到这里。
- **B 布局与区域**：搜索区/表格/详情面板/操作栏/标签页等主要区域及空间排布。
- **C 字段清单（核心，务必穷尽）**：
  - 表单页逐字段列「字段名｜类型｜必填｜默认值｜校验｜业务说明」。
  - 列表/表格页列：筛选字段（类型/必填/枚举项）、表格列（名称/格式/可排序/可筛选）、行操作按钮（各自作用）。
  - **字段名提取优先级**：① 代码硬编码显示文案 → ② i18n 译文 → ③ `placeholder/label/title` 属性 → ④ 变量名（兜底，给合理显示名）。
- **D 交互逻辑**：统一写成「用户动作 → 系统响应」。覆盖：页面加载/初始化、搜索/筛选/重置、增删改查、分页/排序/选择/批量、表单提交与校验、状态流转（如审批 待审→通过→驳回）、导入导出、字段联动（选 A 改变 B 的选项）、权限控制（按角色显隐按钮/字段）、轮询/自动刷新。模板见下方指令。
- **E 接口依赖**：
  - **情形1 已接真接口**：列「接口名｜方法｜路径｜触发时机｜关键参数｜备注」。
  - **情形2 用的是 mock/假数据**：当出现 `setTimeout`/`Promise.resolve()` 返回数据、组件内或 `*.mock.*` 定义数据、`__mocks__/` 目录 → 接口尚未真实化。此时要**从页面功能和数据形状反推应有的接口规格**：方法、建议路径、触发时机、入参（名/类型/必填/说明）、出参、核心业务逻辑。
- **F 页面关系**：入向（哪些页跳进来、传什么参）、出向（从这能去哪、传什么参）、数据耦合（哪些页共享数据或互相触发刷新）。

### 阶段三 · 生成文档
在项目根（或用户指定目录）创建 `prd/`：

```
prd/
├── README.md                  # 系统概览
├── pages/
│   ├── 01-user-mgmt-list.md   # 每页一个文件
│   └── ...
└── appendix/
    ├── enum-dictionary.md      # 全部枚举/状态码/类型映射
    ├── page-relationships.md   # 页面导航关系图
    └── api-inventory.md        # 完整接口清单
```

`README.md` 含：系统概览（2-3 段）、模块总览表、页面清单表（带文档链接）、全局说明（权限模型 + 通用交互规则）。每页文档含：Route/Module/生成日期抬头、概述、布局、字段（按区域分表）、交互（页面加载 + 各场景）、接口依赖表、页面关系、业务规则。

> **节奏**：大项目（>15 页）每模块按 3-5 页一批，先完成系统概览+页面清单，每批交用户审阅再继续；小项目（≤15 页）一次过。

## 指令

**交互逻辑统一用此模板描述：**
```
[动作]   用户点击「新建」
[响应]   弹出表单，字段：...
[校验]   姓名必填、手机号格式校验
[接口]   POST /api/user/create，携带表单数据
[成功]   Toast「创建成功」，关闭弹窗，刷新列表
[失败]   展示接口返回的错误信息
```

**可选辅助脚本**（源技能自带，纯标准库、无需 pip 安装）：
```bash
# 1. 扫描项目，输出分析 JSON（前/后端/全栈通用）
python3 scripts/codebase_analyzer.py /path/to/project -o analysis.json
# 2. 看 markdown 摘要复核
python3 scripts/codebase_analyzer.py /path/to/project -f markdown
# 3. 由分析 JSON 生成 PRD 目录骨架
python3 scripts/prd_scaffolder.py analysis.json -o prd/ -n "My App"
# 4. 按上面三阶段流程逐页填充 TODO
```

## 示例

**前端 React**：分析 `./src` → 扫组件、路由、API 调用、状态管理 → 生成 `prd/`，含分页文档、枚举字典、接口清单。

**后端 Django**：经 `manage.py` 识别 Django → 扫 `urls.py / views.py / models.py` → 输出接口、模型 schema、admin 配置、权限。

**全栈 Next.js**：分析 `.` 下 `app/` 页面与 `api/` 路由 → 生成同时覆盖 UI 页面与 API 接口的统一 PRD。

## 注意事项

1. **业务语言优先**：不要写「调用 `useState` 管理 loading」，要写「搜索按钮显示 loading 防止重复提交」；不要写「`useEffect` 挂载时拉取」，要写「打开页面自动加载第一页结果」。仅当技术细节**直接影响产品行为**时才写出来（接口路径、校验规则、权限条件）。
2. **别漏隐藏逻辑**：字段联动、按钮条件显隐、数据格式化（金额 2 位小数/日期格式/状态文案映射）、默认排序与页大小、输入防抖节流、轮询/自动刷新间隔——这些 PM 常意识不到却存在于代码里。
3. **穷尽枚举**：状态码/类型码/角色类型等枚举要**列全每个值及含义**，它们常散落在常量文件、组件 `valueEnum`、接口响应映射里。
4. **存疑标注、绝不臆造**：字段或逻辑的业务含义从代码判不出（缩写变量名、过复杂条件）时标 `[TBC]`，说明观察到什么、为何不确定——绝不编造业务含义。
5. **每页文件自包含**：只读单个页面文件即可获得完整理解，引用其它页/附录时用相对链接。
6. **常见坑**：用组件名当页面名（`UserManagementTable`→「用户管理列表」）；漏掉弹窗/抽屉（含关键业务逻辑，要完整记录）；漏 i18n 字段名（查译文文件而非只看 JSX）；忽略动态路由参数（`/order/:id` 表示需订单 ID 才能加载）；忘记权限控制；默认所有接口都是真的（先查 mock 模式）；漏 Django admin 定制（`admin.py` 常含 list_filters/custom actions）；漏 NestJS 的 `@UseGuards/@UsePipes`；忽略模型约束（unique/max_length/choices 都是 PRD 的校验规则）；漏中间件（鉴权/限流/CORS 是系统级行为）。

## 互见

- 配合 `resume-builder`、`lark-doc` 等文书类技能，可把产出的 PRD 进一步导入飞书云文档或转换格式。
- 源技能附带 `references/framework-patterns.md`（各框架路由/状态/API/表单/权限模式）与 `references/prd-quality-checklist.md`（完整性/准确性/可读性校验清单），需要时可参阅。

---
*采编自 [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) 的 `code-to-prd` 技能（MIT 许可），原概念与三阶段方法论源自 [@lihanglogan](https://github.com/lihanglogan)。本条目为适配重写，非逐字翻译。*
