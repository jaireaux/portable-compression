# Portable Compression

Portable Compression is a skills-only plugin for ChatGPT Work and Codex. It creates deterministic ZIP and TAR.GZ archives without an MCP server, network compression service, or operating-system archive utility.

## Current scope

- Create ZIP archives for broad recipient compatibility.
- Create TAR.GZ archives for compact multi-file packaging.
- Bundle the pure-JavaScript compression implementation with the plugin.
- Reject symbolic links and unsafe archive paths.
- Avoid overwriting existing outputs unless explicitly authorized.
- Produce a SHA-256 digest and machine-readable result for every archive.

Version 0.2.3 creates archives only. It does not extract archives, encrypt archives, accept URLs, or provide an unattended service.

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

The screenshot was reported to show four plugin-operation commands: preflight checks, `mkdir -p outputs`, helper execution, and postflight `test`/`stat`. A possible fifth prompt was likely initial directory trust and is not counted without further evidence. This historical v0.2.1 result motivated the v0.2.2 single-command contract. One shell invocation is a workflow contract, not a guarantee about host-managed approval counts.

### v0.2.2 installation acceptance results — 2026-09-02

The published version tested was `d988e811064cca1d440f286f1b6abd7b4d93faad`. The two established XML fixtures were passed as separate files for the matching comparisons below.

| Environment | ZIP | TAR.GZ | Observed approvals per archive |
| --- | --- | --- | --- |
| Mac Codex | 1,061 bytes; baseline digest match | 536 bytes; baseline digest match | 0, user reported |
| Linux Codex | 1,061 bytes; baseline digest match | 536 bytes; baseline digest match | 2: instruction read and helper execution |
| ChatGPT Work on Mac | 1,061 bytes; baseline digest match | 536 bytes; baseline digest match | 0, user reported |

Baseline SHA-256 values:

- ZIP: `3b2f50b7e97d7031b6cc51c0a485b9c8ed41e5e0792f81f006e25158fae76aa8`
- TAR.GZ: `1cd5a09012d349fa6e3817f017e66db81dc3b37917eb97280dbb4f02447f8998`

Mac and Work output sizes and hashes were checked directly in the development task. Linux values and approvals are evidenced by user-provided screenshots, not an independent read of the Linux archives. All six results match the established per-format fingerprints. These tests support deterministic output for these fixtures; they do not establish all possible cross-platform cases.

Mac task histories show one skill-instruction read followed by exactly one archive-creation command, with no ancillary checks. Linux screenshots likewise show those two commands. Work's visible summaries show a command entry, consistent with the contract, but the full commands and helper JSON were not inspected. Developer-side hash checks were separate acceptance verification, not plugin-operation commands.

The matching Linux ZIP was a follow-up in the same session. Linux TAR.GZ was a fresh-session test; its screenshot identifies Codex CLI **0.152.1**. The earlier **0.147.0** version belongs to the v0.2.1 environment report and must not be assumed for these later runs. Mac ZIP/TAR.GZ were separate new tasks; Work tests were requested in new conversations. Zero prompts do not prove a permission-reset cold start.

The initial v0.2.2 Linux directory-input ZIP contained two files but was 1,089 bytes with a different digest. It passed the whole `inputs` directory instead of two individual file roots, so it is a different packaging case, not a failed identical-input comparison. A preserved `inputs/` member prefix would explain the 28-byte difference, but that archive's member names were not independently inspected. An earlier canceled request using `/input` is separate from the completed attempts.

Linux approvals were granted **this time**. Similar runs may prompt again under the unchanged host policy. The tests do not establish which Linux policy setting caused the prompts or why Mac/Work did not prompt. No permissions were relaxed for this documentation update. The result is one archive-creation command, not a promise of zero approvals on every host.

### v0.2.3 approval and command-evidence follow-up — 2026-09-08

