import { useState } from "react";
import { BarChart3, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// The page from `dashboard.py`, rebuilt on every load and embedded as-is.
export default function Dashboard({ refreshKey }) {
  const [n, setN] = useState(0);
  const src = `/api/dashboard?k=${refreshKey}-${n}`;
  return (
    <div className="flex h-full flex-col gap-3 p-4">
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
      <iframe title="Progress dashboard" src={src} className="min-h-[520px] w-full flex-1 rounded-xl border bg-white" />
    </div>
  );
}
