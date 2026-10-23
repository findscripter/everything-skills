#!/usr/bin/env node
// 在隔离快照中重建生成物，只读比较当前 checkout；检查永远不在源树运行写入器。
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv.find(value => value.startsWith('--lang='));
const lang = (arg ? arg.slice('--lang='.length) : process.env.SKILL_LANG || '').toLowerCase();
if (!['en', 'zh'].includes(lang)) {
  console.error('用法：node scripts/check-generated.mjs --lang=en|zh（也可设置 SKILL_LANG）');
  process.exit(2);
}

const generated = [
  'INDEX', '.claude-plugin/marketplace.json', 'AGENTS.md', 'CLAUDE.md',
  'GEMINI.md', 'gemini-extension.json', 'README.md', 'assets/brand',
];

function git(args) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', windowsHide: true, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `git exited ${result.status}`);
  return result.stdout;
}

async function listFiles(root, relative) {
  const target = path.join(root, relative);
  let stat;
  try { stat = await fs.stat(target); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  if (!stat.isDirectory()) return [relative];
  const nested = await Promise.all((await fs.readdir(target)).map(name => listFiles(root, path.join(relative, name))));
  return nested.flat();
}

async function contents(root, file) {
  try { return await fs.readFile(path.join(root, file)); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function check() {
  const temporaryDirectory = path.resolve(os.tmpdir());
  const snapshot = await fs.mkdtemp(path.join(temporaryDirectory, 'everything-skills-check-'));
  try {
    // Use the working copy, including new unignored source files and staged edits.
    // Git's inventory avoids vendor clones, ignored local data and .git internals.
    const inputs = new Set(git(['ls-files', '-z', '--cached', '--others', '--exclude-standard']).split('\0').filter(Boolean));
    for (const relative of inputs) {
      const source = path.resolve(ROOT, relative);
      if (!source.startsWith(ROOT + path.sep)) throw new Error(`快照路径超出仓库: ${relative}`);
      const destination = path.join(snapshot, relative);
      let stat;
      try { stat = await fs.stat(source); }
      catch (error) { if (error.code === 'ENOENT') continue; throw error; }
      if (!stat.isFile()) continue; // Gitlinks and nested checkouts are not input files.
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(source, destination); // Copy bytes; never retain source-tree symlinks.
    }
    const taxonomy = JSON.parse(await fs.readFile(path.join(snapshot, 'taxonomy.json'), 'utf8'));
    for (const volume of Object.keys(taxonomy.vols)) {
      try {
        if ((await fs.stat(path.join(ROOT, volume))).isDirectory())
          await fs.mkdir(path.join(snapshot, volume), { recursive: true });
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }

    const build = spawnSync(process.execPath, [path.join(snapshot, 'scripts/build-all.mjs'), `--lang=${lang}`], {
      cwd: snapshot, stdio: 'inherit', windowsHide: true,
    });
    if (build.error) throw build.error;
    if (build.status !== 0) return build.status ?? 1;

    const drift = [];
    for (const relative of generated) {
      const files = new Set([...(await listFiles(ROOT, relative)), ...(await listFiles(snapshot, relative))]);
      for (const file of files) {
        const [actual, expected] = await Promise.all([contents(ROOT, file), contents(snapshot, file)]);
        if (actual === null || expected === null || !actual.equals(expected)) drift.push(file.split(path.sep).join('/'));
      }
    }
    const status = git(['status', '--porcelain', '--untracked-files=all', '--', ...generated]).trim();
    if (drift.length || status) {
      console.error('\n生成物与当前源数据或提交内容不一致，请运行对应的 build 命令并提交这些文件：');
      if (drift.length) console.error([...new Set(drift)].sort().join('\n'));
      if (status) console.error(status);
      return 1;
    }
    console.log(`✓ 生成物校验通过（只读，lang=${lang}）。`);
    return 0;
  } finally {
    // Remove only the mkdtemp directory owned by this check.
    if (path.dirname(path.resolve(snapshot)) !== temporaryDirectory || !path.basename(snapshot).startsWith('everything-skills-check-'))
      throw new Error(`拒绝清理非预期快照目录: ${snapshot}`);
    await fs.rm(snapshot, { recursive: true, force: true });
  }
}

try { process.exitCode = await check(); }
catch (error) { console.error(`生成物校验失败: ${error.message}`); process.exitCode = 1; }
