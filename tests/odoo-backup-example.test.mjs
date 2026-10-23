import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const bash = process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : '/bin/bash';
const available = fs.existsSync(bash);
const source = fs.readFileSync(path.join(ROOT, '09-verticals/odoo-backup-strategy/SKILL.md'), 'utf8');
const example = source.match(/```bash\r?\n(#!\/bin\/bash\r?\n# backup_odoo\.sh[\s\S]*?)```/)[1];

for (const failure of ['stop', 'pg_dump', 'pg_restore']) {
  test(`Odoo example preserves backups and resumes service after ${failure} failure`, { skip: !available }, t => {
    const parent = path.resolve(os.tmpdir());
    const root = fs.mkdtempSync(path.join(parent, 'everything-odoo-failure-'));
    t.after(() => {
      assert.equal(path.dirname(path.resolve(root)), parent);
      assert.match(path.basename(root), /^everything-odoo-failure-/);
      fs.rmSync(root, { recursive: true, force: true });
    });
    const backups = path.join(root, 'backups');
    fs.mkdirSync(backups);
    fs.writeFileSync(path.join(backups, 'previous-good-backup'), 'Must remain intact.\n');
    const trace = path.join(root, 'trace');
    const wrapped = `
# Mock every service, database, archive, checksum and publish command. Only the
# example's mkdir/mktemp write real files, under this test-owned directory.
docker() { printf 'docker %s\\n' "$*" >> "$AUDIT_TRACE"; if [[ "$*" == 'compose stop odoo' && "$AUDIT_FAIL" == stop ]]; then return 41; fi; }
pg_dump() { printf 'pg_dump\\n' >> "$AUDIT_TRACE"; if [[ "$AUDIT_FAIL" == pg_dump ]]; then return 42; fi; }
pg_restore() { printf 'pg_restore\\n' >> "$AUDIT_TRACE"; if [[ "$AUDIT_FAIL" == pg_restore ]]; then return 43; fi; }
tar() { printf 'tar\\n' >> "$AUDIT_TRACE"; }
sha256sum() { printf 'sha256sum\\n' >> "$AUDIT_TRACE"; }
mv() { printf 'mv\\n' >> "$AUDIT_TRACE"; }
${example.replace('BACKUP_DIR="/backups/odoo"', 'BACKUP_DIR="$AUDIT_BACKUPS"')}
`;
    assert.ok(wrapped.includes('BACKUP_DIR="$AUDIT_BACKUPS"'));
    const result = spawnSync(bash, ['--noprofile', '--norc', '-c', wrapped], {
      cwd: root, encoding: 'utf8', windowsHide: true,
      env: { ...process.env, AUDIT_TRACE: trace.replaceAll('\\', '/'), AUDIT_BACKUPS: backups.replaceAll('\\', '/'), AUDIT_FAIL: failure },
    });
    if (result.error) throw result.error;
    assert.equal(result.status, failure === 'stop' ? 41 : failure === 'pg_dump' ? 42 : 43, result.stderr);
    const calls = fs.readFileSync(trace, 'utf8');
    assert.match(calls, /docker compose start odoo/);
    assert.doesNotMatch(calls, /\bmv\b|sha256sum/);
    if (failure === 'stop') assert.doesNotMatch(calls, /pg_dump/);
    if (failure === 'pg_dump') assert.doesNotMatch(calls, /\btar\b/);
    assert.doesNotMatch(result.stdout, /备份完成/);
    assert.equal(fs.readFileSync(path.join(backups, 'previous-good-backup'), 'utf8'), 'Must remain intact.\n');
  });
}
