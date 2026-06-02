---
name: rails-hotwire-expert
title: Rails 7+ 与 Hotwire 开发专家
description: 当用 Rails 7+ 搭建带 Hotwire 的 Web 应用、做实时局部更新或后台任务时使用；产出 Active Record 防 N+1 查询、Turbo Frames/Streams 局部刷新、Action Cable 通道、Sidekiq Worker 与 RSpec 测试套件；不适用于非 Rails 栈、纯前端 SPA、仅需基础 Ruby 语法、或无法改动 Gemfile 与迁移的场景；触发词：Rails、Hotwire、Turbo、Action Cable、Sidekiq、Active Record、RSpec
domain: 研发/backend
triggers: [Rails 7, Ruby on Rails, Hotwire, Turbo Frames, Turbo Streams, Stimulus, Action Cable, WebSocket, Active Record 优化, N+1 查询, includes/eager_load, Sidekiq 后台任务, RSpec Rails, strong parameters, service object]
tags: [rails, hotwire, turbo, active-record, sidekiq, action-cable, rspec, 研发]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [ruby, rails, hotwire, turbo-rails, stimulus, action-cable, sidekiq, rspec-rails, rubocop, factory_bot]
requires: []
related: [ruby-pro, laravel-app-specialist, django-async-pro, sveltekit-fullstack]
combines_with: [websocket-realtime-engineer, rest-api-endpoint-builder]
license: MIT
source: jeffallan/claude-skills
source_license: MIT
---
## 何时使用

适用：
- 用 Rails 7+ 搭建或扩展 Web 应用，前端走 Hotwire（Turbo + Stimulus）而非独立 SPA。
- 需要局部页面刷新（Turbo Frames / Streams）、WebSocket 实时推送（Action Cable）。
- 把慢操作（发信、导出、第三方调用）下沉到 Sidekiq 后台任务。
- 优化 Active Record：消除 N+1、补索引、加缓存；用 RSpec 补齐模型/请求/系统测试。

不该用（负边界）：
- 非 Rails 栈，或后端用其他语言运行时。
- 纯前端 SPA（React/Vue 独立前端 + Rails 仅作 JSON API 也尽量用 Hotwire 思路，否则另选技能）。
- 只需基础 Ruby 语法解释。
- 无法改动 Gemfile、迁移文件或工具链（代码与迁移无从落地）。

## 步骤

1. 梳理需求：识别模型与关联、路由、实时需求、后台任务边界。
2. 脚手架：`rails generate model User name:string email:string`、`rails generate controller Users`。
3. 跑迁移：`rails db:migrate`，用 `rails db:schema:dump` 校验 schema。
   - 迁移失败：查 `db/schema.rb` 冲突 → `rails db:rollback` → 修正重试。
4. 实现：写瘦控制器（强参数）+ 模型（关联/校验），复杂逻辑放 service object；按需接入 Hotwire / Action Cable / Sidekiq。
5. 验证：`bundle exec rspec` 必须全绿；`bundle exec rubocop` 过风格检查。
   - 测试失败：加 `--format documentation` 看细节，修正失败用例后重跑。
   - 评审中冒出 N+1：补 `includes`/`eager_load` 后重跑。
6. 优化：审计 N+1、为 `WHERE`/`ORDER BY`/`JOIN` 列补索引、加缓存。

## 指令

- 实现一个 Rails 特性时，按需产出：迁移文件 → 模型（含关联与校验）→ 控制器（RESTful + 强参数）→ 视图或 Hotwire 装配 → RSpec（模型 + 请求）→ 关键架构决策一句话说明。
- 集合查询凡涉及关联，一律用 `includes`/`eager_load` 防 N+1。
- 控制器保持瘦身，复杂业务逻辑抽到 service object。
- 慢操作走 `perform_later` 入 Sidekiq，绝不在请求周期内同步执行。
- 原始 SQL 必须参数化或 `sanitize_sql`；勿在 URL 直接暴露内部自增 ID（按需用 UUID/slug）。

## 示例

防 N+1（includes / eager_load）：

```ruby
# BAD — 触发 N+1
posts = Post.all
posts.each { |post| puts post.author.name }

# GOOD — 预加载关联
posts = Post.includes(:author).all

# GOOD — eager_load 强制 JOIN（按关联字段过滤时用）
posts = Post.eager_load(:author).where(authors: { verified: true })
```

Turbo Frame 局部更新：

```erb
<%# app/views/posts/index.html.erb %>
<%= turbo_frame_tag "posts" do %>
  <%= render @posts %>
  <%= link_to "Load More", posts_path(page: @next_page) %>
<% end %>

<%# app/views/posts/_post.html.erb %>
<%= turbo_frame_tag dom_id(post) do %>
  <h2><%= post.title %></h2>
  <%= link_to "Edit", edit_post_path(post) %>
<% end %>
```

```ruby
# app/controllers/posts_controller.rb
def index
  @posts = Post.includes(:author).page(params[:page])
  @next_page = @posts.next_page
end
```

Sidekiq Worker 模板：

```ruby
# app/jobs/send_welcome_email_job.rb
class SendWelcomeEmailJob < ApplicationJob
  queue_as :default
  sidekiq_options retry: 3, dead: false

  def perform(user_id)
    user = User.find(user_id)
    UserMailer.welcome(user).deliver_now
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.warn("SendWelcomeEmailJob: user #{user_id} not found — #{e.message}")
    # 记录已不存在，不再 raise，重试无意义
  end
end

# 从控制器或模型回调入队
SendWelcomeEmailJob.perform_later(user.id)
```

强参数 + 瘦控制器：

```ruby
# app/controllers/posts_controller.rb
class PostsController < ApplicationController
  before_action :set_post, only: %i[show edit update destroy]

  def create
    @post = Post.new(post_params)
    if @post.save
      redirect_to @post, notice: "Post created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def post_params
    params.require(:post).permit(:title, :body, :published_at)
  end
end
```

## 注意事项

- 必做：每个关联集合查询防 N+1；测试争取 >95% 覆盖；复杂逻辑用 service object；为 `WHERE`/`ORDER BY`/`JOIN` 列补索引；慢操作下沉 Sidekiq。
- 禁做：跳过迁移直接改 schema；用未 sanitize 的原始 SQL；无脑在 URL 暴露内部 ID。
- 表单校验失败时 `render :new, status: :unprocessable_entity`（422），Turbo 才会正确替换帧而非误判成功跳转。
- Sidekiq 任务参数只传 ID 等可序列化值，不要传整个 AR 对象。

## 互见

- requires：`ruby-pro` —— Rails 之上需先具备 Ruby/Rails 惯用法与 RSpec 基础
- related：`backend-architecture-patterns`、`database-design-advisor`、`code-reviewer`
- combines_with：`rest-api-endpoint-builder` —— Rails API 模式下做端点契约；`database-design-advisor` —— 配合做迁移与索引设计

---
采编自 [jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills)（MIT）。
