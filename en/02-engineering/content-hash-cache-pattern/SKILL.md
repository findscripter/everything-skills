---
name: content-hash-cache-pattern
title: コンテンツハッシュファイルキャッシュパターン
description: SHA-256コンテンツハッシュを使用して、高コストなファイル処理結果をキャッシュします — パス非依存、自動無効化、サービスレイヤーの分離。
domain: 研发/backend
triggers: [content hash, SHA-256, cache key, --cache, --no-cache]
tags: [content-hash, sha256, file-processing, backend, srp, engineering]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [llm-prompt-caching, python-performance-optimization, error-handling-patterns, data-throughput-accelerator]
combines_with: [pdf-processing-toolkit, async-python-patterns]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Content-Hash File Cache Pattern

Cache the results of expensive file processing (PDF parsing, text extraction, image analysis) using a SHA-256 content hash as the cache key. Unlike path-based caching, this approach survives file moves/renames and automatically invalidates when the content changes.

## Triggers

- Building a file-processing pipeline (PDF, image, text extraction)
- Processing is expensive and the same file is processed repeatedly
- You need a `--cache/--no-cache` CLI option
- You want to add caching without modifying an existing pure function

## Core Pattern

### 1. Content-hash-based cache key

Use the file content, not its path, as the cache key:

```python
import hashlib
from pathlib import Path

_HASH_CHUNK_SIZE = 65536  # 64KB chunks for large files

def compute_file_hash(path: Path) -> str:
    """SHA-256 of the file content (chunked for large files)."""
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(_HASH_CHUNK_SIZE)
            if not chunk:
                break
            sha256.update(chunk)
    return sha256.hexdigest()
```

**Why a content hash?** Renaming/moving a file = cache hit. Changing the content = automatic invalidation. No index file required.

### 2. Frozen dataclass for the cache entry

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CacheEntry:
    file_hash: str
    source_path: str
    document: ExtractedDocument  # the cached result
```

### 3. File-based cache storage

Each cache entry is stored as `{hash}.json` — O(1) lookup by hash, no index file needed.

```python
import json
from typing import Any

def write_cache(cache_dir: Path, entry: CacheEntry) -> None:
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_file = cache_dir / f"{entry.file_hash}.json"
    data = serialize_entry(entry)
    cache_file.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

def read_cache(cache_dir: Path, file_hash: str) -> CacheEntry | None:
    cache_file = cache_dir / f"{file_hash}.json"
    if not cache_file.is_file():
        return None
    try:
        raw = cache_file.read_text(encoding="utf-8")
        data = json.loads(raw)
        return deserialize_entry(data)
    except (json.JSONDecodeError, ValueError, KeyError):
        return None  # treat corruption as a cache miss
```

### 4. Service-layer wrapper (SRP)

Keep the processing function pure. Add caching as a separate service layer.

```python
def extract_with_cache(
    file_path: Path,
    *,
    cache_enabled: bool = True,
    cache_dir: Path = Path(".cache"),
) -> ExtractedDocument:
    """Service layer: check cache -> extract -> write cache."""
    if not cache_enabled:
        return extract_text(file_path)  # pure function, no knowledge of caching

    file_hash = compute_file_hash(file_path)

    # Check the cache
    cached = read_cache(cache_dir, file_hash)
    if cached is not None:
        logger.info("Cache hit: %s (hash=%s)", file_path.name, file_hash[:12])
        return cached.document

    # Cache miss -> extract -> store
    logger.info("Cache miss: %s (hash=%s)", file_path.name, file_hash[:12])
    doc = extract_text(file_path)
    entry = CacheEntry(file_hash=file_hash, source_path=str(file_path), document=doc)
    write_cache(cache_dir, entry)
    return doc
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| SHA-256 content hash | Path-independent; auto-invalidates when content changes |
| `{hash}.json` file naming | O(1) lookup, no index file needed |
| Service-layer wrapper | SRP: keep extraction pure, caching is a separate concern |
| Manual JSON serialization | Full control over serializing frozen dataclasses |
| Return `None` on corruption | Graceful degradation; reprocess on the next run |
| `cache_dir.mkdir(parents=True)` | Lazy directory creation on first write |

## Best Practices

- **Hash the content, not the path** — paths change, but content identity does not
- **Hash large files in chunks** — avoid reading the entire file into memory
- **Log cache hits/misses with a truncated hash** — for debugging
- **Handle corruption gracefully** — treat invalid cache entries as misses, don't crash

## Anti-Patterns to Avoid

```python
# Bad: path-based cache (breaks when the file is moved/renamed)
cache = {"/path/to/file.pdf": result}

# Bad: adding cache logic inside the processing function (violates SRP)
def extract_text(path, *, cache_enabled=False, cache_dir=None):
    if cache_enabled:  # this function now has two responsibilities
        ...

# Bad: using dataclasses.asdict() with nested frozen dataclasses
# (can cause problems with complex nested types)
data = dataclasses.asdict(entry)  # use manual serialization instead
```

## When to Use

- File-processing pipelines (PDF parsing, OCR, text extraction, image analysis)
- CLI tools where a `--cache/--no-cache` option is beneficial
- Batch processing where the same file appears multiple times
- Adding caching without modifying an existing pure function

## When Not to Use

- Data that must always be current (real-time feeds)
- Very large cache entries (consider streaming instead)
- Results that depend on parameters other than the file content (e.g., different extraction settings)
