<script lang="ts">
export type RankRowMode = 'ranked' | 'inbox';
</script>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    /** 1-based rank; top-3 get accent badge color. */
    rank?: number;
    coverUrl?: string;
    /** inbox: CTA «В рейтинг»; ranked: rank badge + visual handle. */
    mode?: RankRowMode;
    /** Visual dragging state (shadow); no DnD logic. */
    dragging?: boolean;
  }>(),
  {
    rank: undefined,
    coverUrl: undefined,
    mode: 'ranked',
    dragging: false,
  },
);

const emit = defineEmits<{
  toRank: [];
  click: [event: MouseEvent];
}>();

const isTopThree = computed(
  () => props.mode === 'ranked' && props.rank != null && props.rank >= 1 && props.rank <= 3,
);

const rankToneClass = computed(() =>
  isTopThree.value ? 'text-rank-top' : 'text-rank',
);
</script>

<template>
  <div
    class="group flex w-full max-w-[358px] items-center gap-3 rounded-md border border-transparent bg-transparent px-2 py-2 transition-colors outline-none"
    :class="[
      dragging
        ? 'border-line bg-surface shadow-float'
        : 'hover:bg-surface-sunken focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring',
    ]"
    :data-state="dragging ? 'dragging' : 'default'"
  >
    <!-- Visual handle only (DnD → FRO-13); no ↑↓ / «позиция N» -->
    <span
      v-if="mode === 'ranked'"
      class="flex w-5 shrink-0 cursor-grab justify-center text-subtle"
      aria-hidden="true"
      data-slot="drag-handle"
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

    <button
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
