import {
  ArrowRight,
  BookText,
  CalendarClock,
  Check,
  Circle,
  CircleDot,
  ClipboardCheck,
  Compass,
  Flag,
  GraduationCap,
  Headphones,
  Info,
  Monitor,
  PenLine,
  RefreshCw,
  Target,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// The Plan tab only *shows* the structure the skill defines (placement.md, course.csv/course.md,
// course.py status/schedule) and the learner's files. The coaching itself happens in the chat.

const STATUS = {
  "on-track": { label: "On track", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  "slightly-behind": { label: "Slightly behind", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  behind: { label: "Behind plan", className: "bg-red-500/15 text-red-700 dark:text-red-400" },
};
const UNIT_STATE = { "not started": "Not started", current: "In progress", passed: "Passed", corrected: "Passed with corrections", "tested-out": "Tested out" };
const DONE = new Set(["passed", "corrected", "tested-out"]);

const fmtDate = (iso) => {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** What should the learner do now? Used by the Plan tab and the chat's start screen. */
export function nextAction(plan) {
  if (!plan) return null;
  if (!plan.hasProfile || !plan.profile.goal) {
    return {
      icon: UserRound,
      title: "Set up your goal",
      body: "Tell the coach your goal, your exam date and when you can study. It takes about 5 minutes.",
      label: "Start setup",
      message: "Set me up: my goal, my exam date and when I can study.",
    };
  }
  if (plan.placement.status !== "done") {
    const started = plan.placement.status === "in-progress";
    return {
      icon: Compass,
      title: started ? "Finish your placement test" : "Take your placement test",
      body:
        "About 50 minutes, in two parts you can do on different days. It measures your level so the course starts at the right unit. " +
        "Nothing is corrected during the test; you get the feedback afterwards.",
      label: started ? "Continue placement" : "Start placement",
      message: started ? "Continue the placement" : "Start the placement test",
    };
  }
  const u = plan.course?.current;
  if (u) {
    return {
      icon: GraduationCap,
      title: "Today's lesson",
      body: `${u.unit} · ${u.title}${u.day ? ` · day ${u.day}` : ""}. Say how much time you have and the coach plans the session.`,
      label: "Start today's lesson",
      message: "lernen",
    };
  }
  return null;
}

function NextStep({ plan, onSend }) {
  const a = nextAction(plan);
  if (!a) return null;
  const Icon = a.icon;
  return (
    <Card className="bg-gradient-to-br from-sky-500/15 via-card to-card ring-sky-500/30">
      <CardHeader>
        <CardDescription className="font-medium text-sky-700 dark:text-sky-400">Next step</CardDescription>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="size-5 text-sky-600 dark:text-sky-400" />
          {a.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{a.body}</CardContent>
      <CardFooter className="bg-transparent">
        <Button onClick={() => onSend(a.message)}>
          <ArrowRight />
          {a.label}
        </Button>
        <span className="ml-3 text-xs text-muted-foreground">Opens in the chat on the left</span>
      </CardFooter>
    </Card>
  );
}

function PathStep({ state, title, children, last }) {
  const Icon = state === "done" ? Check : state === "current" ? CircleDot : Circle;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full border",
            state === "done" && "border-emerald-500 bg-emerald-500 text-white",
            state === "current" && "border-primary text-primary",
            state === "todo" && "text-muted-foreground",
          )}
        >
          <Icon className="size-3.5" />
        </span>
        {!last && <span className="my-1 w-px flex-1 bg-border" />}
      </div>
      <div className={cn("min-w-0 flex-1", !last && "pb-4")}>
        <div className={cn("text-sm font-medium", state === "todo" && "text-muted-foreground")}>{title}</div>
        <div className="text-xs text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

function YourPath({ plan }) {
  const setup = plan.hasProfile && plan.profile.goal ? "done" : "current";
  const pl = plan.placement.status === "done" ? "done" : setup === "done" ? "current" : "todo";
  const c = plan.course;
  const courseState = c?.finished ? "done" : pl === "done" ? "current" : "todo";
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your path</CardTitle>
        <CardDescription>{plan.profile.goal || "Your goal"}{plan.profile.deadline && ` · by ${fmtDate(plan.profile.deadline)}`}</CardDescription>
      </CardHeader>
      <CardContent>
        <PathStep state={setup} title="1. Set up">
          Goal, exam date and study times.
        </PathStep>
        <PathStep state={pl} title="2. Placement test">
          {plan.placement.status === "done"
            ? `Done${plan.placement.date ? ` on ${fmtDate(plan.placement.date)}` : ""} · level ${plan.profile.level || "?"}`
            : plan.placement.status === "in-progress"
              ? "In progress · about 50 minutes in total"
              : "About 50 minutes, in two parts"}
        </PathStep>
        <PathStep state={courseState} title="3. Course">
          {c?.parsed ? `${c.done} of ${c.total} units · about one unit a week` : "Units of about one week each"}
        </PathStep>
        <PathStep state={c?.finished ? "current" : "todo"} title="4. Exam" last>
          {plan.profile.deadline ? fmtDate(plan.profile.deadline) : "Your exam date"} · the last week is light review
        </PathStep>
      </CardContent>
    </Card>
  );
}

function PlacementCard({ plan, openTab }) {
  const pc = plan.placement;
  if (pc.status === "done" || !pc.sections.length) return null;
  const icon = (title) => (/c-test/i.test(title) ? PenLine : /listen/i.test(title) ? Headphones : null);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="size-4" /> Placement test
        </CardTitle>
        <CardDescription>What's in it. The coach runs it in the chat, one question at a time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pc.sections.map((s) => (
          <div key={s.name} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-sm font-medium">
                {s.name}
                {s.title && `: ${s.title}`}
                {s.optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">{s.note.replace(/^(screen, no audio needed, |needs headphones for G; )/, "")}</div>
            </div>
            {/needs headphones/.test(s.note) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Headphones className="size-3.5" /> Needs headphones for the listening part
              </div>
            )}
            {/screen/.test(s.note) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Monitor className="size-3.5" /> On screen, typed answers
              </div>
            )}
            {s.optional && (
              <p className="text-xs text-muted-foreground">A free official online placement test, to double-check our result.</p>
            )}
            {s.steps.length > 0 && (
              <ul className="space-y-1">
                {s.steps.map((st) => {
                  const isCtest = /c-test/i.test(st.title);
                  const done = isCtest && pc.ctest?.done;
                  const Icon = icon(st.title);
                  return (
                    <li key={st.letter} className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm">
                      {done ? <Check className="size-4 text-emerald-600" /> : Icon ? <Icon className="size-4 text-muted-foreground" /> : <Circle className="size-3 text-muted-foreground" />}
                      <span className="flex-1">{st.title}</span>
                      <span className="text-xs text-muted-foreground">{st.note.split(/[;,]/)[0]}</span>
                      {isCtest && !done && (
                        <Button size="xs" variant="outline" onClick={() => openTab("ctest")}>
                          C-test tab
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {title}
      </div>
      {children}
    </div>
  );
}

function Bullets({ items }) {
  return (
    <ul className="space-y-1 text-sm">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/50" />
          <span>{cap(x)}</span>
        </li>
      ))}
    </ul>
  );
}

function CourseOverview({ c, reload, loading }) {
  // A plan that doesn't fit before the exam isn't "on track", even in week 1: course.py only
  // compares where you are with where you should be, so check the spare time too.
  const tooLong = c.plan && c.plan.bufferWeeks < 0;
  const st = tooLong
    ? { label: "Doesn't fit before the exam", className: "bg-red-500/15 text-red-700 dark:text-red-400" }
    : c.status && STATUS[c.status.level];
  const pct = c.total ? Math.round((100 * c.done) / c.total) : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course progress</CardTitle>
        <CardDescription>
          {c.done} of {c.total} units done
        </CardDescription>
        <CardAction className="flex items-center gap-1">
          {st && <Badge className={st.className}>{st.label}</Badge>}
          <Button variant="ghost" size="icon-sm" onClick={reload} aria-label="Refresh" disabled={loading}>
            <RefreshCw className={cn(loading && "animate-spin")} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={pct} aria-label={`${pct}% of units done`} />
        {c.plan && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <div className="text-xs text-muted-foreground">Plan for this week</div>
              <div className="font-medium">{c.plan.unitThisWeek}</div>
            </div>
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <div className="text-xs text-muted-foreground">Spare time before the exam</div>
              <div className={cn("font-medium", c.plan.bufferWeeks < 0 && "text-red-600 dark:text-red-400")}>
                {c.plan.bufferWeeks > 0 ? "+" : ""}
                {c.plan.bufferWeeks} weeks
              </div>
            </div>
          </div>
        )}
        {tooLong && (
          <div className="flex gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red-600" />
            <span>
              The course needs about {Math.abs(c.plan.bufferWeeks)} more weeks than you have. Ask the coach to shorten
              Module 1 (3 days per unit) or to let you test out of units you already know.
            </span>
          </div>
        )}
        {c.status && c.status.level !== "on-track" && c.status.advice && (
          <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <span>
              About {c.status.weeksBehind} weeks behind. Options: {c.status.advice}.
            </span>
          </div>
        )}
        {c.finished && <p className="text-sm">{c.finishedText}</p>}
      </CardContent>
    </Card>
  );
}

function UnitCard({ u, placementDone }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary">{u.unit}</Badge>
          <Badge variant="outline">Module {u.module.replace(/^M/, "")}</Badge>
          {u.day && <Badge variant="outline">Day {u.day}</Badge>}
        </div>
        <CardTitle className="pt-1 text-lg" lang="de">
          {u.title}
        </CardTitle>
        <CardDescription>
          {placementDone ? `Current unit · ${UNIT_STATE[u.state] || u.state}` : "First unit · may change after your placement"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {u.canDo.length > 0 && (
          <Section icon={Target} title="After this unit you can">
            <Bullets items={u.canDo} />
          </Section>
        )}
        {u.grammar.length > 0 && (
          <>
            <Separator />
            <Section icon={BookText} title="Grammar">
              <Bullets items={u.grammar} />
            </Section>
          </>
        )}
        {u.exam && (
          <>
            <Separator />
            <Section icon={ClipboardCheck} title="Exam practice">
              <p className="text-sm">{u.exam}</p>
            </Section>
          </>
        )}
        {u.notes.map((n, i) => (
          <div key={i} className="flex gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {n}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Schedule({ plan }) {
  const s = plan.schedule;
  if (!s?.units?.length) return null;
  const current = plan.course?.current?.unit;
  const byModule = [];
  for (const u of s.units) {
    if (byModule.at(-1)?.id !== u.module) byModule.push({ id: u.module, units: [] });
    byModule.at(-1).units.push(u);
  }
  const openModule = byModule.find((m) => m.units.some((u) => u.unit === current))?.id;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-4" /> Full schedule
        </CardTitle>
        <CardDescription>
          {byModule.length} modules · {s.units.filter((u) => !u.unit.startsWith("MT")).length} units of about a week · module tests in the exam format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={openModule}>
          {byModule.map((m) => {
            const info = plan.modules[m.id];
            const doneCount = m.units.filter((u) => DONE.has(u.status)).length;
            return (
              <AccordionItem key={m.id} value={m.id}>
                <AccordionTrigger className="py-2.5 hover:no-underline">
                  <div className="flex flex-1 items-center gap-2 text-left">
                    <Badge variant="outline" className="w-9 justify-center">{m.id}</Badge>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium" lang="de">{info?.name || m.id}</div>
                      <div className="text-xs text-muted-foreground">
                        from {m.units[0].week} · {info?.level || ""} · {doneCount}/{m.units.length} done
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-0.5">
                    {m.units.map((u) => {
                      const isTest = u.unit.startsWith("MT");
                      const isCurrent = u.unit === current;
                      const done = DONE.has(u.status);
                      return (
                        <li
                          key={u.unit}
                          className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-sm", isCurrent && "bg-primary/10 ring-1 ring-primary/30")}
                        >
                          {done ? (
                            <Check className="size-4 text-emerald-600" />
                          ) : isTest ? (
                            <Flag className="size-4 text-muted-foreground" />
                          ) : isCurrent ? (
                            <CircleDot className="size-4 text-primary" />
                          ) : (
                            <Circle className="size-3.5 text-muted-foreground" />
                          )}
                          <span className="w-10 text-xs text-muted-foreground tabular-nums">{u.unit}</span>
                          <span className={cn("flex-1 truncate", isTest && "font-medium")} lang="de">
                            {isTest ? "Module test" : u.title}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{u.week.replace(/ \d{4}$/, "")}</span>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        {s.bufferLine && <p className="mt-3 text-xs text-muted-foreground">{cap(s.bufferLine.replace(/^buffer:\s*/, "Spare time: "))}</p>}
      </CardContent>
    </Card>
  );
}

export default function Plan({ plan, error, reload, loading, onSend, openTab }) {
  if (error) return <div className="p-4 text-sm text-destructive">{error}</div>;
  if (!plan) return <div className="space-y-3 p-4"><Skeleton className="h-32" /><Skeleton className="h-48" /><Skeleton className="h-64" /></div>;
  const c = plan.course;
  const placementDone = plan.placement.status === "done";
  return (
    <div className="space-y-3 p-4">
      <NextStep plan={plan} onSend={onSend} />
      <YourPath plan={plan} />
      <PlacementCard plan={plan} openTab={openTab} />
      {c?.parsed && <CourseOverview c={c} reload={reload} loading={loading} />}
      {c?.current && <UnitCard u={c.current} placementDone={placementDone} />}
      <Schedule plan={plan} />
      {!c?.parsed && c?.raw && (
        <Card>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{c.raw}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
