import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import cn from "classnames";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useToast } from "@/app/providers/useToast";
import { useData } from "@/app/providers/useData";
import { transactionSchema, type TTransactionFormValues } from "@/features/add-transaction/model/schema";
import type { TCategory } from "@/entities/category/model/types";
import { deleteTransaction, saveTransaction } from "@/entities/transaction/api/transactionRepo";
import { groupLedgerByMonth } from "@/entities/transaction/lib/groupLedgerByMonth";
import type { TTransaction, TTransactionType } from "@/entities/transaction/model/types";
import { formatDisplayDate, toInputDate } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/formatMoney";
import { zodFieldErrors } from "@/shared/lib/zodFieldErrors";
import { Amount } from "@/shared/ui/amount";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ConfirmSheet } from "@/shared/ui/confirmSheet";
import { EmptyState } from "@/shared/ui/emptyState";
import { Input, Select, Textarea } from "@/shared/ui/input";
import { ModalSheet } from "@/shared/ui/modalSheet";
import { ScroogeArt } from "@/shared/ui/scroogeArt";

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

const toFormValues = (transaction: TTransaction): TTransactionFormValues => ({
  amount: transaction.amount,
  type: transaction.type,
  categoryId: transaction.categoryId,
  note: transaction.note,
  date: toInputDate(transaction.date)
});

export const LedgerPage = () => {
  const { categories, transactions, refresh } = useData();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<TTransactionFormValues>(() => getDefaultForm(categories));
  const [errors, setErrors] = useState<Partial<Record<keyof TTransactionFormValues, string>>>({});

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  const transactionsByMonth = useMemo(() => groupLedgerByMonth(transactions), [transactions]);

  const openCreate = () => {
    setEditingId(null);
    setForm(getDefaultForm(categories));
    setErrors({});
    setIsOpen(true);
  };

  const openEdit = (transaction: TTransaction) => {
    setEditingId(transaction.id);
    setForm(toFormValues(transaction));
    setErrors({});
    setIsOpen(true);
  };

  const closeForm = () => {
    setIsOpen(false);
    setEditingId(null);
  };

  const handleTypeChange = (type: TTransactionType) => {
    setForm((prev) => {
      const currentCategory = categories.find((category) => category.id === prev.categoryId);
      const nextCategory =
        currentCategory?.type === type ? currentCategory : categories.find((category) => category.type === type);

      return { ...prev, type, categoryId: nextCategory?.id ?? "" };
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const parsed = transactionSchema.safeParse(form);

    if (!parsed.success) {
      setErrors(zodFieldErrors<keyof TTransactionFormValues>(parsed.error));
      return;
    }

    const isEdit = Boolean(editingId);
    setIsSubmitting(true);

    try {
      await saveTransaction({
        ...parsed.data,
        id: editingId ?? undefined
      });
      await refresh();
      closeForm();
      if (isEdit) {
        showToast("Операция обновлена", "success");
      } else {
        showToast(parsed.data.type === "income" ? "Доход добавлен" : "Расход добавлен", "success");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteTransaction(pendingDelete.id);
      await refresh();
      setPendingDelete(null);
      showToast("Операция удалена", "info");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      {transactions.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={openCreate} type="button">
              Добавить первую операцию
            </Button>
          }
          description="Начните вести учёт — Скрудж поможет следить за сокровищами"
          title="Журнал пуст"
        >
          <ScroogeArt size="lg" variant="vault" />
        </EmptyState>
      ) : (
        <Card fullWidth gap="12" padding="16">
          <div className={styles.groups}>
            {transactionsByMonth.map((group) => (
              <section className={styles.monthSection} key={group.key}>
                <h2 className={styles.monthTitle}>{group.label}</h2>
                <ul className={styles.list}>
                  {group.items.map((transaction) => {
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
                          <div className={styles.actions}>
                            <Button
                              aria-label="Редактировать"
                              onClick={() => openEdit(transaction)}
                              size="sm"
                              variant="ghost"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              aria-label="Удалить"
                              onClick={() => setPendingDelete(transaction)}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </Card>
      )}

      {createPortal(
        <button aria-label="Добавить операцию" className={styles.fab} onClick={openCreate} type="button">
          <Plus size={24} strokeWidth={2.5} />
        </button>,
        document.body
      )}

      <ConfirmSheet
        description={
          pendingDelete
            ? `${categoryMap.get(pendingDelete.categoryId)?.name ?? "Без категории"} · ${formatMoney(pendingDelete.amount)}. Это нельзя отменить.`
            : ""
        }
        isBusy={isDeleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
        open={Boolean(pendingDelete)}
        title="Удалить операцию?"
      />

      <ModalSheet
        footer={
          <Button disabled={isSubmitting} fullWidth onClick={() => void handleSubmit()} type="button">
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        }
        onClose={() => {
          if (!isSubmitting) {
            closeForm();
          }
        }}
        open={isOpen}
        title={editingId ? "Редактировать операцию" : "Новая операция"}
      >
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
                {`${category.icon} ${category.name}`}
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
        </div>
      </ModalSheet>
    </div>
  );
};
