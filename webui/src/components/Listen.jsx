import { useState } from "react";
import { api, audioUrl } from "../api.js";

// Text -> MP3 through scripts/speak.py (edge-tts, needs internet). No AI involved.
// The coach's own listening blocks show their audio inline in the chat instead.
export default function Listen() {
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState("both");
  const [clips, setClips] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function make(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const r = await api.speak(text, speed);
      setClips((c) => [{ text, speed, url: audioUrl(r.path) }, ...c].slice(0, 10));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel-body">
      <p>🎧 <strong>Listen</strong>: turn a German sentence into audio.</p>
      <form onSubmit={make}>
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} lang="de" spellCheck={false}
          placeholder="Ich habe gestern mit meinem Freund gesprochen." />
        <div className="row">
          <select value={speed} onChange={(e) => setSpeed(e.target.value)}>
            <option value="both">slow, then normal</option>
            <option value="normal">normal</option>
            <option value="slow">slow</option>
          </select>
          <button type="submit" disabled={busy || !text.trim()}>{busy ? "Making…" : "Make audio"}</button>
        </div>
      </form>
      {err && <div className="error">{err}</div>}
      {clips.map((c, i) => (
        <div key={c.url} className="clip">
          <audio controls src={c.url} autoPlay={i === 0} />
          <div className="small muted">{c.text}</div>
        </div>
      ))}
    </div>
  );
}
