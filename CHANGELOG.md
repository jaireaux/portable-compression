# Changelog

## 0.3.1 — 2026-09-16

- Front-load compress, archive, package, ZIP, TAR.GZ, extract, unpack, and unzip in skill discovery metadata.
- Explicitly enable implicit invocation in `agents/openai.yaml`; retain explicit Codex and ChatGPT Work invocation.
- Document the opt-in global Codex archive rule, fail-closed behavior, enforcement boundaries, and separate production/development configurations.
- Add routing metadata checks and an opt-in live prompt-test harness that records the actual selected skill and helper.
- Preserve the v0.3.0 helper byte-for-byte: one-helper-attempt workflow, deterministic verification, collisions, overwrite protections, and rejection of unsafe extraction remain unchanged.

## 0.3.0

Added safe ZIP and TAR.GZ extraction and explicit collision choices. Historical acceptance evidence remains in the README.
