---
name: odoo-qweb-templates
title: Odoo QWeb 报表与模板
description: 当用 Odoo QWeb 编写 PDF 报表、邮件模板或网站页面模板（XML）时使用；做生成 ir.actions.report 报表动作 + QWeb 模板，正确运用 t-if/t-foreach/t-field/t-out 指令、external_layout 与翻译，并排查渲染报错；不适用于网站路由(http.route)、QWeb-JS 看板/表单 widget 及 wkhtmltopdf 分页页边距调试；触发词：odoo qweb、PDF 报表、ir.actions.report、t-field、t-foreach、邮件模板、external_layout
domain: 领域/erp
triggers: [odoo qweb, qweb 模板, PDF 报表, ir.actions.report, report_name, t-field, t-foreach, t-if, t-out, t-esc, 邮件模板, external_layout, 报表动作]
tags: [odoo, qweb, erp, report, pdf, template, xml, email-template]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo, QWeb, XML, ir.actions.report, wkhtmltopdf]
requires: []
related: [odoo-xml-views-builder, odoo-module-developer, odoo-orm-expert, odoo-rpc-api]
combines_with: [odoo-accounting-setup, transactional-email-template-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
_本条 frontmatter 设 `domain: 领域/ERP`（受众已定勿改）。注意：仓库 `taxonomy.json` 中 `09-verticals/领域` 的受控类目为 science/legal/medical/edu/fintech/hardware，暂无 `ERP` 类；写盘前需在 taxonomy 增补 `ERP` 类（或别名归一），否则 `scripts/build-index.mjs` 会报类校验 error。sibling `odoo-localization-compliance` 当前归在 `领域/fintech`。_

# Odoo QWeb 报表与模板

## 何时使用

需要用 Odoo 服务端 QWeb 引擎产出 XML 模板时使用：

- 定制 PDF 报表（发票、送货单、证书、卡片等），含 `ir.actions.report` 报表动作绑定。
- 编写由工作流/邮件动作触发的 QWeb 邮件模板。
- 设计带动态内容的 Odoo 网站页面。
- 排查 QWeb 渲染报错（`t-if`、`t-foreach`、`t-field` 取值问题）。

**不该用边界**：

- **网站动态页路由**——需 Python `http.route` 控制器知识，本技能不覆盖。
- **QWeb-JS**（看板/表单 widget 用的客户端 QWeb）是另一套引擎，本技能只管**服务端 QWeb**。
- **wkhtmltopdf 配置**（页面尺寸、页边距、页眉页脚重叠）不在范围内。
- 邮件模板的变量作用域与报表不同（`object` vs `docs`），本技能以 **PDF 报表**为主。

## 步骤

1. **建报表动作**：写 `ir.actions.report` 记录，关键字段 `report_type=qweb-pdf`、`model`、`report_name`（= `模块名.模板id`），`binding_model_id` 决定打印按钮挂到哪个模型。
2. **建 QWeb 模板**：`<template id="...">` 内最外层 `t-call="web.html_container"`。
3. **遍历记录集**：`t-foreach="docs" t-as="doc"`（**务必带 `t-as`**，否则循环体取不到当前记录）。
4. **套用公司版式**：PDF 报表用 `t-call="web.external_layout"` 自动带公司页眉/页脚/Logo，正文放 `<div class="page">`。
5. **渲染字段**：模型字段一律用 `t-field`（自动格式化日期、币种、布尔）；非字段字符串用 `t-out`（Odoo 15+）或 `t-esc`（Odoo 14-）。
6. **条件/分支**：用 `t-if` / `t-elif` / `t-else` 控制块级显隐。
7. **校验**：升级模块加载 XML，打印对应模型验证；报错时回看 `t-as` 缺失、字段路径、`docs` 作用域。

## 指令

- 字段取值：`<t t-field="doc.字段"/>`；关联字段链式 `doc.关联_id.name`。
- 安全输出 HTML：Odoo 15+ 用 `t-out`，14 及以下用 `t-esc`（会转义标签，适合纯文本）。
- 翻译：Python 报表辅助里翻译字面量用 `_lt()`（惰性翻译），**不要**用内联 `t-esc` 拼。
- 复杂取值：在模型或报表 `_get_report_values()` 里算好再传，**禁止**在 QWeb 内写裸 Python 表达式。

## 示例

### 示例 1：定制 PDF 报表（报表动作 + 模板）

```xml
<!-- 报表动作 -->
<record id="action_report_patient_card" model="ir.actions.report">
    <field name="name">Patient Card</field>
    <field name="model">hospital.patient</field>
    <field name="report_type">qweb-pdf</field>
    <field name="report_name">hospital_management.report_patient_card</field>
    <field name="binding_model_id" ref="model_hospital_patient"/>
</record>

<!-- QWeb 模板 -->
<template id="report_patient_card">
    <t t-call="web.html_container">
        <t t-foreach="docs" t-as="doc">
            <t t-call="web.external_layout">
                <div class="page">
                    <h2>Patient Card</h2>
                    <table class="table table-bordered">
                        <tr>
                            <td><strong>Name:</strong></td>
                            <td><t t-field="doc.name"/></td>
                        </tr>
                        <tr>
                            <td><strong>Doctor:</strong></td>
                            <td><t t-field="doc.doctor_id.name"/></td>
                        </tr>
                        <tr>
                            <td><strong>Status:</strong></td>
                            <td><t t-field="doc.state"/></td>
                        </tr>
                    </table>
                </div>
            </t>
        </t>
    </t>
</template>
```

### 示例 2：条件渲染（仅未确认时显示告警块）

```xml
<t t-if="doc.state == 'draft'">
    <div class="alert alert-warning">
        <strong>Warning:</strong> This patient has not been confirmed yet.
    </div>
</t>
```

## 注意事项

- ✅ 模型字段用 `t-field`——Odoo 自动按地区格式化日期/币种/布尔，别手工拼。
- ✅ PDF 报表套 `web.external_layout`，自动带公司页眉、页脚、Logo。
- ✅ 非字段字符串：Odoo 15+ 用 `t-out` 安全输出 HTML；14 及以下用 `t-esc`（会转义）。
- ✅ 可翻译字面量在 Python 辅助中用 `_lt()` 惰性翻译。
- ❌ 不要在 QWeb 里写裸 Python——值在模型或 `_get_report_values()` 里算好。
- ❌ 用 `t-foreach` 别漏 `t-as`，否则循环体无法访问当前记录。
- ❌ 想渲染 HTML 时别用 `t-esc`——它会把标签转义成纯文本打印出来。
- ⚠️ 邮件模板作用域是 `object` 而非 `docs`，照搬报表写法会取不到值。

## 互见

- related：`odoo-localization-compliance` —— 同属 Odoo 生态；本地化/税务合规模块常配套定制法定单据与发票报表。
- combines_with：`transactional-email-template-builder` —— 设计邮件模板时与 QWeb 邮件模板的版式/变量思路互补。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
