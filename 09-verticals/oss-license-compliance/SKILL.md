---
name: oss-license-compliance
title: 开源许可证合规审查
description: 当审查依赖清单/SBOM/单个库或准备开源出站代码、需判断 copyleft 义务与许可证兼容性时使用；做许可证家族分类、按部署模型映射义务并产出含风险分级与处置建议（遵守/替换/移除/法务复核/商业授权）的合规备忘录；不适用于安全漏洞或依赖版本升级审计（用 dependency-auditor），也不替代律师对争议性 copyleft 触发的最终裁决；触发词：开源许可证合规、license compliance、copyleft、GPL/AGPL/LGPL、SBOM 审查、open source review
domain: 领域/legal
triggers: [开源许可证合规, license compliance, copyleft, GPL, AGPL, LGPL, SBOM 审查, open source review, 许可证兼容性, 出站开源审查]
tags: [legal, oss, license, compliance, copyleft, sbom, dependency]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [SPDX, CycloneDX, package.json, requirements.txt, go.mod, Cargo.toml, pom.xml]
requires: []
related: [general-counsel-advisor, dependency-auditor, supply-chain-risk-auditor, regulatory-policy-diff]
combines_with: [dependency-auditor, supply-chain-risk-auditor]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 审查一份依赖清单（`package.json`、`requirements.txt`、`go.mod`、`Gemfile`、`Cargo.toml`、`pom.xml`、SPDX/CycloneDX SBOM、lockfile）的许可证合规性。
- 评估单个库是否可以引入并发布。
- 准备把团队自有代码开源（出站代码），需核对内嵌依赖与所选出站许可证是否兼容。

不该用的边界：

- 不做安全漏洞扫描、CVE 或依赖陈旧/版本升级审计——那是 `dependency-auditor` 的职责。
- 本技能输出的是「一遍过」分类与处置建议，不替代律师裁决。凡判为强 copyleft 或许可证不明者，发布前必须经律师复核。
- 不要凭模型知识或网络搜索填补关键事实空缺（如某许可证最新文本、AGPL 网络触发在特定法域的可执行性）；查不到就如实说明并停下，由人决定是否采纳低置信来源。

## 步骤

1. **确定范围**：依赖清单 / 单个库 / 出站代码三选一。清单→逐项分类并汇总义务；单库→分类该包并尽量遍历传递依赖；出站→核查直接+传递内嵌依赖、校验所选出站许可证兼容性、检查 LICENSE/NOTICE 文件。
2. **确定部署模型**（分类义务前最关键的输入，同一份清单在不同模型下义务不同）：SaaS/托管服务、分发二进制、仅内部使用、嵌入式/固件。
3. **逐包分类**：读真实许可证文本，不要只信元数据（LICENSE 文件可能写错，头注释与 README 可能冲突，包管理器元数据可能过期）。分入六桶：宽松 / 弱 copyleft / 强 copyleft / 公有领域 / 非 OSI 源可见 / 其他·自定义·未知。
4. **映射义务到部署模型**：为每个包列出该模型触发的具体义务，并判定风险等级与处置建议。
5. **标记失败模式**：许可证未知、文件与头注释冲突、不兼容组合、伪装成开源的非 OSI 许可证、近期改过许可证的包。
6. **（出站时）出站检查**：兼容性、LICENSE/NOTICE 完整性、第三方文本捆绑、无专有/机密/凭据/客户数据残留、项目名商标策略。
7. **汇总备忘录**：底线结论→顶部红旗→按严重度分组的逐包块→法域提示→出站检查→审批路由。

## 指令

**部署模型 → 实质相关许可证：**

| 部署 | 实质触发的许可证 |
|---|---|
| SaaS | AGPL（网络触发）；任何 UI 中的宽松署名；若把 SSPL/BUSL/Elastic 重做成竞品服务 |
| 分发二进制 | GPL、LGPL、MPL、EPL（均在分发时触发）；宽松署名 |
| 仅内部 | 多数 copyleft 不触发（无分发）；署名仍是好习惯；外部用户经网络访问时 AGPL 仍触发 |
| 嵌入式/固件 | GPL 尤其难合规（源码披露+可复现构建+部分情形需安装信息），出货前规划 |

**分类六桶（许可证家族）：**

- **宽松**：MIT、BSD-2/3-Clause、Apache-2.0、ISC、Zlib、Unlicense。义务：署名、保留许可证文本；Apache-2.0 额外含专利授权 + NOTICE 要求。
- **弱 copyleft**：LGPL-2.1/3.0、MPL-2.0、EPL-1.0/2.0、CDDL。文件级或库级源码披露；链接规则各异。
- **强 copyleft**：GPL-2.0/3.0、AGPL-3.0、OSL、EUPL。广泛源码披露；AGPL 延伸至网络使用。
- **公有领域/奉献**：CC0、Unlicense、WTFPL。通常无义务，但部分法域不承认公有领域奉献。
- **非 OSI 源可见**：SSPL、BUSL、Commons Clause、Elastic License、Confluent Community、fair-source 系列。**不是开源**，限制商用/竞品用途，须读具体条款。
- **其他/自定义/未知**：厂商专有、缺失许可证文件、文件与头注释冲突。停下——默认不当作宽松。

