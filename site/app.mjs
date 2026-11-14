import { search, githubPath, commands } from './search.mjs';

const $ = selector => document.querySelector(selector);
const state = new URLSearchParams(location.search);
let lang = state.get('lang') === 'zh' ? 'zh' : 'en';
let mode = state.get('kind') === 'repos' ? 'repos' : 'skills';
let category = state.get('filter') || '';
let catalog = null;
let shown = 9;
const words = {
  en: {
    navExamples:'Examples',eyebrow:"TASK SKILLS WITH INSPECTABLE OUTCOMES",heroOne:"Start with a task.",heroTwo:"Inspect the result.",heroDescription:"Use focused instructions for a report, patch or working document. See real inputs, outputs and checks before choosing your skills.",explore:"Inspect a real repair ↓",seeExamples:"Find a task skill ↗",oneTask:"ONE REAL REPAIR",previewTask:"An empty Nix skill package.",stepOne:"Reproduce and repair",stepTwo:"Review the exact patch",stepThree:'Verify the handoff',openExample:"Inspect inputs, patch and checks",activeSkills:'current skill entries',volumes:'installable volumes',repositories:'external directory records',statsLoading:'Loading the generated catalog…',libraryLabel:'THE LIBRARY',exploreTitle:'What are you working on?',graphLink:'Browse the relationship graph ↗',searchLabel:'Search tasks or skill names',filter:'Filter',allVolumes:'All volumes',allCategories:'All categories',skills:'Skills',repos:'Repositories',share:'Copy search link',loading:'Loading…',nativeLanguage:'Skill instructions keep their original language.',showMore:'Show more',trustNote:'The catalog records metadata and review status. Listing, structural checks, and example checks do not certify every skill’s effectiveness, security, or license.',examplesLabel:"BOUNDED TEACHING CASES",examplesTitle:"Explore three smaller teaching examples.",allExamples:'All example files ↗',exampleOneTitle:'Get oriented in a codebase',exampleOneBody:'A small repository, a map of its boundaries, and an onboarding report you can inspect.',exampleTwoTitle:'Read a paper with its sources',exampleTwoBody:'Follow the paper’s claims and bibliography, with explicit limits on what was checked.',exampleThreeTitle:'Review an API before delivery',exampleThreeBody:'Inspect a compact API fixture, trace concrete findings, and compare a revised design.',tryExample:'Explore the example →',installLabel:'TAKE WHAT YOU NEED',installTitle:"Start with two focused skills.",installBody:"Install the debugging and static-review pair for Codex, then supply your own repository and failure. Claude Code volume installation and other paths remain in the full guide.",installGuide:'Read the installation guide ↗',copyCommands:'Copy commands',footer:'A connected library, maintained in the open.',contribute:'Contribute',sources:'Sources & licenses',volumeInstall:'Install this volume',volumeInstallBody:'Run these commands inside Claude Code. For other agents, open the linked SKILL.md and check its runtime requirements.',placeholder:'Try API review, a paper, or accessibility…',copied:'Copied',copyFailed:'Copy unavailable — select and copy the text.',empty:'No matches. Try a shorter task phrase or another filter.',openSkill:'Open skill ↗',openRepo:'Open repository ↗',installVolume:'Install volume',unreviewed:'Not reviewed',reviewed:'Reviewed metadata',indexedOnly:'External record',archivedUpstream:'Archived upstream',repoNote:'Historical-only and unavailable records remain in the full repository index.',matches:'matches',visible:'shown',loadError:'The catalog could not load. Reload this page or browse the Markdown catalog on GitHub.',retry:'Retry',statsNote:(s)=>`${s.total.toLocaleString()} total skill entries, including ${s.archived} archived. External records are indexed metadata.`,volumeLabels:{'00-meta':'Reasoning & workflows','01-documents':'Documents & writing','02-engineering':'Engineering','03-data':'Data','04-ai':'AI','05-business':'Business','06-creative':'Creative','07-productivity':'Productivity','08-security':'Security','09-verticals':'Research & industries','10-platform':'Platforms'},categoryLabels:{official:'Official teams',collections:'Collections',vertical:'Domain collections',infra:'Infrastructure',other:'Other',unnamed:'Other repository layouts'},

    outcomeBefore:"before",outcomeAfter:"exported paths after",outcomeScope:"Pinned-source replay and real Nix checks. One package built; package checks did not run skill tools.",caseLabel:"CHECK THE DELIVERABLE",caseTitle:"A result with a reproduction trail.",caseBody:"The scanner’s mirror heuristic hid this collection. An existing source override restored its path map. Inspect the fixed revisions, full inventory and static review.",casePatch:"Proposed upstream patch ↗",caseResult:"Measured result ↗",caseInventory:"Complete path map ↗",caseReview:"Static review ↗",caseReplay:"Replay, scope and limitations",caseLimits:"The first command verifies saved evidence offline; a fresh scanner/Nix replay needs the separate case setup. Counts include archived entries and a template. This maintainer case is not a user study or a model-success benchmark.",caseGuide:"Read the full reproduction guide ↗",caseFeedback:"Share a result from your own task ↗",
  },
  zh: {
    navExamples:'案例',eyebrow:"从具体任务，到可检查的交付物",heroOne:"先看交付结果，",heroTwo:"再选择技能。",heroDescription:"用聚焦的指令完成报告、补丁或文档。先检查真实输入、产物和验证记录，再为自己的任务选择技能。",explore:"查看真实修复与证据 ↓",seeExamples:"查找任务技能 ↗",oneTask:"一次真实项目修复",previewTask:"Nix 为什么收录了一个空技能包？",stepOne:"复现问题、修复并验证",stepTwo:"静态审查精确补丁",stepThree:'验证并交接',openExample:"查看输入、补丁和检查结果",activeSkills:'当前技能条目',volumes:'可按需安装的分卷',repositories:'外部仓库目录记录',statsLoading:'正在读取生成目录…',libraryLabel:'查找与浏览',exploreTitle:'你现在要完成什么任务？',graphLink:'浏览技能关系图 ↗',searchLabel:'搜索任务或技能名称',filter:'筛选',allVolumes:'全部分卷',allCategories:'全部分类',skills:'技能',repos:'外部仓库',share:'复制搜索链接',loading:'正在加载…',nativeLanguage:'技能正文保留原始语言。',showMore:'加载更多',trustNote:'目录展示元数据与审阅状态。被收录、结构检查或案例检查通过，不代表全部技能的效果、安全与许可已经认证。',examplesLabel:"有边界的教学案例",examplesTitle:"再看三个更小的教学样例。",allExamples:'查看全部案例文件 ↗',exampleOneTitle:'接手一个陌生代码库',exampleOneBody:'从小型代码库出发，检查结构与边界，再对照具体的接手报告。',exampleTwoTitle:'带着来源读一篇论文',exampleTwoBody:'沿原文核对结论与书目，明确版本差异和已经检查的范围。',exampleThreeTitle:'在交付之前评审 API',exampleThreeBody:'检查一份精简接口样例，对照具体问题和修订后的设计。',tryExample:'打开这个案例 →',installLabel:'按需取用',installTitle:"先安装这两个技能。",installBody:"为 Codex 安装调试与静态审查组合，再提供自己的仓库和故障。Claude Code 分卷安装等其他路径保留在完整指南中。",installGuide:'查看安装步骤 ↗',copyCommands:'复制命令',footer:'用关系连接技能，开放维护。',contribute:'参与贡献',sources:'来源与许可',volumeInstall:'安装这个分卷',volumeInstallBody:'在 Claude Code 中运行以下命令。其他 Agent 请读取对应 SKILL.md，并核对其运行前提。',placeholder:'试试：API 评审、论文、无障碍…',copied:'已复制',copyFailed:'无法自动复制，请选中文字手动复制。',empty:'没有找到匹配项。试试更短的任务词，或更换筛选条件。',openSkill:'查看技能 ↗',openRepo:'打开仓库 ↗',installVolume:'安装此卷',unreviewed:'尚未审阅',reviewed:'元数据已审阅',indexedOnly:'外部目录',archivedUpstream:'上游已归档',repoNote:'历史停荐和不可访问记录保留在完整仓库索引中。',matches:'个匹配',visible:'已显示',loadError:'目录加载失败。可刷新重试，或打开 GitHub 上的完整 Markdown 目录。',retry:'重试',statsNote:(s)=>`技能条目共 ${s.total.toLocaleString()} 个，其中 ${s.archived} 个历史归档。外部记录仅索引元数据。`,volumeLabels:{'00-meta':'思考与工作流','01-documents':'文档与写作','02-engineering':'研发工程','03-data':'数据','04-ai':'人工智能','05-business':'商业','06-creative':'创意','07-productivity':'生产力','08-security':'安全','09-verticals':'科研与行业','10-platform':'平台集成'},categoryLabels:{official:'官方团队',collections:'精选合集',vertical:'垂直领域',infra:'基础设施',other:'其他',unnamed:'其他仓库布局'},
    outcomeBefore:"修复前",outcomeAfter:"修复后导出路径",outcomeScope:"固定源复跑与真实 Nix 检查。只构建一个代表包；打包检查未运行技能工具。",caseLabel:"检查交付物",caseTitle:"结果之外，还有复现证据。",caseBody:"镜像启发式规则隐藏了整份目录；使用已有的精确来源覆盖规则恢复路径表。固定版本、完整清单与静态审查都可检查。",casePatch:"查看上游修复提案 ↗",caseResult:"实测结果 ↗",caseInventory:"完整路径表 ↗",caseReview:"静态审查 ↗",caseReplay:"复跑方式、范围与限制",caseLimits:"第一条命令只离线核对保存结果；重跑扫描器和 Nix 需要案例中的独立环境。计数包含归档与模板。这是维护者真实案例，不是用户研究或模型成功率基准。",caseGuide:"阅读完整复现步骤 ↗",caseFeedback:"提交你自己的任务结果 ↗",

  }
};
const w = () => words[lang];
const element = (tag, className, text) => { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; };
const link = (text, url) => { const el = element('a', '', text); el.href = url; return el; };

