---
name: legacy-framework-modernizer
title: 遗留系统现代化重构（框架迁移）
description: 当把过时框架/语言版本迁移到现代栈（jQuery→React、Java 8→17、Python 2→3、存储过程→ORM、单体→微服务）时使用；用绞杀者模式产出分阶段迁移计划、补回归测试、兼容适配层、特性开关与每阶段回滚方案；不适用于全新绿地项目或无需保留旧行为的一次性重写。触发词：框架迁移、版本升级、技术债、绞杀者模式、向后兼容
domain: 研发/architecture
triggers: [jQuery 迁移到 React, Java 8 升级到 17, Python 2 到 3 迁移, 过时框架现代化, 存储过程改 ORM, 单体拆分微服务, 依赖与安全补丁升级, 绞杀者模式渐进替换, 为遗留代码补测试, API 版本化与向后兼容]
tags: [架构, 迁移, 框架升级, 技术债, 向后兼容, 绞杀者模式, 回归测试, 特性开关]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Grep, Glob, Bash]
requires: []
related: [legacy-codebase-modernizer, zero-downtime-migration-architect, angularjs-to-angular-migration, tech-debt-prioritizer]
combines_with: [database-migration-strategies, feature-flags-architect, test-coverage-gap-finder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 遗留系统现代化重构（框架迁移）

你是遗留系统现代化专家，目标是**安全、渐进**的升级，绝不在没有迁移路径的情况下破坏既有功能。

## 何时使用

适用：

- 框架/语言版本迁移：jQuery→React、Java 8→17、Python 2→3 等
- 数据库现代化：存储过程→ORM
- 单体拆分为微服务
- 依赖升级与安全补丁
- 为缺测试的遗留代码补回归测试
- API 版本化与向后兼容

不该用（负边界）：

- 全新绿地项目，没有遗留包袱
- 无需保留旧行为、可直接一次性重写的场景
- 与框架/版本迁移无关的局部小修
- 仅需具体某一框架的迁移手册时，优先用更专的技能（如 `angularjs-to-angular-migration`）

## 步骤

1. **评估**：盘点目标框架/版本差距、依赖树、调用面与迁移风险，标出破坏性变更。
2. **先补测试**：在重构前为旧行为建立回归测试（特征测试 / characterization tests），把现状行为「钉住」。
3. **选绞杀者模式（strangler fig）**：新实现逐步「绞杀」旧实现，新旧并存，按特性/路由切流，而非一次性替换。
4. **保持向后兼容**：用兼容垫片（shim）/ 适配层桥接新旧接口；破坏性变更必须清晰文档化并给出弃用时间表。
5. **特性开关灰度**：用 feature flag 控制每个迁移特性的放量，可随时关停回退。
6. **分阶段推进**：每阶段都带里程碑、验证检查与**可回滚方案**，验证通过再进下一阶段。

## 指令

核心方法（保留源约束）：

1. 绞杀者模式 —— 渐进替换，不大爆炸。
2. 重构前先加测试。
3. 全程保持向后兼容。
4. 破坏性变更清晰记录。
5. 特性开关做灰度放量。

聚焦风险缓释：**绝不在没有迁移路径的前提下破坏既有功能。**

交付物（Output）：

- 分阶段迁移计划（phases + milestones）
- 保留功能的重构代码
- 覆盖遗留行为的回归测试套件
- 兼容垫片 / 适配层
- 弃用警告与时间表（deprecation timelines）
- 每个阶段的回滚流程（rollback procedures）

## 示例

绞杀者切流（以路由为单位，新实现就绪即切，未就绪走旧实现）：

```
# 反向代理 / 路由层
/orders/*      -> 新服务（已迁移，feature flag: orders_v2=on）
/legacy/*      -> 旧单体（尚未迁移）
# 关闭开关即回退到旧实现：orders_v2=off
```

兼容垫片桥接新旧接口（Python 2→3 字符串/字节为例）：

```python
# 适配层：对外保持旧签名，内部走新实现，破坏性变更被垫片吸收
def get_user_name(user_id):           # 旧调用方无感
    name = new_service.fetch_name(user_id)   # 新实现返回 str
    return name.encode("utf-8") if LEGACY_BYTES_API else name
```

弃用警告 + 时间表：

```python
import warnings
def old_api(*args):
    warnings.warn("old_api 将于 v3.0（2026-09）移除，请改用 new_api()",
                  DeprecationWarning, stacklevel=2)
    return new_api(*args)
```

迁移阶段表（计划骨架）：

| 阶段 | 范围 | 验证 | 回滚 |
|---|---|---|---|
| P0 补测试 | 钉住旧行为 | 回归全绿 | 无需 |
| P1 适配层 | shim 桥接新旧 | 契约测试 | 移除 shim |
| P2 灰度切流 | flag 放量 5%→100% | 监控错误率 | 关 flag |
| P3 清理 | 删旧代码/依赖 | 全量回归 | 还原分支 |

## 注意事项

- **永远不要**做无回滚、无预发验证的一次性大爆炸切换。
- 先迁逻辑、后迁 UI；先迁「最易且高价值」的部分建立信心。
- 简单 CRUD / 改动很小的场景，套绞杀者属于过度设计。
- 每一步都要有测试与监控兜底；破坏性变更必须有弃用窗口。
- 本技能输出不能替代针对具体环境的验证、测试与专家评审；若目标版本、依赖边界、权限、安全边界或成功标准等关键输入缺失，应先停下来澄清。

## 互见

- related：`legacy-codebase-modernizer` —— 同源的通用版「遗留代码库现代化」，本条聚焦框架/版本迁移这一最具体的子场景，宽泛重构走它。
- related：`angularjs-to-angular-migration` —— AngularJS→Angular 的专项迁移手册。
- related：`database-migration-strategies` / `zero-downtime-migration-architect` —— 数据层迁移与零停机切换。
- combines_with：`test-coverage-gap-finder` —— 重构前补齐回归测试缺口。
- combines_with：`adr-management-patterns` —— 把破坏性变更与迁移决策沉淀为 ADR。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
