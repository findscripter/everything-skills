#!/usr/bin/env node
// 共享的技能仓库 JSONL 加载器。
// build-skill-repos.mjs 与 refresh-readme-skill-repos-directory.mjs 必须使用
// 同一份排序、字段校验和去重策略，否则两个生成物会悄悄指向不同的数据集。

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const SKILL_REPO_SECTIONS = new Set(['official', 'collections', 'vertical', 'infra', 'other', 'unnamed']);
export const SKILL_REPO_STATUSES = new Set(['仅索引', '已采编', '本项目']);
export const SKILL_REPO_FIELDS = ['full_name', 'html_url', 'stars', 'summary', 'license', 'skill_count', 'status', 'section'];

const REVIEW_FIELDS = new Set(['summary', 'summary_zh', 'license', 'license_scope', 'skill_count', 'skill_count_basis', 'basis', 'representative_skill', 'public_skill_paths', 'evidence', 'license_evidence', 'readme_sha256']);
const HASH40 = /^[a-f0-9]{40}$/;

// Keep the original observation on disk. Only explicitly reviewed fields become
// the current display view; repository identity and popularity cannot be replaced.
export function repositoryView(repo) {
  const review = repo.current_review;
  if (review === undefined) return repo;
  const fail = message => { throw new Error(`${repo.full_name}: current_review ${message}`); };
  if (!review || review.schema_version !== 1 || !['reviewed', 'historical-only', 'closed-unavailable'].includes(review.status)) fail('schema/status 无效');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(review.reviewed_at || '') || Number.isNaN(Date.parse(review.reviewed_at))) fail('reviewed_at 无效');
  if (!review.fields || typeof review.fields !== 'object' || Array.isArray(review.fields)) fail('fields 须为对象');
  for (const field of Object.keys(review.fields)) if (!REVIEW_FIELDS.has(field)) fail(`不允许覆盖 ${field}`);
  for (const field of ['summary', 'summary_zh', 'license'])
    if (Object.hasOwn(review.fields, field) && (typeof review.fields[field] !== 'string' || !review.fields[field].trim())) fail(`${field} 须为非空字符串`);
  if (Object.hasOwn(review.fields, 'skill_count') && !(typeof review.fields.skill_count === 'string' && review.fields.skill_count.trim()) && !(Number.isSafeInteger(review.fields.skill_count) && review.fields.skill_count >= 0)) fail('skill_count 无效');
  if (Object.hasOwn(review.fields, 'public_skill_paths') && (!Array.isArray(review.fields.public_skill_paths) || review.fields.public_skill_paths.some(value => typeof value !== 'string' || !value.trim()))) fail('public_skill_paths 无效');
  if (review.status === 'closed-unavailable') {
    if (review.commit !== null || review.tree !== null || Object.keys(review.fields).length) fail('不可访问项不能虚构当前版本/字段');
    return { ...repo, recommendation: 'historical-only' };
  }
  if (!HASH40.test(review.commit || '') || !HASH40.test(review.tree || '') || review.commit === review.tree) fail('须有不同的完整 commit/tree');
  const recorded = Object.fromEntries([...REVIEW_FIELDS, 'source_commit_sha', 'source_tree_sha', 'last_reviewed'].filter(field => Object.hasOwn(repo, field)).map(field => [field, repo[field]]));
  return { ...repo, ...review.fields, recorded_snapshot: recorded, source_commit_sha: review.commit, source_tree_sha: review.tree, last_reviewed: review.reviewed_at,
    recommendation: review.status === 'historical-only' ? 'historical-only' : 'reviewed' };
}

export function upstreamStatus(repo, lang = 'en') {
  if (repo.current_review?.status === 'historical-only') return lang === 'zh' ? '仅历史来源' : 'historical source only';
  if (repo.current_review?.status === 'closed-unavailable') return lang === 'zh' ? '不可访问，保留历史' : 'unavailable; history preserved';
  const snapshot = repo.upstream_snapshot;
  if (!snapshot) return '';
  const labels = lang === 'zh'
    ? { active: '上游可访问', archived: '上游已归档', unavailable: '上游当前不可访问' }
    : { active: 'upstream accessible', archived: 'upstream archived', unavailable: 'upstream unavailable' };
  return labels[snapshot.state] || '';
}

