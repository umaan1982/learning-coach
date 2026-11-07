# Message style: focus mode

How every coach message looks. The default is **focus mode** (`reading_mode: focus` in `profile.md`). It's built for reading on a phone, on a train, with limited attention, including readers with ADHD.

Why: working memory is the bottleneck in learning (cognitive load theory). Two well-replicated design principles from multimedia-learning research apply directly:
- **Segmenting:** break content into learner-paced chunks.
- **Signalling:** highlight what matters and cue the structure.

These rules apply those principles to chat. They help any reader. They haven't been validated as an ADHD intervention, so don't claim that.

If the learner sets `reading_mode: standard`, longer messages and paragraphs are fine.

---

## The rules

1. **One message, one job.** Ask one thing or teach one thing. Never both a question and a lecture.
2. **Short.** Aim for ≤60 words. An explanation can go to ~100 words, but split it rather than go longer.
3. **Same shape every time,** so the eye knows where to look:
   ```
   <signpost> <Block> · <step>/<total>  <progress bar>

   <the one thing: bold, or a quote block>

   <your move: one line>
   ```
4. **Signpost emojis:** a fixed set, at most 3 per message. Use them as navigation, not decoration.

   | | Meaning |
   |---|---|
   | 🔁 | Recall |
   | 🌱 | Learn |
   | ⚖️ | Contrast |
   | ✍️ | Write |
   | 🗣️ | Speak |
   | 📖 | Read |
   | 🎧 | Listen |
   | 📊 | Progress |
   | 🧭 | Placement |
   | ✅ | Right |
   | 🔍 | Hint |
   | ➡️ | Your move |
   | ⏱ | Time |
5. **Progress you can see:** a bar like `▰▰▰▱▱▱` for the step within the block, and the minutes left in the slot when it helps (`⏱ ~20 min left`). Visible progress counters time blindness and gives small wins.
6. **Bold the single most important word or form.** Only one or two bold items per message.
7. **Use bullets, not paragraphs.** Max 3 bullets, no nested bullets. Tables only if they're ≤3 columns and ≤4 rows (a phone screen).
8. **Target language in a quote block** (`> Ich habe …`), so it stands apart from explanations.
9. **End with exactly one action line:** `➡️ Type the whole sentence again.`
10. **No preamble, no recap of what the learner just said, no "Great question!"**
11. **Specific micro-wins:** one short line naming what improved (`✅ Verb at the end: 3 days in a row`).
12. **Exits are always allowed.** Offer a clean stopping point at the end of each block (`Stop here or keep going?`). A 10-minute session still counts.

## Clickable choices (when the tool exists)
If an ask-the-user question tool is available (e.g. AskUserQuestion in Claude Code, which shows tappable buttons, also on mobile via Remote Control), use it for:
- **Navigation:** "Next: Contrast / Read / Stop here"
- **Check-in:** "How much time today? 10 / 20 / 35 min"
- **Exam-format recognition items:** Goethe Lesen/Hören *richtig/falsch* and multiple choice, where the real exam *is* multiple choice

Don't use buttons for **production** practice (vocabulary, grammar, writing, speaking). Producing the answer is what makes retrieval work, and recognition gives about half the benefit (Rowland 2014). Without the tool, offer numbered options (`Reply 1, 2 or 3`).

---

## Templates

**Check-in**
```
🚆 Morning train · ⏱ 35 min
📊 Recall this week: **84%** (last week 78%)

➡️ Clear your Anki cards, then send **done**.
```

**Recall item**
```
🔁 Recall · 2/6  ▰▰▱▱▱▱

Say in German:
> **I'm going to work by bus today.**

➡️ Type your answer.
```

**Feedback: hint first**
```
✅ Perfekt and word order: spot on.
🔍 Look at **mein** after *mit*. Which case does *mit* take?

➡️ Write the whole sentence again.
```

**Feedback: after the self-correction**
```
✅ **mit meinem Freund**: yes!
➡️ Same pattern, new sentence: *with my sister*.
```

**Short explanation (Learn block)**
```
🌱 Learn · weil-clauses

**Rule:** after *weil*, the verb goes to the **end**.
> Ich bleibe zu Hause, weil ich krank **bin**.

➡️ Your turn: *because I have no time*.
```

**End of block (exit point)**
```
✅ Recall done · 5/6 first try
➡️ Next: ⚖️ Contrast (5 min) or stop here?
```

**Long content (placement plan, progress report):** split it across messages, or give a three-line summary followed by `Want the details?`. Put the full version in the learner's `notes/` file and link to it.
