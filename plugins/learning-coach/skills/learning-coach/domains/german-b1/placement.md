# Placement: German (A1–B2)

Purpose: find out **where the learner stands relative to their goal**: the level per skill, down to a **sub-level** (A1.0 … B1.2), the top gaps, and the distance to the goal level in hours and weeks. It starts from what the learner already did with German (Part 0), so a beginner aiming for A1 never sits through B1 items, and someone aiming for B1 isn't tested only on basics. Total ~30–55 min depending on level, split into two parts so each fits one slot. **No teaching during placement.** Give neutral acknowledgements only, and explain this to the learner first ("this is a measurement; we'll fix everything afterwards").

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
- **Goal ceiling:** test up to **one band above the goal level**, not further (goal A1 → items up to A2; goal A2 → up to B1.1; goal B1 → the full range). Above that, the result changes nothing in the plan.
- Record every answer with its input mode (`typed`/`spoken`) in `notes/placement-in-progress.md`, and every miss with a pattern tag (`domain.md` §6) so `errors.csv` starts populated.

---

## Part 0: Background, goal and self-rating (≈4 min, two messages)

**0a. Background (one message, numbered, answers can be short).** Read the goal and `goal_level` from `profile.md` first, and don't ask again what's already there.
1. How have you learned German so far? (not at all · a few words or an app · a course: which level? · school · living in a German-speaking country)
2. For how long, and how long ago?
3. Where do you use German now, if at all (work, shopping, neighbours, children's school)?
4. Any certificate or course level (e.g. "finished A1 at the VHS")?

Record the answers in `placement-in-progress.md` and pick a **route**:

| Background | Route |
|-----------|-------|
| **None or only single words** (never studied, or an app for a few weeks) | **Starter route:** S (starter check) instead of the C-test, then B and C from the A1 band |
| **Some** (an A1 course, months of an app, everyday phrases) | **Router:** C-test text 1 only; < 30% → starter route; otherwise continue the C-test |
| **A2 or more** (A2 course or certificate, years in the country with daily use) | **Full route:** full C-test, then B and C as written |

When background and self-rating disagree, take the lower route: the starter check takes 10 minutes, and a beginner facing a B2 C-test text is a bad first lesson.

**0b. Self-rating.** "Rate each from 0 to 2: 0 = no, 1 = with effort, 2 = yes, easily." Ask only up to one band above the goal (goal A1 → the A1 and A2 columns). Save the ratings; don't comment on them.

| Skill | A1 statement | A2 statement | B1 statement |
|-------|--------------|--------------|--------------|
| Listening | I understand slow, simple questions about me and very common words (numbers, times, prices). | I understand short, clear announcements and simple everyday conversations. | I understand the main points of radio news or a conversation about familiar topics when people speak clearly. |
| Reading | I understand single words and very short texts like signs, names and a simple form. | I can find information in short everyday texts like adverts, menus and timetables. | I understand personal emails and short articles about everyday topics, including feelings and opinions. |
| Speaking | I can introduce myself and ask and answer simple questions about where I live and what I need. | I can handle short everyday exchanges: shopping, directions, simple plans. | I can talk about experiences and plans, give reasons for my opinion and handle most travel situations. |
| Writing | I can fill in a form with my details and write a few words on a card. | I can write a short simple note or message about everyday things. | I can write a connected personal email about experiences and impressions. |

Self-rated level per skill: the highest band rated 2 where the band above is ≤ 1 (B1 = 2 → B1; A2 = 2 → A2; A1 = 2 → A1; else below A1).

## Part 1 (screen, no audio needed, ~15–30 min)

### A. C-test (≈20 min, router; skipped on the starter route)
The C-test texts start at A2, so only learners on the router or full route take it (Part 0a). In the web UI the learner does it in the C-test tab.
1. `python scripts/ctest.py make --domain german-b1` builds today's test (4 texts, A2 → B2, 20 gaps each).
2. Explain once: "Each text has words with the second half missing. Type the missing letters, or the whole word, with the gap number: `1 ung 2 im …`. About 5 minutes per text. Guess if unsure."
3. Send one text per message: `ctest.py show --domain german-b1 --text N`. Score each reply with `ctest.py score --domain german-b1 --text N --answers "<reply>"`. Don't show the misses.
4. **Stop early** only if text 1 is below 30%: switch to the starter route (S), then B and C from the A1 band.
5. `ctest.py result --domain german-b1` gives the C-test band (provisional cut-offs, see `ctest.md`).

### S. Starter check (≈10 min; beginners, instead of the C-test)
For the starter route. Short, friendly and typed (listening items use audio). Explain first: "This shows what you already know. Lots of blanks are normal at the start." One item per message; ask "?" for "I don't know". Score 1 per item (½ for a recognisable answer with a spelling slip).

| # | Kind | Item | Expected |
|---|------|------|----------|
| 1–6 | Words (EN → DE, with der/die/das if they can) | hello · thank you · the woman · the child · water · today | Hallo / Guten Tag · danke · die Frau · das Kind · das Wasser · heute |
| 7 | Form | Ich ___ Anna. (sein) | bin |
| 8 | Form | Wie ___ du? (heißen) | heißt |
| 9 | Form | Woher ___ Sie? (kommen) | kommen |
| 10 | Form | Ich ___ zwei Kinder. (haben) | habe |
| 11 | Question | Make a question: Sie wohnen in Berlin. | Wohnen Sie in Berlin? |
| 12 | Number | Write 17 in words. | siebzehn |
| 13 | Reading | Show a door sign: *„Praxis Dr. Weber – Mo–Fr 8–12 Uhr. Heute geschlossen!"* Ask: Can you see the doctor today? | no (heute geschlossen) |
| 14 | Reading | Show a text message: *„Hallo Lena, ich komme um 7 Uhr. Bis später! Tom"* Ask: When does Tom come? | 7 Uhr / at seven |
| 15 | Listening (`speak.py say "Der Zug nach Hamburg fährt um 8 Uhr 15 von Gleis 3." --speed both`) | When does the train leave? | 8:15 |
| 16 | Listening (`speak.py say "Mein Name ist Schmidt. S-C-H-M-I-D-T."`) | Write the name. | Schmidt |
| 17–18 | Speaking (voice dictation is fine here) | "Stellen Sie sich vor: Name, Land, Wohnort, Sprachen." Score 2 = all four points understandable, 1 = some | – |

**Estimate (18 points):** < 6 → **A1.0** (beginner); 6–12 → **A1.1**; ≥ 13 → **A1.2**: also run B from the A1 band and C-test text 1 to check whether A2 has started.

### B. Grammar: production and transformation (≈8 min)
Start **one band below the C-test band** (A2.1 → A1, A2.2 → A1, B1.1 → A2, B1.2 or B2 → B1.1). After the starter check, start at A1 (skip B for A1.0: the starter items already cover it). Ask each item as written. Ceiling, stop and goal-ceiling rules as above.

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
| C-test band (or starter check) | Grammar | Overall |
|-------------|---------|---------|
| starter check < 6 | – | **A1.0** |
| starter check 6–12 | – | **A1.1** |
| starter check ≥ 13 | A1 secure | **A1.2**; otherwise A1.1 |
| A2.1 or below | any | **A2.1** (starter route if C-test text 1 < 30%) |
| A2.2 | A2 secure | **A2.2**; otherwise A2.1 |
| B1.1 | A2 secure + B1.1 partial or better | **B1.1**; otherwise A2.2 |
| B1.2 or B2 | B1.1 secure | **B1.2**; otherwise B1.1 |

When the two measures disagree, take the lower one: starting a little low costs a few days (units can be tested out), starting too high breaks mastery learning.

## Part 2 (needs headphones for G; ~25 min)

**Match Part 2 to the goal and the Part 1 result.** For learners at A1.x or with goal A1/A2, use the goal's exam format (`exam-format.md`, *Start Deutsch 1* / *Goethe A2*) at their level instead of the B1 items below: D = a sign, a short message and an advert with richtig/falsch; E = a form plus a 30-word message; F = Sprechen T1–T3 of the A1/A2 exam; G = two short announcements made with `speak.py`. Keep it to ~15 min. Learners at A2.2 or above do Part 2 as written.

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

**Background:** e.g. "A1 course at the VHS in 2022, little use since; lives in Berlin."
**Self-rating vs result:** e.g. "You rated speaking B1, the test says A2.2. Most learners over- or under-rate at least one skill."
**External benchmark:** (filled when the learner pastes it)

## Where you stand vs your goal
- Now: **A1.1** · Goal: **A1** (*Start Deutsch 1*) by 15 Dec 2026
- Course path (`course.py status`): A01–MTA1, 9 units, starting at A01
- Distance: ~120–150 guided hours (domain.md §2) vs available N min/day × D days = H h → feasible / tight / not feasible, plus options (more minutes, later date, narrower goal such as Sprechen + Schreiben first)

## Top gaps (pattern tags)
1. ...

## Plan
- Remaining hours estimate (domain.md §2): ...
- Available: N min/day × D days = H h → feasible / tight / not feasible, plus options
- Phase dates (domain.md §8): ...
- New cards per day: ...
- Weekly slot allocation: ...
```
Then set `level_estimate` in `profile.md` (e.g. `B1.1 overall; A2 writing`; it must start with the overall sub-level, which `course.py` reads to pick the entry unit), make sure `goal_level` is set, and add the top gaps to "Top patterns". Run `course.py status` and `course.py schedule` to show the learner their own path.
