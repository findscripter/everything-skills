---
name: odoo-security-rules
title: Odoo 访问控制与记录规则
description: 当为 Odoo 自定义模块配置权限或排查"拒绝访问"时使用；编写 ir.model.access.csv 模型级权限、ir.rule 记录规则与多公司可见性规则并定位错误；不适用于字段级权限、PostgreSQL 行级安全或 sudo() 绕过场景；触发词：ir.model.access、ir.rule、记录规则、Access Denied、多公司
domain: 领域/erp
triggers: [ir.model.access.csv, ir.rule 记录规则, Odoo 访问被拒绝/Access Denied, 多公司记录可见性, res.groups 安全组, perm_read/perm_write 权限位]
tags: [odoo, erp, access-control, security, ir.rule, record-rules, multi-company]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [odoo-module-developer, odoo-orm-expert, odoo-rpc-api, odoo-hr-payroll-setup]
combines_with: [odoo-module-developer, odoo-automated-tests]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

Odoo 安全分两层：**模型级访问**（谁能读写哪个模型，由 `ir.model.access.csv` 控制）与**记录级规则**（用户能看到哪些记录，由 `ir.rule` 控制）。在以下情况使用本技能：

- 为新建的自定义模块配置访问权限。
- 限制记录可见范围，让用户只能看到自己或本公司的数据。
- 排查 "Access Denied" / "You are not allowed to access" 报错。
- 实现多公司（multi-company）记录可见性。

**不该用的边界：**

- **字段级权限**（`ir.model.fields` 的读写限制）不在范围内，需自行用 OWL 或 Python override 实现。
- **门户/公开用户**（`base.group_portal`）规则有额外细节，本技能不完整覆盖，需单独验证。
- **PostgreSQL 行级安全（RLS）** 不涉及——Odoo 在 ORM 层统一管控安全。
- 任何 `sudo()` / 超级用户上下文会**完全绕过** `ir.rule`，本技能无法约束这类代码。

## 步骤

1. **明确场景**：判断需求属于模型级（能否读写该模型）还是记录级（能看到哪些行），或两者都要。
2. **写 CSV**：在 `security/ir.model.access.csv` 中按列填权限位 `perm_read,perm_write,perm_create,perm_unlink`（0/1）。
3. **写记录规则**：在 XML 中创建 `ir.rule`，用 `domain_force` 定义可见域，并务必绑定 `groups`。
4. **建专用安全组**：用 `res.groups` 为模块单独建组，不要复用 Odoo 核心组。
5. **验证**：以非 admin 用户在 debug 模式下测试；注意 `sudo()` 会跳过所有记录规则。

## 指令

- 模型级权限只能给到组级别；CSV 的 `group_id:id` 留空意味着授予**公开（未认证）访问**，谨慎使用。
- 管理员角色用 `base.group_erp_manager`，**切勿用 `base.group_system`**（保留给 Odoo 技术超级用户，会授予服务器配置等完整技术权限）。
- `ir.rule` 若**省略 `<field name="groups">`，规则即变为全局（global）**，对包括管理员在内的所有用户生效。除非确有此意图，否则总要绑定组。
- 多公司规则用复数 `company_ids`（包含用户所属的全部公司），而非单数 `company_id`。
- 遵循最小权限原则：从最严格开始，按需放开。

## 示例

### 示例 1：ir.model.access.csv（模型级权限）

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_hospital_patient_user,hospital.patient.user,model_hospital_patient,base.group_user,1,0,0,0
access_hospital_patient_manager,hospital.patient.manager,model_hospital_patient,base.group_erp_manager,1,1,1,1
```

为模块管理员角色单独建组（而非复用核心组）：

```xml
<record id="group_hospital_manager" model="res.groups">
    <field name="name">Hospital Manager</field>
    <field name="category_id" ref="base.module_category_hidden"/>
</record>
```

### 示例 2：记录规则——用户只能看到自己的记录

```xml
<record id="rule_hospital_patient_own" model="ir.rule">
    <field name="name">Hospital Patient: Own Records Only</field>
    <field name="model_id" ref="model_hospital_patient"/>
    <field name="domain_force">[('create_uid', '=', user.id)]</field>
    <field name="groups" eval="[(4, ref('base.group_user'))]"/>
    <field name="perm_read" eval="True"/>
    <field name="perm_write" eval="True"/>
    <field name="perm_create" eval="True"/>
    <field name="perm_unlink" eval="False"/>
</record>
```

> 注意：省略 `groups` 会让规则变全局，对所有用户（含 admin）生效。

### 示例 3：多公司记录规则

```xml
<record id="rule_hospital_patient_company" model="ir.rule">
    <field name="name">Hospital Patient: Multi-Company</field>
    <field name="model_id" ref="model_hospital_patient"/>
    <field name="domain_force">
        ['|', ('company_id', '=', False),
               ('company_id', 'in', company_ids)]
    </field>
    <field name="groups" eval="[(4, ref('base.group_user'))]"/>
</record>
```

## 注意事项

- 从最严格的权限起步，再按需放开。
- 多公司规则用 `company_ids`（复数），它包含用户所属的所有公司。
- 用非 admin 用户在 debug 模式下测试规则——`sudo()` 会完全绕过所有记录规则。
- 每个模块建专用安全组，而非复用 Odoo 核心组。
- **不要**给普通用户 `perm_unlink = 1`，除非业务流程明确需要删除。
- **不要**在 `ir.model.access.csv` 中留空 `group_id`，除非有意授予公开（未认证）访问。
- **不要**用 `base.group_system` 作为模块管理员组——它会授予包括服务器配置在内的完整技术权限。

## 互见

- Odoo 自定义模块开发与目录结构（`security/` 目录、`__manifest__.py` 中声明 CSV/XML）。
- Odoo ORM 域（domain）语法与 `eval` 多对多写法（如 `(4, ref(...))` 命令元组）。

---

采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT 许可）。
