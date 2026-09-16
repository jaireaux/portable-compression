# Archive routing verification — 2026-09-16

Candidate observations recorded 2026-09-16 18:30 EDT. Later rollout updates appear below; earlier findings are retained as history.

## Changes and source of truth

The following sections describe the pre-publication checkpoint. See the dated rollout section for subsequent changes.

Canonical source: `/Users/jaireaux/Software/portable-compression`, based on commit `99510a901017fdd6e42ac95236e81a8ff7ba6edc`. Source version is now **0.3.1, unreleased**. Discovery triggers, explicit implicit-invocation policy, fail-closed instructions, routing documentation, and tests changed. Generated plugin caches were inspected but never edited as source.

Both normal hosts lacked `AGENTS.md` and `AGENTS.override.md` in their default Codex homes. The exact requested global rule was installed at:

- Mac: `/Users/jaireaux/.codex/AGENTS.md`
- LNM: `/home/jaireaux/.codex/AGENTS.md`

Verification: readback and SHA-256 comparison. Result: **PASS**, both files hash to `5d63c705e43b815eafb729cf3432f4585e1155304093f065067e572f4c8cb2a9`. No unrelated instruction content existed or was removed. Test homes loaded a copy of this same rule; normal desktop tasks still require a fresh start and unambiguous installation selection.

## Installation findings

- Mac: production `portable-compression@rollerfeet-plugins` is 0.3.0; the old enabled `portable-compression@portable-compression-v030-dev` is `0.3.0+codex.20260909030500`. Its registered source `/private/tmp/portable-compression-v030-marketplace` is gone, causing normal `plugin list` to fail.
- LNM initial inspection: production was still 0.2.3 (creation only), alongside enabled `portable-compression@portable-compression-v030-linux-dev`, version `0.3.0+codex.20260909030500`. Its candidate source is under `/home/jaireaux/Software/portable-compression-v030-linux-test-candidate/marketplace`.
- LNM production was then refreshed through the marketplace/plugin CLI to the already-published **0.3.0**. This fixes the stale production version but does not remove the duplicate development installation or deploy unpublished 0.3.1.
- These pairs expose the same `portable-compression:compress-files` identity. None of the inspected old skill directories had `agents/openai.yaml`.
- Removal of obsolete development registrations/caches is **pending explicit approval** following automatic-review rejection. Nothing was removed. Canonical source and LNM's candidate source folder must remain intact.
- New candidate testing used isolated Codex homes, each with only the local candidate installation, preserving ordinary configurations. The plugin scaffold, marketplace-name validator, cachebuster, and plugin-install CLI were used. Candidate: `0.3.1+codex.20260916205330`.
- A per-invocation `plugins.<id>.enabled=false` override did **not** hide the candidate in a live probe. Do not use that override as the established isolation mechanism. Even an empty plugin home allowed filesystem discovery of nearby source; that is not proof of skill unavailability.

## Tests

Verification source: canonical helper/skill and synthetic text fixtures. Destinations: isolated installed candidate and fresh test directories on each host.

The full `tests/test-compress.cjs` regression suite and new routing metadata checks passed on **Mac and LNM**. Plugin and skill validators passed on Mac. The helper is byte-for-byte unchanged from v0.3.0 and both old development candidates: SHA-256 `9c795b60d01354e5ff6122372108f804653c49188e65b4e0420f1d42cb5c4bbd`.

| Live fresh-task case | Mac bundled CLI | LNM CLI |
| --- | --- | --- |
| Explicit `$compress-files` ZIP creation | PASS | PASS |
| Implicit compress/package/ZIP/archive creation | PASS | PASS |
| Implicit archive/TAR.GZ creation | PASS | PASS |
| Explicit `$compress-files` extraction | PASS | PASS |
| Implicit unzip | PASS | PASS |
| Implicit unpack TAR.GZ | PASS | PASS |
| Implicit extract into colliding destination | PASS: final question, original preserved | PASS: final question, original preserved |
| Missing input | PASS: one failed helper attempt, no archive/fallback | PASS: one failed helper attempt, no archive/fallback |