function sortDataFiles(names) {
  return names
    .filter(name => name === 'skill-repos.jsonl' || /^skill-repos\.part\d+\.jsonl$/.test(name))
    .sort((a, b) => {
      const rank = name => name === 'skill-repos.jsonl' ? 0 : Number(name.match(/part(\d+)/)[1]) + 1;
      return rank(a) - rank(b);
    });
}

export async function loadSkillRepos(root = ROOT) {
  const DATA = path.join(root, 'data');
  const dataFiles = sortDataFiles(await fs.readdir(DATA));
  if (!dataFiles.includes('skill-repos.jsonl')) throw new Error('缺少 data/skill-repos.jsonl');

  const repos = [];
  const seen = new Map();
  const identities = new Map();
  for (const fileName of dataFiles) {
    const filePath = path.join(DATA, fileName);
    const raw = await fs.readFile(filePath, 'utf8');
    for (const [index, line] of raw.split(/\r?\n/).entries()) {
      const lineNo = index + 1;
      const text = line.trim();
      if (!text || text.startsWith('#')) continue;

      let obj;
      try {
        obj = JSON.parse(text);
      } catch {
        throw new Error(`${fileName}:${lineNo}: 非法 JSON`);
      }

      for (const field of SKILL_REPO_FIELDS) {
        if (obj[field] === undefined || obj[field] === null || (typeof obj[field] === 'string' && !obj[field].trim()))
          throw new Error(`${fileName}:${lineNo}: 缺少字段 "${field}"`);
      }
      if (typeof obj.full_name !== 'string' || !obj.full_name.includes('/'))
        throw new Error(`${fileName}:${lineNo}: full_name 须为 owner/repo 字符串`);
      if (typeof obj.html_url !== 'string' || !/^https?:\/\/[^\s]+$/i.test(obj.html_url))
        throw new Error(`${fileName}:${lineNo}: html_url 须为有效 HTTP(S) URL`);
      if (typeof obj.summary !== 'string' || !obj.summary.trim())
        throw new Error(`${fileName}:${lineNo}: summary 须为非空字符串`);
      if (!SKILL_REPO_SECTIONS.has(obj.section))
        throw new Error(`${fileName}:${lineNo}: 未知 section "${obj.section}"`);
      if (!SKILL_REPO_STATUSES.has(obj.status))
        throw new Error(`${fileName}:${lineNo}: 未知 status "${obj.status}"`);
      if (typeof obj.stars !== 'number' || !Number.isFinite(obj.stars))
        throw new Error(`${fileName}:${lineNo}: stars 须为数字`);

      const key = String(obj.full_name).toLowerCase();
      if (seen.has(key)) {
        const previous = seen.get(key);
        throw new Error(`${fileName}:${lineNo}: 重复 full_name "${obj.full_name}"（已在 ${previous.file}:${previous.line} 出现）`);
      }
      seen.set(key, { file: fileName, line: lineNo });
      if (obj.repository_id !== undefined && obj.repository_id !== null) {
        if (!Number.isSafeInteger(obj.repository_id) || obj.repository_id <= 0)
          throw new Error(`${fileName}:${lineNo}: repository_id 须为正安全整数`);
        if (identities.has(obj.repository_id)) {
          const previous = identities.get(obj.repository_id);
          throw new Error(`${fileName}:${lineNo}: 重复 repository_id ${obj.repository_id}（${obj.full_name} 与 ${previous.name}，已在 ${previous.file}:${previous.line} 出现）`);
        }
        identities.set(obj.repository_id, { file: fileName, line: lineNo, name: obj.full_name });
      }
      repos.push(repositoryView(obj));
    }
  }
  return repos;
}
