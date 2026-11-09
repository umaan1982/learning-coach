# Goethe-Zertifikat B1: exam format (for mocks)

Use this for monthly mocks and for target-format practice. Always prefer the **official Übungssätze/Modellsätze** (see `sources.md`) over self-made tasks for mocks: they are calibrated, and transfer is best when practice matches the real test.

> Verified: modules, durations and the 60% pass rule per module (Goethe-Institut pages). The part structures below follow the official Modellsatz as widely documented. Re-check them against the current Übungssatz before the first mock, since formats are occasionally revised.

## Overview
| Module | Time | Parts | Items / tasks | Pass |
|--------|------|-------|---------------|------|
| Lesen | 65 min | 5 | 30 items | ≥60/100 |
| Hören | ~40 min | 4 | 30 items | ≥60/100 |
| Schreiben | 60 min | 3 | 3 texts | ≥60/100 |
| Sprechen | ~15 min (+15 min prep) | 3 | in pairs | ≥60/100 |

Modules can be taken together or separately. Four module certificates are equivalent to the full certificate. Paper and digital formats have identical content.

## Lesen (65 min)
| Teil | Text type | Task |
|------|-----------|------|
| 1 | Blog or personal email | 6 × richtig/falsch |
| 2 | Two newspaper or magazine articles | 6 × multiple choice (3 per text) |
| 3 | Situations ↔ short ads | match 7 people to ads (some have none) |
| 4 | Opinions/comments on a topic | 7 × "is the person for it?" (Ja/Nein) |
| 5 | Rules or instructions (e.g. house rules) | 4 × multiple choice |

Training moves: skim for the gist first, then scan for key words; watch for negations and qualifiers (*nicht immer, nur, erst*). Time per part: ~10–15 min.

## Hören (~40 min)
| Teil | Audio | Task | Plays |
|------|-------|------|-------|
| 1 | 5 short texts (announcements, messages) | 10 items: richtig/falsch + MC | twice |
| 2 | Talk or guided tour | 5 × MC | once |
| 3 | Everyday conversation | 7 × richtig/falsch | once |
| 4 | Radio discussion, 3 speakers | 8 × "who says what?" | twice |

Training moves: read the items *before* listening (prediction, from the metacognitive cycle), and stay with the audio after a miss.

## Schreiben (60 min)
| Aufgabe | Task | Length | Suggested time |
|---------|------|--------|----------------|
| 1 | Informal email or message to a friend: 3 content points (describe, give reasons, suggest) | ~80 words | 20 min |
| 2 | Opinion in an online forum or guestbook on a given topic | ~80 words | 25 min |
| 3 | Short formal message (e.g. apologise to a teacher or boss, ask for something) | ~40 words | 15 min |

**Assessment criteria:** task completion (all content points, appropriate register), coherence (connectors, logical order), vocabulary (range and accuracy), structures (range and accuracy). Rate each from A (fully met) to D (not met) for practice feedback. Missing a content point costs heavily, so check that first.

## Sprechen (~15 min, pairs)
| Teil | Task | Time |
|------|------|------|
| 1 | *Gemeinsam etwas planen*: plan an activity with your partner (who, what, when, where, who brings what). Make suggestions, react, agree. | ~3 min |
| 2 | *Ein Thema präsentieren*: 5-part presentation (introduce topic → personal experience → situation in your home country → pros/cons + your opinion → conclusion and thanks) | ~3 min each |
| 3 | *Über ein Thema sprechen*: give feedback on and ask a question about the partner's presentation; answer questions about your own | ~2 min |

**Assessment criteria:** task completion, coherence, vocabulary, structures, and **pronunciation** (Aussprache). Interaction (reacting to the partner) matters in Teil 1 and 3.

**Practice with the coach:** the coach plays the partner in Teil 1 and the examiner/partner in Teil 3. Do at least one session with a real human before the exam to rehearse under some pressure (speaking anxiety correlates r ≈ −.36 with performance).

## Lower goals: Start Deutsch 1 (A1) and Goethe-Zertifikat A2
For learners whose `goal_level` is A1 or A2 (module tests MTA1 and MTA2 in `course.csv`). ◐ Structure as widely documented from the official Modellsätze; check durations, parts and pass rules against the current Übungssatz on the Goethe-Institut site before the first mock (`sources.md`), and whether the centre runs the exam modular.

**Start Deutsch 1 (A1)**, pass ≈ 60% of the points
| Part | Time | Tasks |
|------|------|-------|
| Hören | ~20 min | T1 short everyday dialogues (a/b/c) · T2 announcements (richtig/falsch) · T3 phone messages (a/b/c) |
| Lesen | ~25 min | T1 short notes and messages (richtig/falsch) · T2 adverts or web pages (pick a/b) · T3 signs and notices (richtig/falsch) |
| Schreiben | ~20 min | T1 fill in a form from a short text · T2 short message, about 30 words, covering three points |
| Sprechen | ~15 min, group | T1 introduce yourself (name, age, country, home town, languages, job, hobby; spell a word, say a number) · T2 ask and answer questions on a topic with word cards · T3 make requests and react, with picture cards |

**Goethe-Zertifikat A2**, pass ≈ 60% per part
| Part | Time | Tasks |
|------|------|-------|
| Lesen | ~30 min | 4 parts: short newspaper text, information board/directory, email, adverts |
| Hören | ~30 min | 4 parts: announcements/radio, a conversation, phone messages, an interview |
| Schreiben | ~30 min | T1 short message (SMS, ~20–30 words) · T2 email, informal or semi-formal (~30–40 words) |
| Sprechen | ~15 min, pairs | T1 ask and answer with word cards · T2 talk about your life (topic card) · T3 plan something together |

Rating for Schreiben/Sprechen at A1/A2: task completion (every content point), comprehensibility, and range/accuracy appropriate to the level. Don't apply B1 criteria.

## Mock procedure
1. Pick the module the plan says (rotate; weakest gets extra).
2. Timed and closed-book. For Hören, use the official audio.
3. Score with the official key (Lesen/Hören), or the criteria above (Schreiben/Sprechen) mapped to 100.
4. Write `notes/mock-YYYY-MM-DD.md`: raw and scaled score, criterion notes, comparison with the last mock, three actions.
5. Log mistakes to `errors.csv` with `source=mock`.
