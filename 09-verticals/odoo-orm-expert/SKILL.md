---
name: odoo-orm-expert
title: Odoo ORM 模式精通
description: 当在 Odoo 中编写 search/browse/create/write/unlink、构造 domain、实现 computed/stored/related 字段或排查慢查询时使用；做出地道、性能安全的 ORM 代码与优化建议；不适用于 cr.execute 原生 SQL 深度调优、TransientModel 向导模式。触发词：Odoo ORM、domain 过滤、computed 字段、N+1、recordset
domain: 领域/erp
triggers: [Odoo ORM, search domain, computed 字段, N+1 查询, recordset, browse create write, search_count, mapped filtered]
tags: [odoo, erp, orm, python, 性能优化, 领域模型]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, Odoo]
requires: []
related: [odoo-module-developer, odoo-performance-tuner, odoo-xml-views-builder, odoo-security-rules]
combines_with: [odoo-module-developer, odoo-automated-tests, odoo-performance-tuner]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 编写 `search()`、`browse()`、`create()`、`write()`、`unlink()` 等记录读写调用。
- 为视图或服务器动作构造复杂 domain 过滤器。
- 实现 computed（计算）、stored（存储）、related（关联）字段。
- 排查慢查询、优化批量操作、消除 N+1 查询。

不该用（负边界）：
- 不覆盖 `cr.execute()` 原生 SQL 模式的深度优化——SQL 层调优请转专门的性能调优技能。
- 不覆盖大规模下 stored computed 字段的写放大与分区策略。
- 不覆盖 `models.TransientModel`（瞬态模型）与向导（wizard）模式。
- ORM 行为在 Odoo SaaS 与本地部署间可能因配置覆盖而略有差异，需以目标环境实测为准。

## 步骤

1. 明确数据操作：要查、增、改、删，还是要计算字段或优化已有代码。
2. 选对 API：只要数量用 `search_count()`；要记录集用 `search()`；已知 ID 用 `browse()`。
3. 写 domain：用 `[(field, op, value)]` 三元组，日期/时间一律传 `'YYYY-MM-DD'` 字符串。
4. 在记录集上用 `mapped()` / `filtered()` / `sorted()` 替代 Python 循环。
5. 优化复查：把循环内的 `search()`、逐条 `write` 改为批量操作，消除 N+1。

## 指令

- 计数优先 `search_count(domain)`，不要 `len(search(...))`。
- 批量写：对整个记录集一次 `recordset.write({...})`，而非逐条赋值。
- 传上下文用 `with_context(...)`，不要直接改 `self.env.context`。
- `sudo()` 谨慎使用，仅在清楚其安全影响时调用。
- domain 中禁止传 Python `date`/`datetime` 对象，先 `strftime('%Y-%m-%d')`。

## 示例

示例 1：带 domain 的搜索

```python
# 查某客户今年以来所有已确认的销售订单
import datetime

start_of_year = datetime.date.today().replace(month=1, day=1).strftime('%Y-%m-%d')

orders = self.env['sale.order'].search([
    ('partner_id', '=', partner_id),
    ('state', '=', 'sale'),
    ('date_order', '>=', start_of_year),
], order='date_order desc', limit=50)
# 注意：domain 中日期传 'YYYY-MM-DD' 字符串，由 ORM 正确序列化。
```

示例 2：计算字段（stored）

```python
total_order_count = fields.Integer(
    string='Total Orders',
    compute='_compute_total_order_count',
    store=True
)

@api.depends('sale_order_ids')
def _compute_total_order_count(self):
    for record in self:
        record.total_order_count = len(record.sale_order_ids)
```

示例 3：安全批量写（避免 N+1）

```python
# 推荐：一次查询 + 一次批量写
partners = self.env['res.partner'].search([('country_id', '=', False)])
partners.write({'country_id': self.env.ref('base.us').id})

# 反例：每条记录触发一次独立查询
for partner in partners:
    partner.country_id = self.env.ref('base.us').id
```

## 注意事项

- 循环内调用 `search()` 是 Odoo 头号性能杀手，务必上移到循环外做批量。
- 标准操作一律走 ORM，非必要不写原生 SQL。
- stored computed 字段在大数据量下写开销显著，按需评估是否真的需要 store。
- 日期/时间对象进 domain 前必须字符串化，否则可能静默出错或行为异常。

## 互见

- 性能/SQL 层调优：Odoo 性能调优类技能（`cr.execute` 与索引优化）。
- 关联字段与继承建模：Odoo 模型设计类技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