A fresh ChatGPT Work test loaded the Portable Compression skill and recorded one archive command with no user-reported approval prompt. Work did not expose the command text or raw helper output: its expanded activity showed **Read Compress Files skill** and **Ran command**, but the latter was not interactive. No documented Work setting was found that changes this visibility. The saved output was 1,061 bytes and matched the established ZIP SHA-256 exactly, so the Work command-detail limitation is documented rather than left as an unresolved compression result.

A fresh Linux Codex CLI test then started with the optional `codex --approve-for-me` flag. The transcript exposed one `cat` instruction read followed by exactly one compression-helper invocation, with both XML fixtures supplied as separate `--input` arguments. There were no separate preflight, directory, checksum, listing, or postflight commands, and Johnny reported zero approval prompts. The helper returned:

```json
{"ok":true,"format":"zip","output":"/home/jaireaux/Software/portable-compression-linux-test/portable-compression-v022-cli-evidence.zip","input_bytes":1799,"archive_bytes":1061,"file_count":2,"sha256":"3b2f50b7e97d7031b6cc51c0a485b9c8ed41e5e0792f81f006e25158fae76aa8"}
```

This demonstrates a zero-interactive-prompt run for that tested session; it does not make zero prompts a plugin guarantee. `--approve-for-me` changes Codex CLI's host-side approval handling while retaining its workspace-write sandbox. It is optional and must be chosen by the user. Portable Compression does not enable it. The dangerous `--dangerously-bypass-approvals-and-sandbox` mode is neither required nor recommended.

## Development time

Version 0.2.2 was recorded 22 hours, 9 minutes, 40 seconds after development began on September 1, 2026 at 12:39 PM EDT (79,780 elapsed seconds through 2026-09-02T14:48:40Z). Approximately 60 minutes were spent waiting on AI (3,628 seconds). Both totals are cumulative; AI timing includes explicitly labeled estimates.

The project clock measures elapsed wall-clock time from the original start through each Git version. The AI-waiting clock accumulates the interval from receipt of each user prompt through release of the complete response. See `development-time.json` for the tracking basis used by later versions.

The v0.2.1 boundary remains preserved at 24,982 project seconds and 2,394 AI-waiting seconds. v0.2.2 adds 634 seconds from separate post-boundary Mac task intervals and the following agreed estimate, counted once: Additional estimated AI-waiting from separate testing thread: 600 seconds. The earlier rough 264-second Mac checkpoint was superseded by recorded task intervals, not added again. Final response-delivery times may be approximated by the closest observable pre-release timestamp; the release turn's tail after this cutoff carries into the next version.

Documentation checkpoint (plugin remains v0.2.2): 2026-09-02T19:26:34.000Z. Cumulative project age is **26:47:34** (96,454 seconds); cumulative AI waiting is **1:15:14** (4,514 seconds, approximately 75 minutes). This adds 706 seconds of recovered post-release Mac/Work task intervals plus **180 estimated seconds for Linux acceptance-test responses**, agreed by the user. The earlier 600-second estimate is already included in the release baseline and was not added again. Overlapping recovered intervals were merged before rounding; internal reviewer tasks were excluded. Exact Linux intervals were unavailable after SSH authentication failed, so their estimate remains explicitly approximate. See `development-time.json` for the checkpoint and intervals. The project clock continues until retirement; the active response's tail after this cutoff carries into the next checkpoint.

Version 0.2.3 was recorded **171:51:46** after development began (618,706 elapsed seconds through 2026-09-08T20:30:45.947Z). Cumulative AI waiting is **1:36:04** (5,764 seconds, approximately 96 minutes). The increment since the preceding documentation checkpoint is 1,250 seconds: 943 seconds recovered from Mac development and Work task timestamps, an explicitly estimated 60 seconds for the separate Linux CLI evidence run, and 247 seconds of the active release turn through the pre-commit cutoff. Previously recorded 600-second and 180-second estimates were not added again. Exact final-response delivery may trail the release timestamp by a few seconds; that tail belongs to the next checkpoint.

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
