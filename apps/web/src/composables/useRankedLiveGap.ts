import { type IDragEvent, type IPlacement } from '@vue-dnd-kit/core';
import { computed, nextTick, ref, type Ref } from 'vue';
import type { ItemDto } from '@/api/items';
import { captureRankGapFlip } from '@/lib/dnd-gap-flip';

type DragSource = 'ranked' | 'inbox';

function verticalInsertSide(placement: IPlacement | undefined): 'before' | 'after' | null {
  if (!placement || placement.center) return null;
  if (placement.top && !placement.bottom) return 'before';
  if (placement.bottom && !placement.top) return 'after';
  if (placement.top) return 'before';
  if (placement.bottom) return 'after';
  return null;
}

export function useRankedLiveGap(ranked: Ref<ItemDto[]>, inbox: Ref<ItemDto[]>) {
  const draggingId = ref<string | null>(null);
  const sourceMode = ref<DragSource | null>(null);
  const fromIndex = ref<number | null>(null);
  const insertAt = ref<number | null>(null);
  const flipReady = ref(false);

  const active = computed(() => draggingId.value != null && sourceMode.value != null);

  function reset() {
    flipReady.value = false;
    draggingId.value = null;
    sourceMode.value = null;
    fromIndex.value = null;
    insertAt.value = null;
  }

  function armFlip() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (draggingId.value != null) flipReady.value = true;
      });
    });
  }

  function setInsertAt(next: number | null) {
    if (insertAt.value === next) return;
    const play = flipReady.value ? captureRankGapFlip() : null;
    insertAt.value = next;
    if (play) void nextTick(play);
  }

  function isSource(itemId: string) {
    return draggingId.value === itemId;
  }

  function peekInsertAt(): number | null {
    return insertAt.value;
  }

  function onDragStart(e: IDragEvent) {
    const meta = e.draggedItems[0]?.data as { id?: string; mode?: DragSource } | undefined;
    if (!meta?.id || (meta.mode !== 'ranked' && meta.mode !== 'inbox')) return;

    flipReady.value = false;

    if (meta.mode === 'ranked') {
      const index = ranked.value.findIndex((item) => item.id === meta.id);
      if (index < 0) return;
      draggingId.value = meta.id;
      sourceMode.value = 'ranked';
      fromIndex.value = index;
      insertAt.value = index;
      armFlip();
      return;
    }

    const index = inbox.value.findIndex((item) => item.id === meta.id);
    if (index < 0) return;
    draggingId.value = meta.id;
    sourceMode.value = 'inbox';
    fromIndex.value = index;
    insertAt.value = null;
    armFlip();
  }

  function resolveRankedInsert(e: IDragEvent, adjustFrom: number | null): number | null {
    const list = ranked.value;
    const { hovered, entities } = e.provider;

    const hoveredEl = hovered.draggable.keys().next().value as HTMLElement | undefined;
    if (hoveredEl) {
      const entity = entities.draggableMap.get(hoveredEl);
      const payload = entity?.payload?.();
      const data = entity?.data?.() as { id?: string; mode?: string } | undefined;

      if (
        Array.isArray(payload) &&
        payload.length >= 2 &&
        payload[1] === list &&
        data?.id &&
        data.id !== draggingId.value
      ) {
        const hoverIndex = Number(payload[0]);
        const side = verticalInsertSide(hovered.draggable.get(hoveredEl));
        if (side) {
          const raw = side === 'before' ? hoverIndex : hoverIndex + 1;
          if (adjustFrom != null && adjustFrom < raw) return raw - 1;
          return raw;
        }
      }
    }

    const zoneEl = hovered.droppable.keys().next().value as HTMLElement | undefined;
    if (!zoneEl) return null;
    const zoneEntity = entities.droppableMap.get(zoneEl);
    const zoneItems = zoneEntity?.payload?.();
    if (zoneItems !== list) return null;

    const zonePlacement = hovered.droppable.get(zoneEl);
    const atStart = Boolean(zonePlacement?.top && !zonePlacement.center);
    const raw = atStart ? 0 : list.length;
    if (adjustFrom != null && adjustFrom < raw) return raw - 1;
    return raw;
  }

  function onDragMove(e: IDragEvent) {
    if (!active.value) return;
    const meta = e.draggedItems[0]?.data as { mode?: DragSource } | undefined;
    if (meta?.mode !== sourceMode.value) return;

    if (sourceMode.value === 'ranked') {
      if (fromIndex.value == null) return;
      const next = resolveRankedInsert(e, fromIndex.value);
      if (next == null) return;
      setInsertAt(next);
      return;
    }

    setInsertAt(resolveRankedInsert(e, null));
  }

  function onDragEndOrCancel() {
    reset();
  }

  function visualSpacerIndex(): number | null | undefined {
    if (!active.value || insertAt.value == null) return undefined;

    if (sourceMode.value === 'inbox') {
      if (insertAt.value >= ranked.value.length) return null;
      return insertAt.value;
    }

    if (fromIndex.value == null) return undefined;

    const visibleCount = Math.max(0, ranked.value.length - 1);
    if (insertAt.value >= visibleCount) return null;
    return insertAt.value;
  }

  function showSpacerBefore(index: number, itemId: string): boolean {
    if (isSource(itemId)) return false;
    const spacer = visualSpacerIndex();
    if (spacer === undefined || spacer === null) return false;

    if (sourceMode.value === 'inbox') return index === spacer;
    if (fromIndex.value == null) return false;
    const visualIndex = index > fromIndex.value ? index - 1 : index;
    return visualIndex === spacer;
  }

  function showEndSpacer(): boolean {
    return visualSpacerIndex() === null;
  }

  function showInboxSpacerBefore(index: number, itemId: string): boolean {
    if (sourceMode.value !== 'inbox' || fromIndex.value == null) return false;
    if (isSource(itemId)) return false;
    const visualIndex = index > fromIndex.value ? index - 1 : index;
    return visualIndex === fromIndex.value;
  }

  function showInboxEndSpacer(): boolean {
    if (sourceMode.value !== 'inbox' || fromIndex.value == null) return false;
    return fromIndex.value >= inbox.value.length - 1;
  }

  return {
    isSource,
    peekInsertAt,
    onDragStart,
    onDragMove,
    onDragEndOrCancel,
    showSpacerBefore,
    showEndSpacer,
    showInboxSpacerBefore,
    showInboxEndSpacer,
    reset,
  };
}
