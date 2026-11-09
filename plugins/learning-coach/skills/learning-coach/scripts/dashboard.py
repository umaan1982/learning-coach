#!/usr/bin/env python3
"""Build a self-contained HTML progress dashboard (no internet, no libraries).

Usage: python dashboard.py --domain german-b1 [--today YYYY-MM-DD] [--out path.html]
Default output: <data>/<domain>/dashboard.html  (open it, or send it to the phone)

Shows: days to the goal (hero), streak / minutes / recall accuracy / hours tiles
(+ speech clarity if pronunciation.csv exists),
minutes per day (30 days), weekly recall accuracy vs the 80-90% target band,
open mistake patterns, and the four-strand practice mix. Light + dark mode,
hover/tap tooltips, and a table view for every chart.
"""
import argparse
import datetime as dt
import html
import json
import sys
from collections import Counter, defaultdict

from _common import domain_dir, read_front_matter
from progress import load_csv, to_date, forgiving_streak

STRANDS = [  # (name, blocks) in fixed categorical order
    ("Study", {"recall", "learn", "contrast", "review"}),
    ("Output", {"output", "speak", "write", "mock"}),
    ("Input", {"read", "listen"}),
    ("Fluency", {"fluency"}),
]
E = html.escape


def r_bar_v(x, y, w, h, r=4):
    """Column with 4px rounded top, square baseline."""
    if h <= 0:
        return ""
    r = min(r, w / 2, h)
    return (f"M{x:.1f},{y+h:.1f} V{y+r:.1f} Q{x:.1f},{y:.1f} {x+r:.1f},{y:.1f} "
            f"H{x+w-r:.1f} Q{x+w:.1f},{y:.1f} {x+w:.1f},{y+r:.1f} V{y+h:.1f} Z")


def r_bar_h(x, y, w, h, r=4):
    """Bar with 4px rounded right end, square at the baseline (left)."""
    if w <= 0:
        return ""
    r = min(r, h / 2, w)
    return (f"M{x:.1f},{y:.1f} H{x+w-r:.1f} Q{x+w:.1f},{y:.1f} {x+w:.1f},{y+r:.1f} "
            f"V{y+h-r:.1f} Q{x+w:.1f},{y+h:.1f} {x+w-r:.1f},{y+h:.1f} H{x:.1f} Z")


