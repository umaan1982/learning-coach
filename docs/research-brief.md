# How to Learn Hard Things: Research Brief (v2)
*Groundwork for a reusable "learning coach" Claude skill. The first domain is German B1 (exam target **June 2027**).*
*v1: 2026-11-07 · v2 (gap audit + primary-source checks): 2026-11-07*

---

## 0. What changed in v2: gap audit

v1 covered general memory science well. It was thin on *how to learn a language skill by skill* and on the exam itself. It also leaned on secondary summaries. v2 fixes this:

| # | Gap or error in v1 | Fix in v2 |
|---|--------------------|-----------|
| 1 | **Error:** "interleave everything." The interleaving meta-analysis actually found **blocking beats interleaving for word learning (g = −0.39)** | Interleave *confusable categories* (grammar contrasts), not vocabulary lists (§2.4) |
| 2 | Retrieval practice treated as always good | **Verified in the Rowland PDF:** without feedback, retrieval with ≤50% success gives **no benefit (g = 0.03)**. Feedback or high success is required (§2.2) |
| 3 | 85% rule presented too confidently | Paper checked: it's a model of binary classification. For people it's a heuristic, and the optimum varies (75–85%) (§2.6) |
| 4 | Missing: **successive relearning** (retrieval + spacing to a criterion), arguably the strongest combined technique | Added (§2.3) |
| 5 | Missing: **transfer** (does practising one format help another?) | Added (Pan & Rickard 2018) (§2.8) |
| 6 | Missing: vocabulary research (repetitions needed, mnemonics) | Added (§4.4) |
| 7 | Missing: grammar (explicit vs implicit teaching) | Added (§4.5) |
| 8 | Missing: **speaking & pronunciation** (you asked for voice) | Added: dialogue systems, shadowing, 4/3/2 fluency, pronunciation training (§4.6) |
| 9 | Missing: **listening** and **writing** research | Added (§4.7, §4.8) |
| 10 | Missing: anxiety, metacognitive illusions, gamification, sleep | Added (§5) |
| 11 | Missing: exam format, pass marks, realistic hours to June 2027 | Added (§6) |
| 12 | Kestin AI-tutor study known only from press | Paper checked: design principles, effect size, limits (§3.2) |
| 13 | Habit effect sizes overstated | Bias-corrected estimates added (§5.4) |

**Verification level:** ✅ = numbers checked in the paper or its official abstract · ◐ = from reputable secondary summaries.

---

## 1. Design principles (updated)

| # | Principle | In one line | Evidence |
|---|-----------|-------------|----------|
| 1 | **Retrieve, don't reread** | Produce the answer from memory | ✅ g ≈ 0.50 |
| 2 | **Always close the loop with feedback** | Retrieval without feedback at low success does nothing | ✅ g 0.73 vs 0.39 |
| 3 | **Relearn to criterion, across days** | Get each item right in the session, then again on later days | ◐ strong |
| 4 | **Space reviews out** | Use expanding intervals (Anki FSRS) | ✅ strong |
| 5 | **Try first, then learn** | Guess, then see the answer | ◐ solid |
| 6 | **Interleave only what can be confused** | Mix *der/die/das*, *weil/denn/deshalb*. Don't shuffle-learn new words | ✅ |
| 7 | **Keep success around 80–90%** | Adjust difficulty from data | ✅ (heuristic) |
| 8 | **Feedback = hint first, rich content** | Prompts beat recasts; information-rich feedback beats bare right/wrong | ✅ |
| 9 | **Explicit grammar + lots of meaningful use** | Rule, then examples, then use | ◐ |
| 10 | **Balance the four strands, per skill** | Input / output / study / fluency, across reading, listening, writing and speaking | ◐ |
| 11 | **Practise in the target format** | Exam-format tasks rise toward June | ✅ transfer d ≈ 0.40 |
| 12 | **AI as tutor with guardrails and grounded answers** | No answers before attempts; check against references | ✅ |
| 13 | **Lower anxiety, raise reps** | AI speaking practice is low-stakes rehearsal before real people | ✅ r = −.36 |
| 14 | **Trust data, not feelings** | Learners systematically misjudge what works | ✅ |
| 15 | **Habit: fixed cue, small minimum, forgiving streak** | | ◐ |

---

## 2. Core learning science

### 2.1 Which techniques work ✅
**Dunlosky et al. (2013)** rated 10 techniques. **High:** practice testing and distributed practice. **Moderate:** interleaving, elaborative interrogation, self-explanation. **Low:** rereading, highlighting, summarising, keyword mnemonic, imagery.

