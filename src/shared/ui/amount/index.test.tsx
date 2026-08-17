import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Amount } from "@/shared/ui/amount";

describe("Amount", () => {
  it("shows a plus for income and a minus for expense when signed", () => {
    const { rerender } = render(<Amount signed type="income" value={1500} />);
    expect(screen.getByText((content, element) => element?.tagName === "SPAN" && content.startsWith("+"))).toBeInTheDocument();

    rerender(<Amount signed type="expense" value={1500} />);
    expect(screen.getByText((content, element) => element?.tagName === "SPAN" && content.startsWith("−"))).toBeInTheDocument();
  });

  it("marks a negative balance as debt", () => {
    render(<Amount allowNegative type="neutral" value={-500} />);
    expect(screen.getByText((content, element) => element?.tagName === "SPAN" && content.startsWith("−"))).toBeInTheDocument();
  });
});
