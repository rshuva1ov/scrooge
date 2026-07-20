import { getDb } from "@/shared/db";
import { createId } from "@/shared/lib/createId";

import type { TTransaction, TTransactionInput } from "@/entities/transaction/model/types";

export const getAllTransactions = async (): Promise<TTransaction[]> => {
  const db = await getDb();
  const transactions = await db.getAll("transactions");
  return transactions.sort((a, b) => b.date.localeCompare(a.date));
};

export const saveTransaction = async (input: TTransactionInput): Promise<TTransaction> => {
  const db = await getDb();
  const transaction: TTransaction = {
    id: createId(),
    amount: Math.abs(input.amount),
    type: input.type,
    categoryId: input.categoryId,
    note: input.note ?? "",
    date: input.date ?? new Date().toISOString()
  };

  await db.put("transactions", transaction);
  return transaction;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.delete("transactions", id);
};

export const getTransactionById = async (id: string): Promise<TTransaction | undefined> => {
  const db = await getDb();
  return db.get("transactions", id);
};
