---
name: alpha-vantage-market-data
title: Alpha Vantage 全球金融数据接入
description: 当需要拉取股票/期货/外汇/加密货币/宏观经济与技术指标等全球金融行情数据时使用；通过 Alpha Vantage REST API 用 Python 获取行情、基本面与指标并返回结构化 JSON/CSV；不适用于实盘下单、券商撮合或需要毫秒级实时 tick 的高频场景；触发词：Alpha Vantage、股价行情、技术指标
domain: 领域/fintech
triggers: [Alpha Vantage, 股票行情数据, ALPHAVANTAGE_API_KEY, GLOBAL_QUOTE, 技术指标 RSI MACD, 外汇/加密货币价格, 公司基本面财报, 宏观经济指标 GDP CPI]
tags: [fintech, 市场数据, 金融api, 股票, 外汇, 加密货币, 技术指标, python]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, requests, pandas]
requires: []
related: [scientific-database-lookup, portfolio-risk-metrics, backtesting-frameworks, trading-strategy-backtester]
combines_with: [trading-strategy-backtester, portfolio-risk-metrics, dcf-valuation-model]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当用户需要程序化拉取**全球金融数据**时使用，覆盖：股票行情（实时报价与 OHLCV）、期权、外汇、加密货币、大宗商品、宏观经济指标，以及 50+ 种技术指标（数据回溯 20+ 年）。

**不该用的边界：**
- 需要实盘下单、券商撮合、持仓管理 —— Alpha Vantage 只读行情，不做交易。
- 需要毫秒级 tick / 撮合级实时数据的高频策略 —— 免费档为延迟数据，最小粒度 1min。
- 免费档每天仅 25 次请求，不适合大批量股票全量回填；大量符号需付费档或换数据源。
- 不要把返回结果当作可直接交易的权威数据，需自行校验、回测与风控复核。

## 步骤

1. **申请 API Key**：在 https://www.alphavantage.co/support/#api-key 免费获取（付费档有更高速率与实时数据）。
2. **配置环境变量**（不要硬编码到代码里）。
3. **安装依赖**。
4. **封装统一请求函数**，所有接口走同一 `BASE_URL`，按 `function` 区分。
5. **调用对应 function**，解析返回的 JSON/CSV。
6. **检查错误字段**并对多符号循环加延时。

## 指令

配置 Key：

```bash
export ALPHAVANTAGE_API_KEY="your_key_here"
```

安装依赖：

```bash
uv pip install requests pandas
```

请求模式 —— 所有请求都发往同一端点，用 `function` 选择接口：

```
https://www.alphavantage.co/query?function=FUNCTION_NAME&apikey=YOUR_KEY&...params
```

统一封装：

```python
import requests
import os

API_KEY = os.environ.get("ALPHAVANTAGE_API_KEY")
BASE_URL = "https://www.alphavantage.co/query"

def av_get(function, **params):
    response = requests.get(BASE_URL, params={"function": function, "apikey": API_KEY, **params})
    return response.json()
```

**常用 function 速查：**

| 类别 | 关键 function |
|------|--------------|
| 股票时间序列 | GLOBAL_QUOTE, TIME_SERIES_INTRADAY, TIME_SERIES_DAILY, TIME_SERIES_WEEKLY, TIME_SERIES_MONTHLY |
| 期权 | REALTIME_OPTIONS, HISTORICAL_OPTIONS |
| 智能情报 | NEWS_SENTIMENT, EARNINGS_CALL_TRANSCRIPT, TOP_GAINERS_LOSERS, INSIDER_TRANSACTIONS, ANALYTICS_FIXED_WINDOW |
| 基本面 | OVERVIEW, ETF_PROFILE, INCOME_STATEMENT, BALANCE_SHEET, CASH_FLOW, EARNINGS, DIVIDENDS, SPLITS |
| 外汇 FX | CURRENCY_EXCHANGE_RATE, FX_INTRADAY, FX_DAILY, FX_WEEKLY, FX_MONTHLY |
| 加密货币 | CURRENCY_EXCHANGE_RATE, CRYPTO_INTRADAY, DIGITAL_CURRENCY_DAILY |
| 大宗商品 | GOLD, BRENT, NATURAL_GAS, COPPER, WHEAT, CORN, COFFEE, ALL_COMMODITIES |
| 经济指标 | REAL_GDP, TREASURY_YIELD, FEDERAL_FUNDS_RATE, CPI, INFLATION, UNEMPLOYMENT, NONFARM_PAYROLL |
| 技术指标 | SMA, EMA, MACD, RSI, BBANDS, STOCH, ADX, ATR, OBV, VWAP 等 40+ |

**通用参数：**

| 参数 | 取值 | 说明 |
|------|------|------|
| `outputsize` | `compact` / `full` | compact=最近 100 点；full=20+ 年 |
| `datatype` | `json` / `csv` | 默认 json |
| `interval` | `1min`/`5min`/`15min`/`30min`/`60min`/`daily`/`weekly`/`monthly` | 取决于具体接口 |
| `adjusted` | `true` / `false` | 是否按拆分/分红复权 |

## 示例

```python
# 最新股价
quote = av_get("GLOBAL_QUOTE", symbol="AAPL")
price = quote["Global Quote"]["05. price"]

# 日线 OHLCV
daily = av_get("TIME_SERIES_DAILY", symbol="AAPL", outputsize="compact")
ts = daily["Time Series (Daily)"]

# 公司概况（市值、市盈率）
overview = av_get("OVERVIEW", symbol="AAPL")
print(overview["MarketCapitalization"], overview["PERatio"])

# 利润表（最近一年）
income = av_get("INCOME_STATEMENT", symbol="AAPL")
annual = income["annualReports"][0]

# 加密货币日线
crypto = av_get("DIGITAL_CURRENCY_DAILY", symbol="BTC", market="USD")

# 宏观经济指标
gdp = av_get("REAL_GDP", interval="annual")

# 技术指标 RSI
rsi = av_get("RSI", symbol="AAPL", interval="daily", time_period=14, series_type="close")
```

错误处理 —— Alpha Vantage 即使出错也返回 HTTP 200，必须检查 body 字段：

```python
data = av_get("GLOBAL_QUOTE", symbol="AAPL")

if "Error Message" in data:
    raise ValueError(f"API Error: {data['Error Message']}")
if "Note" in data:
    print(f"速率限制警告: {data['Note']}")
if "Information" in data:
    print(f"API 提示: {data['Information']}")
```

## 注意事项

- **速率限制**：免费档 25 次/天（截至 2026），付费档更高且支持实时与日内数据；HTTP 429 表示超限。处理多个符号时务必加延时：

```python
import time
time.sleep(0.5)  # 免费档每次请求间隔 0.5 秒
```

- **错误不抛异常**：接口出错也是 200，错误信息藏在 `Error Message` / `Note` / `Information` 字段，解析前必须显式检查。
- **复权一致性**：跨周期对比或回测时统一 `adjusted` 设置，避免拆分/分红口径不一致。
- **不要硬编码 Key**：始终通过 `ALPHAVANTAGE_API_KEY` 环境变量注入，避免泄露。
- 输出仅供分析参考，不能替代环境特定的验证、测试或专家复核；缺少必要输入或边界时先停下确认。

## 互见

- 领域内其他 fintech 数据/行情技能（券商交易、回测框架）。
- 需要新闻情绪或财报电话会文本时，配合 `NEWS_SENTIMENT` / `EARNINGS_CALL_TRANSCRIPT` 接口。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可），原作者 K-Dense Inc.，已做中文适配重写。
