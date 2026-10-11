import { HistoryView } from "./history-view";

// Rendered client-side once auth has loaded; opt out of instant-navigation validation.
export const instant = false;

export default function HistoryPage() {
  return <HistoryView />;
}
