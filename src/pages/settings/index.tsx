import { useRef, useState, type ChangeEvent } from "react";

import { Download, Trash2, Upload } from "lucide-react";

import { useData } from "@/app/providers/useData";
import { seedCategoriesIfEmpty } from "@/entities/category/api/categoryRepo";
import { clearDatabase, exportDatabase, importDatabase, type IBackupPayload } from "@/shared/db";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

import styles from "./index.module.scss";

export const SettingsPage = () => {
  const { refresh } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    const payload = await exportDatabase();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skrudge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Резервная копия сохранена");
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text) as IBackupPayload;

      if (!payload.categories || !payload.transactions) {
        throw new Error("Invalid backup");
      }

      await importDatabase(payload);
      await refresh();
      setMessage("Данные успешно восстановлены");
    } catch {
      setMessage("Не удалось импортировать файл");
    } finally {
      event.target.value = "";
    }
  };

  const handleClear = async () => {
    const confirmed = window.confirm("Удалить все данные? Это действие нельзя отменить.");
    if (!confirmed) return;

    await clearDatabase();
    await seedCategoriesIfEmpty();
    await refresh();
    setMessage("Данные очищены, категории по умолчанию восстановлены");
  };

  return (
    <div className={styles.page}>
      {message && <p className={styles.message}>{message}</p>}

      <Card className={styles.section} fullWidth gap="12" padding="16">
        <h2 className={styles.title}>Резервная копия</h2>
        <p className={styles.description}>
          Экспортируйте данные в JSON и храните файл отдельно. На iPhone данные сохраняются локально, пока вы не удалите
          приложение.
        </p>
        <Button fullWidth onClick={() => void handleExport()} type="button">
          <Download size={18} />
          Экспорт JSON
        </Button>
        <Button fullWidth onClick={() => fileInputRef.current?.click()} type="button" variant="secondary">
          <Upload size={18} />
          Импорт JSON
        </Button>
        <input
          accept="application/json,.json"
          className={styles.hiddenInput}
          onChange={(event) => void handleImport(event)}
          ref={fileInputRef}
          type="file"
        />
      </Card>

      <Card className={styles.section} fullWidth gap="12" padding="16">
        <h2 className={styles.title}>Опасная зона</h2>
        <p className={styles.description}>Удаляет все транзакции, категории и настройки с устройства.</p>
        <Button fullWidth onClick={() => void handleClear()} type="button" variant="danger">
          <Trash2 size={18} />
          Очистить все данные
        </Button>
      </Card>

      <Card className={styles.about} fullWidth gap="8" padding="16">
        <h2 className={styles.title}>Skrudge Vault</h2>
        <p className={styles.description}>Личный учёт денег. Все данные хранятся только на вашем устройстве.</p>
        <span className={styles.version}>Валюта: ₽ · v0.1.0</span>
      </Card>
    </div>
  );
};
