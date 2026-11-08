import { useEffect, useRef, useState } from "react";
import { ChevronRight, GraduationCap, Loader2, RotateCcw, SendHorizontal, Square, Wrench } from "lucide-react";
import { chatTurn } from "@/api.js";
import Markdown from "@/Markdown.jsx";
import LoginNotice from "@/components/LoginNotice.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// One coach session = one Claude Code session id, resumed with `--resume` for every turn.
// The view is kept in localStorage so a page reload doesn't lose the lesson.
function usePersisted(key, initial) {
  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(v));
  }, [key, v]);
  return [v, setV];
}

function appendEvent(turn, ev) {
  const parts = [...turn.parts];
  const last = parts.at(-1);
  if (ev.type === "delta" || ev.type === "text") {
    if (last?.kind === "text") parts[parts.length - 1] = { ...last, text: last.text + ev.text };
    else parts.push({ kind: "text", text: ev.text });
  } else if (ev.type === "block") {
    if (last?.kind === "text") parts.push({ kind: "text", text: "" });
  } else if (ev.type === "tool") {
    parts.push({ kind: "tool", name: ev.name, detail: ev.detail });
  } else if (ev.type === "audio") {
    if (!parts.some((p) => p.kind === "audio" && p.url === ev.url)) parts.push({ kind: "audio", url: ev.url, path: ev.path });
  }
  return { ...turn, parts };
}

/** Consecutive tool calls become one collapsed "N steps" row, so the lesson text stays in front. */
function groupParts(parts) {
  const out = [];
  for (const p of parts) {
    if (p.kind === "tool") {
      const last = out.at(-1);
      if (last?.kind === "tools") last.items.push(p);
      else out.push({ kind: "tools", items: [p] });
    } else out.push(p);
  }
  return out;
}

function Steps({ items, running }) {
  return (
    <details className="group my-1 text-xs text-muted-foreground">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 select-none hover:text-foreground">
        <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" />
        {running ? <Loader2 className="size-3.5 animate-spin" /> : <Wrench className="size-3.5" />}
        {items.length} {items.length === 1 ? "step" : "steps"}: {[...new Set(items.map((t) => t.name))].join(", ")}
      </summary>
      <ul className="mt-1 ml-5 space-y-0.5 border-l pl-3">
        {items.map((t, i) => (
          <li key={i} className="truncate" title={t.detail}>
            <span className="font-medium text-foreground/80">{t.name}</span>
            {t.detail && <span> · {t.detail}</span>}
          </li>
        ))}
      </ul>
    </details>
  );
}

const SUGGESTIONS = ["lernen", "I have 20 minutes", "Where am I in the course?", "Continue the placement"];

