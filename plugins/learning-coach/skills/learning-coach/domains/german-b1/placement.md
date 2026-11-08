# Placement: German (A1–B2)

Purpose: estimate the level per skill, down to a **sub-level** (A2.1, A2.2, B1.1, B1.2), and find the top gaps before teaching. Total ~45–55 min, split into two parts so each fits one slot. **No teaching during placement.** Give neutral acknowledgements only, and explain this to the learner first ("this is a measurement; we'll fix everything afterwards").

The design borrows the *methods* of established placement tests, never their items:
- **Self-rating first** (DIALANG): the learner rates themselves before testing; the gap between self-rating and result is shown at the end.
- **C-test as router** (onSET, TestDaF-Institut): a fast, reliable global measure that decides where the skill sections start.
- **Sub-levels** (Goethe-Institut placement): the result maps straight to a starting unit.
- **Interview-style speaking** (integration-course and Goethe in-person placement).
- **External benchmark**: the learner also takes a free official placement test, and both results are logged in `benchmarks.csv` to check how accurate this one is.

**Rules for every section**
- **Typed answers only** in Part 1. Dictation can turn German into English words or drop endings; a dictated answer measures the recogniser, not the learner. If a dictated answer arrives anyway, score only what's clearly not a dictation artefact, mark it `spoken` in the record, and confirm with one typed item.
- One item per message (one C-test text counts as one item). Accept a missing umlaut written as ae/oe/ue but note it.
- **Ceiling rule:** when the first 4 items of a band are all right, mark the band secure and move up. **Stop rule:** 3 misses within a band → skip the higher bands.
- Record every answer with its input mode (`typed`/`spoken`) in `notes/placement-in-progress.md`, and every miss with a pattern tag (`domain.md` §6) so `errors.csv` starts populated.

---

## Part 0: Self-rating (≈2 min, one message)
"Rate each from 0 to 2: 0 = no, 1 = with effort, 2 = yes, easily." Save the ratings; don't comment on them.

| Skill | A2 statement | B1 statement |
|-------|--------------|--------------|
| Listening | I understand short, clear announcements and simple everyday conversations. | I understand the main points of radio news or a conversation about familiar topics when people speak clearly. |
| Reading | I can find information in short everyday texts like adverts, menus and timetables. | I understand personal emails and short articles about everyday topics, including feelings and opinions. |
| Speaking | I can handle short everyday exchanges: shopping, directions, simple plans. | I can talk about experiences and plans, give reasons for my opinion and handle most travel situations. |
| Writing | I can write a short simple note or message about everyday things. | I can write a connected personal email about experiences and impressions. |

Self-rated level per skill: both 2 → B1; A2 = 2 and B1 ≤ 1 → A2; else below A2.

## Part 1 (screen, no audio needed, ~30 min)

### A. C-test (≈20 min, router)
1. `python scripts/ctest.py make --domain german-b1` builds today's test (4 texts, A2 → B2, 20 gaps each).
2. Explain once: "Each text has words with the second half missing. Type the missing letters, or the whole word, with the gap number: `1 ung 2 im …`. About 5 minutes per text. Guess if unsure."
3. Send one text per message: `ctest.py show --domain german-b1 --text N`. Score each reply with `ctest.py score --domain german-b1 --text N --answers "<reply>"`. Don't show the misses.
4. **Stop early** only if text 1 is below 30%: the learner is A1; skip the rest and run sections B and C from the A1 band.
5. `ctest.py result --domain german-b1` gives the C-test band (provisional cut-offs, see `ctest.md`).

### B. Grammar: production and transformation (≈8 min)
Start **one band below the C-test band** (A2.1 → A1, A2.2 → A1, B1.1 → A2, B1.2 or B2 → B1.1). Ask each item as written. Ceiling and stop rules as above.

