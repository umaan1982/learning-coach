# Placement: German (A1–B1)

Purpose: estimate the level per skill and find the top gaps before teaching. Total ~45–55 min, split into two parts so each fits one slot. **No teaching during placement.** Give neutral acknowledgements only, and explain this to the learner first ("this is a measurement; we'll fix everything afterwards").

Present one item per message. Accept minor spelling slips (missing umlaut) as correct in vocabulary but note them. Record every miss with a pattern tag (see `domain.md` §6) so `errors.csv` starts populated.

---

## Part 1 (screen, no audio needed, ~30 min)

### A. Vocabulary: production (≈8 min)
Ask: "German for … (with article for nouns)". Score 1 for a correct word, plus a ½-point note if the article is wrong (log it as `gender`). Synonyms that fit are fine.

| Band | Items (EN → expected DE) |
|------|--------------------------|
| A1 | the bread → das Brot · the week → die Woche · the station → der Bahnhof · to work → arbeiten · expensive → teuer · the sister → die Schwester · to ask → fragen · the room → das Zimmer · yesterday → gestern · to buy → kaufen |
| A2 | the appointment → der Termin · the bill → die Rechnung · to move (house) → umziehen · the health → die Gesundheit · the holiday → der Urlaub · to recommend → empfehlen · comfortable → bequem · the message → die Nachricht · to remember → sich erinnern (an) · the experience → die Erfahrung |
| B1 | the prerequisite → die Voraussetzung · to apply (for) → sich bewerben (um) · the environment → die Umwelt · to suggest → vorschlagen · the opportunity → die Gelegenheit · sufficient → ausreichend · to complain (about) → sich beschweren (über) · responsible (for) → verantwortlich (für) · the decision → die Entscheidung · to compare → vergleichen |

**Stop rule:** if the A2 band is <5/10, skip the B1 band.
**Estimate:** band ≥8/10 = secure; 5–7 = partial; <5 = gap. Rough vocabulary estimate: secure A1 ≈ 700 words, secure A2 ≈ 1,300, secure B1 ≈ 2,400 (Goethe list size). Interpolate for partial bands.

### B. Grammar: production and transformation (≈10 min)
Ask each item as written. **Stop rule:** after 3 misses within one band, skip the remaining bands.

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

**Estimate:** the highest band with ≥5/6 = secure; 3–4/6 = partial.

### C. Reading (≈10 min)
Generate two texts on everyday topics in the style of Goethe Lesen Teil 1 (a personal blog or email):
- **R-A2:** ~120 words, A2 grammar, A1–A2 vocabulary. 5 richtig/falsch items.
- **R-B1:** ~200 words, B1 structures (weil/obwohl, Perfekt + Präteritum of sein/haben, a relative clause, a passive), B1 vocabulary. 5 richtig/falsch items + 1 open question in German ("Warum …?").

Score: R-A2 ≥4/5 → A2 reading likely. R-B1 ≥4/5 with a sensible open answer → B1 reading likely.

---

## Part 2 (needs headphones for F; ~25 min)

### D. Writing (≈10 min)
Schreiben Teil 1 style: *"Sie waren am Wochenende auf einer Hochzeit/einem Fest. Schreiben Sie Ihrem Freund Jonas: Beschreiben Sie, wie es war. Was war besonders schön? Schlagen Sie ein Treffen vor."* About 80 words, no dictionary. Rate each criterion A (fully) to D (not at all) using `exam-format.md` (task completion, coherence, vocabulary, structures). Log the errors with tags. Don't correct yet.

### E. Speaking (≈6 min; speak-aloud slot or quiet dictation)
Three prompts, ~1 minute each, answered by voice dictation (or typed at speaking speed, no editing, if neither is possible. Mark that as "typed proxy"):
1. Stellen Sie sich vor: Arbeit, Familie, Hobbys.
2. Erzählen Sie von Ihrem letzten Urlaub.
3. Was sind Vor- und Nachteile von Homeoffice? Was ist Ihre Meinung?

Rate range, accuracy and coherence (A–D). Note fluency only if spoken (self-report pauses).

### F. Listening (≈8 min, audio)
Send the learner today's or a recent **DW "Langsam gesprochene Nachrichten"** item (see `sources.md`) and one 2–3 min segment of an Easy German street interview. For each: "Write 3 things you understood, in German or English." Estimate: slow news → ≥3 correct main points ≈ A2+/B1 listening; natural speech → ≥2 main points ≈ B1.

---

## Output: `notes/placement-YYYY-MM-DD.md`
```markdown
# Placement YYYY-MM-DD
| Skill | Estimate | Evidence |
|-------|----------|----------|
| Vocabulary | A2 partial (~1,100 words) | A1 9/10, A2 6/10, B1 2/10 |
| Grammar | A2 secure, B1.1 partial | ... |
| Reading | ... | ... |
| Writing | ... | criteria A–D |
| Speaking | ... | ... |
| Listening | ... | ... |

## Top gaps (pattern tags)
1. ...

## Plan
- Remaining hours estimate (domain.md §2): ...
- Available: N min/day × D days = H h → feasible / tight / not feasible, plus options
- Phase dates (domain.md §8): ...
- New cards per day: ...
- Weekly slot allocation: ...
```
Then set `level_estimate` in `profile.md` (e.g. `A2 overall; B1 reading`) and add the top gaps to "Top patterns".
