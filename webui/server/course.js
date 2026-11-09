// Turns the text of `course.py status` into fields for the Course card.
// course.py stays the source of truth; anything we can't parse is still shown via `raw`.
export function parseCourseStatus(raw) {
  const out = { raw, done: null, total: null, finished: false, current: null, plan: null, status: null };
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    let m;
    if ((m = t.match(/^course:\s*(\d+)\/(\d+) units done/))) {
      out.done = Number(m[1]);
      out.total = Number(m[2]);
    } else if (t.startsWith("all units done")) {
      out.finished = true;
      out.finishedText = t.replace(/^all units done:\s*/, "");
    } else if ((m = t.match(/^current:\s*(\S+)\s+(.*?)\s*\[([^\]]+)\]\s*\(([^)]+)\)/))) {
      out.current = { unit: m[1], title: m[2], state: m[3], module: m[4], canDo: [], grammar: [], exam: "", notes: [] };
    } else if (out.current && (m = t.match(/^can-do:\s*(.*)$/))) {
      out.current.canDo = splitList(m[1]);
    } else if (out.current && (m = t.match(/^grammar:\s*(.*)$/))) {
      out.current.grammar = splitList(m[1]);
    } else if (out.current && (m = t.match(/^exam:\s*(.*)$/))) {
      out.current.exam = m[1];
    } else if (out.current && (m = t.match(/^note:\s*(.*)$/))) {
      out.current.notes.push(m[1]);
    } else if (out.current && (m = t.match(/^day (\d+) of this unit/))) {
      out.current.day = Number(m[1]);
    } else if ((m = t.match(/^path:\s*(\S+?)\s*[–-]\s*(\S+)\s*\((\d+) units?\)\s*·\s*goal\s*(\S+)\s*·\s*(.*)$/))) {
      // "path: A01–MTA1 (9 units) · goal A1 · entry for placement A1.0" (course.py: the learner's own slice)
      out.path = { from: m[1], to: m[2], units: Number(m[3]), goal: m[4], how: m[5] };
    } else if ((m = t.match(/^plan: should be at (\S+) this week; buffer ([+-]?[\d.]+) weeks before (\S+)/))) {
      out.plan = { unitThisWeek: m[1], bufferWeeks: Number(m[2]), deadline: m[3] };
    } else if ((m = t.match(/^->\s*(.*)$/))) {
      const text = m[1];
      const level = /^BEHIND/.test(text) ? "behind" : /^slightly behind/.test(text) ? "slightly-behind" : /on track/.test(text) ? "on-track" : "unknown";
      const advice = text.includes(":") ? text.slice(text.indexOf(":") + 1).trim() : "";
      const weeks = text.match(/~([\d.]+) weeks?/);
      out.status = { level, text, advice, weeksBehind: weeks ? Number(weeks[1]) : 0 };
    }
  }
  out.parsed = out.done !== null && (out.finished || out.current !== null);
  return out;
}

const splitList = (s) => s.split(";").map((x) => x.trim()).filter(Boolean);
