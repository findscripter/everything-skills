---
name: realtime-support-chat-widget
title: 实时客服聊天组件系统
description: 当需要在应用内搭建用户端浮动客服窗口 + 管理端工作台的实时聊天系统时使用；做数据模型、REST 接口、WebSocket 频道、前端组件、延时邮件通知的端到端落地方案与代码；不适用于群聊/多人房间、AI 自动应答机器人、纯邮件工单系统。触发词：在线客服、实时聊天组件、客服工作台
domain: 研发/architecture
triggers: [在线客服, 实时聊天组件, 客服工作台, 应用内支持聊天, 浮动聊天窗口, WebSocket 消息推送, 用户与管理员实时消息, live chat widget]
tags: [实时通信, websocket, 客服系统, 全栈, 前端组件, 邮件通知]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [WebSocket/ActionCable/Pusher/Ably, REST API, 关系型数据库(PostgreSQL/MySQL), 后台任务队列, 事务邮件服务(Postmark/SendGrid/SES/Resend)]
requires: []
related: [websocket-realtime-engineer, rest-api-endpoint-builder, transactional-email-template-builder, ai-customer-support]
combines_with: [database-design-advisor, react-state-management, support-ticket-triage]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

需要在产品里嵌入「实时客服聊天」时使用，典型诉求：

- 给应用加一个右下角浮动聊天窗口（用户端）。
- 搭建客服/管理员工作台，集中查看、回复、归档会话。
- 实现用户与客服之间的双向实时消息推送。
- 提供应用内支持渠道，并在客服回复后补发邮件提醒。

不该用边界（出现以下场景请改用其他方案）：

- 多人群聊 / 频道 / 房间式聊天（本方案核心约束是「每用户一会话」）。
- AI 自动应答机器人、工单分配/路由、坐席排班等复杂客服中台。
- 纯异步邮件工单，无实时性要求。
- 端到端加密 IM、音视频通话。

适用前先确认：是否有用户鉴权体系、是否能区分 `admin` 角色、运行环境是否支持 WebSocket（serverless 需走 Pusher/Ably 等托管方案）。缺少必要输入或边界不清时先停下来澄清。

## 步骤

整体架构：前端分「用户浮动组件」与「管理员工作台」两端，经 WebSocket（实时）+ REST（拉取/状态变更）连后端；后端含两个频道（每会话 ChatChannel、全局 AdminNotificationChannel）、两张表（Chat、Message）与一个延时邮件 Job。

### 步骤 1：数据模型

建两张表，主键推荐 UUID（不可猜测）。

`support_chats`：`user_id`（外键，UNIQUE，每用户一会话）、`last_message_at`（排序用）、`admin_viewed_at`（管理员最后查看时间）、`archived_at`（null=活跃，有值=已归档）、时间戳。

`support_messages`：`chat_id`（外键）、`content`（text，必填）、`sender_type`（枚举 `user`|`admin`）、`read_at`（null=未读）、时间戳。

关键索引：`support_chats.user_id`(unique)、`last_message_at`、`archived_at`、`support_messages.chat_id`，以及复合索引 `(chat_id, created_at)`（保证按时间排序）。

关系：`User has_one SupportChat`；`SupportChat has_many SupportMessages`。

模型方法（伪码）：

```pseudo
# Chat
touch_last_message()  -> last_message_at = now()
unread_for_admin?()   -> 存在 message(sender_type='user' 且 created_at > admin_viewed_at)
mark_viewed_by_admin()-> admin_viewed_at = now()
archive() / unarchive() / archived?()  -> 操作 archived_at

# Message after_create
chat.touch_last_message()
if sender_type=='user' and chat.archived?: chat.unarchive()   # 用户来信自动复活归档会话
# after_create_commit
broadcast 到 support_chat 频道
if sender_type=='user': broadcast 到 admin 通知频道
if sender_type=='admin': 安排 5 分钟延时邮件
```

### 步骤 2：REST 接口

用户端：`GET /support_chat`（取或建当前用户会话+消息）、`PATCH /support_chat/mark_read`（标记管理员消息已读）。

