---
name: atlassian-admin
title: Atlassian 产品管理与配置
description: 当需要做组织级 Atlassian（Jira/Confluence/Bitbucket/Trello）管理员任务时使用；做用户与组开通注销、权限方案、SSO/SCIM、集成、应用市场、安全审计与治理，产出可执行的控制台路径与 REST 命令清单；不适用于单项目业务配置或非 Atlassian 平台。触发词：Jira 加用户、Confluence 权限、配置 SSO、组织级管理
domain: 平台/integration
triggers: [给 Jira 添加用户, 修改 Confluence 权限, 配置访问控制/SSO, 管理 Atlassian 用户组, 安装应用市场 App, 组织级安全审计与治理]
tags: [atlassian, jira, confluence, 管理员, 权限, sso, 集成, 治理, integration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [admin.atlassian.com 管理控制台, Atlassian REST API (v3), Jira/Confluence MCP]
requires: []
related: [atlassian-template-builder, confluence-space-architect, jira-expert, ms365-tenant-admin]
combines_with: [jira-expert, confluence-space-architect, google-workspace-cli-admin]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

需要在**组织级**管理 Atlassian 套件（Jira、Confluence、Bitbucket、Trello）时使用，覆盖：用户开通/注销、用户组、权限方案、SSO/SCIM、应用市场 App、跨产品集成、全局配置、安全审计与治理、灾备与事件响应。

**不该用的边界：**
- 单个 Jira 项目内的业务配置（看板、工作流细节、字段绑定）——交给「Jira 专家」角色。
- 单个 Confluence 空间内的内容/权限——交给「Confluence 空间」处理。
- 非 Atlassian 平台（如纯 GitHub、飞书等）的管理。
- 系统级故障/数据损坏/账单——升级到 Atlassian 官方支持。

## 步骤

### 1. 用户开通（Provisioning）
1. 邀请用户：`admin.atlassian.com > User management > Invite users`；REST：`POST /rest/api/3/user`，体 `{"emailAddress":"...","displayName":"...","products":[...]}`。
2. 加入对应组：`User management > Groups > [group] > Add members`。
3. 分配产品访问：`Products > [product] > Access`。
4. 按组方案配置默认权限，发送 onboarding 欢迎邮件。
5. **通知**相关团队负责人。
6. **校验**：`admin.atlassian.com/o/{orgId}/users` 中用户为 active 且可登录。

### 2. 用户注销（Deprovisioning）
1. **关键先审计**owned 内容：Jira `GET /rest/api/3/search?jql=assignee={accountId}` 查未关闭 issue；Confluence `GET /wiki/rest/api/user/{accountId}/property` 查空间/页面。
2. 移交所有权：Jira 项目 lead（`Project settings > People`）、Confluence 空间（`Space settings > Overview`）、issue 批量改派（`Issues > Bulk change`）、过滤器/仪表盘（`User management > [user] > Managed content`）。
3. 移出所有组 → 撤销产品访问 → 停用：`User management > [user] > Deactivate`，或 `DELETE /rest/api/3/user?accountId={accountId}`。
4. **校验**：`GET /rest/api/3/user?accountId={accountId}` 返回 `"active": false`，并记入审计日志。

### 3. 用户组管理
- 创建：`Groups > Create group` 或 `POST /rest/api/3/group {"name":"..."}`。
- 按团队/角色/项目命名分层；文档化用途与成员准入标准。
- **校验**：`GET /rest/api/3/group/member?groupName={name}`；每季度复审清理。

### 4. 权限方案设计
- **Jira**（`Jira Settings > Issues > Permission Schemes`）：Public（全员看/成员改）/ Team / Restricted（指定人）/ Admin。
- **Confluence**（`Confluence Admin > Space permissions`）：Public / Team / Personal / Restricted。
- 原则：**按组而非个人**授权、**最小权限**、定期审计、记录授权理由。

### 5. SSO 与 SCIM
1. 选 IdP（Okta/Azure AD/Google）。
2. `Security > SAML single sign-on > Add SAML configuration`，配 Entity ID、ACS URL、IdP 的 X.509 证书。
3. 先用管理员账号测试（**测试期保留密码登录**）→ 再测普通用户 → 启用 → 强制：`Security > Authentication policies > Enforce SSO`。
4. 自动开通：`User provisioning > [IdP] > Enable SCIM`。
5. **校验**：审计日志出现 `saml.login.success`；监控 `Audit log > filter: SSO`。

### 6. 应用市场 App
- 评估安全（`marketplace.atlassian.com` 的安全自评、SOC 2、渗透报告）→ 沙箱测试 → 采购（`Billing > Manage subscriptions`）→ 安装（`Products > [product] > Apps > Find new apps`）。
- **校验**：`GET /rest/plugins/1.0/` 出现该 App 且健康检查通过；每年复审是否仍需。

### 7. 集成接入
- 常见：Slack（`Apps > Slack integration`）、GitHub/Bitbucket（`Apps > DVCS accounts`）、Microsoft Teams、Zoom/Salesforce（市场 App）。
- 流程：核对 OAuth scope → 配置认证（**token 入安全保管库，禁明文**）→ 字段映射 → 样例数据测试 → Confluence runbook 文档化。
- **校验**：`Jira Settings > System > WebHooks > [webhook] > Test` 确认 webhook 投递。

## 指令

```text
# 用户
POST   /rest/api/3/user                              # 创建用户
DELETE /rest/api/3/user?accountId={accountId}        # 停用用户
GET    /rest/api/3/user?accountId={accountId}        # 校验状态 active

# 组
POST   /rest/api/3/group                             # {"name":"..."}
GET    /rest/api/3/group/member?groupName={name}     # 校验组成员

# 审计 / 内容归属
GET    /rest/api/3/search?jql=assignee={accountId}   # 用户未关闭 issue
GET    /wiki/rest/api/user/{accountId}/property      # 用户拥有的空间/页面

# 组织级
GET    /admin/v1/orgs/{orgId}/users                  # 用户清单/计数
GET    /admin/v1/orgs/{orgId}/audit-log              # 导出审计日志
GET    /rest/plugins/1.0/                            # 已装 App 列表
```

## 示例

**场景：新工程师入职 Jira + Confluence**
1. `POST /rest/api/3/user`，body 含 `products:["jira-software","confluence"]`。
2. 加入 `engineering` 组（已绑定默认权限方案）。
3. `Products > Jira > Access` 确认席位。
4. `GET /rest/api/3/user?accountId=...` 校验 `active`，通知团队 lead。

**场景：季度访问治理复审**
1. `admin.atlassian.com > User management > Export users` 导出全量用户。
2. 核对角色/权限，清理 inactive；org admin 控制在 2-3 人。
3. `Security > Authentication policies > Require 2FA` 对所有管理员强制 MFA。

## 注意事项

- **最小权限 + 按组授权**：永远优先用组，避免给个人单独授权。
- **SSO 切换留后路**：启用/强制 SSO 前务必保留密码登录通道完成验证，防止把自己锁在门外。
- **密钥安全**：集成 token/密钥入保管库，绝不明文存储。
- **审计留存**：审计日志按合规保留（SOC 2/GDPR 场景最低 7 年）。
- **变更管理**：重大变更提前 2 周通知、沙箱验证、备好回滚、错峰执行、事后复盘；小变更提前 48 小时通知。
- **灾备**：Jira/Confluence 每日自动备份 + 每周人工校验，保留 30 天、异地存储；每季度做恢复演练并测 RTO/RPO。
- **事件分级**：P1 系统宕机 15 分钟响应、P2 主功能损坏 1 小时、P3 4 小时、P4 24 小时；排查先看 `Products > [product] > Health` 与 Atlassian Status Page。
- **命名规范**：Jira 项目 key 3-4 位大写（PROJ/WEB）、issue type 用 Title Case；Confluence 空间带 Team/Project 前缀、标签小写连字符。

## 互见

- **Jira 专家**：项目级工作流、自定义字段、权限方案落地。
- **Confluence 空间**：空间级模板、权限、宏配置。
- **安全团队**：安全事件、异常访问、合规审计、新集成安全评审。
- **官方支持升级**：组织级宕机、数据损坏、许可/账单、复杂迁移。

---

*采编自 [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills)（MIT 许可证），已做中文适配与精简重写。*
