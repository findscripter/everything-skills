---
name: on-device-foundation-models
title: 端侧基础模型（量化与隐私推理）
description: 当用 Apple FoundationModels 框架做端侧、隐私优先、可离线的文本生成/结构化抽取/工具调用时使用；产出可用性检查、@Generable 结构化输出、Tool 调用与快照流式 SwiftUI 方案；不适用于云端 LLM API、安卓桌面端侧推理或训练；触发词：FoundationModels、端侧模型、Apple Intelligence、Generable、隐私推理
domain: 智能/model-ops
triggers: [FoundationModels, 端侧模型, on-device, Apple Intelligence, iOS 26, SystemLanguageModel, LanguageModelSession, Generable, Guide, Tool调用, 快照流式, PartiallyGenerated, 结构化输出, 隐私推理, 离线LLM, Swift, SwiftUI, 4096 token]
tags: [智能, model-ops, 端侧推理, Apple, FoundationModels, Swift, 隐私, 离线, 结构化输出, 工具调用]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Swift, SwiftUI, FoundationModels, Xcode, Instruments]
requires: []
related: [local-llm-inference, production-llm-app-builder, agent-tool-design]
combines_with: [prompt-template-designer, llm-model-router]
license: CC-BY-4.0
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

适用：
- 在 iOS 26 / Apple Intelligence 上用 FoundationModels 框架做端侧文本生成或摘要，数据不出设备。
- 从自然语言抽取结构化数据（表单、日历事件、命令解析），用 `@Generable` 直出 Swift 类型。
- 实现领域专用的工具调用（搜索、计算、查库），让模型驱动你的代码。
- 流式渐进刷新 UI（快照流式 + SwiftUI），实时显示生成内容。
- 需要隐私优先、可离线运行的 AI 功能。

不该用（负边界）：
- 调用云端专有 LLM API（OpenAI、Anthropic、Gemini），那是在线服务，不在本框架范畴。
- 安卓、桌面或服务器端的端侧推理（用 llama.cpp/Ollama 那一套，见 `local-llm-inference`）。
- 从零训练或微调模型；本技能只覆盖端侧推理调用。
- 单条 prompt 里塞多步复杂逻辑——拆成多个聚焦 prompt。

## 步骤

1. 先查可用性：用 `SystemLanguageModel.default.availability` 穷举 `.available` 与各 `.unavailable(...)` 分支，UI 上给出降级提示，**绝不假设模型总可用**（设备资格、Apple Intelligence 开关、模型下载状态都会变）。
2. 建会话：单轮用即用即弃的 `LanguageModelSession()`；多轮对话复用同一 session 以保留上下文。
3. 用 `instructions` 定义角色/任务/风格/安全约束，其优先级高于 prompt。
4. 选输出形态：要结构化就 `@Generable` + `@Guide`，按 `generating:` 直出类型；要实时 UI 就用 `streamResponse` 快照流式。
5. 需领域动作时定义 `Tool`，把工具列表传入会话，并 `catch` `ToolCallError`。
6. 守约束：发请求前查 `isResponding`（一个 session 同时只处理一个请求）；用 `.content`（不是 `.output`）取结果；instructions + prompt + 输出合计 ≤ 4096 token，超限就分块。

## 指令

可用性检查（建会话前必做）：

```swift
private var model = SystemLanguageModel.default
switch model.availability {
case .available: ContentView()
case .unavailable(.deviceNotEligible): Text("设备不支持 Apple Intelligence")
case .unavailable(.appleIntelligenceNotEnabled): Text("请在设置中开启 Apple Intelligence")
case .unavailable(.modelNotReady): Text("模型下载中或未就绪")
case .unavailable(let other): Text("模型不可用：\(other)")
}
```

会话（单轮 vs 多轮）：

```swift
// 单轮：每次新建
let session = LanguageModelSession()
let response = try await session.respond(to: "几月去巴黎合适？")
print(response.content)   // 注意是 .content，不是 .output

// 多轮：复用 session 保留上下文 + instructions 定调
let session = LanguageModelSession(instructions: """
    你是烹饪助手。根据食材给出简洁实用的菜谱建议。
    """)
_ = try await session.respond(to: "我有鸡肉和米饭")
_ = try await session.respond(to: "有素食版本吗？")
```