export default function Chat({ info, sendRef, onRecheck, onAuthProblem, next, onTurnDone }) {
  const scope = `${info.domain}|${info.dataRoot}`;
  const [turns, setTurns] = usePersisted(`lc-turns|${scope}`, []);
  const [sessionId, setSessionId] = usePersisted(`lc-session|${scope}`, null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const ctrl = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Block body on purpose: newer browsers return a Promise from scrollIntoView(),
  // and an effect must return nothing or a cleanup function.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  const updateLast = (fn) =>
    setTurns((ts) => {
      const copy = ts.slice(-200);
      copy[copy.length - 1] = fn(copy[copy.length - 1]);
      return copy;
    });

  function send(text) {
    const message = String(text ?? draft).trim();
    if (!message || busy) return;
    setDraft("");
    setNotice(null);
    setBusy(true);
    setTurns((ts) => [...ts.slice(-200), { role: "user", text: message }, { role: "coach", parts: [], status: "streaming" }]);
    ctrl.current = chatTurn({ message, sessionId }, (ev) => {
      if (ev.type === "session") setSessionId(ev.id);
      else if (ev.type === "done") {
        if (ev.sessionId) setSessionId(ev.sessionId);
        updateLast((t) => ({
          ...t,
          parts: ev.code === "not_logged_in" ? [] : t.parts, // the notice replaces the CLI's own one-liner
          status: ev.ok ? "done" : "error",
          error: ev.error,
          code: ev.code,
          loginCommand: ev.loginCommand,
          durationMs: ev.durationMs,
        }));
        if (ev.code === "not_logged_in") {
          setDraft(message); // nothing was sent to Claude: keep the message for after login
          onAuthProblem?.();
        }
        setBusy(false);
        onTurnDone?.();
      } else updateLast((t) => appendEvent(t, ev));
    });
  }
  sendRef.current = send;

  function newSession() {
    setSessionId(null);
    setTurns([]);
    setNotice("New session started. The coach starts a fresh conversation; your progress files are unchanged.");
    inputRef.current?.focus();
  }

  const canReset = !busy && (turns.length > 0 || sessionId);

  return (
    <section className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-5 py-2">
        <div className="text-sm text-muted-foreground">
          {sessionId ? "Lesson in progress" : "Ready when you are"}
        </div>
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* span: a disabled button gets no hover events, so the tooltip still explains why */}
              <span tabIndex={canReset ? -1 : 0}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!canReset}>
                    <RotateCcw />
                    New session
                  </Button>
                </AlertDialogTrigger>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">
              {busy
                ? "Wait for the coach to finish, or press Stop."
                : canReset
                  ? "Start a fresh conversation, e.g. for a new day. Long conversations get slower and use more of your Claude limits."
                  : "Nothing to reset yet: this is already a fresh session."}
            </TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start a new session?</AlertDialogTitle>
              <AlertDialogDescription>
                The coach starts a fresh conversation and this chat is cleared. Nothing you learned is lost: your profile,
                mistakes, course progress and placement are saved in your learner files, and the coach reads them again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep this session</AlertDialogCancel>
              <AlertDialogAction onClick={newSession}>Start new session</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 pb-4">
          {notice && (
            <div className="self-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{notice}</div>
          )}
          {turns.length === 0 && (
            <div className="mt-[12vh] flex flex-col items-center gap-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <GraduationCap className="size-6" />
              </span>
              <div>
                <div className="text-lg font-semibold">{next ? next.title : "What do you want to do?"}</div>
                <div className="mx-auto max-w-md text-sm text-muted-foreground">
                  {next ? next.body : "Talk to the coach like in the Claude app, or pick one:"}
                </div>
              </div>
              {next && (
                <Button size="lg" onClick={() => send(next.message)} disabled={busy}>
                  {next.label}
                  <SendHorizontal />
                </Button>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                {next && <span className="w-full text-xs text-muted-foreground">or</span>}
                {SUGGESTIONS.filter((s) => s !== next?.message).map((s) => (
                  <Button key={s} variant="outline" size="sm" className="rounded-full" onClick={() => send(s)} disabled={busy}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {turns.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-primary px-4 py-2 whitespace-pre-wrap text-primary-foreground">
                {t.text}
              </div>
            ) : (
              <div key={i} className="flex max-w-[92%] gap-3 self-start">
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <GraduationCap className="size-4" />
                </span>
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-2xl rounded-tl-md border bg-card px-4 py-2.5 shadow-xs",
                    t.status === "error" && "border-destructive/50",
                  )}
                >
                  {groupParts(t.parts).map((p, j, all) =>
                    p.kind === "text" ? (
                      p.text ? (
                        <div key={j} className="md">
                          <Markdown text={p.text} />
                        </div>
                      ) : null
                    ) : p.kind === "audio" ? (
                      <audio key={j} controls preload="auto" src={p.url} className="my-2 h-10 w-full" />
                    ) : (
                      <Steps key={j} items={p.items} running={t.status === "streaming" && j === all.length - 1} />
                    ),
                  )}
                  {t.status === "streaming" && t.parts.length === 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" /> Thinking…
                    </div>
                  )}
                  {t.status === "error" &&
                    (t.code === "not_logged_in" ? (
                      <LoginNotice command={t.loginCommand} onRecheck={onRecheck} />
                    ) : (
                      <div className="text-sm text-destructive">{t.error}</div>
                    ))}
                </div>
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>
      </div>

      <form
        className="border-t px-5 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Your answer or message…  (Enter sends, Shift+Enter for a new line)"
            rows={2}
            className="max-h-48 min-h-11 resize-none"
            autoFocus
            spellCheck={false}
            lang="de"
          />
          {busy ? (
            <Button type="button" variant="destructive" size="icon-lg" onClick={() => ctrl.current?.abort()} aria-label="Stop">
              <Square />
            </Button>
          ) : (
            <Button type="submit" size="icon-lg" disabled={!draft.trim()} aria-label="Send">
              <SendHorizontal />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
