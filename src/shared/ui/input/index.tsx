import cn from "classnames";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { DateInput } from "./date";
import { Select } from "./select";
import styles from "./index.module.scss";

export { DateInput, Select };

interface IFieldProps {
  label?: string;
  error?: string;
  className?: string;
}

interface IInputProps extends InputHTMLAttributes<HTMLInputElement>, IFieldProps {}

export const Input = ({ label, error, className, id, type, ...props }: IInputProps) => {
  if (type === "date") {
    return <DateInput className={className} error={error} id={id} label={label} {...props} />;
  }

  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

  return (
    <label className={cn(styles.field, className)} htmlFor={inputId}>
      {label && <span className={styles.label}>{label}</span>}
      <input className={styles.input} id={inputId} type={type} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
};

interface ITextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, IFieldProps {}

export const Textarea = ({ label, error, className, id, ...props }: ITextareaProps) => {
  const textareaId = id ?? label?.toLowerCase().replace(/\s/g, "-");

  return (
    <label className={cn(styles.field, className)} htmlFor={textareaId}>
      {label && <span className={styles.label}>{label}</span>}
      <textarea className={styles.textarea} id={textareaId} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
};
