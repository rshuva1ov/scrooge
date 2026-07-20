# Scrooge Vault

Личный PWA для учёта доходов и расходов. Все данные хранятся локально на устройстве в IndexedDB.

## Стек

- React 19 + TypeScript
- Vite
- TanStack Router
- SCSS Modules
- IndexedDB (`idb`)
- Recharts
- ESLint + Prettier + Stylelint
- vite-plugin-pwa

## Запуск

```bash
pnpm install
pnpm dev
```

Откройте `http://localhost:5173`.

## Сборка

```bash
pnpm build
pnpm preview
```

## Качество кода

```bash
pnpm lint
pnpm format
pnpm type-check
pnpm test
```

## Установка на iPhone

1. Разместите приложение на HTTPS (или используйте `pnpm preview` в локальной сети).
2. Откройте в Safari.
3. «Поделиться» → «На экран Домой».

## Экраны

- **Журнал** — список операций, добавление и удаление
- **Категории** — CRUD категорий доходов и расходов
- **Отчёты** — фильтры, сводка, графики, топ трат
- **Настройки** — экспорт/импорт JSON, очистка данных

## Бэкап

На экране «Настройки» можно экспортировать все данные в JSON и восстановить их позже.
