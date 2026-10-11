<script lang="ts">
export type TRankRowMode = 'ranked' | 'inbox';
</script>

<script setup lang="ts">
import { computed } from 'vue';

interface TRankRowProps {
  title: string;
  rank?: number;
  coverUrl?: string;
  mode?: TRankRowMode;
  dragging?: boolean;
  dragEnabled?: boolean;
  showDragHandle?: boolean;
  readonly?: boolean;
}

interface TRankRowEmits {
  (e: 'click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<TRankRowProps>(), {
  rank: undefined,
  coverUrl: undefined,
  mode: 'ranked',
  dragging: false,
  dragEnabled: false,
  showDragHandle: undefined,
  readonly: false,
});

const showHandle = computed(() => {
  if (props.showDragHandle === false) return false;
  if (props.readonly) return false;
  return true;
});

const emit = defineEmits<TRankRowEmits>();

const isTopThree = computed(
  () => props.mode === 'ranked' && props.rank != null && props.rank >= 1 && props.rank <= 3,
);

const rankToneClass = computed(() => (isTopThree.value ? 'text-rank-top' : 'text-rank'));

function onCardClick(event: MouseEvent) {
  if (props.readonly) return;
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
  <div
    class="group flex w-full max-w-89.5 items-center gap-3 rounded-md border border-row-line bg-row px-3 py-2 transition-colors outline-none select-none"
    :class="[
      dragging
        ? 'border-row-line bg-row-hover shadow-float'
        : 'hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
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
      class="w-7 shrink-0 text-center text-rank-m"
      :class="[rankToneClass, isTopThree ? 'font-mono font-bold' : 'font-medium']"
      :aria-label="`Место ${rank}`"
    >
      {{ rank }}
    </span>

    <div class="h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-surface-sunken" aria-hidden="true">
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

    <span
      v-if="showHandle"
      class="-my-2 -mr-3 flex w-11 shrink-0 items-center justify-center self-stretch rounded-r-md border-l border-row-line bg-row-hover pl-2 pr-3 text-muted transition-colors touch-none"
      :class="[
        dragEnabled
          ? 'cursor-grab active:cursor-grabbing hover:bg-row-line hover:text-ink'
          : 'cursor-default',
        dragging ? 'bg-row-line text-ink' : null,
      ]"
      aria-hidden="true"
      data-slot="drag-handle"
      @click.stop
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
