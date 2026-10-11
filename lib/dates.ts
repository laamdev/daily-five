// Days are stored as "YYYY-MM-DD" strings in the user's local time zone.
// Arithmetic happens in UTC so it never shifts across DST changes.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = parseDateKey(value);
  return !Number.isNaN(d.getTime()) && toDateKey(d) === value;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(key: string, n: number): string {
  const d = parseDateKey(key);
  d.setUTCDate(d.getUTCDate() + n);
  return toDateKey(d);
}

/** Today in the browser's local time zone. */
export function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDay(key: string, opts: Intl.DateTimeFormatOptions) {
  return parseDateKey(key).toLocaleDateString("en-US", {
    ...opts,
    timeZone: "UTC",
  });
}

/** Length of the longest run of consecutive dates in a sorted list. */
export function longestRun(sortedKeys: string[]): number {
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of sortedKeys) {
    run = prev !== null && addDays(prev, 1) === key ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
  }
  return best;
}

/** Consecutive dates ending at `today` (or yesterday, so a streak survives until the day is over). */
export function currentRun(keys: Set<string>, today: string): number {
  let cursor = keys.has(today) ? today : addDays(today, -1);
  let run = 0;
  while (keys.has(cursor)) {
    run++;
    cursor = addDays(cursor, -1);
  }
  return run;
}
