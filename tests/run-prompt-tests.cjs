'use strict';

// Opt-in live acceptance test, not part of the offline suite. Uses account quota.
// Usage: node tests/run-prompt-tests.cjs CODEX_BINARY TEST_CODEX_HOME TEST_ROOT VERSION
// TEST_CODEX_HOME must be isolated and contain just the candidate plus AGENTS.md.
// Remote app connectors are excluded; local plugin discovery remains enabled.
// Start with a fresh TEST_ROOT. No credentials or plugin configuration are changed.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const [cli, home, rootArg, version] = process.argv.slice(2);
assert.ok(cli && home && rootArg && version, 'supply binary, isolated home, fresh root, version');
const root = path.resolve(rootArg);
fs.mkdirSync(root, { recursive: false });
const cases = [
  ['explicit-create', 'Use $compress-files to create sample.zip from sample.txt.', 'create', 'zip'],
  ['implicit-create', 'Compress and package sample.txt into a ZIP archive named sample.zip.', 'create', 'zip'],
  ['implicit-targz', 'Archive sample.txt as sample.tar.gz for transfer.', 'create', 'tar.gz'],
  ['explicit-extract', 'Use $compress-files to extract sample.zip into outputs.', 'extract', 'zip'],
  ['implicit-unzip', 'Unzip sample.zip into outputs.', 'extract', 'zip'],
  ['implicit-unpack', 'Unpack sample.tar.gz into outputs.', 'extract', 'tar.gz'],
  ['collision', 'Extract sample.zip into outputs.', 'collision', 'zip'],
  ['missing-input', 'Compress missing.txt into sample.zip.', 'failure', 'zip'],
];
const results = [];
for (const [name, prompt, operation, format] of cases) {
  const work = path.join(root, name);
  fs.mkdirSync(work);
  fs.writeFileSync(path.join(work, 'sample.txt'), 'Portable Compression routing fixture.\n', { flag: 'wx' });
  if (operation === 'extract' || operation === 'collision') {
    const seed = path.join(root, format === 'zip' ? 'explicit-create/sample.zip' : 'implicit-targz/sample.tar.gz');
    if (!fs.existsSync(seed)) {
      results.push({ name, status: 'BLOCKED', reason: 'creation prerequisite did not produce archive' });
      continue;
    }
    fs.copyFileSync(seed, path.join(work, format === 'zip' ? 'sample.zip' : 'sample.tar.gz'));
  }
  if (operation === 'collision') {
    fs.mkdirSync(path.join(work, 'outputs'));
    fs.writeFileSync(path.join(work, 'outputs/sample.txt'), 'KEEP ORIGINAL\n', { flag: 'wx' });
  }
  const started = new Date().toISOString();
  const run = spawnSync(cli, ['exec', '-c', 'features.apps=false', '--ephemeral', '--json', '--sandbox', 'workspace-write',
    '--skip-git-repo-check', '-C', work, prompt], {
    env: { ...process.env, CODEX_HOME: home }, encoding: 'utf8', timeout: 180000,
    maxBuffer: 16 * 1024 * 1024,
  });
  fs.writeFileSync(path.join(root, name + '.jsonl'), run.stdout || '', { flag: 'wx' });
  fs.writeFileSync(path.join(root, name + '.stderr'), run.stderr || '', { flag: 'wx' });
  const events = (run.stdout || '').split('\n').filter(Boolean).flatMap(line => {
    try { return [JSON.parse(line)]; } catch { return []; }
  });
  const commands = events.filter(e => e.type === 'item.completed' && e.item?.type === 'command_execution').map(e => e.item);
  const helperCommands = commands.filter(c => c.command.includes('/scripts/compress.cjs'));
  const skillReads = commands.filter(c => c.command.includes('/skills/compress-files/SKILL.md'));
  const unexpected = commands.filter(c => !helperCommands.includes(c) && !skillReads.includes(c));
  const final = events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message').at(-1)?.item.text || '';
  const errors = [];
  if (run.status !== 0) errors.push(`Codex run failed or timed out (${run.error?.code || run.signal || run.status})`);
  if (!skillReads.some(c => c.exit_code === 0 && c.command.includes('/' + version + '/'))) errors.push('expected skill/version read not observed');
  if (helperCommands.length !== 1) errors.push('expected exactly one helper attempt');
  if (unexpected.length) errors.push('extra commands observed');
  const helper = helperCommands[0];
  if (helper && !helper.command.includes('/' + version + '/')) errors.push('wrong helper version');
  if (helper && /[;|]|&&/.test(helper.command)) errors.push('helper command contains shell chaining or a pipeline');
  let report;
  try { report = JSON.parse(helper?.aggregated_output.trim()); } catch { errors.push('helper JSON unavailable'); }
  if (operation === 'collision') {
    if (report?.status !== 'decision_required') errors.push('collision decision missing');
    if (!final.trim().endsWith('Collision found: (o)verwrite, (k)eep both, or (c)ancel?')) errors.push('final collision question missing');
    if (fs.readFileSync(path.join(work, 'outputs/sample.txt'), 'utf8') !== 'KEEP ORIGINAL\n') errors.push('collision modified original');
  } else if (operation === 'failure') {
    if (report?.ok !== false || helper?.exit_code === 0) errors.push('missing input did not fail safely');
    if (fs.existsSync(path.join(work, 'sample.zip'))) errors.push('failure produced archive');
  } else {
    if (report?.ok !== true || helper?.exit_code !== 0 || report?.format !== format) errors.push('helper did not verify requested format');
    if (operation === 'extract' && (!fs.existsSync(path.join(work, 'outputs/sample.txt')) ||
        fs.readFileSync(path.join(work, 'outputs/sample.txt'), 'utf8') !== 'Portable Compression routing fixture.\n')) errors.push('extracted bytes mismatch');
  }
  const result = { name, prompt, started, finished: new Date().toISOString(), status: errors.length ? 'FAIL' : 'PASS',
    errors, loadedSkill: skillReads.map(c => c.command), helper: helperCommands.map(c => c.command),
    otherCommands: unexpected.map(c => c.command), helperResult: report, final,
    codexExit: run.status, signal: run.signal, executionError: run.error?.code };
  results.push(result);
  console.log(JSON.stringify({ name, status: result.status, errors }));
  fs.writeFileSync(path.join(root, 'results.json'), JSON.stringify(results, null, 2) + '\n');
}
process.exitCode = results.every(r => r.status === 'PASS') ? 0 : 1;
