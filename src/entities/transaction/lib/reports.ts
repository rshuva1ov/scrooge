import { dayjs, getMonthKey, getPeriodRange, toInputDate } from "@/shared/lib/dates";

import type { TCategory } from "@/entities/category/model/types";
import type { TTransaction, TTransactionType } from "@/entities/transaction/model/types";

export interface ITransactionFilters {
  from: string | null;
  to: string | null;
  type: TTransactionType | "all";
  categoryIds: string[];
  minAmount: number | null;
  maxAmount: number | null;
  search: string;
}

export const DEFAULT_FILTERS: ITransactionFilters = {
  from: null,
  to: null,
  type: "all",
  categoryIds: [],
  minAmount: null,
  maxAmount: null,
  search: ""
};

const isFilterType = (value: unknown): value is ITransactionFilters["type"] =>
  value === "all" || value === "income" || value === "expense";

export const sanitizeFilters = (raw: unknown): ITransactionFilters => {
  const parsed = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    from: typeof parsed.from === "string" && parsed.from ? parsed.from : null,
    to: typeof parsed.to === "string" && parsed.to ? parsed.to : null,
    type: isFilterType(parsed.type) ? parsed.type : "all",
    categoryIds: Array.isArray(parsed.categoryIds)
      ? parsed.categoryIds.filter((id): id is string => typeof id === "string" && id.length > 0)
      : [],
    minAmount: typeof parsed.minAmount === "number" && Number.isFinite(parsed.minAmount) ? parsed.minAmount : null,
    maxAmount: typeof parsed.maxAmount === "number" && Number.isFinite(parsed.maxAmount) ? parsed.maxAmount : null,
    search: typeof parsed.search === "string" ? parsed.search : ""
  };
};

export const getDefaultPeriodFilters = (): ITransactionFilters => {
  const monthRange = getPeriodRange("month");
  return { ...DEFAULT_FILTERS, from: monthRange.from, to: monthRange.to };
};

export const withoutTypeFilter = (filters: ITransactionFilters): ITransactionFilters => ({
  ...filters,
  type: "all"
});

export const hasSummaryFilters = (filters: ITransactionFilters): boolean =>
  filters.categoryIds.length > 0 ||
  Boolean(filters.search.trim()) ||
  filters.minAmount !== null ||
  filters.maxAmount !== null;

export interface ISummary {
  income: number;
  expense: number;
  balance: number;
  count: number;
}

export interface ICategoryTotal extends TCategory {
  total: number;
  count: number;
}

export interface IMonthlyData {
  labels: string[];
  income: number[];
  expense: number[];
  net: number[];
}

export interface IDailyData {
  labels: string[];
  income: number[];
  expense: number[];
}

interface IAmountBucket {
  income: number;
  expense: number;
}

const emptyBucket = (): IAmountBucket => ({ income: 0, expense: 0 });

const addAmount = (bucket: IAmountBucket, transaction: TTransaction): void => {
  if (transaction.type === "income") {
    bucket.income += transaction.amount;
  } else {
    bucket.expense += transaction.amount;
  }
};

const toDailyData = (labels: string[], buckets: Map<string, IAmountBucket>): IDailyData => ({
  labels,
  income: labels.map((key) => buckets.get(key)?.income ?? 0),
  expense: labels.map((key) => buckets.get(key)?.expense ?? 0)
});

const toMonthlyData = (labels: string[], buckets: Map<string, IAmountBucket>): IMonthlyData => ({
  ...toDailyData(labels, buckets),
  net: labels.map((key) => {
    const bucket = buckets.get(key);
    return (bucket?.income ?? 0) - (bucket?.expense ?? 0);
  })
});

