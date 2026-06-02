---
name: vcf-variant-filtering
title: VCF 变异质量过滤
description: 当对变异检测器原始输出的 VCF 计算 Ts/Tv、变异计数、AF 分布等汇总统计前，需要判断 VCF 是否未过滤并做质量过滤时使用；先查 FILTER 列与 QUAL 分布判定 raw/已过滤，对原始 VCF 默认 bcftools view -i 'QUAL>=30' 过滤后再 bcftools stats 算指标，产出过滤后 VCF 与可复现的质控报告；不适用于变异检测本身（用 gatk-variant-calling）、纯文件读写/区域抓取（用 genomic-file-toolkit）、变异功能注释（用 snpeff-variant-annotation）。触发词：VCF 过滤、QUAL、FILTER 列、Ts/Tv、bcftools stats、变异质控、PASS、raw VCF
domain: 领域/science
triggers: [VCF 过滤, QUAL, FILTER 列, Ts/Tv, transition transversion, bcftools stats, bcftools view, 变异质控, variant QC, PASS, raw VCF, 原始 VCF, 硬过滤, VQSR, 变异计数, AF 分布]
tags: [vcf, bcftools, variant-filtering, qc, tstv, qual, genomics, bioinformatics, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bcftools, vcftools, awk]
requires: []
related: [bcftools-variant-manipulation, gatk-variant-calling, snpeff-variant-annotation, genomic-file-toolkit]
combines_with: [bcftools-variant-manipulation, gatk-variant-calling, snpeff-variant-annotation]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
# VCF 变异质量过滤

## 何时使用

当要对变异检测器（GATK HaplotypeCaller、bcftools mpileup、DeepVariant 等）输出的 VCF **计算汇总统计前先做质控**时使用本条，典型场景：

- 准备计算 Ts/Tv 比、变异计数、等位基因频率（AF）分布等质控指标，但不确定 VCF 是否已过滤。
- 拿到一个 `*_raw_variants.vcf`，FILTER 列全是 `.`，需要先过滤再统计。
- 对一批 VCF 做一致的质控基线（默认 `QUAL>=30`）并出可复现报告。
- 判断已有 VCF 是 raw 还是已过滤（VQSR/硬过滤），避免重复过滤误删真变异。

不该用本条的边界：

- **做变异检测本身**（call SNP/indel、联合分型、BQSR/VQSR 配置）→ 用 `gatk-variant-calling`。
- **纯文件级操作**（VCF/BAM 读写、索引、区域抓取、覆盖度）→ 用 `genomic-file-toolkit`。
- **变异功能注释**（基因、效应、rsID、临床意义）→ 用 `snpeff-variant-annotation`。
- 用户**明确要 raw（未过滤）统计**以评估检测器性能 → 不要过滤，照原样算并注明 raw。

前置：bcftools（含 `bcftools stats/query/view`）。**核心约束：原始 VCF 必须留档，绝不用过滤结果覆盖原文件**，以便审计与改阈值重跑。

## 步骤

判定 → 过滤 → 统计 → 验证 的决策流程：

1. **判 raw 还是已过滤**（先看 FILTER 列，再看 QUAL 分布与 header）：
   - FILTER 全为 `.` + 大量 QUAL<30 + Ts/Tv 偏低 → **raw**。注意 `.` 是「未评估」，不是「通过」。
   - FILTER 含 `PASS`/具名过滤器，或 header 有 `##FILTER=`/`##bcftools_viewCommand=`/`##GATKCommandLine=` → **已过滤**（DeepVariant 只输出高置信变异，可能全 `PASS`）。
2. **选动作**：
   - raw + 要常规统计 → 默认 `QUAL>=30`（错误率 1/1000，种系一线默认）过滤后再统计。
   - raw + 用户给了阈值（如 `QUAL>=50`）→ 用用户阈值；小 panel/靶向可放宽到 `QUAL>=20`。
   - raw + 用户要 raw 统计 → **不过滤**，照算并显式注明「unfiltered raw calls」。
   - 已过滤、FILTER 有混合值 → `bcftools view -f PASS` 取 PASS-only；不要再叠 QUAL 过滤（避免双重过滤删掉模型已放行的低 QUAL 真变异）。
3. **过滤+统计单管道**（不落中间文件，避免算错文件）：管道把 `bcftools view` 直接喂给 `bcftools stats`。
4. **验证**：算过滤后 Ts/Tv 是否回到期望区间（WGS≈2.0~2.1；WES≈2.8~3.3，CpG 富集偏高；raw 常 1.5~1.8）；统计过滤前后变异数。
5. **报告**：明确写清是否过滤、阈值、前后变异数，并附 bcftools 命令以可复现。

