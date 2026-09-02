---
name: compress-files
description: Create ZIP or TAR.GZ archives from local files and directories without relying on OS compression utilities or an external service.
---

# Compress files

Use the package-relative `scripts/compress.cjs` helper for archive creation. It carries its own DEFLATE/GZIP/ZIP implementation and must not be replaced with `zip`, `tar`, `gzip`, 7-Zip, Python archive modules, or a network service.

## ChatGPT Work workflow

The intended cold-start workflow is a single message: attach every input file and invoke **@Portable Compression** in that same message, specifying ZIP or TAR.GZ when you have a preference. Use the supplied attachment paths; the helper reads the inputs itself.

## Format choice

- Use `tar.gz` when compact multi-file output, deterministic packaging, or machine-to-machine transfer matters most.
- Use `zip` when the recipient should be able to open the archive conveniently on common consumer devices.
- If the user specifies a format, preserve that choice.
- Ask only when the format materially affects the result and the user's priority is unclear.

## Run

Archive creation requires exactly one shell invocation: the helper command below. Resolve the helper relative to this skill directory without a discovery command:

```sh
"${CODEX_PRIMARY_RUNTIME_NODE:-node}" "<skill-directory>/../../scripts/compress.cjs" \
  --format tar.gz \
  --output /absolute/path/to/outputs/archive.tar.gz \
  --input /absolute/path/to/file-or-directory
```

Use ChatGPT Work/Codex's bundled Node runtime directly through `CODEX_PRIMARY_RUNTIME_NODE` when it is set. The quoted shell expansion above falls back to `node` on PATH when it is unavailable; do not probe the filesystem for a runtime. Repeat `--input` for multiple inputs. Add `--force` only when the user has authorized replacing an existing output.

## Single-command contract

- Do not run separate input-existence or output-collision checks, including shell `test` or `[ ... ]` checks.
- Do not run `mkdir`, even when the output directory might be missing. Choose a user-authorized existing output directory, or its immediate `outputs` child. Only that one child may be created by the helper; its parent must already exist. Do not invent other directory trees or destinations.
- Do not run separate `stat`, checksum, archive-listing, or postflight verification commands. Do not append them with shell chaining, pipelines, or a wrapper script.
- The helper owns input validation, output-directory handling, overwrite protection, archive creation, in-memory round-trip checks, written-file verification, and final reporting within that invocation.
- Treat a zero exit status plus the helper's `ok: true` JSON as the verified result. Report/link its `output` path and use its `input_bytes`, `archive_bytes`, `file_count`, `format`, and `sha256` fields without another command.
- On failure, report the helper's JSON error and stop. Do not launch diagnostic/preflight commands or retry silently; obtain corrected inputs or authorization before another attempt. Runtime absence also requires stopping, not searching for another binary.

This contract governs plugin-operation commands, not the host's initial directory-trust prompt. One invocation does not guarantee one approval: the host controls its own file and execution permissions.

## Boundaries

- Create archives only; this version does not extract them.
- Never follow symbolic links.
- Do not overwrite an existing output unless the user approved it.
- Do not place the output inside an input directory.
- Do not claim compression succeeded unless the helper reports verified success; it checks the output internally.
- TAR.GZ members are intentionally limited to portable UTF-8 paths of at most 100 bytes.
