import { useState } from "react";
import { Check, ChevronDown, Pencil, UserPlus } from "lucide-react";
import { api } from "@/api.js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Who is learning? Each learner has their own data folder on the server (learners.js);
// the choice is a cookie, so every request (also the dashboard frame and audio) uses it.
// Colour by position in the list, so every learner on this computer gets a different one.
const COLORS = ["bg-sky-600", "bg-rose-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600", "bg-teal-600"];
let ORDER = [];
const colorOf = (id) => COLORS[Math.max(0, ORDER.indexOf(id)) % COLORS.length];

export function switchTo(id) {
  document.cookie = `lc_learner=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Strict`;
  location.reload(); // everything (chat, plan, C-test, dashboard) reloads for this learner
}

function Avatar({ l, className }) {
  return (
    <span className={cn("flex size-6 items-center justify-center rounded-full text-xs font-semibold text-white", colorOf(l.id), className)}>
      {l.name.charAt(0).toUpperCase()}
    </span>
  );
}

function NameDialog({ open, onOpenChange, title, description, initial = "", action, onSubmit }) {
  const [name, setName] = useState(initial);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) {
          setName(initial);
          setErr(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr(null);
            try {
              await onSubmit(name);
            } catch (x) {
              setErr(x.message);
              setBusy(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="learner-name">Name</Label>
            <Input id="learner-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={40} />
            {err && <p className="text-sm text-destructive">{err}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy || !name.trim()}>
              {action}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function LearnerSwitcher({ learner, learners, busy }) {
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState(false);
  ORDER = learners.map((l) => l.id);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="shrink-0 gap-2 pl-1" disabled={busy}>
            <Avatar l={learner} className="size-5" />
            {learner.name}
            <ChevronDown className="opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Who's learning?</DropdownMenuLabel>
          {learners.map((l) => (
            <DropdownMenuItem key={l.id} onSelect={() => l.id !== learner.id && switchTo(l.id)} className="gap-2">
              <Avatar l={l} />
              <span className="flex-1">{l.name}</span>
              {l.id === learner.id && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setAdding(true)} className="gap-2">
            <UserPlus className="size-4" />
            Add learner…
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setRenaming(true)} className="gap-2">
            <Pencil className="size-4" />
            Rename {learner.name}…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NameDialog
        open={adding}
        onOpenChange={setAdding}
        title="Add a learner"
        description="They get their own placement test, plan, progress and chat. Each learner's data is kept separate, and the coach can't see the other learners' files."
        action="Add and switch"
        onSubmit={async (name) => {
          const l = await api.addLearner(name);
          switchTo(l.id);
        }}
      />
      <NameDialog
        open={renaming}
        onOpenChange={setRenaming}
        title={`Rename ${learner.name}`}
        description="Only the name changes; progress and data stay as they are."
        initial={learner.name}
        action="Save"
        onSubmit={async (name) => {
          await api.renameLearner(learner.id, name);
          location.reload();
        }}
      />
    </>
  );
}
