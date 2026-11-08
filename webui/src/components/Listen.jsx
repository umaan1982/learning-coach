import { useState } from "react";
import { AudioLines, Headphones, Loader2 } from "lucide-react";
import { api, audioUrl } from "@/api.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Text -> MP3 through scripts/speak.py (edge-tts, needs internet). No AI involved.
// The coach's own listening blocks show their audio inline in the chat instead.
const SPEEDS = [
  { value: "both", label: "Slow, then normal speed" },
  { value: "normal", label: "Normal speed" },
  { value: "slow", label: "Slow" },
];

export default function Listen() {
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState("both");
  const [clips, setClips] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function make(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const r = await api.speak(text, speed);
      setClips((c) => [{ text, speed, url: audioUrl(r.path) }, ...c].slice(0, 10));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 p-4">
      <Card>
        <form onSubmit={make}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="size-4" /> Listen
            </CardTitle>
            <CardDescription>
              Hear any German sentence spoken by a natural voice. It reads your text as written; it doesn't translate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            <Textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              lang="de"
              spellCheck={false}
              placeholder="Ich habe gestern mit meinem Freund gesprochen."
            />
            <Select value={speed} onValueChange={setSpeed}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPEEDS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err && <p className="text-sm text-destructive">{err}</p>}
          </CardContent>
          <CardFooter className="pt-3">
            <Button type="submit" disabled={busy || !text.trim()}>
              {busy ? <Loader2 className="animate-spin" /> : <AudioLines />}
              {busy ? "Creating audio…" : "Create audio"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {clips.map((c, i) => (
        <Card key={c.url} size="sm">
          <CardContent className="space-y-2">
            <audio controls src={c.url} autoPlay={i === 0} className="h-10 w-full" />
            <p className="text-sm text-muted-foreground" lang="de">
              {c.text}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
