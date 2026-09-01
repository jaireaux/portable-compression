#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { gzipSync, zipSync } = require('../vendor/fflate/fflate.js');

const MAX_FILES = 5000;
const MAX_INPUT_BYTES = 512 * 1024 * 1024;

function fail(message) {
  process.stderr.write(`${JSON.stringify({ ok: false, error: message })}\n`);
  process.exit(1);
}

function usage() {
  return [
    'Usage: node compress.cjs --format zip|tar.gz --output PATH --input PATH [--input PATH ...] [--level 0-9] [--force]',
    'Creates deterministic archives using only code bundled with this plugin.',
  ].join('\n');
}

function parseArgs(argv) {
  const opts = { inputs: [], level: 9, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input') opts.inputs.push(argv[++i]);
    else if (arg === '--output') opts.output = argv[++i];
    else if (arg === '--format') opts.format = argv[++i];
    else if (arg === '--level') opts.level = Number(argv[++i]);
    else if (arg === '--force') opts.force = true;
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write(`${usage()}\n`);
      process.exit(0);
    } else fail(`Unknown argument: ${arg}`);
  }
  if (!opts.format || !['zip', 'tar.gz'].includes(opts.format)) fail('Format must be zip or tar.gz.');
  if (!opts.output) fail('Missing --output.');
  if (!opts.inputs.length || opts.inputs.some((value) => !value)) fail('At least one valid --input is required.');
  if (!Number.isInteger(opts.level) || opts.level < 0 || opts.level > 9) fail('Compression level must be an integer from 0 through 9.');
  return opts;
}

function safeArchivePath(value) {
  const normalized = value.split(path.sep).join('/').replace(/^\.\//, '');
  if (!normalized || normalized.startsWith('/') || normalized.includes('\0')) fail(`Unsafe archive path: ${value}`);
  const parts = normalized.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) fail(`Unsafe archive path: ${value}`);
  return normalized;
}

function pathInside(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function collectEntries(inputPaths, outputPath) {
  const entries = [];
  const roots = new Set();
  let totalBytes = 0;

  function visit(sourcePath, archivePath) {
    const stat = fs.lstatSync(sourcePath);
    if (stat.isSymbolicLink()) fail(`Symbolic links are not supported: ${sourcePath}`);
    if (stat.isDirectory()) {
      const safe = `${safeArchivePath(archivePath).replace(/\/$/, '')}/`;
      entries.push({ type: 'directory', sourcePath, archivePath: safe, size: 0 });
      const names = fs.readdirSync(sourcePath).sort((a, b) => a.localeCompare(b, 'en'));
      for (const name of names) visit(path.join(sourcePath, name), `${safe}${name}`);
      return;
    }
    if (!stat.isFile()) fail(`Only regular files and directories are supported: ${sourcePath}`);
    totalBytes += stat.size;
    if (totalBytes > MAX_INPUT_BYTES) fail(`Inputs exceed the ${MAX_INPUT_BYTES}-byte limit.`);
    entries.push({ type: 'file', sourcePath, archivePath: safeArchivePath(archivePath), size: stat.size });
  }

  for (const rawInput of inputPaths) {
    const sourcePath = path.resolve(rawInput);
    if (!fs.existsSync(sourcePath)) fail(`Input does not exist: ${rawInput}`);
    if (pathInside(outputPath, sourcePath) && fs.lstatSync(sourcePath).isDirectory()) {
      fail('Output cannot be placed inside an input directory.');
    }
    const rootName = safeArchivePath(path.basename(sourcePath));
    if (roots.has(rootName)) fail(`Duplicate archive root name: ${rootName}`);
    roots.add(rootName);
    visit(sourcePath, rootName);
    if (entries.length > MAX_FILES) fail(`Inputs exceed the ${MAX_FILES}-entry limit.`);
  }
  entries.sort((a, b) => a.archivePath.localeCompare(b.archivePath, 'en'));
  return { entries, totalBytes };
}

function writeString(buffer, offset, length, value) {
  const bytes = Buffer.from(value, 'utf8');
  if (bytes.length > length) fail(`TAR path or field is too long: ${value}`);
  bytes.copy(buffer, offset);
}

function writeOctal(buffer, offset, length, value) {
  const octal = Math.trunc(value).toString(8);
  if (octal.length > length - 1) fail(`Value does not fit TAR header field: ${value}`);
  writeString(buffer, offset, length, `${octal.padStart(length - 1, '0')}\0`);
}

function tarHeader(entry) {
  const header = Buffer.alloc(512, 0);
  writeString(header, 0, 100, entry.archivePath);
  writeOctal(header, 100, 8, entry.type === 'directory' ? 0o755 : 0o644);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, entry.size);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header[156] = entry.type === 'directory' ? 0x35 : 0x30;
  writeString(header, 257, 6, 'ustar\0');
  writeString(header, 263, 2, '00');
  writeString(header, 265, 32, 'portable-compression');
  writeString(header, 297, 32, 'portable-compression');
  let checksum = 0;
  for (const byte of header) checksum += byte;
  writeString(header, 148, 8, `${checksum.toString(8).padStart(6, '0')}\0 `);
  return header;
}

function makeTar(entries) {
  const chunks = [];
  for (const entry of entries) {
    chunks.push(tarHeader(entry));
    if (entry.type === 'file') {
      const content = fs.readFileSync(entry.sourcePath);
      chunks.push(content);
      const remainder = content.length % 512;
      if (remainder) chunks.push(Buffer.alloc(512 - remainder, 0));
    }
  }
  chunks.push(Buffer.alloc(1024, 0));
  return Buffer.concat(chunks);
}

function makeTarGz(entries, level) {
  const tar = makeTar(entries);
  return Buffer.from(gzipSync(new Uint8Array(tar), { level, mtime: 0 }));
}

function makeZip(entries, level) {
  const files = {};
  for (const entry of entries) {
    if (entry.type === 'file') {
      files[entry.archivePath] = [
        new Uint8Array(fs.readFileSync(entry.sourcePath)),
        { mtime: new Date('1980-01-01T00:00:00.000Z') },
      ];
    }
  }
  return Buffer.from(zipSync(files, { level }));
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const outputPath = path.resolve(opts.output);
  if (fs.existsSync(outputPath) && !opts.force) fail(`Output already exists: ${outputPath}`);
  const { entries, totalBytes } = collectEntries(opts.inputs, outputPath);
  const archive = opts.format === 'zip' ? makeZip(entries, opts.level) : makeTarGz(entries, opts.level);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp-${process.pid}-${crypto.randomBytes(6).toString('hex')}`;
  try {
    fs.writeFileSync(temporaryPath, archive, { flag: 'wx', mode: 0o600 });
    fs.renameSync(temporaryPath, outputPath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
  const sha256 = crypto.createHash('sha256').update(archive).digest('hex');
  const result = {
    ok: true,
    format: opts.format,
    output: outputPath,
    input_bytes: totalBytes,
    archive_bytes: archive.length,
    file_count: entries.filter((entry) => entry.type === 'file').length,
    sha256,
  };
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

main();
