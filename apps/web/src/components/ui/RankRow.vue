<script lang="ts">
export type RankRowMode = 'ranked' | 'inbox';
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    /** 1-based rank; top-3 get accent badge color. */
    rank?: number;
    coverUrl?: string;
    /** inbox: CTA «В рейтинг»; ranked: rank badge + visual handle. */
    mode?: RankRowMode;
    /** Visual dragging state (shadow); set by parent during HTML5 DnD. */
    dragging?: boolean;
    /** Enable HTML5 DnD: ranked — только с handle; inbox — со всей строки. */
    dragEnabled?: boolean;
    /** ranked: показывать grip (S09 read-only — false). */
    showDragHandle?: boolean;
    /** S09: без клика по title. */
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

const showHandle = computed(() => {
  if (props.mode !== 'ranked') return false;
  if (props.showDragHandle === false) return false;
  return true;
});

const emit = defineEmits<{
  toRank: [];
  click: [event: MouseEvent];
  dragStart: [event: DragEvent];
  dragEnd: [event: DragEvent];
}>();

const handleArmed = ref(false);

const isTopThree = computed(
  () => props.mode === 'ranked' && props.rank != null && props.rank >= 1 && props.rank <= 3,
);

const rankToneClass = computed(() =>
  isTopThree.value ? 'text-rank-top' : 'text-rank',
);

function armHandle() {
  if (props.dragEnabled && props.mode === 'ranked') {
    handleArmed.value = true;
  }
}

function disarmHandle() {
  handleArmed.value = false;
}

function onDragStart(event: DragEvent) {
  if (!props.dragEnabled) {
    event.preventDefault();
    return;
  }
  if (props.mode === 'ranked' && !handleArmed.value) {
    event.preventDefault();
    return;
  }
  emit('dragStart', event);
}

function onDragEnd(event: DragEvent) {
  handleArmed.value = false;
  emit('dragEnd', event);
}
</script>

<template>
  <div
    class="group flex w-full max-w-[358px] items-center gap-3 rounded-md border border-transparent bg-transparent px-2 py-2 transition-colors outline-none"
    :class="[
      dragging
        ? 'border-line bg-surface shadow-float'
        : 'hover:bg-surface-sunken focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring',
      dragEnabled && mode === 'inbox' ? 'cursor-grab' : null,
    ]"
    :data-state="dragging ? 'dragging' : 'default'"
    :draggable="dragEnabled"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <!-- DnD handle (ranked only); drag starts from here when dragEnabled -->
    <span
      v-if="showHandle"
      class="flex w-5 shrink-0 justify-center text-subtle"
      :class="dragEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'"
      aria-hidden="true"
      data-slot="drag-handle"
      @pointerdown="armHandle"
      @pointerup="disarmHandle"
      @pointercancel="disarmHandle"
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

    <span
      v-if="mode === 'ranked' && rank != null"
      class="w-7 shrink-0 text-center font-mono text-rank-m tabular-nums"
      :class="rankToneClass"
      :aria-label="`Место ${rank}`"
    >
      {{ rank }}
    </span>

    <div
      class="h-12 w-9 shrink-0 overflow-hidden rounded-sm border border-line bg-surface-sunken"
      aria-hidden="true"
    >
      <img
        v-if="coverUrl"
        :src="coverUrl"
        alt=""
        class="size-full object-cover"
      />
    </div>

    <span
      v-if="readonly"
      class="min-w-0 flex-1 truncate text-left text-title text-ink"
    >
      {{ title }}
    </span>
    <button
      v-else
      type="button"
      class="min-w-0 flex-1 truncate text-left text-title text-ink outline-none"
      @click="emit('click', $event)"
    >
      {{ title }}
    </button>

    <button
      v-if="mode === 'inbox'"
      type="button"
      class="shrink-0 rounded-md px-2 py-1.5 text-body-sm font-semibold text-accent outline-none transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      @click.stop="emit('toRank')"
    >
      В рейтинг
    </button>
  </div>
</template>
