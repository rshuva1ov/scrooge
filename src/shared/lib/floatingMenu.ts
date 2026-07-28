import type { CSSProperties } from "react";

const DEFAULT_GAP = 6;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

interface IMenuPositionOptions {
  width?: number;
  maxHeight?: number;
  gap?: number;
  minHeight?: number;
}

const getViewportHeight = () => {
  const visualHeight = window.visualViewport?.height;

  if (typeof visualHeight === "number" && visualHeight > 0) {
    return visualHeight;
  }

  return document.documentElement.clientHeight || window.innerHeight;
};

export const computeFixedMenuStyle = (
  trigger: HTMLElement,
  { width, maxHeight = 224, gap = DEFAULT_GAP, minHeight = 128 }: IMenuPositionOptions = {}
): CSSProperties => {
  const rect = trigger.getBoundingClientRect();
  const viewportTop = window.visualViewport?.offsetTop ?? 0;
  const viewportBottom = viewportTop + getViewportHeight();
  const menuWidth = width ?? rect.width;
  const spaceBelow = viewportBottom - rect.bottom - gap;
  const spaceAbove = rect.top - viewportTop - gap;
  const openUpward = spaceBelow < Math.min(maxHeight, minHeight) && spaceAbove > spaceBelow;
  const height = Math.min(maxHeight, Math.max(openUpward ? spaceAbove : spaceBelow, minHeight));
  const top = openUpward
    ? Math.max(viewportTop + gap, rect.top - gap - height)
    : rect.bottom + gap;

  return {
    position: "fixed",
    top,
    left: Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8)),
    width: menuWidth,
    maxHeight: height,
    zIndex: 50
  };
};

export const getFocusableElements = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.closest("[disabled], [aria-hidden='true']")
  );

export const trapFocusKeyDown = (event: KeyboardEvent, root: HTMLElement) => {
  if (event.key !== "Tab") {
    return;
  }

  const focusable = getFocusableElements(root);

  if (focusable.length === 0) {
    event.preventDefault();
    root.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey && (active === first || !root.contains(active))) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && (active === last || !root.contains(active))) {
    event.preventDefault();
    first.focus();
  }
};

export const attachDismissListeners = (onDismiss: () => void, ignoreRoot?: HTMLElement | null) => {
  const handleScroll = (event: Event) => {
    const target = event.target;

    if (
      ignoreRoot &&
      target instanceof Node &&
      (target === ignoreRoot || ignoreRoot.contains(target))
    ) {
      return;
    }

    onDismiss();
  };

  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", onDismiss);
  window.visualViewport?.addEventListener("resize", onDismiss);
  window.visualViewport?.addEventListener("scroll", onDismiss);

  return () => {
    window.removeEventListener("scroll", handleScroll, true);
    window.removeEventListener("resize", onDismiss);
    window.visualViewport?.removeEventListener("resize", onDismiss);
    window.visualViewport?.removeEventListener("scroll", onDismiss);
  };
};

export const moveActiveIndex = (
  current: number,
  key: "ArrowDown" | "ArrowUp" | "Home" | "End",
  length: number
) => {
  if (length <= 0) {
    return -1;
  }

  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return length - 1;
  }

  if (current < 0) {
    return key === "ArrowDown" ? 0 : length - 1;
  }

  if (key === "ArrowDown") {
    return (current + 1) % length;
  }

  return (current - 1 + length) % length;
};
