import { TodayView } from "./today-view";

// Rendered client-side once auth has loaded; opt out of instant-navigation validation.
export const instant = false;

export default function TodayPage() {
  return <TodayView />;
}
