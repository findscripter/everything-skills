---
name: odoo-backup-strategy
title: Odoo 备份与恢复策略
description: 当为生产 Odoo 实例制定备份方案或灾后恢复时使用；产出含数据库+filestore 的备份脚本、cron 计划、S3 异地上传与可验证的恢复流程；不适用于 Odoo.sh 自带备份与多数据库实例（需自行循环）。触发词：Odoo 备份、filestore、pg_restore 恢复
domain: 领域/erp
triggers: [Odoo 备份, Odoo 恢复, filestore, pg_dump, pg_restore, 数据库 dump, 备份脚本, cron 自动备份, S3 异地备份, 3-2-1 备份, 灾难恢复, Odoo 数据损坏]
tags: [odoo, erp, 备份, 恢复, postgresql, filestore, 运维, 灾备, cron, s3]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bash, pg_dump, pg_restore, tar, cron, aws-cli, docker compose, systemctl, python3, sha256sum, psql]
requires: []
related: [odoo-docker-deployment, odoo-performance-tuner, odoo-migration-helper, odoo-rpc-api]
combines_with: [odoo-accounting-setup, secrets-management]
license: MIT
source: sickn33/agentic-awesome-skills
source_license: MIT
---
## 何时使用

- 为生产 Odoo 实例制定完整备份方案（数据库 + filestore）。
- 用 shell 脚本 + cron 实现每日自动备份，并上传到 S3/远程做异地副本。
- 服务器故障、数据损坏后按正确顺序恢复 Odoo。
- 排查备份失败或恢复后数据缺失（多为漏备 filestore）。

不该用的边界：
- Odoo.sh 托管环境有自带备份系统（在 Dashboard 操作），不要套用本脚本。
- 本方案默认单数据库；多数据库实例需对所有库循环处理。
- 超大 filestore（100GB+）应改用 `rsync`/`restic` 做增量，而非整包 `tar.gz`。

核心约束：一份合格的 Odoo 备份必须同时包含 **PostgreSQL 数据库** 和 **filestore（附件、图片）**，二者缺一不可。

## 步骤

1. 备份数据库：`pg_dump -Fc`（自定义格式，便于 `pg_restore` 选择性恢复）。
2. 打包 filestore：`tar -czf` 归档对应库的 filestore 目录。
3. 校验与异地上传：验证 dump/归档、生成校验清单，再上传；上传失败不得进入保留期清理。
4. 定时调度：`crontab` 每日凌晨执行脚本并写日志。
5. 恢复时：先校验备份 → 恢复到新数据库与暂存 filestore → 在隔离实例验证 → 维护窗口切换并保留旧库/旧目录 → 浏览器验证登录/记录/附件。

## 指令

- 确认 filestore 路径（Docker 卷与裸机不同），恢复前务必核对：可用 `odoo-bin shell` 查询。默认路径形如 `/var/lib/odoo/.local/share/Odoo/filestore/<DB_NAME>`。
- 验证备份完整性：`pg_restore --list backup.dump` 应无报错完成。
- 数据库与 filestore 必须取自同一无写入窗口；除 Odoo 外的写入者也应暂停。示例用 Docker Compose，裸机需明确替换停启命令。
- 恢复使用新建暂存库与 `pg_restore --exit-on-error`；不要先删除生产库。归档可列出不代表恢复成功，仍需隔离恢复演练。

## 示例

### 1) 手动备份：数据库 + filestore

```bash
#!/bin/bash
# backup_odoo.sh
set -Eeuo pipefail
umask 077
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="odoo"
DB_USER="odoo"
FILESTORE_PATH="/var/lib/odoo/.local/share/Odoo/filestore/$DB_NAME"
BACKUP_DIR="/backups/odoo"

mkdir -p "$BACKUP_DIR"
STAGE=$(mktemp -d "$BACKUP_DIR/.partial-$DATE-XXXXXX")
BUNDLE_DIR="$BACKUP_DIR/backup-$DATE-$$"

# 先注册退出恢复，再进入无写入窗口；stop 失败也尝试恢复服务。
# 备份失败时保留 .partial 供诊断，绝不标成完成。
resume_odoo() {
    rc=$?
    trap - EXIT
    if ! docker compose start odoo; then
        echo "Odoo 重启失败，请人工恢复服务；备份目录：$STAGE" >&2
        exit 1
    fi
    exit "$rc"
}
trap resume_odoo EXIT
docker compose stop odoo

# 步骤1：导出数据库（自定义格式）
pg_dump -U "$DB_USER" -Fc "$DB_NAME" -f "$STAGE/db.dump"

# 步骤2：归档 filestore
tar -czf "$STAGE/filestore.tar.gz" -C "$FILESTORE_PATH" .

# 两种检查都成功后才发布完成目录。
pg_restore --list "$STAGE/db.dump" > /dev/null
tar -tzf "$STAGE/filestore.tar.gz" > /dev/null
(cd "$STAGE" && sha256sum db.dump filestore.tar.gz > SHA256SUMS && sha256sum -c SHA256SUMS)
mv -- "$STAGE" "$BUNDLE_DIR"
echo "备份完成: $BUNDLE_DIR"
```

### 2) cron 每日 2:00 自动执行

