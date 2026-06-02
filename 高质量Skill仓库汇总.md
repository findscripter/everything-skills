# 高质量 Skill 仓库汇总（2026-06 核验版）

> 本文档在你提供的原始清单基础上，逐条对照真实 GitHub（REST API + 页面抓取）做了核验，剔除/更正了不实条目，并补充了一批确实存在、口碑良好的优质仓库。

## ⚠️ 核验声明（请先读）

1. **Star 数为近似值**：Agent Skills 生态是 2025 年底才爆发的新事物，热门仓库 star 增长极快、波动大。下表数字为 2026-06-01 前后的近似值，**仅供量级参考**，不要当作精确值。
2. **原清单存在大量误差**：核验发现原始清单中有「虚构仓库」「虚构生态（OpenClaw/ClawHub）」「star 数严重偏差（既有夸大也有低估）」等问题，详见文末「第七节：存疑条目」。
3. **置信度标记**：
   - ✅ = 通过 GitHub API / 官方组织 / 知名项目交叉确认，可信度高
   - ⚠️ = 仓库存在但 star 数未能独立精确核实，数字为约数
   - ❌ = 核验未通过（虚构 / 张冠李戴 / star 数与实际严重不符）

---

## 一、官方与权威仓库（Anthropic / OpenAI / Vercel）

学习 Skill 标准写法（`SKILL.md`）和官方实践，优先看这些。

