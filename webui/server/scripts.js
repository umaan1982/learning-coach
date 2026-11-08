// Runs Python: the skill's deterministic scripts (no AI involved), and our own helpers.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DATA_ROOT, DOMAIN, PYTHON, SCRIPTS_DIR } from "./config.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));

function runPython(file, args, { timeoutMs = 60_000, cwd = SCRIPTS_DIR } = {}) {
  return new Promise((resolve) => {
    const child = spawn(PYTHON, [file, ...args], {
      cwd,
      env: { ...process.env, LEARNING_COACH_DATA: DATA_ROOT, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (d) => (stdout += d));
    child.stderr.setEncoding("utf8").on("data", (d) => (stderr += d));
    const timer = setTimeout(() => child.kill(), timeoutMs);
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: stderr + String(e) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout: stdout.replace(/^\s*\n/, "").trimEnd(), stderr: stderr.trim() });
    });
  });
}

export function runScript(script, args = [], opts = {}) {
  return runPython(path.join(SCRIPTS_DIR, script), args, opts);
}

/** Offline dictation (server/transcribe.py): same faster-whisper model as the skill's pronounce.py. */
export function transcribe(audioPath) {
  return runPython(path.join(HERE, "transcribe.py"), [SCRIPTS_DIR, audioPath, DOMAIN], { timeoutMs: 180_000 });
}
