# Evidence behind the process

Each rule in SKILL.md, with the study it comes from. ✅ = numbers checked against the paper or its official abstract. ◐ = from reputable secondary summaries. Use this file to answer "why are we doing it this way?" and to resolve edge cases. Prefer the rule that has the stronger evidence.

The full research brief, with discussion, is in the repository at `docs/research-brief.md`.

## Contents
1. Retrieval practice and feedback
2. Spacing and successive relearning
3. Interleaving (and when *not* to)
4. Generation / try-first
5. Difficulty calibration
6. Feedback quality
7. Transfer
8. Mastery and tutoring
9. AI tutors: guardrails
10. Language-specific (SLA)
11. Learner factors: anxiety, metacognition, habits, gamification, sleep

---

## 1. Retrieval practice and feedback ✅
**Rowland (2014), *Psychological Bulletin* 140**: meta-analysis of 61 studies, 159 effect sizes.
- Testing vs restudying: **g = 0.50**
- With feedback **0.73**; without **0.39**
- Final test ≥1 day later **0.69**; same day 0.41
- Initial test type: cued recall **0.61**; free recall 0.29; recognition 0.29
- Material: paired associates 0.59; prose 0.58; single words 0.39
- **No feedback and initial success ≤50%: g = 0.03 (no effect)**. 51–75%: 0.29. >75%: 0.56.

→ Production prompts, always with feedback. Learn words in pairs or sentences. Reteach when success falls.

**Dunlosky et al. (2013), *PSPI* 14(1)**: of 10 techniques, practice testing and distributed practice were rated high utility. Rereading, highlighting and summarising were rated low.

## 2. Spacing and successive relearning
- **Cepeda et al. (2008), *Psychological Science* 19(11)** ✅: the best gap between reviews is about 20–40% of the retention interval at 1 week and 5–10% at 1 year. Too short or too long both hurt.
- **FSRS** (Anki ≥23.10): models per-item memory stability. Desired retention 0.90 is the recommended start; higher means more reviews. It predicts recall better than SM-2 on open benchmarks.
- **Rawson & Dunlosky (2022), *Current Directions in Psych. Science* 31(4)** ◐: successive relearning means retrieving to a criterion within a session, then relearning across spaced sessions. Example: 68% vs 26% recall compared with the same number of correct recalls massed in one session. Evidence base ~8 studies.

## 3. Interleaving ✅
**Brunmair & Richter (2019), *Psychological Bulletin***: 59 studies, overall **g = 0.42**. Paintings 0.67, maths 0.34, **words −0.39 (blocking better)**. Effects are strongest when categories are *similar to each other* and items *vary within* a category.
**Kornell & Bjork (2008)**: interleaving helped, but ~80% of learners believed blocking was better.

→ Interleave confusable categories. Block new vocabulary by theme.

## 4. Generation / try-first ◐
**Kornell, Hays & Bjork (2009), *JEP:LMC* 35**: failed retrieval attempts before study improve later recall, provided the answer follows. A 2020 foreign-language study found errorful training improved learning of meaning and grammar.

## 5. Difficulty calibration ✅
**Wilson et al. (2019), *Nature Communications* 10**: optimal training accuracy is ~85% for gradient-descent learners on binary tasks with Gaussian noise (82% or 75% under other noise). The authors call the links to human learning "largely indirect."
→ Combined with Rowland (§1), target 80–90% success as a heuristic.

## 6. Feedback quality ✅
**Wisniewski, Zierer & Hattie (2020), *Frontiers in Psychology***: 435 studies, **d = 0.48**, with high heterogeneity. Information content is the key moderator: elaborated feedback beats right/wrong.
**Lyster & Saito (2010), *SSLA*** ✅: oral corrective feedback has durable effects. **Prompts (eliciting self-correction) beat recasts** (the teacher simply reformulates), especially for lower-proficiency learners.
**Kang & Han (2015), *Modern Language Journal* 99(1)** ◐: written corrective feedback improves accuracy (small-to-moderate). Focused feedback was numerically larger but not significantly so.

## 7. Transfer ✅
**Pan & Rickard (2018), *Psychological Bulletin* 144(7)**: test-enhanced learning transfers to new formats and contexts, **d ≈ 0.40**. It transfers better when practice and the final test overlap.
→ Include target-format tasks (e.g. exam item types), increasingly toward the deadline.

## 8. Mastery and tutoring ◐
- **Bloom (1984)**: tutoring plus mastery learning gave a ~2 SD gain, with about half attributable to mastery learning alone.
- **VanLehn (2011), *Educational Psychologist* 46(4)**: human tutoring **d = 0.79**; step-based intelligent tutors **0.76**; Bloom's 2.0 was not supported.
- **Nickow et al.**: 89 RCTs of tutoring programmes, ~0.29 SD.
- **Macnamara et al. (2014)**: deliberate practice explains 26% (games), 21% (music) and 4% (education) of performance variance. It matters, but isn't everything.

