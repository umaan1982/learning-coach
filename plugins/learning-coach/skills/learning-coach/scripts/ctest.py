#!/usr/bin/env python3
"""C-test: a fast, well-researched global proficiency measure (stdlib only).

The format behind onSET (TestDaF-Institut) and many university placement tests:
several short texts; the first and last sentences stay whole; from the second
word of the second sentence on, the second half of every second word is deleted
(the larger half for odd lengths) until the text has N gaps. The learner restores
the missing letters. Items here are the domain's own texts (domains/<id>/ctest.md),
never copied from official tests.

  make   --domain ID                       build today's test -> <data>/notes/ctest-YYYY-MM-DD.json
  show   --domain ID [--text N]            print text(s) with numbered gaps (no answers)
  score  --domain ID --text N --answers "1 us 2 st ..."   score one text (full words or missing parts)
  result --domain ID                       totals, per-text %, level band (provisional cut-offs)
Common: --file PATH (a specific test file), --today YYYY-MM-DD
"""
import argparse
import datetime as dt
import json
import re
import sys

from _common import SKILL_DIR, domain_dir, read_front_matter

WORD = re.compile(r"[^\W\d_]+(?:-[^\W\d_]+)*", re.UNICODE)
SENT_END = re.compile(r"(?<=[.!?])\s+")
TRANSLIT = str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"})


def load_texts(domain):
    path = SKILL_DIR / "domains" / domain / "ctest.md"
    if not path.exists():
        sys.exit(f"no C-test texts at {path}")
    fm = read_front_matter(path)
    body = re.sub(r"^---.*?\n---\s*\n", "", path.read_text(encoding="utf-8"), flags=re.S)
    texts = []
    for m in re.finditer(r"^## (T\d+)\s*·\s*([^·\n]+?)\s*·\s*(.+?)\n(.*?)(?=^## |\Z)", body, re.S | re.M):
        tid, level, title, raw = m.groups()
        paragraph = " ".join(l.strip() for l in raw.strip().splitlines() if l.strip() and not l.startswith(">"))
        texts.append({"id": tid, "level": level.strip(), "title": title.strip(), "raw": paragraph})
    return fm, texts


def build(raw, n_gaps):
    """Return (display_tokens, gaps). Protected spans: {Name} are never gapped."""
    sentences = SENT_END.split(raw.strip())
    if len(sentences) < 3:
        sys.exit("a C-test text needs at least 3 sentences")
    gaps, out = [], []
    counter, done = 0, False
    for si, sent in enumerate(sentences):
        last = si == len(sentences) - 1
        pieces, pos = [], 0
        # split protected spans first
        for pm in re.finditer(r"\{([^}]*)\}|" + WORD.pattern, sent):
            pieces.append(sent[pos:pm.start()])
            tok = pm.group(0)
            if pm.group(1) is not None:          # {Name}: shown as-is, still counts as a word
                pieces.append(pm.group(1))
                if si > 0 and not done and not last:
                    counter += 1
            elif si == 0 or done or last:
                pieces.append(tok)
            else:
                counter += 1
                if counter % 2 == 0 and len(tok) >= 2:
                    keep = len(tok) // 2
                    gaps.append({"n": len(gaps) + 1, "visible": tok[:keep], "missing": tok[keep:], "word": tok})
                    pieces.append(f"{tok[:keep]}___({len(gaps)})")
                    if len(gaps) >= n_gaps:
                        done = True
                else:
                    pieces.append(tok)
            pos = pm.end()
        pieces.append(sent[pos:])
        out.append("".join(pieces))
    if len(gaps) < n_gaps:
        sys.exit(f"text too short: only {len(gaps)} gaps (need {n_gaps}); add words before the last sentence")
    return " ".join(out), gaps


def test_path(a, today):
    if a.file:
        return a.file
    notes = domain_dir(a.domain) / "notes"
    if a.cmd == "make":
        return notes / f"ctest-{today:%Y-%m-%d}.json"
    found = sorted(notes.glob("ctest-*.json"))
    if not found:
        sys.exit("no C-test yet: run `ctest.py make` first")
    return found[-1]


def norm(s):
    return re.sub(r"[^\w-]", "", s.strip().lower().translate(TRANSLIT))


