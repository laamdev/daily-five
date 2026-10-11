"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { celebrate } from "@/components/badge-icon";
import { Switch } from "@/components/ui/switch";

const SAVE_DELAY = 900;

export function JournalEditor({
  date,
  journal,
  shared,
  hasPartner,
}: {
  date: string;
  journal: string;
  shared: boolean;
  hasPartner: boolean;
}) {
  const save = useMutation(api.days.saveJournal);
  const [text, setText] = useState(journal);
  const [focused, setFocused] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Pick up server changes (e.g. from another device) when not typing.
  const [seen, setSeen] = useState(journal);
  if (!focused && seen !== journal) {
    setSeen(journal);
    setText(journal);
  }

  useEffect(() => {
    if (text === journal) return;
    const id = setTimeout(async () => {
      setStatus("saving");
      const res = await save({ date, journal: text, journalShared: shared });
      setStatus("saved");
      celebrate(res.newBadges);
    }, SAVE_DELAY);
    return () => clearTimeout(id);
  }, [text, journal, shared, date, save]);

  async function setShared(next: boolean) {
    const res = await save({ date, journal: text, journalShared: next });
    celebrate(res.newBadges);
  }

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-3xl">Journal</h2>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={10000}
        placeholder="How was today? What made you smile, what was hard, what are you grateful for?"
        aria-label="Journal entry"
        className="mt-4 field-sizing-content min-h-44 w-full resize-none rounded-2xl border border-border bg-card p-5 text-[15px] leading-7 outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
      />
      <label className="mt-4 flex items-center justify-between gap-4 text-sm">
        <span>
          Share with your partner
          <span className="block text-xs text-muted-foreground">
            {hasPartner
              ? shared
                ? "Your partner can read this entry."
                : "Only you can read this entry."
              : "Link up in the Us tab to share entries."}
          </span>
        </span>
        <Switch
          checked={shared}
          disabled={!hasPartner}
          onCheckedChange={(checked) => setShared(checked)}
        />
      </label>
    </section>
  );
}
