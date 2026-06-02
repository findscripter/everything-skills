---
name: laravel-app-specialist
title: Laravel 应用开发专家
description: 当用 Laravel 10+/PHP 8.2+ 构建应用时使用；做 Eloquent 模型与关系、迁移、RESTful API（API Resource）、Sanctum 鉴权、队列/Horizon、Livewire 组件与 Pest/PHPUnit 测试并产出生产级代码；不适用于纯 PHP 语法、其他框架（Symfony/裸 PHP）、纯前端或纯 SQL 调优。触发词：Laravel、Eloquent、Artisan、Sanctum、Horizon、Livewire
domain: 研发/backend
triggers: [Laravel, Eloquent, Artisan, Blade, API Resource, Sanctum, Horizon, 队列 Job, Livewire, 迁移 migration, Pest, PHPUnit, N+1 eager loading, php artisan, Laravel 测试]
tags: [laravel, php, eloquent, queue, horizon, sanctum, livewire, api-resource, pest, 后端, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob, Bash, Edit, Write]
requires: []
related: [php-pro, laravel-security-audit, rails-hotwire-expert, rest-api-endpoint-builder]
combines_with: [database-migration-strategies, laravel-security-audit, api-test-suite-builder]
license: MIT
source: jeffallan/claude-skills
source_license: MIT
---
## 何时使用

适用：

- 用 Laravel 10+（PHP 8.2+）构建或扩展应用：Eloquent 模型与关系、数据库迁移、服务层、Job 队列。
- 设计 RESTful API：控制器、中间件、API Resource 数据转换、Sanctum/Passport 鉴权流程。
- 异步与后台任务：队列 Job、Worker、Horizon、失败重试与批处理。
- 构建 Livewire 响应式界面（`wire:model`、动作、实时更新）。
- 优化 Eloquent 查询（消除 N+1、预加载/`with()`、作用域），或为 Laravel 特性补 Pest/PHPUnit 测试。

不该用（负边界）：

- 纯 PHP 8 语法/性能/内存问题且不涉及 Laravel → 切到 `php-pro`。
- 目标框架非 Laravel（Symfony、Slim、裸 PHP、其他语言）。
- 纯前端（React/Vue 独立 SPA，非 Livewire/Inertia）或纯 SQL/数据库引擎调优。

## 步骤

源仓库的核心工作流（适配）：

1. 分析需求：识别模型、关系、API 与队列需求。
2. 设计架构：规划数据库 schema、服务层与 Job 队列边界。
3. 实现模型：建带关系/作用域/casts 的 Eloquent 模型；`php artisan make:model`，用 `php artisan migrate:status` 验证。
4. 构建特性：控制器、服务、API Resource、Job；用 `php artisan route:list` 验证路由。
5. 充分测试：写 feature/unit 测试，每步收尾前先跑 `php artisan test`（目标覆盖率 >85%）。

## 指令

必须做（MUST DO）：

- 用 PHP 8.2+ 特性：`readonly`、`enum`、强类型属性；所有方法参数与返回值都标注类型。
- 正确使用 Eloquent 关系，靠 `::with()` 在调用点预加载，杜绝 N+1。
- 用 API Resource 转换出参，不直接吐模型。
- 长任务进队列；业务逻辑放服务层，别堆在控制器里。
- 写全面测试（>85% 覆盖），用服务容器与依赖注入，遵循 PSR-12。

禁止做（MUST NOT DO）：

- 用无防护的裸 SQL（SQL 注入），跳过预加载（N+1），明文存敏感数据。
- 在控制器里混业务逻辑，硬编码配置，跳过用户输入校验。
- 用已废弃的 Laravel 特性，忽略队列失败。

各阶段验证检查点（在进入下一步前确认）：