instructions 四要素：定义角色、说明任务、设定风格、加安全兜底（如"危险请求回复『我无法协助』"）。

结构化输出 `@Generable` + `@Guide`：

```swift
@Generable(description: "猫的基本档案")
struct CatProfile {
    var name: String
    @Guide(description: "猫的年龄", .range(0...20))
    var age: Int
    @Guide(description: "一句话描述性格")
    var profile: String
}
let r = try await session.respond(to: "生成一只可爱的救助猫", generating: CatProfile.self)
print(r.content.name, r.content.age)   // 直接访问结构化字段
```

`@Guide` 约束：`.range(0...20)`（数值范围）、`.count(3)`（数组元素数）、`description:`（语义引导）。

工具调用 `Tool`：

```swift
struct RecipeSearchTool: Tool {
    let name = "recipe_search"
    let description = "按关键词搜索菜谱并返回列表"
    @Generable struct Arguments { var searchTerm: String; var numberOfResults: Int }
    func call(arguments: Arguments) async throws -> ToolOutput {
        let recipes = await searchRecipes(term: arguments.searchTerm, limit: arguments.numberOfResults)
        return .string(recipes.map { "- \($0.name): \($0.description)" }.joined(separator: "\n"))
    }
}
let session = LanguageModelSession(tools: [RecipeSearchTool()])
do {
    _ = try await session.respond(to: "找几个意面菜谱")
} catch let error as LanguageModelSession.ToolCallError {
    print(error.tool.name)   // 可进一步匹配 error.underlyingError
}
```

快照流式（结构化、每帧是完整的部分状态，属性全 Optional）：

```swift
@Generable struct TripIdeas { @Guide(description: "出行点子") var ideas: [String] }

@State private var partial: TripIdeas.PartiallyGenerated?
// 在 .task { } 中：
let stream = session.streamResponse(to: prompt, generating: TripIdeas.self)
for try await p in stream { partial = p }   // SwiftUI 据 partial?.ideas 渐进渲染
```

## 示例

- 「在端侧把用户输入的自然语言抽成日历事件结构」-> 定义 `@Generable` 事件类型，`respond(to:generating:)` 直出，无需正则解析裸字符串。
- 「列表实时显示模型生成的多条建议」-> `streamResponse` + `PartiallyGenerated`，`@State` 绑定，每帧刷新 `List`。
- 「让模型在回答前先查本地数据库」-> 定义 `Tool`，传入 `tools:`，`catch ToolCallError` 处理空库等错误。
- 「输入太长报错」-> instructions + prompt + 输出 > 4096 token，按会话分块或精简 instructions。

## 注意事项

- 端侧约束硬上限 4096 token（含 instructions、prompt、输出），大数据必须跨会话分块。
- 一个 session 同时只能有一个请求：发请求前查 `isResponding`，需并发就建多个 session。
- 取结果一律用 `response.content`，写成 `.output` 是错误 API。
- 别在单 prompt 里堆多步逻辑；拆成多个聚焦 prompt 更稳。
- 用 `GenerationOptions(temperature:)` 调创造性（越高越发散）。
- 用 Xcode Instruments 剖析请求性能。
- 隐私是核心卖点：数据不出设备、可离线；除非用户明确要混合方案，不要引导转向云端 API。

## 互见

- related：`local-llm-inference` —— 安卓/桌面/服务器端侧推理（llama.cpp/Ollama/vLLM）的对照路径。
- related：`production-llm-app-builder` —— 把端侧能力嵌入完整 LLM 应用。
- related：`agent-tool-design` —— 设计更健壮的工具调用接口。
- combines_with：`prompt-template-designer` —— 打磨 instructions 与 prompt。
- combines_with：`llm-model-router` —— 端侧/云端混合时按场景路由模型。

---
采编自 affaan-m/everything-claude-code（MIT 许可）。
