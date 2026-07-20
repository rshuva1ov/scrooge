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

export const formatShortDate = (date: string | Date): string => dayjs(date).format("D MMM");

export const formatMonthLabel = (date: string | Date): string => {
  const label = dayjs(date).format("MMMM YYYY");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const getMonthKey = (date: string | Date): string => dayjs(date).format("YYYY-MM");

export const getMonthRange = (monthKey: string): { from: string; to: string } => {
  const month = dayjs(`${monthKey}-01`);
  const today = dayjs();
  const to = month.isSame(today, "month")
    ? today.format("YYYY-MM-DD")
    : month.endOf("month").format("YYYY-MM-DD");

  return {
    from: month.startOf("month").format("YYYY-MM-DD"),
    to
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
