import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, HelpCircle, Loader2, PenLine, RotateCcw, Send } from "lucide-react";
import { api } from "@/api.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// C-test panel. Everything goes through scripts/ctest.py (make / show / score / result);
// the server never sends the answer key to the browser.
// Placement rules mirrored from domains/german-b1/placement.md (Part 1 A):
//  - one text at a time, ~5 min each, guess if unsure
//  - don't show misses (and here: no per-text score until the end, placement stays neutral)
//  - stop early if text 1 is below 30%
const STOP_EARLY_BELOW = 0.3;

function segments(display) {
  const out = [];
  const re = /(\S*?)___\((\d+)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(display))) {
    if (m.index > last) out.push({ text: display.slice(last, m.index) });
    out.push({ visible: m[1], gap: Number(m[2]) });
    last = m.index + m[0].length;
  }
  if (last < display.length) out.push({ text: display.slice(last) });
  return out;
}

/** "  T1 A2    Die neue Wohnung: 18/20 (90%)" ... "total 48/80 = 60%  ->  C-test band: B1.1" */
function parseResult(text) {
  const rows = [];
  let total = null;
  for (const line of text.split(/\r?\n/)) {
    let m;
    if ((m = line.match(/^\s*(T\d+)\s+(\S+)\s+(.*?):\s*(?:(\d+)\/(\d+)\s*\((\d+)%\)|not taken)/))) {
      rows.push({ id: m[1], level: m[2], title: m[3], score: m[4] ? Number(m[4]) : null, max: m[5] ? Number(m[5]) : null, pct: m[6] ? Number(m[6]) : null });
    } else if ((m = line.match(/total\s+(\d+)\/(\d+)\s*=\s*(\d+)%.*band:\s*(\S+(?:\s\S+)?)/))) {
      total = { score: Number(m[1]), max: Number(m[2]), pct: Number(m[3]), band: m[4] };
    }
  }
  return total ? { rows, total } : null;
}

function Timer({ minutes, startedAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor((now - startedAt) / 1000);
  const over = s > minutes * 60;
  return (
    <Badge variant="outline" className={cn("gap-1 tabular-nums", over && "border-amber-500/50 text-amber-600")}>
      <Clock className="size-3" />
      {Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")} / ~{minutes} min
    </Badge>
  );
}

function WhatIsIt() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <HelpCircle />
          What is a C-test?
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2 text-sm" align="end">
        <p className="font-medium">A quick, research-based level check</p>
        <p>
          You get short German texts. In some words the <strong>second half is missing</strong>, and you fill in the
          missing letters, e.g. <span lang="de">“Die Woh<u>nung</u>”</span>.
        </p>
        <p>
          To fill a gap you need vocabulary, grammar and reading at the same time, so the score is a good estimate of your
          overall level. Language institutes and universities use the same format for placement (e.g. onSET).
        </p>
        <p className="text-muted-foreground">
          4 texts, from A2 to B2, about 5 minutes each. It's the first step of the placement: the result decides where the
          next sections start. Guess when you're unsure; mistakes aren't shown until the end.
        </p>
      </PopoverContent>
    </Popover>
  );
}

