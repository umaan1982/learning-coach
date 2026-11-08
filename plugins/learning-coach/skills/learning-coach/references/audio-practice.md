# Audio practice: listening and speaking

How the coach practises **listening** (it reads German aloud by generating audio) and **speaking** (the learner talks through the mic, and dictation turns speech into text). Read this before any listen or speak block.

## Contents
- How audio reaches the learner
- Listening loops
- Speaking loops (mic and dictation)
- Slot rules
- Evidence

---

## How audio reaches the learner
1. **Generate** with `scripts/speak.py` (needs `pip install edge-tts` and internet):
   - one sentence or text: `python scripts/speak.py say "<text>" --domain <id> --speed both` (the voice language comes from the domain's `tts_lang`)
   - a conversation: write `A: … / B: …` lines to a file, then `python scripts/speak.py dialogue <file> [--repeat 2]`. Two different voices, like the exam.
   - `--speed slow|normal|both`. `both` plays a slow version, then the normal version.
   - Files land in `<data>/audio/`. The script prints the path.
2. **Deliver:** if a send-file tool is available (e.g. `SendUserFile` in the Claude desktop app, which also shows up on the phone through Remote Control), send the MP3 so the learner can tap and play it. Otherwise give the path.
3. **Hide the transcript** until the listening task is done, except in read-while-listening mode.
4. **If generation fails** (offline, package missing), say so in one line and switch to a text task. Don't stall the session.

## Listening loops
Pick one per listen block. Start at `--speed both` for A2. When the learner gets ≥85% on first listen two sessions in a row, switch to `normal`.

**1. Exam-style listen and answer** (target format, Goethe Hören)
- Generate a short announcement (Teil 1, played twice → `--repeat 2`), a conversation (Teil 3, played once) or a three-person discussion (Teil 4).
- Ask 3–5 *richtig/falsch* items **one at a time**. Use clickable buttons if available, since the real exam is also recognition.
- After the last answer: show the transcript, highlight the sentence that carried each answer, and log misses (`skill=listening`).

**2. Metacognitive cycle** (for longer audio)
predict from the title → listen once → "write 2–3 things you understood" → listen again (`both`) → check together → transcript → one line: what made it hard?

**3. Mini-Diktat** (1–2 sentences, 2–3 min)
- Send the sentence (`--speed both`). The learner types exactly what they heard.
- Compare word by word, and tag each mismatch (`listen-sound`, `listen-ending`, `listen-word-boundary`, or the grammar tag if the ending was really a grammar gap).
- Keep it short. Dictation sharpens sound recognition, but it doesn't by itself raise overall listening scores.

**4. Read-while-listening** (new texts)
Send audio *with* the text for a new reading passage. It links sound to spelling. Vocabulary gains are about the same as reading alone, so use it for variety and pronunciation awareness, not as a replacement.

## Speaking loops (mic and dictation)
The learner speaks into the Claude app's mic. Dictation turns it into text, and the coach sees the transcript, not the sound.

**1. Listen → repeat (echo)**
- Send a sentence as audio. The learner listens, then says it back via the mic.
- Compare the transcript with the target:
  - **Grammar or word changes** → normal feedback (hint first).
  - **Changes that look like sound errors** (e.g. *Vetter* for *Wetter*, *schon* for *schön*, *Bus* heard as *Buß*) → a gentle note: "The mic heard *schon*. Maybe the ü? Listen again and repeat." Tag it `pron-vowel` or `pron-consonant`.
- Speech recognition makes its own mistakes, so only log a pronunciation pattern after it shows up **twice**.

**2. Speak first** (Sprechen tasks, role-plays)
The learner dictates the answer to a prompt. Give feedback on 1–2 patterns, in focus mode. Then they say the corrected version once more (the redo).

**3. Shadowing**
Send audio with `--speed both`. The learner speaks along with the normal version: aloud only in a `speak_aloud: yes` slot, otherwise silently (mouthing).

**4. Recorded check: pronunciation score** (weekly, or whenever the learner sends a voice recording)
Dictation only shows the coach *text*. For a real look at how the learner sounds, they record a voice memo (phone recorder) and attach it in the Claude app. Through Remote Control the file lands on the PC. Then:
```
python scripts/pronounce.py --audio <file> --target "<the sentence they meant to say>" --log <domain>
```
It runs speech recognition offline (`pip install faster-whisper`; the model downloads once) and reports:
- **Clarity:** % of target words the recogniser heard clearly.
- **Per word:** ok / unclear / heard as X / missing.
- **Fluency:** words per minute, and pauses longer than 0.4 s measured from the audio itself.

The result is logged to `pronunciation.csv` and shows up as a clarity tile on the dashboard. Reply in focus mode:
```
🗣️ Clarity 83%  ·  225 words/min  ·  no long pauses
🔍 schön was heard as schon. Round your lips for the ü.
➡️ Listen and record it once more.
```
Pair each flag with an audio model (`speak.py say "<word or sentence>" --speed both`) so the learner hears the target. Log flags as `pron-vowel` / `pron-consonant` / `fluency` only when they repeat. This measures **intelligibility to a recogniser**, not a phoneme-level grade: accents a human understands easily can still trip it up, and the reverse.

## Slot rules
| Activity | Needs |
|----------|-------|
| Any listening loop | `audio: yes` (headphones) |
| Echo, speak first, shadowing aloud | `speak_aloud: yes` (or the learner says quiet dictation is OK) |
| Silent shadowing | `audio: yes` |

On a quiet train (audio yes, speak no): listening loops, Mini-Diktat and silent shadowing. Save echo and speak-first for the home or walk slot.

## Evidence
- **Synthetic voices work for learners:** EFL learners did about as well with a TTS voice as with a human voice on comprehension, dictation and sound identification (Bione, Cardoso et al.). Liakin, Cardoso & Liakina (2017) report pedagogical benefits of TTS.
- **Reading, listening and read-while-listening** give broadly similar incidental vocabulary gains (Webb, Uchihara & Yanagisawa 2023 meta-analysis, 24 studies).
- **Dictation:** small studies only. It improves sound recognition, but transfer to overall listening isn't shown, so keep it short.
- **Metacognitive listening cycle:** Vandergrift & Tafaghodtari (2010).
- **Speech-recognition feedback for pronunciation:** computer-assisted pronunciation training has a medium effect (2024 meta-analysis), with the caveat that recognition errors aren't always learner errors.
- **Fluency measures:** speech rate and pausing are among the temporal measures that best track how fluent listeners judge L2 speech to be (Kormos & Dénes 2004; Bosker et al. 2013) ◐. That's why the scorer reports words/min and pauses, not just accuracy.
