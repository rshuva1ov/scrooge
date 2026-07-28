import cn from "classnames";
import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes
} from "react";
import { createPortal } from "react-dom";

import { computeFixedMenuStyle } from "@/shared/lib/floatingMenu";

import styles from "./index.module.scss";

interface IFieldProps {
  label?: string;
  error?: string;
  className?: string;
}

interface ISelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ISelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange">, IFieldProps {
  children: ReactNode;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const parseOptions = (children: ReactNode): ISelectOption[] => {
  const options: ISelectOption[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement<{ value?: string; disabled?: boolean; children?: ReactNode }>(child)) {
      return;
    }

    if (child.type !== "option") {
      return;
    }

    options.push({
      value: String(child.props.value ?? ""),
      label: String(child.props.children ?? ""),
      disabled: Boolean(child.props.disabled)
    });
  });

  return options;
};

export const Select = ({
  label,
  error,
  className,
  id,
  children,
  value,
  onChange,
  disabled,
  name
}: ISelectProps) => {
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  const options = useMemo(() => parseOptions(children), [children]);
  const selectedValue = String(value ?? "");
  const selectedOption = options.find((option) => option.value === selectedValue);
  const open = menuStyle !== null;

  const close = () => setMenuStyle(null);

  const handleToggle = () => {
    if (open) {
      close();
      return;
    }

    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    setMenuStyle(computeFixedMenuStyle(trigger));
  };

  const handleSelect = (optionValue: string) => {
    onChange?.({ target: { value: optionValue } } as ChangeEvent<HTMLSelectElement>);
    close();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className={styles.selectWrap}>
        <button
          aria-controls={open ? `${selectId}-listbox` : undefined}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            styles.select,
            styles.selectTrigger,
            open && styles.selectTriggerOpen,
            error && styles.selectTriggerError
          )}
          disabled={disabled}
          id={selectId}
          name={name}
          onClick={handleToggle}
          ref={triggerRef}
          type="button"
        >
          <span className={styles.selectValue}>{selectedOption?.label ?? "Выберите"}</span>
        </button>
        <ChevronDown
          aria-hidden
          className={cn(styles.selectIcon, open && styles.selectIconOpen)}
          size={18}
          strokeWidth={2}
        />
        {open &&
          createPortal(
            <>
              <button
                aria-label="Закрыть список"
                className={styles.floatingBackdrop}
                onClick={close}
                type="button"
              />
              <ul
                aria-labelledby={selectId}
                className={styles.selectMenu}
                id={`${selectId}-listbox`}
                onKeyDown={handleMenuKeyDown}
                role="listbox"
                style={menuStyle}
                tabIndex={-1}
              >
                {options.map((option) => {
                  const isSelected = option.value === selectedValue;

                  return (
                    <li key={option.value} role="presentation">
                      <button
                        aria-selected={isSelected}
                        className={cn(styles.selectOption, isSelected && styles.selectOptionActive)}
                        disabled={option.disabled}
                        onClick={() => handleSelect(option.value)}
                        role="option"
                        type="button"
                      >
                        <span className={styles.selectOptionLabel}>{option.label}</span>
                        {isSelected && (
                          <Check aria-hidden className={styles.selectOptionCheck} size={16} strokeWidth={2.5} />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>,
            document.body
          )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