export default function CTest({ sendToCoach }) {
  const [state, setState] = useState(null);
  const [text, setText] = useState(null); // {n, header, display}
  const [answers, setAnswers] = useState({});
  const [startedAt, setStartedAt] = useState(Date.now());
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [askOverwrite, setAskOverwrite] = useState(false);
  const [askBlanks, setAskBlanks] = useState(0);
  const formRef = useRef(null);

  useEffect(() => {
    api.ctest().then(setState).catch((e) => setErr(e.message));
  }, []);

  const t1 = state?.texts?.[0];
  const stoppedEarly = !!(state?.today && t1 && t1.score !== null && t1.score / t1.gaps < STOP_EARLY_BELOW);
  const nextText = state?.exists && state.today ? state.texts.find((t) => t.score === null) : null;
  const finished = state?.exists && state.today && (!nextText || stoppedEarly);
  const doneCount = state?.texts?.filter((t) => t.score !== null).length || 0;

  useEffect(() => {
    setResult(null);
    if (finished) api.ctestResult().then(setResult).catch((e) => setErr(e.message));
  }, [finished, state]);

  async function guard(fn) {
    setErr(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const make = (force = false) => {
    const scored = state?.today && state.texts.some((t) => t.score !== null);
    if (scored && !force) return setAskOverwrite(true);
    guard(async () => {
      setResult(null);
      setText(null);
      setState(await api.ctestMake());
    });
  };

  const open = (n) =>
    guard(async () => {
      setText(await api.ctestText(n));
      setAnswers({});
      setStartedAt(Date.now());
      setTimeout(() => formRef.current?.querySelector("input")?.focus(), 50);
    });

  const segs = useMemo(() => (text ? segments(text.display) : []), [text]);

  const submit = (force = false) => {
    const blanks = segs.filter((s) => s.gap && !String(answers[s.gap] || "").trim()).length;
    if (blanks && !force) return setAskBlanks(blanks);
    guard(async () => {
      const r = await api.ctestScore(text.n, answers);
      setText(null);
      setState(r.state);
    });
  };

  if (!state) return <div className="p-4">{err ? <p className="text-sm text-destructive">{err}</p> : <Skeleton className="h-48" />}</div>;

  const parsed = result?.ok ? parseResult(result.text) : null;
  const total = state.texts?.length || 4;

  return (
    <div className="space-y-3 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="size-4" /> C-test
          </CardTitle>
          <CardDescription>
            {finished ? "Done" : state.exists && state.today ? `${doneCount} of ${total} texts done` : "Placement · about 20 minutes"}
          </CardDescription>
          <CardAction>
            <WhatIsIt />
          </CardAction>
        </CardHeader>

        {/* ---- not started today */}
        {!(state.exists && state.today) && (
          <>
            <CardContent className="space-y-2 text-sm">
              <p>
                Four short texts with the second half of some words missing. Type the missing letters (or the whole word).
                About 5 minutes per text; guessing is fine.
              </p>
              {state.exists && <p className="text-xs text-muted-foreground">Last C-test: {state.date}</p>}
            </CardContent>
            <CardFooter>
              <Button onClick={() => make()} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                Start today's C-test
              </Button>
            </CardFooter>
          </>
        )}

        {/* ---- between texts */}
        {state.exists && state.today && !text && !finished && (
          <>
            <CardContent className="space-y-3">
              <Progress value={(100 * doneCount) / total} />
              <p className="text-sm">
                Fill in the <strong>missing second half</strong> of each word. Guess if unsure.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => open(nextText.n)} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                {nextText.n === 1 ? "Start text 1" : `Continue with text ${nextText.n}`}
              </Button>
            </CardFooter>
          </>
        )}

        {/* ---- one text */}
        {text && (
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Text {text.n} of {total}
                </Badge>
                <Timer minutes={state.minutesPerText} startedAt={startedAt} />
              </div>
              <p className="text-[1.05rem] leading-[2.4]" lang="de">
                {segs.map((s, i) =>
                  s.gap ? (
                    <span key={i} className="whitespace-nowrap">
                      {s.visible}
                      <input
                        aria-label={`gap ${s.gap}`}
                        title={`gap ${s.gap}`}
                        value={answers[s.gap] || ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [s.gap]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const inputs = [...formRef.current.querySelectorAll("input")];
                            inputs[inputs.indexOf(e.target) + 1]?.focus();
                          }
                        }}
                        style={{ width: `${Math.max(3, s.visible.length + 2)}ch` }}
                        className="mx-px rounded-md border border-input bg-background px-1 py-0 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                      />
                    </span>
                  ) : (
                    <span key={i}>{s.text}</span>
                  ),
                )}
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Tab or Enter moves to the next gap.</span>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Send />}
                Submit text {text.n}
              </Button>
            </CardFooter>
          </form>
        )}

        {/* ---- finished */}
        {finished && (
          <>
            <CardContent className="space-y-3">
              {stoppedEarly && (
                <p className="rounded-lg bg-muted p-2.5 text-sm">
                  Text 1 was below 30%, so the rest is skipped. That's the placement rule, not a failure: the next steps
                  start at the right level.
                </p>
              )}
              {parsed ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
                    <CheckCircle2 className="size-8 text-emerald-600" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Estimated level</div>
                      <div className="text-2xl font-semibold">{parsed.total.band}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{parsed.total.pct}%</div>
                      <div className="text-xs text-muted-foreground">
                        {parsed.total.score}/{parsed.total.max} gaps
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {parsed.rows.map((r) => (
                      <div key={r.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>
                            <span className="text-muted-foreground">{r.level}</span> · <span lang="de">{r.title}</span>
                          </span>
                          <span className="tabular-nums text-muted-foreground">{r.score === null ? "skipped" : `${r.score}/${r.max}`}</span>
                        </div>
                        <Progress value={r.pct ?? 0} className={cn(r.score === null && "opacity-40")} />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The level cut-offs are provisional until they're checked against official placement results.
                  </p>
                </>
              ) : result ? (
                <pre className="text-sm whitespace-pre-wrap">{result.text}</pre>
              ) : (
                <Skeleton className="h-32" />
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={() =>
                  sendToCoach(
                    `I finished the C-test in the web UI (${state.file}). ` +
                      `Read the result with ctest.py result and continue the placement.`,
                  )
                }
              >
                <ArrowRight />
                Continue placement with the coach
              </Button>
              <Button variant="ghost" onClick={() => make()} disabled={busy}>
                <RotateCcw />
                New C-test
              </Button>
            </CardFooter>
          </>
        )}
      </Card>

      {err && <p className="text-sm text-destructive">{err}</p>}

      <AlertDialog open={askOverwrite} onOpenChange={setAskOverwrite}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace today's C-test?</AlertDialogTitle>
            <AlertDialogDescription>
              Today's C-test already has answers. A new test overwrites them, and the coach will only see the new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my answers</AlertDialogCancel>
            <AlertDialogAction onClick={() => make(true)}>Make a new test</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={askBlanks > 0} onOpenChange={(o) => !o && setAskBlanks(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {askBlanks} {askBlanks === 1 ? "gap is" : "gaps are"} still empty
            </AlertDialogTitle>
            <AlertDialogDescription>Guessing is fine and counts the same as a blank if it's wrong.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back and guess</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setAskBlanks(0);
                submit(true);
              }}
            >
              Submit anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
