---
name: astropy-astronomy-toolkit
title: Astropy 天文与天体物理工具箱
description: 当用 Python 做天文/天体物理数据分析（坐标变换、单位量纲、FITS 读写、星表、时间系统、WCS、宇宙学）并需要 Astropy 领域 API 时使用；用 Astropy 编写或调试分析代码、产出量纲一致且可复现的结果；不适用于通用数据清洗或与天文无关的纯数值计算（改用 pandas/numpy）。触发词：astropy、天文、astronomy、SkyCoord、坐标变换、FITS、WCS、宇宙学、cosmology、Quantity、单位换算、星表交叉匹配
domain: 领域/science
triggers: [astropy, 天文, astronomy, SkyCoord, 坐标变换, FITS, WCS, 宇宙学, cosmology, Quantity, 单位换算, 星表交叉匹配]
tags: [astropy, astronomy, astrophysics, fits, coordinates, cosmology, wcs, units, time, python, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [astropy, astropy.units, astropy.coordinates, astropy.io.fits, astropy.table, astropy.time, astropy.wcs, astropy.cosmology, numpy, uv]
requires: []
related: [astronomy-data-toolkit, sympy-symbolic-math, materials-science-toolkit, scientific-database-lookup]
combines_with: [matplotlib-visualization, guided-statistical-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
# Astropy 天文与天体物理工具箱

Astropy 是天文学的核心 Python 库，提供单位/量、天球坐标、FITS I/O、星表、时间系统、WCS 与宇宙学等领域能力。本条用于在编写或调试天文数据分析代码时正确调用这些 API。

## 何时使用

当任务需要 Astropy 的领域 API 时使用，典型场景：

- 天球坐标系互转（ICRS、Galactic、FK5、AltAz 等），角距/位置角计算，星表匹配
- 物理单位与量纲换算（Jy↔mJy、pc↔km），含光谱/多普勒/视差等价关系，对数单位（星等）
- 读写或操作 FITS 文件（图像与二进制/ASCII 表格、多扩展、内存映射、远程读取）
- 宇宙学计算（光度距离、共动距离、角直径距离、回溯时间、宇宙年龄、哈勃参数）
- 高精度时间处理（UTC/TAI/TT/TDB 时标，JD/MJD/ISO/Unix 格式，光行时改正）
- 星表/表格操作（读取、交叉匹配、过滤、连接 join、分组聚合）
- WCS 像素坐标 ↔ 世界坐标互转
- 天文常数、NDData/CCDData、建模拟合、可视化拉伸、卷积平滑、sigma 裁剪统计

**不该用的边界**：通用 CSV/表格清洗、与天文无关的纯数值计算，直接用 pandas/numpy 更轻量；只有需要单位感知、坐标框架、FITS/WCS、宇宙学这些领域语义时才引入本条。

## 步骤

1. 安装并锁版本以保证可复现：`uv pip install "astropy==7.2.0"`；需绘图等常用可选依赖用 `"astropy[recommended]==7.2.0"`，需广覆盖才用 `"astropy[all]==7.2.0"`。要求 Python 3.11+，依赖 NumPy、PyERFA、PyYAML、packaging；用隔离虚拟环境，勿以管理员权限安装。
2. 按需导入子模块（见「指令」），不要一次性全部导入。
3. **凡带物理量纲的数值一律附单位**（`值 * u.<unit>`），换算用 `.to()`，让计算自带量纲检查。
4. FITS 一律用 `with fits.open(...) as hdul:` 上下文管理器确保关闭；大文件用内存映射（`memmap=True`）。
5. 批量坐标/时间处理成数组而非 Python 循环，显著更快。
6. 坐标变换前先确认源 frame；转 AltAz 需提供 `obstime`（`Time`）与观测地 `EarthLocation`。
7. 宇宙学选定模型（如 `Planck18`）；有单位的表用 `QTable`；缺失值用掩码列。

## 指令

```python
import astropy.units as u
from astropy.coordinates import SkyCoord, EarthLocation, AltAz, match_coordinates_sky
from astropy.time import Time
from astropy.io import fits
from astropy.table import Table, QTable
from astropy.cosmology import Planck18
from astropy.wcs import WCS
```

常用调用速查：
- 单位/量：`d = 100 * u.pc; d.to(u.km)`
- 坐标：`SkyCoord(ra=10.5*u.deg, dec=41.2*u.deg, frame='icrs').galactic`
- 时间：`Time('2023-01-15 12:30:00').jd`
- FITS：`fits.getdata('x.fits')` / `fits.getheader('x.fits')`
- 表格：`Table.read('catalog.fits')`
- 宇宙学：`Planck18.luminosity_distance(z=1.0)`

## 示例

坐标转 Galactic 与 AltAz（AltAz 需时间与地点）：

```python
c = SkyCoord(ra='05h23m34.5s', dec='-69d45m22s', frame='icrs')
print(c.galactic.l.deg, c.galactic.b.deg)

aa = AltAz(obstime=Time('2023-06-15 23:00:00'),
           location=EarthLocation(lat=40*u.deg, lon=-120*u.deg))
c_altaz = c.transform_to(aa)
print(c_altaz.alt.deg, c_altaz.az.deg)
```

读取并统计 FITS：

```python
import numpy as np
with fits.open('observation.fits') as hdul:
    hdul.info()
    data, header = hdul[1].data, hdul[1].header
    exptime = header['EXPTIME']
    print(np.mean(data), np.median(data))
```

星表交叉匹配（按角距阈值过滤）：

```python
coords1 = SkyCoord(ra=cat1['RA']*u.deg, dec=cat1['DEC']*u.deg)
coords2 = SkyCoord(ra=cat2['RA']*u.deg, dec=cat2['DEC']*u.deg)
idx, sep, _ = coords1.match_to_catalog_sky(coords2)
matches = sep < 1 * u.arcsec
cat1_matched, cat2_matched = cat1[matches], cat2[idx[matches]]
```

宇宙学距离/时间：

```python
z = 1.5
print(Planck18.luminosity_distance(z), Planck18.angular_diameter_distance(z))
print(Planck18.age(z).to(u.Gyr), Planck18.lookback_time(z).to(u.Gyr))
```

## 注意事项

- **网络访问要显式**：`SkyCoord.from_name()`、`EarthLocation.of_site(refresh_cache=True)`、`EarthLocation.of_address()`、`download_file()`、远程 FITS 读取，以及部分 IERS 时间/坐标转换会联网或更新本地缓存。勿把敏感目标名、地址、URL、专有文件路径发往第三方服务。
- **可复现**：共享环境锁版本（如 `astropy==7.2.0`），更新 pin 前先看 release notes。
- **7.x 版本变更**：Astropy 7.0 已移除过时 FITS API，如 `(Bin)Table.update`、`_ExtensionHDU`、`_NonstandardExtHDU` 及 `CompImageHDU` 的 `tile_size` 参数；`CompImageHeader` 已弃用——新代码勿用这些遗留写法。
- 时标要显式声明（UTC/TT/TDB），高精度计时尤其关键；用 WCS 转换前先校验其有效性；昂贵计算（如宇宙学距离）可缓存复用。
- 当前研究的稳定版：Astropy 7.2.0（2025-11-25 发布，许可 BSD-3-Clause）。

## 互见

- related：`astronomy-data-toolkit` —— 同源的天文数据分析条目，可互参
- related：`materials-science-toolkit` `cheminformatics-toolkit` `sympy-symbolic-math` —— 其他科学计算工具箱
- combines_with：`matplotlib-visualization` —— 把 FITS 图像/宇宙学曲线绘图，`guided-statistical-analysis` —— 对星表/测光数据做统计
- 官方文档：https://docs.astropy.org/en/stable/ ；教程：https://learn.astropy.org/
- 源条目附分模块参考：`references/units.md`、`coordinates.md`、`cosmology.md`、`fits.md`、`tables.md`、`time.md`、`wcs_and_other_modules.md`（涵盖 NDData/CCDData、建模、可视化、常数、卷积、统计）。

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
