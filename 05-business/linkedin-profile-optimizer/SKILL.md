---
name: linkedin-profile-optimizer
title: LinkedIn 个人主页优化
description: 当需要审计/重写 LinkedIn 个人主页（头衔、About、经历、技能）以建立专业权威与搜索可见性时使用；做主页诊断「吐槽」、文案重写与增长策略，产出优化后的头衔/About/经历条目与内容支柱。不适用于直接抓取私域 LinkedIn 后台数据、代发私信或生成头像/Banner 图。触发词：LinkedIn、个人主页优化、个人品牌、头衔重写、About
domain: 商业/marketing
triggers: [LinkedIn 主页优化, 个人品牌审计, 头衔/About 重写, 经历量化改写, 求职/获客定位, 内容增长策略, 提供作品集/简历做主页提升]
tags: [linkedin, personal-brand, marketing, career, copywriting, seo, growth]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [浏览工具（抓取公开主页）, PDF/文本读取（简历）]
requires: []
related: [social-connections-optimizer, linkedin-cli-automation, buyer-persona-builder]
combines_with: [interview-job-coach, content-strategy-planner]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用户要优化 **LinkedIn 主页**（Headline 头衔、About 简介、Experience 经历）。
- 用户需要 **个人品牌审计 / 吐槽（roast）**，找出可信度薄弱、措辞空泛之处。
- 用户要把 **经历改写** 成带可量化影响、符合国际标准的表达。
- 用户要 **内容与增长策略**，建立权威与曝光。
- 用户提供 **作品集链接 / 简历 PDF / 主页 URL 或 handle**，要据此提升专业形象。

**不该用的边界：**
- 无法抓取私有/登录态的 LinkedIn 后台实时数据 —— 只依赖用户提供的文本、公开 URL 或上传的 PDF。
- 不代用户发私信 / 触达（只给策略，不执行发送）。
- 不直接生成头像 / Banner 图（可建议用 AI 出图工具或专业设计师）。

## 步骤

### 第 0 步：输入分析（防幻觉）
先识别用户给了什么，并核验真实性：
- **仅给 handle / 用户名**（如 `whoisabhishekadhikari`）：**必须** 先用浏览工具尝试访问公开主页。若主页私有、无法访问或浏览工具被禁用，**先让用户粘贴 About + 当前头衔再开始审计**，严禁凭空编造其经历。
- **给简历 PDF / 文本**：提取关键岗位、可量化成果、核心技能。
- **给作品集链接**（个人站、GitHub、Behance）：提取核心项目、技术栈、视觉/创意证据。
- **多来源**（LinkedIn + 作品集 + 简历）：交叉比对一致性，找出贯穿全篇的「红线（Red Thread）」主线身份。

### 第 1 步：身份与上下文梳理
确定 **核心身份**。若用户身兼多职（创始人 + 讲师 + IT），须定主次，避免「品牌混乱」。问三件事：
1. 你的首要职业目标 / 使命是什么？
2. 目标受众是谁（招聘方、投资人、客户、学生）？
3. 主攻细分领域 / 行业是什么？

### 第 2 步：主页审计与「吐槽」
以全球招聘官 / 高净值投资人 / 高客单价客户的视角审视，指出：
- **可信度与社会证明弱**：缺可量化结果、推荐语空泛、近期零动态。
- **措辞空泛**：充斥 passionate / hardworking / expert 却无证据。
- **品牌混乱**：堆叠无关角色（如「DJ & 软件工程师」）却无统一叙事。
- **学历/经历断层**：未解释的转行、技能与资历不匹配。
- **转化流失（CTA 审计）**：顶部卡片无链接、About 里无明确「与我合作」入口。
- **视觉品牌不一致**：头像/Banner 低质、过时或与所宣称专业度不符。
- **移动端可读性**：头衔在手机上被截断、About 段落过密。
- **SEO 可搜索性**：头衔与 About 缺行业关键词。
- **联系信息卫生**：失效邮箱、旧链接、缺联系方式。

### 第 3 步：主页优化（四块）

**1. 头衔与 About**
- 头衔：从「Job Title at Company」→「权威定位 + 价值主张 + 关键词」。
- About：钩子 → 解决的问题 → 证据 → 行动号召（CTA）的叙事。
  - **SEO**：主关键词放在前 2-3 行。
  - **真实感**：避免第三人称腔，保持人味、行动导向。

**2. 精选（Featured）板块**
- 强制 CTA：让用户把最佳作品放进 Featured。
- **死链检查**：确保每条链接有效且指向正确；补作品集 / GitHub / 案例链接；置顶能体现权威或「红线」身份的高表现帖子；每项配清晰标题与缩略图。

**3. 经历（国际标准）**
- 用公式改写：**[动作动词] [指标/任务] 以达成 [影响/结果]**。
- 讲师：聚焦课程创新、学生影响、研究权威。
- 组织领导（会长/副会长）：领导力、战略视野、生态影响。
- 技术岗（支持/IT）：问题解决、系统可用性、可扩展性。

**4. 技能与 SEO**
- 删除无竞争力的通用填充技能（Teamwork、Microsoft Office、Communication）。
- 合并碎片技能成高权威集群：
  - `Data Entry` + `Excel` + `Admin` → **Operations & Data Strategy**
  - `HTML` + `CSS` + `JS` → **Full-Stack Engineering / UI Development**
- 精选与「使命/红线」对齐的 **Top 5 战略技能**；自然植入高意图关键词提升搜索可见性。

### 第 4 步：互动与内容策略
- **内容支柱**：建议 3 个每周发帖主题，建立权威、可信、信任。
- **策略性互动**：生成三种风格回应 —— 专业型（洞察、价值导向）、Gen-Z 型（短促、现代）、反思型/Osho 风（沉静、深刻）。

## 示例

**仅给 handle —— 验证闸门**
输入：`whoisabhishekadhikari`
回应：先说已尝试抓取其公开主页，再补一句：「若主页私有或近期有更新，请粘贴你的 About 与当前头衔，以确保 100% 准确、不编造细节。」

**Before（本地简历腔）**
> 「ABC 学院讲师。教 IT 课程。对农业感兴趣。」

**After（全球权威腔）**
> 「IT Strategist & Agritech Founder | Transforming Agricultural Systems with Scalable Tech | Lecturer in Computer Science」
> 多重角色被技术/农业科技主线统一，关键词优化到位。

## 注意事项

- ✅ **量化影响**：尽量用数字、百分比、金额。
- ✅ **统一品牌**：找到串联多角色的「红线」。
- ✅ **聚焦 CTA**：每次优化都导向明确行动号召。
- ❌ **拒绝空话**：无证据不用 passionate / expert 之类词。
- ⚠️ **品牌重叠陷阱**：用户像「样样通、样样松」→ 立一个主锚身份，其余角色定位为「辅助专长」。
- ⚠️ **技能堆砌陷阱**：罗列 50+ 通用低价值技能 → 合并成高权威集群，精选 10-15 个战略技能。

## 互见

- **copywriting**：深度叙事与转化导向文案。
- **resume-builder / jobgpt**：具体求职申请流程与面试准备。
- **content-creator**：跨平台内容排期与选题。

---
*采编自 sickn33/antigravity-awesome-skills（MIT 许可）。*
