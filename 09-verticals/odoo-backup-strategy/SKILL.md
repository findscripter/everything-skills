---
name: odoo-backup-strategy
title: Odoo 备份与恢复策略
description: 当为生产 Odoo 实例制定备份方案或灾后恢复时使用；产出含数据库+filestore 的备份脚本、cron 计划、S3 异地上传与可验证的恢复流程；不适用于 Odoo.sh 自带备份与多数据库实例（需自行循环）。触发词：Odoo 备份、filestore、pg_restore 恢复
domain: 领域/erp
triggers: [Odoo 备份, Odoo 恢复, filestore, pg_dump, pg_restore, 数据库 dump, 备份脚本, cron 自动备份, S3 异地备份, 3-2-1 备份, 灾难恢复, Odoo 数据损坏]
tags: [Odoo, ERP, 备份, 恢复, PostgreSQL, filestore, 运维, 灾备, cron, S3]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bash, pg_dump, pg_restore, tar, cron, aws-cli, docker compose, systemctl]
requires: []
related: [odoo-docker-deployment, odoo-performance-tuner, odoo-migration-helper, odoo-rpc-api]
combines_with: [odoo-accounting-setup, secrets-management]
license: MIT
source: sickn33/antigravity-awesome-skills
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
3. 异地上传：把 dump 与归档 `aws s3 cp` 到桶；清理本地过期文件。
4. 定时调度：`crontab` 每日凌晨执行脚本并写日志。
5. 恢复时：先停 Odoo → 重建库并 `pg_restore` → 还原 filestore → 启动 → 浏览器验证登录/记录/附件。

## 指令

- 确认 filestore 路径（Docker 卷与裸机不同），恢复前务必核对：可用 `odoo-bin shell` 查询。默认路径形如 `/var/lib/odoo/.local/share/Odoo/filestore/<DB_NAME>`。
- 验证备份完整性：`pg_restore --list backup.dump` 应无报错完成。
- `pg_restore --clean` 不能对不存在的库运行——务必先 `dropdb` 再 `createdb`。

## 示例

### 1) 手动备份：数据库 + filestore

```bash
#!/bin/bash
# backup_odoo.sh
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="odoo"
DB_USER="odoo"
FILESTORE_PATH="/var/lib/odoo/.local/share/Odoo/filestore/$DB_NAME"
BACKUP_DIR="/backups/odoo"

mkdir -p "$BACKUP_DIR"

# 步骤1：导出数据库（自定义格式）
pg_dump -U $DB_USER -Fc $DB_NAME > "$BACKUP_DIR/db_$DATE.dump"

# 步骤2：归档 filestore
tar -czf "$BACKUP_DIR/filestore_$DATE.tar.gz" -C "$FILESTORE_PATH" .

echo "备份完成: db_$DATE.dump + filestore_$DATE.tar.gz"
```

### 2) cron 每日 2:00 自动执行

```bash
# crontab -e 添加：
0 2 * * * /opt/scripts/backup_odoo.sh >> /var/log/odoo_backup.log 2>&1
```

### 3) 上传 S3 并清理本地（接在备份脚本之后）

```bash
aws s3 cp "$BACKUP_DIR/db_$DATE.dump"          s3://my-odoo-backups/db/
aws s3 cp "$BACKUP_DIR/filestore_$DATE.tar.gz" s3://my-odoo-backups/filestore/

# 删除本地 7 天前的备份
find "$BACKUP_DIR" -type f -mtime +7 -delete
```

### 4) 完整恢复流程

```bash
# 步骤1：停止 Odoo
docker compose stop odoo   # 或：systemctl stop odoo

# 步骤2：重建并恢复数据库
#（单独用 --clean 对不存在的库会失败，先 drop 再 create）
dropdb -U odoo odoo 2>/dev/null || true
createdb -U odoo odoo
pg_restore -U odoo -d odoo db_YYYYMMDD_HHMMSS.dump

# 步骤3：还原 filestore
FILESTORE=/var/lib/odoo/.local/share/Odoo/filestore/odoo
rm -rf "$FILESTORE"/*
tar -xzf filestore_YYYYMMDD_HHMMSS.tar.gz -C "$FILESTORE"/

# 步骤4：重启 Odoo
docker compose start odoo

# 步骤5：浏览器验证——能否登录？最新记录可见？附件能加载？
```

## 注意事项

- 每月在 staging 环境演练恢复——没恢复过的备份不算备份。
- 遵循 **3-2-1 原则**：3 份副本、2 种介质、1 份异地（如 S3 或远程服务器）。
- **每次 Odoo 升级前立即备份**，这是你的回滚点。
- 只备数据库不备 filestore：恢复后所有附件和图片都会丢失。
- 备份不要放在与 Odoo 同一磁盘/同一服务器：磁盘或主机故障会同时毁掉两者。
- 不要对不存在的库跑 `pg_restore --clean`：先建库。

## 互见

- PostgreSQL 备份与 `pg_dump`/`pg_restore` 通用实践。
- 对象存储异地容灾（S3 生命周期、版本控制）。
- 超大文件增量同步（`rsync`/`restic`）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
