import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { springSoft } from "@/shared/lib/motion/presets";

import styles from "./index.module.scss";

interface IModalSheetProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export const ModalSheet = ({ open, title, children, onClose }: IModalSheetProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        animate={{ opacity: 1 }}
        className={styles.overlay}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        key="modal-overlay"
        onClick={onClose}
        role="presentation"
        transition={{ duration: 0.18 }}
      >
        <motion.div
          animate={{ y: 0 }}
          aria-label={title}
          aria-modal="true"
          className={styles.sheet}
          exit={{ y: "100%" }}
          initial={{ y: "100%" }}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          transition={springSoft}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button aria-label="Закрыть" className={styles.close} onClick={onClose} type="button">
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
