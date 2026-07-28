import cn from "classnames";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type KeyboardEvent
} from "react";

import { dayjs, formatDisplayDate, formatMonthLabel, toInputDate } from "@/shared/lib/dates";
import { computeFixedMenuStyle } from "@/shared/lib/floatingMenu";
import { FloatingPortal } from "@/shared/ui/floatingPortal";

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

  const startOfMonth = viewMonth.startOf("month");
  const gridStart = startOfMonth.subtract((startOfMonth.day() + 6) % 7, "day");
  const days = Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));

  const close = () => setMenuStyle(null);

  const isDayDisabled = (date: dayjs.Dayjs) =>
    Boolean(
      (minDate?.isValid() && date.isBefore(minDate, "day")) ||
        (maxDate?.isValid() && date.isAfter(maxDate, "day"))
    );

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

  const handleSelectDay = (date: dayjs.Dayjs) => {
    if (isDayDisabled(date)) {
      return;
    }

    onChange?.({
      target: { value: date.format("YYYY-MM-DD"), name: name ?? "" }
    } as ChangeEvent<HTMLInputElement>);
    close();
    triggerRef.current?.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
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
          className={cn(styles.input, styles.dateTrigger, {
            [styles.dateTriggerOpen]: open,
            [styles.dateTriggerError]: Boolean(error)
          })}
          disabled={disabled}
          id={inputId}
          name={name}
          onClick={handleToggle}
          ref={triggerRef}
          type="button"
        >
          <span className={cn(styles.dateValue, { [styles.datePlaceholder]: !selectedDate?.isValid() })}>
            {selectedDate?.isValid() ? formatDisplayDate(selectedDate.toDate()) : "Выберите дату"}
          </span>
          <Calendar aria-hidden className={styles.dateIcon} size={18} strokeWidth={2} />
        </button>
        {open && (
          <FloatingPortal
            ariaLabel={label ?? "Календарь"}
            className={styles.dateMenu}
            onClose={close}
            onKeyDown={handleMenuKeyDown}
            style={menuStyle}
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
              <span className={styles.dateMonth}>{formatMonthLabel(viewMonth.toDate())}</span>
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
                const isSelected = Boolean(selectedDate?.isValid() && date.isSame(selectedDate, "day"));
                const isToday = date.isSame(dayjs(), "day");

                return (
                  <button
                    aria-current={isToday ? "date" : undefined}
                    aria-pressed={isSelected}
                    className={cn(styles.dateDay, {
                      [styles.dateDayOutside]: isOutside,
                      [styles.dateDaySelected]: isSelected,
                      [styles.dateDayToday]: isToday && !isSelected
                    })}
                    disabled={isDayDisabled(date)}
                    key={iso}
                    onClick={() => handleSelectDay(date)}
                    type="button"
                  >
                    {date.date()}
                  </button>
                );
              })}
            </div>
          </FloatingPortal>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
