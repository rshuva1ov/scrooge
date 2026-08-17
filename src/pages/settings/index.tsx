import { useRef, useState, type ChangeEvent } from "react";

import cn from "classnames";
import { Download, Moon, Sun, Trash2, Upload } from "lucide-react";

import { useToast } from "@/app/providers/useToast";
import { useData } from "@/app/providers/useData";
import { useTheme } from "@/app/providers/useTheme";
import { seedCategoriesIfEmpty } from "@/entities/category/api/categoryRepo";
import { clearDatabase, exportDatabase, importDatabase, type IBackupPayload } from "@/shared/db";
import { resolveThemeId, THEME_SETTING_KEY, THEMES } from "@/shared/lib/theme/presets";
import type { TThemeId } from "@/shared/lib/theme/types";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ConfirmSheet } from "@/shared/ui/confirmSheet";
import { ScroogeArt } from "@/shared/ui/scroogeArt";

import styles from "./index.module.scss";

export const SettingsPage = () => {
  const { refresh } = useData();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExport = async () => {
    const payload = await exportDatabase();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrooge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Резервная копия сохранена", "success");
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
      const importedTheme = payload.settings?.find((setting) => setting.key === THEME_SETTING_KEY)?.value;
      await setTheme(resolveThemeId(importedTheme));
      showToast("Данные успешно восстановлены", "success");
    } catch {
      showToast("Не удалось импортировать файл", "error");
    } finally {
      event.target.value = "";
    }
  };

  const handleClear = async () => {
    if (isClearing) {
      return;
    }

    setIsClearing(true);

    try {
      await clearDatabase();
      await seedCategoriesIfEmpty();
      await setTheme("dark");
      await refresh();
      setIsClearOpen(false);
      showToast("Данные очищены", "info");
    } finally {
      setIsClearing(false);
    }
  };

  const handleThemeChange = async (themeId: TThemeId) => {
    if (themeId === theme) return;
    await setTheme(themeId);
  };

  return (
    <div className={styles.page}>
      <Card className={styles.section} fullWidth gap="12" padding="16">
        <h2 className={styles.title}>Оформление</h2>
        <p className={styles.description}>Светлая или тёмная тема. Настройка сохраняется на устройстве.</p>
        <div aria-label="Тема" className={styles.themeSwitch} role="radiogroup">
          {THEMES.map((option) => {
            const isActive = theme === option.id;
            const Icon = option.id === "light" ? Sun : Moon;

            return (
              <button
                aria-checked={isActive}
                className={cn(styles.themeSegment, isActive && styles.themeSegmentActive)}
                key={option.id}
                onClick={() => void handleThemeChange(option.id)}
                role="radio"
                type="button"
              >
                <Icon size={16} strokeWidth={2} />
                {option.label}
              </button>
            );
          })}
        </div>
      </Card>

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
        <Button fullWidth onClick={() => setIsClearOpen(true)} type="button" variant="danger">
          <Trash2 size={18} />
          Очистить все данные
        </Button>
      </Card>

      <Card className={styles.about} fullWidth gap="8" padding="16">
        <ScroogeArt size="md" variant="about" />
        <h2 className={styles.title}>Scrooge Vault</h2>
        <p className={styles.description}>Личный учёт денег. Все данные хранятся только на вашем устройстве.</p>
        <span className={styles.version}>Валюта: ₽ · v1.0.0</span>
      </Card>

      <ConfirmSheet
        busyLabel="Очистка..."
        confirmLabel="Очистить"
        description="Все операции, категории и настройки будут удалены с устройства. Это нельзя отменить."
        isBusy={isClearing}
        onClose={() => setIsClearOpen(false)}
        onConfirm={() => void handleClear()}
        open={isClearOpen}
        title="Очистить все данные?"
      />
    </div>
  );
};
