export type TCategoryType = "income" | "expense";

export interface TCategory {
  id: string;
  name: string;
  type: TCategoryType;
  color: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: TCategory[] = [
  { id: "inc-salary", name: "Зарплата", type: "income", color: "#ffd700", icon: "💰" },
  { id: "inc-other", name: "Прочий доход", type: "income", color: "#daa520", icon: "🪙" },
  { id: "exp-food", name: "Еда", type: "expense", color: "#8b4513", icon: "🍽️" },
  { id: "exp-transport", name: "Транспорт", type: "expense", color: "#556b2f", icon: "🚗" },
  { id: "exp-fun", name: "Развлечения", type: "expense", color: "#cd853f", icon: "🎭" }
];
