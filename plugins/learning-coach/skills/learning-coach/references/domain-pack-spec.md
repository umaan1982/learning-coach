# Domain pack specification

A domain pack teaches the generic engine about one subject. The engine (SKILL.md) never changes for a subject. Everything specific lives here. Use `domains/german-b1/` as the worked example.

## Required files

```
domains/<domain-id>/
├── domain.md          # overview + everything the session blocks need
├── placement.md       # diagnostic test spec
├── syllabus.md        # ordered content list (name it by subject, e.g. grammar-syllabus.md, and point to it from domain.md)
├── course.csv         # the course map: one row per unit/module test, in teaching order (see below)
├── course.md          # modules, entry rules from placement, weekly lesson pattern, one worked example unit
├── exam-format.md     # how mastery is assessed (official exam or a defined benchmark)
└── sources.md         # trusted materials for grounding and for input tasks
```

## domain.md must contain
1. **Goal and level descriptors:** what "done" looks like, ideally an external standard (CEFR, a certification, a job-relevant benchmark).
2. **Distance estimates:** rough hours from typical starting levels to the goal, with their source. These drive the feasibility check at placement.
3. **Strand mapping:** what *input*, *output*, *deliberate study* and *fluency* mean in this subject. For non-language subjects: input = studying worked examples or reading; output = solving problems, explaining or building; study = concepts and procedures as flashcards; fluency = timed practice on already-mastered problems.
4. **Activity bank per block:** concrete task types for Recall, Learn, Contrast, Use-it and Understand, each tagged with the slot constraints it needs (screen, audio, speak_aloud).
5. **Card format:** what goes on flashcard fronts and backs, with an example. Production direction (cue → answer).
6. **Error taxonomy:** 15–40 short pattern tags covering the subject's typical mistakes, each with a one-line description. These tags are what makes practice personal.
7. **Confusable pairs:** categories learners mix up. They feed the Contrast block.
8. **Phase plan template:** foundation → build → target-format practice, with what changes in each phase.
9. **Skills:** the allowed values for the `skill` column in `errors.csv` (e.g. `speaking|writing|…` for a language; `concept|calculation|interpretation|…` for statistics).
10. **Onboarding extras:** practical questions to ask once at onboarding that decide success outside the lessons, e.g. booking the exam, the exam format (paper or digital), an external level check, or what interview rounds cover.

## Course map (course.csv)
Columns: `unit,module,title,field,can_do,grammar,exam_task,prereq,spiral`. Units are `U01…`, module tests `MT1…`, and prerequisites are `;`-separated unit ids. Design it the way institutions do (`references/curriculum.md`):
- Order by real-world situations or tasks, with the needed content derived from them.
- One week per unit, 4–6 units per module, a module test after each module, and exam training at the end.
- Every unit names its can-do goals and the target-format task it practises.

## Research requirement
Before writing a new pack, find out how experts *in that field* teach and assess the skill: certification bodies, professional training programmes, the field's education research. Use their syllabus and assessment format instead of inventing your own. Cite the sources in `sources.md`. If the field has no standard, define a measurable benchmark (e.g. "solve 8/10 problems of type X in 30 min") and use it for monthly mocks.

## Checklist before first use
- [ ] Placement fits one or two slots and has stop rules
- [ ] Every activity in the bank names its slot constraints
- [ ] Error taxonomy tags are short, kebab-case and unambiguous
- [ ] At least 5 confusable pairs
- [ ] Skill values and onboarding extras defined
- [ ] course.csv covers the syllabus in a building order, with module tests and entry rules in course.md
- [ ] Assessment format matches the real target as closely as possible
- [ ] Sources are authoritative (official bodies, peer-reviewed work, well-known publishers)
