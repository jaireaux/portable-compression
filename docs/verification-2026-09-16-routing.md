# Archive routing verification — 2026-09-16

Candidate observations recorded 2026-09-16 18:30 EDT. Later rollout updates appear below; earlier findings are retained as history.

**Latest acceptance — 2026-09-23:** The targeted ZIP and TAR.GZ creation/collision/keep-both cycles are complete as reported under the modified Mac `project-edit` profile. See [completed default-profile acceptance](#completed-default-profile-acceptance--2026-09-23) for evidence and limits; earlier pending checkpoints below are historical.

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

The release preflight repeated the complete archive regression suite, routing metadata tests, plugin validator, skill validator, and whitespace checks on Mac: **PASS**. GitHub `main` had no new commits to merge.

At 18:56 EDT, source commit `60db0450c09c8c7ccb8610609432e945a5e0771d` was published on `main`, tagged `v0.3.1`, and published as the [GitHub release](https://github.com/jaireaux/portable-compression/releases/tag/v0.3.1). This is production 0.3.1 without development cachebuster metadata. The marketplace refresh and plugin-install CLI then installed production 0.3.1 on both hosts:

- Mac: `/Users/jaireaux/.codex/plugins/cache/rollerfeet-plugins/portable-compression/0.3.1`
- LNM: `/home/jaireaux/.codex/plugins/cache/rollerfeet-plugins/portable-compression/0.3.1`

Verification at 18:58 EDT: **PASS** — both installed manifests, skill documents, invocation-policy files, and helpers match release source byte-for-byte by SHA-256. Both obsolete development-version cache paths are absent, and normal configuration inspection shows only `portable-compression@rollerfeet-plugins` enabled for this plugin. The unchanged helper fingerprint remains the one recorded above. No source folder, user fixture, or credential was removed.

Fresh production smoke tests ran outside the repository using each host's normal Codex home, not an isolated candidate home. Mac completed 18:57–18:58 EDT and LNM completed 18:57–18:58 EDT: **3/3 PASS on each host**. Explicit `$compress-files` ZIP creation, implicit “Unzip” extraction, and implicit colliding “Extract” each read the production 0.3.1 skill and ran its own helper exactly once, with no extra operation commands. Extraction bytes matched the fixture; collisions left them intact and displayed the exact final question. Tests retained workspace-write sandboxing and excluded remote app connectors only for these invocations. This establishes production CLI selection, not native ChatGPT Work behavior.

Temporary production-test evidence: Mac `/private/tmp/portable-compression-production.J7wMU3/results.json`; LNM `/tmp/portable-compression-production.OsYKm9/results.json`. As above, these are working test locations, not agreed permanent retention. Existing desktop/CLI conversations must start fresh to load the changed catalog. The release tag remains pinned to the source release commit; this post-install evidence is a later documentation-only update.

The [release timing checkpoint](timing-0.3.1.json) recovers main-task intervals after the previous v0.2.3 boundary. It does not invent estimates for unrecorded responses in other clients; detailed timing limitations are retained there.

## Native Mac Work follow-up and permissions handoff — 2026-09-17

Recorded 2026-09-17 21:01 EDT. This supplements the historical native-Work limitations above; it does not reclassify CLI tests as Work tests.

Verification: read the actual tool history and local session permission context for **Compress specified files**, task `01a0ac76-1ae0-7e11-bfd2-775cb76b1bc4`, and compare with Johnny's screenshots and audit report. Source: `/Users/jaireaux/.codex/sessions/2026/09/16/rollout-2026-09-16T19-03-36-01a0ac76-1ae0-7e11-bfd2-775cb76b1bc4.jsonl`. Destination: this technical record and the existing Notion project record. Result: **PASS for the observed four-operation Mac Work sequence**, not sandbox-only acceptance.

- Explicit creation used the installed `rollerfeet-plugins/portable-compression/0.3.1` skill and helper: three files, 72,306 input bytes, 28,498 ZIP bytes.
- Implicit extraction returned three files and 72,306 extracted bytes; ZIP SHA-256 `18cbfb6c7e5e23c0f5eade8af861ac1e048a4dd563897701d8cb735ad5db0fcf`.
- A fresh extraction without a collision policy returned `decision_required`, three collisions, and the exact visible collision question. The subsequent user `c` choice produced `cancelled`.
- Each operation used one installed helper invocation; no alternative archive implementation or ancillary operation command appears in the tool history. The installed-directory version is proved; that task did not read the manifest.
- The initial sandboxed skill read failed with `Operation not permitted`; its escalated retry succeeded. All four helper calls requested `require_escalated` without first trying the helper in the sandbox. Therefore necessity of each helper escalation is untested.

The task's effective `project-edit` profile allowed minimal runtime reads and writes within the repository and its visualization workspace. It did not list the installed plugin tree or the original attachment directory outside the repository. `approvals_reviewer` was `auto_review`: absent manual prompts do not establish absent escalation. Output paths were within the permitted project. This is a confirmed skill-read access failure and a permissions mismatch, not evidence of an archive-engine failure.

A narrow proposed addition to the existing `[permissions.project-edit.filesystem]` table in `/Users/jaireaux/.codex/config.toml` is **prepared but NOT applied**:

```toml
"/Users/jaireaux/.codex/plugins/cache/rollerfeet-plugins/portable-compression/0.3.1" = "read"
"/Users/jaireaux/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" = "read"
```

The current desktop dependency tool identifies that bundled Node executable, and local inspection shows system-library dependencies only. This does not identify the Node used by the earlier Work task: this diagnostic shell had `CODEX_PRIMARY_RUNTIME_NODE` unset and PATH selected Homebrew Node. Do not claim the proposed runtime grant is sufficient until a new Work task's actual runtime is verified. Keep test inputs and outputs within the permitted project; these two entries do not grant access to the original external attachment directory. The plugin-version-specific entry must be revisited after an upgrade.

Next action: obtain authorization to apply the narrow configuration change, confirm the actual Work runtime, and perform a fresh no-escalation Mac Work test that stops on any denial. Keep network restrictions, existing write boundaries, collision protections, and the one-helper contract intact. No permission setting, helper, release, installation, or DSHS v2 design/inventory was changed during diagnosis or this handoff. No new archive test was run. This documentation update is not yet committed or pushed. Permanent LNM/Drive evidence retention remains pending the previously outstanding destination choice; no transfer is claimed.

## Native Mac Work sandbox test and runtime selection — 2026-09-18

Recorded 2026-09-18 16:26 EDT. This dated follow-up supersedes the pending configuration proposal above without removing its failure history. Evidence for the Work operations is Johnny's supplied screenshots and copied command/result report; the underlying Work tool events were not independently reread in this follow-up.

### Separate permissions profile and observed test

With Johnny's authorization, a separate `portable-compression-test` profile was added to `/Users/jaireaux/.codex/config.toml`, extending `project-edit`. It adds read-only access to the installed Portable Compression 0.3.1 directory, the bundled Node executable, and `/System/Library/OpenSSL/openssl.cnf`. Network remains disabled, write boundaries are inherited, and `default_permissions = "project-edit"` is unchanged. Codex accepted the configuration. The profile appeared selected in a subsequent fresh Work task after the user was advised to restart the app; that does not establish a universal reload requirement.

Historical diagnostics: the runtime variable was unset and bare `node` failed. Using the explicit bundled executable reached an OpenSSL startup error because the system configuration file could not be read. After selecting the test profile, a malformed JavaScript diagnostic failed with a syntax error, demonstrating that Node had started but not completing the diagnostic. The corrected diagnostic then returned exit 0 and identified `/Users/jaireaux/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`, version `v24.19.0` (screenshot captured 2026-09-18 16:15 EDT).

Verification: review user-supplied Work command/result report for installed-path skill read, creation, and extraction. Source: repository `README.md`. Destinations: `outputs/sandbox-node-test-20260918.zip`, then the existing `outputs` directory. Result: **PASS as reported by the Work task** — skill read and both helper calls requested `use_default`; read and helpers exited 0; both helpers returned `ok: true`; exactly one helper invocation per archive operation. Creation: one file, 19,810 input bytes, 8,146 archive bytes. Extraction: one file, 19,810 extracted bytes, collision policy `none`, zero renamed files. Both results report archive SHA-256 `b557cf9a23649e12c99c854e6e96db0519147f3daad0ea30bead5c1d69c690f8` (not a standalone extracted-file hash).

Both commands explicitly selected bundled Node and the helper beneath `rollerfeet-plugins/portable-compression/0.3.1`. This supports sandbox-only ZIP operation under this specific test profile and project-local input/output arrangement. It does not prove default-profile operation, automatic runtime selection, attachment access outside the project, TAR.GZ or collision behavior under this profile, or equivalent behavior on LNM/cloud/mobile.

### Local automatic-selection configuration

At 2026-09-18 16:26 EDT, added a machine-local `/Users/jaireaux/Software/portable-compression/.codex/config.toml` setting `shell_environment_policy.set.CODEX_PRIMARY_RUNTIME_NODE` to the confirmed bundled Node path. This is a project-scoped environment setting, not a member of the permissions profile: it can apply to trusted tasks in this checkout regardless of which permissions profile is selected. It grants no access and does not change the selected/default permissions. The existing global environment settings were preserved.

The exact file is excluded by `/.codex/config.toml` in `.gitignore`; the personal runtime path must not ship as plugin configuration. This is a local test setup, not a portable deployment solution or new release. Removing that local file rolls back this runtime override; do not delete any later unrelated settings if the file is subsequently expanded. The installed helper/skill, plugin manifests, release version, and DSHS v2 design/inventory were not changed.

Verification: configuration readback, `git check-ignore -v .codex/config.toml`, and bundled Codex `features list` from this checkout all succeeded; `git diff --check` passed. Official configuration references describe trusted project layers and explicit shell environment values: [Config basics](https://learn.chatgpt.com/docs/config-file/config-basic), [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference). These checks do **not** establish that a fresh native Work task has loaded the environment value.

Next gate: in a fresh Work chat in this project with `portable-compression-test` selected, report only the runtime variable and run the normal skill runtime-selection expression once, without elevation or fallback discovery. If that passes, repeat an archive test without naming the executable in the prompt. No new archive operation was run by this documentation/configuration turn. Changes remain uncommitted/unpushed; permanent LNM/Drive evidence retention remains pending the prior destination decision.

## Automatic runtime ZIP acceptance and break checkpoint — 2026-09-18

Recorded 2026-09-18 16:44 EDT. The automatic-selection gate above is now **PASS as reported in native Mac ChatGPT Work**. Earlier checkpoints remain historical. Evidence is Johnny's screenshots and complete copied extraction JSON, not an independent reread of the underlying tool events or a new test in this documentation task.

### Evidence and results

Work task: **Run runtime-selection diagnostic**, working in `/Users/jaireaux/Software/portable-compression` with the separate `portable-compression-test` profile selected. Runtime diagnostic screenshot captured at 16:30:18 EDT; creation at 16:31:41; collision detection at 16:37:56; keep-both at 16:38:10. These are screenshot capture times, not exact execution durations. Originals remain on Johnny's Desktop and attached in the development conversation; no durable evidence transfer is claimed.

| Check | Reported result |
| --- | --- |
| Project environment loaded | `CODEX_PRIMARY_RUNTIME_NODE` contains the configured bundled Node path. |
| Runtime diagnostic | `use_default`, exit 0; executable `/Users/jaireaux/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`, version `v24.19.0`. |
| ZIP creation | `use_default`, exit 0, `ok: true`; one file, 19,810 input bytes, 8,146 archive bytes. |
| Extraction without policy | `use_default`, exit 2, `decision_required`; one collision, `README.md`; reported no writes; exact collision question displayed as final line. |
| Explicit `k` response | One new helper invocation with `--collision keep-both`; `use_default`, exit 0, `ok: true`; one file, 19,810 extracted bytes, one renamed file. |

All three archive commands use the normal `"${CODEX_PRIMARY_RUNTIME_NODE:-node}"` expression and the installed helper at `/Users/jaireaux/.codex/plugins/cache/rollerfeet-plugins/portable-compression/0.3.1/skills/compress-files/../../scripts/compress.cjs`. The reported loaded skill was reused from the earlier successful `use_default` read. This establishes the installed-directory identity in the reported commands; the later screenshots do not independently inspect the manifest. Exactly one helper invocation is reported per attempt, with no runtime override in the command. No elevated execution is reported for these tests.

Creation used repository `README.md` as input and `outputs/automatic-runtime-test-20260918.zip` as output. Both extraction attempts used that archive and the existing `outputs` directory. The first attempt supplied no collision policy; only the user-authorized retry supplied `--collision keep-both`. The exact renamed filename was not returned and was not separately inspected.

Complete keep-both JSON supplied by Johnny (chat-format escaping of underscores normalized):

```json
{"ok":true,"operation":"extract","format":"zip","input":"/Users/jaireaux/Software/portable-compression/outputs/automatic-runtime-test-20260918.zip","output_directory":"/Users/jaireaux/Software/portable-compression/outputs","archive_bytes":8146,"extracted_bytes":19810,"file_count":1,"collision_policy":"keep-both","renamed_count":1,"sha256":"b557cf9a23649e12c99c854e6e96db0519147f3daad0ea30bead5c1d69c690f8"}
```

The archive SHA-256 matches both automatic-selection creation and the earlier explicit-runtime creation with the same input. It is an archive fingerprint, not an independently calculated hash of extracted bytes. Successful extraction verification is reported by the helper; no separate checksum/listing command was run here.

### Configuration needed for this observed pass

1. Production 0.3.1 remains installed. The separate global `portable-compression-test` profile extends `project-edit`, granting only read access to this installed plugin version, bundled Node executable, and system OpenSSL configuration file. Network remains disabled and existing write boundaries remain inherited. Global default remains `project-edit`.
2. The trusted checkout's local `.codex/config.toml` supplies `CODEX_PRIMARY_RUNTIME_NODE` through `shell_environment_policy.set`. This selects a runtime but grants no filesystem access. It applies at project scope, not solely to the test permissions profile.
3. Select the test profile in a fresh native Work task in this checkout; keep inputs and outputs inside the authorized project. Use normal skill runtime selection, normal permissions, and stop on denial. Do not bypass OpenSSL configuration, search for alternate runtimes, or escalate silently.

This is a machine-local test setup, not a portable installation recipe. The personal runtime configuration remains Git-ignored and must not ship with the plugin. Version-specific read grants need review on upgrade. For rollback, remove only the test-profile tables from the global configuration and only the runtime override from the local configuration, preserving any unrelated settings; rollback was **not** performed. No settings were changed during this recording turn.

### Limits and exact restart point

- This completes the controlled ZIP cycle under the separate Mac test profile. It does not establish unchanged default-profile compatibility, unrestricted attachment access, cold-start implicit selection, TAR.GZ, overwrite/cancel/unsafe-path behavior under this profile, or equivalent behavior on LNM/cloud/mobile.
- Helper safety/verification are technical protections once the correct helper runs. Mandatory routing and one-helper behavior are persistent instructions; correct skill selection/adherence still matter. Host permissions remain a separate technical boundary.
- After the break, the next useful test is a controlled TAR.GZ creation/extraction cycle in the same profile, retaining one helper per attempt and stopping on denial. Broader/default-profile rollout requires a separate decision; do not promote this local setup automatically.
- Documentation standard remains normative DSHS v1. The dedicated DSHS v2 task should later incorporate the proven profile/runtime scope, narrow read dependencies, distinction between environment selection and access, evidence provenance, and limits. No DSHS v2 design/inventory edits were made.
- This checkpoint is a break, not a new release. No archive operation, engine/skill/version/install change, commit, push, or evidence transfer occurred in this recording turn. `.gitignore` and this verification record remain modified; existing untracked fixtures/outputs are preserved. Permanent LNM/Drive retention remains pending the earlier destination decision. Timing totals are not advanced or estimated from screenshot timestamps.

## TAR.GZ acceptance and authorized default-profile read grants — 2026-09-22

Recorded 2026-09-22 16:49 EDT. This supplements the September 18 checkpoint. Sources are Johnny's supplied screenshot, copied Work audits/helper results, and terminal output; the underlying Work tool events and LNM loaded AppArmor state were not independently reread. Configuration verification below was performed directly on the Mac.

### Reported LNM maintenance check

The resolved `/home/jaireaux/.local/bin/codex` path matches the attachment in `/etc/apparmor.d/codex-userns`: `/home/jaireaux/.codex/packages/standalone/releases/0.154.0-x86_64-unknown-linux-musl/bin/codex`. The on-disk profile retains `flags=(default_allow)` and `userns,`. Johnny reports exit 0 for `/home/jaireaux/.local/bin/codex sandbox /usr/bin/true`: **PASS for basic sandbox startup as reported**, not an archive test, direct loaded-profile inspection, or new check of the kernel restriction setting. No LNM configuration edit or reload was needed or performed here.

### Native Mac Work TAR.GZ evidence

The initial **Create test archive** screenshot (2026-09-22 16:39:06 EDT capture) showed `project-edit` selected. Its audit reported the installed 0.3.1 skill read failing with `Operation not permitted` under `use_default`, followed by a successful `require_escalated` read. Creation and extraction each used one helper with `require_escalated` and returned exit 0 / `ok: true`. The archive was repository-root `test-2026-09-22-a.tar.gz`; extraction created `test2026-09-22-a`. This is functional success, **not** sandbox-only acceptance. The audit does not identify the expanded Node executable or prove whether an interactive approval appeared. It also does not establish compliance with the skill's narrow new-output-directory rule for that initially new extraction folder; the controlled follow-up deliberately used the now-existing folder.

The subsequent controlled test was requested under `portable-compression-test`, with normal permissions and stop-on-denial requirements. Johnny's report supplies the installed skill path `/Users/jaireaux/.codex/plugins/cache/rollerfeet-plugins/portable-compression/0.3.1/skills/compress-files/SKILL.md`, successful `use_default` skill read, and these results:

| Attempt | Permission / exit | Result |
| --- | --- | --- |
| TAR.GZ creation | `use_default` / 0 | `ok: true`; two files, 1,799 input bytes, 536 archive bytes. |
| First extraction, no collision policy | `use_default` / 2 | `decision_required`; both XML names collide; no writes reported; exact question displayed and retry withheld. |
| Retry after Johnny's `k` | `use_default` / 0 | `ok: true`; `keep-both`; two files, 1,799 extracted bytes, two renamed files. |

All three commands used `"${CODEX_PRIMARY_RUNTIME_NODE:-node}"` with the same installed 0.3.1 package-relative `scripts/compress.cjs`, exactly one helper per attempt. No alternative archive implementation or ancillary verification commands were reported. The expression is evidenced; this September 22 report does not independently identify its expanded Node executable. The previous September 18 runtime diagnostic remains separate evidence.

Inputs were the two XML files in `/Users/jaireaux/Software/portable-compression/portable-compression-v030-work-zip-extracted`: `filezilla_u35317274-jaireaux.xml` and `filezilla_u35317274.xml`. Archive output was `outputs/sandbox-targz-test-20260922.tar.gz`; extraction destination was the existing `test2026-09-22-a` directory. XML contents were not copied into documentation.

Complete successful extraction JSON (chat-format escaping normalized):

```json
{"ok":true,"operation":"extract","format":"tar.gz","input":"/Users/jaireaux/Software/portable-compression/outputs/sandbox-targz-test-20260922.tar.gz","output_directory":"/Users/jaireaux/Software/portable-compression/test2026-09-22-a","archive_bytes":536,"extracted_bytes":1799,"file_count":2,"collision_policy":"keep-both","renamed_count":2,"sha256":"1cd5a09012d349fa6e3817f017e66db81dc3b37917eb97280dbb4f02447f8998"}
```

The archive SHA-256 matches creation and the earlier elevated TAR.GZ result. It is not an independently computed extracted-file hash. **PASS as reported for the controlled TAR.GZ creation/collision/keep-both sequence.** Together with September 18 ZIP, both formats now have this sequence reported under the separate Mac test setup. No claim of default-profile acceptance follows from those results.

### Authorized Mac configuration change

Johnny explicitly approved recording the results and adding the three tested read grants to ordinary `project-edit`, leaving the fresh native Work acceptance test for him. At 2026-09-22 16:48 EDT, added only these entries to the existing `[permissions.project-edit.filesystem]` table in `/Users/jaireaux/.codex/config.toml`:

```toml
"/Users/jaireaux/.codex/plugins/cache/rollerfeet-plugins/portable-compression/0.3.1" = "read"
"/Users/jaireaux/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" = "read"
"/System/Library/OpenSSL/openssl.cnf" = "read"
```

Pre-change backup: `/Users/jaireaux/.codex/portable-compression-config-backup.ZOscDs/config.before.toml`. The containing directory is mode 0700 and backup file mode 0600. Backup was byte-compared before the edit; subsequent unified diff shows exactly the three added lines and no unrelated changes. This backup contains private user configuration and is not a repository or public evidence artifact.

Verification at 2026-09-22 16:49 EDT: **PASS for exact configuration scope and CLI loading**. Bundled Codex `features list` with `default_permissions="project-edit"` returned exit 0. A warning about inability to create PATH aliases appeared; this does not prove a new Work task loaded the changed policy. Runtime acceptance remains **PENDING**.

The default profile name stays `project-edit`; workspace writes and disabled network are unchanged. The separate test profile is preserved. The project-local, Git-ignored Node selection setting is unchanged. Because the edited profile lives in the global Mac configuration, its three read grants apply wherever that profile is selected, not just this repository. Node environment selection remains project-local. Read grants do not permit writes to the added paths; no broad root access, network access, escalation bypass, or OpenSSL bypass was added. Profile semantics: [official OpenAI permissions documentation](https://learn.chatgpt.com/docs/permissions).

Rollback: remove only these three entries from `[permissions.project-edit.filesystem]`, using the private backup as the comparison baseline. Do not overwrite later unrelated configuration with the full backup. Version-specific grants need review after plugin/runtime upgrades. No LNM profile change is included.

### Pending acceptance and handoff

Start a fresh native Mac Work chat in this same project and explicitly select **project-edit**, not portable-compression-test. Test a new archive output using the production skill, normal runtime expression, and `use_default` for the skill read and every helper attempt; stop on denial without escalation or runtime substitution. Exercise creation, fresh collision detection in an existing destination, then the user's explicit keep-both choice. Report actual commands, permission requests, exits, and complete JSON. Repeat for the other format before calling both formats accepted under the modified default profile.

This implementation turn ran no archive operation. Plugin code, cache source, skill contract, manifests, version and installs are unchanged; no commit or push. Existing dirty documentation and untracked fixtures/outputs remain intact. Permanent LNM/Drive evidence retention still awaits the previously pending destination choice. DSHS v1 was refreshed; DSHS v2 design/inventory were not edited. Its dedicated task should later incorporate the now-global Mac read-grant scope, still-project-local runtime selection, configuration backup/rollback, and the distinction between test-profile passes and pending default-profile acceptance.

## Completed default-profile acceptance — 2026-09-23

Recorded 2026-09-23 12:49 EDT. This closes the targeted native Mac Work acceptance gate above, based on Johnny's supplied command/result reports for the modified `project-edit` setup. Exact execution times are not available; this is a documentation timestamp. Earlier failures, separate-profile passes, and pending checkpoints remain historical.

Verification: review the supplied skill-read results, actual helper commands, requested permission modes, exit statuses, and complete JSON. Source: Johnny's copied Work reports in the development conversation. Destinations: this technical record and the existing Notion project page. Result: **PASS as reported for both targeted format cycles**. No Work tool events, effective sandbox policy, manifest, archive contents, or resulting filesystem state were independently inspected during this recording turn; no archive commands were rerun.

### Installed helper and results

Both cycles report a successful skill read at `/Users/jaireaux/.codex/plugins/cache/rollerfeet-plugins/portable-compression/0.3.1/skills/compress-files/SKILL.md`, exit 0 and `use_default`. All reported helper attempts likewise requested `use_default`, using this unchanged command prefix:

```bash
"${CODEX_PRIMARY_RUNTIME_NODE:-node}" "/Users/jaireaux/.codex/plugins/cache/rollerfeet-plugins/portable-compression/0.3.1/skills/compress-files/../../scripts/compress.cjs"
```

This identifies the installed-directory version and actual helper path in the reports, not an independent manifest check. The runtime expression is recorded; its expanded executable was not reported for these cycles. The September 18 bundled Node diagnostic remains separate evidence.

| Format / attempt | Requested permission / exit | Reported result |
| --- | --- | --- |
| TAR.GZ creation | `use_default` / 0 | `ok: true`; 2 files, 1,799 input bytes, 536 archive bytes. |
| TAR.GZ extraction without policy | `use_default` / 2 | `decision_required`; 2 XML collisions; no writes reported; visible question and no automatic policy retry. |
| TAR.GZ keep-both retry | `use_default` / 0 | `ok: true`; 2 files, 1,799 extracted bytes, `renamed_count: 2`. |
| ZIP creation | `use_default` / 0 | `ok: true`; 2 files, 1,799 input bytes, 1,061 archive bytes. |
| ZIP initial extraction | `use_default` / 0 | `ok: true`; 2 files, 1,799 extracted bytes, `collision_policy: "none"`, `renamed_count: 0`. |
| ZIP repeat extraction without policy | `use_default` / 2 | `decision_required`; 2 XML collisions; no writes reported; visible question. |
| ZIP keep-both retry | `use_default` / 0 | `ok: true`; 2 files, 1,799 extracted bytes, `renamed_count: 2`. |

Each reported attempt invokes the installed helper once. Policy-free extraction commands omit `--collision`; keep-both retries append `--collision keep-both`. Both collision responses identify `filezilla_u35317274-jaireaux.xml` and `filezilla_u35317274.xml` and present the exact question: “Collision found: (o)verwrite, (k)eep both, or (c)ancel?” The retry reports show keep-both execution; the latest copied ZIP excerpt does not itself include the intervening user-choice message. No alternative archive tools or separate verification commands appear in the supplied reports.

### Sources, destinations, and fingerprints

Repository root for the following relative paths: `/Users/jaireaux/Software/portable-compression`.

- Inputs for both formats: `portable-compression-v030-work-zip-extracted/filezilla_u35317274-jaireaux.xml` and `portable-compression-v030-work-zip-extracted/filezilla_u35317274.xml`.
- TAR.GZ archive: `outputs/project-edit-targz-test-20260922.tar.gz`; extraction destination: existing `test2026-09-22-a`.
- ZIP archive: `outputs/project-edit-targz-test-20260923.zip`; extraction destination: `test2026-09-23-a`, existing by the repeat attempt. Despite `targz` in its name, the command and JSON explicitly identify ZIP; no rename or retest is needed for this label.
- TAR.GZ archive SHA-256: `1cd5a09012d349fa6e3817f017e66db81dc3b37917eb97280dbb4f02447f8998`.
- ZIP archive SHA-256: `3b2f50b7e97d7031b6cc51c0a485b9c8ed41e5e0792f81f006e25158fae76aa8`.

Each format's creation and successful extraction report the same archive fingerprint, also matching the earlier results for these inputs. These are archive hashes, not independent hashes of extracted files. Verification and preservation are helper-reported; renamed filenames were not returned or separately inspected. XML payloads are not copied into documentation.

Complete final TAR.GZ extraction JSON (chat-format escaping normalized):

```json
{"ok":true,"operation":"extract","format":"tar.gz","input":"/Users/jaireaux/Software/portable-compression/outputs/project-edit-targz-test-20260922.tar.gz","output_directory":"/Users/jaireaux/Software/portable-compression/test2026-09-22-a","archive_bytes":536,"extracted_bytes":1799,"file_count":2,"collision_policy":"keep-both","renamed_count":2,"sha256":"1cd5a09012d349fa6e3817f017e66db81dc3b37917eb97280dbb4f02447f8998"}
```

Complete final ZIP extraction JSON:

```json
{"ok":true,"operation":"extract","format":"zip","input":"/Users/jaireaux/Software/portable-compression/outputs/project-edit-targz-test-20260923.zip","output_directory":"/Users/jaireaux/Software/portable-compression/test2026-09-23-a","archive_bytes":1061,"extracted_bytes":1799,"file_count":2,"collision_policy":"keep-both","renamed_count":2,"sha256":"3b2f50b7e97d7031b6cc51c0a485b9c8ed41e5e0792f81f006e25158fae76aa8"}
```

### Acceptance boundary and documentation handoff

- The requested normal-permission format cycles are complete for this modified Mac profile and trusted checkout. `use_default` records the requested permission mode, not an independent inspection of OS sandbox enforcement or proof of prompt-free execution. This is not acceptance of the original unmodified default profile or a universal installation recipe.
- The existing global profile grants and project-local runtime override remain prerequisites for the observed setup. No settings changed during this recording turn. No new evidence establishes external attachment access, cold-start implicit selection, other hosts/cloud/mobile, or overwrite/cancel/unsafe-path branches under this modified profile. New-directory rule compliance is not independently established for the initial ZIP extraction; the collision test used its existing destination.
- Helper safety and verification are technical protections once the correct helper runs. Mandatory routing and the one-helper contract are persistent instructions; correct skill selection and adherence remain model-dependent. Host permissions are a separate technical boundary.
- Production remains v0.3.1. This is a documentation-only acceptance update, not a new plugin release. Proposed commit scope is this record plus the existing `.gitignore` safeguard for machine-local runtime configuration; do not include the private configuration, its backup, archives, extracted fixtures, or other untracked outputs. No staging, commit, or push is performed by this recording turn.
- Normative DSHS v1 was reread. The dedicated DSHS v2 task should later incorporate the completed, provenance-qualified Mac acceptance and the distinction between global read grants, project-local runtime selection, instruction-based routing, and technical protections. No DSHS v2 design/inventory was edited.
- Permanent LNM/Google Drive evidence retention remains pending the earlier destination choice; no transfer is claimed. Existing fixtures are preserved. Timing totals are not advanced or inferred from report dates; reconcile recorded intervals when an actual Git version is authorized.

### Documentation commit checkpoint — 2026-09-23 16:51 EDT

Johnny authorized the documentation commit after review. Scope: this verification record and the existing `.gitignore` safeguard only; no push or release is authorized by this step. Whitespace validation passed and the local runtime configuration remains ignored. Test fixtures, generated archives, private configuration and its backup are excluded.

At the approximate pre-commit boundary `2026-09-23T20:51:58.153Z`, the project has been in development for approximately **22 days, 4 hours, 12 minutes**, beginning `2026-09-01 12:39 EDT` (elapsed project age, not continuous labor). Tracked cumulative AI-waiting time is approximately **8 hours, 52 minutes** (31,930 seconds).

Timing method: carry forward 26,693 seconds from `docs/timing-0.3.1.json` at `2026-09-16T22:55:11.750Z`; recover 5,237 additional seconds from this task's start-to-complete/abort event intervals, clipping at the prior cutoff and this checkpoint, and merging overlaps (58 resulting intervals, including the prior release-turn tail and current active turn). Only timestamps and event types were used; no prompt content is reproduced. Unrecorded responses in other clients are excluded, so this is a tracked total rather than complete all-client waiting. The current turn's post-checkpoint tail must carry forward to the next checkpoint. No estimate was inferred from screenshots or test-report dates.
