import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateInput } from "@/shared/ui/input/date";

describe("DateInput", () => {
  it("opens the calendar and selects a day", async () => {
    const onChange = vi.fn();

    render(<DateInput label="Дата" onChange={onChange} value="2026-07-15" />);

    fireEvent.click(screen.getByRole("button", { name: /дата/i }));

    expect(await screen.findByRole("dialog", { name: /дата/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "20" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0].target.value).toBe("2026-07-20");
    expect(screen.queryByRole("dialog", { name: /дата/i })).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    render(<DateInput label="Дата" value="2026-07-15" />);

    fireEvent.click(screen.getByRole("button", { name: /дата/i }));
    const dialog = await screen.findByRole("dialog", { name: /дата/i });

    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: /дата/i })).not.toBeInTheDocument();
  });
});
