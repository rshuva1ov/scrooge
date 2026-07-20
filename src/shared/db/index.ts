import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type { TCategory } from "@/entities/category/model/types";
import type { TTransaction } from "@/entities/transaction/model/types";

const DB_NAME = "scrooge-vault";
const DB_VERSION = 1;

export interface ISetting {
  key: string;
  value: string;
}

interface IScroogeDB extends DBSchema {
  categories: {
    key: string;
    value: TCategory;
    indexes: { type: TCategory["type"] };
  };
  transactions: {
    key: string;
    value: TTransaction;
    indexes: {
      date: string;
      categoryId: string;
      type: TTransaction["type"];
    };
  };
  settings: {
    key: string;
    value: ISetting;
  };
}

let dbPromise: Promise<IDBPDatabase<IScroogeDB>> | null = null;

export const getDb = (): Promise<IDBPDatabase<IScroogeDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<IScroogeDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("categories")) {
          const store = db.createObjectStore("categories", { keyPath: "id" });
          store.createIndex("type", "type");
        }
        if (!db.objectStoreNames.contains("transactions")) {
          const store = db.createObjectStore("transactions", { keyPath: "id" });
          store.createIndex("date", "date");
          store.createIndex("categoryId", "categoryId");
          store.createIndex("type", "type");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      }
    });
  }

  return dbPromise;
};

export interface IBackupPayload {
  version: 1;
  exportedAt: string;
  categories: TCategory[];
  transactions: TTransaction[];
  settings: ISetting[];
}

export const exportDatabase = async (): Promise<IBackupPayload> => {
  const db = await getDb();
  const [categories, transactions, settings] = await Promise.all([
    db.getAll("categories"),
    db.getAll("transactions"),
    db.getAll("settings")
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    transactions,
    settings
  };
};

export const importDatabase = async (payload: IBackupPayload): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction(["categories", "transactions", "settings"], "readwrite");

  await Promise.all([
    tx.objectStore("categories").clear(),
    tx.objectStore("transactions").clear(),
    tx.objectStore("settings").clear()
  ]);

  for (const category of payload.categories) {
    await tx.objectStore("categories").put(category);
  }
  for (const transaction of payload.transactions) {
    await tx.objectStore("transactions").put(transaction);
  }
  for (const setting of payload.settings) {
    await tx.objectStore("settings").put(setting);
  }

  await tx.done;
};

export const clearDatabase = async (): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction(["categories", "transactions", "settings"], "readwrite");
  await Promise.all([
    tx.objectStore("categories").clear(),
    tx.objectStore("transactions").clear(),
    tx.objectStore("settings").clear()
  ]);
  await tx.done;
};
