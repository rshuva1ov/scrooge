import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { seedCategoriesIfEmpty, getAllCategories } from "@/entities/category/api/categoryRepo";
import type { TCategory } from "@/entities/category/model/types";
import { getAllTransactions } from "@/entities/transaction/api/transactionRepo";
import { calcSummary } from "@/entities/transaction/lib/reports";
import type { TTransaction } from "@/entities/transaction/model/types";

import { DataContext } from "./useData";

const loadVaultData = async () => {
  await seedCategoriesIfEmpty();
  const [categories, transactions] = await Promise.all([getAllCategories(), getAllTransactions()]);
  return { categories, transactions };
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [transactions, setTransactions] = useState<TTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const applyData = useCallback((nextCategories: TCategory[], nextTransactions: TTransaction[]) => {
    setCategories(nextCategories);
    setTransactions(nextTransactions);
    setIsLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const data = await loadVaultData();
    applyData(data.categories, data.transactions);
  }, [applyData]);

  useEffect(() => {
    let active = true;

    void loadVaultData().then((data) => {
      if (active) {
        applyData(data.categories, data.transactions);
      }
    });

    return () => {
      active = false;
    };
  }, [applyData]);

  const summary = useMemo(() => calcSummary(transactions), [transactions]);

  const value = useMemo(
    () => ({
      categories,
      transactions,
      balance: summary.balance,
      income: summary.income,
      expense: summary.expense,
      isLoading,
      refresh
    }),
    [categories, transactions, summary, isLoading, refresh]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
