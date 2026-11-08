// Drives the locally installed Claude Code CLI in headless (print) mode.
// Runs under the user's own Claude login (subscription). API-key variables are
// stripped from the child environment so this can never fall back to paid API billing.
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DATA_ROOT, DOMAIN, SANDBOX, SKILL_DIR } from "./config.js";
import { listLearners } from "./learners.js";

const isWin = process.platform === "win32";

// ---------------------------------------------------------------- find the CLI
function semverKey(v) {
  return v.split(".").map((n) => String(Number(n) || 0).padStart(6, "0")).join(".");
}

function findOnPath() {
  const names = isWin ? ["claude.exe", "claude.cmd"] : ["claude"];
  for (const dir of (process.env.PATH || "").split(path.delimiter)) {
    for (const n of names) {
      const p = path.join(dir, n);
      if (dir && fs.existsSync(p)) return p;
    }
  }
  return null;
}

function findDesktopBundled() {
  // The Claude desktop app keeps its own copy of the CLI at %APPDATA%\Claude\claude-code\<version>\<hash>\claude.exe
  if (!isWin || !process.env.APPDATA) return null;
  const root = path.join(process.env.APPDATA, "Claude", "claude-code");
  if (!fs.existsSync(root)) return null;
  const versions = fs.readdirSync(root).filter((v) => /^\d+\.\d+\.\d+$/.test(v));
  versions.sort((a, b) => (semverKey(a) < semverKey(b) ? 1 : -1));
  for (const v of versions) {
    for (const h of fs.readdirSync(path.join(root, v))) {
      const p = path.join(root, v, h, "claude.exe");
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

export function findClaude() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  const local = path.join(os.homedir(), ".local", "bin", isWin ? "claude.exe" : "claude");
  return findOnPath() || (fs.existsSync(local) ? local : null) || findDesktopBundled();
}

export const CLAUDE_BIN = findClaude();

// ---------------------------------------------------------------- environment
const STRIP = /^(ANTHROPIC_API_KEY|ANTHROPIC_AUTH_TOKEN|ANTHROPIC_BASE_URL|CLAUDECODE|CLAUDE_PID|CLAUDE_EFFORT|CLAUDE_AGENT_SDK_.*|CLAUDE_CODE_.*)$/;
const KEEP = new Set(["CLAUDE_CODE_OAUTH_TOKEN", "CLAUDE_CODE_GIT_BASH_PATH"]);

export function childEnv(dataRoot = DATA_ROOT) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (STRIP.test(k) && !KEEP.has(k)) continue; // no API keys; no leftovers from a parent Claude session
    env[k] = v;
  }
  env.LEARNING_COACH_DATA = dataRoot;
  return env;
}

function spawnClaude(args, dataRoot) {
  // .cmd shims (npm installs) need a shell on Windows; our args are fixed strings without
  // shell metacharacters, and the learner's text goes through stdin, never the command line.
  const shell = isWin && /\.cmd$/i.test(CLAUDE_BIN);
  const argv = shell ? args.map((a) => (/[\s()*]/.test(a) ? `"${a}"` : a)) : args;
  return spawn(shell ? `"${CLAUDE_BIN}"` : CLAUDE_BIN, argv, {
    cwd: dataRoot,
    env: childEnv(dataRoot),
    shell,
    windowsHide: true,
  });
}

export function claudeStatus() {
  if (!CLAUDE_BIN) return { bin: null, version: null, loggedIn: false };
  const opts = { env: childEnv(), encoding: "utf8", timeout: 20_000, windowsHide: true, shell: isWin && /\.cmd$/i.test(CLAUDE_BIN) };
  const bin = opts.shell ? `"${CLAUDE_BIN}"` : CLAUDE_BIN;
  let version = null;
  let loggedIn = false;
  let authMethod = null;
  try {
    version = execFileSync(bin, ["--version"], opts).trim();
  } catch { /* reported as null */ }
  let out = "";
  try {
    out = execFileSync(bin, ["auth", "status"], opts);
  } catch (e) {
    out = String(e.stdout || ""); // non-zero exit when logged out; the JSON is still on stdout
  }
  try {
    const s = JSON.parse(out);
    loggedIn = !!s.loggedIn;
    authMethod = s.authMethod || null;
  } catch { /* older CLIs: unknown */ }
  return { bin: CLAUDE_BIN, version, loggedIn, authMethod, loginCommand: loginCommand() };
}

/** The exact command the user runs once in their own terminal (browser sign-in, Claude subscription). */
export function loginCommand() {
  if (!CLAUDE_BIN) return null;
  if (findOnPath() === CLAUDE_BIN) return "claude auth login";
  return isWin ? `& "${CLAUDE_BIN}" auth login` : `"${CLAUDE_BIN}" auth login`;
}