管理端：`GET /admin/chats?archived=true|false`（列表）、`GET /admin/chats/:id`（详情）、`POST /admin/chats/:id/archive`、`POST /admin/chats/:id/unarchive`。

列表查询要点：按 `archived_at` 过滤、`includes(:user,:messages)` 防 N+1、`order(last_message_at desc)`；每项返回 `user_email`、末条消息预览（截断 100）、末条发送方、消息数、`unread`、`archived`。

### 步骤 3：WebSocket 频道

`ChatChannel`（每会话一条流）：订阅时校验 `chat.user_id==current_user.id || current_user.is_admin`，不通过则 `reject`，通过则 `stream_from "support_chat:#{chat_id}"`；`send_message` 动作按当前角色写入 `sender_type`，空内容直接丢弃。

`AdminNotificationChannel`（全体管理员一条全局流）：非 admin `reject`，否则 `stream_from "admin_support_notifications"`。

广播：消息落库后向 `support_chat:#{chat.id}` 推 `{type:"new_message", message}`；若发送方是 `user`，再向 `admin_support_notifications` 推 `{type:"new_user_message", chat_id, user_email, message}`。

### 步骤 4：用户端浮动组件

组件树：`ChatWidget` → `ChatButton`（fixed 右下角，含未读角标，封顶显示 `9+`）+ `ChatPanel`（Header 含连接状态点 / 可滚动 MessageList / InputArea）。

状态 Hook `useSupportChat`：挂载时 `fetch('/support_chat')`，把已有消息 id 灌进 `seenMessageIds`（去重用）；`chat.id` 变化时订阅 ChatChannel，收到 `new_message` 先查重复 id（命中即丢弃）再入列，管理员消息播提示音；连接/断开同步 `connected`；卸载时退订。`sendMessage` 走 `subscription.perform('send_message', {content: content.trim()})`。

交互：点击切换面板；打开时自动 `markAsRead()`；新消息自动滚到底；绿点=已连接；Enter 发送、Shift+Enter 换行。样式：用户消息右对齐主色，管理员消息左对齐浅色，各带时间戳。

### 步骤 5：管理员工作台

列表页：标题「Support Chats」+ [Active]/[Archived] Tab；卡片按 `last_message_at desc`，显示未读标记、用户邮箱、末条预览、消息数+相对时间；末条来自管理员时加「You: 」前缀；点击进详情。

详情页：顶部用户邮箱 + 归档/恢复按钮 + 返回；消息按日期分组加分隔线；**方向与用户端相反**（用户左、管理员右）；显示发送者标签；复用同一 WebSocket 订阅；页面加载时服务端调用 `mark_viewed_by_admin()`。

### 步骤 6：延时邮件通知

`SupportReplyNotificationJob`（管理员发消息时安排，延时 5 分钟）。守卫子句缺一不可：`sender_type != 'admin'` 跳过、`read_at != null`（已读）跳过、`chat.archived?` 跳过；其余发送邮件，正文含截断预览+打开会话链接。延时让用户先有机会在应用内看到，避免秒回刷屏轰炸。

### 步骤 7：TypeScript 类型

定义 `SupportMessage`、`SupportChat`、`SupportChatListItem`、`AdminSupportChat`，以及频道消息 `ChatChannelMessage{type:'new_message'}`、`AdminNotificationMessage{type:'new_user_message'}`。时间字段统一 ISO8601 字符串。

## 关键设计决策

1. 每用户一会话——简化 UX，历史连续。
2. 归档=软删除——保留历史、可恢复。
3. 自动复活——用户向已归档会话发消息即 unarchive。
4. 延时邮件——5 分钟防刷屏。
5. 消息去重——自己发的消息会经广播回声，靠 `seenMessageIds` 拦截。
6. 独立 admin 频道——为全局未读数、桌面通知等后续能力留口。

## 示例

Rails 端模型与频道（保留源关键实现）：

