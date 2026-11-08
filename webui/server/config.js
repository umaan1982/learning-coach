// Paths and settings, resolved once at startup.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const WEBUI_DIR = path.resolve(here, "..");
const REPO_SKILL = path.resolve(WEBUI_DIR, "..", "plugins", "learning-coach", "skills", "learning-coach");
const INSTALLED_SKILL = path.join(os.homedir(), ".claude", "skills", "learning-coach");

const args = new Set(process.argv.slice(2));
export const PROD = args.has("--prod");
export const SANDBOX = args.has("--sandbox");

export const PORT = Number(process.env.PORT || 5178);
export const HOST = "127.0.0.1"; // never 0.0.0.0: this UI is for this computer only
export const DOMAIN = process.env.LC_DOMAIN || "german-b1";
export const PYTHON = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");

// The skill the CLI sees (~/.claude/skills/learning-coach) is the one we run scripts from,
// so the UI and the coach always use the same code. Fall back to this repo's copy.
export const SKILL_DIR =
  process.env.LC_SKILL_DIR || (fs.existsSync(path.join(INSTALLED_SKILL, "SKILL.md")) ? INSTALLED_SKILL : REPO_SKILL);
export const SCRIPTS_DIR = path.join(SKILL_DIR, "scripts");

// --sandbox: a throwaway data folder, so trying the UI never touches ~/learning-coach-data.
if (SANDBOX && !process.env.LEARNING_COACH_DATA) {
  process.env.LEARNING_COACH_DATA = path.join(os.tmpdir(), "learning-coach-ui-sandbox");
}
export const DATA_ROOT = process.env.LEARNING_COACH_DATA
  ? path.resolve(process.env.LEARNING_COACH_DATA.replace(/^~(?=$|[\\/])/, os.homedir()))
  : path.join(os.homedir(), "learning-coach-data");
export const DOMAIN_DIR = path.join(DATA_ROOT, DOMAIN);

/** True if `p` resolves to a path inside `root` (no `..` escapes). */
export function isInside(root, p) {
  const rel = path.relative(path.resolve(root), path.resolve(p));
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}