function updateUrl() {
  const params = new URLSearchParams();
  if ($('#query').value.trim()) params.set('q', $('#query').value.trim());
  if (mode === 'repos') params.set('kind', 'repos');
  if (category) params.set('filter', category);
  if (lang === 'zh') params.set('lang', 'zh');
  history.replaceState(null, '', `${location.pathname}${params.size ? '?' + params.toString() : ''}${location.hash}`);
}

function filters() {
  const select = $('#volume');
  const groups = mode === 'skills' ? w().volumeLabels : w().categoryLabels;
  select.replaceChildren();
  select.append(new Option(mode === 'skills' ? w().allVolumes : w().allCategories, ''));
  for (const [key, value] of Object.entries(groups)) select.append(new Option(`${mode === 'skills' ? key + ' · ' : ''}${value}`, key));
  if (!Object.hasOwn(groups, category)) category = '';
  select.value = category;
  select.setAttribute('aria-label', lang === 'zh' ? '筛选分卷或分类' : 'Filter by volume or category');
}

function translate() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  for (const el of document.querySelectorAll('[data-i18n]')) { const value = w()[el.dataset.i18n]; if (typeof value === 'string') el.textContent = value; }
  $('#language').textContent = lang === 'zh' ? 'EN' : '中文';
  $('#language').setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换为中文');
  $('#query').placeholder = w().placeholder;
  filters();
  if (catalog) {
    $('#active-count').textContent = catalog.stats.active.toLocaleString();
    $('#volume-count').textContent = catalog.stats.volumes;
    $('#repo-count').textContent = catalog.stats.repositories.toLocaleString();
    $('#stats-note').textContent = w().statsNote(catalog.stats);
    $('#outcome-before').textContent = catalog.outcome.before.toLocaleString();
    $('#outcome-after').textContent = catalog.outcome.after.toLocaleString();
    $('#outcome-breakdown').textContent = lang === 'zh' ? `${catalog.outcome.active.toLocaleString()} 现行 + ${catalog.outcome.archived} 归档 + ${catalog.outcome.templates} 模板 · 固定源 ${catalog.outcome.source.slice(0, 7)}` : `${catalog.outcome.active.toLocaleString()} active + ${catalog.outcome.archived} archived + ${catalog.outcome.templates} template · source ${catalog.outcome.source.slice(0, 7)}`;
  }
  render();
}