def parse_answers(text, n):
    """'1 us 2. st 3) ein' or one answer per line or just n answers in order."""
    numbered = re.findall(r"(\d+)\s*[.):=-]?\s*([^\d\s,;]+)", text)
    if numbered:
        return {int(k): v for k, v in numbered}
    toks = [t for t in re.split(r"[\s,;]+", text.strip()) if t]
    return {i + 1: t for i, t in enumerate(toks[:n])}


def correct(gap, ans):
    a = norm(ans)
    full, miss, vis = norm(gap["word"]), norm(gap["missing"]), norm(gap["visible"])
    return a == miss or a == full or (vis + a) == full


def cmd_make(a, today):
    fm, texts = load_texts(a.domain)
    n = int(fm.get("gaps_per_text") or 20)
    test = {"date": today.isoformat(), "domain": a.domain, "gaps_per_text": n,
            "minutes_per_text": int(fm.get("minutes_per_text") or 5),
            "bands": fm.get("bands", ""), "texts": []}
    for t in texts:
        display, gaps = build(t["raw"], n)
        test["texts"].append({"id": t["id"], "level": t["level"], "title": t["title"],
                              "display": display, "gaps": gaps, "answers": None, "score": None})
    path = test_path(a, today)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(test, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"C-test ready: {len(texts)} texts x {n} gaps, ~{test['minutes_per_text']} min each -> {path}")
    print("Send one text per message with `ctest.py show --text N`. Typed answers only.")


def cmd_show(a, today):
    test = json.loads(open(test_path(a, today), encoding="utf-8").read())
    for i, t in enumerate(test["texts"], 1):
        if a.text and i != a.text:
            continue
        print(f"Text {i}/{len(test['texts'])} · ~{test['minutes_per_text']} min\n\n{t['display']}\n")


def cmd_score(a, today):
    path = test_path(a, today)
    test = json.loads(open(path, encoding="utf-8").read())
    t = test["texts"][a.text - 1]
    given = parse_answers(a.answers, len(t["gaps"]))
    res, misses = [], []
    for g in t["gaps"]:
        ans = given.get(g["n"], "")
        ok = bool(ans) and correct(g, ans)
        res.append({"n": g["n"], "answer": ans, "ok": ok})
        if not ok:
            misses.append(f"{g['n']}: {g['visible']}+{ans or '—'} (expected {g['word']})")
    t["answers"], t["score"] = res, sum(r["ok"] for r in res)
    path.write_text(json.dumps(test, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"text {a.text} ({t['level']}): {t['score']}/{len(t['gaps'])}")
    if misses:
        print("misses (for the log, not for the learner during placement):")
        print("  " + "\n  ".join(misses))


def band(pct, bands):
    level = "below " + (bands[0][1] if bands else "?")
    for cut, name in bands:
        if pct >= cut:
            level = name
    return level


def cmd_result(a, today):
    test = json.loads(open(test_path(a, today), encoding="utf-8").read())
    bands = []
    for part in (test.get("bands") or "").split(","):
        if ":" in part:
            cut, name = part.split(":", 1)
            bands.append((float(cut), name.strip()))
    done = [t for t in test["texts"] if t["score"] is not None]
    if not done:
        sys.exit("no text scored yet")
    total = sum(t["score"] for t in done)
    max_ = sum(len(t["gaps"]) for t in test["texts"])
    for t in test["texts"]:
        s = "not taken" if t["score"] is None else f"{t['score']}/{len(t['gaps'])} ({t['score'] / len(t['gaps']):.0%})"
        print(f"  {t['id']} {t['level']:5s} {t['title']}: {s}")
    pct = 100 * total / max_
    print(f"total {total}/{max_} = {pct:.0f}%  ->  C-test band: {band(pct, bands)}")
    print("Cut-offs are provisional until calibrated against official placement results (benchmarks.csv).")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("make", "show", "score", "result"):
        p = sub.add_parser(name)
        p.add_argument("--domain", required=True)
        p.add_argument("--file")
        p.add_argument("--today")
        if name in ("show", "score"):
            p.add_argument("--text", type=int, required=(name == "score"))
        if name == "score":
            p.add_argument("--answers", required=True)
    a = ap.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    today = dt.date.fromisoformat(a.today) if a.today else dt.date.today()
    return {"make": cmd_make, "show": cmd_show, "score": cmd_score, "result": cmd_result}[a.cmd](a, today) or 0


if __name__ == "__main__":
    sys.exit(main())
