---
name: nosql-distributed-db
title: 分布式 NoSQL 数据库专家
description: 当为 Cassandra/ScyllaDB/DynamoDB 等分布式宽列/键值库做查询优先建模、选分区键、单表设计与排查热分区/高延迟时使用；产出访问模式清单、分区/排序键方案、单表与反范式 schema、热分区/打分区与索引(GSI/LSI/TTL)策略；不适用于关系型 SQL 建模、MongoDB 文档建模或单机 KV 缓存选型；触发词：cassandra、scylladb、dynamodb、分区键、热分区、单表设计、GSI、宽列、查询优先建模
domain: 数据/sql
triggers: [cassandra, scylladb, dynamodb, 宽列数据库, wide-column, 分区键, partition key, 热分区, hot partition, 单表设计, single-table design, GSI, LSI, TTL, 查询优先建模, access pattern, ALLOW FILTERING, 反范式, denormalization, tombstone, 墓碑]
tags: [nosql, cassandra, scylladb, dynamodb, wide-column, key-value, data-modeling, distributed-database, single-table-design, partitioning]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Cassandra, ScyllaDB, DynamoDB, CQL]
requires: []
related: [erd-schema-designer, database-design-advisor, postgresql-optimization, snowflake-development]
combines_with: [erd-schema-designer, data-pipeline-engineer, database-design-advisor]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 分布式 NoSQL 数据库专家

> domain：数据/misc｜name：nosql-distributed-db｜status：stable
> agents：claude-code、codex、cursor、gemini-cli｜license：MIT

## 何时使用

- 设计面向规模的分布式宽列/键值存储：Apache Cassandra、ScyllaDB、Amazon DynamoDB。
- 选型评估：在上述分布式库之间权衡，或判断该不该从单机库迁过来。
- 性能调优：排查既有 NoSQL 系统的「热分区(hot partition)」、高延迟、吞吐打满单节点。
- 微服务「一服务一库」：需要为高度优化的读路径预先建模。

核心心智：SQL 先建实体与关系、读时 JOIN；这类分布式库要**查询优先建模**——先列出访问模式，再为每个模式设计能一次查中的表/索引。

不该用的边界：

- 关系型库 schema/范式/ERD 设计 → 用 `erd-schema-designer`，本条不做实体关系建模。
- 写业务查询 SQL（联表/聚合/窗口）→ 用 `sql-query-builder`。
- MongoDB 等文档库的文档/嵌套建模、单机 Redis/KV 做缓存选型 → 不在本条范围。
- 需要强一致事务、自由 ad-hoc 查询、跨表 JOIN/GROUP BY 的负载 → 这类库不适配，应回到关系型或 OLAP。

## 步骤

```
1. 查询优先建模（先模式，后表）
   a. 列全部实体（User / Order / Product）
   b. 列全部访问模式（"按 email 取 User"、"按 User 取 Order 并按日期排序"）
   c. 为每个模式设计能"单次查中"的表/索引——不要指望事后加查询
   注：这类库通常无法"以后再加查询"，加新模式 = 建新表/新索引 + 数据迁移

2. 分区键(PK)定生死——决定数据落在哪个物理节点
   目标：数据与流量均匀分散
   反模式：低基数 PK（status="active"、gender="m"）→ 热分区，吞吐被锁死在单节点
   正解：高基数键（User ID、Device ID、复合键）

3. 聚簇键 / 排序键——分区内磁盘排序
   Cassandra 叫 Clustering Key，DynamoDB 叫 Sort Key
   支持高效范围查询：WHERE user_id=X AND date > Y
   本质是为特定读取需求把数据预排序

4. 单表设计（邻接表，主要 DynamoDB）
   多实体类型塞一张表，PK 相同、SK 区分类型 → 一次网络请求拿全
   例：PK=USER#123 一把捞出 PROFILE + 所有 ORDER#xxx

5. 反范式与冗余——别怕一份数据存多处
   users_by_id（PK=uuid）、users_by_email（PK=email）各建一表
   代价：跨表一致性需自管（最终一致或批量写）

6. 收尾走"专家清单"逐项核对（见下）
```

## 指令

判断口诀与硬约束：

