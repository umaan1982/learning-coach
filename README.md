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

The process is generic. Subjects plug in as **domain packs**. The first domain is **German B1 (Goethe-Zertifikat)**.

**It runs as a structured course, like a language institute:**
```
Course  (A2 → Goethe B1, Nov → June)
 └─ Module  (4–6 weeks)          → ends with a module test (official exam format)
     └─ Unit  (1 week, 1 real-life theme: Wohnen, Arbeit, Gesundheit …)
         │                        → can-do goals + the grammar/vocab that theme needs
         │                        → ends with a unit check (≥80% → next unit; otherwise correctives)
         └─ Lesson  (one 35-min train ride)
```
Units build on each other, and earlier units keep coming back in recall and in every check (spiral review). The German course has 5 modules and 24 units, ordered by the *fields of action* of Germany's integration-course curriculum and aligned to the Goethe B1 exam. `course.py` tracks where you are and warns when you fall behind the plan.

> Why: AI can help or harm learning. In a field experiment, students with unrestricted GPT-4 scored 17% worse once it was taken away, while a guard-railed tutor avoided the harm (Bastani et al., *PNAS* 2025). A well-designed AI tutor beat in-class active learning at Harvard (Kestin et al., *Sci. Reports* 2025). This skill encodes the guard rails and the techniques with the strongest evidence. See [`docs/research-brief.md`](docs/research-brief.md).

## What it does

| You say | The coach |
|---------|-----------|
| "Set me up for the Goethe B1 in June 2027" | Onboarding: goal, deadline, time slots (e.g. train 2×35 min, no speaking aloud), Anki setup |
| (first time) | Placement test across vocabulary, grammar, reading, writing, speaking and listening, then a plan with a feasibility check |
| "lernen" / "quiz me" / "I have 20 min" | Daily session: recall → learn → contrast → use it → understand → log |
| *pastes a voice-chat mistake list* | Imports the errors into the log and creates flashcards |
| "how am I doing?" | Progress report plus a visual dashboard (HTML, works offline, light/dark): days left, streak, minutes per day, recall accuracy vs the 80–90% target, open mistake patterns, strand mix, speech clarity |
| "Evening train, let's do listening" | Generated German audio (two-voice exam-style dialogues, slow-then-normal) with one question at a time |
| *sends a voice recording* | Pronunciation check: clarity %, words heard wrongly, speech rate and pauses |
| "where am I in the course?" | Current unit and lesson day, the plan to the exam, on track or behind |
| Friday morning | Unit check: mastery gate, cumulative over earlier units |
| weekly / end of module | Mixed review, fluency drill, module test in the official exam format |
| "can I use this for statistics?" | Builds a new domain pack following the spec |

## Repository layout

```
learning-coach/                         ← Claude Code plugin marketplace
├── .claude-plugin/marketplace.json
├── docs/research-brief.md              ← the research the process is built on
└── plugins/learning-coach/
    ├── .claude-plugin/plugin.json
    └── skills/learning-coach/
        ├── SKILL.md                    ← the process (domain-agnostic)
        ├── references/                 ← evidence, session protocol, file formats, domain-pack spec
        ├── scripts/                    ← init_learner, anki_connect, progress, dashboard (stdlib only);
        │                                  speak (edge-tts), pronounce (faster-whisper)
        ├── requirements.txt            ← optional packages for audio and pronunciation
        ├── templates/                  ← learner profile + CSV templates
        ├── domains/german-b1/          ← first domain pack
        └── evals/                      ← test cases (claude plugin eval format)
```

## Install

**Claude Code (plugin):**
```bash
claude plugin marketplace add umaan1982/learning-coach
claude plugin install learning-coach@learning-coach-marketplace
```
Then just talk to it ("lernen", "set me up for German B1"), or call it with `/learning-coach:learning-coach`.

**Claude Code (plain skill):** copy `plugins/learning-coach/skills/learning-coach/` into `~/.claude/skills/`.

**Use from your phone:** start the session on your computer and turn on Remote Control. Then open the Claude app → **Code** and continue there. Your computer has to stay on.

**Listening and speaking:** `pip install edge-tts` (internet needed). The coach then generates German audio (single sentences, slow-then-normal, or two-voice exam-style conversations) and sends the MP3 to your phone. For speaking, answer through the Claude app's mic (dictation). The coach compares the transcript with the target sentence. With `--audio`, flashcards get sound too. See [`references/audio-practice.md`](plugins/learning-coach/skills/learning-coach/references/audio-practice.md).

**Pronunciation check:** `pip install faster-whisper` (offline; the speech model downloads once, ~460 MB). Record a voice memo, attach it in the Claude app, and the coach scores it against the sentence you meant to say: clarity %, words heard wrongly, words/min and pauses. This is intelligibility to a speech recogniser, not a phonetician's grade.

**Install everything optional at once:** `pip install -r plugins/learning-coach/skills/learning-coach/requirements.txt`

## Your data
Learner data never lives in this repo. By default it's in `~/learning-coach-data/<domain>/` (override with `LEARNING_COACH_DATA`):
- `profile.md`
- `sessions.csv`
- `errors.csv`
- `notes/`

Flashcards live in Anki.

**Anki:** install Anki desktop and the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on (code `2055492159`). Turn on FSRS with desired retention 0.90. Review on your phone with AnkiMobile or AnkiDroid via AnkiWeb sync. When Anki isn't running, new cards are queued in `anki-import.csv`.

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
v0.4.0: structured course (modules, units, lessons, unit checks, spiral review), visual progress dashboard and offline pronunciation scoring, on top of focus-mode messages, listening and speaking loops, and audio flashcards. Roadmap: phoneme-level pronunciation scoring, and a second domain to prove the engine is generic.

## License
[PolyForm Noncommercial 1.0.0](LICENSE) © 2026 Usman Ahmed Saeed.

- **Free for noncommercial use:** personal learning, study, hobby projects, research, and schools or other noncommercial organisations. You may copy, change and share it, as long as you keep the license and the `Required Notice` line.
- **Commercial use needs a separate license:** selling it, bundling it into a paid product or service, or using it in a company. Contact the author via [GitHub](https://github.com/umaan1982).
- **Earlier versions:** everything up to and including commit `2180866` (v0.3.0) was released under the MIT license, and copies of those versions keep MIT terms.

The research summaries cite their original authors. The Goethe-Institut materials linked in `sources.md` belong to their owners and are not redistributed here.
