export type TTransactionType = "income" | "expense";

export interface TTransaction {
  id: string;
  amount: number;
  type: TTransactionType;
  categoryId: string;
  note: string;
  date: string;
}

export interface TTransactionInput {
  id?: string;
  amount: number;
  type: TTransactionType;
  categoryId: string;
  note?: string;
  date?: string;
}
