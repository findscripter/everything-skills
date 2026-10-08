#!/usr/bin/env node
// 统一生成入口：所有调用方必须显式选择语言，避免 main/zh 的默认参数漂移。

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv.find(value => value.startsWith('--lang='));
const lang = (arg ? arg.slice('--lang='.length) : process.env.SKILL_LANG || '').toLowerCase();

if (!['en', 'zh'].includes(lang)) {
  console.error('用法：node scripts/build-all.mjs --lang=en|zh（也可设置 SKILL_LANG）');
  process.exit(2);
}

const steps = [
  ['build-index.mjs', `--lang=${lang}`],
  ['build-skill-repos.mjs', `--lang=${lang}`],
  ['refresh-readme-skill-repos-directory.mjs', `--lang=${lang}`],
  ['build-brand.mjs', `--lang=${lang}`],
];

for (const [script, ...args] of steps) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), ...args], {
    cwd: ROOT,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
