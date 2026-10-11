import { DayPageView } from "./day-view";

// Rendered client-side once auth has loaded; opt out of instant-navigation validation.
export const instant = false;

export default function DayPage({ params }: PageProps<"/day/[date]">) {
  return <DayPageView params={params} />;
}
