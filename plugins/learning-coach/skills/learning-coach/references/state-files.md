# Learner data files

Location: `~/learning-coach-data/<domain-id>/`, or `$LEARNING_COACH_DATA/<domain-id>/`. Created by `scripts/init_learner.py` from `templates/`. Keep the formats exact: `scripts/progress.py` parses them.

## profile.md
YAML front matter followed by free notes. Only the front-matter keys are machine-read.

```markdown
---
domain: german-b1
goal: Pass Goethe-Zertifikat B1 (all four modules)
goal_level: B1         # level the goal needs; the course path ends there (A1 / A2 / B1 …)
deadline: 2027-06-30
start_date: 2026-11-08
anki_deck: none        # optional: a deck name if the learner uses Anki; none = coach-run review
desired_retention: 0.90
level_estimate: not yet placed   # after placement: starts with the overall sub-level, e.g. "A2.2 overall; A2 writing"
start_unit:            # optional: overrides the course entry rules (e.g. B03)
reading_mode: focus
unit_weeks: 1          # course pace: 1 = a unit per week, 2 = every two weeks, 0.6 = three days
---

## Slots
| name | minutes | screen | audio | speak_aloud | when / where | implementation intention |
|------|---------|--------|-------|-------------|--------------|--------------------------|
| morning-train | 35 | yes | yes | no | weekdays 07:40 train | When I sit down on the train, I open Anki, then the session |

## Top patterns (refreshed weekly)
1. ...

## Notes
...
```

## sessions.csv
Header, one row per session (UTF-8, comma-separated, quote any field containing commas):

```
date,slot,minutes,blocks,recall_attempts,recall_first_try_correct,new_items,output_tasks,notes
2026-11-09,morning-train,35,"recall;learn;contrast;read",12,10,3,0,"weil-clauses improving"
```
- `blocks`: semicolon-separated from `checkin;recall;learn;contrast;output;read;listen;review;mock;placement`.
- `recall_attempts` / `recall_first_try_correct`: cued-production items in the session (not Anki reviews; Anki tracks its own).

## errors.csv
```
date,skill,pattern,wrong,correct,source,resolved
2026-11-09,writing,case-after-prep,"mit mein Freund","mit meinem Freund",session,no
```
- `skill`: one of the skill values the domain pack defines in `domain.md` ("Skills"). German B1 uses `speaking|writing|reading|listening|vocab|grammar`; a statistics pack might use `concept|calculation|interpretation|design|explanation|coding`.
- `pattern`: a tag from the domain's error taxonomy (`domains/<id>/domain.md`). Use `other:<short-label>` if nothing fits, and propose adding it to the taxonomy if it recurs.
- `source`: `session|placement|mock|voice|import`.
- `resolved`: `no` → `yes` after three correct uses of that pattern on different days.

## notes/
- `placement-in-progress.md`: running log during placement (`section | item | answer | score | tag`). Deleted when the placement is finished.
- `placement-YYYY-MM-DD.md`: results per section, level estimates, top gaps, the plan.
- `mock-YYYY-MM-DD.md`: section, raw score, scaled score, criteria notes, comparison with previous mocks.
- `voice-YYYY-MM-DD.md`: raw pasted voice-chat reports.
- `ctest-YYYY-MM-DD.json`: a generated C-test with its key and the learner's scored answers (written by `ctest.py`). Don't paste the key into the chat.

## benchmarks.csv
External placement or exam results next to our own estimate, so the placement can be calibrated: `date,source,result,our_estimate,notes` (e.g. `2026-11-10,Goethe online placement,B1.1,A2.2,taken on phone`).

## course-progress.csv
Written by `course.py`: `unit,status,started,checked,score,attempts,notes`. Status is `current`, `passed`, `corrected` (passed with gaps carried forward) or `tested-out`.

## pronunciation.csv
Written by `pronounce.py --log`: `date,target,heard,intelligibility,wpm,pauses,flagged` (flagged = `word>heard-as;…`). Feeds the dashboard's clarity tile.

## dashboard.html
Written by `dashboard.py`. Regenerated whenever it's built. Safe to delete.

## audio/
MP3 files made by `scripts/speak.py` for listening practice. Safe to delete at any time.

## anki-import.csv (fallback)
Written by `anki_connect.py` when Anki isn't reachable. Tab-separated: `front<TAB>back<TAB>tags`. Import it in Anki via File → Import (field separator: Tab), then delete the file.
