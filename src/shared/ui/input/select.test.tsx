import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Select } from "@/shared/ui/input/select";

describe("Select", () => {
  it("opens the menu and selects an option", async () => {
    const onChange = vi.fn();

    render(
      <Select label="Тип" onChange={onChange} value="expense">
        <option value="expense">Расход</option>
        <option value="income">Доход</option>
      </Select>
    );

    fireEvent.click(screen.getByRole("button", { name: /тип/i }));

    fireEvent.click(await screen.findByRole("option", { name: /доход/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0].target.value).toBe("income");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes when Escape is pressed", async () => {
    render(
      <Select label="Тип" value="expense">
        <option value="expense">Расход</option>
        <option value="income">Доход</option>
      </Select>
    );

    fireEvent.click(screen.getByRole("button", { name: /тип/i }));
    const listbox = await screen.findByRole("listbox");

    fireEvent.keyDown(listbox, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("moves active option with arrow keys and selects with Enter", async () => {
    const onChange = vi.fn();

    render(
      <Select label="Тип" onChange={onChange} value="expense">
        <option value="expense">Расход</option>
        <option value="income">Доход</option>
      </Select>
    );

    fireEvent.click(screen.getByRole("button", { name: /тип/i }));
    const listbox = await screen.findByRole("listbox");

    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "Enter" });

    expect(onChange.mock.calls[0]?.[0].target.value).toBe("income");
  });
});
