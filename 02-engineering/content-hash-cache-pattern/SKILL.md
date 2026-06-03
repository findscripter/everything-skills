---
name: content-hash-cache-pattern
title: 内容哈希缓存模式（SHA-256 路径无关）
description: 当为高成本、可重复的文件处理（PDF 解析、OCR、文本/图像抽取）加缓存、需要 --cache/--no-cache 开关、且不想改动现有纯函数时使用；用文件内容的 SHA-256 作缓存键、按 {hash}.json 落盘、以独立服务层包裹纯处理函数，产出路径无关、内容变即自动失效、损坏即视为未命中的缓存方案；不适用于必须实时最新的数据、超大缓存条目（改用流式）、或结果还依赖内容之外参数（如抽取配置）的场景；触发词：内容哈希、SHA-256、文件缓存、缓存失效、纯函数
domain: 研发/backend
triggers: [内容哈希, content hash, SHA-256, 文件缓存, 缓存键, cache key, 缓存失效, 自动失效, PDF 解析缓存, OCR 缓存, 文本抽取, --cache, --no-cache, 纯函数, 服务层, 路径无关]
tags: [缓存, content-hash, sha256, file-processing, backend, 纯函数, srp, engineering]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python]
requires: []
related: [llm-prompt-caching, python-performance-optimization, error-handling-patterns, data-throughput-accelerator]
combines_with: [pdf-processing-toolkit, async-python-patterns]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

适用：

- 构建文件处理流水线（PDF 解析、OCR、文本抽取、图像分析），处理成本高且同一文件会被反复处理。
- CLI 工具需要 `--cache/--no-cache` 开关，按内容跨次运行复用结果。
- 批处理中同一文件在多个批次反复出现。
- 想给一个**已有的纯处理函数**加缓存，但不愿改动它的签名与职责。

不该用（负边界）：

- 数据必须始终最新（实时行情、消息流等）——缓存会返回过期结果。
- 单条缓存条目极大——`{hash}.json` 全量读写会吃内存，改用流式/分块存储。
- 结果不只取决于文件内容，还依赖内容之外的参数（如不同的抽取配置、模型版本、语言选项）——纯内容哈希会错误命中；需把这些参数一并并入缓存键。
- 文件内容本身高频变动，几乎每次都未命中——缓存收益为负。

## 步骤 / 指令

```
1. 用内容（非路径）算缓存键：对文件内容做 SHA-256，大文件分块读取，避免整文件入内存。
2. 缓存条目用 frozen dataclass 表示（file_hash + source_path + 处理结果）。
3. 按 {hash}.json 落盘：O(1) 按哈希查，无需索引文件；首次写入时惰性建目录。
4. 用独立服务层包裹纯处理函数：服务层做「查缓存 -> 未命中则处理 -> 写缓存」，纯函数对缓存零感知（SRP）。
5. 读缓存时优雅降级：JSON 损坏/反序列化失败一律当未命中返回 None，不崩溃，下次运行自动重算。
6. 用截断哈希（hash[:12]）记录命中/未命中日志，便于排查。
```

核心约束：

- 哈希内容而非路径——路径会变，内容身份不变。改名/移动 = 缓存命中；内容改动 = 自动失效；无需任何索引文件。
- 处理函数保持纯净，不得在其内部塞入缓存逻辑（否则一函数两职责，违反 SRP）。
- 嵌套 frozen dataclass 不要用 `dataclasses.asdict()`（复杂嵌套类型会出问题），改用手写序列化以完全掌控格式。

## 示例

1) 内容哈希缓存键（大文件分块）：

```python
import hashlib
from pathlib import Path

_HASH_CHUNK_SIZE = 65536  # 64KB 分块，适配大文件

def compute_file_hash(path: Path) -> str:
    """文件内容的 SHA-256（分块读取）。"""
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(_HASH_CHUNK_SIZE):
            sha256.update(chunk)
    return sha256.hexdigest()
```

2) 缓存条目（frozen dataclass）+ 文件存储：

```python
from dataclasses import dataclass
import json

@dataclass(frozen=True, slots=True)
class CacheEntry:
    file_hash: str
    source_path: str
    document: "ExtractedDocument"   # 被缓存的处理结果

def write_cache(cache_dir: Path, entry: CacheEntry) -> None:
    cache_dir.mkdir(parents=True, exist_ok=True)  # 惰性建目录
    cache_file = cache_dir / f"{entry.file_hash}.json"
    data = serialize_entry(entry)                 # 手写序列化
    cache_file.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

def read_cache(cache_dir: Path, file_hash: str) -> CacheEntry | None:
    cache_file = cache_dir / f"{file_hash}.json"
    if not cache_file.is_file():
        return None
    try:
        data = json.loads(cache_file.read_text(encoding="utf-8"))
        return deserialize_entry(data)
    except (json.JSONDecodeError, ValueError, KeyError):
        return None  # 损坏当未命中，下次重算
```

3) 服务层包裹纯函数（保持 SRP）：

```python
def extract_with_cache(
    file_path: Path,
    *,
    cache_enabled: bool = True,
    cache_dir: Path = Path(".cache"),
) -> "ExtractedDocument":
    """服务层：查缓存 -> 抽取 -> 写缓存。"""
    if not cache_enabled:
        return extract_text(file_path)        # 纯函数，对缓存无感

    file_hash = compute_file_hash(file_path)
    cached = read_cache(cache_dir, file_hash)
    if cached is not None:
        logger.info("Cache hit: %s (hash=%s)", file_path.name, file_hash[:12])
        return cached.document

    logger.info("Cache miss: %s (hash=%s)", file_path.name, file_hash[:12])
    doc = extract_text(file_path)             # 纯函数
    write_cache(cache_dir, CacheEntry(file_hash, str(file_path), doc))
    return doc
```

反模式（避免）：

```python
# 坏：路径作键 —— 文件移动/改名即失效
cache = {"/path/to/file.pdf": result}

# 坏：把缓存逻辑塞进处理函数 —— 一函数两职责，违反 SRP
def extract_text(path, *, cache_enabled=False, cache_dir=None):
    if cache_enabled: ...

# 坏：嵌套 frozen dataclass 用 asdict() —— 复杂嵌套类型会出错，改用手写序列化
data = dataclasses.asdict(entry)
```

## 注意事项

- 哈希内容不哈希路径；大文件务必分块，别整文件读入内存。
- 处理函数保持纯净——缓存是独立关注点，放服务层。
- 缓存损坏/反序列化失败优雅降级为未命中（返回 `None`），绝不崩溃。
- 命中/未命中均记日志（用截断哈希）便于调试。
- 关键设计取舍：SHA-256 内容哈希=路径无关+内容变即失效；`{hash}.json` 命名=O(1) 查、免索引；手写 JSON 序列化=完全掌控 frozen dataclass 的格式；`mkdir(parents=True)`=首写惰性建目录。
- 若结果依赖内容外参数（抽取配置/模型版本），把这些参数一并并入缓存键，否则会错误命中。

## 互见

- related：`file-upload-storage` —— 文件上传与存储管理，缓存层常落在其下游处理环节。
- related：`python-performance-optimization` —— 缓存是消除重复高成本计算的性能手段之一。
- related：`clean-code-principles` —— 服务层包裹纯函数即单一职责（SRP）的具体落地。
- combines_with：`bullmq-job-queue` —— 在批处理/后台队列中复用内容哈希缓存，跳过已处理文件。

---

采编自 affaan-m/everything-claude-code（MIT 许可）。
