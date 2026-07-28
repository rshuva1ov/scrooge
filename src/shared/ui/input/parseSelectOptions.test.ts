import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { parseSelectOptions } from "@/shared/ui/input/parseSelectOptions";

describe("parseSelectOptions", () => {
  it("parses option children into values and labels", () => {
    const options = parseSelectOptions([
      createElement("option", { value: "expense", key: "expense" }, "Расход"),
      createElement("option", { value: "income", key: "income", disabled: true }, "Доход")
    ]);

    expect(options).toEqual([
      { value: "expense", label: "Расход", disabled: false },
      { value: "income", label: "Доход", disabled: true }
    ]);
  });

  it("ignores non-option children", () => {
    const options = parseSelectOptions([
      createElement("div", { key: "div" }, "Nope"),
      createElement("option", { value: "all", key: "all" }, "Все")
    ]);

    expect(options).toEqual([{ value: "all", label: "Все", disabled: false }]);
  });

  it("stringifies missing values", () => {
    const options = parseSelectOptions([createElement("option", { key: "empty" }, "Пусто")]);

    expect(options[0]).toEqual({ value: "", label: "Пусто", disabled: false });
  });
});
