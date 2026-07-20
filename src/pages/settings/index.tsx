import { useRef, type ChangeEvent } from "react";

import cn from "classnames";
import { Download, Trash2, Upload } from "lucide-react";

import { useToast } from "@/app/providers/toastProvider";
import { useData } from "@/app/providers/useData";
import { useTheme } from "@/app/providers/useTheme";
import { seedCategoriesIfEmpty } from "@/entities/category/api/categoryRepo";
import { clearDatabase, exportDatabase, importDatabase, type IBackupPayload } from "@/shared/db";
import { isThemePresetId, THEME_PRESETS } from "@/shared/lib/theme/presets";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ScroogeArt } from "@/shared/ui/scroogeArt";

import styles from "./index.module.scss";

export const SettingsPage = () => {
  const { refresh } = useData();
  const { showToast } = useToast();
  const { themePreset, setThemePreset } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const importedTheme = payload.settings?.find((setting) => setting.key === "themePreset")?.value;
      if (isThemePresetId(importedTheme)) {
        await setThemePreset(importedTheme);
      }
      showToast("Данные успешно восстановлены", "success");
    } catch {
      showToast("Не удалось импортировать файл", "error");
    } finally {
      event.target.value = "";
    }
  };

  const handleClear = async () => {
    const confirmed = window.confirm("Удалить все данные? Это действие нельзя отменить.");
    if (!confirmed) return;

    await clearDatabase();
    await seedCategoriesIfEmpty();
    await setThemePreset("vault");
    await refresh();
    showToast("Данные очищены", "info");
  };

  const handleThemeChange = async (presetId: typeof themePreset) => {
    if (presetId === themePreset) return;
    await setThemePreset(presetId);
  };

  return (
    <div className={styles.page}>
      <Card className={styles.section} fullWidth gap="12" padding="16">
        <h2 className={styles.title}>Цветовая тема</h2>
        <p className={styles.description}>
          Выберите пресет оформления приложения. Настройка сохраняется на устройстве.
        </p>
        <div className={styles.themeGrid}>
          {THEME_PRESETS.map((preset) => {
            const isActive = themePreset === preset.id;

            return (
              <button
                className={cn(styles.themeOption, isActive && styles.themeOptionActive)}
                key={preset.id}
                onClick={() => void handleThemeChange(preset.id)}
                type="button"
              >
                <span className={styles.themeSwatches}>
                  {preset.swatch.map((color) => (
                    <span className={styles.themeSwatch} key={color} style={{ backgroundColor: color }} />
                  ))}
                </span>
                <span className={styles.themeMeta}>
                  <span className={styles.themeLabel}>{preset.label}</span>
                  <span className={styles.themeHint}>{preset.description}</span>
                </span>
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
        <Button fullWidth onClick={() => void handleClear()} type="button" variant="danger">
          <Trash2 size={18} />
          Очистить все данные
        </Button>
      </Card>

      <Card className={styles.about} fullWidth gap="8" padding="16">
        <ScroogeArt size="md" variant="about" />
        <h2 className={styles.title}>Scrooge Vault</h2>
        <p className={styles.description}>Личный учёт денег. Все данные хранятся только на вашем устройстве.</p>
        <span className={styles.version}>Валюта: ₽ · v0.1.0</span>
      </Card>
    </div>
  );
};
