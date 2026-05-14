# Supabase Migrations Workflow Adoption Spec

Living spec for adopting the local → staging → production migrations workflow
on MapTheHeat. Update the checkboxes after each completed step so future chats
can resume without needing the full conversation history.

## Resume Instructions

For a new chat, read `AGENTS.md`, this file, and
`docs/guides/SUPABASE_WORKFLOW.md`, then continue from the first unchecked item
in `Current Status`. Keep each slice scoped to that step. Never make schema
changes in the Supabase dashboard UI — every change goes through a migration
file. Always `cat supabase/.temp/project-ref` before `supabase db push`.

## Goals

- Adopt the local → staging → production workflow with version-controlled
  migration files in `supabase/migrations/`.
- Make migration files the single source of truth for schema; no more dashboard
  schema edits.
- Keep app development unchanged (dev server still points at staging via
  `.env.staging`).
- Ensure staging and production both track applied migrations correctly going
  forward.
- Document the workflow so future chats and collaborators can pick it up cold.

## Current Status

- [x] Step 1: Reorganize docs/ into guides/ and specs/.
- [x] Step 2: Move and rewrite SUPABASE_WORKFLOW.md as the canonical reference.
- [ ] Step 3: Clean slate the supabase/ folder, supabase init, link to staging.
- [ ] Step 4: Pull baseline migration from staging, verify, commit.
- [ ] Step 5: Boot local stack and verify db reset replay.
- [ ] Step 6: Sync production migration state (repair if needed).
- [x] Step 7: Verify AGENTS.md path references (no stale references found).
- [ ] Step 8 (optional): Configure Supabase MCP server scoped to staging, read-only.

## Completed Slices

### Step 1: Reorganize docs/

- Created `docs/guides/` and `docs/specs/` folders.
- `git mv` moved `ADMIN_MODERATION_SPEC.md` and `MAP_SPEC.md` into `docs/specs/`
  (renames tracked by git).
- `SUPABASE_WORKFLOW.md` was untracked, moved with plain `mv` into `docs/guides/`.
- No commit yet; staged renames + new files will be committed together.

### Step 2: Move and rewrite SUPABASE_WORKFLOW.md

- Moved to `docs/guides/SUPABASE_WORKFLOW.md`.
- Removed the Docker-install section (Docker already installed on this machine).
- Added "Local is NOT a clone of staging" callout in §1 Mental Model.
- Made `supabase start` + `supabase db reset` the canonical safety net in §5.
- Reframed §6 around the daily migration loop:
  `migration new` → `db reset` → `db push` to staging → `db push` to prod.
- Added a Project-Specific Refs appendix pointing back to this spec.

### Step 7: AGENTS.md path references

- Grepped `AGENTS.md` for the old doc paths. No matches. Nothing to update.

## Architecture Rules

- All schema changes go in `supabase/migrations/` files; never edited in the
  dashboard UI.
- The dashboard is for **reading** data, running SELECTs, watching logs, and
  managing auth users — not for `CREATE`, `ALTER`, or `DROP`.
- The app dev server always points at staging via `.env.staging`; local
  Supabase is a CLI-only sandbox with no production data.
- Local is empty by design. It exists to validate migrations via
  `supabase db reset` before pushing to any remote.
- Production pushes require: (1) confirmed on staging first, (2)
  `cat supabase/.temp/project-ref` checked before push, (3) immediate re-link
  to staging after.
- Migration files are committed to git. The
  `supabase_migrations.schema_migrations` table on each remote tracks what is
  applied.
- The approved-counts trigger changes were applied manually to both staging
  and production before this workflow was adopted. The baseline pull in Step 4
  captures the current state, including those changes.

## Planned File Areas

- `supabase/config.toml` — local stack + project configuration.
- `supabase/migrations/` — every schema change, one file per change.
- `supabase/seed.sql` — local-only seed data (optional, empty for now).
- `supabase/.temp/project-ref` — current link target. Always check before push.
- `docs/guides/SUPABASE_WORKFLOW.md` — long-form workflow reference.

## Step Plan

### Step 1: Reorganize docs/

- Create `docs/guides/` and `docs/specs/` folders.
- `git mv docs/ADMIN_MODERATION_SPEC.md docs/specs/ADMIN_MODERATION_SPEC.md`.
- `git mv docs/MAP_SPEC.md docs/specs/MAP_SPEC.md`.
- Commit as `chore(docs): reorganize into guides/ and specs/`.
- Verify: old paths gone, new paths populated, `git log --follow` shows
  renames.

### Step 2: Move and rewrite SUPABASE_WORKFLOW.md

- Move `docs/SUPABASE_WORKFLOW.md` to `docs/guides/SUPABASE_WORKFLOW.md`.
- Rewrite content:
  - Lead with the mental-model table (local empty by design; staging has data;
    prod has real users).
  - Add a "Local is not a clone of staging" callout near the top.
  - Make `supabase start` + `supabase db reset` the canonical safety net in §5.
  - Document the daily migration loop in §6: `migration new` → `db reset` →
    `db push` to staging → `db push` to prod.
  - Note that schema changes never happen in the dashboard UI.
  - Remove the Docker-install paragraph (Docker is already installed).
