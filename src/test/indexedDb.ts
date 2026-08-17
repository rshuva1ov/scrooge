import "fake-indexeddb/auto";

import { clearDatabase } from "@/shared/db";

export const resetVaultStorage = async () => {
  await clearDatabase();
  localStorage.clear();
};
