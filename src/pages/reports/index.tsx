import { useEffect, useMemo, useState } from "react";

import cn from "classnames";
import { motion } from "framer-motion";
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
  applyReportPeriod,
  calcSummary,
  FILTERS_STORAGE_KEY,
  filterTransactions,
  getDefaultPeriodFilters,
  getTopTransactions,
  groupByCategory,
  groupByDayInMonth,
  groupByMonthWindow,
  hasSummaryFilters,
  inferReportPeriod,
  sanitizeFilters,
  type ITransactionFilters,
  type TReportPeriod
} from "@/entities/transaction/lib/reports";
import type { TTransactionType } from "@/entities/transaction/model/types";
import {
  dayjs,
  formatMonthNavLabel,
  getChartMonthKey,
  getMonthKey,
  getMonthRange,
  shiftMonthKey
} from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/formatMoney";
import { formatRuCount } from "@/shared/lib/formatRuCount";
import { springSoft } from "@/shared/lib/motion/presets";
import { Amount } from "@/shared/ui/amount";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/emptyState";
import { ScroogeArt } from "@/shared/ui/scroogeArt";

import styles from "./index.module.scss";

const TYPE_OPTIONS: { id: TTransactionType | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "income", label: "Доходы" },
  { id: "expense", label: "Расходы" }
];

