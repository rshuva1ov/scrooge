import { beforeEach, describe, expect, it } from "vitest";

import { deleteCategory, getAllCategories, saveCategory, seedCategoriesIfEmpty } from "@/entities/category/api/categoryRepo";
import { DEFAULT_CATEGORIES } from "@/entities/category/model/types";
import { resetVaultStorage } from "@/test/indexedDb";

describe("categoryRepo", () => {
  beforeEach(async () => {
    await resetVaultStorage();
  });

  it("seeds default categories only when the store is empty", async () => {
    await seedCategoriesIfEmpty();
    await seedCategoriesIfEmpty();

    const categories = await getAllCategories();

    expect(categories).toHaveLength(DEFAULT_CATEGORIES.length);
    expect(categories.map((item) => item.id).sort()).toEqual(DEFAULT_CATEGORIES.map((item) => item.id).sort());
  });

  it("creates and updates a category", async () => {
    await saveCategory({
      id: "exp-pets",
      name: "Питомцы",
      type: "expense",
      color: "#8b4513",
      icon: "🐾"
    });

    await saveCategory({
      id: "exp-pets",
      name: "Животные",
      type: "expense",
      color: "#556b2f",
      icon: "🐶"
    });

    const categories = await getAllCategories();

    expect(categories).toHaveLength(1);
    expect(categories[0]).toEqual({
      id: "exp-pets",
      name: "Животные",
      type: "expense",
      color: "#556b2f",
      icon: "🐶"
    });
  });

  it("deletes a category by id", async () => {
    await saveCategory({
      id: "exp-pets",
      name: "Питомцы",
      type: "expense",
      color: "#8b4513",
      icon: "🐾"
    });

    await deleteCategory("exp-pets");

    expect(await getAllCategories()).toEqual([]);
  });
});
