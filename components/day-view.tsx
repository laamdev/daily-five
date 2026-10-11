"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ActivityCard } from "@/components/activity-card";
import { celebrate } from "@/components/badge-icon";
import { JournalEditor } from "@/components/journal-editor";
import { ProgressRing } from "@/components/progress-ring";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, CATEGORY_IDS, emptyActivities, type CategoryId } from "@/lib/categories";
import { addDays, formatDay, todayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const MESSAGES = [
  "Five small things. Start anywhere.",
  "A good start.",
  "A good start.",
  "Over halfway there.",
  "Almost there.",
  "All five. What a day.",
];

export function dayHref(date: string, today: string) {
  return date === today ? "/today" : `/day/${date}`;
}

export function DayView({ date }: { date: string }) {
  const today = todayKey();
  const data = useQuery(api.days.get, { date });
  const setActivity = useMutation(api.days.setActivity);
  const toggleActivity = useMutation(api.days.toggleActivity).withOptimisticUpdate(
    (store, { date, category }) => {
      const current = store.getQuery(api.days.get, { date });
      if (!current) return;
      const base = current.day ?? {
        activities: emptyActivities(),
        doneCount: 0,
        journal: "",
        journalShared: false,
      };
      const activities = {
        ...base.activities,
        [category]: { ...base.activities[category], done: !base.activities[category].done },
      };
      const doneCount = CATEGORY_IDS.filter((c) => activities[c].done).length;
      store.setQuery(api.days.get, { date }, { ...current, day: { ...base, activities, doneCount } });
    },
  );

  const isToday = date === today;
  const activities = data?.day?.activities ?? emptyActivities();
  const doneCount = data?.day?.doneCount ?? 0;

  async function handleToggle(category: CategoryId, draft: { title: string; description: string }) {
    const saved = activities[category];
    if (draft.title.trim() !== saved.title || draft.description.trim() !== saved.description) {
      void setActivity({ date, category, ...draft });
    }
    const res = await toggleActivity({ date, category });
    celebrate(res.newBadges);
  }

  return (
    <div>
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="-ml-2 flex items-center text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            <Link
              href={dayHref(addDays(date, -1), today)}
              aria-label="Previous day"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "rounded-full")}
            >
              <ChevronLeft />
            </Link>
            <span className="px-1">{isToday ? "Today" : formatDay(date, { weekday: "long" })}</span>
            {isToday ? (
              <span className="size-7" />
            ) : (
              <Link
                href={dayHref(addDays(date, 1), today)}
                aria-label="Next day"
                className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "rounded-full")}
              >
                <ChevronRight />
              </Link>
            )}
          </div>
          <h1 className="mt-1 font-serif text-5xl leading-none tracking-tight">
            {formatDay(date, { month: "long", day: "numeric" })}
          </h1>
          <p className="mt-3 font-serif text-lg text-muted-foreground italic">
            {MESSAGES[doneCount]}
            {!isToday && (
              <Link
                href="/today"
                className="ml-2 font-sans text-xs not-italic underline underline-offset-4 hover:text-foreground"
              >
                Back to today
              </Link>
            )}
          </p>
        </div>
        <ProgressRing activities={data?.day?.activities ?? null} size={72} />
      </header>

      {data === undefined ? (
        <div className="mt-8 space-y-4">
          {CATEGORIES.map((c) => (
            <Skeleton key={c.id} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <>
          <ul className="mt-6">
            {CATEGORIES.map((c) => (
              <ActivityCard
                key={`${date}-${c.id}`}
                category={c}
                activity={activities[c.id]}
                lastTitle={data?.lastTitles[c.id]}
                onToggle={(draft) => handleToggle(c.id, draft)}
                onSave={(draft) => setActivity({ date, category: c.id, ...draft })}
              />
            ))}
          </ul>
          <JournalEditor
            key={date}
            date={date}
            journal={data?.day?.journal ?? ""}
            shared={data?.day?.journalShared ?? false}
            hasPartner={data?.hasPartner ?? false}
          />
        </>
      )}
    </div>
  );
}
