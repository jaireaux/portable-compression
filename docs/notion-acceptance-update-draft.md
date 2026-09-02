# Portable Compression — Notion update draft

Status: approved by Johnny on 2026-09-02; acceptance update published to Notion and verified. This file preserves the approved review draft below as history. The documentation checkpoint is reconciled in README.md and development-time.json; the Linux estimate of 180 seconds was explicitly approved.

Destination: [Project: Portable Compression Plugin](https://app.notion.com/p/3ce76785d91981d9bb65c5313ecb1bdd).

Documentation standard: [Documentation, Storage & Handoff Standard (DSHS)](https://app.notion.com/p/3c676785d9198120a3d5fac250d63583).

## Approved review text (historical)

Portable Compression v0.2.2 remains published on `main` at `d988e811064cca1d440f286f1b6abd7b4d93faad`. ZIP and TAR.GZ acceptance results match the established fingerprints on Mac Codex, Linux Codex, and ChatGPT Work on Mac. Mac and Work tests had zero user-reported prompts; Linux had two approvals per completed matching test. Mac/Linux evidence confirms one archive-creation command after the skill read; Work's full command details remain uninspected. Documentation changes are awaiting review; no compression-code change is indicated by these tests.

## Approved acceptance update — 2026-09-02

### Results and evidence

| Environment | ZIP | TAR.GZ | Approvals | Evidence limits |
| --- | --- | --- | --- | --- |
| Mac Codex | 1,061 bytes; matching SHA-256 | 536 bytes; matching SHA-256 | 0 each, reported by Johnny | Output files and task histories inspected directly; separate new tasks, not proven permission-reset cold starts |
| Linux Codex on LNM | 1,061 bytes; matching SHA-256 | 536 bytes; matching SHA-256 | 2 each: read skill, run helper | Screenshots; ZIP was a follow-up, TAR.GZ a fresh session on CLI 0.152.1; archives not independently read here |
| ChatGPT Work on Mac | 1,061 bytes; matching SHA-256 | 536 bytes; matching SHA-256 | 0 each, reported by Johnny | Saved outputs checked directly; visible command summaries only, not full command/JSON inspection |

SHA-256 fingerprints:

- ZIP: `3b2f50b7e97d7031b6cc51c0a485b9c8ed41e5e0792f81f006e25158fae76aa8`
- TAR.GZ: `1cd5a09012d349fa6e3817f017e66db81dc3b37917eb97280dbb4f02447f8998`

Verification: local file-size/SHA-256 checks for Mac and saved Work outputs; screenshot comparison for Linux; Mac task-history inspection and Linux command screenshots for the single-command contract. Result: PASS for matching fixture fingerprints in both formats across the tested environments. Separate development-side checks are not counted as commands in the plugin test.

Screenshot evidence captured on 2026-09-02: Linux directory-input run at 13:30 EDT; matching file-input ZIP at 13:32–13:33 EDT; fresh-session TAR.GZ at 13:35 EDT. Work ZIP screenshots at 13:39–13:40 EDT and TAR.GZ at 13:46 EDT. These are screenshot capture times, not exact execution or AI-response timestamps.

### Interpretation and historical exceptions

- The two Linux prompts authorized the instruction read and the single self-contained helper invocation. There were no separate preflight, directory-creation, or postflight commands in the shown completed tests.
- Johnny approved each Linux request "this time". Repetition is possible under unchanged permissions. The exact Linux policy cause was not inspected; no permission setting was changed. Zero prompts on the Mac is an observation, not a universal guarantee.
- The initial Linux directory-root ZIP was 1,089 bytes. Passing `inputs` instead of individual files changes the packaging case. An `inputs/` prefix would explain the 28-byte difference, but the member names were not directly inspected. The later individual-file ZIP matched the baseline. Preserve the earlier canceled `/input` attempt separately.
- CLI 0.147.0 / Node 22.23.2 / Ubuntu 24.04 x86-64 describe the earlier user-reported v0.2.1 environment. The v0.2.2 TAR.GZ screenshot explicitly shows CLI 0.152.1; later Node/OS versions were not rechecked.
- The Mac ZIP filename contains `iphone-test`, but Johnny confirmed it was created on the Mac. These tests do not establish iPhone execution or a separate cloud execution environment.

### Timing continuity

Preserve the published v0.2.2 checkpoint: original start `2026-09-01T12:39:00-04:00`; cutoff `2026-09-02T14:48:40Z`; project age 79,780 seconds (22:09:40); cumulative AI waiting 3,628 seconds (1:00:28). Preserve v0.2.1's 24,982 project seconds and 2,394 AI-waiting seconds as historical values.

Project time continues until retirement and is recalculated from the original start at the next authorized Git update. AI time accumulates project-related prompt-to-complete-response intervals, including testing tasks and the prior release turn's post-cutoff tail. Recover timestamps, clip at the published cutoff, exclude already counted intervals, and merge overlaps before calculating a new increment. The earlier 600-second testing estimate is already included and must not be added again. Missing durations require an explicitly agreed estimate; screenshot times and displayed work durations are not exact delivery times. This draft does not finalize new totals. README and `development-time.json` will be updated together when the next commit is authorized.

### Evidence locations and retention

- Mac development repository: `/Users/jaireaux/Software/portable-compression`.
- Mac ZIP: `outputs/portable-compression-v022-iphone-test.zip` beneath that repository.
- Mac TAR.GZ: `outputs/portable-compression-v022-mac-test.tar.gz`.
- Work ZIP: `portable-compression-v022-work-test.zip` at the repository root.
- Work TAR.GZ: `outputs/portable-compression-v022-work-test.tar.gz`.
- LNM test directory shown in commands: `/home/jaireaux/Software/portable-compression-linux-test`; matching outputs are `portable-compression-v022-linux-files-test.zip` and `portable-compression-v022-linux-files-test.tar.gz`.
- Screenshots remain in Johnny's Mac Desktop and this development conversation. No XML contents, credentials, or archive payloads are included in these documentation changes.
- DSHS dual retention for the new evidence/documents has not been performed. The permanent evidence directory on LNM and matching Google Drive destination need confirmation before creating or transferring retained copies. Existing Linux test outputs are working evidence, not proof of a verified dual-retention backup.

### Next action after review

Approve or revise this documentation. On approval, update this existing Notion project page, preserving the historical release and test sections; reconcile the post-publication timing before any authorized Git commit. Full Work command details remain a limited evidence gap, not a demonstrated compression failure. Do not commit, push, relax permissions, or transfer evidence as part of this draft review.
