'use strict';

// Discovery/configuration contracts; execution safety remains in test-compress.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const skill = read('skills/compress-files/SKILL.md');
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);
assert.ok(frontmatter, 'skill must have discovery frontmatter');
assert.match(frontmatter[1], /^name: compress-files$/m);
const description = frontmatter[1].match(/^description: (.+)$/m)[1];
const opening = description.split('. Use for')[0].toLowerCase();
for (const trigger of ['compress', 'archive', 'package', 'zip', 'tar.gz', 'extract', 'unpack', 'unzip']) {
  assert.ok(opening.includes(trigger), `front-load trigger: ${trigger}`);
}
const policy = read('skills/compress-files/agents/openai.yaml');
assert.match(policy, /^policy:\n  allow_implicit_invocation: true\s*$/m);
assert.match(policy, /default_prompt: "Use \$compress-files /);
assert.match(skill, /\*\*@Portable Compression\*\*/);
assert.match(skill, /report the operation as blocked unless the user explicitly authorizes an exception/);
assert.match(skill, /Do not silently switch installations or implementations/);
const manifest = JSON.parse(read('.codex-plugin/plugin.json'));
assert.equal(manifest.name, 'portable-compression');
assert.equal(manifest.skills, './skills/');
assert.match(manifest.version, /^\d+\.\d+\.\d+(?:\+codex\.\d+)?$/);
console.log('Archive routing metadata contracts passed. Prompt selection still requires live tests.');
