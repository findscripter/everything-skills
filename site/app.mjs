import { search, taskComparisons, searchComparisons, popularSkills, popularRepositories, githubPath, commands } from './search.mjs';

const $ = selector => document.querySelector(selector);
const state = new URLSearchParams(location.search);
let lang = state.get('lang') === 'zh' ? 'zh' : 'en';
const modes = ['skills', 'tasks', 'repos'];
let mode = modes.includes(state.get('kind')) ? state.get('kind') : 'skills';
let category = mode === 'tasks' ? '' : state.get('filter') || '';
const metricSort = { skills: 'installs', repos: 'stars' };
let sort = state.get('sort') === metricSort[mode] ? metricSort[mode] : 'relevance';
let boardMode = mode === 'repos' && sort === 'stars' ? 'repos' : 'skills';
let catalog = null;
let comparisons = [];
let loadFailed = false;
const pageSize = 9;
let shown = pageSize;
const words = {
  en: {
    pageTitle: 'Everything Skills — Find agent skills',
    heroTitle: 'Find the right agent skill',
    heroDescription: 'Search by task or skill name. Compare recommendations before you install.',
    activeSkills: 'current skills', repositories: 'indexed repositories',
    navSearch: 'Search', navRankings: 'Rankings', navExamples: 'Examples',
    navLabel: 'Main navigation', homeLabel: 'Everything Skills home', skipSearch: 'Skip to skill search', modeLabel: 'Catalog type',
    skillSearch: 'Search by task or skill ID', repoSearch: 'Search repositories by name or description',
    skillPlaceholder: 'Try create PowerPoint, review code diff, or a skill ID',
    repoPlaceholder: 'Try a product, topic, or owner/repo',
    searchAction: 'Search', volumeLabel: 'Volume', categoryLabel: 'Category', sortLabel: 'Sort',
    sortRelevance: 'Best match', sortStars: 'GitHub Stars', sortInstalls: 'Skills.sh installs',
    taskPicks: 'Task recommendations', rankingsLink: 'All comparisons →', firstChoice: 'First choice', alternative: 'Alternative',
    comparisons: 'Compare skills', comparisonSearch: 'Search task comparisons',
    comparisonPlaceholder: 'Try PowerPoint, API review, or a skill ID',
    comparisonNote: 'Compare reviewed skills for the same deliverable.',
    reviewedOn: 'Reviewed',
    browseSkills: 'Browse skills', browseRepos: 'Browse repositories', searchResults: 'Search results',
    leaderboard: 'Leaderboards', leaderboardNote: 'Ranked by recorded GitHub Stars. Dates show when each count was collected.',
    rankSkills: 'Skill installs', rankRepos: 'Repository Stars',
    fullInstallRanking: 'See all measured skills →', fullRanking: 'Browse all repositories by Stars →',
    noInstallRanking: 'No measured installs are available.', noRanking: 'No repository snapshots are available.',
    searchExternal: 'Search external repositories →', searchAllSkills: 'Search all skills →',
    starsUnknown: 'Stars unavailable', copyFailed: 'Copy the link from the address bar',
    close: 'Close', installLabelAria: 'Claude Code install commands',
    previewTask:"An empty Nix skill package.",allVolumes:'All volumes',allCategories:'All categories',skills:'Skills',repos:'Repositories',share:'Copy search link',loading:'Loading…',nativeLanguage:'Skill instructions keep their original language.',showMore:'Show more',examplesLabel:"BOUNDED TEACHING CASES",examplesTitle:"Explore three smaller teaching examples.",allExamples:'All example files ↗',exampleOneTitle:'Get oriented in a codebase',exampleOneBody:'A small repository, a map of its boundaries, and an onboarding report you can inspect.',exampleTwoTitle:'Read a paper with its sources',exampleTwoBody:'Follow the paper’s claims and bibliography, with explicit limits on what was checked.',exampleThreeTitle:'Review an API before delivery',exampleThreeBody:'Inspect a compact API fixture, trace concrete findings, and compare a revised design.',tryExample:'Explore the example →',installLabel:'TAKE WHAT YOU NEED',installTitle:"Start with two focused skills.",installBody:"Install the debugging and static-review pair for Codex, then supply your own repository and failure. Claude Code volume installation and other paths remain in the full guide.",installGuide:'Read the installation guide ↗',copyCommands:'Copy commands',footer:'A connected library, maintained in the open.',contribute:'Contribute',sources:'Sources & licenses',volumeInstall:'Install this volume',volumeInstallBody:'Run these commands inside Claude Code. For other agents, open the linked SKILL.md and check its runtime requirements.',copied:'Copied',empty:'No matches. Try a shorter task phrase or another filter.',openSkill:'Open skill ↗',openRepo:'Open repository ↗',installVolume:'Install volume',unreviewed:'Not reviewed',reviewed:'Reviewed metadata',indexedOnly:'External record',archivedUpstream:'Archived upstream',repoNote:'Historical-only and unavailable records remain in the full repository index.',loadError:'The catalog could not load. Reload this page or browse the Markdown catalog on GitHub.',retry:'Retry',volumeLabels:{'00-meta':'Reasoning & workflows','01-documents':'Documents & writing','02-engineering':'Engineering','03-data':'Data','04-ai':'AI','05-business':'Business','06-creative':'Creative','07-productivity':'Productivity','08-security':'Security','09-verticals':'Research & industries','10-platform':'Platforms'},categoryLabels:{official:'Official teams',collections:'Collections',vertical:'Domain collections',infra:'Infrastructure',other:'Other',unnamed:'Other repository layouts'},

    outcomeAfter:"exported paths after",caseLabel:"CHECK THE DELIVERABLE",caseTitle:"A result with a reproduction trail.",caseBody:"The scanner’s mirror heuristic hid this collection. An existing source override restored its path map. Inspect the fixed revisions, full inventory and static review.",casePatch:"Proposed upstream patch ↗",caseResult:"Measured result ↗",caseInventory:"Complete path map ↗",caseReview:"Static review ↗",caseReplay:"Replay, scope and limitations",caseLimits:"The first command verifies saved evidence offline; a fresh scanner/Nix replay needs the separate case setup. Counts include archived entries and a template. This maintainer case is not a user study or a model-success benchmark.",caseGuide:"Read the full reproduction guide ↗",caseFeedback:"Share a result from your own task ↗",
  },
  zh: {
    pageTitle: 'Everything Skills · 技能检索',
    heroTitle: '按任务找技能',
    heroDescription: '按任务或技能名搜索，比较同类技能，再选择如何安装。',
    activeSkills: '现行技能', repositories: '外部仓库记录',
    navSearch: '检索', navRankings: '热榜', navExamples: '案例',
    navLabel: '主导航', homeLabel: 'Everything Skills 首页', skipSearch: '跳到技能检索', modeLabel: '目录类型',
    skillSearch: '按任务或技能 ID 搜索', repoSearch: '按仓库名或描述搜索',
    skillPlaceholder: '试试做 PPT、静态代码评审，或输入技能 ID',
    repoPlaceholder: '输入产品、主题或 owner/repo',
    searchAction: '搜索', volumeLabel: '分卷', categoryLabel: '分类', sortLabel: '排序',
    sortRelevance: '相关度', sortStars: 'GitHub Stars', sortInstalls: 'Skills.sh 安装量',
    taskPicks: '按任务推荐', rankingsLink: '查看全部对比 →', firstChoice: '首选', alternative: '备选',
    comparisons: '同类对比', comparisonSearch: '搜索同类技能任务',
    comparisonPlaceholder: '试试做 PPT、接口评审，或输入技能 ID',
    comparisonNote: '按交付物比较已审阅的同类技能。',
    reviewedOn: '审阅于',
    browseSkills: '浏览技能', browseRepos: '浏览外部仓库', searchResults: '搜索结果',
    leaderboard: '发现榜单', leaderboardNote: '按 GitHub Stars 快照排序，日期为各仓库的采集时间。',
    rankSkills: '技能安装榜', rankRepos: '仓库 Stars 榜',
    fullInstallRanking: '查看全部有记录的技能 →', fullRanking: '按 Stars 浏览全部仓库 →',
    noInstallRanking: '暂无可展示的安装记录。', noRanking: '暂无可展示的仓库快照。',
    searchExternal: '试搜外部仓库 →', searchAllSkills: '在全部技能中搜索 →',
    starsUnknown: '暂无 Stars 数据', copyFailed: '请从地址栏复制链接',
    close: '关闭', installLabelAria: 'Claude Code 安装命令',
    previewTask:"Nix 为什么收录了一个空技能包？",allVolumes:'全部分卷',allCategories:'全部分类',skills:'技能',repos:'外部仓库',share:'复制搜索链接',loading:'正在加载…',nativeLanguage:'技能正文保留原始语言。',showMore:'加载更多',examplesLabel:"有边界的教学案例",examplesTitle:"再看三个更小的教学样例。",allExamples:'查看全部案例文件 ↗',exampleOneTitle:'接手一个陌生代码库',exampleOneBody:'从小型代码库出发，检查结构与边界，再对照具体的接手报告。',exampleTwoTitle:'带着来源读一篇论文',exampleTwoBody:'沿原文核对结论与书目，明确版本差异和已经检查的范围。',exampleThreeTitle:'在交付之前评审 API',exampleThreeBody:'检查一份精简接口样例，对照具体问题和修订后的设计。',tryExample:'打开这个案例 →',installLabel:'按需取用',installTitle:"先安装这两个技能。",installBody:"为 Codex 安装调试与静态审查组合，再提供自己的仓库和故障。Claude Code 分卷安装等其他路径保留在完整指南中。",installGuide:'查看安装步骤 ↗',copyCommands:'复制命令',footer:'用关系连接技能，开放维护。',contribute:'参与贡献',sources:'来源与许可',volumeInstall:'安装这个分卷',volumeInstallBody:'在 Claude Code 中运行以下命令。其他 Agent 请读取对应 SKILL.md，并核对其运行前提。',copied:'已复制',empty:'没有找到匹配项。试试更短的任务词，或更换筛选条件。',openSkill:'查看技能 ↗',openRepo:'打开仓库 ↗',installVolume:'安装此卷',unreviewed:'尚未审阅',reviewed:'元数据已审阅',indexedOnly:'外部目录',archivedUpstream:'上游已归档',repoNote:'历史停荐和不可访问记录保留在完整仓库索引中。',loadError:'目录加载失败。可刷新重试，或打开 GitHub 上的完整 Markdown 目录。',retry:'重试',volumeLabels:{'00-meta':'思考与工作流','01-documents':'文档与写作','02-engineering':'研发工程','03-data':'数据','04-ai':'人工智能','05-business':'商业','06-creative':'创意','07-productivity':'生产力','08-security':'安全','09-verticals':'科研与行业','10-platform':'平台集成'},categoryLabels:{official:'官方团队',collections:'精选合集',vertical:'垂直领域',infra:'基础设施',other:'其他',unnamed:'其他仓库布局'},
    outcomeAfter:"修复后导出路径",caseLabel:"检查交付物",caseTitle:"结果之外，还有复现证据。",caseBody:"镜像启发式规则隐藏了整份目录；使用已有的精确来源覆盖规则恢复路径表。固定版本、完整清单与静态审查都可检查。",casePatch:"查看上游修复提案 ↗",caseResult:"实测结果 ↗",caseInventory:"完整路径表 ↗",caseReview:"静态审查 ↗",caseReplay:"复跑方式、范围与限制",caseLimits:"第一条命令只离线核对保存结果；重跑扫描器和 Nix 需要案例中的独立环境。计数包含归档与模板。这是维护者真实案例，不是用户研究或模型成功率基准。",caseGuide:"阅读完整复现步骤 ↗",caseFeedback:"提交你自己的任务结果 ↗",

  }
};

