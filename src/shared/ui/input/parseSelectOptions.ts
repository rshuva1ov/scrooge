import { Children, isValidElement, type ReactNode } from "react";

export interface ISelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const parseSelectOptions = (children: ReactNode): ISelectOption[] => {
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
