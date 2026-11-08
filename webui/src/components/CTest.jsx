import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api.js";

// C-test panel. Everything goes through scripts/ctest.py (make / show / score / result);
// the server never sends the answer key to the browser.
// Placement rules mirrored from domains/german-b1/placement.md (Part 1 A):
//  - one text at a time, ~5 min each, guess if unsure
//  - don't show misses (and here: no per-text score until the end, placement stays neutral)
//  - stop early if text 1 is below 30%
const STOP_EARLY_BELOW = 0.3;

function segments(display) {
  const out = [];
  const re = /(\S*?)___\((\d+)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(display))) {
    if (m.index > last) out.push({ text: display.slice(last, m.index) });
    out.push({ visible: m[1], gap: Number(m[2]) });
    last = m.index + m[0].length;
  }
  if (last < display.length) out.push({ text: display.slice(last) });
  return out;
}

function Timer({ minutes, startedAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor((now - startedAt) / 1000);
  const over = s > minutes * 60;
  return (
    <span className={`muted small ${over ? "warn" : ""}`}>
      ⏱ {Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")} / ~{minutes} min
    </span>
  );
}

export default function CTest({ sendToCoach }) {
  const [state, setState] = useState(null);
  const [text, setText] = useState(null); // {n, header, display}
  const [answers, setAnswers] = useState({});
  const [startedAt, setStartedAt] = useState(Date.now());
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef(null);

  const load = () => api.ctest().then(setState).catch((e) => setErr(e.message));
  useEffect(() => {
    load();
  }, []);

  const t1 = state?.texts?.[0];
  const stoppedEarly = !!(state?.today && t1 && t1.score !== null && t1.score / t1.gaps < STOP_EARLY_BELOW);
  const nextText = state?.exists && state.today ? state.texts.find((t) => t.score === null) : null;
  const finished = state?.exists && state.today && (!nextText || stoppedEarly);

  useEffect(() => {
    setResult(null);
    if (finished) api.ctestResult().then(setResult).catch((e) => setErr(e.message));
  }, [finished, state]);

  async function guard(fn) {
    setErr(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const make = () =>
    guard(async () => {
      const scored = state?.today && state.texts.some((t) => t.score !== null);
      if (scored && !confirm("Today's C-test already has answers. Make a new one and overwrite them?")) return;
      setResult(null);
      setText(null);
      setState(await api.ctestMake());
    });

  const open = (n) =>
    guard(async () => {
      setText(await api.ctestText(n));
      setAnswers({});
      setStartedAt(Date.now());
      setTimeout(() => formRef.current?.querySelector("input")?.focus(), 50);
    });

  const submit = () =>
    guard(async () => {
      const blanks = segs.filter((s) => s.gap && !String(answers[s.gap] || "").trim()).length;
      if (blanks && !confirm(`${blanks} gap(s) are empty. Submit anyway? (Guessing is fine.)`)) return;
      const r = await api.ctestScore(text.n, answers);
      setText(null);
      setState(r.state);
    });

  const segs = useMemo(() => (text ? segments(text.display) : []), [text]);

  if (!state) return <div className="panel-body muted">{err || "Loading…"}</div>;

  return (
    <div className="panel-body ctest">
      {err && <div className="error">{err}</div>}

      {!(state.exists && state.today) && (
        <>
          <p>🧭 <strong>C-test</strong>: 4 short texts, about 5 minutes each.</p>
          {state.exists && <p className="muted small">Last test: {state.date}</p>}
          <button onClick={make} disabled={busy}>Make today's C-test</button>
        </>
      )}

      {state.exists && state.today && !text && !finished && (
        <>
          <p>🧭 <strong>C-test</strong> · {state.texts.filter((t) => t.score !== null).length}/{state.texts.length} texts done</p>
          <p className="small">
            Each text has words with the <strong>second half missing</strong>. Type the missing letters, or the whole word.
            About {state.minutesPerText} minutes per text. Guess if unsure.
          </p>
          <button onClick={() => open(nextText.n)} disabled={busy}>
            {nextText.n === 1 ? "Start text 1" : `Continue with text ${nextText.n}`}
          </button>
        </>
      )}

      {text && (
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="ctest-head">
            <strong>{text.header.replace(/\s*·.*$/, "")}</strong>
            <Timer minutes={state.minutesPerText} startedAt={startedAt} />
          </div>
          <p className="ctest-text" lang="de">
            {segs.map((s, i) =>
              s.gap ? (
                <span key={i} className="gap">
                  {s.visible}
                  <input
                    aria-label={`gap ${s.gap}`}
                    title={`gap ${s.gap}`}
                    value={answers[s.gap] || ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [s.gap]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const inputs = [...formRef.current.querySelectorAll("input")];
                        inputs[inputs.indexOf(e.target) + 1]?.focus();
                      }
                    }}
                    style={{ width: `${Math.max(3, s.visible.length + 2)}ch` }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </span>
              ) : (
                <span key={i}>{s.text}</span>
              ),
            )}
          </p>
          <div className="row">
            <button type="submit" disabled={busy}>Submit text {text.n}</button>
            <span className="muted small">Tab or Enter moves to the next gap.</span>
          </div>
        </form>
      )}

      {finished && (
        <>
          {stoppedEarly && <p>Text 1 was below 30%, so the rest of the C-test is skipped (placement rule).</p>}
          <p>✅ <strong>C-test done.</strong></p>
          {result && <pre className="result">{result.text}</pre>}
          <div className="row">
            <button
              onClick={() =>
                sendToCoach(
                  `I finished the C-test in the web UI (${state.file}). ` +
                    `Read the result with ctest.py result and continue the placement.`,
                )
              }
            >
              Hand back to the coach
            </button>
            <button className="ghost" onClick={make} disabled={busy}>New C-test</button>
          </div>
        </>
      )}
    </div>
  );
}