const taskShortcuts = [
  { en: 'create powerpoint', zh: '做PPT' },
  { en: 'review rest api contract', zh: '评审REST接口' },
  { en: 'feature prd document', zh: '功能PRD' },
  { en: 'review code diff', zh: '静态代码评审' },
];

const w = () => words[lang];
const number = value => value.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en');
const element = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
};
const link = (text, url) => {
  const el = element('a', '', text);
  el.href = url;
  return el;
};

function catalogUrl({ query = '', kind = 'skills', filter = '', order = 'relevance', hash = '' } = {}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  if (kind !== 'skills') params.set('kind', kind);
  if (kind !== 'tasks' && filter) params.set('filter', filter);
  if (order === metricSort[kind]) params.set('sort', order);
  if (lang === 'zh') params.set('lang', 'zh');
  return location.pathname + (params.size ? '?' + params.toString() : '') + hash;
}

function updateUrl() {
  history.replaceState(null, '', catalogUrl({
    query: $('#query').value, kind: mode, filter: category, order: sort, hash: location.hash,
  }));
}

function filters() {
  const isComparison = mode === 'tasks';
  $('#catalog-filter').hidden = isComparison;
  $('#catalog-sort').hidden = isComparison;
  if (isComparison) {
    $('#query-label').textContent = w().comparisonSearch;
    $('#query').placeholder = w().comparisonPlaceholder;
    return;
  }
  const select = $('#volume');
  const isSkill = mode === 'skills';
  const groups = isSkill ? w().volumeLabels : w().categoryLabels;
  select.replaceChildren(new Option(isSkill ? w().allVolumes : w().allCategories, ''));
  for (const [key, label] of Object.entries(groups)) select.append(new Option(label, key));
  if (!Object.hasOwn(groups, category)) category = '';
  select.value = category;
  $('#filter-label').textContent = isSkill ? w().volumeLabel : w().categoryLabel;
  $('#query-label').textContent = isSkill ? w().skillSearch : w().repoSearch;
  $('#query').placeholder = isSkill ? w().skillPlaceholder : w().repoPlaceholder;
  const sorting = $('#sort');
  sorting.replaceChildren(new Option(w().sortRelevance, 'relevance'),
    new Option(isSkill ? w().sortInstalls : w().sortStars, metricSort[mode]));
  sorting.value = sort;
}

