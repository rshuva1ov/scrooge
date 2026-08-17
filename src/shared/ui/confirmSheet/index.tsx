import type { ReactNode } from "react";

import { Button } from "@/shared/ui/button";
import { ModalSheet } from "@/shared/ui/modalSheet";

import styles from "./index.module.scss";

interface IConfirmSheetProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busyLabel?: string;
  isBusy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmSheet = ({
  open,
  title,
  description,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  busyLabel = "Удаление...",
  isBusy = false,
  onConfirm,
  onClose
}: IConfirmSheetProps) => (
  <ModalSheet
    footer={
      <div className={styles.actions}>
        <Button disabled={isBusy} fullWidth onClick={onClose} type="button" variant="secondary">
          {cancelLabel}
        </Button>
        <Button disabled={isBusy} fullWidth onClick={onConfirm} type="button" variant="danger">
          {isBusy ? busyLabel : confirmLabel}
        </Button>
      </div>
    }
    onClose={() => {
      if (!isBusy) {
        onClose();
      }
    }}
    open={open}
    title={title}
  >
    <p className={styles.description}>{description}</p>
  </ModalSheet>
);
