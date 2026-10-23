#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const volumes = '(?:00-meta|01-documents|02-engineering|03-data|04-ai|05-business|06-creative|07-productivity|08-security|09-verticals|10-platform)';
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const skillPathPattern = new RegExp(`^${volumes}/[a-z0-9]+(?:-[a-z0-9]+)*$`);
const resolutions = new Set(['bundle', 'inline', 'native-rewrite']);

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function isRelativePath(value) {
  return typeof value === 'string' && value.length > 0 &&
    !/[\\\u0000-\u001f:?#]/.test(value) && !path.posix.isAbsolute(value) &&
    value.split('/').every(part => part !== '' && part !== '.' && part !== '..') &&
    path.posix.normalize(value) === value;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isUpstreamPath(value) {
  // Encoded separators or dot segments can change what a server resolves.
  return isRelativePath(value) && !/[%\s]/.test(value);
}

/** Read metadata and hash resource bytes only. Never import or execute a skill. */
export function checkSkillAssets(root) {
  const errors = [];
  const fail = (code, message) => errors.push({ code, message });
  let realRoot;
  let manifest;
  const manifestPath = path.resolve(root, 'data/skill-resources.json');
  try {
    realRoot = fs.realpathSync(root);
    if (!isWithin(realRoot, fs.realpathSync(manifestPath))) {
      fail('ASSET_SCOPE', 'resource manifest resolves outside the workspace');
      return { errors, skillCount: 0, resourceCount: 0 };
    }
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail('ASSET_SCHEMA', `cannot read resource manifest: ${error.message}`);
    return { errors, skillCount: 0, resourceCount: 0 };
  }
  if (!isObject(manifest) || manifest.schema_version !== 1 || !Array.isArray(manifest.skills)) {
    fail('ASSET_SCHEMA', 'expected schema_version 1 and a skills array');
    return { errors, skillCount: 0, resourceCount: 0 };
  }

  const names = new Set();
  const skillPaths = new Set();
  const resourcePaths = new Set();
  let resourceCount = 0;
  for (const entry of manifest.skills) {
    if (!isObject(entry) || typeof entry.name !== 'string' || !slug.test(entry.name) ||
        !isRelativePath(entry.skill_path) || !skillPathPattern.test(entry.skill_path) ||
        path.posix.basename(entry.skill_path) !== entry.name ||
        !resolutions.has(entry.resolution) || !Array.isArray(entry.resources)) {
      fail('ASSET_SCHEMA', 'each skill needs a matching slug/path, supported resolution and resources array');
      continue;
    }
    const nameKey = entry.name.toLowerCase();
    const skillKey = entry.skill_path.toLowerCase();
    if (names.has(nameKey) || skillPaths.has(skillKey)) fail('ASSET_DUPLICATE', `duplicate skill: ${entry.name}`);
    names.add(nameKey);
    skillPaths.add(skillKey);
    if (entry.resolution === 'bundle' && entry.resources.length === 0) {
      fail('ASSET_SCHEMA', `${entry.name}: bundle resolution requires at least one declared resource`);
    }

    const absoluteSkill = path.resolve(root, entry.skill_path);
    let realSkill;
    try {
      realSkill = fs.realpathSync(absoluteSkill);
      const declaredSkill = path.resolve(realRoot, entry.skill_path);
      if (!isWithin(realRoot, realSkill) || path.relative(declaredSkill, realSkill) !== '') {
        fail('ASSET_SCOPE', `${entry.name}: skill directory resolves outside its declared location`);
        continue;
      }
      const bodyPath = path.join(absoluteSkill, 'SKILL.md');
      const realBody = fs.realpathSync(bodyPath);
      if (!isWithin(realSkill, realBody)) {
        fail('ASSET_SCOPE', `${entry.name}: SKILL.md resolves outside its skill`);
        continue;
      }
      if (!fs.statSync(realBody).isFile()) throw new Error('SKILL.md is not a regular file');
      const body = fs.readFileSync(realBody, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim();
      if (!body) throw new Error('SKILL.md has no body');
    } catch (error) {
      fail('ASSET_SKILL', `${entry.name}: cannot read skill body: ${error.message}`);
      continue;
    }

    let sourceBase = null;
    if (entry.resolution === 'native-rewrite' && entry.source === null && entry.resources.length === 0) {
      // Native instructions without third-party files have no upstream resource snapshot.
    } else if (!isObject(entry.source) ||
        !/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(entry.source.repository ?? '') ||
        !/^[a-f0-9]{40}$/.test(entry.source.commit ?? '') ||
        !isUpstreamPath(entry.source.path)) {
      fail('ASSET_SOURCE', `${entry.name}: source requires a repository, immutable commit and relative path`);
    } else {
      sourceBase = `https://github.com/${entry.source.repository}/blob/${entry.source.commit}/`;
      if (entry.source.url !== `${sourceBase}${entry.source.path}/SKILL.md`) {
        fail('ASSET_SOURCE', `${entry.name}: source URL does not match its repository, commit and skill path`);
      }
    }

    const declared = new Map();
    for (const resource of entry.resources) {
      if (isObject(resource) && typeof resource.path === 'string') declared.set(resource.path, resource);
    }
    for (const resource of entry.resources) {
      resourceCount++;
      if (!isObject(resource) || !isRelativePath(resource.path)) {
        fail('ASSET_PATH', `${entry.name}: resource path must be a normalized relative POSIX path`);
        continue;
      }
      const key = resource.path.toLowerCase();
      if (resourcePaths.has(key)) fail('ASSET_DUPLICATE', `duplicate resource path: ${resource.path}`);
      resourcePaths.add(key);
      if (!resource.path.startsWith(`${entry.skill_path}/`)) {
        fail('ASSET_SCOPE', `${resource.path}: resource must remain in its declared skill`);
        continue;
      }
      const absoluteResource = path.resolve(root, resource.path);
      try {
        const realResource = fs.realpathSync(absoluteResource);
        if (!isWithin(realSkill, realResource)) {
          fail('ASSET_SCOPE', `${resource.path}: resource resolves outside its declared skill`);
          continue;
        }
        if (!fs.statSync(realResource).isFile()) throw new Error('resource is not a regular file');
        const actualHash = createHash('sha256').update(fs.readFileSync(realResource)).digest('hex');
        if (!/^[a-f0-9]{64}$/.test(resource.sha256 ?? '') || resource.sha256 !== actualHash) {
          fail('ASSET_HASH', `${resource.path}: SHA-256 does not match the resource bytes`);
        }
      } catch (error) {
        fail('ASSET_MISSING', `${resource.path}: cannot read resource: ${error.message}`);
      }
      if (!sourceBase || typeof resource.source_url !== 'string' || !resource.source_url.startsWith(sourceBase) ||
          !isUpstreamPath(resource.source_url.slice(sourceBase.length))) {
        fail('ASSET_SOURCE', `${resource.path}: resource source URL must use the declared immutable repository snapshot`);
      }

      if (!isRelativePath(resource.license_path)) {
        fail('ASSET_PATH', `${resource.path}: license_path must be a normalized relative POSIX path`);
        continue;
      }
      if (!resource.license_path.startsWith(`${entry.skill_path}/`)) {
        fail('ASSET_SCOPE', `${resource.path}: license must remain in the same declared skill`);
        continue;
      }
      const license = declared.get(resource.license_path);
      if (typeof resource.license !== 'string' || !resource.license.trim() ||
          !license || license.license !== resource.license) {
        fail('ASSET_LICENSE', `${resource.path}: license file must be declared with the same license identifier`);
      }
      try {
        const realLicense = fs.realpathSync(path.resolve(root, resource.license_path));
        if (!isWithin(realSkill, realLicense)) {
          fail('ASSET_SCOPE', `${resource.path}: license resolves outside the declared skill`);
        } else if (!fs.statSync(realLicense).isFile() || fs.statSync(realLicense).size === 0) {
          fail('ASSET_LICENSE', `${resource.path}: license must be a nonempty regular file`);
        }
      } catch (error) {
        fail('ASSET_LICENSE', `${resource.path}: cannot read declared license: ${error.message}`);
      }
    }
  }
  return { errors, skillCount: manifest.skills.length, resourceCount };
}

function main() {
  const args = process.argv.slice(2);
  let root = path.resolve(import.meta.dirname, '..');
  if (args.length) {
    if (args.length !== 2 || args[0] !== '--root') {
      console.error('Usage: node scripts/check-skill-assets.mjs [--root <workspace>]');
      process.exitCode = 2;
      return;
    }
    root = path.resolve(args[1]);
  }
  const result = checkSkillAssets(root);
  for (const error of result.errors) console.error(`[${error.code}] ${error.message}`);
  if (result.errors.length) {
    process.exitCode = 1;
    return;
  }
  console.log(`Skill assets verified: ${result.skillCount} skills, ${result.resourceCount} resources (bytes and metadata only).`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) main();
