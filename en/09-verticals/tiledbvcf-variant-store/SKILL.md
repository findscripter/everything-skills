---
name: tiledbvcf-variant-store
title: TileDB-VCF Variant Store
description: Use when ingesting many single-sample VCF/BCF files into a TileDB sparse-array store and querying variants by genomic region/sample at high speed; covers create, ingest, query, export to VCF/TSV, and allele-frequency computation. Not for multi-sample merged VCFs, >1000-sample pro
domain: 领域/science
triggers: [TileDB-VCF, tiledbvcf, variant store, VCF ingestion, population genomics, variant database, cohort VCF, allele frequency, GWAS data prep, sparse array variants]
tags: [bioinformatics, genomics, variant-data, tiledb, vcf, population-genetics, data-storage, misc]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [bcftools-variant-manipulation, vcf-variant-filtering, gatk-variant-calling, genomic-file-toolkit]
combines_with: [gatk-variant-calling, bcftools-variant-manipulation]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## When to use

TileDB-VCF is a high-performance C++ library with Python and CLI interfaces for efficient storage and retrieval of genomic variant-call data. Built on TileDB's sparse-array technology, it enables scalable ingestion of VCF/BCF files, incremental sample addition without expensive merging, and efficient parallel queries of variant data stored locally or in the cloud.

Use this skill when:

- Building a population-genomics / cohort variant database from many single-sample VCF/BCF files.
- You need to add new samples incrementally without doing an expensive multi-sample merge.
- You require high-performance queries of specific genomic regions across many samples.
- You work with cloud-stored variant data (S3, Azure, GCS) or need to export subsets of large VCF datasets.
- GWAS data preparation, rare-variant burden testing, allele-frequency calculation, or cross-cohort QC.
- Prototyping, education, and method development where variant-data performance matters.

**Do NOT use (negative boundaries):**

- **Multi-sample (merged) VCFs** — only single-sample VCFs are supported; split first with `bcftools`.
- **Unindexed input** — VCF/BCF files must have a `.csi` (bcftools) or `.tbi` (tabix) index.
- **Production / very large scale** (>1000 samples, >100GB, distributed compute, multi-user collaboration, or compliance) — migrate to TileDB-Cloud.
- **Lightweight VCF text filtering / format conversion** — plain `bcftools` is simpler.
- **Concurrent writers to the same dataset** — multiple writers can corrupt data; use locking.

## Steps

1. **Install (preferred: conda/mamba).**

   ```bash
   # On an M1 Mac, set the subdir to osx-64 first:
   CONDA_SUBDIR=osx-64
   conda config --env --set subdir osx-64

   # Create and activate the environment
   conda create -n tiledb-vcf "python<3.10"
   conda activate tiledb-vcf

   # Mamba is a faster, more reliable alternative to conda
   conda install -c conda-forge mamba

   # Install TileDB-Py and TileDB-VCF plus useful libraries
   mamba install -y -c conda-forge -c bioconda -c tiledb \
     tiledb-py tiledbvcf-py pandas pyarrow numpy
   ```

   Alternative — Docker images:

   ```bash
   docker pull tiledb/tiledbvcf-py     # Python interface
   docker pull tiledb/tiledbvcf-cli    # Command-line interface
   ```

2. **Create + ingest.** Ensure each VCF is single-sample and indexed (`.csi` or `.tbi`), then `ingest_samples`. Add new samples incrementally without re-processing existing data.

3. **Query.** Open the dataset with `mode="r"` and read into a DataFrame, specifying `attrs / regions / samples`.

4. **Export.** Use `export` to write a VCF/BCF subset, or generate TSV with selected fields.

5. **Advanced.** Compute allele frequencies, run sample QC, and tune memory budget and tile cache.

**Coordinate convention (critical):** TileDB-VCF uses **1-based, both-ends-inclusive** coordinates following the VCF standard. `chr1:1000-2000` includes positions 1000–2000 (1001 bases total).

