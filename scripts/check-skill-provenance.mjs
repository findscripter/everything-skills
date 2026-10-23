#!/usr/bin/env node
import { argumentsFor, loadManifest, scanSkills, compareManifest } from './skill-provenance.mjs';

try {
  const { root } = argumentsFor(process.argv.slice(2));
  const manifest = await loadManifest(root);
  const actual = await scanSkills(root);
  compareManifest(manifest, actual);
  console.log(`✓ provenance 清单校验通过：${actual.length} 个实际技能；只读检查，reference 不代表 origin。`);
} catch (error) {
  console.error(`provenance 校验失败: ${error.message}`);
  process.exitCode = 1;
}