| 阶段 | 命令 | 期望 |
|---|---|---|
| 迁移后 | `php artisan migrate:status` | 全部显示 `Ran` |
| 路由后 | `php artisan route:list --path=api` | 新路由出现且动词正确 |
| 派发 Job 后 | `php artisan queue:work --once` | Job 无异常处理完 |
| 实现后 | `php artisan test --coverage` | 覆盖率 >85%，0 失败 |
| 提 PR 前 | `./vendor/bin/pint --test` | PSR-12 检查通过 |

## 示例

Eloquent 模型（关系 + 作用域 + enum cast，关系在调用点 `::with()` 预加载）：

```php
<?php
declare(strict_types=1);
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\SoftDeletes;

final class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['title', 'body', 'status', 'user_id'];
    protected $casts = [
        'status'       => PostStatus::class,   // backed enum
        'published_at' => 'immutable_datetime',
    ];

    public function author(): BelongsTo { return $this->belongsTo(User::class, 'user_id'); }
    public function comments(): HasMany { return $this->hasMany(Comment::class); }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', PostStatus::Published);
    }
}
```

API Resource（用 `whenLoaded` 避免触发 N+1）：

```php
public function toArray(Request $request): array
{
    return [
        'id'           => $this->id,
        'title'        => $this->title,
        'status'       => $this->status->value,
        'published_at' => $this->published_at?->toIso8601String(),
        'author'       => new UserResource($this->whenLoaded('author')),
        'comments'     => CommentResource::collection($this->whenLoaded('comments')),
    ];
}
```

队列 Job（重试 + `failed()` 不吞异常）：

```php
final class PublishPost implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(private readonly Post $post) {}

    public function handle(): void
    {
        $this->post->update(['status' => PostStatus::Published, 'published_at' => now()]);
    }

    public function failed(\Throwable $e): void
    {
        logger()->error('PublishPost failed', ['post' => $this->post->id, 'error' => $e->getMessage()]);
    }
}
```

Pest feature 测试（鉴权访问 + 断言队列派发）：

```php
it('queues a publish job when a draft is submitted', function (): void {
    Queue::fake();
    $user = User::factory()->create();
    $post = Post::factory()->draft()->for($user, 'author')->create();

    $this->actingAs($user)
        ->postJson("/api/posts/{$post->id}/publish")
        ->assertAccepted();

    Queue::assertPushed(PublishPost::class, fn ($job) => $job->post->is($post));
});
```

迁移要点：`foreignId('user_id')->constrained()->cascadeOnDelete()` + `softDeletes()` + `timestamps()`，`down()` 用 `Schema::dropIfExists()`。

## 注意事项

- 探测优先用一次性命令（`artisan migrate:status`/`route:list`），别起 `serve`/`queue:work`（不带 `--once`）这类长驻进程。
- N+1 是最高频问题：始终在查询起点 `with()`，Resource 内用 `whenLoaded()`，可配 `Model::preventLazyLoading()` 在开发期暴露漏网查询。
- 队列失败必须可观测：设 `$tries`/`$backoff` 并实现 `failed()`，生产用 Horizon 监控；`SerializesModels` 只序列化主键，Job 内重新取最新数据。
- 输出代码不能替代环境内实测与评审；上线前务必跑通 迁移→路由→队列→`php artisan test`→`pint`。
- 知识面覆盖：Eloquent、API Resource、Sanctum/Passport、队列/Horizon、Livewire/Inertia、Octane、Pest/PHPUnit、Redis、广播、事件/监听、通知、任务调度。仅当任务确实落在 Laravel 生态时使用本技能。

## 互见

- requires：`php-pro` —— Laravel 之下的 PHP 8 强类型/性能基本功是前置。
- related：`rest-api-endpoint-builder` —— REST 端点契约设计可参考。
- related：`api-design-principles` —— 接口版本化与契约设计。
- combines_with：`database-design-advisor` —— Eloquent 实体与关系建模可与数据库设计技能搭配。
- combines_with：`docker-expert` —— 容器化与部署 Laravel 应用时组合使用。

---

采编自 jeffallan/claude-skills（MIT 许可）。
