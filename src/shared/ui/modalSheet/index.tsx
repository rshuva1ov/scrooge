import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import cn from "classnames";

import { getFocusableElements, trapFocusKeyDown } from "@/shared/lib/floatingMenu";
import { springSoft } from "@/shared/lib/motion/presets";

import styles from "./index.module.scss";

interface IModalSheetProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export const ModalSheet = ({ open, title, children, footer, onClose }: IModalSheetProps) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const sheetCleanupRef = useRef<(() => void) | null>(null);

  const handleOverlayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  const setSheetRef = (node: HTMLDivElement | null) => {
    sheetCleanupRef.current?.();
    sheetCleanupRef.current = null;

    if (!node) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusInitial = () => {
      const focusable = getFocusableElements(node);
      (focusable[0] ?? node).focus();
    };

    const frameId = requestAnimationFrame(focusInitial);

    const handleKeyDown = (event: Event) => {
      trapFocusKeyDown(event as globalThis.KeyboardEvent, node);
    };

    node.addEventListener("keydown", handleKeyDown);

    sheetCleanupRef.current = () => {
      cancelAnimationFrame(frameId);
      node.removeEventListener("keydown", handleKeyDown);
    };
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          animate={{ opacity: 1 }}
          className={styles.overlay}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key="modal-overlay"
          onClick={onClose}
          onKeyDown={handleOverlayKeyDown}
          role="presentation"
          tabIndex={-1}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            animate={{ y: 0 }}
            aria-label={title}
            aria-modal="true"
            className={cn(styles.sheet, { [styles.sheetWithFooter]: Boolean(footer) })}
            exit={{ y: "100%" }}
            initial={{ y: "100%" }}
            onClick={(event) => event.stopPropagation()}
            ref={setSheetRef}
            role="dialog"
            transformTemplate={({ y }) => {
              const offset = typeof y === "string" ? Number.parseFloat(y) : Number(y);

              if (!Number.isFinite(offset) || Math.abs(offset) < 0.5) {
                return "none";
              }

              return `translateY(${y})`;
            }}
            transition={springSoft}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <button aria-label="Закрыть" className={styles.close} onClick={onClose} type="button">
                <X size={20} />
              </button>
            </div>

            <div className={styles.body}>{children}</div>

            {footer ? <div className={styles.footer}>{footer}</div> : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
