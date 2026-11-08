// "Where am I and what's next?" for the Plan tab. Read-only: it looks at the learner's
// files and the domain pack, and parses `course.py schedule`. Nothing here coaches;
// it only shows the structure the skill already defines.
import fs from "node:fs";
import path from "node:path";
import { DOMAIN, DOMAIN_DIR, SKILL_DIR } from "./config.js";
import { parseCourseStatus } from "./course.js";
import { runScript } from "./scripts.js";

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");

function frontMatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/);
  const out = {};
  for (const line of (m ? m[1] : "").split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0 && !/^[\s#]/.test(line)) out[line.slice(0, i).trim()] = line.slice(i + 1).replace(/\s+#(\s.*)?$/, "").trim();
  }
  return out;
}

/** Placement sections from domains/<id>/placement.md headings, e.g. "### A. C-test (≈20 min, router)". */
function placementSections() {
  const parts = [];
  for (const line of read(path.join(SKILL_DIR, "domains", DOMAIN, "placement.md")).split(/\r?\n/)) {
    let m;
    if ((m = line.match(/^## (Part \d+)(?::\s*([^(]+?))?\s*(?:\((.+)\))?\s*$/))) {
      parts.push({ name: m[1], title: (m[2] || "").trim(), note: m[3] || "", steps: [] });
    } else if ((m = line.match(/^## (External benchmark)\s*(?:\((.+)\))?/))) {
      parts.push({ name: m[1], title: "", note: m[2] || "", steps: [], optional: true });
    } else if ((m = line.match(/^### ([A-Z])\.\s*([^(]+?)\s*(?:\((.+)\))?\s*$/)) && parts.length) {
      parts.at(-1).steps.push({ letter: m[1], title: m[2].replace(/:.*$/, "").trim(), note: m[3] || "" });
    } else if (/^## /.test(line) && parts.length && !/^## (Part|External)/.test(line)) {
      // "## Output" etc. end the list of sections
      if (/^## Output/.test(line)) break;
    }
  }
  return parts;
}

/** Module names from the table in domains/<id>/course.md: "| M1 Refresh | U01–U04 | A2 consolidation | 4 | MT1: ... |" */
function moduleNames() {
  const out = {};
  for (const line of read(path.join(SKILL_DIR, "domains", DOMAIN, "course.md")).split(/\r?\n/)) {
    const m = line.match(/^\|\s*(M\d+)\s+([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (m) out[m[1]] = { name: m[2], units: m[3], level: m[4] };
  }
  return out;
}

/** "  09 Nov 2026  U01  M1  Ich und mein Alltag  [passed]" */
function parseSchedule(raw) {
  const units = [];
  let head = null;
  let bufferLine = "";
  for (const line of raw.split(/\r?\n/)) {
    let m;
    if ((m = line.match(/^start (\S+).*deadline (\S+)/))) head = { start: m[1], deadline: m[2] };
    else if ((m = line.match(/^\s+(\d{2} \w{3} \d{4})\s+(\S+)\s+(M\d+)\s+(.+?)(?:\s+\[([^\]]+)\])?\s*$/))) {
      units.push({ week: m[1], unit: m[2], module: m[3], title: m[4], status: m[5] || "" });
    } else if (/^(buffer:|!)/.test(line)) bufferLine = line.replace(/^!\s*/, "").trim();
  }
  return { head, units, bufferLine };
}

function csvRows(p) {
  return read(p).split(/\r?\n/).slice(1).filter((l) => l.trim());
}

export async function planState(ctest) {
  const profile = frontMatter(read(path.join(DOMAIN_DIR, "profile.md")));
  const notes = path.join(DOMAIN_DIR, "notes");
  const noteFiles = fs.existsSync(notes) ? fs.readdirSync(notes) : [];
  const done = noteFiles.filter((f) => /^placement-\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort();
  const inProgress = noteFiles.includes("placement-in-progress.md");

  const sessions = csvRows(path.join(DOMAIN_DIR, "sessions.csv"));
  const lastSession = sessions.length ? sessions.at(-1).split(",")[0] : null;

  const [status, schedule] = await Promise.all([
    runScript("course.py", ["status", "--domain", DOMAIN]),
    runScript("course.py", ["schedule", "--domain", DOMAIN]),
  ]);

  // Done = every text scored, or stopped early after text 1 (< 30%, placement rule).
  const t1 = ctest?.exists ? ctest.texts[0] : null;
  const stoppedEarly = !!(t1 && t1.score !== null && t1.score / t1.gaps < 0.3);
  const ctestDone = !!(ctest?.exists && (ctest.texts.every((t) => t.score !== null) || stoppedEarly));

  return {
    hasProfile: !!profile.domain,
    profile: {
      goal: profile.goal || "",
      deadline: profile.deadline || "",
      start: profile.start_date || "",
      level: profile.level_estimate || "",
    },
    placement: {
      status: done.length ? "done" : inProgress ? "in-progress" : "not-started",
      date: done.length ? done.at(-1).slice(10, 20) : null,
      sections: placementSections(),
      ctest: ctest?.exists ? { date: ctest.date, done: ctestDone, textsDone: ctest.texts.filter((t) => t.score !== null).length, texts: ctest.texts.length } : null,
    },
    sessions: { count: sessions.length, last: lastSession },
    course: status.code === 0 ? parseCourseStatus(status.stdout) : { parsed: false, raw: status.stderr || status.stdout },
    schedule: schedule.code === 0 ? parseSchedule(schedule.stdout) : null,
    modules: moduleNames(),
  };
}
