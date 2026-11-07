#!/usr/bin/env python3
"""Summarise learner progress from sessions.csv, errors.csv and profile.md.

Usage: python progress.py --domain german-b1 [--today YYYY-MM-DD]
"""
import argparse
import csv
import datetime as dt
import sys
from collections import Counter

from _common import domain_dir, read_front_matter


def load_csv(path):
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def to_date(s):
    try:
        return dt.date.fromisoformat(s.strip())
    except (ValueError, AttributeError):
        return None


def forgiving_streak(days, today):
    """Consecutive days with practice, ending today or yesterday; a single missed day is forgiven."""
    streak, d, misses = 0, today, 0
    if today not in days:
        d = today - dt.timedelta(days=1)
    while True:
        if d in days:
            streak += 1
            misses = 0
        else:
            misses += 1
            if misses > 1:
                break
        d -= dt.timedelta(days=1)
        if streak == 0 and misses > 1:
            break
    return streak


def accuracy(rows):
    att = sum(int(r.get("recall_attempts") or 0) for r in rows)
    ok = sum(int(r.get("recall_first_try_correct") or 0) for r in rows)
    return (ok / att, att) if att else (None, 0)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--domain", required=True)
    ap.add_argument("--today")
    a = ap.parse_args()
    today = to_date(a.today) if a.today else dt.date.today()
    d = domain_dir(a.domain)
    if not d.exists():
        print(f"no data folder at {d}; run init_learner.py first", file=sys.stderr)
        return 2

    profile = read_front_matter(d / "profile.md")
    sessions = [r for r in load_csv(d / "sessions.csv") if to_date(r.get("date", ""))]
    errors = [r for r in load_csv(d / "errors.csv") if to_date(r.get("date", ""))]

    days = {to_date(r["date"]) for r in sessions}
    def within(rows, lo, hi):
        return [r for r in rows if lo < to_date(r["date"]) <= hi]
    w0 = within(sessions, today - dt.timedelta(days=7), today)
    w1 = within(sessions, today - dt.timedelta(days=14), today - dt.timedelta(days=7))

    print(f"# Progress: {a.domain} ({today})")
    print(f"goal: {profile.get('goal', '?')}  |  level estimate: {profile.get('level_estimate', '?')}")
    deadline = to_date(profile.get("deadline", ""))
    if deadline:
        print(f"days to deadline: {(deadline - today).days}")
    print(f"sessions total: {len(sessions)}  |  practice days: {len(days)}  |  streak (1 miss forgiven): {forgiving_streak(days, today)}")
    m7 = sum(int(r.get('minutes') or 0) for r in w0)
    m30 = sum(int(r.get('minutes') or 0) for r in within(sessions, today - dt.timedelta(days=30), today))
    total_min = sum(int(r.get('minutes') or 0) for r in sessions)
    print(f"minutes: last 7d {m7}  |  last 30d {m30}  |  total {total_min} ({total_min/60:.1f} h)")
    acc0, n0 = accuracy(w0)
    acc1, n1 = accuracy(w1)
    fmt = lambda x: "n/a" if x is None else f"{x:.0%}"
    print(f"recall first-try accuracy: last 7d {fmt(acc0)} (n={n0})  |  previous 7d {fmt(acc1)} (n={n1})")
    if acc0 is not None:
        if acc0 > 0.92:
            print("  -> above target band (80-90%): make items harder")
        elif acc0 < 0.75:
            print("  -> below target band (80-90%): reteach / easier items")

    open_err = [r for r in errors if (r.get("resolved") or "no").lower() != "yes"]
    recent = [r for r in open_err if to_date(r["date"]) > today - dt.timedelta(days=14)]
    print(f"open error patterns: {len({r['pattern'] for r in open_err})}  |  logged errors last 14d: {len(recent)}")
    for pat, n in Counter(r["pattern"] for r in recent).most_common(5):
        print(f"  - {pat}: {n}")
    blocks = Counter(b for r in within(sessions, today - dt.timedelta(days=7), today) for b in (r.get("blocks") or "").split(";") if b)
    if blocks:
        print("blocks last 7d: " + ", ".join(f"{b} {n}" for b, n in blocks.most_common()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
