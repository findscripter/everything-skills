---
name: odoo-migration-helper
title: Odoo 模块版本迁移
description: 当把 Odoo 自定义模块跨大版本升级（v14→v15→v16→v17）时使用；按版本逐级给出 API/视图/弃用项的破坏性变更清单与前后对照修复，产出可执行迁移检查表；不适用于 v13 及更早、Odoo.sh 自动升级流程、OWL 组件深度重写；触发词：odoo 迁移、模块升级、attrs 改写
domain: 领域/erp
triggers: [Odoo 模块升级, v16 升级 v17, attrs invisible 改写, 迁移破坏性变更, __manifest__ 版本号, odoo-upgrade 检查表, website_published 弃用, oe_chatter 迁移]
tags: [Odoo, ERP, 版本迁移, 破坏性变更, Python, XML视图]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [odoo-module-developer, odoo-orm-expert, odoo-automated-tests, legacy-framework-modernizer]
combines_with: [odoo-backup-strategy, odoo-performance-tuner]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 把自定义模块从 Odoo 14/15/16 升级到更高版本，需要系统排查破坏性变更。
- 升级前想要一份针对模块特性的迁移检查表。
- 版本升级后处理弃用告警（deprecation warning）。
- 想搞清楚两个具体版本之间到底改了什么。

不该用的边界：

- 仅覆盖 v14~v17；不处理 v13 及更早（无 manifest 时代模块结构根本不同）。
- 不覆盖 Odoo.sh 自动升级路径（有额外步骤，查 Odoo.sh 文档）。
- Enterprise 专属模块（如 `account_accountant`、`sign`）可能有未公开的破坏性变更，必须在带企业版授权的 staging 环境实测。
- JS OWL 组件迁移（v15 Legacy → v16 OWL）是复杂专题，本条不深入。

## 步骤

1. 明确源版本与目标版本，并准备好待迁移模块代码。
2. 对照下方「按版本破坏性变更」逐项排查，逐条做前后对照修复。
3. 逐级单版本验证：`--update=你的模块`，每过一版再升下一版。
4. 更新 `__manifest__.py` 中的 `version`（例如 `17.0.1.0.0`）。
5. 跑校验捕获 manifest/frontmatter 问题：`npm run validate`。

## 指令

按版本破坏性变更对照：

### Odoo 16 → 17

| 主题 | 旧（v16） | 新（v17） |
|---|---|---|
| 视图可见性 | `attrs="{'invisible': [...]}"` | `invisible="condition"` |
| Chatter | `<div class="oe_chatter">` | `<chatter/>` |
| 必填/只读 | `attrs="{'required': [...]}"` | `required="condition"` |
| Python 最低版本 | 3.10 | 3.10+ |
| JS 模块 | 旧式 `define(['web.core'])` | ES 模块 `import` 语法 |

### Odoo 15 → 16

| 主题 | 旧（v15） | 新（v16） |
|---|---|---|
| 网站发布标志 | `website_published = True` | `is_published = True` |
| 邮件别名 | company 上的 `alias_domain` | 迁到 `mail.alias.domain` 模型 |
| 报表渲染 | `_render_qweb_pdf()` | 同名，但签名已变 |
| 会计凭证 | `account.move.line` 分组 | 行聚合规则已更新 |
| 邮件线程 | `mail_thread_id` | 弃用；改用 `message_ids` |

## 示例

示例 1：v16 → v17 把 `attrs` 改写为内联表达式

```xml
<!-- v16 —— 基于 domain 的 attrs -->
<field name="discount" attrs="{'invisible': [('product_type', '!=', 'service')]}"/>
<field name="discount" attrs="{'required': [('state', '=', 'sale')]}"/>

<!-- v17 —— 内联 Python 表达式 -->
<field name="discount" invisible="product_type != 'service'"/>
<field name="discount" required="state == 'sale'"/>
```

示例 2：迁移 Chatter 区块

```xml
<!-- v16 -->
<div class="oe_chatter">
    <field name="message_follower_ids"/>
    <field name="activity_ids"/>
    <field name="message_ids"/>
</div>

<!-- v17 -->
<chatter/>
```

示例 3：v15 → v16 迁移 `website_published` 标志

```python
# v15
record.website_published = True

# v16+
record.is_published = True
```

## 注意事项

- 务必逐级升级：v14→v15→v16→v17 顺序进行，绝不跳版。
- 每过一版先用 `--update=你的模块` 验证，再推生产。
- 别忘了更新 `__manifest__.py` 的 `version`。
- 善用官方 [Odoo Upgrade Guide](https://upgrade.odoo.com/) 获取自动化的升级前分析报告。
- 社区模块查 OCA 迁移说明与模块 `HISTORY.rst`；不要假定 OCA 模块已就绪，去其 GitHub 对应目标版本分支确认。
- 迁移后跑 `npm run validate` 尽早暴露问题。

## 互见

- 官方升级分析报告：https://upgrade.odoo.com/
- OCA 社区模块迁移说明与各模块 GitHub 目标版本分支。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
