---
name: compress-files
description: Create ZIP or TAR.GZ archives from local files and directories without relying on OS compression utilities or an external service.
---

# Compress files

Use the package-relative `scripts/compress.cjs` helper for archive creation. It carries its own DEFLATE/GZIP/ZIP implementation and must not be replaced with `zip`, `tar`, `gzip`, 7-Zip, Python archive modules, or a network service.

## ChatGPT Work workflow

The intended cold-start workflow is a single message: attach every input file and invoke **@Portable Compression** in that same message, specifying ZIP or TAR.GZ when you have a preference. Read this `SKILL.md`, the attached inputs, and the one self-contained helper as the minimum required file set.

## Format choice

- Use `tar.gz` when compact multi-file output, deterministic packaging, or machine-to-machine transfer matters most.
- Use `zip` when the recipient should be able to open the archive conveniently on common consumer devices.
- If the user specifies a format, preserve that choice.
- Ask only when the format materially affects the result and the user's priority is unclear.

## Run

Resolve the helper relative to this skill directory:

```sh
"${CODEX_PRIMARY_RUNTIME_NODE:-node}" "<skill-directory>/../../scripts/compress.cjs" \
  --format tar.gz \
  --output /absolute/path/to/archive.tar.gz \
  --input /absolute/path/to/file-or-directory
```

Use ChatGPT Work/Codex's bundled Node runtime directly through `CODEX_PRIMARY_RUNTIME_NODE` when it is set. The shell expansion above safely falls back to `node` when it is unavailable; do not probe arbitrary filesystem locations for Node. Keep archive creation in one command. Repeat `--input` for multiple inputs. Add `--force` only when the user has authorized replacing an existing output. The helper returns a JSON result containing the format, output path, input byte count, archive byte count, file count, and SHA-256 hash.

## Boundaries

- Create archives only; this version does not extract them.
- Never follow symbolic links.
- Do not overwrite an existing output unless the user approved it.
- Do not place the output inside an input directory.
- Do not claim compression succeeded unless the helper returns success and the output file exists.
- TAR.GZ members are intentionally limited to portable UTF-8 paths of at most 100 bytes in version 0.1.
