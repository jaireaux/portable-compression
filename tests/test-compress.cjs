'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { builtinModules } = require('node:module');
const { execFileSync, spawnSync } = require('node:child_process');
const { gunzipSync, inflateRawSync } = require('node:zlib');

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

function parseZip(buffer) {
  const files = new Map();
  for (let offset = 0; offset + 30 <= buffer.length;) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) break;
    const flags = buffer.readUInt16LE(offset + 6);
    assert.equal(flags & 0x08, 0, 'ZIP data descriptors are not expected');
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const name = buffer.subarray(nameStart, nameStart + nameLength).toString('utf8');
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    assert.ok(method === 0 || method === 8, `Unexpected ZIP compression method: ${method}`);
    files.set(name, method === 8 ? inflateRawSync(compressed) : Buffer.from(compressed));
    offset = dataStart + compressedSize;
  }
  return files;
}

try {
  const helperSource = fs.readFileSync(helper, 'utf8');
  const dependencies = [...helperSource.matchAll(/require\((['"])(.*?)\1\)/g)].map((match) => match[2]);
  assert.ok(dependencies.every((dependency) => dependency.startsWith('node:') || builtinModules.includes(dependency)));
  assert.ok(dependencies.every((dependency) => !dependency.startsWith('.') && !dependency.includes('fflate')));
  assert.doesNotMatch(helperSource, /fflate\.js/);
  assert.match(helperSource, /fflate 0\.8\.2/);

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
  const zipFiles = parseZip(fs.readFileSync(zipPath));
  assert.equal(zipFiles.get('sample/alpha.txt').toString(), fs.readFileSync(path.join(input, 'alpha.txt'), 'utf8'));
  assert.equal(zipFiles.get('sample/nested/beta.txt').toString(), fs.readFileSync(path.join(input, 'nested', 'beta.txt'), 'utf8'));

  const secondZipPath = path.join(root, 'sample-second.zip');
  run('zip', secondZipPath);
  assert.deepEqual(fs.readFileSync(secondZipPath), fs.readFileSync(zipPath));

  const edtZipPath = path.join(root, 'sample-edt.zip');
  run('zip', edtZipPath, { ...process.env, TZ: 'America/New_York' });
  assert.deepEqual(fs.readFileSync(edtZipPath), fs.readFileSync(zipPath));

  const secondTgzPath = path.join(root, 'sample-second.tar.gz');
  run('tar.gz', secondTgzPath);
  assert.deepEqual(fs.readFileSync(secondTgzPath), fs.readFileSync(tgzPath));

  const edtTgzPath = path.join(root, 'sample-edt.tar.gz');
  run('tar.gz', edtTgzPath, { ...process.env, TZ: 'America/New_York' });
  assert.deepEqual(fs.readFileSync(edtTgzPath), fs.readFileSync(tgzPath));

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