## 9. AI tutors: guardrails ✅
- **Bastani et al. (2025), *PNAS* 122(26)**: ~1,000 high-school students. Unrestricted GPT-4 led to **−17%** once access was removed. A tutor-prompted GPT (hints, no direct answers) largely removed the harm.
- **Kestin et al. (2025), *Scientific Reports* 15**: Harvard, n = 194, crossover RCT. An AI tutor beat in-class active learning with **effect 0.63 SD** (an underestimate; quantile estimates 0.73–1.3), median 49 vs 60 min. Design principles: active learning, cognitive-load management, growth mindset, step-by-step scaffolding, **pre-written expert solutions for accuracy**, timely feedback, self-pacing. Retention was not measured.

## 10. Language-specific (SLA)
- **Nation (2007), Four Strands** ◐: about equal time on meaning-focused input, meaning-focused output, language-focused learning and fluency development. Fluency is practised separately in each skill.
- **Swain (Output Hypothesis) / Schmidt (Noticing)** ◐: producing language reveals gaps and lets learners test hypotheses. Support for the noticing function is mixed.
- **Hu & Nation (2000); Laufer & Ravenhorst-Kalovski (2010)** ◐: ~98% known words for comfortable reading; 95% is the minimum.
- **Extensive reading meta-analyses (Jeon & Day 2016)** ◐: small-to-medium gains in comprehension, speed and vocabulary. Adults benefit most.
- **Uchihara, Webb & Yanagisawa (2019), *Language Learning* 69(3)** ✅: repetition → incidental vocabulary learning, **r = .34**. Estimates range from 6 to 20+ encounters. Reading alone is slow, so pair it with deliberate SRS.
- **Keyword mnemonic** ◐: strong immediate recall but faster forgetting unless reviewed. Use it only for leeches, inside SRS.
- **Explicit grammar instruction**: Norris & Ortega (2000), 49 studies; Spada & Tomita (2010), 41 studies; Goo et al. (2015) ◐. Explicit beats implicit. Caveat: the tests mostly measure explicit knowledge, so add many meaningful reps for proceduralisation.
- **Dialogue systems for speaking** ✅◐: Hou & Min (2025, *ReCALL*) g = 0.61; Bibauw et al. (2022, *LLT*) d ≈ 0.58. Helpful features: goal-oriented tasks, form focus, system guidance, corrective feedback. These were mostly pre-LLM systems. 2024–26 LLM studies (small, quasi-experimental) show fluency and complexity gains and lower anxiety; accuracy gains are inconsistent.
- **Pronunciation instruction** ◐: Lee, Jang & Plonsky (2015), 86 reports: effective. Computer-assisted pronunciation training has a medium effect (2024 meta-analysis). **Shadowing** improves fluency and prosody; evidence on individual sounds is inconclusive.
- **4/3/2 technique** ◐ (Nation 1989): retell the same content in 4, then 3, then 2 minutes → fluency through repetition plus time pressure.
- **Metacognitive listening cycle** ◐ (Vandergrift & Tafaghodtari 2010, *Language Learning* 60(2)): predict → listen → verify → listen again → reflect. Beat conventional practice, especially for weaker listeners.
- **Synthetic (TTS) voices** ◐: EFL learners did about as well with TTS as with a human voice on comprehension, dictation and sound identification (Bione, Cardoso et al.). Liakin, Cardoso & Liakina (2017) report TTS benefits. → Generated German audio is a valid listening source.
- **Reading vs listening vs read-while-listening** ✅◐: similar incidental vocabulary gains (Webb, Uchihara & Yanagisawa 2023 meta-analysis, 24 studies).
- **Dictation** ◐: small studies. It improves phoneme recognition, but transfer to overall listening is unproven, so keep it short.
- **Apps** ◐: Duolingo-authored studies (Spanish/French) show receptive skills up to roughly mid-B1. Speaking stays mostly at A2. No evidence that an app alone reaches a full B1.

## 11. Learner factors
- **Anxiety** ✅: Teimouri, Goetze & Plonsky (2019, *SSLA*) r = −.36 with achievement; Botes et al. (2020) r = −.39. → Rehearse speaking in low-stakes settings, then under exam-like conditions.
- **Metacognitive illusions** ✅: fluency is mistaken for learning (Kornell & Bjork 2008). Self-regulated learning training helps (Dignath et al., ES ≈ 0.69 in school samples ◐). → Show data.
- **Habits** ◐: Lally et al. (2010, *EJSP* 40(6)), 96 participants. The median of 66 days comes from the 39 participants whose data fitted the model. The upper end of 254 days is extrapolated beyond the 84 days studied. A single missed day didn't matter.
- **Implementation intentions** ◐: original meta-analysis d = 0.65 (Gollwitzer & Sheeran 2006). Bias-corrected 2025 update: d ≈ 0.15–0.35. Still worth the 30 seconds it takes.
- **Gamification** ◐: Sailer & Homner (2020) g ≈ 0.49 on cognitive outcomes, but the primary studies are weak. → Streaks as seasoning, not as the engine.
- **Sleep** ◐: vocabulary consolidates better when sleep follows learning (Gais et al. 2006). An evening review is a cheap bonus.
