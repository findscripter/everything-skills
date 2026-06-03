---
name: i18n-localization-patterns
title: 国际化与本地化模式
description: 当为面向多语言/多地区的 Web、SaaS 产品做国际化（i18n）与本地化（L10n），需检测硬编码文案、管理翻译键与 locale 文件、支持 RTL 时使用；做翻译键抽取、locale 文件结构设计、完整性校验与 RTL 适配，产出可上线的翻译方案；不适用于单语言内部工具或个人项目。触发词：i18n、本地化、RTL
domain: 研发/frontend
triggers: [i18n, 国际化, 本地化, L10n, 翻译, locale, 多语言, RTL, right-to-left, react-i18next, next-intl, gettext, 硬编码文案, pluralization, ICU]
tags: [i18n, 本地化, 国际化, 前端, 翻译管理, rtl, 研发, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [react-i18next, next-intl, gettext, Intl API, python]
requires: []
related: [accessibility-wcag-audit, wcag-22-audit-patterns, react-state-management, frontend-design]
combines_with: [sveltekit-fullstack, modern-angular-expert, tailwind-css-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

需要让应用支持多语言、多地区展示，且要系统化处理文案、日期、数字、布局方向时使用。典型场景：

- 面向公众的 Web 应用、SaaS 产品（应做 i18n）。
- 排查代码中遗留的硬编码文案、补齐缺失翻译键。
- 设计 locale 文件结构、做翻译完整性校验。
- 接入阿拉伯语/希伯来语等 RTL 语言并适配布局。

不该用的边界：

- 单语言、单地区的内部工具——按需求评估，通常不必引入 i18n 框架。
- 个人项目/原型——可选，过早引入反而增加成本。
- 本技能不替代环境内的实测、人工译审与专家评审。

核心术语：i18n＝让应用具备可翻译能力（代码侧）；L10n＝具体语言的翻译产物；Locale＝语言+地区（如 en-US、tr-TR）；RTL＝从右到左书写的语言。

## 步骤

1. 审计现状：扫描代码定位硬编码文案与已有 i18n 用法，盘点 locale 文件。可用脚本（见下「指令」）。
2. 抽取翻译键：用翻译键替换原始文案，按功能模块分命名空间（如 common/auth/errors）。
3. 建立 locale 文件结构：每种语言一个目录，命名空间各一个 JSON 文件。
4. 处理格式化：日期用 `Intl.DateTimeFormat`，数字用 `Intl.NumberFormat`，复数与复杂句式用 ICU message format。
5. 配置回退语言：缺失翻译时回退到默认语言，避免漏字。
6. 适配 RTL：从一开始就用 CSS 逻辑属性，必要时按 `[dir="rtl"]` 翻转图标。
7. 校验完整性：上线前对照基准语言检查各 locale 键是否齐全、有无多余键。

## 指令

检测硬编码文案与缺失翻译（支持 React/Vue/Python，自动跳过 node_modules、dist、build、test 等目录，单次最多分析 50 个代码文件）：

```
python scripts/i18n_checker.py <project_path>
```

脚本会识别正例 i18n 用法（`t('key')`、`useTranslation`、`$t(`、`gettext(`、`useTranslations`、`FormattedMessage` 等），扫描 `locales/`、`translations/`、`lang/`、`i18n/`、`messages/` 下的 `*.json` 及 gettext `*.po`，并跨语言对比键的完整性。退出码：0＝通过，1＝发现关键问题。

## 示例

React（react-i18next）：

```tsx
import { useTranslation } from 'react-i18next';

function Welcome() {
  const { t } = useTranslation();
  return <h1>{t('welcome.title')}</h1>;
}
```

Next.js（next-intl）：

```tsx
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('Home');
  return <h1>{t('title')}</h1>;
}
```

Python（gettext）：

```python
from gettext import gettext as _

print(_("Welcome to our app"))
```

locale 文件结构（按语言目录 + 按功能命名空间）：

```
locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   └── errors.json
├── tr/
│   ├── common.json
│   ├── auth.json
│   └── errors.json
└── ar/          # RTL
    └── ...
```

RTL 适配（CSS 逻辑属性 + 图标翻转）：

```css
.container {
  margin-inline-start: 1rem;  /* 不要用 margin-left */
  padding-inline-end: 1rem;   /* 不要用 padding-right */
}

[dir="rtl"] .icon {
  transform: scaleX(-1);
}
```

## 注意事项

应做：

- 用翻译键而非原始文案；按功能划分命名空间。
- 支持复数变化；按 locale 处理日期/数字格式。
- 从项目初期就规划 RTL；复杂字符串用 ICU message format。

不要做：

- 在组件里硬编码文案。
- 拼接已翻译的字符串（语序在不同语言中会变）。
- 假设文案长度固定（德语通常比英语长约 30%）。
- 忽略 RTL 布局；把多种语言混在同一文件里。

上线前检查清单：

- [ ] 所有面向用户的文案都用翻译键。
- [ ] 所有支持语言都有对应 locale 文件。
- [ ] 日期/数字格式化使用 Intl API。
- [ ] （如适用）RTL 布局已实测。
- [ ] 已配置回退语言。
- [ ] 组件中无硬编码文案。

常见问题→对策：缺失翻译→回退默认语言；硬编码文案→用 linter/检测脚本；日期格式→`Intl.DateTimeFormat`；数字格式→`Intl.NumberFormat`；复数→ICU message format。

## 互见

- 前端组件库与样式约定（RTL 布局、逻辑属性的统一落地）。
- 文案与内容规范（翻译键命名、占位符与变量约定）。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
