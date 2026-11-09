# Course: German A1 → A2 → Goethe-Zertifikat B1

The structured course for this domain. The unit list (teaching order, can-do goals, grammar, exam task, prerequisites, `level`, `entry`) is in `course.csv`. How the engine runs a course is in `references/curriculum.md`.

**One course, many paths.** The map runs from complete beginner to B1. Each learner does only their part of it: from the unit their placement level enters at (entry rules below) to the last unit of their **goal level** (`goal_level` in `profile.md`, e.g. A1 for *Start Deutsch 1*). `course.py` works this out, so the plan, the schedule and the on-track check always refer to the learner's own path.

## Design basis
- **Order by fields of action, not by grammar.** Units follow the *Handlungsfelder* of the Rahmencurriculum für Integrationskurse (e.g. Wohnen, Arbeit, Gesundheit, Ämter und Behörden), plus its cross-cutting areas (social contacts, feelings and opinions, conflicts, the migration situation, one's own language learning). Grammar and vocabulary in each unit are the ones the situation needs.
- **Grammar progression** is still respected: each unit's grammar comes from `grammar-syllabus.md` in teaching order, so the units build on each other (e.g. *weil*-clauses in U04 come before relative clauses in U09).
- **Exam alignment:** every unit practises one Goethe B1 task type (`exam-format.md`), and module tests are full official-format sections. Module 5 is pure exam training.
- **Vocabulary:** each unit takes ~60–100 items from the official Goethe B1 word list that fit its theme, so the whole list (~2,400) is covered across 20 units, minus what placement shows is already known.

## Modules
| Module | Units | Level | Weeks (guide) | Ends with |
|--------|-------|-------|---------------|-----------|
| A1 Grundstufe A1 | A01–A08 | A1 | 8 | MTA1: Start Deutsch 1 mock (all four parts) |
| A2 Grundstufe A2 | B01–B06 | A2 | 6 | MTA2: Goethe-Zertifikat A2 mock (all four parts) |
| M1 Refresh | U01–U04 | A2 consolidation | 4 | MT1: Lesen T1+T3 + mixed check |
| M2 B1 Teil 1 | U05–U09 | B1.1 | 5 | MT2: Hören full + mixed check |
| M3 B1 Teil 2 | U10–U14 | B1.1 → B1.2 | 5 | MT3: Schreiben full + mixed check |
| M4 B1 Teil 3 | U15–U20 | B1.2 | 6 | MT4: Sprechen full + mixed check |
| M5 Prüfungstraining | U21–U24 | exam | 4 | the real exam |

Plus: 1 week placement and setup, about 2 buffer weeks (holidays, illness), and 1 taper week before the exam. From A2.2 to B1 that's 28–30 weeks, which fits a November start for a June exam. From zero to A1 it's about 10 weeks at one unit a week; A1 is roughly 150 guided hours (`domain.md` §2), so a shorter deadline needs more daily time or `unit_weeks` below 1, and the coach says so at placement.

**Where each path ends** (`level` column): goal A1 → MTA1; goal A2 → MTA2 (the A2-consolidation module M1 belongs to the B1 track); goal B1 → U24. Module tests of the A1 and A2 modules are mocks of *Start Deutsch 1* and *Goethe-Zertifikat A2* (`exam-format.md`).

## Entry rules (from placement)
Encoded in the `entry` column of `course.csv`, so `course.py` applies them automatically. `start_unit` in `profile.md` overrides them (e.g. after a discussion with the learner).

| Overall sub-level (`placement.md`) | Start at | Earlier units |
|------------------|----------|---------------|
| no German, A1.0 or A1.1 | A01 | – |
| A1.2 or A2.1 | B01 | A1 units can be tested out one by one if the learner wants |
| A2.2 | U01 compressed: 3 days per unit in M1 | M1 units can be tested out one by one |
| B1.1 | U05 | U01–U04 `tested-out`; their grammar stays in spiral recall |
| B1.2 (reading ≥ B1) | U10 (or M5, see below) | discuss with the learner; exam training may be enough |
| B2 | U21 (exam training) | – |
| not placed yet | A01 for goals A1/A2, U01 for B1 | provisional until placement |

If the external benchmark (Goethe/DW placement) is lower than our sub-level, start at the lower one. A learner placed at or above their goal level gets only the goal's mock test as exam training.

**A1 and A2 lessons** use the same weekly pattern below with smaller steps: more read-while-listening and repetition, shorter output (single sentences, then 30-word messages), and lots of chunk work (*Ich hätte gern …*, *Wie spät ist es?*) before grammar rules.

## Weekly lesson pattern: 2 train slots per weekday + 1 home slot
Train slots: screen and headphones yes, speaking aloud no. Home slot: speaking aloud yes.

| Day | Morning train (35 min) | Evening train (35 min) |
|-----|------------------------|------------------------|
| Mon | **L1 Discover:** Anki → theme text or dialogue with the new grammar (read-while-listening) → vocabulary block 1 | **L2:** recall → listening (exam task type if Hören) → Mini-Diktat |
| Tue | **L3 Practise:** grammar point 1 explicit → guided reps → contrast drill | **L4:** vocabulary block 2 → reading in exam format |
| Wed | **L5:** grammar point 2 (or deeper reps) → vocabulary block 3 | **L6 Use:** writing task for the unit's can-do (exam format), feedback, rewrite |
| Thu | **L7 Use:** typed speaking: answer the can-do prompts at speaking speed | **L8:** listening on the theme + silent shadowing; prepare the weekend role-play |
| Fri | **L9 Check:** unit check (cumulative, see `curriculum.md` §5) | **L10 Fix or extend:** correctives, or enrichment + preview of next unit |
| Weekend (home, 15–20 min) | **Speak:** role-play the unit's can-do aloud; record one sentence for a pronunciation check | |

Every lesson opens with recall: Anki first, then 3–6 items, about 70% from this unit and 30% from earlier ones.

## Worked example: U02 Wohnen
- **Can-do:** describe your flat and where things are; report a problem; understand a flat advert.
- **Grammar:** Wechselpräpositionen (wo? → Dativ / wohin? → Akkusativ; liegen/legen, stehen/stellen); Perfekt with haben vs sein.
- **Vocabulary blocks:**
  1. rooms and furniture (die Wohnung, das Zimmer, der Schrank …)
  2. renting (die Miete, die Nebenkosten, der Vermieter, umziehen …)
  3. problems (kaputt, die Heizung, tropfen, reparieren …)
- **Lessons:**
  - **L1:** dialogue *Lena zieht um* (two voices, read-while-listening). Notice *in der Küche* vs *in die Küche*.
  - **L3:** rule plus reps on where/where-to.
  - **L5:** liegen/legen contrast.
  - **L6:** email to the landlord about a broken heating (Schreiben T3 style).
  - **L7:** typed answer to "Beschreiben Sie Ihre Wohnung".
  - **L9:** unit check with 15 items: 9 Wohnen, 4 from U01, 2 Lesen T3 adverts.
  - **Weekend:** role-play "call the landlord", plus a pronunciation check on *die Heizung ist kaputt*.
- **Spiral link:** U16 (Umwelt und Zusammenleben) comes back to Wohnen at B1 level (house rules, neighbours, genitive).
