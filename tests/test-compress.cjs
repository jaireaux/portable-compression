'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { builtinModules } = require('node:module');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { execFileSync, spawnSync } = require('node:child_process');
const { gzipSync, gunzipSync, inflateRawSync } = require('node:zlib');

const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'portable-compression-test-'));
const input = path.join(root, 'sample');
fs.mkdirSync(path.join(input, 'nested'), { recursive: true });
fs.writeFileSync(path.join(input, 'alpha.txt'), 'alpha beta gamma\n'.repeat(200));
fs.writeFileSync(path.join(input, 'nested', 'beta.txt'), 'alpha beta delta\n'.repeat(200));

const helper = path.resolve(__dirname, '../scripts/compress.cjs');

function run(format, output, env = process.env) {
  const stdout = execFileSync(process.execPath, [helper, '--format', format, '--output', output, '--input', input], { encoding: 'utf8', env });
  return JSON.parse(stdout);
}

function invoke(args, executable = helper, env = process.env) {
  return spawnSync(process.execPath, [executable, ...args], { encoding: 'utf8', env });
}

function argsFor(format, output, inputs = [input]) {
  return ['--format', format, '--output', output, ...inputs.flatMap((file) => ['--input', file])];
}

function extractArgs(format, archive, output, collision) {
  return ['--operation', 'extract', '--format', format, '--output', output, '--input', archive,
    ...(collision ? ['--collision', collision] : [])];
}

function expectFailure(args, message) {
  const result = invoke(args);
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, '');
  const error = JSON.parse(result.stderr);
  assert.equal(error.ok, false);
  assert.match(error.error, message);
}

function verifyReport(result, output, count = 2) {
  assert.deepEqual(Object.keys(result).sort(), ['ok', 'format', 'output', 'input_bytes', 'archive_bytes', 'file_count', 'sha256'].sort());
  assert.equal(result.ok, true);
  assert.equal(result.output, output);
  assert.equal(result.file_count, count);
  const bytes = fs.readFileSync(output);
  assert.equal(result.archive_bytes, bytes.length);
  assert.equal(result.sha256, crypto.createHash('sha256').update(bytes).digest('hex'));
  assert.equal(result.input_bytes, 6800);
}

