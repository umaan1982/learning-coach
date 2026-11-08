import { Component, useEffect, useRef, useState } from "react";
import { BarChart3, BookOpen, GraduationCap, Headphones, Maximize2, Minimize2, PenLine } from "lucide-react";
import { api } from "@/api.js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Chat from "@/components/Chat.jsx";
import Course from "@/components/Course.jsx";
import CTest from "@/components/CTest.jsx";
import Dashboard from "@/components/Dashboard.jsx";
import Listen from "@/components/Listen.jsx";
import LoginNotice from "@/components/LoginNotice.jsx";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "course", label: "Course", icon: BookOpen },
  { id: "ctest", label: "C-test", icon: PenLine },
  { id: "listen", label: "Listen", icon: Headphones },
  { id: "progress", label: "Progress", icon: BarChart3 },
];

// Keeps a bug in one pane from blanking the whole page.
class Boundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Alert variant="destructive" className="m-4 w-auto">
        <AlertTitle>{this.props.name} stopped working</AlertTitle>
        <AlertDescription>
          {String(this.state.error.message || this.state.error)}
          <Button size="sm" variant="outline" className="mt-2" onClick={() => this.setState({ error: null })}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
}

function ClaudeStatus({ c }) {
  const ok = c.bin && c.loggedIn;
  const label = !c.bin ? "Claude CLI not found" : c.loggedIn ? "Claude connected" : "Claude not signed in";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="gap-1.5">
          <span className={cn("size-2 rounded-full", ok ? "bg-emerald-500" : "bg-amber-500")} />
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {c.bin ? `Claude Code ${c.version?.split(" ")[0] || ""} · uses your Claude subscription` : "Install Claude Code or set CLAUDE_BIN"}
      </TooltipContent>
    </Tooltip>
  );
}

export default function App() {
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState(() => localStorage.getItem("lc-tab") || "course");
  const [wide, setWide] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const sendRef = useRef(() => {});

  const recheck = () => api.info().then(setInfo).catch((e) => setErr(e.message));
  useEffect(() => {
    recheck();
  }, []);
  useEffect(() => {
    localStorage.setItem("lc-tab", tab);
  }, [tab]);

  if (err) return <div className="p-8 text-destructive">Can't reach the local server: {err}</div>;
  if (!info) return <div className="p-8 text-muted-foreground">Starting…</div>;

  const c = info.claude;
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b px-5 py-2.5">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          Learning coach
        </div>
        <Badge variant="secondary">{info.domain}</Badge>
        {info.sandbox && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">Sandbox data</Badge>
            </TooltipTrigger>
            <TooltipContent>Throwaway practice data: {info.dataRoot}</TooltipContent>
          </Tooltip>
        )}
        <div className="flex-1" />
        <ClaudeStatus c={c} />
      </header>

      {!c.bin && (
        <Alert className="rounded-none border-x-0 border-t-0">
          <AlertTitle>Claude Code CLI not found</AlertTitle>
          <AlertDescription>
            Install it (code.claude.com/docs/en/setup) or set CLAUDE_BIN, then restart. The side panels work without it.
          </AlertDescription>
        </Alert>
      )}
      {c.bin && !c.loggedIn && (
        <div className="border-b p-3">
          <LoginNotice command={c.loginCommand} onRecheck={recheck} />
        </div>
      )}

      <main
        className={cn(
          "grid min-h-0 flex-1",
          wide ? "grid-cols-[minmax(0,1fr)_minmax(500px,58%)]" : "grid-cols-[minmax(0,1fr)_500px]",
        )}
      >
        <Boundary name="Chat">
          <Chat info={info} sendRef={sendRef} onRecheck={recheck} onAuthProblem={recheck} />
        </Boundary>

        <aside className="flex min-h-0 flex-col border-l bg-muted/30">
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col gap-0">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <TabsList>
                {TABS.map(({ id, label, icon: Icon }) => (
                  <TabsTrigger key={id} value={id} className="gap-1.5 px-2.5">
                    <Icon className="size-3.5" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setWide((w) => !w)}>
                    {wide ? <Minimize2 /> : <Maximize2 />}
                    {wide ? "Smaller" : "Bigger"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{wide ? "Give the chat more room" : "Give this panel more room"}</TooltipContent>
              </Tooltip>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Boundary name={tab} key={tab}>
                <TabsContent value="course" className="m-0">
                  <Course refreshKey={refreshKey} />
                </TabsContent>
                <TabsContent value="ctest" className="m-0">
                  <CTest
                    sendToCoach={(m) => {
                      sendRef.current(m);
                      setRefreshKey((k) => k + 1);
                    }}
                  />
                </TabsContent>
                <TabsContent value="listen" className="m-0">
                  <Listen />
                </TabsContent>
                <TabsContent value="progress" className="m-0 h-full">
                  <Dashboard refreshKey={refreshKey} />
                </TabsContent>
              </Boundary>
            </div>
          </Tabs>
        </aside>
      </main>
    </div>
  );
}
