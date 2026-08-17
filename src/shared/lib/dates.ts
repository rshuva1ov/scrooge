import dayjs from "dayjs";
import "dayjs/locale/ru";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale("ru");

export { dayjs };

export const toInputDate = (date: string | Date): string => dayjs(date).format("YYYY-MM-DD");

export const formatDisplayDate = (date: string | Date): string => dayjs(date).format("D MMM YYYY");

export const formatMonthLabel = (date: string | Date): string => {
  const label = dayjs(date).format("MMMM YYYY");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const getMonthKey = (date: string | Date): string => dayjs(date).format("YYYY-MM");

export const getMonthRange = (monthKey: string): { from: string; to: string } => {
  const month = dayjs(`${monthKey}-01`);

  return {
    from: month.startOf("month").format("YYYY-MM-DD"),
    to: month.endOf("month").format("YYYY-MM-DD")
  };
};

export const shiftMonthKey = (monthKey: string, delta: number): string =>
  dayjs(`${monthKey}-01`).add(delta, "month").format("YYYY-MM");

export const formatMonthNavLabel = (monthKey: string): string => formatMonthLabel(`${monthKey}-01`);

export const getChartMonthKey = (filters: { from: string | null; to: string | null }): string => {
  if (filters.from) {
    return getMonthKey(filters.from);
  }

  return getMonthKey(new Date());
};

export type TPeriodPreset = "today" | "week" | "month" | "year" | "all";

export const getPeriodRange = (preset: TPeriodPreset): { from: string | null; to: string | null } => {
  const today = dayjs();

  switch (preset) {
    case "today":
      return { from: today.format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "week":
      return { from: today.subtract(6, "day").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "month":
      return { from: today.startOf("month").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "year":
      return { from: today.startOf("year").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "all":
    default:
      return { from: null, to: null };
  }
};

export const inferPeriodPreset = (filters: { from: string | null; to: string | null }): TPeriodPreset => {
  const presets: TPeriodPreset[] = ["today", "week", "month", "year", "all"];

  for (const preset of presets) {
    const range = getPeriodRange(preset);
    if (range.from === filters.from && range.to === filters.to) {
      return preset;
    }
  }

  return "all";
};
