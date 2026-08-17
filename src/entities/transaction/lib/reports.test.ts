import { describe, expect, it } from "vitest";

import type { TCategory } from "@/entities/category/model/types";
import {
  calcSummary,
  DEFAULT_FILTERS,
  filterTransactions,
  getDefaultPeriodFilters,
  getTopExpenses,
  groupByCategory,
  groupByDay,
  groupByDayInMonth,
  groupByMonth,
  groupByMonthWindow,
  hasSummaryFilters,
  sanitizeFilters,
  withoutTypeFilter
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

const julyTransactions: TTransaction[] = [
  {
    id: "inc-1",
    amount: 10000,
    type: "income",
    categoryId: "salary",
    note: "Рэм балует",
    date: "2026-07-31"
  },
  {
    id: "inc-2",
    amount: 40000,
    type: "income",
    categoryId: "salary",
    note: "Отчеты",
    date: "2026-07-31T12:00:00.000Z"
  },
  {
    id: "exp-1",
    amount: 2200,
    type: "expense",
    categoryId: "food",
    note: "Процедурки",
    date: "2026-07-28"
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

  it("keeps July income in the period summary even if type filter is expense", () => {
    const periodFilters = {
      ...DEFAULT_FILTERS,
      from: "2026-07-01",
      to: "2026-07-31",
      type: "expense" as const
    };
    const period = filterTransactions(julyTransactions, withoutTypeFilter(periodFilters));
    const summary = calcSummary(period);

    expect(summary).toEqual({
      income: 50000,
      expense: 2200,
      balance: 47800,
      count: 3
    });
  });

  it("includes calendar and ISO dates in a month range", () => {
    const filtered = filterTransactions(julyTransactions, {
      ...DEFAULT_FILTERS,
      from: "2026-07-01",
      to: "2026-07-31"
    });

    expect(filtered.map((item) => item.id).sort()).toEqual(["exp-1", "inc-1", "inc-2"]);
  });

  it("groups July income on the monthly chart", () => {
    const monthly = groupByMonthWindow(julyTransactions, "2026-07", 6);
    const julyIndex = monthly.labels.indexOf("2026-07");

    expect(julyIndex).toBeGreaterThanOrEqual(0);
    expect(monthly.income[julyIndex]).toBe(50000);
    expect(monthly.expense[julyIndex]).toBe(2200);

    const daily = groupByDayInMonth(julyTransactions, "2026-07");
    expect(daily.income.at(-1)).toBe(50000);
  });

  it("sanitizes broken stored filters back to all types", () => {
    expect(
      sanitizeFilters({
        type: "Расходы",
        categoryIds: "food",
        from: "2026-07-01",
        to: "2026-07-31"
      })
    ).toMatchObject({
      type: "all",
      categoryIds: [],
      from: "2026-07-01",
      to: "2026-07-31"
    });
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

  it("filters by category and date range inclusively", () => {
    const filtered = filterTransactions(transactions, {
      ...DEFAULT_FILTERS,
      from: "2026-01-01",
      to: "2026-01-31",
      categoryIds: ["food"]
    });

    expect(filtered.map((item) => item.id)).toEqual(["2"]);
  });

  it("returns zeros for an empty summary", () => {
    expect(calcSummary([])).toEqual({ income: 0, expense: 0, balance: 0, count: 0 });
  });

  it("treats only extra conditions as summary filters", () => {
    expect(hasSummaryFilters({ ...DEFAULT_FILTERS, from: "2026-08-01", to: "2026-08-31" })).toBe(false);
    expect(hasSummaryFilters({ ...DEFAULT_FILTERS, search: "кофе" })).toBe(true);
    expect(hasSummaryFilters({ ...DEFAULT_FILTERS, categoryIds: ["food"] })).toBe(true);
    expect(hasSummaryFilters({ ...DEFAULT_FILTERS, minAmount: 100 })).toBe(true);
  });

  it("defaults the report period to the current month", () => {
    const filters = getDefaultPeriodFilters();
    expect(filters.type).toBe("all");
    expect(filters.from).toMatch(/^\d{4}-\d{2}-01$/);
    expect(filters.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(filters.search).toBe("");
  });

  it("sanitizes a completely invalid payload", () => {
    expect(sanitizeFilters(null)).toEqual(DEFAULT_FILTERS);
  });
});