// Checked before a chat turn until it succeeds once, so logging in works without restarting the server.
let authOk = false;
export function ensureLoggedIn() {
  if (authOk) return { ok: true };
  const s = claudeStatus();
  authOk = s.loggedIn;
  return { ok: s.loggedIn, status: s };
}

const NOT_LOGGED_IN = /not logged in|please run \/login|invalid api key|oauth token (has )?expired/i;

// ---------------------------------------------------------------- one chat turn
// Kept deliberately small: it says *where* the coach is running, not *how* to coach.
// The coaching process stays in SKILL.md and references/.
const systemPrompt = (ctx) =>
  `The learner is talking to you through a local desktop web UI for the learning-coach skill. ` +
  `This learner is ${ctx.learner.name}; other people may use the same UI with their own, separate data. ` +
  `For every learner message, follow the learning-coach skill (domain: ${DOMAIN}); its process and message style apply unchanged. ` +
  `The UI has its own panels for the C-test, listening audio, course status and the progress dashboard, which run the skill's scripts directly. ` +
  `There is no clickable-choice tool here, so offer numbered options instead. ` +
  `Audio made with speak.py appears as a player in the chat automatically. ` +
  // The UI's microphone = the Claude app's dictation, plus the recording itself.
  `Messages that start with 🎤 were spoken into the UI's microphone and transcribed offline: treat them as dictated answers ` +
  `(input mode: spoken). They include the recording's path, so when the session calls for a pronunciation check you can run ` +
  `pronounce.py --audio "<that path>" --target "<the sentence>" --domain ${DOMAIN}. ` +
  // Same C-test items, same script and scoring; only the place where the learner types changes.
  `When a placement reaches the C-test, don't paste the texts into the chat: if today's C-test isn't done yet, ` +
  `ask the learner to do it in the UI's C-test tab (it runs ctest.py make/show/score) and to tell you when they're done; ` +
  `then read the result with ctest.py result and continue. ` +
  // Configuration, not coaching: where this session's files are. Without it the model
  // falls back to the skill's default ~/learning-coach-data, even when the UI runs on sandbox data.
  `Learner data for this session is in ${ctx.domainDir}; read and write learner files only there. ` +
  `LEARNING_COACH_DATA is already set to ${ctx.dataRoot} in the environment, so run the scripts without setting it. ` +
  `The skill is at ${SKILL_DIR}; run its scripts as python "${path.join(SKILL_DIR, "scripts")}${path.sep}<name>.py" ...` +
  // Headless: anything outside the allow list is denied, and combined shell commands never match it.
  ` Use the Read, Glob and Grep tools to look at files. Use the shell only for single python script calls, ` +
  `one command per call, without variables or chained commands.`;

const ALLOWED_TOOLS = [
  "Skill", "Read", "Glob", "Grep", "Write", "Edit",
  "Bash(python *)", "Bash(python3 *)", "Bash(py *)",
  // read-only helpers the model likes to chain with the scripts
  "Bash(cd *)", "Bash(ls *)", "Bash(cat *)", "Bash(head *)", "Bash(tail *)", "Bash(wc *)", "Bash(echo *)", "Bash(pwd)",
  // On Windows the CLI also has a PowerShell tool
  "PowerShell(python *)", "PowerShell(py *)", "PowerShell(Get-ChildItem *)", "PowerShell(Get-Content *)",
];

// Privacy between learners, and sandbox safety: every learner folder except this one's is
// blocked at the tool level, whatever the model decides. Rules use home-relative paths (~/...),
// the form Claude Code's permission rules handle reliably on every OS.
function homeRule(dir) {
  const rel = path.relative(os.homedir(), dir);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return `~/${rel.split(path.sep).join("/")}/**`;
}
export function deniedTools(ctx) {
  const roots = listLearners().map((l) => l.root);
  if (SANDBOX) roots.push(path.join(os.homedir(), "learning-coach-data"), path.join(os.homedir(), "learning-coach-profiles"));
  const self = path.resolve(ctx.dataRoot).toLowerCase();
  const rules = [];
  for (const r of new Set(roots.map((x) => path.resolve(x)))) {
    const low = r.toLowerCase();
    if (low === self || self.startsWith(low + path.sep)) continue; // never block this learner's own folder
    const rule = homeRule(r);
    if (rule) rules.push(`Read(${rule})`, `Edit(${rule})`, `Write(${rule})`);
  }
  return rules;
}

// speak.py writes to <data>/<domain>/audio/<stamp>-<mode>.mp3. Match the file name only
// (full paths contain spaces, e.g. C:\Users\John Doe\...) and look it up in that folder.
const MP3_NAME = /[\w.-]+\.mp3\b/gi;

