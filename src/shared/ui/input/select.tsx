import cn from "classnames";
import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type SelectHTMLAttributes
} from "react";

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
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  const options = useMemo(() => parseOptions(children), [children]);
  const selectedValue = String(value ?? "");
  const selectedOption = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const frameId = requestAnimationFrame(() => {
      document.addEventListener("pointerdown", handlePointerDown);
    });

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange?.({ target: { value: optionValue } } as ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  };

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className={styles.selectWrap} ref={wrapRef}>
        <button
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
          onClick={() => setOpen((current) => !current)}
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
        {open && (
          <ul aria-labelledby={selectId} className={styles.selectMenu} role="listbox">
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
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
