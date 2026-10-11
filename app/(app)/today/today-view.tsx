"use client";

import { DayView } from "@/components/day-view";
import { todayKey } from "@/lib/dates";

export function TodayView() {
  return <DayView date={todayKey()} />;
}
