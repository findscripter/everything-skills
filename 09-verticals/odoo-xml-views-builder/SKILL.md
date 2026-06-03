---
name: odoo-xml-views-builder
title: Odoo XML 视图构建
description: 当为 Odoo 模型编写或修复 Form/List/Kanban/Search/Calendar/Graph 视图 XML 时使用；做生成可直接粘贴的 ir.ui.view 视图定义并处理 v14-16 的 attrs 到 v17 内联表达式迁移、visibility/groups/domain/widget 配置；不适用于 OWL/JS 组件、searchpanel、website QWeb 模板及企业版 Cohort/Map 视图；触发词：odoo 视图、ir.ui.view、form/list/kanban/search 视图、attrs、invisible、statusbar、notebook
domain: 领域/erp
triggers: [odoo 视图, ir.ui.view, form view, list view, kanban view, search view, attrs, invisible, statusbar, notebook, widget, smart button, fiscal, arch type xml]
tags: [odoo, erp, xml, ir.ui.view, form-view, kanban, frontend, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo, XML, ir.ui.view]
requires: []
related: [odoo-module-developer, odoo-orm-expert, odoo-qweb-templates, odoo-security-rules]
combines_with: [odoo-module-developer, odoo-qweb-templates]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
＞ 重要冲突待裁决：任务指定 `domain: 领域/ERP`，但 `taxonomy.json` 中 `09-verticals`(领域) 的受控类只有 `science/legal/medical/edu/fintech/hardware`，**不含 ERP**。`scripts/build-index.mjs` 第 107-108 行对越界类报 **error**（非 warning），故 `领域/ERP` 会导致校验失败。建议二选一：① 在 `taxonomy.json` 给 `09-verticals.classes` 增补 `"erp"`（slug 惯例小写，故用 `领域/erp`）；② 沿用兄弟条目 `odoo-localization-compliance` 的 `领域/fintech`。下方正文按任务以 ERP 语义撰写，落盘前请先定 domain。

# Odoo XML 视图构建

## 何时使用

为 Odoo 自定义模型生成或评审视图 XML 时使用，覆盖 Odoo 14–17：

- 为新模型创建 Form / List(tree) 视图。
- 给已有视图加字段、标签页(notebook/page)或智能按钮(smart button)。
- 构建带颜色/进度条/分组的 Kanban 视图。
- 创建带过滤器、group-by 的 Search 视图。
- 把粘贴进来的旧 XML 修成符合目标版本的写法（尤其 `attrs`→内联表达式迁移）。

**不该用边界**：① OWL JavaScript 客户端组件 / 自定义 widget 开发；② `<searchpanel>` 搜索面板（需前端知识）；③ website 的 QWeb 模板（用 odoo-qweb-templates）；④ 企业版专属的 Cohort、Map 视图。另：业务逻辑不进视图 XML，留在 Python 模型方法里。

## 步骤

1. **定版本**：先确认目标 Odoo 版本——它决定可见性语法（v17+ 用内联 `invisible="condition"`，v14–16 用 `attrs`）。版本未知先追问。
2. **定视图类型**：Form / List / Kanban / Search / Calendar / Graph 之一，每种有固定根标签。
3. **写 record 壳**：`<record model="ir.ui.view">` + `name` / `model` / `arch type="xml"` 三字段，根标签内放视图体。
4. **填字段与结构**：Form 用 `header`/`sheet`/`group`/`notebook`；Kanban 必须在 `<templates>` 里先 `<field>` 声明再在卡片引用。
5. **可见性逻辑**：按版本选 `invisible=`（v17+）或 `attrs="{'invisible': [...]}"`（v14–16），配合 `groups` 控权限。
6. **自检**：核对 `string` 调试名、chatter 写法是否匹配版本，再粘贴入模块。

## 指令

版本语法对照（最关键约束）：

| 能力 | Odoo 17+ | Odoo 14–16 |
|---|---|---|
| 条件隐藏 | `invisible="state != 'draft'"`（内联表达式） | `attrs="{'invisible': [('state','!=','draft')]}"` |
| 聊天器 | `<chatter/>` | `<div class="oe_chatter">` + message/activity 字段标签 |

- v17 中 `attrs` 已**完全弃用**，会在日志报警告——目标 v17 时禁止再用。
- 始终给视图 `<record>` 或根标签设 `string`，便于调试定位。
- domain 优先用模型上的 domain 字段动态计算，避免在视图里硬编码 domain 字符串。

## 示例

**Form 视图（带 header / statusbar / notebook / chatter，v17 语法）**

```xml
<record id="view_hospital_patient_form" model="ir.ui.view">
    <field name="name">hospital.patient.form</field>
    <field name="model">hospital.patient</field>
    <field name="arch" type="xml">
        <form string="Patient">
            <header>
                <button name="action_confirm" string="Confirm"
                    type="object" class="btn-primary"
                    invisible="state != 'draft'"/>
                <field name="state" widget="statusbar"
                    statusbar_visible="draft,confirmed,done"/>
            </header>
            <sheet>
                <div class="oe_title">
                    <h1><field name="name" placeholder="Patient Name"/></h1>
                </div>
                <notebook>
                    <page string="General Info">
                        <group>
                            <field name="birth_date"/>
                            <field name="doctor_id"/>
                        </group>
                    </page>
                </notebook>
            </sheet>
            <chatter/>
        </form>
    </field>
</record>
```

**Kanban 视图（字段须在 templates 外先声明）**

```xml
<record id="view_hospital_patient_kanban" model="ir.ui.view">
    <field name="name">hospital.patient.kanban</field>
    <field name="model">hospital.patient</field>
    <field name="arch" type="xml">
        <kanban default_group_by="state" class="o_kanban_small_column">
            <field name="name"/>
            <field name="state"/>
            <field name="doctor_id"/>
            <templates>
                <t t-name="kanban-card">
                    <div class="oe_kanban_content">
                        <strong><field name="name"/></strong>
                        <div>Doctor: <field name="doctor_id"/></div>
                    </div>
                </t>
            </templates>
        </kanban>
    </field>
</record>
```

## 注意事项

- **版本是头等输入**：搞错 `attrs`/内联语法是最常见的破坏点；v17 用 `attrs` 会报警告。
- chatter 写法随版本变（v17 `<chatter/>` vs v16 及以下 `oe_chatter` div + 字段标签）。
- 业务逻辑放 Python 模型方法，不要塞进视图 XML。
- Kanban 卡片引用的字段必须先在 `<templates>` 之外用 `<field>` 声明，否则取不到值。
- 本技能不覆盖 OWL/JS widget、searchpanel、website QWeb、企业版 Cohort/Map。

## 互见

- related：`odoo-localization-compliance` —— 同属 Odoo/ERP 领域，本地化与财税合规配置常与视图改造并行。
- combines_with：`odoo-qweb-templates`（如已采编）—— website/报表 QWeb 模板与后端视图互补；本仓库暂未收录，待后续补边。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