function renderTaskShortcuts() {
  $('#all-comparisons').href = catalogUrl({ kind: 'tasks', hash: '#catalog-results' });
  const choices = $('#task-shortcuts');
  choices.replaceChildren();
  if (catalog) {
    for (const shortcut of taskShortcuts) {
      const query = shortcut[lang];
      const pick = search(catalog.skills, query).find(row => row.recommendation?.rank === 1);
      if (!pick) continue;
      const item = element('li');
      const task = link(lang === 'zh' ? pick.recommendation.title : pick.recommendation.title_en,
        catalogUrl({ kind: 'tasks', query: pick.recommendation.task, hash: '#catalog-results' }));
      task.append(element('span', 'task-choice', `${w().firstChoice} · ${pick.name}`));
      item.append(task);
      choices.append(item);
    }
  }
  $('#task-start').hidden = !choices.childElementCount;
}

function installCoverage(count) {
  const date = catalog.installs_checked_at;
  return lang === 'zh'
    ? `覆盖 ${number(count)} / ${number(catalog.stats.active)} 个技能 · ${date}`
    : `${number(count)} of ${number(catalog.stats.active)} skills · ${date}`;
}

function renderLeaderboard() {
  const isSkill = boardMode === 'skills';
  for (const [id, active] of [['rank-skills', isSkill], ['rank-repos', !isSkill]]) {
    $('#' + id).setAttribute('aria-pressed', String(active));
  }
  const board = $('#leaderboard-list');
  const note = $('#leaderboard-note');
  board.replaceChildren();
  const items = catalog ? isSkill ? popularSkills(catalog.skills) : popularRepositories(catalog.repositories) : [];
  if (isSkill) {
    note.replaceChildren(link('Skills.sh', 'https://skills.sh/findscripter/everything-skills'),
      document.createTextNode(lang === 'zh' ? ' 安装记录' : ' install records'));
    if (catalog) note.append(element('span', '', installCoverage(items.length)));
  } else {
    note.textContent = w().leaderboardNote;
  }
  let previousCount;
  let rank;
  for (const [index, row] of items.slice(0, 5).entries()) {
    const count = isSkill ? row.installs : row.stars;
    if (count !== previousCount) rank = index + 1;
    previousCount = count;
    const item = element('li');
    item.value = rank;
    const position = element('span', 'rank-position', String(rank));
    const query = isSkill ? row.name : row.full_name;
    const entry = link(isSkill && lang === 'zh' ? row.title || row.name : query,
      catalogUrl({ kind: boardMode, query, hash: '#catalog-results' }));
    if (isSkill) entry.append(element('span', 'snapshot-date', w().volumeLabels[row.vol] || row.vol));
    const detail = element('span', 'leaderboard-detail');
    detail.append(element('strong', '', isSkill ? number(count) : `★ ${number(count)}`));
    if (!isSkill) {
      const date = element('time', 'snapshot-date', row.stars_checked_at);
      date.dateTime = row.stars_checked_at;
      detail.append(date);
    }
    item.append(position, entry, detail);
    board.append(item);
  }
  $('#leaderboard-status').hidden = board.childElementCount > 0;
  $('#leaderboard-status').textContent = loadFailed ? w().loadError
    : catalog ? isSkill ? w().noInstallRanking : w().noRanking : w().loading;
  const fullRanking = $('#full-ranking');
  fullRanking.textContent = isSkill ? w().fullInstallRanking : w().fullRanking;
  fullRanking.href = catalogUrl({ kind: boardMode, order: metricSort[boardMode], hash: '#catalog-results' });
  fullRanking.hidden = !items.length;
}

