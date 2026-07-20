import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { springSnappy } from "@/shared/lib/motion/presets";

import styles from "./toastProvider.module.scss";

interface IToast {
  id: string;
  message: string;
  tone?: "success" | "error" | "info";
}

interface IToastContextValue {
  showToast: (message: string, tone?: IToast["tone"]) => void;
}

const ToastContext = createContext<IToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<IToast[]>([]);

  const showToast = useCallback((message: string, tone: IToast["tone"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2600);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className={styles.viewport}>
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={styles.toast}
              data-tone={toast.tone}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              key={toast.id}
              layout
              transition={springSnappy}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): IToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
