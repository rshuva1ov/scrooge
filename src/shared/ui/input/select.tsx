import cn from "classnames";
import { Check, ChevronDown } from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes
} from "react";

import { computeFixedMenuStyle, moveActiveIndex } from "@/shared/lib/floatingMenu";
import { FloatingPortal } from "@/shared/ui/floatingPortal";

import styles from "./index.module.scss";
import { parseSelectOptions } from "./parseSelectOptions";

interface IFieldProps {
  label?: string;
  error?: string;
  className?: string;
}

interface ISelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange">, IFieldProps {
  children: ReactNode;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}

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
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  const options = parseSelectOptions(children);
  const enabledIndexes = options.flatMap((option, index) => (option.disabled ? [] : [index]));
  const selectedValue = String(value ?? "");
  const selectedOption = options.find((option) => option.value === selectedValue);
  const open = menuStyle !== null;

  const close = () => {
    setMenuStyle(null);
    setActiveIndex(-1);
  };

  const handleToggle = () => {
    if (open) {
      close();
      return;
    }

    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const selectedIndex = options.findIndex((option) => option.value === selectedValue && !option.disabled);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? -1));
    setMenuStyle(computeFixedMenuStyle(trigger));
  };

  const handleSelect = (optionValue: string) => {
    onChange?.({ target: { value: optionValue } } as ChangeEvent<HTMLSelectElement>);
    close();
    triggerRef.current?.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];

      if (option && !option.disabled) {
        handleSelect(option.value);
      }

      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();

      if (enabledIndexes.length === 0) {
        return;
      }

      const nextEnabledPos = moveActiveIndex(
        enabledIndexes.indexOf(activeIndex),
        event.key,
        enabledIndexes.length
      );
      setActiveIndex(enabledIndexes[nextEnabledPos] ?? -1);
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
          className={cn(styles.select, styles.selectTrigger, {
            [styles.selectTriggerOpen]: open,
            [styles.selectTriggerError]: Boolean(error)
          })}
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
          className={cn(styles.selectIcon, { [styles.selectIconOpen]: open })}
          size={18}
          strokeWidth={2}
        />
        {open && (
          <FloatingPortal
            ariaLabelledBy={selectId}
            className={styles.selectMenu}
            id={`${selectId}-listbox`}
            onClose={close}
            onKeyDown={handleMenuKeyDown}
            role="listbox"
            style={menuStyle}
          >
            <ul>
              {options.map((option, index) => {
                const isSelected = option.value === selectedValue;

                return (
                  <li key={option.value} role="presentation">
                    <button
                      aria-selected={isSelected}
                      className={cn(styles.selectOption, {
                        [styles.selectOptionActive]: isSelected || index === activeIndex
                      })}
                      disabled={option.disabled}
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => {
                        if (!option.disabled) {
                          setActiveIndex(index);
                        }
                      }}
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
          </FloatingPortal>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