```ruby
class SupportMessage < ApplicationRecord
  belongs_to :support_chat
  enum :sender_type, { user: 0, admin: 1 }
  validates :content, presence: true
  after_create :update_chat_timestamp
  after_create :auto_unarchive, if: :user?
  after_create_commit :broadcast_message
  after_create_commit :schedule_notification, if: :admin?

  def broadcast_message
    ActionCable.server.broadcast("support_chat:#{support_chat_id}",
      { type: "new_message", message: { id:, content:, sender_type:, read_at:, created_at: } })
  end
  def schedule_notification
    SupportReplyNotificationJob.set(wait: 5.minutes).perform_later(self)
  end
end

class SupportChatChannel < ApplicationCable::Channel
  def subscribed
    @chat = SupportChat.find(params[:chat_id])
    reject unless @chat.user_id == current_user.id || current_user.admin?
    stream_from "support_chat:#{@chat.id}"
  end
  def send_message(data)
    @chat.support_messages.create!(content: data["content"],
      sender_type: current_user.admin? ? :admin : :user)
  end
end
```

迁移（注意复合索引）：

```ruby
create_table :support_messages, id: :uuid do |t|
  t.references :support_chat, type: :uuid, null: false, foreign_key: true
  t.text :content, null: false
  t.integer :sender_type, default: 0
  t.datetime :read_at
  t.timestamps
end
add_index :support_messages, [:support_chat_id, :created_at]
```

React Hook 去重核心：

```typescript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.type === 'new_message' && !seenIds.current.has(data.message.id)) {
    seenIds.current.add(data.message.id)
    setChat(prev => prev ? { ...prev, messages: [...prev.messages, data.message] } : prev)
  }
}
const sendMessage = (content: string) =>
  wsRef.current?.send(JSON.stringify({ action: 'send_message', content }))
```

Widget 未读角标：`chat.messages.filter(m => m.sender_type==='admin' && !m.read_at).length`，>9 显示 `9+`。

其他栈速记：Next.js（App Router）用 `getServerSession` 鉴权、Prisma `findUnique({where:{userId}})` 取或建会话，serverless 走 Pusher `trigger`/`subscribe`；Laravel 在 `booted()` 的 `created` 钩子里 `broadcast(new NewSupportMessage($message))->toOthers()` 并 `delay(now()->addMinutes(5))`；Vue 用 `useSupportChat` composable，逻辑同 React。

实时技术选型：Rails→ActionCable，Node→Socket.IO，任意栈+serverless→Pusher/Ably/Supabase Realtime；WebSocket 不可用时降级为每 5 秒 `?since=lastMessageTime` 轮询。

数据库：PostgreSQL（推荐，UUID + `timestamptz`）、MySQL（`CHAR(36)`/`BINARY(16)` + `utf8mb4` 存 emoji）、SQLite（原型，UUID 存 TEXT、时间存 ISO8601）、MongoDB（消息量有界可内嵌）。邮件服务：Postmark/SendGrid/AWS SES/Resend。

## 注意事项

- 必做去重：自己发的消息会经广播回声重复出现，务必用 seen-id 集合拦截。
- 读状态有竞态：更新 `read_at` 走数据库事务。
- WebSocket 必须鉴权：校验当前用户能否访问该具体会话。
- 优雅处理重连，避免连接状态显示陈旧。
- 别漏复合索引 `(chat_id, created_at)`，否则消息排序慢。
- 邮件一律走后台 Job，禁止同步发送；发送前再次校验是否仍未读/未归档。

验收清单：用户发消息→管理员实时可见→回复用户即时收到；未读角标计数正确、打开即清零；连接指示反映真实状态；归档/恢复正常、用户来信自动复活；5 分钟后仅在未读时发邮件、已读则不发；消息时序正确且无重复。

本技能仅在任务明确落在上述范围内时使用；产出不替代针对具体环境的验证、测试与专家评审。

## 互见

- 实时通信底座选型（ActionCable / Socket.IO / Pusher / Ably / SSE）。
- 后台任务队列与延时 Job（邮件通知调度）。
- 用户鉴权与角色（区分 user / admin）。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
