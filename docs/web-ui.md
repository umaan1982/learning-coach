# Local web UI (prototype)

A desktop-only page for using the learning-coach skill at your computer. Not hosted, no API key.

```
webui/
  server/index.js    local HTTP server, bound to 127.0.0.1 (rejects other Host/Origin headers)
  server/claude.js   drives the local Claude Code CLI
  server/scripts.js  runs the skill's Python scripts (no AI)
  src/               React (Vite): chat pane + side panel (Course, C-test, Listen, Progress)
```

Start: `cd webui && npm install && npm run dev` (real data), or `npm run dev:sandbox` (throwaway data folder in the OS temp dir). Open http://127.0.0.1:5178.

## How the backend calls the CLI

One chat turn = one process:

```
claude -p --output-format stream-json --verbose --include-partial-messages
       --permission-mode acceptEdits --permission-prompts none
       --add-dir <skill dir> --append-system-prompt "<where the coach is running>"
       --disallowedTools AskUserQuestion
       --allowedTools Skill Read Glob Grep Write Edit "Bash(python *)" ...
       [--resume <session_id>]
```

- The learner's message goes in on **stdin**, never on the command line.
- The `session_id` from the `system/init` event is kept per data folder and passed back with `--resume`, so a lesson keeps its context. "New session" drops it.
- cwd is the learner data folder; `LEARNING_COACH_DATA` is passed through, so the CLI and the panels see the same data.
- **Subscription only:** `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL` and leftover `CLAUDE_CODE_*` variables are removed from the child environment. The CLI must be logged in with `claude auth login` (or `CLAUDE_CODE_OAUTH_TOKEN` from `claude setup-token`).
- CLI lookup: `CLAUDE_BIN`, then `PATH`, then `~/.local/bin`, then the copy the Claude desktop app keeps under `%APPDATA%\Claude\claude-code\<version>\`.
- stream-json events are normalised to NDJSON for the browser: text deltas, tool-use lines, MP3 paths from tool output (shown as audio players), and a final `done`.
- The appended system prompt only says where the coach is running and that there are no clickable-choice buttons. SKILL.md stays the single source of truth for the coaching process.

## Structured components vs chat

| Interaction | Where | Why |
|---|---|---|
| Lessons, recall, hints, feedback, writing, placement sections B/C | **Chat** | Attempt-first, hint-before-answer and focus-mode messages are the skill's job; the UI only renders Markdown. |
| C-test | **Panel**, `ctest.py make/show/score/result` | An input per gap is far easier than typing `1 ung 2 im …`. The server never sends the answer key; no misses or per-text scores until the end (placement stays neutral); stop early if text 1 < 30% (placement.md). "Hand back to the coach" tells the chat to read `ctest.py result` and continue. |
| Listening audio | **Panel**, `speak.py say` + players inline in chat for the coach's own MP3s | |
| Course status | **Panel**, `course.py status` | |
| Progress | **Panel**, `dashboard.py` page in an iframe | |

Inputs have spell-check and autocorrect off, so the browser can't give away answers.

## Status (prototype)

Tested on a sandbox data folder: C-test end to end (make → 4 texts → result, stop-early rule, overwrite warning), audio, dashboard, course status, 127.0.0.1-only binding and Host/Origin checks.

Open:
- Chat round-trip not yet verified: the CLI on this machine was not logged in (`Not logged in · Please run /login`).
- A React "destroy is not a function" crash appeared after sending a chat message (some `useEffect` returns a non-function); needs a fix before use.
