# whichskills.dev

**Which skills are worth installing?** A public census of Claude Code and Codex skills with receipts.

Live: https://whichskills.dev

We pulled the 200 most-starred GitHub repos that publish `SKILL.md` files, read all of them the same way, and published every number with a link to the file at the commit we read. Not a scanner. A census with receipts.

Snapshot 2026-09-20: 157 repos with skills, 18,041 skills, 557 plugin manifests, 36 % byte-identical copies, 545 flagged bodies read by Jev, 0 skills that read as malware aimed at the installing user.

## What the page shows

- **Findings.** Four things the snapshot says. Autonomy overrides rather than malware. Live payloads shipped as teaching material. A third of skills are copies. Stars measure the author, not the files.
- **Fingerprints.** The twelve most-starred repos as radar shapes over the corpus median, on seven traits.
- **War of the Skill Clones.** Who copied whom, as a flow graph. Click a repo for its bodies and whether each copy credits its source. Same-owner mirrors are labelled.
- **Safety read.** Every body Jev scored 1.5 of 3 or above, its risk distribution, the kind of risk, and a human category after opening the file at the pinned commit. Nothing on the page is labelled malicious.
- **The census.** All 157 repos, sortable.
- **Method.** Every step, the severity weights, and the verbatim Jev questions with their criteria.

## How the numbers are made

1. Discovery through GitHub repo search, six queries and seven topics, sorted by stars, forks excluded, top 200.
2. Blobless clones with full history, so first-commit dates are real.
3. Every `SKILL.md` and every plugin manifest (`.claude-plugin/plugin.json`, `hooks/hooks.json`, `.mcp.json`) is loaded. Hidden directories and `node_modules` are skipped.
4. A static pre-scan with fourteen regex classes over every text file a skill ships. Free and deliberately noisy; it only builds the queue.
5. Jev, a typed-judgment model from TypeSafe, reads each queued body with its full text and returns a risk distribution and a risk kind.
6. A person opens every body at 1.5 or above and writes one category and one sentence.
7. Provenance by normalised body hash: first-party registry first, else earliest first-commit date. Attribution by the copy's own text.

Not read: binaries, images, anything fetched at runtime, repos outside the top 200. A clean row means we found nothing in the text we read.

This is not a security scanner. NVIDIA's [SkillSpector](https://github.com/NVIDIA/skillspector) and others do that with far more rules. What this page adds is provenance, duplication, and the receipts.

## Data

`data/` holds the four files every number is computed from. CC BY 4.0.

| File | Contents |
|---|---|
| `corpus.json` | the 200 discovered repos with stars, license, pinned commit and commit date |
| `report.json` | per repo: skills, manifests, static flags by class, severity, top flagged rows with sample lines |
| `clones.json` | byte-identical bodies shared across repos, origin, copies, attribution |
| `jev-risk.json` | the Jev safety read: risk score, distribution, kind, locations, usage |

## Rechecks and corrections

Open an issue with your repo name. We re-run the same pipeline against your current commit and update the row with the new commit hash. The old row stays visible with its date. Free.

## Repository

This repo is the built site: static HTML, one stylesheet, a few lines of JavaScript for table sorting, no framework, no build step. The pipeline in the skill-dash project generates it from the data files; nobody edits `index.html` by hand. Source of truth is a Forgejo repo at 48Nauts; this GitHub repo is the deploy mirror for GitHub Pages.

An experiment by [48Nauts](https://48nauts.com). Judged by [Jev](https://typesafe.ai). Not affiliated with GitHub, Anthropic, NVIDIA or any repo listed.

## License

Site code: MIT. Data in `data/`: CC BY 4.0. See `LICENSE`.
