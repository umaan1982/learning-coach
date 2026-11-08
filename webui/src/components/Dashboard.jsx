import { useRef, useState } from "react";
import { BarChart3, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// The page from `dashboard.py`, rebuilt on every load and embedded as-is.
// The frame takes the height of the page inside it (same origin), so there's no empty
// area below the charts; the side panel scrolls instead.
export default function Dashboard({ refreshKey }) {
  const [n, setN] = useState(0);
  const [height, setHeight] = useState(480);
  const frame = useRef(null);
  const src = `/api/dashboard?k=${refreshKey}-${n}`;

  const fit = () => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    const measure = () => setHeight(Math.max(200, doc.documentElement.scrollHeight));
    measure();
    // charts and fonts can settle a moment later
    setTimeout(measure, 300);
    new ResizeObserver(measure).observe(doc.body);
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-4" />
        <span className="font-medium">Progress</span>
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => setN((x) => x + 1)} aria-label="Refresh">
              <RefreshCw />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rebuild from your latest data</TooltipContent>
        </Tooltip>
        <Button variant="outline" size="sm" asChild>
          <a href={src} target="_blank" rel="noreferrer">
            <ExternalLink />
            Open full page
          </a>
        </Button>
      </div>
      <iframe
        ref={frame}
        title="Progress dashboard"
        src={src}
        onLoad={fit}
        style={{ height }}
        className="w-full overflow-hidden rounded-xl border"
        scrolling="no"
      />
    </div>
  );
}