function translate() {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = w().pageTitle;
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const value = w()[el.dataset.i18n];
    if (typeof value === 'string') el.textContent = value;
  }
  $('#language').textContent = lang === 'zh' ? 'EN' : '中文';
  $('#language').setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换为中文');
  $('#main-nav').setAttribute('aria-label', w().navLabel);
  $('.wordmark').setAttribute('aria-label', w().homeLabel);
  $('.wordmark').href = catalogUrl();
  $('#api-review-guide').href = lang === 'zh' ? 'zh/guides/rest-api-review/' : 'guides/rest-api-review/';
  $('#catalog-modes').setAttribute('aria-label', w().modeLabel);
  $('.dialog-close').setAttribute('aria-label', w().close);
  $('#volume-command').setAttribute('aria-label', w().installLabelAria);
  filters();
  if (catalog) {
    $('#active-count').textContent = number(catalog.stats.active);
    $('#repo-count').textContent = number(catalog.stats.repositories);
    $('#outcome-before').textContent = number(catalog.outcome.before);
    $('#outcome-after').textContent = number(catalog.outcome.after);
    const { active, archived, templates, source } = catalog.outcome;
    $('#outcome-breakdown').textContent = lang === 'zh'
      ? `（${number(active)} 现行、${archived} 归档、${templates} 模板 · 固定源 ${source.slice(0, 7)}）`
      : ` (${number(active)} active, ${archived} archived, ${templates} template · source ${source.slice(0, 7)})`;
  }
  renderTaskShortcuts();
  renderLeaderboard();
  render();
}

