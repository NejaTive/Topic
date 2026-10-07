const FLIP_MS = 220;
const FLIP_EASE = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

/** Snapshot tops → после смены drop-slot анимировать translateY соседей. */
export function captureRankGapFlip(): (() => void) | null {
  if (typeof document === 'undefined') return null;

  const nodes = document.querySelectorAll<HTMLElement>(
    '.rank-dnd-list > .rank-dnd-item:not(.rank-dnd-source-collapsed)',
  );
  if (nodes.length === 0) return null;

  const first = new Map<HTMLElement, number>();
  nodes.forEach((el) => {
    first.set(el, el.getBoundingClientRect().top);
  });

  return () => {
    first.forEach((prevTop, el) => {
      if (!el.isConnected) return;
      const dy = prevTop - el.getBoundingClientRect().top;
      if (Math.abs(dy) < 0.5) return;
      el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], {
        duration: FLIP_MS,
        easing: FLIP_EASE,
      });
    });
  };
}
