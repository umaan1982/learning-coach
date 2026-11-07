# Session protocol: block-by-block

Details and example exchanges for each block of the daily session (SKILL.md §6). Examples use German, but the moves are the same for any domain.

## Contents
- Block 0: Check-in
- Block 1: Recall
- Block 2: Learn
- Block 3: Contrast
- Block 4: Use it (output)
- Block 5: Understand (input)
- Block 6: Log
- Fitting blocks to slot constraints
- Feedback moves: good vs bad

---

## Block 0: Check-in
One message. Confirm the slot and minutes. Show **one** number that matters, e.g. "Recall accuracy this week: 84% (last week 78%)". Offer a review if one is due. Don't ask more than one question.

> **Coach:** Morning train, 35 min? You have 42 Anki cards due. Do those first in Anki, then tell me "done" and we'll practise your top pattern: verb position after *weil*.

## Block 1: Recall
1. The learner does their **due Anki reviews** in the Anki app (on the phone, during transit). Anki's FSRS scheduler handles the spacing, so don't duplicate it.
2. Then **3–6 cued production items** from open patterns in `errors.csv`, most frequent first. Rules:
   - Use a cue, not a choice: "Say: *because I have no time*" rather than "pick the right word order".
   - Vary the surface form so the learner practises the *rule*, not a memorised sentence.
   - Track each item as first-try right / right after hint / missed. Missed items go to the re-ask queue.

## Block 2: Learn
For each new item (≤3) or one grammar point:
1. **Guess first:** "How do you think you'd say X?" or "Here are two sentences. What do you notice about the verb?"
2. **Explicit explanation:** short and grounded in the domain syllabus, with one or two examples.
3. **Guided reps:** 3–5 quick productions, gradually removing support (fill a gap → full sentence → own sentence).
4. Queue a card for it.

For vocabulary, introduce words in a **thematic block** (e.g. 3 words about apartments), each with article, plural and an example sentence.

## Block 3: Contrast
A 4–8 item interleaved drill on **one confusable pair** taken from the error log or syllabus (e.g. *wenn/als*, Dativ vs Akkusativ after Wechselpräpositionen). Mix the items unpredictably. After each answer, ask for the *reason* sometimes ("why *als*?"). Self-explanation is moderately effective and makes the rule explicit.

## Block 4: Use it (output)
Pick a task that fits the slot (see "Fitting blocks" below) and the domain's activity bank, preferably in the target exam format as the deadline nears.
- **Speaking** (voice or dictation): a goal-oriented role-play or a monologue on a prompt. Let the learner finish the turn, *then* give feedback on **1–2 patterns** (not every error). Use prompt → self-correct → redo.
- **Writing:** a short text to a prompt (e.g. an email). Mark **2–3 recurring patterns**, give prompts rather than corrections, then ask for a rewrite of the marked sentences.
- Log every corrected error with its pattern tag.

## Block 5: Understand (input)
- **Reading:** a text where ~95–98% of words should be known. Generate or simplify one from the learner's known vocabulary if needed, or take one from the domain's sources. Then 3–5 comprehension questions, answered in the target language where feasible. Unknown words worth keeping → cards.
- **Listening (metacognitive cycle):** (1) predict content from the title, (2) listen once, (3) note what you understood and check it with a partner (you), (4) listen again focused on the gaps, (5) reflect on what made it hard. Use real audio from the domain sources. You can't play audio yourself, so give the link and timestamp and ask the learner to report back.

## Block 6: Log
See `state-files.md`. Run the re-ask queue first. Finish with one line: what's first tomorrow.

---

## Fitting blocks to slot constraints

| Slot allows | Do | Avoid |
|-------------|----|-------|
| Screen, no audio, no speaking aloud (e.g. a quiet train) | Anki, recall, learn, contrast, **writing**, reading | Speaking aloud, listening |
| Screen + headphones, no speaking aloud | Above, plus **listening** and *silent* shadowing (mouthing along) | Speaking aloud |
| Speaking aloud OK (home, walk, car*) | Speaking tasks, 4/3/2 retelling, shadowing aloud | Long reading on a screen while moving |
| Very short (≤10 min) | Anki + 2–3 recall items + one micro-output | New grammar points |

*In a car: voice only, nothing on screen.

If a slot can't host output, make sure another slot in the week does. Over a week the strands should be roughly balanced.

---

## Feedback moves: good vs bad

Learner: *Ich habe gestern mit mein Freund gesprochen.*

❌ **Recast only:** "Ich habe gestern mit meinem Freund gesprochen. Next!" The learner may not even notice what changed.

❌ **Answer dump:** "The correct form is *meinem* because *mit* always takes the dative, and possessive articles in the dative masculine end in -em; also note…" Too much, and no self-correction.

✅ **Prompt → self-correct → redo:**
> **Coach:** Close! Look at *mein* after *mit*. Which case does *mit* take?
> **Learner:** Dativ… *meinem*?
> **Coach:** Yes: *mit meinem Freund*. Say the whole sentence once more, this time about your sister.
> **Learner:** Ich habe gestern mit meiner Schwester gesprochen.
> **Coach:** Perfect, you even got the feminine *-er*. (logged: `case-after-prep`)

If the second attempt also fails: give the model answer with a one-line rule, ask for a redo, and put the item in the re-ask queue.

Learner asks "just tell me the answer": respect it after one genuine attempt, give the answer plus the rule, and still ask for one redo. Mention briefly why, at most once per session.