| # | Band | Item | Expected | Tag |
|---|------|------|----------|-----|
| 1 | A1 | Er ___ (haben) einen Bruder. | hat | verb-conjugation |
| 2 | A1 | Ich sehe ___ Mann. (der) | den | case-verb-object |
| 3 | A1 | Order: morgen / ich / fahre / nach Berlin (start with *Morgen*) | Morgen fahre ich nach Berlin. | v2-word-order |
| 4 | A1 | Negate: Ich habe ein Auto. | Ich habe kein Auto. | negation |
| 5 | A1 | aufstehen: Ich ___ um 7 Uhr ___. | stehe … auf | sep-verb |
| 6 | A1 | Das ist ___ Tasche. (my) | meine | gender |
| 7 | A2 | Perfekt: Ich gehe gestern ins Kino. | Ich bin gestern ins Kino gegangen. | perfekt-aux |
| 8 | A2 | Ich helfe ___ Kollegin. (die) | der | case-verb-object |
| 9 | A2 | Join with *weil*: Ich bleibe zu Hause. Ich bin krank. | …, weil ich krank bin. | verb-final-sub |
| 10 | A2 | Ich lege das Buch auf ___ Tisch. (der) | den | case-wechselprep |
| 11 | A2 | Berlin ist groß, aber London ist ___. | größer | comparison |
| 12 | A2 | Past: Ich muss gestern arbeiten. → | Ich musste gestern arbeiten. | modal-verb |
| 13 | B1.1 | Join with relative clause: Das ist der Mann. Ich habe ihm geholfen. | Das ist der Mann, dem ich geholfen habe. | relative-pronoun |
| 14 | B1.1 | More polite: Können Sie mir helfen? | Könnten Sie mir helfen? / Würden Sie mir helfen? | konj2 |
| 15 | B1.1 | Ich trinke gern ___ Wasser. (kalt) | kaltes | adj-ending |
| 16 | B1.1 | ___ ich ein Kind war, wohnte ich in Wien. | Als | als-wenn-wann |
| 17 | B1.1 | Ich warte ___ den Bus. | auf | verb-prep |
| 18 | B1.1 | Join with zu: Ich habe keine Lust. Ich gehe heute einkaufen. | Ich habe keine Lust, heute einkaufen zu gehen. | infinitive-zu |
| 19 | B1.2 | Passive: Man repariert das Auto. | Das Auto wird repariert. | passiv |
| 20 | B1.2 | Passive past: Man baute das Haus 1990. | Das Haus wurde 1990 gebaut. | passiv |
| 21 | B1.2 | Join with *trotzdem*: Es regnet. Wir gehen spazieren. | Es regnet, trotzdem gehen wir spazieren. | connector-choice |
| 22 | B1.2 | Join with *um … zu*: Ich lerne Deutsch. Ich will in Deutschland arbeiten. | Ich lerne Deutsch, um in Deutschland zu arbeiten. | infinitive-zu |
| 23 | B1.2 | Genitive: das Auto von meinem Vater → | das Auto meines Vaters | genitive |
| 24 | B1.2 | Join with *nachdem* (past): Ich esse. Dann gehe ich spazieren. | Nachdem ich gegessen hatte, ging ich spazieren. | tense-sequence |

**Estimate:** the highest band with ≥5/6 = secure; 3–4/6 = partial. A band skipped by the ceiling rule, or below the start band, counts as secure.

### C. Vocabulary: production (≈5 min)
Ask: "German for … (with article for nouns)". Start at the C-test band's vocabulary band (A2.x → A2, B1.x or B2 → B1). Score 1 for a correct word, plus a ½-point note if the article is wrong (log it as `gender`). Synonyms that fit are fine. If the start band is below 5/10, step down one band.

| Band | Items (EN → expected DE) |
|------|--------------------------|
| A1 | the bread → das Brot · the week → die Woche · the station → der Bahnhof · to work → arbeiten · expensive → teuer · the sister → die Schwester · to ask → fragen · the room → das Zimmer · yesterday → gestern · to buy → kaufen |
| A2 | the appointment → der Termin · the bill → die Rechnung · to move (house) → umziehen · the health → die Gesundheit · the holiday → der Urlaub · to recommend → empfehlen · comfortable → bequem · the message → die Nachricht · to remember → sich erinnern (an) · the experience → die Erfahrung |
| B1 | the prerequisite → die Voraussetzung · to apply (for) → sich bewerben (um) · the environment → die Umwelt · to suggest → vorschlagen · the opportunity → die Gelegenheit · sufficient → ausreichend · to complain (about) → sich beschweren (über) · responsible (for) → verantwortlich (für) · the decision → die Entscheidung · to compare → vergleichen |

**Estimate:** band ≥8/10 = secure; 5–7 = partial; <5 = gap. A lower band not asked counts as secure. Rough vocabulary estimate: secure A1 ≈ 700 words, secure A2 ≈ 1,300, secure B1 ≈ 2,400 (Goethe list size). Interpolate for partial bands.

### Overall sub-level (end of Part 1)
| C-test band | Grammar | Overall |
|-------------|---------|---------|
| A2.1 or below | any | **A2.1** (A1 if C-test text 1 < 30%) |
| A2.2 | A2 secure | **A2.2**; otherwise A2.1 |
| B1.1 | A2 secure + B1.1 partial or better | **B1.1**; otherwise A2.2 |
| B1.2 or B2 | B1.1 secure | **B1.2**; otherwise B1.1 |

