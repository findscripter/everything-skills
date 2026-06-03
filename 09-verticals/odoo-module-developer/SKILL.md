---
name: odoo-module-developer
title: Odoo 自定义模块开发
description: 当从零搭建或扩展 Odoo 自定义模块（建模型、装清单、配安全）、排查模块加载/manifest 报错、正确实现 compute/onchange/constraint 时使用；做模块脚手架（__manifest__.py、models、views、security）、用 _inherit 扩展既有模型、按 Odoo 约定校验代码并产出可安装目录；不适用于 OWL/前端组件、纯 XML 视图、自动化测试与 v13 及更早结构；触发词：odoo 模块、__manifest__、_inherit、ORM、models.Model、ir.model.access、脚手架
domain: 领域/erp
triggers: [odoo 模块, __manifest__, _inherit, ORM, models.Model, ir.model.access.csv, 脚手架, compute, onchange, constraint, 自定义模块, 扩展 sale.order]
tags: [odoo, erp, python, orm, module-development, manifest, scaffolding, model-inheritance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo, odoo-bin, Python]
requires: []
related: [odoo-orm-expert, odoo-xml-views-builder, odoo-security-rules, odoo-qweb-templates]
combines_with: [odoo-automated-tests, odoo-migration-helper]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Odoo 自定义模块开发

## 何时使用

适用于 Odoo（社区版/企业版，v14+）的自定义模块开发场景：

- 从零搭建一个新的自定义模块（脚手架 + manifest + 模型）。
- 扩展既有 Odoo 模型，例如给 `sale.order` 加字段、改行为（用 `_inherit`，绝不改核心文件）。
- 排查模块加载失败、`__manifest__.py` 配置错误、访问权限报错。
- 正确实现 `compute` / `onchange` / `@api.constrains` 等 ORM 方法。

**不该用边界**：

- 不覆盖 OWL JavaScript 组件与前端 widget 开发；纯 XML 视图构建另用 `odoo-xml-views-builder`。
- 不覆盖 **Odoo 13 及更早**结构（无 `__manifest__.py` 自动加载机制）——本技能面向 v14+。
- 不覆盖多公司（multi-company）/多网站（multi-website）配置，那需额外的 `company_id` / `website_id` 字段。
- 不生成自动化测试文件，那交给 `odoo-automated-tests`。

## 步骤

1. **确认输入**：目标 Odoo 版本、模块名（snake_case）、要建/扩展的模型、依赖应用（如 `base`、`mail`、`sale`）。
2. **建目录脚手架**：按标准结构创建文件夹与空 `__init__.py`（见示例）。
3. **写 `__manifest__.py`**：填 `name`/`version`/`depends`/`data`，并补 `author`、`website` 便于在 Apps 列表识别。`version` 必须是 `{odoo版本}.{major}.{minor}.{patch}`，如 `17.0.1.0.0`。
4. **定义模型**：在 `models/*.py` 用带命名空间的 `_name`（如 `hospital.patient`），必要时 `_inherit = ['mail.thread', 'mail.activity.mixin']` 自动获得 chatter/日志。
5. **挂载 `__init__.py`**：在 `models/__init__.py` 里 `from . import xxx`，根 `__init__.py` 里 `from . import models`，否则模型不会被加载。
6. **配安全**：每个新模型都要在 `security/ir.model.access.csv` 里给出访问规则，否则用户报权限错误。
7. **登记 data**：把 view XML、security CSV 等按加载顺序写进 manifest 的 `data` 列表（security 在前）。
8. **安装并校验**：用 CLI 安装并查看日志确认无加载错误。

## 指令

扩展 vs 新建的判断：

- **要加字段/改逻辑到现成模型** → 新建模块，模型里 `_inherit = '现有模型名'`（不写 `_name`），切忌直接编辑核心模块源码。
- **要全新业务对象** → 模型里写 `_name = 'your.model'` + `_description`。

CLI 安装与升级（`-i` 安装，`-u` 升级已装模块）：

```bash
# 首次安装模块（--stop-after-init 装完即退）
./odoo-bin -d mydb --stop-after-init -i hospital_management

# 改了 Python/视图后升级模块
./odoo-bin -d mydb --stop-after-init -u hospital_management
```

## 示例

**目录结构**（snake_case，禁用空格/大写）：

```text
hospital_management/
├── __manifest__.py
├── __init__.py
├── models/
│   ├── __init__.py
│   └── hospital_patient.py
├── views/
│   └── hospital_patient_views.xml
├── security/
│   ├── ir.model.access.csv
│   └── security.xml
└── data/
```

**`__manifest__.py`：**

```python
{
    'name': 'Hospital Management',
    'version': '17.0.1.0.0',
    'category': 'Healthcare',
    'depends': ['base', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'views/hospital_patient_views.xml',
    ],
    'installable': True,
    'license': 'LGPL-3',
}
```

**`models/hospital_patient.py`：**

```python
from odoo import models, fields, api

class HospitalPatient(models.Model):
    _name = 'hospital.patient'
    _description = 'Hospital Patient'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Patient Name', required=True, tracking=True)
    birth_date = fields.Date(string='Birth Date')
    doctor_id = fields.Many2one('res.users', string='Assigned Doctor')
    state = fields.Selection([
        ('draft', 'New'),
        ('confirmed', 'Confirmed'),
        ('done', 'Done'),
    ], default='draft', tracking=True)
```

**扩展既有模型（给 `sale.order` 加字段）：**

```python
from odoo import models, fields

class SaleOrder(models.Model):
    _inherit = 'sale.order'  # 只写 _inherit，不写 _name

    delivery_note = fields.Char(string='Delivery Note')
```

## 注意事项

- ✅ 模型 `_name` 必须带命名空间前缀（如 `hospital.patient`），避免与核心模型冲突。
- ✅ 用 `_inherit = ['mail.thread']` 一键获得 chatter / 操作日志。
- ✅ manifest 里设 `author` 和 `website`，模块在 Apps 列表才可识别。
- ❌ 绝不直接修改 Odoo 核心模型源码——一律用 `_inherit`，否则升级即被覆盖。
- ❌ 新模型忘记写进 `ir.model.access.csv` → 用户访问报错。
- ❌ 文件夹/模块名禁用空格与大写，Odoo 要求 snake_case。
- 改 Python 后用 `-u` 升级模块（仅 XML 视图改动有时需重启即可），改 manifest 的 `depends` 后也要升级。

## 互见

- related：`odoo-localization-compliance` —— 国家级财税/电子发票合规，常作为模块开发后的会计层配置。
- 同源但尚未收录（如需可后续采编）：`odoo-orm-expert`（深挖 ORM 模式）、`odoo-xml-views-builder`（视图 XML）、`odoo-security-rules`（记录级权限）、`odoo-automated-tests`（测试）。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。