## Example

**Create and populate a dataset (single-sample + index):**

```python
import tiledbvcf

# Create a new dataset
ds = tiledbvcf.Dataset(uri="my_dataset", mode="w",
                       cfg=tiledbvcf.ReadConfig(memory_budget=1024))

# Ingest VCF files. Requirements:
#  - single-sample VCFs only (not multi-sample)
#  - must have indexes: .csi (bcftools) or .tbi (tabix)
ds.ingest_samples(["sample1.vcf.gz", "sample2.vcf.gz"])
```

**Query variant data by region/sample:**

```python
ds = tiledbvcf.Dataset(uri="my_dataset", mode="r")
df = ds.read(
    attrs=["sample_name", "pos_start", "pos_end", "alleles", "fmt_GT"],
    regions=["chr1:1000000-2000000", "chr2:500000-1500000"],
    samples=["sample1", "sample2", "sample3"],
)
print(df.head())
```

**Export a VCF subset:**

```python
import os

ds.export(
    regions=["chr21:8220186-8405573"],
    samples=["HG00101", "HG00097"],
    output_format="v",
    output_dir=os.path.expanduser("~"),
)
```

**Allele frequency:**

```python
af_df = tiledbvcf.read_allele_frequency(
    uri="my_dataset",
    regions=["chr1:1000000-2000000"],
    samples=["sample1", "sample2", "sample3"],
)
```

**Sample QC and custom configuration:**

```python
qc_results = tiledbvcf.sample_qc(uri="my_dataset", samples=["sample1", "sample2"])

config = tiledbvcf.ReadConfig(
    memory_budget=4096,
    tiledb_config={
        "sm.tile_cache_size": "1000000000",
        "vfs.s3.region": "us-east-1",
    },
)
```

**CLI (subcommands: create / store / export / list / stat / utils / version):**

```bash
tiledbvcf create --uri my_dataset
tiledbvcf store  --uri my_dataset --samples sample1.vcf.gz,sample2.vcf.gz
tiledbvcf export --uri my_dataset \
  --regions "chr1:1000000-2000000" --sample-names "sample1,sample2"
tiledbvcf list --uri my_dataset
tiledbvcf stat --uri my_dataset
```

**Cloud dataset URIs:** `s3://bucket/dataset`, `azure://container/dataset`, `gcs://bucket/dataset`.

## Notes

- **Memory exhaustion during ingestion:** set an appropriate `memory_budget` and batch large files; partition with `ReadConfig`'s `region_partition` / `sample_partition`.
- **Inefficient region queries:** combine nearby regions instead of issuing many small separate queries; configure the tile cache (`sm.tile_cache_size`) for repeated region access.
- **Missing / mismatched sample names:** sample names in VCF headers must match the `samples` you pass to queries.
- **Large result sets:** use streaming or pagination for queries returning millions of variants rather than loading everything at once.
- **Cloud permissions:** ensure correct authentication for S3/Azure/GCS access (e.g. `vfs.s3.region`).
- **Concurrent access:** multiple writers to the same dataset can corrupt it — use locking; incremental sample addition does not re-process existing data.
- **Migration signals:** move to TileDB-Cloud for >1000 samples, >100GB of VCF data, distributed compute, multi-user access, or compliance needs. Install `pip install tiledb-cloud[life-sciences]`, set `export TILEDB_REST_TOKEN="<api_token>"`, and use `tiledb.cloud.vcf` for distributed ingestion and queries.

## See also

- TileDB-VCF GitHub: https://github.com/TileDB-Inc/TileDB-VCF
- TileDB Academy — Population Genomics guide: https://cloud.tiledb.com/academy/structure/life-sciences/population-genomics/
- Related variant-processing skills (bcftools/VCF preprocessing: split into single-sample VCFs, build indexes): `bcftools-variant-manipulation`, `vcf-variant-filtering`, `gatk-variant-calling`, `genomic-file-toolkit`.
