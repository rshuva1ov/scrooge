import { beforeEach, describe, expect, it } from "vitest";

import { deleteTransaction, getAllTransactions, saveTransaction } from "@/entities/transaction/api/transactionRepo";
import { resetVaultStorage } from "@/test/indexedDb";

describe("transactionRepo", () => {
  beforeEach(async () => {
    await resetVaultStorage();
  });

  it("creates a transaction and lists newest first", async () => {
    await saveTransaction({
      amount: 500,
      type: "expense",
      categoryId: "exp-food",
      note: "Кофе",
      date: "2026-08-01"
    });
    await saveTransaction({
      amount: 40000,
      type: "income",
      categoryId: "inc-salary",
      note: "Зарплата",
      date: "2026-08-10"
    });

    const transactions = await getAllTransactions();

    expect(transactions).toHaveLength(2);
    expect(transactions.map((item) => item.note)).toEqual(["Зарплата", "Кофе"]);
  });

  it("stores the absolute amount and an empty note by default", async () => {
    const saved = await saveTransaction({
      amount: -1200,
      type: "expense",
      categoryId: "exp-food",
      date: "2026-08-02"
    });

    expect(saved.amount).toBe(1200);
    expect(saved.note).toBe("");
    expect(saved.id).toBeTruthy();
  });

  it("updates an existing transaction when id is provided", async () => {
    const created = await saveTransaction({
      amount: 200,
      type: "expense",
      categoryId: "exp-food",
      note: "Черновик",
      date: "2026-08-03"
    });

    await saveTransaction({
      id: created.id,
      amount: 350,
      type: "income",
      categoryId: "inc-other",
      note: "Исправлено",
      date: "2026-08-04"
    });

    const transactions = await getAllTransactions();

    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({
      id: created.id,
      amount: 350,
      type: "income",
      categoryId: "inc-other",
      note: "Исправлено",
      date: "2026-08-04"
    });
  });

  it("deletes a transaction by id", async () => {
    const created = await saveTransaction({
      amount: 80,
      type: "expense",
      categoryId: "exp-food",
      date: "2026-08-05"
    });

    await deleteTransaction(created.id);

    expect(await getAllTransactions()).toEqual([]);
  });
});
