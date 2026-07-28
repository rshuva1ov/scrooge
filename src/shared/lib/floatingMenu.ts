import type { CSSProperties } from "react";

const DEFAULT_GAP = 6;

interface IMenuPositionOptions {
  width?: number;
  maxHeight?: number;
  gap?: number;
  minHeight?: number;
}

const getViewportHeight = () =>
  window.visualViewport?.height ?? document.documentElement.clientHeight ?? window.innerHeight;

export const computeFixedMenuStyle = (
  trigger: HTMLElement,
  { width, maxHeight = 224, gap = DEFAULT_GAP, minHeight = 128 }: IMenuPositionOptions = {}
): CSSProperties => {
  const rect = trigger.getBoundingClientRect();
  const viewportTop = window.visualViewport?.offsetTop ?? 0;
  const viewportHeight = getViewportHeight();
  const viewportBottom = viewportTop + viewportHeight;
  const menuWidth = width ?? rect.width;
  const spaceBelow = viewportBottom - rect.bottom - gap;
  const spaceAbove = rect.top - viewportTop - gap;
  const openUpward = spaceBelow < Math.min(maxHeight, minHeight) && spaceAbove > spaceBelow;
  const available = Math.max(openUpward ? spaceAbove : spaceBelow, minHeight);
  const height = Math.min(maxHeight, available);
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
