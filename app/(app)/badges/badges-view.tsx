"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { BadgeIcon } from "@/components/badge-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { todayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function BadgesView() {
  const data = useQuery(api.badges.list, { today: todayKey() });

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </div>
    );
  }

  const earned = data.badges.filter((b) => b.earnedAt).length;
  const personal = data.badges.filter((b) => !b.couple);
  const couple = data.badges.filter((b) => b.couple);

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Badges</p>
      <h1 className="mt-1 font-serif text-5xl leading-none tracking-tight">
        {earned} <span className="text-muted-foreground">of {data.badges.length}</span>
      </h1>

      <dl className="mt-6 grid grid-cols-3 divide-x divide-border rounded-2xl border">
        {[
          ["Current streak", data.stats.currentStreak, "perfect days"],
          ["Best streak", data.stats.bestStreak, "perfect days"],
          ["Activities", data.stats.totalDone, "all time"],
        ].map(([label, value, hint]) => (
          <div key={label} className="px-4 py-3">
            <dt className="text-[11px] text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 font-serif text-3xl tabular-nums">{value}</dd>
            <dd className="text-[11px] text-muted-foreground/70">{hint}</dd>
          </div>
        ))}
      </dl>

      <BadgeGrid title="Yours" badges={personal} />
      <BadgeGrid
        title="Together"
        subtitle={data.hasPartner ? undefined : "Link up with your partner in the Us tab to unlock these."}
        badges={couple}
      />
    </div>
  );
}

type BadgeView = NonNullable<FunctionReturnType<typeof api.badges.list>>["badges"][number];

function BadgeGrid({ title, subtitle, badges }: { title: string; subtitle?: string; badges: BadgeView[] }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((b) => {
          const earned = b.earnedAt !== null;
          return (
            <li
              key={b.id}
              className={cn(
                "flex flex-col rounded-2xl border p-4 transition-colors",
                earned ? "bg-card" : "border-dashed",
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-full",
                  earned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground/60",
                )}
              >
                <BadgeIcon icon={b.icon} className="size-5" />
              </span>
              <p className={cn("mt-3 font-medium", !earned && "text-muted-foreground")}>{b.name}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{b.description}</p>
              <div className="mt-auto pt-3">
                {earned ? (
                  <p className="text-[11px] text-muted-foreground">
                    Earned{" "}
                    {new Date(b.earnedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/40"
                        style={{ width: `${(b.current / b.target) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {b.current}/{b.target}
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
