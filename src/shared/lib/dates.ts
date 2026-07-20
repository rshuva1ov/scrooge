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
