# Curriculum: course → module → unit → lesson

How the coach turns a goal into a **structured course that builds step by step**, the way schools and language institutes do it. Every domain pack ships a course map (`domains/<id>/course.csv` plus `course.md`). This file defines how the engine uses it.

## Contents
1. The four levels
2. Why it's built this way (evidence)
3. The unit: what every unit contains
4. The lesson: the weekly lesson pattern
5. Gates: unit check and module test
6. Spiral: earlier units keep coming back
7. Entry point, test-out and pacing
8. Files and the `course.py` script

---

## 1. The four levels
| Level | Institution equivalent | Length | Ends with |
|-------|------------------------|--------|-----------|
| **Course** | the whole programme (e.g. "A2 → Goethe B1") | goal → deadline | the real exam |
| **Module** | a course module (Integrationskurs: 100 teaching units) | 4–6 weeks | **module test** (exam-format section + everything so far) |
| **Unit** | a textbook chapter (Lektion/Kapitel) | 1 week | **unit check** (mastery gate) |
| **Lesson** | one class | one slot (e.g. a 35-min train ride) | a logged session |

Each unit builds on the units before it. `course.csv` lists units in teaching order, with prerequisites.

## 2. Why it's built this way
- **Backward design:** start from the target (exam and can-do goals), define how it's assessed, then plan lessons. The course map is derived from the exam format and official can-do lists, never invented freely.
- **Action-oriented order:** integration courses order learning goals by chains of real situations in *fields of action* (housing, work, health…), not mainly by grammar. Grammar and vocabulary are derived from what each situation needs, so learners always see *why* they're learning something (Rahmencurriculum für Integrationskurse, §6.3–6.4).
- **Mastery learning:** a check after each unit, correctives for gaps, then move on. About +0.5 SD across 108 controlled evaluations (Kulik, Kulik & Bangert-Drowns 1990). Part of Bloom's "2 sigma" came from this.
- **Cumulative, interleaved review:** mixing problems from earlier units into practice beat blocked, current-unit-only practice in a 54-class randomised trial (Rohrer et al. 2019). It also spaces practice.
- **Chapter progress tests** are standard in published courses (e.g. a progress test for every chapter of a textbook series).

## 3. The unit: what every unit contains
One row in `course.csv`, expanded into lessons by the coach:
- **Field / theme:** the real-life situation (e.g. *Wohnen*).
- **Can-do goals (2–3):** what the learner can *do* at the end ("I can describe a flat and its problems to a landlord").
- **Grammar (1–2 points)**, chosen because the can-do goals need them. They're taught explicitly, then practised in the situation.
- **Vocabulary set:** ~60–100 items from the official list that fit the theme, in thematic blocks.
- **Exam task type:** the target-format task practised in this unit.
- **Prerequisites:** the units it builds on.

## 4. The lesson: the weekly lesson pattern
A unit runs over a fixed pattern of lessons. The domain's `course.md` defines the pattern for its slots, e.g. 10 train lessons + 1 home lesson per week. Every lesson still uses the session blocks from SKILL.md §6 (recall → learn → contrast → use → understand → log), but **the unit decides the content**:

| Phase | Lessons | Focus |
|-------|---------|-------|
| **Discover** | 1–2 | input text or dialogue built around the theme; notice the new grammar; first vocabulary block |
| **Practise** | 3–6 | explicit grammar + guided reps, vocabulary blocks 2–3, a contrast drill, exam-format input task |
| **Use** | 7–8 | can-do output: write and speak (typed or aloud, by slot), listening and shadowing |
| **Check** | 9 | **unit check** (§5) |
| **Fix or extend** | 10 | correctives for what the check missed, or enrichment, plus a 2-minute preview of the next unit |
| **Speak** | home slot | role-play the unit's can-do aloud + pronunciation check |

**Recall in every lesson** pulls from the current unit *and* earlier units (§6), plus the error log.

## 5. Gates: unit check and module test
**Unit check** (one lesson, ~15–20 items, production-first):
- ~60% current unit (can-do task, grammar, vocabulary), ~25% earlier units (spiral), ~15% one exam-format item.
- Score it, then:
  - **≥ 80%:** pass and unlock the next unit.
  - **60–79%:** pass *with correctives*. The missed points go into the first lessons of the next unit as recall, and missed patterns go to the error log.
  - **< 60%:** one corrective lesson (reteach the gaps differently: new examples, worked examples), then re-check only the missed parts. Move on after the re-check. Never hold a learner on one unit for more than one extra week; carry the gaps forward instead (the deadline is real).

**Module test** (end of each module, one longer lesson or two):
- one official-format exam section (rotating Lesen / Hören / Schreiben / Sprechen)
- plus a cumulative mixed check of every unit so far.

Log it as a mock (`notes/mock-*.md`). A weak area becomes the focus of the next module's first unit.

## 6. Spiral: earlier units keep coming back
- Anki spaces vocabulary automatically.
- Recall items: ~70% current unit, ~30% earlier units, weighted toward units with low check scores and open error patterns.
- Every unit check includes earlier units, and every module test includes all of them.
- Themes come back at a higher level later (e.g. *Arbeit* at A2 → *Bewerbung* at B1). The course map marks these links.

## 7. Entry point, test-out and pacing
- **Entry:** the placement result picks the starting module (rules in the domain's `course.md`). Earlier units are marked `tested-out`, not skipped blindly. Their grammar still appears in spiral recall, and a unit's check can be taken early to test out.
- **Test-out:** at any time the learner can ask to take a unit check directly. If they score ≥ 85%, mark the unit `tested-out` and move on.
- **Pacing:** `course.py schedule` spreads the units from the start date to the deadline, including buffer weeks (holidays, illness) and a taper week before the exam. `course.py status` says whether the learner is on track or behind. If they're behind by two or more weeks, propose options: compress a unit to 3 days, merge two light units, or use buffer weeks. Don't silently fall behind.

## 8. Files and the `course.py` script
- Domain: `domains/<id>/course.csv` (unit list, machine-readable) and `course.md` (modules, lesson pattern, entry rules, a worked example unit).
- Learner: `course-progress.csv` (`unit,status,started,checked,score,attempts,notes`; status = `current|passed|corrected|tested-out`).

```
python scripts/course.py status   --domain <id>            # where am I, what's next, on track?
python scripts/course.py schedule --domain <id>            # planned week for every unit
python scripts/course.py start    --domain <id> --unit U05 # begin a unit
python scripts/course.py check    --domain <id> --unit U05 --score 0.84   # record a check → decision
python scripts/course.py testout  --domain <id> --unit U01 --score 0.9
```
The coach runs `status` at the start of every session, so the lesson continues where the course stands.
