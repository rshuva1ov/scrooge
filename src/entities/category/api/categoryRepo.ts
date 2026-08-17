import { getDb } from "@/shared/db";

import { DEFAULT_CATEGORIES, type TCategory } from "@/entities/category/model/types";

export const seedCategoriesIfEmpty = async (): Promise<void> => {
  const db = await getDb();
  const count = await db.count("categories");

  if (count === 0) {
    const tx = db.transaction("categories", "readwrite");
    await Promise.all(DEFAULT_CATEGORIES.map((category) => tx.store.put(category)));
    await tx.done;
  }
};

export const getAllCategories = async (): Promise<TCategory[]> => {
  const db = await getDb();
  return db.getAll("categories");
};

export const saveCategory = async (category: TCategory): Promise<void> => {
  const db = await getDb();
  await db.put("categories", category);
};

export const deleteCategory = async (id: string): Promise<void> => {
  const db = await getDb();
  await db.delete("categories", id);
};