When the two measures disagree, take the lower one: starting a little low costs a few days (units can be tested out), starting too high breaks mastery learning.

## Part 2 (needs headphones for G; ~25 min)

### D. Reading (≈10 min)
Generate two texts on everyday topics in the style of Goethe Lesen Teil 1 (a personal blog or email):
- **R-A2:** ~120 words, A2 grammar, A1–A2 vocabulary. 5 richtig/falsch items.
- **R-B1:** ~200 words, B1 structures (weil/obwohl, Perfekt + Präteritum of sein/haben, a relative clause, a passive), B1 vocabulary. 5 richtig/falsch items + 1 open question in German ("Warum …?").

Score: R-A2 ≥4/5 → A2 reading likely. R-B1 ≥4/5 with a sensible open answer → B1 reading likely.

### E. Writing (≈10 min)
Schreiben Teil 1 style: *"Sie waren am Wochenende auf einer Hochzeit/einem Fest. Schreiben Sie Ihrem Freund Jonas: Beschreiben Sie, wie es war. Was war besonders schön? Schlagen Sie ein Treffen vor."* About 80 words, no dictionary. Rate each criterion A (fully) to D (not at all) using `exam-format.md` (task completion, coherence, vocabulary, structures). Log the errors with tags. Don't correct yet.

### F. Speaking (≈6 min; speak-aloud slot or quiet dictation)
Three prompts, ~1 minute each, answered by voice dictation (or typed at speaking speed, no editing, if neither is possible. Mark that as "typed proxy"):
1. Stellen Sie sich vor: Arbeit, Familie, Hobbys.
2. Erzählen Sie von Ihrem letzten Urlaub.
3. Was sind Vor- und Nachteile von Homeoffice? Was ist Ihre Meinung?

Rate range, accuracy and coherence (A–D). Note fluency only if spoken (self-report pauses).

Speaking is the one section where dictation is the point: judge what was *said* (range, accuracy, coherence), not spelling.

### G. Listening (≈8 min, audio)
Send the learner today's or a recent **DW "Langsam gesprochene Nachrichten"** item (see `sources.md`) and one 2–3 min segment of an Easy German street interview. For each: "Write 3 things you understood, in German or English." Estimate: slow news → ≥3 correct main points ≈ A2+/B1 listening; natural speech → ≥2 main points ≈ B1.

---

## External benchmark (≈20 min, any time in the first week)
Ask the learner to take one free official placement test on the provider's own site and paste the result:
- **Goethe-Institut online placement test** (via their local Goethe-Institut course page; ~15–20 min; reports a sub-level such as A2.2)
- **DW Learn German placement test** (free; ~30 questions)
- optional, paid (~€20): **onSET-Deutsch** at a test centre, the most precise of the three

Append a row to `<data>/benchmarks.csv` (`date,source,result,our_estimate,notes`). If the official result and our overall sub-level differ by more than one sub-level, say so plainly, start at the **lower** of the two, and note it for C-test calibration in `ctest.md`.

## Output: `notes/placement-YYYY-MM-DD.md`
```markdown
# Placement YYYY-MM-DD
**Overall: B1.1** (C-test 58% → B1.1; grammar A2 secure, B1.1 partial)

| Skill | Self-rating | Estimate | Evidence |
|-------|-------------|----------|----------|
| C-test (global) | – | B1.1 | T1 85%, T2 60%, T3 40%, T4 20% |
| Vocabulary | – | B1 partial (~1,900 words) | B1 6/10 |
| Grammar | – | A2 secure, B1.1 partial | ... |
| Reading | B1 | ... | ... |
| Writing | A2 | ... | criteria A–D |
| Speaking | B1 | ... | ... |
| Listening | A2 | ... | ... |

**Self-rating vs result:** e.g. "You rated speaking B1, the test says A2.2. Most learners over- or under-rate at least one skill."
**External benchmark:** (filled when the learner pastes it)

## Top gaps (pattern tags)
1. ...

## Plan
- Remaining hours estimate (domain.md §2): ...
- Available: N min/day × D days = H h → feasible / tight / not feasible, plus options
- Phase dates (domain.md §8): ...
- New cards per day: ...
- Weekly slot allocation: ...
```
Then set `level_estimate` in `profile.md` (e.g. `B1.1 overall; A2 writing`) and add the top gaps to "Top patterns".