Each passing case was checked against actual tool events: a read of the candidate's `SKILL.md`, exactly one invocation of that installation's `scripts/compress.cjs`, correct version in both paths, helper JSON, and no ancillary operation commands. Extraction bytes were independently checked by the acceptance harness, outside the plugin operation. The collision test required the exact question as the final response line.

The 38-byte synthetic fixture produced matching cross-host fingerprints: ZIP, 158 bytes, `35065fda616ea11ac3ad42c65a91932cec39d6b1e7f7da93895dfa8700cf029a`; TAR.GZ, 135 bytes, `374ae07550068ed158581068cd2483f9734fc48d7808556d271919f71fd5dd77`.

Mac uses the desktop-bundled CLI `0.154.0-alpha.6.2`. Its successful complete matrix ran with remote app connectors excluded (`features.apps=false`) and local plugins enabled, 18:27–18:29 EDT. LNM's `0.154.0` complete matrix passed 16:58–17:00 EDT. Both used workspace-write sandboxes and isolated account-auth references; no bypass or automatic-approval option was enabled. LNM's separate `codex sandbox true` probe exited 0.

LNM also passed all eight cases on a subsequent local-plugin-only rerun. The isolation setting is test-scoped, not a change to normal app availability. Temporary sign-in references are removed after testing; the real credential files are untouched.

Historical failures retained: Mac standalone CLI 0.152.0 rejected the configured model before loading a skill. The first bundled-CLI matrix had incomplete/timed-out responses, including some successful helper executions without final delivery. One stderr log showed remote catalog request failure; not every stall's cause is established. Those runs are not counted as full passes or erased by the rerun.

An explicitly **simulated unavailable-skill** prompt on each host produced a blocked response, no tool commands, and no alternate archive implementation. This tests refusal under a stated unavailable condition, not physical removal of every accessible skill copy.

## Limits and handoff

- Native ChatGPT Work was **not tested**: this session's computer-use policy rejected access to the app. The retained `@Portable Compression` wording is not new Work execution evidence. Cloud, mobile, and other hosts are untested; do not label the plugin unavailable there without a separate check.
- Global instructions require the skill but do not technically prohibit OS/Python/network archive tools. Helper safeguards are technical only once the correct helper is selected. Implicit selection and instruction compliance remain model-dependent.
- Publishing 0.3.1 and refreshing normal production installations remain pending approval. No commit, push, tag, or public release was made for this candidate. Cumulative timing reconciliation remains due before that version is committed; no unmeasured total was invented.
- Detailed temporary evidence: Mac `/private/tmp/portable-compression-routing.L913a7` and LNM `/tmp/portable-compression-routing.ki8WIS`. These are working test locations, not permanent retention. Durable matching LNM/Google Drive retention locations still require the previously pending user choice. Raw CLI stderr may contain account-related catalog metadata and must not be published as-is.
- DSHS v1 remains normative. The DSHS v2 task should later incorporate the exact archive rule, its host/configuration scope, production/test separation, unavailable/failure behavior, and enforcement distinctions. **No DSHS v2 design or inventory changes were made here.**

## Authorized release rollout — 2026-09-16

At 18:49 EDT, following Johnny's explicit instruction to remove obsolete installs and publish/install 0.3.1, the supported plugin CLI removed `portable-compression@portable-compression-v030-dev` on Mac and `portable-compression@portable-compression-v030-linux-dev` on LNM, then removed their marketplace registrations. The canonical repository and LNM candidate source folder remain intact; the latter was checked after removal. These generated installations can be recreated from preserved source in isolated test configurations.

The release preflight repeated the complete archive regression suite, routing metadata tests, plugin validator, skill validator, and whitespace checks on Mac: **PASS**. GitHub `main` had no new commits to merge. The published version is 0.3.1 without development cachebuster metadata. Installation and post-publication checks will be recorded after they complete.

The [release timing checkpoint](timing-0.3.1.json) recovers main-task intervals after the previous v0.2.3 boundary. It does not invent estimates for unrecorded responses in other clients; detailed timing limitations are retained there.