关键约束：**用 bcftools/vcftools 算 Ts/Tv，别手写 Python 解析器**（多等位、复杂变异、缺失基因型、转换/颠换分类的边界 bcftools 已处理好，自写易错且慢）。

## 示例

查 FILTER 列与 header（判 raw/已过滤）：

```bash
# 各 FILTER 取值计数
bcftools query -f '%FILTER\n' input.vcf | sort | uniq -c | sort -rn | head
# 有无非 '.' 的 FILTER 值
bcftools query -f '%FILTER\n' input.vcf | grep -v '^\.$' | head
# header 看检测器与既有过滤记录
bcftools view -h input.vcf | grep -E '##(FILTER|source|GATKCommandLine|bcftools)'
```

看 QUAL 分布（低质量占比）：

```bash
bcftools query -f '%QUAL\n' input.vcf \
  | awk '{if($1<30) low++; else high++} END {print "QUAL<30:", low+0, "QUAL>=30:", high+0}'
```

过滤 + 统计（单管道，QUAL>=30 默认）：

```bash
# 一条管道出过滤后统计，不落中间文件
bcftools view -i 'QUAL>=30' input.vcf | bcftools stats - > filtered_stats.txt

# 只取 Ts/Tv 比
bcftools view -i 'QUAL>=30' input.vcf | bcftools stats - | grep ^TSTV | cut -f5
# 变异计数汇总（SN 行）
bcftools view -i 'QUAL>=30' input.vcf | bcftools stats - | grep ^SN
# 每样本统计
bcftools stats -s - input.vcf | grep ^PSC
```

需要落盘过滤结果时（压缩 + 建索引，保留原文件）：

```bash
bcftools view -i 'QUAL>=30' input.vcf -Oz -o filtered.vcf.gz
bcftools index filtered.vcf.gz
```

混合 FILTER → 取 PASS-only（不叠 QUAL）：

```bash
bcftools view -f PASS input.vcf -Oz -o pass.vcf.gz
```

过滤前后对比（量化影响）：

```bash
echo "before: $(bcftools view -H input.vcf | wc -l) variants"
echo "after : $(bcftools view -i 'QUAL>=30' input.vcf | bcftools view -H | wc -l) variants"
echo "=== Ts/Tv before ==="; bcftools stats input.vcf | grep ^TSTV
echo "=== Ts/Tv after  ==="; bcftools view -i 'QUAL>=30' input.vcf | bcftools stats - | grep ^TSTV
```

## 注意事项

- **最常见错误：在 raw VCF 上直接算统计**。raw Ts/Tv 可低至 1.5，并被上千假阳性抬高变异计数 —— 算前必查 FILTER 列。
- **`FILTER='.'` ≠ 通过**：`.` 是「未评估」，`PASS` 才是「通过所有过滤」，具名值是「失败」（多个分号分隔）。把 `.` 当高质量会混入大量假阳性。
- **别双重过滤**：已过 VQSR/硬过滤的 VCF 再叠 `QUAL>=30`，会删掉检测器给了低 QUAL 但模型放行的真变异；先查 header 的过滤命令记录与 FILTER 非点值。
- **Ts/Tv 期望要选对测序类型**：WGS≈2.0~2.1，WES≈2.8~3.3，靶向 panel 视靶区而定；拿 WGS 期望去衡量 WES（或反之）会误判数据质量。
- **过滤后 Ts/Tv 仍偏低**：可能是检测器系统性问题、样本质量差，或需更严阈值 —— 进一步排查而非硬上结论。
- **务必报告过滤状态**：给出「Ts/Tv computed after QUAL>=30 filtering (N variants passed)」或「on unfiltered raw calls (N total)」这类声明，否则数字不可解释、不可复现。
- **有更丰富注释时别只靠 QUAL**：GATK 等提供 QD、FS、MQ、SOR、MQRankSum、ReadPosRankSum 等 INFO 注释，比单 QUAL 更有判别力（GATK SNP 硬过滤经验：QD<2.0、FS>60.0、MQ<40.0、MQRankSum<-12.5、ReadPosRankSum<-8.0）。

## 互见

- requires：`genomic-file-toolkit` —— VCF 的读写、索引（`.tbi`）、压缩与区域抓取是过滤/统计的输入输出基础。
- related：`cnvkit-copy-number` —— 同属变异分析家族（拷贝数）；`snpeff-variant-annotation` —— 过滤后 PASS 位点的功能注释下游。
- combines_with：`gatk-variant-calling` —— 上游检测产出 raw/已过滤 VCF，本条接力做一致质控与 Ts/Tv 验证；GATK 的硬过滤/VQSR 阈值即本条「更丰富注释」的来源。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
