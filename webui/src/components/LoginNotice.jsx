import { useState } from "react";
import { Check, Copy, KeyRound, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Shown when the local Claude Code CLI has no login. The UI never logs in for you:
// you run the command once in your own terminal (browser sign-in with your Claude subscription).
export default function LoginNotice({ command, onRecheck }) {
  const [copied, setCopied] = useState(false);
  const cmd = command || "claude auth login";
  return (
    <Alert className="border-amber-500/40">
      <KeyRound />
      <AlertTitle>Claude CLI not logged in</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          The chat needs the local Claude Code CLI signed in with your Claude subscription. Run this once in your own
          terminal (PowerShell), then click “Check again”:
        </p>
        <pre className="overflow-x-auto rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs text-foreground select-all">{cmd}</pre>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(cmd);
              setCopied(true);
            }}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy command"}
          </Button>
          {onRecheck && (
            <Button size="sm" onClick={onRecheck}>
              <RefreshCw />
              Check again
            </Button>
          )}
          <span className="text-xs">The side panels work without it.</span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
