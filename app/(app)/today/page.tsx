"use client";

import { DayView } from "@/components/day-view";
import { todayKey } from "@/lib/dates";

export default function TodayPage() {
  return <DayView date={todayKey()} />;
}
