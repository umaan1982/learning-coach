import { useEffect, useRef, useState } from "react";
import { api } from "./api.js";
import Chat from "./components/Chat.jsx";
import Course from "./components/Course.jsx";
import CTest from "./components/CTest.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Listen from "./components/Listen.jsx";

const TABS = [
  ["course", "Course"],
  ["ctest", "C-test"],
  ["listen", "Listen"],
  ["progress", "Progress"],
];

export default function App() {
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState(() => localStorage.getItem("lc-tab") || "course");
  const [wide, setWide] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const sendRef = useRef(() => {});

  useEffect(() => {
    api.info().then(setInfo).catch((e) => setErr(e.message));
  }, []);
  useEffect(() => localStorage.setItem("lc-tab", tab), [tab]);

  if (err) return <div className="boot error">Can't reach the local server: {err}</div>;
  if (!info) return <div className="boot muted">Starting…</div>;

  const c = info.claude;
  return (
    <div className={`app ${wide ? "wide" : ""}`}>
      <header>
        <strong>Learning coach</strong>
        <span className="pill">{info.domain}</span>
        {info.sandbox && <span className="pill sandbox" title={info.dataRoot}>SANDBOX data</span>}
        <span className="muted small path" title="Learner data folder">{info.dataRoot}</span>
        <span className="spacer" />
        <span
          className={`pill ${c.bin && c.loggedIn ? "good" : "warn"}`}
          title={c.bin || "Claude Code CLI not found"}
        >
          {!c.bin ? "claude: not found" : c.loggedIn ? `claude ${c.version?.split(" ")[0] || ""}` : "claude: not logged in"}
        </span>
      </header>

      {c.bin && !c.loggedIn && (
        <div className="banner">
          The Claude Code CLI isn't logged in, so the chat can't answer yet. Run <code>claude auth login</code> once in a
          terminal and sign in with your Claude subscription, then reload. The side panels work without it.
        </div>
      )}

      <main>
        <Chat info={info} sendRef={sendRef} />
        <aside>
          <nav>
            {TABS.map(([id, label]) => (
              <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
            <span className="spacer" />
            <button className="ghost" onClick={() => setWide((w) => !w)} title="Make the side panel wider">
              {wide ? "⇥" : "⇤"}
            </button>
          </nav>
          {tab === "course" && <Course refreshKey={refreshKey} />}
          {tab === "ctest" && (
            <CTest
              sendToCoach={(m) => {
                sendRef.current(m);
                setRefreshKey((k) => k + 1);
              }}
            />
          )}
          {tab === "listen" && <Listen />}
          {tab === "progress" && <Dashboard refreshKey={refreshKey} />}
        </aside>
      </main>
    </div>
  );
}