def nice_max(v):
    for step in (10, 20, 30, 40, 60, 80, 100, 120, 160, 200, 240):
        if v <= step:
            return step
    return int((v // 60 + 1) * 60)


def tip(text):
    return f' data-tip="{E(text)}" tabindex="0"'


# ---------------------------------------------------------------- data
def collect(domain, today):
    d = domain_dir(domain)
    profile = read_front_matter(d / "profile.md")
    sessions = [r for r in load_csv(d / "sessions.csv") if to_date(r.get("date", ""))]
    errors = [r for r in load_csv(d / "errors.csv") if to_date(r.get("date", ""))]
    iv = lambda r, k: int((r.get(k) or "0").strip() or 0)

    days = [today - dt.timedelta(days=i) for i in range(29, -1, -1)]
    mins = defaultdict(int)
    for r in sessions:
        mins[to_date(r["date"])] += iv(r, "minutes")
    per_day = [(dd, mins.get(dd, 0)) for dd in days]

    def window(lo, hi):
        return [r for r in sessions if lo < to_date(r["date"]) <= hi]
    w0 = window(today - dt.timedelta(days=7), today)
    w1 = window(today - dt.timedelta(days=14), today - dt.timedelta(days=7))

    def acc(rows):
        a = sum(iv(r, "recall_attempts") for r in rows)
        return (sum(iv(r, "recall_first_try_correct") for r in rows) / a) if a else None

    weeks = []
    for k in range(7, -1, -1):  # last 8 weeks, oldest first
        hi = today - dt.timedelta(days=7 * k)
        rows = window(hi - dt.timedelta(days=7), hi)
        a = sum(iv(r, "recall_attempts") for r in rows)
        weeks.append({"end": hi, "acc": acc(rows), "n": a})

    open_err = [r for r in errors if (r.get("resolved") or "no").strip().lower() != "yes"
                and to_date(r["date"]) > today - dt.timedelta(days=30)]
    patterns = Counter(r["pattern"] for r in open_err).most_common(8)

    strand_min = Counter()
    for r in window(today - dt.timedelta(days=30), today):
        blocks = [b for b in (r.get("blocks") or "").split(";") if b and b not in ("checkin", "placement")]
        for b in blocks:
            name = next((s for s, bs in STRANDS if b in bs), None)
            if name:
                strand_min[name] += iv(r, "minutes") / len(blocks)

    pron = [r for r in load_csv(d / "pronunciation.csv") if to_date(r.get("date", ""))]
    def clarity(lo, hi):
        vals = [int(r["intelligibility"]) for r in pron if lo < to_date(r["date"]) <= hi and (r.get("intelligibility") or "").isdigit()]
        return sum(vals) / len(vals) / 100 if vals else None
    clar7 = clarity(today - dt.timedelta(days=7), today)
    clar7_prev = clarity(today - dt.timedelta(days=14), today - dt.timedelta(days=7))

    course = None
    try:
        import course as C
        try:
            C.PACE["unit_weeks"] = float(profile.get("unit_weeks") or 1)
        except ValueError:
            pass
        units, _ = C.learner_path(C.load_units(domain), profile)  # this learner's slice of the course map
        prog = C.load_progress(domain)
        start, dl = C.dates(domain, today)
        plan, _ = C.build_schedule(units, start, dl)
        cur = C.first_open(units, prog)
        planned_idx = max((i for i, (u, dd) in enumerate(plan) if dd <= today), default=0)
        lag = sum(C.weight(units[i]) for i in range(units.index(cur), planned_idx)) if cur else 0
        course = {"units": [(u["unit"], u["module"], u["title"], prog.get(u["unit"], {}).get("status", "")) for u in units],
                  "current": cur and (cur["unit"], cur["title"]), "lag": lag,
                  "done": sum(1 for u in units if prog.get(u["unit"], {}).get("status") in C.DONE)}
    except SystemExit:
        pass  # domain without a course map

    deadline = to_date(profile.get("deadline", ""))
    total_min = sum(iv(r, "minutes") for r in sessions)
    return {
        "goal": profile.get("goal") or domain, "level": profile.get("level_estimate", ""),
        "deadline": deadline, "days_left": (deadline - today).days if deadline else None,
        "streak": forgiving_streak({to_date(r["date"]) for r in sessions}, today),
        "min7": sum(iv(r, "minutes") for r in w0), "min7_prev": sum(iv(r, "minutes") for r in w1),
        "acc7": acc(w0), "acc7_prev": acc(w1), "hours": total_min / 60,
        "per_day": per_day, "weeks": weeks, "patterns": patterns,
        "strands": [(s, strand_min.get(s, 0.0)) for s, _ in STRANDS],
        "has_data": bool(sessions), "course": course, "clar7": clar7, "clar7_prev": clar7_prev,
    }


# ---------------------------------------------------------------- charts
def chart_minutes(per_day):
    W, H, L, R, T, B = 420, 170, 30, 6, 10, 24
    pw, ph = W - L - R, H - T - B
    ymax = nice_max(max([m for _, m in per_day] + [10]))
    band = pw / len(per_day)
    bw = max(3.0, min(10.0, band - 3))
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Minutes practised per day, last 30 days">']
    for t in (0, ymax // 2, ymax):
        y = T + ph - ph * t / ymax
        out.append(f'<line class="grid" x1="{L}" x2="{W-R}" y1="{y:.1f}" y2="{y:.1f}"/>'
                   f'<text class="tick" x="{L-6}" y="{y+4:.1f}" text-anchor="end">{t}</text>')
    for i, (d, m) in enumerate(per_day):
        x = L + i * band + (band - bw) / 2
        h = ph * m / ymax
        label = f"{d:%a %d %b}: {m} min"
        out.append(f'<rect class="hit" x="{L + i*band:.1f}" y="{T}" width="{band:.1f}" height="{ph}"{tip(label)}/>')
        if m:
            out.append(f'<path class="s1" d="{r_bar_v(x, T + ph - h, bw, h)}" pointer-events="none"/>')
        if i in (1, 15) or i == len(per_day) - 1:
            out.append(f'<text class="tick" x="{x + bw/2:.1f}" y="{H-6}" text-anchor="middle">{d:%d %b}</text>')
    out.append(f'<line class="axis" x1="{L}" x2="{W-R}" y1="{T+ph}" y2="{T+ph}"/></svg>')
    return "".join(out)


def chart_accuracy(weeks):
    W, H, L, R, T, B = 420, 170, 38, 50, 10, 24
    pw, ph = W - L - R, H - T - B
    y = lambda v: T + ph - ph * v
    xs = [L + pw * i / (len(weeks) - 1) for i in range(len(weeks))]
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Recall first-try accuracy per week, last 8 weeks">',
           f'<rect class="band" x="{L}" y="{y(0.9):.1f}" width="{pw}" height="{y(0.8)-y(0.9):.1f}"/>',
           f'<text class="tick" x="{W-R+6}" y="{(y(0.8)+y(0.9))/2+4:.1f}">target</text>']
    for t in (0, 0.5, 1.0):
        out.append(f'<line class="grid" x1="{L}" x2="{W-R}" y1="{y(t):.1f}" y2="{y(t):.1f}"/>'
                   f'<text class="tick" x="{L-6}" y="{y(t)+4:.1f}" text-anchor="end">{int(t*100)}%</text>')
    pts = [(xs[i], y(w["acc"]), w) for i, w in enumerate(weeks) if w["acc"] is not None]
    if len(pts) >= 2:
        out.append('<polyline class="line s1l" points="' + " ".join(f"{px:.1f},{py:.1f}" for px, py, _ in pts) + '"/>')
    for px, py, w in pts:
        out.append(f'<circle class="dot s1" cx="{px:.1f}" cy="{py:.1f}" r="4.5"/>')
    if pts:
        px, py, w = pts[-1]
        out.append(f'<text class="endlab" x="{px+8:.1f}" y="{py+4:.1f}">{w["acc"]:.0%}</text>')
    for i, w in enumerate(weeks):
        if i % 2 == 1 or i == len(weeks) - 1:
            out.append(f'<text class="tick" x="{xs[i]:.1f}" y="{H-6}" text-anchor="middle">{w["end"]:%d %b}</text>')
    data = [{"x": round(xs[i], 1), "y": (round(y(w["acc"]), 1) if w["acc"] is not None else None),
             "t": f'Week to {w["end"]:%d %b}: ' + (f'{w["acc"]:.0%} first try ({w["n"]} items)' if w["acc"] is not None else "no recall items")}
            for i, w in enumerate(weeks)]
    out.append(f'<line class="xhair" x1="0" x2="0" y1="{T}" y2="{T+ph}" visibility="hidden"/>'
               f'<rect class="hit xarea" x="{L}" y="{T}" width="{pw}" height="{ph}" tabindex="0" '
               f'data-points="{E(json.dumps(data))}"/>')
    out.append(f'<line class="axis" x1="{L}" x2="{W-R}" y1="{T+ph}" y2="{T+ph}"/></svg>')
    return "".join(out)


def chart_patterns(patterns):
    if not patterns:
        return '<p class="empty">No open mistakes in the last 30 days. 🎉</p>'
    W, L, R, rowh, bh = 420, 128, 28, 26, 14
    H = rowh * len(patterns) + 8
    vmax = max(n for _, n in patterns)
    pw = W - L - R
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Open mistake patterns, last 30 days">']
    for i, (p, n) in enumerate(patterns):
        yy = 4 + i * rowh + (rowh - bh) / 2
        w = pw * n / vmax
        out.append(f'<text class="cat" x="{L-8}" y="{yy+bh/2+4:.1f}" text-anchor="end">{E(p)}</text>'
                   f'<rect class="hit" x="0" y="{4+i*rowh}" width="{W}" height="{rowh}"{tip(f"{p}: {n} open")}/>'
                   f'<path class="s1" d="{r_bar_h(L, yy, w, bh)}" pointer-events="none"/>'
                   f'<text class="val" x="{L+w+6:.1f}" y="{yy+bh/2+4:.1f}">{n}</text>')
    out.append(f'<line class="axis" x1="{L}" x2="{L}" y1="0" y2="{H}"/></svg>')
    return "".join(out)


def chart_strands(strands):
    total = sum(v for _, v in strands)
    if total <= 0:
        return '<p class="empty">No sessions in the last 30 days yet.</p>'
    W, H, gap = 420, 28, 2
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Practice time by strand, last 30 days">']
    x = 0.0
    parts = [(s, v) for s, v in strands if v > 0]
    usable = W - gap * (len(parts) - 1)
    for i, (s, v) in enumerate(strands):
        if v <= 0:
            continue
        w = usable * v / total
        share = v / total
        cls = f"s{i+1}"
        out.append(f'<rect class="{cls}" x="{x:.1f}" y="0" width="{w:.1f}" height="{H}" rx="4"{tip(f"{s}: {v:.0f} min ({share:.0%})")}/>')
        if w > 36:
            ink = "ink-dark" if i == 3 else "ink-light"
            out.append(f'<text class="inlab {ink}" x="{x+8:.1f}" y="{H/2+4.5:.1f}" pointer-events="none">{share:.0%}</text>')
        x += w + gap
    out.append("</svg>")
    legend = "".join(f'<span class="key"><i class="sw s{i+1}"></i>{s}</span>' for i, (s, _) in enumerate(strands))
    missing = [s for s, v in strands if v <= 0]
    nudge = (f'<p class="nudge">➡️ No {" or ".join(missing)} time yet: add one short {missing[0].lower()} task this week.</p>' if missing else "")
    return "".join(out) + f'<div class="legend">{legend}<span class="note">aim ≈ 25% each over a week</span></div>{nudge}'


def chart_course(c):
    units = c["units"]
    W, H, gap = 420, 16, 2
    bw = (W - gap * (len(units) - 1)) / len(units)
    out = [f'<svg viewBox="0 0 {W} {H + 18}" role="img" aria-label="Course map: {c["done"]} of {len(units)} units done">']
    prev_mod = None
    for i, (uid, mod, title, st) in enumerate(units):
        x = i * (bw + gap)
        cls = "u-done" if st in ("passed", "corrected", "tested-out") else ("u-cur" if c["current"] and uid == c["current"][0] else "u-todo")
        label = f"{uid} {title}: " + {"u-done": st, "u-cur": "current", "u-todo": "to do"}[cls]
        out.append(f'<rect class="{cls}" x="{x:.1f}" y="0" width="{bw:.1f}" height="{H}" rx="3"{tip(label)}/>')
        if mod != prev_mod:
            out.append(f'<text class="tick" x="{x:.1f}" y="{H + 14}">{E(mod)}</text>')
            prev_mod = mod
    out.append("</svg>")
    cur = c["current"]
    pace = "on track" if c["lag"] < 1 else (f"~{c['lag']:.0f} week behind" if c["lag"] < 2 else f"~{c['lag']:.0f} weeks behind: time to compress")
    now = f'Now: <b>{E(cur[0])} {E(cur[1])}</b> · {pace}' if cur else "All units done: exam time"
    return "".join(out) + f'<p class="cap" style="margin-top:8px">{now}</p>'


def tables(m):
    rows = lambda pairs: "".join(f"<tr><td>{E(str(a))}</td><td>{E(str(b))}</td></tr>" for a, b in pairs)
    pd = [(f"{d:%Y-%m-%d}", v) for d, v in m["per_day"]]
    wk = [(f'{w["end"]:%Y-%m-%d}', "–" if w["acc"] is None else f'{w["acc"]:.0%} (n={w["n"]})') for w in m["weeks"]]
    st = [(s, f"{v:.0f} min") for s, v in m["strands"]]
    return (f'<details><summary>Table view</summary><div class="tables">'
            f'<table><caption>Minutes per day</caption><tr><th>Date</th><th>Minutes</th></tr>{rows(pd)}</table>'
            f'<table><caption>Recall accuracy per week</caption><tr><th>Week ending</th><th>First try</th></tr>{rows(wk)}</table>'
            f'<table><caption>Open mistake patterns (30 days)</caption><tr><th>Pattern</th><th>Count</th></tr>{rows(m["patterns"])}</table>'
            f'<table><caption>Strand mix (30 days)</caption><tr><th>Strand</th><th>Time</th></tr>{rows(st)}</table>'
            f'</div></details>')


def tile(label, value, delta=None):
    d = ""
    if delta:
        good, text = delta
        d = f'<div class="delta {"up" if good else "down"}">{"▲" if good else "▼"} {E(text)}</div>'
    return f'<div class="tile"><div class="tl">{E(label)}</div><div class="tv">{E(value)}</div>{d}</div>'


CSS = """
.viz-root{color-scheme:light;--surface-1:#fcfcfb;--page:#f9f9f7;--text-primary:#0b0b0b;--text-secondary:#52514e;--muted:#898781;
--grid:#e1e0d9;--axis:#c3c2b7;--good:#006300;--bad:#d03b3b;--ring:rgba(11,11,11,.10);
--series-1:#2a78d6;--series-2:#eb6834;--series-3:#1baf7a;--series-4:#eda100;--band:rgba(42,120,214,.10)}
@media (prefers-color-scheme:dark){:root:where(:not([data-theme="light"])) .viz-root{color-scheme:dark;--surface-1:#1a1a19;--page:#0d0d0d;
--text-primary:#f0efec;--text-secondary:#c3c2b7;--grid:#2c2c2a;--axis:#383835;--good:#0ca30c;--bad:#e66767;--ring:rgba(255,255,255,.10);
--series-1:#3987e5;--series-2:#d95926;--series-3:#199e70;--series-4:#c98500;--band:rgba(57,135,229,.14)}}
*{box-sizing:border-box}html{background:#f9f9f7;color-scheme:light}
@media (prefers-color-scheme:dark){html{background:#0d0d0d;color-scheme:dark}}
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.viz-root{background:var(--page);color:var(--text-primary);max-width:600px;margin:0 auto;padding:20px 16px 40px}
h1{font-size:15px;font-weight:600;color:var(--text-secondary);margin:0 0 4px}
.hero{font-size:56px;font-weight:600;line-height:1.05;margin:4px 0}.hero small{font-size:18px;font-weight:500;color:var(--text-secondary)}
.sub{color:var(--text-secondary);font-size:14px;margin-bottom:16px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px}
.tile,.card{background:var(--surface-1);border:1px solid var(--ring);border-radius:12px;padding:12px 14px}
.tl{font-size:13px;color:var(--text-secondary)}.tv{font-size:26px;font-weight:600;margin-top:2px}
.delta{font-size:12px;margin-top:2px}.delta.up{color:var(--good)}.delta.down{color:var(--bad)}
.card{margin-bottom:14px}.card h2{font-size:15px;margin:0 0 2px}.card p.cap{font-size:13px;color:var(--text-secondary);margin:0 0 8px}
svg{width:100%;height:auto;display:block;overflow:visible}
.grid{stroke:var(--grid);stroke-width:1}.axis{stroke:var(--axis);stroke-width:1}.xhair{stroke:var(--axis);stroke-width:1}
.tick{fill:var(--muted);font-size:13px;font-variant-numeric:tabular-nums}.cat{fill:var(--text-secondary);font-size:13px}
.val,.endlab{fill:var(--text-primary);font-size:13px;font-weight:600}
.s1{fill:var(--series-1)}.s2{fill:var(--series-2)}.s3{fill:var(--series-3)}.s4{fill:var(--series-4)}
.line{fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}.s1l{stroke:var(--series-1)}
.dot{stroke:var(--surface-1);stroke-width:2}.band{fill:var(--band)}
.hit{fill:transparent;cursor:pointer;outline:none}.inlab{font-size:13px;font-weight:600}.ink-light{fill:#fff}.ink-dark{fill:#0b0b0b}
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;font-size:12px;color:var(--text-secondary);align-items:center}
.key{display:inline-flex;align-items:center;gap:6px}.sw{width:10px;height:10px;border-radius:3px;display:inline-block}
.sw.s1{background:var(--series-1)}.sw.s2{background:var(--series-2)}.sw.s3{background:var(--series-3)}.sw.s4{background:var(--series-4)}
.u-done{fill:var(--series-1)}.u-cur{fill:var(--band);stroke:var(--series-1);stroke-width:2}.u-todo{fill:var(--grid)}.note{color:var(--muted)}.nudge{font-size:13px;color:var(--text-primary);margin:8px 0 0}.empty{color:var(--text-secondary);font-size:14px;margin:6px 0}
#tip{position:fixed;pointer-events:none;background:var(--surface-1);color:var(--text-primary);border:1px solid var(--ring);
border-radius:8px;padding:6px 9px;font-size:12px;box-shadow:0 4px 14px rgba(0,0,0,.12);display:none;z-index:9;max-width:240px}
details{margin-top:6px;font-size:13px;color:var(--text-secondary)}summary{cursor:pointer}
.tables{display:grid;gap:12px;margin-top:8px}table{border-collapse:collapse;font-size:12px;width:100%;font-variant-numeric:tabular-nums}
caption{text-align:left;font-weight:600;color:var(--text-primary);padding:4px 0}td,th{padding:3px 6px;border-bottom:1px solid var(--grid);text-align:left}
"""

JS = """
const tipEl=document.getElementById('tip');
function show(t,x,y){tipEl.textContent=t;tipEl.style.display='block';
 const r=tipEl.getBoundingClientRect();let L=x+12,T=y-r.height-10;if(L+r.width>innerWidth-8)L=x-r.width-12;if(T<8)T=y+14;
 tipEl.style.left=L+'px';tipEl.style.top=T+'px'}
function hide(){tipEl.style.display='none'}
document.querySelectorAll('[data-tip]').forEach(el=>{
 el.addEventListener('pointermove',e=>show(el.dataset.tip,e.clientX,e.clientY));el.addEventListener('pointerleave',hide);
 el.addEventListener('focus',()=>{const b=el.getBoundingClientRect();show(el.dataset.tip,b.x+b.width/2,b.y)});el.addEventListener('blur',hide)});
document.querySelectorAll('.xarea').forEach(area=>{
 const svg=area.ownerSVGElement,pts=JSON.parse(area.dataset.points),xh=svg.querySelector('.xhair');
 function at(cx,cy){const p=svg.createSVGPoint();p.x=cx;p.y=cy;const s=p.matrixTransform(svg.getScreenCTM().inverse());
  let best=pts[0];for(const q of pts)if(Math.abs(q.x-s.x)<Math.abs(best.x-s.x))best=q;
  xh.setAttribute('x1',best.x);xh.setAttribute('x2',best.x);xh.setAttribute('visibility','visible');show(best.t,cx,cy)}
 area.addEventListener('pointermove',e=>at(e.clientX,e.clientY));
 area.addEventListener('pointerleave',()=>{xh.setAttribute('visibility','hidden');hide()});
 area.addEventListener('focus',()=>{const b=area.getBoundingClientRect();at(b.right-4,b.y+20)});area.addEventListener('blur',()=>{xh.setAttribute('visibility','hidden');hide()})});
"""


def render(m, today):
    if m["days_left"] is not None:
        hero = f'{m["days_left"]}<small> days to go</small>'
        sub = f'{E(m["goal"])} · deadline {m["deadline"]:%d %b %Y}'
    else:
        hero, sub = f'{m["hours"]:.1f}<small> hours practised</small>', E(m["goal"])
    if m["level"]:
        sub += f' · level: {E(m["level"])}'
    dm = m["min7"] - m["min7_prev"]
    tiles = [
        tile("Streak", f'{m["streak"]} days'),
        tile("Minutes, last 7 days", f'{m["min7"]}', (dm >= 0, f"{abs(dm)} vs previous 7") if m["min7_prev"] or m["min7"] else None),
        tile("Recall, first try", "–" if m["acc7"] is None else f'{m["acc7"]:.0%}',
             None if m["acc7"] is None or m["acc7_prev"] is None else
             (m["acc7"] >= m["acc7_prev"], f'{abs(m["acc7"]-m["acc7_prev"])*100:.0f} pts vs previous 7')),
        tile("Total practice", f'{m["hours"]:.1f} h'),
    ]
    if m["clar7"] is not None:
        tiles.append(tile("Speech clarity, 7 days", f'{m["clar7"]:.0%}',
                          None if m["clar7_prev"] is None else
                          (m["clar7"] >= m["clar7_prev"], f'{abs(m["clar7"]-m["clar7_prev"])*100:.0f} pts vs previous 7')))
    acc_cap = "Target band 80–90%: harder items above it, reteach below it."
    body = (f'<h1>Learning coach · {today:%d %b %Y}</h1><div class="hero">{hero}</div><div class="sub">{sub}</div>'
            f'<div class="tiles">{"".join(tiles)}</div>')
    if not m["has_data"]:
        body += '<div class="card"><p class="empty">No sessions logged yet. Your charts appear after the first session.</p></div>'
    else:
        if m["course"]:
            c = m["course"]
            body += f'<div class="card"><h2>Course</h2><p class="cap">{c["done"]} of {len(c["units"])} units done · each block is one unit (MT = module test)</p>{chart_course(c)}</div>'
        body += (f'<div class="card"><h2>Minutes per day</h2><p class="cap">Last 30 days</p>{chart_minutes(m["per_day"])}</div>'
                 f'<div class="card"><h2>Recall accuracy</h2><p class="cap">First-try, per week. {acc_cap}</p>{chart_accuracy(m["weeks"])}</div>'
                 f'<div class="card"><h2>Open mistake patterns</h2><p class="cap">Last 30 days, most frequent first. These drive your practice.</p>{chart_patterns(m["patterns"])}</div>'
                 f'<div class="card"><h2>Practice mix</h2><p class="cap">Time per strand, last 30 days</p>{chart_strands(m["strands"])}</div>'
                 + tables(m))
    return (f'<!DOCTYPE html><html lang="en" translate="no"><head><meta charset="utf-8"><meta name="google" content="notranslate"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>Progress · {E(m["goal"])}</title><style>{CSS}</style></head><body><div class="viz-root">{body}</div>'
            f'<div id="tip" role="status"></div><script>{JS}</script></body></html>')


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--domain", required=True)
    ap.add_argument("--today")
    ap.add_argument("--out")
    a = ap.parse_args()
    today = to_date(a.today) if a.today else dt.date.today()
    if not domain_dir(a.domain).exists():
        print(f"no data folder for {a.domain}; run init_learner.py first", file=sys.stderr)
        return 2
    out = domain_dir(a.domain) / "dashboard.html" if not a.out else __import__("pathlib").Path(a.out)
    out.write_text(render(collect(a.domain, today), today), encoding="utf-8")
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
