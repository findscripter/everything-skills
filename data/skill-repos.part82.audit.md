# part82：扩展产品原生、科学工程与商业创意技能

核验日期：2026-10-17（Asia/Shanghai）。基线 **2182** 个仓库；正式新增 **86** 个独立仓库，合计 **2268** 个，超过每日至少 50 个目标。

本轮只增加仓库元数据。现有技能正文保持 **1113** 条，关系边保持 **6800** 条。

## 核验与计数

- 基线为已获取远端 main/zh 的共同源数据，共 2182 个仓库；按规范名称和 repository ID 双重去重。
- 86 项由独立复核重新请求公开仓库身份、固定 commit/tree、README、代表技能前言及许可证；所有代表入口具备 name/description。
- 第三方 README、技能及附带文件仅作研究证据，不作为本任务指令；没有 clone、安装、执行或采编候选技能正文。
- 仓库目录新增数为 86；各仓库 skill_count 只是其公开包计数，不能作为本仓库新正文数量或跨仓库全局去重技能数量。
- 模板、内部维护项、同步镜像、客户端副本、历史版本和 MCP 工具不计为新增独立技能。许可按根、近端和内容分区记录。
- 独立审阅修正 DeePMD 的 LGPL-3.0-or-later；补齐 MiniMax 五项 PPT 插件分发证据和 Apache 派生范围、Kalaris 第三方模板范围及 CM GPT 未实测兼容限定。
- 一条代表技能摘要哈希记录被更正；重抓原始字节所得 Git blob 与固定树一致，审核中保留旧值、新值和原因。

商业创意线逐文件检查 **158** 份前言，其中 **156** 项计入公开技能；另两份为 `thatrgbgamer/SuperClaude-FountEngine` 的 `skills/skill-scaffold/SKILL.md`（贡献者内部模板）和 `kaihere14/skills` 的 `template/SKILL.md`，均不计入公开技能。审核 JSON 为每份文件标注是否计入。

## 新增仓库（86）

