// A small log file next to the learner list (~/learning-coach-profiles/server.log), so when the
// server stops we can see why. Rotates at ~1 MB. Never contains chat text or answers.
import fs from "node:fs";
import path from "node:path";
import { PROFILES_DIR } from "./config.js";

export const LOG_FILE = path.join(PROFILES_DIR, "server.log");

export function log(...parts) {
  const line = `${new Date().toISOString()}  ${parts.map((p) => (p instanceof Error ? p.stack || p.message : String(p))).join(" ")}\n`;
  try {
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > 1_000_000) fs.renameSync(LOG_FILE, `${LOG_FILE}.old`);
    fs.appendFileSync(LOG_FILE, line);
  } catch { /* logging must never take the server down */ }
}

// Unexpected errors: write them down, then exit with code 1 so start-ui.cmd restarts the server.
process.on("uncaughtException", (e) => {
  log("CRASH uncaughtException:", e);
  console.error("Server crashed:", e);
  process.exit(1);
});
process.on("unhandledRejection", (e) => {
  log("CRASH unhandledRejection:", e);
  console.error("Server crashed:", e);
  process.exit(1);
});
