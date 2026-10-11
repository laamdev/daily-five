"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { CATEGORY_STYLES, CategoryDot } from "@/components/category-dot";
import type { Activity, CategoryMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Draft = { title: string; description: string };

export function ActivityCard({
  category,
  activity,
  lastTitle,
  onToggle,
  onSave,
}: {
  category: CategoryMeta;
  activity: Activity;
  lastTitle?: string;
  onToggle: (draft: Draft) => void;
  onSave: (draft: Draft) => void;
}) {
  const styles = CATEGORY_STYLES[category.id];
  const [draft, setDraft] = useState<Draft>({
    title: activity.title,
    description: activity.description,
  });
  const [editing, setEditing] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  // Pick up changes from the server (another device, a partner's tab) unless the user is typing.
  const [seen, setSeen] = useState<Draft>(draft);
  if (!editing && (seen.title !== activity.title || seen.description !== activity.description)) {
    const next = { title: activity.title, description: activity.description };
    setSeen(next);
    setDraft(next);
  }

  function commit() {
    setEditing(false);
    if (draft.title.trim() !== activity.title || draft.description.trim() !== activity.description) {
      onSave(draft);
    }
  }

  function toggle() {
    // Tapping the check on an empty row repeats what you did last time.
    const filled =
      !activity.done && !draft.title.trim() && lastTitle ? { ...draft, title: lastTitle } : draft;
    setDraft(filled);
    onToggle(filled);
  }

  const showNote = noteOpen || !!draft.description;

  return (
    <li className="group flex gap-4 border-b border-border/70 py-5 last:border-b-0">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={activity.done}
        aria-label={`Mark ${category.label} ${activity.done ? "not done" : "done"}`}
        className={cn(
          "mt-4 flex size-8 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-300",
          styles.border,
          activity.done ? cn(styles.bg, "animate-pop text-background") : styles.hover,
        )}
      >
        {activity.done && <Check className="size-4" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          <CategoryDot category={category.id} />
          {category.label}
        </div>
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          onFocus={() => setEditing(true)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          maxLength={80}
          placeholder={lastTitle ?? category.prompt}
          aria-label={`${category.label} activity`}
          className={cn(
            "mt-1 w-full bg-transparent text-[17px] font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground/60",
            activity.done && "text-foreground/80",
          )}
        />
        {showNote ? (
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            onFocus={() => setEditing(true)}
            onBlur={() => {
              commit();
              setNoteOpen(false);
            }}
            autoFocus={noteOpen && !draft.description}
            rows={1}
            maxLength={280}
            placeholder="A few words…"
            aria-label={`${category.label} note`}
            className="mt-1 field-sizing-content w-full resize-none bg-transparent text-sm leading-relaxed text-muted-foreground outline-none placeholder:text-muted-foreground/50"
          />
        ) : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground/55 transition-opacity hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <Plus className="size-3" /> Add a note
          </button>
        )}
      </div>
    </li>
  );
}
