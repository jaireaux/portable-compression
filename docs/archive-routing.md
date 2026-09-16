# Required archive routing

## Persistent Codex rule

Add this paragraph to the effective global instruction file, preserving unrelated instructions:

> For every archive creation or extraction operation, use the Portable Compression `compress-files` skill. Do not substitute operating-system archive utilities, Python archive modules, external packages, or network services. If the skill is unavailable or fails, stop and report the operation as blocked unless the user explicitly authorizes an exception.

Codex normally reads `$CODEX_HOME/AGENTS.md` (`~/.codex/AGENTS.md` by default). A nonempty global `AGENTS.override.md` takes precedence, so inspect both first. A custom `CODEX_HOME`, more-specific project instructions, and already-running sessions need separate verification. Start a fresh task after instruction or plugin changes. See the [official AGENTS.md guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

This repository does not silently modify another user's global instructions. The paragraph is an operator opt-in policy, not a platform-wide plugin permission.

## Enforcement boundaries

| Layer | What it does | Limit |
| --- | --- | --- |
| Helper code | Deterministic creation, internal verification, safe extraction, collision detection, overwrite and path protections | Applies only when this helper actually executes; host permissions still govern access |
| Persistent global instructions | Require the skill and block silent substitutions or retries after failure | Instruction enforcement, not an OS prohibition; applies only to hosts/configurations that load it |
| Skill instructions | One helper command per attempt, explicit collision question/reply, no alternate implementation | Depends on correct selection and adherence; no promise of zero host approvals |
| Skill discovery metadata | Broad archive triggers with `allow_implicit_invocation: true` | Improves selection but cannot guarantee it |

In ChatGPT Work, explicit invocation remains **@Portable Compression**. In Codex, use the `$compress-files` picker entry and verify its `portable-compression:compress-files` catalog identity. A Mac global Codex file does not by itself configure ChatGPT Work, cloud tasks, mobile clients, or another host.

If unavailable, unsupported, or failed, report the operation as blocked and request an explicit exception before using anything else. A collision is a structured decision, not an implementation failure: display the helper's returned question and wait for the user's choice. Never reuse a choice from a previous operation.

## Production and development installations

The canonical source is this repository, not a generated `plugins/cache` directory. The GitHub-backed `portable-compression@rollerfeet-plugins` installation is the production channel. Updating local source does not update that channel until the source is published and the marketplace/plugin is refreshed.

Do not leave an old development marketplace enabled next to production: both advertise the same skill identity. Preserve source and evidence before removing an obsolete candidate registration. Use the supported plugin CLI to manage registrations; do not edit cached skills or manifests as a fix.

For development, generate a local marketplace from a disposable copy of this repository using the plugin-creator scaffold helper, validate its local source, apply the cachebuster helper, and install through the plugin CLI. Keep that installation in a separate test configuration/home with its own authorized sign-in, or install it temporarily with production excluded from that test. Never copy authentication secrets into a test tree. Remove the temporary registration after testing. Cachebuster build metadata is for development cache invalidation; a public behavior/documentation patch uses a real patch release.

## Verification

Run `node tests/test-compress.cjs` and `node tests/test-routing.cjs`, plus plugin and skill validators. Existing adversarial fixture construction and independent decoding in the test suite are test oracles, not alternate user-facing archive implementations. No new runtime dependency is introduced.

The opt-in live harness is `tests/run-prompt-tests.cjs`. Supply the CLI binary, isolated `CODEX_HOME`, a nonexistent test-results directory whose parent exists, and the exact installed candidate version as its four positional arguments. It uses account quota, disables remote app connectors only for these test invocations, retains local plugin discovery, and keeps the workspace-write sandbox. It does not enable automatic approval review or change normal installations. Read raw events when a result is incomplete; successful helper output alone does not establish successful final-response delivery. Keep authentication outside generated fixtures and remove any temporary sign-in reference when finished.

Prompt tests must run in fresh tasks and record the loaded skill path/version and actual helper command from tool events, not only the assistant's summary. Test explicit creation/extraction, implicit compress/archive/package/ZIP/TAR.GZ/extract/unpack/unzip requests, a collision question, and an unavailable-skill case. Confirm one helper command per attempt and no substitute implementation. Test logs can contain environment paths; publish only sanitized summaries.

A CLI test does not prove native ChatGPT Work behavior. Record each tested environment separately and label blocked, unavailable, or untested environments honestly. This work does not modify the DSHS v2 design or inventory; its eventual migration should incorporate the policy, host scope, production/test separation, and evidence limits.

See the [2026-09-16 verification record](verification-2026-09-16-routing.md) for candidate tests, production rollout results, and remaining evidence limits.
