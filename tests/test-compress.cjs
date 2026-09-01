'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { gunzipSync, unzipSync } = require('../vendor/fflate/fflate.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'portable-compression-test-'));
const input = path.join(root, 'sample');
fs.mkdirSync(path.join(input, 'nested'), { recursive: true });
fs.writeFileSync(path.join(input, 'alpha.txt'), 'alpha beta gamma\n'.repeat(200));
fs.writeFileSync(path.join(input, 'nested', 'beta.txt'), 'alpha beta delta\n'.repeat(200));

const helper = path.resolve(__dirname, '../scripts/compress.cjs');

function run(format, output, env = process.env) {
  const stdout = execFileSync(process.execPath, [helper, '--format', format, '--output', output, '--input', input], { encoding: 'utf8', env });
  return JSON.parse(stdout);
}

function parseTar(buffer) {
  const files = new Map();
  for (let offset = 0; offset + 512 <= buffer.length;) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = Buffer.from(header.subarray(0, 100)).toString('utf8').replace(/\0.*$/, '');
    const sizeText = Buffer.from(header.subarray(124, 136)).toString('ascii').replace(/\0.*$/, '').trim();
    const size = parseInt(sizeText || '0', 8);
    const type = header[156];
    offset += 512;
    if (type === 0x30) files.set(name, Buffer.from(buffer.subarray(offset, offset + size)));
    offset += Math.ceil(size / 512) * 512;
  }
  return files;
}

try {
  const tgzPath = path.join(root, 'sample.tar.gz');
  const tgzResult = run('tar.gz', tgzPath);
  assert.equal(tgzResult.ok, true);
  assert.equal(tgzResult.file_count, 2);
  const tarFiles = parseTar(Buffer.from(gunzipSync(new Uint8Array(fs.readFileSync(tgzPath)))));
  assert.equal(tarFiles.get('sample/alpha.txt').toString(), fs.readFileSync(path.join(input, 'alpha.txt'), 'utf8'));
  assert.equal(tarFiles.get('sample/nested/beta.txt').toString(), fs.readFileSync(path.join(input, 'nested', 'beta.txt'), 'utf8'));

  const zipPath = path.join(root, 'sample.zip');
  const zipResult = run('zip', zipPath);
  assert.equal(zipResult.ok, true);
  assert.equal(zipResult.file_count, 2);
  const zipFiles = unzipSync(new Uint8Array(fs.readFileSync(zipPath)));
  assert.equal(Buffer.from(zipFiles['sample/alpha.txt']).toString(), fs.readFileSync(path.join(input, 'alpha.txt'), 'utf8'));
  assert.equal(Buffer.from(zipFiles['sample/nested/beta.txt']).toString(), fs.readFileSync(path.join(input, 'nested', 'beta.txt'), 'utf8'));

  const secondZipPath = path.join(root, 'sample-second.zip');
  run('zip', secondZipPath);
  assert.deepEqual(fs.readFileSync(secondZipPath), fs.readFileSync(zipPath));

  const edtZipPath = path.join(root, 'sample-edt.zip');
  run('zip', edtZipPath, { ...process.env, TZ: 'America/New_York' });
  assert.deepEqual(fs.readFileSync(edtZipPath), fs.readFileSync(zipPath));

  const secondTgzPath = path.join(root, 'sample-second.tar.gz');
  run('tar.gz', secondTgzPath);
  assert.deepEqual(fs.readFileSync(secondTgzPath), fs.readFileSync(tgzPath));

  const overwrite = spawnSync(process.execPath, [helper, '--format', 'zip', '--output', zipPath, '--input', input], { encoding: 'utf8' });
  assert.notEqual(overwrite.status, 0);
  assert.match(overwrite.stderr, /already exists/);

  if (process.platform !== 'win32') {
    const linkPath = path.join(input, 'unsafe-link');
    fs.symlinkSync(path.join(input, 'alpha.txt'), linkPath);
    const rejected = spawnSync(process.execPath, [helper, '--format', 'tar.gz', '--output', path.join(root, 'unsafe.tar.gz'), '--input', input], { encoding: 'utf8' });
    assert.notEqual(rejected.status, 0);
    assert.match(rejected.stderr, /Symbolic links are not supported/);
  }

  process.stdout.write('portable-compression: all tests passed\n');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
