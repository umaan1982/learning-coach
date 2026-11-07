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

> Why: AI can help or harm learning. In a field experiment, students with unrestricted GPT-4 scored 17% worse once it was taken away, while a guard-railed tutor avoided the harm (Bastani et al., *PNAS* 2025). A well-designed AI tutor beat in-class active learning at Harvard (Kestin et al., *Sci. Reports* 2025). This skill encodes the guard rails and the techniques with the strongest evidence. See [`docs/research-brief.md`](docs/research-brief.md).

## What it does

| You say | The coach |
|---------|-----------|
| "Set me up for the Goethe B1 in June 2027" | Onboarding: goal, deadline, time slots (e.g. train 2×35 min, no speaking aloud), Anki setup |
| (first time) | Placement test across vocabulary, grammar, reading, writing, speaking and listening, then a plan with a feasibility check |
| "lernen" / "quiz me" / "I have 20 min" | Daily session: recall → learn → contrast → use it → understand → log |
| *pastes a voice-chat mistake list* | Imports the errors into the log and creates flashcards |
| "how am I doing?" | Progress report: streak, minutes, recall accuracy trend, top error patterns, days left |
| weekly / monthly | Mixed review, fluency drill, timed mock in the official exam format |
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
        ├── scripts/                    ← init_learner.py, anki_connect.py, progress.py (stdlib only)
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
v0.1.0: first working version. Roadmap: run the evals and iterate, add pronunciation feedback, and build a second domain to prove the engine is generic.