### 2.2 Retrieval practice: checked against the original paper ✅
**Rowland (2014)**, *Psychological Bulletin*, 61 studies, 159 effect sizes. From the moderator table:

| Moderator | g |
|-----------|---|
| Overall testing vs restudy | **0.50** |
| Feedback **yes** / no | **0.73** / 0.39 |
| Final test ≥1 day later / same day | **0.69** / 0.41 |
| Initial test is cued recall / free recall / recognition | **0.61** / 0.29 / 0.29 |
| Material is paired associates / prose / single words | 0.59 / 0.58 / 0.39 |
| **No feedback and initial success ≤50%** | **0.03 (no effect)** |
| No feedback, 51–75% success | 0.29 |
| No feedback, >75% success | 0.56 |

> **Design rules:** (1) Every retrieval gets feedback. (2) Use *cued production* ("German for X?"), not multiple choice. (3) Learn words as **pairs or in sentences**, not isolated words. (4) If success drops below ~70%, reteach before testing again.

### 2.3 Successive relearning: NEW ◐
**Rawson & Dunlosky (2022)**, *Current Directions in Psychological Science*. In each session, keep retrieving an item until you get it right (the criterion). Then relearn it in later sessions, spaced out. In one comparison, recall was **68%** after three spaced relearning sessions vs **26%** after three correct recalls in one session. The research base is about 8 studies, and most lack a restudy control.

> **Design rule:** Within a session, missed items come back at the end until answered correctly. Across sessions, Anki handles the spacing. This is the core loop.

### 2.4 Spacing and interleaving (corrected) ✅
- **Cepeda et al. (2008):** the best gap between reviews is ~20–40% of the retention interval for 1 week and ~5–10% for 1 year. Anki's **FSRS** scheduler does this automatically. Anki docs suggest a desired retention of **0.90** as a starting point; higher values mean more reviews.
- **Brunmair & Richter (2019)**, *Psychological Bulletin*, 59 studies. Interleaving overall **g = 0.42**, but:
  - Paintings and visual categories g = 0.67, maths g = 0.34
  - **Words: g = −0.39 (blocking was better)**
  - Interleaving helps most when *categories are similar to each other* and *items within a category vary*.
- **Kornell & Bjork (2008):** interleaving improved learning, yet **~80% of learners believed blocking worked better.**

> **Design rule:** Introduce new vocabulary in *thematic blocks* (e.g. "Wohnung" words together). **Interleave grammar contrasts** that are easy to confuse: Dativ/Akkusativ, Perfekt with *haben* vs *sein*, *weil/denn/deshalb*, *seit/vor/für*, adjective endings.

### 2.5 Try first ◐
**Kornell, Hays & Bjork (2009):** failed retrieval attempts *before* study improve learning, provided feedback follows. A 2020 foreign-language study found errorful training helped meaning and grammar.

### 2.6 Difficulty calibration (reframed) ✅
**Wilson et al. (2019)**, *Nature Communications*. The optimal training error is ~15.87% (≈85% accuracy) for gradient-descent learners on **binary** tasks with Gaussian noise. With other noise distributions it shifts to 82% or 75%. The authors state that links to human learning are "largely indirect." Multi-class tasks were not analysed.

> **Design rule:** Combined with Rowland (>75% success needed without feedback), **target 80–90% success** as a heuristic dial. It is not a law.

### 2.7 Feedback in general ✅
**Wisniewski, Zierer & Hattie (2020)**, 435 studies: feedback **d = 0.48**, with big variation. **Information content** is the main moderator. "Wrong" helps least; *why it's wrong and how to fix it* helps most. Effects are larger on cognitive and motor skills than on motivation.

### 2.8 Transfer: NEW ✅
**Pan & Rickard (2018)**, *Psychological Bulletin*. Test-enhanced learning **transfers** to new formats and contexts, **d ≈ 0.40**. Transfer is stronger when practice and the final test overlap.

> **Design rule:** Practise in varied formats, and include **exam-format tasks** (Goethe item types) so practice overlaps the final test.

### 2.9 Deliberate practice and mastery ◐
- **Macnamara et al. (2014):** deliberate practice explains 26% of performance variance in games, 21% in music and only 4% in education. It matters, but it isn't everything.
- **Bloom (1984)** 2-sigma → **VanLehn (2011)** human tutoring d ≈ 0.79 → **Nickow et al.** 89 RCTs ≈ 0.29 SD. Mastery learning is about half of Bloom's effect.

---

## 3. AI as tutor

