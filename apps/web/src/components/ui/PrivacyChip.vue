<script setup lang="ts">
import { computed } from 'vue';

export type PrivacyValue = 'private' | 'unlisted' | 'public';

const props = withDefaults(
  defineProps<{
    privacy: PrivacyValue;
    /** Mobile: icon-only 24×24; desktop: icon + label. */
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);

const label = computed(() => {
  switch (props.privacy) {
    case 'private':
      return 'Приватный';
    case 'unlisted':
      return 'По ссылке';
    case 'public':
      return 'Публичный';
  }
});

const toneClass = computed(() => {
  switch (props.privacy) {
    case 'private':
      return 'bg-surface-sunken text-muted';
    case 'unlisted':
      return 'bg-info-soft text-info';
    case 'public':
      return 'bg-accent-soft text-accent';
  }
});
</script>

<template>
  <span
    class="inline-flex items-center justify-center gap-1 rounded-sm font-sans"
    :class="[
      toneClass,
      compact ? 'size-6' : 'h-6 px-2 text-caption',
    ]"
    :title="compact ? label : undefined"
    :aria-label="label"
  >
    <!-- Geometric placeholders (stage-2); final icon set TBD -->
    <svg
      v-if="privacy === 'private'"
      class="size-3.5 shrink-0"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="8" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M5 6V4.5a2 2 0 0 1 4 0V6"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
    <svg
      v-else-if="privacy === 'unlisted'"
      class="size-3.5 shrink-0"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.5 8.5 8.5 5.5M6.2 4.2l.6-1.1a2.2 2.2 0 0 1 3.1-.6l1.1.6a2.2 2.2 0 0 1 .6 3.1l-1.1.6M7.8 9.8l-.6 1.1a2.2 2.2 0 0 1-3.1.6l-1.1-.6a2.2 2.2 0 0 1-.6-3.1l1.1-.6"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
    <svg
      v-else
      class="size-3.5 shrink-0"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" stroke-width="1.5" />
      <ellipse cx="7" cy="7" rx="2.25" ry="5.25" stroke="currentColor" stroke-width="1.5" />
      <path d="M1.75 7h10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <span v-if="!compact">{{ label }}</span>
  </span>
</template>
