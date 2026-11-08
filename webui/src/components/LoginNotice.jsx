import { useState } from "react";

// Shown when the local Claude Code CLI has no login. The UI never logs in for you:
// you run the command once in your own terminal (browser sign-in with your Claude subscription).
export default function LoginNotice({ command, onRecheck }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="login-notice">
      <strong>Claude CLI not logged in.</strong> The chat needs the local Claude Code CLI to be signed in with your Claude
      subscription. Run this once in your own terminal (PowerShell), then click “Check again”:
      <pre>{command || "claude auth login"}</pre>
      <div className="row">
        <button
          className="ghost"
          onClick={() => {
            navigator.clipboard?.writeText(command || "claude auth login");
            setCopied(true);
          }}
        >
          {copied ? "Copied" : "Copy command"}
        </button>
        {onRecheck && <button onClick={onRecheck}>Check again</button>}
        <span className="muted small">The C-test, Listen, Course and Progress panels work without it.</span>
      </div>
    </div>
  );
}
