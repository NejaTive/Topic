import type { IDragEvent } from '@vue-dnd-kit/core';

const SETTLE_MS = 280;

/** Посадка preview в открытый `[data-rank-drop-slot]` до обновления списка. */
export async function playDropSettleAnimation(e: IDragEvent): Promise<void> {
  if (typeof document === 'undefined') return;

  const target = document.querySelector<HTMLElement>(
    '.rank-dnd-drop-slot.is-open[data-rank-drop-slot]',
  );
  if (!target) return;

  const entry = e.provider.entities.draggingMap.entries().next().value as
    [HTMLElement, { initialOuterHTML?: string; initialRect?: DOMRect }] | undefined;
  if (!entry) return;

  const [, draggable] = entry;
  const html = draggable.initialOuterHTML;
  if (!html) return;

  const pos = e.provider.preview.position.value;
  const size = e.provider.preview.size.value;
  const startW = size?.width || draggable.initialRect?.width || target.offsetWidth;
  const startH = size?.height || draggable.initialRect?.height || target.offsetHeight;
  if (!pos || startW <= 0 || startH <= 0) return;

  const end = target.getBoundingClientRect();
  const clone = document.createElement('div');
  clone.setAttribute('data-rank-drop-fly', '');
  clone.style.cssText = [
    'position:fixed',
    `left:${pos.x}px`,
    `top:${pos.y}px`,
    `width:${startW}px`,
    `height:${startH}px`,
    'margin:0',
    'z-index:10000',
    'pointer-events:none',
    'transform-origin:top left',
    'will-change:transform',
    'filter:drop-shadow(0 12px 28px rgb(0 0 0 / 0.18))',
  ].join(';');
  clone.innerHTML = html;
  document.body.appendChild(clone);

  const dx = end.left - pos.x;
  const dy = end.top - pos.y;
  const sx = end.width / startW;
  const sy = end.height / startH;

  try {
    const anim = clone.animate(
      [
        { transform: 'translate(0px, 0px) scale(1, 1)' },
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
      ],
      {
        duration: SETTLE_MS,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'forwards',
      },
    );
    await anim.finished;
  } catch {
    // cancelled
  } finally {
    clone.remove();
  }
}
