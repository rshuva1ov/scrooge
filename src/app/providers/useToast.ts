import { createContext, useContext } from "react";

export interface IToastContextValue {
  showToast: (message: string, tone?: "success" | "error" | "info") => void;
}

export const ToastContext = createContext<IToastContextValue | null>(null);

export const useToast = (): IToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
