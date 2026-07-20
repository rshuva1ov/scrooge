import { useMemo, useState } from "react";

import cn from "classnames";
import { Plus, Trash2 } from "lucide-react";

import { useData } from "@/app/providers/useData";
import type { TCategory } from "@/entities/category/model/types";
import { saveTransaction, deleteTransaction } from "@/entities/transaction/api/transactionRepo";
import type { TTransactionType } from "@/entities/transaction/model/types";
import { transactionSchema, type TTransactionFormValues } from "@/features/add-transaction/model/schema";
import { formatDisplayDate, toInputDate } from "@/shared/lib/dates";
import { Amount } from "@/shared/ui/amount";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/emptyState";
import { Input, Select, Textarea } from "@/shared/ui/input";
import { ModalSheet } from "@/shared/ui/modalSheet";
import { DuckMascot } from "@/shared/ui/duckMascot";
import duckStyles from "@/shared/ui/duckMascot/index.module.scss";

import styles from "./index.module.scss";

const getDefaultForm = (categories: TCategory[]): TTransactionFormValues => {
  const expenseCategory = categories.find((category) => category.type === "expense");

  return {
    amount: 0,
    type: "expense",
    categoryId: expenseCategory?.id ?? "",
    note: "",
    date: toInputDate(new Date())
  };
};

export const LedgerPage = () => {
  const { categories, transactions, refresh } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<TTransactionFormValues>(() => getDefaultForm(categories));
  const [errors, setErrors] = useState<Partial<Record<keyof TTransactionFormValues, string>>>({});

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  const openForm = () => {
    setForm(getDefaultForm(categories));
    setErrors({});
    setIsOpen(true);
  };

  const handleTypeChange = (type: TTransactionType) => {
    const nextCategory = categories.find((category) => category.type === type);
    setForm((prev) => ({ ...prev, type, categoryId: nextCategory?.id ?? "" }));
  };

  const handleSubmit = async () => {
    const parsed = transactionSchema.safeParse(form);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof TTransactionFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          fieldErrors[key as keyof TTransactionFormValues] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    await saveTransaction({
      ...parsed.data,
      date: new Date(parsed.data.date).toISOString()
    });
    await refresh();
    setIsOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    await refresh();
  };

  return (
    <div className={styles.page}>
      {transactions.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={openForm} type="button">
              Добавить первую операцию
            </Button>
          }
          description="Начните вести учёт — утка поможет следить за сокровищами"
          title="Журнал пуст"
        >
          <DuckMascot className={duckStyles.duck} pose="vault" size={72} />
        </EmptyState>
      ) : (
        <Card fullWidth gap="12">
          <ul className={styles.list}>
            {transactions.map((transaction) => {
              const category = categoryMap.get(transaction.categoryId);

              return (
                <li className={styles.item} key={transaction.id}>
                  <div className={styles.itemLeft}>
                    <span className={styles.icon}>{category?.icon ?? "📁"}</span>
                    <div className={styles.meta}>
                      <span className={styles.name}>{category?.name ?? "Без категории"}</span>
                      {transaction.note && <span className={styles.note}>{transaction.note}</span>}
                      <span className={styles.date}>{formatDisplayDate(transaction.date)}</span>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <Amount signed type={transaction.type} value={transaction.amount} />
                    <Button aria-label="Удалить" onClick={() => void handleDelete(transaction.id)} size="sm" variant="ghost">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <button aria-label="Добавить операцию" className={styles.fab} onClick={openForm} type="button">
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <ModalSheet onClose={() => setIsOpen(false)} title="Новая операция">
          <div className={styles.form}>
            <div className={styles.typeToggle}>
              <Button
                className={cn(styles.typeButton, form.type === "expense" && styles.typeButtonActive)}
                onClick={() => handleTypeChange("expense")}
                type="button"
                variant={form.type === "expense" ? "primary" : "secondary"}
              >
                Расход
              </Button>
              <Button
                className={cn(styles.typeButton, form.type === "income" && styles.typeButtonActive)}
                onClick={() => handleTypeChange("income")}
                type="button"
                variant={form.type === "income" ? "primary" : "secondary"}
              >
                Доход
              </Button>
            </div>

            <Input
              error={errors.amount}
              inputMode="decimal"
              label="Сумма"
              min={0}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))}
              step="0.01"
              type="number"
              value={form.amount || ""}
            />

            <Select
              error={errors.categoryId}
              label="Категория"
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
              value={form.categoryId}
            >
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </Select>

            <Input
              error={errors.date}
              label="Дата"
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              type="date"
              value={form.date}
            />

            <Textarea
              label="Заметка"
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="Необязательно"
              value={form.note}
            />

            <Button fullWidth onClick={() => void handleSubmit()} type="button">
              Сохранить
            </Button>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
