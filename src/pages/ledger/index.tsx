import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import cn from "classnames";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";

import { useToast } from "@/app/providers/toastProvider";
import { useData } from "@/app/providers/useData";
import { transactionSchema, type TTransactionFormValues } from "@/features/add-transaction/model/schema";
import type { TCategory } from "@/entities/category/model/types";
import { deleteTransaction, saveTransaction } from "@/entities/transaction/api/transactionRepo";
import type { TTransaction, TTransactionType } from "@/entities/transaction/model/types";
import { formatDisplayDate, formatMonthLabel, getMonthKey, toInputDate } from "@/shared/lib/dates";
import { listItemVariants, staggerContainer } from "@/shared/lib/motion/presets";
import { Amount } from "@/shared/ui/amount";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
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

export const LedgerPage = () => {
  const { categories, transactions, refresh } = useData();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<TTransactionFormValues>(() => getDefaultForm(categories));
  const [errors, setErrors] = useState<Partial<Record<keyof TTransactionFormValues, string>>>({});

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  const transactionsByMonth = useMemo(() => {
    const groups: { key: string; label: string; items: TTransaction[] }[] = [];

    for (const transaction of transactions) {
      const key = getMonthKey(transaction.date);
      const lastGroup = groups.at(-1);

      if (lastGroup?.key === key) {
        lastGroup.items.push(transaction);
      } else {
        groups.push({
          key,
          label: formatMonthLabel(transaction.date),
          items: [transaction]
        });
      }
    }

    return groups;
  }, [transactions]);

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
    if (isSubmitting) {
      return;
    }

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

    setIsSubmitting(true);

    try {
      await saveTransaction({
        ...parsed.data,
        date: new Date(parsed.data.date).toISOString()
      });
      await refresh();
      setIsOpen(false);
      showToast(parsed.data.type === "income" ? "Доход добавлен" : "Расход добавлен", "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    await refresh();
    showToast("Операция удалена", "info");
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
          description="Начните вести учёт — Скрудж поможет следить за сокровищами"
          title="Журнал пуст"
        >
          <ScroogeArt size="lg" variant="vault" />
        </EmptyState>
      ) : (
        <Card fullWidth gap="12" padding="16">
          <motion.div animate="animate" className={styles.groups} initial="initial" variants={staggerContainer}>
            {transactionsByMonth.map((group) => (
              <section className={styles.monthSection} key={group.key}>
                <h2 className={styles.monthTitle}>{group.label}</h2>
                <ul className={styles.list}>
                  {group.items.map((transaction) => {
                    const category = categoryMap.get(transaction.categoryId);

                    return (
                      <motion.li className={styles.item} key={transaction.id} variants={listItemVariants}>
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
                          <Button
                            aria-label="Удалить"
                            onClick={() => void handleDelete(transaction.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </motion.div>
        </Card>
      )}

      {createPortal(
        <button aria-label="Добавить операцию" className={styles.fab} onClick={openForm} type="button">
          <Plus size={24} strokeWidth={2.5} />
        </button>,
        document.body
      )}

      <ModalSheet
        footer={
          <Button disabled={isSubmitting} fullWidth onClick={() => void handleSubmit()} type="button">
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        }
        onClose={() => {
          if (!isSubmitting) {
            setIsOpen(false);
          }
        }}
        open={isOpen}
        title="Новая операция"
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
