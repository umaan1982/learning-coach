// Thin wrappers around the local server's /api routes.
async function req(method, url, body) {
  const r = await fetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `${r.status} ${r.statusText}`);
  return data;
}

export const api = {
  info: () => req("GET", "/api/info"),
  course: () => req("GET", "/api/course"),
  plan: () => req("GET", "/api/plan"),
  ctest: () => req("GET", "/api/ctest"),
  ctestMake: () => req("POST", "/api/ctest/make"),
  ctestText: (n) => req("GET", `/api/ctest/text?n=${n}`),
  ctestScore: (text, answers) => req("POST", "/api/ctest/score", { text, answers }),
  ctestResult: () => req("GET", "/api/ctest/result"),
  speak: (text, speed) => req("POST", "/api/speak", { text, speed }),
};

export const audioUrl = (path) => `/api/file?path=${encodeURIComponent(path)}`;

/** One chat turn. Calls onEvent for each NDJSON event; returns an AbortController. */
export function chatTurn({ message, sessionId }, onEvent) {
  const ctrl = new AbortController();
  (async () => {
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
        signal: ctrl.signal,
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        return onEvent({ type: "done", ok: false, error: e.error || r.statusText });
      }
      const reader = r.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        let i;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (line.trim()) onEvent(JSON.parse(line));
        }
      }
    } catch (e) {
      onEvent({ type: "done", ok: false, error: e.name === "AbortError" ? "stopped" : String(e) });
    }
  })();
  return ctrl;
}
