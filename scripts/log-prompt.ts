import Database from "better-sqlite3";
import { resolve } from "path";
import { homedir } from "os";
import { mkdirSync, readFileSync } from "fs";

type HookInput = {
  session_id: string;
  cwd: string;
  prompt: string;
  hook_event_name: string;
};

const DB_DIR = resolve(homedir(), ".claude/prompt-logs");
const DB_PATH = resolve(DB_DIR, "prompts.db");

function ensureDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      project_dir TEXT NOT NULL,
      project_name TEXT NOT NULL,
      prompt TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);
}

function readStdin(): string {
  return readFileSync(0, "utf-8");
}

function main() {
  const raw = readStdin();
  const input: HookInput = JSON.parse(raw);

  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd;
  const projectName = projectDir.split(/[\\/]/).pop() ?? "unknown";

  mkdirSync(DB_DIR, { recursive: true });

  const db = new Database(DB_PATH);
  try {
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        project_dir TEXT NOT NULL,
        project_name TEXT NOT NULL,
        prompt TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);

    db.prepare(`
      INSERT INTO prompts (session_id, project_dir, project_name, prompt, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      input.session_id,
      projectDir,
      projectName,
      input.prompt,
      new Date().toISOString()
    );
  } finally {
    db.close();
  }
}

try {
  main();
} catch {
  process.exit(0);
}
