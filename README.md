# Scrooge Vault

**v1.0.0** — личный PWA для учёта доходов и расходов. Все данные хранятся только на устройстве в IndexedDB, без сервера и аккаунта.

Боевой сайт: [www.scroodge.company](https://www.scroodge.company)

## Возможности

- **Журнал** — доходы и расходы, редактирование, удаление с подтверждением, группировка по месяцам
- **Категории** — свои категории доходов и расходов
- **Отчёты** — период, фильтры, сводка, графики, топ трат
- **Настройки** — светлая и тёмная тема, экспорт и импорт JSON, очистка данных, поддержка (форма вопроса на почту) и донат автора

Валюта: ₽.

## Установка на телефон

1. Откройте [www.scroodge.company](https://www.scroodge.company) в браузере.
2. «Поделиться» → «На экран Домой».

Локально то же самое работает через `pnpm preview` по HTTPS или в локальной сети.

## Бэкап

На экране «Настройки» экспортируйте JSON и храните файл отдельно. Импорт полностью заменяет данные на устройстве. Удаление операций, категорий и полная очистка просят подтверждение.

Данные привязаны к домену: на preview-стенде журнал будет пустым, боевой сейф не затрагивается.

## Запуск

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Откройте `http://localhost:5173`.

```bash
pnpm build
pnpm preview
```

## Переменные окружения

В клиент попадают только ключи с префиксом `VITE_`. Шаблон — `.env.example`.

| Ключ | Где нужен | Назначение |
| --- | --- | --- |
| `VITE_SUPPORT_EMAIL` | `.env.local` и Vercel (Production, Preview) | Почта для формы «Напишите нам». Без ключа ссылка поддержки не показывается. |
| `VITE_DONATE_URL` | `.env.local` и Vercel (Production, Preview) | Страница «Поддержать автора» и QR в модалке. Без ключа ссылка не показывается. |

Локально: `cp .env.example .env.local`.  
С Vercel: `pnpm env:pull` (или `pnpm env:pull:production`).  
В дашборде: Settings → Environment Variables, тот же ключ для Production и Preview.

## Деплой на Vercel

| Среда | Когда | Команда |
| --- | --- | --- |
| **Local** | разработка на машине | `pnpm dev` |
| **Preview** | ветка ≠ `main`, PR | push в Git или `pnpm deploy:preview` |
| **Production** | [www.scroodge.company](https://www.scroodge.company) | merge в `main` или `pnpm deploy:prod` |

После смены env пересоберите деплой — Vite подставляет переменные на этапе сборки.

## Качество кода

```bash
pnpm lint
pnpm format
pnpm type-check
pnpm test
```

## Стек

React 19, TypeScript, Vite, TanStack Router, SCSS Modules, IndexedDB (`idb`), Recharts, Framer Motion, vite-plugin-pwa.
