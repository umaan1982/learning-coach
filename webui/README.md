# Learning coach: desktop web UI (prototype)

A local page for the learning-coach skill: the coach's chat plus a C-test, audio, course status and the progress dashboard. It uses your installed Claude Code CLI (your Claude subscription, no API key) and is only reachable from this computer.

- **Windows:** double-click `start-ui.cmd` in the repo root (`start-ui.cmd sandbox` for throwaway practice data).
- **Any OS:** `npm install`, then `npm run dev` (real data) or `npm run dev:sandbox`, and open http://127.0.0.1:5178.

Needs Node.js 20+ and the Claude Code CLI signed in once (`claude auth login`).
Details, design and test status: [`../docs/web-ui.md`](../docs/web-ui.md).
