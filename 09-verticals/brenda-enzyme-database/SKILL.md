---
name: brenda-enzyme-database
title: BRENDA 酶动力学数据库
description: 当需要按 EC 号/底物/物种查询酶动力学参数（Km、kcat、Vmax、Ki）、底物-产物、抑制剂、辅因子、最适 pH/温度或交叉 UniProt 时使用；用 Python zeep 调 BRENDA SOAP 服务（SHA256 鉴权、需免费学术注册）检索并产出可用于动力学建模的参数表。不适用于代谢网络约束建模（用 cobrapy）或代谢物结构（用 hmdb）。触发词：BRENDA、酶动力学、Km、kcat、Vmax、Ki、EC 号、米氏常数、底物特异性、抑制剂、辅因子、最适pH温度
domain: 领域/science
triggers: [BRENDA, 酶动力学, enzyme kinetics, Km, 米氏常数, kcat, turnover number, Vmax, Ki, EC号, EC number, 底物特异性, substrate, 抑制剂, inhibitor, 辅因子, cofactor, 最适pH, 最适温度, kcat/Km, 催化效率, zeep, SOAP]
tags: [science, systems-biology, enzyme, kinetics, database, soap-api, metabolic-modeling, brenda]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, zeep, pandas, hashlib]
requires: []
related: [kegg-database, uniprot-protein-database, reactome-pathway-database, rdkit-cheminformatics]
combines_with: [scientific-database-lookup, gget-genomic-databases]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要在 BRENDA（BRaunschweig ENzyme DAtabase：8 万+ 酶条目、覆盖全部 EC 号、700 万+ 实测动力学参数）中检索酶的动力学与功能数据时使用本技能。典型场景：

- 取某酶+底物组合的 Km / kcat / Vmax / Ki（米氏常数、转换数、抑制常数）
- 跨物种或跨突变体比较同一酶的动力学参数
- 查某 EC 号的天然底物-产物、抑制剂、辅因子
- 为代谢动力学模型提取米氏-门顿参数
- 查酶的最适 pH / 最适温度
- 把 EC 号交叉到 UniProt 登录号与物种分类

**不该用本技能的边界：**
- 做约束式代谢网络（FBA）建模 → 用 `cobrapy-metabolic-modeling`
- 查代谢物 / 底物的化学结构与生物背景 → 用 `hmdb-metabolome-database`
- 仅按通路上下文关联 EC → 用 `kegg-database`

**注意 BRENDA 是 SOAP 而非 REST**：必须用 `zeep` 解析 WSDL，密码须传 SHA256 散列（非明文），且需在官网免费学术注册后才能调用。

## 步骤 / 指令

1. **准备环境**：`pip install zeep pandas requests`；到 https://www.brenda-enzymes.org/register.php 免费注册（学术）获取账号。

2. **建客户端 + 算密码散列**（密码须 `hexdigest()`，不是 `digest()`）：
   ```python
   from zeep import Client
   import hashlib
   WSDL = "https://www.brenda-enzymes.org/soap/brenda_zeep.wsdl"
   client = Client(WSDL)
   EMAIL = "your@email.com"
   PWD = hashlib.sha256("your_password".encode()).hexdigest()
   ```
   生产中用环境变量 `os.environ["BRENDA_EMAIL"]` / `["BRENDA_PASSWORD"]`，勿硬编码。

3. **拼参数调方法**。每个服务方法签名固定为 9 个位置参数：`(EMAIL, PWD, 过滤1, 过滤2, …, "")`，过滤器是管道分隔的 `字段*值` 串，空位留 `""`。核心方法：

   | 方法 | 返回 | 关键结果字段 |
   |---|---|---|
   | `getKmValue` | Km 记录 | `kmValue`、`kmValueMaximum`、`substrate`、`organism`、`literature`(PMID) |
   | `getTurnoverNumber` | kcat 记录(1/s) | `turnoverNumber`、`substrate`、`organism` |
   | `getSubstrates` | 底物-产物 | `substrate`、`organism` |
   | `getInhibitors` | 抑制剂 | `inhibitor`、`organism`、`ic50Value` |
   | `getPhOptimum` / `getTemperatureOptimum` | 最适 pH / 温度(°C) | `phOptimum` / `temperatureOptimum` |
   | `getUniprotAccession` | UniProt 交叉 | `uniprotAccessionNumber`、`organism` |
   | `getEcNumber` | 名称→EC 号 | `ecNumber`、`recommendedName` |

4. **常用过滤字段**：`ecNumber*1.1.1.27`（必填，X.X.X.X 带点）、`substrate*pyruvate`、`organism*Homo sapiens`、`commentary*<文本>`、`recommendedName*lactate dehydrogenase`（配 getEcNumber 反查 EC）。

5. **批量加节流**：SOAP 服务较慢，循环里加 `time.sleep(0.5~1)` 防超时；多结果聚合用中位数+IQR（同底物多文献常跨一个数量级），按物种过滤避免参数混杂。

## 示例

**快速上手 — 取 LDH+丙酮酸 的 Km：**

