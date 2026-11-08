// Local server for the learning-coach web UI. Bound to 127.0.0.1 only.
//   npm run dev           -> real data (~/learning-coach-data or $LEARNING_COACH_DATA), Vite dev middleware
//   npm run dev:sandbox   -> throwaway data folder in the OS temp dir
//   npm run build && npm start -> serves the built front end
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { CLAUDE_BIN, claudeStatus, ensureLoggedIn, runTurn } from "./claude.js";
import { DATA_ROOT, DOMAIN, DOMAIN_DIR, HOST, PORT, PROD, SANDBOX, SKILL_DIR, WEBUI_DIR, isInside } from "./config.js";
import { addLearner, ctxFor, getLearner, learnerFromRequest, listLearners, renameLearner } from "./learners.js";
import { parseCourseStatus } from "./course.js";
import { planState } from "./plan.js";
import { runScript, transcribe } from "./scripts.js";

// ---------------------------------------------------------------- helpers
const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (c) => {
      data += c;
      if (data.length > 1_000_000) reject(new Error("body too large"));
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
  });

// Only this computer, only this page: rejects other Host headers (DNS rebinding)
// and cross-site POSTs from other origins open in the same browser.
function trusted(req) {
  const host = req.headers.host || "";
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) return false;
  const origin = req.headers.origin;
  if (req.method !== "GET" && origin && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) return false;
  return true;
}

// ---------------------------------------------------------------- C-test (ctest.py)
function latestCtestFile(ctx) {
  const notes = path.join(ctx.domainDir, "notes");
  if (!fs.existsSync(notes)) return null;
  const files = fs.readdirSync(notes).filter((f) => /^ctest-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  return files.length ? path.join(notes, files.at(-1)) : null;
}

/** The test without its key: the browser never receives the missing letters. */
function ctestState(ctx) {
  const file = latestCtestFile(ctx);
  if (!file) return { exists: false };
  const t = JSON.parse(fs.readFileSync(file, "utf8"));
  return {
    exists: true,
    file: path.basename(file),
    date: t.date,
    today: t.date === new Date().toLocaleDateString("sv-SE"),
    minutesPerText: t.minutes_per_text,
    texts: t.texts.map((x, i) => ({ n: i + 1, gaps: x.gaps.length, score: x.score })),
  };
}

// Learners as the browser sees them (no folder paths).
const publicLearner = (l) => ({ id: l.id, name: l.name });

// ---------------------------------------------------------------- routes
const routes = {
  "GET /api/info": async (req, url, ctx) => ({
    domain: DOMAIN,
    dataRoot: ctx.dataRoot,
    sandbox: SANDBOX,
    skillDir: SKILL_DIR,
    hasData: fs.existsSync(path.join(ctx.domainDir, "profile.md")),
    learner: publicLearner(ctx.learner),
    learners: listLearners().map(publicLearner),
    claude: claudeStatus(),
  }),

  // ---------------------------------------------------------------- learners (learners.js)
  "POST /api/learners": async (req) => {
    const { name } = await readBody(req);
    const l = addLearner(name);
    // Same start as the first learner: the skill's templates (profile, CSVs) in their own folder.
    const r = await runScript("init_learner.py", ["--domain", DOMAIN], { dataRoot: l.root });
    if (r.code !== 0) throw new Error(r.stderr || r.stdout);
    return publicLearner(l);
  },

  "POST /api/learners/rename": async (req) => {
    const { id, name } = await readBody(req);
    return publicLearner(renameLearner(String(id), name));
  },

  "GET /api/course": async (req, url, ctx) => {
    const r = await runScript("course.py", ["status", "--domain", DOMAIN], { dataRoot: ctx.dataRoot });
    if (r.code !== 0) return { ok: false, text: r.stderr || r.stdout };
    return { ok: true, text: r.stdout, ...parseCourseStatus(r.stdout) };
  },

  "GET /api/plan": async (req, url, ctx) => planState(ctx, ctestState(ctx)),

  "GET /api/ctest": async (req, url, ctx) => ctestState(ctx),

  "POST /api/ctest/make": async (req, url, ctx) => {
    const r = await runScript("ctest.py", ["make", "--domain", DOMAIN], { dataRoot: ctx.dataRoot });
    if (r.code !== 0) throw new Error(r.stderr || r.stdout);
    return ctestState(ctx);
  },

  "GET /api/ctest/text": async (req, url, ctx) => {
    const n = Number(url.searchParams.get("n"));
    const r = await runScript("ctest.py", ["show", "--domain", DOMAIN, "--text", String(n)], { dataRoot: ctx.dataRoot });
    if (r.code !== 0) throw new Error(r.stderr || r.stdout);
    // "Text 2/4 · ~5 min\n\n<display with Wo___(1) gaps>"
    const [header, ...rest] = r.stdout.split(/\r?\n/);
    return { n, header, display: rest.join("\n").trim() };
  },

  "POST /api/ctest/score": async (req, url, ctx) => {
    const { text, answers } = await readBody(req);
    const n = Number(text);
    // "1 us 2 st ...": ctest.py's own answer format; blanks are left out and count as wrong.
    const parts = Object.entries(answers || {})
      .map(([k, v]) => [Number(k), String(v).replace(/[\s\d,;]+/g, "")])
      .filter(([k, v]) => k > 0 && v)
      .sort((a, b) => a[0] - b[0])
      .map(([k, v]) => `${k} ${v}`);
    const r = await runScript("ctest.py", ["score", "--domain", DOMAIN, "--text", String(n), "--answers", parts.join(" ") || "0 -"], { dataRoot: ctx.dataRoot });
    if (r.code !== 0) throw new Error(r.stderr || r.stdout);
    // Only the first line ("text 2 (B1.1): 14/20"); the misses stay in the log for the coach.
    const m = r.stdout.match(/:\s*(\d+)\/(\d+)/);
    return { n, score: m ? Number(m[1]) : null, max: m ? Number(m[2]) : null, state: ctestState(ctx) };
  },

  "GET /api/ctest/result": async (req, url, ctx) => {
    const r = await runScript("ctest.py", ["result", "--domain", DOMAIN], { dataRoot: ctx.dataRoot });
    return { ok: r.code === 0, text: r.stdout || r.stderr };
  },

  // ---------------------------------------------------------------- audio (speak.py)
  "POST /api/speak": async (req, url, ctx) => {
    const { text, speed } = await readBody(req);
    if (!text || !String(text).trim()) throw new Error("no text");
    const sp = ["slow", "normal", "both"].includes(speed) ? speed : "normal";
    const r = await runScript("speak.py", ["say", String(text), "--domain", DOMAIN, "--speed", sp], { timeoutMs: 120_000, dataRoot: ctx.dataRoot });
    if (r.code !== 0) throw new Error(r.stderr || r.stdout || "audio generation failed");
    return { path: r.stdout.split(/\r?\n/).at(-1).trim() };
  },
};

const AUDIO_TYPES = { ".mp3": "audio/mpeg", ".webm": "audio/webm", ".ogg": "audio/ogg", ".m4a": "audio/mp4", ".wav": "audio/wav" };

async function serveFile(res, url, ctx) {
  // Audio only (speak.py MP3s, mic recordings), and only from inside the learner data folder.
  const p = url.searchParams.get("path") || "";
  const type = AUDIO_TYPES[path.extname(p).toLowerCase()];
  if (!type || !isInside(ctx.dataRoot, p) || !fs.existsSync(p)) return json(res, 404, { error: "not found" });
  res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
  fs.createReadStream(p).pipe(res);
}

const readRaw = (req, limit = 25_000_000) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error("recording too large"));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

