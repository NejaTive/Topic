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

const rankToneClass = computed(() => {
  if (props.mode !== 'ranked' || props.rank == null) return 'text-rank';
  if (props.rank === 1) return 't-rank-medal t-rank-medal--gold';
  if (props.rank === 2) return 't-rank-medal t-rank-medal--silver';
  if (props.rank === 3) return 't-rank-medal t-rank-medal--bronze';
  return 'text-rank';
});

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
    class="glass group flex w-full max-w-89.5 items-center gap-3 rounded-md px-3 py-2 transition-colors outline-none select-none"
    :class="[
      dragging
        ? 'bg-surface-glass-hover shadow-float'
        : 'hover:bg-surface-glass-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
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
      class="-my-2 -mr-3 flex w-11 shrink-0 items-center justify-center self-stretch rounded-r-md border-l border-glass-line bg-surface-sunken pl-2 pr-3 text-muted transition-colors touch-none"
      :class="[
        dragEnabled
          ? 'cursor-grab active:cursor-grabbing hover:bg-surface-glass-hover hover:text-ink'
          : 'cursor-default',
        dragging ? 'bg-surface-glass-hover text-ink' : null,
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

<style lang="scss" scoped>
.t-rank-medal {
  position: relative;
  display: inline-block;
  background-size: 250% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: t-rank-medal-shine 2.6s linear infinite;
}

.t-rank-medal--gold {
  background-image: linear-gradient(
    110deg,
    #8b6914 0%,
    #c9a227 18%,
    #ffe566 34%,
    #fff6c2 48%,
    #ffd700 58%,
    #b8860b 78%,
    #6b4e0f 100%
  );
  filter: drop-shadow(0 0 6px rgb(255 200 60 / 65%));
}

.t-rank-medal--silver {
  background-image: linear-gradient(
    110deg,
    #5a6578 0%,
    #8b95a8 18%,
    #c5ccd8 34%,
    #f2f4f8 48%,
    #aeb6c4 58%,
    #7a8496 78%,
    #4a5364 100%
  );
  filter: drop-shadow(0 0 6px rgb(180 190 210 / 55%));
}

.t-rank-medal--bronze {
  background-image: linear-gradient(
    110deg,
    #5c2e0e 0%,
    #8f4e1c 18%,
    #cd7f32 34%,
    #f0b27a 48%,
    #e09448 58%,
    #a05a22 78%,
    #4a240c 100%
  );
  filter: drop-shadow(0 0 6px rgb(220 130 50 / 55%));
}

@keyframes t-rank-medal-shine {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .t-rank-medal {
    animation: none;
    background-position: 35% 50%;
  }
}
</style>
