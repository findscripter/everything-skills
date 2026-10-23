#!/usr/bin/env node
import { argumentsFor, loadManifest, scanSkills, refreshManifest, writeManifest } from './skill-provenance.mjs';

try {
  const { root, write } = argumentsFor(process.argv.slice(2), { writable: true });
  if (!write) {
    console.error('用法：node scripts/refresh-skill-provenance.mjs [--root PATH] --write；仅显式 --write 才更新本地清单。');
    process.exitCode = 2;
  } else {
    const manifest = await loadManifest(root); // Refuse malformed or missing input before scanning/writing.
    const actual = await scanSkills(root);
    await writeManifest(root, refreshManifest(manifest, actual));
    console.log(`✓ 本地 provenance 清单已更新：${actual.length} 个技能；未访问网络，原采编版本仍保持未记录。`);
  }
} catch (error) {
  console.error(`provenance 刷新失败: ${error.message}`);
  process.exitCode = 1;
}
