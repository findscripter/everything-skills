#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from '../scripts/everything-skills.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try { process.exitCode = await main(['--root', root, ...process.argv.slice(2)]); }
catch (error) { console.error(`错误: ${error.message}`); process.exitCode = 1; }
