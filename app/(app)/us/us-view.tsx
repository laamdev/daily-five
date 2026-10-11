"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { BadgeIcon } from "@/components/badge-icon";
import { CATEGORY_STYLES } from "@/components/category-dot";
import { ProgressRing } from "@/components/progress-ring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { BADGE_BY_ID } from "@/lib/badges";
import { CATEGORIES, type Activities } from "@/lib/categories";
import { todayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

function errorMessage(err: unknown) {
  return err instanceof ConvexError ? String(err.data) : "Something went wrong";
}

export function UsView() {
  const couple = useQuery(api.couples.mine);

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Us</p>
      {couple === undefined ? (
        <Skeleton className="mt-2 h-40 w-full" />
      ) : couple === null ? (
        <LinkUp />
      ) : couple.members.length < 2 ? (
        <WaitingForPartner code={couple.inviteCode} />
      ) : (
        <Together />
      )}
    </div>
  );
}

function LinkUp() {
  const create = useMutation(api.couples.create);
  const join = useMutation(api.couples.join);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="mt-1 font-serif text-5xl leading-none tracking-tight">
        Better <span className="italic">together</span>
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Link your account with your partner&apos;s to see the badges you each earn and unlock a few
        together. Your checklists and journal stay private unless you choose to share them.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col rounded-2xl border p-5">
          <h2 className="font-medium">Start a shared space</h2>
          <p className="mt-1 text-sm text-muted-foreground">You&apos;ll get a code to send your partner.</p>
          <Button className="mt-5 h-10 self-start px-4" disabled={busy} onClick={() => run(() => create())}>
            Create space
          </Button>
        </div>
        <form
          className="flex flex-col rounded-2xl border p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) run(() => join({ code }));
          }}
        >
          <h2 className="font-medium">Have a code?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter the code your partner shared.</p>
          <div className="mt-5 flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              aria-label="Invite code"
              className="h-10 font-mono tracking-[0.3em] uppercase"
            />
            <Button type="submit" variant="outline" className="h-10 px-4" disabled={busy || code.length < 6}>
              Join
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

function WaitingForPartner({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <h1 className="mt-1 font-serif text-5xl leading-none tracking-tight">
        Waiting for <span className="italic">you two</span>
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Send this code to your partner. Once they join from their Us tab, you&apos;ll see each
        other&apos;s days here.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <span className="rounded-2xl border bg-card px-6 py-4 font-mono text-3xl tracking-[0.35em]">
          {code}
        </span>
        <Button variant="ghost" size="icon-lg" className="rounded-full" onClick={copy} aria-label="Copy code">
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
      <LeaveSpace />
    </>
  );
}

function Together() {
  const today = todayKey();
  const me = useQuery(api.users.me);
  const partner = useQuery(api.couples.partnerDay, { date: today });
  const partnerBadges = useQuery(api.couples.partnerBadges);
  const setShareChecklist = useMutation(api.users.setShareChecklist);

  if (!me || !partner || partnerBadges === undefined) {
    return <Skeleton className="mt-2 h-80 w-full" />;
  }

  const name = partner.partner.name;

  return (
    <>
      <h1 className="mt-1 font-serif text-5xl leading-none tracking-tight">
        {me.name} <span className="text-muted-foreground italic">&amp;</span> {name}
      </h1>
      <p className="mt-3 font-serif text-lg text-muted-foreground italic">
        {partner.sharesChecklist
          ? `${name} has done ${partner.checklist?.doneCount ?? 0} of 5 today.`
          : "Your days are your own. Badges are what you share."}
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-3xl">{name}&apos;s badges</h2>
        {partnerBadges && partnerBadges.length > 0 ? (
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {partnerBadges.map((b) => {
              const badge = BADGE_BY_ID[b.badgeId];
              if (!badge) return null;
              return (
                <li key={b.badgeId} className="flex flex-col items-center rounded-2xl border bg-card p-3 text-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BadgeIcon icon={badge.icon} className="size-5" />
                  </span>
                  <p className="mt-2 text-sm leading-tight font-medium">{badge.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(b.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No badges yet. The first one comes with the first check.</p>
        )}
      </section>

      {partner.sharesChecklist && (
        <section className="mt-10">
          <h2 className="font-serif text-3xl">{name}&apos;s day</h2>
          <div className="mt-4">
            <PersonCard
              name={name}
              imageUrl={partner.partner.imageUrl}
              activities={partner.checklist?.activities ?? null}
            />
          </div>
        </section>
      )}

      {partner.journal && (
        <section className="mt-10">
          <h2 className="font-serif text-3xl">{name}&apos;s journal</h2>
          <blockquote className="mt-4 border-l-2 border-border pl-5 font-serif text-xl leading-relaxed whitespace-pre-wrap">
            {partner.journal}
          </blockquote>
        </section>
      )}

      <section className="mt-10 rounded-2xl border p-5">
        <h2 className="font-medium">Your sharing</h2>
        <label className="mt-3 flex items-center justify-between gap-4 text-sm">
          <span>
            Share my daily checklist
            <span className="block text-xs text-muted-foreground">
              {me.shareChecklist
                ? `${name} can see your activities and progress each day.`
                : `${name} only sees the badges you earn.`}
            </span>
          </span>
          <Switch
            checked={me.shareChecklist}
            onCheckedChange={(checked) => setShareChecklist({ share: checked })}
          />
        </label>
        <p className="mt-4 text-xs text-muted-foreground">
          Journal entries stay private too. You can share a single day&apos;s entry from the Today page.
        </p>
      </section>

      <LeaveSpace />
    </>
  );
}

function PersonCard({
  name,
  imageUrl,
  activities,
}: {
  name: string;
  imageUrl?: string;
  activities: Activities | null;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={imageUrl} alt="" />
            <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
        <ProgressRing activities={activities} size={44} />
      </div>
      <ul className="mt-4 space-y-2.5">
        {CATEGORIES.map((c) => {
          const a = activities?.[c.id];
          return (
            <li key={c.id} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  CATEGORY_STYLES[c.id].border,
                  a?.done && CATEGORY_STYLES[c.id].bg,
                )}
              >
                {a?.done && <Check className="size-2.5 text-background" strokeWidth={3.5} />}
              </span>
              <span className={cn("truncate", !a?.title && "text-muted-foreground/60")}>
                {a?.title || c.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LeaveSpace() {
  const leave = useMutation(api.couples.leave);
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-16 border-t pt-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Leave shared space
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave shared space?</DialogTitle>
            <DialogDescription>
              Your activities, journal and badges stay with you. You can link up again later with a
              new code.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await leave();
                setOpen(false);
              }}
            >
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
