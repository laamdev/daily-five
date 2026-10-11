/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { CATEGORY_IDS } from "../lib/categories";
import { addDays } from "../lib/dates";

const modules = import.meta.glob([
  "./**/*.ts",
  "./_generated/*.js",
  "!./**/*.test.ts",
  "!./**/*.d.ts",
]);

async function setup() {
  const t = convexTest(schema, modules);
  const luis = t.withIdentity({ subject: "luis", name: "Luis" });
  const ana = t.withIdentity({ subject: "ana", name: "Ana" });
  await luis.mutation(api.users.store, {});
  await ana.mutation(api.users.store, {});
  return { t, luis, ana };
}

type Client = Awaited<ReturnType<typeof setup>>["luis"];

async function completeDay(client: Client, date: string) {
  let newBadges: string[] = [];
  for (const category of CATEGORY_IDS) {
    const res = await client.mutation(api.days.toggleActivity, { date, category });
    newBadges = newBadges.concat(res.newBadges);
  }
  return newBadges;
}

describe("couples", () => {
  test("create and join with an invite code", async () => {
    const { luis, ana, t } = await setup();
    const code = await luis.mutation(api.couples.create, {});
    expect(code).toMatch(/^[A-Z2-9]{6}$/);
    await ana.mutation(api.couples.join, { code: code.toLowerCase() });

    const couple = await luis.query(api.couples.mine, {});
    expect(couple?.members.map((m) => m.name).sort()).toEqual(["Ana", "Luis"]);

    const third = t.withIdentity({ subject: "third", name: "Third" });
    await third.mutation(api.users.store, {});
    await expect(third.mutation(api.couples.join, { code })).rejects.toThrow(/full/);
    await expect(third.mutation(api.couples.join, { code: "NOPE00" })).rejects.toThrow(
      /No space/,
    );
  });

  test("leaving deletes an empty space", async () => {
    const { luis, t } = await setup();
    await luis.mutation(api.couples.create, {});
    await luis.mutation(api.couples.leave, {});
    expect(await luis.query(api.couples.mine, {})).toBeNull();
    const couples = await t.run((ctx) => ctx.db.query("couples").collect());
    expect(couples).toHaveLength(0);
  });

  test("journal stays private until shared", async () => {
    const { luis, ana } = await setup();
    const code = await luis.mutation(api.couples.create, {});
    await ana.mutation(api.couples.join, { code });
    const date = "2026-10-11";

    await ana.mutation(api.days.setActivity, {
      date,
      category: "physical",
      title: "Morning walk",
      description: "Around the park",
    });
    await ana.mutation(api.days.saveJournal, { date, journal: "Secret", journalShared: false });

    let view = await luis.query(api.couples.partnerDay, { date });
    expect(view?.partner.name).toBe("Ana");
    expect(view?.day?.activities.physical.title).toBe("Morning walk");
    expect(view?.day?.journal).toBeNull();

    await ana.mutation(api.days.saveJournal, { date, journal: "Shared now", journalShared: true });
    view = await luis.query(api.couples.partnerDay, { date });
    expect(view?.day?.journal).toBe("Shared now");
  });
});

describe("days", () => {
  test("toggle tracks done count and suggests last titles", async () => {
    const { luis } = await setup();
    await luis.mutation(api.days.setActivity, {
      date: "2026-10-10",
      category: "mental",
      title: "  Crossword  ",
      description: "",
    });
    await luis.mutation(api.days.toggleActivity, { date: "2026-10-10", category: "mental" });

    const yesterday = await luis.query(api.days.get, { date: "2026-10-10" });
    expect(yesterday?.day?.doneCount).toBe(1);
    expect(yesterday?.day?.activities.mental.title).toBe("Crossword");

    const today = await luis.query(api.days.get, { date: "2026-10-11" });
    expect(today?.day).toBeNull();
    expect(today?.lastTitles.mental).toBe("Crossword");

    await luis.mutation(api.days.toggleActivity, { date: "2026-10-10", category: "mental" });
    const undone = await luis.query(api.days.get, { date: "2026-10-10" });
    expect(undone?.day?.doneCount).toBe(0);
  });

  test("rejects malformed dates", async () => {
    const { luis } = await setup();
    await expect(
      luis.mutation(api.days.toggleActivity, { date: "2026-13-01", category: "home" }),
    ).rejects.toThrow(/Invalid date/);
  });
});

describe("badges", () => {
  test("first step, perfect day and streaks", async () => {
    const { luis } = await setup();
    const start = "2026-10-01";
    expect(await completeDay(luis, start)).toEqual(["first-step", "perfect-day"]);
    expect(await completeDay(luis, addDays(start, 1))).toEqual([]);
    expect(await completeDay(luis, addDays(start, 2))).toEqual(["on-a-roll"]);

    const list = await luis.query(api.badges.list, { today: addDays(start, 3) });
    expect(list?.stats.currentStreak).toBe(3);
    expect(list?.stats.bestStreak).toBe(3);
    expect(list?.stats.totalDone).toBe(15);
    const weekStrong = list?.badges.find((b) => b.id === "week-strong");
    expect(weekStrong).toMatchObject({ current: 3, target: 7, earnedAt: null });

    // A gap breaks the current streak.
    const later = await luis.query(api.badges.list, { today: addDays(start, 5) });
    expect(later?.stats.currentStreak).toBe(0);
  });

  test("in sync is awarded to both partners", async () => {
    const { luis, ana } = await setup();
    const code = await luis.mutation(api.couples.create, {});
    await ana.mutation(api.couples.join, { code });
    const date = "2026-10-11";

    await completeDay(luis, date);
    expect(await completeDay(ana, date)).toContain("in-sync");

    const luisBadges = await luis.query(api.badges.list, { today: date });
    expect(luisBadges?.badges.find((b) => b.id === "in-sync")?.earnedAt).not.toBeNull();
    expect(luisBadges?.stats.inSyncDays).toBe(1);
  });

  test("journal entries count toward journaler", async () => {
    const { luis } = await setup();
    let earned: string[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await luis.mutation(api.days.saveJournal, {
        date: addDays("2026-10-01", i),
        journal: `Day ${i}`,
        journalShared: false,
      });
      earned = earned.concat(res.newBadges);
    }
    expect(earned).toEqual(["journaler"]);
  });
});
