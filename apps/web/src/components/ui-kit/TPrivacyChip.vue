<script setup lang="ts">
import { computed } from 'vue';

export type PrivacyValue = 'private' | 'unlisted' | 'public';

interface TPrivacyChipProps {
  privacy: PrivacyValue;
  compact?: boolean;
  selected?: boolean;
}

const props = withDefaults(defineProps<TPrivacyChipProps>(), {
  compact: false,
  selected: false,
});

const LABELS: Record<PrivacyValue, string> = {
  private: 'Приватный',
  unlisted: 'По ссылке',
  public: 'Публичный',
};

const label = computed(() => LABELS[props.privacy]);

const toneClass = computed(() => {
  const map: Record<PrivacyValue, string> = {
    private: props.selected
      ? 'border-warning bg-warning-soft text-warning'
      : 'border-transparent bg-warning-soft text-warning',
    unlisted: props.selected
      ? 'border-info bg-info-soft text-info'
      : 'border-transparent bg-info-soft text-info',
    public: props.selected
      ? 'border-success bg-success-soft text-success'
      : 'border-transparent bg-success-soft text-success',
  };
  return map[props.privacy];
});
</script>

<template>
  <span
    class="inline-flex items-center justify-center gap-1 rounded-sm border font-sans transition-colors"
    :class="[
      toneClass,
      compact ? 'size-6' : 'h-6 px-2 text-caption',
      selected ? 'font-semibold' : null,
    ]"
    :title="compact ? label : undefined"
    :aria-label="label"
  >
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
    <svg v-else class="size-3.5 shrink-0" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" stroke-width="1.5" />
      <ellipse cx="7" cy="7" rx="2.25" ry="5.25" stroke="currentColor" stroke-width="1.5" />
      <path d="M1.75 7h10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <span v-if="!compact">{{ label }}</span>
  </span>
</template>