### 3.1 Without guardrails AI harms learning ✅
**Bastani et al. (2025)**, *PNAS*, ~1,000 students. With plain GPT-4, scores were **17% lower** once access was removed. With a tutor-prompted GPT, practice scores were 127% higher and there was **no exam harm**. The harm was mostly cancelled by the guardrails.

### 3.2 A well-designed AI tutor beats a good class: paper details ✅
**Kestin et al. (2025)**, *Scientific Reports*, Harvard, n = 194, crossover RCT.
- Effect **0.63 SD** (an underestimate due to a ceiling effect; quantile estimates 0.73–1.3).
- **Median 49 min** vs a 60 min class. Higher engagement and motivation.
- **Design principles:** active learning · managing cognitive load · growth mindset · scaffolding multi-step problems one step at a time · **pre-written expert solutions so the AI's answers were accurate** · timely feedback · self-pacing.
- **Limits:** no long-term retention measured, two topics, text only.

> **Design rules:** (1) Never answer before an attempt. (2) Give hint, then self-correction, then the model answer, then redo. (3) **Ground corrections in reference material** (grammar tables, the Goethe word list, model answers) rather than the model's judgement alone. (4) One step at a time. (5) Add our own retention mechanism (spacing), which Kestin did not test.

---

## 4. Language-specific research

### 4.1 Four Strands ◐
**Nation (2007):** roughly equal time on meaning-focused **input**, meaning-focused **output**, **language-focused study** and **fluency** development. *Fluency needs separate practice in each of the four skills.*

### 4.2 Output, noticing and corrective feedback ✅
- **Swain:** output makes you *notice the gap*, test hypotheses and reflect on language. Empirical support for the noticing function is mixed.
- **Lyster & Saito (2010):** 15 classroom studies. Corrective feedback is durable. **Prompts > recasts**, especially for lower-proficiency learners.

### 4.3 Comprehension needs coverage ◐
- **Hu & Nation (2000):** ~98% known words for unassisted reading. 95% is a minimum (**Laufer & Ravenhorst-Kalovski 2010**).
- **Extensive reading** (Jeon & Day 2016): small-to-medium gains in comprehension, speed and vocabulary. Adults benefit most.

### 4.4 Vocabulary: NEW ✅◐
- **Uchihara, Webb & Yanagisawa (2019)**, 26 studies: repetition → incidental word learning **r = .34**. Estimates of encounters needed range from **6 to 20+**. Spacing and engagement strengthen the effect.
  → Reading alone is too slow for 2,400 words in 7 months. Pair **deliberate SRS** with reading.
- **Keyword mnemonic:** strong immediate recall but **faster forgetting** unless it is reviewed (Wang & Thomas 1992/1995). Adding pictures helps.
  → Use it only for "leech" words that keep failing, always inside SRS.
- Learn words **with their article, plural, and an example sentence.** German gender is grammar, not trivia.

### 4.5 Grammar: NEW ◐
- **Norris & Ortega (2000)**, 49 studies, and **Spada & Tomita (2010)**, 41 studies: **explicit instruction beats implicit** for both simple and complex features. Goo et al. (2015) confirmed it.
- **Caveat:** the outcome tests mostly measure explicit knowledge. Spontaneous speaking needs proceduralisation through repeated meaningful use.
  → **Explain the rule briefly, then do many meaningful reps**, then a fluency drill.

### 4.6 Speaking and pronunciation (voice): NEW ✅◐
- **Dialogue systems:**
  - **Hou & Min (2025)**, *ReCALL*, 16 studies: **g = 0.61** on L2 speaking.
  - **Bibauw et al. (2022)**, *LLT*: d ≈ 0.58 on proficiency. Helpful features: **form-focused + goal-oriented tasks, system-guided interaction, corrective feedback.**
  - Caveat: these were mostly *pre-LLM* systems. Modern AI should do at least as well, but it is untested at scale.
- **Pronunciation instruction works** (Lee, Jang & Plonsky 2015, 86 reports). Computer-assisted pronunciation training has a **medium effect** (2024 meta-analysis, 31 studies). It is most effective at beginner and lower levels.
- **Shadowing** (repeating audio as you hear it) improves **fluency, prosody and intelligibility**. Effects on individual sounds are inconclusive. Studies are small.
- **4/3/2 technique** (Nation): tell the same story in 4, then 3, then 2 minutes → **fluency gains** through repetition and time pressure.
- **Anxiety** (§5.1) matters most here. AI speaking practice is a low-stakes rehearsal space.

