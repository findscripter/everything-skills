#!/usr/bin/env node
// 在干净 checkout 中重建全部索引并确保生成物已提交。

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv.find(value => value.startsWith('--lang='));
const lang = (arg ? arg.slice('--lang='.length) : process.env.SKILL_LANG || '').toLowerCase();
if (!['en', 'zh'].includes(lang)) {
  console.error('用法：node scripts/check-generated.mjs --lang=en|zh（也可设置 SKILL_LANG）');
  process.exit(2);
}

const build = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build-all.mjs'), `--lang=${lang}`], {
  cwd: ROOT,
  stdio: 'inherit',
  windowsHide: true,
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

const generated = [
  'INDEX',
  '.claude-plugin/marketplace.json',
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'gemini-extension.json',
  'README.md',
  'assets/brand',
];
const status = spawnSync('git', ['status', '--porcelain', '--untracked-files=all', '--', ...generated], {
  cwd: ROOT,
  encoding: 'utf8',
  windowsHide: true,
});
if (status.error) throw status.error;
if (status.status !== 0) process.exit(status.status ?? 1);
if (status.stdout.trim()) {
  console.error('\n生成物与提交内容不一致，请先运行对应的 build 命令并提交这些文件：');
  console.error(status.stdout.trim());
  process.exit(1);
}
console.log(`✓ 生成物校验通过（lang=${lang}）。`);
