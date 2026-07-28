import { useMemo, useState } from "react";

import cn from "classnames";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useToast } from "@/app/providers/toastProvider";
import { useData } from "@/app/providers/useData";
import { deleteCategory, saveCategory } from "@/entities/category/api/categoryRepo";
import type { TCategory, TCategoryType } from "@/entities/category/model/types";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  categorySchema,
  type TCategoryFormValues
} from "@/features/manage-category/model/schema";
import { createId } from "@/shared/lib/createId";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/emptyState";
import { Input, Select } from "@/shared/ui/input";
import { ModalSheet } from "@/shared/ui/modalSheet";

import styles from "./index.module.scss";

const DEFAULT_FORM: TCategoryFormValues = {
  name: "",
  type: "expense",
  color: CATEGORY_COLORS[0],
  icon: CATEGORY_ICONS[0]
};

export const CategoriesPage = () => {
  const { categories, refresh } = useData();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TCategoryFormValues>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TCategoryFormValues, string>>>({});

  const grouped = useMemo(() => {
    return {
      income: categories.filter((category) => category.type === "income"),
      expense: categories.filter((category) => category.type === "expense")
    };
  }, [categories]);

  const openCreate = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setErrors({});
    setIsOpen(true);
  };

  const openEdit = (category: TCategory) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    });
    setErrors({});
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    const parsed = categorySchema.safeParse(form);

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof TCategoryFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          fieldErrors[key as keyof TCategoryFormValues] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    await saveCategory({
      id: editingId ?? createId(),
      ...parsed.data
    });
    await refresh();
    setIsOpen(false);
    showToast(editingId ? "Категория обновлена" : "Категория создана", "success");
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    await refresh();
    showToast("Категория удалена", "info");
  };

  const renderGroup = (title: string, items: TCategory[], typeLabel: string) => (
    <>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <Card fullWidth gap="12">
        {items.length === 0 ? (
          <EmptyState description={`Добавьте категории для ${typeLabel}`} icon="📁" title="Пока пусто" />
        ) : (
          <ul className={styles.list}>
            {items.map((category) => (
              <li className={styles.item} key={category.id}>
                <div className={styles.itemLeft}>
                  <span className={styles.icon} style={{ backgroundColor: `${category.color}22` }}>
                    {category.icon}
                  </span>
                  <div>
                    <p className={styles.name}>{category.name}</p>
                    <p className={styles.type}>{typeLabel}</p>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Button aria-label="Редактировать" onClick={() => openEdit(category)} size="sm" variant="ghost">
                    <Pencil size={16} />
                  </Button>
                  <Button
                    aria-label="Удалить"
                    onClick={() => void handleDelete(category.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );

  return (
    <div className={styles.page}>
      <Button fullWidth onClick={openCreate} type="button">
        <Plus size={18} />
        Новая категория
      </Button>

      {renderGroup("Доходы", grouped.income, "Доход")}
      {renderGroup("Расходы", grouped.expense, "Расход")}

      <ModalSheet
        footer={
          <Button fullWidth onClick={() => void handleSubmit()} type="button">
            Сохранить
          </Button>
        }
        onClose={() => setIsOpen(false)}
        open={isOpen}
        title={editingId ? "Редактировать" : "Новая категория"}
      >
        <div className={styles.form}>
          <Input
            error={errors.name}
            label="Название"
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            value={form.name}
          />

          <Select
            label="Тип"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, type: event.target.value as TCategoryType }))
            }
            value={form.type}
          >
            <option value="expense">Расход</option>
            <option value="income">Доход</option>
          </Select>

          <div className={styles.picker}>
            <span className={styles.pickerLabel}>Иконка</span>
            <div className={styles.pickerRow}>
              {CATEGORY_ICONS.map((icon) => (
                <button
                  className={cn(styles.pickerItem, form.icon === icon && styles.pickerItemActive)}
                  key={icon}
                  onClick={() => setForm((prev) => ({ ...prev, icon }))}
                  type="button"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.picker}>
            <span className={styles.pickerLabel}>Цвет</span>
            <div className={styles.pickerRow}>
              {CATEGORY_COLORS.map((color) => (
                <button
                  className={cn(styles.pickerItem, form.color === color && styles.pickerItemActive)}
                  key={color}
                  onClick={() => setForm((prev) => ({ ...prev, color }))}
                  type="button"
                >
                  <span className={styles.colorDot} style={{ backgroundColor: color }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
};