const copyTimers = new WeakMap();
async function copy(text, button) {
  clearTimeout(copyTimers.get(button));
  let message;
  try {
    await navigator.clipboard.writeText(text);
    message = w().copied;
  } catch {
    message = w().copyFailed;
  }
  $('#copy-status').textContent = message;
  button.textContent = message;
  copyTimers.set(button, setTimeout(() => { button.textContent = w()[button.dataset.i18n]; }, 2600));
}

function card(row) {
  const isSkill = mode === 'skills';
  const article = element('article', 'skill-card');
  const top = element('div', 'card-top');
  const group = isSkill ? w().volumeLabels[row.vol] || row.vol : w().categoryLabels[row.section] || row.section;
  const status = isSkill
    ? row.review_status === 'reviewed' ? w().reviewed : w().unreviewed
    : row.upstream_state === 'archived' ? w().archivedUpstream : w().indexedOnly;
  top.append(element('span', 'volume-pill', group), element('span', 'review-label', status));
  article.append(top, element('h3', '', isSkill ? row.title || row.name : row.full_name));
  if (isSkill) {
    article.append(element('div', 'skill-name', row.name));
    if (sort === 'installs' && row.installs) article.append(element('div', 'repo-snapshot', lang === 'zh'
      ? `Skills.sh 记录 ${number(row.installs)} 次安装` : `Skills.sh installs: ${number(row.installs)}`));
  } else {
    const detail = row.stars == null ? w().starsUnknown : `★ ${number(row.stars)} GitHub Stars`;
    article.append(element('div', 'repo-snapshot', row.stars_checked_at ? `${detail} · ${row.stars_checked_at}` : detail));
  }
  const description = isSkill ? row.description : lang === 'zh' ? row.summary_zh || row.summary : row.summary;
  article.append(element('p', 'card-description', description || ''));
  if (isSkill && row.recommendation) {
    const pick = row.recommendation;
    const recommendation = element('p', 'task-recommendation');
    const heading = element('strong');
    heading.append(link(lang === 'zh' ? `${pick.title} · 推荐 #${pick.rank} →` : `${pick.title_en} · Pick #${pick.rank} →`,
      catalogUrl({ kind: 'tasks', query: pick.task, hash: '#catalog-results' })));
    recommendation.append(heading, document.createTextNode(lang === 'zh' ? pick.reason : pick.reason_en));
    article.append(recommendation);
  }
  const actions = element('div', 'card-actions');
  const url = isSkill ? githubPath(row.path) : `https://github.com/${row.full_name.split('/').map(encodeURIComponent).join('/')}`;
  actions.append(link(isSkill ? w().openSkill : w().openRepo, url));
  if (isSkill) {
    const install = element('button', 'install-button', w().installVolume);
    install.type = 'button';
    install.addEventListener('click', () => {
      $('#volume-command').value = commands(row.vol);
      $('#install-dialog').showModal();
    });
    actions.append(install);
  }
  article.append(actions);
  return article;
}

