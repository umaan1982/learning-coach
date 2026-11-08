// Runs the skill's deterministic Python scripts (no AI involved).
import { spawn } from "node:child_process";
import path from "node:path";
import { DATA_ROOT, PYTHON, SCRIPTS_DIR } from "./config.js";

export function runScript(script, args = [], { timeoutMs = 60_000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(PYTHON, [path.join(SCRIPTS_DIR, script), ...args], {
      cwd: SCRIPTS_DIR,
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