> **Design rules:** Run daily voice tasks shaped like **goal-oriented role-plays** (B1 Sprechen tasks: plan something together, give a presentation, answer questions). Give feedback *after* the turn, focused on 1–2 errors. Add weekly 4/3/2 retelling and short shadowing sets with native audio.

### 4.7 Listening: NEW ◐
**Vandergrift & Tafaghodtari (2010)**, *Language Learning*. A **metacognitive listening cycle** (predict → listen → check → listen again → reflect) outperformed conventional practice, especially for weaker listeners. Replicated (Vandergrift & Cross). **Vocabulary size correlates strongly with listening.**

### 4.8 Writing: NEW ◐
**Kang & Han (2015)**, *Modern Language Journal*, ~21 studies: **written corrective feedback improves grammatical accuracy** (small-to-moderate effect). Focused feedback (a few error types) showed numerically larger effects, but the difference was not significant. Direct correction may suit lower levels better.

> **Design rule:** Focus each writing correction on **the 2–3 most frequent error patterns** from the error log, then require a rewrite.

---

## 5. The learner: motivation, anxiety, metacognition, sleep

### 5.1 Anxiety ✅
**Teimouri, Goetze & Plonsky (2019)**, *SSLA*: L2 anxiety vs achievement **r = −.36**. Botes et al. (2020) found r = −.39. Speaking anxiety is a real performance cost on exam day.
→ Rehearse with AI first, then with people. Run timed mock Sprechen tasks under exam-like conditions.

### 5.2 Metacognitive illusions ✅
Learners rate rereading and blocking as better even when they are worse (Kornell & Bjork 2008: 80% got it wrong). **Self-regulated learning training** improves achievement (Dignath et al., ES ≈ 0.69 in school samples).
→ The skill must **show measured progress**: accuracy trends, words mastered, mock scores. Explain *why* the hard methods are used.

### 5.3 Gamification ◐
**Sailer & Homner (2020):** gamification has a small-to-medium effect on cognitive outcomes (reported g ≈ 0.49), but the primary studies have weak rigour. Narrative and social elements helped behaviour.
→ Streaks and badges are fine as *seasoning*, not as the engine.

### 5.4 Habits ◐
- **Lally et al. (2010):** median **66 days** to automaticity (range 18–254). Missing one day didn't matter.
- **Implementation intentions:** the original meta-analysis found d = 0.65 (Gollwitzer & Sheeran 2006). A 2025 update (642 tests) gives bias-corrected estimates of **d ≈ 0.15–0.35**. Still useful, but smaller.

### 5.5 Sleep ◐
- Vocabulary is better retained when **sleep follows learning** (Gais, Lucas & Born 2006).
- Mazza et al. (2016) found study → sleep → relearn was efficient, but a 2020 follow-up did not replicate the relearning benefit.
→ An evening review of the day's new words is a cheap bonus. Not essential.

---

## 6. The target: Goethe-Zertifikat B1 by June 2027

### 6.1 Exam facts ✅
| Module | Time | Notes |
|--------|------|-------|
| Lesen | 65 min | 5 parts |
| Hören | ~40 min | 4 parts |
| Schreiben | 60 min | 3 tasks (emails/forum post) |
| Sprechen | ~15 min | **in pairs**: plan together, present, Q&A |

- **Pass mark: 60/100 in each module.** Modules can be taken separately, and four module certificates count as the full certificate.
- Vocabulary basis: **~2,400 lexical units** (official Goethe/ÖSD B1 Wortliste).
- Practical: book the exam date early, since test centres fill up. Official **Übungssätze** (practice sets) are free on goethe.de and should drive the monthly mocks.

### 6.2 How much time? (estimate, to be replaced by the placement test)
- The German integration course targets B1 in **600 units × 45 min ≈ 450 clock hours from zero.** Modules 5–6 (B1.1–B1.2) are the last ~200 units ≈ 150 hours.
- From now (Nov 2026) to June 2027 is **~30 weeks ≈ 210 days.**

| If placement says… | Remaining guided hours (rough) | Daily time needed |
|--------------------|--------------------------------|-------------------|
| Solid A2 | ~150–200 h | **~45–60 min/day** |
| A1–A2 (rusty) | ~250–300 h | **~75–90 min/day** |
| Low B1 already | ~80–120 h (mostly exam skills) | ~25–35 min/day |

Assumes effective methods; classroom hours are less efficient than this design. **Treat it as a planning range, not a promise.** The placement test sets the real plan.