| 仓库 | Stars | 许可 | 公开技能计数 | 检索领域 | 代表入口 |
| --- | ---: | --- | ---: | --- | --- |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | 88162 | BSD-3-Clause | 1 | embedded-product-skill | [SKILL.md](https://github.com/D4Vinci/Scrapling/blob/7a684934907a8c7feaafe9ff1ccfd9d45cc26faf/agent-skill/Scrapling-Skill/SKILL.md) |
| [phaserjs/phaser](https://github.com/phaserjs/phaser) | 40497 | MIT | 28 | embedded-product-skill | [SKILL.md](https://github.com/phaserjs/phaser/blob/02d8931b626d9764c133cbb3fbf99966c03c757c/skills/game-setup-and-config/SKILL.md) |
| [ueberdosis/tiptap](https://github.com/ueberdosis/tiptap) | 38749 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/ueberdosis/tiptap/blob/93c377ca97ed2f783c05a7d45e1e99d339f8ac60/.agents/skills/tiptap/SKILL.md) |
| [casey/just](https://github.com/casey/just) | 36313 | CC0-1.0 | 1 | embedded-product-skill | [SKILL.md](https://github.com/casey/just/blob/e540090ff6ad3443debdf198a4897363f7e381c3/skills/just/SKILL.md) |
| [supermemoryai/supermemory](https://github.com/supermemoryai/supermemory) | 31253 | Apache-2.0 | 1 | embedded-product-skill | [SKILL.md](https://github.com/supermemoryai/supermemory/blob/00f48d0378cf2c536cfcd0bb628ad80c41d6f602/skills/supermemory/SKILL.md) |
| [yamadashy/repomix](https://github.com/yamadashy/repomix) | 28869 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/yamadashy/repomix/blob/55c6de6aebde4c38877fbcaf005c4cc396bf6e2d/skills/repomix-explorer/SKILL.md) |
| [t8y2/dbx](https://github.com/t8y2/dbx) | 27019 | Apache-2.0 | 1 | embedded-product-skill | [SKILL.md](https://github.com/t8y2/dbx/blob/99eca47cc33b7a3a71fd57460e61dba2d30f7504/skills/dbx/SKILL.md) |
| [resend/react-email](https://github.com/resend/react-email) | 19847 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/resend/react-email/blob/e0561e164e9c28859d24373804e30b364931ee77/skills/react-email/SKILL.md) |
| [longbridge/gpui-kit](https://github.com/longbridge/gpui-kit) | 17841 | Apache-2.0 | 2 | embedded-product-skill | [SKILL.md](https://github.com/longbridge/gpui-kit/blob/d4c56812984d5fb2640ed922fe230c3113479563/skills/gpui-kit/SKILL.md) |
| [tradingview/lightweight-charts](https://github.com/tradingview/lightweight-charts) | 17594 | Apache-2.0 | 2 | embedded-product-skill | [SKILL.md](https://github.com/tradingview/lightweight-charts/blob/9db7ce733e95303ae1eeb79e664ee9be4ee5e696/.github/skills/lightweight-charts/SKILL.md) |
| [umijs/qiankun](https://github.com/umijs/qiankun) | 16698 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/umijs/qiankun/blob/6737a73aad02c77244208307fe50b41f09c78025/skills/qiankun/SKILL.md) |
| [MiniMax-AI/skills](https://github.com/MiniMax-AI/skills) | 13713 | MIT (repository); Apache-2.0-derived portions retain their original license and attribution | 22 | embedded-product-skill | [SKILL.md](https://github.com/MiniMax-AI/skills/blob/60aaae52bb2af8162732751a4332f62a5fef518b/skills/frontend-dev/SKILL.md) |
| [moonshine-ai/moonshine](https://github.com/moonshine-ai/moonshine) | 11248 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/moonshine-ai/moonshine/blob/234f60faa0eb388b01cdf7e60aca232af37aefda/.agents/skills/moonshine-voice/SKILL.md) |
| [goadesign/goa](https://github.com/goadesign/goa) | 6110 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/goadesign/goa/blob/cb4050026fa70e919012b49f16fe59e3f34a6cd0/skills/goa-service-designer/SKILL.md) |
| [VibiumDev/vibium](https://github.com/VibiumDev/vibium) | 2939 | Apache-2.0 | 2 | embedded-product-skill | [SKILL.md](https://github.com/VibiumDev/vibium/blob/a740f812b120a0fcbf012b282fced69fd3b98cf4/skills/browser/SKILL.md) |
| [frappe/builder](https://github.com/frappe/builder) | 2438 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/frappe/builder/blob/d5e7bfa9d6c5dae18d5c9374bb6a243af9950f04/skills/frappe-builder/SKILL.md) |
| [deepmodeling/deepmd-kit](https://github.com/deepmodeling/deepmd-kit) | 2061 | LGPL-3.0-or-later | 6 | embedded-product-skill | [SKILL.md](https://github.com/deepmodeling/deepmd-kit/blob/cc7fdd785cc1c746268ba96b7244c5757147f75c/skills/deepmd-install/SKILL.md) |
| [RinDig/icm-architect](https://github.com/RinDig/icm-architect) | 1933 | MIT | 1 | skill-infrastructure | [SKILL.md](https://github.com/RinDig/icm-architect/blob/e16cafe6a664dcf6d787a726b452adba77d913f4/SKILL.md) |
| [frappe/frappe-ui](https://github.com/frappe/frappe-ui) | 1068 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/frappe/frappe-ui/blob/e87a3f973e4bb2d84721f87034c52d03e4827be2/skills/frappe-ui/SKILL.md) |
| [dataforseo/mcp-server-typescript](https://github.com/dataforseo/mcp-server-typescript) | 254 | Apache-2.0 | 1 | embedded-product-skill | [SKILL.md](https://github.com/dataforseo/mcp-server-typescript/blob/1fc6d197f1141cca8d1a242e15804c5adc41916a/SKILL.md) |
| [tamdogood/builder-essential-skills](https://github.com/tamdogood/builder-essential-skills) | 224 | MIT | 18 | skill-infrastructure | [SKILL.md](https://github.com/tamdogood/builder-essential-skills/blob/1be9984bdafbb68eaff400bdd82773a1d41ee7ec/skills/lead/SKILL.md) |
| [wilbert-MD-PhD/medical-illustration](https://github.com/wilbert-MD-PhD/medical-illustration) | 177 | MIT (core Skill/code); CC-BY-4.0 (original documentation/showcases); third-party terms separate | 1 | science-lab | [SKILL.md](https://github.com/wilbert-MD-PhD/medical-illustration/blob/7e435b1b44fdee69b432a9e3a508dab982c2c461/plugins/medical-illustration/skills/medical-illustration/SKILL.md) |
| [openaccountant/skills](https://github.com/openaccountant/skills) | 91 | MIT | 44 | business-operations | [SKILL.md](https://github.com/openaccountant/skills/blob/f5abe381f24b5b7d59f1d0b4a825b14494ff2034/business/break-even-calc/SKILL.md) |
| [risingwavelabs/box0](https://github.com/risingwavelabs/box0) | 80 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/risingwavelabs/box0/blob/66be3af827f27ce87fce885ac0a4c3b85d0aeb81/SKILL.md) |
| [deepmodeling/dpdispatcher](https://github.com/deepmodeling/dpdispatcher) | 62 | LGPL-3.0-or-later | 1 | embedded-product-skill | [SKILL.md](https://github.com/deepmodeling/dpdispatcher/blob/3b42422ca6558f29d6c2ead933dc7dfe068c1e07/skills/dpdisp-submit/SKILL.md) |
| [forsonny/The-Crucible-Writing-System-For-Claude](https://github.com/forsonny/The-Crucible-Writing-System-For-Claude) | 60 | MIT (current skills); archived example chapters: restricted | 4 | commercial-creative | [SKILL.md](https://github.com/forsonny/The-Crucible-Writing-System-For-Claude/blob/0d82e733536d70358259f93d66cc40708077898e/skills/crucible-editor/SKILL.md) |
| [capawesome-team/skills](https://github.com/capawesome-team/skills) | 51 | MIT | 30 | embedded-product-skill | [SKILL.md](https://github.com/capawesome-team/skills/blob/c58aeb068d27f002ec490fbe380c1ef462cd1975/skills/capawesome-cloud/SKILL.md) |
| [Raftersecurity/rafter-cli](https://github.com/Raftersecurity/rafter-cli) | 27 | MIT | 4 | embedded-product-skill | [SKILL.md](https://github.com/Raftersecurity/rafter-cli/blob/eda0fabf65b42e46f98f7e076bf15043e2032936/node/resources/skills/rafter-code-review/SKILL.md) |
| [KalarisLabs/research-agent-skills](https://github.com/KalarisLabs/research-agent-skills) | 23 | MIT (collection and skill instructions); bundled publisher templates and third-party materials retain their own terms | 281 | science-lab | [SKILL.md](https://github.com/KalarisLabs/research-agent-skills/blob/df088027ff233dc511fa74cb7f406b4e87fa438c/skills/13c-metabolic-flux/SKILL.md) |
| [eliasstravik/gtm-skills](https://github.com/eliasstravik/gtm-skills) | 19 | MIT | 7 | business-operations | [SKILL.md](https://github.com/eliasstravik/gtm-skills/blob/fad5d78736f0e5484c52ecd8efdfe6029ddb1186/skills/gtm-agent/SKILL.md) |
| [hujizhou35-cmd/medical-journal-selector](https://github.com/hujizhou35-cmd/medical-journal-selector) | 15 | MIT | 1 | literature-reference-management | [SKILL.md](https://github.com/hujizhou35-cmd/medical-journal-selector/blob/4b5c81e447387ce92332face9b707db4cb75149e/skills/medical-journal-selector/SKILL.md) |
| [Remotivated/job-hunt-skills](https://github.com/Remotivated/job-hunt-skills) | 15 | MIT | 12 | business-operations | [SKILL.md](https://github.com/Remotivated/job-hunt-skills/blob/5225f89e2b2007aeb1b037e7f64e2d626d5f6c57/plugins/job-hunt-skills/skills/claim-check/SKILL.md) |
| [fraylabs/possible](https://github.com/fraylabs/possible) | 11 | MIT | 1 | skill-infrastructure | [SKILL.md](https://github.com/fraylabs/possible/blob/3ea52a55484e61a1f563e8e9b5581c6fe611397e/skills/possible/SKILL.md) |
| [Agent-Card/ai-catalog-cli](https://github.com/Agent-Card/ai-catalog-cli) | 10 | Apache-2.0 | 1 | embedded-product-skill | [SKILL.md](https://github.com/Agent-Card/ai-catalog-cli/blob/aeba9dbd66c65356901e25b33fee75917bb19eb4/SKILL.md) |
| [tuniucorp/tuniu-cli](https://github.com/tuniucorp/tuniu-cli) | 9 | MIT | 1 | embedded-product-skill | [SKILL.md](https://github.com/tuniucorp/tuniu-cli/blob/a47243dae54e010a993908fcfe4b3edcf716fb7c/SKILL.md) |
| [LaoZhong-Mihari/codex-organic-chem](https://github.com/LaoZhong-Mihari/codex-organic-chem) | 8 | MIT; bundled third-party editor components retain GPL/commercial terms | 1 | science-lab | [SKILL.md](https://github.com/LaoZhong-Mihari/codex-organic-chem/blob/703998db2ef5901e9b04d85fe4819d12f9596039/.agents/skills/organic-chemistry-assistant/SKILL.md) |
| [jammyfu/open-game-skills](https://github.com/jammyfu/open-game-skills) | 6 | MIT | 192 | commercial-creative | [SKILL.md](https://github.com/jammyfu/open-game-skills/blob/964926623bf4413d10e6dcf35ef7faa41010397d/skills/disciplines/action-feel/SKILL.md) |
| [harshith-vaddiparthy/finance-skills](https://github.com/harshith-vaddiparthy/finance-skills) | 5 | MIT | 9 | business-operations | [SKILL.md](https://github.com/harshith-vaddiparthy/finance-skills/blob/054e33572df3470e8bdb9851c6e70d43ba054835/skills/ar-collections/SKILL.md) |
| [kaihere14/skills](https://github.com/kaihere14/skills) | 5 | MIT | 1 | commercial-creative | [SKILL.md](https://github.com/kaihere14/skills/blob/5ad0b3e318682cc87b661f9d588add86ae9caea8/product-launch-images/SKILL.md) |
| [popjam-io/skills](https://github.com/popjam-io/skills) | 5 | MIT | 6 | commercial-creative | [SKILL.md](https://github.com/popjam-io/skills/blob/47e0eef71e89b2f2ba4f3ef2beb826a657994da0/skills/ad-platform-safe-zones/SKILL.md) |
| [silico-quantum/quantum-chem-skills](https://github.com/silico-quantum/quantum-chem-skills) | 5 | MIT | 9 | scientific-compute-hpc | [SKILL.md](https://github.com/silico-quantum/quantum-chem-skills/blob/d53ba0e11abe94bd13bcf995e906f71cf6ec4d41/gaussian/SKILL.md) |
| [databricks-industry-solutions/hls-skills](https://github.com/databricks-industry-solutions/hls-skills) | 3 | Databricks License — restricted to use within or connecting to Databricks Services | 9 | science-lab | [SKILL.md](https://github.com/databricks-industry-solutions/hls-skills/blob/ed1edd5ea5e03d1213ce94fe3e88546ecacb87f1/skills/accelerators/SKILL.md) |
| [graphed-inc/marketing-skills](https://github.com/graphed-inc/marketing-skills) | 3 | MIT | 4 | business-operations | [SKILL.md](https://github.com/graphed-inc/marketing-skills/blob/b9e6ddc1b44cdaf257e4395eb5fb7dd86abbda13/skills/enrich-linkedin-engagers/SKILL.md) |
| [AliakseiT/heor-skills](https://github.com/AliakseiT/heor-skills) | 2 | Apache-2.0 | 10 | science-lab | [SKILL.md](https://github.com/AliakseiT/heor-skills/blob/4952d83b785a56615dd89deb55623652ec3f8275/plugins/heor/skills/ch-analysenliste-application/SKILL.md) |
| [Covari-mfg/manufacturing-skills](https://github.com/Covari-mfg/manufacturing-skills) | 2 | Apache-2.0 | 1 | energy-industrial | [SKILL.md](https://github.com/Covari-mfg/manufacturing-skills/blob/9ce8f86dbfbb9c80cc85597c1b26975fdc802be8/skills/review-fdm-part/SKILL.md) |
| [Kohulan/orthonym-skills](https://github.com/Kohulan/orthonym-skills) | 2 | MIT | 23 | science-lab | [SKILL.md](https://github.com/Kohulan/orthonym-skills/blob/774e90414077e757a196a4a67b6dcb9e21a0bdba/skills/bounded-goals/SKILL.md) |
| [manifoldmcp/marketing-skills](https://github.com/manifoldmcp/marketing-skills) | 2 | MIT | 26 | business-operations | [SKILL.md](https://github.com/manifoldmcp/marketing-skills/blob/534e95dc5fd07b3d09f04056a2392582b5519cc2/skills/agency/SKILL.md) |
| [RobLincolne/claude-better-text-skill](https://github.com/RobLincolne/claude-better-text-skill) | 2 | MIT | 1 | commercial-creative | [SKILL.md](https://github.com/RobLincolne/claude-better-text-skill/blob/22f131ee803d33f8c2d345ee19d923092ccc09de/better-text/SKILL.md) |
| [alessandrobonomi00/cad-mechanical-designer-skill](https://github.com/alessandrobonomi00/cad-mechanical-designer-skill) | 1 | MIT | 1 | cae-cad | [SKILL.md](https://github.com/alessandrobonomi00/cad-mechanical-designer-skill/blob/833dbd93dcf0746624040a1332b895c03998b8bf/SKILL.md) |
| [carocoda/marketing_skills](https://github.com/carocoda/marketing_skills) | 1 | MIT | 3 | business-operations | [SKILL.md](https://github.com/carocoda/marketing_skills/blob/8c8bdb62ae71a9275e4b636b2add611ed26836d0/linkedin-infographic/SKILL.md) |
| [deepakp999/data-storytelling-slides](https://github.com/deepakp999/data-storytelling-slides) | 1 | MIT | 1 | commercial-creative | [SKILL.md](https://github.com/deepakp999/data-storytelling-slides/blob/d70d3b93a1f844e904f3492070276778b770a013/SKILL.md) |
| [ESRShbb/scientific-workflow-skills](https://github.com/ESRShbb/scientific-workflow-skills) | 1 | MIT | 6 | science-lab | [SKILL.md](https://github.com/ESRShbb/scientific-workflow-skills/blob/af1f1221f25d42f1fac203ba81346f584c793185/skills/characterization-curation/SKILL.md) |
| [faborsky/marketing-miner-mcp-skill](https://github.com/faborsky/marketing-miner-mcp-skill) | 1 | MIT | 1 | business-operations | [SKILL.md](https://github.com/faborsky/marketing-miner-mcp-skill/blob/40efb8adcc310c4c41ef8a41f8be5cf0f4e93ce6/SKILL.md) |
| [gfjwg22xcb-del/cie-igcse-chemistry-study-open](https://github.com/gfjwg22xcb-del/cie-igcse-chemistry-study-open) | 1 | CC-BY-4.0 | 1 | education-learning | [SKILL.md](https://github.com/gfjwg22xcb-del/cie-igcse-chemistry-study-open/blob/44d99f6b9d1d0feac9313db096e3ad6475c91b17/SKILL.md) |
| [J-D11/manufacturing-ai](https://github.com/J-D11/manufacturing-ai) | 1 | MIT | 1 | cae-cad | [SKILL.md](https://github.com/J-D11/manufacturing-ai/blob/ea2160917dca8beb9472c17f7e378005337b81b3/skills/manufacturing-ai/SKILL.md) |
| [Jason-0409-G/vivarium](https://github.com/Jason-0409-G/vivarium) | 1 | MIT | 6 | science-lab | [SKILL.md](https://github.com/Jason-0409-G/vivarium/blob/a915249440e52879bac4013630533d78505e87d1/skills/vivarium-compare/SKILL.md) |
| [LittleDrunkWang/computational-chemistry-dft](https://github.com/LittleDrunkWang/computational-chemistry-dft) | 1 | MIT | 1 | scientific-compute-hpc | [SKILL.md](https://github.com/LittleDrunkWang/computational-chemistry-dft/blob/9a42a09cc7e9cca8baa5d89001aa85a74f5b411d/SKILL.md) |
| [scaliaven/chemist](https://github.com/scaliaven/chemist) | 1 | MIT | 2 | scientific-compute-hpc | [SKILL.md](https://github.com/scaliaven/chemist/blob/1febfec461327202a826f1bca435bc83d252fea6/amber-chemist/SKILL.md) |
| [TheDop/analytical-figures-skill](https://github.com/TheDop/analytical-figures-skill) | 1 | MIT | 1 | science-lab | [SKILL.md](https://github.com/TheDop/analytical-figures-skill/blob/7a19f03bbac561744603a27d7842a4b9e9de7c5c/SKILL.md) |
| [topmindspace/topmind-presentation](https://github.com/topmindspace/topmind-presentation) | 1 | MIT | 1 | commercial-creative | [SKILL.md](https://github.com/topmindspace/topmind-presentation/blob/2dff7f6b8d48963ce4cb6cb32f38bd0c19aae917/SKILL.md) |
| [3494036618-eng/chemistry-research-skills](https://github.com/3494036618-eng/chemistry-research-skills) | 0 | Apache-2.0 | 8 | science-lab | [SKILL.md](https://github.com/3494036618-eng/chemistry-research-skills/blob/1371c7712ea9d2bb568ffe0661c814dbfd33ee7a/skills/chemistry-research-router/SKILL.md) |
| [arey325/marketing-kit-plugin](https://github.com/arey325/marketing-kit-plugin) | 0 | MIT | 1 | business-operations | [SKILL.md](https://github.com/arey325/marketing-kit-plugin/blob/4efb4001a11577ed65f15a224584775265c05b78/skills/v-marketing-kit/SKILL.md) |
| [arunanksharan/semiconductor-skills](https://github.com/arunanksharan/semiconductor-skills) | 0 | MIT | 4 | energy-industrial | [SKILL.md](https://github.com/arunanksharan/semiconductor-skills/blob/14f36b8c32aeac77206237cde7311b4ab48f6b33/skills/semi-fab-process/SKILL.md) |
| [bbecht/demand-gen-claude-skills](https://github.com/bbecht/demand-gen-claude-skills) | 0 | MIT | 7 | business-operations | [SKILL.md](https://github.com/bbecht/demand-gen-claude-skills/blob/401838333d3f1b22662548202c01b32cc9381b16/skills/archie/SKILL.md) |
| [benabbate-sales/gtm-cadence-builder](https://github.com/benabbate-sales/gtm-cadence-builder) | 0 | MIT | 1 | business-operations | [SKILL.md](https://github.com/benabbate-sales/gtm-cadence-builder/blob/c04816b374bd715fd8f7ba8a92f467e3a38c7b1e/SKILL.md) |
| [bowtiekreative/signalstack-social-media-strategist](https://github.com/bowtiekreative/signalstack-social-media-strategist) | 0 | MIT | 1 | business-operations | [SKILL.md](https://github.com/bowtiekreative/signalstack-social-media-strategist/blob/6b91c76cd2350f310796da58eaa756d831bf7e09/SKILL.md) |
| [criticalmanufacturing/agent-plugins](https://github.com/criticalmanufacturing/agent-plugins) | 0 | MIT | 1 | energy-industrial | [SKILL.md](https://github.com/criticalmanufacturing/agent-plugins/blob/16e1aab5f9f06103179657f3d659763a216b6255/plugins/cm-gpt/skills/ask/SKILL.md) |
| [DarrenWongKaWa/dft-wannier-transport-skill](https://github.com/DarrenWongKaWa/dft-wannier-transport-skill) | 0 | MIT | 1 | scientific-compute-hpc | [SKILL.md](https://github.com/DarrenWongKaWa/dft-wannier-transport-skill/blob/b2ee32956fb55d427c42a66b55f10bddbd8c9a14/dft-wannier-transport/SKILL.md) |
| [evgeniyzakharow-design/thermoforming-dfm](https://github.com/evgeniyzakharow-design/thermoforming-dfm) | 0 | MIT | 1 | energy-industrial | [SKILL.md](https://github.com/evgeniyzakharow-design/thermoforming-dfm/blob/1b27abe2c778d8d27c217669032ebc41bf0eefbf/skills/thermoforming-dfm/SKILL.md) |
| [guilhermefriol/claude-skills-design](https://github.com/guilhermefriol/claude-skills-design) | 0 | MIT | 2 | commercial-creative | [SKILL.md](https://github.com/guilhermefriol/claude-skills-design/blob/b4c848e30c20afaa47268500d04ef7d3e4acbace/design-gf/SKILL.md) |
| [HycJack/edu-explainer-video-skill](https://github.com/HycJack/edu-explainer-video-skill) | 0 | MIT | 1 | education-learning | [SKILL.md](https://github.com/HycJack/edu-explainer-video-skill/blob/cb8f801e90dbd19fe38df1a984a758f0ebf8c075/SKILL.md) |
| [JinnWorks/jinn-skills](https://github.com/JinnWorks/jinn-skills) | 0 | MIT | 59 | business-operations | [SKILL.md](https://github.com/JinnWorks/jinn-skills/blob/5f6ad95bce6f0d1f9e05b5e2df62ce52a78216c2/skills/ad-copy-variants/SKILL.md) |
| [joey114132/claude-robotics-skills](https://github.com/joey114132/claude-robotics-skills) | 0 | MIT | 24 | robotics-embedded | [SKILL.md](https://github.com/joey114132/claude-robotics-skills/blob/2f46c53473df17c22cb8054b522855d17480fa29/skills/physical-ai-harness/SKILL.md) |
| [justinharry2143/computational-chemistry-materials-agent](https://github.com/justinharry2143/computational-chemistry-materials-agent) | 0 | MIT | 46 | scientific-compute-hpc | [SKILL.md](https://github.com/justinharry2143/computational-chemistry-materials-agent/blob/dde1caa91f232e21a21055209d4e69966a719591/plugins/computational-chemistry-materials-agent/skills/atomistic-dataset-interoperability/SKILL.md) |
| [Lancifonins/chem-skills](https://github.com/Lancifonins/chem-skills) | 0 | MIT | 3 | science-lab | [SKILL.md](https://github.com/Lancifonins/chem-skills/blob/73e36123dcd19c2c6023c0b1120eb0e0c0049957/cdx-tools/SKILL.md) |
| [makukhin-ie/ai-toolbox](https://github.com/makukhin-ie/ai-toolbox) | 0 | MIT | 4 | business-operations | [SKILL.md](https://github.com/makukhin-ie/ai-toolbox/blob/43b2d701b8c0e5d7cd336add6268766bb9b125bc/skills/book-typesetter/SKILL.md) |
| [MrGoulart3/MGE-Skills](https://github.com/MrGoulart3/MGE-Skills) | 0 | MIT | 1 | science-lab | [SKILL.md](https://github.com/MrGoulart3/MGE-Skills/blob/f2b76773a0f95972ec819cf321f071448a214f43/molecular-motion-video/SKILL.md) |
| [Oweik/pcb-art-easyeda](https://github.com/Oweik/pcb-art-easyeda) | 0 | MIT | 1 | energy-industrial | [SKILL.md](https://github.com/Oweik/pcb-art-easyeda/blob/e5f1999fd304ad23dcab6e4cd51ddb244ca87ac1/SKILL.md) |
| [pugofka/growth-ideas-skill](https://github.com/pugofka/growth-ideas-skill) | 0 | MIT | 1 | business-operations | [SKILL.md](https://github.com/pugofka/growth-ideas-skill/blob/9a559d7b4cbdb382ee7423a29b100be46eb526bc/skills/growth-ideas/SKILL.md) |
| [robertriedel/POD2_Config_Skill](https://github.com/robertriedel/POD2_Config_Skill) | 0 | MIT | 1 | energy-industrial | [SKILL.md](https://github.com/robertriedel/POD2_Config_Skill/blob/b75ea9ad241d998a8dc9febc61f896b8fa5a061b/SKILL.md) |
| [spilno-agency/spilno-agency-skills](https://github.com/spilno-agency/spilno-agency-skills) | 0 | MIT | 1 | business-operations | [SKILL.md](https://github.com/spilno-agency/spilno-agency-skills/blob/0945eb64a38ddbcc0c3eb28cb02afc02d2185303/ga4-roas-corridor-analysis/SKILL.md) |
| [splinetool/spline-skills](https://github.com/splinetool/spline-skills) | 0 | MIT | 1 | commercial-creative | [SKILL.md](https://github.com/splinetool/spline-skills/blob/ca808d86689a9829872decacd8dfbd52ff45f776/skills/spline/SKILL.md) |
| [sunjun333/aosaiqunxing-mcp](https://github.com/sunjun333/aosaiqunxing-mcp) | 0 | MIT | 1 | education-learning | [SKILL.md](https://github.com/sunjun333/aosaiqunxing-mcp/blob/458fa0df68ac18b4505d4580111efab5c361bc85/skill/aosaiqunxing/SKILL.md) |
| [thatrgbgamer/SuperClaude-FountEngine](https://github.com/thatrgbgamer/SuperClaude-FountEngine) | 0 | MIT | 9 | business-operations | [SKILL.md](https://github.com/thatrgbgamer/SuperClaude-FountEngine/blob/88caef9bb0edd134e3ebd8c681e61807394eddfd/skills/debug-triage/SKILL.md) |
| [tizsabrine/claude-skills-design](https://github.com/tizsabrine/claude-skills-design) | 0 | MIT | 1 | commercial-creative | [SKILL.md](https://github.com/tizsabrine/claude-skills-design/blob/52336ff604bf2d1b0c3b972d4302a1e71c0c868e/pair-design/SKILL.md) |
| [yinum/analytical-skills](https://github.com/yinum/analytical-skills) | 0 | Apache-2.0 | 15 | literature-reference-management | [SKILL.md](https://github.com/yinum/analytical-skills/blob/80980bb7ddfc601a287426cdd06d315d16a97b50/skills/academic-search/SKILL.md) |

## 范围与证据限制

产品原生线不以仓库名是否含 skill 为限制；科学工程线覆盖 MES、制造、CAD、DFT、化学和科研出版；商业创意线覆盖财务、设计、演示、营销和职业工作流。

受限许可、服务许可与公开技能许可分开说明；目录收录不代表已安装运行验证。MiniMax 的 22 为 17 项根技能加 5 项独立分发 PPT 插件技能；游戏包的路由/清单、研究合集的第三方模板边界见逐项计数和许可证据。

另有 **162** 个缓存筛选记录未被本轮接纳，完整列表与各自已取得的证据深度见审核 JSON；未经仓库核验的搜索命中不充作候选通过数。

完整固定提交、真实 tree SHA、SHA-256、分发依据、许可范围和哈希修订见 [审核 JSON](skill-repos.part82.audit.json)；查询和线索记录见 [检索来源](skill-repos.part82.search-provenance.json)。

### 商业创意线筛选说明

- `BlackBlazeXXX/claude-skills-marketing`：有14个有效公开技能和MIT正文，但版权行仍是 `YOUR-USERNAME`，在收敛最高置信度清单时暂缓。
- `zji996/AIA-skills`：README 明确称 GitHub 镜像，并把外站 Gitea 作为主源；按非纯镜像要求排除。
- `02siteIQ/icm-architect`：与 `RinDig/icm-architect` 同名同内容的低星复制风险，保留高星规范来源。
- `dbbaskette/presentation-studio`：README 明确已经移至 `dbbaskette/marketing-studio`；不计过时分发副本。
- `kristian-presso/claude-marketing-skills`：README 指向同作者共享 hub；为避免部门分发副本与 canonical 源重复，本轮暂缓。
- `jonbishop1/data-product-marketing-skills`、`jonbishop1/devtool-marketing-skills`：README 明确由 `jonbishop1/saas-marketing-skills` 共享源生成；本轮不重复计生成分发库。
- `StrongAI/claude-skills-writing*`：缺明确许可，且存在独立拆分副本风险；暂缓。
- `roteskreuz-at/corporate-design-skill`、`sharadvermasv/design-intelligence`、`hydrofranz/technical-accuracy-check`、`mtorkildsen/skill-builder-pipeline`、`yunhee-lee/claude-skills-obsidian-knowledge-system`：有技能文件，但本轮未获得明确许可，暂缓。
- `siminpeng-create/Google-Ads-NKW-Analyzer`、`JakeWhiteArchitecture/Tender-Documentation-Claude-Skill`：有许可但没有公开的精确 `SKILL.md` 文件，暂缓。
- `saren-ai/claude-skills`、`PacktPublishing/Building-Claude-Skills-Productivity`：未找到可计数公开 `SKILL.md`；暂缓。
- `voronindenis5/story-spark`：有公开技能文件和MIT，但README主要说明普通Python脚本，未独立确认技能安装/使用分发入口，未计入。
- 其余大量新候选只做元数据/初筛缓存，不代表否定质量；此次达到目标后停止扩搜。
