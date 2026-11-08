# Learning Coach: a research-based learning skill for Claude

A Claude skill that runs a **learning process taken from learning-science research**:
- placement before teaching
- retrieval practice with feedback
- spaced repetition (Anki/FSRS)
- successive relearning
- tutor-style hints instead of answers
- an error log that drives practice
- difficulty held at ~80–90% success
- target-format mocks

The process is generic: it works for any subject. Everything subject-specific (syllabus, placement test, course map, exam format, error types) lives in a **domain pack**. See [Domain packs](#domain-packs).

**It runs as a structured course, like a language institute:**
```
Course  (your level → your goal, by your date)
 └─ Module  (4–6 weeks)          → ends with a module test in the target exam format
     └─ Unit  (about 1 week, 1 theme)
         │                        → 2–3 can-do goals + what that theme needs
         │                        → ends with a unit check (≥80% → next unit; otherwise correctives)
         └─ Lesson  (one study slot, e.g. a 35-min commute)
```
Units build on each other, and earlier units keep coming back in recall and in every check (spiral review). Each domain pack brings its own course map. `course.py` tracks where you are and warns when you fall behind the plan.

> Why: AI can help or harm learning. In a field experiment, students with unrestricted GPT-4 scored 17% worse once it was taken away, while a guard-railed tutor avoided the harm (Bastani et al., *PNAS* 2025). A well-designed AI tutor beat in-class active learning at Harvard (Kestin et al., *Sci. Reports* 2025). This skill encodes the guard rails and the techniques with the strongest evidence. See [`docs/research-brief.md`](docs/research-brief.md).

## What it does

| You say | The coach |
|---------|-----------|
| "Set me up for my exam in June" | Onboarding: goal, deadline, time slots (e.g. train 2×35 min, no speaking aloud), Anki setup |
| (first time) | Placement modelled on how institutes place learners: self-rating, a C-test as a fast router, then targeted sections with stop and ceiling rules, a sub-level result (e.g. B1.1) and a check against a free official placement test |
| "let's study" / "quiz me" / "I have 20 min" | Daily session: recall → learn → contrast → use it → understand → log |
| *pastes a voice-chat mistake list* | Imports the errors into the log and creates flashcards |
| "how am I doing?" | Progress report plus a visual dashboard (HTML, works offline, light/dark): days left, streak, minutes per day, recall accuracy vs the 80–90% target, open mistake patterns, strand mix, speech clarity |
| "Evening train, let's do listening" | Language domains: generated audio in the target language (two-voice exam-style dialogues, slow-then-normal) with one question at a time |
| *sends a voice recording* | Pronunciation check: clarity %, words heard wrongly, speech rate and pauses |
| "where am I in the course?" | Current unit and lesson day, the plan to the exam, on track or behind |
| Friday morning | Unit check: mastery gate, cumulative over earlier units |
| weekly / end of module | Mixed review, fluency drill, module test in the target exam format |
| "can I use this for statistics?" | Builds a new domain pack following the spec |

## Repository layout

```
learning-coach/                         ← Claude Code plugin marketplace
├── .claude-plugin/marketplace.json
├── docs/research-brief.md              ← the research the process is built on
├── docs/web-ui.md                      ← how the optional desktop web UI works
├── start-ui.cmd                        ← one-click start for the web UI (Windows)
├── webui/                              ← the web UI: small local server + React page
└── plugins/learning-coach/
    ├── .claude-plugin/plugin.json
    └── skills/learning-coach/
        ├── SKILL.md                    ← the process (domain-agnostic)
        ├── references/                 ← evidence, session protocol, file formats, domain-pack spec
        ├── scripts/                    ← init_learner, anki_connect, progress, course, ctest, dashboard (stdlib only);
        │                                  speak (edge-tts), pronounce (faster-whisper)
        ├── requirements.txt            ← optional packages for audio and pronunciation
        ├── templates/                  ← learner profile + CSV templates
        ├── domains/<id>/               ← domain packs (e.g. german-b1)
        └── evals/                      ← test cases (claude plugin eval format)
```

## Install

**Claude Code (plugin):**
```bash
claude plugin marketplace add umaan1982/learning-coach
claude plugin install learning-coach@learning-coach-marketplace
```
Then just talk to it ("let's study", "set me up for my exam"), or call it with `/learning-coach:learning-coach`.

**Claude Code (plain skill):** copy `plugins/learning-coach/skills/learning-coach/` into `~/.claude/skills/`.

**Use from your phone:** start the session on your computer and turn on Remote Control. Then open the Claude app → **Code** and continue there. Your computer has to stay on.

**Desktop web UI (optional, prototype; React + shadcn/ui):** a local page with the coach's chat on the left and tools on the right: a C-test with one input box per gap, an audio maker, course status and the progress dashboard. It drives your locally installed Claude Code CLI, so it runs on your Claude subscription. There's no API key and no hosting, and it's only reachable from your own computer (127.0.0.1). The coaching itself is unchanged: the chat runs this same skill.
- Needs [Node.js](https://nodejs.org) 20+ and the Claude Code CLI, signed in once with `claude auth login`.
- Windows: double-click **`start-ui.cmd`**, or run `start-ui.cmd sandbox` to try it on throwaway practice data (your real data is blocked in that mode). It installs what it needs on first run and opens the page in your default browser.
- macOS/Linux: `cd webui && npm install && npm run dev` (or `npm run dev:sandbox`), then open http://127.0.0.1:5178.
- How it works and what's tested: [`docs/web-ui.md`](docs/web-ui.md).

**Listening and speaking:** `pip install edge-tts` (internet needed). The coach then generates audio in the domain's language (single sentences, slow-then-normal, or two-voice exam-style conversations) and sends the MP3 to your phone. For speaking, answer through the Claude app's mic (dictation). The coach compares the transcript with the target sentence. With `--audio`, flashcards get sound too. See [`references/audio-practice.md`](plugins/learning-coach/skills/learning-coach/references/audio-practice.md).

**Pronunciation check:** `pip install faster-whisper` (offline; the speech model downloads once, ~460 MB). Record a voice memo, attach it in the Claude app, and the coach scores it against the sentence you meant to say: clarity %, words heard wrongly, words/min and pauses. This is intelligibility to a speech recogniser, not a phonetician's grade.

**Install everything optional at once:** `pip install -r plugins/learning-coach/skills/learning-coach/requirements.txt`

## Your data
Learner data never lives in this repo. By default it's in `~/learning-coach-data/<domain>/` (override with `LEARNING_COACH_DATA`):
- `profile.md`
- `sessions.csv`
- `errors.csv`
- `notes/`

Flashcards live in Anki.

**Anki:** install Anki desktop **26.09.4 or newer** (from apps.ankiweb.net only; older versions have a shared-deck security hole) and the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on (code `2055492159`; install no look-alike add-ons). Turn on FSRS with desired retention 0.90 and set *New cards/day* (e.g. 10). Review on your phone for free in Safari/Chrome via AnkiWeb, or with AnkiDroid (free) / AnkiMobile (paid). The coach adds a unit's cards in one batch when the unit starts, so your computer only needs to be on then; Anki releases the new cards day by day, and phone reviews work with the computer off. When Anki isn't running, new cards are queued in `anki-import.csv`.

## Domain packs
| Pack | Goal | What's in it |
|------|------|--------------|
| `german-b1` | German to B1, Goethe-Zertifikat | placement test, grammar syllabus, 5 modules / 24 units ordered by the fields of action of Germany's integration-course curriculum, exam format, sources |

Each pack sets its own language for audio and pronunciation (`tts_lang`, `asr_lang` in `domain.md`).

## Adding a domain
Follow [`references/domain-pack-spec.md`](plugins/learning-coach/skills/learning-coach/references/domain-pack-spec.md). A pack needs:
- the goal and distance estimates
- a strand mapping
- an activity bank with slot constraints
- the card format
- an error taxonomy
- confusable pairs
- a placement test
- an assessment format
- sources

The engine (`SKILL.md`) stays unchanged.

## Testing the skill
The test cases in `evals/` use the `claude plugin eval` format:
```bash
cd plugins/learning-coach/skills/learning-coach
claude plugin eval . --allow-tools Write,Edit,Bash --scaffold
```

## Status
v0.5.0: placement upgrade (self-rating, C-test router, sub-levels, external benchmark, typed-answer rule), structured course (modules, units, lessons, unit checks, spiral review), visual progress dashboard and offline pronunciation scoring, on top of focus-mode messages, listening and speaking loops, and audio flashcards. New: an optional local desktop web UI (prototype). Roadmap: phoneme-level pronunciation scoring, and a second domain to prove the engine is generic.

## License
[PolyForm Noncommercial 1.0.0](LICENSE) © 2026 Usman Ahmed Saeed.

- **Free for noncommercial use:** personal learning, study, hobby projects, research, and schools or other noncommercial organisations. You may copy, change and share it, as long as you keep the license and the `Required Notice` line.
- **Commercial use needs a separate license:** selling it, bundling it into a paid product or service, or using it in a company. Contact the author via [GitHub](https://github.com/umaan1982).
- **Earlier versions:** everything up to and including commit `2180866` (v0.3.0) was released under the MIT license, and copies of those versions keep MIT terms.

The research summaries cite their original authors. The Goethe-Institut materials linked in `sources.md` belong to their owners and are not redistributed here.