### 6.3 Phases to June 2027
| Phase | Dates | Focus |
|-------|-------|-------|
| 0. Placement | Nov 2026, week 1 | Diagnostic across the 4 skills, vocabulary-size check, set the daily plan |
| 1. Foundation | Nov–Jan | Close grammar gaps (explicit + reps), heavy SRS on the high-frequency B1 list, daily short speaking |
| 2. Build | Feb–Apr | More output, longer listening and reading, writing B1-type emails, speaking role-plays, monthly mock module |
| 3. Exam mode | May–June | Full timed mocks, exam-format practice, anxiety rehearsal for Sprechen, light taper the week before |

---

## 7. The learning engine (process v2)

### 7.1 Daily session (scales with available minutes)
```
0. CHECK-IN       time available today; load state; show 1 progress number
1. RECALL         Anki due cards (FSRS, retention 0.90), cued production,
                  missed cards loop until correct (successive relearning)          §2.2–2.4
2. LEARN          new items in thematic blocks; guess-first; word + article +
                  plural + example sentence; grammar = explicit rule + reps       §2.5, 4.4, 4.5
3. CONTRAST       interleaved drill on 1 confusable grammar pair from error log    §2.4
4. SPEAK (voice)  goal-oriented role-play or B1 Sprechen task;
                  feedback after the turn: prompt → self-correct → redo            §4.6, 4.2
5. UNDERSTAND     listening (metacognitive cycle) OR reading at 95–98% coverage;
                  new words → Anki                                                 §4.3, 4.7
6. LOG            accuracy, errors → error log, new cards pushed to Anki,
                  difficulty adjusted toward 80–90%                                §2.6, 5.2
```
Minimum day (~10 min): steps 0 + 1 + one short speaking turn. That still counts for the streak.

### 7.2 Weekly
- One **writing task** (B1 email or forum post) with focused feedback on 2–3 patterns, then a rewrite.
- One **fluency** set: 4/3/2 retelling or shadowing, plus a speed read of an easy text.
- A **mixed review quiz** and an updated *top-5 recurring errors* list.

### 7.3 Monthly
- One **timed mock module** from the official Übungssätze, rotating Lesen → Hören → Schreiben → Sprechen.
- Compare with last month, re-plan the daily mix, re-estimate readiness for June.

### 7.4 Tutor rules (always on)
1. No answer before an attempt.
2. Hint → self-correct → model answer → redo.
3. Information-rich feedback: *what, why, how to fix*.
4. Ground corrections in reference material. If unsure, say so.
5. One step at a time.
6. Hold success at 80–90%.
7. Pick practice from the learner's own error log.
8. Report measured progress and explain why the hard methods are used.

### 7.5 Architecture
```
learning-coach/                    ← generic skill (process §7, tutor rules, scheduler logic)
├── SKILL.md
├── references/learning-science.md ← condensed version of this brief
├── scripts/anki.py                ← push/pull cards via AnkiConnect (localhost:8765)
└── domains/
    └── german-b1/
        ├── domain.md              ← strands → activities, exam format, phase plan
        ├── placement.md           ← diagnostic test spec
        ├── grammar-syllabus.md    ← A2→B1 grammar list + confusable pairs
        └── sources.md             ← Goethe Wortliste, Übungssätze, graded audio/text sources
learner data (per learner/domain): profile.md · errors.md · sessions.csv · (cards live in Anki)
```

### 7.6 Open technical questions
1. **Voice:** the Claude desktop or mobile app has voice input. Alternatively, record locally and transcribe (e.g. Whisper). Typed transcripts can't check pronunciation, so pronunciation needs either audio analysis or shadowing against native audio with self-comparison.
2. **Anki:** needs Anki desktop + the AnkiConnect add-on running while the skill is used. Phone reviews sync through AnkiWeb.
3. **Speaking partner for the paired Sprechen exam:** the AI can play the partner. One or two human sessions (tandem or tutor) before June are recommended because of anxiety (§5.1).

---

## 8. Verification follow-up (v2.1)

