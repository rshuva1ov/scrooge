import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_CATEGORIES } from "@/entities/category/model/types";
import type { TTransaction } from "@/entities/transaction/model/types";
import { clearDatabase, exportDatabase, getDb, importDatabase } from "@/shared/db";

const sampleTransaction: TTransaction = {
  id: "tx-1",
  amount: 500,
  type: "expense",
  categoryId: "exp-food",
  note: "Test",
  date: "2026-01-01T00:00:00.000Z"
};

describe("database backup", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("exports and imports data roundtrip", async () => {
    const db = await getDb();

    for (const category of DEFAULT_CATEGORIES) {
      await db.put("categories", category);
    }
    await db.put("transactions", sampleTransaction);
    await db.put("settings", { key: "currency", value: "RUB" });

    const exported = await exportDatabase();
    await clearDatabase();
    await importDatabase(exported);

    const categories = await db.getAll("categories");
    const transactions = await db.getAll("transactions");
    const settings = await db.getAll("settings");

    expect(categories).toHaveLength(DEFAULT_CATEGORIES.length);
    expect(transactions).toHaveLength(1);
    expect(settings[0]?.value).toBe("RUB");
  });

  it("replaces previous data on import", async () => {
    const db = await getDb();
    await db.put("transactions", sampleTransaction);
    await db.put("categories", DEFAULT_CATEGORIES[0]);

    await importDatabase({
      version: 1,
      exportedAt: "2026-08-17T12:00:00.000Z",
      categories: [DEFAULT_CATEGORIES[2]],
      transactions: [],
      settings: [{ key: "themePreset", value: "light" }]
    });

    expect(await db.getAll("transactions")).toEqual([]);
    expect(await db.getAll("categories")).toEqual([DEFAULT_CATEGORIES[2]]);
    expect((await db.getAll("settings"))[0]?.value).toBe("light");
  });

  it("exports an empty vault", async () => {
    const exported = await exportDatabase();

    expect(exported.version).toBe(1);
    expect(exported.categories).toEqual([]);
    expect(exported.transactions).toEqual([]);
    expect(exported.settings).toEqual([]);
    expect(exported.exportedAt).toBeTruthy();
  });
});
