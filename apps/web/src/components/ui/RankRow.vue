<script lang="ts">
export type RankRowMode = 'ranked' | 'inbox';

export type RankRowDragPoint = {
  clientX: number;
  clientY: number;
};
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    /** 1-based rank; top-3 get accent badge color. */
    rank?: number;
    coverUrl?: string;
    /** inbox: handle справа; ranked: rank + handle. */
    mode?: RankRowMode;
    /** Visual dragging state (accent border + shadow). */
    dragging?: boolean;
    /** DnD только с правого handle (Pointer Events — работает и на touch). */
    dragEnabled?: boolean;
    /** Показывать grip (S09 read-only — false). */
    showDragHandle?: boolean;
    /** S09: без клика по карточке. */
    readonly?: boolean;
  }>(),
  {
    rank: undefined,
    coverUrl: undefined,
    mode: 'ranked',
    dragging: false,
    dragEnabled: false,
    showDragHandle: undefined,
    readonly: false,
  },
);

/** Figma Rank row: handle справа на ranked/inbox; NoDragable / S09 — скрыт. */
const showHandle = computed(() => {
  if (props.showDragHandle === false) return false;
  if (props.readonly) return false;
  return true;
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  /** Pointer DnD (mouse + touch) — старт после порога сдвига. */
  dragBegin: [point: RankRowDragPoint];
  dragMove: [point: RankRowDragPoint];
  dragFinish: [point: RankRowDragPoint];
  dragCancel: [];
}>();

/** Подавить click после DnD. */
const suppressClick = ref(false);

const pointerId = ref<number | null>(null);
const originX = ref(0);
const originY = ref(0);
const gestureActive = ref(false);
const passedThreshold = ref(false);

const DRAG_THRESHOLD_PX = 6;

const isTopThree = computed(
  () => props.mode === 'ranked' && props.rank != null && props.rank >= 1 && props.rank <= 3,
);

const rankToneClass = computed(() => (isTopThree.value ? 'text-rank-top' : 'text-rank'));

function pointFrom(event: PointerEvent): RankRowDragPoint {
  return { clientX: event.clientX, clientY: event.clientY };
}

function onHandlePointerDown(event: PointerEvent) {
  if (!props.dragEnabled) return;
  // Только primary button / touch / pen
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  event.preventDefault();
  event.stopPropagation();

  pointerId.value = event.pointerId;
  originX.value = event.clientX;
  originY.value = event.clientY;
  gestureActive.value = true;
  passedThreshold.value = false;

  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);
}

function onHandlePointerMove(event: PointerEvent) {
  if (!gestureActive.value || event.pointerId !== pointerId.value) return;

  const dx = event.clientX - originX.value;
  const dy = event.clientY - originY.value;

  if (!passedThreshold.value) {
    if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return;
    passedThreshold.value = true;
    suppressClick.value = true;
    emit('dragBegin', pointFrom(event));
  }

  event.preventDefault();
  emit('dragMove', pointFrom(event));
}

function endGesture(event: PointerEvent, cancelled: boolean) {
  if (!gestureActive.value || event.pointerId !== pointerId.value) return;

  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }

  const wasDragging = passedThreshold.value;
  gestureActive.value = false;
  pointerId.value = null;
  passedThreshold.value = false;

  if (cancelled || !wasDragging) {
    if (wasDragging) emit('dragCancel');
    requestAnimationFrame(() => {
      suppressClick.value = false;
    });
    return;
  }

  emit('dragFinish', pointFrom(event));
  requestAnimationFrame(() => {
    suppressClick.value = false;
  });
}

function onHandlePointerUp(event: PointerEvent) {
  endGesture(event, false);
}

function onHandlePointerCancel(event: PointerEvent) {
  endGesture(event, true);
}

function onCardClick(event: MouseEvent) {
  if (props.readonly || suppressClick.value) return;
  emit('click', event);
}

function onCardKeydown(event: KeyboardEvent) {
  if (props.readonly) return;
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onCardClick(event as unknown as MouseEvent);
}
</script>

<template>
  <!-- Figma: surface + line border, radius 8, cover 44×56, handle справа -->
  <div
    class="group flex w-full max-w-[358px] items-center gap-3 rounded-md border bg-surface px-3 py-2 transition-colors outline-none select-none"
    :class="[
      dragging
        ? 'border-accent shadow-float'
        : 'border-line hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
      readonly ? 'cursor-default' : 'cursor-pointer',
    ]"
    :data-state="dragging ? 'dragging' : 'default'"
    :role="readonly ? undefined : 'button'"
    :tabindex="readonly ? undefined : 0"
    @click="onCardClick"
    @keydown="onCardKeydown"
  >
    <span
      v-if="mode === 'ranked' && rank != null"
      class="w-7 shrink-0 text-center text-rank-m tabular-nums"
      :class="[rankToneClass, isTopThree ? 'font-mono font-bold' : 'font-medium']"
      :aria-label="`Место ${rank}`"
    >
      {{ rank }}
    </span>

    <div class="h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-line" aria-hidden="true">
      <img
        v-if="coverUrl"
        :src="coverUrl"
        alt=""
        class="size-full object-cover"
        draggable="false"
      />
    </div>

    <span class="min-w-0 flex-1 truncate text-left text-title text-ink">
      {{ title }}
    </span>

    <!-- Hit-area: Pointer Events + touch-action:none — DnD на touch/mobile -->
    <span
      v-if="showHandle"
      class="-my-2 -mr-3 flex w-11 shrink-0 items-center justify-center self-stretch rounded-r-md border-l border-line bg-surface-sunken pl-2 pr-3 text-muted transition-colors touch-none"
      :class="[
        dragEnabled
          ? 'cursor-grab active:cursor-grabbing hover:bg-line hover:text-ink'
          : 'cursor-default',
        dragging ? 'bg-accent-soft text-accent' : null,
      ]"
      aria-hidden="true"
      data-slot="drag-handle"
      @click.stop
      @pointerdown="onHandlePointerDown"
      @pointermove="onHandlePointerMove"
      @pointerup="onHandlePointerUp"
      @pointercancel="onHandlePointerCancel"
    >
      <svg class="size-4" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="5" cy="4" r="1.25" />
        <circle cx="11" cy="4" r="1.25" />
        <circle cx="5" cy="8" r="1.25" />
        <circle cx="11" cy="8" r="1.25" />
        <circle cx="5" cy="12" r="1.25" />
        <circle cx="11" cy="12" r="1.25" />
      </svg>
    </span>
  </div>
</template>
