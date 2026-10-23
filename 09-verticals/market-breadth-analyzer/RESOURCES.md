# 随包资源来源

资源取自 `tradermonty/claude-trading-skills` 的固定提交 `c5d3e5d6d10276bf149db8108a253de22e141252`。这是 2026-10-23 补齐资源时核对的版本，不能据此推定原正文的采编提交。

- 原技能：[固定源文件](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/SKILL.md)
- 资源许可证：`MIT`；全文见 [UPSTREAM-LICENSE.txt](UPSTREAM-LICENSE.txt)。
- 资源字节未改；没有执行上游脚本、安装依赖或调用模型。
- 完整路径、SHA-256 和每文件固定源链接见仓库 `data/skill-resources.json`。

## 文件

- [references/breadth_analysis_methodology.md](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/references/breadth_analysis_methodology.md)
- [scripts/calculators/__init__.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/calculators/__init__.py)
- [scripts/calculators/bearish_signal_calculator.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/calculators/bearish_signal_calculator.py)
- [scripts/calculators/cycle_calculator.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/calculators/cycle_calculator.py)
- [scripts/calculators/divergence_calculator.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/calculators/divergence_calculator.py)
- [scripts/calculators/historical_context_calculator.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/calculators/historical_context_calculator.py)
- [scripts/calculators/ma_crossover_calculator.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/calculators/ma_crossover_calculator.py)
- [scripts/calculators/trend_level_calculator.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/calculators/trend_level_calculator.py)
- [scripts/csv_client.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/csv_client.py)
- [scripts/history_tracker.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/history_tracker.py)
- [scripts/market_breadth_analyzer.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/market_breadth_analyzer.py)
- [scripts/report_generator.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/report_generator.py)
- [scripts/scorer.py](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/skills/market-breadth-analyzer/scripts/scorer.py)
- [UPSTREAM-LICENSE.txt](https://github.com/tradermonty/claude-trading-skills/blob/c5d3e5d6d10276bf149db8108a253de22e141252/LICENSE)

## 环境依赖

- Python 3
- requests; read-only remote market CSV retrieval requires network access

## 说明

- Resources copied byte-for-byte from tracked Git blobs; not executed during packaging.
- This snapshot restores missing resources and does not establish the revision used for the original SKILL.md adaptation.
