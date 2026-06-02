---
name: amazon-alexa-skill-builder
title: Amazon Alexa 语音技能开发（Claude + AWS）
description: 当需要用 ASK CLI + AWS Lambda 开发 Amazon Alexa 语音技能、并以 Claude 作为对话大脑（含 DynamoDB 记忆、Polly 语音、APL 屏显、Smart Home 控制）时使用；做交互模型/Lambda 处理器/部署脚本的搭建与产出；不适用于纯网页/移动 App 或非 Alexa 平台语音助手；触发词：Alexa、ASK CLI、语音技能、Smart Home
domain: 平台/cloud
triggers: [Alexa, ASK CLI, 语音技能, voice skill, Amazon Alexa, Lambda 语音, Smart Home, APL, Polly, invocation name, interaction model, Echo Show]
tags: [voice, alexa, aws, smart-home, lambda, 平台]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [ask-cli, aws-cli, python, anthropic-sdk, claude-code]
requires: []
related: [aws-serverless-builder, aws-serverless-architect, azure-realtime-voice-ai, claude-api]
combines_with: [agentphone-voice-sms-agents, aws-cdk-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 ASK CLI 从零创建并部署一个 Alexa 语音技能（交互模型 + Lambda 后端）。
- 把 Alexa 设备改造成「以 Claude 为大脑」的智能助手：语音转文本→Lambda→Claude API→Polly 语音回复，并用 DynamoDB 持久化对话历史与偏好。
- 集成 APL 屏显（Echo Show）、Alexa Smart Home API 设备控制与 Routines 自动化。

不该用：
- 与 Alexa 无关的任务，或可用更简单专用工具完成的需求。
- 非 Alexa 的语音平台（Google Assistant、小爱等），或纯网页/移动 App 对话。
- 需要 < 8s 内完成、但 Claude 调用 + Polly 合成会超时的重型同步流程（应改异步/分段）。

## 步骤

整体数据流：`Alexa 设备 → Alexa Cloud（ASR/NLU）→ AWS Lambda（编排）→ Claude API（推理）`，旁路接 DynamoDB（记忆）/ Polly（TTS）/ APL（屏显）。

1. 安装前置工具并配置凭证（ASK CLI + AWS CLI）。
2. 用模板新建技能，设定 invocation name（唤醒词）。
3. 定义交互模型（intents / slots / types），覆盖对话、Smart Home、Routine。
4. 编写 Lambda 处理器：LaunchRequest 与 ChatIntent，接入 Claude 并裁剪响应长度。
5. 建 DynamoDB 表，做历史持久化 + TTL 过期。
6.（可选）Polly 自定义语音、APL 屏显、Smart Home 控制。
7. 部署、模拟测试，最后提交认证发布。

## 指令

前置安装与配置：
```bash
# ASK CLI
npm install -g ask-cli
ask configure
# AWS CLI
pip install awscli
aws configure
```

新建技能 + 设唤醒词（`models/<locale>.json` 内 `interactionModel.languageModel.invocationName`）：
```bash
ask new --template hello-world --skill-name auri --language en-US
```

Lambda 依赖（requirements.txt，固定版本下限）：
```
ask-sdk-core>=1.19.0
ask-sdk-dynamodb-persistence-adapter>=1.19.0
anthropic>=0.40.0
boto3>=1.34.0
```

Lambda 环境变量（密钥务必走 Secrets Manager，不要明文）：
```
ANTHROPIC_API_KEY=sk-...   # 存入 Secrets Manager
DYNAMODB_TABLE=auri-users
AWS_REGION=us-east-1
```

建持久化表：
```bash
aws dynamodb create-table \
  --table-name auri-users \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

部署 / 测试 / 发布：
```bash
ask deploy                                  # 部署技能 + Lambda
ask status                                  # 查看状态
ask dialog --locale en-US                   # 交互式对话测试
ask simulate --text "open auri" --locale en-US --skill-id amzn1.ask.skill.YOUR-ID
ask validate --locales en-US                # 校验交互模型
```

手动建 Lambda 并挂 Alexa 触发器（timeout ≤ 8s）：
```bash
aws lambda create-function --function-name auri-skill \
  --runtime python3.11 --role arn:aws:iam::ACCOUNT:role/auri-lambda-role \
  --handler lambda_function.handler --timeout 8 --memory-size 512 \
  --zip-file fileb://function.zip

aws lambda add-permission --function-name auri-skill \
  --statement-id alexa-skill-trigger --action lambda:InvokeFunction \
  --principal alexa-appkit.amazon.com \
  --event-source-token amzn1.ask.skill.YOUR-SKILL-ID
```

## 示例

ChatIntent 处理器（接入 Claude + 历史持久化 + 截断防超时）：
```python
import os, anthropic
from ask_sdk_core.utils import is_intent_name, is_request_type

@sb.request_handler(can_handle_func=is_intent_name("ChatIntent"))
def chat_handler(handler_input):
    slots = handler_input.request_envelope.request.intent.slots
    query = slots["query"].value if slots.get("query") else None
    if not query:
        return handler_input.response_builder.speak("Sorry, please repeat.").ask("Please repeat?").response

    attrs = handler_input.attributes_manager.persistent_attributes
    history = attrs.get("history", [])
    messages = history[-MAX_HISTORY:] + [{"role": "user", "content": query}]

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    resp = client.messages.create(
        model=CLAUDE_MODEL, max_tokens=512,
        system=AURI_SYSTEM_PROMPT, messages=messages)
    reply = resp.content[0].text

    if len(reply) > MAX_RESPONSE_CHARS:          # 防止超过 8s timeout
        reply = reply[:MAX_RESPONSE_CHARS] + "... continue?"

    history += [{"role": "user", "content": query},
                {"role": "assistant", "content": reply}]
    attrs["history"] = history[-50:]             # 仅保留最近 50 条
    attrs["ttl"] = int(time.time()) + 180*24*3600  # 180 天过期
    handler_input.attributes_manager.persistent_attributes = attrs
    handler_input.attributes_manager.save_persistent_attributes()
    return handler_input.response_builder.speak(reply).ask("Anything else?").response
```

交互模型片段（ChatIntent 用 `AMAZON.SearchQuery`，并定义自定义类型）：
```json
{"name": "ChatIntent",
 "slots": [{"name": "query", "type": "AMAZON.SearchQuery"}],
 "samples": ["{query}", "help me with {query}", "explain {query}"]}
```

Smart Home Discovery 响应骨架（namespace `Alexa.Discovery` / payloadVersion `3`）：
```python
def handle_discovery(event, context):
    return {"event": {"header": {"namespace": "Alexa.Discovery",
        "name": "Discover.Response", "payloadVersion": "3"},
      "payload": {"endpoints": [{
        "endpointId": "light-001", "friendlyName": "Living Room Light",
        "displayCategories": ["LIGHT"], "capabilities": [
          {"type": "AlexaInterface", "interface": "Alexa.PowerController", "version": "3"}]}]}}}
```

Polly 自定义语音用 SSML `<audio src=...>` 注入（先合成上传 S3 再引用 URL）；APL 屏显需先判断 `device.supported_interfaces.alexa_presentation_apl` 再 `add_directive(Alexa.Presentation.APL.RenderDocument)`。

## 注意事项

- Lambda timeout 上限 8s：Claude `max_tokens` 控制在 512 左右并截断长回复，必要时分段续答；Polly + S3 合成较慢，谨慎放进同步链路。
- 密钥绝不明文写入环境变量或代码，统一走 Secrets Manager，Lambda 用 `secretsmanager:GetSecretValue` 读取。
- DynamoDB 历史只保留最近 N 条（示例 50）并设 TTL（示例 180 天），避免单条记录膨胀与超额计费；建表用 PAY_PER_REQUEST。
- 至少需要两个 Lambda 触发 principal/触发器：对话技能用 `alexa-appkit.amazon.com`，Smart Home 用对应 Smart Home 端点配置。
- APL 仅在 Echo Show 等带屏设备生效，务必先检测 `supported_interfaces` 再下发指令，否则纯音箱会报错。
- IAM Role 需覆盖 Lambda、DynamoDB、Polly、CloudWatch Logs（以及 Secrets Manager）权限。
- 发布前在 ASK 模拟器跑全量功能、确认性能（< 8s），再提交 Amazon 认证。

## 互见

- AWS Lambda / Serverless 部署类技能（如有）。
- Claude API 接入与提示工程类技能（system prompt、上下文管理、流式响应）。
- 其他对话式/语音助手开发技能可对照交互模型设计与会话状态持久化思路。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。原文为葡萄牙语「Auri」项目，本条目适配重写为中文并将示例语言切换为 en-US 通用形态，保留其架构、关键命令与代码约束。
