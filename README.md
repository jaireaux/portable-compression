# Portable Compression

Portable Compression is a skills-only plugin for ChatGPT Work and Codex. It creates deterministic ZIP and TAR.GZ archives without an MCP server, network compression service, or operating-system archive utility.

## Current scope

- Create ZIP archives for broad recipient compatibility.
- Create TAR.GZ archives for compact multi-file packaging.
- Bundle the pure-JavaScript compression implementation with the plugin.
- Reject symbolic links and unsafe archive paths.
- Avoid overwriting existing outputs unless explicitly authorized.
- Produce a SHA-256 digest and machine-readable result for every archive.

Version 0.2.2 creates archives only. It does not extract archives, encrypt archives, accept URLs, or provide an unattended service.

## ChatGPT Work workflow

Attach all files to compress and invoke **@Portable Compression** in the same message. If you care which format is used, ask for ZIP or TAR.GZ in that message. This lets ChatGPT authorize the skill, attachments, and self-contained runtime helper with the fewest distinct file and command boundaries.

Version 0.2.1 embeds fflate directly in `scripts/compress.cjs`, so archive creation does not load a separate compression-library file. The skill invokes the bundled Node runtime through `CODEX_PRIMARY_RUNTIME_NODE` when ChatGPT Work/Codex supplies it and safely falls back to `node` elsewhere without searching the filesystem.

## v0.2.2 single-command contract

Archive creation uses exactly one shell invocation of the self-contained helper. Do not run separate input-existence checks, output-collision checks, `mkdir`, `stat`, checksums, archive listings, or postflight verification, including commands chained to the helper. The helper validates inputs and destination, protects existing outputs, creates the archive, verifies the contents by round-trip decoding with embedded fflate, reads back the written bytes, and returns the verified result as one JSON line:

`ok`, `format`, `output`, `input_bytes`, `archive_bytes`, `file_count`, `sha256`.

Use a user-authorized existing output directory, or its immediate `outputs` child. The helper can create only this one missing child, with a non-recursive operation; its parent must already exist. Other missing directories, output-directory symlinks, output symlinks (including dangling links), output/input overlap, and non-regular output targets are rejected. Host filesystem permissions remain authoritative; the helper does not grant access outside them. Successful creation is reported only after internal verification. Errors produce `ok: false` JSON on stderr and a nonzero exit status; report the error and stop rather than launching more diagnostic commands.

The no-overwrite publication path uses an atomic hard link to a verified temporary file in the same directory, then removes the temporary name. A filesystem that does not support hard links fails safely without falling back to an overwrite-prone operation. `--force` explicitly authorizes replacement of a regular output file. These checks assume the user-controlled directory hierarchy is not being concurrently replaced by another process.

### Linux installation evidence (user reported, 2026-09-02)

Ubuntu 24.04 x86-64, Codex CLI 0.147.0, Node.js 22.23.2: Portable Compression v0.2.1 installed successfully from `rollerfeet-plugins` and was enabled. The two established XML fixtures produced a 1,061-byte ZIP containing both files, with SHA-256 `3b2f50b7e97d7031b6cc51c0a485b9c8ed41e5e0792f81f006e25158fae76aa8`, matching the reported macOS and ChatGPT Work results byte-for-byte by digest.

The screenshot was reported to show four plugin-operation commands: preflight checks, `mkdir -p outputs`, helper execution, and postflight `test`/`stat`. A possible fifth prompt was likely initial directory trust and is not counted without further evidence. v0.2.2 eliminates the instructions that lead to those ancillary commands; its real cold-start approval count still needs installation testing. One shell invocation is a workflow contract, not a guarantee about host-managed approval counts.

## Development time

Version 0.2.2 was recorded 22 hours, 9 minutes, 40 seconds after development began on September 1, 2026 at 12:39 PM EDT (79,780 elapsed seconds through 2026-09-02T14:48:40Z). Approximately 60 minutes were spent waiting on AI (3,628 seconds). Both totals are cumulative; AI timing includes explicitly labeled estimates.

The project clock measures elapsed wall-clock time from the original start through each Git version. The AI-waiting clock accumulates the interval from receipt of each user prompt through release of the complete response. See `development-time.json` for the tracking basis used by later versions.

The v0.2.1 boundary remains preserved at 24,982 project seconds and 2,394 AI-waiting seconds. v0.2.2 adds 634 seconds from separate post-boundary Mac task intervals and the following agreed estimate, counted once: Additional estimated AI-waiting from separate testing thread: 600 seconds. The earlier rough 264-second Mac checkpoint was superseded by recorded task intervals, not added again. Final response-delivery times may be approximated by the closest observable pre-release timestamp; the release turn's tail after this cutoff carries into the next version.

## Direct helper use

```sh
"${CODEX_PRIMARY_RUNTIME_NODE:-node}" scripts/compress.cjs \
  --format tar.gz \
  --output /absolute/path/to/outputs/archive.tar.gz \
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
