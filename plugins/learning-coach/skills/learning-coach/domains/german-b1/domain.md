# Domain: German B1 (Goethe-Zertifikat B1)

The first domain pack. It tells the generic engine what each session block contains for German at A2→B1, how to assess progress, and what typical mistakes look like.

Files in this pack:
- `placement.md`: diagnostic test (run once at the start, repeat any section later to re-check)
- `grammar-syllabus.md`: A1 refresher → B1 grammar in teaching order, with confusable pairs
- `exam-format.md`: Goethe-Zertifikat B1 modules, task types, scoring and criteria (used for monthly mocks)
- `sources.md`: official word list and practice sets, plus graded reading and listening materials

## 1. Goal and level descriptors
**Target:** pass all four modules of the Goethe-Zertifikat B1 (≥60/100 each). Modules can be passed separately.

CEFR B1 in brief: understands the main points of clear standard speech and texts on familiar topics (work, school, leisure); handles most travel situations; writes simple connected text on familiar topics; describes experiences, events, hopes and plans; gives brief reasons and explanations for opinions.

## 2. Distance estimates ◐
German integration courses (BAMF) take a beginner to B1 in **600 teaching units of 45 min (≈450 h)**. Each of the six modules is 100 units: A1 = modules 1–2, A2 = 3–4, B1 = 5–6. Use these hours for the feasibility check:

| Placement result | Remaining guided hours (rough) |
|------------------|-------------------------------|
| A1 | ~300–350 h |
| A2 (rusty) | ~200–250 h |
| Solid A2 | ~150–200 h |
| Low B1 | ~80–120 h, mostly exam skills and output |

These are course hours. Efficient self-study with retrieval and spacing may need less, but output (speaking and writing) can't be shortcut. Treat the numbers as a planning range.

## 3. Strand mapping (Nation's Four Strands)
| Strand | German at A2→B1 | Weekly target share |
|--------|-----------------|---------------------|
| Meaning-focused input | Easy news, graded readers, podcasts at ~95–98% known words | ~25% |
| Meaning-focused output | Emails and forum posts (Schreiben), role-plays and presentations (Sprechen), voice chats | ~25% |
| Language-focused study | Anki vocabulary (Goethe B1 list), grammar points, contrast drills, pronunciation | ~25% |
| Fluency | 4/3/2 retelling, shadowing, speed reading of easy texts, timed exam tasks on known material | ~25% |

## 4. Activity bank
Constraint codes: **S** = needs a screen · **A** = needs audio/headphones · **V** = needs speaking aloud · **–** = none.

**Recall (block 1)**
- Anki due reviews (S)
- Cued production from `errors.csv`: "Say/write: *because I have no time*" (S, or V if spoken)
- Rapid article+plural recall for 5 recent nouns (S)

**Learn (block 2)**
- New vocabulary block of ≤3 thematic words from the Goethe B1 list, each with article, plural and an example (S)
- One grammar point from `grammar-syllabus.md`: guess → rule → 3–5 graded reps (S)
- Redemittel (useful exam phrases) for one Sprechen or Schreiben function (S)

**Contrast (block 3)**: one pair from §7, 4–8 mixed items, sometimes asking "warum?" (S)

**Use it (block 4)**
- Write: Schreiben-Teil-1-style informal email, ~80 words, 3 content points (S)
- Write: forum opinion post, ~80 words (Teil 2) (S)
- Write: short formal message, ~40 words (Teil 3) (S)
- Typed "speaking": answer a Sprechen prompt in writing at speaking speed, no editing. Useful when speaking aloud isn't possible (S)
- Dictation speaking: speak quietly into phone dictation and send the transcript; feedback on grammar and vocabulary only (S, V-quiet)
- Role-play: Sprechen Teil 1 *Gemeinsam etwas planen* with the coach as partner (V)
- Mini-presentation: Sprechen Teil 2 five-part structure, 2–3 min (V)
- Voice chat in the Claude app (eyes-free): a role-play topic chosen in the session, ending with a mistake report to import (A+V)

**Understand (block 5)**
- Read: a generated text at the learner's level (~150–250 words) plus 3–5 questions in German (S)
- Read: a nachrichtenleicht.de article plus summary questions (S)
- Listen: DW *Langsam gesprochene Nachrichten*, one item, metacognitive cycle (A)
- Listen: Easy German or *Nicos Weg* B1 episode segment (A)
- Exam-format reading or listening part from official Übungssätze (S, or A for listening)

**Fluency (weekly, or block 4/5 when time allows)**
- 4/3/2 retelling of a story already told (V)
- Silent shadowing: mouth along with DW slow news (A)
- Shadowing aloud (A+V)
- Speed read: re-read a text from last week, timed (S)

## 5. Card format (Anki "Basic" note, production direction)
| Type | Front (cue) | Back (answer) |
|------|-------------|---------------|
| Noun | the apartment *(article + plural?)* | **die Wohnung, -en**: Wir suchen eine neue Wohnung. |
| Verb | to wait for *(+ case?)* | **warten auf + Akk** (hat gewartet): Ich warte auf den Bus. |
| Irregular verb | to recommend: Perfekt? | **empfehlen**: empfiehlt, empfahl, hat empfohlen |
| Grammar cloze | Ich bleibe zu Hause, weil ich krank ___ . (sein) | **bin**: verb last in a *weil*-clause |
| Redemittel | Sprechen T1: suggest an alternative politely | **Wie wäre es, wenn wir …?** / Ich hätte einen anderen Vorschlag: … |
| Error card | ✗ mit mein Freund → fix it | **mit meinem Freund**: *mit* + Dativ |

