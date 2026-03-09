## Commands

- `pnpm dev` — start Vite dev server (HTTPS via basic-ssl plugin)
- `pnpm build` — production build
- `pnpm typecheck` — type-check without emitting
- `pnpm log` — run prompt-logging hook script manually
- `pnpm datasette` — browse prompt logs with Datasette

## Architecture

- `src/` — Vite frontend (TypeScript + Tailwind v4)
- `scripts/log-prompt.ts` — Claude Code hook that logs user prompts to SQLite
  - DB location: `~/.claude/prompt-logs/prompts.db`
  - Reads JSON from stdin (session_id, cwd, prompt, hook_event_name)
  - Silently exits on error to avoid blocking Claude

## Stack

- Vite 7 + TypeScript + Tailwind CSS v4
- better-sqlite3 for prompt storage
- pnpm workspace with approved build scripts (esbuild, better-sqlite3)