// Microphone: save the recording in <data>/<domain>/recordings/, then transcribe it offline.
async function saveRecording(req, res, ctx) {
  const ext = { "audio/webm": ".webm", "audio/ogg": ".ogg", "audio/mp4": ".m4a", "audio/wav": ".wav" }[
    String(req.headers["content-type"] || "").split(";")[0].trim()
  ];
  if (!ext) return json(res, 415, { error: "unsupported audio type" });
  const body = await readRaw(req);
  if (body.length < 1000) return json(res, 400, { error: "The recording is empty. Check that the right microphone is selected." });
  const dir = path.join(ctx.domainDir, "recordings");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  const file = path.join(dir, `${stamp}-mic${ext}`);
  fs.writeFileSync(file, body);
  const r = await transcribe(file);
  if (r.code === 3) return json(res, 200, { path: file, text: "", error: "Offline transcription needs faster-whisper: python -m pip install faster-whisper" });
  if (r.code !== 0) return json(res, 200, { path: file, text: "", error: r.stderr.split(/\r?\n/).at(-1) || "transcription failed" });
  return json(res, 200, { path: file, ...JSON.parse(r.stdout) });
}

async function serveDashboard(res, ctx) {
  if (!fs.existsSync(ctx.domainDir)) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(`<p style="font-family:sans-serif">No data folder for ${DOMAIN} yet. Start with the coach in the chat.</p>`);
  }
  const r = await runScript("dashboard.py", ["--domain", DOMAIN], { dataRoot: ctx.dataRoot });
  if (r.code !== 0) return json(res, 500, { error: r.stderr || r.stdout });
  res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  fs.createReadStream(r.stdout.split(/\r?\n/).at(-1).trim()).pipe(res);
}

