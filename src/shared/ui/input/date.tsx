import cn from "classnames";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type KeyboardEvent
} from "react";
import { createPortal } from "react-dom";

import { dayjs, formatDisplayDate, toInputDate } from "@/shared/lib/dates";
import { computeFixedMenuStyle } from "@/shared/lib/floatingMenu";

import styles from "./index.module.scss";

interface IFieldProps {
  label?: string;
  error?: string;
  className?: string;
}

interface IDateInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">,
    IFieldProps {
  value?: string | number | readonly string[];
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const MENU_WIDTH = 20.5 * 16;
const MENU_MAX_HEIGHT = 20 * 16;

const toDateValue = (value: IDateInputProps["value"]): string => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return toInputDate(new Date(value));
  }

  return "";
};

const getMonthFromValue = (selectedValue: string) => {
  const selectedDate = selectedValue ? dayjs(selectedValue, "YYYY-MM-DD", true) : null;

  return (selectedDate?.isValid() ? selectedDate : dayjs()).startOf("month");
};

export const DateInput = ({
  label,
  error,
  className,
  id,
  value,
  onChange,
  disabled,
  name,
  min,
  max
}: IDateInputProps) => {
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const selectedValue = toDateValue(value);
  const selectedDate = selectedValue ? dayjs(selectedValue, "YYYY-MM-DD", true) : null;
  const [viewMonth, setViewMonth] = useState(() => getMonthFromValue(selectedValue));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  const open = menuStyle !== null;

  const minDate = typeof min === "string" && min ? dayjs(min, "YYYY-MM-DD", true) : null;
  const maxDate = typeof max === "string" && max ? dayjs(max, "YYYY-MM-DD", true) : null;

  const days = useMemo(() => {
    const startOfMonth = viewMonth.startOf("month");
    const startOffset = (startOfMonth.day() + 6) % 7;
    const gridStart = startOfMonth.subtract(startOffset, "day");

    return Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));
  }, [viewMonth]);

  const monthLabel = useMemo(() => {
    const labelText = viewMonth.format("MMMM YYYY");
    return labelText.charAt(0).toUpperCase() + labelText.slice(1);
  }, [viewMonth]);

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

    setViewMonth(getMonthFromValue(selectedValue));
    setMenuStyle(
      computeFixedMenuStyle(trigger, {
        width: Math.min(MENU_WIDTH, window.innerWidth - 16),
        maxHeight: MENU_MAX_HEIGHT,
        minHeight: 12 * 16
      })
    );
  };

  const emitChange = (nextValue: string) => {
    onChange?.({ target: { value: nextValue, name: name ?? "" } } as ChangeEvent<HTMLInputElement>);
  };

  const handleSelectDay = (date: dayjs.Dayjs) => {
    if (minDate?.isValid() && date.isBefore(minDate, "day")) {
      return;
    }

    if (maxDate?.isValid() && date.isAfter(maxDate, "day")) {
      return;
    }

    emitChange(date.format("YYYY-MM-DD"));
    close();
  };

  const isDisabledDay = (date: dayjs.Dayjs) => {
    if (minDate?.isValid() && date.isBefore(minDate, "day")) {
      return true;
    }

    if (maxDate?.isValid() && date.isAfter(maxDate, "day")) {
      return true;
    }

    return false;
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={styles.dateWrap}>
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            styles.input,
            styles.dateTrigger,
            open && styles.dateTriggerOpen,
            error && styles.dateTriggerError
          )}
          disabled={disabled}
          id={inputId}
          name={name}
          onClick={handleToggle}
          ref={triggerRef}
          type="button"
        >
          <span className={cn(styles.dateValue, !selectedDate?.isValid() && styles.datePlaceholder)}>
            {selectedDate?.isValid() ? formatDisplayDate(selectedDate.toDate()) : "Выберите дату"}
          </span>
          <Calendar aria-hidden className={styles.dateIcon} size={18} strokeWidth={2} />
        </button>
        {open &&
          createPortal(
            <>
              <button
                aria-label="Закрыть календарь"
                className={styles.floatingBackdrop}
                onClick={close}
                type="button"
              />
              <div
                aria-label={label ?? "Календарь"}
                className={styles.dateMenu}
                onKeyDown={handleMenuKeyDown}
                role="dialog"
                style={menuStyle}
                tabIndex={-1}
              >
                <div className={styles.dateHeader}>
                  <button
                    aria-label="Предыдущий месяц"
                    className={styles.dateNav}
                    onClick={() => setViewMonth((current) => current.subtract(1, "month"))}
                    type="button"
                  >
                    <ChevronLeft size={18} strokeWidth={2} />
                  </button>
                  <span className={styles.dateMonth}>{monthLabel}</span>
                  <button
                    aria-label="Следующий месяц"
                    className={styles.dateNav}
                    onClick={() => setViewMonth((current) => current.add(1, "month"))}
                    type="button"
                  >
                    <ChevronRight size={18} strokeWidth={2} />
                  </button>
                </div>

                <div className={styles.dateWeekdays}>
                  {WEEKDAYS.map((weekday) => (
                    <span className={styles.dateWeekday} key={weekday}>
                      {weekday}
                    </span>
                  ))}
                </div>

                <div className={styles.dateGrid}>
                  {days.map((date) => {
                    const iso = date.format("YYYY-MM-DD");
                    const isOutside = !date.isSame(viewMonth, "month");
                    const isSelected = selectedDate?.isValid() && date.isSame(selectedDate, "day");
                    const isToday = date.isSame(dayjs(), "day");
                    const isDayDisabled = isDisabledDay(date);

                    return (
                      <button
                        aria-current={isToday ? "date" : undefined}
                        aria-pressed={isSelected}
                        className={cn(
                          styles.dateDay,
                          isOutside && styles.dateDayOutside,
                          isSelected && styles.dateDaySelected,
                          isToday && !isSelected && styles.dateDayToday
                        )}
                        disabled={isDayDisabled}
                        key={iso}
                        onClick={() => handleSelectDay(date)}
                        type="button"
                      >
                        {date.date()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>,
            document.body
          )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
