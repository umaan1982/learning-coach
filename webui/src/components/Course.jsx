import { useEffect, useState } from "react";
import { BookText, CalendarClock, ClipboardCheck, Info, RefreshCw, Target, TriangleAlert } from "lucide-react";
import { api } from "@/api.js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Data comes from `course.py status` (parsed on the server); the script stays the source of truth.

const STATUS = {
  "on-track": { label: "On track", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  "slightly-behind": { label: "Slightly behind", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  behind: { label: "Behind plan", className: "bg-red-500/15 text-red-700 dark:text-red-400" },
};

const STATE = {
  "not started": "Not started",
  current: "In progress",
  passed: "Passed",
  corrected: "Passed with corrections",
  "tested-out": "Tested out",
};

const fmtDate = (iso) => {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

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

function List({ items }) {
  return (
    <ul className="space-y-1 text-sm">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/50" />
          <span>{x.charAt(0).toUpperCase() + x.slice(1)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Course({ refreshKey }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setErr(null);
    setLoading(true);
    api
      .course()
      .then(setData)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [refreshKey]);

  const refresh = (
    <Button variant="ghost" size="icon-sm" onClick={load} aria-label="Refresh" disabled={loading}>
      <RefreshCw className={cn(loading && "animate-spin")} />
    </Button>
  );

  if (err) return <div className="p-4 text-sm text-destructive">{err}</div>;
  if (!data) return <div className="space-y-3 p-4"><Skeleton className="h-24" /><Skeleton className="h-56" /></div>;
  if (!data.ok || !data.parsed) {
    // Couldn't read the structure (or no course yet): show the script's own words.
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Course</CardTitle>
            <CardAction>{refresh}</CardAction>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{data.text}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { done, total, current: u, plan, status } = data;
  const st = status && STATUS[status.level];
  const pct = total ? Math.round((100 * done) / total) : 0;

  return (
    <div className="space-y-3 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Your course</CardTitle>
          <CardDescription>
            {done} of {total} units done
          </CardDescription>
          <CardAction className="flex items-center gap-1">
            {st && <Badge className={st.className}>{st.label}</Badge>}
            {refresh}
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={pct} aria-label={`${pct}% of units done`} />
          {plan && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-muted/60 px-3 py-2">
                <div className="text-xs text-muted-foreground">Plan for this week</div>
                <div className="font-medium">{plan.unitThisWeek}</div>
              </div>
              <div className="rounded-lg bg-muted/60 px-3 py-2">
                <div className="text-xs text-muted-foreground">Spare time before the exam</div>
                <div className={cn("font-medium", plan.bufferWeeks < 0 && "text-red-600 dark:text-red-400")}>
                  {plan.bufferWeeks > 0 ? "+" : ""}
                  {plan.bufferWeeks} weeks
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" /> Goal date {fmtDate(plan.deadline)}
              </div>
            </div>
          )}
          {status && status.level !== "on-track" && status.advice && (
            <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-sm">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <span>
                About {status.weeksBehind} weeks behind. Options: {status.advice}.
              </span>
            </div>
          )}
          {data.finished && <p className="text-sm">{data.finishedText}</p>}
        </CardContent>
      </Card>

      {u && (
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
            <CardDescription>Current unit · {STATE[u.state] || u.state}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {u.canDo.length > 0 && (
              <Section icon={Target} title="After this unit you can">
                <List items={u.canDo} />
              </Section>
            )}
            <Separator />
            {u.grammar.length > 0 && (
              <Section icon={BookText} title="Grammar">
                <List items={u.grammar} />
              </Section>
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
      )}
    </div>
  );
}