- Verify: doc reads cleanly top-to-bottom as the standard reference.

### Step 3: Clean slate the supabase/ folder

- Delete the existing `supabase/` folder. This is safe — staging and prod
  databases are remote and unaffected. Local files only.
  ```powershell
  Remove-Item -Recurse -Force supabase
  ```
- Initialize a fresh project structure:
  ```powershell
  supabase init
  # Answer N to VS Code / IntelliJ prompts.
  ```
- Link to staging:
  ```powershell
  supabase link --project-ref iuhgmfdpeblaaoolhpbt
  # Enter staging DB password when prompted.
  ```
- Verify:
  ```powershell
  cat supabase/.temp/project-ref
  # → iuhgmfdpeblaaoolhpbt
  ```
- Done when: `supabase/` contains fresh `config.toml`, `seed.sql`, and
  `.gitignore`; the CLI is linked to staging.

### Step 4: Pull baseline migration from staging

- Pull the current staging schema as the first migration file:
  ```powershell
  supabase db pull
  # Creates supabase/migrations/<timestamp>_remote_schema.sql
  ```
- Verify both sides know about it:
  ```powershell
  supabase migration list
  # Local + Remote columns must show the same timestamp.
  ```
- Commit:
  ```powershell
  git add supabase/
  git commit -m "chore(supabase): adopt migrations workflow, baseline from staging"
  ```
- Done when: baseline file exists, `migration list` shows it on both sides,
  commit landed.

### Step 5: Boot local stack and verify reproducibility

- Boot the local stack (first run downloads images, takes a few minutes):
  ```powershell
  supabase start
  ```
- Open Studio at `http://127.0.0.1:54323`. Confirm tables exist (they will be
  empty — that is expected).
- Verify migrations replay cleanly from scratch:
  ```powershell
  supabase db reset
  ```
- Done when: local Studio shows expected tables, `db reset` completes without
  errors.
- Stop the stack when not in use: `supabase stop`.

### Step 6: Sync production migration state

- Switch to production:
  ```powershell
  supabase link --project-ref <prod-ref>
  ```
- Check production's migration state:
  ```powershell
  supabase migration list
  ```
- If production does not show the baseline as applied, mark it applied without
  re-running (the schema already exists from manual changes):
  ```powershell
  supabase migration repair --status applied <baseline-timestamp>
  ```
- **CRITICAL: re-link to staging immediately:**
  ```powershell
  supabase link --project-ref iuhgmfdpeblaaoolhpbt
  cat supabase/.temp/project-ref
  ```
- Done when: `migration list` against prod shows baseline as applied, CLI is
  re-linked to staging.

### Step 7: Verify AGENTS.md path references

- Grep `AGENTS.md` for `docs/ADMIN_MODERATION_SPEC.md`, `docs/MAP_SPEC.md`, or
  `docs/SUPABASE_WORKFLOW.md`.
- Update any stale references to the `docs/specs/...` or `docs/guides/...`
  equivalents.
- Done when: no stale paths remain. If none existed, mark complete.

### Step 8 (optional, deferred): Configure Supabase MCP server

- Configuration documented in `docs/guides/SUPABASE_WORKFLOW.md` §10.
- Scoped to staging only, `--read-only`, minimal `--features` set.
- Add to `~/.claude/settings.json` as `supabase-staging`.
- Done when: MCP server appears in Claude Code, queries against staging
  succeed, write attempts are rejected.

## Verification Expectations

Before calling each slice complete:

- `supabase migration list` shows matching state local + remote where
  applicable.
- `supabase db reset` replays cleanly locally before any `db push`.
- After every prod push, CLI is re-linked to staging.
- Commits follow conventional commits (`feat(db):`, `chore(supabase):`,
  `fix(db):`).
- Manual smoke check the app against staging where relevant.

## Updating This Spec

After each completed slice:

- Check off the step in `Current Status`.
- Add a 3–6 bullet entry under `Completed Slices` for meaningful steps. Pure
  rename/move steps can be recorded with just the checkbox.
- Capture decisions, deviations, and gotchas future chats need.

## Commit Style

Use conventional commits with short bullet bodies for meaningful slices.

Example:

```text
feat(db): only count approved venues and reviews

- Filter user count triggers to status = 'approved'
- Add status to trigger UPDATE OF columns so approval changes recalculate
- Backfill existing profile counts
```

## Future Notes

- After the baseline lands, future schema work follows
  `docs/guides/SUPABASE_WORKFLOW.md` §6 verbatim.
- When a production project ref is added, update the Appendix in the workflow
  guide and add it as an env var for the user's password manager.
- GitHub Actions automation (PR-to-develop → staging, PR-to-main → prod) is a
  future enhancement worth setting up once collaborators are involved. Not in
  scope for this spec.