// Fault injection stays inside this test process; there are no test hooks in
// the shipped CLI and no extra runtime files/packages available to the helper.
function faultRun(args, overrides, source = fs.readFileSync(helper, 'utf8')) {
  const sandboxFs = Object.assign(Object.create(fs), overrides);
  let stdout = '';
  let stderr = '';
  const testProcess = {
    argv: [process.execPath, helper, ...args], pid: process.pid,
    stdout: { write: (value) => { stdout += value; } },
    stderr: { write: (value) => { stderr += value; } },
  };
  vm.runInNewContext(source, {
    Buffer, process: testProcess,
    require: (name) => {
      assert.ok(['node:fs', 'node:path', 'node:crypto', 'worker_threads'].includes(name));
      return name === 'node:fs' ? sandboxFs : require(name);
    },
  });
  assert.equal(testProcess.exitCode, 1);
  assert.equal(stdout, '');
  const error = JSON.parse(stderr);
  assert.equal(error.ok, false);
  return error.error;
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

  const skillSource = fs.readFileSync(path.resolve(__dirname, '../skills/compress-files/SKILL.md'), 'utf8');
  assert.match(skillSource, /codex --approve-for-me/);
  assert.match(skillSource, /keeps the workspace-write sandbox/);
  assert.match(skillSource, /do not use or recommend `--dangerously-bypass-approvals-and-sandbox`/);
  assert.match(skillSource, /host setting, not plugin behavior/);
  assert.match(skillSource, /directory containing this exact `SKILL\.md` file \(`skills\/compress-files`\), not from its parent `skills` directory/);
  assert.match(skillSource, /Reporting the helper JSON alone is incomplete when `status` is `decision_required`/);
  assert.match(skillSource, /repeat the returned `prompt` verbatim as the final line/);
  assert.match(skillSource, /The expected prompt is: \*\*Collision found: \(o\)verwrite, \(k\)eep both, or \(c\)ancel\?\*\*/);
  assert.match(skillSource, /Stop and wait for the user's explicit choice/);
  assert.match(skillSource, /never finish that turn with the JSON alone/);

  // Copy just one JS file into an otherwise empty package and remove PATH.
  // Both formats must create and verify their output in one process.
  const standalone = path.join(root, 'standalone');
  fs.mkdirSync(standalone);
  const standaloneHelper = path.join(standalone, 'compress.cjs');
  fs.copyFileSync(helper, standaloneHelper);
  for (const format of ['zip', 'tar.gz']) {
    const base = path.join(root, `single-${format}`);
    fs.mkdirSync(base);
    const output = path.join(base, 'outputs', `archive.${format}`);
    const result = invoke(argsFor(format, output), standaloneHelper, { ...process.env, PATH: '', NODE_PATH: '' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    const report = JSON.parse(result.stdout);
    verifyReport(report, output);
    const repeat = path.join(base, 'outputs', `repeat.${format}`);
    const repeatResult = invoke(argsFor(format, repeat), standaloneHelper, { ...process.env, PATH: '', NODE_PATH: '' });
    assert.equal(repeatResult.status, 0, repeatResult.stderr);
    assert.deepEqual(fs.readFileSync(output), fs.readFileSync(repeat));
    const extractionOutput = path.join(base, `extracted-${format}`);
    const extractionResult = invoke(extractArgs(format, output, extractionOutput), standaloneHelper, { ...process.env, PATH: '', NODE_PATH: '' });
    assert.equal(extractionResult.status, 0, extractionResult.stderr);
    const extractionReport = JSON.parse(extractionResult.stdout);
    assert.equal(extractionReport.ok, true);
    assert.equal(extractionReport.operation, 'extract');
    assert.equal(fs.readFileSync(path.join(extractionOutput, 'sample', 'alpha.txt'), 'utf8'), fs.readFileSync(path.join(input, 'alpha.txt'), 'utf8'));
    assert.deepEqual(fs.readdirSync(standalone), ['compress.cjs']);
    assert.ok(fs.readdirSync(path.dirname(output)).every((name) => !name.includes('.tmp-')));
  }

  // Execute the actual documented shell command with a supplied runtime,
  // including spaces in the runtime path and no executable utilities on PATH.
  if (process.platform !== 'win32') {
    const skill = fs.readFileSync(path.resolve(__dirname, '../skills/compress-files/SKILL.md'), 'utf8');
    const command = skill.match(/```sh\n([\s\S]*?)\n```/)[1];
    const shellBase = path.join(root, 'documented');
    fs.mkdirSync(shellBase);
    const runtimeLink = path.join(root, 'bundled node');
    fs.symlinkSync(process.execPath, runtimeLink);
    const output = path.join(shellBase, 'outputs', 'archive.tar.gz');
    const executableCommand = command
      .replace('<directory-containing-this-SKILL.md>/../../scripts/compress.cjs', standaloneHelper)
      .replace('/absolute/path/to/outputs/archive.tar.gz', JSON.stringify(output))
      .replace('/absolute/path/to/file-or-directory', JSON.stringify(input));
    const shellResult = spawnSync('/bin/sh', ['-c', executableCommand], {
      encoding: 'utf8', env: { ...process.env, CODEX_PRIMARY_RUNTIME_NODE: runtimeLink, PATH: '', NODE_PATH: '' },
    });
    assert.equal(shellResult.status, 0, shellResult.stderr);
    verifyReport(JSON.parse(shellResult.stdout), output);
    const fallbackEnv = { ...process.env, PATH: path.dirname(process.execPath) };
    delete fallbackEnv.CODEX_PRIMARY_RUNTIME_NODE;
    const fallbackOutput = path.join(shellBase, 'outputs', 'fallback.tar.gz');
    const fallback = spawnSync('/bin/sh', ['-c', executableCommand.replace(JSON.stringify(output), JSON.stringify(fallbackOutput))], { encoding: 'utf8', env: fallbackEnv });
    assert.equal(fallback.status, 0, fallback.stderr);
    verifyReport(JSON.parse(fallback.stdout), fallbackOutput);
  }

  const tgzPath = path.join(root, 'sample.tar.gz');
  const tgzResult = run('tar.gz', tgzPath);
  assert.equal(tgzResult.ok, true);
  assert.equal(tgzResult.file_count, 2);
  verifyReport(tgzResult, tgzPath);
  const tarFiles = parseTar(Buffer.from(gunzipSync(new Uint8Array(fs.readFileSync(tgzPath)))));
  assert.equal(tarFiles.get('sample/alpha.txt').toString(), fs.readFileSync(path.join(input, 'alpha.txt'), 'utf8'));
  assert.equal(tarFiles.get('sample/nested/beta.txt').toString(), fs.readFileSync(path.join(input, 'nested', 'beta.txt'), 'utf8'));

  const zipPath = path.join(root, 'sample.zip');
  const zipResult = run('zip', zipPath);
  assert.equal(zipResult.ok, true);
  assert.equal(zipResult.file_count, 2);
  verifyReport(zipResult, zipPath);
  const zipFiles = parseZip(fs.readFileSync(zipPath));
  assert.equal(zipFiles.get('sample/alpha.txt').toString(), fs.readFileSync(path.join(input, 'alpha.txt'), 'utf8'));
  assert.equal(zipFiles.get('sample/nested/beta.txt').toString(), fs.readFileSync(path.join(input, 'nested', 'beta.txt'), 'utf8'));

  const secondZipPath = path.join(root, 'sample-second.zip');
  run('zip', secondZipPath);
  assert.deepEqual(fs.readFileSync(secondZipPath), fs.readFileSync(zipPath));

  const edtZipPath = path.join(root, 'sample-edt.zip');
  run('zip', edtZipPath, { ...process.env, TZ: 'Pacific/Kiritimati' });
  assert.deepEqual(fs.readFileSync(edtZipPath), fs.readFileSync(zipPath));

  const secondTgzPath = path.join(root, 'sample-second.tar.gz');
  run('tar.gz', secondTgzPath);
  assert.deepEqual(fs.readFileSync(secondTgzPath), fs.readFileSync(tgzPath));

  const edtTgzPath = path.join(root, 'sample-edt.tar.gz');
  run('tar.gz', edtTgzPath, { ...process.env, TZ: 'Pacific/Kiritimati' });
  assert.deepEqual(fs.readFileSync(edtTgzPath), fs.readFileSync(tgzPath));

  for (const [format, archive] of [['zip', zipPath], ['tar.gz', tgzPath]]) {
    const extracted = path.join(root, `extracted-${format}`);
    const extraction = invoke(extractArgs(format, archive, extracted));
    assert.equal(extraction.status, 0, extraction.stderr);
    assert.equal(extraction.stderr, '');
    const report = JSON.parse(extraction.stdout);
    assert.deepEqual(Object.keys(report).sort(), ['ok', 'operation', 'format', 'input', 'output_directory', 'archive_bytes', 'extracted_bytes', 'file_count', 'collision_policy', 'renamed_count', 'sha256'].sort());
    assert.equal(report.ok, true);
    assert.equal(report.operation, 'extract');
    assert.equal(report.format, format);
    assert.equal(report.input, archive);
    assert.equal(report.output_directory, extracted);
    assert.equal(report.file_count, 2);
    assert.equal(report.extracted_bytes, 6800);
    assert.equal(report.collision_policy, 'none');
    assert.equal(report.renamed_count, 0);
    assert.equal(report.sha256, crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'));
    assert.equal(fs.readFileSync(path.join(extracted, 'sample', 'alpha.txt'), 'utf8'), fs.readFileSync(path.join(input, 'alpha.txt'), 'utf8'));
    assert.equal(fs.readFileSync(path.join(extracted, 'sample', 'nested', 'beta.txt'), 'utf8'), fs.readFileSync(path.join(input, 'nested', 'beta.txt'), 'utf8'));
  }

  const collisionRoot = path.join(root, 'collisions');
  fs.mkdirSync(path.join(collisionRoot, 'sample'), { recursive: true });
  const collisionFile = path.join(collisionRoot, 'sample', 'alpha.txt');
  fs.writeFileSync(collisionFile, 'keep me');
  const decision = invoke(extractArgs('zip', zipPath, collisionRoot));
  assert.equal(decision.status, 2);
  assert.equal(decision.stderr, '');
  const decisionReport = JSON.parse(decision.stdout);
  assert.equal(decisionReport.ok, false);
  assert.equal(decisionReport.status, 'decision_required');
  assert.deepEqual(decisionReport.choices, ['overwrite', 'keep-both', 'cancel']);
  assert.equal(decisionReport.prompt, 'Collision found: (o)verwrite, (k)eep both, or (c)ancel?');
  assert.deepEqual(decisionReport.collisions, ['sample/alpha.txt']);
  assert.equal(fs.readFileSync(collisionFile, 'utf8'), 'keep me');
  assert.equal(fs.existsSync(path.join(collisionRoot, 'sample', 'nested', 'beta.txt')), false);

  const cancelled = invoke(extractArgs('zip', zipPath, collisionRoot, 'cancel'));
  assert.equal(cancelled.status, 0, cancelled.stderr);
  assert.equal(JSON.parse(cancelled.stdout).status, 'cancelled');
  assert.equal(fs.readFileSync(collisionFile, 'utf8'), 'keep me');

  const kept = invoke(extractArgs('zip', zipPath, collisionRoot, 'keep-both'));
  assert.equal(kept.status, 0, kept.stderr);
  const keptReport = JSON.parse(kept.stdout);
  assert.equal(keptReport.renamed_count, 1);
  assert.equal(fs.readFileSync(collisionFile, 'utf8'), 'keep me');
  assert.equal(fs.readFileSync(path.join(collisionRoot, 'sample', 'alpha (2).txt'), 'utf8'), fs.readFileSync(path.join(input, 'alpha.txt'), 'utf8'));

  fs.writeFileSync(collisionFile, 'replace me');
  const overwritten = invoke(extractArgs('zip', zipPath, collisionRoot, 'overwrite'));
  assert.equal(overwritten.status, 0, overwritten.stderr);
  assert.equal(fs.readFileSync(collisionFile, 'utf8'), fs.readFileSync(path.join(input, 'alpha.txt'), 'utf8'));

  const unsafeTar = Buffer.from(gunzipSync(fs.readFileSync(tgzPath)));
  unsafeTar.fill(0, 0, 100);
  unsafeTar.write('../evil.txt', 0, 'utf8');
  unsafeTar.fill(0x20, 148, 156);
  const unsafeChecksum = unsafeTar.subarray(0, 512).reduce((sum, byte) => sum + byte, 0);
  unsafeTar.write(`${unsafeChecksum.toString(8).padStart(6, '0')}\0 `, 148, 'ascii');
  const unsafeTgz = path.join(root, 'unsafe-member.tar.gz');
  fs.writeFileSync(unsafeTgz, gzipSync(unsafeTar));
  expectFailure(extractArgs('tar.gz', unsafeTgz, path.join(root, 'unsafe-tar-output')), /Unsafe archive path/);
  assert.equal(fs.existsSync(path.join(root, 'evil.txt')), false);

  const unsafeZipBytes = Buffer.from(fs.readFileSync(zipPath));
  const centralOffset = unsafeZipBytes.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  assert.ok(centralOffset >= 0);
  unsafeZipBytes.writeUInt16LE((3 << 8) | 20, centralOffset + 4);
  unsafeZipBytes.writeUInt32LE((0o120777 << 16) >>> 0, centralOffset + 38);
  const unsafeZip = path.join(root, 'unsafe-member.zip');
  fs.writeFileSync(unsafeZip, unsafeZipBytes);
  expectFailure(extractArgs('zip', unsafeZip, path.join(root, 'unsafe-zip-output')), /Unsupported or unsafe ZIP member type/);

  if (process.platform !== 'win32') {
    const extractionRoot = path.join(root, 'extraction-link-root');
    fs.mkdirSync(extractionRoot);
    fs.symlinkSync(input, path.join(extractionRoot, 'sample'));
    expectFailure(extractArgs('zip', zipPath, extractionRoot), /symbolic link/);
  }

  const overwrite = spawnSync(process.execPath, [helper, '--format', 'zip', '--output', zipPath, '--input', input], { encoding: 'utf8' });
  assert.notEqual(overwrite.status, 0);
  assert.match(overwrite.stderr, /already exists/);

  const before = fs.readFileSync(zipPath);
  expectFailure(argsFor('zip', zipPath), /already exists/);
  assert.deepEqual(fs.readFileSync(zipPath), before);
  const forced = invoke([...argsFor('zip', zipPath), '--force']);
  assert.equal(forced.status, 0, forced.stderr);
  assert.deepEqual(fs.readFileSync(zipPath), before);
  expectFailure([...argsFor('zip', path.join(input, 'alpha.txt')), '--force'], /inside an input/);
  expectFailure([...argsFor('zip', path.join(input, 'alpha.txt'), [path.join(input, 'alpha.txt')]), '--force'], /replace an input/);
  expectFailure(argsFor('zip', path.join(root, 'missing-parent', 'outputs', 'x.zip')), /must already be a directory/);
  assert.equal(fs.existsSync(path.join(root, 'missing-parent')), false);
  expectFailure(argsFor('zip', path.join(root, 'arbitrary-new-directory', 'x.zip')), /Only an immediate outputs/);
  assert.equal(fs.existsSync(path.join(root, 'arbitrary-new-directory')), false);
  const badBase = path.join(root, 'bad-input');
  fs.mkdirSync(badBase);
  expectFailure(argsFor('zip', path.join(badBase, 'outputs', 'x.zip'), [path.join(root, 'missing-input')]), /Input does not exist/);
  assert.equal(fs.existsSync(path.join(badBase, 'outputs')), false);
  expectFailure([...argsFor('zip', standalone), '--force'], /not a regular file/);
  expectFailure(argsFor('zip', path.join(input, 'outputs', 'nested.zip')), /inside an input/);
  assert.equal(fs.existsSync(path.join(input, 'outputs')), false);

  // Simulated write corruption must be caught internally before publication.
  const corruptPath = path.join(root, 'corrupt.zip');
  assert.match(faultRun(argsFor('zip', corruptPath), {
    writeFileSync(target, bytes, options) {
      const damaged = Buffer.from(bytes);
      damaged[0] ^= 0xff;
      fs.writeFileSync(target, damaged, options);
    },
  }), /Written archive integrity check failed/);
  assert.equal(fs.existsSync(corruptPath), false);
  assert.ok(fs.readdirSync(root).every((name) => !name.includes('.tmp-')));

  for (const format of ['zip', 'tar.gz']) {
    const source = helperSource.replace('const { gzipSync, zipSync, gunzipSync, unzipSync } = fflate;',
      `fflate.unzipSync = () => ({}); fflate.gunzipSync = () => new Uint8Array(0);\nconst { gzipSync, zipSync, gunzipSync, unzipSync } = fflate;`);
    const output = path.join(root, `roundtrip-bad.${format}`);
    assert.match(faultRun(argsFor(format, output), {}, source), /integrity check failed/);
    assert.equal(fs.existsSync(output), false);
  }

  // A destination appearing after collision validation must not be replaced.
  const racePath = path.join(root, 'race.zip');
  assert.match(faultRun(argsFor('zip', racePath), {
    linkSync(source, destination) {
      fs.writeFileSync(destination, 'concurrent file', { flag: 'wx' });
      fs.linkSync(source, destination);
    },
  }), /EEXIST/);
  assert.equal(fs.readFileSync(racePath, 'utf8'), 'concurrent file');
  assert.ok(fs.readdirSync(root).every((name) => !name.includes('.tmp-')));

  if (process.platform !== 'win32') {
    const linkedOutput = path.join(root, 'linked.zip');
    fs.symlinkSync(zipPath, linkedOutput);
    expectFailure([...argsFor('zip', linkedOutput), '--force'], /symbolic link/);
    assert.deepEqual(fs.readFileSync(zipPath), before);
    const dangling = path.join(root, 'dangling.zip');
    fs.symlinkSync(path.join(root, 'absent-target'), dangling);
    expectFailure([...argsFor('zip', dangling), '--force'], /symbolic link/);
    const linkedDirectory = path.join(root, 'linked-directory');
    fs.symlinkSync(standalone, linkedDirectory);
    expectFailure(argsFor('zip', path.join(linkedDirectory, 'x.zip')), /symbolic link/);
    expectFailure(argsFor('zip', path.join(linkedDirectory, 'outputs', 'x.zip')), /must already be a directory/);
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