```python
ec = "1.1.1.27"  # 乳酸脱氢酶
params = (EMAIL, PWD, f"ecNumber*{ec}", "substrate*pyruvate", "", "", "", "", "")
result = client.service.getKmValue(*params)
print(f"Km 记录数: {len(result)}")
for r in result[:3]:
    print(f"  Km={r.kmValue} {r.kmValueMaximum or ''} mM | {r.organism} | PMID:{r.literature}")
```

**按物种过滤 + kcat / 抑制剂 / 最适条件：**

```python
# 人源 GAPDH 的 Km（物种过滤放第 5 位）
hp = (EMAIL, PWD, "ecNumber*1.2.1.12", "", "organism*Homo sapiens", "", "", "", "")
human_km = client.service.getKmValue(*hp)

# LDH 的 kcat（1/s）
kc = client.service.getTurnoverNumber(EMAIL, PWD, "ecNumber*1.1.1.27", "", "", "", "", "", "")

# 碳酸酐酶(4.2.1.1)的抑制剂
inh = client.service.getInhibitors(EMAIL, PWD, "ecNumber*4.2.1.1", "", "", "", "", "", "")
names = list({r.inhibitor for r in inh if r.inhibitor})

# 胰蛋白酶(3.4.21.4)最适 pH / 温度
ph = client.service.getPhOptimum(EMAIL, PWD, "ecNumber*3.4.21.4", "", "", "", "", "", "")
tp = client.service.getTemperatureOptimum(EMAIL, PWD, "ecNumber*3.4.21.4", "", "", "", "", "", "")
```

**工作流 — 为代谢建模批量提取 Km/kcat 中位数：**

```python
import pandas as pd, time
enzymes = {"Hexokinase":"2.7.1.1", "PGI":"5.3.1.9",
           "PFK":"2.7.1.11", "Aldolase":"4.1.2.13"}
rows = []
for name, ec in enzymes.items():
    p = (EMAIL, PWD, f"ecNumber*{ec}", "", "organism*Homo sapiens", "", "", "", "")
    try:
        km = [r.kmValue for r in client.service.getKmValue(*p) if r.kmValue]
        kcat = [r.turnoverNumber for r in client.service.getTurnoverNumber(*p) if r.turnoverNumber]
        rows.append({"enzyme":name, "ec":ec,
            "km_median_mM": pd.Series(km).median() if km else None,
            "kcat_median_1_s": pd.Series(kcat).median() if kcat else None})
    except Exception as e:
        rows.append({"enzyme":name, "ec":ec, "error":str(e)})
    time.sleep(0.5)
pd.DataFrame(rows).to_csv("glycolysis_kinetics.csv", index=False)
```

**催化效率 kcat/Km（注意单位：Km 由 mM 换算到 M）：**

```python
km_median, kcat_median = 0.1, 500          # mM, 1/s（示例）
efficiency = kcat_median / (km_median * 1e-3)  # M^-1 s^-1
print(f"kcat/Km = {efficiency:.2e} M^-1 s^-1")  # 扩散极限 ≈ 1e8–1e9
```

**名称反查 EC：**

```python
p = (EMAIL, PWD, "recommendedName*lactate dehydrogenase", "", "", "", "", "", "")
for r in client.service.getEcNumber(*p)[:5]:
    print(f"EC {r.ecNumber}: {r.recommendedName}")
```

## 注意事项

- **密码必须 SHA256 散列且用 `hexdigest()`**：用 `hashlib.sha256(pwd.encode()).hexdigest()`；误用 `digest()` 或明文会触发 `zeep.exceptions.Fault: Authentication failed`。
- **EC 号格式 X.X.X.X 带点**：返回空列表时先核对格式，并先去掉 `substrate*` 过滤试一次（底物名拼写常导致 0 结果）。
- **参数是 9 元位置参数**：过滤器按 `字段*值` 拼，空位留 `""`；物种过滤通常占第 5 位（见示例），错位会查不到。
- **结果字段可能缺失**：用 `getattr(r, "field", None)` 安全取值，避免 `AttributeError`。
- **超时与慢响应**：热门酶（数据巨大）务必加 `organism*`/`substrate*` 过滤缩小结果集；可设 zeep transport timeout；`TransportError` 多为网络/VPN 问题，30 秒后重试。
- **跨物种参数差异大**：建模时必须按目标物种过滤（如 `organism*Homo sapiens`）。
- **多文献聚合用中位数+IQR**：同一底物的实测值常跨一个数量级，勿用均值。
- **EC 一级分类**：1 氧化还原酶、2 转移酶、3 水解酶、4 裂合酶、5 异构酶、6 连接酶、7 转位酶。

## 互见

- requires：无（仅需 `zeep`/账号）
- related：`kegg-database` —— 经 EC 号关联通路上下文；`uniprot-protein-database` —— 酶的序列/结构；`hmdb-metabolome-database` —— 底物/代谢物结构
- combines_with：`cobrapy-metabolic-modeling` —— 把 BRENDA 的 Km/Vmax 作动力学约束做代谢建模

参考：BRENDA 官网 https://www.brenda-enzymes.org/ ｜ SOAP API 文档 https://www.brenda-enzymes.org/soap.php ｜ zeep https://docs.python-zeep.org/ ｜ Chang et al. (2021) NAR https://doi.org/10.1093/nar/gkaa1025

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
