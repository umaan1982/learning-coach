#!/usr/bin/env python3
"""Course progress: where am I, what's next, am I on track? (stdlib only)

Reads the domain's course map (domains/<id>/course.csv), the learner's
course-progress.csv and profile.md (start_date, deadline, goal_level, level_estimate, start_unit).

A course map may span several levels (course.csv columns `level` and `entry`). Each learner gets
their own path: from the unit their placement level enters at (or `start_unit`) up to the last
unit of their goal level. An A1 learner aiming for A1 never sees the B1 units, and a B1 learner
never sees the A1 ones. status/schedule/check work on that path.

  status   --domain ID                       current unit, next step, on-track check
  schedule --domain ID                       planned week for every unit (with buffers)
  start    --domain ID --unit U05            mark a unit as current
  check    --domain ID --unit U05 --score .84   record a unit check / module test -> decision
  testout  --domain ID --unit U01 --score .9    test out of a unit (>= 0.85)
Common: --today YYYY-MM-DD (for testing)

Gate rules (references/curriculum.md §5): >=0.80 pass; 0.60-0.79 pass with correctives;
<0.60 corrective lesson + re-check (second attempt always moves on, gaps carried forward).
"""
import argparse
import csv
import datetime as dt
import math
import re
import sys

from _common import SKILL_DIR, domain_dir, read_front_matter

FIELDS = ["unit", "status", "started", "checked", "score", "attempts", "notes"]
DONE = {"passed", "corrected", "tested-out"}
PLACEMENT_WEEKS, TAPER_WEEKS, TEST_WEIGHT = 1, 1, 0.4