| Claim | Result of re-check | Status |
|-------|--------------------|--------|
| **Lally et al. (2010)**: 66 days, range 18–254 | Paper confirmed: *Eur. J. Social Psychology* 40(6), 998–1009, 96 participants, 84-day study. **Two caveats were missing:** the 66-day median comes only from the **39 participants whose data fitted the model**, and **254 days is an extrapolation** beyond the 84 days observed. About half the participants hadn't reached high automaticity by day 84. Complex behaviours took longer. | ◐ Confirmed with caveats (via BPS Research Digest and a detailed review, not the full text) |
| **VanLehn (2011)**: human tutoring d ≈ 0.79 | Confirmed: *Educational Psychologist* 46(4), 197–221. Human tutoring **d = 0.79**; step-based intelligent tutors **d = 0.76**; substep-based 0.40. VanLehn's own keynote rounds both to ≈ 0.75. Bloom's 2.0 was **not** supported. | ◐ Confirmed from abstract-level sources |
| **LLM speaking tutors** | Several 2024–2026 controlled studies (EFL, mostly *quasi*-experimental, n ≈ 40–90) report gains in **fluency and complexity** and **lower speaking anxiety**. **Accuracy gains are inconsistent.** No large randomised trial found. | Original claim holds: promising, not proven |
| **Duolingo-style apps reaching B1** | Partly wrong. Evidence exists, but it is **company-authored** and covers **Spanish/French, not German**. Finishing units 1–5 (≈A2) ≈ 4 university semesters of reading (Jiang et al. 2021, *Foreign Language Annals*, peer-reviewed). Units 1–7 (≈ half of B1) gave intermediate reading and listening (internal report). Speaking stayed mostly **A2**. **No study shows an app alone reaching full B1**, especially for speaking and writing. | Corrected: evidence for receptive skills up to mid-B1; none for full B1 |
| Hours-to-B1 | Course-based (BAMF integration course), not research-based. | Unchanged |

**Takeaway for the design:** apps and AI do the receptive skills and the drilling well. **Speaking and writing need explicit output practice with feedback**, and that's where the skill must spend its effort.

---

## 9. Learning on the go: what Claude on mobile can actually do (checked 2026-11-07)

