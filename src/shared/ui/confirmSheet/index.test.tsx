import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfirmSheet } from "@/shared/ui/confirmSheet";

describe("ConfirmSheet", () => {
  it("asks for confirmation and can be cancelled", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmSheet
        description="Операция будет удалена без возможности восстановления"
        onClose={onClose}
        onConfirm={onConfirm}
        open
        title="Удалить операцию?"
      />
    );

    expect(screen.getByRole("dialog", { name: /удалить операцию/i })).toBeInTheDocument();
    expect(screen.getByText(/будет удалена/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /отмена/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirms from the danger button", () => {
    const onConfirm = vi.fn();

    render(
      <ConfirmSheet
        confirmLabel="Удалить"
        description="Категория исчезнет из списка"
        onClose={vi.fn()}
        onConfirm={onConfirm}
        open
        title="Удалить категорию?"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /^удалить$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("blocks dismiss while busy", () => {
    const onClose = vi.fn();

    render(
      <ConfirmSheet
        description="Идёт удаление"
        isBusy
        onClose={onClose}
        onConfirm={vi.fn()}
        open
        title="Удалить операцию?"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /закрыть/i }));
    fireEvent.keyDown(screen.getByRole("presentation"), { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /удаление/i })).toBeDisabled();
  });
});