```bash
# crontab -e 添加：
0 2 * * * /opt/scripts/backup_odoo.sh >> /var/log/odoo_backup.log 2>&1
```

### 3) 上传 S3 与保留期检查（独立运行，使用已完成目录）

```bash
set -Eeuo pipefail
BACKUP_DIR="/backups/odoo"
BUNDLE_DIR="/backups/odoo/backup-YYYYMMDD_HHMMSS-PID" # 替换为实际完成目录
test -f "$BUNDLE_DIR/SHA256SUMS"
(cd "$BUNDLE_DIR" && sha256sum -c SHA256SUMS)
S3_URI="s3://my-odoo-backups/$(basename "$BUNDLE_DIR")"
aws s3 cp "$BUNDLE_DIR/db.dump" "$S3_URI/db.dump" --checksum-algorithm SHA256
aws s3 cp "$BUNDLE_DIR/filestore.tar.gz" "$S3_URI/filestore.tar.gz" --checksum-algorithm SHA256
aws s3 cp "$BUNDLE_DIR/SHA256SUMS" "$S3_URI/SHA256SUMS" --checksum-algorithm SHA256

# 仅在全部上传成功后列出保留期候选，不自动删除。
find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name 'backup-*' -mtime +7 -print
```

清理前确认异地可下载且校验通过、最近恢复演练成功、仍满足保留策略；不要删除唯一可恢复副本或 `.partial-*` 诊断目录。任一上传失败时脚本立即退出，不运行上述候选检查。

### 4) 完整恢复流程

```bash
#!/bin/bash
set -Eeuo pipefail
umask 077
BUNDLE_DIR="/backups/odoo/backup-YYYYMMDD_HHMMSS-PID" # 替换为实际完成目录
DB_USER="odoo"        # 需要创建暂存库的权限；使用部署实际的数据库角色
RESTORE_DB="odoo_restore_$(date +%Y%m%d_%H%M%S)_$$"

# 此前不停止、不删除、不修改生产库或 filestore。
test -s "$BUNDLE_DIR/db.dump"
test -s "$BUNDLE_DIR/filestore.tar.gz"
(cd "$BUNDLE_DIR" && sha256sum -c SHA256SUMS)
pg_restore --list "$BUNDLE_DIR/db.dump" > /dev/null
tar -tzf "$BUNDLE_DIR/filestore.tar.gz" > /dev/null

# 只接受常规文件/目录与相对路径；在解压前拒绝路径逃逸、符号链接及设备文件。
python3 - "$BUNDLE_DIR/filestore.tar.gz" <<'PY'
import sys, tarfile
from pathlib import PurePosixPath
with tarfile.open(sys.argv[1], "r:gz") as archive:
    for member in archive:
        path = PurePosixPath(member.name)
        if path.is_absolute() or ".." in path.parts or not (member.isfile() or member.isdir()):
            raise SystemExit(f"不安全的归档成员：{member.name}")
PY

RESTORE_ROOT=$(mktemp -d /var/lib/odoo/restore-XXXXXX)
mkdir "$RESTORE_ROOT/$RESTORE_DB"
createdb -U "$DB_USER" "$RESTORE_DB"
pg_restore --exit-on-error -U "$DB_USER" -d "$RESTORE_DB" "$BUNDLE_DIR/db.dump"
tar --no-same-owner --no-same-permissions -xzf "$BUNDLE_DIR/filestore.tar.gz" -C "$RESTORE_ROOT/$RESTORE_DB"
psql -U "$DB_USER" -d "$RESTORE_DB" -v ON_ERROR_STOP=1 -c 'SELECT count(*) FROM ir_module_module;'
echo "暂存恢复完成，待隔离验证：数据库=$RESTORE_DB，filestore=$RESTORE_ROOT/$RESTORE_DB"
```

上例只完成暂存恢复。给隔离 Odoo 实例配置该数据库与 filestore（修正实际服务用户权限），禁用邮件、计划任务、支付及外部集成，验证登录、模块、关键记录和附件。任何失败都停止，保留暂存状态供诊断，生产实例保持原状。

通过后由运维在维护窗口切换：停止所有写入者并保留当前一致性备份；把旧库和旧 filestore 分别重命名到唯一回滚名称；再将已验证的暂存库和目录切换到生产名称。两个切换都成功后才启动服务。中途失败保持停机，按记录恢复两个旧名称；不要删除旧状态。生产验收成功且保留期满足后再另行清理。

## 注意事项

- 每月在 staging 环境演练恢复——没恢复过的备份不算备份。
- 遵循 **3-2-1 原则**：3 份副本、2 种介质、1 份异地（如 S3 或远程服务器）。
- **每次 Odoo 升级前立即备份**，这是你的回滚点。
- 只备数据库不备 filestore：恢复后所有附件和图片都会丢失。
- 备份不要放在与 Odoo 同一磁盘/同一服务器：磁盘或主机故障会同时毁掉两者。
- 备份、上传或暂存恢复失败必须非零退出；不得把失败状态当成功继续清理、切换或启动新状态。

## 互见

- PostgreSQL 备份与 `pg_dump`/`pg_restore` 通用实践。
- 对象存储异地容灾（S3 生命周期、版本控制）。
- 超大文件增量同步（`rsync`/`restic`）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
