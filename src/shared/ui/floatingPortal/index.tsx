import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { attachDismissListeners } from "@/shared/lib/floatingMenu";

import styles from "./index.module.scss";

interface IFloatingPortalProps {
  style: CSSProperties;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  id?: string;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}

export const FloatingPortal = ({
  style,
  onClose,
  children,
  className,
  role = "dialog",
  ariaLabel,
  ariaLabelledBy,
  id,
  onKeyDown
}: IFloatingPortalProps) => {
  const dismissCleanupRef = useRef<(() => void) | null>(null);

  const setMenuRef = (node: HTMLDivElement | null) => {
    dismissCleanupRef.current?.();
    dismissCleanupRef.current = null;

    if (node) {
      dismissCleanupRef.current = attachDismissListeners(onClose, node);
    }
  };

  return createPortal(
    <>
      <button aria-label="Закрыть" className={styles.backdrop} onClick={onClose} type="button" />
      <div
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={className}
        id={id}
        onKeyDown={onKeyDown}
        ref={setMenuRef}
        role={role}
        style={style}
        tabIndex={-1}
      >
        {children}
      </div>
    </>,
    document.body
  );
};
