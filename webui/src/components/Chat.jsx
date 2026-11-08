import { useEffect, useRef, useState } from "react";
import { chatTurn } from "../api.js";
import Markdown from "../Markdown.jsx";

// One coach session = one Claude Code session id, resumed with `--resume` for every turn.
// The view is kept in localStorage so a page reload doesn't lose the lesson.
function usePersisted(key, initial) {
  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(v)), [key, v]);
  return [v, setV];
}

function appendEvent(turn, ev) {
  const parts = [...turn.parts];
  const last = parts.at(-1);
  if (ev.type === "delta" || ev.type === "text") {
    if (last?.kind === "text") parts[parts.length - 1] = { ...last, text: last.text + ev.text };
    else parts.push({ kind: "text", text: ev.text });
  } else if (ev.type === "block") {
    if (last?.kind === "text") parts.push({ kind: "text", text: "" });
  } else if (ev.type === "tool") {
    parts.push({ kind: "tool", name: ev.name, detail: ev.detail });
  } else if (ev.type === "audio") {
    if (!parts.some((p) => p.kind === "audio" && p.url === ev.url)) parts.push({ kind: "audio", url: ev.url, path: ev.path });
  }
  return { ...turn, parts };
}

export default function Chat({ info, sendRef }) {
  const scope = `${info.domain}|${info.dataRoot}`;
  const [turns, setTurns] = usePersisted(`lc-turns|${scope}`, []);
  const [sessionId, setSessionId] = usePersisted(`lc-session|${scope}`, null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const ctrl = useRef(null);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [turns]);

  const updateLast = (fn) =>
    setTurns((ts) => {
      const copy = ts.slice(-200);
      copy[copy.length - 1] = fn(copy[copy.length - 1]);
      return copy;
    });

  function send(text) {
    const message = String(text ?? draft).trim();
    if (!message || busy) return;
    setDraft("");
    setBusy(true);
    setTurns((ts) => [...ts.slice(-200), { role: "user", text: message }, { role: "coach", parts: [], status: "streaming" }]);
    ctrl.current = chatTurn({ message, sessionId }, (ev) => {
      if (ev.type === "session") setSessionId(ev.id);
      else if (ev.type === "done") {
        if (ev.sessionId) setSessionId(ev.sessionId);
        updateLast((t) => ({ ...t, status: ev.ok ? "done" : "error", error: ev.error, durationMs: ev.durationMs }));
        setBusy(false);
      } else updateLast((t) => appendEvent(t, ev));
    });
  }
  sendRef.current = send;

  function newSession() {
    if (busy) return;
    setSessionId(null);
    setTurns([]);
  }

  return (
    <section className="chat">
      <div className="chat-head">
        <span className="muted small">
          {sessionId ? <>session <code>{sessionId.slice(0, 8)}</code></> : "new session"}
        </span>
        <button className="ghost" onClick={newSession} disabled={busy} title="Start a fresh Claude Code session">
          New session
        </button>
      </div>

      <div className="messages">
        {turns.length === 0 && (
          <div className="empty">
            <p>Say what you want to do, like you would in the Claude app:</p>
            <p className="muted">“lernen”, “I have 20 minutes”, “where am I in the course?”, “continue the placement”</p>
          </div>
        )}
        {turns.map((t, i) =>
          t.role === "user" ? (
            <div key={i} className="msg user">{t.text}</div>
          ) : (
            <div key={i} className={`msg coach ${t.status}`}>
              {t.parts.map((p, j) =>
                p.kind === "text" ? (
                  p.text ? <Markdown key={j} text={p.text} /> : null
                ) : p.kind === "audio" ? (
                  <div key={j} className="audio-card">
                    🎧 <audio controls preload="auto" src={p.url} />
                  </div>
                ) : (
                  <div key={j} className="tool" title={p.detail}>
                    ⚙ {p.name}{p.detail ? <span className="muted"> · {p.detail}</span> : null}
                  </div>
                ),
              )}
              {t.status === "streaming" && <span className="cursor">▍</span>}
              {t.status === "error" && <div className="error">{t.error}</div>}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Your answer or message (Enter to send, Shift+Enter for a new line)"
          rows={3}
          autoFocus
          spellCheck={false}
          lang="de"
        />
        {busy ? (
          <button type="button" className="stop" onClick={() => ctrl.current?.abort()}>
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!draft.trim()}>
            Send
          </button>
        )}
      </form>
    </section>
  );
}
