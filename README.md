# Portable Compression

Portable Compression is a skills-only plugin for ChatGPT Work and Codex. It creates deterministic ZIP and TAR.GZ archives without an MCP server, network compression service, or operating-system archive utility.

## Current scope

- Create ZIP archives for broad recipient compatibility.
- Create TAR.GZ archives for compact multi-file packaging.
- Bundle the pure-JavaScript compression implementation with the plugin.
- Reject symbolic links and unsafe archive paths.
- Avoid overwriting existing outputs unless explicitly authorized.
- Produce a SHA-256 digest and machine-readable result for every archive.

Version 0.2.1 creates archives only. It does not extract archives, encrypt archives, accept URLs, or provide an unattended service.

## ChatGPT Work workflow

Attach all files to compress and invoke **@Portable Compression** in the same message. If you care which format is used, ask for ZIP or TAR.GZ in that message. This lets ChatGPT authorize the skill, attachments, and self-contained runtime helper with the fewest distinct file and command boundaries.

Version 0.2.1 embeds fflate directly in `scripts/compress.cjs`, so archive creation does not load a separate compression-library file. The skill invokes the bundled Node runtime through `CODEX_PRIMARY_RUNTIME_NODE` when ChatGPT Work/Codex supplies it and safely falls back to `node` elsewhere without searching the filesystem.

## Development time

Version 0.2.1 was completed 6 hours, 56 minutes, and 22 seconds after development began on September 1, 2026 at 12:39 PM EDT. Approximately 40 minutes were spent waiting on AI. Both figures are cumulative from the beginning of the project; the project duration is exact through the recorded Git version, while the AI-waiting figure is intentionally approximate.

The project clock measures elapsed wall-clock time from the original start through each Git version. The AI-waiting clock accumulates the interval from receipt of each user prompt through release of the complete response. See `development-time.json` for the tracking basis used by later versions.

## Direct helper use

```sh
"${CODEX_PRIMARY_RUNTIME_NODE:-node}" scripts/compress.cjs \
  --format tar.gz \
  --output /absolute/path/to/archive.tar.gz \
  --input /absolute/path/to/folder
```

Use multiple `--input` arguments to add multiple roots. Use `--format zip` for ZIP output. Existing outputs are protected unless `--force` is supplied.

## Install for testing

Add this repository as a plugin marketplace:

```sh
codex plugin marketplace add jaireaux/portable-compression
```

Then restart the ChatGPT desktop app, open the Plugins Directory, select **Rollerfeet Plugins**, and install **Portable Compression**. Start a new Work or Codex conversation for each test. Mobile availability and execution must be verified separately after desktop installation.

## Test

```sh
node tests/test-compress.cjs
```

## Licensing

The plugin's original code is MIT licensed. The embedded `fflate` implementation is also MIT licensed; see `THIRD_PARTY_NOTICES.md`.
