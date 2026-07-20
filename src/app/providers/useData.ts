import { createContext, useContext } from "react";

import type { TCategory } from "@/entities/category/model/types";
import type { TTransaction } from "@/entities/transaction/model/types";

export interface IDataContextValue {
  categories: TCategory[];
  transactions: TTransaction[];
  balance: number;
  income: number;
  expense: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const DataContext = createContext<IDataContextValue | null>(null);

export const useData = (): IDataContextValue => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};
