// Local server for the learning-coach web UI. Bound to 127.0.0.1 only.
//   npm run dev           -> real data (~/learning-coach-data or $LEARNING_COACH_DATA), Vite dev middleware
//   npm run dev:sandbox   -> throwaway data folder in the OS temp dir
//   npm run build && npm start -> serves the built front end
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { CLAUDE_BIN, claudeStatus, ensureLoggedIn, runTurn } from "./claude.js";
import { DATA_ROOT, DOMAIN, DOMAIN_DIR, HOST, PORT, PROD, SANDBOX, SKILL_DIR, WEBUI_DIR, isInside } from "./config.js";
import { runScript } from "./scripts.js";

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
function latestCtestFile() {
  const notes = path.join(DOMAIN_DIR, "notes");
  if (!fs.existsSync(notes)) return null;
  const files = fs.readdirSync(notes).filter((f) => /^ctest-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  return files.length ? path.join(notes, files.at(-1)) : null;
}

/** The test without its key: the browser never receives the missing letters. */
function ctestState() {
  const file = latestCtestFile();
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

// ---------------------------------------------------------------- routes
const routes = {
  "GET /api/info": async () => ({
    domain: DOMAIN,
    dataRoot: DATA_ROOT,
    sandbox: SANDBOX,
    skillDir: SKILL_DIR,
    hasData: fs.existsSync(path.join(DOMAIN_DIR, "profile.md")),
    claude: claudeStatus(),
  }),

  "GET /api/course": async () => {
    const r = await runScript("course.py", ["status", "--domain", DOMAIN]);
    return { ok: r.code === 0, text: r.stdout || r.stderr };
  },

  "GET /api/ctest": async () => ctestState(),

  "POST /api/ctest/make": async () => {
    const r = await runScript("ctest.py", ["make", "--domain", DOMAIN]);
    if (r.code !== 0) throw new Error(r.stderr || r.stdout);
    return ctestState();
  },

  "GET /api/ctest/text": async (req, url) => {
    const n = Number(url.searchParams.get("n"));
    const r = await runScript("ctest.py", ["show", "--domain", DOMAIN, "--text", String(n)]);
    if (r.code !== 0) throw new Error(r.stderr || r.stdout);
    // "Text 2/4 · ~5 min\n\n<display with Wo___(1) gaps>"
    const [header, ...rest] = r.stdout.split(/\r?\n/);
    return { n, header, display: rest.join("\n").trim() };
  },

  "POST /api/ctest/score": async (req) => {
    const { text, answers } = await readBody(req);
    const n = Number(text);
    // "1 us 2 st ...": ctest.py's own answer format; blanks are left out and count as wrong.
    const parts = Object.entries(answers || {})
      .map(([k, v]) => [Number(k), String(v).replace(/[\s\d,;]+/g, "")])
      .filter(([k, v]) => k > 0 && v)
      .sort((a, b) => a[0] - b[0])
      .map(([k, v]) => `${k} ${v}`);
    const r = await runScript("ctest.py", ["score", "--domain", DOMAIN, "--text", String(n), "--answers", parts.join(" ") || "0 -"]);
    if (r.code !== 0) throw new Error(r.stderr || r.stdout);
    // Only the first line ("text 2 (B1.1): 14/20"); the misses stay in the log for the coach.
    const m = r.stdout.match(/:\s*(\d+)\/(\d+)/);
    return { n, score: m ? Number(m[1]) : null, max: m ? Number(m[2]) : null, state: ctestState() };
  },

  "GET /api/ctest/result": async () => {
    const r = await runScript("ctest.py", ["result", "--domain", DOMAIN]);
    return { ok: r.code === 0, text: r.stdout || r.stderr };
  },

  // ---------------------------------------------------------------- audio (speak.py)
  "POST /api/speak": async (req) => {
    const { text, speed } = await readBody(req);
    if (!text || !String(text).trim()) throw new Error("no text");
    const sp = ["slow", "normal", "both"].includes(speed) ? speed : "normal";
    const r = await runScript("speak.py", ["say", String(text), "--domain", DOMAIN, "--speed", sp], { timeoutMs: 120_000 });
    if (r.code !== 0) throw new Error(r.stderr || r.stdout || "audio generation failed");
    return { path: r.stdout.split(/\r?\n/).at(-1).trim() };
  },
};

async function serveFile(res, url) {
  // MP3s from speak.py; only files inside the learner data folder.
  const p = url.searchParams.get("path") || "";
  if (!/\.mp3$/i.test(p) || !isInside(DATA_ROOT, p) || !fs.existsSync(p)) return json(res, 404, { error: "not found" });
  res.writeHead(200, { "content-type": "audio/mpeg", "cache-control": "no-store" });
  fs.createReadStream(p).pipe(res);
}

async function serveDashboard(res) {
  if (!fs.existsSync(DOMAIN_DIR)) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(`<p style="font-family:sans-serif">No data folder for ${DOMAIN} yet. Start with the coach in the chat.</p>`);
  }
  const r = await runScript("dashboard.py", ["--domain", DOMAIN]);
  if (r.code !== 0) return json(res, 500, { error: r.stderr || r.stdout });
  res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  fs.createReadStream(r.stdout.split(/\r?\n/).at(-1).trim()).pipe(res);
}

// One chat turn, streamed back as NDJSON (one event per line).
async function chat(req, res) {
  const { message, sessionId } = await readBody(req);
  if (!message || !String(message).trim()) return json(res, 400, { error: "empty message" });
  res.writeHead(200, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
  const auth = CLAUDE_BIN ? ensureLoggedIn() : { ok: true }; // runTurn reports a missing CLI itself
  if (!auth.ok) {
    const s = auth.status;
    return res.end(JSON.stringify({ type: "done", ok: false, code: "not_logged_in", error: "Claude CLI not logged in", loginCommand: s.loginCommand }) + "\n");
  }
  const abort = runTurn({ message: String(message), sessionId }, (ev) => {
    if (ev.type === "audio") {
      if (!isInside(DATA_ROOT, ev.path)) return;
      ev.url = `/api/file?path=${encodeURIComponent(ev.path)}`;
    }
    res.write(JSON.stringify(ev) + "\n");
    if (ev.type === "done") res.end();
  });
  res.on("close", abort); // browser pressed Stop or closed the tab
}

// ---------------------------------------------------------------- server
let vite = null;
if (!PROD) {
  const { createServer } = await import("vite");
  vite = await createServer({ root: WEBUI_DIR, server: { middlewareMode: true }, appType: "spa" });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (!trusted(req)) return json(res, 403, { error: "forbidden" });
  try {
    if (url.pathname.startsWith("/api/")) {
      if (req.method === "POST" && url.pathname === "/api/chat") return await chat(req, res);
      if (url.pathname === "/api/file") return await serveFile(res, url);
      if (url.pathname === "/api/dashboard") return await serveDashboard(res);
      const route = routes[`${req.method} ${url.pathname}`];
      if (!route) return json(res, 404, { error: "no such route" });
      return json(res, 200, await route(req, url));
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
  const r = await runScript("init_learner.py", ["--domain", DOMAIN]);
  console.log(r.stdout || r.stderr);
}

await prepareSandbox();
server.listen(PORT, HOST, () => {
  console.log(`learning-coach UI  ->  http://${HOST}:${PORT}`);
  console.log(`  domain ${DOMAIN}  ·  data ${DATA_ROOT}${SANDBOX ? "  (SANDBOX)" : ""}`);
  console.log(`  skill  ${SKILL_DIR}`);
  console.log(`  claude ${CLAUDE_BIN || "NOT FOUND (set CLAUDE_BIN)"}`);
});
