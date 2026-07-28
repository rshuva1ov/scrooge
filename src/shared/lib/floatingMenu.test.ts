import { afterEach, describe, expect, it, vi } from "vitest";

import {
  attachDismissListeners,
  computeFixedMenuStyle,
  getFocusableElements,
  moveActiveIndex,
  trapFocusKeyDown
} from "@/shared/lib/floatingMenu";

const mockRect = (overrides: Partial<DOMRect> = {}): DOMRect =>
  ({
    x: 0,
    y: 0,
    top: 100,
    right: 300,
    bottom: 140,
    left: 20,
    width: 280,
    height: 40,
    toJSON: () => ({}),
    ...overrides
  }) as DOMRect;

describe("computeFixedMenuStyle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens below the trigger when there is enough space", () => {
    vi.stubGlobal("innerWidth", 400);
    vi.stubGlobal("innerHeight", 800);

    const trigger = document.createElement("button");
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 100, bottom: 140, left: 20, width: 280, right: 300 })
    );

    const style = computeFixedMenuStyle(trigger);

    expect(style.position).toBe("fixed");
    expect(style.top).toBe(146);
    expect(style.width).toBe(280);
    expect(style.left).toBe(20);
    expect(style.zIndex).toBe(50);
  });

  it("opens upward when there is more space above", () => {
    vi.stubGlobal("innerWidth", 400);
    vi.stubGlobal("innerHeight", 200);

    const trigger = document.createElement("button");
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 160, bottom: 190, left: 20, width: 280, right: 300, height: 30 })
    );

    const style = computeFixedMenuStyle(trigger, { maxHeight: 224, minHeight: 128 });

    expect(typeof style.top).toBe("number");
    expect(Number(style.top)).toBeLessThan(160);
  });

  it("keeps the menu inside the viewport horizontally", () => {
    vi.stubGlobal("innerWidth", 320);
    vi.stubGlobal("innerHeight", 800);

    const trigger = document.createElement("button");
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(
      mockRect({ top: 40, bottom: 80, left: 200, width: 200, right: 400 })
    );

    const style = computeFixedMenuStyle(trigger, { width: 200 });

    expect(style.left).toBe(112);
    expect(style.width).toBe(200);
  });
});

describe("moveActiveIndex", () => {
  it("moves within bounds and wraps around", () => {
    expect(moveActiveIndex(0, "ArrowDown", 3)).toBe(1);
    expect(moveActiveIndex(2, "ArrowDown", 3)).toBe(0);
    expect(moveActiveIndex(0, "ArrowUp", 3)).toBe(2);
    expect(moveActiveIndex(1, "Home", 3)).toBe(0);
    expect(moveActiveIndex(1, "End", 3)).toBe(2);
  });

  it("returns -1 for empty lists", () => {
    expect(moveActiveIndex(0, "ArrowDown", 0)).toBe(-1);
  });

  it("starts from edges when nothing is active", () => {
    expect(moveActiveIndex(-1, "ArrowDown", 4)).toBe(0);
    expect(moveActiveIndex(-1, "ArrowUp", 4)).toBe(3);
  });
});

describe("focus helpers", () => {
  it("collects focusable elements inside a root", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <button type="button">One</button>
      <button type="button" disabled>Disabled</button>
      <input />
      <a href="#link">Link</a>
      <div tabindex="-1">Skip</div>
    `;

    const focusable = getFocusableElements(root).map((element) => element.tagName.toLowerCase());

    expect(focusable).toEqual(["button", "input", "a"]);
  });

  it("traps tab focus inside the root", () => {
    const root = document.createElement("div");
    const first = document.createElement("button");
    const last = document.createElement("button");
    first.textContent = "First";
    last.textContent = "Last";
    root.append(first, last);
    document.body.append(root);
    last.focus();

    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    const preventDefault = vi.spyOn(event, "preventDefault");

    trapFocusKeyDown(event, root);

    expect(preventDefault).toHaveBeenCalled();
    expect(document.activeElement).toBe(first);

    root.remove();
  });
});

describe("attachDismissListeners", () => {
  it("calls onDismiss on scroll and resize and cleans up", () => {
    const onDismiss = vi.fn();
    const cleanup = attachDismissListeners(onDismiss);

    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));

    expect(onDismiss).toHaveBeenCalledTimes(2);

    cleanup();
    window.dispatchEvent(new Event("resize"));

    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it("does not dismiss when scrolling inside the ignore root", () => {
    const onDismiss = vi.fn();
    const menu = document.createElement("div");
    document.body.append(menu);

    const cleanup = attachDismissListeners(onDismiss, menu);
    menu.dispatchEvent(new Event("scroll", { bubbles: true }));

    expect(onDismiss).not.toHaveBeenCalled();

    window.dispatchEvent(new Event("scroll"));
    expect(onDismiss).toHaveBeenCalledTimes(1);

    cleanup();
    menu.remove();
  });
});