def load_units(domain):
    path = SKILL_DIR / "domains" / domain / "course.csv"
    if not path.exists():
        sys.exit(f"no course map at {path}")
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ---------------------------------------------------------------- the learner's path
RANK = {"A0": 0, "A1": 1, "A2": 2, "A2+": 2.5, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
LEVEL = re.compile(r"\b(A0|A1|A2|B1|B2|C1|C2)(?:\.\d)?\b")
PATH_INFO = {"text": ""}


def goal_level(profile):
    """`goal_level` (A1/A2/B1 …), or the first CEFR level named in `goal`."""
    g = (profile.get("goal_level") or "").strip().upper()
    if g in RANK:
        return g
    m = LEVEL.search(profile.get("goal") or "")
    return m.group(1) if m else None


def learner_path(units, profile):
    """(path, how): the slice of the course map this learner actually does."""
    if not units or "level" not in units[0]:
        return units, "whole course"  # single-level packs without a `level` column
    ids = [u["unit"] for u in units]
    goal = goal_level(profile)
    m = LEVEL.search(profile.get("level_estimate") or "")
    placed = m.group(0) if m else None  # e.g. "A1.0", "B1.1", "A2"
    start = (profile.get("start_unit") or "").strip()
    how = f"start_unit {start}"
    if start not in ids:
        entries = {u["unit"]: [t.strip() for t in (u.get("entry") or "").split(";") if t.strip()] for u in units}
        find = lambda tok: next((uid for uid, toks in entries.items() if tok in toks), None)
        start = (find(placed) or find(placed.split(".")[0])) if placed else None
        how = f"entry for placement {placed}"
        if not start and goal:
            start, how = find(f"default-{goal}"), f"not placed yet: default start for goal {goal}"
        if not start:
            start, how = ids[0], "first unit"
    i = ids.index(start)
    last = len(units) - 1
    if goal:
        last = max((k for k, u in enumerate(units) if RANK.get(u.get("level", ""), 99) <= RANK[goal]), default=last)
    if i > last:  # placed at or above the goal: the goal level's final test is the exam training
        return [units[last]], f"{how}; already at goal level {goal}"
    return units[i:last + 1], how


def load_progress(domain):
    path = domain_dir(domain) / "course-progress.csv"
    if not path.exists():
        return {}
    with open(path, newline="", encoding="utf-8") as f:
        return {r["unit"]: r for r in csv.DictReader(f)}


def save_progress(domain, prog, units):
    path = domain_dir(domain) / "course-progress.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    order = [u["unit"] for u in units]
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for uid in sorted(prog, key=lambda x: order.index(x) if x in order else 999):
            w.writerow({k: prog[uid].get(k, "") for k in FIELDS})


PACE = {"unit_weeks": 1.0}  # set from profile.md (unit_weeks) in main()


def weight(u):
    return TEST_WEIGHT if u["unit"].startswith("MT") else PACE["unit_weeks"]


def dates(domain, today):
    p = read_front_matter(domain_dir(domain) / "profile.md")
    parse = lambda s: dt.date.fromisoformat(s) if s and s[:4].isdigit() else None
    return parse(p.get("start_date", "")) or today, parse(p.get("deadline", ""))


def build_schedule(units, start, deadline):
    """Return [(unit, planned_monday)], buffer_weeks. Buffers go after each module test."""
    need = sum(weight(u) for u in units)
    if deadline:
        avail = (deadline - start).days / 7 - PLACEMENT_WEEKS - TAPER_WEEKS
        buffer = avail - need
    else:
        buffer = 0
    tests = [u for u in units if u["unit"].startswith("MT")] or units[-1:]
    # at most 1 buffer week after each module test; the rest stays as reserve before the exam
    per_gap = min(1.0, max(0.0, buffer) / max(1, len(tests)))
    t = start + dt.timedelta(weeks=PLACEMENT_WEEKS)
    plan, wk = [], 0.0
    for u in units:
        d = t + dt.timedelta(days=round(wk * 7))
        plan.append((u, d - dt.timedelta(days=d.weekday())))  # snap to that week's Monday
        wk += weight(u)
        if u in tests:
            wk += per_gap
    return plan, buffer


def first_open(units, prog):
    for u in units:
        st = prog.get(u["unit"], {}).get("status", "")
        if st not in DONE:
            return u
    return None


def cmd_status(a, units, prog, today):
    start, deadline = dates(a.domain, today)
    plan, buffer = build_schedule(units, start, deadline)
    cur = first_open(units, prog)
    done = sum(1 for u in units if prog.get(u["unit"], {}).get("status") in DONE)
    print(f"course: {done}/{len(units)} units done")
    print(PATH_INFO["text"])
    if not cur:
        print("all units done: exam time. Taper, light review, sleep well.")
        return 0
    st = prog.get(cur["unit"], {})
    state = st.get("status") or "not started"
    print(f"current: {cur['unit']} {cur['title']} [{state}]  ({cur['module']})")
    print(f"  can-do:  {cur['can_do']}")
    print(f"  grammar: {cur['grammar']}")
    print(f"  exam:    {cur['exam_task']}")
    missing = [p for p in (cur.get("prereq") or "").split(";") if p and prog.get(p, {}).get("status") not in DONE]
    if missing:
        print(f"  note: prerequisites not done yet: {', '.join(missing)} (fine if they were tested out at placement)")
    if state == "current" and st.get("started"):
        day = (today - dt.date.fromisoformat(st["started"])).days
        print(f"  day {day + 1} of this unit (lesson pattern in domains/{a.domain}/course.md)")
    planned_idx = max((i for i, (u, d) in enumerate(plan) if d <= today), default=0)
    cur_idx = units.index(cur)
    lag = sum(weight(units[i]) for i in range(cur_idx, planned_idx))
    if deadline:
        print(f"plan: should be at {plan[planned_idx][0]['unit']} this week; buffer {buffer:+.1f} weeks before {deadline}")
        if lag >= 2:
            print(f"  -> BEHIND by ~{lag:.1f} weeks: compress a unit to 3 days, merge light units, or use buffer weeks")
        elif lag >= 1:
            print(f"  -> slightly behind (~{lag:.1f} week): fine if buffer remains")
        else:
            print("  -> on track")
    return 0


def cmd_schedule(a, units, prog, today):
    start, deadline = dates(a.domain, today)
    plan, buffer = build_schedule(units, start, deadline)
    print(f"start {start}  ·  placement {PLACEMENT_WEEKS} wk  ·  taper {TAPER_WEEKS} wk  ·  deadline {deadline or '?'}")
    print(PATH_INFO["text"])
    for u, d in plan:
        st = prog.get(u["unit"], {}).get("status", "")
        print(f"  {d:%d %b %Y}  {u['unit']:4s} {u['module']}  {u['title']}" + (f"  [{st}]" if st else ""))
    if deadline:
        if buffer < 0:
            print(f"! {abs(buffer):.1f} weeks short: compress M1 (3 days/unit) or test out units")
        else:
            tests = [u for u in units if u["unit"].startswith("MT")] or units[-1:]
            spread = min(buffer, len(tests) * 1.0)
            print(f"buffer: {buffer:.1f} weeks ({spread:.1f} after module tests for holidays/illness"
                  + (f", {buffer - spread:.1f} reserve before the exam: room for a slower pace or extra review)" if buffer > spread else ")"))
    return 0


def cmd_start(a, units, prog, today):
    ids = [u["unit"] for u in units]
    if a.unit not in ids:
        sys.exit(f"unknown unit {a.unit}")
    for uid, r in prog.items():
        if r.get("status") == "current" and uid != a.unit:
            r["status"] = "corrected"  # leaving a unit unfinished carries its gaps forward
            r["notes"] = (r.get("notes", "") + " left before check").strip()
    r = prog.setdefault(a.unit, {"unit": a.unit, "attempts": "0"})
    r.update(status="current", started=today.isoformat())
    save_progress(a.domain, prog, units)
    u = units[ids.index(a.unit)]
    print(f"started {a.unit} {u['title']}: {u['can_do']}")
    return 0


def next_unit(units, prog):
    nu = first_open(units, prog)
    return f"{nu['unit']} {nu['title']}" if nu else "exam"


def cmd_check(a, units, prog, today):
    r = prog.setdefault(a.unit, {"unit": a.unit, "attempts": "0", "started": today.isoformat()})
    attempts = int(r.get("attempts") or 0) + 1
    r.update(checked=today.isoformat(), score=f"{a.score:.2f}", attempts=str(attempts))
    if a.score >= 0.80:
        r["status"], decision = "passed", "PASS: unlock the next unit"
    elif a.score >= 0.60:
        r["status"], decision = "corrected", "PASS WITH CORRECTIVES: put the missed points into recall for the next unit"
    elif attempts >= 2:
        r["status"], decision = "corrected", "MOVE ON (2nd attempt): carry the gaps forward as recall + error log"
    else:
        r["status"], decision = "current", "CORRECTIVE LESSON: reteach the gaps differently, then re-check only the missed parts"
    save_progress(a.domain, prog, units)
    print(f"{a.unit}: {a.score:.0%} (attempt {attempts}) -> {decision}")
    if r["status"] in DONE:
        nu = first_open(units, prog)
        if nu:
            cmd_start(argparse.Namespace(domain=a.domain, unit=nu["unit"]), units, prog, today)
        else:
            print("course complete")
    return 0


def cmd_testout(a, units, prog, today):
    if a.score >= 0.85:
        prog[a.unit] = {"unit": a.unit, "status": "tested-out", "checked": today.isoformat(),
                        "score": f"{a.score:.2f}", "attempts": "1", "notes": "tested out"}
        save_progress(a.domain, prog, units)
        print(f"{a.unit}: tested out ({a.score:.0%}). Next: {next_unit(units, prog)}")
    else:
        print(f"{a.unit}: {a.score:.0%} < 85%: not tested out; do the unit (it can be compressed)")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("status", "schedule", "start", "check", "testout"):
        p = sub.add_parser(name)
        p.add_argument("--domain", required=True)
        p.add_argument("--today")
        if name in ("start", "check", "testout"):
            p.add_argument("--unit", required=True)
        if name in ("check", "testout"):
            p.add_argument("--score", type=float, required=True)
    a = ap.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if getattr(a, "score", None) is not None and a.score > 1:
        a.score /= 100  # accept 84 as 0.84
    today = dt.date.fromisoformat(a.today) if a.today else dt.date.today()
    profile = read_front_matter(domain_dir(a.domain) / "profile.md")
    try:
        PACE["unit_weeks"] = float(profile.get("unit_weeks") or 1)
    except ValueError:
        pass
    all_units = load_units(a.domain)
    path, how = learner_path(all_units, profile)
    goal = goal_level(profile)
    PATH_INFO["text"] = f"path: {path[0]['unit']}–{path[-1]['unit']} ({len(path)} units) · goal {goal or '?'} · {how}"
    # start/testout accept any unit of the map; everything else follows the learner's path
    units = all_units if a.cmd in ("start", "testout") else path
    prog = load_progress(a.domain)
    return {"status": cmd_status, "schedule": cmd_schedule, "start": cmd_start,
            "check": cmd_check, "testout": cmd_testout}[a.cmd](a, units, prog, today)


if __name__ == "__main__":
    sys.exit(main())