/**
 * Run one learner message through `claude -p`, resuming `sessionId` if given.
 * Calls `emit(event)` with normalised events:
 *   {type:"session", id, model} {type:"delta", text} {type:"block"} {type:"text", text}
 *   {type:"tool", name, detail} {type:"audio", path} {type:"done", ok, error, sessionId, durationMs}
 * Returns a function that aborts the turn.
 */
export function runTurn({ message, sessionId, model, ctx }, emit) {
  if (!CLAUDE_BIN) {
    emit({ type: "done", ok: false, error: "Claude Code CLI not found. Install it, or set CLAUDE_BIN." });
    return () => {};
  }
  fs.mkdirSync(ctx.dataRoot, { recursive: true });
  const AUDIO_DIR = path.join(ctx.domainDir, "audio");
  const args = [
    "-p",
    "--output-format", "stream-json",
    "--verbose",
    "--include-partial-messages",
    "--permission-mode", "acceptEdits",
    "--permission-prompts", "none",
    "--add-dir", SKILL_DIR,
    "--append-system-prompt", systemPrompt(ctx),
    "--disallowedTools", "AskUserQuestion", ...deniedTools(ctx),
    "--allowedTools", ...ALLOWED_TOOLS,
  ];
  if (sessionId) args.push("--resume", sessionId);
  if (model || process.env.LC_MODEL) args.push("--model", model || process.env.LC_MODEL);

  const child = spawnClaude(args, ctx.dataRoot);
  child.stdin.end(message, "utf8");

  let buf = "";
  let stderr = "";
  let deltasThisMessage = false;
  let textBlocksThisMessage = 0;
  let finished = false;
  const seenAudio = new Set();
  const speakCalls = new Set(); // tool_use ids of speak.py runs

  const audioFrom = (text) => {
    for (const m of String(text).matchAll(MP3_NAME)) {
      const p = path.join(AUDIO_DIR, m[0]);
      if (!seenAudio.has(p) && fs.existsSync(p)) {
        seenAudio.add(p);
        emit({ type: "audio", path: p });
      }
    }
  };

  const handle = (o) => {
    switch (o.type) {
      case "system":
        if (o.subtype === "init") emit({ type: "session", id: o.session_id, model: o.model });
        break;
      case "stream_event": {
        const ev = o.event || {};
        if (ev.type === "message_start") {
          deltasThisMessage = false;
          textBlocksThisMessage = 0;
        } else if (ev.type === "content_block_start" && ev.content_block?.type === "text") {
          if (textBlocksThisMessage++ > 0) emit({ type: "block" });
        } else if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
          deltasThisMessage = true;
          emit({ type: "delta", text: ev.delta.text });
        }
        break;
      }
      case "assistant":
        for (const b of o.message?.content || []) {
          if (b.type === "text") {
            if (!deltasThisMessage) emit({ type: "text", text: b.text });
            audioFrom(b.text);
          } else if (b.type === "tool_use") {
            if (/speak\.py/.test(b.input?.command || "")) speakCalls.add(b.id);
            emit({ type: "tool", name: b.name, detail: toolDetail(b) });
          }
        }
        break;
      case "user": // tool results: speak.py prints the MP3 path (other tools, e.g. a folder listing, don't count)
        for (const b of o.message?.content || []) {
          if (b.type !== "tool_result" || !speakCalls.has(b.tool_use_id)) continue;
          const c = Array.isArray(b.content) ? b.content.map((x) => x.text || "").join("\n") : b.content;
          audioFrom(c || "");
        }
        break;
      case "result": {
        finished = true;
        const error = o.is_error ? o.result || o.subtype || "error" : null;
        if (error && NOT_LOGGED_IN.test(error)) {
          authOk = false;
          emit({ type: "done", ok: false, code: "not_logged_in", error, loginCommand: loginCommand() });
          break;
        }
        emit({ type: "done", ok: !o.is_error, error, sessionId: o.session_id, durationMs: o.duration_ms });
        break;
      }
    }
  };

  child.stdout.setEncoding("utf8").on("data", (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      try {
        handle(JSON.parse(line));
      } catch { /* not JSON: ignore */ }
    }
  });
  child.stderr.setEncoding("utf8").on("data", (d) => (stderr += d));
  child.on("error", (e) => {
    if (!finished) emit({ type: "done", ok: false, error: String(e) });
    finished = true;
  });
  child.on("close", (code) => {
    if (!finished) emit({ type: "done", ok: false, error: stderr.trim() || `claude exited with code ${code}` });
    finished = true;
  });

  return () => {
    if (!finished) child.kill();
  };
}

function toolDetail(b) {
  const i = b.input || {};
  if (i.command) return String(i.command).replace(/"[^"]*[\\/]scripts[\\/]/g, '"…/scripts/').slice(0, 140);
  if (i.file_path) return path.basename(String(i.file_path));
  if (i.skill) return String(i.skill);
  if (i.pattern) return String(i.pattern);
  return "";
}
