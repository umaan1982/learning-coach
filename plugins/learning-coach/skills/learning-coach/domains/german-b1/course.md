# Course: German A2 → Goethe-Zertifikat B1

The structured course for this domain. The unit list (teaching order, can-do goals, grammar, exam task, prerequisites) is in `course.csv`. How the engine runs a course is in `references/curriculum.md`.

## Design basis
- **Order by fields of action, not by grammar.** Units follow the *Handlungsfelder* of the Rahmencurriculum für Integrationskurse (e.g. Wohnen, Arbeit, Gesundheit, Ämter und Behörden), plus its cross-cutting areas (social contacts, feelings and opinions, conflicts, the migration situation, one's own language learning). Grammar and vocabulary in each unit are the ones the situation needs.
- **Grammar progression** is still respected: each unit's grammar comes from `grammar-syllabus.md` in teaching order, so the units build on each other (e.g. *weil*-clauses in U04 come before relative clauses in U09).
- **Exam alignment:** every unit practises one Goethe B1 task type (`exam-format.md`), and module tests are full official-format sections. Module 5 is pure exam training.
- **Vocabulary:** each unit takes ~60–100 items from the official Goethe B1 word list that fit its theme, so the whole list (~2,400) is covered across 20 units, minus what placement shows is already known.

## Modules
| Module | Units | Level | Weeks (guide) | Ends with |
|--------|-------|-------|---------------|-----------|
| M1 Refresh | U01–U04 | A2 consolidation | 4 | MT1: Lesen T1+T3 + mixed check |
| M2 B1 Teil 1 | U05–U09 | B1.1 | 5 | MT2: Hören full + mixed check |
| M3 B1 Teil 2 | U10–U14 | B1.1 → B1.2 | 5 | MT3: Schreiben full + mixed check |
| M4 B1 Teil 3 | U15–U20 | B1.2 | 6 | MT4: Sprechen full + mixed check |
| M5 Prüfungstraining | U21–U24 | exam | 4 | the real exam |

Plus: 1 week placement and setup, about 2 buffer weeks (holidays, illness), and 1 taper week before the exam. That's 28–30 weeks in total, which fits a November start for a June exam.

## Entry rules (from placement)
| Placement result | Start at | Earlier units |
|------------------|----------|---------------|
| A1 or weak A2 (grammar A2 band < 4/6) | U01 | – |
| Solid A2 (A2 band ≥ 5/6, B1.1 band < 4/6) | U01 compressed: 3 days per unit in M1 | M1 units can be tested out one by one |
| A2+ / low B1 (B1.1 band ≥ 4/6) | U05 | U01–U04 `tested-out`; their grammar stays in spiral recall |
| Solid B1 (B1.2 band ≥ 4/6, reading ≥ B1) | U10 or M5 | discuss with the learner; exam training may be enough |

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
