import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ModalSheet } from "@/shared/ui/modalSheet";

describe("ModalSheet", () => {
  it("renders title, body, footer and closes from the header button", () => {
    const onClose = vi.fn();

    render(
      <ModalSheet
        footer={<button type="button">Сохранить</button>}
        onClose={onClose}
        open
        title="Новая категория"
      >
        <p>Контент формы</p>
      </ModalSheet>
    );

    expect(screen.getByRole("dialog", { name: /новая категория/i })).toBeInTheDocument();
    expect(screen.getByText("Контент формы")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /сохранить/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /закрыть/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape from the overlay", () => {
    const onClose = vi.fn();

    render(
      <ModalSheet onClose={onClose} open title="Новая операция">
        <p>Форма</p>
      </ModalSheet>
    );

    fireEvent.keyDown(screen.getByRole("presentation"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when closed", () => {
    render(
      <ModalSheet onClose={vi.fn()} open={false} title="Скрыто">
        <p>Не видно</p>
      </ModalSheet>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
