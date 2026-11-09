// Several learners on one computer (e.g. a couple practising together).
// Each learner has their own data folder, so profile, placement, mistakes, course progress
// and chat sessions are completely separate. The skill doesn't change: it simply runs
// with LEARNING_COACH_DATA pointing at that learner's folder.
//
//   default learner  -> DATA_ROOT (~/learning-coach-data, unchanged)
//   others           -> PROFILES_DIR/<id>  (~/learning-coach-profiles/<id>)
//   registry         -> PROFILES_DIR/learners.json   [{ id, name }]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DATA_ROOT, DOMAIN, PROFILES_DIR } from "./config.js";

const REGISTRY = path.join(PROFILES_DIR, "learners.json");

function defaultName() {
  const u = (() => {
    try {
      return os.userInfo().username;
    } catch {
      return "";
    }
  })();
  return u.split(/[\s._-]+/)[0] || "Me";
}

function load() {
  try {
    const list = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
    if (Array.isArray(list) && list.some((l) => l.id === "default")) return list;
  } catch { /* first run */ }
  return [{ id: "default", name: defaultName() }];
}

function save(list) {
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
  fs.writeFileSync(REGISTRY, JSON.stringify(list.map(({ id, name }) => ({ id, name })), null, 2));
}

const rootOf = (id) => (id === "default" ? DATA_ROOT : path.join(PROFILES_DIR, id));

export function listLearners() {
  return load().map((l) => ({ ...l, root: rootOf(l.id) }));
}

export function getLearner(id) {
  const all = listLearners();
  return all.find((l) => l.id === id) || all.find((l) => l.id === "default");
}

/** Context for one request: who is learning, and where their files are. */
export function ctxFor(learner) {
  return { learner, dataRoot: learner.root, domainDir: path.join(learner.root, DOMAIN) };
}

export function learnerFromRequest(req) {
  const m = String(req.headers.cookie || "").match(/(?:^|;\s*)lc_learner=([a-z0-9-]+)/);
  return getLearner(m ? m[1] : "default");
}

// "aimen" -> "Aimen": names are shown as names (first letter of each word capitalised).
const cleanName = (name) =>
  String(name || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40)
    .replace(/(^|\s)(\p{Ll})/gu, (m, sp, ch) => sp + ch.toUpperCase());

export function addLearner(name) {
  const n = cleanName(name);
  if (!n) throw new Error("Please enter a name.");
  const list = load();
  if (list.some((l) => l.name.toLowerCase() === n.toLowerCase())) throw new Error(`There is already a learner called ${n}.`);
  const base =
    n.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "learner";
  let id = base === "default" ? "learner" : base;
  for (let i = 2; list.some((l) => l.id === id); i++) id = `${base}-${i}`;
  list.push({ id, name: n });
  save(list);
  fs.mkdirSync(rootOf(id), { recursive: true });
  return getLearner(id);
}

export function renameLearner(id, name) {
  const n = cleanName(name);
  if (!n) throw new Error("Please enter a name.");
  const list = load();
  const l = list.find((x) => x.id === id);
  if (!l) throw new Error("No such learner.");
  if (list.some((x) => x.id !== id && x.name.toLowerCase() === n.toLowerCase())) throw new Error(`There is already a learner called ${n}.`);
  l.name = n;
  save(list);
  return getLearner(id);
}
