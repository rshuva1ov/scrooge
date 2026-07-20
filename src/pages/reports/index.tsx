import cn from "classnames";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { useData } from "@/app/providers/useData";
import {
  DEFAULT_FILTERS,
  FILTERS_STORAGE_KEY,
  calcSummary,
  filterTransactions,
  getTopExpenses,
  groupByCategory,
  groupByDay,
  groupByMonth,
  type ITransactionFilters
} from "@/entities/transaction/lib/reports";
import { getPeriodRange, type TPeriodPreset } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/formatMoney";
import { Amount } from "@/shared/ui/amount";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { DuckMascot } from "@/shared/ui/duckMascot";
import duckStyles from "@/shared/ui/duckMascot/index.module.scss";
import { EmptyState } from "@/shared/ui/emptyState";
import { Input, Select } from "@/shared/ui/input";

import styles from "./index.module.scss";

const PRESETS: { id: TPeriodPreset; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "year", label: "Год" },
  { id: "all", label: "Всё" }
];

const CHART_COLORS = {
  income: "#5fd68a",
  expense: "#f07178",
  grid: "rgba(244, 239, 228, 0.08)",
  text: "#f4efe4"
};

const loadFilters = (): { filters: ITransactionFilters; preset: TPeriodPreset } => {
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) {
      const monthRange = getPeriodRange("month");
      return {
        filters: { ...DEFAULT_FILTERS, from: monthRange.from, to: monthRange.to },
        preset: "month"
      };
    }

    const parsed = JSON.parse(raw) as ITransactionFilters;
    return {
      filters: { ...DEFAULT_FILTERS, ...parsed },
      preset: "month"
    };
  } catch {
    const monthRange = getPeriodRange("month");
    return {
      filters: { ...DEFAULT_FILTERS, from: monthRange.from, to: monthRange.to },
      preset: "month"
    };
  }
};

const getPeriodLabel = (filters: ITransactionFilters): string => {
  if (filters.from && filters.to) {
    return `${filters.from} — ${filters.to}`;
  }
  if (filters.from) {
    return `с ${filters.from}`;
  }
  if (filters.to) {
    return `по ${filters.to}`;
  }
  return "за всё время";
};