Tags: `b1` plus a topic (`wohnen`, `arbeit`, …) or the pattern tag (`case-after-prep`). Keep one fact per card.

## 6. Error taxonomy (pattern tags for errors.csv)
| Tag | Covers |
|-----|--------|
| `gender` | wrong der/die/das |
| `plural` | wrong plural form |
| `case-after-prep` | case after a fixed-case preposition (mit, für, von, durch, wegen …) |
| `case-wechselprep` | Dativ/Akkusativ after in, an, auf, über … (wo? vs wohin?) |
| `case-verb-object` | dative verbs (helfen, gefallen, danken) and other object cases |
| `pronoun-case` | ihm/ihn, ihr/sie, mir/mich … |
| `adj-ending` | adjective declension |
| `v2-word-order` | verb not in position 2 in main clauses, incl. after a fronted element |
| `verb-final-sub` | verb not at the end in subordinate clauses (weil, dass, wenn, ob …) |
| `satzklammer` | second verb part (infinitive or participle) not at the end |
| `sep-verb` | separable prefix misplaced or not separated |
| `perfekt-aux` | haben vs sein |
| `partizip-form` | wrong Partizip II |
| `praeteritum-form` | wrong Präteritum (esp. war/hatte/modals) |
| `verb-conjugation` | person or number ending |
| `modal-verb` | modal form or usage |
| `reflexive` | missing or wrong reflexive pronoun |
| `verb-prep` | wrong preposition with a verb (warten auf, sich freuen über/auf …) |
| `da-wo-compound` | darauf/worauf etc. |
| `konj2` | Konjunktiv II forms (würde, hätte, wäre, könnte) and politeness |
| `passiv` | passive formation |
| `relative-pronoun` | relative pronoun case or gender, relative clause order |
| `infinitive-zu` | zu-infinitive, um…zu, ohne…zu |
| `connector-choice` | weil/denn/deshalb, aber/sondern, trotzdem/obwohl … |
| `als-wenn-wann` | als vs wenn vs wann (and ob) |
| `time-prep` | seit/vor/für/am/im/um/ab |
| `negation` | kein vs nicht, nicht position |
| `comparison` | comparative or superlative |
| `genitive` | genitive forms, wegen/während + Gen |
| `n-declension` | der Kollege → den Kollegen … |
| `tense-sequence` | nachdem + Plusquamperfekt etc. |
| `word-choice` | wrong word or false friend |
| `collocation` | wrong verb–noun pairing (eine Entscheidung *treffen*) |
| `register` | du/Sie, formal letter conventions |
| `spelling` | spelling, umlauts, ß |
| `capitalization` | noun capitalisation |
| `pron-vowel` | vowel length or umlaut pronunciation |
| `pron-consonant` | ch, r, z, final devoicing … |
| `fluency` | long pauses or restarts (self-reported or observed) |

## 7. Confusable pairs (Contrast block)
1. Wechselpräpositionen: **Dativ (wo?) vs Akkusativ (wohin?)**, with liegen/legen, stehen/stellen, sitzen/setzen, hängen
2. **weil / da** (verb last) vs **denn** (verb 2nd) vs **deshalb / deswegen** (inversion)
3. **als / wenn / wann** (and **ob**)
4. **seit / vor / für** (and *seit* + present tense)
5. Perfekt with **haben vs sein**
6. **kein vs nicht**
7. **aber vs sondern**
8. **obwohl vs trotzdem**
9. **um … zu vs damit**
10. **werden**: full verb vs Futur vs Passiv
11. **kennen vs wissen**
12. **erst vs nur**, **noch vs schon**
13. **mögen / möchten / gefallen**
14. Relative pronoun **dem/den/der/deren**
15. Präteritum vs Perfekt (writing vs speaking)

## 8. Phase plan template (count back from the exam date)
| Phase | Weeks before exam | Focus | Weekly mock |
|-------|-------------------|-------|-------------|
| Placement | first week | `placement.md`, plan, Anki setup | – |
| Foundation | until ~16 weeks before | close A2 grammar gaps, heavy B1 vocabulary (≈15–20 new cards/day), daily short output, listening habit | month-end: 1 reading part |
| Build | 16 → 6 weeks before | full grammar syllabus, longer output (exam-length emails, Teil 1/2 speaking), longer input | monthly: one full module, rotating |
| Exam mode | last 6 weeks | timed full modules weekly, Redemittel polish, speaking under exam conditions with a human at least once, taper in the final week | weekly |

**Vocabulary pacing:** ~2,400 lexical units on the official list, minus those already known (from placement), divided by the days to the start of exam mode → new cards/day. Keep it ≤20 so reviews stay manageable at desired retention 0.90.

**Example: two 35-min train slots (screen + headphones, no speaking aloud) + optional home slot**
- **Morning train:** Anki (10–12) → recall items (5) → learn (8) → contrast (5) → read (5)
- **Evening train:** listen with metacognitive cycle (10–12) → write or typed-speaking task with feedback (15) → re-ask queue + log (5)
- **Home, 10–15 min, 3×/week:** speaking aloud: role-play, presentation or 4/3/2. Or a voice chat on a walk, then import the mistake report.
