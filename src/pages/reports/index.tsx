import { useEffect, useMemo, useState } from "react";

import cn from "classnames";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
  calcSummary,
  FILTERS_STORAGE_KEY,
  filterTransactions,
  getDefaultPeriodFilters,
  getTopExpenses,
  groupByCategory,
  groupByDayInMonth,
  groupByMonthWindow,
  hasSummaryFilters,
  sanitizeFilters,
  withoutTypeFilter,
  type ITransactionFilters
} from "@/entities/transaction/lib/reports";
import {
  dayjs,
  formatMonthNavLabel,
  getChartMonthKey,
  getMonthKey,
  getMonthRange,
  getPeriodRange,
  inferPeriodPreset,
  shiftMonthKey,
  type TPeriodPreset
} from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/formatMoney";
import { formatRuCount } from "@/shared/lib/formatRuCount";
import { Amount } from "@/shared/ui/amount";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/emptyState";
import { Input } from "@/shared/ui/input";
import { ScroogeArt } from "@/shared/ui/scroogeArt";

import styles from "./index.module.scss";

const PRESETS: { id: TPeriodPreset; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "year", label: "Год" },
  { id: "all", label: "Всё" }
];

const MONTHLY_CHART_WINDOW = 6;

const formatMonthTick = (monthKey: string): string => {
  const label = dayjs(`${monthKey}-01`).format("MMM");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const formatDayTick = (dateKey: string): string => dayjs(dateKey).format("D");

const CHART_COLORS = {
  income: "var(--income)",
  expense: "var(--expense)",
  grid: "var(--chart-grid)",
  text: "var(--chart-text)"
};

const loadFilters = (): ITransactionFilters => {
  try {
    const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
    return raw ? sanitizeFilters(JSON.parse(raw)) : getDefaultPeriodFilters();
  } catch {
    return getDefaultPeriodFilters();
  }
};

const getPeriodLabel = (filters: ITransactionFilters): string => {
  if (filters.from && filters.to) {
    return `${dayjs(filters.from).format("DD.MM.YYYY")} — ${dayjs(filters.to).format("DD.MM.YYYY")}`;
  }
  if (filters.from) {
    return `с ${dayjs(filters.from).format("DD.MM.YYYY")}`;
  }
  if (filters.to) {
    return `по ${dayjs(filters.to).format("DD.MM.YYYY")}`;
  }
  return "за всё время";
};

export const ReportsPage = () => {
  const { categories, transactions } = useData();
  const [filters, setFilters] = useState(loadFilters);
  const [activePreset, setActivePreset] = useState(() => inferPeriodPreset(filters));

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const breakdownFilters = useMemo(() => withoutTypeFilter(filters), [filters]);
  const breakdown = useMemo(
    () => filterTransactions(transactions, breakdownFilters),
    [transactions, breakdownFilters]
  );
  const nonDateFiltered = useMemo(
    () => filterTransactions(transactions, { ...breakdownFilters, from: null, to: null }),
    [transactions, breakdownFilters]
  );
  const summary = useMemo(() => calcSummary(breakdown), [breakdown]);
  const summaryFiltersActive = hasSummaryFilters(filters);
  const chartMonth = getChartMonthKey(filters);
  const monthLimits = useMemo(() => {
    const currentMonth = getMonthKey(new Date());

    if (transactions.length === 0) {
      return { min: currentMonth, max: currentMonth };
    }

    const sortedMonths = transactions.map((transaction) => getMonthKey(transaction.date)).sort();
    return { min: sortedMonths[0], max: currentMonth };
  }, [transactions]);
  const canGoPrevMonth = chartMonth > monthLimits.min;
  const canGoNextMonth = chartMonth < monthLimits.max;
  const byCategory = useMemo(
    () =>
      groupByCategory(
        breakdown.filter((item) => item.type === "expense"),
        categories
      ),
    [breakdown, categories]
  );
  const byMonthWindow = useMemo(
    () => groupByMonthWindow(nonDateFiltered, chartMonth, MONTHLY_CHART_WINDOW),
    [nonDateFiltered, chartMonth]
  );
  const byDay = useMemo(() => groupByDayInMonth(breakdown, chartMonth), [breakdown, chartMonth]);
  const topExpenses = useMemo(() => getTopExpenses(breakdown), [breakdown]);

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const monthlyChartData = byMonthWindow.labels.map((label, index) => ({
    month: formatMonthTick(label),
    monthKey: label,
    income: byMonthWindow.income[index],
    expense: byMonthWindow.expense[index]
  }));

  const dailyChartData = byDay.labels.map((label, index) => ({
    day: formatDayTick(label),
    income: byDay.income[index],
    expense: byDay.expense[index]
  }));

  const applyPreset = (preset: TPeriodPreset) => {
    const range = getPeriodRange(preset);
    setActivePreset(preset);
    setFilters((prev) => ({ ...prev, from: range.from, to: range.to }));
  };

  const navigateMonth = (delta: number) => {
    const nextMonth = shiftMonthKey(chartMonth, delta);
    if (nextMonth < monthLimits.min || nextMonth > monthLimits.max) {
      return;
    }

    const range = getMonthRange(nextMonth);
    setActivePreset("all");
    setFilters((prev) => ({ ...prev, from: range.from, to: range.to }));
  };

  const toggleCategory = (categoryId: string) => {
    setFilters((prev) => {
      const exists = prev.categoryIds.includes(categoryId);
      return {
        ...prev,
        categoryIds: exists ? prev.categoryIds.filter((id) => id !== categoryId) : [...prev.categoryIds, categoryId]
      };
    });
  };

  const resetFilters = () => {
    const nextFilters = getDefaultPeriodFilters();
    setActivePreset(inferPeriodPreset(nextFilters));
    setFilters(nextFilters);
  };

  if (transactions.length === 0) {
    return (
      <div className={styles.page}>
        <EmptyState description="Добавьте операции в журнал — утка покажет отчёты" title="Нет данных для отчётов">
          <ScroogeArt size="xl" variant="comics" />
        </EmptyState>
      </div>
    );
  }

  const scroogeVariant = summary.balance < 0 ? "cute" : summary.count === 0 ? "group" : "comics";
  const monthLabel = formatMonthNavLabel(chartMonth).toLowerCase();

  return (
    <div className={styles.page}>
      <details className={styles.filtersPanel}>
        <summary className={styles.filtersSummary}>
          <div>
            <p className={styles.filtersSummaryTitle}>Фильтры</p>
            <p className={styles.filtersSummaryHint}>Меняйте период и условия — результат обновится ниже</p>
          </div>
          <ChevronDown aria-hidden className={styles.filtersChevron} size={20} strokeWidth={2} />
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

      <section className={styles.resultsSection} id="report-results">
        <div className={styles.resultsHero}>
          <div className={styles.resultsTop}>
            <div className={styles.resultsHeroText}>
              <h2 className={styles.resultsTitle}>Результат за период</h2>
              <p className={styles.resultsSubtitle}>
                {getPeriodLabel(filters)} · {formatRuCount(summary.count, ["операция", "операции", "операций"])}
              </p>
              {summaryFiltersActive && (
                <p className={styles.filtersActiveHint}>
                  Сводка сужена фильтрами.{" "}
                  <button className={styles.filtersActiveReset} onClick={resetFilters} type="button">
                    Сбросить
                  </button>
                </p>
              )}
            </div>
            <ScroogeArt animate={false} size="md" variant={scroogeVariant} />
          </div>
          <div className={styles.resultsBalance}>
            <span className={styles.balanceLabel}>Баланс</span>
            <Amount allowNegative size="lg" type={summary.balance >= 0 ? "neutral" : "debt"} value={summary.balance} />
          </div>
        </div>

        {summary.count === 0 ? (
          <Card className={styles.emptyFiltered} fullWidth gap="12">
            <ScroogeArt size="md" variant="group" />
            <p className={styles.emptyFilteredText}>
              {summaryFiltersActive
                ? `За ${monthLabel} ничего не найдено. Ослабьте фильтры или переключите месяц.`
                : `За ${monthLabel} нет операций. Переключите месяц или добавьте записи в журнал.`}
            </p>
            {summaryFiltersActive && (
              <Button onClick={resetFilters} type="button" variant="secondary">
                Сбросить фильтры
              </Button>
            )}
          </Card>
        ) : (
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
        )}

        <div className={styles.chartsSection}>
          <div className={styles.monthNav}>
            <button
              aria-label="Предыдущий месяц"
              className={styles.monthNavButton}
              disabled={!canGoPrevMonth}
              onClick={() => navigateMonth(-1)}
              type="button"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <span className={styles.monthNavLabel}>{formatMonthNavLabel(chartMonth)}</span>
            <button
              aria-label="Следующий месяц"
              className={styles.monthNavButton}
              disabled={!canGoNextMonth}
              onClick={() => navigateMonth(1)}
              type="button"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>

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
                  <Bar dataKey="income" fill={CHART_COLORS.income} name="Доход" radius={[4, 4, 0, 0]}>
                    {monthlyChartData.map((entry) => (
                      <Cell
                        fill={CHART_COLORS.income}
                        key={`income-${entry.monthKey}`}
                        opacity={entry.monthKey === chartMonth ? 1 : 0.45}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="expense" fill={CHART_COLORS.expense} name="Расход" radius={[4, 4, 0, 0]}>
                    {monthlyChartData.map((entry) => (
                      <Cell
                        fill={CHART_COLORS.expense}
                        key={`expense-${entry.monthKey}`}
                        opacity={entry.monthKey === chartMonth ? 1 : 0.45}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

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
            <h3 className={styles.chartTitle}>По дням</h3>
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
        </div>
      </section>
    </div>
  );
};