export const ReportsPage = () => {
  const { categories, transactions } = useData();
  const initial = loadFilters();
  const [filters, setFilters] = useState<ITransactionFilters>(initial.filters);
  const [activePreset, setActivePreset] = useState<TPeriodPreset>(initial.preset);

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const filtered = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
  const summary = useMemo(() => calcSummary(filtered), [filtered]);
  const byCategory = useMemo(
    () => groupByCategory(filtered.filter((item) => item.type === "expense"), categories),
    [filtered, categories]
  );
  const byMonth = useMemo(() => groupByMonth(filtered), [filtered]);
  const byDay = useMemo(() => groupByDay(filtered), [filtered]);
  const topExpenses = useMemo(() => getTopExpenses(filtered), [filtered]);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );

  const monthlyChartData = byMonth.labels.map((label, index) => ({
    month: label,
    income: byMonth.income[index],
    expense: byMonth.expense[index]
  }));

  const dailyChartData = byDay.labels.map((label, index) => ({
    day: label.slice(5),
    income: byDay.income[index],
    expense: byDay.expense[index]
  }));

  const applyPreset = (preset: TPeriodPreset) => {
    const range = getPeriodRange(preset);
    setActivePreset(preset);
    setFilters((prev) => ({ ...prev, from: range.from, to: range.to }));
  };

  const toggleCategory = (categoryId: string) => {
    setFilters((prev) => {
      const exists = prev.categoryIds.includes(categoryId);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((id) => id !== categoryId)
          : [...prev.categoryIds, categoryId]
      };
    });
  };

  const resetFilters = () => {
    const monthRange = getPeriodRange("month");
    setActivePreset("month");
    setFilters({
      ...DEFAULT_FILTERS,
      from: monthRange.from,
      to: monthRange.to
    });
  };

  if (transactions.length === 0) {
    return (
      <div className={styles.page}>
        <EmptyState
          description="Добавьте операции в журнал — утка покажет отчёты"
          title="Нет данных для отчётов"
        >
          <DuckMascot className={duckStyles.duck} pose="empty" size={96} />
        </EmptyState>
      </div>
    );
  }

  const duckPose = summary.balance < 0 ? "sad" : summary.count === 0 ? "empty" : "chart";

  return (
    <div className={styles.page}>
      <section className={styles.resultsSection} id="report-results">
        <div className={styles.resultsHero}>
          <div className={styles.resultsTop}>
            <div className={styles.resultsHeroText}>
              <h2 className={styles.resultsTitle}>Результат за период</h2>
              <p className={styles.resultsSubtitle}>
                {getPeriodLabel(filters)} · {summary.count}{" "}
                {summary.count === 1 ? "операция" : summary.count < 5 ? "операции" : "операций"}
              </p>
            </div>
            <DuckMascot className={styles.duck} pose={duckPose} size={52} />
          </div>
          <div className={styles.resultsBalance}>
            <span className={styles.balanceLabel}>Баланс</span>
            <Amount
              allowNegative
              size="lg"
              type={summary.balance >= 0 ? "neutral" : "debt"}
              value={summary.balance}
            />
          </div>
        </div>

        {summary.count === 0 ? (
          <Card className={styles.emptyFiltered} fullWidth gap="12">
            <DuckMascot className={styles.duck} pose="empty" size={80} />
            <p className={styles.emptyFilteredText}>
              По выбранным фильтрам ничего не найдено. Ослабьте условия или нажмите «Сбросить фильтры».
            </p>
            <Button onClick={resetFilters} type="button" variant="secondary">
              Сбросить фильтры
            </Button>
          </Card>
        ) : (
          <>
            <div className={styles.summaryGrid}>
              <Card className={styles.summaryCard} gap="8" padding="12">
                <span className={styles.summaryLabel}>Доход</span>
                <Amount size="md" type="income" value={summary.income} />
              </Card>
              <Card className={styles.summaryCard} gap="8" padding="12">
                <span className={styles.summaryLabel}>Расход</span>
                <Amount size="md" type="expense" value={summary.expense} />
              </Card>
              <Card className={styles.summaryCard} gap="8" padding="12">
                <span className={styles.summaryLabel}>Баланс</span>
                <Amount
                  allowNegative
                  size="md"
                  type={summary.balance >= 0 ? "neutral" : "debt"}
                  value={summary.balance}
                />
              </Card>
              <Card className={styles.summaryCard} gap="8" padding="12">
                <span className={styles.summaryLabel}>Операций</span>
                <span className={styles.sectionTitle}>{summary.count}</span>
              </Card>
            </div>

            {monthlyChartData.length > 0 && (
              <Card className={styles.chartCard} fullWidth gap="12">
                <h3 className={styles.chartTitle}>По месяцам</h3>
                <div className={styles.chartBox}>
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                      <XAxis dataKey="month" stroke={CHART_COLORS.text} tick={{ fontSize: 12 }} />
                      <YAxis stroke={CHART_COLORS.text} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => formatMoney(Number(value))} />
                      <Legend />
                      <Bar dataKey="income" fill={CHART_COLORS.income} name="Доход" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" fill={CHART_COLORS.expense} name="Расход" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {byCategory.length > 0 && (
              <Card className={styles.chartCard} fullWidth gap="12">
                <h3 className={styles.chartTitle}>Расходы по категориям</h3>
                <div className={styles.chartBox}>
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={byCategory}
                        dataKey="total"
                        innerRadius={45}
                        nameKey="name"
                        outerRadius={80}
                      >
                        {byCategory.map((entry) => (
                          <Cell fill={entry.color} key={entry.id} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatMoney(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            <Card className={styles.chartCard} fullWidth gap="12">
              <h3 className={styles.chartTitle}>Последние 30 дней</h3>
              <div className={styles.chartBox}>
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart data={dailyChartData}>
                    <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                    <XAxis dataKey="day" stroke={CHART_COLORS.text} tick={{ fontSize: 12 }} />
                    <YAxis stroke={CHART_COLORS.text} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatMoney(Number(value))} />
                    <Legend />
                    <Line dataKey="income" dot={false} name="Доход" stroke={CHART_COLORS.income} strokeWidth={2} />
                    <Line dataKey="expense" dot={false} name="Расход" stroke={CHART_COLORS.expense} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {topExpenses.length > 0 && (
              <Card fullWidth gap="12">
                <h3 className={styles.chartTitle}>Топ-5 трат</h3>
                <ul className={styles.topList}>
                  {topExpenses.map((transaction) => {
                    const category = categoryMap.get(transaction.categoryId);
                    return (
                      <li className={styles.topItem} key={transaction.id}>
                        <div className={styles.topMeta}>
                          <span className={styles.topName}>
                            {category?.icon} {category?.name ?? "Без категории"}
                          </span>
                          {transaction.note && <span className={styles.topNote}>{transaction.note}</span>}
                        </div>
                        <Amount type="expense" value={transaction.amount} />
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
          </>
        )}
      </section>

      <details className={styles.filtersPanel}>
        <summary className={styles.filtersSummary}>
          <div>
            <p className={styles.filtersSummaryTitle}>Фильтры</p>
            <p className={styles.filtersSummaryHint}>Меняйте период и условия — результат обновится выше</p>
          </div>
          <span className={styles.filtersChevron}>▼</span>
        </summary>

        <div className={styles.filtersBody}>
          <div className={styles.presets}>
            {PRESETS.map((preset) => (
              <Button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                size="sm"
                type="button"
                variant={activePreset === preset.id ? "primary" : "secondary"}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Input
            label="С"
            onChange={(event) => {
              setActivePreset("all");
              setFilters((prev) => ({ ...prev, from: event.target.value || null }));
            }}
            type="date"
            value={filters.from ?? ""}
          />
          <Input
            label="По"
            onChange={(event) => {
              setActivePreset("all");
              setFilters((prev) => ({ ...prev, to: event.target.value || null }));
            }}
            type="date"
            value={filters.to ?? ""}
          />

          <Select
            label="Тип"
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                type: event.target.value as ITransactionFilters["type"]
              }))
            }
            value={filters.type}
          >
            <option value="all">Все</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </Select>

          <Input
            label="Поиск по заметке"
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Например: продукты"
            value={filters.search}
          />

          <Input
            inputMode="decimal"
            label="Мин. сумма"
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                minAmount: event.target.value ? Number(event.target.value) : null
              }))
            }
            type="number"
            value={filters.minAmount ?? ""}
          />

          <Input
            inputMode="decimal"
            label="Макс. сумма"
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                maxAmount: event.target.value ? Number(event.target.value) : null
              }))
            }
            type="number"
            value={filters.maxAmount ?? ""}
          />

          <div className={styles.categoryChips}>
            {categories.map((category) => (
              <button
                className={cn(styles.chip, filters.categoryIds.includes(category.id) && styles.chipActive)}
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                type="button"
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          <Button fullWidth onClick={resetFilters} type="button" variant="ghost">
            Сбросить фильтры
          </Button>
        </div>
      </details>
    </div>
  );
};
