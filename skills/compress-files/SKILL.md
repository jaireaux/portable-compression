---
name: compress-files
description: Create deterministic ZIP or TAR.GZ archives and safely extract them without relying on OS compression utilities, external packages, or services.
---

# Create or extract archives

Use the package-relative `scripts/compress.cjs` helper for archive creation and extraction. It carries its own DEFLATE/GZIP/ZIP implementation and must not be replaced with `zip`, `tar`, `gzip`, 7-Zip, Python archive modules, an external compression package, or a network service.

## ChatGPT Work workflow

The intended cold-start workflow is a single message: attach every input file and invoke **@Portable Compression** in that same message, specifying ZIP or TAR.GZ when you have a preference. Use the supplied attachment paths; the helper reads the inputs itself.

## Format choice

- Use `tar.gz` when compact multi-file output, deterministic packaging, or machine-to-machine transfer matters most.
- Use `zip` when the recipient should be able to open the archive conveniently on common consumer devices.
- If the user specifies a format, preserve that choice.
- Ask only when the format materially affects the result and the user's priority is unclear.

## Run

Each create or extract attempt requires exactly one shell invocation. Resolve the helper from the directory containing this exact `SKILL.md` file (`skills/compress-files`), not from its parent `skills` directory, and do so without a discovery command.

Create:

```sh
"${CODEX_PRIMARY_RUNTIME_NODE:-node}" "<directory-containing-this-SKILL.md>/../../scripts/compress.cjs" \
  --format tar.gz \
  --output /absolute/path/to/outputs/archive.tar.gz \
  --input /absolute/path/to/file-or-directory
```

Use ChatGPT Work/Codex's bundled Node runtime directly through `CODEX_PRIMARY_RUNTIME_NODE` when it is set. The quoted shell expansion above falls back to `node` on PATH when it is unavailable; do not probe the filesystem for a runtime. Repeat `--input` for multiple inputs. Add `--force` only when the user has authorized replacing an existing output.

Extract:

```sh
"${CODEX_PRIMARY_RUNTIME_NODE:-node}" "<directory-containing-this-SKILL.md>/../../scripts/compress.cjs" \
  --operation extract \
  --format zip \
  --output /absolute/path/to/extraction-directory \
  --input /absolute/path/to/archive.zip
```

Use `--format tar.gz` for TAR.GZ. Do not add a collision policy on the first attempt unless the user already selected one.

## Extraction collisions

- With no collisions, the first invocation extracts and verifies the archive without prompting.
- If regular destination files collide and no policy was supplied, the helper writes nothing and returns `status: "decision_required"`, a bounded `collisions` list, the choices `overwrite`, `keep-both`, and `cancel`, and a `prompt` field containing the exact question to ask.
- Reporting the helper JSON alone is incomplete when `status` is `decision_required`. In that same response, report the collisions and the complete helper JSON, then repeat the returned `prompt` verbatim as the final line. The expected prompt is: **Collision found: (o)verwrite, (k)eep both, or (c)ancel?**
- Stop and wait for the user's explicit choice. Do not infer a choice, reuse a choice from an earlier collision, or start the policy retry before the user answers.
- After the answer, make one new helper invocation with `--collision overwrite`, `--collision keep-both`, or `--collision cancel`. A collision therefore takes two self-contained attempts; never add separate inspection commands.
- `keep-both` selects deterministic numbered names such as `report (2).txt`. `overwrite` replaces regular files only. `cancel` performs no writes.
- Unsafe structural conflicts, symbolic links, special archive members, duplicate members, absolute paths, backslashes, drive-qualified paths, and traversal components are errors, not collision choices.

## Single-command contract

- Do not run separate input-existence or output-collision checks, including shell `test` or `[ ... ]` checks.
- Do not run `mkdir`, even when the output directory might be missing. Choose a user-authorized existing output directory, or its immediate `outputs` child. Only that one child may be created by the helper; its parent must already exist. Do not invent other directory trees or destinations.
- Do not run separate `stat`, checksum, archive-listing, or postflight verification commands. Do not append them with shell chaining, pipelines, or a wrapper script.
- The helper owns input validation, output-directory handling, overwrite protection, archive creation, in-memory round-trip checks, written-file verification, and final reporting within that invocation.
- Treat a zero exit status plus the helper's `ok: true` JSON as the verified result. For creation, report/link `output` and use `input_bytes`, `archive_bytes`, `file_count`, `format`, and `sha256`. For extraction, report/link `output_directory` and use `archive_bytes`, `extracted_bytes`, `file_count`, `collision_policy`, `renamed_count`, `format`, and `sha256`. Do not run another command.
- `decision_required` intentionally exits nonzero after writing JSON to stdout and no files. This is the only helper result that should lead to the mandatory collision question and a user-authorized retry; never finish that turn with the JSON alone.
- On failure, report the helper's JSON error and stop. Do not launch diagnostic/preflight commands or retry silently; obtain corrected inputs or authorization before another attempt. Runtime absence also requires stopping, not searching for another binary.

This contract governs plugin-operation commands, not the host's initial directory-trust prompt. One invocation does not guarantee one approval: the host controls its own file and execution permissions.

## Optional Codex CLI approval review

When a user explicitly wants fewer interactive approvals in Codex CLI, they may start a fresh session with `codex --approve-for-me`. This is a host setting, not plugin behavior: it keeps the workspace-write sandbox and routes approval requests through automatic review. Do not enable it on the user's behalf, do not claim it guarantees zero prompts, and do not use or recommend `--dangerously-bypass-approvals-and-sandbox`.

Without that optional host setting, an installed skill read and helper execution may each require approval. Those host-managed prompts do not violate the one-helper-command contract. Do not add plugin-operation commands to compensate for them.

## Boundaries

- Never follow symbolic links.
- Do not overwrite an existing output unless the user approved it.
- Do not place the output inside an input directory.
- Do not claim compression succeeded unless the helper reports verified success; it checks the output internally.
- TAR.GZ members are intentionally limited to portable UTF-8 paths of at most 100 bytes.
- Extraction accepts only regular files and directories, limits expanded data, entry count, path length, and path depth, stages content privately, and verifies final file bytes. It assumes the user-controlled destination hierarchy is not being concurrently replaced by another process.
