import { Gauge, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Your Claude subscription's usage, as the CLI reported it on the last coach reply
// (it only updates when a turn runs, so it's labelled "as of").
export const SAVE_AND_PAUSE = "Usage is nearly used up: log this session now so I can continue later.";

export const fmtReset = (unix) => {
  if (!unix) return "";
  const d = new Date(unix * 1000);
  const t = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === new Date().toDateString() ? t : `${d.toLocaleDateString([], { weekday: "short" })} ${t}`;
};
const pct = (w) => (w ? Math.round(100 * (w.utilization || 0)) : null);

// "allowed_warning" (past ~90%) still works; anything not starting with "allowed" is blocked.
export const isBlocked = (u) => !!u && !String(u.status || "allowed").startsWith("allowed");

export function usageLevel(u) {
  if (!u) return "unknown";
  const five = u.fiveHour?.utilization ?? 0;
  const week = u.sevenDay?.utilization ?? 0;
  if (isBlocked(u) || five >= 0.95 || week >= 0.95) return "red";
  if (five >= 0.8 || week >= 0.8) return "amber";
  return "ok";
}

export default function UsageMeter({ usage, onSaveAndPause, busy }) {
  if (!usage) return null;
  const level = usageLevel(usage);
  const five = usage.fiveHour;
  const week = usage.sevenDay;
  const asOf = new Date(usage.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const label =
    level === "red"
      ? isBlocked(usage)
        ? `Limit reached · resets ${fmtReset(five?.resetsAt || usage.resetsAt)}`
        : "Almost at your limit"
      : level === "amber"
        ? "Near your limit: finish this step"
        : null;

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 tabular-nums",
              level === "amber" && "border-amber-500/50 text-amber-700 dark:text-amber-400",
              level === "red" && "border-red-500/50 text-red-700 dark:text-red-400",
            )}
          >
            <Gauge className="size-3" />
            {label && <span className="hidden xl:inline">{label} · </span>}5-hour {pct(five) ?? "?"}%{five?.resetsAt ? ` · resets ${fmtReset(five.resetsAt)}` : ""}
            {week ? ` · week ${pct(week)}%` : ""}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-72">
          Your Claude subscription's usage, as of {asOf} (it updates after each coach reply). The 5-hour window resets at{" "}
          {fmtReset(five?.resetsAt) || "?"}; the weekly one at {fmtReset(week?.resetsAt) || "?"}. Your progress is saved in your
          learner files, so if the limit is reached you can continue after the reset.
        </TooltipContent>
      </Tooltip>
      {level !== "ok" && !isBlocked(usage) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onSaveAndPause} disabled={busy}>
              <Save />
              Save &amp; pause
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">Asks the coach to log this session to your files now, so you can stop and continue later.</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