| 仓库 | 约 Star | 领域 | 说明 | 置信 |
|------|--------|------|------|------|
| [anthropics/skills](https://github.com/anthropics/skills) | ~145k | Agent Skills 官方 | **官方 Agent Skills 仓库**：规范、模板、示例（含 skill-creator）。学习 Skill 组织方式的第一参考 | ✅ |
| [openai/skills](https://github.com/openai/skills) | ~21k | OpenAI Codex skills | OpenAI 官方「Skills Catalog for Codex」。原清单写 8.5k，实际约 21k | ✅ |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | ~21k | Skill 包管理器 | `npx skills`——被称为「Agent Skills 界的 npm」，跨 Claude Code / Cursor / Copilot 安装同步技能 | ⚠️ |
| [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) | ~44k | Claude 食谱 | 官方 notebook/recipe 合集（原 anthropic-cookbook），含大量可复用模式 | ✅ |
| [anthropics/courses](https://github.com/anthropics/courses) | ~21k | 教育 | 官方课程：API 基础、提示工程、工具调用等 | ✅ |
| [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) | ~7k | Agent SDK | 官方 Python Agent SDK，构建可加载/运行 Skill 的智能体 | ✅ |

---

## 二、社区精选大列表（Awesome Lists / 大集合）

综合性最强、收录量最大的几个社区集合，找具体技能从这里入手。

| 仓库 | 约 Star | 说明 | 置信 |
|------|--------|------|------|
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | ~45k | **Claude Code 事实上的总索引**：skills / hooks / slash-commands / 编排器 / 插件，维护活跃 | ✅ |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | ~62k | 1000+ 生产级 Claude Skills/插件，跨 Claude.ai、Claude Code、Codex、Cursor、Gemini CLI。原清单 26.3k 实为低估 | ✅ |
| [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) | ~39k | 可一键安装的 1400+ 技能库（Claude Code/Cursor/Codex/Gemini/Antigravity），含安装器 CLI。原清单 24.2k 实为低估 | ✅ |
| [wshobson/agents](https://github.com/wshobson/agents) | ~36k | 多平台插件市场：83 插件 / 191 agents / 155 skills / 102 commands，一份 Markdown 源跨多 Agent 复用 | ✅ |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | ~21k | **原清单「openclaw-skills」的真实对应项**：100+（现 150+）专项 Claude Code 子智能体 | ✅ |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | ~17k | 337 skills / 30+ agents / 70+ commands，覆盖 16 个领域（DevOps、合规、产品、金融等） | ⚠️ |
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | ~13k | 按文档处理 / 开发工具 / 数据分析分类的 Claude Skills 精选 | ⚠️ |
| [ComposioHQ/awesome-codex-skills](https://github.com/ComposioHQ/awesome-codex-skills) | ~13k | 面向 OpenAI Codex CLI/API 的实用技能合集 | ⚠️ |
| [heilcheng/awesome-agent-skills](https://github.com/heilcheng/awesome-agent-skills) | ~5k | 跨 Agent（Codex/Claude 等）的技能教程 + 目录 | ⚠️ |

---

## 三、其他 AI 编程助手生态（Cursor / Copilot / Gemini / Windsurf / Aider / MCP）

Skill 思想在各家工具里有不同载体（rules / instructions / extensions / MCP）。

| 仓库 | 约 Star | 生态 | 说明 | 置信 |
|------|--------|------|------|------|
| [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | ~88k | MCP | 最大的 MCP 服务器合集，可作为 Claude Code 的工具/技能接入 | ✅ |
| [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) | ~40k | Cursor | `.cursorrules` 配置文件旗舰合集，Cursor 规则的事实标准 | ✅ |
| [github/awesome-copilot](https://github.com/github/awesome-copilot) | ~34k | GitHub Copilot | 官方维护的 instructions / agents / skills / prompts 合集 | ✅ |
| [wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers) | ~4k | MCP | mcpservers.org 的配套精选 MCP 索引 | ⚠️ |
| [ichoosetoaccept/awesome-windsurf](https://github.com/ichoosetoaccept/awesome-windsurf) | ~550 | Windsurf | Windsurf 编辑器的 rules / workflows 资源合集 | ⚠️ |
| [Piebald-AI/awesome-gemini-cli](https://github.com/Piebald-AI/awesome-gemini-cli) | ~460 | Gemini CLI | Gemini CLI 的扩展 / GEMINI.md / 命令资源主索引 | ⚠️ |
| [philschmid/gemini-cli-extension](https://github.com/philschmid/gemini-cli-extension) | ~150 | Gemini CLI | Philipp Schmid（Google DeepMind）维护的 Gemini CLI 扩展示例 | ⚠️ |
| [Aider-AI/conventions](https://github.com/Aider-AI/conventions) | ~195 | Aider | 官方 `CONVENTIONS.md` 约定文件合集，规范 Aider 输出风格 | ⚠️ |

---

## 四、垂直领域 Skills

按行业找现成技能包。

| 仓库 | 约 Star | 领域 | 说明 | 置信 |
|------|--------|------|------|------|
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | ~31k | 营销 | CRO / 文案 / SEO / 数据分析 / 增长。原清单 8.7k 实为低估 | ✅ |
| [anthropics/financial-services](https://github.com/anthropics/financial-services) | ~29k | 金融 | 官方金融服务参考 agents/skills/连接器（投行、股研、私募、财富管理） | ⚠️ |
| [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | ~26k | 科学 | 「科学 Agent Skills 第一库」：140+ 技能 + 100+ 科学数据库（生信/化学/医药）。**原名 claude-scientific-skills，已改名** | ✅ |
| [anthropics/claude-for-legal](https://github.com/anthropics/claude-for-legal) | ~8k | 法律 | 官方法律工作流插件套件（多执业领域 + MCP 连接器，输出标注为待律师审阅草稿） | ⚠️ |
| [trailofbits/skills](https://github.com/trailofbits/skills) | ~5.5k | 安全 | 知名安全公司 Trail of Bits 的安全研究/审计技能（智能合约、逆向、模糊测试等） | ✅ |
| [FreedomIntelligence/OpenClaw-Medical-Skills](https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills) | ~2.6k | 医疗 | 自称最大开源医疗 AI 技能库（~869 技能）。**注：仓库名含虚构生态「OpenClaw」字样，请谨慎核实** | ❌⚠️ |
| [aaron-he-zhu/seo-geo-claude-skills](https://github.com/aaron-he-zhu/seo-geo-claude-skills) | ~1.9k | SEO/GEO | 20 个 SEO 与生成式引擎优化技能 | ⚠️ |
| [tradermonty/claude-trading-skills](https://github.com/tradermonty/claude-trading-skills) | ~1.7k | 量化/交易 | 面向股票投资者的市场分析、技术图表、策略开发技能 | ⚠️ |
| [aklofas/kicad-happy](https://github.com/aklofas/kicad-happy) | ~460 | EDA/PCB | KiCad 电子设计 AI 技能（原理图分析、PCB 审查、SPICE 仿真）。原清单 362，实约 460 | ✅ |
| [jaechang-hits/SciAgent-Skills](https://github.com/jaechang-hits/SciAgent-Skills) | ~186 | 生物信息 | 197 个生信/生命科学技能（RNA-seq、单细胞、药物发现） | ⚠️ |
| [OctagonAI/skills](https://github.com/OctagonAI/skills) | ~118 | 金融研究 | Octagon 的智能体金融研究技能（财报/公司研究） | ⚠️ |
| [voidful/academic-skills](https://github.com/voidful/academic-skills) | ~79 | 学术科研 | 论文阅读/选题/实验设计/写作/评审技能套件。原清单 362，实约 79 | ✅ |

---

## 五、Skill 工具 / 注册中心 / 包管理

不只是「列表」，而是用来安装、搜索、创建、托管技能的基础设施。

| 仓库 | 约 Star | 类型 | 说明 | 置信 |
|------|--------|------|------|------|
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | ~21k | CLI / 包管理 | `npx skills`，跨多 Agent 发现/安装/同步 `SKILL.md` 包 | ⚠️ |
| [modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) | ~7k | MCP 注册中心 | MCP 官方社区注册服务（MCP 服务器的「应用商店」后端） | ✅ |
| [tech-leads-club/agent-skills](https://github.com/tech-leads-club/agent-skills) | ~4.5k | 注册中心/CLI | 经校验的技能注册表 + CLI，覆盖 Antigravity/Claude Code/Cursor/Copilot | ⚠️ |
| [iflytek/skillhub](https://github.com/iflytek/skillhub) | ~3.3k | 企业自托管 | 自托管企业级技能注册中心（版本管理、RBAC、审计、K8s 部署） | ⚠️ |
| [stacklok/toolhive](https://github.com/stacklok/toolhive) | ~1.8k | MCP 管理 | 容器化运行/管理 MCP 服务器，带注册表与一键安装 | ⚠️ |
| [xingkongliang/skills-manager](https://github.com/xingkongliang/skills-manager) | ~1.8k | 桌面应用 | 跨 15+ 工具管理/同步 AI 技能的轻量桌面端 | ⚠️ |
| [zjunlp/SkillNet](https://github.com/zjunlp/SkillNet) | ~1k | 技能图谱 | 浙大 NLP 组「创建/评估/连接 AI 技能」平台。**原清单 7.2k 为夸大，实约 976** | ✅ |
| [antfu/skills-npm](https://github.com/antfu/skills-npm) | ~450 | CLI | Anthony Fu 出品，发现 npm 包内置技能并软链给各 Agent 使用 | ⚠️ |
| [docker/mcp-registry](https://github.com/docker/mcp-registry) | ~495 | MCP 注册中心 | Docker 官方 MCP 服务器目录 | ⚠️ |

---

## 六、人类学习技能图谱 / Roadmap / 技能树

给「人」用的学习路径与知识体系（非 AI Agent 技能）。

| 仓库 | 约 Star | 说明 | 置信 |
|------|--------|------|------|
| [EbookFoundation/free-programming-books](https://github.com/EbookFoundation/free-programming-books) | ~389k | 免费编程书 / 课程 / 速查表，多语言分类 | ✅ |
| [kamranahmedse/developer-roadmap](https://github.com/kamranahmedse/developer-roadmap) | ~356k | roadmap.sh 后端，交互式开发者路线图。原清单 288k 实为低估 | ✅ |
| [ossu/computer-science](https://github.com/ossu/computer-science) | ~204k | 用免费课程自学完整 CS 本科课程的路径 | ✅ |
| [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) | ~196k | JS 实现的算法与数据结构 + 讲解 | ✅ |
| [getify/You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS) | ~182k | 深入 JS 语言的系统化丛书系列 | ✅ |
| [CyC2018/CS-Notes](https://github.com/CyC2018/CS-Notes) | ~180k | 技术面试必备基础知识（算法/OS/网络/系统设计/数据库） | ✅ |
| [TeamStuQ/skill-map](https://github.com/TeamStuQ/skill-map) | ~21k | 极客邦「程序员技能图谱」。**原清单 32.5k 为夸大，实约 21.6k**；注意它是程序员技能图谱，非泛「人类技能图谱」 | ✅ |
| [JacksonTian/fks](https://github.com/JacksonTian/fks) | ~18k | 前端技能汇总（Frontend Knowledge Structure）知识图谱 | ⚠️ |
| [forthespada/developer-roadmap-zh-CN](https://github.com/forthespada/developer-roadmap-zh-CN) | ~700 | 中文校招技术岗学习路线图与资源 | ⚠️ |

---

## 七、原清单中的存疑 / 错误条目（核验未通过 ❌）

> 这些是你原清单里**不准确或不可信**的条目，建议替换或弃用。

| 原条目（声称 Star） | 核验结论 | 建议 |
|------|------|------|
| `VoltAgent/awesome-openclaw-skills`（20.1k） | **该仓库不存在**。「OpenClaw / ClawHub / OpenClaw Skills Registry」🦞 是虚构生态（蹭 Claude 命名）。抓取该 URL 返回的是伪造内容 | 改用 [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)（~21k，真实存在） |
| `Sec-Dome/Awesome-Skills`（11.8k） | 仓库**存在但仅约 1 star**，极小众；11.8k 数字系凭空捏造 | 弃用，或改用上面的大列表 |
| `kyledh/skills`（18.7k，「人类技能图谱」） | **0 star**，描述实为「OpenClaw skills monorepo」，与「人类技能图谱」无关；又见虚构「OpenClaw」 | 弃用 |
| `badhope/skill`（12.4k，「人类技能树」） | **该仓库不存在**，URL 跳转到无关的 `badhope/Personal-Assistant`（37 star）；作者全账号最高仅 ~64 star | 弃用 |
| `FreedomIntelligence/OpenClaw-Medical-Skills`（医疗） | 仓库或存在，但名称含虚构「OpenClaw」生态，存疑 | 引用前务必亲自核实 |

### 其余条目的 star 更正（仓库真实，仅数字需修正）

| 仓库 | 你写的 | 实际约 | 方向 |
|------|------|------|------|
| ComposioHQ/awesome-claude-skills | 26.3k | ~62k | 低估 |
| openai/skills | 8.5k | ~21k | 低估 |
| sickn33/antigravity-awesome-skills | 24.2k | ~39k | 低估 |
| K-Dense-AI（已改名 scientific-agent-skills） | 9.1k | ~26k | 低估 |
| coreyhaines31/marketingskills | 8.7k | ~31k | 低估 |
| kamranahmedse/developer-roadmap | 288k | ~356k | 低估 |
| trailofbits/skills | 5.3k | ~5.5k | 基本准确 |
| aklofas/kicad-happy | 362 | ~460 | 略低估 |
| zjunlp/SkillNet | 7.2k | ~976 | **夸大** |
| TeamStuQ/skill-map | 32.5k | ~21.6k | **夸大** |
| voidful/academic-skills | 362 | ~79 | **夸大** |

---

## 附：快速上手建议

- **想学 Skill 怎么写** → 先 [anthropics/skills](https://github.com/anthropics/skills)（规范 + skill-creator）、[openai/skills](https://github.com/openai/skills)。
- **想找现成技能用** → [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)（总索引）+ [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)。
- **想要安装/管理工具** → [vercel-labs/skills](https://github.com/vercel-labs/skills)（`npx skills`）。
- **按行业找** → 看第四节（安全/科学/营销/金融/法律/EDA…）。
- **给人学的路线图** → [developer-roadmap](https://github.com/kamranahmedse/developer-roadmap) / [free-programming-books](https://github.com/EbookFoundation/free-programming-books)。

---

*核验方法：GitHub REST API + 页面抓取交叉比对，21 个并行 Agent。生态过新、数字波动大，引用前建议点开链接二次确认。最后更新：2026-06-01。*