// One chat turn, streamed back as NDJSON (one event per line).
async function chat(req, res, ctx) {
  const { message, sessionId } = await readBody(req);
  if (!message || !String(message).trim()) return json(res, 400, { error: "empty message" });
  res.writeHead(200, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
  const auth = CLAUDE_BIN ? ensureLoggedIn() : { ok: true }; // runTurn reports a missing CLI itself
  if (!auth.ok) {
    const s = auth.status;
    return res.end(JSON.stringify({ type: "done", ok: false, code: "not_logged_in", error: "Claude CLI not logged in", loginCommand: s.loginCommand }) + "\n");
  }
  const abort = runTurn({ message: String(message), sessionId, ctx }, (ev) => {
    if (ev.type === "audio") {
      if (!isInside(ctx.dataRoot, ev.path)) return;
      ev.url = `/api/file?path=${encodeURIComponent(ev.path)}`;
    }
    res.write(JSON.stringify(ev) + "\n");
    if (ev.type === "done") res.end();
  });
  res.on("close", abort); // browser pressed Stop or closed the tab
}

// ---------------------------------------------------------------- server
let vite = null; // created below, once we know this instance will run

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (!trusted(req)) return json(res, 403, { error: "forbidden" });
  try {
    if (url.pathname.startsWith("/api/")) {
      // Whose data? The page sets a cookie when you pick a learner, so iframes and audio players carry it too.
      const ctx = ctxFor(learnerFromRequest(req));
      if (req.method === "POST" && url.pathname === "/api/chat") return await chat(req, res, ctx);
      if (req.method === "POST" && url.pathname === "/api/recording") return await saveRecording(req, res, ctx);
      if (url.pathname === "/api/file") return await serveFile(res, url, ctx);
      if (url.pathname === "/api/dashboard") return await serveDashboard(res, ctx);
      const route = routes[`${req.method} ${url.pathname}`];
      if (!route) return json(res, 404, { error: "no such route" });
      return json(res, 200, await route(req, url, ctx));
    }
    if (vite) return vite.middlewares(req, res);
    return serveStatic(res, url);
  } catch (e) {
    json(res, 500, { error: String(e.message || e) });
  }
});

function serveStatic(res, url) {
  const dist = path.join(WEBUI_DIR, "dist");
  let p = path.join(dist, decodeURIComponent(url.pathname));
  if (!isInside(dist, p) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(dist, "index.html");
  const type = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" }[path.extname(p)];
  res.writeHead(200, { "content-type": (type || "application/octet-stream") + "; charset=utf-8" });
  fs.createReadStream(p).pipe(res);
}

async function prepareSandbox() {
  if (!SANDBOX || fs.existsSync(path.join(DOMAIN_DIR, "profile.md"))) return;
  const r = await runScript("init_learner.py", ["--domain", DOMAIN], { dataRoot: DATA_ROOT });
  console.log(r.stdout || r.stderr);
}

const URL_ = `http://${HOST}:${PORT}`;

// --open: show the page in the default browser (whatever the user picked, e.g. Firefox).
function openBrowser() {
  if (!process.argv.includes("--open")) return;
  const [cmd, args] =
    process.platform === "win32" ? ["cmd", ["/c", "start", "", URL_]] :
    process.platform === "darwin" ? ["open", [URL_]] : ["xdg-open", [URL_]];
  spawn(cmd, args, { detached: true, stdio: "ignore", windowsHide: true }).unref();
}

// Already running (e.g. started earlier)? Then just open it instead of starting a second copy.
async function reuseRunning() {
  const info = await fetch(`${URL_}/api/info`, { signal: AbortSignal.timeout(3000) }).then((r) => r.json()).catch(() => null);
  if (!info?.domain) return false;
  console.log(`learning-coach UI is already running at ${URL_} (data ${info.dataRoot}).`);
  if (info.sandbox !== SANDBOX) console.log(`  Note: that one uses ${info.sandbox ? "SANDBOX" : "your real"} data. Close its window to switch.`);
  openBrowser();
  return true;
}

server.on("error", async (e) => {
  if (e.code !== "EADDRINUSE") throw e;
  if (await reuseRunning()) process.exit(0);
  console.error(`Port ${PORT} is used by another program. Set PORT to another number and try again.`);
  process.exit(1);
});

if (await reuseRunning()) process.exit(0);
if (!PROD) {
  const { createServer } = await import("vite");
  // Live reload shares our port instead of opening a second one.
  vite = await createServer({ root: WEBUI_DIR, server: { middlewareMode: true, hmr: { server } }, appType: "spa" });
}
await prepareSandbox();
server.listen(PORT, HOST, () => {
  console.log(`learning-coach UI  ->  ${URL_}`);
  console.log(`  domain ${DOMAIN}  ·  data ${DATA_ROOT}${SANDBOX ? "  (SANDBOX: throwaway practice data)" : ""}`);
  console.log(`  learners ${listLearners().map((l) => l.name).join(", ")}`);
  console.log(`  skill  ${SKILL_DIR}`);
  console.log(`  claude ${CLAUDE_BIN || "NOT FOUND (set CLAUDE_BIN)"}`);
  console.log("  Close this window (or press Ctrl+C) to stop.");
  openBrowser();
});