function comparisonCard(group) {
  const article = element('article', 'skill-card comparison-card');
  const date = element('time', '', group.reviewed_at);
  date.dateTime = group.reviewed_at;
  const reviewed = element('p', 'review-label', `${w().reviewedOn} `);
  reviewed.append(date);
  const entries = element('ol', 'comparison-entries');
  entries.setAttribute('role', 'list');
  for (const entry of group.entries) {
    const item = element('li');
    const heading = element('div', 'comparison-entry-heading');
    heading.append(element('span', entry.rank === 1 ? 'volume-pill first-choice' : 'volume-pill',
      entry.rank === 1 ? w().firstChoice : w().alternative), link(entry.name, githubPath(entry.path)));
    item.append(heading, element('p', '', lang === 'zh' ? entry.reason : entry.reason_en));
    entries.append(item);
  }
  const title = element('h3');
  title.append(link(lang === 'zh' ? group.title : group.title_en,
    catalogUrl({ kind: 'tasks', query: group.task, hash: '#catalog-results' })));
  article.append(title, reviewed, entries);
  return article;
}

function render() {
  for (const value of modes) $(`#${value}-mode`).setAttribute('aria-pressed', String(mode === value));
  const isComparison = mode === 'tasks';
  const query = $('#query').value.trim();
  $('#results-title').textContent = isComparison ? w().comparisons
    : query ? w().searchResults : mode === 'skills' ? w().browseSkills : w().browseRepos;
  $('#catalog-note').textContent = isComparison ? w().comparisonNote : mode === 'skills' ? w().nativeLanguage : w().leaderboardNote;
  const results = $('#results');
  results.classList.toggle('comparison-results', isComparison);
  if (!catalog) {
    $('#result-count').textContent = loadFailed ? w().loadError : w().loading;
    if (loadFailed) {
      const fallback = element('p', 'empty-state');
      const retry = element('button', 'button secondary', w().retry);
      retry.type = 'button';
      retry.addEventListener('click', load);
      const markdown = isComparison ? 'task-rankings.md' : mode === 'skills' ? 'catalog.md' : 'skill-repos.md';
      fallback.append(link(lang === 'zh' ? '打开 Markdown 目录 ↗' : 'Open the Markdown catalog ↗',
        `https://github.com/findscripter/everything-skills/blob/main/INDEX/${markdown}`), retry);
      results.replaceChildren(fallback);
    } else {
      results.replaceChildren();
    }
    $('#show-more').hidden = true;
    return;
  }
  const rows = mode === 'skills' ? catalog.skills : catalog.repositories;
  const found = isComparison ? searchComparisons(comparisons, query, lang) : search(rows, query, { category, mode, sort });
  if (sort === 'installs') $('#catalog-note').textContent = `${w().sortInstalls} · ${installCoverage(popularSkills(rows).length)}`;
  if (found.length) {
    results.replaceChildren(...found.slice(0, shown).map(isComparison ? comparisonCard : card));
  } else {
    const empty = element('p', 'empty-state', w().empty);
    if (isComparison || (mode === 'skills' && (query || sort === 'installs'))) {
      const allSkills = isComparison || sort === 'installs';
      const action = link(allSkills ? w().searchAllSkills : w().searchExternal,
        catalogUrl({ query, kind: allSkills ? 'skills' : 'repos', filter: allSkills ? category : '', hash: '#catalog-results' }));
      action.className = 'text-link';
      empty.append(action);
    }
    results.replaceChildren(empty);
  }
  const visible = number(Math.min(shown, found.length));
  const total = number(found.length);
  const noun = isComparison ? 'task' : 'match';
  $('#result-count').textContent = lang === 'zh'
    ? `${total} 个${isComparison ? '任务' : '匹配'} · 已显示 ${visible} 个`
    : `${total} ${noun}${found.length === 1 ? '' : isComparison ? 's' : 'es'} · ${visible} shown`;
  $('#show-more').hidden = found.length <= shown;
}