- **建模顺序反过来**：SQL 让模型回答任意查询；这里让模型高效回答**特定**查询。
- **写便宜、读为王**：LSM 树下 Insert/Update 只是追加，别担心写量，重点优化读效率。
- **存储不值钱**：为读速度复制数据是常态，不要为去重而牺牲读路径。
- **一致性可调**：BASE / 最终一致是默认；强一致要显式付出代价。

Cassandra / ScyllaDB 专项：

- 主键结构：`((Partition Key), Clustering Columns)`。
- **无 JOIN、无聚合**：聚合预算到单独的 counter 表，别想 `JOIN` / `GROUP BY`。
- **禁 `ALLOW FILTERING`**：生产里出现它 = 数据模型错了，它意味着全集群扫描。
- **墓碑(tombstones)**：删除是昂贵标记，避免高频删除模式（如把标准表当队列用）。

AWS DynamoDB 专项：

- **GSI（全局二级索引）**：建数据的「另一种视图」（如「按日期查 Order」而非按 User）。注意 GSI 是最终一致。
- **LSI（本地二级索引）**：在同一分区内换一种排序，**必须建表时创建**。
- **WCU / RCU**：理解容量模式；单表设计有助于优化消耗的容量单元。
- **TTL**：用 Time-To-Live 属性自动过期旧数据（免费删除），避免产生墓碑。

## 示例

SQL vs 分布式 NoSQL 心智对照：

| 维度 | SQL（关系型） | 分布式 NoSQL（Cassandra/DynamoDB） |
| :-- | :-- | :-- |
| 建模对象 | 实体 + 关系 | **查询（访问模式）** |
| JOIN | 读时算，吃 CPU | **写时预计算**（反范式） |
| 存储成本 | 贵，尽量去重 | 便宜，为读速度复制 |
| 一致性 | ACID（强） | **BASE（最终）/ 可调** |
| 扩展 | 垂直（换大机器） | **水平**（加节点/分片） |

> 黄金法则：SQL 设计模型以回答*任意*查询；NoSQL 设计模型以高效回答*特定*查询。

DynamoDB 单表设计（邻接表）——一次请求拿 User + 全部 Order：

```
PK (Partition) | SK (Sort)   | Data Fields
USER#123       | PROFILE     | { name: "Ian", email: "..." }
USER#123       | ORDER#998   | { total: 50.00, status: "shipped" }
USER#123       | ORDER#999   | { total: 12.00, status: "pending" }

查询：PK = "USER#123"  →  一次网络请求返回 Profile 与所有 Order
```

专家上线前清单：

```
[ ] 访问模式覆盖：每个查询模式都映射到某张具体表/索引？
[ ] 基数检查：分区键唯一值是否足够多以均匀分散流量？
[ ] 分区膨胀风险：单分区（如某用户的全部订单）会否无限增长？
                  >10GB 就要"打分区"，如 USER#123#2024-01
[ ] 一致性要求：该读模式能否容忍最终一致？
```

## 注意事项

三大反模式（看到就改）：

- ❌ **散播-聚合(Scatter-Gather)**：扫所有分区只为找一条（Scan）。
- ❌ **热键(Hot Keys)**：把「周一」全部数据塞进一个分区。
- ❌ **关系式建模**：建 `Author` / `Book` 两表想在代码里 JOIN。改法：把 Book 摘要嵌进 Author，或把 Author 信息复制进 Book。

其他易错点：

- 低基数分区键是最常见性能杀手——上线前务必过「基数检查」。
- 生产出现 `ALLOW FILTERING` / 全表 Scan 几乎都是建模问题，不要靠加机器硬扛。
- 反范式带来的跨表一致性由你负责，明确「谁负责同步冗余」。
- 本条给的是心智模型与设计模式，不替代环境内的实测、压测与专家评审；缺关键输入（访问模式、规模、一致性要求）时先停下来追问。

## 互见

- requires：无。
- related：`erd-schema-designer` —— 关系型一侧的 schema/范式设计，与本条形成「关系 vs 分布式」对照；`sql-query-builder` —— 关系型查询编写；`snowflake-development` —— OLAP/数仓侧的数据开发。
- combines_with：`data-pipeline-engineer` —— 反范式表常由管道写入与回填，组合解决「建模 + 灌数 + 跨表一致性」闭环。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
