"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { dayHref } from "@/components/day-view";
import { Button } from "@/components/ui/button";
import { addDays, formatDay, parseDateKey, todayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const SHADES = [
  "text-muted-foreground",
  "bg-foreground/10",
  "bg-foreground/20",
  "bg-foreground/35",
  "bg-foreground/55 text-background",
  "bg-foreground text-background",
];

function shiftMonth(month: string, n: number) {
  const d = parseDateKey(`${month}-01`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
}

export function HistoryView() {
  const today = todayKey();
  const [month, setMonth] = useState(today.slice(0, 7));
  const from = `${month}-01`;
  const to = addDays(`${shiftMonth(month, 1)}-01`, -1);
  const days = useQuery(api.days.range, { from, to });

  const byDate = new Map((days ?? []).map((d) => [d.date, d]));
  const leading = (parseDateKey(from).getUTCDay() + 6) % 7;
  const count = Number(to.slice(8));
  const dates = Array.from({ length: count }, (_, i) => addDays(from, i));

  const perfect = (days ?? []).filter((d) => d.doneCount === 5).length;
  const total = (days ?? []).reduce((sum, d) => sum + d.doneCount, 0);
  const journals = (days ?? []).filter((d) => d.hasJournal).length;
  const isCurrentMonth = month === today.slice(0, 7);

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">History</p>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="font-serif text-5xl leading-none tracking-tight">
          {formatDay(from, { month: "long" })}{" "}
          <span className="text-muted-foreground">{month.slice(0, 4)}</span>
        </h1>
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Previous month"
            onClick={() => setMonth(shiftMonth(month, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Next month"
            disabled={isCurrentMonth}
            onClick={() => setMonth(shiftMonth(month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 divide-x divide-border rounded-2xl border">
        {[
          ["Perfect days", perfect],
          ["Activities", total],
          ["Journal entries", journals],
        ].map(([label, value]) => (
          <div key={label} className="px-4 py-3">
            <dt className="text-[11px] text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 font-serif text-3xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid grid-cols-7 gap-1.5 text-center sm:gap-2">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="pb-1 text-[11px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {Array.from({ length: leading }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {dates.map((date) => {
          const info = byDate.get(date);
          const future = date > today;
          const cell = (
            <span
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-full text-sm tabular-nums transition-colors",
                future ? "text-muted-foreground/40" : SHADES[info?.doneCount ?? 0],
                date === today && "ring-1 ring-foreground/50 ring-offset-2 ring-offset-background",
              )}
            >
              {Number(date.slice(8))}
              {info?.hasJournal && (
                <span className="absolute bottom-[14%] size-1 rounded-full bg-current opacity-70" />
              )}
            </span>
          );
          return future ? (
            <div key={date}>{cell}</div>
          ) : (
            <Link
              key={date}
              href={dayHref(date, today)}
              aria-label={`${formatDay(date, { month: "long", day: "numeric" })}: ${info?.doneCount ?? 0} of 5`}
              className="rounded-full hover:opacity-80"
            >
              {cell}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        Less
        {SHADES.slice(1).map((s, i) => (
          <span key={i} className={cn("size-3 rounded-full", s)} />
        ))}
        More
        <span className="ml-3 inline-flex items-center gap-1">
          <span className="size-1 rounded-full bg-current" /> journal
        </span>
      </div>
    </div>
  );
}
