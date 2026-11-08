import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Records from the microphone in the browser, uploads to the local server, which saves it in
// <data>/<domain>/recordings/ and transcribes it offline (faster-whisper). Nothing leaves this computer.

const TYPES = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm", "audio/mp4"];

function micError(e) {
  if (e?.name === "NotAllowedError")
    return "Microphone blocked. Allow it for this page in your browser (the microphone or lock icon in the address bar), then try again.";
  if (e?.name === "NotFoundError") return "No microphone found. Plug one in or check your system sound settings.";
  return `Microphone error: ${e?.message || e}`;
}

export default function MicButton({ disabled, onResult, onError }) {
  const [state, setState] = useState("idle"); // idle | recording | processing
  const [secs, setSecs] = useState(0);
  const rec = useRef(null);
  const chunks = useRef([]);
  const cancelled = useRef(false);

  useEffect(() => {
    if (state !== "recording") return;
    const t0 = Date.now();
    const id = setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 250);
    const onKey = (e) => e.key === "Escape" && cancel();
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [state]);

  async function start() {
    onError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mimeType = TYPES.find((t) => window.MediaRecorder?.isTypeSupported?.(t));
      const r = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunks.current = [];
      cancelled.current = false;
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (cancelled.current) return setState("idle");
        setState("processing");
        const blob = new Blob(chunks.current, { type: r.mimeType || "audio/webm" });
        try {
          const res = await fetch("/api/recording", {
            method: "POST",
            headers: { "content-type": blob.type.split(";")[0] },
            body: blob,
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || res.statusText);
          onResult({ ...data, url: `/api/file?path=${encodeURIComponent(data.path)}` });
        } catch (e) {
          onError(String(e.message || e));
        } finally {
          setState("idle");
        }
      };
      rec.current = r;
      r.start();
      setSecs(0);
      setState("recording");
    } catch (e) {
      onError(micError(e));
      setState("idle");
    }
  }

  const stop = () => rec.current?.state === "recording" && rec.current.stop();
  function cancel() {
    cancelled.current = true;
    stop();
  }

  if (state === "recording") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-sm text-red-600 tabular-nums dark:text-red-400">
          <span className="size-2 animate-pulse rounded-full bg-red-500" />
          {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon-lg" onClick={cancel} aria-label="Cancel recording">
              <X />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancel (Esc)</TooltipContent>
        </Tooltip>
        <Button type="button" size="lg" onClick={stop} className="bg-red-600 text-white hover:bg-red-600/90">
          <Square className="fill-current" />
          Done
        </Button>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          disabled={disabled || state === "processing"}
          onClick={start}
          aria-label="Speak your answer"
          className={cn(state === "processing" && "cursor-wait")}
        >
          {state === "processing" ? <Loader2 className="animate-spin" /> : <Mic />}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        {state === "processing"
          ? "Turning your speech into text (offline)…"
          : "Speak your answer. It's turned into text on this computer, and the coach can also check your pronunciation."}
      </TooltipContent>
    </Tooltip>
  );
}