export const filterTransactions = (
  transactions: TTransaction[],
  filters: ITransactionFilters
): TTransaction[] => {
  return transactions.filter((transaction) => {
    const dateKey = toInputDate(transaction.date);

    if (filters.from && dateKey < filters.from) {
      return false;
    }
    if (filters.to && dateKey > filters.to) {
      return false;
    }
    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false;
    }
    if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(transaction.categoryId)) {
      return false;
    }
    if (filters.minAmount !== null && transaction.amount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount !== null && transaction.amount > filters.maxAmount) {
      return false;
    }
    if (filters.search && !(transaction.note ?? "").toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    return true;
  });
};

export const calcSummary = (transactions: TTransaction[]): ISummary => {
  let income = 0;
  let expense = 0;

  for (const transaction of transactions) {
    if (transaction.type === "income") {
      income += transaction.amount;
    } else {
      expense += transaction.amount;
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
    count: transactions.length
  };
};

export const groupByCategory = (
  transactions: TTransaction[],
  categories: TCategory[]
): ICategoryTotal[] => {
  const map = new Map<string, ICategoryTotal>();

  for (const category of categories) {
    map.set(category.id, { ...category, total: 0, count: 0 });
  }

  for (const transaction of transactions) {
    const item = map.get(transaction.categoryId);
    if (!item) continue;
    item.total += transaction.amount;
    item.count += 1;
  }

  return Array.from(map.values())
    .filter((item) => item.count > 0)
    .sort((a, b) => b.total - a.total);
};

export const groupByMonth = (transactions: TTransaction[]): IMonthlyData => {
  const buckets = new Map<string, IAmountBucket>();

  for (const transaction of transactions) {
    const key = getMonthKey(transaction.date);
    const bucket = buckets.get(key) ?? emptyBucket();
    addAmount(bucket, transaction);
    buckets.set(key, bucket);
  }

  return toMonthlyData(Array.from(buckets.keys()).sort(), buckets);
};

export const groupByDay = (transactions: TTransaction[], days = 30): IDailyData => {
  const end = dayjs();
  const start = end.subtract(days - 1, "day");
  const buckets = new Map<string, IAmountBucket>();

  for (let i = 0; i < days; i++) {
    buckets.set(start.add(i, "day").format("YYYY-MM-DD"), emptyBucket());
  }

  for (const transaction of transactions) {
    const bucket = buckets.get(toInputDate(transaction.date));
    if (!bucket) continue;
    addAmount(bucket, transaction);
  }

  return toDailyData(Array.from(buckets.keys()).sort(), buckets);
};

export const groupByDayInMonth = (transactions: TTransaction[], monthKey: string): IDailyData => {
  const monthStart = dayjs(`${monthKey}-01`);
  const today = dayjs();
  const monthEnd = monthStart.isSame(today, "month") ? today : monthStart.endOf("month");
  const buckets = new Map<string, IAmountBucket>();

  for (let cursor = monthStart; cursor.isSameOrBefore(monthEnd, "day"); cursor = cursor.add(1, "day")) {
    buckets.set(cursor.format("YYYY-MM-DD"), emptyBucket());
  }

  for (const transaction of transactions) {
    const bucket = buckets.get(toInputDate(transaction.date));
    if (!bucket) continue;
    addAmount(bucket, transaction);
  }

  return toDailyData(Array.from(buckets.keys()).sort(), buckets);
};

export const groupByMonthWindow = (
  transactions: TTransaction[],
  endMonthKey: string,
  count: number
): IMonthlyData => {
  const end = dayjs(`${endMonthKey}-01`);
  const labels = Array.from({ length: count }, (_, index) =>
    end.subtract(count - 1 - index, "month").format("YYYY-MM")
  );
  const buckets = new Map(labels.map((label) => [label, emptyBucket()]));

  for (const transaction of transactions) {
    const bucket = buckets.get(getMonthKey(transaction.date));
    if (!bucket) continue;
    addAmount(bucket, transaction);
  }

  return toMonthlyData(labels, buckets);
};

export const getTopExpenses = (transactions: TTransaction[], limit = 5): TTransaction[] => {
  return transactions
    .filter((transaction) => transaction.type === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};

export const FILTERS_STORAGE_KEY = "scrooge-report-filters";
