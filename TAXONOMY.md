# 分类总纲 · TAXONOMY

> 11 卷功能域。这是给**人类维护者**的浏览与归位坐标；AI Agent 的发现机制是 frontmatter `description` 匹配，与本目录无关。

## 设计原则（动手前必读）

1. **可预测优先**：卷/类的命名必须让贡献者"看名字就知道东西在哪"。拒绝乾坤五行这类语义为空的隐喻。
2. **浅**：只两层导航——**卷（领域）→ 类（功能组）→ 技能文件夹**。不做四级深树。
3. **一物一处**：每条技能只放一个最贴切的类；跨域关联一律走 frontmatter 的互见字段（`related`/`requires`/`combines_with`），由脚本生成关系图。
4. **正交于元数据**：目录是"一个视角"。标签、工具、进阶层级、互见都在 frontmatter，由 `build-index.mjs` 生成其它视角。
5. **可演化**：新增的类直接加目录即可；卷尽量稳定（伤筋动骨才动卷）。

> 与你最初「天-地-人-事-物」的对应：卷〇通用 ≈ 天（可复用的元能力），卷九领域 ≈ 地（行业专精），其余按"事/物"的功能拆分。**保留了"从通用到专精"的精神，但用功能名落地。**

---

## 卷〇 · 通用（00-meta）— 可被其他技能复用的元能力
- `thinking` 思维方法：第一性原理、系统思维、批判性思维、决策框架
- `research` 研究方法：信息检索、文献综述、事实核查、来源评估
- `communication` 沟通表达：结构化写作、讲解、提问、反馈
- `learning` 学习方法：知识管理、拆解、复盘

## 卷一 · 文书（01-documents）— 文档处理与写作
- `office` Office/PDF：Word/Excel/PPT 读写、PDF 表单与提取、转换
- `markdown` Markdown 与排版：编辑、转换、模板
- `writing` 写作：报告、邮件、文案、纪要
- `translation` 翻译与本地化

## 卷二 · 研发（02-engineering）— 软件工程
- `frontend` 前端 / `backend` 后端
- `mobile` 移动端（iOS / Android / RN / Flutter）
- `review` 代码审查与重构
- `testing` 测试与调试
- `devops` 构建、CI/CD、容器、部署
- `observability` 可观测 / SRE / 监控告警 / 事件响应
- `architecture` 架构与设计

> `fullstack` 不单列为并列类（它是组合概念，否则同一条技能会在 frontend/backend/fullstack 间反复横跳）。全栈技能放主功能类，用 frontmatter `combines_with` 串联。

## 卷三 · 数据（03-data）— 数据与分析
- `wrangling` 清洗与整形
- `sql` 查询与建模
- `analysis` 统计分析与可视化
- `pipeline` ETL / 数据管道

## 卷四 · 智能（04-ai）— AI 与智能体
- `prompting` 提示工程
- `rag` 检索增强（RAG）
- `agents` 智能体编排与工具调用
- `eval` 模型/输出评测
- `model-ops` 模型调用与微调

## 卷五 · 商业（05-business）— 商业与营销
- `marketing` 营销 / `seo` SEO/GEO / `copy` 文案
- `growth` 增长与运营
- `sales` 销售
- `finance` 财务与分析

## 卷六 · 创意（06-creative）— 创意与媒体
- `design` 平面 / UI / 交互设计
- `image` 图像生成与处理
- `av` 音视频制作
- `brand` 品牌与叙事

## 卷七 · 协作（07-productivity）— 效率与协作
- `pm` 项目管理
- `knowledge` 知识管理
- `automation` 自动化与脚本编排
- `scheduling` 日程与待办

## 卷八 · 安全（08-security）— 安全与系统
- `appsec` 应用安全 / 审计
- `audit` 依赖与供应链审计
- `ops` 运维与系统
- `compliance` 合规与规范

## 卷九 · 领域专精（09-verticals）— 行业纵深
- `science` 科学（生信、化学、物理…）
- `legal` 法律 / `medical` 医疗 / `edu` 教育
- `fintech` 金融科技 / `hardware` 硬件与 EDA

> **正交规则（重要）**：垂直卷只收「与行业知识/合规/术语强绑定、无法被功能卷复用」的技能。纯功能实现（清洗、写作、查询）一律放对应功能卷，再用 `tags` 标行业。否则垂直卷会与所有功能卷抢条目，「一物一处」在此系统性失效。

## 卷十 · 平台集成（10-platform）— 平台 / 三方系统 / 工具操作
- `integration` 三方系统连接器：API / Webhook / iPaaS（Slack、飞书、Notion、Jira…）
- `cli` 命令行工具操作
- `cloud` 云控制台 / IaC 操作
- `browser` 浏览器自动化与网页抓取（Playwright/Puppeteer、爬虫、RPA）
- `mcp` MCP 服务 / 工具封装

> 评审反证：本仓库自身那批 `lark-*`、`workflow-*` 连接器/编排技能，在原 9 卷里「automation/backend/agents 三处抢、无处安放」；卷十正是它们的合法归属。

---

## 命名约定速查

| 对象 | 规则 | 示例 |
|---|---|---|
| 卷目录 | `NN-英文域` | `04-ai` |
| 技能文件夹 / `name` | ASCII kebab-case，全库唯一 | `rag-pipeline-builder` |
| frontmatter `domain` | `卷中文/类` | `智能/RAG` |
| `title` | 中文 | `RAG 检索管道搭建` |

新增技能 → 选定 `卷/类` → 在该卷目录下建 `your-skill-name/SKILL.md` → 跑生成器。