async function load() {
  loadFailed = false;
  renderLeaderboard();
  render();
  try {
    const response = await fetch('./catalog.json');
    if (!response.ok) throw new Error(`Catalog response ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.skills) || !Array.isArray(data.repositories) || !data.stats || !data.outcome
      || !/^\d{4}-\d{2}-\d{2}$/.test(data.installs_checked_at)) throw new Error('Invalid catalog');
    comparisons = taskComparisons(data.skills);
    catalog = data;
  } catch (error) {
    loadFailed = true;
    console.error('Catalog loading failed:', error.message);
  }
  translate();
}

function refreshResults() {
  shown = pageSize;
  render();
  updateUrl();
}

$('#query').value = state.get('q') || '';
$('#search-form').addEventListener('submit', event => {
  event.preventDefault();
  $('#results-title').focus();
});
$('#query').addEventListener('input', event => { if (!event.isComposing) refreshResults(); });
$('#query').addEventListener('compositionend', refreshResults);
$('#volume').addEventListener('change', () => { category = $('#volume').value; refreshResults(); });
$('#sort').addEventListener('change', () => { sort = $('#sort').value; refreshResults(); });
$('#language').addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; translate(); updateUrl(); });
for (const [id, value] of [['rank-skills', 'skills'], ['rank-repos', 'repos']]) {
  $('#' + id).addEventListener('click', () => { boardMode = value; renderLeaderboard(); });
}
for (const value of modes) {
  $(`#${value}-mode`).addEventListener('click', () => {
    if (mode === value) return;
    mode = value;
    category = '';
    sort = 'relevance';
    filters();
    refreshResults();
  });
}
$('#show-more').addEventListener('click', () => {
  const firstNew = shown;
  shown += pageSize;
  render();
  $('#results').children[firstNew]?.querySelector('a')?.focus();
});
$('#share').addEventListener('click', () => {
  const url = catalogUrl({ query: $('#query').value, kind: mode, filter: category, order: sort, hash: '#catalog-results' });
  copy(new URL(url, location.origin).href, $('#share'));
});
$('#copy-install').addEventListener('click', () => copy($('#default-install-command').textContent, $('#copy-install')));
$('#copy-volume').addEventListener('click', () => copy($('#volume-command').value, $('#copy-volume')));
translate();
load();
