import { useEffect, useState } from "react";
import { api } from "../api.js";

// `course.py status`, shown as-is (the script is the source of truth).
export default function Course({ refreshKey }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const load = () => {
    setErr(null);
    api.course().then(setData).catch((e) => setErr(e.message));
  };
  useEffect(() => {
    load();
  }, [refreshKey]);

  const lines = (data?.text || "").split(/\r?\n/);
  return (
    <div className="panel-body course">
      <div className="row spread">
        <span>📊 <strong>Course</strong></span>
        <button className="ghost" onClick={load}>Refresh</button>
      </div>
      {err && <div className="error">{err}</div>}
      {data && !data.ok && <p className="muted small">{data.text}</p>}
      {data?.ok &&
        lines.map((l, i) => {
          const indent = /^\s+/.test(l);
          const flag = /BEHIND|!/.test(l) ? "warn" : /on track/.test(l) ? "good" : "";
          return (
            <div key={i} className={`course-line ${indent ? "indent" : ""} ${flag} ${i === 0 ? "first" : ""}`}>
              {l.trim()}
            </div>
          );
        })}
    </div>
  );
}
