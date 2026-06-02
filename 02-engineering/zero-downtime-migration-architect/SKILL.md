---
name: zero-downtime-migration-architect
title: 零停机迁移与回滚架构
description: 当规划数据库/服务/基础设施的高风险割接，需要零停机方案、兼容性校验与显式回滚路径时使用；做出分阶段迁移计划、兼容性报告与可执行回滚预案（含校验门禁与触发器）；不适用于无状态低风险改动、纯应用内重构或常规小版本发布。触发词：迁移、割接、回滚、零停机、扩展收缩、蓝绿、金丝雀、绞杀者、CDC、双写、数据对账
domain: 研发/architecture
triggers: [数据库迁移, 迁移方案, 零停机, 割接, 回滚预案, rollback, 蓝绿部署, 金丝雀, 绞杀者模式, Strangler Fig, 扩展收缩, expand-contract, 双写, CDC, Change Data Capture, 数据对账, schema 演进, 云迁移, 上云, infrastructure cutover, 兼容性校验]
tags: [架构, 迁移, 零停机, 回滚, 数据库, 基础设施, 风险评估, 灰度发布]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash, Grep, Glob]
requires: []
related: [database-migration-strategies, database-design-advisor, legacy-codebase-modernizer, release-manager]
combines_with: [deployment-engineer, feature-flags-architect, ci-cd-pipeline-builder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用于任何"换不了就出大事"的高风险切换：

- **数据库迁移**：schema 演进、数据搬迁、跨库切换。
- **服务迁移**：单体拆微服务、旧服务下线、新旧并行。
- **基础设施迁移**：跨云、上云、机房割接。
- 凡是需要**显式回滚路径**、**零停机**或**最小业务影响**的转换。

**不该用的边界（负边界）**：
- 无状态、低风险的应用内改动或纯代码重构（直接发版即可，不必上迁移框架）。
- 常规小版本发布、配置项调整（用常规 CI/CD 流程即可）。
- 一次性脚本搬几行测试数据（杀鸡用牛刀）。

判断标准：若失败会导致**数据丢失、服务中断或营收损失**，才动用本技能。

## 步骤

1. **风险评估先行**：在动手前枚举所有失败模式。分三类——技术风险（数据损坏/宕机/集成失败/扩展性）、业务风险（营收/客户体验/合规/品牌）、运维风险（知识缺口/测试不足/监控盲区/沟通断层）。每条风险对应一条缓解措施。
2. **选迁移模式**（见下方"指令"选型表），按数据库 / 服务 / 基础设施分别定方案。
3. **分阶段拆解**：把大迁移切成带"校验门禁（validation gate）"的小阶段，每阶段定义成功标准与回滚触发条件。
4. **为每一步设计可回滚**：没有经过测试的回滚预案的步骤不允许执行。
5. **预演**：在类生产（staging）环境跑完整流程，包括回滚演练。
6. **执行 + 持续监控**：按计划顺序执行，每个 checkpoint 校验数据一致性；不达标即触发回滚。
7. **数据对账**：割接后跑行数比对、校验和、业务逻辑校验，做 delta 检测。
8. **观察 + 复盘**：监控 72 小时，下线旧系统，归档产物，做迁移回顾。

## 指令

**数据库 schema 演进——扩展收缩（Expand-Contract，零停机首选）**：
1. Expand：在旧 schema 旁新增列/表，不破坏现有读写。
2. Dual Write：应用同时写新旧 schema。
3. Migrate：回填历史数据到新 schema。
4. Contract：校验通过后再删除旧列/表。

**大数据量零停机**：用 CDC（Change Data Capture）流式同步变更到目标库，维持最终一致；或双写 + 失败补偿。

**服务迁移模式选型**：
- **绞杀者（Strangler Fig）**：网关拦截请求 → 增量替换功能 → 旧组件逐步退役。流量经 API Gateway 按路由决策分发到 Legacy / New。
- **并行运行（Parallel Run）**：影子流量同时打到新旧系统，比对输出验证正确性后按置信度灰度切量。
- **金丝雀（Canary）**：小比例用户先上 → 监控 latency/错误/业务 KPI → 逐步加量 → 全量。

**回滚策略**：
- 数据库：schema 版本受控 + 每步保留回滚脚本；数据用时间点恢复（PITR）+ 事务日志回放。
- 服务：蓝绿部署（保留旧版，异常即切回 blue）或滚动回滚 + 自动触发器。
- 基础设施：IaC（Terraform/CloudFormation）版本化，保留回滚模板并在 staging 验证。

**对账 delta 查询（核心 SQL，保留原约束）**：
```sql
SELECT 'missing_in_target' AS issue_type, source_id
FROM source_table s
WHERE NOT EXISTS (SELECT 1 FROM target_table t WHERE t.id = s.id)
UNION ALL
SELECT 'extra_in_target' AS issue_type, target_id
FROM target_table t
WHERE NOT EXISTS (SELECT 1 FROM source_table s WHERE s.id = t.id);
```

**割接前检查清单（关键门禁）**：迁移计划已评审批准 / 回滚已测试 / 监控告警已配 / 角色职责明确 / 备份恢复已验证 / staging 校验完成 / 性能基线已建立 / 安全与合规已过。

## 示例

**灰度特性开关（按用户哈希分流）**：
```python
class MigrationFeatureFlag:
    def __init__(self, flag_name, rollout_percentage=0):
        self.flag_name = flag_name
        self.rollout_percentage = rollout_percentage

    def is_enabled_for_user(self, user_id):
        hash_value = hash(f"{self.flag_name}:{user_id}")
        return (hash_value % 100) < self.rollout_percentage

    def gradual_rollout(self, target_percentage, step_size=10):
        while self.rollout_percentage < target_percentage:
            self.rollout_percentage = min(
                self.rollout_percentage + step_size, target_percentage)
            yield self.rollout_percentage
```

**熔断器——新系统降级时自动回退旧系统**：
```python
class MigrationCircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.last_failure_time = None
        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN

    def call_new_service(self, request):
        if self.state == 'OPEN':
            if self.should_attempt_reset():
                self.state = 'HALF_OPEN'
            else:
                return self.fallback_to_legacy(request)
        try:
            response = self.new_service.process(request)
            self.on_success()
            return response
        except Exception:
            self.on_failure()
            return self.fallback_to_legacy(request)
```

**CI/CD 集成迁移校验阶段**：
```yaml
migration_validation:
  stage: test
  script:
    - python scripts/compatibility_checker.py --before=old_schema.json --after=new_schema.json
    - python scripts/migration_planner.py --config=migration_config.json --validate
  artifacts:
    reports:
      - compatibility_report.json
      - migration_plan.json
```

## 注意事项

- **设计即为回滚**：每个迁移步骤都必须有经过测试的回滚程序，否则不上线。
- **必在 staging 预演**：在类生产环境跑完整迁移与回滚，再碰生产。
- **校验自动化**：行数比对、校验和/哈希采样、业务聚合（sum/count/avg）双系统对比，全部自动化；纠错脚本须**幂等**，可安全重跑，并记录审计日志。
- **割接后观察 72 小时**再下线旧系统，期间保留旧数据与回退能力。
- **触发器要预设**：成功标准与回滚触发阈值在执行前就定死，不在事故现场临时拍脑袋。
- 测试覆盖单元 / 集成 / 负载 / 混沌四类，缺一类都是隐患。

## 互见

- 灰度发布与流量管理（金丝雀 / 蓝绿）相关技能。
- 数据库 schema 设计与版本管理相关技能。
- 风险评估与运维 runbook 编制相关技能。

---
采编自 alirezarezvani/claude-skills（MIT）。
