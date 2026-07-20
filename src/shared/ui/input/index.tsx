import cn from "classnames";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import styles from "./index.module.scss";

interface IFieldProps {
  label?: string;
  error?: string;
  className?: string;
}

interface IInputProps extends InputHTMLAttributes<HTMLInputElement>, IFieldProps {}

export const Input = ({ label, error, className, id, ...props }: IInputProps) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

  return (
    <label className={cn(styles.field, className)} htmlFor={inputId}>
      {label && <span className={styles.label}>{label}</span>}
      <input className={styles.input} id={inputId} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
};

interface ISelectProps extends SelectHTMLAttributes<HTMLSelectElement>, IFieldProps {
  children: ReactNode;
}

export const Select = ({ label, error, className, id, children, ...props }: ISelectProps) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");

  return (
    <label className={cn(styles.field, className)} htmlFor={selectId}>
      {label && <span className={styles.label}>{label}</span>}
      <select className={styles.select} id={selectId} {...props}>
        {children}
      </select>
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
