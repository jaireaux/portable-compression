# Sample prompts

Five copy-and-paste examples for Portable Compression, from a minimal request to a detailed extraction workflow.

Install the plugin first using the [README instructions](../README.md#install-for-testing). In ChatGPT Work, attach the input files and select **@Portable Compression** in the same message. In Codex, provide accessible local files or paths. Replace the example names with your own.

Save outputs in a folder you have authorized the host to access. For the examples below, use your current working folder; the plugin can create its immediate `outputs` child for archives. An archive must not be saved inside a folder being compressed.

## 1. Zip an attached file

```text
@Portable Compression zip this file.
```

Attach one file. The plugin chooses the output name and reports the result.

## 2. Bundle several files with a specific name

```text
@Portable Compression put all attached files into outputs/project-files.zip in the current working folder. Preserve their contents and do not replace an existing archive.
```

Attach every file you want included. If that archive already exists, creation stops without replacing it.

## 3. Package a folder as TAR.GZ and report the savings

```text
@Portable Compression compress the project-notes folder in the current working folder into outputs/project-notes.tar.gz. Include its files and subfolders. Do not overwrite an existing archive. Report the original size, archive size, percentage saved, file count, and SHA-256 hash from the helper's result.
```

Provide access to `project-notes`. The size comparison is calculated from the returned byte counts; no separate inspection is needed. Compression may not reduce the size of already-compressed files.

## 4. Extract while keeping existing copies

```text
@Portable Compression extract the attached ZIP into the existing review-copy folder in the current working folder. If filenames collide, keep both by giving the extracted copies numbered names. Report the destination, extracted file count, and number of renamed files.
```

This explicitly chooses keep-both for this request. For example, an incoming `report.txt` might become `report (2).txt`. The choice does not carry over to later extraction requests.

## 5. Extract with an explicit collision decision and full results

```text
@Portable Compression extract the attached TAR.GZ into the existing project-review folder in the current working folder. Treat this as a new request: do not reuse or infer a collision choice from earlier messages.

Use one self-contained helper invocation for the initial attempt, with no separate listing, directory, checksum, or verification commands. Let the helper validate the archive and reject unsafe paths, links, or unsupported entries.

Report the helper's complete JSON result. If it returns decision_required, also show the collisions and repeat its prompt as the final line: Collision found: (o)verwrite, (k)eep both, or (c)ancel?

Wait for my answer. Apply that choice in one new helper invocation and report its complete JSON result. If extraction succeeds, include the destination, file count, extracted bytes, collision policy, renamed count, and archive SHA-256. If another error occurs, report it and stop.
```

When asked, reply `o`, `k`, or `c` for that operation. Collision detection writes nothing; resolving it requires a second helper invocation. The SHA-256 identifies the input archive.

The plugin's safety checks apply to every example, including the shortest prompt. Host-managed file-access and execution approvals may still appear.