**链接关系决定 copyleft 是否真正触发（严重度由此而定）：**

- 静态链接/共同编译 → 合并为一个二进制，强信号触发（LGPL「基于库的作品」、GPL 衍生作品）。
- 动态链接/共享库 → 运行时可分离；LGPL 明确允许（「使用库的作品」），GPL 立场有争议。
- 头文件包含/内联函数 → 视包含量可能构成衍生作品。
- 子进程/IPC → 经定义良好接口通信的独立进程，一般不构成衍生。
- 网络 API 调用 → 多数许可证不触发；但 **AGPL** 的网络交互条款使「经网络提供软件」即等同分发——微服务里 AGPL 组件藏在 API 后仍触发。
- 文件级 copyleft（MPL）→ 仅被修改的文件带 copyleft，检查有无 copyleft 文件被改。

> 关键：静态链接 LGPL 进专有产品 = 🔴Critical；动态链接 LGPL = 🟢Low。同一许可证，相反评级。「LGPL——弱 copyleft，链接规则各异」而不做链接分析，正是让工程师被起诉的答案。

**严重度校准：** 🔴Critical=触发型部署里的强 copyleft（分发二进制中的 GPL、SaaS 中的 AGPL），或与商业模式实质冲突的非 OSI 许可证，或许可证无法确定且该包是承重依赖；🟠High=团队尚未准备好的弱 copyleft 义务、所选许可证含糊的双授权、文件与头注释冲突；🟡Medium=未接入构建的宽松署名（缺 NOTICES/LICENSE）、视消费方式可能触发的传递 copyleft；🟢Low=义务已满足的宽松、不触发部署模型的 copyleft。

**额外标记**：双授权包（我们用哪个许可证？）、已弃用包、顶层宽松但传递依赖含 copyleft 的包、近期改过许可证的包（Redis、MongoDB、Elastic、HashiCorp——核对锁定版本确属你以为的许可证）。

## 示例

```
review ~/code/my-project/package.json
review ~/code/my-project/requirements.txt
review redis
review ~/code/my-project   # 仓库根 — 扫描所有清单
```

逐包输出块模板：

```markdown
### [package@version] — [License]

**分类：** [宽松 / 弱 copyleft / 强 copyleft / 公有领域 / 非 OSI / 未知]

**针对本部署（[SaaS/二进制/内部/嵌入式]）的义务：**
- [ ] [具体义务，如「在随应用分发的 NOTICES 文件中包含署名」]
- [ ] [如「若修改并分发，须发布我方修改的源码」]
- [ ] [如「AGPL 网络触发——用户经网络访问我方修改版时须向其提供源码」]

**风险：** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

**建议：** [遵守义务 | 替换为〈替代品〉 | 移除 | 发布前法务复核 | 向〈厂商〉申请商业授权]
```

备忘录骨架：底线（能否发布？先要做什么？+ 审查包数 + 各分类计数 + 各级问题数）→ 顶部红旗（未知清单/冲突清单/伪开源清单/不兼容组合）→ 逐包块（按严重度分组）→ 法域提示 → 出站检查 → 审批路由。

## 注意事项

- **决策姿态**：无法自信分类的许可证一律标「需复核」，绝不默认宽松。低估许可证风险是单向门——基于「默认宽松」的发布决定，几个月后会变成源码披露义务或禁令；过度标记是双向门，复核时可收窄。
- **争议问题升级**：当 copyleft 触发取决于未经法院充分检验的问题（AGPL「经网络交互」、GPL-3.0「conveying」与专利条款、LGPL 链接范围），标记为待法务复核并同时陈列正反两面因素。
- **不兼容组合**：GPL-2.0-only + Apache-2.0 是历史已知不兼容；仔细核对 MPL/EPL/GPL 组合。
- **不要被 GitHub 的「open source」徽章误导**：SSPL/BUSL/Commons Clause/Elastic/Confluent Community 都读具体许可证文本再判断。
- **出站不可降级合并**：内嵌了 GPL 代码就不能以 MIT 发布——合并作品须为 GPL。
- **来源标注**：引用许可证文本、判例或管理方指引（OSI/SPDX/FSF/SFC-SFLC）时打标签；网络搜索结果标 `[web search — verify]`，模型知识标 `[model knowledge — verify]`，仓库直读标 `[user provided]`，带 verify 的须对照一手来源核验后再依赖。
- **交付前自检**：部署模型已先于义务确立；每个依赖（含可得的传递依赖）都有分类；未知项已标记未默认宽松；任何 copyleft/非 OSI 结论都读过真实许可证文本而非仅元数据；建议字段已给出明确处置。

## 互见

- `dependency-auditor`：依赖的安全漏洞、陈旧版本与供应链审计（与本技能的许可证维度互补）。
- `code-reviewer`：出站开源前对代码本身的质量与机密残留复核。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0），已适配重写为面向 AI Agent 消费的中文条目，去除了原插件特有的配置加载、事项工作区与特权抬头等内部机制，保留核心方法论、命令与约束。