| Surface | What it does | Limits for us |
|---------|--------------|---------------|
| **Remote Control** (this Claude Code session, from the Claude app's **Code** tab) | Full skill, files and Anki connection on the PC. Type or **dictate** | **PC must stay on** with the app running. **Only dictation, no live voice mode** in Code sessions |
| **Claude voice mode** (normal chat in the Claude app) | Hands-free spoken conversation; can switch language. **Non-English is in beta**, and German isn't named | Not a Code session: can't see the skill's files or error log directly. Counts toward usage limits |
| **Anki mobile** (AnkiMobile iOS / AnkiDroid) | Spaced-repetition reviews **offline**, syncs via AnkiWeb with the cards the skill creates on the PC | None for reviews; ideal for transit |
| **Podcasts/audio** (e.g. slow German news) | Listening input, eyes-free | Comprehension check happens afterwards |

### Proposed commute split
- **Eyes-free (driving or walking):**
  - **Claude voice mode role-plays.** B1 Sprechen tasks, 4/3/2 retelling, small talk in German.
  - **Listening** with the predict → listen → check cycle.
  - Never anything on screen while driving.
- **Hands free on transit (bus or train):**
  - **Anki reviews** first.
  - Then a **Remote Control drill** in this skill: grammar contrasts, a short writing task, or speaking via dictation that Claude corrects.
- **At home (5–10 min):**
  - The skill's **log step**. Paste or summarise the voice session's errors into the error log.
  - Push new cards to Anki.
  - Weekly writing or a monthly mock.
- **Bridge between voice mode and the skill:** end each voice chat with *"List my mistakes as a short error report."* The skill then reads that report into `errors.md`. This needs testing: whether German voice mode is good enough, and whether claude.ai skills or projects can carry the tutor rules into voice chats.

---

## Sources

**Memory and learning science**
- Dunlosky et al. (2013). *Psych. Science in the Public Interest* 14(1). [APS summary](https://psychologicalscience.org/?p=82014)
- Rowland (2014). Testing vs restudy meta-analysis. *Psychological Bulletin* 140. [PDF](https://courseware.epfl.ch/assets/courseware/v1/fdde2f0aa590bf3b1324077a6bf1540c/asset-v1%3AEPFL%2BDEMO%2B2020%2Btype%40asset%2Bblock/Rowland2014-meta-analysis.pdf) ✅ moderator table checked
- Rawson & Dunlosky (2022). Successive relearning. *Current Directions in Psych. Science* 31(4). [Review (Springer 2023)](https://link.springer.com/article/10.1007/s10648-023-09809-2) · [RetrievalPractice.org](https://www.retrievalpractice.org/archive/2018/successive-relearning)
- Cepeda et al. (2008). *Psychological Science* 19(11). [PDF](https://www.evullab.org/pdf/CepedaVulRohrerWixtedPashler-PS-2008.pdf)
- Brunmair & Richter (2019). Similarity matters: interleaving meta-analysis. *Psych. Bulletin*. [PubMed](https://pubmed.ncbi.nlm.nih.gov/31556629/) · [Preprint](https://www.psychologie.uni-wuerzburg.de/fileadmin/06020400/2019/Brunmair_Richter_in_press__2019_META-ANALYSIS_OF_INTERLEAVED_LEARNING.pdf)
- Kornell & Bjork (2008), interleaving illusion; Yan, Bjork & Bjork (2016). [PDF](https://sites.lifesci.ucla.edu/psych-bjorklab/wp-content/uploads/sites/13/2016/11/YanBjorkBjork2016.pdf) · [APA](https://www.apa.org/pubs/highlights/spotlight/issue-70)
- Kornell, Hays & Bjork (2009). Unsuccessful retrieval attempts. [Bjork Lab](https://sites.lifesci.ucla.edu/psych-bjorklab/wp-content/uploads/sites/13/2016/07/Hays_Kornell_RBjork_inpress.pdf)
- Wilson et al. (2019). 85% rule. *Nature Communications*. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6831579) ✅
- Pan & Rickard (2018). Transfer of test-enhanced learning. *Psych. Bulletin* 144(7). [PDF](https://sc-pan.github.io/pdf/PR_2018.pdf)
- Wisniewski, Zierer & Hattie (2020). Power of feedback revisited. *Frontiers in Psychology*. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6987456)
- Macnamara et al. (2014). [Abstract](https://stafforini.com/works/macnamara-2014-deliberate-practice-and/)
- Bloom / VanLehn / Nickow. [Overview](https://en.wikipedia.org/wiki/Bloom%27s_2_sigma_problem)
- FSRS / Anki. [Anki docs](https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm) · [Benchmark](https://expertium.github.io/Benchmark.html)
- Sleep: Mazza et al. (2016) [summary](https://neurosciencenews.com/learning-memory-sleep-4877/amp/); Gais, Lucas & Born (2006) [PubMed](https://pubmed.ncbi.nlm.nih.gov/16741280)

**AI tutoring**
- Bastani et al. (2025). *PNAS* 122(26). [SSRN](https://papers.ssrn.com/abstract=4895486) · [Wharton](https://knowledge.wharton.upenn.edu/article/without-guardrails-generative-ai-can-harm-education)
- Kestin et al. (2025). *Scientific Reports* 15. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12179260/) ✅

**Second-language acquisition**
- Nation (2007). The Four Strands. [PDF](https://core.ac.uk/download/357330216.pdf)
- Lyster & Saito (2010). Oral corrective feedback meta-analysis. [Cambridge](https://www.cambridge.org/core/product/4999EE1C8379B2BF026B148EAF373CA1)
- Swain / Schmidt. [Review](https://journals.library.columbia.edu/index.php/SALT/article/download/1428/483/3628)
- Hu & Nation (2000); Laufer & Ravenhorst-Kalovski (2010); Schmitt et al. (2011). [PDF](https://www.lextutor.ca/cover/papers/schmitt_etal_2011.pdf)
- Jeon & Day (2016). Extensive reading. [NFLRC](https://nflrc.hawaii.edu/rfl/item/354)
- Uchihara, Webb & Yanagisawa (2019). Repetition and vocabulary. *Language Learning* 69(3). [Record](https://zendy.io/title/10.1111/lang.12343)
- Keyword mnemonic: Wang & Thomas. [Summary](https://archive.memory-key.com/research/Wang95) · [Systematic review](https://revistas.udc.gal/index.php/reipe/article/download/reipe.2017.0.01.2685/pdf/9948)
- Norris & Ortega (2000); Spada & Tomita (2010); Goo et al. (2015). [Goo et al.](https://www.jbe-platform.com/content/books/9789027268723-sibil.48.18goo) · [Spada & Tomita](https://www.eas.utoronto.ca/node/790)
- Hou & Min (2025). Dialogue-based CALL for speaking. *ReCALL*. [Cambridge](https://www.cambridge.org/core/product/31847710516602398819C5E594038E7B)
- Bibauw et al. (2022). Dialogue systems meta-analysis. *LLT*. [ScholarSpace](https://scholarspace.manoa.hawaii.edu/items/2e7868cd-8f01-43ca-ac54-44425cd487a9)
- Lee, Jang & Plonsky (2015). Pronunciation instruction meta-analysis. [NAU](https://experts.nau.edu/en/publications/the-effectiveness-of-second-language-pronunciation-instruction-a-/) · CAPT review [ReCALL 2024](https://resolve-he.cambridge.org/core/journals/recall/article/computerassisted-pronunciation-training-a-systematic-review/71E786F7DFC99727837909FDED7A2320)
- Shadowing systematic review. [Oxford ORA](https://ora.ox.ac.uk/objects/uuid:3104cae1-3a6b-400a-b173-de44384238d2)
- 4/3/2 technique. [Kwansei paper](https://kwansei.repo.nii.ac.jp/record/30914/files/2.pdf) · [LearnLab](https://learnlab.org/research/wiki/index.php/Fostering_fluency_in_second_language_learning)
- Vandergrift & Tafaghodtari (2010). Metacognitive listening. [Replication (Language Teaching)](https://www.cambridge.org/core/journals/language-teaching/article/replication-research-in-l2-listening-comprehension-a-conceptual-replication-of-graham-macaro-2008-and-an-approximate-replication-of-vandergrift-tafaghodtari-2010-and-brett-1997/95952E2358299C05E78A66145F13ABE4)
- Kang & Han (2015). Written corrective feedback. *MLJ* 99(1). [Record](https://zendy.io/title/10.1111/modl.12189) · [Summary](https://eltresearchbites-com.pages.dev/201710-written-feedback-does-it-work-part-2)

**Learner factors**
- Teimouri, Goetze & Plonsky (2019). L2 anxiety meta-analysis. *SSLA* 41(2). [NAU](https://experts.nau.edu/en/publications/second-language-anxiety-and-achievement/) · Botes et al. (2020) [PDF](https://orbilu.uni.lu/bitstream/10993/64129/1/FLCA_Meta_Analysis_Botes_Dewaele_Greiff_2020.pdf)
- Dignath SRL meta-analyses. [Frontiers review](https://www.frontiersin.org/articles/10.3389/feduc.2020.00058)
- Sailer & Homner (2020). Gamification meta-analysis. [Augsburg OPUS](https://opus.bibliothek.uni-augsburg.de/opus4/files/109056/109056.pdf)
- Lally et al. (2010) & implementation intentions. [Summary](https://www.news-medical.net/news/20250128/How-long-does-it-take-to-form-a-healthy-habit.aspx) · [Gollwitzer 2006](https://stafforini.com/works/gollwitzer-2006-implementation-intentions-and/)

**Verification follow-up (§8)**
- Lally et al. (2010) details and caveats: [BPS Research Digest](https://bps.org.uk/research-digest/how-form-habit) · [The Behavioral Scientist](https://www.thebehavioralscientist.com/articles/how-long-to-form-a-habit)
- VanLehn (2011): [ERIC EJ946764](https://eric.ed.gov/?id=EJ946764) · [arXiv version](https://bohrium.dp.tech/paper/arxiv/1302.7081) · [Keynote abstract](https://www.nectec.or.th/icce2011/speakers/keynoteSpeakers.php)
- LLM speaking studies: [CAF study, Springer 2026](https://link.springer.com/article/10.1186/s40862-026-00452-2) · [Chatbots & anxiety, HSSC 2025](https://www.nature.com/articles/s41599-025-05550-z) · [ChatGPT-BOPPPS 2025](https://www.sciencedirect.com/org/science/article/pii/S2155687325000070)
- Duolingo: [Jiang et al. 2021, FLA](https://experts.nau.edu/en/publications/evaluating-the-reading-and-listening-outcomes-of-beginning-level-/) · [Units 1–7 report](https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_read_listen_2021.pdf) · [Speaking study](https://blog.duolingo.com/how-well-does-duolingo-teach-speaking-skills)

**Claude on mobile (§9)**
- [Claude Code on mobile / Remote Control](https://code.claude.com/docs/en/mobile) · [Voice mode support article](https://support.claude.com/en/articles/11101966-using-voice-mode-on-claude-mobile-apps)

**Exam**
- Goethe-Zertifikat B1 Wortliste. [goethe.de PDF](https://www.goethe.de/pro/relaunch/prf/da/Goethe-Zertifikat_B1_Wortliste.pdf)
- Goethe B1 exam info (modules, durations, 60% per module). [Goethe Toronto](https://www.goethe.de/ins/ca/en/sta/tor/prf/gzb1/inf.html) · [Durchführungsbestimmungen](https://www.goethe.de/pro/relaunch/prf/pt/Durchfuehrungsbestimmungen_B1.pdf)
- Integration course hours (600 × 45 min to B1). [iamexpat](https://www.iamexpat.de/expat-info/citizenship-integration/german-integration-course)
