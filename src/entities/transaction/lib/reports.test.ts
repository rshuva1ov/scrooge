import { describe, expect, it } from "vitest";

import type { TCategory } from "@/entities/category/model/types";
import {
  calcSummary,
  filterTransactions,
  getTopExpenses,
  groupByCategory,
  groupByDay,
  groupByMonth
} from "@/entities/transaction/lib/reports";
import type { TTransaction } from "@/entities/transaction/model/types";

const categories: TCategory[] = [
  { id: "food", name: "Еда", type: "expense", color: "#8b4513", icon: "🍽️" },
  { id: "salary", name: "Зарплата", type: "income", color: "#ffd700", icon: "💰" }
];

const transactions: TTransaction[] = [
  {
    id: "1",
    amount: 100000,
    type: "income",
    categoryId: "salary",
    note: "January salary",
    date: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "2",
    amount: 1500,
    type: "expense",
    categoryId: "food",
    note: "Groceries",
    date: "2026-01-20T12:00:00.000Z"
  },
  {
    id: "3",
    amount: 500,
    type: "expense",
    categoryId: "food",
    note: "Coffee",
    date: "2026-02-01T08:00:00.000Z"
  }
];

describe("reports", () => {
  it("calculates summary", () => {
    expect(calcSummary(transactions)).toEqual({
      income: 100000,
      expense: 2000,
      balance: 98000,
      count: 3
    });
  });

  it("filters by type and search", () => {
    const filtered = filterTransactions(transactions, {
      from: null,
      to: null,
      type: "expense",
      categoryIds: [],
      minAmount: 1000,
      maxAmount: null,
      search: "Groceries"
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("2");
  });

  it("groups by category and month", () => {
    const grouped = groupByCategory(
      transactions.filter((item) => item.type === "expense"),
      categories
    );
    expect(grouped[0]?.total).toBe(2000);

    const monthly = groupByMonth(transactions);
    expect(monthly.labels).toEqual(["2026-01", "2026-02"]);
    expect(monthly.income[0]).toBe(100000);
    expect(monthly.expense[1]).toBe(500);
  });

  it("groups by day and returns top expenses", () => {
    const daily = groupByDay(transactions, 30);
    expect(daily.labels.length).toBe(30);

    const top = getTopExpenses(transactions, 2);
    expect(top.map((item) => item.id)).toEqual(["2", "3"]);
  });
});
