<script setup lang="ts">
import { computed, useId } from 'vue';
import { useTheme } from '@/composables/useTheme';

const { resolved, toggle } = useTheme();
const moonMaskId = useId();

const label = computed(() =>
  resolved.value === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему',
);

function onClick(event: MouseEvent) {
  toggle(event);
}
</script>

<template>
  <button
    type="button"
    class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted outline-none transition-colors hover:bg-accent-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    :aria-label="label"
    :title="label"
    @click="onClick"
  >
    <svg
      v-if="resolved === 'dark'"
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M12 2.75V4.5M12 19.5v1.75M21.25 12H19.5M4.5 12H2.75M18.187 5.813l-1.237 1.237M7.05 16.95l-1.237 1.237M18.187 18.187l-1.237-1.237M7.05 7.05 5.813 5.813"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
    <svg v-else class="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <mask :id="moonMaskId" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          <rect width="24" height="24" fill="black" />
          <circle cx="12" cy="12" r="8.25" fill="white" />
          <circle cx="16.5" cy="12" r="6.9" fill="black" />
        </mask>
      </defs>
      <g transform="translate(12 12) rotate(-28) translate(-12 -12)">
        <rect width="24" height="24" fill="currentColor" :mask="`url(#${moonMaskId})`" />
      </g>
    </svg>
  </button>
</template>
