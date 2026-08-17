import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_CATEGORIES } from "@/entities/category/model/types";
import { saveTransaction } from "@/entities/transaction/api/transactionRepo";
import { resetVaultStorage } from "@/test/indexedDb";

import { DataProvider } from "./dataProvider";
import { useData } from "./useData";

const Probe = () => {
  const { isLoading, categories, transactions, income, expense, balance } = useData();

  if (isLoading) {
    return <p>loading</p>;
  }

  return (
    <div>
      <p>categories:{categories.length}</p>
      <p>count:{transactions.length}</p>
      <p>income:{income}</p>
      <p>expense:{expense}</p>
      <p>balance:{balance}</p>
    </div>
  );
};

describe("DataProvider", () => {
  beforeEach(async () => {
    await resetVaultStorage();
  });

  it("seeds default categories and exposes header totals", async () => {
    await saveTransaction({
      amount: 40000,
      type: "income",
      categoryId: "inc-salary",
      note: "Зарплата",
      date: "2026-08-10"
    });
    await saveTransaction({
      amount: 2200,
      type: "expense",
      categoryId: "exp-food",
      note: "Еда",
      date: "2026-08-12"
    });

    render(
      <DataProvider>
        <Probe />
      </DataProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(`categories:${DEFAULT_CATEGORIES.length}`)).toBeInTheDocument();
    });

    expect(screen.getByText("count:2")).toBeInTheDocument();
    expect(screen.getByText("income:40000")).toBeInTheDocument();
    expect(screen.getByText("expense:2200")).toBeInTheDocument();
    expect(screen.getByText("balance:37800")).toBeInTheDocument();
  });

  it("throws outside of the provider", () => {
    expect(() => render(<Probe />)).toThrow("useData must be used within DataProvider");
  });
});