const PERIOD_OPTIONS: { id: TReportPeriod; label: string }[] = [
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

const getFocusMonth = (filters: ITransactionFilters, period: TReportPeriod): string => {
  if (period === "month") {
    return getChartMonthKey(filters);
  }

  return getMonthKey(new Date());
};

const getPeriodLabel = (period: TReportPeriod, monthKey: string): string => {
  if (period === "month") {
    return formatMonthNavLabel(monthKey);
  }

  if (period === "year") {
    return `${dayjs().format("YYYY")} год`;
  }

  return "за всё время";
};

export const ReportsPage = () => {
  const { categories, transactions } = useData();
  const [filters, setFilters] = useState(loadFilters);
  const [activePeriod, setActivePeriod] = useState(() => inferReportPeriod(filters));
  const [monthKey, setMonthKey] = useState(() => getFocusMonth(filters, inferReportPeriod(filters)));

  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const breakdown = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
  const nonDateFiltered = useMemo(
    () => filterTransactions(transactions, { ...filters, from: null, to: null }),
    [transactions, filters]
  );
  const summary = useMemo(() => calcSummary(breakdown), [breakdown]);
  const extraFiltersActive = hasSummaryFilters(filters);
  const monthLimits = useMemo(() => {
    const currentMonth = getMonthKey(new Date());

    if (transactions.length === 0) {
      return { min: currentMonth, max: currentMonth };
    }

    const sortedMonths = transactions.map((transaction) => getMonthKey(transaction.date)).sort();
    return { min: sortedMonths[0], max: currentMonth };
  }, [transactions]);
  const canGoPrevMonth = monthKey > monthLimits.min;
  const canGoNextMonth = monthKey < monthLimits.max;
  const showIncome = filters.type !== "expense";
  const showExpense = filters.type !== "income";
  const pieType: TTransactionType = filters.type === "income" ? "income" : "expense";
  const visibleCategories = useMemo(
    () => categories.filter((category) => filters.type === "all" || category.type === filters.type),
    [categories, filters.type]
  );
  const byCategory = useMemo(
    () =>
      groupByCategory(
        breakdown.filter((item) => item.type === pieType),
        categories
      ),
    [breakdown, categories, pieType]
  );
  const byMonthWindow = useMemo(
    () => groupByMonthWindow(nonDateFiltered, monthKey, MONTHLY_CHART_WINDOW),
    [nonDateFiltered, monthKey]
  );
  const byDay = useMemo(() => groupByDayInMonth(breakdown, monthKey), [breakdown, monthKey]);
  const topItems = useMemo(() => getTopTransactions(breakdown, pieType), [breakdown, pieType]);
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

  const applyPeriod = (period: TReportPeriod) => {
    const nextMonth = period === "month" ? monthKey : getMonthKey(new Date());
    setActivePeriod(period);
    if (period !== "month") {
      setMonthKey(nextMonth);
    }
    setFilters((prev) => ({ ...prev, ...applyReportPeriod(period, nextMonth) }));
  };

  const navigateMonth = (delta: number) => {
    const nextMonth = shiftMonthKey(monthKey, delta);
    if (nextMonth < monthLimits.min || nextMonth > monthLimits.max) {
      return;
    }

    setMonthKey(nextMonth);
    setActivePeriod("month");
    setFilters((prev) => ({ ...prev, ...getMonthRange(nextMonth) }));
  };

  const applyType = (type: TTransactionType | "all") => {
    setFilters((prev) => ({
      ...prev,
      type,
      categoryIds: prev.categoryIds.filter((id) => {
        const category = categoryMap.get(id);
        return Boolean(category && (type === "all" || category.type === type));
      })
    }));
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
    setActivePeriod(inferReportPeriod(nextFilters));
    setMonthKey(getFocusMonth(nextFilters, inferReportPeriod(nextFilters)));
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

  const isDebt = summary.balance < 0;
  const scroogeVariant = isDebt ? "cute" : summary.count === 0 ? "group" : "comics";
  const periodLabel = getPeriodLabel(activePeriod, monthKey);
  const operationsLabel = formatRuCount(summary.count, ["операция", "операции", "операций"]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <ScroogeArt animate={false} className={styles.heroArt} size="sm" variant={scroogeVariant} />
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Отчёты</p>
            <p className={styles.heroMeta}>
              {periodLabel} · {operationsLabel}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className={styles.heroBalance}
          initial={{ opacity: 0.6, scale: 0.98 }}
          key={`${summary.balance}-${filters.type}-${filters.from}-${filters.to}`}
          transition={springSoft}
        >
          <span className={styles.balanceLabel}>Баланс за период</span>
          <Amount allowNegative size="xl" type={isDebt ? "debt" : "neutral"} value={summary.balance} />
          {isDebt && <p className={styles.debtHint}>Расходы больше доходов</p>}
        </motion.div>

        <div className={styles.heroTotals}>
          <div className={styles.heroTotal}>
            <span className={styles.heroTotalLabel}>Доход</span>
            <Amount signed={summary.income > 0} size="sm" type="income" value={summary.income} />
          </div>
          <div className={styles.heroTotal}>
            <span className={styles.heroTotalLabel}>Расход</span>
            <Amount signed={summary.expense > 0} size="sm" type="expense" value={summary.expense} />
          </div>
        </div>

        {extraFiltersActive && (
          <p className={styles.filtersActiveHint}>
            Сводка сужена фильтрами.{" "}
            <button className={styles.filtersActiveReset} onClick={resetFilters} type="button">
              Сбросить
            </button>
          </p>
        )}
      </section>

      <section className={styles.filters} aria-label="Фильтры отчёта">
        <div className={styles.segments} role="group" aria-label="Тип операций">
          {TYPE_OPTIONS.map((option) => (
            <button
              className={cn(styles.segment, filters.type === option.id && styles.segmentActive)}
              key={option.id}
              onClick={() => applyType(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.segments} role="group" aria-label="Период">
          {PERIOD_OPTIONS.map((option) => (
            <button
              className={cn(styles.segment, activePeriod === option.id && styles.segmentActive)}
              key={option.id}
              onClick={() => applyPeriod(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        {activePeriod === "month" && (
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
            <span className={styles.monthNavLabel}>{formatMonthNavLabel(monthKey)}</span>
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
        )}

        {visibleCategories.length > 0 && (
          <details className={styles.categoryPanel}>
            <summary className={styles.categorySummary}>
              <span>Категории</span>
              <ChevronDown aria-hidden className={styles.categoryChevron} size={18} strokeWidth={2} />
            </summary>
            <div className={styles.categoryChips}>
              {visibleCategories.map((category) => (
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
          </details>
        )}
      </section>

      <section className={styles.resultsSection} id="report-results">
        {summary.count === 0 ? (
          <Card className={styles.emptyFiltered} fullWidth gap="12">
            <ScroogeArt size="md" variant="group" />
            <p className={styles.emptyFilteredText}>
              {extraFiltersActive
                ? `За ${periodLabel.toLowerCase()} ничего не найдено. Ослабьте фильтры или смените период.`
                : `За ${periodLabel.toLowerCase()} нет операций. Смените период или добавьте записи в журнал.`}
            </p>
            {extraFiltersActive && (
              <Button onClick={resetFilters} type="button" variant="secondary">
                Сбросить фильтры
              </Button>
            )}
          </Card>
        ) : null}

        <div className={styles.chartsSection}>
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
                  {showIncome && (
                    <Bar dataKey="income" fill={CHART_COLORS.income} name="Доход" radius={[4, 4, 0, 0]}>
                      {monthlyChartData.map((entry) => (
                        <Cell
                          fill={CHART_COLORS.income}
                          key={`income-${entry.monthKey}`}
                          opacity={entry.monthKey === monthKey ? 1 : 0.45}
                        />
                      ))}
                    </Bar>
                  )}
                  {showExpense && (
                    <Bar dataKey="expense" fill={CHART_COLORS.expense} name="Расход" radius={[4, 4, 0, 0]}>
                      {monthlyChartData.map((entry) => (
                        <Cell
                          fill={CHART_COLORS.expense}
                          key={`expense-${entry.monthKey}`}
                          opacity={entry.monthKey === monthKey ? 1 : 0.45}
                        />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {byCategory.length > 0 && (
            <Card className={styles.chartCard} fullWidth gap="12">
              <h3 className={styles.chartTitle}>
                {pieType === "income" ? "Доходы по категориям" : "Расходы по категориям"}
              </h3>
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
            <h3 className={styles.chartTitle}>По дням · {formatMonthNavLabel(monthKey)}</h3>
            <div className={styles.chartBox}>
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={dailyChartData}>
                  <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                  <XAxis dataKey="day" stroke={CHART_COLORS.text} tick={{ fontSize: 12 }} />
                  <YAxis stroke={CHART_COLORS.text} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  <Legend />
                  {showIncome && (
                    <Line dataKey="income" dot={false} name="Доход" stroke={CHART_COLORS.income} strokeWidth={2} />
                  )}
                  {showExpense && (
                    <Line dataKey="expense" dot={false} name="Расход" stroke={CHART_COLORS.expense} strokeWidth={2} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {topItems.length > 0 && (
            <Card fullWidth gap="12">
              <h3 className={styles.chartTitle}>{pieType === "income" ? "Топ-5 доходов" : "Топ-5 трат"}</h3>
              <ul className={styles.topList}>
                {topItems.map((transaction) => {
                  const category = categoryMap.get(transaction.categoryId);
                  return (
                    <li className={styles.topItem} key={transaction.id}>
                      <div className={styles.topMeta}>
                        <span className={styles.topName}>
                          {category?.icon} {category?.name ?? "Без категории"}
                        </span>
                        {transaction.note && <span className={styles.topNote}>{transaction.note}</span>}
                      </div>
                      <Amount type={pieType} value={transaction.amount} />
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
