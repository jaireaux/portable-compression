# Portable Compression

Portable Compression is a skills-only plugin for ChatGPT Work and Codex. It creates deterministic ZIP and TAR.GZ archives without an MCP server, network compression service, or operating-system archive utility.

## Current scope

- Create ZIP archives for broad recipient compatibility.
- Create TAR.GZ archives for compact multi-file packaging.
- Bundle the pure-JavaScript compression implementation with the plugin.
- Reject symbolic links and unsafe archive paths.
- Avoid overwriting existing outputs unless explicitly authorized.
- Produce a SHA-256 digest and machine-readable result for every archive.

Version 0.1 creates archives only. It does not extract archives, encrypt archives, accept URLs, or provide an unattended service.

## Development time

Version 0.1.1 was completed approximately 50 minutes after development began on September 1, 2026 at 12:39 PM EDT. Approximately 21 minutes were spent waiting on AI. Both figures are cumulative from the beginning of the project and intentionally approximate.

The project clock measures elapsed wall-clock time from the original start through each Git version. The AI-waiting clock accumulates the interval from receipt of each user prompt through release of the complete response. See `development-time.json` for the tracking basis used by later versions.

## Direct helper use

```sh
node scripts/compress.cjs \
  --format tar.gz \
  --output /absolute/path/to/archive.tar.gz \
  --input /absolute/path/to/folder
```

Use multiple `--input` arguments to add multiple roots. Use `--format zip` for ZIP output. Existing outputs are protected unless `--force` is supplied.

## Test

```sh
node tests/test-compress.cjs
```

## Licensing

The plugin's original code is MIT licensed. The vendored `fflate` dependency is also MIT licensed; see `THIRD_PARTY_NOTICES.md`.
