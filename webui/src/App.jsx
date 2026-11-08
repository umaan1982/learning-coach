import { Component, useEffect, useRef, useState } from "react";
import { api } from "./api.js";
import LoginNotice from "./components/LoginNotice.jsx";
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

// Keeps a bug in one pane from blanking the whole page.
class Boundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="panel-body error">
        {this.props.name} crashed: {String(this.state.error.message || this.state.error)}
        <div className="row">
          <button onClick={() => this.setState({ error: null })}>Try again</button>
        </div>
      </div>
    );
  }
}

export default function App() {
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState(() => localStorage.getItem("lc-tab") || "course");
  const [wide, setWide] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const sendRef = useRef(() => {});

  const recheck = () => api.info().then(setInfo).catch((e) => setErr(e.message));
  useEffect(() => {
    recheck();
  }, []);
  useEffect(() => {
    localStorage.setItem("lc-tab", tab);
  }, [tab]);

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

      {!c.bin && (
        <div className="banner">
          Claude Code CLI not found. Install it (https://code.claude.com/docs/en/setup) or set <code>CLAUDE_BIN</code>, then
          restart the server. The side panels work without it.
        </div>
      )}
      {c.bin && !c.loggedIn && (
        <div className="banner">
          <LoginNotice command={c.loginCommand} onRecheck={recheck} />
        </div>
      )}

      <main>
        <Boundary name="Chat">
          <Chat info={info} sendRef={sendRef} onRecheck={recheck} onAuthProblem={recheck} />
        </Boundary>
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
          <Boundary name={tab} key={tab}>
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
          </Boundary>
        </aside>
      </main>
    </div>
  );
}
