import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Введите название").max(40),
  type: z.enum(["income", "expense"]),
  color: z.string().min(1),
  icon: z.string().min(1).max(8)
});

export type TCategoryFormValues = z.infer<typeof categorySchema>;

export const CATEGORY_COLORS = ["#ffd700", "#daa520", "#b87333", "#8b4513", "#556b2f", "#cd853f", "#2d5016"];

export const CATEGORY_ICONS = [
  "💰",
  "🪙",
  "💵",
  "💳",
  "💸",
  "🏦",
  "📈",
  "💼",
  "🍽️",
  "🛒",
  "☕",
  "🍕",
  "🚗",
  "⛽",
  "🚌",
  "✈️",
  "🏠",
  "💡",
  "💧",
  "🔧",
  "📱",
  "🎭",
  "🎮",
  "🎵",
  "🏋️",
  "⚽",
  "👕",
  "💄",
  "💊",
  "🏥",
  "🎓",
  "📚",
  "👶",
  "🐾",
  "🎁",
  "🏖️",
  "🛡️",
  "🧾",
  "📁",
  "🎯",
  "🌿",
  "🛍️"
];
