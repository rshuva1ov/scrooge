import { describe, expect, it } from "vitest";

import { formatMonthLabel } from "@/shared/lib/dates";

import { groupLedgerByMonth } from "./groupLedgerByMonth";
import type { TTransaction } from "@/entities/transaction/model/types";

const tx = (id: string, date: string, note: string): TTransaction => ({
  id,
  amount: 100,
  type: "expense",
  categoryId: "exp-food",
  note,
  date
});

describe("groupLedgerByMonth", () => {
  it("keeps newest-first order and groups consecutive months", () => {
    const groups = groupLedgerByMonth([
      tx("1", "2026-08-10", "Август 1"),
      tx("2", "2026-08-01", "Август 2"),
      tx("3", "2026-07-31", "Июль")
    ]);

    expect(groups.map((group) => group.key)).toEqual(["2026-08", "2026-07"]);
    expect(groups[0]?.items.map((item) => item.id)).toEqual(["1", "2"]);
    expect(groups[1]?.items.map((item) => item.note)).toEqual(["Июль"]);
    expect(groups[0]?.label).toBe(formatMonthLabel("2026-08-10"));
  });

  it("returns an empty list for an empty journal", () => {
    expect(groupLedgerByMonth([])).toEqual([]);
  });
});