async function copy(text, button) {
  const previous = button.textContent;
  try { await navigator.clipboard.writeText(text); button.textContent = w().copied; }
  catch { button.textContent = w().copyFailed; }
  setTimeout(() => { button.textContent = previous; }, 2600);
}

function card(row) {
  const isSkill = mode === 'skills';
  const article = element('article', 'skill-card');
  const top = element('div', 'card-top');
  top.append(element('span', 'volume-pill', isSkill ? w().volumeLabels[row.vol] || row.vol : w().categoryLabels[row.section] || row.section));
  top.append(element('span', 'review-label', isSkill ? row.review_status === 'reviewed' ? w().reviewed : w().unreviewed : row.upstream_state === 'archived' ? w().archivedUpstream : w().indexedOnly));
  const title = element('h3', '', isSkill ? row.title || row.name : row.full_name);
  const description = isSkill ? row.description : lang === 'zh' ? row.summary_zh || row.summary : row.summary;
  article.append(top, title);
  if (isSkill) article.append(element('div', 'skill-name', row.name));
  article.append(element('p', 'card-description', description || ''));
  const actions = element('div', 'card-actions');
  const url = isSkill ? githubPath(row.path) : `https://github.com/${row.full_name.split('/').map(encodeURIComponent).join('/')}`;
  actions.append(link(isSkill ? w().openSkill : w().openRepo, url));
  if (isSkill) {
    const install = element('button', 'install-button', w().installVolume); install.type = 'button';
    install.addEventListener('click', () => { $('#volume-command').value = commands(row.vol); $('#install-dialog').showModal(); });
    actions.append(install);
  }
  article.append(actions);
  return article;
}

