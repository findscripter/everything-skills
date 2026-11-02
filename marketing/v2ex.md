# V2EX · 分享创造

编辑说明：待审稿。先按[发布包检查](README.md#发布前检查)验证站点、案例页及安装路径。发布时使用一个主贴，后续补充实际更新，避免重复开相同推广贴。

## 标题

做了一个按任务找 Agent Skills 的开源目录：能查关系，也能按卷安装

## 正文

在 Claude Code / Codex 里使用 Skill 时，先要解决一个问题：手头这个任务，应该读哪份技能说明？

我在维护 [Everything Skills](https://github.com/findscripter/everything-skills)，最近把使用路径整理成了三步：

1. 用任务词检索，例如“代码库导览”“API 设计评审”。
2. 打开候选技能，看适用范围、工具依赖，再查看 `requires`、`related`、`combines_with` 关系。
3. 选择需要的卷使用。Claude Code 可以通过 marketplace 按卷安装；Codex 可以从 `AGENTS.md` 进入，按任务读取技能文件。

本地检索需要 Git 和 Node.js 22 及以上版本。克隆项目后执行：

```bash
git clone https://github.com/findscripter/everything-skills.git
cd everything-skills
npm run skill -- search "代码库导览" --limit 3
npm run skill -- why codebase-onboarding-doc
```

第一条会列出“代码库上手文档生成”等候选；第二条可以看到它与文档、ADR、开发体验等技能的关系。关系来自元数据声明，需要自己判断组合是否适合当前任务。

Claude Code 安装一个卷的方式：

```text
/plugin marketplace add findscripter/everything-skills
/plugin install 07-productivity@everything-skills
```

网页入口：[Everything Skills 检索站](https://findscripter.github.io/everything-skills/)；操作示例：[examples](https://github.com/findscripter/everything-skills/blob/main/examples/README.md)。

库内技能和外部仓库目录分别展示。外部目录提供摘要与上游链接，使用时应再看原仓库的安装说明、许可和依赖。技能条目也保留来源及质量信息，未知项不会当作验证通过。

如果某个真实任务搜不到合适技能，可以在 [Issues](https://github.com/findscripter/everything-skills/issues) 留下任务描述、搜索词和预期结果。这个反馈比单纯增加目录数量更有用。
