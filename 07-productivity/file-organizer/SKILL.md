---
name: file-organizer
title: 本地文件智能整理
description: 当 Downloads/文档等目录杂乱、文件散落难找、存在重复文件或缺乏合理结构时使用；先扫描分析现状并产出按类型/用途/日期分组的整理方案，经确认后批量建目录、移动、重命名、去重并给出维护建议；不适用于云盘/在线网盘整理、跨机器同步或无确认的自动删除。触发词：整理文件、下载文件夹太乱、查重去重
domain: 协作/automation
triggers: [整理文件, 下载文件夹太乱, 文件查重去重, 文件夹结构混乱, 归档老文件, 批量重命名文件]
tags: [文件整理, 去重, 归档, 目录结构, 批量重命名, 本地文件]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Glob, Read]
requires: []
related: [pdf-processing-toolkit, csv-data-cleaner, busybox-on-windows, jq-json-processing]
combines_with: [pdf-processing-toolkit, audio-to-markdown-transcriber, markdown-to-docx]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- Downloads / 文档 / home 目录杂乱，文件散落、难以查找。
- 存在重复文件占用空间，需要识别并清理。
- 目录结构不合理，或新项目开始时需要规划结构。
- 归档旧项目前的清理，或希望建立长期整理习惯。

不该用（负边界）：

- 整理对象在云盘 / 在线网盘 / 远端同步盘，本技能只处理本地文件系统。
- 跨机器同步、版本控制迁移等场景，应交给专门工具。
- 任何未经用户确认的自动删除。删除一律先确认。

## 步骤

1. 明确范围。先问清楚：整理哪个目录？主要痛点是什么（找不到/重复/太乱/无结构）？哪些文件夹要避开（在用项目、敏感数据）？整理力度（保守 vs 彻底）？

2. 分析现状。扫描目标目录，统计文件/文件夹总数、类型分布、大小分布、日期范围与明显问题。

3. 识别分组逻辑。常见三种维度：
   - 按类型：文档 / 图片 / 视频 / 压缩包 / 代码项目 / 表格 / 演示。
   - 按用途：工作 vs 个人、活跃 vs 归档、项目专属、参考资料、临时草稿。
   - 按日期：本年本月 / 往年 / 很旧（归档候选）。

4. 查找重复文件。按哈希找精确重复，按文件名/大小找疑似重复；对每组重复展示全部路径、大小、修改时间，推荐保留项（通常取最新或命名最规范者），删除前务必确认。

5. 提出整理方案。在动手前用清晰的计划呈现：现状摘要、目标目录树、将执行的变更（新建目录 / 移动 / 重命名 / 删除）、以及需用户拍板的文件清单，等待 yes/no/modify。

6. 执行整理。批准后按计划系统执行；记录每一步移动以便回退，保留原始修改时间，妥善处理重名冲突，遇到意外情况停下来询问。

7. 总结与维护建议。汇报变更（新建目录数、整理文件数、去重释放空间、归档数量），展示新目录树，并给出每周/每月/每季/每年的维护节奏与常用查询命令。

## 指令

分析现状（Windows 下可用 Bash 工具调用，或换用等价 PowerShell）：

```bash
# 总览结构
ls -la [target_directory]

# 查看文件类型
find [target_directory] -type f -exec file {} \; | head -20

# 找出最大文件
du -sh [target_directory]/* | sort -rh | head -20

# 按扩展名统计数量
find [target_directory] -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn
```

查找重复：

```bash
# 按哈希找精确重复
find [directory] -type f -exec md5 {} \; | sort | uniq -d

# 按文件名找疑似重复
find [directory] -type f -printf '%f\n' | sort | uniq -d

# 按大小排序便于人工比对
find [directory] -type f -printf '%s %p\n' | sort -n
```

执行整理：

```bash
# 建立目录结构
mkdir -p "path/to/new/folders"

# 移动文件（保留清晰日志）
mv "old/path/file.pdf" "new/path/file.pdf"

# 统一命名，如 "YYYY-MM-DD - 描述.ext"
```

关键约束：删除前必须确认；记录所有移动以便撤销；保留原始修改时间；优雅处理重名冲突；遇到意外停下询问。

## 示例

整理方案（动手前呈现）：

```markdown
# [目录] 整理方案

## 现状
- X 个文件，分布在 Y 个文件夹，共 [大小]
- 类型分布：[breakdown]
- 问题：[列出问题]

## 目标结构
[Directory]/
├── Work/
│   ├── Projects/
│   ├── Documents/
│   └── Archive/
├── Personal/
│   ├── Photos/
│   ├── Documents/
│   └── Media/
└── Downloads/
    ├── To-Sort/
    └── Archive/

## 将执行的变更
1. 新建目录：[list]
2. 移动文件：X 个 PDF → Work/Documents/，Y 张图片 → Personal/Photos/，Z 个旧文件 → Archive/
3. 重命名：[命名规则]
4. 删除：[重复或垃圾文件]

## 需你决定的文件
- [拿不准的文件清单]

是否继续？(yes/no/modify)
```

## 注意事项

命名规范：

- 文件夹用清晰描述名，避免空格（用连字符/下划线），具体化（client-proposals 而非 docs），可用序号前缀排序（01-current、02-archive）。
- 文件名带日期（2024-10-17-meeting-notes.md），描述清晰，不在名字里堆版本号（交给版本控制），清理下载产物（document-final-v2 (1).pdf → document.pdf）。

何时归档：6 个月以上未动的项目；可能日后引用的已完成工作；迁移后的旧版本；不舍得删的文件（先归档）。

通用约束：仅在任务明确落入上述范围时使用；输出不替代针对具体环境的验证、测试或专家审查；缺少必要输入、权限、安全边界或成功标准时，停下来澄清。

## 互见

- 大批量文件检索可配合 Glob 工具按模式定位。
- 若目标是云端文档/网盘整理，改用对应的云文档或云空间技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