function render() {
  for (const [id, active] of [['skills-mode', mode === 'skills'], ['repos-mode', mode === 'repos']]) { $( '#' + id).classList.toggle('selected', active); $('#' + id).setAttribute('aria-pressed', String(active)); }
  $('#catalog-note').textContent = mode === 'skills' ? w().nativeLanguage : w().repoNote;
  if (!catalog) return;
  const rows = mode === 'skills' ? catalog.skills : catalog.repositories;
  const found = search(rows, $('#query').value, { category, mode });
  const results = $('#results'); results.replaceChildren();
  if (!found.length) results.append(element('p', 'empty-state', w().empty));
  else for (const row of found.slice(0, shown)) results.append(card(row));
  $('#result-count').textContent = lang === 'zh' ? `${found.length.toLocaleString()} 个匹配 · 已显示 ${Math.min(shown, found.length)} 个` : `${found.length.toLocaleString()} matches · ${Math.min(shown, found.length)} shown`;
  $('#show-more').hidden = found.length <= shown;
}

async function load() {
  try {
    const response = await fetch('./catalog.json');
    if (!response.ok) throw new Error(`Catalog response ${response.status}`);
    catalog = await response.json();
    if (!Array.isArray(catalog.skills) || !Array.isArray(catalog.repositories) || !catalog.stats || !catalog.outcome) throw new Error('Invalid catalog');
    translate();
  } catch (error) {
    catalog = null;
    $('#result-count').textContent = w().loadError;
    const fallback = element('p', 'empty-state'); fallback.append(link(lang === 'zh' ? '打开 Markdown 目录 ↗' : 'Open the Markdown catalog ↗', 'https://github.com/findscripter/everything-skills/blob/main/INDEX/catalog.md'));
    const retry = element('button', 'button secondary', w().retry); retry.type = 'button'; retry.addEventListener('click', load); fallback.append(document.createElement('br'), retry);
    $('#results').replaceChildren(fallback);
    console.error('Catalog loading failed:', error.message);
  }
}

$('#query').value = state.get('q') || '';
$('#search-form').addEventListener('submit', event => event.preventDefault());
$('#query').addEventListener('input', () => { shown = 9; render(); updateUrl(); });
$('#volume').addEventListener('change', () => { category = $('#volume').value; shown = 9; render(); updateUrl(); });
$('#language').addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; translate(); updateUrl(); });
for (const [id, value] of [['skills-mode', 'skills'], ['repos-mode', 'repos']]) $('#' + id).addEventListener('click', () => { mode = value; category = ''; shown = 9; filters(); render(); updateUrl(); });
$('#show-more').addEventListener('click', () => { shown += 9; render(); });
$('#share').addEventListener('click', () => { updateUrl(); copy(location.href, $('#share')); });
$('#copy-install').addEventListener('click', () => copy($('#default-install-command').textContent, $('#copy-install')));
$('#copy-volume').addEventListener('click', () => copy($('#volume-command').value, $('#copy-volume')));
document.addEventListener('keydown', event => { if (event.key === '/' && !event.ctrlKey && !event.metaKey && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) { event.preventDefault(); $('#query').focus(); } });
translate();
load();
