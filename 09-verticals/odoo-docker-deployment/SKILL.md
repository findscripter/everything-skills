---
name: odoo-docker-deployment
title: Odoo Docker 生产部署
description: 当用 Docker/docker-compose 自托管部署或排障 Odoo 时使用；产出生产级 compose、odoo.conf、备份/更新命令与 Nginx+SSL 反代约束；不适用于 Odoo.sh 云托管、多容器水平扩展与共享 filestore。触发词：Odoo 部署、docker-compose、PostgreSQL 容器、反向代理、workers 调优
domain: 领域/erp
triggers: [Odoo Docker 部署, odoo docker-compose, Odoo 生产环境, Odoo PostgreSQL 连接错误, Odoo 容器启动失败, Odoo Nginx 反向代理, odoo.conf workers 调优, Odoo VPS 部署, Odoo 数据库备份]
tags: [odoo, docker, docker-compose, postgresql, nginx, erp, 部署, 运维]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [docker, docker-compose, postgresql, nginx, certbot]
requires: []
related: [odoo-backup-strategy, odoo-performance-tuner, docker-expert, odoo-module-developer]
combines_with: [docker-development-optimizer, odoo-localization-compliance]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 Docker 起本地 Odoo 开发环境。
- 把 Odoo 部署到 VPS 或云主机（AWS、DigitalOcean 等）自托管。
- 排查 Odoo 容器启动失败或数据库连接错误。
- 给现有 Odoo Docker 部署加 Nginx + SSL 反向代理。

不该用（负边界）：
- Odoo.sh 云托管：其部署模型完全不同，本条目不覆盖。
- 多 Odoo 容器 + 负载均衡的水平扩展：需共享 filestore（NFS 或 S3 兼容存储），此处不涉及。
- 需要完整 Nginx 反代配置模板时：本条目只给约束，配置细节查 Odoo 官方部署文档。

## 步骤

1. 写 `.env`：把 `POSTGRES_PASSWORD`、`ODOO_MASTER_PASSWORD` 等密钥放进去，compose 与 conf 里用 `${VAR}` 引用，禁止硬编码。
2. 写 `docker-compose.yml`：db（PostgreSQL）+ odoo 两服务，挂持久卷与自定义 addons，用内部网络隔离，DB 健康检查通过后 Odoo 才启动。
3. 写 `odoo.conf`：按服务器核数/内存调 `workers` 与内存/超时上限，指向正确 `addons_path`。
4. `docker compose up -d` 启动，`logs -f odoo` 看日志确认就绪。
5. 生产环境在 Odoo 前置 Nginx 做 SSL 终止（Let's Encrypt / Certbot），不要让 Odoo 直接裸跑 80/443。
6. 配好定期 `pg_dump` 备份。

## 指令

```bash
# 后台启动全部服务
docker compose up -d

# 实时跟踪 Odoo 日志
docker compose logs -f odoo

# 只重启 Odoo（不动 DB，避免数据风险）
docker compose restart odoo

# 停止全部服务
docker compose down

# 备份数据库到本地 SQL dump
docker compose exec db pg_dump -U odoo odoo > backup_$(date +%Y%m%d).sql

# 不重启服务器、增量升级某个自定义模块
docker compose exec odoo odoo -d odoo --update my_module --stop-after-init
```

## 示例

生产级 `docker-compose.yml`（Compose v2 顶层 `version` 已废弃，省略即可）：

```yaml
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: odoo
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - odoo-net

  odoo:
    image: odoo:17.0
    restart: always
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8069:8069"
      - "8072:8072"   # Longpolling，用于在线客服 / bus
    environment:
      HOST: db
      USER: odoo
      PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - odoo-web-data:/var/lib/odoo
      - ./addons:/mnt/extra-addons   # 自定义模块
      - ./odoo.conf:/etc/odoo/odoo.conf
    networks:
      - odoo-net

volumes:
  postgres-data:
  odoo-web-data:

networks:
  odoo-net:
```

`odoo.conf`（以 4 核 / 8GB 服务器为例）：

```ini
[options]
admin_passwd = ${ODOO_MASTER_PASSWORD}    ; 经 env 或 .env 注入
db_host = db
db_port = 5432
db_user = odoo
db_password = ${POSTGRES_PASSWORD}        ; 经 env 或 .env 注入

; 官方 Odoo Docker 镜像（基于 Debian）内的 addons_path
addons_path = /mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons

logfile = /var/log/odoo/odoo.log
log_level = warn

; 4 核 / 8GB 的 worker 调优：
workers = 9                ; (CPU 核数 × 2) + 1
max_cron_threads = 2
limit_memory_soft = 1610612736   ; 1.5 GB — 软杀阈值
limit_memory_hard = 2147483648   ; 2.0 GB — 硬杀阈值
limit_time_cpu = 600
limit_time_real = 1200
limit_request = 8192
```

## 注意事项

应当：
- 所有密钥放 `.env`，用 `${VAR}` 引用，绝不在 `docker-compose.yml` 里硬编码。
- 用 `depends_on: condition: service_healthy` 配合 PostgreSQL 健康检查，避免 Odoo 先于 DB 就绪而启动。
- 用 Nginx 前置做 SSL 终止，不要把 Odoo 直接暴露在 80/443。
- `workers = (CPU 核数 × 2) + 1`；`workers = 0` 是单线程模式，会阻塞所有用户。

不应当：
- 把 5432（PostgreSQL）端口暴露到公网，仅保留在内部 Docker 网络。
- 生产用 `latest` 或 `17` 这类浮动 tag，应固定到具体补丁级 tag（如 `odoo:17.0`）。
- 在 CI/CD 里靠挂载 `odoo.conf` 来传密钥，改用 Docker secrets 或环境变量。
- 升级 Odoo 镜像后默认 `addons_path` 不变：新基础镜像可能改路径，升级后务必核对。

## 互见

- Odoo 官方部署文档（含完整 Nginx 反代配置）：https://www.odoo.com/documentation/17.0/administration/install/deploy.html

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
