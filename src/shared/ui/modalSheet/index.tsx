import { X } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./index.module.scss";

interface IModalSheetProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export const ModalSheet = ({ title, children, onClose }: IModalSheetProps) => (
  <div className={styles.overlay} onClick={onClose} role="presentation">
    <div
      className={styles.sheet}
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button aria-label="Закрыть" className={styles.close} onClick={onClose} type="button">
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);
