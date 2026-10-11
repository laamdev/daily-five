"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DayView } from "@/components/day-view";
import { isDateKey, todayKey } from "@/lib/dates";

export function DayPageView({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);
  if (!isDateKey(date)) notFound();

  if (date > todayKey()) {
    return (
      <div className="py-16 text-center">
        <p className="font-serif text-3xl">One day at a time.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This day hasn&apos;t happened yet.{" "}
          <Link href="/today" className="underline underline-offset-4">
            Back to today
          </Link>
        </p>
      </div>
    );
  }

  return <DayView date={date} />;
}
