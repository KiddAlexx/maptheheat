# Supabase Workflow Guide

The day-to-day reference for working with Supabase on this project. Covers the local → staging → production workflow, CLI commands, environment configuration, and security.

For the active adoption work, see [`docs/specs/SUPABASE_MIGRATIONS_SPEC.md`](../specs/SUPABASE_MIGRATIONS_SPEC.md).

---

## Table of Contents

1. [Mental Model](#1-mental-model)
2. [One-Time Setup](#2-one-time-setup)
3. [Managing Environments (.env files)](#3-managing-environments-env-files)
4. [Linking the CLI to a Project](#4-linking-the-cli-to-a-project)
5. [The Migration Workflow](#5-the-migration-workflow)
6. [Day-to-Day: Making a Schema Change](#6-day-to-day-making-a-schema-change)
7. [Promoting Staging → Production](#7-promoting-staging--production)
8. [Edge Functions](#8-edge-functions)
9. [Secrets & Security Checklist](#9-secrets--security-checklist)
10. [Supabase MCP Server](#10-supabase-mcp-server)
11. [Command Cheat Sheet](#11-command-cheat-sheet)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Mental Model

Three Supabase environments, three jobs:

| Tier | Where it lives | Has real data? | Purpose |
|---|---|---|---|
| **Local** | Your machine via Docker (`supabase start`) | ❌ Empty by design | Schema/migration sandbox. Reset, retry, validate before push. |
| **Staging** | Hosted (`*.supabase.co`) | ✅ Test data | Where the app dev server points. Test features and migrations. |
| **Production** | Hosted (`*.supabase.co`) | ✅ Real users | Only touched via tested migrations + backups. |

### Local is NOT a clone of staging

Local is empty by design. It exists to test **schema** changes safely — not to mirror staging's data.

- ✅ Your app dev server keeps pointing at **staging** via `.env.staging` — same as before. You still see real data when building features.
- ✅ When you change schema (column, trigger, RLS), you validate the migration on **local** before pushing to staging.
- ❌ Local will not have your real auth users, venues, reviews, or uploaded images.

App development workflow is unchanged. Local is purely a CLI/database tool for schema work.

### The Golden Rule

> Every schema change exists as a **migration file in git** before it reaches any database. Schema changes never happen in the dashboard UI.

The dashboard is for reading data, running SELECTs, watching logs, managing auth users — not for `CREATE`, `ALTER`, or `DROP`.

```
Migration file → local (db reset) → staging (db push) → production (db push)
       git              test               test                  ship
```

---

## 2. One-Time Setup

### 2.1 Install the Supabase CLI

> ⚠️ `npm install -g supabase` is blocked by Supabase. Use one of the methods below.

**Option A — Scoop (recommended on Windows):**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
supabase --version
```

**Option B — Direct binary:**

1. Download `supabase_windows_amd64.tar.gz` from https://github.com/supabase/cli/releases/latest
2. Extract `supabase.exe` to a permanent folder (e.g. `C:\tools\supabase\`)
3. Add that folder to your user PATH
4. Open a fresh PowerShell, run `supabase --version`

**Option C — `npx` per command:**

```powershell
npx supabase@latest --version
```

Slower (re-downloads each session). Fine for occasional use.

### 2.2 Generate a Personal Access Token

Lets the CLI talk to Supabase's API on your behalf.

1. Go to https://supabase.com/dashboard/account/tokens
2. **Generate new token**, name it `cli-local-<your-name>`
3. Store it in a password manager.

### 2.3 Find Your Project Refs

A project ref is the 20-character string in your project URL: `https://<ref>.supabase.co`.

- Dashboard → Settings → General → **Reference ID**
- Staging ref: `iuhgmfdpeblaaoolhpbt`
- Production ref: *(fill in when set up)*

Project refs are **not secret** — they appear in your frontend URL.

### 2.4 Database Passwords

Dashboard → Settings → Database → connection string section. If unknown, reset it. Store in a password manager. **Use different passwords for staging and prod.**

---

## 3. Managing Environments (.env files)

Vite auto-loads env files based on the `--mode` flag.

### 3.1 The Pattern

| File | Loaded when you run | Commit? |
|---|---|---|
| `.env.local` | always, overrides others | ❌ never |
| `.env.staging` | `vite --mode staging` | ❌ never |
| `.env.production` | `vite build` (production is default) | ❌ never |
| `.env.example` | never — it's a template | ✅ yes |

### 3.2 Recommended Layout

`.gitignore` should include all `.env*` files except `.env.example`.

**`.env.staging`:**
```
VITE_SUPABASE_URL=https://iuhgmfdpeblaaoolhpbt.supabase.co
VITE_SUPABASE_ANON_KEY=<staging-anon-key>
```

**`.env.production`:**
```
VITE_SUPABASE_URL=https://<prod-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<prod-anon-key>
```

**`.env.example`** (template, committed):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 3.3 npm Scripts

```json
{
  "scripts": {
    "dev": "vite --mode staging",
    "dev:prod": "vite --mode production",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production"
  }
}
```

> ⚠️ **`dev:prod` is dangerous.** Your local browser talks to the live database. Only use it to reproduce a prod-specific bug.

### 3.4 CLI Env Vars

```powershell
$env:SUPABASE_ACCESS_TOKEN = "<your personal access token>"
$env:SUPABASE_DB_PASSWORD  = "<linked project's db password>"
```

Set `SUPABASE_ACCESS_TOKEN` once as a permanent Windows user env var. Pass `SUPABASE_DB_PASSWORD` inline when needed.

---

## 4. Linking the CLI to a Project

Linking tells the CLI: "all my `db push` / `db pull` / `functions deploy` commands target this project."

You can only link to one project at a time.

### 4.1 Linking

```powershell
# Link to staging
supabase link --project-ref iuhgmfdpeblaaoolhpbt

# Switch to production
supabase link --project-ref <prod-ref>
```

### 4.2 Check Which Project Is Linked

```powershell
cat supabase/.temp/project-ref
```

> **Always check this before `db push`.** Pushing to the wrong project is the #1 way to corrupt production. Force the habit.

### 4.3 Safer: Explicit Ref

For destructive commands, skip linking and pass the ref every time. The friction is a feature:

```powershell
supabase db push --project-ref <prod-ref>
```

---

## 5. The Migration Workflow

A migration is a `.sql` file in `supabase/migrations/` with a timestamp prefix:

```
supabase/migrations/
  20260514120000_remote_schema.sql
  20260520093000_add_user_bio_column.sql
```

The CLI applies them **in order** by timestamp. Each remote (local/staging/prod) tracks which migrations it has applied in `supabase_migrations.schema_migrations`.

### 5.1 Local Is Your Safety Net

The whole reason for the local tier:

```powershell
supabase start          # boot local Postgres + Auth + Storage + Studio
supabase db reset       # drop local DB and replay all migrations from scratch
```

If `db reset` succeeds locally, your migrations are reproducible. If it fails, fix the SQL **before** pushing anywhere. This single command is the difference between confident schema changes and prayer-driven development.

When not actively using local: `supabase stop`.

### 5.2 The Core Commands

| Command | What it does | When to use |
|---|---|---|
| `supabase migration new <name>` | Creates an empty timestamped `.sql` file | About to make a schema change |
| `supabase db reset` | Replays migrations on local from scratch | After writing or pulling a migration |
| `supabase db push` | Applies pending migrations to the linked remote | After local validates |
| `supabase db pull` | Captures dashboard-made changes as a migration file | Only as recovery; you shouldn't be editing in the dashboard |
| `supabase db diff -f <name>` | Diffs local-running schema vs. migrations, writes the gap to a file | After using local Studio to prototype |
| `supabase migration list` | Shows local + remote migration state | Before pushing; sanity check |
| `supabase migration repair --status applied <ts>` | Marks a migration as already applied on the remote without running it | Bootstrapping a remote that already has the schema |

---

## 6. Day-to-Day: Making a Schema Change

The full loop. Memorize this.

### Step 1 — Create a migration file

```powershell
supabase migration new <descriptive_name>
```

Creates `supabase/migrations/<timestamp>_<descriptive_name>.sql`. Write the SQL.

### Step 2 — Validate locally

```powershell
supabase db reset
```

Replays everything from scratch. If the SQL has an error, fix it in the file and run again. **Iterate here until it's clean.**

### Step 3 — Push to staging

```powershell
cat supabase/.temp/project-ref   # confirm staging
supabase db push
```

The CLI lists pending migrations and asks for confirmation. Read it.

### Step 4 — Test on staging

Use the app pointed at staging (`npm run dev`). Verify the change behaves as expected against realistic data.

### Step 5 — Commit

```powershell
git add supabase/migrations/<file>.sql
git commit -m "feat(db): <what changed>"
git push
```

### Step 6 — Promote to production

See [§7](#7-promoting-staging--production).

---

## 7. Promoting Staging → Production

After the migration is merged to `main` and verified on staging:

```powershell
# Switch CLI to production
supabase link --project-ref <prod-ref>
cat supabase/.temp/project-ref   # confirm prod ref

# Preview what will run
supabase db push --dry-run

# Apply
supabase db push

# CRITICAL: re-link to staging
supabase link --project-ref iuhgmfdpeblaaoolhpbt
```

### Best Practices

1. **Backup first.** Dashboard → Database → Backups → "Create on-demand backup", or:
   ```powershell
   supabase db dump --file backup-pre-migration.sql
   ```
2. **Push during low-traffic hours** when possible.
3. **Have a rollback plan** for destructive changes — write reverse SQL in advance.
4. **Re-link to staging immediately** so the next command doesn't accidentally target prod.

### Future: GitHub Actions

Once you have collaborators or want extra safety, automate with GitHub Actions:
- PR to `develop` → CI runs migrations against staging
- PR to `main` → CI runs migrations against production

Removes "did I link to the right project?" from the equation. See https://supabase.com/docs/guides/deployment/managing-environments for a sample workflow.

---

## 8. Edge Functions

For Deno serverless functions in `supabase/functions/`:

```powershell
supabase functions serve <name>     # local dev
supabase functions deploy <name>    # deploys to linked project
supabase secrets set KEY=value      # per-environment secrets
```

Same staging-first rule as migrations.

---

## 9. Secrets & Security Checklist

### Must do
- ✅ All `.env*` files (except `.env.example`) are in `.gitignore`
- ✅ Staging and prod use **different DB passwords**
- ✅ Personal Access Token in password manager, never in repo
- ✅ **service_role key never used in the frontend** — only `anon`. service_role bypasses RLS and is server-only
- ✅ RLS enabled on every public table — anon key relies on it
- ✅ Different OAuth client IDs/secrets per environment

### Should do
- 🟢 Regular backups of production (`supabase db dump`)
- 🟢 Restrict prod project team access (Settings → Team)
- 🟢 Rotate DB password if exposed
- 🟢 2FA on your Supabase account
- 🟢 [Network restrictions](https://supabase.com/docs/guides/platform/network-restrictions) on prod if feasible

### Never do
- ❌ Commit `.env.*` files (except `.env.example`)
- ❌ Paste service_role into client-side code or `VITE_*` env vars (they're bundled into the JS!)
- ❌ Run `supabase db reset` while linked to a remote project (only safe locally)
- ❌ Use `--force` to skip safety checks
- ❌ Make schema changes in the dashboard UI

---

## 10. Supabase MCP Server

The Supabase MCP server lets Claude Code read project metadata, run SQL, and search docs from chat.

### Security stance

Per [Supabase docs](https://supabase.com/docs/guides/ai-tools/mcp): "Don't connect to production. Use the MCP server with a development project, not production."

- ✅ Staging only — never production
- ✅ `--read-only` — forces SQL through a read-only Postgres role
- ✅ `--project-ref` — scopes to one project, disables account-level tools
- ✅ Minimal `--features` set — disables edge functions, secrets, account management

### "Hosted vs CLI" — pick Hosted

When configuring, the wizard asks. Pick **hosted/remote** with your staging project ref. The "CLI" / "local" option is for the local `supabase start` instance — only relevant if you're doing fully offline development.

### Configuration

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "supabase-staging": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=iuhgmfdpeblaaoolhpbt",
        "--features=database,docs,development"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<your-personal-access-token>"
      }
    }
  }
}
```

Name it `supabase-staging` so it's obvious which project it points at.

### What MCP can / can't do (with the above config)

✅ Read tables, columns, RLS policies; run SELECTs; generate TS types; search docs.
❌ INSERT/UPDATE/DELETE; CREATE/ALTER/DROP; deploy edge functions; manage secrets or billing.

---

## 11. Command Cheat Sheet

```powershell
# === Setup ===
supabase --version
supabase link --project-ref <ref>
cat supabase/.temp/project-ref          # which project am I linked to?

# === Daily migration loop ===
supabase migration new <name>
supabase db reset                        # validate locally
supabase db push                         # apply to linked remote
supabase db push --dry-run               # preview
supabase migration list                  # local vs remote state

# === Local stack ===
supabase start                           # boot local Postgres + Auth + Storage + Studio
supabase stop
# Studio: http://127.0.0.1:54323
# API:    http://127.0.0.1:54321
# DB:     postgresql://postgres:postgres@127.0.0.1:54322/postgres

# === Recovery / Bootstrap ===
supabase db pull                                              # capture dashboard changes
supabase migration repair --status applied <timestamp>        # mark as applied without running
supabase db dump --file backup.sql                            # full schema + data dump
supabase db dump --schema-only -f schema.sql

# === Edge Functions ===
supabase functions new <name>
supabase functions serve <name>
supabase functions deploy <name>
supabase secrets set KEY=value

# === Types ===
supabase gen types typescript --linked > src/types/supabase.ts
```

---

## 12. Troubleshooting

### "Remote migration versions not found in local migrations directory"

Remote has migrations the local folder doesn't know about. Either:
```powershell
supabase db pull       # if the remote has real changes you want
```
Or, if the remote's recorded migrations are stale phantoms:
```powershell
supabase migration repair --status reverted <timestamp>
```

### `db push` says "Connect to the database failed"

- Wrong password → re-link and re-enter
- Network restrictions blocking your IP

### "I pushed to the wrong project"

- Additive change (CREATE/ADD) → write a reverse migration and push it
- Destructive (DROP) → restore from backup

### Migration applied but app still broken

- Dashboard → Logs → Postgres
- Check trigger fires by editing a row and watching the column
- RLS issues → Dashboard → Authentication → Policies

### `supabase start` fails

- Confirm Docker Desktop is running
- `docker ps` should work without error

---

## Appendix: Project-Specific Refs

- **Staging:** `iuhgmfdpeblaaoolhpbt`
- **Production:** *(fill in when set up)*
- **Dev server points at:** staging (via `.env.staging`)
- **Active migration spec:** [`docs/specs/SUPABASE_MIGRATIONS_SPEC.md`](../specs/SUPABASE_MIGRATIONS_SPEC.md)
