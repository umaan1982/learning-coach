import { useState } from "react";

// The page from `dashboard.py`, rebuilt on every load and embedded as-is.
export default function Dashboard({ refreshKey }) {
  const [n, setN] = useState(0);
  const src = `/api/dashboard?k=${refreshKey}-${n}`;
  return (
    <div className="panel-body dashboard">
      <div className="row spread">
        <span>📊 <strong>Progress</strong></span>
        <span className="row">
          <button className="ghost" onClick={() => setN((x) => x + 1)}>Refresh</button>
          <a className="ghost button" href={src} target="_blank" rel="noreferrer">Open full page</a>
        </span>
      </div>
      <iframe title="Progress dashboard" src={src} />
    </div>
  );
}
